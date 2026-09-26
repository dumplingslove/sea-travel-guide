/**
 * /bookings 预订行动时间线：按"最晚行动时间"分组，不是按类目堆砌。
 * 行动（本组件）/ 参考（BookingStatusSummary 城市明细）/ 记录（用户预订记录）三层分工。
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { hotels, restaurants } from "@/guide/data";
import { getLiveHotelPrice } from "@/guide/hotelLivePrices";
import {
  getRestaurantBookingPolicy,
  bookingPolicyBadge,
} from "./restaurantBookingStatus";
import { placeDetailPath } from "@/guide/placeDetail";
import type { ChecklistItem } from "./bookingTypes";
import {
  FLIGHT_LEGS,
  HOTEL_STAYS,
  ADVANCE_TICKETS,
  GROUP_META,
  type BookByGroup,
} from "./bookingTimeline";

const KIND_BADGE: Record<string, string> = {
  flight: "bg-indigo-600 text-white",
  hotel: "bg-teal-700 text-white",
  restaurant: "bg-amber-600 text-white",
  attraction: "bg-sky-600 text-white",
};
const KIND_LABEL: Record<string, string> = {
  flight: "机票",
  hotel: "酒店",
  restaurant: "餐厅",
  attraction: "景点",
};

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border border-teal-600 text-teal-700 hover:bg-teal-700 hover:text-white transition-colors"
    >
      ＋ 加入预订
    </button>
  );
}

/** 时间线条目已加入记录后的原地状态 */
export interface TimelineMatch {
  confirmed: boolean;
  summary?: string;
  onView: () => void;
}

function Row({
  kind,
  name,
  meta,
  headline,
  sub,
  to,
  onAdd,
  added,
}: {
  kind: string;
  name: string;
  meta: string;
  headline: React.ReactNode;
  sub?: string;
  to?: string;
  onAdd?: () => void;
  added?: TimelineMatch;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span
        className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${KIND_BADGE[kind]}`}
      >
        {KIND_LABEL[kind]}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {to ? (
            <Link
              to={to}
              className="font-medium text-gray-900 hover:text-teal-700 hover:underline truncate"
            >
              {name}
            </Link>
          ) : (
            <span className="font-medium text-gray-900 truncate">{name}</span>
          )}
          <span className="text-xs text-gray-400 shrink-0">{meta}</span>
        </div>
        <div className="mt-0.5 text-sm text-gray-600">{headline}</div>
        {added?.summary && (
          <div className="mt-0.5 text-xs text-teal-700 font-medium truncate">
            {added.confirmed ? "✓ " : "· "}
            {added.summary}
          </div>
        )}
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
      {added ? (
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
              added.confirmed
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {added.confirmed ? "✓ 已确认" : "待确认"}
          </span>
          <button
            onClick={added.onView}
            className="text-xs text-teal-700 underline underline-offset-2"
          >
            查看 / 修改
          </button>
        </div>
      ) : (
        onAdd && <AddButton onClick={onAdd} />
      )}
    </div>
  );
}

function Group({
  id,
  count,
  children,
  defaultOpen = true,
}: {
  id: BookByGroup;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const g = GROUP_META[id];
  return (
    <section className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
      >
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${g.dot}`} />
        <span className="font-bold text-gray-900">{g.title}</span>
        <span className="text-xs text-gray-400 truncate flex-1">{g.hint}</span>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 shrink-0">
          {count}
        </span>
        <span className="text-gray-400 text-xs shrink-0">
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && <div className="px-4 pb-3 pt-1 border-t border-gray-100">{children}</div>}
    </section>
  );
}

function fmtChecked(iso: string): string {
  const m = iso.match(/(\d+)-(\d+)-(\d+)/);
  return m ? `${Number(m[2])}-${Number(m[3])}` : iso;
}

export default function BookingTimeline({
  onAdd,
  matchRecord,
}: {
  onAdd: (item: ChecklistItem) => void;
  /** 时间线条目 → 已加入的记录（原地转已确认用）；没有返回 undefined */
  matchRecord: (item: ChecklistItem) => TimelineMatch | undefined;
}) {
  const mk = (
    id: string,
    bkind: ChecklistItem["bkind"],
    name: string,
    city: string,
    extra: Partial<ChecklistItem> = {},
  ): ChecklistItem => ({ id, bkind, name, city, ...extra });

  /** 条目动作：已加入 → 原地状态；未加入 → ＋ 加入预订 */
  const actionFor = (item: ChecklistItem): { onAdd?: () => void; added?: TimelineMatch } => {
    const added = matchRecord(item);
    if (added) return { added };
    return { onAdd: () => onAdd(item) };
  };

  // ---- 酒店：每城最低参考价 ----
  const cityMinPrice = (city: string): string | null => {
    const list = hotels.filter((h) => h.city === city);
    let min: number | null = null;
    let when = "";
    list.forEach((h) => {
      const p = getLiveHotelPrice(h.name);
      if (p && !p.unavailable && p.base) {
        if (min == null || p.base.perNightUSD < min) {
          min = p.base.perNightUSD;
          when = p.checkedAt;
        }
      }
    });
    return min != null ? `$${min}/晚起 · 查于${fmtChecked(when)}` : null;
  };

  // ---- 餐厅：按政策分组（仅四城） ----
  const four = ["新加坡", "普吉", "曼谷", "清迈"];
  const rests = restaurants.filter((r) => four.includes(r.city));
  const mustBook = rests.filter(
    (r) => getRestaurantBookingPolicy(r.name)?.policy === "must_book",
  );
  const peakRec = rests.filter(
    (r) => getRestaurantBookingPolicy(r.name)?.policy === "peak_recommended",
  );
  const localCount = rests.filter((r) => {
    const p = getRestaurantBookingPolicy(r.name)?.policy;
    return p === "walkup_or_queue" || p === "free_no_booking";
  }).length;

  return (
    <div className="mb-8">
      {/* 现在就锁：机票 */}
      <Group id="now" count={FLIGHT_LEGS.length}>
        {FLIGHT_LEGS.map((f) => {
          const isIntl = f.kind === "intl";
          const headline = isIntl ? (
            <span className="text-amber-700">待定：尚未比价选定</span>
          ) : f.priceNote ? (
            <span>
              <b className="text-teal-700">{f.priceNote}</b>
              {f.carrier && <span className="text-gray-500"> · {f.carrier}</span>}
              {f.schedule && <span className="text-gray-500"> · {f.schedule}</span>}
              {f.fragile && (
                <span className="text-rose-600 font-medium"> · 当天仅1班，先锁这段</span>
              )}
            </span>
          ) : (
            <span className="text-gray-400">价格核验中…</span>
          );
          return (
            <Row
              key={f.id}
              kind="flight"
              name={f.route}
              meta={`${f.dateLabel} · D${f.day}转场`}
              headline={headline}
              sub={f.note}
              {...actionFor(
                mk(`tl-${f.id}`, "transport", `机票 ${f.route}`, "", {
                  date: f.date || undefined,
                  day: f.day,
                  note: f.note,
                }),
              )}
            />
          );
        })}
        <p className="text-xs text-gray-400 mt-2">
          城际 3 段价格为 2 成人实查价（Duffel 2026-09-26，动态，会变；三段合计最低 $1117.00/2人）；出票前重查退改政策。
        </p>
      </Group>

      {/* 提前60天：酒店 */}
      <Group id="d60" count={HOTEL_STAYS.length}>
        {HOTEL_STAYS.map((s) => {
          const cands = hotels.filter((h) => h.city === s.city);
          const min = cityMinPrice(s.city);
          return (
            <Row
              key={s.city}
              kind="hotel"
              name={`${s.city} · 选 1 家`}
              meta={`${s.checkInLabel}入住 ${s.nights}晚 · ${s.daysLabel}`}
              headline={
                min ? (
                  <span>
                    {cands.length} 家候选 · <b className="text-teal-700">{min}</b>
                  </span>
                ) : (
                  <span className="text-gray-400">{cands.length} 家候选 · 暂无实时价</span>
                )
              }
              sub="下方城市参考区有每家明细；价格按旧行程日期查询，仅供参考，明早自动按新日期重查"
              to="#city-ref"
              {...actionFor(
                mk(`tl-hotel-${s.city}`, "hotel", `${s.city}酒店（待选定）`, s.city, {
                  date: `2026-${s.checkInLabel.replace("-", "-")}`,
                  note: `${s.nights}晚 · ${cands.length}家候选`,
                }),
              )}
            />
          );
        })}
      </Group>

      {/* 提前30天：必须订位的餐厅 */}
      <Group id="d30" count={mustBook.length}>
        {mustBook.map((r) => {
          const badge = bookingPolicyBadge(r.name);
          return (
            <Row
              key={r.name}
              kind="restaurant"
              name={r.name}
              meta={r.city}
              headline={
                <span
                  title={badge.title}
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${badge.cls}`}
                >
                  {badge.text}
                </span>
              }
              sub={getRestaurantBookingPolicy(r.name)?.reason}
              to={placeDetailPath("restaurant", r.city, r.name)}
              {...actionFor(
                mk(`tl-rest-${r.name}`, "restaurant", r.name, r.city, {
                  note: `预订政策：${badge.text}`,
                }),
              )}
            />
          );
        })}
      </Group>

      {/* 提前14天：建议订位 + 提前购票 */}
      <Group id="d14" count={peakRec.length + ADVANCE_TICKETS.length}>
        {peakRec.map((r) => {
          const badge = bookingPolicyBadge(r.name);
          return (
            <Row
              key={r.name}
              kind="restaurant"
              name={r.name}
              meta={r.city}
              headline={
                <span
                  title={badge.title}
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${badge.cls}`}
                >
                  {badge.text}
                </span>
              }
              sub={getRestaurantBookingPolicy(r.name)?.reason}
              to={placeDetailPath("restaurant", r.city, r.name)}
              {...actionFor(
                mk(`tl-rest-${r.name}`, "restaurant", r.name, r.city, {
                  note: `预订政策：${badge.text}`,
                }),
              )}
            />
          );
        })}
        {ADVANCE_TICKETS.map((a) => (
          <Row
            key={a.name}
            kind="attraction"
            name={a.name}
            meta={a.city}
            headline={<span className="text-sky-700 font-medium">建议提前购票</span>}
            sub={a.reason}
            to={placeDetailPath("attraction", a.city, a.name)}
            {...actionFor(
              mk(`tl-attr-${a.name}`, "attraction", a.name, a.city, {
                day: a.day ?? null,
                note: a.reason,
              }),
            )}
          />
        ))}
        {ADVANCE_TICKETS.length === 0 && (
          <p className="text-xs text-gray-400 mt-1">
            景点提前购票清单核验中，有研究结论的会列在这里。
          </p>
        )}
      </Group>

      {/* 当地解决 */}
      <Group id="local" count={localCount} defaultOpen={false}>
        <p className="text-sm text-gray-600 py-2">
          四城共 <b>{localCount}</b> 家餐厅无需提前操作（现场排队或直接前往），
          完整名单在下方城市参考区。
        </p>
      </Group>
    </div>
  );
}
