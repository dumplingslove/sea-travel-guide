import { useEffect, useMemo, useState } from "react";
import {
  loadPlannerPlan,
  readPlannerCache,
  type PlanTimeline,
} from "@/guide/plannerSchedule";
import {
  BEIJING_HOME_FOOD,
  BEIJING_HOSPITAL_FOOD,
  CHINA_DAY_CONTENT,
  XIAN_LAST_MORNING,
  XIAN_STAY_FOOD,
  type ChinaDayContent,
} from "@/guide/chinaDays";
import { useRecordsData } from "@/pages/records/shared";
import {
  DayBookingsSection,
  DayCityBackup,
  DayResearchSection,
  STOP_ALIASES,
  StopBlock,
  TodayBookedSection,
  cjk,
  groupHotelBookings,
  matchItem,
  norm,
  researchEntryFor,
  toISODate,
  type DayBooking,
  type ResearchEntry,
} from "@/components/ItineraryDayCard";
import { bareName } from "@/bookings/nameMatch";
import { attractions, hotels, restaurants, type Item } from "@/guide/data";
import { parseBookingBody, type BookingData } from "@/bookings/bookingTypes";

/**
 * 中国行程页（/china）：北京（两段）+ 西安。
 *
 * 2026-10-21 用户裁决新建本 tab，承载东南亚/韩国行程页不收的北京、西安两城。
 * 日期单一事实源 = 云端 plan.timeline：本页天列表只从 timeline.days 读
 * （usePlanItinerary 的 days 来自 plan.schedule，只含东南亚+首尔段，故本页不用它），
 * 本页只按 ISO 日期挂 chinaDays.ts 的研究内容，不自创日期、不推导段天数。
 * 分组口径：seg=beijing1 → 北京第一段；seg=split 且日期 ≤12-28 → 北京第二段
 * （用户在北京陪父亲，妻子与 Dylan 同日在西安，页面只排用户这条线）；
 * 12-29 高铁转场日按全站「转场日=到达段第一天」口径归西安段；
 * 12-30 的 plan 天归首尔，西安清晨以静态卡补在本段末尾（与韩国页水原模块同例）。
 * 北京段定位：住立水家园、陪父亲为主——第一段一家三口慢节奏，
 * 第二段一人陪父亲、全部机动可调；西安只有 12-29 下午至 12-30 上午一个窗口。
 */

type SegKey = "bj1" | "bj2" | "xa";

const SEG_META: Record<SegKey, { title: string; sub: string }> = {
  bj1: {
    title: "北京 · 第一段",
    sub: "一家三口住立水家园，陪父亲为主，节奏放轻；吃食以老字号小吃为主、看展挑离家近的；段末附「立水家园家门口」日常吃食块（两段通用）",
  },
  bj2: {
    title: "北京 · 第二段",
    sub: "一人回北京陪父亲，以家为中心；同一时段妻子带 Dylan 在西安。下面全是机动项，去不去当天定，不锁死",
  },
  xa: {
    title: "西安 · 汇合",
    sub: "12-29 高铁抵达、全家汇合；窗口只有一下午加一清晨，吃食按本地人私藏口径排；段末另附「长住日常档」，供家人 12-11–12-29 在西安期间日常吃",
  },
};

interface ChinaEntry {
  iso: string;
  dayNum: number;
  seg: SegKey;
  cityZh: string;
}

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function entriesFromTimeline(tl: PlanTimeline | undefined): ChinaEntry[] {
  if (!tl?.days) return [];
  const dates = Object.keys(tl.days).sort();
  const out: ChinaEntry[] = [];
  dates.forEach((iso, i) => {
    const d = tl.days[iso];
    if (!d) return;
    if (d.seg === "beijing1") {
      out.push({ iso, dayNum: i + 1, seg: "bj1", cityZh: "北京" });
    } else if (d.seg === "split") {
      if (iso >= "2026-12-29") {
        out.push({ iso, dayNum: i + 1, seg: "xa", cityZh: "西安" });
      } else {
        out.push({ iso, dayNum: i + 1, seg: "bj2", cityZh: "北京" });
      }
    }
  });
  return out;
}

/** 与 usePlannerTripStops 同模式：本地缓存同步出结果，云端规划到达后刷新 */
function useChinaEntries(): { entries: ChinaEntry[]; loading: boolean } {
  const [state, setState] = useState<{ entries: ChinaEntry[]; loading: boolean }>(
    () => {
      try {
        const cached = readPlannerCache();
        const entries = entriesFromTimeline(cached?.plan?.timeline);
        return { entries, loading: entries.length === 0 };
      } catch {
        return { entries: [], loading: true };
      }
    }
  );
  useEffect(() => {
    let alive = true;
    loadPlannerPlan().then((loaded) => {
      if (!alive) return;
      const entries = entriesFromTimeline(loaded?.plan?.timeline);
      setState({ entries, loading: false });
    });
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

function dateLabel(iso: string): string {
  const [, m, dd] = iso.split("-");
  const wd = WEEKDAYS[new Date(`${iso}T12:00:00`).getDay()];
  return `${Number(m)}月${Number(dd)}日 · ${wd}`;
}

/* 餐饮/提醒同全站口径（2026-10-22 用户要求）：正选先露、备选折叠，不堆文字墙。
 * 正选 = 不带「备选/机动」标记的条目，最多露 3 条；其余全部进折叠区。 */
function FoodList({ food }: { food: string[] }) {
  const primary = food.filter((s) => !/备选|机动/.test(s));
  const backup = food.filter((s) => /备选|机动/.test(s));
  const visible = (primary.length ? primary : food).slice(0, 3);
  const rest = [
    ...(primary.length ? primary : food).slice(3),
    ...(primary.length ? backup : []),
  ];
  return (
    <div className="text-sm text-gray-700 space-y-1 mb-2">
      {visible.map((s, i) => (
        <p key={i}>🍽️ {s}</p>
      ))}
      {rest.length > 0 && (
        <details>
          <summary className="text-xs font-medium text-orange-700 cursor-pointer py-0.5">
            备选吃法还有 {rest.length} 条（点开看）▾
          </summary>
          <div className="space-y-1 mt-1">
            {rest.map((s, i) => (
              <p key={i}>🍽️ {s}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function TipsList({ tips }: { tips: string[] }) {
  const visible = tips.slice(0, 2);
  const rest = tips.slice(2);
  return (
    <div className="text-xs text-gray-500 space-y-1">
      {visible.map((s, i) => (
        <p key={i}>💡 {s}</p>
      ))}
      {rest.length > 0 && (
        <details>
          <summary className="cursor-pointer py-0.5 font-medium text-purple-700">
            更多提醒（{rest.length} 条）▾
          </summary>
          <div className="space-y-1 mt-1">
            {rest.map((s, i) => (
              <p key={i}>💡 {s}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

/* 2026-11-25 用户纠正：页面字太多、没重点，确定的预约才是重点。
 * 玩乐列表与提醒同口径：只露前 2 条，其余折叠，字墙不再直接糊满屏。 */
function FunList({ fun }: { fun: string[] }) {
  const visible = fun.slice(0, 2);
  const rest = fun.slice(2);
  return (
    <div className="text-sm text-gray-700 space-y-1 mb-2">
      {visible.map((s, i) => (
        <p key={i}>🎡 {s}</p>
      ))}
      {rest.length > 0 && (
        <details>
          <summary className="cursor-pointer py-0.5 text-xs font-medium text-teal-700">
            更多安排（{rest.length} 条）▾
          </summary>
          <div className="space-y-1 mt-1">
            {rest.map((s, i) => (
              <p key={i}>🎡 {s}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

/* 已定预约置顶块：一天的重点先露脸，一行一条（时间＋事项＋地点／订单号），
 * 细节（带什么、怎么约）仍留在下方 fun/tips 里，不删。 */
function FixedList({ fixed }: { fixed: string[] }) {
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 mb-2">
      <p className="text-sm font-bold text-amber-800 mb-1">📌 已定预约</p>
      <div className="space-y-0.5">
        {fixed.map((s, i) => (
          <p key={i} className="text-sm font-semibold text-gray-900">
            {s}
          </p>
        ))}
      </div>
    </div>
  );
}

/* 中国页站块派生（2026-11-25 第二轮：中国页接东南亚主页同一套渲染链）：
 * chinaDays 的 fun/food/fixed 是自由文本串，站名嵌在句首/句中；
 * matchItem 对整句做子串／三字前缀比对，命中目录条目的串成一站 StopBlock，
 * 命中不了的只显示自带文案、不放详情按钮（StopBlock 自带该行为）。
 * 时间 chip：句首 HH:MM 优先，其次上午/下午/晚上/中午词，末了按 fun→上午、
 * food→午餐、fixed→全天回退；句中的营业时间（如 10:30–01:00）不作行程时间。 */
function inferStopTime(text: string, fallback: string): string {
  const m = /^(上午|下午|晚上|中午)?\s*(\d{1,2}:\d{2})/.exec(text.trim());
  if (m) return m[2];
  if (/上午|早上|早晨|早餐/.test(text)) return "上午";
  if (/下午/.test(text)) return "下午";
  if (/晚上|晚间|晚餐/.test(text)) return "晚上";
  if (/中午|午餐/.test(text)) return "中午";
  return fallback;
}

interface DerivedStop {
  item: Item;
  time: string;
  detail: string;
}

/* 句子的主角判定（与 matchItem 的“最长命中”不同）：
 * 一句 fun/food 往往只讲一个地方、顺带提别的店作比较（12-01 洪记句末
 * “不如紫光园”）；matchItem 按最长命中会把这句算成紫光园、标题与正文
 * 对不上。这里取句中最先出现的目录名——主角总在句首附近，比较对象在后。
 * 别名先行、转场守卫随后，均与 matchItem 同口径。 */
function earliestItem(text: string, city: string): Item | undefined {
  const bare = bareName(text);
  const nsAlias = norm(bare);
  for (const [key, target] of STOP_ALIASES) {
    if (nsAlias.includes(norm(key))) {
      const hit = [...attractions, ...restaurants, ...hotels].find(
        (it) => it.city === city && norm(it.name) === norm(target),
      );
      if (hit) return hit;
    }
  }
  if (/机场|航班|飞往|抵达|离境|入住|退房|午睡|收行李|码头集合/.test(bare))
    return undefined;
  const ns = norm(bare);
  let best: Item | undefined;
  let bestIdx = Infinity;
  let bestLen = 0;
  for (const list of [attractions, restaurants, hotels]) {
    for (const it of list) {
      if (it.city !== city) continue;
      const cand = norm(it.name);
      if (cand.length >= 2) {
        const idx = ns.indexOf(cand);
        if (idx >= 0 && (idx < bestIdx || (idx === bestIdx && cand.length > bestLen))) {
          best = it;
          bestIdx = idx;
          bestLen = cand.length;
        }
      }
      const prefix = cjk(cand).slice(0, 3);
      if (prefix.length >= 3) {
        const pidx = ns.indexOf(prefix);
        if (pidx >= 0 && (pidx < bestIdx || (pidx === bestIdx && 3 > bestLen))) {
          best = it;
          bestIdx = pidx;
          bestLen = 3;
        }
      }
    }
  }
  return best;
}

function deriveStops(
  texts: { text: string; fallback: string }[],
  city: string,
): DerivedStop[] {
  const seen = new Set<string>();
  const out: DerivedStop[] = [];
  for (const { text, fallback } of texts) {
    const item = earliestItem(text, city);
    if (!item || seen.has(item.name)) continue;
    seen.add(item.name);
    out.push({ item, time: inferStopTime(text, fallback), detail: text });
  }
  return out;
}

function bookingKind(b: DayBooking): string | null {
  try {
    return parseBookingBody(b.body).bkind;
  } catch {
    return null;
  }
}

function DayCard({
  entry,
  content,
  bookings,
  dayOptions,
  scheduledNames,
  bookedRestNames,
  favRestNames,
}: {
  entry: ChinaEntry;
  content?: ChinaDayContent;
  bookings?: DayBooking[];
  /** 本段可排入的天（只限本城，不许跨城） */
  dayOptions: { day: number; iso: string; label: string }[];
  /** 本段所有天已排的站点原文（供备选清单排除已排项） */
  scheduledNames: Set<string>;
  /** 本段已订餐厅名（小写归一化） */
  bookedRestNames: Set<string>;
  /** 本城已收藏餐厅名（小写归一化） */
  favRestNames: Set<string>;
}) {
  const [backupOpen, setBackupOpen] = useState(false);
  const stops = useMemo(
    () =>
      deriveStops(
        [
          ...(content?.fun ?? []).map((text) => ({ text, fallback: "上午" })),
          ...(content?.food ?? []).map((text) => ({ text, fallback: "午餐" })),
          ...(content?.fixed ?? []).map((text) => ({ text, fallback: "全天" })),
        ],
        entry.cityZh,
      ),
    [content, entry.cityZh],
  );
  const dayBookings = bookings ?? [];
  const hotelGroups = useMemo(
    () =>
      groupHotelBookings(
        dayBookings.filter((b) => bookingKind(b) === "hotel"),
        entry.cityZh,
      ),
    [dayBookings, entry.cityZh],
  );
  const transportBookings = useMemo(
    () => dayBookings.filter((b) => bookingKind(b) === "transport"),
    [dayBookings],
  );
  const bookedRests = useMemo(
    () => dayBookings.filter((b) => bookingKind(b) === "restaurant"),
    [dayBookings],
  );
  const researchEntries = useMemo(
    () =>
      stops
        .map((st) => researchEntryFor(st.item))
        .filter((e): e is ResearchEntry => e !== null),
    [stops],
  );
  /* 时间线站点本身就是已订餐厅时：StopBlock 展开里带确认信息（与主卡同口径） */
  const bookedForStop = (itemName: string): BookingData | undefined => {
    const hit = bookedRests.find((b) => {
      const item = restaurants.find(
        (r) => b.title.includes(r.name) || r.name.includes(b.title),
      );
      if (!item) return false;
      return matchItem(itemName, entry.cityZh, [item])?.name === item.name;
    });
    if (!hit) return undefined;
    try {
      return parseBookingBody(hit.body);
    } catch {
      return undefined;
    }
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
      <div className="flex items-baseline gap-2 flex-wrap mb-1">
        <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-100 rounded px-1.5 py-0.5">
          D{entry.dayNum}
        </span>
        <span className="font-bold text-gray-900">{dateLabel(entry.iso)}</span>
        <span className="text-xs text-gray-500">{entry.cityZh}</span>
      </div>
      {content && (
        <p className="text-sm font-semibold text-gray-800 mb-2">{content.title}</p>
      )}
      <DayCityBackup
        city={entry.cityZh}
        scheduledNames={scheduledNames}
        bookedRestNames={bookedRestNames}
        favRestNames={favRestNames}
        dayOptions={dayOptions}
        open={backupOpen}
        onToggle={() => setBackupOpen((v) => !v)}
      />
      <TodayBookedSection
        hotelGroups={hotelGroups}
        flightLeg={null}
        transportBookings={transportBookings}
        unbookedLeg={null}
        bookedRests={bookedRests}
      />
      {content ? (
        <>
          {content.fixed && content.fixed.length > 0 && (
            <FixedList fixed={content.fixed} />
          )}
          {stops.length > 0 && (
            <div className="mb-2">
              <p className="text-sm font-bold text-gray-800 mb-1">📍 本日地点</p>
              {stops.map((st) => (
                <StopBlock
                  key={st.item.name}
                  stop={{ time: st.time, name: st.item.name, detail: st.detail }}
                  city={entry.cityZh}
                  booked={bookedForStop(st.item.name)}
                />
              ))}
            </div>
          )}
          {content.fun && content.fun.length > 0 && (
            <FunList fun={content.fun} />
          )}
          {content.food && content.food.length > 0 && (
            <FoodList food={content.food} />
          )}
          {content.tips && content.tips.length > 0 && (
            <TipsList tips={content.tips} />
          )}
          {researchEntries.length > 0 && (
            <DayResearchSection entries={researchEntries} />
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500">
          这天暂无专门安排：在{entry.cityZh}以陪伴和休整为主，临时想出门再从本段的机动项里挑。
        </p>
      )}
      {bookings && bookings.length > 0 && (
        <div className="mt-3">
          <DayBookingsSection bookings={bookings} />
        </div>
      )}
    </div>
  );
}

function StaticCard({
  content,
  badge,
  label = "转场日清晨",
  city = "西安",
}: {
  content: ChinaDayContent;
  badge: string;
  label?: string;
  city?: string;
}) {
  return (
    <div className="bg-white border border-dashed border-amber-300 rounded-xl p-4 mb-3">
      <div className="flex items-baseline gap-2 flex-wrap mb-1">
        <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
          {label}
        </span>
        <span className="font-bold text-gray-900">{badge}</span>
        <span className="text-xs text-gray-500">{city}</span>
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-2">{content.title}</p>
      {content.food && content.food.length > 0 && (
        <FoodList food={content.food} />
      )}
      {content.fun && content.fun.length > 0 && (
        <FunList fun={content.fun} />
      )}
      {content.tips && content.tips.length > 0 && (
        <TipsList tips={content.tips} />
      )}
    </div>
  );
}

export default function ChinaItinerary() {
  const { entries, loading } = useChinaEntries();
  const { rows: bookingRows } = useRecordsData(["booking"]);
  const { rows: favRows } = useRecordsData(["favorite"]);
  // 本城已收藏餐厅名（小写归一化，供备选清单收藏优先排序，与主卡同口径）
  const favRestNamesByCity = useMemo(() => {
    const out = new Map<string, Set<string>>();
    favRows.forEach((r) => {
      let body: Record<string, unknown> = {};
      try {
        body = JSON.parse(r.body || "{}");
      } catch {
        return;
      }
      if (body.type !== "restaurant" || typeof body.city !== "string") return;
      const set = out.get(body.city) ?? new Set<string>();
      set.add(r.title.trim().toLowerCase());
      out.set(body.city, set);
    });
    return out;
  }, [favRows]);
  // 已订记录按日期同步到本页卡片（不写死）：日期在本页某天就挂那天；
  // 早于本页第一天的（去程航班 11-28 出发、11-29 落地北京）挂第一天，
  // 摘要里带真实日期。其余日期（东南亚/首尔段）不属于本页，不挂。
  const bookingsByIso = useMemo(() => {
    const entryIsos = new Set(entries.map((e) => e.iso));
    const firstIso = entries[0]?.iso;
    const out = new Map<string, DayBooking[]>();
    bookingRows.forEach((r) => {
      let bd: ReturnType<typeof parseBookingBody>;
      try {
        bd = parseBookingBody(r.body || "");
      } catch {
        return;
      }
      const iso = bd.date ? toISODate(bd.date) : null;
      if (!iso) return;
      let target: string | null = entryIsos.has(iso) ? iso : null;
      if (target == null && firstIso && iso < firstIso) target = firstIso;
      if (target == null) return;
      const list = out.get(target) || [];
      list.push({ day: 0, title: r.title, body: r.body || "", done: !!r.done });
      out.set(target, list);
    });
    return out;
  }, [bookingRows, entries]);
  const groups = useMemo(() => {
    const out: Record<SegKey, ChinaEntry[]> = { bj1: [], bj2: [], xa: [] };
    for (const e of entries) out[e.seg].push(e);
    return out;
  }, [entries]);

  return (
    <div className="max-w-5xl xl:max-w-7xl mx-auto px-4 pb-8">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900 mb-1">🇨🇳 中国行程</h1>
        <p className="text-sm text-gray-500">
          北京两段 + 西安汇合：日期以行程规划为准；吃和玩来自实查证据（本地人常去的老店、夜市与市场档口，不排游客网红店），已订的机票会按日期同步显示在每天卡片里。
        </p>
      </div>

      {loading && entries.length === 0 ? (
        <p className="text-sm text-gray-500">行程加载中…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-gray-500">当前规划里暂无北京/西安的天。</p>
      ) : (
        (Object.keys(SEG_META) as SegKey[]).map((k) => {
          const items = groups[k];
          if (items.length === 0) return null;
          return (
            <section key={k} className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-1">{SEG_META[k].title}</h2>
              <p className="text-xs text-gray-500 mb-3">{SEG_META[k].sub}</p>
              {(() => {
                const segDayOptions = items.map((e) => ({
                  day: e.dayNum,
                  iso: e.iso,
                  label: `D${e.dayNum} · ${dateLabel(e.iso)} ${e.cityZh}`,
                }));
                const segScheduledNames = new Set(
                  items.flatMap((e) => {
                    const c = CHINA_DAY_CONTENT[e.iso];
                    return [...(c?.fun ?? []), ...(c?.food ?? []), ...(c?.fixed ?? [])];
                  }),
                );
                const segBookedRestNames = new Set(
                  items.flatMap((e) =>
                    (bookingsByIso.get(e.iso) ?? [])
                      .filter((b) => bookingKind(b) === "restaurant")
                      .map((b) => b.title.trim().toLowerCase()),
                  ),
                );
                const segFavRestNames =
                  favRestNamesByCity.get(items[0]?.cityZh ?? "") ?? new Set<string>();
                return items.map((e) => (
                  <DayCard
                    key={e.iso}
                    entry={e}
                    content={CHINA_DAY_CONTENT[e.iso]}
                    bookings={bookingsByIso.get(e.iso) ?? []}
                    dayOptions={segDayOptions}
                    scheduledNames={segScheduledNames}
                    bookedRestNames={segBookedRestNames}
                    favRestNames={segFavRestNames}
                  />
                ));
              })()}
              {k === "bj1" && (
                <StaticCard
                  content={BEIJING_HOME_FOOD}
                  badge="立水家园一带"
                  label="住家补充"
                  city="北京"
                />
              )}
              {k === "bj2" && (
                <StaticCard
                  content={BEIJING_HOME_FOOD}
                  badge="立水家园一带"
                  label="住家补充"
                  city="北京"
                />
              )}
              {k === "bj1" && (
                <StaticCard
                  content={BEIJING_HOSPITAL_FOOD}
                  badge="朝阳医院一带"
                  label="陪诊补充"
                  city="北京"
                />
              )}
              {k === "xa" && (
                <StaticCard content={XIAN_STAY_FOOD} badge="12月11日–29日" label="长住补充" />
              )}
              {k === "xa" && <StaticCard content={XIAN_LAST_MORNING} badge="12月30日" />}
            </section>
          );
        })
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 space-y-1">
        <p>
          📝 观察项（不排进行程，有官宣再说）：CLAMP 展「年底北京首站」目前只有传闻级消息（无场馆、无日期）；西安大茂城PARK（纺织城东大茂）2026-09 已挂牌但开业日未公布、位置远郊，12-29／12-30 两个全家窗口明确排除。
        </p>
        <p>
          🍜 西安几条目的价格与营业时间多来自本地实测整理，临行前建议用大众点评现行页面再复核一次；北京展览档期以场馆官方为准。
        </p>
      </div>
    </div>
  );
}
