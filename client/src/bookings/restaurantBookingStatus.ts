/**
 * 餐厅预订政策（研究结论，供行程页/预订页展示）。
 *
 * 数据源：bookings/bookingGuideData.ts（2026-09-17 联网核实的 211 条预订分类）。
 * 键为 guide/data.ts 的餐厅名，值为指南分类：
 * - must_book / peak_recommended → 查过，需要/建议预定
 * - walkup_or_queue / free_no_booking → 查过，不需要预定（可当天前往/排队）
 * - 指南中没有的 → 没查过，如实标注「预定状态未查询」，不留空让人猜
 *
 * 有实时空位数据（sea_availability）时优先显示空位徽章，本模块只处理
 * “没有空位数据”的情况。
 */

import { getDatasetStatus, onDataset } from "@/lib/datasets";

export type BookingPolicy = 'must_book' | 'peak_recommended' | 'walkup_or_queue' | 'free_no_booking';

const POLICY: Record<string, { policy: BookingPolicy; reason: string }> = {};


/** 必去 / 值得专程去（2026-10-12 用户方向：本地菜优先，米其林只点缀一两个且要是本地菜系）。
 * 以当地老字号、熟食中心、本地口碑店为主；西餐/国际 fine dining 不再是本趟主线。
 * 键为 guide/data.ts 的餐厅名，值为必去理由。网站餐厅卡片与预订页展示「必去」徽章。 */
export const MUST_GO: Record<string, string> = {};

/** 必去徽章；非必去返回 null（= 不展示徽章，不代表不好吃）。 */
export function mustGoBadge(name: string): { text: string; cls: string; title: string } | null {
  const reason = MUST_GO[name];
  if (!reason) return null;
  return {
    text: '必去',
    cls: 'bg-red-100 text-red-700 border-red-300',
    title: `研究结论·值得专程去：${reason}`,
  };
}

/** 查餐厅的预订政策研究结论；指南没覆盖的返回 null（= 没查过）。 */
export function getRestaurantBookingPolicy(name: string): { policy: BookingPolicy; reason: string } | null {
  return POLICY[name] ?? null;
}

/** 徽章文案与颜色：必须明确区分「没查」和「查过但不需要预订」。 */
export function bookingPolicyBadge(name: string): { text: string; cls: string; title: string } {
  const hit = getRestaurantBookingPolicy(name);
  if (!hit) {
    /* 数据集未就绪时不许冒充「未查询」（2026-10-14 site-improve，承上轮 flight_db error 态修复）：
       restaurant_booking_status 三次重试全失败且无缓存 = 加载失败；还在拉 = 加载中；
       只有 ready 后仍无记录，才是真的没查过。 */
    const ds = getDatasetStatus("restaurant_booking_status");
    if (ds === "error") {
      return {
        text: "预定状态加载失败",
        cls: "bg-red-100 text-red-700 border-red-300",
        title: "餐厅预订政策数据加载失败（已自动重试 3 次），刷新页面会重新加载——这不等于还没查过",
      };
    }
    if (ds !== "ready") {
      return {
        text: "预定状态加载中",
        cls: "bg-gray-100 text-gray-500 border-gray-200",
        title: "餐厅预订政策数据正在加载，加载完成后会自动刷新显示",
      };
    }
    return {
      text: "预定状态未查询",
      cls: "bg-gray-100 text-gray-500 border-gray-200",
      title: "这家餐厅的预订政策还没查过，不是“不需要预订”的意思",
    };
  }
  switch (hit.policy) {
    case "must_book":
      return { text: "需要预定", cls: "bg-rose-100 text-rose-700 border-rose-200", title: `已研究：${hit.reason}` };
    case "peak_recommended":
      return { text: "建议预定", cls: "bg-amber-100 text-amber-700 border-amber-200", title: `已研究：${hit.reason}` };
    case "walkup_or_queue":
      return { text: "无需预定·可排队", cls: "bg-sky-100 text-sky-700 border-sky-200", title: `已研究：${hit.reason}。可当天前往或现场排队` };
    case "free_no_booking":
      return { text: "无需预定", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", title: `已研究：${hit.reason}` };
  }
}

/* 数据来源（2026-10-13 起）：Supabase sea_guide_datasets 的 restaurant_booking_status 行
 * （{ policy, mustGo }），由管线查证后写入 DB；本文件不再内嵌政策字面量。 */
onDataset("restaurant_booking_status", (data) => {
  const d = (data ?? {}) as {
    policy?: Record<string, { policy: BookingPolicy; reason: string }>;
    mustGo?: Record<string, string>;
  };
  for (const k of Object.keys(POLICY)) delete POLICY[k];
  Object.assign(POLICY, d.policy ?? {});
  for (const k of Object.keys(MUST_GO)) delete MUST_GO[k];
  Object.assign(MUST_GO, d.mustGo ?? {});
});
