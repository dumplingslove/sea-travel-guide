/**
 * /bookings 预订记录：按类型（酒店/餐厅/景点门票/交通/其他）管理，
 * 每条有已确认/待确认状态。新增与编辑统一走 BookingDialog 弹窗。
 *
 * 数据复用 sea_guide_records（kind="booking"）：
 * - title = 预订名称，body = BookingData JSON，done = 已确认，day = 关联天数。
 * - 兼容旧版三行纯文本 body，按 other 类型解析展示。
 */
import { useLayoutEffect, useMemo, useRef, useState } from "react";
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
import BookingTimeline from "@/bookings/BookingTimeline";
import BookingStatusSummary from "@/bookings/BookingStatusSummary";
import DailyDigestBanner from "@/bookings/DailyDigestBanner";
import { Flights, HotelCatalog, RestaurantCatalog, AttractionCatalog, Transport, usePlanScope, planDateShort, MUST_BOOK_ATTRACTIONS, MUST_BOOK_ATTRACTION_REASONS } from "@/guide/GuideApp";
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
function FavoriteActionList({
  onAddFavorite,
  stays,
}: {
  onAddFavorite: (name: string, city: string, bkind: BookingKind) => void;
  /** 各城酒店住宿段（入住=到达当天，退房=转场航班当天），由调用方按行程推导后传入 */
  stays: HotelStay[];
}) {
  const { rows, del, save } = useRecordsData(["favorite"]);
  const { segments } = usePlanScope();
  const segs: PlanSegment[] = useMemo(
    () => segments.map((s) => ({ city: s.city, start: s.start, end: s.end, days: s.days })),
    [segments]
  );
  const stayOf = (city: string) => stays.find((s) => s.city === city);
  const favs = rows
    .map((r) => {
      try {
        const d = JSON.parse(r.body) as {
          city?: string;
          note?: string;
          type?: string;
          flight?: {
            carrier?: string;
            flight?: string;
            depart?: string;
            arrive?: string;
            arrivePlusDay?: boolean;
            price?: number;
            cabin?: string;
            route?: string;
            date?: string;
            priceBasis?: string;
            queriedAt?: string;
          };
        };
        return { row: r, city: d.city ?? "", type: d.type ?? "attraction", flight: d.flight };
      } catch {
        return { row: r, city: "", type: "attraction", flight: undefined };
      }
    })
    // 2026-10-02：四类全收，不再只收酒店/餐厅
    .filter((f) => ["hotel", "flight", "restaurant", "attraction"].includes(f.type));

  if (!favs.length) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 mb-6 text-center">
        <p className="text-sm text-gray-500">
          📋 行动安排是空的
        </p>
        <p className="text-xs text-gray-400 mt-1">
          在「酒店」「飞机」「餐厅」「景点」tab 浏览时点「＋ 收藏」，候选会按四类分组出现在这里，带实时价格追踪
        </p>
      </div>
    );
  }

  const typeLabel = (type: string) =>
    type === "hotel" ? "🏨 酒店" :
    type === "flight" ? "✈️ 航班" :
    type === "restaurant" ? "🍽️ 餐厅" : "🏛️ 景点";

  const timingTip = (type: string) =>
    type === "hotel"
      ? "12月是旺季，建议现在就订（提前2-3个月），好房型先到先得"
      : type === "flight"
      ? "机票价格波动大，看到合适就下手；出票前重查退改政策"
      : type === "restaurant"
      ? "热门餐厅提前1-2周订位；米其林/必订餐厅现在可查档期"
      : "热门景点提前查门票/预约政策，避开人流高峰";

  const bkindFor = (type: string): BookingKind =>
    type === "hotel" ? "hotel" :
    type === "flight" ? "transport" :
    type === "restaurant" ? "restaurant" : "attraction";

  /* 2026-10-03 用户：行动安排按酒店/航班/餐厅/景点分组，不再平铺 */
  const groups = [
    { type: "hotel", label: "🏨 酒店", hint: "12月旺季，先定酒店再排别的" },
    { type: "flight", label: "✈️ 航班", hint: "价格波动大，看到合适就下手" },
    { type: "restaurant", label: "🍽️ 餐厅", hint: "热门餐厅提前1-2周订位" },
    { type: "attraction", label: "🏛️ 景点", hint: "需提前订票/报团的才值得现在锁定" },
  ]
    .map((g) => ({ ...g, items: favs.filter((f) => f.type === g.type) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-900">📋 行动安排</h3>
        <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">
          {favs.length} 项待决策
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        你在酒店/飞机/餐厅/景点页收藏的候选都在这里，按四类分组、价格实时追踪。看好后点「✓ 确定」锁定最终选择，再点「加入预订」走正式预订流程
      </p>
      {groups.map((g) => (
        <div key={g.type} className="mb-4 last:mb-0">
          <div className="flex items-baseline gap-2 mb-1.5">
            <h4 className="text-sm font-bold text-gray-800">{g.label}</h4>
            <span className="text-xs text-gray-400">{g.items.length} 项 · {g.hint}</span>
          </div>
          <div className="space-y-2">
            {g.items.map((f) => (
          <div
            key={f.row.id}
            className="flex items-center justify-between gap-2 bg-white rounded-lg border border-amber-100 px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900 truncate">
                {f.row.title}
                <span className="ml-2 text-xs font-normal text-gray-400">
                  {f.city && `${f.city} · `}{typeLabel(f.type)}
                </span>
              </div>
              {/* 酒店：显示入住/退房（与航班模型一致：入住=到达当天，退房=转场航班当天） */}
              {f.type === "hotel" && (() => {
                const st = stayOf(f.city);
                return st ? (
                  <div className="text-xs text-gray-500">🛏️ 入住 {planDateShort(st.checkIn)} · 退房 {planDateShort(st.checkOut)} · {st.nights} 晚</div>
                ) : (
                  <div className="text-xs text-gray-400">🛏️ 住宿日期待定（行程规划里定好该城市日期后显示）</div>
                );
              })()}
              <div className="text-xs text-amber-700">{timingTip(f.type)}</div>
              {/* 实时价格追踪：航班查航班库最新实查价，酒店查实查房价，餐厅/景点显示预订政策 */}
              <FavoritePriceLine name={f.row.title} type={f.type} city={f.city} flight={f.flight} segs={segs} />
            </div>
            <div className="flex gap-2 shrink-0">
              {/* 2026-10-02 用户：行动安排是展示+确定，不是再选。点了"确定"就是最终选择 */}
              {!f.row.done ? (
                <button
                  onClick={() =>
                    save.mutate({
                      id: f.row.id,
                      kind: f.row.kind,
                      title: f.row.title,
                      body: f.row.body,
                      day: f.row.day,
                      done: true,
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700"
                >
                  ✓ 确定
                </button>
              ) : (
                <span className="px-3 py-1.5 rounded-lg bg-green-100 text-green-800 text-xs font-medium">
                  ✓ 已确定
                </span>
              )}
              <button
                onClick={() =>
                  onAddFavorite(
                    f.row.title,
                    f.city,
                    bkindFor(f.type),
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-medium hover:bg-teal-800"
              >
                加入预订
              </button>
              <button
                onClick={() => del.mutate({ id: f.row.id })}
                className="px-2 py-1.5 rounded-lg text-gray-400 text-xs hover:text-gray-600"
                aria-label={`移除收藏${f.row.title}`}
              >
                ✕
              </button>
            </div>
          </div>
            ))}
          </div>
        </div>
      ))}
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
    // 酒店：用 getLiveHotelPrice 查实查房价
    const p = getLiveHotelPrice(name);
    if (p && !p.unavailable && p.base) {
      return (
        <div className="text-xs text-gray-600 mt-1">
          💰 <span className="font-semibold text-teal-700">${p.base.perNightUSD}/晚</span>
          <span className="text-gray-400"> 起 · {p.source}实查 {p.checkedAt}</span>
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
