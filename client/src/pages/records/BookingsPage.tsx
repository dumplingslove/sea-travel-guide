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
import { DetailLink, useDetailReturn } from "@/components/DetailReturn";
import "@/guide/theme-scoped.css";
import { getRestaurantBookingPolicy, bookingPolicyBadge, mustGoBadge } from "@/bookings/restaurantBookingStatus";
import { restaurants } from "@/guide/data";
import {
  presetFromChecklist,
  type ChecklistItem,
} from "@/bookings/bookingTypes";
import { loadPlannerPlan, cityNeedOf, normalizeTripDays, type PlannerPlan } from "@/guide/plannerSchedule";
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
import { FLIGHT_LEGS, liveFlightQuote, hotelStaysFromPlan, flightDateFromPlan, type HotelStay, type PlanSegment } from "@/bookings/bookingTimeline";
import { getLiveHotelPrice, liveDisplayRate } from "@/guide/hotelLivePrices";
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
  mapStickyTop,
}: {
  onAddFavorite: (name: string, city: string, bkind: BookingKind) => void;
  stays: HotelStay[];
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
  const favs = manualFavs;

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
      const planDate = route ? flightDateFromPlan(route, segs) : null;
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

  /** 按时间线城市分组；不在行程里的城市收到"其他" */
  const cityOrder = segs.map((s) => s.city);
  const grouped = new Map<string, typeof favs>();
  const other: typeof favs = [];
  for (const f of favs) {
    let c = itemCity(f);
    /* 2026-10-03 用户：航班按行程相关城市归类——出发地在行程里用出发地（如首尔→西雅图归首尔），
       出发地不在行程里但到达地在行程里用到达地（如西雅图→北京归北京） */
    if (f.type === "flight" && f.flight?.route) {
      const parts = f.flight.route.split("→").map((s) => s.trim());
      const origin = parts[0] || "";
      const dest = parts[1] || "";
      if (origin && cityOrder.includes(origin)) {
        c = origin;
      } else if (dest && cityOrder.includes(dest)) {
        c = dest;
      }
    }
    if (c && cityOrder.includes(c)) {
      if (!grouped.has(c)) grouped.set(c, []);
      grouped.get(c)!.push(f);
    } else {
      other.push(f);
    }
  }
  // 2026-10-04 Bug 6：大行程里同一城市可出现多次（如北京 11/28–12/5 和 12/22–12/30 两段），
  // cityOrder 会带重名，直接 map 会把同一批 items 渲染两次。按城市去重，每城只保留一段（首段）。
  const citySections: { city: string; seg: PlanSegment; items: typeof favs }[] = [];
  {
    const seenCity = new Set<string>();
    for (const c of cityOrder) {
      if (!grouped.has(c) || seenCity.has(c)) continue;
      seenCity.add(c);
      citySections.push({
        city: c,
        seg: segs.find((s) => s.city === c)!,
        items: grouped.get(c)!,
      });
    }
  }
  if (other.length) {
    citySections.push({ city: "其他", seg: null as unknown as PlanSegment, items: other });
  }

  const decided = favs.filter((f) => f.row.done).length;
  /* 2026-10-03 用户：行动安排的 item 要能展开看详情，方便对比 */
  const [expandedId, setExpandedId] = useState<number | null>(null);
  // 2026-10-10 用户：卡片按钮太占空间，确定/加入预订/移除收进 ⋯ 菜单
  const [menuId, setMenuId] = useState<number | null>(null);
  /** 按名称找攻略详情（酒店/餐厅/景点） */
  const findDetail = (name: string, type: string) => {
    if (type === "hotel") return hotels.find((h) => h.name === name);
    if (type === "restaurant") return restaurants.find((r) => r.name === name);
    if (type === "attraction") return attractions.find((a) => a.name === name);
    return undefined;
  };

  return (
    <div className="mb-6">
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-gray-900">📈 价格追踪</h3>
          <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">
            {favs.length} 项收藏 · {decided} 已确定
          </span>
        </div>
        <p className="text-xs text-gray-500">
          只追踪你收藏的：实时价格、订位空位、门票余量、是否可预订都在这里，并标注是否已预订/已出票。按行程时间线分城市排列，点卡片→地图只定位它（航班显示两机场+连线），再点一次取消；展开看详情对比，看好点「✓ 确定」锁定、再「加入预订」走正式流程。真正订好的在「✅ 最终预定」里看确认信息；还没收藏的去「🔍 预定筛选」里挑
        </p>
      </div>

      {/* 2026-10-03 用户：吸顶可折叠地图——收藏的酒店/餐厅/景点，看位置合不合适、离酒店远近；
          只显示大行程定下的城市；2026-10-04 用户裁决：点卡片高亮——点哪张卡地图高亮它，其他正常显示
          （航班卡=两机场+连线），不点显示全部，再点一次取消 */}
      <SafeStickyMapBar
        items={bookingMapItems}
        activeCity={null}
        activeLabel={mapSelLabel}
        activeItemKeys={mapSelKey ? [mapSelKey] : null}
        flightRoutes={bookingFlightRoutes}
        title="🗺️ 价格追踪地图"
        storageKey="sticky-map-bookings"
        stickyTop={mapStickyTop}
      />

      {citySections.map((sec, si) => (
        <div key={sec.city} data-city-section={sec.city} className="mb-5">
          {/* 城市头：时间线节点 */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-teal-600 shrink-0" />
              {si < citySections.length - 1 && <div className="w-0.5 h-4 bg-teal-200" />}
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h4 className="text-base font-bold text-gray-900">{sec.city}</h4>
              {sec.seg && (
                <span className="text-xs text-gray-500">
                  {planDateShort(sec.seg.start)} → {planDateShort(sec.seg.end)} · {sec.seg.days} 天
                </span>
              )}
              {(() => {
                const st = stayOf(sec.city);
                return st ? (
                  <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                    🛏️ {planDateShort(st.checkIn)} 入住 · {planDateShort(st.checkOut)} 退房 · {st.nights} 晚
                  </span>
                ) : null;
              })()}
            </div>
          </div>

          {/* 城内按类型分组，组内按时间线日期排序 */}
          {(["flight", "hotel", "restaurant", "attraction"] as const).map((t) => {
            const items = sec.items
              .filter((f) => f.type === t)
              .sort((a, b) => itemTimelineDate(a).localeCompare(itemTimelineDate(b)));
            if (!items.length) return null;
            return (
              <div key={t} className="ml-6 mb-3">
                <div className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                  {typeLabel(t)} · {items.length} 项
                </div>
                <div className="space-y-2">
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
                      className={`bg-white rounded-lg border px-3 py-2.5 cursor-pointer ${
                        cardSelected
                          ? "ring-2 ring-teal-600 border-teal-600"
                          : f.row.done
                            ? "border-green-200 bg-green-50/50"
                            : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900">
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
                        {/* 实时信息行：航班查库带涨跌，酒店查房价，餐厅/景点给政策 */}
                        <FavoritePriceLine
                          name={f.row.title} type={f.type} city={f.city}
                          flight={f.flight} segs={segs}
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
                                    onAddFavorite(f.row.title, itemCity(f), bkindFor(f.type));
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
                                const planDate = route ? flightDateFromPlan(route, segs) : null;
                                return planDate || f.flight!.date || "";
                              })()}
                              flightNo={f.flight.flight || ""}
                              cabin={f.flight.cabin || "eco"}
                              favPrice={f.flight.price}
                              livePrice={(() => {
                                const route = f.flight!.route || "";
                                const leg = FLIGHT_LEGS.find((l) => l.route === route);
                                const planDate = route ? flightDateFromPlan(route, segs) : null;
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
      ))}
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
          {dateMoved && <span className="text-amber-600"> · 行程已调，按新日期重查</span>}
          <span className="text-gray-400"> · Google Flights</span>
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
              📊 Baseline (Google Hotels): ${p!.baselineUSD}/晚（不含税）
              <span className="text-gray-400" title="Google baseline 不含税，Trip.com 每晚价税费口径未明确，口径不一致时不直接计算差额"> · 口径不同，未算差价</span>
            </div>
          )}
        </div>
      );
    }
    if (p && p.unavailable) return <div className="text-xs text-gray-400 mt-1">💰 该日期暂无可订房</div>;
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
 * 全行程逐日标注当晚住宿城市（云端规划分段推导，与 planner 同算法）、转场日标 ✈️/🚄
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
      .then((l) => { if (alive && l?.plan) setPlan(l.plan); })
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

    /* ---------- 行程层：云端规划的大行程分段（与 planner 的 tripRanges/wzRanges 同算法；
       2026-10-13 改版：曼谷后是「分开行动」一段——你北京、老婆+娃西安，同住到首尔汇合） ---------- */
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
    /* 每日期属哪一段（格子顶边段色，与行程规划 wzUnifiedCalendar 的 segColor 同口径） */
    const segOf = new Map<string, string>();
    let tripStart = "";
    let tripEnd = "";
    if (plan) {
      const nd = normalizeTripDays(plan.trip);
      const segIds = ["beijing1", "singapore", "couple", "split", "seoul"] as const;
      const segDays: Record<(typeof segIds)[number], number> = {
        beijing1: nd.beijing1, singapore: nd.singapore, couple: nd.couple, split: nd.split, seoul: nd.seoul,
      };
      const segLabel: Record<string, string> = { beijing1: "北京", singapore: "新加坡", couple: "", split: "北京/西安", seoul: "首尔" };
      const ranges: Record<string, { from: string; to: string }> = {};
      let cur = "2026-11-29";
      for (const id of segIds) {
        const d = segDays[id];
        ranges[id] = { from: cur, to: add(cur, d - 1) };
        cur = add(cur, d);
      }
      const wzCities = (plan.wz?.cities ?? []) as string[];
      const wzOrder = ((plan.wz?.order ?? []) as string[]).filter((c) => wzCities.includes(c));
      const wzDays = (plan.wz?.days ?? {}) as Record<string, number>;
      const order = wzOrder.length ? wzOrder : ["普吉", "清迈", "曼谷"];
      const fbDays: Record<string, number> = { "普吉": 4, "清迈": 3, "曼谷": 1 };
      const coupleRows: { city: string; from: string; to: string }[] = [];
      let ccur = ranges.couple!.from;
      for (const city of order) {
        const d = typeof wzDays[city] === "number" && wzDays[city] >= 1 ? wzDays[city] : (fbDays[city] ?? 1);
        coupleRows.push({ city, from: ccur, to: add(ccur, d - 1) });
        ccur = add(ccur, d);
      }
      const fill = (from: string, to: string, city: string) => {
        let k = from;
        let g = 0;
        while (k <= to && g++ < 40) { dayCity.set(k, city); k = add(k, 1); }
      };
      for (const id of segIds) {
        if (id === "couple") continue;
        fill(ranges[id]!.from, ranges[id]!.to, segLabel[id]!);
      }
      for (const r of coupleRows) fill(r.from, r.to, r.city);
      /* 段色归属：先按大行程段，再用东南亚城市覆盖 couple 段（与 planner 同算法） */
      segOf.set("2026-11-28", "outbound");
      for (const id of segIds) {
        let k = ranges[id]!.from;
        let g = 0;
        while (k <= ranges[id]!.to && g++ < 40) { segOf.set(k, id); k = add(k, 1); }
      }
      for (const r of coupleRows) {
        let k = r.from;
        let g = 0;
        while (k <= r.to && g++ < 40) { segOf.set(k, "couple"); k = add(k, 1); }
      }
      /* 分开行动的日子单独标记（详情里写清谁在哪座城市） */
      { let k = ranges.split!.from; let g = 0; while (k <= ranges.split!.to && g++ < 40) { splitDays.add(k); k = add(k, 1); } }
      /* 每晚是否需要订酒店（大行程里的每城开关）：分开日两边任一需要订就算需要 */
      for (const [k, city] of dayCity) {
        if (splitDays.has(k)) {
          hotelNeedByDay.set(k, cityNeedOf(plan, "北京").hotel || cityNeedOf(plan, "西安").hotel);
        } else if (city.includes("→")) {
          hotelNeedByDay.set(k, false);
        } else {
          hotelNeedByDay.set(k, cityNeedOf(plan, city).hotel);
        }
      }
      dayCity.set("2026-11-28", "西雅图→北京");
      tripStart = "2026-11-28";
      tripEnd = ranges.seoul!.to;

      const lm = (after: string): "flight" | "rail" => {
        const v = plan.legModes?.[after];
        return v === "rail" || v === "flight" ? v : "flight";
      };
      const APT: Record<string, string> = { "新加坡": "SIN", "普吉": "HKT", "清迈": "CNX", "曼谷": "BKK", "槟城": "PEN", "吉隆坡": "KUL", "胡志明市": "SGN", "富国岛": "PQC" };
      const firstCity = coupleRows[0]?.city ?? "普吉";
      const lastCity = coupleRows[coupleRows.length - 1]?.city ?? "曼谷";
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
      regLeg("西雅图→北京", "SEA-PEK", "2026-11-28", "flight");
      regLeg("北京→新加坡", "PEK-SIN", ranges.singapore!.from, lm("beijing1"));
      regLeg("西安→新加坡", "XIY-SIN", ranges.singapore!.from, lm("beijing1"));
      regLeg(`新加坡→${firstCity}`, `SIN-${APT[firstCity] ?? "HKT"}`, ranges.couple!.from, lm("singapore"));
      regLeg("新加坡→西安", "SIN-XIY", ranges.couple!.from, lm("singapore"));
      for (let i = 1; i < coupleRows.length; i++)
        regLeg(`${coupleRows[i - 1]!.city}→${coupleRows[i]!.city}`, `${APT[coupleRows[i - 1]!.city] ?? ""}-${APT[coupleRows[i]!.city] ?? ""}`, coupleRows[i]!.from, "flight");
      regLeg(`${lastCity}→北京（你）`, `${APT[lastCity] ?? "BKK"}-PEK`, ranges.split!.from, "flight");
      regLeg(`${lastCity}→西安（老婆+娃）`, `${APT[lastCity] ?? "BKK"}-XIY`, ranges.split!.from, "flight");
      regLeg("北京→西安", "", ranges.split!.to, "rail");
      regLeg("西安→首尔", "XIY-ICN", ranges.seoul!.from, lm("split"));
      regLeg("首尔→西雅图", "ICN-SEA", ranges.seoul!.to, "flight");
      /* plane 派生：当天全部航班腿都过夜、且当天没有高铁腿 → 主标「🌙 飞机上过夜」 */
      for (const [date, legs] of transfers) {
        const fl = legs.filter((l) => l.mode === "flight");
        if (fl.length && fl.every((l) => l.overnight) && !legs.some((l) => l.mode === "rail")) plane.add(date);
      }
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
                    {isPlane && prevCity && prevCity !== city && <span className="wz-calnote">白天在{prevCity}</span>}
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
      .then((l) => { if (alive && l?.plan) setPlanState(l.plan); })
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
   * 2026-10-05 修：用完整大行程链（北京1→新加坡→东南亚→西安→北京3→首尔），
   * 否则最后一段（曼谷）退房取不到转场日，会少算一天 */
  const fullSegments = useFullTripSegments();
  const stays = useMemo(
    () => hotelStaysFromPlan(fullSegments.map((s) => ({ city: s.city, start: s.start, end: s.end, days: s.days }))),
    [fullSegments]
  );
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
  /** 收藏 → 预订：把收藏的酒店/餐厅直接带入预订弹窗 */
  const addFavoriteToBooking = (name: string, city: string, bkind: BookingKind) => {
    setPreset({ bkind, name, city });
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
    <div className="max-w-5xl mx-auto px-4 pb-8">
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
        <FavoriteActionList onAddFavorite={addFavoriteToBooking} stays={stays} mapStickyTop={mapStickyTop} />
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
