import { Link } from "react-router-dom";
import { useLayoutEffect } from "react";
import { MapPin, CalendarDays } from "lucide-react";
import { CityPlaceSummary, useAvailability } from "@/components/DayPlaceDetails";
import {
  ItineraryDayCard,
  detailForPlanDay,
  type DayBooking,
} from "@/components/ItineraryDayCard";
import { applyCloudDayOverride } from "@/guide/cloudDayOverrides";
import { useRecordsData } from "@/pages/records/shared";
import {
  usePlanItinerary,
  type PlanDay,
  type PlanCityStop,
} from "@/guide/plannerSchedule";

type Day = PlanDay;
type City = PlanCityStop;

/** 行程页滚动位置的 session 级存取键 */
const HOME_SCROLL_KEY = "sea-home-scroll-y-v1";

export default function Home() {
  // 从详情页返回时恢复离开时的滚动位置，不再跳回页面顶部。
  // 位置在卸载时写入 sessionStorage，恢复后立即清除，避免刷新页面时误恢复。
  useLayoutEffect(() => {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(HOME_SCROLL_KEY);
      sessionStorage.removeItem(HOME_SCROLL_KEY);
    } catch {
      /* 忽略存储异常 */
    }
    const y = saved ? parseInt(saved, 10) : 0;
    if (y > 0) window.scrollTo(0, y);
    return () => {
      try {
        sessionStorage.setItem(HOME_SCROLL_KEY, String(window.scrollY));
      } catch {
        /* 忽略存储异常 */
      }
    };
  }, []);
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-teal-900 mb-3">
          东南亚 {usePlanItinerary().totalDays} 天旅行指南
        </h1>
        <p className="text-gray-600 flex items-center justify-center gap-2">
          <CalendarDays size={16} />
          <HeroSub />
        </p>
      </div>

      <ItineraryTab />
    </div>
  );
}

function HeroSub() {
  const plan = usePlanItinerary();
  return (
    <>
      {plan.dateRangeLong} · {plan.cityCount} 城 · 4 国
      {plan.source === "cloud" && (
        <span className="text-teal-700 font-medium">· 云端规划</span>
      )}
    </>
  );
}

function shortDate(d: string): string {
  let m = d.match(/(\d+)月(\d+)日/);
  if (m) return `${m[1]}/${m[2]}`;
  m = d.match(/\d{4}-(\d+)-(\d+)/);
  if (m) return `${Number(m[1])}/${Number(m[2])}`;
  return d;
}

function ItineraryTab() {
  const plan = usePlanItinerary();
  const days: Day[] = plan.days;
  const cityList: City[] = plan.cityStops;
  const av = useAvailability();
  const { rows } = useRecordsData(["booking"]);
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
    if (r.day == null) return;
    const list = bookingsByDay.get(r.day) || [];
    list.push({ day: r.day, title: r.title, body: r.body || "", done: !!r.done });
    bookingsByDay.set(r.day, list);
  });
  // 每天的静态内容（首日=抵达，末日=离境，中间=弹性池；云端13天再叠加逐日修正）
  const isCloud = plan.source === "cloud";
  const details = days.map((d) => {
    const base = detailForPlanDay(
      d,
      idxInCity.get(d.day) || 0,
      cityCounts.get(d.city_zh) || 1,
    );
    return isCloud ? applyCloudDayOverride(d.day, base) : base;
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
      {/* City cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {cityList.map((c, i) => (
          <Link
            key={c.id}
            to={`/day/${c.days[0]}`}
            className="group bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-teal-600 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 rounded-full px-2 py-0.5">
                第 {c.days[0]}–{c.days[1]} 天
              </span>
              <span className="text-2xl font-bold text-gray-200 group-hover:text-teal-200 transition-colors">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <h2 className="text-xl font-bold mb-1">{c.zh}</h2>
            <p className="text-sm text-gray-500 mb-1">{c.en}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin size={12} />
              {c.country_zh} · {c.dates}
            </p>
            <CityPlaceSummary cityZh={c.zh} />
          </Link>
        ))}
      </div>

      {/* 悬浮日期导航（意大利站逻辑） */}
      <div className="sticky top-[92px] z-[5] -mx-4 px-4 py-2 mb-6 bg-[#faf8f3]/95 backdrop-blur-sm border-y border-gray-200">
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

      {/* 每日完整行程卡（意大利站逻辑：一天一卡，信息全在卡里） */}
      <h2 className="text-xl font-bold mb-4">{plan.totalDays} 天详细行程</h2>
      <div className="space-y-8 mb-12">
        {days.map((d, i) => (
          <ItineraryDayCard
            key={d.day}
            day={d}
            prevDay={i > 0 ? days[i - 1] : undefined}
            detail={details[i]}
            bookings={bookingsByDay.get(d.day) || []}
            av={av}
            isCloud={isCloudPlan}
            isLastInCity={
              (idxInCity.get(d.day) || 0) === (cityCounts.get(d.city_zh) || 1) - 1
            }
            cityScheduledNames={cityScheduled.get(d.city_zh)}
          />
        ))}
      </div>
    </>
  );
}

