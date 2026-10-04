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
  PageShell,
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
import { Flights, HotelCatalog, RestaurantCatalog, AttractionCatalog, Transport, usePlanScope, planDateShort, MUST_BOOK_ATTRACTIONS, MUST_BOOK_ATTRACTION_REASONS } from "@/guide/GuideApp";
import { hotels, attractions } from "@/guide/data";
import { placeDetailPath, type PlaceKind } from "@/guide/placeDetail";
import { DetailLink, useDetailReturn } from "@/components/DetailReturn";
import "@/guide/theme-scoped.css";
import { getRestaurantBookingPolicy, bookingPolicyBadge } from "@/bookings/restaurantBookingStatus";
import { restaurants } from "@/guide/data";
import {
  presetFromChecklist,
  type ChecklistItem,
} from "@/bookings/bookingTypes";
import {
  BOOKING_KIND_LABEL,
  BOOKING_KINDS,
  bookingSummary,
  parseBookingBody,
  type BookingKind,
  type BookingPreset,
} from "@/bookings/bookingTypes";
import { FLIGHT_LEGS, liveFlightQuote, hotelStaysFromPlan, flightDateFromPlan, type HotelStay, type PlanSegment } from "@/bookings/bookingTimeline";
import { getLiveHotelPrice } from "@/guide/hotelLivePrices";
import StickyMapBar, { buildItemsFromFavorites, stickyItemKey, type FlightRoute } from "@/components/StickyMapBar";
import { airportForCity } from "@/data/airportCoords";

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
function FavoriteActionList({
  onAddFavorite,
  stays,
}: {
  onAddFavorite: (name: string, city: string, bkind: BookingKind) => void;
  stays: HotelStay[];
}) {
  const { rows, del, save } = useRecordsData(["favorite"]);
  const { segments } = usePlanScope();
  const segs: PlanSegment[] = useMemo(
    () => segments.map((s) => ({ city: s.city, start: s.start, end: s.end, days: s.days })),
    [segments]
  );
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

  /* 2026-10-03 用户：已出票的航班自动进出现在行动安排，不用手动收藏 */
  const autoTicketed = FLIGHT_LEGS.filter((l) => l.ticketed).filter((l) => {
    // 已在手动收藏里的不重复加
    return !manualFavs.some((f) => f.type === "flight" && f.flight?.route === l.route);
  }).map((l) => ({
    row: { id: `auto-ticketed-${l.id}`, title: `${l.route} ${l.carrier || ""} ${l.schedule || ""}`.trim(), done: true } as unknown as (typeof rows)[number],
    city: "",
    type: "flight" as string,
    flight: {
      carrier: l.carrier || undefined,
      flight: l.schedule?.split(" ")[0],
      depart: undefined as string | undefined,
      arrive: undefined as string | undefined,
      arrivePlusDay: undefined as boolean | undefined,
      price: undefined as number | undefined,
      cabin: undefined as string | undefined,
      route: l.route,
      date: l.date,
      priceBasis: l.priceBasis || undefined,
      queriedAt: undefined as string | undefined,
    },
    auto: true as boolean,
  }));

  const favs = [...autoTicketed, ...manualFavs];

  if (!favs.length) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 mb-6 text-center">
        <p className="text-sm text-gray-500">📋 行动安排是空的</p>
        <p className="text-xs text-gray-400 mt-1">
          在「酒店」「飞机」「餐厅」「景点」tab 浏览时点「＋ 收藏」，候选会按城市+时间线出现在这里，带实时价格追踪
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

  // 2026-10-03 用户：吸顶可折叠地图 + 滚动联动高亮（地图点 = 收藏 + 行程景点，只收行程城市）
  // 2026-10-04 用户：只高亮当前屏幕里的具体项目（酒店/餐厅/景点卡片），航班显示两机场+连线
  /** 预订卡片 ↔ 地图点的关联 key（与 StickyMapBar 内 marker key 同算法） */
  const bookingItemKey = (f: (typeof favs)[number]) =>
    stickyItemKey(f.type, itemCity(f), f.row.title);
  const [mapActiveItemKeys, setMapActiveItemKeys] = useState<string[]>([]);
  const visibleKeysRef = useRef(new Set<string>());
  // favs 每 render 都是新数组引用，用内容签名做 memo key，避免地图 markers 无意义重建
  const favSig = favs.map((f) => `${f.type}:${f.row.title}:${itemCity(f)}:${f.flight?.route ?? ""}`).join("|");
  const segSig = segs.map((s) => s.city).join(",");
  const bookingMapItems = useMemo(
    () =>
      buildItemsFromFavorites(
        favs.map((f) => ({ name: f.row.title, city: itemCity(f), type: f.type })),
        segs.map((s) => s.city),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [favSig, segSig],
  );
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
  // 滚动联动：IntersectionObserver 观察每张预订卡片，收集屏幕中央可见的 item key，
  // 地图只显示/高亮这些卡片对应的点（航班卡片对应两机场+连线）
  const sectionKey = useMemo(() => segSig + "|" + favSig, [segSig, favSig]);
  useEffect(() => {
    visibleKeysRef.current.clear();
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-booking-item]"));
    if (!els.length) {
      setMapActiveItemKeys([]);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        let changed = false;
        for (const e of entries) {
          const k = (e.target as HTMLElement).dataset.bookingItem || "";
          if (!k) continue;
          const has = visibleKeysRef.current.has(k);
          if (e.isIntersecting && !has) {
            visibleKeysRef.current.add(k);
            changed = true;
          } else if (!e.isIntersecting && has) {
            visibleKeysRef.current.delete(k);
            changed = true;
          }
        }
        if (changed) setMapActiveItemKeys([...visibleKeysRef.current]);
      },
      { rootMargin: "-30% 0px -30% 0px", threshold: [0, 0.25, 0.5] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sectionKey]);
  // 标题副文案：取在看卡片的第一个城市
  const mapActiveLabel = useMemo(() => {
    if (!mapActiveItemKeys.length) return undefined;
    const city = mapActiveItemKeys[0].split(":")[1];
    return city ? `📍 ${city}` : undefined;
  }, [mapActiveItemKeys]);

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
  const citySections = cityOrder
    .filter((c) => grouped.has(c))
    .map((c) => ({
      city: c,
      seg: segs.find((s) => s.city === c)!,
      items: grouped.get(c)!,
    }));
  if (other.length) {
    citySections.push({ city: "其他", seg: null as unknown as PlanSegment, items: other });
  }

  const decided = favs.filter((f) => f.row.done).length;
  /* 2026-10-03 用户：行动安排的 item 要能展开看详情，方便对比 */
  const [expandedId, setExpandedId] = useState<number | null>(null);
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
          <h3 className="font-bold text-gray-900">📋 行动安排</h3>
          <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">
            {favs.length} 项候选 · {decided} 已确定
          </span>
        </div>
        <p className="text-xs text-gray-500">
          按行程时间线分城市排列，每个城市的航班/酒店/餐厅/景点都在一块，实时价格直接比较。看好点「✓ 确定」锁定，再「加入预订」走正式流程
        </p>
      </div>

      {/* 2026-10-03 用户：吸顶可折叠地图——收藏的酒店/餐厅/景点 + 行程全部景点，看位置合不合适、离酒店远近；
          只显示大行程定下的城市；2026-10-04 用户：只高亮当前屏幕里的具体项目，航班显示两机场+连线 */}
      <StickyMapBar
        items={bookingMapItems}
        activeCity={null}
        activeLabel={mapActiveLabel}
        activeItemKeys={mapActiveItemKeys}
        flightRoutes={bookingFlightRoutes}
        title="🗺️ 行动安排地图"
        storageKey="sticky-map-bookings"
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
                    return (
                    <div
                      key={f.row.id}
                      id={`booking-card-${f.row.id}`}
                      data-booking-item={bookingItemKey(f)}
                      className={`bg-white rounded-lg border px-3 py-2.5 ${
                        f.row.done ? "border-green-200 bg-green-50/50" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {f.row.title}
                          {f.type === "flight" && f.flight?.route && (
                            <span className="ml-2 text-xs font-normal text-gray-500">{f.flight.route}</span>
                          )}
                          {/* 2026-10-03 用户：已出票的航班在行动安排里标已购买 */}
                          {f.type === "flight" && flightLeg?.ticketed && (
                            <span
                              title={flightLeg.note}
                              className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white align-middle"
                            >
                              ✅ 已出票
                            </span>
                          )}
                          {/* 2026-10-03 用户：已预订的酒店在行动安排里标已预订（1359213 曾误加入已下线的 BookingTimeline，本轮移到 BookingsPage） */}
                          {f.type === "hotel" && (() => {
                            const st = stayOf(itemCity(f));
                            return st?.booked ? (
                              <span
                                title={st.confirmationCode ? `确认号 ${st.confirmationCode}` : "已预订"}
                                className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white align-middle"
                              >
                                ✅ 已预订{st.bookedHotelName ? ` · ${st.bookedHotelName}` : ""}
                              </span>
                            ) : null;
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
                        {!f.row.done ? (
                          <button
                            onClick={() => save.mutate({
                              id: f.row.id, kind: f.row.kind, title: f.row.title,
                              body: f.row.body, day: f.row.day, done: true,
                            })}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700"
                          >
                            ✓ 确定
                          </button>
                        ) : (
                          <span className="px-2.5 py-1.5 rounded-lg bg-green-100 text-green-800 text-xs font-medium">
                            ✓ 已确定
                          </span>
                        )}
                        <button
                          onClick={() => onAddFavorite(f.row.title, itemCity(f), bkindFor(f.type))}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-medium hover:bg-teal-800"
                        >
                          加入预订
                        </button>
                        <button
                          onClick={() => del.mutate({ id: f.row.id })}
                          className="px-1.5 py-1.5 rounded-lg text-gray-400 text-xs hover:text-gray-600"
                          aria-label={`移除收藏${f.row.title}`}
                        >
                          ✕
                        </button>
                      </div>
                      </div>
                      {/* 展开：航班看当天所有选项（酒店/餐厅/景点走详情页，此处不再内联展开） */}
                      {isOpen && f.type === "flight" && flightLeg && (
                        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                          <p className="font-medium text-gray-500 mb-1.5">
                            ✈️ {flightLeg.route} · {flightLeg.date || "日期待定"} 当天所有直飞（{flightLeg.options?.length ?? 0} 班）
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
                          {(flightLeg.options ?? []).length ? (
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
    const p = getLiveHotelPrice(name);
    if (p && !p.unavailable && p.base) {
      return (
        <div className="text-xs text-gray-600 mt-1">
          💰 <span className="font-semibold text-teal-700 text-sm">${p.base.perNightUSD}/晚</span>
          {p.base.totalUSD != null && (
            <span className="text-gray-600"> · 共 <span className="font-semibold">${Math.round(p.base.totalUSD)}</span>{p.nights ? `/${p.nights}晚` : ""}</span>
          )}
          <span className="text-gray-400"> · {p.source}实查 {p.checkedAt}</span>
          {p.dateMismatch && <span className="text-amber-600"> ⚠️日期待重查</span>}
        </div>
      );
    }
    if (p && p.unavailable) return <div className="text-xs text-gray-400 mt-1">💰 该日期暂无可订房</div>;
    return <div className="text-xs text-gray-400 mt-1">💰 价格：暂无实时价</div>;
  }
  if (type === "restaurant") {
    // 餐厅：显示已研究的订位政策（必须明确区分"没查过"和"不需要预订"）
    const b = bookingPolicyBadge(name);
    return (
      <div className="text-xs text-gray-600 mt-1">
        📅 <span title={b.title} className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${b.cls}`}>{b.text}</span>
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

function BookingsInner() {
  // 2026-10-03 用户：所有跳详情页的入口返回时恢复原卡片位置
  useDetailReturn("bookings");
  const { rows, loading, loadError, save, del, syncMode } =
    useRecordsData(["booking"]);
  /* 2026-10-03 用户：二级菜单像行程页日期导航一样吸顶固定，随时可切换；
   * 城市 tab 也吸顶，top = 顶栏高度 + 二级菜单高度，经 CSS 变量 --citytabs-top 传入（挂在 documentElement 上全局继承） */
  const menuNavRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const nav = menuNavRef.current;
    if (!nav) return;
    const sync = () => {
      const header = document.querySelector("header.sticky");
      const headerH = header ? Math.round(header.getBoundingClientRect().height) : 0;
      if (header) nav.style.top = `${headerH}px`;
      const navH = Math.round(nav.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--citytabs-top", `${headerH + navH}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    const header = document.querySelector("header.sticky");
    if (header) ro.observe(header);
    ro.observe(nav);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);
  const [filter, setFilter] = useState<Filter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preset, setPreset] = useState<BookingPreset | null>(null);
  /** 二次确认删除：用站内按钮代替 window.confirm（原生弹窗在自动化/部分移动端会被吞掉） */
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  /** 二级菜单：酒店 / 航班 / 餐厅 / 景点 / 预订行动 / 交通（支持 ?menu=hotels|flights|restaurants|attractions|action|transport 深链；旧 ?menu=details&view=hotels|restaurants 自动兼容）
      2026-10-02 用户：tab 顺序改为酒店→飞机→餐厅→景点→行动安排（行动最后）；加景点 tab */
  const [searchParams] = useSearchParams();
  type MenuKey = "hotels" | "flights" | "restaurants" | "attractions" | "action" | "transport";
  const [menu, setMenu] = useState<MenuKey>(() => {
    const m = searchParams.get("menu");
    if (m === "hotels" || m === "flights" || m === "restaurants" || m === "attractions" || m === "action" || m === "transport") return m;
    if (m === "details") return searchParams.get("view") === "restaurants" ? "restaurants" : "hotels";
    return "hotels";
  });
  /* 2026-10-03 用户：切换二级菜单时回到顶端，滚动位置不在不同 tab 间继承 */
  const switchMenu = (m: MenuKey) => {
    setMenu(m);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
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
  const stayDates = useMemo(() => {
    const m: Record<string, string> = {};
    segments.forEach((s) => {
      m[s.city] = `${planDateShort(s.start)}–${planDateShort(s.end)}`;
    });
    return m;
  }, [segments]);
  const scoped = segments.length > 0;
  /** 各城酒店住宿段（入住=到达当天，退房=转场航班当天），行动安排页酒店收藏展示用 */
  const stays = useMemo(
    () => hotelStaysFromPlan(segments.map((s) => ({ city: s.city, start: s.start, end: s.end, days: s.days }))),
    [segments]
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

  const menus: { key: MenuKey; label: string }[] = [
    { key: "hotels", label: "🏨 酒店" },
    { key: "flights", label: "✈️ 飞机" },
    { key: "restaurants", label: "🍽️ 餐厅" },
    { key: "attractions", label: "🏛️ 景点" },
    { key: "action", label: "📋 行动安排" },
    { key: "transport", label: "🚋 交通" },
  ];

  return (
    <PageShell
      eyebrow="MY BOOKINGS"
      title="预订"
      summary="📋 机票、酒店、餐饮、交通收拢在一页：「预订行动」是时间线、状态与你的预订记录；「酒店」「餐厅」「航班」「交通」只显示行程规划里定好的城市和日期（照片、口碑、实时价、订位政策），挑中了直接点预订。"
    >
      <SyncBanner mode={syncMode} />

      {/* 每日预订动态横幅：三个每日任务的最新结果汇总，点每行跳到对应菜单看明细 */}
      <DailyDigestBanner
        scopeCities={scoped ? planCities : undefined}
        onJump={setMenu}
      />

      {scoped && (
        <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          <span className="font-bold">📅 按行程规划只看这些：</span>
          {segments.map((s) => `${s.city} ${planDateShort(s.start)}–${planDateShort(s.end)}`).join(" · ")}
          <Link to="/planner" className="ml-2 font-medium text-teal-700 underline">
            去行程规划调整 →
          </Link>
        </div>
      )}

      {/* 二级菜单：预订行动 / 酒店与餐厅 / 航班 / 交通（2026-10-03 用户：吸顶固定，随时可切换） */}
      <div ref={menuNavRef} className="sticky z-[5] -mx-4 px-4 py-2 mb-6 bg-[#faf8f3]/95 backdrop-blur-sm border-y border-gray-200" role="tablist" aria-label="预订二级菜单">
        <div className="booking-tabs flex gap-2 overflow-x-auto">
          {menus.map((m) => (
            <button
              key={m.key}
              role="tab"
              aria-selected={menu === m.key}
              onClick={() => switchMenu(m.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors whitespace-nowrap ${
                menu === m.key
                  ? "bg-teal-700 text-white border-teal-700"
                  : "bg-white text-gray-600 border-[#e5e1d6] hover:border-teal-600"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {menu === "hotels" ? (
        <div className="guide-scope">
          <HotelCatalog onBook={onBookPreset} scopeCities={scoped ? planCities : undefined} stayDates={scoped ? stayDates : undefined} />
        </div>
      ) : menu === "flights" ? (
        <div className="guide-scope">
          <Flights onBook={onBookPreset} />
        </div>
      ) : menu === "restaurants" ? (
        <div className="guide-scope">
          <RestaurantCatalog onBook={onBookPreset} scopeCities={scoped ? planCities : undefined} stayDates={scoped ? stayDates : undefined} />
        </div>
      ) : menu === "attractions" ? (
        <div className="guide-scope">
          <AttractionCatalog scopeCities={scoped ? planCities : undefined} bookingOnly={true} />
        </div>
      ) : menu === "action" ? (
        <>
      {/* 2026-10-02 用户：行动安排只放收藏的，不再单独列收藏区+其他内容；整个页面就是收藏清单 */}
      <FavoriteActionList onAddFavorite={addFavoriteToBooking} stays={stays} />
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
    </PageShell>
  );
}

export default function BookingsPage() {
  return <BookingsInner />;
}
