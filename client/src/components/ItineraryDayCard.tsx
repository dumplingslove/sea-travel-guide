import { useState } from "react";
import { Link } from "react-router-dom";
import {
  days as staticDays,
  legs,
  cityMobility,
  attractions,
  restaurants,
  type Day,
  type Item,
} from "@/guide/data";
type Stop = { time: string; name: string; detail: string };
import { getPlaceGallery } from "@/guide/placeGalleries";
import DayMap from "@/components/DayMap";
import {
  DayPlaceDetails,
  AvBadge,
  fmtChecked,
  placeAnchorId,
  type AvRow,
} from "@/components/DayPlaceDetails";
import type { PlanDay } from "@/guide/plannerSchedule";
import { CITY_ID_BY_ZH } from "@/data/cityCoords";

/**
 * 意大利南法站行程页 1:1 逻辑复刻：
 * 单页列出所有天数，每张 Day 卡自包含当天一切信息——
 * 跨城交通 / 市内交通 / 上午下午晚上时间线（含景点配图与空位余票）/
 * 餐饮安排 / 安排提醒 / 本日预订 / 当日路线图 / 本城酒店餐厅景点详情。
 */

/* ---------------- 12月气候参考（气候平均值，非实时预报） ----------------
 * 曼谷/清迈/普吉/胡志明市：weather2visit.com 12月均值；
 * 清迈另核 weather-atlas.com（28.6/15.7°C，降雨16mm）；
 * 吉隆坡：easeweather.com（29/22°C，降雨335.5mm）；
 * 槟城（乔治市）：dwd.de 气候表（31.1/23.4°C，降雨113.5mm）；
 * 富国岛：bestpricetravel/asiatouradvisor（23–30°C，降雨48–104mm）；
 * 新加坡：weather-and-climate.com 新加坡站数据（29/26°C，降雨约360mm，20雨天）。
 */
const CLIMATE: Record<string, string> = {
  曼谷: "31/21°C · 月降雨约11mm · 干燥少雨，短袖+防晒",
  清迈: "28/16°C · 月降雨约12mm · 早晚凉，备薄外套",
  普吉: "31/23°C · 月降雨约66mm · 旱季海况稳，防晒+带伞",
  槟城: "31/23°C · 月降雨约114mm · 阵雨多，随身带伞",
  吉隆坡: "29/22°C · 月降雨约336mm · 全年最湿月之一，多备室内备选",
  胡志明市: "30/22°C · 月降雨约42mm · 干季少雨，短袖即可",
  富国岛: "29/25°C · 月降雨约50–100mm · 干季，海岛装+防晒",
  新加坡: "29/25°C · 月降雨300mm+ · 全年最多雨月份之一，阵雨频繁",
};

/* 云端 13 天行程里新加坡有 5 天、静态只有 3 天内容：
 * 首日取抵达日内容、末日取离境日内容，中间多出的天数用下面两篇弹性日补上。
 * 内容取自本站已有的景点研究结论（含"建议舍"的诚实标注）。 */
const EXTRA_CITY_DAYS: Record<string, Day[]> = {
  新加坡: [
    {
      day: 0,
      date: "",
      city: "新加坡",
      title: "弹性日 · 光影与河",
      stops: [
        {
          time: "09:30",
          name: "ArtScience Museum",
          detail:
            "滨海湾片区的雨天保险：全室内，teamLab 光影展对小娃是降维打击；出发前查特展，有乐高恐龙类主题可直接转正。",
        },
        {
          time: "12:00",
          name: "午餐＋回酒店午睡",
          detail: "中午必回酒店午睡 1.5–2 小时；下午不赶大项目。",
        },
        {
          time: "15:00",
          name: "金沙商场一带",
          detail: "室内商场续逛；阵雨来了正好躲进去。",
        },
        {
          time: "18:00",
          name: "新加坡河游船（看天气）",
          detail:
            "约 40 分钟船程，水上看店屋与天际线昼夜转换；19:30 左右可看昼夜转换并可能从水上看灯光秀。大雨影响体验，天气不好就舍。",
        },
      ],
      food: "ArtScience/金沙园内简餐；晚餐回市区吃 Song Fa 肉骨茶（早去避开排队）。",
      tip: "研究结论里环球影城、夜间动物园、小印度对 2 岁半家庭都偏舍，这两天是 5 天行程的弹性备选：ArtScience 全室内不怕雨，河游船只看天气好才去。",
    },
    {
      day: 0,
      date: "",
      city: "新加坡",
      title: "弹性日 · 老街区慢逛",
      stops: [
        {
          time: "09:30",
          name: "Kampong Glam",
          detail:
            "苏丹清真寺外观＋哈芝巷壁画小店；带小娃 1 小时内逛完。进清真寺需遮肩盖膝，现场提供长袍。",
        },
        {
          time: "11:00",
          name: "Bugis 室内",
          detail: "阵雨备选：白沙浮购物城一带室内逛吃。",
        },
        {
          time: "12:30",
          name: "午餐＋回酒店午睡",
          detail: "中午必回酒店午睡；下午不赶第二个大项目。",
        },
        {
          time: "15:30",
          name: "乌节路",
          detail:
            "白天逛街采购；圣诞灯饰是晚上的事，早睡家庭看不到就别为它改行程。2026 具体亮灯日期出发前查主办方官网。",
        },
        {
          time: "18:00",
          name: "酒店附近晚餐",
          detail: "早吃晚饭回酒店；不安排夜游项目。",
        },
      ],
      food: "Kampong Glam 一带马来餐；晚餐酒店附近解决。",
      tip: "族群区三选一的名额给了牛车水（离境日），今天是纯弹性备选：逛不动就回酒店休息，不硬撑。",
    },
  ],
};

/** 云端/静态行程某天 → 静态内容库里的 Day（首日=抵达内容，末日=离境内容） */
export function detailForPlanDay(
  day: PlanDay,
  idxInCity: number,
  cityDayCount: number,
): Day | undefined {
  const group = staticDays.filter((d) => d.city === day.city_zh);
  if (!group.length) return undefined;
  if (idxInCity === 0) return group[0];
  if (idxInCity === cityDayCount - 1) return group[group.length - 1];
  const pool = [...group.slice(1, -1), ...(EXTRA_CITY_DAYS[day.city_zh] || [])];
  if (!pool.length) return group[Math.min(idxInCity, group.length - 1)];
  return pool[(idxInCity - 1) % pool.length];
}

/* ---------------- 站点 → 景点/餐厅 模糊匹配 ---------------- */
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(
      /[\s·・&,，、\/\(\)\[\]（）「」『』:：;；!！?？."“”‘’—\-–+＋]/g,
      "",
    );
const cjk = (s: string) => (s.match(/[\u4e00-\u9fa5]+/g) || []).join("");

function matchItem(
  stopName: string,
  city: string,
  list: Item[],
): Item | undefined {
  const ns = norm(stopName);
  let best: Item | undefined;
  let bestScore = 0;
  for (const it of list) {
    if (it.city !== city) continue;
    const cands = [norm(it.name), ...norm(it.name).split("&")];
    for (const cand of cands) {
      if (cand.length >= 2 && (ns.includes(cand) || cand.includes(ns))) {
        if (cand.length > bestScore) {
          bestScore = cand.length;
          best = it;
        }
      } else {
        const prefix = cjk(cand).slice(0, 3);
        if (prefix.length >= 3 && ns.includes(prefix) && 3 > bestScore) {
          bestScore = 3;
          best = it;
        }
      }
    }
  }
  return best;
}

function findAv(av: Map<string, AvRow>, name: string): AvRow | undefined {
  const exact = av.get(name);
  if (exact) return exact;
  const nn = norm(name);
  for (const [k, v] of av) {
    const nk = norm(k);
    if (nk.length >= 2 && (nn.includes(nk) || nk.includes(nn))) return v;
  }
  return undefined;
}

function periodOf(time: string): "上午" | "下午" | "晚上" {
  const h = parseInt(time.slice(0, 2), 10);
  if (h < 12) return "上午";
  if (h < 17) return "下午";
  return "晚上";
}

function Collapsible({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 text-left text-base font-bold text-teal-800 hover:text-teal-600"
      >
        {title}
        <span className="text-gray-400 text-sm ml-auto">
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

/* ---------------- 时间线上的单个站点 ---------------- */
function StopBlock({
  stop,
  city,
  av,
}: {
  stop: Stop;
  city: string;
  av: Map<string, AvRow>;
}) {
  const mA = matchItem(stop.name, city, attractions);
  const mR = !mA ? matchItem(stop.name, city, restaurants) : undefined;
  const item = mA || mR;
  const kindZh = mA ? "景点" : mR ? "餐厅" : null;
  const row = item ? findAv(av, item.name) : undefined;
  const photo =
    item && kindZh === "景点" ? getPlaceGallery("景点", item)[0] : undefined;
  return (
    <div className="border-l-2 border-teal-600/30 pl-4 py-3">
      {photo && (
        <div className="mb-3 overflow-hidden rounded-lg">
          <img
            src={photo.src}
            alt={item!.name}
            className="w-full h-44 md:h-52 object-cover rounded-lg"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="text-xs font-bold text-teal-700 bg-teal-50 rounded-full px-2 py-0.5">
          {stop.time}
        </span>
        <h5 className="font-semibold text-base">{stop.name}</h5>
        {row && (
          <AvBadge status={row.status} kind={kindZh === "餐厅" ? "r" : "a"} />
        )}
        {item && kindZh && (
          <a
            href={`#${placeAnchorId(kindZh, city, item.name)}`}
            className="text-xs font-medium text-white bg-teal-700 hover:bg-teal-600 rounded-full px-2.5 py-0.5"
          >
            查看详情
          </a>
        )}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{stop.detail}</p>
      {row && (
        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-gray-800 leading-relaxed">{row.detail}</p>
          <p className="text-xs text-gray-500 mt-1">
            {row.dates}
            {row.party ? ` · ${row.party}` : ""} · 渠道：{row.channel}
            {row.checked_at
              ? ` · 查询于 ${fmtChecked(row.checked_at)}（北京时间）`
              : ""}
          </p>
          {row.note && <p className="text-xs text-gray-500 mt-1">{row.note}</p>}
        </div>
      )}
    </div>
  );
}

/* ---------------- 主组件：一天的完整卡片 ---------------- */
export interface DayBooking {
  day: number | null;
  title: string;
  body: string;
  done: boolean;
}

export function ItineraryDayCard({
  day,
  prevDay,
  detail,
  bookings,
  av,
}: {
  day: PlanDay;
  prevDay: PlanDay | undefined;
  detail: Day | undefined;
  bookings: DayBooking[];
  av: Map<string, AvRow>;
}) {
  const cityId = CITY_ID_BY_ZH[day.city_zh] || day.city_id;
  const prevCityId =
    prevDay && prevDay.city_zh !== day.city_zh
      ? CITY_ID_BY_ZH[prevDay.city_zh] || prevDay.city_id
      : null;
  const stops = detail?.stops || [];
  const transferStop = stops.find((s) => /飞|退房|离境/.test(s.name));
  const isTransfer = !!transferStop || !!prevCityId;

  // 跨城航段匹配（静态 legs；云端路线匹配不上时走通用清单）
  const matchedLeg = (() => {
    if (!prevDay || prevDay.city_zh === day.city_zh) return null;
    for (const l of legs) {
      const m = l[0].match(/(.+?)\s*→\s*(.+)/);
      if (m && m[1].trim() === prevDay.city_zh && m[2].trim() === day.city_zh)
        return l;
    }
    return null;
  })();

  const mobility = cityMobility[day.city_zh];
  const morning = stops.filter((s) => periodOf(s.time) === "上午");
  const afternoon = stops.filter((s) => periodOf(s.time) === "下午");
  const evening = stops.filter((s) => periodOf(s.time) === "晚上");

  // 本城餐厅：有空位数据的优先
  const cityRests = restaurants.filter((r) => r.city === day.city_zh);
  const restPicks = [...cityRests]
    .sort((a, b) => {
      const ha = findAv(av, a.name) ? 0 : 1;
      const hb = findAv(av, b.name) ? 0 : 1;
      return ha - hb;
    })
    .slice(0, 4);

  return (
    <article
      id={`day-${day.day}`}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden scroll-mt-28"
    >
      {/* 头部：Day徽标 + 日期 + 城市 + 气候 */}
      <header className="bg-gradient-to-r from-teal-700/10 to-teal-700/5 border-b-2 border-teal-700/20 px-5 py-5">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <span className="text-lg font-bold text-white bg-teal-700 rounded-lg px-4 py-1">
            Day {day.day}
          </span>
          <span className="text-base font-semibold text-gray-500">
            {day.date} {day.weekday}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          📍 {day.city_zh}
          <span className="text-base font-normal text-gray-400">
            {day.city}
          </span>
        </h2>
        {detail?.title && (
          <p className="text-teal-800 font-medium mt-1">{detail.title}</p>
        )}
        {CLIMATE[day.city_zh] && (
          <p className="text-xs text-gray-500 mt-2">
            🌡 12月气候参考：{CLIMATE[day.city_zh]}
            （气候平均值，临行前查实时预报）
          </p>
        )}
      </header>

      <div className="px-5 py-5">
        {/* 跨城交通（默认折叠） */}
        {isTransfer && (
          <Collapsible
            title={
              <>
                ✈️ 跨城交通
                {matchedLeg
                  ? `：${matchedLeg[0]}`
                  : transferStop
                    ? `：${transferStop.name}`
                    : ""}
              </>
            }
          >
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
              {matchedLeg ? (
                <>
                  <p className="font-semibold text-sky-900">{matchedLeg[0]}</p>
                  <p className="text-sm text-sky-800 mt-1">
                    {matchedLeg[1]} · {matchedLeg[2]}
                  </p>
                </>
              ) : (
                <p className="text-sm text-sky-800">
                  {prevDay && prevDay.city_zh !== day.city_zh
                    ? `${prevDay.city_zh} → ${day.city_zh} 转场日`
                    : "转场/离境日"}
                  ：以下为通用核对清单，具体航班以出票信息为准。
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  "航班号",
                  "航站楼",
                  "托运行李额",
                  "提前3小时到机场",
                  "转机签证",
                  "取消与改签",
                ].map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-white border border-sky-200 text-sky-800 rounded-full px-2.5 py-1"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <Link
                to="/flights"
                className="inline-block mt-3 text-sm font-medium text-sky-700 underline"
              >
                去航班页看全部航段 →
              </Link>
            </div>
          </Collapsible>
        )}

        {/* 市内交通（默认折叠） */}
        {mobility && (
          <Collapsible title={<>🚌 市内交通：{mobility[0]}</>}>
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-sky-900 mb-1">
                主要方式
              </p>
              <p className="text-sm text-sky-800 mb-3">{mobility[0]}</p>
              <p className="text-sm font-semibold text-sky-900 mb-1">
                出行建议
              </p>
              <p className="text-sm text-sky-800 mb-3">{mobility[1]}</p>
              <p className="text-xs text-sky-700 bg-white/60 rounded p-2 border border-sky-200">
                💡 {mobility[2]}
              </p>
              <Link
                to="/transport"
                className="inline-block mt-3 text-sm font-medium text-sky-700 underline"
              >
                去交通指南 →
              </Link>
            </div>
          </Collapsible>
        )}

        {/* 上午 / 下午 / 晚上 */}
        {morning.length > 0 && (
          <section className="mb-6">
            <h4 className="text-lg font-bold mb-3 text-teal-800">☀️ 上午</h4>
            <div className="space-y-2">
              {morning.map((s, i) => (
                <StopBlock key={i} stop={s} city={day.city_zh} av={av} />
              ))}
            </div>
          </section>
        )}
        {afternoon.length > 0 && (
          <section className="mb-6">
            <h4 className="text-lg font-bold mb-3 text-teal-800">🌤 下午</h4>
            <div className="space-y-2">
              {afternoon.map((s, i) => (
                <StopBlock key={i} stop={s} city={day.city_zh} av={av} />
              ))}
            </div>
          </section>
        )}
        {evening.length > 0 && (
          <section className="mb-6">
            <h4 className="text-lg font-bold mb-3 text-teal-800">🌙 晚上</h4>
            <div className="space-y-2">
              {evening.map((s, i) => (
                <StopBlock key={i} stop={s} city={day.city_zh} av={av} />
              ))}
            </div>
          </section>
        )}
        {!detail && (
          <p className="text-sm text-gray-400 mb-6">
            该日详细时间线待补充，先看下方本城酒店/餐厅/景点详情。
          </p>
        )}

        {/* 餐饮安排 */}
        {(detail?.food || restPicks.length > 0) && (
          <section className="mb-6 pt-6 border-t border-gray-100">
            <h4 className="text-lg font-bold mb-3 text-orange-700">
              🍽️ 餐饮安排
            </h4>
            {detail?.food && (
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {detail.food}
              </p>
            )}
            {restPicks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {restPicks.map((r) => {
                  const row = findAv(av, r.name);
                  return (
                    <a
                      key={r.name}
                      href={`#${placeAnchorId("餐厅", r.city, r.name)}`}
                      className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 hover:shadow-sm"
                    >
                      <span className="text-sm font-semibold flex-1">
                        {r.name}
                      </span>
                      {row ? (
                        <AvBadge status={row.status} kind="r" />
                      ) : (
                        <span className="text-xs text-gray-400">未核空位</span>
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* 安排提醒 */}
        {detail?.tip && (
          <section className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <h4 className="font-bold mb-2 text-purple-700">💡 安排提醒</h4>
            <p className="text-sm text-purple-900 leading-relaxed">
              {detail.tip}
            </p>
          </section>
        )}

        {/* 本日预订 */}
        {bookings.length > 0 && (
          <section className="mb-6 pt-6 border-t border-gray-100">
            <h4 className="text-lg font-bold mb-3 text-green-700">
              ✅ 本日预订
            </h4>
            <div className="space-y-2">
              {bookings.map((b, i) => (
                <div
                  key={i}
                  className="bg-green-50 border border-green-200 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-sm">{b.title}</p>
                    {b.done && (
                      <span className="text-xs font-bold text-white bg-green-600 rounded-full px-2 py-0.5">
                        已确认
                      </span>
                    )}
                  </div>
                  {b.body && (
                    <p className="text-xs text-gray-600 whitespace-pre-wrap">
                      {b.body}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <Link
              to="/bookings"
              className="inline-block mt-2 text-sm font-medium text-green-700 underline"
            >
              去我的预订管理 →
            </Link>
          </section>
        )}

        {/* 当日路线图 */}
        <section className="mb-6">
          <h4 className="text-lg font-bold mb-3">🗺️ 当日路线</h4>
          <DayMap
            dayNum={day.day}
            cityId={cityId}
            cityZh={day.city_zh}
            prevCityId={prevCityId}
            prevCityZh={prevDay?.city_zh ?? null}
            transferLabel={transferStop?.name}
          />
        </section>

        {/* 本城酒店 / 餐厅 / 景点详情 */}
        <DayPlaceDetails cityZh={day.city_zh} />

        <div className="pt-2">
          <Link
            to={`/day/${day.day}`}
            className="text-sm font-medium text-teal-700 underline"
          >
            在单独页面打开 Day {day.day} →
          </Link>
        </div>
      </div>
    </article>
  );
}
