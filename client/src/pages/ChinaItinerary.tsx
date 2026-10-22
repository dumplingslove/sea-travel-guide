import { useEffect, useMemo, useState } from "react";
import {
  loadPlannerPlan,
  readPlannerCache,
  type PlanTimeline,
} from "@/guide/plannerSchedule";
import {
  CHINA_DAY_CONTENT,
  XIAN_LAST_MORNING,
  XIAN_STAY_FOOD,
  type ChinaDayContent,
} from "@/guide/chinaDays";
import { useRecordsData } from "@/pages/records/shared";
import {
  DayBookingsSection,
  toISODate,
  type DayBooking,
} from "@/components/ItineraryDayCard";
import { parseBookingBody } from "@/bookings/bookingTypes";

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
    sub: "一家三口住立水家园，陪父亲为主，节奏放轻；吃食以老字号小吃为主、看展挑离家近的",
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

function DayCard({
  entry,
  content,
  bookings,
}: {
  entry: ChinaEntry;
  content?: ChinaDayContent;
  bookings?: DayBooking[];
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
      <div className="flex items-baseline gap-2 flex-wrap mb-1">
        <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-100 rounded px-1.5 py-0.5">
          D{entry.dayNum}
        </span>
        <span className="font-bold text-gray-900">{dateLabel(entry.iso)}</span>
        <span className="text-xs text-gray-500">{entry.cityZh}</span>
      </div>
      {content ? (
        <>
          <p className="text-sm font-semibold text-gray-800 mb-2">{content.title}</p>
          {content.fun && content.fun.length > 0 && (
            <div className="text-sm text-gray-700 space-y-1 mb-2">
              {content.fun.map((s, i) => (
                <p key={i}>🎡 {s}</p>
              ))}
            </div>
          )}
          {content.food && content.food.length > 0 && (
            <div className="text-sm text-gray-700 space-y-1 mb-2">
              {content.food.map((s, i) => (
                <p key={i}>🍽️ {s}</p>
              ))}
            </div>
          )}
          {content.tips && content.tips.length > 0 && (
            <div className="text-xs text-gray-500 space-y-1">
              {content.tips.map((s, i) => (
                <p key={i}>💡 {s}</p>
              ))}
            </div>
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
}: {
  content: ChinaDayContent;
  badge: string;
  label?: string;
}) {
  return (
    <div className="bg-white border border-dashed border-amber-300 rounded-xl p-4 mb-3">
      <div className="flex items-baseline gap-2 flex-wrap mb-1">
        <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
          {label}
        </span>
        <span className="font-bold text-gray-900">{badge}</span>
        <span className="text-xs text-gray-500">西安</span>
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-2">{content.title}</p>
      {content.food && content.food.length > 0 && (
        <div className="text-sm text-gray-700 space-y-1 mb-2">
          {content.food.map((s, i) => (
            <p key={i}>🍽️ {s}</p>
          ))}
        </div>
      )}
      {content.fun && content.fun.length > 0 && (
        <div className="text-sm text-gray-700 space-y-1 mb-2">
          {content.fun.map((s, i) => (
            <p key={i}>🎡 {s}</p>
          ))}
        </div>
      )}
      {content.tips && content.tips.length > 0 && (
        <div className="text-xs text-gray-500 space-y-1">
          {content.tips.map((s, i) => (
            <p key={i}>💡 {s}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChinaItinerary() {
  const { entries, loading } = useChinaEntries();
  const { rows: bookingRows } = useRecordsData(["booking"]);
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
              {items.map((e) => (
                <DayCard
                  key={e.iso}
                  entry={e}
                  content={CHINA_DAY_CONTENT[e.iso]}
                  bookings={bookingsByIso.get(e.iso) ?? []}
                />
              ))}
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
          📝 观察项（不排进行程，有官宣再说）：CLAMP 展「年底北京首站」目前只有传闻级消息（无场馆、无日期）；西安大茂城PARK 定档 12 月底但确切开业日未公布，临近再核。
        </p>
        <p>
          🍜 西安几条目的价格与营业时间多来自本地实测整理，临行前建议用大众点评现行页面再复核一次；北京展览档期以场馆官方为准。
        </p>
      </div>
    </div>
  );
}
