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
import { getLiveHotelPrice } from "@/guide/hotelLivePrices";
import { FLIGHT_LEGS } from "@/bookings/bookingTimeline";
import { useAvailability, fmtChecked } from "@/components/DayPlaceDetails";

/** 无保存行程时的回退城市（与 BookingStatusSummary 保持一致） */
const FALLBACK_CITIES = [
  "新加坡",
  "普吉",
  "曼谷",
  "清迈",
  "槟城",
  "吉隆坡",
  "胡志明市",
  "富国岛",
];

type MenuKey = "action" | "hotels" | "restaurants" | "flights" | "transport";

/** "2026-09-27 02:40 PDT" / "2026-09-26 15:11 UTC" → "09-27 02:40" */
const shortT = (s?: string | null) => (s ? s.slice(5, 16) : null);

export default function DailyDigestBanner({
  scopeCities,
  onJump,
}: {
  scopeCities?: string[];
  onJump: (m: MenuKey) => void;
}) {
  const av = useAvailability();
  const list = scopeCities && scopeCities.length ? scopeCities : FALLBACK_CITIES;
  const inScope = (city: string) => list.includes(city);

  const hotelLine = useMemo(() => {
    const scoped = hotels.filter((h) => inScope(h.city));
    const priced = scoped.filter((h) => {
      const p = getLiveHotelPrice(h.name);
      return p && !p.unavailable && p.base;
    });
    if (!priced.length) return `0/${scoped.length}家有实时价`;
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
  }, [list.join("|")]);

  const flightLine = useMemo(() => {
    // 2026-09-30 site-improve 口径②：stale 旧方案段不计入最低价/直飞段数/更新时间
    const legs = FLIGHT_LEGS;
    const staleCount = legs.filter((l) => l.stale).length;
    const active = legs.filter((l) => !l.stale);
    if (!legs.length) return "暂无航班数据";
    const minPrice = (kind: "intl" | "intercity") => {
      const ps = active
        .filter((l) => l.kind === kind)
        .flatMap((l) => l.options ?? [])
        .map((o) => o.price)
        .filter((p) => Number.isFinite(p));
      return ps.length ? Math.min(...ps) : null;
    };
    const directLegs = active.filter((l) =>
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
      `${legs.length}段`,
      `${directLegs}段有直飞`,
      minIntl != null ? `国际段 $${minIntl}/人起` : null,
      minInter != null ? `城际段 $${minInter}/2人起` : null,
      `更新于 ${shortT(latest as string) ?? "—"}`,
      staleCount > 0 ? `（旧方案${staleCount}段已停更，未计入）` : null,
    ].filter(Boolean);
    return parts.join(" · ");
  }, []);

  const diningLine = useMemo(() => {
    const scoped = restaurants.filter((r) => inScope(r.city));
    const rows = scoped
      .map((r) => av.get(r.name))
      .filter((x): x is NonNullable<typeof x> => !!x);
    if (!rows.length) return `${scoped.length}家 · 空位数据读取中…`;
    const n = (ss: string[]) => rows.filter((r) => ss.includes(r.status)).length;
    const parts = [
      `${rows.length}/${scoped.length}家已查`,
      `${n(["available"])}家可订`,
    ];
    const mixed = n(["mixed"]);
    if (mixed) parts.push(`${mixed}家部分可订`);
    const full = n(["full", "soldout"]);
    if (full) parts.push(`${full}家满位/售罄`);
    const notRel = n(["not_released"]);
    if (notRel) parts.push(`${notRel}家未开售`);
    const latest = rows
      .map((r) => r.checked_at)
      .filter(Boolean)
      .sort()
      .pop() as string | undefined;
    parts.push(`更新于 ${latest ? fmtChecked(latest) : "—"}`);
    return parts.join(" · ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [av, list.join("|")]);

  const ticketLine = useMemo(() => {
    const scoped = attractions.filter((a) => inScope(a.city));
    const rows = scoped
      .map((a) => av.get(a.name))
      .filter((x): x is NonNullable<typeof x> => !!x);
    if (!rows.length) return `${scoped.length}个 · 余票数据读取中…`;
    const n = (ss: string[]) => rows.filter((r) => ss.includes(r.status)).length;
    const parts = [
      `${rows.length}/${scoped.length}个已查`,
      `${n(["available"])}个有票`,
    ];
    const sold = n(["full", "soldout"]);
    if (sold) parts.push(`${sold}个售罄`);
    const notRel = n(["not_released"]);
    if (notRel) parts.push(`${notRel}个未开售`);
    const latest = rows
      .map((r) => r.checked_at)
      .filter(Boolean)
      .sort()
      .pop() as string | undefined;
    parts.push(`更新于 ${latest ? fmtChecked(latest) : "—"}`);
    return parts.join(" · ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [av, list.join("|")]);

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
