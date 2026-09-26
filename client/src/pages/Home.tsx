import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, CalendarDays, ChevronRight, UtensilsCrossed } from "lucide-react";
import food from "@/data/food.json";
import TripOverviewMap from "@/components/TripOverviewMap";
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

type FoodCity = {
  id: string;
  zh: string;
  en: string;
  country_zh: string;
  days: string;
  items: string[];
};

const foodList: FoodCity[] = food as FoodCity[];

type HomeTab = "itinerary" | "food";

export default function Home() {
  const [tab, setTab] = useState<HomeTab>("itinerary");
  const plan = usePlanItinerary();
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-teal-900 mb-3">
          东南亚 {plan.totalDays} 天旅行指南
        </h1>
        <p className="text-gray-600 flex items-center justify-center gap-2">
          <CalendarDays size={16} />
          {plan.dateRangeLong} · {plan.cityCount} 城 · 4 国
          {plan.source === "cloud" && (
            <span className="text-teal-700 font-medium">· 云端规划</span>
          )}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setTab("itinerary")}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "itinerary"
                ? "bg-teal-700 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            行程
          </button>
          <button
            onClick={() => setTab("food")}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "food"
                ? "bg-teal-700 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            美食
          </button>
        </div>
      </div>

      {tab === "itinerary" ? (
        <ItineraryTab />
      ) : (
        <FoodTab />
      )}
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

function ItineraryTab() {
  const plan = usePlanItinerary();
  const days: Day[] = plan.days;
  const cityList: City[] = plan.cityStops;
  const av = useAvailability();
  const { rows } = useRecordsData(["booking"]);
  const stopsKey = cityList
    .map((c) => `${c.id}:${c.days[0]}-${c.days[1]}`)
    .join("|");
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
      {/* 20天路线总览实时地图（云端规划优先） */}
      <h2 className="text-xl font-bold mb-3">{plan.totalDays}天路线总览</h2>
      {plan.source === "cloud" && plan.updatedByName && (
        <p className="text-xs text-teal-700 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 mb-3">
          ☁️ 已按云端规划更新（{plan.updatedByName}
          {plan.updatedAt ? ` · ${plan.updatedAt.slice(0, 16).replace("T", " ")}` : ""}
          ）· <Link to="/planner" className="underline font-medium">去行程规划调整</Link>
        </p>
      )}
      <div className="mb-8">
        <TripOverviewMap key={stopsKey} stops={plan.cityStops} />
      </div>

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

function FoodTab() {
  return (
    <>
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
        8 城必吃品类：先讲当地特色美食种类，不点名具体餐厅。
        <span className="text-teal-800 font-medium">
          叻沙 / 肉骨茶 / 海南鸡饭在槟城、吉隆坡、新加坡是三个版本，一路对比着吃。
        </span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {foodList.map((c, i) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 rounded-full px-2 py-0.5">
                {c.days}
              </span>
              <span className="text-2xl font-bold text-gray-200">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <UtensilsCrossed size={18} className="text-teal-700" />
              {c.zh}
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              {c.en} · {c.country_zh}
            </p>
            <ul className="space-y-2">
              {c.items.map((item, j) => (
                <li key={j} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-teal-600 mt-0.5 shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
