import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, CalendarDays, ChevronRight, UtensilsCrossed } from "lucide-react";
import food from "@/data/food.json";
import TripOverviewMap from "@/components/TripOverviewMap";
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

function ItineraryTab() {
  const plan = usePlanItinerary();
  const days: Day[] = plan.days;
  const cityList: City[] = plan.cityStops;
  const stopsKey = cityList
    .map((c) => `${c.id}:${c.days[0]}-${c.days[1]}`)
    .join("|");
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
          </Link>
        ))}
      </div>

      {/* Day list */}
      <h2 className="text-xl font-bold mb-4">{plan.totalDays} 天行程</h2>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {days.map((d) => (
          <Link
            key={d.day}
            to={`/day/${d.day}`}
            className="flex items-center gap-4 px-4 py-3 hover:bg-teal-50/50 transition-colors"
          >
            <span className="w-10 h-10 shrink-0 rounded-full bg-teal-700 text-white text-sm font-bold flex items-center justify-center">
              {d.day}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium">
                {d.city_zh}
                <span className="text-gray-400 font-normal text-sm ml-2">
                  {d.city}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                {d.date} {d.weekday}
              </p>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </Link>
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
