/**
 * 航班价格历史（2026-10-03 用户：机票要有什么时候价格有变动的时间线）
 *
 * append-only 本地价格历史：每次看到实时价格就记一笔（时间+价格），
 * 在行动安排的航班展开里画成时间线，显示每次涨跌的发生时间。
 *
 * Key: `${route}|${date}|${flightNo}|${cabin}`，value: [{price, at}] 按时间升序。
 * localStorage 持久化，单设备累积；换设备从收藏价重新开始记。
 */

export interface PriceSnapshot {
  price: number; // USD 整数
  at: string; // ISO 时间
}

const LS_KEY = "flightPriceHistory.v1";
const MAX_SNAPSHOTS = 60; // 每条 key 最多保留 60 笔，防膨胀

type HistoryMap = Record<string, PriceSnapshot[]>;

function load(): HistoryMap {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const m = JSON.parse(raw) as HistoryMap;
    return m && typeof m === "object" ? m : {};
  } catch {
    return {};
  }
}

function save(m: HistoryMap) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(m));
  } catch {
    /* ignore quota */
  }
}

export function priceHistoryKey(route: string, date: string, flightNo: string, cabin: string): string {
  return [route, date, flightNo, cabin || "eco"].join("|");
}

/** 记一笔价格快照；与上一笔相同价格则只更新时间戳（不重复记） */
export function logPrice(key: string, price: number): PriceSnapshot[] {
  if (!Number.isFinite(price) || price <= 0) return getHistory(key);
  const m = load();
  const list = m[key] ?? [];
  const now = new Date().toISOString();
  const p = Math.round(price);
  const last = list[list.length - 1];
  if (last && last.price === p) {
    /* 价格没变：刷新时间戳即可 */
    last.at = now;
  } else {
    list.push({ price: p, at: now });
    if (list.length > MAX_SNAPSHOTS) list.splice(0, list.length - MAX_SNAPSHOTS);
  }
  m[key] = list;
  save(m);
  return list;
}

export function getHistory(key: string): PriceSnapshot[] {
  const m = load();
  return m[key] ?? [];
}

/** 格式化为本地短日期：10-03 13:20 */
export function fmtSnapshotTime(iso: string): string {
  try {
    const d = new Date(iso);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${mm}-${dd} ${hh}:${mi}`;
  } catch {
    return iso.slice(0, 16);
  }
}
