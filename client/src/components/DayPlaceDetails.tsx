import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { hotels, restaurants, attractions, type Item } from "@/guide/data";
import { getLiveHotelPrice } from "@/guide/hotelLivePrices";
import { bookingPolicyBadge } from "@/bookings/restaurantBookingStatus";

export type AvStatus =
  | "available"
  | "mixed"
  | "full"
  | "soldout"
  | "not_released"
  | "walkin"
  | "unverifiable";

export interface AvRow {
  kind: string;
  name: string;
  city: string;
  party: string;
  dates: string;
  status: AvStatus;
  detail: string;
  channel: string;
  note: string;
  checked_at: string;
}

/** 拉取整张空位余票表（约30条），行程页各处共用 */
export function useAvailability(): Map<string, AvRow> {
  const [map, setMap] = useState<Map<string, AvRow>>(new Map());
  useEffect(() => {
    if (!supabaseConfigured || !supabase) return;
    let live = true;
    supabase
      .from("sea_availability")
      .select("*")
      .eq("trip_ref", "dec2026")
      .then(({ data }) => {
        if (!live || !data) return;
        const m = new Map<string, AvRow>();
        for (const r of data as AvRow[]) m.set(r.name, r);
        setMap(m);
      });
    return () => {
      live = false;
    };
  }, []);
  return map;
}

const AV_STYLE: Record<AvStatus, { r: string; a: string; cls: string }> = {
  available: { r: "有位", a: "有票", cls: "bg-green-600" },
  mixed: { r: "部分有位", a: "部分有票", cls: "bg-amber-600" },
  full: { r: "已订满", a: "已订满", cls: "bg-red-600" },
  soldout: { r: "售罄", a: "售罄", cls: "bg-red-600" },
  not_released: { r: "尚未放位", a: "尚未开售", cls: "bg-gray-500" },
  walkin: { r: "现场排队", a: "随到随买", cls: "bg-blue-600" },
  unverifiable: { r: "在线查不到", a: "在线查不到", cls: "bg-gray-400" },
};

export function placeAnchorId(kind: "酒店" | "餐厅" | "景点", city: string, name: string) {
  return `place-${kind}-${city}-${name}`;
}

export function AvBadge({ status, kind }: { status: AvStatus; kind: "r" | "a" }) {
  const s = AV_STYLE[status];
  if (!s) return null;
  return (
    <span
      className={`inline-block text-xs font-bold text-white rounded-full px-2.5 py-0.5 ${s.cls}`}
    >
      {kind === "r" ? s.r : s.a}
    </span>
  );
}

export function fmtChecked(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function Expandable({
  title,
  right,
  children,
  id,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div id={id} className="bg-white rounded-xl border border-gray-200 shadow-sm scroll-mt-32">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="font-bold text-gray-900">{title}</span>
        <span className="flex items-center gap-2 shrink-0">
          {right}
          <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
        </span>
      </button>
      {open && <div className="px-4 pb-4 pt-1 border-t border-gray-100">{children}</div>}
    </div>
  );
}

function HotelCard({ item }: { item: Item }) {
  const p = getLiveHotelPrice(item.name);
  const priceSummary = p
    ? p.unavailable
      ? "暂无可订房价"
      : p.base
        ? `$${p.base.perNightUSD}/晚起`
        : "有价"
    : null;
  return (
    <Expandable
      id={placeAnchorId("酒店", item.city, item.name)}
      title={item.name}
      right={
        priceSummary && (
          <span className="text-xs font-bold text-teal-700 bg-teal-50 rounded-full px-2.5 py-0.5">
            {priceSummary}
          </span>
        )
      }
    >
      <p className="text-xs text-gray-500 mb-2">{item.meta}</p>
      {p ? (
        <div className="text-sm mb-2">
          <p className="text-xs text-gray-500 mb-1">
            {p.checkIn} → {p.checkOut}（{p.nights} 晚）· 实时房价 USD
          </p>
          {p.unavailable ? (
            <p className="text-sm text-gray-500">{p.unavailable}</p>
          ) : (
            <>
              {p.base && (
                <p className="text-sm">
                  <span className="font-semibold">基础房</span> ${p.base.perNightUSD}/晚 · 整段
                  ${p.base.totalUSD}
                  {p.base.totalInclTax ? "（含税）" : "（税前）"} · {p.base.cancel} · {p.base.breakfast}
                </p>
              )}
              {p.suite && (
                <p className="text-sm mt-1">
                  <span className="font-semibold">套房</span> ${p.suite.perNightUSD}/晚 · 整段
                  ${p.suite.totalUSD}
                  {p.suite.totalInclTax ? "（含税）" : "（税前）"} · {p.suite.cancel} ·{" "}
                  {p.suite.breakfast}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                来源 {p.source} · 查询于 {p.checkedAt} · 房价实时波动，以下单时为准
              </p>
            </>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-400 mb-2">该酒店暂无按行程日期的实时报价。</p>
      )}
      <p className="text-sm text-gray-700 leading-relaxed">{item.detail}</p>
      {item.best && <p className="text-sm text-teal-800 mt-2">💡 {item.best}</p>}
    </Expandable>
  );
}

function PlaceCard({
  item,
  av,
  kind,
}: {
  item: Item;
  av: AvRow | undefined;
  kind: "r" | "a";
}) {
  // 餐厅没有空位数据时，用研究结论明确标注：没查过 / 查过需要预定 / 查过不需要预定
  const policyBadge =
    kind === "r" && !av ? bookingPolicyBadge(item.name) : null;
  return (
    <Expandable
      id={placeAnchorId(kind === "r" ? "餐厅" : "景点", item.city, item.name)}
      title={item.name}
      right={
        av ? (
          <AvBadge status={av.status} kind={kind} />
        ) : policyBadge ? (
          <span
            title={policyBadge.title}
            className={`text-xs font-bold rounded-full px-2.5 py-0.5 border ${policyBadge.cls}`}
          >
            {policyBadge.text}
          </span>
        ) : undefined
      }
    >
      <p className="text-xs text-gray-500 mb-2">
        {item.meta}
        {item.michelin ? ` · ${item.michelin.split("（")[0]}` : ""}
      </p>
      {av && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
          <p className="text-sm text-gray-800 leading-relaxed">{av.detail}</p>
          <p className="text-xs text-gray-500 mt-1">
            {av.dates}
            {av.party ? ` · ${av.party}` : ""} · 渠道：{av.channel}
            {av.checked_at ? ` · 查询于 ${fmtChecked(av.checked_at)}（北京时间）` : ""}
          </p>
        </div>
      )}
      <p className="text-sm text-gray-700 leading-relaxed">{item.detail}</p>
      {item.best && <p className="text-sm text-teal-800 mt-2">💡 {item.best}</p>}
    </Expandable>
  );
}

/** 某天的行程页底部：本城酒店 + 餐厅 + 景点详细信息（含实时价格/空位） */
export function DayPlaceDetails({ cityZh }: { cityZh: string }) {
  const av = useAvailability();
  const cityHotels = hotels.filter((h) => h.city === cityZh);
  const cityRestaurants = restaurants.filter((r) => r.city === cityZh);
  const cityAttractions = attractions.filter((a) => a.city === cityZh);
  if (!cityHotels.length && !cityRestaurants.length && !cityAttractions.length)
    return null;
  return (
    <div className="mb-6">
      <h2 className="font-bold text-lg mb-3">本城{cityZh} · 酒店 / 餐厅 / 景点详情</h2>
      <p className="text-xs text-gray-500 mb-4">
        以下信息与酒店、餐厅、景点页同源（含实时房价与空位余票），点开卡片看完整详情，不用再切页面。
      </p>
      {cityHotels.length > 0 && (
        <section className="mb-5">
          <h3 className="font-bold text-base mb-2">🏨 住宿（{cityHotels.length}家）</h3>
          <div className="space-y-2">
            {cityHotels.map((h) => (
              <HotelCard key={h.name} item={h} />
            ))}
          </div>
        </section>
      )}
      {cityRestaurants.length > 0 && (
        <section className="mb-5">
          <h3 className="font-bold text-base mb-2">🍽️ 餐厅（{cityRestaurants.length}家）</h3>
          <div className="space-y-2">
            {cityRestaurants.map((r) => (
              <PlaceCard key={r.name} item={r} av={av.get(r.name)} kind="r" />
            ))}
          </div>
        </section>
      )}
      {cityAttractions.length > 0 && (
        <section className="mb-5">
          <h3 className="font-bold text-base mb-2">🎡 景点（{cityAttractions.length}个）</h3>
          <div className="space-y-2">
            {cityAttractions.map((a) => (
              <PlaceCard key={a.name} item={a} av={av.get(a.name)} kind="a" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/** 行程总览城市卡片下的一行 compact 摘要：只保留纯计数。
 * 预订/空位/价格类总结已按要求移入预订 Tab（BookingStatusSummary），
 * 行程页开头不再出现。 */
export function CityPlaceSummary({ cityZh }: { cityZh: string }) {
  const nHotel = hotels.filter((h) => h.city === cityZh).length;
  const nRest = restaurants.filter((r) => r.city === cityZh).length;
  const nAttr = attractions.filter((a) => a.city === cityZh).length;
  const parts: string[] = [];
  if (nHotel) parts.push(`🏨 ${nHotel}家`);
  if (nRest) parts.push(`🍽 ${nRest}家`);
  if (nAttr) parts.push(`🎡 ${nAttr}个`);
  if (!parts.length) return null;
  return <p className="text-xs text-gray-500 mt-2">{parts.join(" · ")}</p>;
}
