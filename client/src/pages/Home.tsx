import { useLayoutEffect, useMemo, useRef } from "react";
import {
  ItineraryDayCard,
  detailForPlanDay,
  buildDayByDate,
  cityStayRanges,
  parseFavoriteRow,
  toISODate,
  type DayBooking,
  type ParsedFavorite,
} from "@/components/ItineraryDayCard";
import { applyCloudDayOverride } from "@/guide/cloudDayOverrides";
import { useRecordsData } from "@/pages/records/shared";
import { usePlanItinerary, KOREA_CITY_ZH, SEA_CITY_ZH, type PlanDay } from "@/guide/plannerSchedule";
import { parseBookingBody } from "@/bookings/bookingTypes";

type Day = PlanDay;

/** 行程页滚动位置的 session 级存取键（东南亚/韩国两个页面各用各的） */
const SEA_SCROLL_KEY = "sea-home-scroll-y-v1";
const KOREA_SCROLL_KEY = "sea-korea-scroll-y-v1";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 pb-8">
      <ItineraryTab koreaOnly={false} />
    </div>
  );
}

function shortDate(d: string): string {
  let m = d.match(/(\d+)月(\d+)日/);
  if (m) return `${m[1]}/${m[2]}`;
  m = d.match(/\d{4}-(\d+)-(\d+)/);
  if (m) return `${Number(m[1])}/${Number(m[2])}`;
  return d;
}

/** 收藏的景点 → 行程排入检查：收藏的必去景点是否已在行程中 */
function FavoriteItineraryCheck({
  cityScheduled,
}: {
  cityScheduled: Map<string, Set<string>>;
}) {
  const { rows } = useRecordsData(["favorite"]);
  const favs = rows
    .map((r) => {
      try {
        const d = JSON.parse(r.body) as {
          city?: string;
          type?: string;
        };
        return {
          name: r.title,
          city: d.city ?? "",
          type: d.type ?? "attraction",
        };
      } catch {
        return { name: r.title, city: "", type: "attraction" };
      }
    })
    .filter((f) => f.type === "attraction");

  if (!favs.length) return null;

  // 检查每个收藏的景点是否在对应城市的行程中（模糊匹配：名称包含或被包含）
  const checkScheduled = (name: string, city: string) => {
    const scheduled = cityScheduled.get(city);
    if (!scheduled) return false;
    const n = name.toLowerCase();
    for (const s of scheduled) {
      const sl = s.toLowerCase();
      if (sl.includes(n) || n.includes(sl)) return true;
    }
    return false;
  };

  const unscheduled = favs.filter((f) => !checkScheduled(f.name, f.city));

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-6">
      <h3 className="font-bold text-gray-900 mb-1">⭐ 我的必去景点</h3>
      <p className="text-xs text-gray-500 mb-3">
        在景点页收藏的必去项，系统会检查是否已排入行程
      </p>
      <div className="space-y-1.5">
        {favs.map((f) => {
          const ok = checkScheduled(f.name, f.city);
          return (
            <div key={f.name} className="flex items-center gap-2 text-sm">
              <span>{ok ? "✅" : "⚠️"}</span>
              <span className="font-medium text-gray-900">{f.name}</span>
              <span className="text-xs text-gray-400">{f.city}</span>
              <span className="text-xs text-gray-500">
                {ok ? "已排入行程" : "未排入行程，建议手动加入某天"}
              </span>
            </div>
          );
        })}
      </div>
      {unscheduled.length > 0 && (
        <p className="text-xs text-amber-700 mt-3">
          有 {unscheduled.length}{" "}
          个收藏未排入：{unscheduled.map((f) => f.name).join("、")}。可在对应城市找空闲半天手动加入。
        </p>
      )}
    </div>
  );
}

export function ItineraryTab({ koreaOnly = false }: { koreaOnly?: boolean }) {
  const plan = usePlanItinerary();
  // 顶部导航拆成"东南亚行程"/"韩国行程"两个页面：
  // 东南亚行程只显示 SEA_CITY_ZH（新加坡/普吉/清迈/曼谷），北京/西安不混入；
  // 韩国行程只显示 KOREA_CITY_ZH（首尔）。
  // 天编号（D1、D2…）保持原行程不变，预订/笔记按天关联不受影响。
  const allDays: Day[] = plan.days;
  const days: Day[] = koreaOnly
    ? allDays.filter((d) => KOREA_CITY_ZH.has(d.city_zh))
    : allDays.filter((d) => SEA_CITY_ZH.has(d.city_zh));
  const scrollKey = koreaOnly ? KOREA_SCROLL_KEY : SEA_SCROLL_KEY;
  // 从详情页返回时恢复离开时的滚动位置，不再跳回页面顶部。
  // 位置在卸载时写入 sessionStorage，恢复后立即清除，避免刷新页面时误恢复。
  useLayoutEffect(() => {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(scrollKey);
      sessionStorage.removeItem(scrollKey);
    } catch {
      /* 忽略存储异常 */
    }
    const y = saved ? parseInt(saved, 10) : 0;
    if (y > 0) window.scrollTo(0, y);
    return () => {
      try {
        sessionStorage.setItem(scrollKey, String(window.scrollY));
      } catch {
        /* 忽略存储异常 */
      }
    };
  }, [scrollKey]);
  const dateNavRef = useRef<HTMLDivElement>(null);
  // 日期导航紧贴 header 底部：动态测量 header 高度，避免硬编码 top 值与实际高度不一致留下空白条
  useLayoutEffect(() => {
    const nav = dateNavRef.current;
    if (!nav) return;
    const sync = () => {
      const header = document.querySelector("header.sticky");
      if (header) nav.style.top = `${Math.round(header.getBoundingClientRect().height)}px`;
    };
    sync();
    const ro = new ResizeObserver(sync);
    const header = document.querySelector("header.sticky");
    if (header) ro.observe(header);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);
  const { rows } = useRecordsData(["booking"]);
  const { rows: favRows } = useRecordsData(["favorite"]);
  // 2026-10-03：预订没填天号时按日期自动挂天（不再丢弃）；收藏按城市进每天卡片
  const dayByDate = useMemo(() => buildDayByDate(allDays), [allDays]);
  const stays = useMemo(() => cityStayRanges(allDays), [allDays]);
  const favorites: ParsedFavorite[] = useMemo(
    () =>
      favRows
        .map((r) => parseFavoriteRow({ title: r.title, body: r.body || "" }))
        .filter((f) => ["hotel", "restaurant", "flight"].includes(f.type)),
    [favRows]
  );
  // 每城第几天（用于匹配静态内容：首日=抵达内容，末日=离境内容）
  const idxInCity = new Map<number, number>();
  const cityCounts = new Map<string, number>();
  days.forEach((d) => cityCounts.set(d.city_zh, (cityCounts.get(d.city_zh) || 0) + 1));
  const seen = new Map<string, number>();
  days.forEach((d) => {
    idxInCity.set(d.day, seen.get(d.city_zh) || 0);
    seen.set(d.city_zh, (seen.get(d.city_zh) || 0) + 1);
  });
  const bookingsByDay = new Map<number, DayBooking[]>();
  rows.forEach((r) => {
    // 2026-10-03：day 没手填时按预订日期自动推导天号；手填的优先
    let dayNum: number | null = r.day;
    if (dayNum == null) {
      try {
        const bd = parseBookingBody(r.body || "");
        const iso = bd.date ? toISODate(bd.date) : null;
        dayNum = iso ? dayByDate.get(iso) ?? null : null;
      } catch {
        dayNum = null;
      }
    }
    if (dayNum == null) return;
    const list = bookingsByDay.get(dayNum) || [];
    list.push({ day: dayNum, title: r.title, body: r.body || "", done: !!r.done });
    bookingsByDay.set(dayNum, list);
  });
  // 每天的静态内容（首日=抵达，末日=离境，中间=弹性池；云端13天再叠加逐日修正）
  const isCloud = plan.source === "cloud";
  const details = days.map((d) => {
    const ordinal = idxInCity.get(d.day) || 0;
    const total = cityCounts.get(d.city_zh) || 1;
    const base = detailForPlanDay(d, ordinal, total);
    // 2026-10-03：按城市+城内序号修正，不依赖绝对天号
    return isCloud ? applyCloudDayOverride(d.city_zh, ordinal, total, base) : base;
  });
  // 每城全部已排站点名（用于算“本城备选”：整个城市段都没排进去的景点）
  const cityScheduled = new Map<string, Set<string>>();
  days.forEach((d, i) => {
    const det = details[i];
    if (!det) return;
    let s = cityScheduled.get(d.city_zh);
    if (!s) {
      s = new Set<string>();
      cityScheduled.set(d.city_zh, s);
    }
    det.stops.forEach((st) => s.add(st.name));
  });
  const isCloudPlan = plan.source === "cloud";
  return (
    <>
      {/* 悬浮日期导航（紧贴 header 底部，top 由 JS 动态测量 header 高度设置） */}
      <div ref={dateNavRef} className="sticky z-[5] -mx-4 px-4 py-2 mb-6 bg-[#faf8f3]/95 backdrop-blur-sm border-y border-gray-200">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {days.map((d) => (
            <button
              key={d.day}
              onClick={() =>
                document
                  .getElementById(`day-${d.day}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="whitespace-nowrap flex-shrink-0 text-xs px-2.5 py-1.5 rounded-lg text-teal-800 hover:bg-teal-700 hover:text-white transition-colors"
            >
              D{d.day} {shortDate(d.date)} {d.city_zh}
            </button>
          ))}
        </div>
      </div>

      {/* 收藏的景点：检查是否已排入行程 */}
      <FavoriteItineraryCheck cityScheduled={cityScheduled} />

      {/* 每日完整行程卡（意大利站逻辑：一天一卡，信息全在卡里） */}
      {/* 空状态（days.length===0）时不渲染"X 0 天详细行程"标题，
          避免 /korea 首尔日期未定时出现"韩国 0 天详细行程"这种别扭文案，
          只保留下面的诚实空状态说明 */}
      {days.length > 0 && (
        <h2 className="text-xl font-bold mb-4">
          {koreaOnly ? `韩国 ${days.length} 天详细行程` : `东南亚 ${days.length} 天详细行程`}
        </h2>
      )}
      {days.length === 0 && (
        <p className="text-sm text-gray-500 mb-8">
          {koreaOnly
            ? "韩国行程的天数还没排进来，先去「行程规划」把首尔段日期定下来。"
            : "东南亚行程的天数还没排进来，先去「行程规划」确认日期。"}
        </p>
      )}
      <div className="space-y-8 mb-12">
        {days.map((d, i) => {
          // 跨 tab 转场不丢：prevDay 取全行程（allDays）中的真实前一天，
          // 而不是 KOREA_CITY_ZH 过滤后的前一天。否则 /korea 里首尔首日的
          // “北京飞首尔”转场卡会凭空消失（两个 tab 都看不到这段转场）。
          const gi = allDays.findIndex((x) => x.day === d.day);
          const prevDay = gi > 0 ? allDays[gi - 1] : undefined;
          return (
            <ItineraryDayCard
              key={d.day}
              day={d}
              prevDay={prevDay}
              detail={details[i]}
              bookings={bookingsByDay.get(d.day) || []}
              isCloud={isCloudPlan}
              cityScheduledNames={cityScheduled.get(d.city_zh)}
              favorites={favorites}
              stay={stays.get(d.city_zh) ?? null}
            />
          );
        })}
      </div>
    </>
  );
}

