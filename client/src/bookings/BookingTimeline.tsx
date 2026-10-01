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
  expandLabel,
  expandContent,
}: {
  kind: string;
  name: string;
  meta: string;
  headline: React.ReactNode;
  sub?: string;
  to?: string;
  onAdd?: () => void;
  added?: TimelineMatch;
  /** 展开按钮文案，如"看 13 个直飞选项"；不传则无展开区 */
  expandLabel?: string;
  /** 展开后在原地显示的候选对比 / 点选内容 */
  expandContent?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
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
      {expandContent && (
        <div className="mt-1.5 ml-0 sm:ml-[68px]">
          <button
            onClick={() => setOpen(!open)}
            className="text-xs font-medium text-teal-700 hover:underline"
          >
            {open ? "收起 ▲" : `${expandLabel ?? "看候选"} ▼`}
          </button>
          {open && (
            <div className="mt-2 rounded-lg bg-gray-50 border border-gray-200 p-2.5">
              {expandContent}
            </div>
          )}
        </div>
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

/** 候选点选按钮：未选 → 点选按钮；已加入 → 原地状态（与 Row 右侧一致） */
function PickState({
  action,
  pickLabel,
}: {
  action: { onAdd?: () => void; added?: TimelineMatch };
  pickLabel: string;
}) {
  if (action.added) {
    const a = action.added;
    return (
      <div className="shrink-0 flex flex-col items-end gap-1">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
            a.confirmed
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {a.confirmed ? "✓ 已确认" : "待确认"}
        </span>
        <button
          onClick={a.onView}
          className="text-xs text-teal-700 underline underline-offset-2"
        >
          查看 / 修改
        </button>
      </div>
    );
  }
  return action.onAdd ? (
    <button
      onClick={action.onAdd}
      className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full bg-teal-700 text-white hover:bg-teal-800 transition-colors"
    >
      {pickLabel}
    </button>
  ) : null;
}

/** 城市停留日期标签，如"新加坡 · 12/6–12/10 · D1–D5"（按 HOTEL_STAYS 推导） */
function cityStayLabel(city: string): string {
  const s = HOTEL_STAYS.find((x) => x.city === city);
  if (!s) return city;
  const [m, d] = s.checkInLabel.split("-").map(Number);
  const start = new Date(2026, m - 1, d);
  const end = new Date(start.getTime() + (s.nights - 1) * 86400000);
  const f = (dt: Date) => `${dt.getMonth() + 1}/${dt.getDate()}`;
  return `${city} · ${f(start)}–${f(end)} · ${s.daysLabel}`;
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

  /** 餐厅行：行内"加入预订"与展开区"就选这家"共用同一预订项，选定即进预订记录 */
  const restRow = (r: (typeof rests)[number]) => {
    const badge = bookingPolicyBadge(r.name);
    const item = mk(`tl-rest-${r.name}`, "restaurant", r.name, r.city, {
      note: `预订政策：${badge.text}`,
    });
    const act = actionFor(item);
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
        expandLabel="看详情选这家"
        expandContent={
          <div className="text-xs text-gray-600 space-y-1.5">
            <div className="text-gray-500">{r.meta}</div>
            {r.detail && (
              <div>
                {r.detail.length > 160 ? r.detail.slice(0, 160) + "…" : r.detail}
              </div>
            )}
            <div className="flex items-center justify-between gap-2 pt-1">
              <Link
                to={placeDetailPath("restaurant", r.city, r.name)}
                className="text-teal-700 underline underline-offset-2"
              >
                完整详情页
              </Link>
              <PickState action={act} pickLabel="就选这家" />
            </div>
          </div>
        }
        onAdd={act.onAdd}
        added={act.added}
      />
    );
  };

  /** 餐厅按城市+停留日期分组展示 */
  const restGroups = (list: typeof rests) =>
    four.map((city) => {
      const items = list.filter((r) => r.city === city);
      if (items.length === 0) return null;
      return (
        <div key={city}>
          <div className="mt-3 mb-1 text-xs font-bold text-gray-700 bg-gray-100 rounded px-2 py-1">
            {cityStayLabel(city)}
          </div>
          {items.map(restRow)}
        </div>
      );
    });

  return (
    <div className="mb-8">
      {/* 现在就锁：机票 */}
      <Group id="now" count={FLIGHT_LEGS.length}>
        {FLIGHT_LEGS.map((f) => {
          const isIntl = f.kind === "intl";
          const directCount = (f.options ?? []).filter((o) => (o.stops ?? 0) === 0).length;
          const nonstopBadge = f.flightState === "ok" ? (
            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-600 text-white align-middle">
              ✈️ 直飞
            </span>
          ) : null;
          const staleBadge = f.stale ? (
            <span
              title="自 2026-09-29 起回程方案改为北京→首尔（停留2天）→西雅图；本候选为旧方案，价格不再刷新，仅供参考"
              className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-600 text-white align-middle"
            >
              ⚠️ 旧方案 · 已停更
            </span>
          ) : null;
          const headline = (
            <>
              {staleBadge}
              {f.flightState === "none" ? (
            <span className="text-gray-500">
              暂无直飞{f.queriedAt ? `（${f.queriedAt}实查）` : ""}
            </span>
          ) : isIntl ? (
            <span>
              <span className="text-amber-700">待定：尚未比价选定</span>
              {nonstopBadge}
            </span>
          ) : f.priceNote ? (
            <span>
              {nonstopBadge}
              <b className="text-teal-700">{f.priceNote}</b>
              {f.businessPriceNote && (
                <span className="text-gray-500"> · 商务舱 {f.businessPriceNote}</span>
              )}
              {f.carrier && <span className="text-gray-500"> · {f.carrier}</span>}
              {f.schedule && <span className="text-gray-500"> · {f.schedule}</span>}
              {f.fragile && (
                <span className="text-rose-600 font-medium"> · 当天仅1班，先锁这段</span>
              )}
            </span>
          ) : (
            <span className="text-gray-400">价格核验中…</span>
          )}
            </>
          );
          return (
            <Row
              key={f.id}
              kind="flight"
              name={f.route}
              meta={f.stale ? `${f.dateLabel} · 旧方案候选` : `${f.dateLabel} · D${f.day}转场`}
              headline={headline}
              sub={
                f.stale
                  ? `${f.note}（旧方案已停更：自 2026-09-29 起回程改为北京→首尔停留2天，本候选价格不再刷新，仅供参考）`
                  : f.note
              }
              expandLabel={
                f.options && f.options.length > 0
                  ? directCount === f.options.length
                    ? `看 ${f.options.length} 个直飞选项`
                    : `看 ${f.options.length} 个选项（${directCount}个直飞）`
                  : undefined
              }
              expandContent={
                f.options && f.options.length > 0 ? (
                  <div className="space-y-1.5">
                    {f.options.map((o) => {
                      const act = actionFor(
                        mk(
                          `tl-flight-${f.id}-${o.flight}`,
                          "transport",
                          `机票 ${f.route} ${o.carrier}${o.flight}`,
                          "",
                          {
                            date: f.date || undefined,
                            day: f.day,
                            note: `${o.depart}→${o.arrive}${
                              o.arrivePlusDay ? "+1" : ""
                            } · $${o.price}${
                              f.priceBasis ? `（${f.priceBasis}）` : ""
                            }${o.bags ? ` · 托运${o.bags}` : ""}`,
                          },
                        ),
                      );
                      return (
                        <div
                          key={`${o.flight}-${o.depart}`}
                          className={`rounded-lg border px-2.5 py-2 flex items-center gap-2 ${
                            o.recommend
                              ? "border-teal-500 bg-teal-50/60"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">
                              {o.recommend && (
                                <span className="mr-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-600 text-white align-middle">
                                  推荐
                                </span>
                              )}
                              {o.carrier} {o.flight}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {o.depart} → {o.arrive}
                              {o.arrivePlusDay ? "+1" : ""} ·{" "}
                              {(o.stops ?? 0) === 0 ? (
                                <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-600 text-white align-middle">
                                  ✈️ 直飞
                                </span>
                              ) : (
                                `${o.stops}停${o.via ? `经${o.via}` : ""}`
                              )}{" "}
                              ·{" "}
                              <b className="text-teal-700">${o.price}</b>
                              {f.priceBasis ? `（${f.priceBasis}）` : ""}
                              {o.bags ? ` · 托运${o.bags}` : ""} ·{" "}
                              {o.refundable === "yes"
                                ? "可退"
                                : o.refundable === "no"
                                ? "不可退"
                                : "退改待查"}
                              {o.changeable === "yes" ? "/可改" : ""}
                            </div>
                            {o.recommend && o.recommendReason && (
                              <div className="text-xs text-teal-700 mt-0.5">
                                {o.recommendReason}
                              </div>
                            )}
                          </div>
                          <PickState action={act} pickLabel="选这班" />
                        </div>
                      );
                    })}
                    <div className="text-[11px] text-gray-400 pt-0.5">
                      Google Flights 实查{f.queriedAt ? ` ${f.queriedAt}` : ""}
                      {f.stale
                        ? "；本候选为旧方案已停更，价格不再刷新，仅供参考"
                        : "；价格动态，出票前重查退改"}
                    </div>
                    {f.businessOptions && f.businessOptions.length > 0 && (
                      <div className="pt-2">
                        <div className="text-xs font-medium text-gray-700 mb-1.5">商务舱直飞</div>
                        {f.businessOptions.map((o) => (
                          <div
                            key={`biz-${o.flight}-${o.depart}`}
                            className="rounded-lg border px-2.5 py-2 flex items-center gap-2 border-purple-200 bg-purple-50/40 mb-1.5"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900">
                                <span className="mr-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-600 text-white align-middle">
                                  商务
                                </span>
                                {o.carrier} {o.flight}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {o.depart} → {o.arrive}
                                {o.arrivePlusDay ? "+1" : ""} ·{" "}
                                <b className="text-purple-700">${o.price}</b>
                                {f.priceBasis ? `（${f.priceBasis}）` : ""}
                              </div>
                              {o.recommendReason && (
                                <div className="text-xs text-purple-700 mt-0.5">
                                  {o.recommendReason}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : undefined
              }
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
          8 段价格为 Google Flights 2026-09-27 实查价（动态，会变）；泰国顺序为普吉→清迈→曼谷→西安；出票前重查退改政策。
        </p>
      </Group>

      {/* 提前60天：酒店 */}
      <Group id="d60" count={HOTEL_STAYS.length}>
        {HOTEL_STAYS.map((s) => {
          const cands = hotels
            .filter((h) => h.city === s.city)
            .map((h) => ({ h, p: getLiveHotelPrice(h.name) }))
            .sort((a, b) => {
              const pa =
                a.p && !a.p.unavailable && a.p.base
                  ? a.p.base.perNightUSD
                  : Infinity;
              const pb =
                b.p && !b.p.unavailable && b.p.base
                  ? b.p.base.perNightUSD
                  : Infinity;
              return pa - pb;
            });
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
              sub="点「看候选」直接对比选定；价格按行程日期查询，仅供参考"
              to="#city-ref"
              expandLabel={`看 ${cands.length} 家候选`}
              expandContent={
                <div>
                  {cands.map(({ h, p }) => {
                    const act = actionFor(
                      mk(`tl-hotel-pick-${s.city}-${h.name}`, "hotel", h.name, s.city, {
                        date: `2026-${s.checkInLabel}`,
                        note: `${s.checkInLabel}入住 ${s.nights}晚${
                          p && !p.unavailable && p.base
                            ? ` · $${p.base.perNightUSD}/晚`
                            : ""
                        }`,
                      }),
                    );
                    return (
                      <div
                        key={h.name}
                        className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-medium text-gray-900">
                              {h.name}
                            </span>
                            {h.hotelGroup === "Marriott" && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-900 text-amber-300">
                                Marriott
                              </span>
                            )}
                            {h.hotelGroup === "Hyatt" && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-800 text-white">
                                Hyatt
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{h.meta}</div>
                          {p && !p.unavailable && p.base ? (
                            <div className="text-xs mt-0.5">
                              <b className="text-teal-700">
                                ${p.base.perNightUSD}/晚
                              </b>
                              <span className="text-gray-400">
                                {" "}
                                · 查于{fmtChecked(p.checkedAt)}
                              </span>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 mt-0.5">暂无实时价</div>
                          )}
                          {h.best && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              {h.best.length > 90 ? h.best.slice(0, 90) + "…" : h.best}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <PickState action={act} pickLabel="选这家" />
                          <Link
                            to={placeDetailPath("hotel", h.city, h.name)}
                            className="text-xs text-teal-700 underline underline-offset-2"
                          >
                            详情
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              }
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

      {/* 提前30天：必须订位的餐厅（按城市+停留日期分组） */}
      <Group id="d30" count={mustBook.length}>
        {restGroups(mustBook)}
      </Group>

      {/* 提前14天：建议订位 + 提前购票 */}
      <Group id="d14" count={peakRec.length + ADVANCE_TICKETS.length}>
        {restGroups(peakRec)}
        {four.map((city) => {
          const items = ADVANCE_TICKETS.filter((a) => a.city === city);
          if (items.length === 0) return null;
          return (
            <div key={`attr-${city}`}>
              <div className="mt-3 mb-1 text-xs font-bold text-gray-700 bg-gray-100 rounded px-2 py-1">
                {cityStayLabel(city)}
              </div>
              {items.map((a) => {
                const item = mk(`tl-attr-${a.name}`, "attraction", a.name, a.city, {
                  day: a.day ?? null,
                  note: a.reason,
                });
                const act = actionFor(item);
                return (
                  <Row
                    key={a.name}
                    kind="attraction"
                    name={a.name}
                    meta={a.city}
                    headline={
                      a.level === "must" ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200">
                          必须提前订票
                        </span>
                      ) : (
                        <span className="text-sky-700 font-medium">建议提前购票</span>
                      )
                    }
                    sub={a.reason}
                    to={placeDetailPath("attraction", a.city, a.name)}
                    expandLabel="查看选这个"
                    expandContent={
                      <div className="text-xs text-gray-600 space-y-1.5">
                        <div>
                          <span className="font-medium text-gray-700">
                            为什么提前订：
                          </span>
                          {a.reason}
                        </div>
                        {a.channel && (
                          <div>
                            <span className="font-medium text-gray-700">
                              购票渠道：
                            </span>
                            {a.channel}
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-3">
                            {a.ticketUrl && (
                              <a
                                href={a.ticketUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-teal-700 underline underline-offset-2"
                              >
                                官方购票 ↗
                              </a>
                            )}
                            <Link
                              to={placeDetailPath("attraction", a.city, a.name)}
                              className="text-teal-700 underline underline-offset-2"
                            >
                              完整详情页
                            </Link>
                          </div>
                          <PickState action={act} pickLabel="就选这个" />
                        </div>
                      </div>
                    }
                    onAdd={act.onAdd}
                    added={act.added}
                  />
                );
              })}
            </div>
          );
        })}
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
