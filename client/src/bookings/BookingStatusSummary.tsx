/**
 * /bookings 顶部：预订决策汇总（按城市）。
 *
 * 原来在行程页开头的「🏨几家有实时价 · 🍽几家有位 · 🎡几个有票」总结，
 * 已按要求移入预订 Tab 集中展示，行程页开头不再出现。
 *
 * 每城列出：
 * - 酒店：按行程日期的实时房价（USD）与查询时间；没有的如实写"暂无实时价"
 * - 餐厅：空位徽章（有研究数据）或预订政策徽章（需要预定/建议预定/无需预定/未查询）
 * - 景点：余票徽章（有研究数据才显示）；无数据时按是否需要提前订票显示"建议提前订票"/"无需提前订票"
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { hotels, restaurants, attractions } from "@/guide/data";
import { getLiveHotelPrice } from "@/guide/hotelLivePrices";
import {
  useAvailability,
  AvBadge,
  fmtChecked,
} from "@/components/DayPlaceDetails";
import { bookingPolicyBadge } from "./restaurantBookingStatus";
import { placeDetailPath } from "@/guide/placeDetail";

const CITIES = ["新加坡", "普吉", "曼谷", "清迈"];

/** 需要提前订票的景点（无余票数据时显示"建议提前订票"，其余显示"无需提前订票"） */
const NEEDS_ADVANCE_BOOKING = new Set([
  "环球影城",
  "双子塔",
  "滨海湾花园",
  "Mahanakhon 天空步道",
  "Siam Niramit",
  "大象自然公园",
  "Phuket Elephant Sanctuary",
  "攀牙湾",
  "皮皮岛",
  "VinWonders",
  "Vinpearl Safari",
  "古芝地道",
  "大城府 Ayutthaya 古城遗迹",
  "丹嫩沙多水上市场+美功铁道",
]);

function CityBlock({ cityZh }: { cityZh: string }) {
  const [open, setOpen] = useState(false);
  const av = useAvailability();
  const cityHotels = hotels.filter((h) => h.city === cityZh);
  const cityRests = restaurants.filter((r) => r.city === cityZh);
  const cityAttrs = attractions.filter((a) => a.city === cityZh);
  if (!cityHotels.length && !cityRests.length && !cityAttrs.length)
    return null;

  const pricedCount = cityHotels.filter((h) => {
    const p = getLiveHotelPrice(h.name);
    return p && !p.unavailable && p.base;
  }).length;
  const restAvCount = cityRests.filter((r) => av.get(r.name)).length;
  const attrAvCount = cityAttrs.filter((a) => av.get(a.name)).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 mb-3 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50"
      >
        <span className="font-bold text-gray-900">{cityZh}</span>
        <span className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
          <span>
            🏨 {pricedCount}/{cityHotels.length}有实时价 · 🍽{" "}
            {restAvCount}/{cityRests.length}有空位数据 · 🎡 {attrAvCount}/
            {cityAttrs.length}有余票数据
          </span>
          <span className="text-gray-400">{open ? "▲" : "▼"}</span>
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-4">
          {cityHotels.length > 0 && (
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">
                🏨 酒店（{cityHotels.length}）
              </p>
              <div className="space-y-1.5">
                {cityHotels.map((h) => {
                  const p = getLiveHotelPrice(h.name);
                  return (
                    <div
                      key={h.name}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <Link
                        to={placeDetailPath("hotel", h.city, h.name)}
                        className="text-teal-700 hover:underline truncate"
                      >
                        {h.name}
                      </Link>
                      {p && !p.unavailable && p.base ? (
                        <span className="text-xs text-gray-500 shrink-0">
                          <b className="text-teal-700">
                            ${p.base.perNightUSD}/晚起
                          </b>{" "}
                          · 查询于 {p.checkedAt}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 shrink-0">
                          暂无实时价
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {cityRests.length > 0 && (
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">
                🍽 餐厅（{cityRests.length}）
              </p>
              <div className="space-y-1.5">
                {cityRests.map((r) => {
                  const row = av.get(r.name);
                  const badge = !row ? bookingPolicyBadge(r.name) : null;
                  return (
                    <div
                      key={r.name}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <Link
                        to={placeDetailPath("restaurant", r.city, r.name)}
                        className="text-teal-700 hover:underline truncate"
                      >
                        {r.name}
                      </Link>
                      {row ? (
                        <span className="flex items-center gap-1.5 shrink-0">
                          <AvBadge status={row.status} kind="r" />
                          {row.checked_at && (
                            <span className="text-xs text-gray-400">
                              {fmtChecked(row.checked_at)}
                            </span>
                          )}
                        </span>
                      ) : (
                        badge && (
                          <span
                            title={badge.title}
                            className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${badge.cls}`}
                          >
                            {badge.text}
                          </span>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {cityAttrs.length > 0 && (
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">
                🎡 景点（{cityAttrs.length}）
              </p>
              <div className="space-y-1.5">
                {cityAttrs.map((a) => {
                  const row = av.get(a.name);
                  return (
                    <div
                      key={a.name}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <Link
                        to={placeDetailPath("attraction", a.city, a.name)}
                        className="text-teal-700 hover:underline truncate"
                      >
                        {a.name}
                      </Link>
                      {row ? (
                        <span className="flex items-center gap-1.5 shrink-0">
                          <AvBadge status={row.status} kind="a" />
                          {row.checked_at && (
                            <span className="text-xs text-gray-400">
                              {fmtChecked(row.checked_at)}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 shrink-0">
                          {NEEDS_ADVANCE_BOOKING.has(a.name)
                            ? "建议提前订票"
                            : "无需提前订票"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BookingStatusSummary() {
  const [open, setOpen] = useState(true);
  const av = useAvailability();
  const pricedTotal = hotels.filter((h) => {
    const p = getLiveHotelPrice(h.name);
    return p && !p.unavailable && p.base;
  }).length;
  const restAvTotal = restaurants.filter((r) => av.get(r.name)).length;
  const attrAvTotal = attractions.filter((a) => av.get(a.name)).length;
  return (
    <section className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 mb-3 text-left"
      >
        <h2 className="text-lg font-bold text-gray-900">
          🏙️ 城市参考明细
          <span className="ml-2 text-xs font-normal text-gray-500">
            🏨 {pricedTotal}家有实时价 · 🍽 {restAvTotal}家有空位数据 · 🎡{" "}
            {attrAvTotal}个有余票数据
          </span>
        </h2>
        <span className="text-gray-400 text-sm shrink-0">
          {open ? "▲ 收起" : "▼ 展开"}
        </span>
      </button>
      {open && (
        <>
          <p className="text-xs text-gray-500 mb-3">
            按城市列出每家酒店的实时房价、每家餐厅的空位/预订政策、每个景点的余票状态。
            餐厅没有空位数据时如实标注「需要预定/建议预定/无需预定/预定状态未查询」，不留空。
          </p>
          {CITIES.map((c) => (
            <CityBlock key={c} cityZh={c} />
          ))}
        </>
      )}
    </section>
  );
}
