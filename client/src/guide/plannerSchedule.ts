import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { FAMILY_EMAILS } from "@/guide/records";
import itineraryJson from "@/data/itinerary.json";
import citiesJson from "@/data/cities.json";

/**
 * 规划器云端持久化（Supabase 表 sea_planner_schedules）
 *
 * 事实源约定：
 * - 表里只有一条当前规划（slot = 'family'），upsert 覆盖更新；
 *   created_by / updated_by / updated_at 由服务端触发器写入。
 * - darancai@gmail.com 与 nckuang123@gmail.com 互读互改（家庭 RLS 策略），
 *   其他用户只能访问自己的数据（owner-only 策略）。
 * - localStorage 只做离线缓存和云端失败回退。
 */

export const PLANNER_SLOT = "family";
const PLANNER_CACHE_KEY = "sea-planner-schedule-cache-v1";

export interface PlannerScheduleDay {
  city: string;
  mode: string;
}

export interface PlannerPlan {
  /** v1=旧模型（向导含新加坡+独立起始日），v2=新模型（向导只细分夫妻东南亚、日期继承大行程） */
  version: 1 | 2;
  /** 双人国家（TH/MY/VN/SG） */
  selected: string[];
  coupleDays: number;
  remainingMode: string;
  pace: string;
  /** YYYY-MM-DD */
  start: string;
  /** YYYY-MM-DD -> {city, mode} */
  schedule: Record<string, PlannerScheduleDay>;
  /** 分步规划向导状态 */
  wz: {
    cities: string[];
    days: Record<string, number>;
    order: string[];
    start: string;
    modes: Record<string, string>;
  };
  /** 预留：规划器目前只做航班/酒店展示，尚无用户选择 */
  hotelSelections: Record<string, unknown>;
  flightSelections: Record<string, unknown>;
  /** 大行程总览：各段天数（段 id -> 天数），可选以兼容旧保存 */
  trip?: Record<string, number>;
  /** 大行程总览：夫妻东南亚段城市顺序，可选以兼容旧保存 */
  coupleOrder?: string[];
  /** 大行程总览：回西雅图出发城市（""=待定），可选以兼容旧保存 */
  returnCity?: "" | "PEK" | "PVG" | "CKG";
  /** 大行程总览：每段转场起飞日（transition.after -> "last"|"next"；回程 key 为 "return"），可选以兼容旧保存 */
  tripFlightDay?: Record<string, "last"|"next">;
  /** 大行程总览：每段转场方式（transition.after -> "flight"|"rail"；2026-10-13 用户：转场不一定是飞机，可选高铁），可选以兼容旧保存 */
  legModes?: Record<string, string>;
  /** 每城预订需求开关（2026-10-13 用户）：城市名 -> { hotel: 要不要订酒店, restaurant: 要不要订餐厅 }。
   * 在大行程里逐城设置；关掉的城市在预订页不再出现待订提示（如住家里的城市不订酒店）。缺省按 defaultCityNeeds。 */
  cityNeeds?: Record<string, { hotel?: boolean; restaurant?: boolean }>;
  /** 全站日期单一事实源（2026-10-13 用户裁决）：行程形成时由 buildPlanTimeline 一次性生成、
   * 随规划一起保存的完整时间线（逐日归属 + 全部转场日期 + 酒店窗口）。
   * 所有页面/脚本只许读这份存好的时间线，不许各自按段天数再推导——
   * 此前 planner 推导与逐日表差一天、反复出事的根源就是多处推导。 */
  timeline?: PlanTimeline;
}

/** 高铁可行性（2026-10-16 用户：很远的/跨海跨国的转场根本没有高铁，不许再给高铁选项；
 * 系统应自己判断）。规则：两城同属一个已通高铁的网络才算可行——中国大陆高铁网城市之间、
 * 或韩国 KTX 的首尔↔釜山；跨国、跨海、任一城不在网内，一律不可行。 */
const HSR_CN = new Set([
  "北京", "天津", "石家庄", "太原", "大同", "呼和浩特", "西安", "郑州", "洛阳", "开封",
  "武汉", "长沙", "岳阳", "广州", "深圳", "汕头", "潮州", "揭阳", "珠海", "佛山", "东莞", "惠州",
  "上海", "南京", "杭州", "宁波", "温州", "台州", "金华", "绍兴", "嘉兴", "无锡", "苏州", "常州", "徐州",
  "合肥", "南昌", "九江", "福州", "厦门", "泉州", "漳州", "济南", "青岛", "烟台", "潍坊",
  "成都", "重庆", "贵阳", "昆明", "南宁", "桂林", "柳州", "兰州", "银川", "西宁", "乌鲁木齐",
  "沈阳", "大连", "长春", "哈尔滨", "海口", "三亚",
]);
const HSR_KR = new Set(["首尔", "釜山"]);
export function railFeasiblePair(fromZh: string, toZh: string): boolean {
  if (!fromZh || !toZh || fromZh === toZh) return false;
  return (
    (HSR_CN.has(fromZh) && HSR_CN.has(toZh)) ||
    (HSR_KR.has(fromZh) && HSR_KR.has(toZh))
  );
}

export interface PlanTimelineDay {
  /** 段 id：beijing1 / singapore / couple / split / seoul */
  seg: string;
  /** 当天所在城市（分开行动段为 ["北京","西安"] 两城同日） */
  cities: string[];
}
export interface PlanTimelineLeg {
  /** 与预订页 FLIGHT_LEGS 的 id 对齐（高铁段为 pek-xiy-rail） */
  id: string;
  kind: "flight" | "rail";
  from: string;
  to: string;
  fromCity: string;
  toCity: string;
  /** YYYY-MM-DD */
  date: string;
}
export interface PlanTimelineStay {
  city: string;
  seg: string;
  checkIn: string;
  checkOut: string;
  nights: number;
}
export interface PlanTimeline {
  v: 1;
  /** 中间段起始日（大行程第一段首日） */
  anchor: string;
  days: Record<string, PlanTimelineDay>;
  legs: PlanTimelineLeg[];
  stays: PlanTimelineStay[];
  /** 生成时的输入快照：消费方据此判断时间线与当前段天数是否仍一致（编辑中不一致则回退现场推导） */
  source: {
    trip: { beijing1: number; singapore: number; couple: number; split: number; seoul: number };
    wzOrder: string[];
    wzDays: Record<string, number>;
  };
}

/** 城市预订需求缺省：北京/西安是家庭城市（住家里），默认不订酒店；其余城市默认都要订。餐厅默认都要订。 */
export function defaultCityNeeds(city: string): { hotel: boolean; restaurant: boolean } {
  const familyCity = city === "北京" || city === "西安";
  return { hotel: !familyCity, restaurant: true };
}

/** 某城的实际预订需求（用户设置优先，缺省走 defaultCityNeeds） */
export function cityNeedOf(
  plan: PlannerPlan | null | undefined,
  city: string,
): { hotel: boolean; restaurant: boolean } {
  const d = defaultCityNeeds(city);
  const n = plan?.cityNeeds?.[city];
  return {
    hotel: typeof n?.hotel === "boolean" ? n.hotel : d.hotel,
    restaurant: typeof n?.restaurant === "boolean" ? n.restaurant : d.restaurant,
  };
}

/** 大行程天数归一化（2026-10-13 行程改版）：旧模型是 …→西安→北京（你一人）→… 两段串联；
 * 新模型是曼谷后「分开行动」一段：你→北京、老婆→西安，两边同住 split 天，最后同日去首尔汇合。
 * 旧保存没有 split 时自动迁移：split = 旧 xian + 旧 beijing3（总天数与首尔日期不变）。 */
export function normalizeTripDays(trip?: Record<string, number>): {
  beijing1: number; singapore: number; couple: number; split: number; seoul: number;
} {
  const t = trip ?? {};
  const split =
    typeof t.split === "number" && t.split >= 1
      ? t.split
      : (typeof t.xian === "number" ? t.xian : 3) + (typeof t.beijing3 === "number" ? t.beijing3 : 8);
  return {
    beijing1: typeof t.beijing1 === "number" ? t.beijing1 : 8,
    singapore: typeof t.singapore === "number" ? t.singapore : 5,
    couple: typeof t.couple === "number" ? t.couple : 8,
    split,
    seoul: typeof t.seoul === "number" ? t.seoul : 2,
  };
}

const AIRPORT_CODE_BY_ZH: Record<string, string> = {
  "北京": "PEK", "西安": "XIY", "新加坡": "SIN", "普吉": "HKT", "清迈": "CNX", "曼谷": "BKK",
  "槟城": "PEN", "吉隆坡": "KUL", "胡志明市": "SGN", "富国岛": "PQC", "首尔": "ICN", "西雅图": "SEA",
};

/**
 * 【全站唯一的日期推导实现】由大行程段天数（plan.trip + plan.wz）一次性生成完整时间线：
 * 全部逐日归属、全部转场（航班/高铁）日期、每城酒店入住/退房窗口。
 * 保存规划时由 planner 的 serializePlan 调用并存入 plan.timeline；
 * 其余所有消费方（地图站点、预订页航班日期、缺口检测脚本、一致性守卫）只读存好的时间线，
 * 不许再各自推导。推导规则变了只改这一处。
 */
export function buildPlanTimeline(plan: PlannerPlan): PlanTimeline {
  const t = normalizeTripDays(plan?.trip);
  const wz = plan?.wz ?? { cities: [] as string[], days: {} as Record<string, number>, order: [] as string[], start: "", modes: {} as Record<string, string> };
  const wzCities = (wz.order ?? []).filter((c) => (wz.cities ?? []).includes(c));
  const anchor = TRIP_ANCHOR_ISO;
  const days: Record<string, PlanTimelineDay> = {};
  const ranges: Record<string, { from: string; to: string }> = {};
  let cur = anchor;
  const lay = (seg: string, cities: string[], n: number) => {
    const from = cur;
    for (let i = 0; i < n; i++) days[addDaysIso(cur, i)] = { seg, cities };
    const to = addDaysIso(cur, Math.max(0, n - 1));
    ranges[seg] = { from, to };
    cur = addDaysIso(cur, n);
    return { from, to };
  };
  lay("beijing1", ["北京"], t.beijing1);
  const sg = lay("singapore", ["新加坡"], t.singapore);
  const coupleFrom = cur;
  const wzRanges: { city: string; from: string; to: string }[] = [];
  if (wzCities.length) {
    for (const c of wzCities) {
      const r = lay("couple", [c], Math.max(1, wz.days?.[c] ?? 1));
      wzRanges.push({ city: c, from: r.from, to: r.to });
    }
  } else {
    lay("couple", [], t.couple);
  }
  ranges["couple"] = { from: coupleFrom, to: addDaysIso(cur, -1) };
  const split = lay("split", ["北京", "西安"], t.split);
  const seoul = lay("seoul", ["首尔"], t.seoul);

  const code = (zh: string) => AIRPORT_CODE_BY_ZH[zh] ?? "";
  const legs: PlanTimelineLeg[] = [];
  const F = (id: string, fromCity: string, toCity: string, date: string) =>
    legs.push({ id, kind: "flight" as const, from: code(fromCity), to: code(toCity), fromCity, toCity, date });
  F("sea-pek", "西雅图", "北京", addDaysIso(anchor, -1));
  F("intl-out-bj", "北京", "新加坡", sg.from);
  F("intl-out", "西安", "新加坡", sg.from);
  if (wzRanges.length) {
    const first = wzRanges[0]!;
    const last = wzRanges[wzRanges.length - 1]!;
    F(`sin-${code(first.city).toLowerCase()}`, "新加坡", first.city, first.from);
    F("sin-xiy", "新加坡", "西安", first.from);
    for (let i = 1; i < wzRanges.length; i++) {
      const a = wzRanges[i - 1]!;
      const b = wzRanges[i]!;
      F(`${code(a.city).toLowerCase()}-${code(b.city).toLowerCase()}`, a.city, b.city, b.from);
    }
    F(`${code(last.city).toLowerCase()}-xiy`, last.city, "西安", split.from);
    F(`${code(last.city).toLowerCase()}-pek`, last.city, "北京", split.from);
  }
  /* 分开行动最后一天：你一人高铁 北京→西安汇合（不是航班，但日期同样以时间线为准） */
  legs.push({ id: "pek-xiy-rail", kind: "rail", from: "PEK", to: "XIY", fromCity: "北京", toCity: "西安", date: split.to });
  F("xiy-icn", "西安", "首尔", seoul.from);
  F("icn-sea", "首尔", "西雅图", seoul.to);

  /* 酒店窗口与预订页 hotelStaysFromPlan 同规则：入住=本段第一天，
   * 退房=后面第一个更晚开始的段的第一天（转场日）；无后续段时=本段最后一天。 */
  const segList: { city: string; seg: string; start: string; end: string }[] = [
    { city: "北京", seg: "beijing1", start: ranges["beijing1"]!.from, end: ranges["beijing1"]!.to },
    { city: "新加坡", seg: "singapore", start: sg.from, end: sg.to },
    ...wzRanges.map((r) => ({ city: r.city, seg: "couple", start: r.from, end: r.to })),
    { city: "西安", seg: "split", start: split.from, end: split.to },
    { city: "北京", seg: "split", start: split.from, end: split.to },
    { city: "首尔", seg: "seoul", start: seoul.from, end: seoul.to },
  ];
  const stays: PlanTimelineStay[] = segList.map((s, i) => {
    const next = segList.slice(i + 1).find((x) => x.start > s.start);
    const checkOut = next ? next.start : s.end;
    const nights = Math.max(0, Math.round((Date.parse(checkOut) - Date.parse(s.start)) / 86400000));
    return { city: s.city, seg: s.seg, checkIn: s.start, checkOut, nights };
  });

  const wzDays: Record<string, number> = {};
  for (const c of wzCities) wzDays[c] = Math.max(1, wz.days?.[c] ?? 1);
  return {
    v: 1,
    anchor,
    days,
    legs,
    stays,
    source: { trip: t, wzOrder: [...wzCities], wzDays },
  };
}

export interface LoadedPlan {
  plan: PlannerPlan;
  /** 最后保存者 email */
  updatedBy: string;
  /** 最后保存者展示名（fallback 到 email） */
  updatedByName: string;
  /** ISO 时间 */
  updatedAt: string;
  source: "cloud" | "cache";
}

export type SyncMode = "cloud" | "local" | "off";

export async function plannerSyncMode(): Promise<SyncMode> {
  if (!supabaseConfigured || !supabase) return "local";
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return "local";
    return "cloud";
  } catch {
    return "off";
  }
}

function cacheKey(): string {
  return PLANNER_CACHE_KEY;
}

export function readPlannerCache(): LoadedPlan | null {
  try {
    const raw = localStorage.getItem(cacheKey());
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LoadedPlan;
    if (!parsed || !parsed.plan || !parsed.plan.schedule) return null;
    return { ...parsed, source: "cache" };
  } catch {
    return null;
  }
}

function writePlannerCache(loaded: Omit<LoadedPlan, "source">): void {
  try {
    localStorage.setItem(
      cacheKey(),
      JSON.stringify({ ...loaded, source: "cache" })
    );
  } catch {
    /* 存储满等情况：缓存是锦上添花，不抛错 */
  }
}

async function displayNameFor(userId: string | null, email: string | null): Promise<string> {
  if (!supabase || !userId) return email || "未知";
  try {
    const { data } = await supabase
      .from("sea_profiles")
      .select("display_name,email")
      .eq("id", userId)
      .maybeSingle();
    if (data?.display_name) return data.display_name;
  } catch {
    /* fall through */
  }
  return email || "未知";
}

/** 保存规划到云端（upsert 全家共享的一条当前规划），并同步本地缓存 */
export async function savePlannerPlan(plan: PlannerPlan): Promise<LoadedPlan> {
  if (!supabase) throw new Error("not-logged-in");
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) throw new Error("not-logged-in");
  const { data: row, error } = await supabase
    .from("sea_planner_schedules")
    .upsert(
      { slot: PLANNER_SLOT, user_id: user.id, plan },
      { onConflict: "slot" }
    )
    .select("user_id,updated_at")
    .single();
  if (error) throw error;
  const updatedByName = await displayNameFor(row.user_id, user.email ?? null);
  const loaded: LoadedPlan = {
    plan,
    updatedBy: user.email ?? "",
    updatedByName,
    updatedAt: row.updated_at as string,
    source: "cloud",
  };
  writePlannerCache(loaded);
  return loaded;
}

/** 读取云端最新规划；未登录或云端失败时回退本地缓存 */
export async function loadPlannerPlan(): Promise<LoadedPlan | null> {
  const mode = await plannerSyncMode();
  if (mode !== "cloud" || !supabase) return readPlannerCache();
  try {
    const { data: row, error } = await supabase
      .from("sea_planner_schedules")
      .select("user_id,plan,updated_at")
      .eq("slot", PLANNER_SLOT)
      .maybeSingle();
    if (error || !row || !(row.plan as PlannerPlan)?.schedule) {
      return readPlannerCache();
    }
    const plan = row.plan as PlannerPlan;
    const email = await emailForUser(row.user_id as string);
    const updatedByName = await displayNameFor(row.user_id as string, email);
    const loaded: LoadedPlan = {
      plan,
      updatedBy: email ?? "",
      updatedByName,
      updatedAt: row.updated_at as string,
      source: "cloud",
    };
    writePlannerCache(loaded);
    return loaded;
  } catch {
    return readPlannerCache();
  }
}

/** 未登录或云端不可用时：只写本地缓存，保证刷新不丢 */
export function cachePlannerPlanLocally(
  plan: PlannerPlan,
  updatedByName: string = "本机"
): LoadedPlan {
  const loaded: LoadedPlan = {
    plan,
    updatedBy: "",
    updatedByName,
    updatedAt: new Date().toISOString(),
    source: "cache",
  };
  writePlannerCache(loaded);
  return loaded;
}

async function emailForUser(userId: string | null): Promise<string | null> {
  if (!supabase || !userId) return null;
  try {
    const { data } = await supabase
      .from("sea_profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle();
    return data?.email ?? null;
  } catch {
    return null;
  }
}

/* ---------------- 全站共享的行程事实源 ---------------- */

export interface PlanDay {
  day: number;
  date: string;
  weekday: string;
  city: string;
  city_zh: string;
  city_id: string;
}

export interface PlanCityStop {
  id: string;
  zh: string;
  en: string;
  country_zh: string;
  days: [number, number];
  dates: string;
}

export interface PlanItinerary {
  days: PlanDay[];
  cityStops: PlanCityStop[];
  /** 'cloud'：来自云端规划；'static'：回退到静态 itinerary.json */
  source: "cloud" | "static";
  updatedByName?: string;
  updatedAt?: string;
  totalDays: number;
  /** "12-12 ~ 12-31" */
  dateRangeShort: string;
  /** "2026-12-12 ～ 2026-12-31" */
  dateRangeLong: string;
  cityCount: number;
}

interface CityMeta {
  id: string;
  zh: string;
  en: string;
  country_zh: string;
}

const CITY_META: CityMeta[] = citiesJson as CityMeta[];
/**
 * 首尔的行程元信息：cities.json 只有 8 城（静态 20 天回退保持 8 城不变）。
 * 但 KOREA_CITY_ZH 明确预期"首尔"会出现在云端规划的 schedule 里；若 META_BY_ZH
 * 缺了它，planToItinerary 会对整份云端规划返回 null，全站静默回退到过时的
 * 静态 20 天行程（比报错更糟——看起来一切正常但数据是旧的）。
 */
const SEOUL_META: CityMeta = { id: "seoul", zh: "首尔", en: "Seoul", country_zh: "韩国" };
/* 2026-10-03 用户：云端行程含北京/西安，无此二城则 planToItinerary 整单返回 null
 * 全站静默回退到过时静态 20 天行程（注释原警告的实例化） */
const BEIJING_META: CityMeta = { id: "beijing", zh: "北京", en: "Beijing", country_zh: "中国" };
const XIAN_META: CityMeta = { id: "xian", zh: "西安", en: "Xi'an", country_zh: "中国" };
const META_BY_ZH = new Map<string, CityMeta>([
  ...CITY_META.map((c) => [c.zh, c] as [string, CityMeta]),
  ["首尔", SEOUL_META],
  ["北京", BEIJING_META],
  ["西安", XIAN_META],
]);

/**
 * 韩国行程包含的城市（中文名）。行程页按此拆成"东南亚行程"/"韩国行程"两个页面；
 * 新增韩国城市时把中文名加进这个集合即可，两边自动归位。
 */
export const KOREA_CITY_ZH = new Set<string>(["首尔"]);

/**
 * 东南亚行程包含的城市（中文名）。"东南亚行程"页只显示这些城市；
 * 北京/西安等非东南亚城市不出现在东南亚行程页（2026-10-03 用户明确）。
 */
export const SEA_CITY_ZH = new Set<string>(["新加坡", "普吉", "清迈", "曼谷"]);

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function fmtMD(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${m}-${d}`;
}

function weekdayOf(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

const STATIC_ITINERARY: PlanItinerary = {
  days: itineraryJson as PlanDay[],
  cityStops: CITY_META.map((c) => {
    const days = (c as unknown as { days: [number, number] }).days;
    const dates = (c as unknown as { dates: string }).dates;
    return { id: c.id, zh: c.zh, en: c.en, country_zh: c.country_zh, days, dates };
  }),
  source: "static",
  totalDays: 20,
  dateRangeShort: "12-12 ~ 12-31",
  dateRangeLong: "2026-12-12 ～ 2026-12-31",
  cityCount: 8,
};

/** 把规划器的 schedule（日期->城市）转成全站用的 Day 数组 */
export function planToItinerary(plan: PlannerPlan): PlanItinerary | null {
  // 2026-10-03 白屏修复：此函数绝不抛异常，任何异常都返回 null 由调用方回退到静态
  try {
    const dates = Object.keys(plan?.schedule || {}).sort();
    if (!dates.length) return null;
    const days: PlanDay[] = [];
    for (let i = 0; i < dates.length; i++) {
      const iso = dates[i];
      const entry = plan.schedule[iso];
      if (!entry?.city) return null;
      const meta = META_BY_ZH.get(entry.city);
      if (!meta) return null;
      days.push({
        day: i + 1,
        date: fmtMD(iso),
        weekday: weekdayOf(iso),
        city: meta.en,
        city_zh: meta.zh,
        city_id: meta.id,
      });
    }
  const cityStops: PlanCityStop[] = [];
  let cur = null as null | { meta: CityMeta; start: number; startDate: string };
  const flush = (endDay: number, endDate: string) => {
    if (!cur) return;
    cityStops.push({
      id: cur.meta.id,
      zh: cur.meta.zh,
      en: cur.meta.en,
      country_zh: cur.meta.country_zh,
      days: [cur.start, endDay],
      dates: `${cur.startDate} ~ ${endDate}`,
    });
    cur = null;
  };
  days.forEach((d, i) => {
    const meta = META_BY_ZH.get(d.city_zh)!;
    if (cur && cur.meta.id === meta.id) return;
    if (cur) flush(i, fmtMD(dates[i - 1]));
    cur = { meta, start: d.day, startDate: d.date };
  });
  flush(days.length, fmtMD(dates[dates.length - 1]));
  return {
    days,
    cityStops,
    source: "cloud",
    totalDays: days.length,
    dateRangeShort: `${fmtMD(dates[0])} ~ ${fmtMD(dates[dates.length - 1])}`,
    dateRangeLong: `${dates[0]} ～ ${dates[dates.length - 1]}`,
    cityCount: cityStops.length,
  };
  } catch {
    // 任何解析异常都返回 null，调用方回退到静态行程，绝不白屏
    return null;
  }
}

/** 大行程锚点：与 planner-logic 的 TRIP_ANCHOR 一致（11/28 为去程航班日，中间段 11/29 起） */
const TRIP_ANCHOR_ISO = "2026-11-29";

function addDaysIso(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

/**
 * 总览地图专用：按大行程段（plan.trip + wz 夫妻城市/天数）拼全程站点。
 * 2026-10-13 用户投诉：地图只按 schedule 画，而云端 schedule 只有东南亚 15 天
 * （北京第一段与分开行动的北京/西安根本不在 schedule 里），导致总览地图缺了
 * 北京/西安这些重点城市。大行程页自己的段日期算法（TRIP_ANCHOR 起累计天数）
 * 与 schedule 在重叠段上逐日一致（新加坡 12-07 起、普吉 12-12、首尔 12-30 起；
 * 2026-10-13 全站日期对账后云端 trip/wz 已与 schedule 对齐：beijing1=8、曼谷=1），
 * 地图按它拼全程：北京→新加坡→夫妻各城→（分开行动：北京/西安同段并列）→首尔。
 * 数据不完整（无 trip / 夫妻城市天数对不上段总天数）时返回 null，调用方回退 schedule 站点。
 */
/** 由 plan.timeline 逐日表拼站点（单一事实源路径：日期直接读存好的时间线，不再推导）。
 * 分开行动段同一日期两城（北京/西安）各出一个站点、共用同一 Day 范围。 */
function stopsFromTimeline(
  tl: PlanTimeline,
): { stops: PlanCityStop[]; totalDays: number } | null {
  const dates = Object.keys(tl.days ?? {}).sort();
  if (!dates.length) return null;
  const order: string[] = [];
  const acc = new Map<string, { zh: string; dayFrom: number; dayTo: number; from: string; to: string }>();
  dates.forEach((iso, i) => {
    const d = tl.days[iso];
    if (!d) return;
    for (const zh of d.cities) {
      const key = `${d.seg}|${zh}`;
      const curA = acc.get(key);
      if (curA) {
        curA.dayTo = i + 1;
        curA.to = iso;
      } else {
        acc.set(key, { zh, dayFrom: i + 1, dayTo: i + 1, from: iso, to: iso });
        order.push(key);
      }
    }
  });
  const stops: PlanCityStop[] = [];
  for (const key of order) {
    const a = acc.get(key)!;
    const meta = META_BY_ZH.get(a.zh);
    if (!meta) return null;
    stops.push({
      id: meta.id,
      zh: meta.zh,
      en: meta.en,
      country_zh: meta.country_zh,
      days: [a.dayFrom, a.dayTo],
      dates: `${fmtMD(a.from)} ~ ${fmtMD(a.to)}`,
    });
  }
  return { stops, totalDays: dates.length };
}

export function tripStopsFromPlan(
  plan: PlannerPlan,
): { stops: PlanCityStop[]; totalDays: number } | null {
  try {
    /* 单一事实源优先：规划里存有 timeline 就直接读它拼站点（日期不再二次推导） */
    if (plan?.timeline?.days && Object.keys(plan.timeline.days).length) {
      const fromTl = stopsFromTimeline(plan.timeline);
      if (fromTl) return fromTl;
    }
    if (!plan?.trip) return null;
    const t = normalizeTripDays(plan.trip);
    const wz = plan.wz;
    const coupleCities = (wz?.order ?? []).filter((c) =>
      (wz?.cities ?? []).includes(c),
    );
    if (!coupleCities.length) return null;
    for (const c of coupleCities) {
      if (!META_BY_ZH.get(c) || !(wz!.days?.[c] >= 1)) return null;
    }
    if (coupleCities.reduce((a, c) => a + wz!.days[c], 0) !== t.couple)
      return null;
    const stops: PlanCityStop[] = [];
    let cur = TRIP_ANCHOR_ISO;
    let day = 1;
    const push = (zh: string, n: number) => {
      const meta = META_BY_ZH.get(zh)!;
      const from = cur;
      const to = addDaysIso(cur, n - 1);
      stops.push({
        id: meta.id,
        zh: meta.zh,
        en: meta.en,
        country_zh: meta.country_zh,
        days: [day, day + n - 1],
        dates: `${fmtMD(from)} ~ ${fmtMD(to)}`,
      });
      cur = addDaysIso(cur, n);
      day += n;
    };
    push("北京", t.beijing1);
    push("新加坡", t.singapore);
    for (const c of coupleCities) push(c, wz!.days[c]);
    /* 分开行动：你（北京）与老婆+Dylan（西安）同住同一时段，两个站点共用同一 Day 范围 */
    const splitFrom = cur;
    const splitTo = addDaysIso(cur, t.split - 1);
    for (const zh of ["北京", "西安"]) {
      const meta = META_BY_ZH.get(zh)!;
      stops.push({
        id: meta.id,
        zh: meta.zh,
        en: meta.en,
        country_zh: meta.country_zh,
        days: [day, day + t.split - 1],
        dates: `${fmtMD(splitFrom)} ~ ${fmtMD(splitTo)}`,
      });
    }
    cur = addDaysIso(cur, t.split);
    day += t.split;
    push("首尔", t.seoul);
    return { stops, totalDays: day - 1 };
  } catch {
    return null;
  }
}

/** 总览地图站点 hook：先用本地缓存同步出结果，再用云端规划刷新 */
export function usePlannerTripStops(): {
  stops: PlanCityStop[];
  totalDays: number;
} | null {
  const [val, setVal] = useState<{
    stops: PlanCityStop[];
    totalDays: number;
  } | null>(() => {
    try {
      const cached = readPlannerCache();
      return cached ? tripStopsFromPlan(cached.plan) : null;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    let alive = true;
    loadPlannerPlan().then((loaded) => {
      if (alive && loaded) setVal(tripStopsFromPlan(loaded.plan));
    });
    return () => {
      alive = false;
    };
  }, []);
  return val;
}

/**
 * 每日详情页用的攻略正文匹配：
 * - 无云端规划，或当天城市与原版一致 → 原版当天详情；
 * - 规划改了城市顺序 → 取该城市在规划中的第 N 天，对应原版该城市第 N 天的攻略正文，
 *   并标注 shifted，让页面如实说明“城市已按你的规划调整”。
 */
export function detailDayForPlanDay<T extends { day: number; city: string }>(
  planDays: PlanDay[] | null,
  dayNum: number,
  staticDetailDays: T[]
): { detail: T | undefined; shifted: boolean; ordinalInCity: number } {
  const fallback = {
    detail: staticDetailDays.find((d) => d.day === dayNum),
    shifted: false,
    ordinalInCity: 1,
  };
  if (!planDays) return fallback;
  const planDay = planDays.find((d) => d.day === dayNum);
  if (!planDay) return fallback;
  const ordinalInCity =
    planDays.filter((d) => d.day <= dayNum && d.city_zh === planDay.city_zh)
      .length || 1;
  const sameCityDetail = staticDetailDays.filter(
    (d) => d.city === planDay.city_zh
  );
  const mapped = sameCityDetail[ordinalInCity - 1] ?? sameCityDetail[0];
  const original = staticDetailDays.find((d) => d.day === dayNum);
  if (original && original.city === planDay.city_zh) {
    return { detail: original, shifted: false, ordinalInCity };
  }
  return { detail: mapped, shifted: true, ordinalInCity };
}

/** 全站共享解析器：云端规划优先，静态回退 */
export async function resolvePlanItinerary(): Promise<PlanItinerary> {
  const loaded = await loadPlannerPlan();
  if (loaded) {
    const conv = planToItinerary(loaded.plan);
    if (conv) {
      return {
        ...conv,
        updatedByName: loaded.updatedByName,
        updatedAt: loaded.updatedAt,
      };
    }
  }
  return STATIC_ITINERARY;
}

/** 会话级内存缓存：最近一次解析成功的行程 */
let memoryPlan: PlanItinerary | null = null;

/** 两份行程是否实质相同（天数 + 每天城市一致即视为相同） */
function sameItinerary(a: PlanItinerary, b: PlanItinerary): boolean {
  if (a.totalDays !== b.totalDays || a.days.length !== b.days.length)
    return false;
  return a.days.every(
    (d, i) => d.city_zh === b.days[i].city_zh && d.date === b.days[i].date
  );
}

export function usePlanItinerary(): PlanItinerary & { loading: boolean } {
  // 会话级内存缓存：同一次浏览里从详情页返回行程时，组件会重新挂载。
  // 没有这层缓存，每次挂载都先渲染 20 天静态行程、等异步解析完再跳成
  // 13 天云端行程——用户看到的就是“一闪先 20 天再变 13 天”。
  const [state, setState] = useState<PlanItinerary & { loading: boolean }>(
    () => {
      // 2026-10-03 白屏修复：初始化器绝不抛异常，任何解析失败都回退到静态行程
      try {
        if (memoryPlan) return { ...memoryPlan, loading: false };
        // 同步读本地缓存：localStorage 里是上次云端解析完写回的 13 天规划，
        // 首屏直接按它渲染，不再经过 20 天静态中间态。
        const cached = readPlannerCache();
        const conv = cached ? planToItinerary(cached.plan) : null;
        if (conv && cached) {
          return {
            ...conv,
            updatedByName: cached.updatedByName,
            updatedAt: cached.updatedAt,
            loading: true,
          };
        }
      } catch {
        // 缓存损坏或解析异常：静默回退到静态，不白屏
      }
      return { ...STATIC_ITINERARY, loading: true };
    }
  );
  useEffect(() => {
    let alive = true;
    resolvePlanItinerary().then((it) => {
      if (!alive) return;
      memoryPlan = it;
      setState((prev) => {
        // 解析结果和当前渲染的一致（天数、城市序列相同）时只关 loading，
        // 不替换对象，避免无意义重渲染和布局抖动。
        if (!prev.loading && sameItinerary(prev, it)) return prev;
        if (prev.loading && sameItinerary(prev, it))
          return { ...prev, loading: false };
        return { ...it, loading: false };
      });
    });
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

export function isFamilyEmail(email: string | null | undefined): boolean {
  return !!email && (FAMILY_EMAILS as readonly string[]).includes(email);
}
