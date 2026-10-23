import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  days as staticDays,
  legs,
  cityMobility,
  attractions,
  restaurants,
  shopping,
  type Day,
  type Item,
} from "@/guide/data";
import {
  BOOKING_KIND_LABEL,
  parseBookingBody,
  bookingSummary,
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
import { placeDetailPath, kindFromZh } from "@/guide/placeDetail";
import { DetailLink, useDetailReturn } from "@/components/DetailReturn";
import type { PlanDay } from "@/guide/plannerSchedule";
import { CITY_ID_BY_ZH } from "@/data/cityCoords";
import { FLIGHT_LEGS, refreshLegFromDb, type FlightLegInfo } from "@/bookings/bookingTimeline";

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

/**
 * 每城住宿区间（与航班模型一致：入住=到达当天=本城首日，退房=转场航班当天=下一城首日；
 * 末城退房=本城末日+1）。国内城市不管，只算行程里的城市。
 */
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
      checkOut: next ? first.get(next)! : addOneDay(last.get(c)!),
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
 * 首尔：weather2visit.com 首尔站 12 月均值（3.9/-4.7°C，降雨21mm）；weather-atlas 同月口径（4.3/-3.2°C，降雨22mm）互证，2026-10-14 核对。
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
  首尔: "4/-5°C · 月降雨约21mm · 干冷少雨，可能下雪，羽绒服+保暖内衣",
};

/* ---------------- 12月穿搭建议（按城市气候） ---------------- */
const PACKING: Record<string, string> = {
  曼谷: "31°C：短袖短裤为主，防晒做足；进大皇宫等寺庙需遮肩盖膝，备一条长裙/长裤。",
  清迈: "白天 28°C 短袖，早晚 16°C 左右：备薄外套或长袖；素贴山上更冷。",
  普吉: "31°C 海岛装；出海日备防水袋、换洗衣物和晕船药。",
  槟城: "31°C 阵雨多：短袖 + 折叠伞 + 防滑凉鞋。",
  吉隆坡: "29°C 多雨：短袖 + 雨伞；商场空调冷，备薄外套。",
  胡志明市: "30°C 短袖；摩托车多，穿好走的鞋，注意包不离身。",
  富国岛: "29°C 海岛装 + 防晒；夜市备驱蚊水。",
  新加坡: "29°C 高湿多雨：速干衣 + 折叠伞；室内空调冷，备薄外套；带娃多备一套换洗衣物。",
  首尔: "白天约 4°C、夜间 -5°C：羽绒服/厚外套 + 保暖内衣 + 手套围巾；路面可能结冰，穿防滑鞋；室内暖气足，洋葱式穿法方便增减。",
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
            "白天逛街采购；顺路两个点：多美歌的国家博物馆历史展厅 2026-10 刚翻新重开（室内、亲子友好），往西到唐林是新加坡植物园，里面的 Jacob Ballas 儿童花园有玩水区和游乐场，适合给娃放电。圣诞灯饰傍晚约 18:30 就亮，早点吃晚饭的话娃睡前能看一段（义安城/东陵坊有飘雪表演）；2026 具体亮灯日期出发前查主办方官网。（2026-10-17 发现轮换补充）往南约 10 分钟是 River Valley 的 New Bahru 文创园区，首尔排队王 MilkyShop 黄油夹心饼在那儿快闪到 2027-01-02，每天限量 250 盒、S$30 多一盒，想吃要上午去。（2026-10-17 发现轮换第二轮补充）",
        },
        {
          time: "18:00",
          name: "酒店附近晚餐",
          detail: "早吃晚饭回酒店；不安排夜游项目。",
        },
      ],
      food: "Kampong Glam 一带马来餐；晚餐酒店附近解决。",
      tip: "族群区三选一的名额给了牛车水（离境日），今天是纯弹性备选：逛不动就回酒店休息，不硬撑。另一个半日备选：西边 Kent Ridge 的 Geneo 商场（木结构大中庭、两层餐厅，二楼有 S$7 玩半小时的充气城堡），能避开乌节路的人潮。（2026-10-17 发现轮换第二轮补充）",
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

export function matchItem(
  stopName: string,
  city: string,
  list: Item[],
): Item | undefined {
  // 转场/后勤类站点不参与景点·餐厅匹配：
  // 否则"抵达樟宜机场"会被"新加坡"三字前缀误链到动物园等条目，点出错误的"查看详情"
  if (/机场|航班|飞往|抵达|离境|入住|退房|午睡|收行李|码头集合/.test(stopName))
    return undefined;
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

/* ============ 餐饮/提醒结构化呈现（2026-10-22 用户要求） ============
 * 用户原话：餐饮现在全是大段文字、每天塞一堆餐厅根本吃不完；安排提醒也是
 * 小红书研究结论堆成大段文字、没法读。定版结构：
 * ① 餐饮三层：已预订置顶 → 必吃（mustGo 数据集判定）highlight → 其余全部折叠；
 * ② food 长文按段拆成条目，只露前 2 条，其余进折叠区；
 * ③ 提醒按【小标题】拆成结构卡，只露前 2 条，其余进折叠区；
 *    无标题的提醒按句拆条。研究新发现今后应直接进 stops 时间线，
 *    不许再往 tip/food 字符串尾巴上追加段落（管线规则已同步）。 */

/** food 长文拆段：段首标记（🍽️ ✅ 🌙 ⚠️）与「另：」是历史追加的段界。 */
export function splitFoodText(text: string): string[] {
  if (!text) return [];
  return text
    .replace(/(🍽️|✅|🌙|⚠️)/g, "\n$1")
    .split(/\n|另：/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
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

/** 安排提醒结构化列表：露「首条无标题核心提醒 + 前 2 条带标题研究卡」，其余折叠
 * （Home 日卡与 DayDetail 共用）。带标题的多是研究追加项，必须露出来才算呈现，
 * 只露无标题的开头句会把研究结论全折掉。 */
export function TipStructured({ tip }: { tip: string }) {
  const items = parseTipItems(tip);
  if (!items.length) return null;
  const keep = new Set<number>();
  const firstPlain = items.findIndex((it) => !it.title);
  if (firstPlain >= 0) keep.add(firstPlain);
  items.forEach((it, i) => {
    if (it.title && [...keep].filter((k) => items[k].title).length < 2) keep.add(i);
  });
  if (!items.some((it) => it.title)) {
    keep.clear();
    items.slice(0, 2).forEach((_, i) => keep.add(i));
  }
  if (keep.size === 0) items.slice(0, 2).forEach((_, i) => keep.add(i));
  const visible = items.filter((_, i) => keep.has(i));
  const rest = items.filter((_, i) => !keep.has(i));
  return (
    <div className="space-y-2">
      {visible.map((it, i) => (
        <TipCard key={i} item={it} />
      ))}
      {rest.length > 0 && (
        <details>
          <summary className="text-xs font-medium text-purple-700 cursor-pointer py-1">
            更多提醒（{rest.length} 条）▾
          </summary>
          <div className="space-y-2 mt-2">
            {rest.map((it, i) => (
              <TipCard key={i} item={it} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

/* ---------------- 今晚住哪（2026-10-03 用户模型：每天显示当天的酒店，收藏的和已订的都要有） ---------------- */
export function DayHotelSection({
  city,
  stay,
  favHotels,
  hotelBookings,
  onSelect,
  selectedKey,
}: {
  city: string;
  stay: { checkIn: string; checkOut: string } | null;
  favHotels: ParsedFavorite[];
  hotelBookings: DayBooking[];
  /** 点选（2026-10-04）：只有已确认的酒店卡可点 */
  onSelect?: (kind: "hotel", name: string) => void;
  selectedKey?: string | null;
}) {
  /* 住宿行优先用已订酒店记录自身的入住/退房日期（date/dateEnd）：
   * 城市级区间是靠行程天推导的，曼谷会被推到下一城首日、首尔会被算成末日+1，晚数全错。 */
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
  return (
    <section className="mb-6 pt-6 border-t border-gray-100">
      <h4 className="text-lg font-bold mb-3 text-teal-800">🛏️ 今晚住哪</h4>
      {stayLine}
      <div className="space-y-2">
        {hotelBookings.map((b, i) => {
          const bd = parseBookingBody(b.body);
          const summary = bookingSummary(bd);
          const clickable = b.done && onSelect;
          const isSel = !!selectedKey && selectedKey === stickyItemKey("hotel", city, b.title);
          return (
            <div
              key={`hb-${i}`}
              onClick={clickable ? (e) => {
                if ((e.target as HTMLElement).closest("button, a")) return;
                onSelect!("hotel", b.title);
              } : undefined}
              className={`bg-teal-50 border border-teal-200 rounded-lg p-3${clickable ? " cursor-pointer" : ""}${isSel ? " ring-2 ring-teal-600" : ""}`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">{b.title}</span>
                {b.done
                  ? <span className="text-xs font-bold text-white bg-green-600 rounded-full px-2 py-0.5">已确认</span>
                  : <span className="text-xs text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">待预订</span>}
              </div>
              {b.stayNight != null && (
                <p className="text-xs text-teal-700 mt-1">{b.stayNight === 0 ? "📅 今天入住" : `🌙 住宿第 ${b.stayNight + 1} 晚`}</p>
              )}
              {summary && <p className="text-xs text-gray-600 mt-1">{summary}</p>}
              {bd.note && <p className="text-xs text-gray-500 mt-1">{bd.note}</p>}
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
              </div>
              {summary && (
                <p className="text-xs text-gray-700">{summary}</p>
              )}
              {bd.note && (
                <p className="text-xs text-gray-500 mt-1">{bd.note}</p>
              )}
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

/* ---------------- 转场日实际航班（2026-10-03：不再只显示通用核对清单） ---------------- */
function TransferFlightInfo({ route, date, favFlights }: { route: string; date: string; favFlights: ParsedFavorite[] }) {
  /* 2026-10-03 修：按转场实际日期从航班库重查，不读静态日期价格；
   * 深拷贝再查，不污染共享 FLIGHT_LEGS（与预订页航班列表同一做法） */
  const leg = useMemo(() => {
    const f = FLIGHT_LEGS.find((l) => l.route === route);
    if (!f) return null;
    const copy = JSON.parse(JSON.stringify(f)) as FlightLegInfo;
    if (date) refreshLegFromDb(copy, date);
    return copy;
  }, [route, date]);
  const opts = leg?.options ?? [];
  const prices = opts.map((o) => o.price ?? Infinity).filter((p) => p !== Infinity);
  const min = prices.length ? Math.min(...prices) : null;
  if (!leg && !favFlights.length) return null;
  return (
    <div className="mb-3 pb-3 border-b border-sky-200">
      <p className="text-sm font-semibold text-sky-900">✈️ {route}{date ? ` · ${isoShort(date)}` : ""}</p>
      {favFlights.map((f) => (
        <p key={f.name} className="text-sm text-sky-800 mt-1">
          ⭐ {f.flight?.carrier} {f.flight?.flight} {f.flight?.depart}→{f.flight?.arrive}{f.flight?.arrivePlusDay ? "+1" : ""}
          {f.flight?.price != null && <span> · ${f.flight.price}</span>}
          <span className="text-xs text-sky-600">（你收藏的）</span>
        </p>
      ))}
      {leg && (
        <p className="text-xs text-sky-700 mt-1">
          {leg.flightState === "pending" ? (
            <>航班信息待查询（库里还没有 {isoShort(date)} 的实查数据）</>
          ) : leg.flightState === "none" ? (
            <>当天实查无直飞</>
          ) : (
            <>当天 {opts.length} 班直飞{min != null && <> · ${min} 起</>}{leg.queriedAt && <> · 实查 {leg.queriedAt}</>}</>
          )}
          {!favFlights.length && leg.flightState !== "pending" && "（去预订页收藏具体航班）"}
        </p>
      )}
    </div>
  );
}

/* ---------------- 时间线上的单个站点 ---------------- */
function StopBlock({
  stop,
  city,
  onSelect,
  selected,
}: {
  stop: Stop;
  city: string;
  onSelect?: () => void;
  selected?: boolean;
}) {
  const mA = matchItem(stop.name, city, attractions);
  const mR = !mA ? matchItem(stop.name, city, restaurants) : undefined;
  const item = mA || mR;
  const kindZh = mA ? "景点" : mR ? "餐厅" : null;
  const photo =
    item && kindZh === "景点" ? getPlaceGallery("景点", item)[0] : undefined;
  return (
    <div
      onClick={onSelect ? (e) => {
        if ((e.target as HTMLElement).closest("button, a")) return;
        onSelect();
      } : undefined}
      className={`border-l-2 border-teal-600/30 pl-4 py-3${onSelect ? " cursor-pointer rounded-lg" : ""}${selected ? " ring-2 ring-teal-600 bg-teal-50/50" : ""}`}
    >
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
        {item && kindZh && (
          <DetailLink
            to={placeDetailPath(kindFromZh(kindZh), city, item.name)}
            pageKey="itinerary-day"
            cardId={`stop-${stop.time}-${item.name}`}
            className="text-xs font-medium text-white bg-teal-700 hover:bg-teal-600 rounded-full px-2.5 py-0.5"
          >
            查看详情
          </DetailLink>
        )}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{stop.detail}</p>
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
  kind: "attraction" | "restaurant" | "hotel";
  name: string;
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
  cityScheduledNames,
  favorites,
  assignedAttractions,
  stay,
  onSelectStop,
  selectedKey,
}: {
  day: PlanDay;
  prevDay: PlanDay | undefined;
  detail: Day | undefined;
  bookings: DayBooking[];
  /** 云端行程：编号与静态对不上，转场/地图一律按当天实际城市计算 */
  isCloud?: boolean;
  /** 该城市段所有天已排的站点名（算本城备选用） */
  cityScheduledNames?: Set<string>;
  /** 用户收藏（酒店/餐厅/航班）：每天卡片里展示当天城市的收藏 */
  favorites?: ParsedFavorite[];
  /** 我排入这一天的必去景点名（收藏景点在行程页指定了 assignDate=当天） */
  assignedAttractions?: string[];
  /** 本城住宿区间（入住/退房），"今晚住哪"用 */
  stay?: { checkIn: string; checkOut: string } | null;
  /** 点选（2026-10-04 用户）：点卡片 → 顶栏固定地图显示这一天，被点的跳动 */
  onSelectStop?: (sel: DayStopSelection | null) => void;
  /** 当前被选中的卡片 key（stickyItemKey），用于卡片描边 */
  selectedKey?: string | null;
}) {
  useDetailReturn("itinerary-day");
  const cityId = CITY_ID_BY_ZH[day.city_zh] || day.city_id;
  const prevCityId =
    prevDay && prevDay.city_zh !== day.city_zh
      ? CITY_ID_BY_ZH[prevDay.city_zh] || prevDay.city_id
      : null;
  // 首尔首日的进城转场出发地（2026-10-13 修复）：云端 schedule 里没有分开行动
  // （北京/西安）的日子，prevDay 会是 12-19 曼谷，但全家实际从西安飞首尔
  // （XIY→ICN，前一天高铁在西安汇合）——转场城市按西安算，不许显示曼谷飞首尔。
  const transferPrevZh =
    isCloud && day.city_zh === "首尔" && prevDay && prevDay.city_zh !== "首尔"
      ? "西安"
      : prevDay?.city_zh;
  const stops = detail?.stops || [];
  // 转场站点：静态天沿用静态 stop（含航班号等细节）；云端天按前后城市直接算，
  // 不用静态天的“清迈飞普吉”这类旧城市对。
  const staticTransferStop = stops.find((s) => /飞|退房|离境/.test(s.name));
  const cloudTransferName =
    isCloud && prevDay && prevDay.city_zh !== day.city_zh
      ? `${transferPrevZh}飞${day.city_zh}`
      : undefined;
  const transferStop = isCloud
    ? cloudTransferName
      ? { name: cloudTransferName }
      : undefined
    : staticTransferStop;
  const isTransfer = !!transferStop || !!prevCityId;

  // 云端天地图站点：按当天时间线站点名全局查核实坐标（编号对应当天时间线）；
  // 查不到坐标的站点跳过，全部查不到时 DayMap 回退到城市级标记。
  // 与 DayDetail 共用 cloudStopsForTimeline，保证两处地图一致。
  const cloudStops: StopCoord[] | undefined = isCloud
    ? cloudStopsForTimeline(stops)
    : undefined;

  // 跨城航段匹配（静态 legs 只服务静态 20 天；云端一律走通用清单，
  // 避免旧 8 城航段建议泄漏进云端转场卡——向导 7 城任意重排都可能撞上旧城市对）
  const matchedLeg = (() => {
    if (isCloud) return null;
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
  // 备选景点：每天2-3个本城没排进去的景点，默认折叠，有时间可展开挑选。
  const altAttrs = attractions
    .filter(
      (a) =>
        a.city === day.city_zh &&
        ![...(cityScheduledNames || [])].some((stName) =>
          matchItem(stName, day.city_zh, [a])
        )
    )
    .slice(0, 3);
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
  const favFlights = transferRoute
    ? favs.filter((f) => f.type === "flight" && f.flight?.route === transferRoute)
    : [];
  const hotelBookings = bookings.filter((b) => {
    try {
      return parseBookingBody(b.body).bkind === "hotel";
    } catch {
      return false;
    }
  });

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
  const mustEatNames = new Set(mustEatCards.map((c) => c.name));
  const otherRestCards = restCards.filter((c) => !mustEatNames.has(c.name));
  /* food 长文拆段；已订信息段（✅ 开头）与上方已预订卡重复，剔除 */
  const foodSegs = splitFoodText(detail?.food ?? "").filter(
    (s) => !(bookedRests.length > 0 && s.startsWith("✅")),
  );

  /**
   * 当天地图数据（2026-10-04 用户：点卡片后顶栏地图只显示这一天）：
   * 景点按时间线顺序（有坐标才收）→ 餐厅（收藏+推荐，有坐标才收）→ 当天已确认的酒店（只收已确认的那家）
   */
  // memo 签名：收藏/推荐/预订变化时重算当天地图数据
  const favSigCheck = favRests.map((f) => f.name).join("|");
  const assignedSigCheck = (assignedAttractions ?? []).join("|");
  const restSigCheck = restPicks.map((r) => r.name).join("|");
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
    const restNames = [...favRests.map((f) => f.name), ...restPicks.map((r) => r.name)];
    for (const n of restNames) {
      const hit = cityPlaces.restaurants.find(
        (r) => r.name === n || r.name.includes(n) || n.includes(r.name),
      );
      if (hit) push(n, "restaurant", hit.lat, hit.lng);
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
  }, [day.day, day.city_zh, isCloud, cityId, favSigCheck, restSigCheck, hotelSigCheck, transferRoute, assignedSigCheck]);

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
  const isSel = (kind: string, name: string) =>
    !!selectedKey && selectedKey === stickyItemKey(kind, day.city_zh, name);

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
              {/* 2026-10-03：转场日显示实际航班（收藏的+当天直飞），不再只给通用清单 */}
              {transferRoute && (
                <TransferFlightInfo route={transferRoute} date={transferDate} favFlights={favFlights} />
              )}
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
                    ? `${transferPrevZh} → ${day.city_zh} 转场日`
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
                to="/bookings?menu=flights"
                className="inline-block mt-3 text-sm font-medium text-sky-700 underline"
              >
                去预订页看全部航段 →
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
                to="/practical?mode=交通"
                className="inline-block mt-3 text-sm font-medium text-sky-700 underline"
              >
                去实用信息看交通指南 →
              </Link>
            </div>
          </Collapsible>
        )}

        {/* 今晚住哪（2026-10-03 用户模型：每天都要能看到住哪，收藏的和已订的） */}
        <DayHotelSection
          city={day.city_zh}
          stay={stay ?? null}
          favHotels={favHotels}
          hotelBookings={hotelBookings}
          onSelect={onSelectStop ? (kind, name) => handleSelect(kind, name) : undefined}
          selectedKey={selectedKey}
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

        {/* 上午 / 下午 / 晚上 */}
        {morning.length > 0 && (
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
                />
              ))}
            </div>
          </section>
        )}
        {afternoon.length > 0 && (
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
                />
              ))}
            </div>
          </section>
        )}
        {evening.length > 0 && (
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
                />
              ))}
            </div>
          </section>
        )}
        {!detail && (
          <p className="text-sm text-gray-400 mb-6">
            该日详细时间线待补充，先看下方本城酒店/餐厅/景点详情。
          </p>
        )}

        {/* 备选景点（原版 AlternativeAttractions 逻辑） */}
        {altAttrs.length > 0 && (
          <details className="mb-6 bg-teal-50/40 border border-teal-100 rounded-xl">
            <summary className="cursor-pointer list-none p-3 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-teal-800">
                  🔀 备选景点（{altAttrs.length}个）
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  本城行程里没排进去的景点，时间有富余时可展开挑选替换 / 加塞。
                </p>
              </div>
              <span className="text-teal-700 text-sm font-medium shrink-0 ml-2">展开 ▾</span>
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-3 pb-3">
              {altAttrs.map((a) => {
                const photo = getPlaceGallery("景点", a)[0];
                return (
                  <div
                    key={a.name}
                    className="flex gap-3 bg-teal-50/60 border border-teal-100 rounded-lg p-2"
                  >
                    {photo && (
                      <img
                        src={photo.src}
                        alt={a.name}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                        loading="lazy"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold">{a.name}</span>
                      </div>
                      {a.meta && (
                        <p className="text-xs text-gray-500 truncate">
                          {a.meta}
                        </p>
                      )}
                      <DetailLink
                        to={placeDetailPath("attraction", a.city, a.name)}
                        pageKey="itinerary-day"
                        cardId={`day-${day.day}-attraction-${a.name}`}
                        className="text-xs font-medium text-teal-700 underline"
                      >
                        查看详情 →
                      </DetailLink>
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        )}

        {/* 餐饮安排：三层结构（2026-10-22 用户定版）
            ① 已预订置顶 ② 必吃 highlight（mustGo 判定，上限 3 家）
            ③ food 长文只露前 2 条 + 其余餐厅卡全部折叠，吃不完不用硬塞 */}
        {(bookedRests.length > 0 || mustEatCards.length > 0 || foodSegs.length > 0 || otherRestCards.length > 0) && (
          <section className="mb-6 pt-6 border-t border-gray-100">
            <h4 className="text-lg font-bold mb-3 text-orange-700">
              🍽️ 餐饮安排
            </h4>

            {bookedRests.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-bold text-green-700 mb-1.5">✅ 已预订 · 先看这个</p>
                <div className="space-y-2">
                  {bookedRests.map((b, i) => {
                    const bd = parseBookingBody(b.body);
                    const summary = bookingSummary(bd);
                    return (
                      <div key={i} className="bg-green-50 border-2 border-green-500 rounded-lg p-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold flex-1">{b.title}</span>
                          {b.done && (
                            <span className="text-xs font-bold text-white bg-green-600 rounded-full px-2 py-0.5">
                              已确认
                            </span>
                          )}
                        </div>
                        {summary && <p className="text-xs text-gray-700 mt-1">{summary}</p>}
                        {bd.note && <p className="text-xs text-gray-500 mt-1">{bd.note}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {mustEatCards.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-bold text-red-700 mb-1.5">⭐ 必吃 · 当地特色，别错过</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                          <DetailLink
                            to={placeDetailPath("restaurant", c.city, c.name)}
                            pageKey="itinerary-day"
                            cardId={`day-${day.day}-restaurant-${c.name}`}
                            className="text-xs font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-full px-2.5 py-0.5"
                          >
                            查看详情
                          </DetailLink>
                        </div>
                        {MUST_GO[c.name] && (
                          <p className="text-xs text-red-900 mt-1">{MUST_GO[c.name]}</p>
                        )}
                        {c.fav && <p className="text-xs text-gray-400 mt-0.5">⭐ 你收藏的</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {foodSegs.length > 0 && (
              <div className="mb-3">
                <ul className="space-y-1.5">
                  {foodSegs.slice(0, 2).map((s, i) => (
                    <li key={i} className="text-sm text-gray-700 leading-relaxed">• {s}</li>
                  ))}
                </ul>
                {foodSegs.length > 2 && (
                  <details>
                    <summary className="text-xs font-medium text-orange-700 cursor-pointer py-1">
                      更多吃法备选（{foodSegs.length - 2} 条，吃不完不用硬塞）▾
                    </summary>
                    <ul className="space-y-1.5 mt-1">
                      {foodSegs.slice(2).map((s, i) => (
                        <li key={i} className="text-sm text-gray-700 leading-relaxed">• {s}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}

            {otherRestCards.length > 0 && (
              <details>
                <summary className="text-xs font-medium text-orange-700 cursor-pointer py-1">
                  备选餐厅还有 {otherRestCards.length} 家（点开看）▾
                </summary>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {otherRestCards.map((c) => {
                    const b = bookingPolicyBadge(c.name);
                    const mg = mustGoBadge(c.name);
                    const cSel = isSel("restaurant", c.name);
                    const photo = c.item ? getPlaceGallery("餐厅", c.item)[0] : undefined;
                    return (
                      <div
                        key={c.name}
                        onClick={onSelectStop ? (e) => {
                          if ((e.target as HTMLElement).closest("button, a")) return;
                          handleSelect("restaurant", c.name);
                        } : undefined}
                        className={`bg-orange-50 border border-orange-200 rounded-lg p-3${onSelectStop ? " cursor-pointer" : ""}${cSel ? " ring-2 ring-orange-600" : ""}`}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          {photo && (
                            <img src={photo.src} alt={c.name} className="w-10 h-10 rounded-lg object-cover shrink-0" loading="lazy" />
                          )}
                          <span className="text-sm font-semibold flex-1">{c.name}</span>
                          {mg && (
                            <span title={mg.title} className={`text-xs font-medium px-2 py-0.5 rounded-full border ${mg.cls}`}>
                              ⭐{mg.text}
                            </span>
                          )}
                          {c.fav && <span className="text-xs text-gray-400">⭐ 已收藏</span>}
                          <span title={b.title} className={`text-xs font-medium px-2 py-0.5 rounded-full border ${b.cls}`}>
                            {b.text}
                          </span>
                          <DetailLink
                            to={placeDetailPath("restaurant", c.city, c.name)}
                            pageKey="itinerary-day"
                            cardId={`day-${day.day}-restaurant-${c.name}`}
                            className="text-xs font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-full px-2.5 py-0.5"
                          >
                            查看详情
                          </DetailLink>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </details>
            )}
          </section>
        )}

        {/* 购物建议（原版 ShoppingRecommendation 逻辑） */}
        {(shopping as Record<string, string>)[day.city_zh] && (
          <section className="mb-6">
            <h4 className="text-lg font-bold mb-2 text-amber-700">
              🛍️ 购物建议
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed bg-amber-50 border border-amber-200 rounded-lg p-3">
              {(shopping as Record<string, string>)[day.city_zh]}
            </p>
          </section>
        )}

        {/* 安排提醒：结构化卡片（2026-10-22 用户要求，不再整段文字墙） */}
        {detail?.tip && (
          <section className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <h4 className="font-bold mb-2 text-purple-700">💡 安排提醒</h4>
            <TipStructured tip={detail.tip} />
          </section>
        )}

        {/* 今日穿搭建议（原版逻辑，默认折叠） */}
        {PACKING[day.city_zh] && (
          <Collapsible
            title={
              <>
                👗 今日穿搭建议
                <span className="text-xs font-normal text-gray-400 ml-1">
                  点击展开
                </span>
              </>
            }
          >
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <p className="text-sm text-pink-900 leading-relaxed">
                {PACKING[day.city_zh]}
              </p>
              <p className="text-xs text-pink-700 mt-2">
                12月气候参考见卡片顶部；临行前请查实时天气预报再定最终穿搭。
              </p>
            </div>
          </Collapsible>
        )}

        {/* 本日预订（共享组件：预订日期没填天号时已按日期自动挂天）；
            餐厅预订已在餐饮安排置顶，酒店在今晚住哪，本区只剩机票/活动 */}
        <DayBookingsSection bookings={bookings} excludeRestaurant />

      </div>
    </article>
  );
}
