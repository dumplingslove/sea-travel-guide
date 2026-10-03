import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Lightbulb } from "lucide-react";
import { days as detailDays, attractions, restaurants } from "@/guide/data";
import DayMap from "@/components/DayMap";
import { DayPlaceDetails } from "@/components/DayPlaceDetails";
import { matchItem, detailForPlanDay, DayHotelSection, DayBookingsSection, buildDayByDate, cityStayRanges, parseFavoriteRow, toISODate, type DayBooking, type ParsedFavorite } from "@/components/ItineraryDayCard";
import { placeDetailPath, kindFromZh } from "@/guide/placeDetail";
import { applyCloudDayOverride } from "@/guide/cloudDayOverrides";
import { cloudStopsForTimeline } from "@/data/stopCoords";
import { usePlanItinerary, type PlanDay } from "@/guide/plannerSchedule";
import { useRecordsData } from "@/pages/records/shared";
import { parseBookingBody } from "@/bookings/bookingTypes";
import { useMemo } from "react";

type Day = PlanDay;

export default function DayDetail() {
  const { n } = useParams<{ n: string }>();
  const dayNum = Number(n);
  const plan = usePlanItinerary();
  const days: Day[] = plan.days;
  const day = days.find((d) => d.day === dayNum);
  const year = plan.dateRangeLong.slice(0, 4);
  const isCloud = plan.source === "cloud";
  // 攻略正文：与主页（Home.tsx）/ ItineraryDayCard 用同一套 detailForPlanDay 映射
  // （首日=抵达、末日=离境、中间=弹性池轮转），否则 /day/N 与主页内容对不上。
  // 2026-09-30 实测 bug：旧的 detailDayForPlanDay 用 ordinal 回退（?? sameCityDetail[0]），
  // 云端 D3/D4/D5（新加坡 5 天、静态只有 3 天内容）在 /day/N 显示错天内容——
  // D4 显示抵达日《飞新加坡 · 滨海湾》且"富国岛飞新加坡"幽灵站点未被 case1 改名（转场标签也被污染），
  // D3 显示离境日《返程》内容、D5 的 case5 改名全部落空，与主页的弹性日/离境日完全不一致。
  const cityDayList = day ? days.filter((d) => d.city_zh === day.city_zh) : [];
  const idxInCity = day
    ? cityDayList.findIndex((d) => d.day === dayNum)
    : -1;
  const detail =
    day && idxInCity >= 0
      ? detailForPlanDay(day, idxInCity, cityDayList.length)
      : undefined;
  const prevDay = days.find((d) => d.day === dayNum - 1) || null;
  // 主页（Home.tsx）对云端天叠加了 cloudDayOverrides 修正；/day/N 必须用同一套，
  // 否则单独页面与主页内容对不上（2026-09-26 验收：/day/10 还在显示恰图恰）。
  const guided = isCloud ? applyCloudDayOverride(dayNum, detail) : detail;
  // 横幅口径：云端天的内容若来自非本天号的原版/弹性日，如实说明来源
  const shifted = isCloud && !!guided && guided.day !== dayNum;
  const ordinalInCity =
    guided && guided.day !== 0
      ? detailDays
          .filter((d) => d.city === guided.city)
          .findIndex((d) => d.day === guided.day) + 1
      : 0;
  // 转场航段名称：取当天行程里带“飞”字的站点（如“普吉飞槟城”）
  const transferLabel = guided?.stops.find((s) => s.name.includes("飞"))?.name;
  // 云端天地图站点：与 ItineraryDayCard 同一算法，保证两处地图一致
  const cloudStops =
    isCloud && guided ? cloudStopsForTimeline(guided.stops) : undefined;

  /* 2026-10-03：单日页也要显示本日预订和今晚住哪（与主页同一套推导）。
   * hooks 必须在 early return 之前调用，day 为空时用空值兜底。 */
  const { rows: bookingRows } = useRecordsData(["booking"]);
  const { rows: favRows } = useRecordsData(["favorite"]);
  const dayByDate = useMemo(() => buildDayByDate(days), [days]);
  const stays = useMemo(() => cityStayRanges(days), [days]);
  const dayBookings: DayBooking[] = useMemo(() => {
    if (!day) return [];
    const out: DayBooking[] = [];
    bookingRows.forEach((r) => {
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
      if (dayNum === day.day) out.push({ day: dayNum, title: r.title, body: r.body || "", done: !!r.done });
    });
    return out;
  }, [bookingRows, dayByDate, day]);
  const favorites: ParsedFavorite[] = useMemo(
    () =>
      favRows
        .map((r) => parseFavoriteRow({ title: r.title, body: r.body || "" }))
        .filter((f) => ["hotel", "restaurant", "flight"].includes(f.type)),
    [favRows]
  );
  const favHotels = day ? favorites.filter((f) => f.type === "hotel" && f.city === day.city_zh) : [];
  const hotelBookings = dayBookings.filter((b) => {
    try {
      return parseBookingBody(b.body).bkind === "hotel";
    } catch {
      return false;
    }
  });

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
          DAY {day.day} / {plan.totalDays}
        </p>
        <h1 className="text-3xl font-bold mb-1">{day.city_zh}</h1>
        {guided && <p className="text-lg text-gray-700 mb-2">{guided.title}</p>}
        <p className="text-gray-500 flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <CalendarDays size={14} /> {year}-{day.date} {day.weekday}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={14} /> {day.city}
          </span>
        </p>
        {shifted && guided && (
          <p className="text-xs text-teal-700 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 mt-3">
            {guided.day === 0 ? (
              <>
                ☁️ 本日为云端规划的弹性日（{guided.title}）：原版行程无对应天数，内容按研究结论补充。
              </>
            ) : (
              <>
                ☁️ 本日城市已按你的云端规划调整为{day.city_zh}；以下攻略取自
                {day.city_zh}第 {ordinalInCity} 天的原版安排。
              </>
            )}
          </p>
        )}
      </div>

      {guided ? (
        <>
          <DayMap
            key={day.day}
            dayNum={day.day}
            cityId={day.city_id}
            cityZh={day.city_zh}
            prevCityId={prevDay ? prevDay.city_id : null}
            prevCityZh={prevDay ? prevDay.city_zh : null}
            transferLabel={transferLabel}
            isCloud={isCloud}
            cloudStops={cloudStops}
          />

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <h2 className="font-bold text-lg mb-4">当天行程</h2>
            <ol className="relative border-l-2 border-teal-100 ml-2 space-y-6">
              {guided.stops.map((s) => {
                const mA = matchItem(s.name, day.city_zh, attractions);
                const mR = !mA ? matchItem(s.name, day.city_zh, restaurants) : undefined;
                const item = mA || mR;
                const kindZh = mA ? "景点" : mR ? "餐厅" : null;
                return (
                  <li key={s.time + s.name} className="ml-4">
                    <span className="absolute -left-[7px] mt-1 w-3 h-3 rounded-full bg-teal-600" />
                    <p className="text-sm font-semibold text-teal-700">{s.time}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold">{s.name}</h3>
                      {item && kindZh && (
                        <Link
                          to={placeDetailPath(kindFromZh(kindZh), day.city_zh, item.name)}
                          className="text-xs font-medium text-white bg-teal-700 hover:bg-teal-600 rounded-full px-2.5 py-0.5"
                        >
                          查看详情
                        </Link>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{s.detail}</p>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="bg-amber-50 rounded-xl border border-amber-200 p-6 mb-6">
            <h2 className="font-bold text-lg mb-2 flex items-center gap-2 text-amber-900">
              <Lightbulb size={18} /> 安排提醒
            </h2>
            <p className="text-sm text-amber-900">{guided.tip}</p>
          </div>

          {/* 2026-10-03：单日页也要显示今晚住哪和本日预订 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <DayHotelSection
              city={day.city_zh}
              stay={stays.get(day.city_zh) ?? null}
              favHotels={favHotels}
              hotelBookings={hotelBookings}
            />
            <DayBookingsSection bookings={dayBookings} />
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

      <DayPlaceDetails cityZh={day.city_zh} />

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
