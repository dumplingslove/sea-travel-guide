import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, UtensilsCrossed, Lightbulb } from "lucide-react";
import itinerary from "@/data/itinerary.json";
import { days as detailDays } from "@/guide/data";
import DayMap from "@/components/DayMap";

type Day = {
  day: number;
  date: string;
  weekday: string;
  city: string;
  city_zh: string;
  city_id: string;
};

const days: Day[] = itinerary as Day[];

export default function DayDetail() {
  const { n } = useParams<{ n: string }>();
  const dayNum = Number(n);
  const day = days.find((d) => d.day === dayNum);
  const detail = detailDays.find((d) => d.day === dayNum);
  const prevDay = days.find((d) => d.day === dayNum - 1) || null;
  // 转场航段名称：取当天行程里带“飞”字的站点（如“普吉飞槟城”）
  const transferLabel = detail?.stops.find((s) => s.name.includes("飞"))?.name;

  if (!day) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-6">没有找到第 {n} 天的行程。</p>
        <Link
          to="/"
          className="inline-block px-5 py-2 rounded-lg bg-teal-700 text-white text-sm font-medium hover:bg-teal-800"
        >
          返回首页
        </Link>
      </div>
    );
  }

  const prev = day.day > 1 ? day.day - 1 : null;
  const next = day.day < days.length ? day.day + 1 : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-teal-800 mb-6"
      >
        <ArrowLeft size={16} /> 返回行程总览
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <p className="text-xs font-semibold text-teal-700 mb-1">
          DAY {day.day} / 20
        </p>
        <h1 className="text-3xl font-bold mb-1">{day.city_zh}</h1>
        {detail && <p className="text-lg text-gray-700 mb-2">{detail.title}</p>}
        <p className="text-gray-500 flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <CalendarDays size={14} /> 2026-{day.date} {day.weekday}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={14} /> {day.city}
          </span>
        </p>
      </div>

      {detail ? (
        <>
          <DayMap
            key={day.day}
            dayNum={day.day}
            cityId={day.city_id}
            cityZh={day.city_zh}
            prevCityId={prevDay ? prevDay.city_id : null}
            prevCityZh={prevDay ? prevDay.city_zh : null}
            transferLabel={transferLabel}
          />

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <h2 className="font-bold text-lg mb-4">当天行程</h2>
            <ol className="relative border-l-2 border-teal-100 ml-2 space-y-6">
              {detail.stops.map((s) => (
                <li key={s.time + s.name} className="ml-4">
                  <span className="absolute -left-[7px] mt-1 w-3 h-3 rounded-full bg-teal-600" />
                  <p className="text-sm font-semibold text-teal-700">{s.time}</p>
                  <h3 className="font-bold">{s.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{s.detail}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
              <UtensilsCrossed size={18} className="text-teal-700" /> 当天吃什么
            </h2>
            <p className="text-sm text-gray-700">{detail.food}</p>
          </div>

          <div className="bg-amber-50 rounded-xl border border-amber-200 p-6 mb-6">
            <h2 className="font-bold text-lg mb-2 flex items-center gap-2 text-amber-900">
              <Lightbulb size={18} /> 安排提醒
            </h2>
            <p className="text-sm text-amber-900">{detail.tip}</p>
          </div>
        </>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center mb-6">
          <p className="font-medium text-amber-800">攻略编写中</p>
          <p className="text-sm text-amber-700 mt-1">
            第 {day.day} 天（{day.city_zh}）的详细行程、景点、餐厅与酒店攻略正在整理，
            完成后会在这里展示。
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        {prev ? (
          <Link
            to={`/day/${prev}`}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium hover:border-teal-600"
          >
            <ArrowLeft size={16} /> Day {prev}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/day/${next}`}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium hover:border-teal-600"
          >
            Day {next} <ArrowRight size={16} />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
