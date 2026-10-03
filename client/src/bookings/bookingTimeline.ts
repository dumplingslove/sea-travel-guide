/**
 * /bookings 预订行动时间线：13 天行程（2026-12-06 ～ 12-18）
 * 新加坡 D1-5 → 普吉 D6-8 → 清迈 D9-10 → 曼谷 D11-13。
 * （2026-09-30 site-improve：HOTEL_STAYS 曾写旧行程 12-12～12-24 与旧城市顺序曼谷→清迈，
 *  与云端规划/航班转场段/酒店实时价格日期全部错位，已按当前行程修正。）
 *
 * 组织原则（对标 Google Travel / Booking.com / Trip.com）：
 * 按"最晚行动时间"排，不是按"酒店/餐厅/景点"分类堆。
 * 行动（时间线）/ 参考（城市明细）/ 记录（我的预订）三层各司其职。
 *
 * 航班数据：统一读 Google Flights 航班库（client/src/data/flight-db-december-2026.json），
 * 本文件底部的 applyFlightDb() 在模块加载时把库数据灌进 FLIGHT_LEGS；
 * 只看直飞，中转选项一律不保留。
 */
import flightDbJson from "../data/flight-db-december-2026.json";

/** 行程规划的城市分段（与 guide/GuideApp.tsx 的 PlanCityScope 同形，避免循环引用） */
export interface PlanSegment { city: string; start: string; end: string; days: number; segId?: string; }

/**
 * 城际转场航班的出发日期。
 * 2026-10-03 用户：改了大行程后航班日期要跟着变，不许写死。
 * 2026-10-03 修：大行程有北京两段（beijing1/beijing3）、西安两用（去新加坡会合/去首尔），
 * 不能只按城市名匹配——按航线显式映射到段ID+日期类型。
 */
export function flightDateFromPlan(route: string, segments: PlanSegment[]): string | null {
  const byId = (id: string) => segments.find((s) => s.segId === id);
  const byCity = (city: string) => segments.find((s) => s.city === city);
  /* 航线 → (段ID, 取start还是end) 显式映射 */
  const ROUTE_DATE_MAP: Record<string, [string, "start" | "end"]> = {
    /* 2026-10-03 用户原则：只用云端保存的日程（schedule），不许用天数推导北京/西安/首尔段。
     * 日程里没有的段，一律用静态计划日期，不猜。 */
    "西安 → 新加坡": ["singapore", "start"], /* 岳父母飞来新加坡会合（行程首日，日程里有新加坡） */
    "新加坡 → 西安": ["singapore", "end"],    /* 岳父母带娃回西安 */
    "曼谷 → 西安": ["曼谷", "end"],          /* 夫妻从曼谷飞西安 */
    /* 北京→新加坡、回程三段用静态日期（日程里没有北京/首尔段，不推导；
     * 首尔→西雅图是已出票的 AS120（2027-01-01），以实际出票为准） */
  };
  const mapped = ROUTE_DATE_MAP[route];
  if (mapped) {
    const seg = byId(mapped[0]) || byCity(mapped[0]);
    if (seg) return mapped[1] === "start" ? seg.start : seg.end;
    return null;
  }
  /* 其他城际段：出发城市最后一天 */
  const origin = route.split("→")[0]?.trim();
  if (!origin) return null;
  const seg = byCity(origin);
  return seg ? seg.end : null;
}

/**
 * 某城市的酒店入住区间（与航班模型严格一致）：
 * 入住 = 到达当天（上一城市段的最后一天，即飞入本城的航班日；首城为行程首日），
 * 退房 = 离开当天（本段最后一天，即飞离本城的航班日，当天退房、当天飞）。
 * 2026-10-03 用户：改了大行程后酒店日期要跟着变，不许写死；"次日飞"口径已作废，
 * 退房日必须与转场航班同一天（旧模型 checkout=下一段 start 会多占一晚、与航班错位）。
 */
export function hotelStayFromPlan(city: string, segments: PlanSegment[]): [string, string] | null {
  const idx = segments.findIndex((s) => s.city === city);
  if (idx < 0) return null;
  const seg = segments[idx]!;
  const checkIn = idx === 0 ? seg.start : segments[idx - 1]!.end;
  return [checkIn, seg.end];
}

export interface HotelStay {
  city: string;
  /** 入住 YYYY-MM-DD（到达当天） */
  checkIn: string;
  /** 退房 YYYY-MM-DD（离境航班当天） */
  checkOut: string;
  nights: number;
}

/** planner 读不到时的酒店住宿兜底（与当前行程一致；planner 能读到时一律按 planner 推导，不许写死覆盖） */
export const FALLBACK_STAYS: HotelStay[] = [
  { city: "新加坡", checkIn: "2026-12-06", checkOut: "2026-12-10", nights: 4 },
  { city: "普吉", checkIn: "2026-12-10", checkOut: "2026-12-13", nights: 3 },
  { city: "清迈", checkIn: "2026-12-13", checkOut: "2026-12-15", nights: 2 },
  { city: "曼谷", checkIn: "2026-12-15", checkOut: "2026-12-18", nights: 3 },
];

/**
 * 全行程各城酒店住宿段（按 planner 城市段推导，供预订页酒店组使用）。
 * 2026-10-03：预订页此前用写死的 HOTEL_STAYS（入住 12-06/12-11/12-14/12-16），
 * 与航班（12-10/12-13/12-15/12-18 转场）错位一天——酒店退房日晚了、下一城入住日晚了，
 * 中间各差出一晚没地方住。改为全部按行程推导。
 */
export function hotelStaysFromPlan(segments: PlanSegment[]): HotelStay[] {
  const days = (a: string, b: string) =>
    Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
  return segments.map((seg, idx) => {
    const checkIn = idx === 0 ? seg.start : segments[idx - 1]!.end;
    return {
      city: seg.city,
      checkIn,
      checkOut: seg.end,
      nights: Math.max(0, days(checkIn, seg.end)),
    };
  });
}

/**
 * 完整大行程时间线（2026-10-03 用户：改了大行程后航班日期要跟着变）。
 * 输入：东南亚城市段（来自云端 schedule，已含新加坡+向导城市精确日期）、
 * 大行程各段天数（云端 plan.trip）。
 * 输出：北京1 → 新加坡 → 东南亚城市 → 西安 → 北京3 → 首尔 全链条。
 * 链条逻辑：beijing1 紧贴新加坡之前；西安紧贴东南亚最后城市之后；
 * beijing3 紧贴西安之后；首尔紧贴北京3之后。
 */
export function buildFullTripSegments(
  seaSegments: PlanSegment[],
  tripDays: Record<string, number>,
): PlanSegment[] {
  if (!seaSegments.length) return seaSegments;
  const addDays = (d: string, n: number) => {
    const dt = new Date(d + "T00:00:00");
    dt.setDate(dt.getDate() + n);
    return dt.toISOString().slice(0, 10);
  };
  const sg = seaSegments.find((s) => s.city === "新加坡");
  const lastSea = seaSegments[seaSegments.length - 1]!;
  const out: PlanSegment[] = [];

  /* 北京1段：新加坡开始前一天结束 */
  if (sg && tripDays.beijing1) {
    const end = addDays(sg.start, -1);
    const start = addDays(end, -(tripDays.beijing1 - 1));
    out.push({ segId: "beijing1", city: "北京", start, end, days: tripDays.beijing1 });
  }
  /* 新加坡 + 东南亚城市（带 segId） */
  for (const s of seaSegments) {
    const segId = s.city === "新加坡" ? "singapore" : undefined;
    out.push(segId ? { ...s, segId } : s);
  }
  /* 西安段：东南亚最后城市后一天开始 */
  if (tripDays.xian) {
    const start = addDays(lastSea.end, 1);
    const end = addDays(start, tripDays.xian - 1);
    out.push({ segId: "xian", city: "西安", start, end, days: tripDays.xian });
    /* 北京3段：西安后一天开始（用户一人回北京） */
    if (tripDays.beijing3) {
      const b3start = addDays(end, 1);
      const b3end = addDays(b3start, tripDays.beijing3 - 1);
      out.push({ segId: "beijing3", city: "北京", start: b3start, end: b3end, days: tripDays.beijing3 });
      /* 首尔段：北京3后一天开始 */
      if (tripDays.seoul) {
        const seStart = addDays(b3end, 1);
        const seEnd = addDays(seStart, tripDays.seoul - 1);
        out.push({ segId: "seoul", city: "首尔", start: seStart, end: seEnd, days: tripDays.seoul });
      }
    }
  }
  return out;
}

export type BookByGroup = "now" | "d60" | "d30" | "d14" | "local";

export interface FlightLegInfo {
  id: string;
  route: string;
  date: string; // YYYY-MM-DD，国际段待定则为空
  dateLabel: string;
  day: number;
  kind: "intercity" | "intl";
  note: string;
  /** 航班库航段代码（如 "PEK-SIN"）；有则 applyFlightDb() 用库数据覆盖 options */
  dbSeg?: string;
  /** 旧方案停更标记（2026-09-29 用户裁决：回程改为北京→首尔（停留2天）→西雅图，
   *  PEK/PVG/CKG-SEA 三段数据保留但不再刷新；完整改写（首尔链条目）等用户点头。
   *  标记后渲染层显示诚实提示，价格横幅不再计入其最低价。 */
  stale?: boolean;
  /** 写进 note 的固定上下文（不受库刷新影响的部分） */
  ctx?: string;
  /** ok=有直飞 / none=实查确认无直飞 / pending=待查询；由 applyFlightDb() 维护 */
  flightState?: "ok" | "none" | "pending";
  /** 以下为浏览器实查后填写；null = 待核验，不写成定论 */
  carrier?: string | null;
  schedule?: string | null;
  priceNote?: string | null;
  /** 商务舱价格说明，如 "2人 $3153 起"；无商务舱则写 "无商务舱（廉航）" */
  businessPriceNote?: string | null;
  direct?: boolean | null;
  fragile?: boolean | null;
  /** Google Flights 实查的当天直飞经济舱选项（价格为查询时总价，USD；城际段=2成人，国际段见 priceBasis）；空 = 未查询 */
  options?: FlightOption[] | null;
  /** Google Flights 实查的商务舱选项；null = 未查询；空数组 = 该段无商务舱直飞 */
  businessOptions?: FlightOption[] | null;
  /** 实查时间戳，如 "2026-09-27 02:17 PDT" */
  queriedAt?: string | null;
  /** 价格口径说明，如 "1成人单价"；缺省为 2 成人总价 */
  priceBasis?: string | null;
}

/** Google Flights 同一天的一个可选行程（价格为查询时总价，USD；城际段=2成人，国际段见 priceBasis）。
 *  全站只保留直飞（stops=0）；中转选项一律不展示。 */
export interface FlightOption {
  carrier: string;
  flight: string;
  depart: string;
  arrive: string;
  /** 到达为次日时 true，展示为 06:50+1 */
  arrivePlusDay?: boolean;
  /** 中转次数；0=直飞（全站只允许 0） */
  stops?: number;
  /** 中转城市，如 "北京"；直飞时不填 */
  via?: string;
  /** 托运行李，如 "1件"/"2件"；无依据不填 */
  bags?: string;
  price: number;
  refundable: string; // "yes" | "no" | "not stated"
  changeable: string;
  recommend?: boolean;
  recommendReason?: string;
}

/** 3 段城际 + 15 段国际：去程西雅图→北京（2026-11-28）1 段、亚洲段 8 段（北京→新加坡、西安→新加坡、新加坡→普吉/西安、普吉→清迈、清迈→曼谷、曼谷→西安、西安→北京）、回程北京/上海/重庆→西雅图（2026-12-31、2027-01-01、2027-01-02）9 段。
 * 用户要求：全站只看直飞（options 仅保留 stops=0；库里确认无直飞的段 options 为空并标"暂无直飞"，库里没查到的标"待查询"）。 */
export const FLIGHT_LEGS: FlightLegInfo[] = [
  {
    id: "sea-pek",
    route: "西雅图 → 北京",
    date: "2026-11-28",
    dateLabel: "11-28",
    day: 0,
    kind: "intl",
    note: "去程国际段（一家三口）；Duffel 实查 2026-09-27 18:35 PDT（2大1小，当天仅1班直飞）",
    carrier: "Hainan Airlines HU496",
    schedule: "10:20→15:50+1",
    priceNote: "3人 $1,913.50 起",
    businessPriceNote: null,
    direct: true,
    fragile: true,
    queriedAt: "2026-09-27 18:35 PDT",
    priceBasis: "2大1小总价",
    options: [
      { carrier: "Hainan Airlines", flight: "HU496", depart: "10:20", arrive: "15:50", arrivePlusDay: true, stops: 0, bags: "2件", price: 1913.50, refundable: "yes", changeable: "yes", recommend: true, recommendReason: "当天唯一去程直飞；13h30m，白天出发、当地傍晚到；2件托运；可退改（有罚金），出票前重查退改" },
    ],
    businessOptions: null,
  },
  {
    id: "intl-out-bj",
    dbSeg: "PEK-SIN",
    ctx: "去程国际段（用户一家三口）",
    route: "北京 → 新加坡",
    date: "2026-12-06",
    dateLabel: "12-06",
    day: 1,
    kind: "intl",
    note: "Google Flights 实查 2026-10-03 06:29 PDT（2大1小，6 班直飞，全部价格本轮详情页确认）：国航 CA975 00:15→06:50 红眼 3 人整单 $514 为全场最低；白天班 CA889 09:45→16:15 $525（上一轮 $518，+1.4%）；新航价格全部确认：SQ805 $562、SQ801 $678、SQ807 $1,184；商务舱 6 班全部确认：国航 3 班 $3,055、新航 SQ805/801 $3,666、SQ807 $4,747；SQ5285 连续两轮未在结果中出现（疑为 SQ801 代码共享），已从选项移除",
    carrier: "Air China CA889",
    schedule: "09:45→16:15",
    priceNote: "3人 $514 起（CA975 红眼确认价；白天班 CA889 $525 仅贵 $11，带2岁娃更从容）",
    businessPriceNote: "3人 $3,055 起（国航 CA889/CA969/CA975 同价；本轮详情页确认 3 人整单总价）",
    direct: true,
    fragile: false,
    queriedAt: "2026-10-03 06:29 PDT（候选日期，待确认后重查）",
    priceBasis: "2大1小总价",
    options: [
      { carrier: "Air China", flight: "CA975", depart: "00:15", arrive: "06:50", stops: 0, bags: "待定", price: 514.00, refundable: "not stated", changeable: "not stated", recommendReason: "全场最低价（3人整单 $514，详情页确认）；但 00:15 红眼出发、06:50 凌晨抵达，带2岁娃半夜赶飞机太折腾，不推荐" },
      { carrier: "Air China", flight: "CA889", depart: "09:45", arrive: "16:15", stops: 0, bags: "待定", price: 525.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "本轮确认 3 人整单 $525（上一轮 $518，+1.4%）；09:45 出发、16:15 抵达，白天航班带2岁娃不折腾；只比红眼 CA975 贵 $11" },
      { carrier: "Singapore Airlines", flight: "SQ805", depart: "08:45", arrive: "15:20", stops: 0, bags: "待定", price: 562.00, refundable: "not stated", changeable: "not stated", recommendReason: "本轮确认 3 人整单 $562（上一轮 $640 为沿用值）；08:45 出发、15:20 抵达，白天航班；比国航 CA889 贵 $37" },
      { carrier: "Air China", flight: "CA969", depart: "15:35", arrive: "21:55", stops: 0, bags: "待定", price: 568.00, refundable: "not stated", changeable: "not stated", recommendReason: "本轮确认 3 人整单 $568（上一轮 $514 为沿用值）；15:35 出发、21:55 抵达" },
      { carrier: "Singapore Airlines", flight: "SQ801", depart: "00:10", arrive: "06:45", stops: 0, bags: "待定", price: 678.00, refundable: "not stated", changeable: "not stated", recommendReason: "本轮确认 3 人整单 $678（上一轮 $909 为沿用值）；00:10 红眼出发、06:45 凌晨抵达，带2岁娃太折腾，不推荐" },
      { carrier: "Singapore Airlines", flight: "SQ807", depart: "16:40", arrive: "22:55", stops: 0, bags: "待定", price: 1184.00, refundable: "not stated", changeable: "not stated", recommendReason: "本轮确认 3 人整单 $1,184（上一轮 $1,388 为沿用值）；16:40 出发、22:55 较晚抵达；价格最高，不推荐" },
    ],
    businessOptions: [
      { carrier: "Air China", flight: "CA889", depart: "09:45", arrive: "16:15", stops: 0, bags: "待定", price: 3055.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "同班商务舱；本轮确认 3 人整单 $3,055（上一轮 $3,041 为沿用值）；白天航班带2岁娃不折腾" },
      { carrier: "Air China", flight: "CA969", depart: "15:35", arrive: "21:55", stops: 0, bags: "待定", price: 3055.00, refundable: "not stated", changeable: "not stated", recommendReason: "同班商务舱；本轮确认 3 人整单 $3,055；15:35 出发" },
      { carrier: "Air China", flight: "CA975", depart: "00:15", arrive: "06:50", stops: 0, bags: "待定", price: 3055.00, refundable: "not stated", changeable: "not stated", recommendReason: "同班商务舱；本轮确认 3 人整单 $3,055；00:15 红眼" },
      { carrier: "Singapore Airlines", flight: "SQ805", depart: "08:45", arrive: "15:20", stops: 0, bags: "待定", price: 3666.00, refundable: "not stated", changeable: "not stated", recommendReason: "本轮确认 3 人整单 $3,666（上一轮 $3,644 为沿用值）；比国航贵 $611" },
      { carrier: "Singapore Airlines", flight: "SQ801", depart: "00:10", arrive: "06:45", stops: 0, bags: "待定", price: 3666.00, refundable: "not stated", changeable: "not stated", recommendReason: "本轮确认 3 人整单 $3,666；00:10 红眼" },
      { carrier: "Singapore Airlines", flight: "SQ807", depart: "16:40", arrive: "22:55", stops: 0, bags: "待定", price: 4747.00, refundable: "not stated", changeable: "not stated", recommendReason: "本轮确认 3 人整单 $4,747（上一轮 $4,785 为沿用值）；价格最高" },
    ],
  },
  {
    id: "intl-out",
    dbSeg: "XIY-SIN",
    ctx: "去程国际段（岳父母）",
    route: "西安 → 新加坡",
    date: "2026-12-06",
    dateLabel: "12-06",
    day: 1,
    kind: "intl",
    note: "Google Flights 实查 2026-10-03 06:29 PDT（2 成人，2 班直飞）：酷航 TR135 01:55→07:50 详情页确认 2 人整单 $384（与上一轮持平）；东航 MU2069 07:20→12:55 本轮详情页确认 2 人整单 $431（上一轮 $418 为沿用值，+$13）；商务舱 MU2069 本轮确认 2 人整单 $1,385（上一轮 $1,383 为沿用值）",
    carrier: "China Eastern MU2069",
    schedule: "07:20→12:55",
    priceNote: "2人 $384 起（酷航红眼确认价；东航白天班 $431 确认价，岳父母不用半夜赶飞机）",
    businessPriceNote: "2人 $1,385 起（东航 MU2069 07:20→12:55；本轮详情页确认 2 人整单总价；酷航为廉航无商务舱）",
    direct: true,
    fragile: true,
    queriedAt: "2026-10-03 06:29 PDT（候选日期，待确认后重查）",
    priceBasis: "2成人总价",
    options: [
      { carrier: "Scoot", flight: "TR135", depart: "01:55", arrive: "07:50", stops: 0, bags: "待定", price: 384.00, refundable: "not stated", changeable: "not stated", recommendReason: "详情页确认 2 人整单总价 $384（与上一轮持平）；但 01:55 红眼出发，老人半夜赶飞机太辛苦，不推荐" },
      { carrier: "China Eastern", flight: "MU2069", depart: "07:20", arrive: "12:55", stops: 0, bags: "待定", price: 431.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "白天航班，07:20出发、12:55抵达；岳父母不用半夜赶飞机，中午到新加坡下午从容入住；本轮确认 2 人整单 $431，只比红眼贵 $47" },
    ],
    businessOptions: [
      { carrier: "China Eastern", flight: "MU2069", depart: "07:20", arrive: "12:55", stops: 0, bags: "待定", price: 1385.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "东航白天班商务舱，岳父母飞得舒服；本轮确认 2 人整单 $1,385" },
    ],
  },
  {
    id: "sin-hkt",
    dbSeg: "SIN-HKT",
    ctx: "D5 转场：新加坡段结束、普吉段开始",
    route: "新加坡 → 普吉",
    date: "2026-12-10",
    dateLabel: "12-10",
    day: 5,
    kind: "intercity",
    note: "D5 转场：新加坡段结束、普吉段开始",
    carrier: null,
    schedule: null,
    priceNote: null,
    businessPriceNote: null,
    direct: null,
    queriedAt: null,
    priceBasis: null,
    options: null,
    businessOptions: null,
    fragile: false,
  },
  {
    id: "sin-xiy",
    dbSeg: "SIN-XIY",
    ctx: "D5：新加坡段结束，岳父母带娃回西安",
    route: "新加坡 → 西安",
    date: "2026-12-10",
    dateLabel: "12-10",
    day: 5,
    kind: "intl",
    note: "D5：新加坡段结束，岳父母带娃回西安",
    carrier: null,
    schedule: null,
    priceNote: null,
    businessPriceNote: null,
    direct: null,
    queriedAt: null,
    priceBasis: null,
    options: null,
    businessOptions: null,
    fragile: true,
  },
  {
    id: "hkt-cnx",
    dbSeg: "HKT-CNX",
    ctx: "D8 转场：普吉段结束、清迈段开始",
    route: "普吉 → 清迈",
    date: "2026-12-13",
    dateLabel: "12-13",
    day: 8,
    kind: "intercity",
    note: "D8 转场：普吉段结束、清迈段开始",
    carrier: null,
    schedule: null,
    priceNote: null,
    businessPriceNote: null,
    direct: null,
    queriedAt: null,
    priceBasis: null,
    options: null,
    businessOptions: null,
    fragile: false,
  },
  {
    id: "cnx-bkk",
    dbSeg: "CNX-BKK",
    ctx: "D10 转场：清迈段结束、曼谷段开始",
    route: "清迈 → 曼谷",
    date: "2026-12-15",
    dateLabel: "12-15",
    day: 10,
    kind: "intercity",
    note: "D10 转场：清迈段结束、曼谷段开始",
    carrier: null,
    schedule: null,
    priceNote: null,
    businessPriceNote: null,
    direct: null,
    queriedAt: null,
    priceBasis: null,
    options: null,
    businessOptions: null,
    fragile: false,
  },
  {
    id: "bkk-xiy",
    dbSeg: "BKK-XIY",
    ctx: "D13：曼谷段结束，夫妻回西安",
    route: "曼谷 → 西安",
    date: "2026-12-18",
    dateLabel: "12-18",
    day: 13,
    kind: "intl",
    note: "D13：曼谷段结束，夫妻回西安；Google Flights 实查，只保留直飞",
    carrier: "Spring Airlines",
    schedule: "14:05 BKK → 19:00 XIY",
    priceNote: "270 USD（2成人总价）",
    businessPriceNote: "无商务舱直飞",
    direct: true,
    queriedAt: "2026-10-03 12:17 PDT",
    priceBasis: "2成人总价",
    options: [
      { carrier: "Spring Airlines", flight: "9C6294", depart: "14:05", arrive: "19:00", arrivePlusDay: false, stops: 0, bags: "待定", price: 270, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天唯一去程直飞；白天出发、同日19:00到达，无红眼；与上一轮价格持平（270 USD/2成人总价）" },
    ],
    businessOptions: [],
    fragile: true,
  },
  {
    id: "pek-icn",
    dbSeg: "PEK-ICN",
    ctx: "回程：用户一人北京→首尔（1成人），与老婆孩子在首尔会合",
    route: "北京 → 首尔",
    date: "2026-12-31",
    dateLabel: "12-31",
    day: 17,
    kind: "intl",
    note: "回程第一段：用户一人北京→首尔（1成人）；Google Flights 实查，只查直飞",
    carrier: null,
    schedule: null,
    priceNote: null,
    businessPriceNote: null,
    direct: true,
    fragile: false,
    queriedAt: null,
    priceBasis: "1成人总价",
    options: null,
    businessOptions: null,
  },
  {
    id: "xiy-icn",
    dbSeg: "XIY-ICN",
    ctx: "回程：老婆带Dylan西安→首尔（1大1小），与用户在首尔会合",
    route: "西安 → 首尔",
    date: "2026-12-31",
    dateLabel: "12-31",
    day: 17,
    kind: "intl",
    note: "回程第一段：老婆带Dylan西安→首尔（1大1小）；Google Flights 实查，只查直飞",
    carrier: null,
    schedule: null,
    priceNote: null,
    businessPriceNote: null,
    direct: true,
    fragile: false,
    queriedAt: null,
    priceBasis: "1大1小总价",
    options: null,
    businessOptions: null,
  },
  {
    id: "icn-sea",
    dbSeg: "ICN-SEA",
    ctx: "回程：三人一起首尔→西雅图（2大1小），直飞+一次转机都查",
    route: "首尔 → 西雅图",
    date: "2027-01-01",
    dateLabel: "01-01",
    day: 19,
    kind: "intl",
    note: "✅ 已出票：Alaska Airlines AS120，确认号 CNESXC；2027-01-01 20:00 首尔仁川起飞 → 当天 12:55 到西雅图（2大1小）；以出票邮件为准，日期不许改",
    carrier: "Alaska Airlines",
    schedule: "AS120 20:00 → 12:55",
    priceNote: null,
    businessPriceNote: null,
    direct: true,
    fragile: false,
    queriedAt: null,
    priceBasis: "2大1小总价",
    options: null,
    businessOptions: null,
  },
];

/* ============ 预订页航班统一读 Google Flights 航班库 ============
 * 唯一真实来源：client/src/data/flight-db-december-2026.json（每小时 cron 实查，只含直飞）。
 * - 库里有该 (航段,日期) → 用库的直飞数据覆盖 options/businessOptions/价格/口径/实查时间；
 * - 库里没有 → 保留本文件静态直飞选项兜底（已过滤中转），等 cron 填库后自动接管；
 * - 中转选项一律删除（只看直飞是用户铁律）。
 * 航司名用英文全名（CARRIER_REPUTATION 按英文前缀匹配，中文名/短名会降级）。 */

/** 库里航司短名 → 英文全名 */
const CARRIER_FULLNAME: Record<string, string> = {
  "Hainan": "Hainan Airlines",
  "Delta": "Delta Air Lines",
};

interface FlightDbFlight {
  airline: string; flight: string | null; dep: string; arr: string;
  duration?: string; price_usd?: number | null; business_price_usd?: number | null;
}
interface FlightDbDay {
  economy_usd?: number | null; business_usd?: number | null;
  economy_price_basis?: string; business_price_basis?: string;
  economy_queried_at?: string; business_queried_at?: string;
  nonstop_flights?: FlightDbFlight[];
}

function flightDbDay(seg: string, date: string): FlightDbDay | null {
  const segs = (flightDbJson as { segments?: Record<string, { days?: Record<string, FlightDbDay> }> }).segments;
  return segs?.[seg]?.days?.[date] ?? null;
}

/**
 * 行动安排页：收藏航班的实时价格重查（2026-10-03 用户：收藏后价格涨跌要能追踪，什么时候该买）。
 * 按（航段代码，日期，航班号）在 Google Flights 航班库里找最新实查价；
 * 找不到精确匹配返回 null，调用方回退显示收藏快照。
 */
export interface LiveFlightQuote {
  price: number | null;
  bizPrice: number | null;
  queriedAt: string; // "YYYY-MM-DD HH:MM PDT"
  carrier: string;
  depart: string;
  arrive: string;
}
export function liveFlightQuote(dbSeg: string, date: string, flightNo: string): LiveFlightQuote | null {
  if (!dbSeg || !date || !flightNo) return null;
  const day = flightDbDay(dbSeg, date);
  if (!day) return null;
  const f = (day.nonstop_flights || []).find((x) => (x.flight ?? "").trim() === flightNo.trim());
  if (!f) return null;
  const arrRaw = String(f.arr || "");
  return {
    price: f.price_usd ?? null,
    bizPrice: f.business_price_usd ?? null,
    queriedAt: toPDT(day.economy_queried_at || day.business_queried_at || ""),
    carrier: fullCarrier(f.airline || ""),
    depart: f.dep || "",
    arrive: arrRaw.replace("+1", "").trim(),
  };
}

/** ISO UTC → "YYYY-MM-DD HH:MM PDT" */
function toPDT(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const t = new Date(d.getTime() - 7 * 3600 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${t.getUTCFullYear()}-${p(t.getUTCMonth() + 1)}-${p(t.getUTCDate())} ${p(t.getUTCHours())}:${p(t.getUTCMinutes())} PDT`;
}

function fmtUSD(x: number): string {
  return Number.isInteger(x) ? `$${x}` : `$${x.toFixed(2)}`;
}
function basisToPax(basis: string): string {
  if (basis.includes("2大1小")) return "3人";
  if (basis.includes("2成人")) return "2人";
  return "";
}
function fullCarrier(short: string): string {
  return CARRIER_FULLNAME[short] || short;
}

function dbFlightOption(f: FlightDbFlight, cabin: "eco" | "biz"): FlightOption | null {
  const price = cabin === "eco" ? f.price_usd : f.business_price_usd;
  if (price == null) return null;
  const arrRaw = String(f.arr || "");
  const plusDay = arrRaw.includes("+1");
  return {
    carrier: fullCarrier(f.airline),
    flight: f.flight ?? '',
    depart: f.dep,
    arrive: arrRaw.replace("+1", "").trim(),
    arrivePlusDay: plusDay || undefined,
    stops: 0,
    price,
    refundable: "not stated",
    changeable: "not stated",
  };
}

/**
 * 按指定日期（或 leg 自带日期）把航班库数据灌进一条 leg。
 * 2026-10-03 新增 dateOverride：预订页按行程规划算出转场日期后，用正确的日期重查库，
 * 解决"行程改了但航班日期/价格还停留在旧写死日期"的问题。
 */
export function refreshLegFromDb(leg: FlightLegInfo, dateOverride?: string): void {
    // 先删中转：只保留 stops===0（全站铁律）
    if (leg.options) leg.options = leg.options.filter((o) => (o.stops ?? 0) === 0);
    if (leg.businessOptions) leg.businessOptions = leg.businessOptions.filter((o) => (o.stops ?? 0) === 0);

    const seg = leg.dbSeg;
    const date = dateOverride ?? leg.date;
    if (dateOverride && dateOverride !== leg.date) {
      leg.date = dateOverride;
      leg.dateLabel = dateOverride.slice(5).replace("-", "-");
    }
    if (!seg || !date) {
      // 不在库覆盖范围（如去程 SEA-PEK）：静态直飞即全部
      leg.flightState = leg.options && leg.options.length > 0 ? "ok" : "pending";
      return;
    }
    const day = flightDbDay(seg, date);
    if (!day) {
      // 库里还没查到该日期：静态直飞兜底，等 cron 填库后自动接管
      if (leg.options && leg.options.length > 0) {
        leg.flightState = "ok";
      } else if (leg.direct === false) {
        leg.flightState = "none"; // 静态实查已确认无直飞：价格/航司等字段全部清空，不留中转残留
        leg.priceNote = null;
        leg.businessPriceNote = null;
        leg.carrier = null;
        leg.schedule = null;
      } else {
        leg.flightState = "pending";
        leg.options = null;
        leg.businessOptions = null;
      }
      return;
    }
    /* 新旧倒挂保护（2026-09-28 site-improve 口径②）：库里该 (航段,日期) 的实查时间若早于
       本文件静态实查（flight-refresh-daily-b 写入的更新 Google Flights 数据），则不覆盖——
       保留更新的静态数据（已在循环开头过滤中转），等 flight-db-gflights-fill 重查该日期后库自动接管。
       比较口径：双方统一转 "YYYY-MM-DD HH:MM"（PDT）字符串比较。 */
    const dbQueriedPdt = toPDT(day.economy_queried_at || day.business_queried_at || "").slice(0, 16);
    const staticQueriedPdt = (leg.queriedAt || "").slice(0, 16);
    if (dbQueriedPdt && staticQueriedPdt && staticQueriedPdt > dbQueriedPdt) {
      leg.flightState = leg.options && leg.options.length > 0 ? "ok" : "pending";
      return;
    }
    const nf = day.nonstop_flights || [];
    const queriedAt = toPDT(day.economy_queried_at || day.business_queried_at || "");
    const basis = day.economy_price_basis || day.business_price_basis || "";
    const pax = basisToPax(basis);
    const ctx = leg.ctx || leg.route;

    if (nf.length === 0) {
      // 库实查确认当天无直飞
      leg.options = [];
      leg.businessOptions = [];
      leg.direct = false;
      leg.flightState = "none";
      leg.carrier = null;
      leg.schedule = null;
      leg.priceNote = null;
      leg.businessPriceNote = null;
      leg.queriedAt = queriedAt || null;
      leg.priceBasis = basis || null;
      leg.note = `${ctx}；Google Flights 实查${queriedAt ? ` ${queriedAt}` : ""}确认当天无直飞${basis ? `（${basis}）` : ""}。`;
      return;
    }

    const ecoOpts = nf.map((f) => dbFlightOption(f, "eco")).filter((o): o is FlightOption => !!o);
    const bizOpts = nf.map((f) => dbFlightOption(f, "biz")).filter((o): o is FlightOption => !!o);
    if (ecoOpts.length > 0) {
      const cheapest = ecoOpts.reduce((a, b) => (b.price < a.price ? b : a));
      cheapest.recommend = true;
      cheapest.recommendReason = "当天直飞最低价";
    } else if (bizOpts.length > 0) {
      const cheapest = bizOpts.reduce((a, b) => (b.price < a.price ? b : a));
      cheapest.recommend = true;
      cheapest.recommendReason = "当天唯一直飞（商务舱）";
    }
    const carrierSummary = (() => {
      const m = new Map<string, number>();
      for (const f of nf) { const c = fullCarrier(f.airline); m.set(c, (m.get(c) || 0) + 1); }
      return [...m.entries()].map(([c, n]) => `${c}×${n}`).join("、");
    })();

    leg.options = ecoOpts;
    leg.businessOptions = bizOpts;
    leg.direct = true;
    leg.flightState = "ok";
    leg.priceBasis = basis || null;
    leg.queriedAt = queriedAt || null;
    leg.priceNote = ecoOpts.length > 0
      ? `${pax ? pax + " " : ""}${fmtUSD(day.economy_usd ?? Math.min(...ecoOpts.map((o) => o.price)))} 起`
      : null;
    leg.businessPriceNote = bizOpts.length > 0
      ? `${pax ? pax + " " : ""}${fmtUSD(day.business_usd ?? Math.min(...bizOpts.map((o) => o.price)))} 起`
      : null;
    const rec = ecoOpts.find((o) => o.recommend) || ecoOpts[0] || bizOpts[0] || null;
    if (rec) {
      leg.carrier = `${rec.carrier} ${rec.flight}`;
      leg.schedule = `${rec.depart}→${rec.arrive}${rec.arrivePlusDay ? "+1" : ""}`;
    } else {
      leg.carrier = null;
      leg.schedule = null;
    }
    leg.note = `${ctx}；Google Flights 实查${queriedAt ? ` ${queriedAt}` : ""}（${basis}，当天${nf.length}班直飞：${carrierSummary}）。`;
}

function applyFlightDb(): void {
  for (const leg of FLIGHT_LEGS) refreshLegFromDb(leg);
}
applyFlightDb();

/** 需提前购票的景点（研究结论驱动；空 = 尚无研究结论支撑的项目，不编造）。 */
export interface AdvanceTicket {
  name: string;
  city: string;
  day?: number;
  /** must = 必须提前订（限流/预约制），recommended = 建议提前订（旺季紧张） */
  level: "must" | "recommended";
  reason: string;
  /** 官方购票/预订链接：curl 实测可达才填，验不到的不填 */
  ticketUrl?: string;
  /** 购票渠道说明，如"官网预订"、"Klook 搜一日游" */
  channel?: string;
}
export const ADVANCE_TICKETS: AdvanceTicket[] = [
  { name: "大象自然公园", city: "清迈", level: "must", reason: "限流预约制道德大象营，只接受官网预订、不能自行前往，每日名额有限，旺季提前 1–2 个月售罄", ticketUrl: "https://www.elephantnaturepark.org", channel: "官网预订（只接受官网预订）" },
  { name: "Phuket Elephant Sanctuary", city: "普吉", level: "must", reason: "限流预约制道德大象营，必须官网提前预订，每日名额有限", ticketUrl: "https://www.phuketelephantsanctuary.org", channel: "官网预订" },
  { name: "湄南河游船", city: "曼谷", level: "recommended", reason: "12 月旺季晚餐游船好座位/班次售罄快；郑王庙本身可现场买", channel: "Klook / GetYourGuide 搜湄南河晚餐游船（含酒店接送）" },
  { name: "大城府 Ayutthaya 古城遗迹", city: "曼谷", level: "recommended", reason: "遗迹分散建议报一日游/包车，旺季英文团与包车司机紧张，建议提前 1–2 周", channel: "Klook 搜大城府一日游 / 当地包车" },
  { name: "丹嫩沙多水上市场+美功铁道", city: "曼谷", level: "recommended", reason: "拼团一日游（含接送），早市+铁道火车时刻固定、拼团名额有限，建议尽早订", channel: "Klook 搜水上市场+美功铁道一日游" },
  { name: "因他农国家公园", city: "清迈", level: "recommended", reason: "建议报一日游/包车，旺季英文小团与包车紧张，建议提前 1–2 周", channel: "Klook 搜因他农国家公园一日游 / 包车" },
  { name: "攀牙湾", city: "普吉", level: "recommended", reason: "快艇出海一日游，好评船司与小团名额有限，12 月旺季紧张", channel: "Klook 搜攀牙湾一日游（选好评小团）" },
  { name: "皮皮岛", city: "普吉", level: "recommended", reason: "出海一日游，12 月旺季好评船司与小团名额有限", channel: "Klook 搜皮皮岛一日游（选早班小团）" },
  { name: "Siam Niramit", city: "普吉", level: "recommended", reason: "大型文化演出，好座位先售罄，建议提前 1–2 周锁座", ticketUrl: "https://www.siamniramitphuket.com", channel: "官网订票" },
  { name: "Singapore Oceanarium", city: "新加坡", level: "recommended", reason: "圣诞新年家庭客流大，建议提前网上购票", ticketUrl: "https://www.rwsentosa.com", channel: "圣淘沙名胜世界官网" },
  { name: "滨海湾花园", city: "新加坡", level: "recommended", reason: "户外免费，但双穹顶（Cloud Forest + Flower Dome）+ OCBC 步道票建议提前网上买", ticketUrl: "https://www.gardensbythebay.com.sg", channel: "官网购票（双穹顶 + OCBC 步道）" },
  { name: "环球影城", city: "新加坡", level: "recommended", reason: "圣诞新年旺季限流+票价浮动，门票按日限量，建议提前 1–2 周网上购票", ticketUrl: "https://www.rwsentosa.com", channel: "圣淘沙名胜世界官网" },
  { name: "新加坡动物园与Bird Paradise", city: "新加坡", level: "recommended", reason: "圣诞家庭客流大，建议提前网上购票（多园联票更划算）", ticketUrl: "https://www.mandai.com/en.html", channel: "Mandai 官网（多园联票更划算）" },
  { name: "夜间动物园", city: "新加坡", level: "recommended", reason: "圣诞家庭客流大，建议提前网上购票（多园联票更划算）", ticketUrl: "https://www.mandai.com/en.html", channel: "Mandai 官网" },
  { name: "新加坡河游船", city: "新加坡", level: "recommended", reason: "克拉码头 Bumboat，日落班次最抢手，建议提前订", ticketUrl: "https://www.waterb.com.sg", channel: "官网订票（日落班次最抢手）" },
  { name: "ArtScience Museum", city: "新加坡", level: "recommended", reason: "常设展+特展票建议提前网上买（teamLab 常设展孩子喜欢）", channel: "Marina Bay Sands 官网 / 现场购票" },
  { name: "圣淘沙海滩", city: "新加坡", level: "recommended", reason: "圣淘沙免费进岛；Skyline Luge 滑车票建议提前买（2 岁半只能坐双人车/同乘 Skyride，以官方身高规则为准）", channel: "Skyline Luge 官网 / 圣淘沙现场购票" },
];

export const GROUP_META: Record<
  BookByGroup,
  { title: string; hint: string; dot: string }
> = {
  now: {
    title: "🔴 现在就锁",
    hint: "机票越晚越贵、好时段先没；国际段先占位比价",
    dot: "bg-rose-500",
  },
  d60: {
    title: "🟡 提前 60 天 · 酒店",
    hint: "10 月中旬前：每城锁定 1 家，圣诞季好房先没",
    dot: "bg-amber-500",
  },
  d30: {
    title: "🟠 提前 30 天 · 必须订位的餐厅",
    hint: "11 月中旬前：米其林与热门 fine dining 放位即抢",
    dot: "bg-orange-500",
  },
  d14: {
    title: "🔵 提前 14 天 · 建议订位 / 购票",
    hint: "11 月底前：热门餐厅建议订位、热门景点提前购票",
    dot: "bg-sky-500",
  },
  local: {
    title: "⚪ 当地解决",
    hint: "无需提前操作，当天前往或现场排队",
    dot: "bg-gray-300",
  },
};
