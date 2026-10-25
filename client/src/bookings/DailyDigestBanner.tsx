/**
 * /bookings 页顶：每日预订动态横幅。
 *
 * 把三个每日自动任务的最新结果汇总成四行，一眼看清，不用逐项翻：
 * - 🏨 酒店：client/src/guide/hotelLivePrices.ts（hotel-price-watch 每日更新）
 * - ✈️ 航班：FLIGHT_LEGS（flight-refresh-daily 每日更新；stale 旧方案段不计入最低价/直飞段数）
 * - 🍽️ 餐厅 / 🎡 景点：Supabase public.sea_availability（availability-watch 每日更新）
 *
 * 横幅直接读各任务写回的数据源：任务更新了网站，横幅显示自动就是新的，
 * 不需要改任何任务逻辑。点每一行可跳到对应二级菜单看明细。
 */
import { useMemo } from "react";
import { hotels, restaurants, attractions } from "@/guide/data";
import { getLiveHotelPrice, livePriceDatasetStatus } from "@/guide/hotelLivePrices";
import { FLIGHT_LEGS } from "@/bookings/bookingTimeline";
import { useAvailabilityWithStatus, fmtChecked } from "@/components/DayPlaceDetails";
import { useDatasetsVersion } from "@/lib/datasets";
import { useRecordsData } from "@/pages/records/shared";
import { parseBookingBody } from "@/bookings/bookingTypes";
import { nameHit } from "@/bookings/nameMatch";

/** 无保存行程时的回退城市（与 BookingStatusSummary 保持一致） */
const FALLBACK_CITIES = [
  "新加坡",
  "普吉",
  "曼谷",
  "清迈",
  "首尔",
];

type MenuKey = "action" | "hotels" | "restaurants" | "flights";

/** "2026-09-27 02:40 PDT" / "2026-09-26 15:11 UTC" → "09-27 02:40" */
const shortT = (s?: string | null) => (s ? s.slice(5, 16) : null);

export default function DailyDigestBanner({
  scopeCities,
  onJump,
}: {
  scopeCities?: string[];
  onJump: (m: MenuKey) => void;
}) {
  const { map: av, status: avStatus } = useAvailabilityWithStatus();
  /* 已确认预订（与行动队列同口径，2026-10-24 误报修复续）：监控查的是散客档，
   * 已订餐厅/景点以记录为准——满位/售罄与未开售计数一律排除已订同名项
   * （对账尺 @/bookings/nameMatch 的 nameHit，与 NextActionQueue 共用）。 */
  const { rows: bkRows } = useRecordsData(["booking"]);
  const bookedTitles = useMemo(() => {
    const rest: string[] = [];
    const attr: string[] = [];
    for (const r of bkRows) {
      if (!r.done) continue;
      const d = parseBookingBody(r.body);
      if (d.bkind === "restaurant") rest.push(r.title);
      else if (d.bkind === "attraction") attr.push(r.title);
    }
    return { rest, attr };
  }, [bkRows]);
  const hitBooked = (titles: string[], name: string) =>
    titles.some((t) => nameHit(name, t));
  // 数据集到达后横幅必须重算：hotel_live_prices / flight_db 都是先空后灌入的
  // 可变存储，只按城市列表 memo 会把首屏的空结果冻住不刷新（2026-10-13 审计）。
  const dsVersion = useDatasetsVersion();
  const list = scopeCities && scopeCities.length ? scopeCities : FALLBACK_CITIES;
  const inScope = (city: string) => list.includes(city);

  const hotelLine = useMemo(() => {
    const scoped = hotels.filter((h) => inScope(h.city));
    const priced = scoped.filter((h) => {
      const p = getLiveHotelPrice(h.name);
      return p && !p.unavailable && p.base;
    });
    if (!priced.length) {
      // 未就绪不许冒充「0 家有价」：加载中/加载失败与 ready 后确实无价分开写
      const st = livePriceDatasetStatus();
      if (st === "error") return "价格加载失败，刷新页面会重新加载";
      if (st !== "ready") return "价格加载中…";
      return `0/${scoped.length}家有实时价`;
    }
    const min = Math.min(
      ...priced.map((h) => getLiveHotelPrice(h.name)!.base!.perNightUSD)
    );
    const latest = priced
      .map((h) => getLiveHotelPrice(h.name)!.checkedAt)
      .filter(Boolean)
      .sort()
      .pop();
    return `${priced.length}/${scoped.length}家有实时价 · 最低 $${min}/晚起 · 更新于 ${shortT(latest) ?? "—"}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.join("|"), dsVersion]);

  const flightLine = useMemo(() => {
    // 2026-09-30 site-improve 口径②：stale 旧方案段不计入最低价/直飞段数/更新时间
    const legs = FLIGHT_LEGS;
    const staleCount = legs.filter((l) => l.stale).length;
    const active = legs.filter((l) => !l.stale);
    if (!legs.length) return "暂无航班数据";
    const pending = active.filter((l) => !l.ticketed);
    const ticketedCount = active.length - pending.length;
    const minPrice = (kind: "intl" | "intercity") => {
      const ps = pending
        .filter((l) => l.kind === kind)
        .flatMap((l) => l.options ?? [])
        .map((o) => o.price)
        .filter((p): p is number => p != null && Number.isFinite(p));
      return ps.length ? Math.min(...ps) : null;
    };
    const directLegs = pending.filter((l) =>
      (l.options ?? []).some((o) => (o.stops ?? 0) === 0)
    ).length;
    const minIntl = minPrice("intl");
    const minInter = minPrice("intercity");
    const latest = active
      .map((l) => l.queriedAt)
      .filter(Boolean)
      .sort()
      .pop();
    const parts = [
      `${active.length}段`,
      `${ticketedCount}段已出票`,
      `${pending.length}段待订（${directLegs}段有直飞）`,
      minIntl != null ? `国际段 $${minIntl}/人起` : null,
      minInter != null ? `城际段 $${minInter}/2人起` : null,
      `更新于 ${shortT(latest as string) ?? "—"}`,
      staleCount > 0 ? `（旧方案${staleCount}段已停更，未计入）` : null,
    ].filter(Boolean);
    return parts.join(" · ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dsVersion]);

  const diningLine = useMemo(() => {
    const scoped = restaurants.filter((r) => inScope(r.city));
    const entries = scoped
      .map((r) => ({ name: r.name, row: av.get(r.name) }))
      .filter((e): e is { name: string; row: NonNullable<typeof e.row> } => !!e.row);
    if (!entries.length) {
      // 未就绪不许冒充「读取中」：加载失败与还在加载、已加载无数据分开写
      if (avStatus === "error") return `${scoped.length}家 · 空位数据加载失败，刷新页面重试`;
      if (avStatus !== "ready") return `${scoped.length}家 · 空位数据读取中…`;
      return `${scoped.length}家 · 暂无空位数据`;
    }
    const rows = entries.map((e) => e.row);
    /* 已订餐厅不计入满位/售罄与未开售：监控售罄查的多是另一门店/时段的散客档，
     * 与已确认的本单无关（Jumbo 实祸）；可订/部分可订是真实余位信息，照实计。 */
    const n = (ss: string[], excludeBooked = false) =>
      entries.filter(
        (e) =>
          ss.includes(e.row.status) &&
          !(excludeBooked && hitBooked(bookedTitles.rest, e.name)),
      ).length;
    const parts = [
      `${rows.length}/${scoped.length}家已查`,
      `${n(["available"])}家可订`,
    ];
    const mixed = n(["mixed"]);
    if (mixed) parts.push(`${mixed}家部分可订`);
    const full = n(["full", "soldout"], true);
    if (full) parts.push(`${full}家满位/售罄`);
    const notRel = n(["not_released"], true);
    if (notRel) parts.push(`${notRel}家未开售`);
    const latest = rows
      .map((r) => r.checked_at)
      .filter(Boolean)
      .sort()
      .pop() as string | undefined;
    parts.push(`更新于 ${latest ? fmtChecked(latest) : "—"}`);
    return parts.join(" · ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [av, avStatus, list.join("|"), bookedTitles.rest.join("|")]);

  const ticketLine = useMemo(() => {
    const scoped = attractions.filter((a) => inScope(a.city));
    const entries = scoped
      .map((a) => ({ name: a.name, row: av.get(a.name) }))
      .filter((e): e is { name: string; row: NonNullable<typeof e.row> } => !!e.row);
    if (!entries.length) {
      if (avStatus === "error") return `${scoped.length}个 · 余票数据加载失败，刷新页面重试`;
      if (avStatus !== "ready") return `${scoped.length}个 · 余票数据读取中…`;
      return `${scoped.length}个 · 暂无余票数据`;
    }
    const rows = entries.map((e) => e.row);
    /* 与餐厅行同口径：已订景点不计入售罄与未开售，有票照实计。 */
    const n = (ss: string[], excludeBooked = false) =>
      entries.filter(
        (e) =>
          ss.includes(e.row.status) &&
          !(excludeBooked && hitBooked(bookedTitles.attr, e.name)),
      ).length;
    const parts = [
      `${rows.length}/${scoped.length}个已查`,
      `${n(["available"])}个有票`,
    ];
    const sold = n(["full", "soldout"], true);
    if (sold) parts.push(`${sold}个售罄`);
    const notRel = n(["not_released"], true);
    if (notRel) parts.push(`${notRel}个未开售`);
    const latest = rows
      .map((r) => r.checked_at)
      .filter(Boolean)
      .sort()
      .pop() as string | undefined;
    parts.push(`更新于 ${latest ? fmtChecked(latest) : "—"}`);
    return parts.join(" · ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [av, avStatus, list.join("|"), bookedTitles.attr.join("|")]);

  const rows: { icon: string; label: string; text: string; jump: MenuKey }[] = [
    { icon: "🏨", label: "酒店", text: hotelLine, jump: "hotels" },
    { icon: "✈️", label: "航班", text: flightLine, jump: "flights" },
    { icon: "🍽️", label: "餐厅", text: diningLine, jump: "restaurants" },
    { icon: "🎡", label: "景点", text: ticketLine, jump: "action" },
  ];

  return (
    <section
      aria-label="每日预订动态"
      className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50/70 px-4 py-3"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <h2 className="font-bold text-gray-900">🔔 每日预订动态</h2>
        <span className="text-xs text-gray-500">
          每天自动更新 · 有重要变化会单独提醒你
        </span>
      </div>
      <div className="space-y-1">
        {rows.map((r) => (
          <button
            key={r.label}
            onClick={() => onJump(r.jump)}
            className="w-full flex items-center gap-2 text-left text-sm rounded-lg px-2 py-1.5 hover:bg-white/70 transition-colors"
          >
            <span className="shrink-0">{r.icon}</span>
            <span className="font-bold text-gray-800 shrink-0">{r.label}</span>
            <span className="text-gray-600 truncate">{r.text}</span>
            <span className="ml-auto text-indigo-400 text-xs shrink-0">查看 →</span>
          </button>
        ))}
      </div>
    </section>
  );
}
