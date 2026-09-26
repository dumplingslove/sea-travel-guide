/**
 * /bookings 预订行动时间线：13 天行程（2026-12-12 ～ 12-24）
 * 新加坡 D1-5 → 普吉 D6-8 → 曼谷 D9-11 → 清迈 D12-13。
 *
 * 组织原则（对标 Google Travel / Booking.com / Trip.com）：
 * 按"最晚行动时间"排，不是按"酒店/餐厅/景点"分类堆。
 * 行动（时间线）/ 参考（城市明细）/ 记录（我的预订）三层各司其职。
 */

export type BookByGroup = "now" | "d60" | "d30" | "d14" | "local";

export interface FlightLegInfo {
  id: string;
  route: string;
  date: string; // YYYY-MM-DD，国际段待定则为空
  dateLabel: string;
  day: number;
  kind: "intercity" | "intl";
  note: string;
  /** 以下为浏览器实查后填写；null = 待核验，不写成定论 */
  carrier?: string | null;
  schedule?: string | null;
  priceNote?: string | null;
  direct?: boolean | null;
  fragile?: boolean | null;
}

/** 3 段城际 + 去/回程国际段占位。城际价格已由 Duffel 实查回填（2026-09-26）。 */
export const FLIGHT_LEGS: FlightLegInfo[] = [
  {
    id: "intl-out",
    route: "→ 新加坡",
    date: "",
    dateLabel: "12-12 前",
    day: 1,
    kind: "intl",
    note: "去程国际段尚未比价选定；Day 1（12-12）行程从新加坡开始，当天必须抵达",
  },
  {
    id: "sin-hkt",
    route: "新加坡 → 普吉",
    date: "2026-12-17",
    dateLabel: "12-17",
    day: 6,
    kind: "intercity",
    note: "D6 转场：新加坡段结束、普吉段开始；Duffel 实查 2026-09-26 14:42 PDT（2 成人直飞，当天 13 班可选；不可退、可改有手续费，含托运行李 1 件）",
    carrier: "Scoot TR0652",
    schedule: "18:15→19:20",
    priceNote: "2人 $741.40 起",
    direct: true,
    fragile: false,
  },
  {
    id: "hkt-bkk",
    route: "普吉 → 曼谷",
    date: "2026-12-20",
    dateLabel: "12-20",
    day: 9,
    kind: "intercity",
    note: "D9 转场：普吉段结束、曼谷段开始；Duffel 实查 2026-09-26 14:42 PDT（2 成人直飞，当天 15 班可选；不可退、可改。泰航当天 9 班同价 $231.80，可退可改）",
    carrier: "Bangkok Airways PG0270",
    schedule: "07:45→09:20",
    priceNote: "2人 $207.80 起",
    direct: true,
    fragile: false,
  },
  {
    id: "bkk-cnx",
    route: "曼谷 → 清迈",
    date: "2026-12-23",
    dateLabel: "12-23",
    day: 12,
    kind: "intercity",
    note: "D12 转场：曼谷段结束、清迈段开始；Duffel 实查 2026-09-26 14:42 PDT（2 成人直飞，当天 13 班可选；可退可改）",
    carrier: "Thai Airways TG0100",
    schedule: "06:00→07:20",
    priceNote: "2人 $167.80 起",
    direct: true,
    fragile: false,
  },
  {
    id: "intl-back",
    route: "清迈 / 曼谷 →",
    date: "",
    dateLabel: "12-24 后",
    day: 13,
    kind: "intl",
    note: "回程国际段尚未比价选定；Day 13（12-24）在清迈结束",
  },
];

/** 每城住宿段：时间线只列"选 1 家"的行动，候选明细在城市参考区。 */
export const HOTEL_STAYS = [
  { city: "新加坡", checkInLabel: "12-12", nights: 5, daysLabel: "D1–D5" },
  { city: "普吉", checkInLabel: "12-17", nights: 3, daysLabel: "D6–D8" },
  { city: "曼谷", checkInLabel: "12-20", nights: 3, daysLabel: "D9–D11" },
  { city: "清迈", checkInLabel: "12-23", nights: 2, daysLabel: "D12–D13" },
];

/** 需提前购票的景点（研究结论驱动；空 = 尚无研究结论支撑的项目，不编造）。 */
export interface AdvanceTicket {
  name: string;
  city: string;
  day?: number;
  reason: string;
}
export const ADVANCE_TICKETS: AdvanceTicket[] = [];

export const GROUP_META: Record<
  BookByGroup,
  { title: string; hint: string; dot: string }
> = {
  now: {
    title: "🔴 现在就锁",
    hint: "机票越晚越贵、好时段先没；国际段先占位比价",
    dot: "bg-rose-500",
  },
  d60: {
    title: "🟡 提前 60 天 · 酒店",
    hint: "10 月中旬前：每城锁定 1 家，圣诞季好房先没",
    dot: "bg-amber-500",
  },
  d30: {
    title: "🟠 提前 30 天 · 必须订位的餐厅",
    hint: "11 月中旬前：米其林与热门 fine dining 放位即抢",
    dot: "bg-orange-500",
  },
  d14: {
    title: "🔵 提前 14 天 · 建议订位 / 购票",
    hint: "11 月底前：热门餐厅建议订位、热门景点提前购票",
    dot: "bg-sky-500",
  },
  local: {
    title: "⚪ 当地解决",
    hint: "无需提前操作，当天前往或现场排队",
    dot: "bg-gray-300",
  },
};
