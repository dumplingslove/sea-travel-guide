import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  days as staticDays,
  attractions,
  restaurants,
  hotels,
  type Day,
  type Item,
} from "@/guide/data";
import { getGuideFacts, xhsEvidence, xhsAssessments } from "@/guide/research";
import { attractionGuides } from "@/guide/attractionGuides";
import {
  BOOKING_KIND_LABEL,
  BOOKING_FIELD_LABEL,
  parseBookingBody,
  bookingSummary,
  type BookingData,
} from "@/bookings/bookingTypes";
type Stop = { time: string; name: string; detail: string };
import { getPlaceGallery } from "@/guide/placeGalleries";
import { cloudStopsForTimeline, stopCoordsForDay, type StopCoord } from "@/data/stopCoords";
import { placesForCity } from "@/data/placeCoords";
import { airportForCity } from "@/data/airportCoords";
import { stickyItemKey, type DayRoute, type DayRouteStop } from "@/components/StickyMapBar";
import {
  bookingPolicyBadge,
  getRestaurantBookingPolicy,
  mustGoBadge,
  MUST_GO,
} from "@/bookings/restaurantBookingStatus";
import {
  mapsUrlForAddress,
  placeMapsUrl,
  placeOfficialUrl,
  restaurantCuisine,
} from "@/guide/placeDetail";
import { PlaceDetailSections } from "@/pages/PlaceDetail";
import { getPlaceImage } from "@/guide/placeMedia";
import { useDetailReturn } from "@/components/DetailReturn";
import { useRecordsData } from "@/pages/records/shared";
import type { PlanDay } from "@/guide/plannerSchedule";
import { CITY_ID_BY_ZH } from "@/data/cityCoords";
import { FLIGHT_LEGS, carrierBaggageLabel, type FlightLegInfo } from "@/bookings/bookingTimeline";
import { bareName } from "@/bookings/nameMatch";

/* ============ 每日行程 enrichment：预订/收藏/酒店（2026-10-03 用户模型） ============
 * 行程页是出行时每天看的：每天要显示当天的酒店、航班、餐厅（收藏的和已订的），
 * 真订了的信息也要落在对应日期上。以下 helpers 供 Home（列表页）与 DayDetail（单日页）共用。
 */

/** "12月6日"/"12/06"/"2026-12-06" → "2026-12-06"（行程 2026-11～2027-01：10-12月归2026，1-9月归2027） */
export function toISODate(s: string): string | null {
  if (!s) return null;
  let m = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = s.match(/(\d{1,2})月(\d{1,2})日/);
  if (m) {
    const mo = Number(m[1]);
    const yr = mo >= 10 ? 2026 : 2027;
    return `${yr}-${String(mo).padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  }
  m = s.match(/(\d{1,2})\/(\d{1,2})/);
  if (m) {
    const mo = Number(m[1]);
    const yr = mo >= 10 ? 2026 : 2027;
    return `${yr}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  }
  /* PlanDay.date 是 fmtMD 的 "M-D" 短格式（如 "12-6"）：buildDayByDate 靠它把
   * 行程天转回 ISO 挂预订，此前不认这个格式导致映射表恒为空、按日期挂天全失效
   * （2026-10-21 审计发现）。锚定整串匹配，避免误伤 "2026-12-06" 这类全 ISO。 */
  m = s.match(/^(\d{1,2})-(\d{1,2})$/);
  if (m) {
    const mo = Number(m[1]);
    const yr = mo >= 10 ? 2026 : 2027;
    return `${yr}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  }
  return null;
}

/** 日期（ISO）→ 天号：预订只填了日期没填天号时自动挂天 */
export function buildDayByDate(days: PlanDay[]): Map<string, number> {
  const m = new Map<string, number>();
  days.forEach((d) => {
    const iso = toISODate(d.date);
    if (iso && !m.has(iso)) m.set(iso, d.day);
  });
  return m;
}

/**
 * 预订记录 → 按天分组（Home 列表页与 DayDetail 单日页共用，全站唯一挂天口径）。
 *
 * 只认记录 body 里的日期，不许用记录的 day 列：day 列是按 2026-12-06 起算的
 * 旧口径偏移量，与行程天号（schedule 序号）不是一套——曾导致全部预订错位一天、
 * 首尔预订挂到不存在的天号而整页消失（2026-10-21 用户抓包后改）。
 *
 * 日期不在任何行程卡里时（如分开行动日 12-20 的离境航班）：挂到同城最近的
 * 前一张卡，卡片摘要自带真实日期，不冒充本日；同城也没有卡（如西雅图出发的
 * 去程航班）就不挂，预订页/最终预定里仍有完整记录。
 */
export function buildBookingsByDay(
  rows: { title: string; body: string; done: boolean }[],
  days: PlanDay[],
): Map<number, DayBooking[]> {
  const byDate = buildDayByDate(days);
  const isoOfDay = new Map<number, string>();
  days.forEach((d) => {
    const iso = toISODate(d.date);
    if (iso) isoOfDay.set(d.day, iso);
  });
  const sortedDays = [...days].sort((a, b) => a.day - b.day);
  const out = new Map<number, DayBooking[]>();
  rows.forEach((r) => {
    let bd: ReturnType<typeof parseBookingBody>;
    try {
      bd = parseBookingBody(r.body || "");
    } catch {
      return;
    }
    const iso = bd.date ? toISODate(bd.date) : null;
    if (!iso) return;
    /* 酒店按住宿区间展开（2026-10-22 用户抓包补修）：酒店记录的 date 是入住日、
     * dateEnd 是退房日，住的每一个晚上都要挂到当天卡上——此前只挂入住日，
     * 续住晚的「今晚住哪」看不到已订酒店、甚至显示成没订/仅收藏未确认。 */
    const nightIsos: string[] = [iso];
    if (bd.bkind === "hotel" && bd.dateEnd) {
      const endIso = toISODate(bd.dateEnd);
      if (endIso && endIso > iso) {
        let cur = addOneDay(iso);
        while (cur < endIso) {
          nightIsos.push(cur);
          cur = addOneDay(cur);
        }
      }
    }
    nightIsos.forEach((nightIso, nightIdx) => {
      let dayNum: number | null = byDate.get(nightIso) ?? null;
      if (dayNum == null && nightIdx === 0 && bd.city) {
        for (const d of sortedDays) {
          const di = isoOfDay.get(d.day);
          if (di && di < iso && d.city_zh === bd.city) dayNum = d.day;
        }
      }
      if (dayNum == null) return;
      const list = out.get(dayNum) || [];
      list.push({ day: dayNum, title: r.title, body: r.body || "", done: !!r.done, stayNight: nightIdx });
      out.set(dayNum, list);
    });
  });
  return out;
}

function addOneDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + 1);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

  /* 每城住宿区间（与航班模型一致：入住=到达当天=本城首日，退房=转场航班当天=下一城首日；
 * 末城退房=本城末日——末日即离境日，当天退房，不多住一晚；此前末城写成末日+1，
 * 导致退房日当天卡片误写成 3 晚（2026-11-01 韩国页审计核实，JW 12/30→01-01 应为 2 晚）。 */
export function cityStayRanges(days: PlanDay[]): Map<string, { checkIn: string; checkOut: string }> {
  const first = new Map<string, string>();
  const last = new Map<string, string>();
  const order: string[] = [];
  days.forEach((d) => {
    const iso = toISODate(d.date);
    if (!iso) return;
    if (!first.has(d.city_zh)) {
      first.set(d.city_zh, iso);
      order.push(d.city_zh);
    }
    last.set(d.city_zh, iso);
  });
  const out = new Map<string, { checkIn: string; checkOut: string }>();
  order.forEach((c, i) => {
    const next = order[i + 1];
    out.set(c, {
      checkIn: first.get(c)!,
      checkOut: next ? first.get(next)! : last.get(c)!,
    });
  });
  return out;
}

export interface ParsedFavorite {
  name: string;
  city: string;
  type: string;
  /** 收藏景点「排入某天」的指定日期（ISO，存收藏记录 body.assignDate；2026-10-16 新增） */
  assignDate?: string;
  flight?: {
    carrier?: string;
    flight?: string;
    depart?: string;
    arrive?: string;
    arrivePlusDay?: boolean;
    price?: number;
    cabin?: string;
    route?: string;
    date?: string;
    queriedAt?: string;
  };
}

/** 解析收藏记录（与 BookingsPage 的 FavoriteActionList 同构） */
export function parseFavoriteRow(r: { title: string; body: string }): ParsedFavorite {
  try {
    const d = JSON.parse(r.body || "{}") as {
      city?: string;
      type?: string;
      assignDate?: string;
      flight?: ParsedFavorite["flight"];
    };
    return { name: r.title, city: d.city ?? "", type: d.type ?? "attraction", flight: d.flight, assignDate: d.assignDate };
  } catch {
    return { name: r.title, city: "", type: "attraction" };
  }
}

/** ISO → "M/D" 短日期 */
export function isoShort(iso: string): string {
  const p = iso.split("-");
  return p.length === 3 ? `${Number(p[1])}/${Number(p[2])}` : iso;
}

/**
 * 行程页是旅游途中第一个要看的东西：每天一张卡，自包含当天一切信息——
 * 今日已定（住/机票/吃统一一单，按时间排序）/ 上午下午晚上时间线
 * （一行一站，点开在原地看实用信息）/ 餐饮安排 / 安排提醒（最多 2 行）/
 * 当日路线图 / 本城酒店餐厅景点详情。
 * 2026-11-21 二次改版：删气候行、购物行、穿搭建议、研究依据计数、
 * 跨城交通折叠区与「本日预订」区；日卡内不再跳往 /attraction/ 详情页。
 */

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
        // 2026-10-24 移除原 18:00「新加坡河游船（看天气）」站：此弹性日落在 12-08，
        // 当晚 18:00 已订 Jumbo Seafood（Dempsey Hill），同刻冲突；河船正式可选站
        // 已在 12-07 cloudDayOverrides（ordinal 1 的 18:00 黄昏班），不在此重复排。
      ],
      // food 口径（2026-10-24）：此弹性日当前落在 12-08，当晚 18:00 已订 Jumbo Seafood
      // （Dempsey Hill）；Song Fa 只写成「当晚未订餐厅时」的条件备选，避免渲染出的
      // 「另：…」被误读成当晚还有第二顿晚餐。轮换到没订餐的日期时该句仍成立。
      food: "ArtScience/金沙园内简餐；晚餐若当天没订餐厅，可回市区吃 Song Fa 肉骨茶（早去避开排队）。",
      tip: "研究结论里环球影城、夜间动物园、小印度对 2 岁半家庭都偏舍，这两天是 5 天行程的弹性备选：ArtScience 全室内不怕雨，下午金沙一带室内慢逛。本日不再排河游船：黄昏班已列为另一天的可选站，今天傍晚以已订晚餐为准。",
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
            "白天逛街采购；顺路两个点：多美歌的国家博物馆历史展厅 2026-10 刚翻新重开（室内、亲子友好），往西到唐林是新加坡植物园，里面的 Jacob Ballas 儿童花园有玩水区和游乐场，适合给娃放电。圣诞灯饰傍晚约 18:30 就亮，早点吃晚饭的话娃睡前能看一段（义安城/东陵坊有飘雪表演）；2026 亮灯档期已坐实 11-17 至次年 01-03（金色主题，见目录「乌节路」条目；资讯号转述官宣口径，临行官方复核）。（2026-10-17 发现轮换补充；档期由 round492 2026-10-31 更新）往南约 10 分钟是 River Valley 的 New Bahru 文创园区，首尔排队王 MilkyShop 黄油夹心饼在那儿快闪到 2027-01-02，每天限量 250 盒、S$30 多一盒，想吃要上午去。（2026-10-17 发现轮换第二轮补充）",
        },
        {
          time: "18:00",
          name: "酒店附近晚餐",
          detail: "早吃晚饭回酒店；不安排夜游项目。",
        },
      ],
      food: "Kampong Glam 一带马来餐；晚餐酒店附近解决。",
      tip: "族群区三选一的名额给了牛车水（转场前日），今天是纯弹性备选：逛不动就回酒店休息，不硬撑。另一个半日备选：西边 Kent Ridge 的 Geneo 商场（木结构大中庭、两层餐厅，二楼有 S$7 玩半小时的充气城堡），能避开乌节路的人潮（2026-10-17 发现轮换第二轮补充）。",
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

/* 站名 → 目录条目名 别名（2026-11-07 site-improve-hourly 类别1/2）：
 * 站名写法与目录条目名对不上的 4 处真缺口（00:38 轮 stops→目录核查逐条裁决），
 * 通用子串/三字前缀规则够不着：Torry's 站名写「刨冰收尾」而条目叫「冰淇淋刨冰」；
 * 「擎天树」是滨海湾花园超级树的俗称、条目名里没有；「明洞逛街」对 SA 条目
 * 「明洞 Myeongdong」只有 2 字中文名、无三字前缀 fallback；「旧机场路」对
 * R 条目「Old Airport Road」中英名完全不一。别名先于转场守卫判断——
 * 「旧机场路」含「机场」二字，若先走守卫会被当成转场站拦掉。
 * 只认同城同名条目，别名键本身不参与通用比对、不扩散到别的站。 */
const STOP_ALIASES: [string, string][] = [
  ["刨冰收尾", "Torry's Ice Cream 冰淇淋刨冰"],
  ["擎天树", "滨海湾花园"],
  ["明洞逛街", "明洞 Myeongdong"],
  ["旧机场路", "Old Airport Road"],
  // 酒店时间站 → 酒店条目（2026-11-22 Day 6 封面图：StopBlock 接入 hotels 匹配；
  // 别名键是站名里的酒店名/动作词，目标是同城 H() 条目确切名；对景点/餐厅列表无害，
  // 目标不在那些表里就落空、继续走通用比对。别名先于转场守卫判断，
  // 含「退房/入住」的换酒店站也能链到酒店图。）
  ["Banyan Tree", "Banyan Tree Phuket"],
  ["回别墅歇脚", "Banyan Tree Phuket"],
  ["Dinso", "Dinso Resort & Villas Phuket"],
  ["137 Pillars", "137 Pillars House"],
  ["酒店烹饪课", "137 Pillars House"],
  ["Rosewood", "Rosewood Bangkok"],
  ["Park Hyatt", "Park Hyatt Bangkok 曼谷柏悦酒店"],
  // 瑞吉须在「金沙退房」之前（2026-11-22 用户纠正：12-08 换酒店站名含两家酒店，
  // 别名按序取首个命中；该站当晚住瑞吉，配瑞吉图。瑞吉与首尔 JW 万豪各有 15 张
  // gallery 图在库，之前因缺别名没链上、不是没图。）
  ["瑞吉", "The St. Regis Singapore 新加坡瑞吉酒店"],
  ["JW Marriott", "首尔JW万豪酒店 JW Marriott Hotel Seoul"],
  ["金沙退房", "Marina Bay Sands"],
  // 机场站 → 机场条目（2026-11-22 机场图补齐：PEK/XIY/ICN 各 3 张实拍图入库）。
  // 「仁川机场」能直链（01-01 是首尔日、条目 city 首尔同城）；
  // 「咸阳机场」同城校验拦住（12-30 是首尔日、西安咸阳条目 city 为西安），
  // 那站改由下方 airportThumbs 的站名关键词路径兜底，别名留着当西安日备用。
  ["咸阳机场", "西安咸阳国际机场"],
  ["仁川机场", "仁川国际机场"],
];

export function matchItem(
  stopName: string,
  city: string,
  list: Item[],
): Item | undefined {
  // 去括号再比对（2026-11-07 site-improve-hourly 类别1/2）：
  // 括号里只是顺带提及/时间锚点，不算该地已有一站——12-12「酒店时间 · 回别墅歇脚（出海后、PRU 前）」
  // 不再误链到 PRU 餐厅条目；12-16「泰拳体验课（约 1 小时）」能链到清迈泰拳体验课条目；
  // 12-08「亚洲文明博物馆 · 敦煌特展（半日，与旧机场路二选一）」不再被括号里的“机场”二字触发守卫。
  // 守卫与比对一律以去括号后的站名判断（17 日 85 站实测：仅此 3 处变化，其余 82 站不变）。
  const bare = bareName(stopName);
  // 别名先行（2026-11-07 site-improve-hourly 类别1/2）：站名含别名键即直链
  // 同城同名条目；Old Airport Road 一例证明别名必须在守卫之前判断。
  const nsAlias = norm(bare);
  for (const [key, target] of STOP_ALIASES) {
    if (nsAlias.includes(norm(key))) {
      const hit = list.find(
        (it) => it.city === city && norm(it.name) === norm(target),
      );
      if (hit) return hit;
    }
  }
  // 转场/后勤类站点不参与景点·餐厅匹配：
  // 否则"抵达樟宜机场"会被"新加坡"三字前缀误链到动物园等条目，点出错误的"查看详情"
  if (/机场|航班|飞往|抵达|离境|入住|退房|午睡|收行李|码头集合/.test(bare))
    return undefined;
  const ns = norm(bare);
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

function periodOf(time: string): "上午" | "下午" | "晚上" {
  /* 中文时段标签必须先认（2026-10-27 类别2核查）：parseInt("上午")=NaN，
   * 此前所有非数字 time 一律掉进「晚上」——cloudDayOverrides 里
   * time:"上午" 的站（ACM 敦煌特展／旧机场路／国家博物馆／Layan Beach）、
   * time:"下午" 的 Banyan Tree 酒店时间、time:"全天…" 的 Exploria 专程日
   * 全被错分到🌙晚上栏，与它们自己的时段标签自相矛盾。
   * 「全天」归上午栏：全天备选站要在一天开头就被看到、好做二选一决定；
   * 「入住后」等无时段词标签维持旧回退（晚上），其 detail 本就按傍晚入住写。 */
  if (/上午|早上|早晨|清晨|全天/.test(time)) return "上午";
  if (/中午|下午/.test(time)) return "下午";
  if (/傍晚|晚上|晚间|夜/.test(time)) return "晚上";
  const h = parseInt(time.slice(0, 2), 10);
  if (h < 12) return "上午";
  if (h < 17) return "下午";
  return "晚上";
}

/* ============ 餐饮/提醒结构化呈现（2026-10-22 用户要求） ============
 * 用户原话：餐饮现在全是大段文字、每天塞一堆餐厅根本吃不完；安排提醒也是
 * 小红书研究结论堆成大段文字、没法读。定版结构：
 * ① 餐饮三层：已预订置顶 → 必吃（mustGo 数据集判定）highlight → 其余全部折叠；
 * ② food 长文按段拆成条目，只露前 2 条，其余进折叠区；
 * ③ 提醒按【小标题】拆成结构卡，只露 1 条最重要，其余进折叠区；
 *    无标题的提醒按句拆条。研究新发现今后应直接进 stops 时间线，
 *    不许再往 tip/food 字符串尾巴上追加段落（管线规则已同步）。 */

/** food 长文拆段：段首标记（🍽️ ✅ 🌙 ⚠️）与「另：」是历史追加的段界。 */
export function splitFoodText(text: string): string[] {
  if (!text) return [];
  const raw = text
    .replace(/(🍽️|✅|🌙|⚠️)/g, "\n$1")
    /* 长串里用「•」当分隔符的（研究追加段常见），此前拆不开、整段成墙：
     * 2026-10-23 全行程审计实测曼谷 D14 单条 2182 字、新加坡 D2 836 字、普吉 D8 1042 字。 */
    .replace(/•\s*/g, "\n• ")
    .split(/\n|另：/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
  /* 仍超长的段按句（。/；）重组到 ≤180 字一条，单句超长再硬切——保证默认露出的
   * 前 2 条不再是文字墙，其余进「更多吃法备选」折叠区。 */
  const out: string[] = [];
  for (const seg of raw) {
    if (seg.length <= 180) {
      out.push(seg);
      continue;
    }
    const sentences = seg.split(/(?<=。|；)/).map((s) => s.trim()).filter(Boolean);
    let cur = "";
    for (const s of sentences) {
      if (cur && cur.length + s.length > 180) {
        out.push(cur);
        cur = s;
      } else cur += s;
      while (cur.length > 200) {
        out.push(cur.slice(0, 200));
        cur = cur.slice(200);
      }
    }
    if (cur) out.push(cur);
  }
  return out;
}

/** food 长文按早/午/晚各取一行的启发式摘要（2026-11-21 日卡改版过渡用，
 * P1 结构化 food 数据落地后替换）：只认段首 80 字内出现「早餐/午餐/晚餐」
 * 的段，取其首句截到 60 字；认不出的餐不硬凑、返回 null。 */
function mealLine(segs: string[], meal: "早" | "午" | "晚"): string | null {
  const re = meal === "早" ? /早餐|早饭/ : meal === "午" ? /午餐|午饭/ : /晚餐|晚饭|夜宵/;
  const seg = segs.find((s) => re.test(s.slice(0, 80)));
  if (!seg) return null;
  const first = (seg.split(/(?<=。|；)/)[0] ?? "").trim();
  if (!first) return null;
  return first.length > 60 ? `${first.slice(0, 60)}…` : first;
}

/** detail 首句（≤60 字）作站点默认摘要：超长截断加 …；没句号时硬切。 */
function firstSentence(text: string, maxLen = 60): string {
  const t = text.trim();
  const m = t.match(/^[^。；!！？\n]{1,120}?[。；!！？]/);
  const first = (m ? m[0] : t.slice(0, maxLen)).trim();
  if (first.length <= maxLen) return first;
  return `${first.slice(0, maxLen)}…`;
}

export interface TipItem {
  title: string | null;
  body: string;
}

/** tip 长文拆条：【标题】内容…是研究追加的固定格式；无标题时按句拆。 */
export function parseTipItems(text: string): TipItem[] {
  if (!text) return [];
  const t = text.trim();
  if (!t.includes("【")) {
    return t
      .split(/(?<=。)/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((body) => ({ title: null, body }));
  }
  const parts = t.split(/(?=【[^】]+】)/).filter((s) => s.trim());
  const out: TipItem[] = [];
  for (const p of parts) {
    const m = p.match(/^【([^】]+)】\s*(.*)$/s);
    if (m) out.push({ title: m[1].trim(), body: m[2].trim() });
    else
      p.split(/(?<=。)/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((body) => out.push({ title: null, body }));
  }
  return out;
}

function TipCard({ item }: { item: TipItem }) {
  return (
    <div className="bg-white/70 border border-purple-200 rounded-lg px-3 py-2">
      {item.title && (
        <p className="text-xs font-bold text-purple-800 mb-0.5">{item.title}</p>
      )}
      <p className="text-sm text-purple-900 leading-relaxed">{item.body}</p>
    </div>
  );
}

/** 安排提醒结构化列表：每张日卡最多 2 行、只留当天必须行动的事
 * （2026-11-21 二次改版：不再折叠收纳更多提醒，多余的不显示），
 * （Home 日卡与 DayDetail 共用）。 */
export function TipStructured({ tip }: { tip: string }) {
  const items = parseTipItems(tip);
  if (!items.length) return null;
  const visible = items.slice(0, 2);
  return (
    <div className="space-y-2">
      {visible.map((it, i) => (
        <TipCard key={i} item={it} />
      ))}
    </div>
  );
}

/* ---------------- 预订详情展开（2026-10-23 用户要求：行程里点开就能看全详情） ----------------
 * 此前行程日卡只显示 bookingSummary 一行摘要 + note，记录 body.details 里的结构化
 * 明细（确认号/房型/座位/客票号/总价/取消政策/早餐福利…）只有最终预定页才渲染，
 * 出行时在行程页根本看不到。统一展开组件：酒店（今晚住哪）、本日预订（机票/景点/
 * 餐厅）、餐饮安排的已预订餐厅，三处共用，点开即是全量明细表。 */
export function BookingDetailsExpand({
  bd,
  bare = false,
  summaryLabel,
}: {
  bd: BookingData;
  /** 只渲染明细表、不包 <details>：供「今日已定」行内展开复用（行本身就是 <details>） */
  bare?: boolean;
  /** 多间房/多条记录并列时区分用的展开标题 */
  summaryLabel?: string;
}) {
  const labels = BOOKING_FIELD_LABEL[bd.bkind] ?? BOOKING_FIELD_LABEL.other;
  const rows: [string, string][] = [];
  const detailValues = new Set<string>(
    bd.details ? Object.values(bd.details).map((v) => String(v)) : [],
  );
  const push = (label: string, v?: string) => {
    if (v && !detailValues.has(v)) rows.push([label, v]);
  };
  if (bd.code) rows.push(["确认号", bd.code]);
  if (bd.date) push(labels.date, bd.dateEnd ? `${bd.date} → ${bd.dateEnd}` : bd.date);
  if (bd.time) push(labels.time ?? "时间", bd.timeEnd ? `${bd.time}–${bd.timeEnd}` : bd.time);
  if (bd.guests) push(labels.guests ?? "数量", bd.guests);
  const ex = bd.extra as unknown;
  if (typeof ex === "string" && ex) push(labels.extra ?? "补充信息", ex);
  else if (ex && typeof ex === "object") {
    Object.entries(ex as Record<string, string>).forEach(([k, v]) => {
      if (v) rows.push([k, String(v)]);
    });
  }
  if (bd.details) {
    Object.entries(bd.details).forEach(([k, v]) => {
      if (v) rows.push([k, String(v)]);
    });
  }
  if (!rows.length) return null;
  const dl = (
    <dl className="mt-1.5 bg-white/70 border border-gray-200 rounded-lg px-3 py-2 space-y-1">
      {rows.map(([k, v], i) => (
        <div key={i} className="flex gap-2 text-xs leading-relaxed">
          <dt className="text-gray-500 shrink-0 w-20">{k}</dt>
          <dd className="font-medium text-gray-800 break-words min-w-0">{v}</dd>
        </div>
      ))}
    </dl>
  );
  if (bare) return dl;
  return (
    <details className="mt-2">
      <summary className="text-xs font-semibold text-teal-800 cursor-pointer py-0.5">
        {summaryLabel ?? "📋 查看预订详情（确认号 / 房型·座位 / 价格 / 取消政策）▾"}
      </summary>
      {dl}
    </details>
  );
}

/* ---------------- 研究依据（2026-10-23 用户要求：行程里要看得出哪些是研究出来的） ----------------
 * 此前几百篇小红书实证只躺在各地点详情页里，行程日卡上 0 条小红书链接、0 处结论，
 * 用户翻行程根本看不出哪些内容是查过的。本区按天汇总：当天涉及的地点里有实证的，
 * 逐个给出明确结论（推荐/谨慎选择/不推荐 + 一句结论）与原帖链接（最多 3 篇/处）。 */
export interface ResearchEntry {
  name: string;
  verdict?: string;
  why?: string;
  count: number;
  links: { title: string; url: string; note: string }[];
}

export function researchEntryFor(item: Item | undefined, displayName?: string): ResearchEntry | null {
  if (!item) return null;
  const links = xhsEvidence[item.name] ?? [];
  const as = xhsAssessments[item.name];
  if (!links.length && !as) return null;
  return {
    name: displayName ?? item.name,
    verdict: as?.verdict,
    why: as?.why,
    count: links.length,
    links: links.slice(0, 3),
  };
}

export function DayResearchSection({ entries }: { entries: ResearchEntry[] }) {
  if (!entries.length) return null;
  const total = entries.reduce((n, e) => n + e.count, 0);
  const badge = (v?: string) =>
    v === "推荐"
      ? "text-green-700 bg-green-100 border-green-200"
      : v === "谨慎选择"
        ? "text-amber-700 bg-amber-100 border-amber-200"
        : v === "不推荐"
          ? "text-red-700 bg-red-100 border-red-200"
          : "text-gray-500 bg-gray-100 border-gray-200";
  return (
    <section className="mb-6 pt-6 border-t border-gray-100">
      <details>
        <summary className="cursor-pointer">
          <span className="text-lg font-bold text-indigo-800">🔎 研究依据 · 小红书实证 {total} 篇</span>
          <span className="block text-xs text-gray-500 mt-0.5">
            本日 {entries.length} 个地点是真查过小红书的、都有明确结论——点开看结论和原帖链接 ▾
          </span>
        </summary>
        <div className="space-y-2 mt-3">
          {entries.map((e, i) => (
            <div key={i} className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">{e.name}</span>
                {e.verdict && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${badge(e.verdict)}`}>
                    {e.verdict}
                  </span>
                )}
                <span className="text-xs text-gray-500">小红书 {e.count} 篇实证</span>
              </div>
              {e.why && <p className="text-xs text-gray-700 mt-1">结论：{e.why}</p>}
              {e.links.length > 0 && (
                <ul className="mt-1.5 space-y-1">
                  {e.links.map((l, j) => (
                    <li key={j} className="text-xs leading-relaxed">
                      <a href={l.url} target="_blank" rel="noreferrer" className="text-indigo-700 underline font-medium">
                        📕 {l.title}
                      </a>
                      {l.note && <span className="text-gray-500"> · {l.note}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}

/* ---------------- 本城备选清单（2026-11-22 用户改版：挂到每张日卡上） ----------------
 * 原 2026-11-21 版放在每个城市最后一天卡片之后单独占一块；现改为每张日卡顶部
 * 一个可点击展开的入口（默认收起），点开在卡片内原地展开本城全部备选。
 * 过滤口径不变：景点去掉已排进日程的（全部列出）；餐厅去掉已订与已排进日程的，
 * 收藏优先、再按订位政策排序，取前 10 家。
 * 2026-11-22 追加：① 详情一律行内原地展开（PlaceDetailSections 同款渲染，
 * 照片/菜系/meta/detail/best/订位政策全有），不再跳 PlaceDetail 页；
 * 每行收起时也有缩略图（站内 placeMedia 已有图才显示，没图留占位、不编图）；
 * ② 每项都有谷歌地图链接（名+城生成）与官网链接（只认已核实地址，没有标待核验）。
 * 每项可直接「放入行程」：选本城某天，走收藏记录的 assignDate 机制
 * （与行程页顶部 FavoriteItineraryCheck 同源）；没收藏过的先建一条 favorite
 * 记录再写 assignDate，不只改本地 state。 */
export function backupListsForCity(
  city: string,
  scheduledNames?: Set<string>,
  bookedRestNames?: Set<string>,
  favRestNames?: Set<string>,
): { attrs: Item[]; rests: Item[] } {
  const backupAttrs = attractions.filter(
    (a) =>
      a.city === city &&
      ![...(scheduledNames || [])].some((stName) => matchItem(stName, city, [a])),
  );
  const backupRests = restaurants
    .filter((r) => {
      if (r.city !== city) return false;
      const n = r.name.trim().toLowerCase();
      if (bookedRestNames?.has(n)) return false;
      if ([...(scheduledNames || [])].some((stName) => matchItem(stName, city, [r])))
        return false;
      return true;
    })
    .sort((a, b) => {
      const favA = favRestNames?.has(a.name.trim().toLowerCase()) ? 0 : 1;
      const favB = favRestNames?.has(b.name.trim().toLowerCase()) ? 0 : 1;
      if (favA !== favB) return favA - favB;
      const prio = (n: string) => {
        const p = getRestaurantBookingPolicy(n)?.policy;
        return p === "must_book" ? 0 : p === "peak_recommended" ? 1 : 2;
      };
      return prio(a.name) - prio(b.name);
    })
    .slice(0, 10);
  return { attrs: backupAttrs, rests: backupRests };
}

/** 每张日卡顶部的「{城市}备选」展开入口：默认收起，点开在卡片内原地展开。
 * 每个城市的每一天都挂同样的本城备选；展开态不跨天同步。 */
export function DayCityBackup({
  city,
  scheduledNames,
  bookedRestNames,
  favRestNames,
  dayOptions,
  open,
  onToggle,
}: {
  city: string;
  /** 该城市段所有天已排的站点名 */
  scheduledNames?: Set<string>;
  /** 该城市段已订餐厅名（小写归一化） */
  bookedRestNames?: Set<string>;
  /** 该城市段已收藏餐厅名（小写归一化） */
  favRestNames?: Set<string>;
  /** 本城可排入的天（只限本城，不许跨城） */
  dayOptions: { day: number; iso: string; label: string }[];
  open: boolean;
  onToggle: () => void;
}) {
  const { rows, save } = useRecordsData(["favorite"]);
  const [pick, setPick] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { attrs, rests } = useMemo(
    () => backupListsForCity(city, scheduledNames, bookedRestNames, favRestNames),
    [city, scheduledNames, bookedRestNames, favRestNames],
  );
  // 收藏记录按「类型+城市+归一化名」索引（同名可能有历史重复，全收进来一起改）
  const favByKey = useMemo(() => {
    const m = new Map<
      string,
      {
        id: number;
        day: number | null;
        done: boolean;
        body: Record<string, unknown>;
        assignDate?: string;
      }[]
    >();
    rows.forEach((r) => {
      let body: Record<string, unknown> = {};
      try {
        body = JSON.parse(r.body || "{}") as Record<string, unknown>;
      } catch {
        body = {};
      }
      const type = typeof body.type === "string" ? body.type : "attraction";
      const bodyCity = typeof body.city === "string" ? body.city : "";
      const key = `${type}|${bodyCity}|${r.title.trim().toLowerCase()}`;
      const list = m.get(key) ?? [];
      list.push({
        id: r.id,
        day: r.day,
        done: r.done,
        body,
        assignDate: typeof body.assignDate === "string" ? body.assignDate : undefined,
      });
      m.set(key, list);
    });
    return m;
  }, [rows]);
  const keyOf = (type: string, name: string) =>
    `${type}|${city}|${name.trim().toLowerCase()}`;
  const assignedDayOf = (type: string, name: string) => {
    const list = favByKey.get(keyOf(type, name)) ?? [];
    const withDate = list.find((f) => f.assignDate);
    return withDate ? dayOptions.find((d) => d.iso === withDate.assignDate) : undefined;
  };
  const doAssign = (type: string, name: string, iso: string) => {
    const list = favByKey.get(keyOf(type, name)) ?? [];
    if (list.length) {
      list.forEach((f) => {
        save.mutate({
          id: f.id,
          kind: "favorite",
          title: name,
          body: JSON.stringify({ ...f.body, city, type, assignDate: iso }),
          day: f.day,
          done: f.done,
        });
      });
    } else {
      // 没收藏过：先建一条 favorite 记录再写 assignDate（与 FavoriteItineraryCheck 同口径）
      save.mutate({
        kind: "favorite",
        title: name,
        body: JSON.stringify({ city, type, assignDate: iso }),
        day: null,
        done: false,
      });
    }
  };
  const doUnassign = (type: string, name: string) => {
    const list = favByKey.get(keyOf(type, name)) ?? [];
    list.forEach((f) => {
      if (!f.assignDate) return;
      const body = { ...f.body };
      delete body.assignDate;
      save.mutate({
        id: f.id,
        kind: "favorite",
        title: name,
        body: JSON.stringify(body),
        day: f.day,
        done: f.done,
      });
    });
  };
  // 每项的「放入行程」控件：下拉选本城某天 + 按钮；已排入则标 D×·日期并可取消
  const renderAssign = (type: "attraction" | "restaurant", name: string) => {
    const ad = assignedDayOf(type, name);
    const key = `${type}:${name}`;
    const chosen = pick[key] ?? dayOptions[0]?.iso ?? "";
    if (ad) {
      return (
        <span className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-violet-700 font-medium">
            已排入 D{ad.day} · {isoShort(ad.iso)}
          </span>
          <button
            type="button"
            onClick={() => doUnassign(type, name)}
            disabled={save.isPending}
            className="text-xs px-2.5 py-2 rounded-lg bg-white border border-violet-200 text-gray-500 min-h-[40px]"
          >
            取消排入
          </button>
        </span>
      );
    }
    if (!dayOptions.length) return null;
    return (
      <span className="flex items-center gap-2 flex-wrap">
        <select
          value={chosen}
          onChange={(e) => setPick((p) => ({ ...p, [key]: e.target.value }))}
          className="text-sm px-2 py-2 rounded-lg border border-violet-300 bg-white text-gray-700 min-h-[40px] max-w-[150px]"
          aria-label={`给${name}选择排入哪一天`}
        >
          {dayOptions.map((d) => (
            <option key={d.iso} value={d.iso}>
              D{d.day} · {isoShort(d.iso)}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!chosen || save.isPending}
          onClick={() => chosen && doAssign(type, name, chosen)}
          className="text-sm px-3 py-2 rounded-lg bg-violet-700 text-white font-medium disabled:opacity-50 min-h-[40px]"
        >
          放入行程
        </button>
      </span>
    );
  };
  // 单项紧凑行（2026-11-22 备选清单改版）：64px 小缩略图 + 名字 + 菜系/政策徽章 +
  // 总结文字（meta 全文直显，视觉上 clamp 两行）；不再用日卡主站同款大横幅。
  // 点整行在行程页内原地展开完整详情（不跳转）
  const renderItem = (kind: "attraction" | "restaurant", item: Item) => {
    const key = `${kind}:${item.name}`;
    const isOpen = !!expanded[key];
    const thumb = coverThumb(kind === "attraction" ? "景点" : "餐厅", item);
    const officialUrl = placeOfficialUrl(item);
    const cuisine = kind === "restaurant" ? restaurantCuisine(item) : null;
    const policyBadge =
      kind === "restaurant" ? bookingPolicyBadge(item.name) : null;
    const mg = kind === "restaurant" ? mustGoBadge(item.name) : null;
    return (
      <li key={item.name} className="py-2 border-b border-gray-100 last:border-0">
        <button
          type="button"
          onClick={() => setExpanded((e) => ({ ...e, [key]: !isOpen }))}
          aria-expanded={isOpen}
          className="w-full block text-left"
        >
          <span className="flex gap-3 items-start">
            {thumb ? (
              <img
                src={thumb}
                alt={item.name}
                loading="lazy"
                className="w-16 h-16 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span className="w-16 h-16 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                📍
              </span>
            )}
            <span className="flex-1 min-w-0">
              <span className="flex items-baseline gap-2 flex-wrap">
              <span className="font-semibold text-sm text-gray-900">{item.name}</span>
              {cuisine && (
                <span className="text-xs font-medium text-orange-800 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5 shrink-0">
                  🍽️ {cuisine}
                </span>
              )}
              {mg && (
                <span
                  title={mg.title}
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${mg.cls}`}
                >
                  ⭐{mg.text}
                </span>
              )}
              {policyBadge && (
                <span
                  title={policyBadge.title}
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${policyBadge.cls}`}
                >
                  {policyBadge.text}
                </span>
              )}
              {kind === "restaurant" &&
                favRestNames?.has(item.name.trim().toLowerCase()) && (
                  <span className="text-xs text-gray-400">⭐ 已收藏</span>
                )}
            </span>
            {/* 2026-11-22 用户纠正：收起行直接显示总结文字（meta 全文；没有 meta 时
                用 detail 首句），不截 64 字；点开才看完整详情 */}
            {(item.meta || item.detail) && (
              <span className="block text-sm text-gray-600 mt-0.5 leading-relaxed line-clamp-2">
                {item.meta || firstSentence(item.detail, 80)}
              </span>
            )}
            <span className="block text-xs text-teal-700 font-medium mt-1">
              {isOpen ? "收起 ▲" : "展开 ▾"}
            </span>
            </span>
          </span>
        </button>
        {/* 链接行：谷歌地图人人有；官网只认已核实的，没有标待核验 */}
        <div className="mt-1.5 flex items-center gap-3 flex-wrap text-xs">
          <a
            href={placeMapsUrl(item)}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-teal-700 underline"
          >
            🗺️ 谷歌地图 ↗
          </a>
          {officialUrl ? (
            <a
              href={officialUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-teal-700 underline"
            >
              🌐 官网 ↗
            </a>
          ) : (
            <span className="text-gray-400">🌐 官网待核验</span>
          )}
        </div>
        <div className="mt-1.5">{renderAssign(kind, item.name)}</div>
        {isOpen && (
          <div className="mt-3 rounded-xl border border-gray-200 bg-white px-3 py-3">
            <PlaceDetailSections kind={kind} item={item} compact />
          </div>
        )}
      </li>
    );
  };
  const total = attrs.length + rests.length;
  if (!total) return null;
  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full min-h-[44px] flex items-center justify-between gap-2 text-left bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5"
      >
        <span className="text-sm font-bold text-teal-800">
          📋 {city}备选（{total} 个）
        </span>
        <span className="text-xs font-medium text-teal-700 shrink-0">
          {open ? "收起 ▲" : "展开 ▾"}
        </span>
      </button>
      {open && (
        <div className="mt-3 rounded-xl border border-teal-100 bg-teal-50/40 px-4 py-3">
          <p className="text-xs text-gray-500 mb-3">
            本城没排进日程的景点与餐厅都在这里——每行直接显示一两句介绍，点一行就地展开全部详情，选一天就能直接放进那天的行程。
          </p>
          {/* 2026-11-22 备选分类改版：餐厅在前、景点在后；空组不显示标题 */}
          {rests.length > 0 && (
            <>
              <h4 className="text-sm font-bold mb-1">🍽️ 餐厅 · {rests.length} 家</h4>
              <ul className="mb-3">
                {rests.map((r) => renderItem("restaurant", r))}
              </ul>
            </>
          )}
          {attrs.length > 0 && (
            <>
              <h4 className="text-sm font-bold mb-1">📍 景点 · {attrs.length} 个</h4>
              <ul>{attrs.map((a) => renderItem("attraction", a))}</ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- 同一酒店多间房合并（2026-11-21 登录后真机审计） ----------------
 * 同一酒店两间房是两条预订记录（只差人数/确认号/价格），此前渲染成两张几乎
 * 完全相同的完整大卡，入住退房/FHR/取消文案逐字重复。按目录酒店名归一分组
 * （标题常带房型/人数后缀，先按目录名匹配，匹配不上再按归一化标题分），
 * 一张卡内分行列各间房。DayHotelSection 与「今日已定」共用。 */
export interface HotelGroup {
  /** 展示名（目录酒店名或首间房标题） */
  title: string;
  /** 地图点选用的名（首间房原始标题，与 dayRoute 的酒店钉一致） */
  selName: string;
  rooms: DayBooking[];
}

export function groupHotelBookings(bookings: DayBooking[], city: string): HotelGroup[] {
  const groups: HotelGroup[] = [];
  const byKey = new Map<string, HotelGroup>();
  bookings.forEach((b) => {
    const hit = hotels.find(
      (h) => h.city === city && (b.title.includes(h.name) || h.name.includes(b.title)),
    );
    const key = hit ? hit.name : b.title.trim().toLowerCase();
    let g = byKey.get(key);
    if (!g) {
      g = { title: hit ? hit.name : b.title, selName: b.title, rooms: [] };
      byKey.set(key, g);
      groups.push(g);
    }
    g.rooms.push(b);
  });
  return groups;
}

/* ---------------- 今晚住哪（2026-10-03 用户模型：每天显示当天的酒店，收藏的和已订的都要有） ---------------- */
export function DayHotelSection({
  city,
  stay,
  favHotels,
  hotelBookings,
  onSelect,
  selectedKey,
  hideBooked = false,
}: {
  city: string;
  stay: { checkIn: string; checkOut: string } | null;
  favHotels: ParsedFavorite[];
  hotelBookings: DayBooking[];
  /** 点选（2026-10-04）：只有已确认的酒店卡可点 */
  onSelect?: (kind: "hotel", name: string) => void;
  selectedKey?: string | null;
  /** 2026-11-21 日卡改版：true 时已订酒店只在「今日已定」出现，本区只留收藏候选
   * （无候选时整个区不渲染）；DayDetail 单日页不传，保持原样。 */
  hideBooked?: boolean;
}) {
  /* 住宿行优先用已订酒店记录自身的入住/退房日期（date/dateEnd）：
   * 城市级区间只作无记录时的兜底（末城退房=末日，见 cityStayRanges）。 */
  const bookedStayLines: string[] = [];
  hotelBookings.forEach((b) => {
    try {
      const bd = parseBookingBody(b.body);
      if (bd.date && bd.dateEnd) {
        const ci = toISODate(bd.date);
        const co = toISODate(bd.dateEnd);
        if (ci && co) {
          const n = Math.max(0, Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000));
          const line = `${isoShort(ci)} 入住 · ${isoShort(co)} 退房 · ${n} 晚`;
          if (!bookedStayLines.includes(line)) bookedStayLines.push(line);
        }
      }
    } catch {
      /* 坏记录忽略 */
    }
  });
  const nights = stay
    ? Math.max(0, Math.round((new Date(stay.checkOut).getTime() - new Date(stay.checkIn).getTime()) / 86400000))
    : 0;
  const stayLine = bookedStayLines.length ? (
    <p className="text-xs text-gray-500 mb-2">🛏️ {bookedStayLines.join("；")}</p>
  ) : stay ? (
    <p className="text-xs text-gray-500 mb-2">🛏️ {isoShort(stay.checkIn)} 入住 · {isoShort(stay.checkOut)} 退房 · {nights} 晚</p>
  ) : null;
  if (!favHotels.length && !hotelBookings.length) {
    return (
      <section className="mb-6 pt-6 border-t border-gray-100">
        <h4 className="text-lg font-bold mb-2 text-teal-800">🛏️ 今晚住哪</h4>
        <p className="text-sm text-gray-500">
          {city}的酒店还没收藏。
          <Link to="/bookings?menu=hotels" className="text-teal-700 underline font-medium">去预订页挑酒店 →</Link>
        </p>
        {stayLine}
      </section>
    );
  }
  /* 收藏名与预订标题常一长一短（收藏「Marina Bay Sands」vs 预订标题带中文后缀），
   * 精确相等会漏去重、同一家酒店既显示已确认又显示已收藏；改包含匹配。 */
  const bookedNames = hotelBookings.map((b) => b.title.trim().toLowerCase());
  const favDeduped = favHotels.filter((f) => {
    const fn = f.name.trim().toLowerCase();
    return !bookedNames.some((bn) => bn.includes(fn) || fn.includes(bn));
  });
  /* 当晚已有「已确认」的酒店预订时，其他收藏酒店一律不列（2026-10-22 用户明确：
   * 都订好了还列别家能住哪个没意义）。收藏只在还没订的那晚才作为候选出现。 */
  const onlyFav = hotelBookings.some((b) => b.done) ? [] : favDeduped;
  /* 2026-11-21 日卡改版：已订酒店只在「今日已定」出现一次，本区不重复；
   * 收藏候选也没有时整个区不渲染（住宿行已在「今日已定」里）。 */
  const hotelGroups = groupHotelBookings(hotelBookings, city);
  if (hideBooked && !onlyFav.length) return null;
  return (
    <section className="mb-6 pt-6 border-t border-gray-100">
      <h4 className="text-lg font-bold mb-3 text-teal-800">🛏️ 今晚住哪</h4>
      {!hideBooked && stayLine}
      <div className="space-y-2">
        {!hideBooked &&
          hotelGroups.map((g) => {
            const allDone = g.rooms.every((r) => r.done);
            const anyDone = g.rooms.some((r) => r.done);
            const clickable = anyDone && onSelect;
            const isSel = !!selectedKey && selectedKey === stickyItemKey("hotel", city, g.selName);
            /* 各房间共用的文案（入住/退房、取消政策、note）只出现一次：逐值去重，
             * 两间房写得不一样时两行都留，不丢信息。 */
            const sharedCheckLines = [
              ...new Set(
                g.rooms
                  .map((r) => {
                    const bd = parseBookingBody(r.body);
                    const a = bd.details?.["入住/退房"] ? `🕒 ${bd.details["入住/退房"]}` : "";
                    const c = bd.details?.["取消政策"] ? `取消：${bd.details["取消政策"]}` : "";
                    return [a, c].filter(Boolean).join(" · ");
                  })
                  .filter(Boolean),
              ),
            ];
            const sharedNotes = [
              ...new Set(
                g.rooms
                  .map((r) => {
                    try {
                      return parseBookingBody(r.body).note || "";
                    } catch {
                      return "";
                    }
                  })
                  .filter(Boolean),
              ),
            ];
            return (
              <div
                key={g.title}
                onClick={clickable ? (e) => {
                  if ((e.target as HTMLElement).closest("button, a, details, summary")) return;
                  onSelect!("hotel", g.selName);
                } : undefined}
                className={`bg-teal-50 border border-teal-200 rounded-lg p-3${clickable ? " cursor-pointer" : ""}${isSel ? " ring-2 ring-teal-600" : ""}`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{g.title}</span>
                  {g.rooms.length > 1 && (
                    <span className="text-xs font-bold text-teal-700 bg-teal-100 rounded-full px-2 py-0.5">
                      {g.rooms.length} 间房
                    </span>
                  )}
                  {allDone ? (
                    <span className="text-xs font-bold text-white bg-green-600 rounded-full px-2 py-0.5">已确认</span>
                  ) : anyDone ? (
                    <span className="text-xs font-bold text-white bg-amber-500 rounded-full px-2 py-0.5">部分已确认</span>
                  ) : (
                    <span className="text-xs text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">待预订</span>
                  )}
                </div>
                {g.rooms[0].stayNight != null && (
                  <p className="text-xs text-teal-700 mt-1">{g.rooms[0].stayNight === 0 ? "📅 今天入住" : `🌙 住宿第 ${g.rooms[0].stayNight + 1} 晚`}</p>
                )}
                {/* 每间房一行：只列不同的那三项（人数 / 确认号 / 价格） */}
                <div className="mt-2">
                  {g.rooms.map((r, ri) => {
                    const bd = parseBookingBody(r.body);
                    const price = bd.details?.["总价"] ?? bd.details?.["押金"];
                    const bits = [
                      bd.guests,
                      bd.code ? `确认号 ${bd.code}` : null,
                      price ? `💰 ${price}` : null,
                    ].filter(Boolean);
                    return (
                      <div key={ri} className="border-t border-teal-100 pt-2 mt-2 first:border-t-0 first:pt-0 first:mt-0">
                        <p className="text-xs font-semibold text-gray-700">
                          {g.rooms.length > 1 ? `房间 ${ri + 1} · ` : ""}
                          {bits.length ? bits.join(" · ") : bookingSummary(bd)}
                        </p>
                        <BookingDetailsExpand
                          bd={bd}
                          summaryLabel={g.rooms.length > 1 ? `📋 房间 ${ri + 1} 预订详情 ▾` : undefined}
                        />
                      </div>
                    );
                  })}
                </div>
                {sharedCheckLines.map((line, i) => (
                  <p key={i} className="text-xs text-gray-600 mt-1">{line}</p>
                ))}
                {sharedNotes.map((n, i) => (
                  <p key={i} className="text-xs text-gray-500 mt-1">{n}</p>
                ))}
              </div>
            );
          })}
        {onlyFav.map((f) => (
          <div key={f.name} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">{f.name}</span>
              <span className="text-xs text-gray-400">⭐ 已收藏</span>
              <Link to="/bookings?menu=hotels" className="text-xs text-teal-700 underline">去预订 →</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- 本日预订（Home 列表页与 DayDetail 单日页共用） ---------------- */
export function DayBookingsSection({
  bookings,
  excludeRestaurant = false,
}: {
  bookings: DayBooking[];
  /** 行程日卡里餐厅预订已移到「餐饮安排」置顶展示，本区不再重复（2026-10-22 用户要求） */
  excludeRestaurant?: boolean;
}) {
  /* 酒店不在「本日预订」里出现（2026-10-22 用户指出与「今晚住哪」重复）：
   * 酒店只在「今晚住哪」出现一次；本区只放当天的机票/交通、餐厅、活动类预订。 */
  const visible = bookings.filter((b) => {
    try {
      const k = parseBookingBody(b.body).bkind;
      if (k === "hotel") return false;
      if (excludeRestaurant && k === "restaurant") return false;
      return true;
    } catch {
      return true;
    }
  });
  if (!visible.length) return null;
  return (
    <section className="mb-6 pt-6 border-t border-gray-100">
      <h4 className="text-lg font-bold mb-3 text-green-700">
        ✅ 本日预订
      </h4>
      <div className="space-y-2">
        {visible.map((b, i) => {
          const bd = parseBookingBody(b.body);
          const summary = bookingSummary(bd);
          return (
            <div
              key={i}
              className="bg-green-50 border border-green-200 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-bold text-white bg-green-700 rounded-full px-2 py-0.5">
                  {BOOKING_KIND_LABEL[bd.bkind] || "预订"}
                </span>
                <p className="font-semibold text-sm">{b.title}</p>
                {b.done && (
                  <span className="text-xs font-bold text-white bg-green-600 rounded-full px-2 py-0.5">
                    已确认
                  </span>
                )}
                {!b.done && (
                  <span className="text-xs font-bold text-white bg-amber-500 rounded-full px-2 py-0.5">
                    待订
                  </span>
                )}
              </div>
              {summary && (
                <p className="text-xs text-gray-700">{summary}</p>
              )}
              {bd.note && (
                <p className="text-xs text-gray-500 mt-1">{bd.note}</p>
              )}
              <BookingDetailsExpand bd={bd} />
            </div>
          );
        })}
      </div>
      <Link
        to="/bookings"
        className="inline-block mt-2 text-sm font-medium text-green-700 underline"
      >
        去我的预订管理 →
      </Link>
    </section>
  );
}

/* ---------------- 今日已定（2026-11-21 二次改版：旅途中清单式日卡） ----------------
 * 一张单一扁平列表，按时间排序，包含当天全部已订项：航班（航班号、起降
 * 时间、确认号）、酒店、餐厅，一行一条，不分子标题、不分区域。点一行在
 * 原地展开看确认号、价格、取消政策。
 * 航班行优先用当天交通预订记录（出票事实）；已出票但没有交通记录的腿
 * 用 FLIGHT_LEGS 行兜底；未出票的当天转场航段只占一行未订推荐
 * （推荐航班按库里 recommend 项，不展开航班列表、不跳预订页）。
 * 同一酒店多间房只出现一次；三类全无则整个 section 不渲染。 */
function TodayBookedRow({
  icon,
  label,
  badge,
  children,
}: {
  icon: string;
  label: string;
  badge: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <details className="bg-teal-50/60 border border-teal-200 rounded-lg px-3 py-2">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center gap-2 flex-wrap">
        <span className="text-sm">{icon}</span>
        <span className="text-sm font-semibold flex-1">{label}</span>
        {badge}
        <span className="text-xs text-gray-400 shrink-0">详情 ▾</span>
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}

export function TodayBookedSection({
  hotelGroups,
  flightLeg,
  transportBookings,
  unbookedLeg,
  bookedRests,
}: {
  hotelGroups: HotelGroup[];
  /** 已出票但无交通预订记录时的兜底航段行 */
  flightLeg?: FlightLegInfo | null;
  /** 当天已出票的交通预订记录（机票/车票） */
  transportBookings: DayBooking[];
  /** 当天转场航段未出票时：只占一行未订推荐 */
  unbookedLeg?: FlightLegInfo | null;
  bookedRests: DayBooking[];
}) {
  const doneBadge = (done: boolean) =>
    done ? (
      <span className="text-xs font-bold text-white bg-green-600 rounded-full px-2 py-0.5">已确认</span>
    ) : (
      <span className="text-xs text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">待预订</span>
    );
  /* 已出票航段是否已有交通记录覆盖（有则只渲染记录行，不重复渲染腿行）——航司代码可能含数字（如 9C） */
  const legFlightNo = flightLeg?.note?.match(/[A-Z0-9]{2}\d{2,4}/)?.[0];
  const legCovered =
    !!legFlightNo &&
    transportBookings.some((b) => b.title.includes(legFlightNo) || b.body.includes(legFlightNo));
  /* 推荐航班：库里 recommend 项优先，否则取当日直飞最低价 */
  const recommendOpt = (leg: FlightLegInfo) => {
    const opts = (leg.options ?? []).filter((o) => o.price != null);
    return (
      opts.find((o) => o.recommend) ??
      opts.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))[0]
    );
  };
  type BookedRow = { key: string; sort: string; node: React.ReactNode };
  const rows: BookedRow[] = [];
  /* 航班行：当天交通预订记录（出票事实），按出发时间排 */
  transportBookings.forEach((b) => {
    const bd = parseBookingBody(b.body);
    const flightNo =
      (typeof bd.extra === "string" && bd.extra) || b.title.match(/[A-Z0-9]{2}\d{2,4}/)?.[0] || "";
    const route = flightNo ? b.title.replace(flightNo, "").trim() : b.title;
    const when = [bd.time, bd.timeEnd].filter(Boolean).join("–");
    const label = [flightNo, route, when, bd.guests, bd.code ? `确认号 ${bd.code}` : null]
      .filter(Boolean)
      .join(" · ");
    rows.push({
      key: `transport-${b.title}`,
      sort: bd.time || "99:99",
      node: (
        <TodayBookedRow icon="✈️" label={label} badge={doneBadge(b.done)}>
          {bd.note && <p className="text-xs text-gray-500">{bd.note}</p>}
          <BookingDetailsExpand bd={bd} bare />
        </TodayBookedRow>
      ),
    });
  });
  /* 航班行：已出票腿兜底（无交通记录时才渲染） */
  if (flightLeg && !legCovered) {
    const schedStart = flightLeg.schedule?.match(/\d{1,2}:\d{2}/)?.[0] ?? "99:99";
    rows.push({
      key: `leg-${flightLeg.route}`,
      sort: schedStart,
      node: (
        <TodayBookedRow
          icon="✈️"
          label={`${flightLeg.route}${flightLeg.carrier ? ` · ${flightLeg.carrier}` : ""}${flightLeg.schedule ? ` ${flightLeg.schedule}` : ""}`}
          badge={doneBadge(true)}
        >
          {flightLeg.note && <p className="text-xs text-gray-700">{flightLeg.note}</p>}
        </TodayBookedRow>
      ),
    });
  }
  /* 航班行：未出票转场航段只占一行（推荐航班按库里 recommend 项） */
  if (unbookedLeg) {
    const opt = recommendOpt(unbookedLeg);
    const label = opt
      ? `${unbookedLeg.route} 未订，推荐 ${opt.flight} ${opt.depart}→${opt.arrive} $${opt.price} · ${carrierBaggageLabel(opt.flight)}`
      : `${unbookedLeg.route} 未订`;
    rows.push({
      key: `unbooked-${unbookedLeg.route}`,
      sort: opt?.depart ?? "99:99",
      node: (
        <TodayBookedRow
          icon="✈️"
          label={label}
          badge={
            <span className="text-xs font-bold text-white bg-amber-500 rounded-full px-2 py-0.5">未订</span>
          }
        >
          {unbookedLeg.note && <p className="text-xs text-gray-700">{unbookedLeg.note}</p>}
          {opt?.recommendReason && <p className="text-xs text-gray-500 mt-1">{opt.recommendReason}</p>}
        </TodayBookedRow>
      ),
    });
  }
  /* 酒店行：同一酒店多间房只出现一次；入住日按 15:00 排，续住排在最前 */
  hotelGroups.forEach((g) => {
          const first = g.rooms[0];
          const bd = parseBookingBody(first.body);
          const allDone = g.rooms.every((r) => r.done);
          const anyDone = g.rooms.some((r) => r.done);
          let stayRange = "";
          if (bd.date && bd.dateEnd) {
            const ci = toISODate(bd.date);
            const co = toISODate(bd.dateEnd);
            if (ci && co) {
              const n = Math.max(0, Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000));
              stayRange = `${isoShort(ci)} 入住 → ${isoShort(co)} 退房 · ${n} 晚`;
            }
          }
          const nightLabel =
            first.stayNight === 0
              ? "今天入住"
              : first.stayNight != null
                ? `住宿第 ${first.stayNight + 1} 晚`
                : "";
          const label = [g.title, stayRange, g.rooms.length > 1 ? `${g.rooms.length} 间房` : "", nightLabel]
            .filter(Boolean)
            .join(" · ");
          rows.push({
            key: `hotel-${g.title}`,
            sort: first.stayNight === 0 ? "15:00" : "00:00",
            node: (
            <TodayBookedRow
              key={g.title}
              icon="🛏️"
              label={label}
              badge={
                allDone ? (
                  doneBadge(true)
                ) : anyDone ? (
                  <span className="text-xs font-bold text-white bg-amber-500 rounded-full px-2 py-0.5">部分已确认</span>
                ) : (
                  doneBadge(false)
                )
              }
            >
              {g.rooms.map((r, ri) => {
                const rbd = parseBookingBody(r.body);
                const price = rbd.details?.["总价"] ?? rbd.details?.["押金"];
                const bits = [
                  rbd.guests,
                  rbd.code ? `确认号 ${rbd.code}` : null,
                  price ? `💰 ${price}` : null,
                ].filter(Boolean);
                return (
                  <div key={ri} className="border-t border-teal-100 pt-2 mt-2 first:border-t-0 first:pt-0 first:mt-0">
                    {g.rooms.length > 1 && <p className="text-xs font-semibold text-gray-500">房间 {ri + 1}</p>}
                    {bits.length > 0 && <p className="text-xs font-semibold text-gray-700">{bits.join(" · ")}</p>}
                    <BookingDetailsExpand bd={rbd} bare />
                  </div>
                );
              })}
              {bd.note && <p className="text-xs text-gray-500 mt-1">{bd.note}</p>}
            </TodayBookedRow>
            ),
          });
        });
  /* 餐厅行：按订位时间排 */
  bookedRests.forEach((b) => {
    const bd = parseBookingBody(b.body);
    const label = [b.title, bd.time, bd.guests].filter(Boolean).join(" · ");
    rows.push({
      key: `rest-${b.title}`,
      sort: bd.time || "99:99",
      node: (
        <TodayBookedRow key={b.title} icon="🍽️" label={label} badge={doneBadge(b.done)}>
          {bd.note && <p className="text-xs text-gray-500">{bd.note}</p>}
          <BookingDetailsExpand bd={bd} bare />
        </TodayBookedRow>
      ),
    });
  });
  const sortedRows = [...rows].sort((a, b) => a.sort.localeCompare(b.sort));
  if (!sortedRows.length) return null;
  return (
    <section className="mb-6">
      <h4 className="text-lg font-bold mb-3 text-teal-800">✅ 今日已定</h4>
      <div className="space-y-2">
        {sortedRows.map((r) => (
          <div key={r.key}>{r.node}</div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">点一行展开看确认号、价格与取消政策。</p>
    </section>
  );
}

/* 封面缩略图（2026-11-22 用户要求：展开详情之前每个行程也要显示封面图片）：
 * 先取 placeMedia index，没有再回退到该条目 gallery 的首张图——回退复用的只是
 * 展开详情里已经在展示的同一批图，不新加图、不去网上找图；还没有才返回 undefined
 * （调用方留占位）。 */
function coverThumb(kind: "景点" | "餐厅" | "酒店", item: Item): string | undefined {
  return getPlaceImage(kind, item) || getPlaceGallery(kind, item)[0]?.src;
}

/* 同 coverThumb 的取图口径，但取到 3 张为止（2026-11-22 桌面端横幅 3 张并排）：
 * 首张 = placeMedia index，没有则 gallery 首张——与 coverThumb 返回值完全一致；
 * 其余只从同一条目、同一 kind 的 gallery 里补，不换条目、不拿别家图顶。 */
function coverThumbs(kind: "景点" | "餐厅" | "酒店", item: Item): string[] {
  const out: string[] = [];
  const first = getPlaceImage(kind, item);
  if (first) out.push(first);
  for (const g of getPlaceGallery(kind, item)) {
    if (out.length >= 3) break;
    if (!out.includes(g.src)) out.push(g.src);
  }
  return out;
}

/* 横幅图条（2026-11-22 桌面端优化：单张图在 ~1000px 宽的日卡上被拉得太长）：
 * 手机（<sm）只显示首张通栏横幅，与旧版一致；sm 及以上 3 张并排（flex-1），
 * 每张约 1/3 宽，裁切比接近 3:2，不再拉长。gallery 不足 3 张有多少放多少，
 * 其余图 hidden 不展示；无图返回 null。 */
function BannerStrip({ thumbs, alt }: { thumbs: string[]; alt: string }) {
  if (!thumbs.length) return null;
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {thumbs.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={alt}
          loading="lazy"
          className={
            i === 0
              ? "w-full h-44 sm:h-56 sm:flex-1 object-cover rounded-xl"
              : "hidden sm:block sm:flex-1 sm:h-56 object-cover rounded-xl"
          }
        />
      ))}
    </div>
  );
}

/* 航班站机场图回退（2026-11-22 Day 6 封面图；2026-11-22 机场图补齐 PEK/XIY/ICN 后扩口径）：
 * 1) 站名含航班号：按 FLIGHT_LEGS 的 schedule 找航线，先出发城市、再到达城市兜底
 *    （11-28 SEA→PEK 出发无图，靠到达北京兜底；MU2070 SIN→XIY 出发为新加坡，仍配 Jewel 不动）；
 * 2) 站名无航班号：按站名里的机场/城市关键词取图（「抵达咸阳机场 T5」「西安飞首尔」；
 *    「北京」「首尔」兜底无航班号的飞往/抵达站，如 11-28 SEA→PEK 无论站名带不带 HU496 都能配上 PEK 图）——
 *    这两站走不了别名：12-30 是首尔日，西安咸阳条目 city 为西安，matchItem 同城校验拦住；
 *    故这里直接按条目本身查，不经过 day city。
 * 城市→机场映射：北京→北京首都国际机场、西安→西安咸阳国际机场、首尔→仁川国际机场、
 * 新加坡→Jewel 星耀樟宜（现有行为）。普吉/清迈/曼谷站内无机场图，留占位、不拿错机场顶。
 * 航班号正则用 [A-Z0-9]{2} 口径（9C 含数字，纯字母正则会漏，2026-11-21 绿标教训）。 */
const CITY_AIRPORT: [string, string][] = [
  ["北京", "北京首都国际机场"],
  ["西安", "西安咸阳国际机场"],
  ["首尔", "仁川国际机场"],
];
function airportItem(city: string): Item | undefined {
  const hit = CITY_AIRPORT.find(([c]) => c === city);
  if (!hit) return undefined;
  return attractions.find((it) => it.city === city && it.name === hit[1]);
}
function airportItemForStop(stopName: string): Item | undefined {
  const m = stopName.match(/([A-Z0-9]{2}\d{1,4})/);
  const leg = m ? FLIGHT_LEGS.find((l) => l.schedule?.includes(m[1])) : undefined;
  const from = leg ? leg.route.split("→")[0].trim() : "";
  const to = leg ? leg.route.split("→")[1]?.trim() : "";
  if (from === "新加坡" || stopName.includes("樟宜")) {
    return attractions.find((it) => it.city === "新加坡" && it.name === "Jewel 星耀樟宜");
  }
  for (const city of [from, to]) {
    if (!city) continue;
    const item = airportItem(city);
    if (item && coverThumb("景点", item)) return item;
  }
  for (const [kw, city] of [["咸阳", "西安"], ["西安", "西安"], ["仁川", "首尔"], ["北京", "北京"], ["首尔", "首尔"]] as [string, string][]) {
    if (stopName.includes(kw)) {
      const item = airportItem(city);
      if (item && coverThumb("景点", item)) return item;
    }
  }
  return undefined;
}
function airportThumbs(stopName: string): string[] {
  const item = airportItemForStop(stopName);
  return item ? coverThumbs("景点", item) : [];
}

/* ---------------- 时间线上的已订餐厅站（2026-10-23：订了的餐厅要在行程时间线里） ----------------
 * 2026-11-21 二次改版：瘦身为时间标记——只留时间徽章＋站名＋已确认徽章＋
 * 摘要行（确认号/时间/人数）；完整明细只在上方「今日已定」出现一次，
 * 这里不再重复 note 与 BookingDetailsExpand，不跳详情页。 */
function BookedRestBlock({
  entry,
  city,
  onSelect,
  selected,
}: {
  entry: { b: DayBooking; bd: BookingData; item?: Item };
  city: string;
  /** 点选（2026-11-07 用户：已订餐厅卡点一下，顶栏地图飞过去） */
  onSelect?: () => void;
  selected?: boolean;
}) {
  const { b, bd } = entry;
  const summary = bookingSummary(bd);
  // 2026-11-22 追加 3：已订餐厅块也能点开看完整详情（与时间线 stop 同一套行内展开）
  const [open, setOpen] = useState(false);
  const hasMore = !!entry.item;
  // 2026-11-22 用户要求：已订餐厅块收起态也显示封面图片（顶部通栏大图，
  // coverThumb：先 placeMedia index，没有回退到该条目 gallery 首张图；
  // 没有匹配条目就不放图、不占位，不编图）。
  // 2026-11-22 桌面端优化：同一条目取 3 张，手机单张、sm 及以上 3 张并排。
  const thumbs = entry.item ? coverThumbs("餐厅", entry.item) : [];
  return (
    <div
      onClick={onSelect ? (e) => {
        if ((e.target as HTMLElement).closest("button, a, details, summary")) return;
        if (hasMore) setOpen(true);
        onSelect();
      } : undefined}
      className={`border-l-2 border-green-600 pl-4 py-3 bg-green-50/70 rounded-lg${onSelect ? " cursor-pointer" : ""}${selected ? " ring-2 ring-green-600" : ""}`}
    >
      <BannerStrip thumbs={thumbs} alt={b.title} />
      <div className="mt-2">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="text-xs font-bold text-white bg-green-700 rounded-full px-2 py-0.5">
          {bd.time || "晚上"}
        </span>
        <h5 className="font-semibold text-base">🍽️ {b.title}</h5>
        {/* 2026-11-22 用户纠正：餐厅行收起态直接亮菜系 */}
        {entry.item && (
          <span className="text-xs font-medium text-orange-800 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5 shrink-0">
            🍽️ {restaurantCuisine(entry.item)}
          </span>
        )}
        {b.done ? (
          <span className="text-xs font-bold text-white bg-green-600 rounded-full px-2 py-0.5">
            已确认 · 已订
          </span>
        ) : (
          <span className="text-xs text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
            待预订
          </span>
        )}
      </div>
      {summary && <p className="text-sm text-gray-700">{summary}</p>}
      {hasMore && entry.item && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            className="text-xs font-medium text-teal-700 mt-1"
          >
            {open ? "收起 ▲" : "展开详情 ▾"}
          </button>
          {open && (
            <div className="mt-2 rounded-xl border border-gray-200 bg-white px-3 py-3">
              <PlaceDetailSections kind="restaurant" item={entry.item} compact />
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}

/* ---------------- 时间线上的单个站点 ----------------
 * 收起态直接显示旧版那套格式化总结（2026-11-22 用户纠正：点击详情里的
 * 总结信息直接显示在页面上）：oneLiner（首句 ≤30 字）+ practical 各行
 * （地址/开放时间/门票/待多久/干什么/避什么坑），一行一条、label 加粗；
 * 「详情」按钮只在匹配到目录条目时出现，点开是该条目的完整内容
 * （PlaceDetailSections：图片、介绍全文、菜系、谷歌地图与官网链接全有），不跳转；
 * 匹配不到目录条目的站（入住酒店/飞往××等非地点项）只显示自带 detail 文案，
 * 不放详情按钮（没新东西就不放展开按钮）。点行同时仍选地图（原行为不变）。 */
function StopBlock({
  stop,
  city,
  onSelect,
  selected,
  booked,
}: {
  stop: Stop;
  city: string;
  onSelect?: () => void;
  selected?: boolean;
  /** 该站是已订餐厅时：展开里带确认信息（确认号/时间/人数） */
  booked?: BookingData;
}) {
  const [open, setOpen] = useState(false);
  const mA = matchItem(stop.name, city, attractions);
  const mR = !mA ? matchItem(stop.name, city, restaurants) : undefined;
  // 酒店时间站也参与匹配（2026-11-22 Day 6 封面图）：站名含酒店名时按 kind '酒店' 取图；
  // 某家酒店确实没图时留占位，不拿别家酒店的图顶。
  const mH = !mA && !mR ? matchItem(stop.name, city, hotels) : undefined;
  const item = mA || mR || mH;
  const kindZh = mA ? "景点" : mR ? "餐厅" : mH ? "酒店" : null;
  const oneLiner = firstSentence(stop.detail, 30);
  const guide = item && kindZh === "景点" ? attractionGuides[city]?.[item.name] : undefined;
  const duration = guide?.visit.duration;
  /* 实用信息行（旧版 259ea932 原样拿回）：只取已核验的具体值，通用模板句
   * （未录入/地图入口/预留 1–2 小时）一律不显示——展开必须是折叠态没有的新信息。
   * 2026-11-22 用户纠正：practical 各行不再藏进「展开详情」里，直接显示在收起态。 */
  const practical: { label: string; text: string; addr?: { text: string; url: string } }[] = [];
  if (item && kindZh) {
    const facts = getGuideFacts(item, kindZh);
    if (facts.address && !facts.address.includes("地图入口已带入地点全名")) {
      const transit =
        facts.transit && facts.transit !== "使用详情页地图入口规划最后一段交通"
          ? ` · ${facts.transit}`
          : "";
      // 地址文字本身就是谷歌地图链接（2026-11-22 用户要求）：点地址直达谷歌地图
      practical.push({
        label: "📍 地址/怎么去",
        text: transit,
        addr: { text: facts.address, url: mapsUrlForAddress(facts.address) },
      });
    }
    if (facts.hours && !facts.hours.startsWith("当前资料未录入")) {
      practical.push({ label: "🕒 开放时间", text: facts.hours });
    }
    if (facts.price && !facts.price.startsWith("当前资料未录入")) {
      practical.push({ label: "🎫 门票价格", text: facts.price });
    }
    if (duration) practical.push({ label: "⏱ 待多久", text: duration });
    const dos = guide ? guide.highlights.slice(0, 3).map((h) => h.name).filter(Boolean) : [];
    if (dos.length) practical.push({ label: "✅ 干什么", text: dos.join("；") });
    else if (
      facts.action &&
      facts.action !== "把这一站放在同片区动线中；有预约或天气限制时先确认再出发"
    ) {
      practical.push({ label: "✅ 怎么做", text: facts.action });
    }
    const pitfall = xhsAssessments[item.name]?.avoidNote;
    if (pitfall) practical.push({ label: "⚠️ 避什么坑", text: pitfall });
  }
  /* 首句之外的正文余量：有实用信息行时不重复贴正文；没有 practical 时余量
   * 贴在收起态补行（旧版放展开里，新版展开是 PlaceDetailSections，不再贴正文）。 */
  const firstFull = firstSentence(stop.detail);
  const restDetail = stop.detail
    .trim()
    .slice(firstFull.replace(/…$/, "").length)
    .trim();
  // 「详情」按钮只在匹配到目录条目时出现；匹配不到的站不放详情按钮。
  const hasMore = !!item;
  // 2026-11-22 用户要求：每个 stop 在展开详情之前也要显示封面图片（顶部通栏大图，
  // coverThumb：先 placeMedia index，没有回退到该条目 gallery 首张图；没有就不放图，
  // 不编图、不占位）。
  // 匹配不到目录条目的站没有可查的条目，不放图（📍 中性占位已随 2026-11-22 通栏改版取消）。
  // 回退链（2026-11-22 Day 6 封面图）：① 匹配到的条目本身；② 本条目无图、站名同时
  // 对上酒店时用酒店图顶上（如 137 Pillars 烹饪课站：景点条目无图，酒店有图）；
  // ③ 航班站走机场图回退（airportThumbs：只有樟宜有现成机场图）。
  // 横幅图条（2026-11-22 桌面端优化）：首张与旧 coverThumb 口径完全一致，
  // 其余两张只从同一条目/同一 kind 的 gallery 里补；回退链（酒店跨 kind、
  // 酒店条目顶上、机场图）只在前一环完全无图时才走，不混别家图。
  let thumbs: string[] = [];
  if (item && kindZh) thumbs = coverThumbs(kindZh, item);
  if (!thumbs.length && item && kindZh) {
    // 同条目跨 kind 查图（2026-11-22 用户纠正：首尔 JW 万豪是 SA() 景点条目、图登在
    // 「酒店」kind 下；只按本条目名查，不换条目、不拿别家图顶）。
    for (const k of ["酒店", "景点", "餐厅"] as const) {
      thumbs = coverThumbs(k, item);
      if (thumbs.length) break;
    }
  }
  if (!thumbs.length && (mA || mR)) {
    const hotelFallback = matchItem(stop.name, city, hotels);
    if (hotelFallback) thumbs = coverThumbs("酒店", hotelFallback);
  }
  if (!thumbs.length) thumbs = airportThumbs(stop.name);
  return (
    <div
      onClick={onSelect ? (e) => {
        if ((e.target as HTMLElement).closest("button, a")) return;
        // 点行本身：地图选点的同时就地展开详情（2026-11-22 追加 3）
        if (hasMore) setOpen(true);
        onSelect();
      } : undefined}
      className={`border-l-2 border-teal-600/30 pl-4 py-3${onSelect ? " cursor-pointer rounded-lg" : ""}${selected ? " ring-2 ring-teal-600 bg-teal-50/50" : ""}`}
    >
      <BannerStrip thumbs={thumbs} alt={stop.name} />
      <div className="mt-2">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="text-xs font-bold text-teal-700 bg-teal-50 rounded-full px-2 py-0.5">
          {stop.time}
        </span>
        <h5 className="font-semibold text-base">{stop.name}</h5>
        {booked && (
          <span className="text-xs font-bold text-white bg-green-600 rounded-full px-2 py-0.5">
            已订
          </span>
        )}
        {item && kindZh === "餐厅" && (() => {
          const b = bookingPolicyBadge(item.name);
          return (
            <span
              title={b.title}
              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${b.cls}`}
            >
              {b.text}
            </span>
          );
        })()}
        {duration && (
          <span className="text-xs text-gray-500">⏱ {duration}</span>
        )}
      </div>
      {/* 收起态：oneLiner + practical 各行直接显示，一行一条、label 加粗
          （2026-11-22 用户纠正：点击详情里的总结信息直接显示在页面上）；
          匹配不到目录条目的站只显示自带 detail 文案 */}
      {item ? (
        <>
          <p className="text-sm text-gray-600 leading-relaxed">{oneLiner}</p>
          {practical.map((row, i) => (
            <p key={i} className="text-sm text-gray-600 leading-relaxed">
              <span className="font-bold">{row.label}：</span>
              {row.addr ? (
                <a
                  href={row.addr.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-700 underline"
                >
                  {row.addr.text}
                </a>
              ) : null}
              {row.text}
            </p>
          ))}
          {!practical.length && restDetail ? (
            <p className="text-sm text-gray-600 leading-relaxed">{restDetail}</p>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-gray-600 leading-relaxed">{stop.detail}</p>
      )}
      {hasMore && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            className="text-xs font-medium text-teal-700 mt-1"
          >
            {open ? "收起 ▲" : "展开详情 ▾"}
          </button>
          {open && (
            <div className="mt-2 rounded-xl border border-teal-100 bg-white px-3 py-3">
              {booked && (
                <p className="text-xs text-gray-700 leading-relaxed mb-2">
                  <span className="font-bold">✅ 已订：</span>
                  {bookingSummary(booked)}
                </p>
              )}
              {item && kindZh && (
                // 匹配到目录条目：与备选清单同一套行内展开渲染（完整详情）
                <PlaceDetailSections
                  kind={mA ? "attraction" : mR ? "restaurant" : "hotel"}
                  item={item}
                  compact
                />
              )}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}

/* ---------------- 主组件：一天的完整卡片 ---------------- */
export interface DayBooking {
  day: number | null;
  title: string;
  body: string;
  done: boolean;
  /** 酒店住宿第几晚（0=入住日）；非酒店记录为 0 */
  stayNight?: number;
}

/**
 * 行程卡片点选（2026-10-04 用户：点哪天的景点/餐厅/酒店，顶栏固定地图就显示那一天的路线，
 * 被点的跳动高亮，其他正常显示；酒店只收当天已确认的那家）
 */
export interface DayStopSelection {
  day: number;
  /** 具体被点的站点；null = 只切到这一天看全景，不高亮单点（2026-11-07：点日期按钮/卡片头部） */
  kind: "attraction" | "restaurant" | "hotel" | null;
  name: string | null;
  city: string;
  /** 当天的地图数据（站点按游览顺序，含坐标） */
  route: DayRoute;
}

export function ItineraryDayCard({
  day,
  prevDay,
  detail,
  bookings,
  isCloud,
  favorites,
  assignedAttractions,
  assignedRestaurants,
  scheduledNames,
  cityBookedRestNames,
  favRestNames,
  dayOptions,
  stay,
  onSelectStop,
  selectedKey,
  registerDayRoute,
}: {
  day: PlanDay;
  prevDay: PlanDay | undefined;
  detail: Day | undefined;
  bookings: DayBooking[];
  /** 云端行程：编号与静态对不上，转场/地图一律按当天实际城市计算 */
  isCloud?: boolean;
  /** 用户收藏（酒店/餐厅/航班）：每天卡片里展示当天城市的收藏 */
  favorites?: ParsedFavorite[];
  /** 我排入这一天的必去景点名（收藏景点在行程页指定了 assignDate=当天） */
  assignedAttractions?: string[];
  /** 我排入这一天的餐厅名（收藏餐厅在行程页指定了 assignDate=当天） */
  assignedRestaurants?: string[];
  /** 该城市段所有天已排的站点名（本城备选清单过滤用） */
  scheduledNames?: Set<string>;
  /** 该城市段已订餐厅名（小写归一化，本城备选清单过滤用；与卡片内当天已订数组重名故加 city 前缀） */
  cityBookedRestNames?: Set<string>;
  /** 该城市段已收藏餐厅名（小写归一化，本城备选清单排序用） */
  favRestNames?: Set<string>;
  /** 本城可排入的天（只限本城；本城备选清单的排入目标） */
  dayOptions?: { day: number; iso: string; city_zh: string; label: string }[];
  /** 本城住宿区间（入住/退房），"今晚住哪"用 */
  stay?: { checkIn: string; checkOut: string } | null;
  /** 点选（2026-10-04 用户）：点卡片 → 顶栏固定地图显示这一天，被点的跳动 */
  onSelectStop?: (sel: DayStopSelection | null) => void;
  /** 当前被选中的卡片 key（stickyItemKey），用于卡片描边 */
  selectedKey?: string | null;
  /** 把当天的地图路线登记给父级，供日期导航按钮点按时切地图 */
  registerDayRoute?: (day: number, route: DayRoute) => void;
}) {
  useDetailReturn("itinerary-day");
  // 本城备选展开态（每张卡各自持有，不跨天同步）
  const [backupOpen, setBackupOpen] = useState(false);
  const cityId = CITY_ID_BY_ZH[day.city_zh] || day.city_id;
  // 首尔首日的进城转场出发地（2026-10-13 修复）：云端 schedule 里没有分开行动
  // （北京/西安）的日子，prevDay 会是 12-19 曼谷，但全家实际从西安飞首尔
  // （XIY→ICN，前一天高铁在西安汇合）——转场城市按西安算，不许显示曼谷飞首尔。
  const transferPrevZh =
    isCloud && day.city_zh === "首尔" && prevDay && prevDay.city_zh !== "首尔"
      ? "西安"
      : prevDay?.city_zh;
  const stops = detail?.stops || [];

  // 云端天地图站点：按当天时间线站点名全局查核实坐标（编号对应当天时间线）；
  // 查不到坐标的站点跳过，全部查不到时 DayMap 回退到城市级标记。
  // 与 DayDetail 共用 cloudStopsForTimeline，保证两处地图一致。
  const cloudStops: StopCoord[] | undefined = isCloud
    ? cloudStopsForTimeline(stops)
    : undefined;

  const morning = stops.filter((s) => periodOf(s.time) === "上午");
  const afternoon = stops.filter((s) => periodOf(s.time) === "下午");
  const evening = stops.filter((s) => periodOf(s.time) === "晚上");

  // 本城餐厅：有空位数据的优先
  const cityRests = restaurants.filter((r) => r.city === day.city_zh);
  const restPicks = [...cityRests]
    .sort((a, b) => {
      const prio = (n: string) => {
        const p = getRestaurantBookingPolicy(n)?.policy;
        return p === "must_book" ? 0 : p === "peak_recommended" ? 1 : 2;
      };
      return prio(a.name) - prio(b.name);
    })
    .slice(0, 4);

  /* 2026-10-03 用户模型：每天卡片展示当天城市的收藏（酒店/餐厅）与转场航班收藏 */
  const favs = favorites ?? [];
  const favHotels = favs.filter((f) => f.type === "hotel" && f.city === day.city_zh);
  const favRests = favs.filter((f) => f.type === "restaurant" && f.city === day.city_zh);
  const transferRoute =
    prevDay && prevDay.city_zh !== day.city_zh
      ? `${transferPrevZh} → ${day.city_zh}`
      : null;
  const transferDate = toISODate(day.date) ?? "";
  const hotelBookings = bookings.filter((b) => {
    try {
      return parseBookingBody(b.body).bkind === "hotel";
    } catch {
      return false;
    }
  });
  /* 2026-11-21 日卡改版：同一酒店多间房在「今日已定」与「今晚住哪」都只出现一次 */
  const hotelGroups = groupHotelBookings(hotelBookings, day.city_zh);
  /* 今日已定里的航班行优先用当天交通预订记录（出票事实，如 Day 1 的 CA889 /
   * MU2069——首日没有 prevDay、没有 transferRoute，旧逻辑只认 transferRoute
   * 导致航班根本进不了今日已定）。 */
  const transportBookings = bookings.filter((b) => {
    try {
      return parseBookingBody(b.body).bkind === "transport";
    } catch {
      return false;
    }
  });
  /* 今日已定里的已出票航段兜底：只认 ticketed 且日期与当天一致的腿，
   * 且没有交通记录覆盖时才渲染腿行。 */
  const shownFlightLeg = (() => {
    if (!transferRoute) return null;
    const leg = FLIGHT_LEGS.find((l) => l.route === transferRoute);
    if (!leg || !leg.ticketed) return null;
    if (leg.date && leg.date !== transferDate) return null;
    return leg;
  })();
  /* 未出票的当天转场航段：今日已定里只占一行未订推荐，不另开跨城交通区；
   * 已有同路线交通记录时不渲染（以出票事实为准）。 */
  const unbookedLeg = (() => {
    if (!transferRoute) return null;
    const leg = FLIGHT_LEGS.find((l) => l.route === transferRoute);
    if (!leg || leg.ticketed) return null;
    if (leg.date && leg.date !== transferDate) return null;
    const [from, to] = transferRoute.split("→").map((s) => s.trim());
    const covered = transportBookings.some(
      (b) => (b.title + b.body).includes(from) && (b.title + b.body).includes(to),
    );
    return covered ? null : leg;
  })();

  /* 餐饮三层（2026-10-22 用户定版）：已预订置顶 → 必吃 highlight → 其余折叠。
   * 必吃判定只认 mustGo 数据集（研究结论），不凭卡片顺序；highlight 上限 3 家，
   * 超出的必吃也进折叠区（带必吃徽章），免得一天又堆满。 */
  const bookedRests = bookings.filter((b) => {
    try {
      return parseBookingBody(b.body).bkind === "restaurant";
    } catch {
      return false;
    }
  });
  const bookedRestNames = bookedRests.map((b) => b.title.trim().toLowerCase());
  const isBookedRest = (name: string) => {
    const n = name.trim().toLowerCase();
    return bookedRestNames.some((bn) => bn.includes(n) || n.includes(bn));
  };
  /* 时间线站点本身就是已订餐厅时：StopBlock 展开里带确认信息 */
  const bookedForStop = (stopName: string): BookingData | undefined => {
    const hit = bookedRests.find((b) => {
      const item = restaurants.find((r) => b.title.includes(r.name) || r.name.includes(b.title));
      if (!item) return false;
      return matchItem(stopName, day.city_zh, [item])?.name === item.name;
    });
    if (!hit) return undefined;
    try {
      return parseBookingBody(hit.body);
    } catch {
      return undefined;
    }
  };
  /* 已订餐厅进当天时间线（2026-10-23 用户抓包）：此前已订餐厅只出现在卡片下方
   * 「餐饮安排 · 已预订置顶」，按上午/下午/晚上时间线读行程时根本看不到，
   * 等于没排进行程。现在按订位时间把已订餐厅渲染成对应时段的一站；
   * 时间线里已有同一家餐厅站点的，不重复加。餐饮区置顶卡保留（看详情用）。 */
  type BookedRestEntry = { b: DayBooking; bd: BookingData; item?: Item };
  const bookedRestEntries: BookedRestEntry[] = bookedRests
    .map((b) => {
      const bd = parseBookingBody(b.body);
      const item = restaurants.find(
        (r) => b.title.includes(r.name) || r.name.includes(b.title),
      );
      return { b, bd, item };
    })
    .filter(({ item }) => {
      if (!item) return true;
      // 去括号再比对（2026-11-06 site-improve-hourly 类别1/2）：括号里只是顺带提及
      // （如 12-12「酒店时间 · 回别墅歇脚（出海后、PRU 前）」）不算该餐厅已有一站；
      // 否则已订的 PRU 17:45 会被去重误杀、晚间时间线只剩 NAKA 夜市备选。
      const bare = bareName(item.name);
      return !stops.some((s) => {
        const bn = bareName(s.name);
        const m = matchItem(bn, day.city_zh, restaurants);
        return (m && m.name === item.name) || (bare !== "" && bn.includes(bare));
      });
    })
    .sort((x, y) => (x.bd.time || "99:99").localeCompare(y.bd.time || "99:99"));
  const bookedByPeriod: Record<"上午" | "下午" | "晚上", BookedRestEntry[]> = {
    上午: [],
    下午: [],
    晚上: [],
  };
  bookedRestEntries.forEach((e) => {
    bookedByPeriod[periodOf(e.bd.time || "19:00")].push(e);
  });
  type RestCard = { name: string; city: string; fav: boolean; item?: Item };
  const restCards: RestCard[] = [];
  {
    const seen = new Set<string>();
    const pushCard = (name: string, city: string, fav: boolean, item?: Item) => {
      const key = name.trim().toLowerCase();
      if (!key || seen.has(key) || isBookedRest(name)) return;
      seen.add(key);
      restCards.push({ name, city, fav, item });
    };
    favRests.forEach((f) => pushCard(f.name, f.city, true));
    restPicks.forEach((r) => pushCard(r.name, r.city, false, r));
  }
  const mustEatCards = restCards.filter((c) => mustGoBadge(c.name)).slice(0, 3);
  /* food 长文拆段；已订信息段（✅ 开头）与上方已预订卡重复，剔除 */
  const foodSegs = splitFoodText(detail?.food ?? "").filter(
    (s) => !(bookedRests.length > 0 && s.startsWith("✅")),
  );
  /* 2026-11-21 日卡改版：food 不再默认露 2 段，改三行式早/午/晚各一行店名；
   * 晚餐有已订餐厅时直接用已订那家，不从段落里猜。 */
  const mealLines = (() => {
    const breakfast = mealLine(foodSegs, "早");
    const lunch = mealLine(foodSegs, "午");
    const dinner =
      bookedRests.length > 0
        ? bookedRests
            .map((b) => {
              const bd = parseBookingBody(b.body);
              return `${b.title}${bd.time ? ` ${bd.time}` : ""} · 已订`;
            })
            .join("；")
        : mealLine(foodSegs, "晚");
    return [
      ["早", breakfast],
      ["午", lunch],
      ["晚", dinner],
    ]
      .filter(([, v]) => v)
      .map(([m, v]) => `${m}：${v}`);
  })();

  /**
   * 当天地图数据（2026-10-04 用户：点卡片后顶栏地图只显示这一天）：
   * 景点按时间线顺序（有坐标才收）→ 餐厅（只收当天已订的几家，有坐标才收；
   * 2026-11-07 用户：不去的餐厅不标、不连线，收藏/推荐只是选项不进路线）
   * → 当天已确认的酒店（只收已确认的那家）
   */
  // memo 签名：已订餐厅/酒店变化时重算当天地图数据
  const assignedSigCheck = (assignedAttractions ?? []).join("|");
  const assignedRestsSigCheck = (assignedRestaurants ?? []).join("|");
  const bookedRestSigCheck = bookedRests.map((b) => `${b.title}:${b.done}`).join("|");
  const hotelSigCheck = hotelBookings.map((b) => `${b.title}:${b.done}`).join("|");
  const dayRoute: DayRoute = useMemo(() => {
    const stops: DayRouteStop[] = [];
    const seen = new Set<string>();
    const push = (name: string, kind: DayRouteStop["kind"], lat: number, lng: number) => {
      const k = `${kind}:${name}`;
      if (seen.has(k)) return;
      seen.add(k);
      stops.push({ name, lat, lng, kind });
    };
    // 2026-10-04 用户：每日行程有坐飞机才在地图上标机场（其他天不标）。
    // transferRoute = "北京 → 新加坡"（城市变化即转场日），取两端机场坐标。
    if (transferRoute) {
      const [fromCity, toCity] = transferRoute.split("→").map((s) => s.trim());
      for (const c of [fromCity, toCity]) {
        const ap = airportForCity(c);
        if (ap) push(`${ap.name}（${ap.code}）`, "airport", ap.lat, ap.lng);
      }
    }
    // 景点：时间线顺序；云端天用调用方查好的坐标，静态天用 stopCoordsForDay
    const tl: { name: string; lat: number; lng: number }[] = isCloud
      ? (cloudStops ?? []).map((x) => ({ name: x.name, lat: x.lat, lng: x.lng }))
      : (stopCoordsForDay(day.day) ?? []).map((x) => ({ name: x.name, lat: x.lat, lng: x.lng }));
    tl.forEach((t) => push(t.name, "attraction", t.lat, t.lng));
    // 我排入这一天的必去景点：按名查核实坐标进当天路线（查不到坐标就不进地图、只在卡片里列名）
    for (const n of assignedAttractions ?? []) {
      const c = cloudStopsForTimeline([{ name: n, time: "" }])?.[0];
      if (c) push(n, "attraction", c.lat, c.lng);
    }
    // 餐厅 / 酒店按名查坐标
    const cityPlaces = placesForCity(cityId);
    // 餐厅只收当天已订的几家（2026-11-07 用户：不去的餐厅不标、不连线）；
    // 已在时间线里的（同名站点已有编号钉）不再另钉，避免同一地点双标记。
    const tlBareNames = tl.map((t) => bareName(t.name));
    for (const b of bookedRests) {
      const hit = cityPlaces.restaurants.find(
        (r) => r.name === b.title || r.name.includes(b.title) || b.title.includes(r.name),
      );
      if (!hit) continue;
      const bn = bareName(hit.name);
      if (
        bn !== "" &&
        tlBareNames.some((tbn) => tbn !== "" && (tbn.includes(bn) || bn.includes(tbn)))
      )
        continue;
      push(b.title, "restaurant", hit.lat, hit.lng);
    }
    // 我排入这一天的餐厅：按名查核实坐标进当天路线（与必去景点同口径；
    // 已在时间线里的不再另钉，避免同一地点双标记）
    for (const n of assignedRestaurants ?? []) {
      const hit = cityPlaces.restaurants.find(
        (r) => r.name === n || r.name.includes(n) || n.includes(r.name),
      );
      if (!hit) continue;
      const bn = bareName(hit.name);
      if (
        bn !== "" &&
        tlBareNames.some((tbn) => tbn !== "" && (tbn.includes(bn) || bn.includes(tbn)))
      )
        continue;
      push(n, "restaurant", hit.lat, hit.lng);
    }
    const confirmed = hotelBookings.find((b) => b.done);
    if (confirmed) {
      const t = confirmed.title;
      const hit = cityPlaces.hotels.find(
        (h) => h.name === t || h.name.includes(t) || t.includes(h.name),
      );
      if (hit) push(t, "hotel", hit.lat, hit.lng);
    }
    return { day: day.day, city: day.city_zh, label: `D${day.day} · ${day.city_zh}`, stops };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day.day, day.city_zh, isCloud, cityId, bookedRestSigCheck, hotelSigCheck, transferRoute, assignedSigCheck, assignedRestsSigCheck]);

  // 2026-11-07：把当天的地图路线登记给父级，日期导航按钮点按时也能切地图（不用再点具体卡片）
  useEffect(() => {
    registerDayRoute?.(day.day, dayRoute);
  }, [day.day, dayRoute, registerDayRoute]);

  /** 点当天卡片头部 → 顶栏地图切到这一天全景（不高亮单点）；已是当天全景时再点也不取消，
   * 始终显示这一天（2026-11-07 浏览器验真：开关式会把刚切进来的当日视图又关掉，反直觉） */
  const handleDayHeader = () => {
    if (!onSelectStop) return;
    onSelectStop({ day: day.day, kind: null, name: null, city: day.city_zh, route: dayRoute });
  };

  /** 卡片点选 → 顶栏地图切到这一天并高亮；再点一次取消 */
  const handleSelect = (kind: "attraction" | "restaurant" | "hotel", name: string) => {
    if (!onSelectStop) return;
    const key = stickyItemKey(kind, day.city_zh, name);
    onSelectStop(
      selectedKey === key
        ? null
        : { day: day.day, kind, name, city: day.city_zh, route: dayRoute },
    );
  };
  /**
   * 已订餐厅在地图上的落点（2026-11-07 用户：点的已订餐厅要能在地图上联动飞过去）：
   * 若该餐厅已是时间线站点（编号钉），点卡片就选中编号钉（kind=attraction + 站点原名）；
   * 否则选中餐厅钉（kind=restaurant + 订位标题）。
   */
  const bookedRestMapTarget = (title: string): { kind: "attraction" | "restaurant"; name: string } => {
    const rn = bareName(title);
    const hit = stops.find((s) => {
      const bn = bareName(s.name);
      return bn !== "" && rn !== "" && (bn.includes(rn) || rn.includes(bn));
    });
    return hit ? { kind: "attraction", name: hit.name } : { kind: "restaurant", name: title };
  };
  const isSel = (kind: string, name: string) =>
    !!selectedKey && selectedKey === stickyItemKey(kind, day.city_zh, name);

  return (
    <article
      id={`day-${day.day}`}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden scroll-mt-28"
    >
      {/* 头部：Day徽标 + 日期 + 城市 + 气候（点按切地图到这一天全景） */}
      <header
        className={`bg-gradient-to-r from-teal-700/10 to-teal-700/5 border-b-2 border-teal-700/20 px-5 py-5${onSelectStop ? " cursor-pointer" : ""}`}
        onClick={onSelectStop ? handleDayHeader : undefined}
        title={onSelectStop ? "点按：在地图上显示这一天" : undefined}
      >
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
      </header>

      <div className="px-5 py-5">
        {/* 本城备选（2026-11-22 用户改版：每张日卡顶部可展开，不再只在城市末尾单列） */}
        {dayOptions && dayOptions.length > 0 && (
          <DayCityBackup
            city={day.city_zh}
            scheduledNames={scheduledNames}
            bookedRestNames={cityBookedRestNames}
            favRestNames={favRestNames}
            dayOptions={dayOptions.filter((d) => d.city_zh === day.city_zh)}
            open={backupOpen}
            onToggle={() => setBackupOpen((o) => !o)}
          />
        )}

        {/* 今日已定（2026-11-21 二次改版）：头部下方、时间线之前，一张统一列表 */}
        <TodayBookedSection
          hotelGroups={hotelGroups}
          flightLeg={shownFlightLeg}
          transportBookings={transportBookings}
          unbookedLeg={unbookedLeg}
          bookedRests={bookedRests}
        />

        {/* 今晚住哪（2026-10-03 用户模型：每天都要能看到住哪，收藏的和已订的）；
            2026-11-21：已订酒店只在「今日已定」出现一次，本区只留收藏候选 */}
        <DayHotelSection
          city={day.city_zh}
          stay={stay ?? null}
          favHotels={favHotels}
          hotelBookings={hotelBookings}
          onSelect={onSelectStop ? (kind, name) => handleSelect(kind, name) : undefined}
          selectedKey={selectedKey}
          hideBooked={hotelBookings.length > 0}
        />

        {/* 我排入这一天的必去景点（2026-10-16：收藏景点指定日期后落到当天卡片，不再只是警告没排入） */}
        {assignedAttractions && assignedAttractions.length > 0 && (
          <section className="mb-6">
            <h4 className="text-lg font-bold mb-3 text-violet-800">⭐ 我排入这一天的必去景点</h4>
            <div className="flex flex-wrap gap-2">
              {assignedAttractions.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleSelect("attraction", n)}
                  className={`text-sm px-3 py-1.5 rounded-full border font-medium ${
                    selectedKey === stickyItemKey("attraction", day.city_zh, n)
                      ? "bg-violet-700 text-white border-violet-700"
                      : "bg-violet-50 text-violet-900 border-violet-200 hover:border-violet-500"
                  }`}
                >
                  ⭐ {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">在行程页顶部的「我的必去景点」里指定日期；点景点名可在上方地图定位。</p>
          </section>
        )}

        {/* 我排入这一天的餐厅（2026-11-22：备选清单里指定日期后落到当天卡片，与必去景点同口径） */}
        {assignedRestaurants && assignedRestaurants.length > 0 && (
          <section className="mb-6">
            <h4 className="text-lg font-bold mb-3 text-violet-800">⭐ 我排入这一天的餐厅</h4>
            <div className="flex flex-wrap gap-2">
              {assignedRestaurants.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleSelect("restaurant", n)}
                  className={`text-sm px-3 py-1.5 rounded-full border font-medium ${
                    selectedKey === stickyItemKey("restaurant", day.city_zh, n)
                      ? "bg-violet-700 text-white border-violet-700"
                      : "bg-violet-50 text-violet-900 border-violet-200 hover:border-violet-500"
                  }`}
                >
                  🍽️ {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">在每张日卡顶部的「{day.city_zh}备选」里选一天放入行程；点餐厅名可在上方地图定位。</p>
          </section>
        )}

        {/* 上午 / 下午 / 晚上（已订餐厅按订位时间进对应时段，2026-10-23） */}
        {(morning.length > 0 || bookedByPeriod["上午"].length > 0) && (
          <section className="mb-6">
            <h4 className="text-lg font-bold mb-3 text-teal-800">☀️ 上午</h4>
            <div className="space-y-2">
              {morning.map((s, i) => (
                <StopBlock
                  key={i}
                  stop={s}
                  city={day.city_zh}
                  onSelect={onSelectStop ? () => handleSelect("attraction", s.name) : undefined}
                  selected={isSel("attraction", s.name)}
                  booked={bookedForStop(s.name)}
                />
              ))}
              {bookedByPeriod["上午"].map((e) => {
                const target = bookedRestMapTarget(e.b.title);
                return (
                  <BookedRestBlock
                    key={`br-${e.b.title}`}
                    entry={e}
                    city={day.city_zh}
                    onSelect={onSelectStop ? () => handleSelect(target.kind, target.name) : undefined}
                    selected={isSel(target.kind, target.name)}
                  />
                );
              })}
            </div>
          </section>
        )}
        {(afternoon.length > 0 || bookedByPeriod["下午"].length > 0) && (
          <section className="mb-6">
            <h4 className="text-lg font-bold mb-3 text-teal-800">🌤 下午</h4>
            <div className="space-y-2">
              {afternoon.map((s, i) => (
                <StopBlock
                  key={i}
                  stop={s}
                  city={day.city_zh}
                  onSelect={onSelectStop ? () => handleSelect("attraction", s.name) : undefined}
                  selected={isSel("attraction", s.name)}
                  booked={bookedForStop(s.name)}
                />
              ))}
              {bookedByPeriod["下午"].map((e) => {
                const target = bookedRestMapTarget(e.b.title);
                return (
                  <BookedRestBlock
                    key={`br-${e.b.title}`}
                    entry={e}
                    city={day.city_zh}
                    onSelect={onSelectStop ? () => handleSelect(target.kind, target.name) : undefined}
                    selected={isSel(target.kind, target.name)}
                  />
                );
              })}
            </div>
          </section>
        )}
        {(evening.length > 0 || bookedByPeriod["晚上"].length > 0) && (
          <section className="mb-6">
            <h4 className="text-lg font-bold mb-3 text-teal-800">🌙 晚上</h4>
            <div className="space-y-2">
              {evening.map((s, i) => (
                <StopBlock
                  key={i}
                  stop={s}
                  city={day.city_zh}
                  onSelect={onSelectStop ? () => handleSelect("attraction", s.name) : undefined}
                  selected={isSel("attraction", s.name)}
                  booked={bookedForStop(s.name)}
                />
              ))}
              {bookedByPeriod["晚上"].map((e) => {
                const target = bookedRestMapTarget(e.b.title);
                return (
                  <BookedRestBlock
                    key={`br-${e.b.title}`}
                    entry={e}
                    city={day.city_zh}
                    onSelect={onSelectStop ? () => handleSelect(target.kind, target.name) : undefined}
                    selected={isSel(target.kind, target.name)}
                  />
                );
              })}
            </div>
          </section>
        )}
        {!detail && (
          <p className="text-sm text-gray-400 mb-6">
            该日详细时间线待补充，先看下方本城酒店/餐厅/景点详情。
          </p>
        )}

        {/* 餐饮安排（2026-11-21 日卡改版 P0 主线 2）：
            ① 已预订餐厅只在「今日已定」与时间线出现，本区不再置顶大卡；
            ② 必吃 highlight 改成摘要行，点开看卡片；
            ③ food 不再默认露 2 段，改三行式早/午/晚各一行店名，全文进折叠区；
            ④ 备选餐厅见每张日卡顶部的「{day.city_zh}备选」展开（2026-11-22 改版）。 */}
        {(mustEatCards.length > 0 || foodSegs.length > 0) && (
          <section className="mb-6 pt-6 border-t border-gray-100">
            <h4 className="text-lg font-bold mb-3 text-orange-700">
              🍽️ 餐饮安排
            </h4>

            {mustEatCards.length > 0 && (
              <details className="mb-2">
                <summary className="text-sm font-semibold text-red-700 cursor-pointer py-1">
                  ⭐ 必吃 {mustEatCards.length} 家：{mustEatCards.map((c) => c.name).join("、")}（点开看）▾
                </summary>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {mustEatCards.map((c) => {
                    const b = bookingPolicyBadge(c.name);
                    const cSel = isSel("restaurant", c.name);
                    const photo = c.item ? getPlaceGallery("餐厅", c.item)[0] : undefined;
                    return (
                      <div
                        key={c.name}
                        onClick={onSelectStop ? (e) => {
                          if ((e.target as HTMLElement).closest("button, a")) return;
                          handleSelect("restaurant", c.name);
                        } : undefined}
                        className={`bg-red-50 border-2 border-red-400 rounded-lg p-3${onSelectStop ? " cursor-pointer" : ""}${cSel ? " ring-2 ring-orange-600" : ""}`}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          {photo && (
                            <img src={photo.src} alt={c.name} className="w-10 h-10 rounded-lg object-cover shrink-0" loading="lazy" />
                          )}
                          <span className="text-sm font-bold flex-1">{c.name}</span>
                          <span className="text-xs font-bold text-white bg-red-600 rounded-full px-2 py-0.5">必吃</span>
                          <span title={b.title} className={`text-xs font-medium px-2 py-0.5 rounded-full border ${b.cls}`}>
                            {b.text}
                          </span>
                        </div>
                        {MUST_GO[c.name] && (
                          <p className="text-xs text-red-900 mt-1">{MUST_GO[c.name]}</p>
                        )}
                        {c.fav && <p className="text-xs text-gray-400 mt-0.5">⭐ 你收藏的</p>}
                      </div>
                    );
                  })}
                </div>
              </details>
            )}

            {mealLines.length > 0 && (
              <ul className="space-y-1 mb-2">
                {mealLines.map((l, i) => (
                  <li key={i} className="text-sm text-gray-700 leading-relaxed">• {l}</li>
                ))}
              </ul>
            )}

            {foodSegs.length > 0 && (
              <details>
                <summary className="text-xs font-medium text-orange-700 cursor-pointer py-1">
                  全部吃法（{foodSegs.length} 条，点开看）▾
                </summary>
                <ul className="space-y-1.5 mt-1">
                  {foodSegs.map((s, i) => (
                    <li key={i} className="text-sm text-gray-700 leading-relaxed">• {s}</li>
                  ))}
                </ul>
              </details>
            )}
          </section>
        )}

        {/* 安排提醒：结构化卡片（2026-10-22 用户要求，不再整段文字墙） */}
        {detail?.tip && (
          <section className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <h4 className="font-bold mb-2 text-purple-700">💡 安排提醒</h4>
            <TipStructured tip={detail.tip} />
          </section>
        )}

      </div>
    </article>
  );
}
