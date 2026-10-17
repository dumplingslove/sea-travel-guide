import { useSyncExternalStore } from "react";
import { supabase } from "./supabase";

/**
 * 查询数据存储层（2026-10-13 用户铁律：我帮他查的数据全部存 DB，网站从 DB 反映，
 * 不许再把查询结果写进代码文件打包发布）。
 *
 * 数据在 Supabase 表 sea_guide_datasets（key → jsonb）：
 * - flight_db：Google Flights 航班库（flight-db-gflights-fill 管线写入）
 * - hotel_live_prices：酒店实查价（hotel-price-watch 管线写入）
 * - restaurant_booking_status：餐厅订位政策/必去（availability-watch 管线写入）
 *
 * 2026-10-13 晚重构（用户手机实测：航班卡长时间显示「⏳ 航班待查询」，但库里明明有数据）：
 * 根因是旧实现把 3 个数据集塞进同一次请求、且失败后永不重试（started 闩锁），
 * 手机上那一次请求慢/失败，整页就一直按「没数据」渲染，还把「加载中」误标成「还没查」。
 * 现改为：
 * 1. 每个数据集单独拉取、并行进行，flight_db 不被其他数据集拖住；
 * 2. 失败自动重试（最多 3 次，退避），全部失败也不闩死，后续调用还能再拉；
 * 3. localStorage 持久缓存：再次打开先用上次的数据立即渲染（过期数据也比空白强），
 *    新数据到达后再刷新——首屏不再出现整页「待查询」窗口；
 * 4. 每个数据集有明确状态（loading/ready/error），界面可以把「正在加载」
 *    与「库里确实没查过」区分开，不许再混为一谈。
 */
export type DatasetKey = "flight_db" | "hotel_live_prices" | "restaurant_booking_status" | "price_history";
export type DatasetStatus = "idle" | "loading" | "ready" | "error";

const KEYS: DatasetKey[] = ["flight_db", "hotel_live_prices", "restaurant_booking_status", "price_history"];
const LS_PREFIX = "sgds:v1:";

const cache: Partial<Record<DatasetKey, unknown>> = {};
const statuses: Record<DatasetKey, DatasetStatus> = {
  flight_db: "idle",
  hotel_live_prices: "idle",
  restaurant_booking_status: "idle",
  price_history: "idle",
};
const appliers: Partial<Record<DatasetKey, ((data: unknown) => void)[]>> = {};
let version = 0;
let hydrated = false;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  version++;
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** 首次调用任何公开 API 时，先把 localStorage 里的上次数据灌进缓存（同步、立即渲染用）。 */
function ensureHydrated(): void {
  if (hydrated) return;
  hydrated = true;
  try {
    for (const key of KEYS) {
      const raw = window.localStorage.getItem(LS_PREFIX + key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { data?: unknown };
      if (parsed && parsed.data !== undefined) {
        cache[key] = parsed.data;
        statuses[key] = "ready";
      }
    }
  } catch {
    /* localStorage 不可用（隐私模式/配额）：忽略，照常走网络拉取 */
  }
}

function persist(key: DatasetKey, data: unknown): void {
  try {
    window.localStorage.setItem(
      LS_PREFIX + key,
      JSON.stringify({ saved_at: new Date().toISOString(), data }),
    );
  } catch {
    /* 配额满/不可用：不影响内存缓存与本次渲染 */
  }
}

function applyData(key: DatasetKey, data: unknown): void {
  cache[key] = data;
  statuses[key] = "ready";
  persist(key, data);
  for (const apply of appliers[key] ?? []) {
    try {
      apply(data);
    } catch {
      /* 单个模块灌入失败不拖垮其他数据集 */
    }
  }
  emit();
}

/** 数据模块在加载时注册：数据集到达（或已在缓存）时把数据灌进模块自己的存储。
 *  返回退订函数，组件卸载时必须调用，避免回调累积和旧闭包打已销毁的 DOM。
 *  缓存命中时的同步灌入套 try/catch：回调抛错不许穿透调用方的初始化
 *  （2026-10-13 白屏事故：规划页二次挂载时同步回调在状态就绪前触发重渲染，
 *   摸到未初始化变量抛错，整个应用白屏）。 */
export function onDataset(key: DatasetKey, apply: (data: unknown) => void): () => void {
  ensureHydrated();
  (appliers[key] ??= []).push(apply);
  if (cache[key] !== undefined) {
    try {
      apply(cache[key]);
    } catch {
      /* 同步灌入失败不拖垮调用方初始化；数据本身已在缓存里，调用方可自行读取 */
    }
  }
  return () => {
    const arr = appliers[key];
    if (arr) {
      const i = arr.indexOf(apply);
      if (i >= 0) arr.splice(i, 1);
    }
  };
}

/** 同步读取当前缓存（未加载完成时返回 undefined，调用方按无数据处理）。 */
export function getDataset<T>(key: DatasetKey): T | undefined {
  ensureHydrated();
  return cache[key] as T | undefined;
}

/** 数据集状态：界面据此区分「正在加载/加载失败」与「确实没有数据」。 */
export function getDatasetStatus(key: DatasetKey): DatasetStatus {
  ensureHydrated();
  return statuses[key];
}

/** React 订阅：数据集到达后触发重渲染（在 App 根部调用一次即可带动全站）。 */
export function useDatasetsVersion(): number {
  return useSyncExternalStore(subscribe, () => version, () => version);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 单个数据集的拉取：独立请求 + 最多 3 次重试（退避 0.8s / 2.5s）。 */
async function fetchOne(key: DatasetKey): Promise<void> {
  if (!supabase) return;
  if (cache[key] === undefined) statuses[key] = "loading";
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await sleep(attempt === 1 ? 800 : 2500);
      const { data, error } = await supabase
        .from("sea_guide_datasets")
        .select("data")
        .eq("key", key)
        .single();
      if (error) throw error;
      if (data && (data as { data?: unknown }).data !== undefined) {
        applyData(key, (data as { data: unknown }).data);
        return;
      }
      throw new Error(`dataset ${key} empty`);
    } catch (e) {
      lastError = e;
    }
  }
  /* 三次都失败：有缓存就继续用缓存（状态保持 ready），没缓存才标 error；
     不闩死——下一次 loadDatasets() 调用会重新拉。 */
  if (cache[key] === undefined) {
    statuses[key] = "error";
    emit();
  }
  console.warn(`[datasets] ${key} 拉取失败（已重试 3 次）`, lastError);
}

/** 拉取全部数据集（三个独立请求并行）。可重复调用：正在拉取时复用同一 Promise，
 *  失败后再次调用会重试，不再像旧实现那样一次失败终身不拉。 */
export async function loadDatasets(): Promise<void> {
  ensureHydrated();
  if (!supabase) return;
  if (inflight) return inflight;
  inflight = (async () => {
    await Promise.all(KEYS.map((k) => fetchOne(k)));
  })();
  try {
    await inflight;
  } finally {
    inflight = null;
  }
}
