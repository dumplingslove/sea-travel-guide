import { Link } from "react-router-dom";
import { MapPin, CalendarDays, ChevronRight } from "lucide-react";
import itinerary from "@/data/itinerary.json";
import cities from "@/data/cities.json";

type Day = {
  day: number;
  date: string;
  weekday: string;
  city: string;
  city_zh: string;
  city_id: string;
};

type City = {
  id: string;
  zh: string;
  en: string;
  country_zh: string;
  days: [number, number];
  dates: string;
};

const days: Day[] = itinerary as Day[];
const cityList: City[] = cities as City[];

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-teal-900 mb-3">
          东南亚 20 天旅行指南
        </h1>
        <p className="text-gray-600 flex items-center justify-center gap-2">
          <CalendarDays size={16} />
          2026-12-12 ～ 2026-12-31 · 8 城 · 4 国
        </p>
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
      <h2 className="text-xl font-bold mb-4">20 天行程</h2>
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
    </div>
  );
}
