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
 * 页面打开时 loadDatasets() 拉取一次并灌入各数据模块（模块通过 onDataset 注册回调）；
 * 数据到达后 version 自增，订阅组件重渲染，价格/政策随即从 DB 反映出来。
 * 拉取失败（离线/表不可达）时各模块保持空数据，界面显示"待查/无实时价"，不编造。
 */
export type DatasetKey = "flight_db" | "hotel_live_prices" | "restaurant_booking_status";

const cache: Partial<Record<DatasetKey, unknown>> = {};
const appliers: Partial<Record<DatasetKey, ((data: unknown) => void)[]>> = {};
let version = 0;
let started = false;
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

/** 数据模块在加载时注册：数据集到达（或已在缓存）时把数据灌进模块自己的存储。 */
export function onDataset(key: DatasetKey, apply: (data: unknown) => void): void {
  (appliers[key] ??= []).push(apply);
  if (cache[key] !== undefined) apply(cache[key]);
}

/** 同步读取当前缓存（未加载完成时返回 undefined，调用方按无数据处理）。 */
export function getDataset<T>(key: DatasetKey): T | undefined {
  return cache[key] as T | undefined;
}

/** React 订阅：数据集到达后触发重渲染（在 App 根部调用一次即可带动全站）。 */
export function useDatasetsVersion(): number {
  return useSyncExternalStore(subscribe, () => version, () => version);
}

/** 拉取全部数据集（幂等，只真正执行一次）。 */
export async function loadDatasets(): Promise<void> {
  if (started) return;
  started = true;
  if (!supabase) return;
  try {
    const { data, error } = await supabase.from("sea_guide_datasets").select("key,data");
    if (error || !data) return;
    for (const row of data as { key: string; data: unknown }[]) {
      const key = row.key as DatasetKey;
      if (key === "flight_db" || key === "hotel_live_prices" || key === "restaurant_booking_status") {
        cache[key] = row.data;
        for (const apply of appliers[key] ?? []) {
          try {
            apply(row.data);
          } catch {
            /* 单个模块灌入失败不拖垮其他数据集 */
          }
        }
      }
    }
    emit();
  } catch {
    /* 数据集不可达：保持空数据，界面按无数据展示 */
  }
}
