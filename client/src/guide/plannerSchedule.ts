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
  version: 1;
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
const META_BY_ZH = new Map(CITY_META.map((c) => [c.zh, c]));

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
  const dates = Object.keys(plan.schedule || {}).sort();
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

export function usePlanItinerary(): PlanItinerary & { loading: boolean } {
  const [state, setState] = useState<PlanItinerary & { loading: boolean }>({
    ...STATIC_ITINERARY,
    loading: true,
  });
  useEffect(() => {
    let alive = true;
    resolvePlanItinerary().then((it) => {
      if (alive) setState({ ...it, loading: false });
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
