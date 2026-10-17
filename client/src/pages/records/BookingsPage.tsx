/**
 * /bookings 预订记录：按类型（酒店/餐厅/景点门票/交通/其他）管理，
 * 每条有已确认/待确认状态。新增与编辑统一走 BookingDialog 弹窗。
 *
 * 数据复用 sea_guide_records（kind="booking"）：
 * - title = 预订名称，body = BookingData JSON，done = 已确认，day = 关联天数。
 * - 兼容旧版三行纯文本 body，按 other 类型解析展示。
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  useRecordsData,
  SyncBanner,
  Card,
  GhostButton,
  EmptyHint,
  AuthorTag,
} from "./shared";
import BookingDialog, { presetFromRow } from "@/bookings/BookingDialog";
import BookingStatusSummary from "@/bookings/BookingStatusSummary";
import DailyDigestBanner from "@/bookings/DailyDigestBanner";
import { priceHistoryKey, logPrice, getHistory, fmtSnapshotTime, type PriceSnapshot } from "@/bookings/flightPriceHistory";
import { Flights, HotelCatalog, RestaurantCatalog, AttractionCatalog, Transport, usePlanScope, useFullTripSegments, planDateShort, MUST_BOOK_ATTRACTIONS, MUST_BOOK_ATTRACTION_REASONS } from "@/guide/GuideApp";
import { cities as allCities } from "@/guide/data";
import { hotels, attractions } from "@/guide/data";
import { placeDetailPath, type PlaceKind } from "@/guide/placeDetail";
import { favoriteIdentityKey } from "@/guide/records";
import { DetailLink, useDetailReturn } from "@/components/DetailReturn";
import "@/guide/theme-scoped.css";
import { getRestaurantBookingPolicy, bookingPolicyBadge, mustGoBadge } from "@/bookings/restaurantBookingStatus";
import { restaurants } from "@/guide/data";
import {
  presetFromChecklist,
  type ChecklistItem,
} from "@/bookings/bookingTypes";
import { loadPlannerPlan, cityNeedOf, buildPlanTimeline, railFeasiblePair, type PlannerPlan, type PlanTimelineLeg } from "@/guide/plannerSchedule";
import { getDataset, useDatasetsVersion } from "@/lib/datasets";
import {
  BOOKING_KIND_LABEL,
  BOOKING_FIELD_LABEL,
  BOOKING_KINDS,
  bookingSummary,
  parseBookingBody,
  type BookingKind,
  type BookingPreset,
} from "@/bookings/bookingTypes";
import { FLIGHT_LEGS, liveFlightQuote, flightDbQueriedAt, hotelStaysFromPlan, flightDateFromPlan, applyPlanTimeline, type HotelStay, type PlanSegment } from "@/bookings/bookingTimeline";
import { getLiveHotelPrice, liveDisplayRate, livePriceDatasetStatus, type LiveHotelPrice, type LiveRoomRate } from "@/guide/hotelLivePrices";
import StickyMapBar, { SafeStickyMapBar, buildItemsFromFavorites, buildCandidateItems, stickyItemKey, type FlightRoute } from "@/components/StickyMapBar";
import { airportForCity } from "@/data/airportCoords";
import { supabase, supabaseConfigured } from "@/lib/supabase";

/** 余位状态徽标（与详情页 AvailabilityInfoPanel 同口径）：r=餐厅文案，a=景点文案 */
const AV_BADGE: Record<string, { r: string; a: string; cls: string }> = {
  available: { r: "有位", a: "有票", cls: "bg-green-600" },
  mixed: { r: "部分日期有位", a: "部分日期有票", cls: "bg-amber-600" },
  full: { r: "已订满", a: "已订满", cls: "bg-red-600" },
  soldout: { r: "售罄", a: "售罄", cls: "bg-red-600" },
  not_released: { r: "尚未放位", a: "尚未开售", cls: "bg-gray-500" },
  walkin: { r: "现场排队", a: "随到随买", cls: "bg-blue-600" },
  unverifiable: { r: "在线查不到", a: "在线查不到", cls: "bg-gray-400" },
};

const kindBadge: Record<BookingKind, string> = {
  hotel: "bg-teal-700 text-white",
  restaurant: "bg-amber-600 text-white",
  attraction: "bg-sky-600 text-white",
  transport: "bg-indigo-600 text-white",
  other: "bg-gray-500 text-white",
};

type Filter = BookingKind | "all" | "pending" | "confirmed";

/** 顶部行动总览：现在要干什么，一眼看清 */
function ActionStrip({ confirmedCount }: { confirmedCount: number }) {
  const four = ["新加坡", "普吉", "曼谷", "清迈"];
  const rests = restaurants.filter((r) => four.includes(r.city));
  const mustN = rests.filter(
    (r) => getRestaurantBookingPolicy(r.name)?.policy === "must_book",
  ).length;
  const peakN = rests.filter(
    (r) => getRestaurantBookingPolicy(r.name)?.policy === "peak_recommended",
  ).length;
  const stats = [
    { label: "现在锁", n: 5, cls: "bg-rose-50 text-rose-700 border-rose-200" },
    { label: "酒店待选", n: 4, cls: "bg-amber-50 text-amber-700 border-amber-200" },
    { label: "必订餐厅", n: mustN, cls: "bg-orange-50 text-orange-700 border-orange-200" },
    { label: "建议订位", n: peakN, cls: "bg-sky-50 text-sky-700 border-sky-200" },
    { label: "已确认", n: confirmedCount, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ];
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {stats.map((s) => (
        <span
          key={s.label}
          className={`text-sm font-medium px-3 py-1.5 rounded-full border ${s.cls}`}
        >
          {s.label} <b>{s.n}</b>
        </span>
      ))}
    </div>
  );
}

/** ISO 日期加减（行动队列算酒店夜用） */
function isoAddDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  const p2 = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}

/** 统一行动队列（2026-10-16 审计改进）：把原本散在首页警告、每日横幅、价格追踪卡、
 * 最终预定日历四处的「现在该处理什么」汇总到预订页顶部，按紧迫度排，每条带原因和直达入口。
 * 数据只用现成的：已确认预订记录（与最终预定同口径）、收藏流水线状态、sea_availability
 * 每日实查、航班库实时价 vs 收藏价、timeline 酒店窗口 vs 已订夜。查不到的就不写、不编。 */
type QueueCat = "hotels" | "flights" | "restaurants" | "attractions";

function NextActionQueue({
  plan,
  stays,
  flightSegs,
  category,
  onGoTrackCard,
  onGoFinal,
  onGoScreen,
}: {
  plan: PlannerPlan | null;
  stays: HotelStay[];
  flightSegs: PlanSegment[];
  /** 只显示当前类别页签的事项（2026-10-16 用户：在看酒店就只写酒店的） */
  category: QueueCat;
  onGoTrackCard: (id: number) => void;
  onGoFinal: () => void;
  onGoScreen: (cat: QueueCat, city?: string) => void;
}) {
  const { rows: bkRows, loading } = useRecordsData(["booking"]);
  const { rows: fvRows } = useRecordsData(["favorite"]);
  useDatasetsVersion();
  const [availMap, setAvailMap] = useState<Map<string, { status: string; checked_at: string }>>(new Map());
  useEffect(() => {
    if (!supabaseConfigured || !supabase) return;
    let live = true;
    supabase
      .from("sea_availability")
      .select("kind,name,status,checked_at")
      .eq("trip_ref", "dec2026")
      .then(({ data }) => {
        if (!live || !data) return;
        const m = new Map<string, { status: string; checked_at: string }>();
        for (const r of data as { kind: string; name: string; status: string; checked_at: string }[]) {
          m.set(`${r.kind}:${r.name}`, { status: r.status, checked_at: r.checked_at });
        }
        setAvailMap(m);
      });
    return () => {
      live = false;
    };
  }, []);

  if (loading) return null;

  interface Action {
    sev: number;
    cat: QueueCat;
    icon: string;
    text: string;
    btn: string;
    go: () => void;
  }
  const actions: Action[] = [];

  /* 已确认预订：按名索引 + 酒店覆盖夜（与最终预定日历同口径：date..dateEnd 前一晚） */
  const confirmedNames = new Set<string>();
  const bookingTitles = new Set<string>();
  const coveredNights = new Set<string>();
  for (const r of bkRows) {
    bookingTitles.add(r.title.trim().toLowerCase());
    if (!r.done) continue;
    confirmedNames.add(r.title.trim().toLowerCase());
    const d = parseBookingBody(r.body);
    if (d.bkind === "hotel" && d.date) {
      if (!d.dateEnd) {
        coveredNights.add(d.date);
      } else {
        let cur = d.date;
        let g = 0;
        while (cur < d.dateEnd && g++ < 62) {
          coveredNights.add(cur);
          cur = isoAddDays(cur, 1);
        }
      }
    }
  }

  /* 酒店未订夜：timeline 酒店窗口里还没被已确认酒店记录覆盖的夜（关掉订酒店的城市不算） */
  if (plan) {
    for (const st of stays) {
      if (!cityNeedOf(plan, st.city).hotel) continue;
      let missing = 0;
      let cur = st.checkIn;
      let g = 0;
      while (cur < st.checkOut && g++ < 62) {
        if (!coveredNights.has(cur)) missing++;
        cur = isoAddDays(cur, 1);
      }
      if (missing > 0) {
        actions.push({
          sev: 2,
          cat: "hotels",
          icon: "🏨",
          text: `${st.city}还有 ${missing} 晚酒店没订（${planDateShort(st.checkIn)} 入住 · 这段共 ${st.nights} 晚）`,
          btn: "去选酒店",
          go: () => onGoScreen("hotels", st.city),
        });
      }
    }
  }

  /* 收藏流水线：余位异常 / 必订未订 / 已确定没加入预订 / 航班涨价 */
  const favsQ = fvRows
    .map((r) => {
      try {
        const d = JSON.parse(r.body || "{}") as {
          city?: string;
          type?: string;
          flight?: {
            carrier?: string; flight?: string; price?: number; cabin?: string; route?: string;
          };
        };
        return { row: r, city: d.city ?? "", type: d.type ?? "attraction", flight: d.flight };
      } catch {
        return { row: r, city: "", type: "attraction", flight: undefined };
      }
    })
    .filter((f) => ["hotel", "flight", "restaurant", "attraction"].includes(f.type));

  for (const f of favsQ) {
    const title = f.row.title;
    const confirmed = confirmedNames.has(title.trim().toLowerCase());
    if ((f.type === "restaurant" || f.type === "attraction") && !confirmed) {
      const av = availMap.get(`${f.type}:${title}`);
      const when = av?.checked_at
        ? new Date(av.checked_at).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })
        : "";
      if (av && (av.status === "full" || av.status === "soldout")) {
        actions.push({
          sev: 3,
          cat: f.type === "restaurant" ? "restaurants" : "attractions",
          icon: "🔴",
          text: `${title} 已经订满/售罄${when ? `（${when} 实查）` : ""}，得换备选或改时间`,
          btn: "去看这项",
          go: () => onGoTrackCard(f.row.id),
        });
      } else if (av && av.status === "not_released") {
        actions.push({
          sev: 1,
          cat: f.type === "restaurant" ? "restaurants" : "attractions",
          icon: "⏳",
          text: `${title} 还没放位/开售${when ? `（${when} 实查）` : ""}，先盯着，放出来第一时间订`,
          btn: "去看这项",
          go: () => onGoTrackCard(f.row.id),
        });
      } else if (
        f.type === "restaurant" &&
        getRestaurantBookingPolicy(title)?.policy === "must_book"
      ) {
        actions.push({
          sev: 2,
          cat: "restaurants",
          icon: "🍽️",
          text: `必订餐厅 ${title} 还没订位`,
          btn: "去看这项",
          go: () => onGoTrackCard(f.row.id),
        });
      }
    }
    if (f.type === "flight" && f.flight?.flight && f.flight.price != null && f.flight.price > 0 && !confirmed) {
      const leg = FLIGHT_LEGS.find((l) => l.route === f.flight!.route);
      const qDate = f.flight.route ? flightDateFromPlan(f.flight.route, flightSegs) : null;
      const live = leg?.dbSeg && qDate ? liveFlightQuote(leg.dbSeg, qDate, f.flight.flight) : null;
      const lp = live ? (f.flight.cabin === "biz" ? live.bizPrice : live.price) : null;
      if (lp != null && lp >= f.flight.price * 1.1) {
        const pct = Math.round((lp / f.flight.price - 1) * 100);
        actions.push({
          sev: 3,
          cat: "flights",
          icon: "✈️",
          text: `${f.flight.route ?? ""} ${f.flight.flight} 涨到 $${Math.round(lp)}（收藏时 $${f.flight.price}，+${pct}%），要锁趁早`,
          btn: "去看这项",
          go: () => onGoTrackCard(f.row.id),
        });
      }
    }
    if (f.row.done && !confirmed && !bookingTitles.has(title.trim().toLowerCase())) {
      actions.push({
        sev: 1,
        cat: (f.type === "hotel" ? "hotels" : f.type === "flight" ? "flights" : f.type === "restaurant" ? "restaurants" : "attractions") as QueueCat,
        icon: "📌",
        text: `「${title}」已经确定了，还没加入预订`,
        btn: "去加入预订",
        go: () => onGoTrackCard(f.row.id),
      });
    }
  }

  /* 待确认的预订记录：按类别拆开，只进对应类别的队列 */
  const BKIND_CAT: Record<string, QueueCat> = {
    hotel: "hotels",
    transport: "flights",
    restaurant: "restaurants",
    attraction: "attractions",
  };
  const pendByCat = new Map<QueueCat, string[]>();
  for (const r of bkRows) {
    if (r.done) continue;
    const c = BKIND_CAT[parseBookingBody(r.body).bkind];
    if (!c) continue;
    if (!pendByCat.has(c)) pendByCat.set(c, []);
    pendByCat.get(c)!.push(r.title);
  }
  for (const [c, titles] of pendByCat) {
    actions.push({
      sev: 1,
      cat: c,
      icon: "📝",
      text: `有 ${titles.length} 条预订记录还没标确认：${titles.slice(0, 2).join("、")}${titles.length > 2 ? " 等" : ""}`,
      btn: "去最终预定",
      go: onGoFinal,
    });
  }

  /* 按当前类别页签过滤（2026-10-16 用户：在哪个菜单就只写哪个类别的） */
  const CAT_LABEL: Record<QueueCat, string> = {
    hotels: "酒店",
    flights: "机票",
    restaurants: "餐厅",
    attractions: "景点",
  };
  const scoped = actions
    .filter((a) => a.cat === category)
    .sort((a, b) => b.sev - a.sev);
  const shown = scoped.slice(0, 8);
  const otherCount = actions.length - scoped.length;

  if (!shown.length) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 text-sm text-emerald-900">
        ✅ <b>{CAT_LABEL[category]}这边没有要处理的</b>
        {otherCount > 0
          ? `：其他类别还有 ${otherCount} 件，切过去就能看到。`
          : "：该订的都订上了，收藏的余位和价格也没有异常。"}
      </div>
    );
  }
  return (
    <div className="bg-white border-2 border-teal-700 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-900">🧭 现在该处理 · {CAT_LABEL[category]}</h3>
        <span className="text-xs bg-teal-700 text-white px-2 py-0.5 rounded-full font-medium">
          {scoped.length} 件
        </span>
      </div>
      <div className="space-y-1.5">
        {shown.map((a, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="shrink-0">{a.icon}</span>
            <span className="flex-1 min-w-0 text-gray-800">{a.text}</span>
            <button
              type="button"
              onClick={a.go}
              className="shrink-0 text-xs px-2.5 py-1.5 rounded-lg bg-teal-700 text-white font-medium hover:bg-teal-800"
            >
              {a.btn} →
            </button>
          </div>
        ))}
      </div>
      {scoped.length > shown.length && (
        <p className="text-xs text-gray-400 mt-2">本类还有 {scoped.length - shown.length} 件没显示完。</p>
      )}
      {otherCount > 0 && (
        <p className="text-xs text-gray-400 mt-2">其他类别还有 {otherCount} 件要处理，切到对应页签看。</p>
      )}
    </div>
  );
}

/** 收藏的待预订清单（2026-10-02 用户重构）：
 * - 酒店/航班/餐厅/景点四类收藏全部出现在这里，不再藏着
 * - 每项带实时价格追踪（航班走 Google Flights 实查价，酒店走实查房价）
 * - 一键转入预订记录
 * 用户原话："你现在的那些酒店的收藏我都不知道你收藏到什么地方去了，完全没有用" */
/** 2026-10-03 用户重设计：行动安排按城市+时间线分组（取代按类型的分组）。
 * 每个城市一块，时间线顺序排列；城内再分航班/酒店/餐厅/景点；实时价格+涨跌摆出来好比较。 */
/** 未登录门禁（2026-10-13 用户）：预定筛选/最终预定含收藏与预订记录，
 * 没有登录的人一律看不到内容，只显示空白页 + 登录提示。 */
function LoginGate({ syncMode }: { syncMode: "cloud" | "local" | null }) {
  return (
    <div className="bg-white border border-dashed border-gray-300 rounded-xl px-4 py-16 text-center">
      <p className="text-3xl mb-3">🔒</p>
      <p className="text-sm font-medium text-gray-700">
        {syncMode === null ? "正在确认登录状态…" : "你需要登录才能看到"}
      </p>
      <p className="text-xs text-gray-400 mt-1.5">
        预定筛选和最终预定里是你的收藏与预订记录，登录后才能查看。
      </p>
      {syncMode === "local" && (
        <Link
          to="/login"
          className="inline-block mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500"
        >
          去登录
        </Link>
      )}
    </div>
  );
}

function FavoriteActionList({
  onAddFavorite,
  stays,
  plan,
  mapStickyTop,
}: {
  onAddFavorite: (name: string, city: string, bkind: BookingKind, dates?: { date?: string; dateEnd?: string }) => void;
  stays: HotelStay[];
  /** 云端规划（行程骨架只读它的 timeline，不本地推导） */
  plan: PlannerPlan | null;
  /** 地图置顶偏移（菜单体系之下）：站点顶栏 + 预订页吸顶菜单总高 */
  mapStickyTop?: number;
}) {
  const { rows, del, save } = useRecordsData(["favorite"]);
  /* 2026-10-13 用户：预定筛选要标出每项"是否已预订"——拿已确认的预订记录按名称匹配 */
  const { rows: bookingRows } = useRecordsData(["booking"]);
  const confirmedByName = useMemo(() => {
    const m = new Map<string, { code?: string; summary: string }>();
    for (const r of bookingRows) {
      if (!r.done) continue;
      const d = parseBookingBody(r.body);
      m.set(r.title.trim().toLowerCase(), { code: d.code, summary: bookingSummary(d) });
    }
    return m;
  }, [bookingRows]);
  /* 已出票判定同样只认 DB：已确认的交通类预订记录按航班号建索引，收藏航班号命中即已出票 */
  const ticketedByFlightNo = useMemo(() => {
    const m = new Map<string, { code?: string; summary: string }>();
    for (const r of bookingRows) {
      if (!r.done) continue;
      const d = parseBookingBody(r.body);
      if (d.bkind !== "transport") continue;
      const hit = `${r.title} ${d.extra ?? ""}`.match(/[A-Z]{2}\d{3,4}/);
      if (hit) m.set(hit[0], { code: d.code, summary: bookingSummary(d) });
    }
    return m;
  }, [bookingRows]);
  const { segments } = usePlanScope();
  const segs: PlanSegment[] = useMemo(
    () => segments.map((s) => ({ city: s.city, start: s.start, end: s.end, days: s.days })),
    [segments]
  );
  /* 航班日期须走完整大行程链（2026-10-14 site-improve）：schedule 段表只有
   * 新加坡/东南亚/首尔，没有分开行动的西安/北京段——曼谷→西安、曼谷→北京用
   * segs 算 flightDateFromPlan 必然返回 null、只能靠收藏快照日期兜底，行程改了
   * 也不跟随（与 GuideApp 航班页 useFullTripSegments 口径不一致）。分组与
   * 餐厅/景点到城日仍用 segs（城市范围口径不变），航班日期三处统一走 flightSegs。 */
  const fullSegments = useFullTripSegments();
  const flightSegs: PlanSegment[] = useMemo(
    () => fullSegments.map((s) => ({ city: s.city, start: s.start, end: s.end, days: s.days, segId: s.segId })),
    [fullSegments]
  );
  /* 2026-10-13 用户：价格追踪集中呈现 live 数据——餐厅/景点余位状态来自 sea_availability（每日实查），
     按 kind:name 一次全量拉取，收藏卡片同名命中才显示，没查到的不显示、不编造 */
  const [availMap, setAvailMap] = useState<Map<string, { status: string; checked_at: string }>>(new Map());
  useEffect(() => {
    if (!supabaseConfigured || !supabase) return;
    let live = true;
    supabase
      .from("sea_availability")
      .select("kind,name,status,checked_at")
      .eq("trip_ref", "dec2026")
      .then(({ data }) => {
        if (!live || !data) return;
        const m = new Map<string, { status: string; checked_at: string }>();
        for (const r of data as { kind: string; name: string; status: string; checked_at: string }[]) {
          m.set(`${r.kind}:${r.name}`, { status: r.status, checked_at: r.checked_at });
        }
        setAvailMap(m);
      });
    return () => {
      live = false;
    };
  }, []);
  /* 2026-10-03 用户：详情页返回要恢复到原卡片滚动位置 */
  useLayoutEffect(() => {
    let saved: { cardId?: string; scrollY?: number; at?: number } | null = null;
    try {
      const raw = sessionStorage.getItem("bookingReturnScroll");
      if (raw) saved = JSON.parse(raw);
    } catch { /* ignore */ }
    if (!saved) return;
    /* 只处理 10 分钟内的返回，避免旧数据误触 */
    if (saved.at && Date.now() - saved.at > 10 * 60 * 1000) {
      try { sessionStorage.removeItem("bookingReturnScroll"); } catch { /* ignore */ }
      return;
    }
    try { sessionStorage.removeItem("bookingReturnScroll"); } catch { /* ignore */ }
    /* 等列表渲染完再滚动 */
    const t = setTimeout(() => {
      if (saved!.cardId) {
        const el = document.getElementById(`booking-card-${saved!.cardId}`);
        if (el) {
          el.scrollIntoView({ block: "center" });
          return;
        }
      }
      if (typeof saved!.scrollY === "number") window.scrollTo(0, saved!.scrollY);
    }, 150);
    return () => clearTimeout(t);
  }, []);
  const stayOf = (city: string) => stays.find((s) => s.city === city);
  const manualFavs = rows
    .map((r) => {
      try {
        const d = JSON.parse(r.body) as {
          city?: string; note?: string; type?: string;
          flight?: {
            carrier?: string; flight?: string; depart?: string; arrive?: string;
            arrivePlusDay?: boolean; price?: number; cabin?: string; route?: string;
            date?: string; priceBasis?: string; queriedAt?: string;
          };
        };
        return { row: r, city: d.city ?? "", type: d.type ?? "attraction", flight: d.flight, auto: false as boolean };
      } catch {
        return { row: r, city: "", type: "attraction", flight: undefined, auto: false as boolean };
      }
    })
    .filter((f) => ["hotel", "flight", "restaurant", "attraction"].includes(f.type));

  /* 2026-10-13 用户铁律：预定筛选只显示 DB 里的收藏记录，不许再从代码常量（FLIGHT_LEGS）
     自动注入已出票航班。出票信息先进 DB 预订记录，再由下面的已出票匹配从 DB 反映出来 */
  /* 2026-10-17 用户：价格追踪必须与收藏完全一致、不许有重复——同一航班/地点被不同入口
     重复收藏的（标题写法不同、旧判重漏检），在这里按语义身份合并成一条再展示：
     航班优先留快照日期与当前行程日期一致的那条，其次留最新建的那条。
     身份由收藏数据本身推导（favoriteIdentityKey），不硬编码任何名单。 */
  const favs = ((): typeof manualFavs => {
    const best = new Map<string, (typeof manualFavs)[number]>();
    for (const f of manualFavs) {
      const k = favoriteIdentityKey(f.type, f.city, f.row.title, f.flight ?? null);
      const cur = best.get(k);
      if (!cur) {
        best.set(k, f);
        continue;
      }
      const planDate =
        f.type === "flight" && f.flight?.route ? flightDateFromPlan(f.flight.route, flightSegs) : null;
      const score = (x: (typeof manualFavs)[number]) =>
        planDate && x.flight?.date === planDate ? 1 : 0;
      if (score(f) > score(cur) || (score(f) === score(cur) && f.row.id > cur.row.id)) {
        best.set(k, f);
      }
    }
    return manualFavs.filter(
      (f) => best.get(favoriteIdentityKey(f.type, f.city, f.row.title, f.flight ?? null)) === f,
    );
  })();

  if (!favs.length) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 mb-6 text-center">
        <p className="text-sm text-gray-500">📈 价格追踪是空的</p>
        <p className="text-xs text-gray-400 mt-1">
          在「🔍 预定筛选」里浏览酒店/机票/餐厅/景点时点「＋ 收藏」，收藏项会按城市+时间线出现在这里，集中追踪价格、余位和可预订状态
        </p>
      </div>
    );
  }

  const typeLabel = (type: string) =>
    type === "hotel" ? "🏨 酒店" :
    type === "flight" ? "✈️ 航班" :
    type === "restaurant" ? "🍽️ 餐厅" : "🏛️ 景点";

  const bkindFor = (type: string): BookingKind =>
    type === "hotel" ? "hotel" :
    type === "flight" ? "transport" :
    type === "restaurant" ? "restaurant" : "attraction";

  /** 航班归属城市：取路线目的地（如"北京 → 新加坡"→"新加坡"）；取不到用收藏时的 city */
  const flightCity = (f: (typeof favs)[number]) => {
    const route = f.flight?.route ?? "";
    /* 2026-10-03 用户：航班按出发城市归类（首尔→西雅图归首尔），不是按到达城市 */
    const origin = route.split("→")[0]?.trim();
    if (origin) return origin;
    return f.city;
  };
  const itemCity = (f: (typeof favs)[number]) =>
    f.type === "flight" ? flightCity(f) : f.city;

  // 2026-10-03 用户：吸顶可折叠地图（地图点 = 收藏，只收行程城市）
  // 2026-10-04 用户裁决：废弃滚动侦测，改点卡片高亮——点哪张卡地图高亮它，其他正常显示
  // （航班卡=两机场+连线），不点显示全部；再点一次取消选择
  /** 预订卡片 ↔ 地图点的关联 key（与 StickyMapBar 内 marker key 同算法） */
  const bookingItemKey = (f: (typeof favs)[number]) =>
    stickyItemKey(f.type, itemCity(f), f.row.title);
  const [mapSelKey, setMapSelKey] = useState<string | null>(null);
  /* 2026-10-17 用户：追踪地图要能按城市聚焦看——选一个城市，地图只框这座城：
     收藏+候选酒店全标注、该城全部景点也标注，方便比较酒店在岛上/城里的分布、离景点远近 */
  const [mapCity, setMapCity] = useState<string | null>(null);
  const mapCities = useMemo(() => [...new Set(segs.map((s) => s.city))], [segs]);
  // favs 每 render 都是新数组引用，用内容签名做 memo key，避免地图 markers 无意义重建
  const favSig = favs.map((f) => `${f.type}:${f.row.title}:${itemCity(f)}:${f.flight?.route ?? ""}`).join("|");
  const segSig = segs.map((s) => s.city).join(",");
  const bookingMapItems = useMemo(() => {
    // 2026-10-04 用户一次搞定：预订页地图显示全部——
    // ① 已收藏（可点卡片高亮）；② 行程全部景点（简单显示）；③ 各城市候选酒店/餐厅（灰标）
    const favItems = buildItemsFromFavorites(
      favs.map((f) => ({ name: f.row.title, city: itemCity(f), type: f.type })),
      segs.map((s) => s.city),
      true, // 行程景点也显示（用户要求：其他景点简单显示在地图上）
    );
    const seen = new Set(favItems.map((it) => stickyItemKey(it.kind, it.city, it.name)));
    const candidates = buildCandidateItems(segs.map((s) => s.city)).filter(
      (it) => !seen.has(stickyItemKey(it.kind, it.city, it.name)),
    );
    return [...favItems, ...candidates];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favSig, segSig]);
  // 航班航线：每张航班卡片一条（出发/到达机场 + 连线），key 与卡片同键
  const bookingFlightRoutes = useMemo<FlightRoute[]>(() => {
    const out: FlightRoute[] = [];
    const seen = new Set<string>();
    for (const f of favs) {
      if (f.type !== "flight" || !f.flight?.route) continue;
      const parts = f.flight.route.split("→").map((s) => s.trim());
      const fromCity = parts[0] || "";
      const toCity = parts[1] || "";
      if (!fromCity || !toCity) continue;
      if (!airportForCity(fromCity) || !airportForCity(toCity)) continue;
      const key = bookingItemKey(f);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ key, name: f.row.title, fromCity, toCity });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favSig]);
  // 标题副文案：点选模式下显示被选中的卡片名（航班显示路线；📍 由 StickyMapBar 统一加）
  const mapSelLabel = useMemo(() => {
    if (!mapSelKey) return undefined;
    const f = favs.find((x) => bookingItemKey(x) === mapSelKey);
    if (!f) return undefined;
    return f.type === "flight" && f.flight?.route ? f.flight.route : f.row.title;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapSelKey, favSig]);

  /** 2026-10-03 用户：每个预订项的时间线日期——航班用航班日期，酒店用入住日期 */
  const itemTimelineDate = (f: (typeof favs)[number]): string => {
    if (f.type === "flight" && f.flight) {
      const route = f.flight.route || "";
      const planDate = route ? flightDateFromPlan(route, flightSegs) : null;
      return planDate || f.flight.date || "";
    }
    if (f.type === "hotel") {
      const st = stayOf(itemCity(f));
      return st ? st.checkIn : "";
    }
    /* 餐厅/景点：用所在城市段的开始日期 */
    const seg = segs.find((s) => s.city === itemCity(f));
    return seg ? seg.start : "";
  };

  /* ---------- 行程骨架（2026-10-16 用户：价格追踪先以行程时间轴为骨架） ----------
   * 路段（✈️ 北京 → 新加坡 · 12-06）与住段（新加坡 · 12-06→12-11）按 plan.timeline 交错成一条旅程：
   * 航班收藏挂到它所属的路段下，酒店/餐厅/景点挂到所在城市的住段下，
   * 一眼看清每件追踪属于哪一段行程。骨架只读 timeline 的 legs/days，不本地推导日期。 */
  interface JourneySection {
    key: string;
    kind: "leg" | "stay" | "other";
    leg?: PlanTimelineLeg;
    label: string;
    cities: string[];
    start?: string;
    end?: string;
    days?: number;
    items: typeof favs;
  }
  const journeySections: JourneySection[] = (() => {
    const tl = plan ? (plan.timeline ?? buildPlanTimeline(plan)) : null;
    if (!tl) {
      return favs.length
        ? [{ key: "all", kind: "other" as const, label: "全部收藏", cities: [], items: favs }]
        : [];
    }
    /* 住段：timeline.days 按 (seg, cities) 连续分组 */
    interface StayNode { start: string; end: string; cities: string[]; seg: string }
    const stayNodes: StayNode[] = [];
    for (const d of Object.keys(tl.days).sort()) {
      const day = tl.days[d]!;
      const lastN = stayNodes[stayNodes.length - 1];
      if (lastN && lastN.seg === day.seg && lastN.cities.join("/") === day.cities.join("/")) {
        lastN.end = d;
      } else {
        stayNodes.push({ start: d, end: d, cities: day.cities, seg: day.seg });
      }
    }
    const dayCount = (a: string, b: string) =>
      Math.round((new Date(`${b}T12:00:00`).getTime() - new Date(`${a}T12:00:00`).getTime()) / 86400000) + 1;
    /* 收藏归段：航班先按路线挂路段；其余按城市挂住段；都挂不上进「其他」 */
    const legItems = new Map<string, typeof favs>();
    const stayItems = new Map<number, typeof favs>();
    const otherItems: typeof favs = [];
    const pushTo = <K,>(m: Map<K, typeof favs>, k: K, f: (typeof favs)[number]) => {
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(f);
    };
    for (const f of favs) {
      let placed = false;
      if (f.type === "flight" && f.flight?.route) {
        const parts = f.flight.route.split("→").map((s) => s.trim());
        const leg = tl.legs.find((l) => l.fromCity === parts[0] && l.toCity === parts[1]);
        if (leg) {
          pushTo(legItems, leg.id, f);
          placed = true;
        } else {
          const idx = stayNodes.findIndex((s) => s.cities.includes(parts[1] ?? ""));
          if (idx >= 0) {
            pushTo(stayItems, idx, f);
            placed = true;
          }
        }
      }
      if (!placed) {
        const idx = stayNodes.findIndex((s) => s.cities.includes(itemCity(f)));
        if (idx >= 0) {
          pushTo(stayItems, idx, f);
          placed = true;
        }
      }
      if (!placed) otherItems.push(f);
    }
    /* 交错成旅程：每个住段之前，先排出日期不晚于它开始日的路段 */
    const out: JourneySection[] = [];
    const emitted = new Set<string>();
    const legSection = (l: PlanTimelineLeg): JourneySection => ({
      key: `leg-${l.id}`,
      kind: "leg",
      leg: l,
      label: `${l.fromCity} → ${l.toCity}`,
      cities: [],
      items: legItems.get(l.id) ?? [],
    });
    stayNodes.forEach((s, i) => {
      for (const l of tl.legs) {
        if (emitted.has(l.id) || l.date > s.start) continue;
        emitted.add(l.id);
        out.push(legSection(l));
      }
      out.push({
        key: `stay-${s.seg}-${s.start}`,
        kind: "stay",
        label: s.cities.join(" · "),
        cities: s.cities,
        start: s.start,
        end: s.end,
        days: dayCount(s.start, s.end),
        items: stayItems.get(i) ?? [],
      });
    });
    for (const l of tl.legs) {
      if (emitted.has(l.id)) continue;
      emitted.add(l.id);
      out.push(legSection(l));
    }
    if (otherItems.length) {
      out.push({ key: "other", kind: "other", label: "其他收藏", cities: [], items: otherItems });
    }
    return out;
  })();
  const weekdayOf = (iso: string) =>
    ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][new Date(`${iso}T12:00:00`).getDay()] ?? "";

  const decided = favs.filter((f) => f.row.done).length;
  /* 2026-10-03 用户：行动安排的 item 要能展开看详情，方便对比 */
  const [expandedId, setExpandedId] = useState<number | null>(null);
  // 2026-10-10 用户：卡片按钮太占空间，确定/加入预订/移除收进 ⋯ 菜单
  const [menuId, setMenuId] = useState<number | null>(null);
  /* 价格追踪类别筛选（2026-10-16 redesign）：页头 chips 按类型过滤，与预定筛选的类别口径一致 */
  const [typeFilter, setTypeFilter] = useState<"all" | "flight" | "hotel" | "restaurant" | "attraction">("all");
  const bookedCount = favs.filter(
    (f) =>
      confirmedByName.has(f.row.title.trim().toLowerCase()) ||
      (f.type === "flight" && !!f.flight?.flight && ticketedByFlightNo.has(f.flight.flight)),
  ).length;
  const anyVisible = journeySections.some((sec) =>
    sec.items.some((f) => typeFilter === "all" || f.type === typeFilter),
  );
  /** 按名称找攻略详情（酒店/餐厅/景点） */
  const findDetail = (name: string, type: string) => {
    if (type === "hotel") return hotels.find((h) => h.name === name);
    if (type === "restaurant") return restaurants.find((r) => r.name === name);
    if (type === "attraction") return attractions.find((a) => a.name === name);
    return undefined;
  };

  return (
    <div className="mb-6">
      {/* 页头（2026-10-16 用户要求 redesign）：白卡 + 数据 chips + 类别筛选，
          不再用琥珀色横幅和整段说明文字墙；细则收进一行小字 */}
      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5 mb-4 shadow-[0_1px_3px_rgba(16,47,62,0.06)]">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-base font-bold text-gray-900">📈 价格追踪</h3>
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">⭐ 收藏 {favs.length}</span>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">✓ 已确定 {decided}</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium">✅ 已订上 {bookedCount}</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          只看你收藏的实时价格、余位和预订状态，沿行程时间轴排列：航班挂在它所属的那一段路上，酒店、餐厅、景点挂在住的那一段里；点卡片在地图上定位它，看好后从 ⋯ 菜单「确定 / 加入预订」。
        </p>
        <div className="flex gap-1.5 mt-2.5 flex-wrap" role="tablist" aria-label="价格追踪类别筛选">
          {(
            [
              { k: "all", label: "全部", n: favs.length },
              { k: "flight", label: "✈️ 航班", n: favs.filter((f) => f.type === "flight").length },
              { k: "hotel", label: "🏨 酒店", n: favs.filter((f) => f.type === "hotel").length },
              { k: "restaurant", label: "🍽️ 餐厅", n: favs.filter((f) => f.type === "restaurant").length },
              { k: "attraction", label: "🏛️ 景点", n: favs.filter((f) => f.type === "attraction").length },
            ] as const
          ).map((c) => (
            <button
              key={c.k}
              role="tab"
              aria-selected={typeFilter === c.k}
              onClick={() => setTypeFilter(c.k)}
              className={`px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                typeFilter === c.k
                  ? "bg-teal-700 text-white border-teal-700"
                  : "bg-white text-gray-500 border-gray-200 hover:border-teal-600"
              }`}
            >
              {c.label} <span className={typeFilter === c.k ? "text-teal-100" : "text-gray-400"}>{c.n}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2026-10-03 用户：吸顶可折叠地图——收藏的酒店/餐厅/景点，看位置合不合适、离酒店远近；
          只显示大行程定下的城市；2026-10-04 用户裁决：点卡片高亮——点哪张卡地图高亮它，其他正常显示
          （航班卡=两机场+连线），不点显示全部，再点一次取消 */}
      {/* 2026-10-17 用户：地图按城市聚焦——选城市后只显示这座城的酒店（含候选）+ 全部景点，
          框住全城看分布（比如普吉几家酒店分散在岛上不同位置、各自离哪些景点近） */}
      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
        <span className="text-xs text-gray-500 font-medium">🗺️ 地图聚焦城市：</span>
        {([null, ...mapCities] as (string | null)[]).map((c) => (
          <button
            key={c ?? "all"}
            onClick={() => {
              setMapCity(c);
              setMapSelKey(null);
            }}
            className={`px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              mapCity === c
                ? "bg-teal-700 text-white border-teal-700"
                : "bg-white text-gray-500 border-gray-200 hover:border-teal-600"
            }`}
          >
            {c ?? "全部"}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 mb-2">
        地图上 🏨 是收藏与候选酒店、🏛️ 是该城全部景点、🍽️ 是餐厅——挑酒店时对照位置分布和离景点的远近看。
      </p>
      <SafeStickyMapBar
        items={mapCity ? bookingMapItems.filter((it) => it.city === mapCity) : bookingMapItems}
        activeCity={mapCity}
        activeLabel={mapSelLabel}
        activeItemKeys={mapSelKey ? [mapSelKey] : null}
        flightRoutes={
          mapCity
            ? bookingFlightRoutes.filter((r) => r.fromCity === mapCity || r.toCity === mapCity)
            : bookingFlightRoutes
        }
        title="🗺️ 价格追踪地图"
        storageKey="sticky-map-bookings"
        stickyTop={mapStickyTop}
      />

      {!anyVisible && (
        <p className="text-sm text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-xl px-4 py-6 text-center mb-5">
          这一类还没有收藏，去「🔍 预定筛选」里点「＋ 收藏」添加。
        </p>
      )}
      {journeySections.map((sec, si) => {
        const matching = sec.items.filter((f) => typeFilter === "all" || f.type === typeFilter);
        if (!matching.length) {
          /* 空骨架节点：全部模式下留一行细字让时间轴读得连贯；按类别筛选时直接隐藏 */
          if (typeFilter !== "all" || sec.kind === "other") return null;
          return (
            <div key={sec.key} className="mb-2.5 flex items-center gap-3 text-gray-400">
              <div className={`w-3 h-3 rounded-full shrink-0 ${sec.kind === "leg" ? "bg-sky-300" : "bg-teal-200"}`} />
              {sec.kind === "leg" ? (
                <span className="text-sm">
                  {sec.leg!.kind === "rail" ? "🚄" : "✈️"} <span className="font-medium">{sec.label}</span>
                  <span className="text-xs ml-2">
                    {planDateShort(sec.leg!.date)} {weekdayOf(sec.leg!.date)} · {sec.leg!.kind === "rail" ? "高铁，无需追踪" : "暂无追踪航班"}
                  </span>
                </span>
              ) : (
                <span className="text-sm">
                  <span className="font-medium">{sec.label}</span>
                  <span className="text-xs ml-2">{planDateShort(sec.start!)} → {planDateShort(sec.end!)} · 暂无追踪项</span>
                </span>
              )}
            </div>
          );
        }
        return (
        <div key={sec.key} data-city-section={sec.label} className="mb-5">
          {/* 骨架节点头：路段=蓝点（路线+日期），住段=青点（城市+日期范围） */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full shrink-0 ${sec.kind === "leg" ? "bg-sky-500" : "bg-teal-600"}`} />
              {si < journeySections.length - 1 && <div className="w-0.5 h-4 bg-teal-200" />}
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              {sec.kind === "leg" ? (
                <>
                  <h4 className="text-lg font-bold text-gray-900">{sec.leg!.kind === "rail" ? "🚄" : "✈️"} {sec.label}</h4>
                  <span className="text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full font-medium">
                    {planDateShort(sec.leg!.date)} {weekdayOf(sec.leg!.date)}
                  </span>
                  {sec.leg!.kind === "rail" && (
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">高铁</span>
                  )}
                </>
              ) : sec.kind === "stay" ? (
                <>
                  <h4 className="text-lg font-bold text-gray-900">{sec.label}</h4>
                  <span className="text-xs text-gray-500">
                    {planDateShort(sec.start!)} → {planDateShort(sec.end!)} · {sec.days} 天
                  </span>
                  {sec.cities.length === 1 && (() => {
                    const st = stayOf(sec.cities[0]!);
                    return st ? (
                      <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                        🛏️ {planDateShort(st.checkIn)} 入住 · {planDateShort(st.checkOut)} 退房 · {st.nights} 晚
                      </span>
                    ) : null;
                  })()}
                </>
              ) : (
                <h4 className="text-lg font-bold text-gray-900">{sec.label}</h4>
              )}
            </div>
          </div>

          {/* 城内按类型分组，组内按时间线日期排序 */}
          {(["flight", "hotel", "restaurant", "attraction"] as const).map((t) => {
            if (typeFilter !== "all" && t !== typeFilter) return null;
            const items = sec.items
              .filter((f) => f.type === t)
              .sort((a, b) => itemTimelineDate(a).localeCompare(itemTimelineDate(b)));
            if (!items.length) return null;
            return (
              <div key={t} className="ml-6 mb-4">
                {sec.kind !== "leg" && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-900 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full mb-2">
                    {typeLabel(t)}
                    <span className="text-teal-600 font-medium">{items.length} 项</span>
                  </div>
                )}
                <div className="grid gap-2.5 lg:grid-cols-2">
                  {items.map((f) => {
                    const isOpen = expandedId === f.row.id;
                    const detail = f.type !== "flight" ? findDetail(f.row.title, f.type) : undefined;
                    /* 2026-10-03 用户：航班也要能展开，看当天所有选项好对比 */
                    const flightLeg = f.type === "flight" && f.flight?.route
                      ? FLIGHT_LEGS.find((l) => l.route === f.flight!.route)
                      : undefined;
                    // 2026-10-04 点选模式：点卡片本体 → 地图只显示它（再点取消）；卡片里的按钮/链接不触发
                    const cardKey = bookingItemKey(f);
                    const cardSelected = mapSelKey === cardKey;
                    return (
                    <div
                      key={f.row.id}
                      id={`booking-card-${f.row.id}`}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest("button, a")) return;
                        setMapSelKey((prev) => (prev === cardKey ? null : cardKey));
                      }}
                      className={`bg-white rounded-xl border border-l-4 px-4 py-3 cursor-pointer shadow-[0_1px_2px_rgba(16,47,62,0.05)] ${
                        cardSelected
                          ? "ring-2 ring-teal-600 border-teal-600 border-l-teal-600"
                          : confirmedByName.has(f.row.title.trim().toLowerCase()) ||
                              (f.type === "flight" && !!f.flight?.flight && ticketedByFlightNo.has(f.flight.flight))
                            ? "border-gray-200 border-l-emerald-500"
                            : f.row.done
                              ? "border-gray-200 border-l-amber-400"
                              : "border-gray-200 border-l-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-[15px] font-semibold text-gray-900 leading-snug">
                          {f.row.title}
                          {f.type === "flight" && f.flight?.route && (
                            <span className="ml-2 text-xs font-normal text-gray-500">{f.flight.route}</span>
                          )}
                          {/* 已出票徽标只认 DB 已确认的交通预订记录（按航班号匹配），不读代码常量 */}
                          {f.type === "flight" && f.flight?.flight && ticketedByFlightNo.has(f.flight.flight) && (
                            <span
                              title={ticketedByFlightNo.get(f.flight.flight)!.summary}
                              className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white align-middle"
                            >
                              ✅ 已出票{ticketedByFlightNo.get(f.flight.flight)!.code ? ` · ${ticketedByFlightNo.get(f.flight.flight)!.code}` : ""}
                            </span>
                          )}
                          {/* 2026-10-13 用户：预定筛选要标"是否已预订"——与已确认预订记录同名即标（餐厅订位主要靠这条） */}
                          {(() => {
                            if (f.type === "flight" && f.flight?.flight && ticketedByFlightNo.has(f.flight.flight)) return null;
                            const rec = confirmedByName.get(f.row.title.trim().toLowerCase());
                            if (!rec) return null;
                            return (
                              <span
                                title={rec.summary}
                                className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white align-middle"
                              >
                                ✅ 已预订{rec.code ? ` · 确认号 ${rec.code}` : ""}
                              </span>
                            );
                          })()}
                          {/* 2026-10-03 用户：时间线日期徽标 */}
                          {(() => {
                            const d = itemTimelineDate(f);
                            return d ? (
                              <span className="ml-2 text-[11px] font-normal text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                                📅 {planDateShort(d)}
                              </span>
                            ) : null;
                          })()}
                        </div>
                        {/* 实时信息行：航班查库带涨跌，酒店查房价，餐厅/景点给政策；
                            价格/余位收进浅灰面板区，和标题区拉开层级（2026-10-16 redesign） */}
                        <div className="mt-2 rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-2">
                        <FavoritePriceLine
                          name={f.row.title} type={f.type} city={f.city}
                          flight={f.flight} segs={flightSegs}
                        />
                        {/* 余位 live 状态（sea_availability 每日实查）：餐厅看订位空位、景点看门票余量 */}
                        {(() => {
                          if (f.type !== "restaurant" && f.type !== "attraction") return null;
                          const av = availMap.get(`${f.type}:${f.row.title}`);
                          if (!av) return null;
                          const meta = AV_BADGE[av.status] ?? AV_BADGE.unverifiable!;
                          const label = f.type === "restaurant" ? meta.r : meta.a;
                          const when = av.checked_at
                            ? new Date(av.checked_at).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })
                            : "";
                          return (
                            <div className="mt-1">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${meta.cls}`}>
                                🎫 {label}
                              </span>
                              {when && <span className="ml-1.5 text-[10px] text-gray-400">{when} 实查</span>}
                            </div>
                          );
                        })()}
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0 pt-0.5">
                        {/* 2026-10-03 用户：行动安排里所有类型都就地展开看详情，不跳详情页（返回位置修不好就别跳） */}
                        {detail && f.type !== "flight" && (
                          <button
                            onClick={() => setExpandedId(isOpen ? null : f.row.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200"
                            aria-expanded={isOpen}
                          >
                            {isOpen ? "▴ 收起" : "▾ 详情"}
                          </button>
                        )}
                        {f.type === "flight" && flightLeg && (
                          <button
                            onClick={() => setExpandedId(isOpen ? null : f.row.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200"
                            aria-expanded={isOpen}
                          >
                            {isOpen ? "▴ 收起" : "▾ 详情"}
                          </button>
                        )}
                        {/* 2026-10-10 用户：按钮不占空间——只留详情，确定/加入预订/移除收进 ⋯ 菜单 */}
                        <div className="relative shrink-0">
                          <button
                            onClick={() => setMenuId(menuId === f.row.id ? null : f.row.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200"
                            aria-label="更多操作"
                            aria-expanded={menuId === f.row.id}
                          >
                            ⋯
                          </button>
                          {menuId === f.row.id && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setMenuId(null)} />
                              <div className="absolute right-0 top-full mt-1 z-40 min-w-[132px] bg-white rounded-xl shadow-lg border border-gray-200 py-1">
                                {!f.row.done ? (
                                  <button
                                    onClick={() => {
                                      setMenuId(null);
                                      save.mutate({
                                        id: f.row.id, kind: f.row.kind, title: f.row.title,
                                        body: f.row.body, day: f.row.day, done: true,
                                      });
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50"
                                  >
                                    ✓ 确定
                                  </button>
                                ) : (
                                  <span className="block px-3 py-2 text-xs font-medium text-green-700">
                                    ✓ 已确定
                                  </span>
                                )}
                                <button
                                  onClick={() => {
                                    setMenuId(null);
                                    /* 预填日期与卡片/详情同口径：酒店=入住→退房整段、餐厅/景点=到城首日单日、
                                       航班=航班日期（itemTimelineDate 已按此口径算好，酒店另取 stay 的退房日） */
                                    const bk = bkindFor(f.type);
                                    const st = bk === "hotel" ? stayOf(itemCity(f)) : undefined;
                                    const d0 = itemTimelineDate(f);
                                    onAddFavorite(f.row.title, itemCity(f), bk, {
                                      ...(d0 ? { date: d0 } : {}),
                                      ...(st ? { dateEnd: st.checkOut } : {}),
                                    });
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs font-medium text-teal-700 hover:bg-teal-50"
                                >
                                  加入预订
                                </button>
                                <button
                                  onClick={() => {
                                    setMenuId(null);
                                    del.mutate({ id: f.row.id });
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-100"
                                >
                                  ✕ 移除
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      </div>
                      {/* 展开：航班看当天所有选项（酒店/餐厅/景点走详情页，此处不再内联展开） */}
                      {isOpen && f.type === "flight" && flightLeg && (
                        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                          <p className="font-medium text-gray-500 mb-1.5">
                            ✈️ {flightLeg.route} · {flightLeg.date || "日期待定"}{(f.flight?.flight && ticketedByFlightNo.has(f.flight.flight)) ? "（已出票）" : ` 当天所有直飞（${flightLeg.options?.length ?? 0} 班）`}
                          </p>
                          {/* 2026-10-03 用户：机票要有价格变动时间线（含每次涨跌的发生时间） */}
                          {f.flight?.price != null && (
                            <FlightPriceTimeline
                              route={f.flight.route || ""}
                              date={(() => {
                                const route = f.flight!.route || "";
                                const leg = FLIGHT_LEGS.find((l) => l.route === route);
                                const planDate = route ? flightDateFromPlan(route, flightSegs) : null;
                                return planDate || f.flight!.date || "";
                              })()}
                              flightNo={f.flight.flight || ""}
                              cabin={f.flight.cabin || "eco"}
                              favPrice={f.flight.price}
                              livePrice={(() => {
                                const route = f.flight!.route || "";
                                const leg = FLIGHT_LEGS.find((l) => l.route === route);
                                const planDate = route ? flightDateFromPlan(route, flightSegs) : null;
                                const qDate = planDate || f.flight!.date || "";
                                const flightNo = f.flight!.flight || "";
                                const live = leg?.dbSeg && qDate && flightNo ? liveFlightQuote(leg.dbSeg, qDate, flightNo) : null;
                                const lp = live ? (f.flight!.cabin === "biz" ? live.bizPrice : live.price) : null;
                                return lp != null ? Math.round(lp) : null;
                              })()}
                            />
                          )}
                          {/* 已出票（以 DB 预订记录为准）直接给出票摘要；否则列当天直飞选项比价 */}
                          {(f.flight?.flight && ticketedByFlightNo.has(f.flight.flight)) ? (
                            <p className="text-emerald-700 font-medium">✅ 已出票 · {ticketedByFlightNo.get(f.flight.flight)!.summary}（全部细节见「✅ 最终预定」）</p>
                          ) : (flightLeg.options ?? []).length ? (
                            <div className="space-y-1">
                              {[...(flightLeg.options ?? [])]
                                .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
                                .map((o, i) => {
                                  const isFav = f.flight?.flight === o.flight;
                                  return (
                                    <div key={i} className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded ${isFav ? "bg-amber-50 border border-amber-200" : "bg-gray-50"}`}>
                                      <span className="min-w-0">
                                        <span className="font-medium">{o.carrier} {o.flight}</span>
                                        <span className="text-gray-500 ml-2">{o.depart}→{o.arrive}{o.arrivePlusDay ? "+1" : ""}</span>
                                        {isFav && <span className="ml-2 text-amber-700 font-medium">← 你收藏的</span>}
                                      </span>
                                      <span className="font-semibold text-teal-700 shrink-0">
                                        {o.price != null ? `$${o.price}` : "待查"}
                                      </span>
                                    </div>
                                  );
                                })}
                            </div>
                          ) : (
                            <p className="text-gray-400">暂无直飞数据（待实查）</p>
                          )}
                          {flightLeg.queriedAt && (
                            <p className="text-gray-400 mt-1">Google Flights 实查 · {flightLeg.queriedAt}</p>
                          )}
                        </div>
                      )}
                      {/* 2026-10-03 用户：酒店/餐厅/景点也在行动安排里就地展开看详情，不跳页 */}
                      {isOpen && f.type !== "flight" && detail && (
                        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600 space-y-1.5">
                          {(() => {
                            const d = detail as { meta?: string; detail?: string; best?: string };
                            return (<>
                              {d.detail && <p>{d.detail}</p>}
                              {d.meta && <p className="text-gray-500">{d.meta}</p>}
                              {d.best && <p className="text-teal-700">💡 {d.best}</p>}
                            </>);
                          })()}
                          {/* 2026-10-17 用户：酒店详情就在本页展开看全（房价明细/走势），不许再跳页 */}
                          {f.type === "hotel" && <HotelTrackDetail name={f.row.title} />}
                          <p className="text-gray-400">
                            <DetailLink
                              to={placeDetailPath(
                                f.type === "hotel" ? "hotel" : f.type === "restaurant" ? "restaurant" : "attraction",
                                f.city, f.row.title
                              )}
                              pageKey="bookings"
                              cardId={`booking-card-${f.row.id}`}
                              className="text-teal-700 hover:underline"
                            >
                              看完整详情页（含照片/评论）→
                            </DetailLink>
                          </p>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        );
      })}
    </div>
  );
}


/** 2026-10-03 用户：机票价格变动时间线——显示每次价格变化的发生时间 */
function FlightPriceTimeline({ route, date, flightNo, cabin, favPrice, livePrice }: {
  route: string; date: string; flightNo: string; cabin: string;
  favPrice: number; livePrice: number | null;
}) {
  const key = useMemo(
    () => (route && date && flightNo ? priceHistoryKey(route, date, flightNo, cabin) : ""),
    [route, date, flightNo, cabin]
  );
  const [history, setHistory] = useState<PriceSnapshot[]>([]);
  /* 每次看到实时价就记一笔 */
  useEffect(() => {
    if (!key || livePrice == null) return;
    setHistory(logPrice(key, livePrice));
  }, [key, livePrice]);
  /* 初次加载读历史 */
  useEffect(() => {
    if (key) setHistory(getHistory(key));
  }, [key]);

  if (!key) return null;
  /* 合并：收藏价作为起点（如果历史为空） */
  const points: { price: number; at: string; label: string }[] = [];
  points.push({ price: Math.round(favPrice), at: "", label: "收藏时" });
  history.forEach((s) => {
    points.push({ price: s.price, at: s.at, label: fmtSnapshotTime(s.at) });
  });
  /* 去重连续相同价格（保留首尾） */
  const dedup: typeof points = [];
  points.forEach((p) => {
    const last = dedup[dedup.length - 1];
    if (!last || last.price !== p.price) dedup.push(p);
  });

  return (
    <div className="mb-2 px-2 py-1.5 bg-blue-50 rounded">
      <p className="font-medium text-blue-900 mb-1">📈 价格时间线</p>
      <div className="space-y-0.5">
        {dedup.map((p, i) => {
          const prev = i > 0 ? dedup[i - 1] : null;
          const diff = prev ? p.price - prev.price : 0;
          const diffText = !prev ? "" : diff === 0 ? "" : diff > 0 ? ` (↑+$${diff})` : ` (↓-$${-diff})`;
          const diffCls = diff > 0 ? "text-red-600" : diff < 0 ? "text-green-600" : "text-blue-800";
          return (
            <p key={i} className={`text-xs ${diffCls}`}>
              <span className="text-gray-500">{p.label}</span>
              {" "}${p.price}{diffText}
            </p>
          );
        })}
        {livePrice == null && (
          <p className="text-xs text-gray-400">实时价待查</p>
        )}
      </div>
      {dedup.length <= 1 && (
        <p className="text-[11px] text-gray-400 mt-1">多看几次，价格变化会自动记在这里</p>
      )}
    </div>
  );
}


/** 收藏项的实时价格行：航班查航班库最新实查价（带涨跌），酒店查实查房价，餐厅/景点显示预订政策 */
/* ---------- 价格走势（2026-10-16 用户：每天都在查，为什么不画历史趋势） ----------
 * 数据来自 price_history 数据集：航班=历轮 Google Flights 批次按 (航段|日期|航班号|舱位) 汇成，
 * 酒店=历轮查价的基础房每晚价 / Google 基准价。点位粒度为自然日，≥2 点才画。 */
type PricePoint = [string, number];

interface PriceHistoryData {
  flights: Record<string, PricePoint[]>;
  hotels: Record<string, { baseline?: PricePoint[]; base?: PricePoint[] }>;
}

function priceHistory(): PriceHistoryData | null {
  return getDataset<PriceHistoryData>("price_history") ?? null;
}

function normHotelKey(s: string): string {
  return s.replace(/[一-鿿]+/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function PriceSpark({ points, caption }: { points: PricePoint[]; caption: string }) {
  if (points.length < 2) return null;
  const W = 132;
  const H = 30;
  const PAD = 3;
  const prices = points.map((p) => p[1]);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / (points.length - 1);
  const y = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2);
  const line = points.map((p, i) => `${x(i)},${y(p[1])}`).join(" ");
  const first = prices[0]!;
  const last = prices[prices.length - 1]!;
  const diff = last - first;
  const pct = first ? Math.round((diff / first) * 100) : 0;
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <svg width={W} height={H} className="shrink-0" aria-hidden="true">
        <polyline points={line} fill="none" stroke="#0f766e" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(points.length - 1)} cy={y(last)} r="2.6" fill="#0f766e" />
        <circle cx={x(prices.indexOf(min))} cy={y(min)} r="2.2" fill="#94a3b8" />
        <circle cx={x(prices.indexOf(max))} cy={y(max)} r="2.2" fill="#94a3b8" />
      </svg>
      <div className="text-[11px] leading-tight text-gray-500 min-w-0">
        <div>
          {caption}：最低 <span className="font-semibold text-gray-700">${Math.round(min)}</span> · 最高{" "}
          <span className="font-semibold text-gray-700">${Math.round(max)}</span>
          {diff !== 0 && (
            <span className={diff > 0 ? "text-red-600 font-medium" : "text-green-700 font-medium"}>
              {" "}· 期间{diff > 0 ? "▲" : "▼"} {Math.abs(pct)}%
            </span>
          )}
        </div>
        <div className="text-gray-400">
          {points[0]![0].slice(5)} 起共 {points.length} 次实查 · 最近 {points[points.length - 1]![0].slice(5)}
        </div>
      </div>
    </div>
  );
}

/** 酒店房型行（页内详情用）：房型名、每晚价、整段总价（含税口径）、取消、早餐、会员价、备注 */
function HotelRoomRow({ label, r, emptyNote }: { label: string; r: LiveRoomRate | null; emptyNote: string }) {
  return (
    <div>
      <p className="font-medium text-gray-700">{label}</p>
      {r ? (
        <>
          <p>
            {r.room} · <b>${r.perNightUSD}</b>/晚
            {r.totalUSD != null && (
              <>
                {" "}· 整段 <b>${r.totalUSD}</b>
                {r.totalInclTax === true ? "（含税）" : r.totalInclTax === false ? "（未含税）" : ""}
              </>
            )}
          </p>
          <p className="text-gray-500">取消：{r.cancel} · 早餐：{r.breakfast}</p>
          {r.memberDeal && <p className="text-teal-700">💳 会员价：{r.memberDeal}</p>}
          {r.note && <p className="text-gray-400">{r.note}</p>}
        </>
      ) : (
        <p className="text-gray-400">{emptyNote}</p>
      )}
    </div>
  );
}

/** 酒店详情页内展开（2026-10-17 用户：价格追踪里点「详情」要直接在本页看全，不许再跳详情页）。
 * 与酒店详情页「实时房价」同源同口径：基础房/套房逐项、Google 基准价（含整段总价）、
 * Amex/Chase 渠道价、历史走势折线。照片与评论仍从展开区底部的完整详情页链接看。 */
function HotelTrackDetail({ name }: { name: string }) {
  const live: LiveHotelPrice | undefined = getLiveHotelPrice(name);
  const series = priceHistory()?.hotels[normHotelKey(name)];
  const trendPts =
    series?.base && series.base.length >= 2
      ? series.base
      : series?.baseline && series.baseline.length >= 2
        ? series.baseline
        : null;
  if (!live) {
    const st = livePriceDatasetStatus();
    return (
      <div className="rounded-lg border border-gray-100 bg-white px-2.5 py-2 space-y-1.5">
        <p className="font-medium text-gray-700">🏨 实时房价</p>
        <p className="text-gray-400">
          {st === "ready" ? "暂无这家酒店的实时房价数据（每日监听会持续补）" : "实时房价加载中…"}
        </p>
        {trendPts && <PriceSpark points={trendPts} caption="历史价格走势（每晚）" />}
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-2.5 py-2 space-y-1.5">
      <p className="font-medium text-gray-700">
        🏨 实时房价 · {live.checkIn} → {live.checkOut}（{live.nights} 晚）
        {live.dateMismatch && <span className="ml-1 text-amber-600">行程改期前查的价，仅供参考</span>}
      </p>
      {live.unavailable ? (
        <p className="text-gray-500">{live.unavailable}</p>
      ) : (
        <>
          <HotelRoomRow label="基础房（最便宜可订）" r={live.base} emptyNote={live.baseNote ?? "该日期无可订基础房"} />
          <HotelRoomRow label="套房（最便宜可订）" r={live.suite} emptyNote={live.suiteNote ?? "该日期未找到可订套房"} />
        </>
      )}
      {live.baselineUSD != null && (
        <p className="text-gray-500">
          Google 基准价 <b className="text-gray-700">${live.baselineUSD}</b>/晚
          {live.baselineTotalUSD != null && (
            <>
              {" "}· 整段总价 <b className="text-gray-700">${live.baselineTotalUSD}</b>
            </>
          )}
          {live.baselineUrl && (
            <>
              {" "}·{" "}
              <a className="text-teal-700 hover:underline" href={live.baselineUrl} target="_blank" rel="noreferrer">
                去核对 ↗
              </a>
            </>
          )}
        </p>
      )}
      {(live.amexUSD != null || live.chaseUSD != null) && (
        <p className="text-gray-500">
          积分渠道：
          {live.amexUSD != null && <>Amex Travel ${live.amexUSD}/晚</>}
          {live.amexUSD != null && live.chaseUSD != null && " · "}
          {live.chaseUSD != null && <>Chase Travel ${live.chaseUSD}/晚</>}
        </p>
      )}
      {trendPts && <PriceSpark points={trendPts} caption="历史价格走势（每晚）" />}
      <p className="text-gray-400">
        {live.source} · 实查于{" "}
        {new Date(live.checkedAt).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}
      </p>
    </div>
  );
}

function FavoritePriceLine({ name, type, city, flight, segs }: { name: string; type: string; city: string; segs: PlanSegment[]; flight?: {
  carrier?: string; flight?: string; depart?: string; arrive?: string; arrivePlusDay?: boolean;
  price?: number; cabin?: string; route?: string; date?: string; priceBasis?: string; queriedAt?: string;
} }) {
  if (type === "flight") {
    // 2026-10-03：具体航班收藏从航班库实时重查，不再只显示收藏快照
    if (flight && flight.flight) {
      const leg = flight.route ? FLIGHT_LEGS.find((l) => l.route === flight.route) : undefined;
      const planDate = flight.route ? flightDateFromPlan(flight.route, segs) : null;
      const qDate = planDate || flight.date || "";
      const live = leg?.dbSeg && qDate ? liveFlightQuote(leg.dbSeg, qDate, flight.flight) : null;
      const dateMoved = !!(planDate && flight.date && planDate !== flight.date);
      const snapPrice = flight.price;
      const livePrice = live ? (flight.cabin === "biz" ? live.bizPrice : live.price) : null;
      const delta = livePrice != null && snapPrice != null ? Math.round(livePrice - snapPrice) : null;
      /* 历史走势：优先这班自己的序列，不够点时退本段最低价序列 */
      const spark = (() => {
        const hist = priceHistory();
        if (!hist || !leg?.dbSeg || !qDate) return null;
        const cabinKey = flight.cabin === "biz" ? "business" : "economy";
        const fnoKey = (flight.flight || "").replace(/\s+/g, "").toUpperCase();
        const own = hist.flights[`${leg.dbSeg}|${qDate}|${fnoKey}|${cabinKey}`];
        if (own && own.length >= 2) return <PriceSpark points={own} caption="这班的历史价" />;
        const segMin = hist.flights[`${leg.dbSeg}|${qDate}|*|${cabinKey}`];
        if (segMin && segMin.length >= 2) return <PriceSpark points={segMin} caption="本段最低价走势" />;
        return null;
      })();
      return (
        <div className="text-xs text-gray-600 mt-1">
          ✈️ <span className="font-semibold">{flight.carrier} {flight.flight}</span>
          <span className="text-gray-500"> {flight.depart}→{flight.arrive}{flight.arrivePlusDay?'+1':''}</span>
          {livePrice != null && live ? (
            <span> · <span className="font-semibold text-teal-700">${Math.round(livePrice)}</span>
              <span className="text-gray-400"> {flight.cabin==='biz'?'商务':'经济'} · 最新实查 {live.queriedAt}</span>
              {delta != null && delta !== 0 && snapPrice != null && (
                <span className={delta > 0 ? "text-red-600 font-medium" : "text-green-700 font-medium"}>
                  {" "}{delta > 0 ? "▲涨" : "▼降"}${Math.abs(delta)}（收藏时${snapPrice}）
                </span>
              )}
              {delta === 0 && <span className="text-gray-400"> · 与收藏时持平</span>}
            </span>
          ) : (
            <span>
              {snapPrice != null && <span> · <span className="font-semibold text-teal-700">${snapPrice}</span><span className="text-gray-400"> 收藏时价格</span></span>}
              {flight.queriedAt && <span className="text-gray-400"> · {flight.queriedAt}</span>}
            </span>
          )}
          {qDate && <span className="text-gray-400"> · {qDate}</span>}
          {dateMoved && livePrice == null && (
            <span className="text-amber-600">
              {" "}· {leg?.dbSeg && qDate && flightDbQueriedAt(leg.dbSeg, qDate)
                ? "新日期已实查，暂未见这班"
                : "行程已调，按新日期重查"}
            </span>
          )}
          <span className="text-gray-400"> · Google Flights</span>
          {spark}
        </div>
      );
    }
    // 旧版：整条航段收藏，按路线匹配（兼容旧数据）
    const leg = FLIGHT_LEGS.find((l) => l.route === name || name.includes(l.route) || l.route.includes(name));
    if (!leg) return <div className="text-xs text-gray-400 mt-1">💰 价格：航段信息待匹配</div>;
    const opts = leg.options ?? [];
    if (!opts.length) return <div className="text-xs text-gray-400 mt-1">💰 价格：待实查（{leg.date || "日期待定"}）</div>;
    const cheapest = opts.reduce((a, b) => (a.price ?? Infinity) < (b.price ?? Infinity) ? a : b);
    return (
      <div className="text-xs text-gray-600 mt-1">
        💰 <span className="font-semibold text-teal-700">${cheapest.price}</span>
        <span className="text-gray-400"> 起 · {cheapest.carrier || ""} · Google Flights 实查</span>
        {leg.queriedAt && <span className="text-gray-400"> · {leg.queriedAt}</span>}
      </div>
    );
  }
  if (type === "hotel") {
    // 酒店：用 getLiveHotelPrice 查实查房价；2026-10-03 用户要价格趋势：显示每晚+总价+实查时间
    // 2026-10-04 审计修复：套房专属酒店（base:null）用套房价展示，不再误显示"暂无实时价"
    const p = getLiveHotelPrice(name);
    const rate = liveDisplayRate(p);
    if (rate) {
      return (
        <div className="text-xs text-gray-600 mt-1">
          💰 <span className="font-semibold text-teal-700 text-sm">${rate.perNightUSD}/晚{p && !p.base ? "（套房）" : ""}</span>
          {rate.totalUSD != null && (
            <span className="text-gray-600"> · 共 <span className="font-semibold">${Math.round(rate.totalUSD)}</span>{p && p.nights ? `/${p.nights}晚` : ""}</span>
          )}
          <span className="text-gray-400"> · {p!.source}实查 {p!.checkedAt}</span>
          {p!.dateMismatch && <span className="text-amber-600"> ⚠️日期待重查</span>}
          <div className="text-gray-500 mt-0.5">
            🍳 {rate.breakfast}
            {rate.memberDeal && <span className="ml-2 text-amber-700 font-medium">🏷️ {rate.memberDeal}</span>}
          </div>
          {p!.baselineUSD != null && (
            <div className="text-gray-500 mt-0.5">
              📊 Baseline (Google Hotels): ${p!.baselineUSD}/晚（不含税）{p!.baselineTotalUSD != null && <span> · 整段共 ${p!.baselineTotalUSD}（Google 显示总价）</span>}
              <span className="text-gray-400" title="Google baseline 不含税，Trip.com 每晚价税费口径未明确，口径不一致时不直接计算差额"> · 口径不同，未算差价</span>
            </div>
          )}
          {(() => {
            const hist = priceHistory();
            const hk = hist?.hotels[normHotelKey(name)];
            if (!hk) return null;
            if (hk.base && hk.base.length >= 2) return <PriceSpark points={hk.base} caption="基础房每晚价走势" />;
            if (hk.baseline && hk.baseline.length >= 2) return <PriceSpark points={hk.baseline} caption="Google 基准价走势" />;
            return null;
          })()}
        </div>
      );
    }
    if (p && p.unavailable) return <div className="text-xs text-gray-400 mt-1">💰 该日期暂无可订房</div>;
    if (!p && livePriceDatasetStatus() === "error") return <div className="text-xs text-red-500 mt-1">💰 价格：加载失败，刷新页面会重新加载</div>;
    if (!p && livePriceDatasetStatus() !== "ready") return <div className="text-xs text-gray-400 mt-1">💰 价格：加载中…</div>;
    return <div className="text-xs text-gray-400 mt-1">💰 价格：暂无实时价</div>;
  }
  if (type === "restaurant") {
    // 餐厅：显示已研究的订位政策（必须明确区分"没查过"和"不需要预订"）
    const b = bookingPolicyBadge(name);
    const mg = mustGoBadge(name);
    return (
      <div className="text-xs text-gray-600 mt-1">
        📅 <span title={b.title} className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${b.cls}`}>{b.text}</span>
        {mg && <span title={mg.title} className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ml-1 ${mg.cls}`}>⭐{mg.text}</span>}
      </div>
    );
  }
  if (type === "attraction") {
    // 景点：需提前订票/报团的给明确提示
    if (MUST_BOOK_ATTRACTIONS.includes(name)) {
      const reason = MUST_BOOK_ATTRACTION_REASONS[name];
      return (
        <div className="text-xs text-gray-600 mt-1">
          🎫 <span className="font-medium text-amber-700">需提前订票/报团</span>
          {reason && <span className="text-gray-400"> · {reason}</span>}
        </div>
      );
    }
    return <div className="text-xs text-gray-400 mt-1">🎫 现场买票即可，不用提前订</div>;
  }
  return null;
}

/** 最终预定（2026-10-13 用户新增）：只放已经定下来的东西。
 * 数据铁律（2026-10-13 用户）：只读 DB 里已确认的预订记录（kind=booking 且 done），
 * 不许从任何代码常量拼数据——机票出票、酒店预订、餐厅订位都先进 DB 记录，再从 DB 反映到这里。
 * 点开任意一条看全部预订细节，确认号大字展示，方便直接给对方出示核对。 */
/** 最终预定日历（2026-10-13 用户第二轮要求）：与行程安排的日历同风格同口径——
 * 全行程逐日标注当晚住宿城市（只读云端规划存好的 plan.timeline，不再本地推导）、转场日标 ✈️/🚄
 * 与方式（按大行程 legModes）、过夜航班标「🌙 飞机上过夜」；预订层只认 DB 已确认记录：
 * 酒店已订/未订明确区分（有确认酒店记录覆盖的夜=已订），航班已出票/餐厅已订逐日标出。 */
function BookingsCalendar() {
  const { rows } = useRecordsData(["booking"]);
  const [plan, setPlan] = useState<PlannerPlan | null>(null);
  const [selDay, setSelDay] = useState<string | null>(null);
  const dsVersion = useDatasetsVersion();

  /* 行程层（每天在哪座城市、当晚睡哪、转场方式）来自云端规划，与行程安排同一套口径 */
  useEffect(() => {
    let alive = true;
    loadPlannerPlan()
      .then((l) => { if (alive && l?.plan) { applyPlanTimeline(l.plan); setPlan(l.plan); } })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  interface CalEvent { kind: "hotel" | "flight" | "restaurant" | "attraction" | "other"; title: string; sub: string }

  const model = useMemo(() => {
    const parse = (s?: string) => {
      if (!s) return null;
      const m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
      return m ? { y: +m[1], mo: +m[2], d: +m[3] } : null;
    };
    const keyOf = (y: number, mo: number, d: number) =>
      `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const add = (key: string, n: number) => {
      const p = parse(key)!;
      const dt = new Date(p.y, p.mo - 1, p.d + n);
      return keyOf(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
    };

    /* ---------- 预订层：DB 已确认记录 ---------- */
    const ev = new Map<string, CalEvent[]>();
    const nights = new Set<string>();
    const push = (k: string, e: CalEvent) => {
      if (!ev.has(k)) ev.set(k, []);
      ev.get(k)!.push(e);
    };
    for (const r of rows) {
      if (!r.done) continue;
      const data = parseBookingBody(r.body);
      const start = parse(data.date);
      if (!start) continue;
      const sub = [data.time ?? "", data.guests ?? "", data.code ? `确认号 ${data.code}` : ""].filter(Boolean).join(" · ");
      if (data.bkind === "hotel") {
        const end = parse(data.dateEnd);
        const last = end ? add(keyOf(end.y, end.mo, end.d), -1) : keyOf(start.y, start.mo, start.d);
        let k = keyOf(start.y, start.mo, start.d);
        let guard = 0;
        while (k <= last && guard++ < 62) {
          nights.add(k);
          push(k, { kind: "hotel", title: r.title, sub: sub || "住宿" });
          k = add(k, 1);
        }
      } else if (data.bkind === "transport") {
        push(keyOf(start.y, start.mo, start.d), { kind: "flight", title: r.title, sub });
      } else if (data.bkind === "restaurant") {
        push(keyOf(start.y, start.mo, start.d), { kind: "restaurant", title: r.title, sub });
      } else if (data.bkind === "attraction") {
        push(keyOf(start.y, start.mo, start.d), { kind: "attraction", title: r.title, sub });
      } else {
        push(keyOf(start.y, start.mo, start.d), { kind: "other", title: r.title, sub });
      }
    }

    /* ---------- 行程层：只读云端规划存好的 plan.timeline（2026-10-16 审计修复） ----------
       此前本日历自己从硬编码 "2026-11-29" 起、按段天数重推 ranges/coupleRows（还带
       fbDays 兜底值），违反 plannerSchedule 明文的单一事实源规则：出发日/段天数一变
       就会静默漂移。现在逐日归属、段色、转场腿全部直接读 timeline.days / timeline.legs；
       旧规划没存 timeline 时，用全站唯一的 buildPlanTimeline 现算一份，不本地另推。 */
    const dayCity = new Map<string, string>();
    const splitDays = new Set<string>();
    const hotelNeedByDay = new Map<string, boolean>();
    /* 逐腿模型（2026-10-13 用户，与行程安排检查日历同口径）：同一天可以有两条腿，
       每条腿单独记 label/方式/是否过夜，不再一天只记一条、更不许漏腿 */
    interface CalLeg { label: string; mode: "flight" | "rail"; overnight: boolean }
    const transfers = new Map<string, CalLeg[]>();
    const pushLeg = (date: string, leg: CalLeg) => {
      const a = transfers.get(date) ?? [];
      a.push(leg);
      transfers.set(date, a);
    };
    const plane = new Set<string>();
    /* 每日期属哪一段（格子顶边段色，与行程规划检查日历 segColor 同口径；timeline.seg 原样） */
    const segOf = new Map<string, string>();
    let tripStart = "";
    let tripEnd = "";
    if (plan) {
      const tl = plan.timeline ?? buildPlanTimeline(plan);
      const dayKeys = Object.keys(tl.days).sort();
      for (const k of dayKeys) {
        const d = tl.days[k]!;
        dayCity.set(k, d.cities.join("/"));
        segOf.set(k, d.seg);
        if (d.seg === "split") splitDays.add(k);
      }
      /* 每晚是否需要订酒店（大行程里的每城开关）：分开日两城任一需要订就算需要 */
      for (const k of dayKeys) {
        const d = tl.days[k]!;
        hotelNeedByDay.set(k, d.cities.some((c) => cityNeedOf(plan, c).hotel));
      }
      /* 🌙 过夜判定 —— 与行程安排同口径（2026-10-13 用户定「按推荐航班判定」）：
         推荐航班（排序：不过夜→上午出发→越早越优先→越便宜）过夜
         （起飞+时长跨午夜或时长≥8 小时）→ 那一晚在飞机上；
         推荐航班凌晨 00:00–05:00 出发（红眼）→ 占出发日前一晚。
         逐腿版：返回 { overnight, redeye } 供 regLeg 逐腿登记；
         null = 航班库暂无该腿数据（格子照常显示这条腿，只是不标过夜状态）。 */
      const fdb = getDataset<{ segments: Record<string, { days?: Record<string, { nonstop_flights?: { dep: string; duration: string; price_usd?: number | null }[] }> }> }>("flight_db");
      const tparse = (t: string) => {
        const m = t.match(/(\d{1,2}):(\d{2})/);
        if (!m) return null;
        let h = +m[1];
        const ap = t.match(/(AM|PM)/i);
        if (ap) { const pm = /pm/i.test(ap[1]); if (pm && h < 12) h += 12; if (!pm && h === 12) h = 0; }
        return h * 60 + +m[2];
      };
      const checkLeg = (code: string, date: string, mode: "flight" | "rail"): { overnight: boolean; redeye: boolean } | null => {
        if (mode === "rail") return null;
        const nfs = fdb?.segments?.[code]?.days?.[date]?.nonstop_flights ?? [];
        if (!nfs.length) return null;
        const cand = nfs.map((f) => {
          const dep = tparse(f.dep);
          const dm = f.duration.match(/(\d+)\s*h(?:r)?\s*(?:(\d+)\s*m)?/i);
          if (dep == null || !dm) return null;
          return { dep, dur: +dm[1] * 60 + (dm[2] ? +dm[2] : 0), price: f.price_usd ?? Number.MAX_SAFE_INTEGER };
        }).filter((x): x is { dep: number; dur: number; price: number } => x != null);
        if (!cand.length) return null;
        cand.sort((a, b) => {
          const onA = a.dep + a.dur >= 1440 || a.dur >= 480 ? 1 : 0;
          const onB = b.dep + b.dur >= 1440 || b.dur >= 480 ? 1 : 0;
          const moA = a.dep >= 360 && a.dep < 720 ? 0 : 1;
          const moB = b.dep >= 360 && b.dep < 720 ? 0 : 1;
          return onA - onB || moA - moB || a.dep - b.dep || a.price - b.price;
        });
        const rec = cand[0]!;
        return { overnight: rec.dep + rec.dur >= 1440 || rec.dur >= 480, redeye: rec.dep < 300 };
      };
      /* 逐腿登记（2026-10-13 用户）：一天多腿各自登记、各自判定过夜；
         红眼腿（凌晨出发、本身不过夜）登记在前一天——那一晚人在飞机上，
         与行程安排 calDayLegs 同规则 */
      const regLeg = (label: string, code: string, date: string, mode: "flight" | "rail") => {
        if (mode === "rail") { pushLeg(date, { label, mode: "rail", overnight: false }); return; }
        const r = checkLeg(code, date, mode);
        if (r?.redeye && !r.overnight) pushLeg(add(date, -1), { label, mode: "flight", overnight: true });
        else pushLeg(date, { label, mode: "flight", overnight: !!r?.overnight });
      };
      /* 转场方式：timeline.legs 的 kind 是保存规划时的缺省（北京→西安汇合腿已是 rail）；
         用户在大行程里改选的 legModes 按「某段之后的转场」覆盖（与 planner 日历 lm() 同口径） */
      const modeOf = (leg: (typeof tl.legs)[number]): "flight" | "rail" => {
        if (leg.kind === "rail") return "rail";
        let after: string | null = null;
        if (leg.id === "intl-out-bj" || leg.id === "intl-out") after = "beijing1";
        else if (leg.id.startsWith("sin-")) after = "singapore";
        else if (leg.id === "xiy-icn") after = "split";
        const v = after ? plan.legModes?.[after] : undefined;
        /* 没有高铁的城市对不许被存量 legModes 带成高铁（2026-10-16 用户） */
        return v === "rail" && railFeasiblePair(leg.fromCity, leg.toCity) ? "rail" : "flight";
      };
      const coupleCities = new Set(
        dayKeys.filter((k) => tl.days[k]!.seg === "couple").flatMap((k) => tl.days[k]!.cities),
      );
      for (const leg of tl.legs) {
        let label = `${leg.fromCity}→${leg.toCity}`;
        /* 分开行动的两条腿按人标注（与旧日历文案一致）：曼谷→西安是老婆一人、曼谷→北京是你一人 */
        if (leg.toCity === "西安" && coupleCities.has(leg.fromCity)) label += "（老婆一人）";
        if (leg.toCity === "北京" && coupleCities.has(leg.fromCity)) label += "（你）";
        if (leg.id === "sea-pek") {
          /* 出行日不在 timeline 逐日表里（逐日表从北京第一段起）：格子主标写路线、不需要订酒店 */
          dayCity.set(leg.date, label);
          segOf.set(leg.date, "outbound");
          hotelNeedByDay.set(leg.date, false);
        }
        regLeg(label, `${leg.from}-${leg.to}`, leg.date, modeOf(leg));
      }
      /* plane 派生：当天全部航班腿都过夜、且当天没有高铁腿 → 主标「🌙 飞机上过夜」 */
      for (const [date, legs] of transfers) {
        const fl = legs.filter((l) => l.mode === "flight");
        if (fl.length && fl.every((l) => l.overnight) && !legs.some((l) => l.mode === "rail")) plane.add(date);
      }
      const allDayKeys = [...dayCity.keys()].sort();
      tripStart = allDayKeys[0] ?? "";
      tripEnd = allDayKeys[allDayKeys.length - 1] ?? "";
    }

    /* ---------- 渲染范围：行程全程 ∪ 预订日期 ---------- */
    const allKeys = [...new Set([...dayCity.keys(), ...ev.keys()])].sort();
    const months: { y: number; mo: number }[] = [];
    if (allKeys.length) {
      const f = parse(tripStart || allKeys[0])!;
      const l = parse(tripEnd || allKeys[allKeys.length - 1])!;
      let y = f.y;
      let mo = f.mo;
      let g = 0;
      while ((y < l.y || (y === l.y && mo <= l.mo)) && g++ < 6) {
        months.push({ y, mo });
        mo += 1;
        if (mo > 12) { mo = 1; y += 1; }
      }
    }
    return { ev, nights, dayCity, splitDays, hotelNeedByDay, transfers, plane, months, segOf, rangeStart: tripStart || allKeys[0] || "", rangeEnd: tripEnd || allKeys[allKeys.length - 1] || "" };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, plan, dsVersion]);

  const { ev: events, nights: hotelNights, dayCity, splitDays, hotelNeedByDay, transfers, plane: planeNights, months, segOf, rangeStart, rangeEnd } = model;
  const addDayStr = (key: string, n: number) => {
    const [yy, mm, dd] = key.split("-").map(Number);
    const dt = new Date(yy!, mm! - 1, dd! + n);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  };
  if (!months.length) return null;

  const kindMeta: Record<CalEvent["kind"], { icon: string; dot: string }> = {
    hotel: { icon: "🏨", dot: "bg-teal-600" },
    flight: { icon: "✈️", dot: "bg-indigo-600" },
    restaurant: { icon: "🍽️", dot: "bg-amber-600" },
    attraction: { icon: "🏛️", dot: "bg-sky-600" },
    other: { icon: "📌", dot: "bg-gray-500" },
  };
  const todayKey = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  })();
  const selEvents = selDay ? events.get(selDay) ?? [] : [];
  const selCity = selDay ? dayCity.get(selDay) : undefined;
  const selSplit = selDay ? splitDays.has(selDay) : false;
  const selPlane = selDay ? planeNights.has(selDay) : false;
  const selTransfer = selDay ? transfers.get(selDay) : undefined;
  const selHotelBooked = selDay ? hotelNights.has(selDay) : false;
  const selHotelNeed = selDay ? hotelNeedByDay.get(selDay) !== false : true;

  return (
    <div className="bg-white border border-[#e5e1d6] rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-900">📅 预定日历</h3>
        <span className="text-[11px] text-gray-400">点任意一天看当天明细</span>
      </div>
      <p className="text-[11px] text-gray-400 mb-2">和行程安排同一套口径：每格城市 = 当晚住在哪；转场方式按大行程里选的飞机/高铁显示；在大行程里关掉「订酒店」的城市（比如住家里的北京/西安），这里不再标未订酒店。分开行动的日子标「北京/西安」。</p>
      <div className="flex gap-3 flex-wrap text-[11px] text-gray-500 mb-2">
        <span className="text-teal-800 font-medium">🏨 已订酒店</span>
        <span className="text-amber-600 font-medium">🏨 未订酒店</span>
        <span>🌙 飞机上过夜</span>
        <span>✈️ 飞机转场</span>
        <span>🚄 高铁转场</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-amber-600 mr-1" />餐厅已订</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mr-1" />航班已出票</span>
      </div>
      {/* 2026-10-13 样式统一（用户第二次要求）：与行程规划检查日历同款连续网格——
          单个网格跨全部月份、星期头只一行、格子带段色顶边；不再逐月分块 */}
      {(() => {
        const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
        const [fy, fmo] = rangeStart.split("-").map(Number);
        const [ly, lmo] = rangeEnd.split("-").map(Number);
        const rangeHead = fy === ly ? `${fy}年${monthNames[fmo! - 1]} – ${monthNames[lmo! - 1]}` : `${fy}年${monthNames[fmo! - 1]} – ${ly}年${monthNames[lmo! - 1]}`;
        const dowOf = (k: string) => (new Date(k + "T12:00:00Z").getUTCDay() + 6) % 7;
        const gridStart = addDayStr(rangeStart, -dowOf(rangeStart));
        const gridEnd = addDayStr(rangeEnd, 6 - dowOf(rangeEnd));
        const segColor: Record<string, string> = { beijing1: "#3b82f6", singapore: "#22c55e", couple: "#f59e0b", split: "#8b5cf6", seoul: "#ec4899", outbound: "#0ea5e9" };
        const cells: string[] = [];
        for (let k = gridStart; k <= gridEnd; k = addDayStr(k, 1)) cells.push(k);
        return (
          <div className="wz-calmonth">
            <h4>{rangeHead}</h4>
            <div className="wz-calgrid">
              {["一", "二", "三", "四", "五", "六", "日"].map((w) => (
                <div key={w} className="wz-calwd">{w}</div>
              ))}
              {cells.map((k) => {
                const dom = Number(k.slice(8));
                const mo2 = Number(k.slice(5, 7));
                const dateNum = dom === 1 ? `${mo2}/${dom}` : `${dom}`;
                const city = dayCity.get(k);
                const isPlane = planeNights.has(k);
                const tr = transfers.get(k);
                const dayEvents = events.get(k) ?? [];
                if (city == null && dayEvents.length === 0 && !tr) {
                  return (
                    <div key={k} className="wz-calday off">
                      <span className="wz-caldate">{dateNum}</span>
                    </div>
                  );
                }
                const booked = hotelNights.has(k);
                const isSel = selDay === k;
                const nonHotel = dayEvents.filter((e) => e.kind !== "hotel");
                const prevCity = dayCity.get(addDayStr(k, -1));
                return (
                  <button key={k} onClick={() => setSelDay(isSel ? null : k)} className={`wz-calday${isSel ? " sel" : ""}`} style={{ borderTop: `3px solid ${segColor[segOf.get(k) ?? ""] ?? "#94a3b8"}` }}>
                    <span className="wz-caldate">{dateNum}</span>
                    {city != null && <span className="wz-calcity">{isPlane ? "🌙 飞机上过夜" : city}</span>}
                    {isPlane && city != null && <span className="wz-calnote">白天在{city}</span>}
                    {tr && tr.map((l, li) => l.mode === "rail" ? (
                      <span key={li} className="wz-calleg rail">🚄 {l.label}</span>
                    ) : (
                      <span key={li} className="wz-calleg">✈️ {l.label} <em className={l.overnight ? "on" : ""}>{l.overnight ? "🌙 飞机上过夜" : "落地过夜"}</em></span>
                    ))}
                    {city != null && !isPlane && (booked || hotelNeedByDay.get(k) !== false) && (
                      <span className="wz-calleg" style={{ color: booked ? "#0f766e" : "#d97706", fontWeight: 600 }}>{booked ? "🏨 已订酒店" : "🏨 未订酒店"}</span>
                    )}
                    {nonHotel.length > 0 && (
                      <span className="wz-calleg" style={{ color: "#64748b" }}>{nonHotel.map((e) => kindMeta[e.kind].icon).join(" ")} {nonHotel[0]!.title}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}
      {selDay && (
        <div className="mt-2 rounded-lg bg-[#f7f4ee] border border-[#e5e1d6] px-3 py-2">
          <div className="text-xs font-bold text-gray-700 mb-1">
            {selDay}
            {selCity ? ` · ${selPlane ? `🌙 当晚睡在飞机上（白天在${selCity}）` : selSplit ? "当晚住：北京（你）/ 西安（老婆+Dylan）· 分开行动" : `当晚住：${selCity}`}` : ""}
          </div>
          {selTransfer && selTransfer.map((l, li) => (
            <p key={li} className="text-xs text-gray-600">
              {l.mode === "rail"
                ? `🚄 转场：${l.label}（高铁）`
                : `✈️ 转场：${l.label}（飞机）· ${l.overnight ? "🌙 这班要在飞机上过夜" : "落地过夜，不用睡飞机"}`}
            </p>
          ))}
          {selCity && !selPlane && (
            <p className="text-xs text-gray-600">
              {selHotelBooked
                ? "🏨 酒店：已订"
                : selHotelNeed
                  ? "🏨 酒店：还没订"
                  : "🏠 酒店：这个城市在大行程里设了不用订酒店（住家里）"}
            </p>
          )}
          {selEvents.length === 0 ? (
            <p className="text-xs text-gray-400">这天没有已确认的预定</p>
          ) : (
            <ul className="space-y-1 mt-1">
              {selEvents.map((e, i) => (
                <li key={i} className="text-xs text-gray-700">
                  {kindMeta[e.kind].icon} <span className="font-medium">{e.title}</span>
                  {e.sub && <span className="text-gray-400"> · {e.sub}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}


function FinalBookingsList({ onEdit }: { onEdit: (id: number) => void }) {
  const { rows, loading } = useRecordsData(["booking"]);
  const [openKey, setOpenKey] = useState<string | null>(null);

  interface FinalItem {
    key: string;
    kindLabel: string;
    badgeCls: string;
    title: string;
    sortDate: string;
    headLine: string;
    code?: string;
    lines: { label: string; value: string }[];
    recordId?: number;
  }

  const items: FinalItem[] = [];
  const confirmed = rows
    .filter((r) => r.done)
    .map((r) => ({ row: r, data: parseBookingBody(r.body) }));
  for (const { row, data } of confirmed) {
    const fl = BOOKING_FIELD_LABEL[data.bkind];
    const lines: { label: string; value: string }[] = [];
    if (data.city) lines.push({ label: "城市", value: data.city });
    if (data.date)
      lines.push({
        label: fl.date,
        value: data.dateEnd ? `${data.date} → ${data.dateEnd}` : data.date,
      });
    if (data.time)
      lines.push({ label: "时间", value: data.timeEnd ? `${data.time} – ${data.timeEnd}` : data.time });
    if (data.guests) lines.push({ label: fl.guests ?? "数量", value: data.guests });
    if (data.extra) lines.push({ label: fl.extra ?? "补充信息", value: data.extra });
    if (data.note) lines.push({ label: "备注", value: data.note });
    const head = [
      data.city,
      data.date ? (data.dateEnd ? `${data.date} → ${data.dateEnd}` : data.date) : "",
      data.time ?? "",
      data.guests ?? "",
    ]
      .filter(Boolean)
      .join(" · ");
    items.push({
      key: `rec-${row.id}`,
      kindLabel: BOOKING_KIND_LABEL[data.bkind],
      badgeCls: kindBadge[data.bkind],
      title: row.title,
      sortDate: data.date ?? "9999",
      headLine: head,
      code: data.code,
      lines,
      recordId: row.id,
    });
  }
  items.sort((a, b) => a.sortDate.localeCompare(b.sortDate));

  return (
    <div className="mb-6">
      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-gray-900">✅ 最终预定</h3>
          <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
            {items.length} 项已确认
          </span>
        </div>
        <p className="text-xs text-gray-500">
          已经买好/订好的全在这里：机票、酒店、餐厅。点开任意一条看全部预订细节，确认号大字显示，可以直接给对方出示核对
        </p>
      </div>

      {loading && <p className="text-sm text-gray-400 mb-4">正在同步预订记录…</p>}
      {!loading && !items.length && (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">还没有最终预定</p>
          <p className="text-xs text-gray-400 mt-1">
            在「🔍 预定筛选」里订好后加入预订并标为已确认，或机票出票后，会自动出现在这里
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        {items.map((it) => {
          const isOpen = openKey === it.key;
          return (
            <div
              key={it.key}
              className={`bg-white rounded-xl border-2 px-4 py-3 ${
                isOpen ? "border-emerald-500" : "border-emerald-200"
              }`}
            >
              <button
                className="w-full text-left"
                onClick={() => setOpenKey(isOpen ? null : it.key)}
                aria-expanded={isOpen}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${it.badgeCls}`}>
                        {it.kindLabel}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{it.title}</span>
                    </div>
                    {it.headLine && (
                      <div className="text-xs text-gray-600 mt-1">📅 {it.headLine}</div>
                    )}
                    {it.code && (
                      <div className="text-xs text-gray-600 mt-0.5">
                        确认号 <span className="font-bold text-emerald-700 tracking-wider">{it.code}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-500 shrink-0 pt-0.5">
                    {isOpen ? "▴ 收起" : "▾ 详情"}
                  </span>
                </div>
              </button>
              {isOpen && (
                <div className="mt-3 pt-3 border-t border-emerald-100">
                  {it.code && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-3 text-center">
                      <div className="text-[11px] text-emerald-700 font-medium">确认号 Confirmation Code</div>
                      <div className="text-2xl font-bold tracking-[0.2em] text-emerald-900 mt-0.5">
                        {it.code}
                      </div>
                    </div>
                  )}
                  <dl className="space-y-1.5">
                    {it.lines.map((ln, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <dt className="text-gray-400 shrink-0 w-20">{ln.label}</dt>
                        <dd className="text-gray-800 font-medium break-words min-w-0">{ln.value}</dd>
                      </div>
                    ))}
                  </dl>
                  {it.recordId != null && (
                    <div className="mt-3">
                      <button
                        onClick={() => onEdit(it.recordId!)}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200"
                      >
                        ✏️ 编辑这条预订
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookingsInner() {
  // 2026-10-03 用户：所有跳详情页的入口返回时恢复原卡片位置
  useDetailReturn("bookings");
  // 2026-10-04 用户：浏览tab地图联动（切城市/点卡片时地图高亮）
  const [hotelCity, setHotelCity] = useState<string|null>(null);
  const [hotelSel, setHotelSel] = useState<string|null>(null);
  const [hotelExpandSig, setHotelExpandSig] = useState(0);
  const [restCity, setRestCity] = useState<string|null>(null);
  const [restSel, setRestSel] = useState<string|null>(null);
  const [restExpandSig, setRestExpandSig] = useState(0);
  const [attrCity, setAttrCity] = useState<string|null>(null);
  const [attrSel, setAttrSel] = useState<string|null>(null);
  const [attrExpandSig, setAttrExpandSig] = useState(0);
  const { rows, loading, loadError, save, del, syncMode } =
    useRecordsData(["booking"]);
  /* 一级菜单「价格追踪」的数量徽标：与 FavoriteActionList 同口径（四类收藏） */
  const { rows: favRows } = useRecordsData(["favorite"]);
  const favCount = useMemo(
    () =>
      favRows.filter((r) => {
        try {
          const t = (JSON.parse(r.body) as { type?: string }).type ?? "attraction";
          return ["hotel", "flight", "restaurant", "attraction"].includes(t);
        } catch {
          return true;
        }
      }).length,
    [favRows]
  );
  /* 2026-10-03 用户：二级菜单像行程页日期导航一样吸顶固定，随时可切换；
   * 2026-10-04 用户：二级菜单被地图盖住、城市 tab 压在地图上——三层吸顶必须错开：
   * 顶栏(0~headerH) → 二级菜单(headerH) → 地图(headerH+navH) → 城市tab(headerH+navH+地图高)。
   * 地图高度经 onHeightChange 实时上报，城市 tab 的 --citytabs-top 跟着变。 */
  const [searchParams] = useSearchParams();
  /* 2026-10-13 用户：菜单改三级结构——一级只有三个：🔍 预定筛选 / 📈 价格追踪 / ✅ 最终预定；
   * 预定筛选里再分 酒店/机票/餐厅/景点（二级），每类再分城市（三级）。
   * 旧 ?menu=hotels|flights|restaurants|attractions → 预定筛选+对应类别；?menu=action → 价格追踪；?menu=final → 最终预定 */
  type SectionKey = "screen" | "track" | "final";
  type CatKey = "hotels" | "flights" | "restaurants" | "attractions";
  const [section, setSection] = useState<SectionKey>(() => {
    const m = searchParams.get("menu");
    if (m === "final") return "final";
    if (m === "action" || m === "track") return "track";
    return "screen";
  });
  const [cat, setCat] = useState<CatKey>(() => {
    const m = searchParams.get("menu");
    if (m === "flights" || m === "restaurants" || m === "attractions") return m;
    if (m === "details") return searchParams.get("view") === "restaurants" ? "restaurants" : "hotels";
    return "hotels";
  });
  const stickyContainerRef = useRef<HTMLDivElement>(null);
  // 2026-10-04: 用 ResizeObserver 实时跟踪站点头高度，吸顶 top 永远准确，一次根治 gap
  useEffect(() => {
    const setTop = () => {
      const header = document.querySelector('header');
      const h = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
      document.documentElement.style.setProperty('--sticky-top', `${h}px`);
    };
    setTop();
    const header = document.querySelector('header');
    let ro: ResizeObserver | null = null;
    if (header && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(setTop);
      ro.observe(header);
    }
    window.addEventListener('resize', setTop);
    // 字体加载后高度可能变化，延迟再校准一次
    const t = window.setTimeout(setTop, 1000);
    return () => {
      window.removeEventListener('resize', setTop);
      window.clearTimeout(t);
      ro?.disconnect();
    };
  }, []);
  const [mapStickyTop, setMapStickyTop] = useState<number | undefined>(undefined);
  const mapHeightsRef = useRef<Record<string, number>>({});
  /* 2026-10-13 用户：地图必须能置顶在菜单体系之下——地图 sticky top = 站点顶栏 + 本页吸顶菜单
     （当前可见的层级行）总高；目录内的城市页签再钉在置顶地图之下（--citytabs-top = 两者 + 当前地图高）。
     旧「地图不吸顶滚走」口径（2026-10-04）作废。 */
  const syncCityTabsTop = (menuKey: string) => {
    const header = document.querySelector("header.sticky");
    const headerH = header ? Math.round(header.getBoundingClientRect().height) : 0;
    const cont = stickyContainerRef.current;
    const menuH = cont ? Math.round(cont.getBoundingClientRect().height) : 0;
    const top = headerH + menuH;
    setMapStickyTop(top);
    const mapH = mapHeightsRef.current[menuKey] ?? 0;
    document.documentElement.style.setProperty("--citytabs-top", `${top + mapH}px`);
  };
  useLayoutEffect(() => {
    const sync = () => syncCityTabsTop(cat);
    sync();
    const ro = new ResizeObserver(sync);
    const header = document.querySelector("header.sticky");
    if (header) ro.observe(header);
    if (stickyContainerRef.current) ro.observe(stickyContainerRef.current);
    window.addEventListener("resize", sync);
    const t = window.setTimeout(sync, 800);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, cat]);
  /** 地图高度变化 → 更新城市 tab 的吸顶位置（2026-10-04 修 tab 压地图） */
  const onMapHeight = (key: string) => (h: number) => {
    mapHeightsRef.current[key] = h;
    syncCityTabsTop(key);
  };
  const [filter, setFilter] = useState<Filter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preset, setPreset] = useState<BookingPreset | null>(null);
  /** 二次确认删除：用站内按钮代替 window.confirm（原生弹窗在自动化/部分移动端会被吞掉） */
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  /* 2026-10-03 用户：切换菜单时回到顶端，滚动位置不在不同 tab 间继承 */
  const switchSection = (s: SectionKey) => {
    setSection(s);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };
  const switchCat = (c: CatKey) => {
    setCat(c);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };
  /** 每日动态横幅的跳转（旧菜单键 → 新三级结构）：action=价格追踪，其余=预定筛选对应类别 */
  const goToMenu = (m: "action" | "hotels" | "restaurants" | "flights") => {
    if (m === "action") {
      switchSection("track");
    } else {
      setSection("screen");
      setCat(m);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  };
  /** 行程规划里定好的城市+日期：预订页只看这些（机票看定好的时间，酒店/餐厅看定好的城市和日期） */
  const { segments } = usePlanScope();
  /* 2026-10-03 用户：国内城市（北京/西安）不用管，预订页只看国外城市。大行程固定国外城市：新加坡/首尔 + 向导里的东南亚城市 */
  const planCities = useMemo(() => {
    const wizardCities = segments.map((s) => s.city);
    const bigTripCities = ["新加坡", "首尔"];
    const all = [...bigTripCities];
    for (const c of wizardCities) {
      if (!all.includes(c)) all.push(c);
    }
    return all;
  }, [segments]);
  /* 每城预订需求开关（2026-10-13 用户：在大行程里逐城设置）：关掉订酒店的城市不进酒店筛选，
     关掉订餐厅的城市不进餐厅筛选——预订页不再为这些城市安排待订信息。 */
  const [planState, setPlanState] = useState<PlannerPlan | null>(null);
  useEffect(() => {
    let alive = true;
    loadPlannerPlan()
      .then((l) => { if (alive && l?.plan) { applyPlanTimeline(l.plan); setPlanState(l.plan); } })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  const hotelCities = useMemo(
    () => planCities.filter((c) => cityNeedOf(planState, c).hotel),
    [planCities, planState],
  );
  const restCities = useMemo(
    () => planCities.filter((c) => cityNeedOf(planState, c).restaurant),
    [planCities, planState],
  );
  const catCities = cat === "hotels" ? hotelCities : cat === "restaurants" ? restCities : planCities;
  const stayDates = useMemo(() => {
    const m: Record<string, string> = {};
    segments.forEach((s) => {
      m[s.city] = `${planDateShort(s.start)}–${planDateShort(s.end)}`;
    });
    return m;
  }, [segments]);
  const scoped = segments.length > 0;
  // 2026-10-04：items 用 useMemo 稳定引用，避免每次选卡 re-render 都触发地图 markers effect 的 fitBounds
  //（之前 Capella 点卡时 fitBounds 和 setView 打架，地图闪回高空）
  const hotelMapItems = useMemo(() => buildCandidateItems(scoped ? hotelCities : [])
    .filter((i) => (i.kind === "hotel" || i.kind === "attraction") && i.city === (hotelCity || hotelCities[0]))
    .map((i) => ({ ...i, candidate: false })), [scoped, hotelCities, hotelCity]);
  const restMapItems = useMemo(() => buildCandidateItems(scoped ? restCities : [])
    .filter((i) => (i.kind === "restaurant" || i.kind === "attraction") && i.city === (restCity || restCities[0]))
    .map((i) => ({ ...i, candidate: false })), [scoped, restCities, restCity]);
  const attrMapItems = useMemo(() => buildCandidateItems(scoped ? planCities : [])
    .filter((i) => i.kind === "attraction" && i.city === (attrCity || planCities[0]))
    .map((i) => ({ ...i, candidate: false })), [scoped, planCities, attrCity]);
  /** 各城酒店住宿段（入住=到达当天，退房=转场航班当天），行动安排页酒店收藏展示用
   * 2026-10-05 修：用完整大行程链，否则最后一段（曼谷）退房取不到转场日，会少算一天；
   * 链模型随 2026-10-13 改版更新：北京1→新加坡→东南亚→分开行动（西安‖北京并列）→首尔
   * （旧串联「西安→北京3」已废除，buildFullTripSegments 已按分开行动模型输出） */
  const fullSegments = useFullTripSegments();
  const stays = useMemo(
    () => hotelStaysFromPlan(fullSegments.map((s) => ({ city: s.city, start: s.start, end: s.end, days: s.days }))),
    [fullSegments]
  );
  /* 行动队列查航班实时价用的完整大行程链（与 FavoriteActionList 的 flightSegs 同口径） */
  const flightSegsQ: PlanSegment[] = useMemo(
    () => fullSegments.map((s) => ({ city: s.city, start: s.start, end: s.end, days: s.days, segId: s.segId })),
    [fullSegments]
  );
  /* 行动队列的直达跳转：去价格追踪某张收藏卡 / 去最终预定 / 去预定筛选某类别某城 */
  const goTrackCard = (id: number) => {
    switchSection("track");
    window.setTimeout(() => {
      document.getElementById(`booking-card-${id}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 300);
  };
  const goScreen = (c: CatKey, city?: string) => {
    setSection("screen");
    setCat(c);
    if (city) {
      if (c === "hotels") setHotelCity(city);
      else if (c === "restaurants") setRestCity(city);
      else if (c === "attractions") setAttrCity(city);
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };
  /** 酒店/餐厅详情里的"预订"按钮：直接打开同一页的预订弹窗 */
  const onBookPreset = (p: BookingPreset) => {
    setPreset(p);
    setDialogOpen(true);
  };

  const parsed = useMemo(
    () =>
      rows.map((r) => ({
        row: r,
        data: parseBookingBody(r.body),
        confirmed: r.done,
      })),
    [rows]
  );
  const confirmedCount = parsed.filter((p) => p.confirmed).length;

  const shown = parsed.filter((p) => {
    if (filter === "all") return true;
    if (filter === "pending") return !p.confirmed;
    if (filter === "confirmed") return p.confirmed;
    return p.data.bkind === filter;
  });

  const openNew = (bkind: BookingKind = "hotel") => {
    setPreset({ bkind, name: "" });
    setDialogOpen(true);
  };
  /** 收藏 → 预订：把收藏的酒店/餐厅直接带入预订弹窗，并按与卡片/详情、清单预填相同的
   *  日期口径预填（酒店入住→退房，餐厅/景点/交通单日）；dateEnd 仅酒店透传，
   *  与 presetFromChecklist / formatBookingBody 的类型契约一致，防非酒店误带区间 */
  const addFavoriteToBooking = (name: string, city: string, bkind: BookingKind, dates?: { date?: string; dateEnd?: string }) => {
    setPreset({
      bkind, name, city,
      ...(dates?.date ? { date: dates.date } : {}),
      ...(bkind === "hotel" && dates?.dateEnd ? { dateEnd: dates.dateEnd } : {}),
    });
    setDialogOpen(true);
  };
  /** 清单项 → 已加入的记录：先按 sourceId（改名后依然对得上），再按名称回退 */
  const matchRecord = useMemo(() => {
    const bySource = new Map<string, number>();
    const byName = new Map<string, number>();
    parsed.forEach((p, i) => {
      if (p.data.sourceId) bySource.set(p.data.sourceId, i);
      byName.set(p.row.title.trim().toLowerCase(), i);
    });
    return (item: ChecklistItem) => {
      const key = item.name.trim().toLowerCase();
      const idx =
        bySource.get(item.id) ?? (byName.has(key) ? byName.get(key) : undefined);
      if (idx == null) return undefined;
      const p = parsed[idx]!;
      return {
        confirmed: p.confirmed,
        summary: bookingSummary(p.data) || undefined,
        onView: () => openEdit(p.row.id),
      };
    };
  }, [parsed]);
  const addFromChecklist = (item: ChecklistItem) => {
    setPreset(presetFromChecklist(item));
    setDialogOpen(true);
  };
  const openEdit = (id: number) => {
    const r = rows.find((x) => x.id === id);
    if (!r) return;
    setPreset(presetFromRow(r));
    setDialogOpen(true);
  };
  const toggleConfirmed = (id: number, current: boolean) => {
    const r = rows.find((x) => x.id === id);
    if (!r) return;
    save.mutate({ id: r.id, kind: r.kind, title: r.title, body: r.body, day: r.day, done: !current });
  };

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: `全部 ${rows.length}` },
    { key: "pending", label: `待确认 ${rows.length - confirmedCount}` },
    { key: "confirmed", label: `已确认 ${confirmedCount}` },
    ...BOOKING_KINDS.map((k) => ({
      key: k as Filter,
      label: BOOKING_KIND_LABEL[k],
    })),
  ];

  /* 2026-10-13 用户：一级菜单只留三个（预定筛选/价格追踪/最终预定），整套菜单统一设计、吸顶固定不随滚动消失 */
  const sections: { key: SectionKey; label: string; badge?: number }[] = [
    { key: "screen", label: "🔍 预定筛选" },
    { key: "track", label: "📈 价格追踪", badge: favCount },
    { key: "final", label: "✅ 最终预定", badge: confirmedCount },
  ];
  const cats: { key: CatKey; label: string }[] = [
    { key: "hotels", label: "🏨 酒店" },
    { key: "flights", label: "✈️ 机票" },
    { key: "restaurants", label: "🍽️ 餐厅" },
    { key: "attractions", label: "🏛️ 景点" },
  ];
  const inCatalog = section === "screen" && cat !== "flights";

  return (
    <div className="max-w-5xl xl:max-w-7xl mx-auto px-4 pb-8">
      {/* 吸顶菜单栈（2026-10-13 整体重做）：一级分段控件 + 二级类别下划线页签 + 三级城市胶囊，
          一个容器、一套视觉语言，钉在站顶栏正下方，滚动时不消失；地图移出吸顶层、随页滚动 */}
      <div ref={stickyContainerRef} className="sticky z-[5] -mx-4 px-4 pt-2 pb-2 bg-[#f7f4ee]/95 backdrop-blur border-b border-gray-200 shadow-[0_6px_16px_-12px_rgba(0,0,0,0.35)]" style={{ top: 'var(--sticky-top, 0px)' }}>
        {/* 一级：预定筛选 / 价格追踪 / 最终预定 */}
        <div role="tablist" aria-label="预订一级菜单" className="flex gap-1 rounded-xl bg-[#e9e5d8] p-1">
          {sections.map((s) => (
            <button
              key={s.key}
              role="tab"
              aria-selected={section === s.key}
              onClick={() => switchSection(s.key)}
              className={`flex-1 px-2 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                section === s.key
                  ? "bg-white text-teal-900 font-bold shadow-sm"
                  : "text-gray-500 font-medium hover:text-teal-900"
              }`}
            >
              {s.label}
              {typeof s.badge === "number" && s.badge > 0 && (
                <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full align-middle ${
                  section === s.key ? "bg-teal-700 text-white" : "bg-gray-300 text-gray-600"
                }`}>
                  {s.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 二级：类别（仅预定筛选内） */}
        {section === "screen" && (
          <div role="tablist" aria-label="预定类别" className="flex gap-1 mt-1 border-b border-[#e5e1d6]">
            {cats.map((c) => (
              <button
                key={c.key}
                role="tab"
                aria-selected={cat === c.key}
                onClick={() => switchCat(c.key)}
                className={`px-3 py-1.5 text-[13px] whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  cat === c.key
                    ? "border-teal-700 text-teal-900 font-bold"
                    : "border-transparent text-gray-500 font-medium hover:text-teal-900"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* 三级：城市（仅酒店/餐厅/景点类别内） */}
        {inCatalog && (
          <div role="tablist" aria-label="城市筛选" className="mt-2">
          <div className="flex gap-1.5 overflow-x-auto">
            {(scoped ? catCities.filter(c => allCities.includes(c)) : []).map((c) => {
              const currentCity = (cat === "hotels" ? hotelCity : cat === "restaurants" ? restCity : attrCity) || (scoped ? catCities[0] : null);
              const setCity = cat === "hotels" ? setHotelCity : cat === "restaurants" ? setRestCity : setAttrCity;
              return (
                <button
                  key={c}
                  role="tab"
                  aria-selected={currentCity === c}
                  onClick={() => setCity(c)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                    currentCity === c
                      ? "bg-teal-700 text-white border-teal-700"
                      : "bg-white text-gray-500 border-[#e5e1d6] hover:border-teal-600"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}
      </div>


      {/* 统一行动队列：只在「预定筛选」里显示、且只显示当前类别页签的事项
          （2026-10-16 用户：价格追踪和最终预定里不要这个；在看酒店就只写酒店的） */}
      {syncMode === "cloud" && section === "screen" && (
        <div className="pt-3">
          <NextActionQueue
            plan={planState}
            stays={stays}
            flightSegs={flightSegsQ}
            category={cat}
            onGoTrackCard={goTrackCard}
            onGoFinal={() => switchSection("final")}
            onGoScreen={goScreen}
          />
        </div>
      )}

        {/* 地图（仅酒店/餐厅/景点类别）：置顶在吸顶菜单之下（stickyTop = 顶栏+菜单高，2026-10-13 用户）。
            ⚠️ 不许再包一层矮 div（2026-10-13 用户投诉「地图没拼在最上面，一滚就消失」）：
            sticky 只能在父容器高度内移动，矮包裹会把地图困死——三个地图必须直接挂页面根，
            靠下面的目录内容撑出全页高度，地图才能全程吸顶。间距用 spacer 补。 */}
        {inCatalog && (
          <>
          <div aria-hidden="true" style={{ height: 12 }} />
          {cat === "hotels" && (
          <SafeStickyMapBar
            items={hotelMapItems}
            activeCity={hotelCity}
            activeItemKeys={hotelSel ? [hotelSel] : null}
            expandSignal={hotelExpandSig}
            title="🗺️ 候选酒店位置"
            storageKey="sticky-map-booking-hotels"
            stickyTop={mapStickyTop}
            selectZoom={false}
            onHeightChange={onMapHeight("hotels")}
            onMarkerSelect={(key)=>{ setHotelSel(key); setTimeout(()=>{ const el=document.querySelector(`[data-place-key="${CSS.escape(key)}"]`); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); },50); }}
          />
          )}
          {cat === "restaurants" && (
          <SafeStickyMapBar
            items={restMapItems}
            activeCity={restCity}
            activeItemKeys={restSel ? [restSel] : null}
            expandSignal={restExpandSig}
            title="🗺️ 候选餐厅位置"
            storageKey="sticky-map-booking-restaurants"
            stickyTop={mapStickyTop}
            selectZoom={false}
            onHeightChange={onMapHeight("restaurants")}
            onMarkerSelect={(key)=>{ setRestSel(key); setTimeout(()=>{ const el=document.querySelector(`[data-place-key="${CSS.escape(key)}"]`); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); },50); }}
          />
          )}
          {cat === "attractions" && (
          <SafeStickyMapBar
            items={attrMapItems}
            activeCity={attrCity}
            activeItemKeys={attrSel ? [attrSel] : null}
            expandSignal={attrExpandSig}
            title="🗺️ 景点位置"
            storageKey="sticky-map-booking-attractions"
            stickyTop={mapStickyTop}
            selectZoom={false}
            onHeightChange={onMapHeight("attractions")}
            onMarkerSelect={(key)=>{ setAttrSel(key); setTimeout(()=>{ const el=document.querySelector(`[data-place-key="${CSS.escape(key)}"]`); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); },50); }}
          />
          )}
          </>
      )}

            {section === "screen" && cat === "hotels" ? (
        <div className="guide-scope">
          <HotelCatalog key={`hotels-${hotelCity}`} bare hideCityTabs initialCity={hotelCity || undefined} onBook={onBookPreset} scopeCities={scoped ? hotelCities : undefined} stayDates={scoped ? stayDates : undefined} onCityChange={setHotelCity} onItemSelect={(k)=>{setHotelSel(k);}} defaultListExpanded />
        </div>
      ) : section === "screen" && cat === "flights" ? (
        <div className="guide-scope">
          <Flights onBook={onBookPreset} />
        </div>
      ) : section === "screen" && cat === "restaurants" ? (
        <div className="guide-scope">
          <RestaurantCatalog key={`restaurants-${restCity}`} bare hideCityTabs initialCity={restCity || undefined} onBook={onBookPreset} scopeCities={scoped ? restCities : undefined} stayDates={scoped ? stayDates : undefined} onCityChange={setRestCity} onItemSelect={(k)=>{setRestSel(k);}} defaultListExpanded />
        </div>
      ) : section === "screen" && cat === "attractions" ? (
        <div className="guide-scope">
          <AttractionCatalog key={`attractions-${attrCity}`} hideCityTabs initialCity={attrCity || undefined} scopeCities={scoped ? planCities : undefined} bookingOnly={true} onCityChange={setAttrCity} onItemSelect={(k)=>{setAttrSel(k);}} defaultListExpanded />
        </div>
      ) : section === "track" ? (
        <>
        {/* 2026-10-13 用户：价格追踪 = 收藏 + 全部 live 数据（价格/余位/可预订状态）；总结块也放这里 */}
        <SyncBanner mode={syncMode} />
        {syncMode === "cloud" && (
          <DailyDigestBanner
            scopeCities={scoped ? planCities : undefined}
            onJump={goToMenu}
          />
        )}
        {scoped && (
          <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
            <span className="font-bold">📅 按行程规划只看这些：</span>
            {segments.map((s) => `${s.city} ${planDateShort(s.start)}–${planDateShort(s.end)}`).join(" · ")}
            <Link to="/planner" className="ml-2 font-medium text-teal-700 underline">
              去行程规划调整 →
            </Link>
          </div>
        )}
      {/* 2026-10-02 用户：行动安排只放收藏的，不再单独列收藏区+其他内容；整个页面就是收藏清单 */}
      {syncMode === "cloud" ? (
        <FavoriteActionList onAddFavorite={addFavoriteToBooking} stays={stays} plan={planState} mapStickyTop={mapStickyTop} />
      ) : (
        <LoginGate syncMode={syncMode} />
      )}
        </>
      ) : section === "final" ? (
        <>
        {/* 2026-10-13 用户：最终预定 = 上方日历直观总览（酒店连住/航班日/餐厅日），下方才是预定列表 */}
        <SyncBanner mode={syncMode} />
        {syncMode === "cloud" ? (
          <>
            <BookingsCalendar />
            <FinalBookingsList onEdit={openEdit} />
          </>
        ) : (
          <LoginGate syncMode={syncMode} />
        )}
        </>
      ) : (
        <div className="guide-scope">
          <Transport scopeCities={scoped ? planCities : undefined} />
        </div>
      )}

      <BookingDialog
        open={dialogOpen}
        preset={preset}
        onClose={() => {
          setDialogOpen(false);
          setPreset(null);
        }}
      />

      <p className="mt-8 text-xs text-gray-400">
        预订信息保存在这里（登录后云端同步）。旧版纯文本记录会自动兼容展示。
      </p>
    </div>
  );
}

export default function BookingsPage() {
  return <BookingsInner />;
}
