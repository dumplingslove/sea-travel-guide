/**
 * /bookings 预订行动时间线：东南亚段 2026-12-07 ～ 12-19（云端行程 2026-10-12 23:49Z 更新为准）
 * 新加坡 12/07–12/11 → 普吉 12/12–12/15 → 清迈 12/16–12/18 → 曼谷 12/19（仅 1 晚，12/20 转场）。
 * （2026-09-30 site-improve：HOTEL_STAYS 曾写旧行程 12-12～12-24 与旧城市顺序曼谷→清迈，
 *  与云端规划/航班转场段/酒店实时价格日期全部错位，已按当前行程修正。）
 *
 * 组织原则（对标 Google Travel / Booking.com / Trip.com）：
 * 按"最晚行动时间"排，不是按"酒店/餐厅/景点"分类堆。
 * 行动（时间线）/ 参考（城市明细）/ 记录（我的预订）三层各司其职。
 *
 * 航班数据：统一读 Google Flights 航班库（现存 Supabase sea_guide_datasets 的 flight_db 数据集，
 * 经 lib/datasets.ts 的 getDataset 读取；内嵌 JSON 文件已于 2026-10-13 删除），
 * 本文件底部的 applyFlightDb() 在数据集到达时把库数据灌进 FLIGHT_LEGS；
 * 只看直飞，中转选项一律不保留。
 */
import { getDataset, onDataset } from "../lib/datasets";

/** 行程规划的城市分段（与 guide/GuideApp.tsx 的 PlanCityScope 同形，避免循环引用） */
export interface PlanSegment { city: string; start: string; end: string; days: number; segId?: string; }

/**
 * 城际转场航班的出发日期。
 * 2026-10-03 用户：改了大行程后航班日期要跟着变，不许写死。
 * 2026-10-05 修：云端 schedule 按到达口径标注（转场日记在到达城市名下，
 * 如 12/11 记在普吉名下），航班日 = 到达城市段的第一天。
 * 旧规则“出发城市最后一天”在该口径下会少算一天（如 SIN→HKT 算出 12-10，
 * 实际 12-11），且与写死的旧日期错得一样，导致自动纠正永远触发不了。
 * 目的城市在行程里只出现一次，按目的地匹配无歧义（原 ROUTE_DATE_MAP 不再需要）。
 */
export function flightDateFromPlan(route: string, segments: PlanSegment[]): string | null {
  if (route === "西雅图 → 北京") {
    /* 跨太平洋去程段：起飞日（11-28）是北京段首日（抵达日 11-29）的前一天。
     * 完整行程链里目的地「北京」第一段就是 beijing1，按目的地通用规则会误取
     * 段首日、把起飞日推晚一天（2026-10-14 site-improve 实测复现）。返回 null
     * 保留静态/时间线日期——本段日期已由 applyPlanTimeline 按 timeline.legs 定死。 */
    return null;
  }
  if (route === "新加坡 → 西安") {
    /* 岳父母带娃回西安：跟夫妻同一天离开新加坡 = 新加坡段结束的次日（即下一段的第一天） */
    const idx = segments.findIndex((s) => s.city === "新加坡");
    const next = idx >= 0 ? segments[idx + 1] : undefined;
    return next ? next.start : null;
  }
  if (route === "曼谷 → 北京") {
    /* 2026-10-13 分开行动：用户一人曼谷→北京，目的地是 split 段的北京，
     * 不是行程开头的北京1段——按城市名 find 会命中 beijing1 首段、日期差一个多月。
     * 优先按 segId=split-beijing 取起点；无 segId 的旧调用方退回取最后一个北京段。 */
    const split = segments.find((s) => s.segId === "split-beijing");
    if (split) return split.start;
    const last = [...segments].reverse().find((s) => s.city === "北京");
    return last ? last.start : null;
  }
  const dest = route.split("→")[1]?.trim();
  if (!dest) return null;
  const seg = segments.find((s) => s.city === dest);
  return seg ? seg.start : null;
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
  // 2026-10-05 修：与 schedule 到达口径一致——入住=本段第一天，退房=下一段第一天（转场航班日）
  // 2026-10-14 修：GuideApp 按云端 schedule 拼的段表里，曼谷段与首尔段之间隔着不在
  // schedule 里的分开行动 10 天（12-20–12-29），直接取下一段首日会把曼谷退房日算成
  // 12-30（11 晚）；且平行段（分开行动北京/西安同起）会算出 0 晚。与 hotelStaysFromPlan
  // 同口径：取其后第一个更晚开始的段；其首日若晚于本段末日次日（段间有空档），
  // 退房日 = 本段末日次日（离开本城的转场日）。
  const next = segments.slice(idx + 1).find((s) => s.start > seg.start);
  if (!next) return [seg.start, seg.end];
  const dayAfterEnd = new Date(new Date(seg.end).getTime() + 86400000).toISOString().slice(0, 10);
  return [seg.start, next.start > dayAfterEnd ? dayAfterEnd : next.start];
}

export interface HotelStay {
  city: string;
  /** 入住 YYYY-MM-DD（到达当天） */
  checkIn: string;
  /** 退房 YYYY-MM-DD（离境航班当天） */
  checkOut: string;
  nights: number;
  /** 已预订（2026-10-03 用户要求）：以酒店确认邮件为准，特殊标注 */
  booked?: boolean;
  /** 预订确认号 */
  confirmationCode?: string;
  /** 已预订的酒店名 */
  bookedHotelName?: string;
}

/** planner 读不到时的酒店住宿兜底（与当前行程一致；planner 能读到时一律按 planner 推导，不许写死覆盖） */
export const FALLBACK_STAYS: HotelStay[] = [
  { city: "新加坡", checkIn: "2026-12-06", checkOut: "2026-12-11", nights: 5 },
  { city: "普吉", checkIn: "2026-12-11", checkOut: "2026-12-15", nights: 4 },
  { city: "清迈", checkIn: "2026-12-15", checkOut: "2026-12-18", nights: 3 },
  { city: "曼谷", checkIn: "2026-12-18", checkOut: "2026-12-20", nights: 2 },
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
    // 2026-10-05 修：与 schedule 到达口径一致——入住=本段第一天（到达当天），
    // 退房=下一段第一天（即转场航班日，当天退房当天飞）；最后一段退房=段末日。
    // 2026-10-13 修：分开行动段是平行段（西安/北京同起同止），退房要取后面第一个
    // 真正更晚开始的段（首尔），否则平行段会算出 0 晚。
    // 2026-10-14 修（与 hotelStayFromPlan 单城版同口径）：调用方只给 schedule 段表时，
    // 曼谷段与首尔段之间隔着不在 schedule 里的分开行动 10 天，直接取下一段首日会把
    // 曼谷退房算成 12-30（11 晚）；下一段首日晚于本段末日次日（段间有空档）时，
    // 退房 = 本段末日次日（离开本城的转场日）。完整链调用方下一段首日即末日次日，不受影响。
    const checkIn = seg.start;
    const next = segments.slice(idx + 1).find((s) => s.start > seg.start);
    const dayAfterEnd = new Date(new Date(seg.end).getTime() + 86400000).toISOString().slice(0, 10);
    const checkOut = next ? (next.start > dayAfterEnd ? dayAfterEnd : next.start) : seg.end;
    return {
      city: seg.city,
      checkIn,
      checkOut,
      nights: Math.max(0, days(checkIn, checkOut)),
    };
  });
}

/**
 * 完整大行程时间线（2026-10-03 用户：改了大行程后航班日期要跟着变）。
 * 输入：云端 schedule 城市段（新加坡+东南亚城市+首尔，16 天；首尔段在链里
 * 位于分开行动之后，函数内先摘出再回插链尾，见函数内 2026-10-14 修注）、
 * 大行程各段天数（云端 plan.trip，原始保存值——调用方传的是未归一化的 trip）。
 * 输出：北京1 → 新加坡 → 东南亚城市 → 分开行动（西安‖北京，平行） → 首尔 全链条。
 * 链条逻辑：beijing1 紧贴新加坡之前；分开行动紧贴东南亚最后城市之后；
 * 首尔紧贴分开行动之后。
 * 2026-10-13 行程改版（用户）：东南亚结束后从曼谷分开——用户一人飞北京、
 * 老婆一人飞西安（Dylan 已随岳父母从新加坡回西安），两边同住 split 天后同日飞首尔汇合。旧串联模型
 * （西安→北京3 两段）已废除；planner 保存的 trip 只有 split、没有
 * xian/beijing3，本函数此前仍按旧键读数，新保存下整条尾巴（西安/北京/首尔）
 * 会全部丢失——航班日期推导（曼谷→西安、北京/西安→首尔）与曼谷退房日随之失效。
 * 旧保存兼容：没有 split 时 split = xian + beijing3（与 plannerSchedule
 * normalizeTripDays 同口径），总时长与首尔日期与旧串联模型逐日一致。
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
  /* 2026-10-14 site-improve 修：云端 schedule（16 天）含首尔段（timeline 的
   * singapore/couple/seoul 三段都在 schedule 里），首尔在行程链里位于分开行动
   * 之后、不是东南亚段的末段。此前直接拿 seaSegments 末段当 lastSea，分开行动
   * 被推到首尔段之后（2027-01-02 起、整链多出一段假首尔 01-12 起），连带
   * 曼谷→西安/曼谷→北京的航班日期与 day 全错、曼谷住宿被算成 11 晚。
   * 现先把首尔段摘出：东南亚链以最后一个非首尔段（曼谷）收尾，分开行动接其后，
   * 首尔段以 schedule 原日期回插到链尾（无首尔段时才按 tripDays.seoul 合成）。 */
  const seoulSeg = seaSegments.find((s) => s.city === "首尔");
  const seaOnly = seaSegments.filter((s) => s.city !== "首尔");
  const lastSea = seaOnly[seaOnly.length - 1] ?? seaSegments[seaSegments.length - 1]!;
  const out: PlanSegment[] = [];

  /* 北京1段：新加坡开始前一天结束 */
  if (sg && tripDays.beijing1) {
    const end = addDays(sg.start, -1);
    const start = addDays(end, -(tripDays.beijing1 - 1));
    out.push({ segId: "beijing1", city: "北京", start, end, days: tripDays.beijing1 });
  }
  /* 新加坡 + 东南亚城市（带 segId；首尔段已摘出、链尾回插） */
  for (const s of seaOnly) {
    const segId = s.city === "新加坡" ? "singapore" : undefined;
    out.push(segId ? { ...s, segId } : s);
  }
  /* 分开行动段：东南亚最后城市后一天开始，用户在北京、老婆一人在西安（Dylan 已随岳父母先回西安），
   * 两段平行同起同止（同一时间窗，不是先后串联）。两个城市都要成段：
   * flightDateFromPlan 按目的地城市找段（曼谷→西安取西安段起点、北京/西安→首尔取首尔段起点）。 */
  const splitDays =
    typeof tripDays.split === "number" && tripDays.split >= 1
      ? tripDays.split
      : (typeof tripDays.xian === "number" ? tripDays.xian : 0) +
        (typeof tripDays.beijing3 === "number" ? tripDays.beijing3 : 0);
  if (splitDays >= 1) {
    const start = addDays(lastSea.end, 1);
    const end = addDays(start, splitDays - 1);
    out.push({ segId: "split-xian", city: "西安", start, end, days: splitDays });
    out.push({ segId: "split-beijing", city: "北京", start, end, days: splitDays });
    /* 首尔段：分开行动后一天开始（全家已在西安汇合、同日一起飞首尔）。
     * schedule 已含首尔段时用其原日期（与 timeline 逐日一致，12-30 起 3 天）；
     * 只有旧规划 schedule 没有首尔段时，才按 tripDays.seoul 在分开行动后合成。 */
    if (seoulSeg) {
      out.push({ ...seoulSeg, segId: "seoul" });
    } else if (tripDays.seoul) {
      const seStart = addDays(end, 1);
      const seEnd = addDays(seStart, tripDays.seoul - 1);
      out.push({ segId: "seoul", city: "首尔", start: seStart, end: seEnd, days: tripDays.seoul });
    }
  } else if (seoulSeg) {
    /* 无分开行动段时首尔段也不能丢（西安→首尔等转场日期靠它推导） */
    out.push({ ...seoulSeg, segId: "seoul" });
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
  /** 旧方案停更标记（2026-09-29 曾定回程北京→首尔，该口径已随 2026-10-13 回程改版废除：
   *  现行回程 = 分开行动最后一天高铁北京→西安汇合、全家一起西安→首尔（住 2 晚）→西雅图；
   *  FLIGHT_LEGS 现无 stale 段，本字段保留给将来旧方案候选使用。
   *  标记后渲染层显示诚实提示，价格横幅不再计入其最低价。 */
  stale?: boolean;
  /** 写进 note 的固定上下文（不受库刷新影响的部分） */
  ctx?: string;
  /** ok=有直飞 / none=实查确认无直飞 / pending=待查询；由 applyFlightDb() 维护 */
  flightState?: "ok" | "none" | "pending";
  /** 已出票（2026-10-03 用户铁律）：以出票邮件为准，日期/航班号/确认号绝不被
   *  航班库实查覆盖；refreshLegFromDb() 直接跳过（只过滤中转）。 */
  ticketed?: boolean;
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
  /** 真实飞行时长（分钟，航班库 Google Flights 原值，已含时区换算）；
   * 展示时长优先用它，不许再拿起降钟面差冒充（跨时区会差 ±1h，2026-10-17 实祸） */
  durationMins?: number;
  /** 起降机场代码（航班库全机场重查后才有）：多机场城市区分 PKX 大兴 / DMK 廊曼等 */
  depAirport?: string;
  arrAirport?: string;
  /** 中转次数；0=直飞（全站只允许 0） */
  stops?: number;
  /** 中转城市，如 "北京"；直飞时不填 */
  via?: string;
  /** 托运行李，如 "1件"/"2件"；无依据不填 */
  bags?: string;
  /** 价格（整单总价口径见 leg.priceBasis）；null = Google Flights 未显示价（「查询价格」）——
   * 航班本身真实存在，必须照样列出并标「价格待查」，不许因无价把航班吞掉
   * （2026-10-17 用户抓包：国航 3 班被吞，含 CA969/MU2069/MU2070 同类风险） */
  price: number | null;
  refundable: string; // "yes" | "no" | "not stated"
  changeable: string;
  recommend?: boolean;
  recommendReason?: string;
}

/** 11 段：去程西雅图→北京（2026-11-28，已出票 HU496）1 段、亚洲段 8 段（北京→新加坡、西安→新加坡、新加坡→普吉/西安、普吉→清迈、清迈→曼谷、曼谷→西安、曼谷→北京）、回程 2 段（西安→首尔、首尔→西雅图已出票）。
 * 2026-10-02 回程定死经首尔后旧 9 段回程候选已移除；2026-10-04 起全量以本数组为准；
 * 2026-10-13 行程改版（曼谷后分开行动）新增曼谷→北京段（用户一人，flight-db 已有 BKK-PEK 实查）；
 * 同日回程再改：不再分两路飞首尔——分开行动最后一天高铁 北京→西安汇合（非航班段、不入本数组）、
 * 全家一起西安→首尔，旧「北京→首尔」航班段已移除。
 * day/ctx 的 D 天数口径（2026-10-13 site-improve 订正）：以大行程第一段首日 2026-11-29 为 Day 1
 * （11-28 去程航班日为 Day 0），与 GuideApp/BookingTimeline 运行时按 firstStart 重算的口径一致；
 * 此前静态值多为旧行程残留（icn-sea 曾写 Day 19、cnx-bkk 曾写 D19），已按现行日期逐段重算。
 * 用户要求：全站只看直飞（options 仅保留 stops=0；库里确认无直飞的段 options 为空并标"暂无直飞"，库里没查到的标"待查询"）。 */
export const FLIGHT_LEGS: FlightLegInfo[] = [
  {
    id: "sea-pek",
    dbSeg: "SEA-PEK",
    ctx: "去程国际段（一家三口）",
    route: "西雅图 → 北京",
    date: "2026-11-28",
    dateLabel: "11-28",
    day: 0,
    kind: "intl",
    note: "✅ 已出票：Hainan Airlines HU496，确认号 NXK8WE，以出票邮件为准",
    ticketed: true,
    carrier: "Hainan Airlines",
    schedule: "HU496 10:20 → 15:50+1",
    priceNote: null,
    businessPriceNote: null,
    direct: true,
    fragile: false,
    queriedAt: null,
    priceBasis: "2大1小总价",
    options: null,
    businessOptions: null,
  },
  {
    id: "intl-out-bj",
    dbSeg: "PEK-SIN",
    ctx: "去程国际段（用户一家三口）",
    route: "北京 → 新加坡",
    date: "2026-12-06",
    dateLabel: "12-06",
    day: 8,
    kind: "intl",
    note: "✅ 已出票：Air China CA889，确认号 QZ7VZ1，以出票邮件为准",
    ticketed: true,
    carrier: "Air China",
    schedule: "CA889 09:45 → 16:15",
    priceNote: null,
    businessPriceNote: null,
    direct: true,
    fragile: false,
    queriedAt: null,
    priceBasis: "2大1小总价",
    options: null,
    businessOptions: null,
  },
  {
    id: "intl-out",
    dbSeg: "XIY-SIN",
    ctx: "去程国际段（岳父母）",
    route: "西安 → 新加坡",
    date: "2026-12-06",
    dateLabel: "12-06",
    day: 8,
    kind: "intl",
    note: "✅ 已出票：China Eastern MU2069，确认号 NJW4JT，以出票邮件为准",
    ticketed: true,
    carrier: "China Eastern Airlines",
    schedule: "MU2069 07:20 → 12:55",
    priceNote: null,
    businessPriceNote: null,
    direct: true,
    fragile: false,
    queriedAt: null,
    priceBasis: "2成人总价",
    options: null,
    businessOptions: null,
  },
  {
    id: "sin-hkt",
    dbSeg: "SIN-HKT",
    ctx: "D14 转场：新加坡段结束、普吉段开始",
    route: "新加坡 → 普吉",
    date: "2026-12-11",
    dateLabel: "12-11",
    day: 13,
    kind: "intercity",
    note: "夫妻段第一站 · 2成人",
    carrier: "Singapore Airlines SQ724",
    schedule: "06:55→07:50",
    priceNote: "2人 $285.00 起（Scoot TR652 18:15→19:20，本轮列表价；上一轮 $291.00，-2.1%；推荐 SQ724 本轮 $591.00，上一轮 $600.00，-1.5%）",
    businessPriceNote: "2人 $1,706.00 起（Singapore Airlines SQ724 06:55→07:50 商务舱，2人整单；上一轮 $1,715.00，-0.5%）",
    direct: true,
    queriedAt: "2026-10-18 18:30 PDT",
    priceBasis: "2成人总价",
    options: [
      { carrier: "Scoot", flight: "TR652", depart: "18:15", arrive: "19:20", arrivePlusDay: false, stops: 0, bags: "待定", price: 285.00, refundable: "not stated", changeable: "not stated", recommendReason: "当天最低价直飞（2人整单 $285.00，上一轮 $291.00，-2.1%）；18:15 出发，按推荐规则（上午出发优先）不置顶" },
      { carrier: "Scoot", flight: "TR658", depart: "08:40", arrive: "09:40", arrivePlusDay: false, stops: 0, bags: "待定", price: 338.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Scoot", flight: "TR644", depart: "12:00", arrive: "13:05", arrivePlusDay: false, stops: 0, bags: "待定", price: 338.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Singapore Airlines", flight: "SQ740", depart: "18:35", arrive: "19:35", arrivePlusDay: false, stops: 0, bags: "待定", price: 449.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Singapore Airlines", flight: "SQ736", depart: "16:10", arrive: "17:10", arrivePlusDay: false, stops: 0, bags: "待定", price: 453.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Singapore Airlines", flight: "SQ724", depart: "06:55", arrive: "07:50", arrivePlusDay: false, stops: 0, bags: "待定", price: 591.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "按推荐规则（不过夜＋上午出发最早）置顶：06:55 出发、07:50 一早抵达普吉；2 人整单 $591.00（本轮确认价，上一轮 $600.00，-1.5%）；当天最低价是傍晚班 TR652 $285.00，按规则不优先价格" },
      { carrier: "Singapore Airlines", flight: "SQ726", depart: "08:15", arrive: "09:15", arrivePlusDay: false, stops: 0, bags: "待定", price: 707.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Singapore Airlines", flight: "SQ728", depart: "09:00", arrive: "10:05", arrivePlusDay: false, stops: 0, bags: "待定", price: 835.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Singapore Airlines", flight: "SQ732", depart: "12:50", arrive: "13:55", arrivePlusDay: false, stops: 0, bags: "待定", price: 994.00, refundable: "not stated", changeable: "not stated" },
    ],
    businessOptions: [
      { carrier: "Singapore Airlines", flight: "SQ724", depart: "06:55", arrive: "07:50", arrivePlusDay: false, stops: 0, bags: "待定", price: 1706.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "商务舱按推荐规则（不过夜＋上午出发最早）置顶，且为当天商务舱最低价：06:55 出发、07:50 抵达；2 人整单 $1,706.00（上一轮 $1,715.00，-0.5%）" },
      { carrier: "Singapore Airlines", flight: "SQ726", depart: "08:15", arrive: "09:15", arrivePlusDay: false, stops: 0, bags: "待定", price: 1842.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Singapore Airlines", flight: "SQ736", depart: "16:10", arrive: "17:10", arrivePlusDay: false, stops: 0, bags: "待定", price: 2346.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Singapore Airlines", flight: "SQ732", depart: "12:50", arrive: "13:55", arrivePlusDay: false, stops: 0, bags: "待定", price: 2554.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Singapore Airlines", flight: "SQ728", depart: "09:00", arrive: "10:05", arrivePlusDay: false, stops: 0, bags: "待定", price: 2688.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Singapore Airlines", flight: "SQ740", depart: "18:35", arrive: "19:35", arrivePlusDay: false, stops: 0, bags: "待定", price: 2688.00, refundable: "not stated", changeable: "not stated" },
    ],

    fragile: true,
  },
  {
    id: "sin-xiy",
    dbSeg: "SIN-XIY",
    ctx: "D14：新加坡段结束，岳父母带娃回西安",
    route: "新加坡 → 西安",
    date: "2026-12-11",
    dateLabel: "12-11",
    day: 13,
    kind: "intl",
    note: "✅ 已出票：China Eastern MU2070，确认号 QCMB7T，以出票邮件为准",
    ticketed: true,
    carrier: "China Eastern Airlines",
    schedule: "MU2070 13:55 → 19:20",
    priceNote: null,
    businessPriceNote: null,
    direct: true,
    queriedAt: null,
    priceBasis: "2大1小总价",
    options: null,
    businessOptions: null,
    fragile: false,
  },
  {
    id: "hkt-cnx",
    dbSeg: "HKT-CNX",
    ctx: "D18 转场：普吉段结束、清迈段开始",
    route: "普吉 → 清迈",
    date: "2026-12-15",
    dateLabel: "12-15",
    day: 17,
    kind: "intercity",
    note: "夫妻段 · 2成人",
    carrier: "Thai VietJet VZ415",
    schedule: "08:15→10:20",
    priceNote: "2人 $243.00 起（Thai AirAsia FD3159 09:00→11:00，本轮列表价；上一轮 $244.00，-0.4%；推荐 VZ415 本轮 $245.00，上一轮 $246.00，-0.4%）",
    businessPriceNote: "无商务舱直飞（本轮页面明确 \"No nonstop flights found\"，与上一轮一致）",
    direct: true,
    queriedAt: "2026-10-18 18:30 PDT",
    priceBasis: "2成人总价",
    options: [
      { carrier: "Thai AirAsia", flight: "FD3159", depart: "09:00", arrive: "11:00", arrivePlusDay: false, stops: 0, bags: "待定", price: 243.00, refundable: "not stated", changeable: "not stated", recommendReason: "当天最低价直飞之一（2人整单 $243.00，上一轮 $244.00，-0.4%）；09:00 出发，按推荐规则（上午出发最早优先）不置顶" },
      { carrier: "Thai AirAsia", flight: "FD3167", depart: "18:55", arrive: "20:55", arrivePlusDay: false, stops: 0, bags: "待定", price: 243.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai VietJet", flight: "VZ415", depart: "08:15", arrive: "10:20", arrivePlusDay: false, stops: 0, bags: "待定", price: 245.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "按推荐规则（不过夜＋上午出发最早）置顶：08:15 出发、10:20 抵达；2 人整单 $245.00（本轮确认价，上一轮 $246.00，-0.4%）" },
      { carrier: "Thai AirAsia", flight: "FD3161", depart: "10:35", arrive: "12:30", arrivePlusDay: false, stops: 0, bags: "待定", price: 278.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai VietJet", flight: "VZ417", depart: "13:25", arrive: "15:40", arrivePlusDay: false, stops: 0, bags: "待定", price: 314.00, refundable: "not stated", changeable: "not stated" },
    ],
    businessOptions: [
    ],

    fragile: false,
  },
  {
    id: "cnx-bkk",
    dbSeg: "CNX-BKK",
    ctx: "D21 转场：清迈段结束、曼谷段开始",
    route: "清迈 → 曼谷",
    date: "2026-12-18",
    dateLabel: "12-18",
    day: 20,
    kind: "intercity",
    note: "夫妻段 · 2成人；曼谷含素万那普 + 廊曼两个机场",
    carrier: "Thai VietJet VZ2105",
    schedule: "06:35→07:55",
    priceNote: "2人 $99.00 起（Thai AirAsia FD4101 08:55→10:10，本轮列表价；上一轮最低 $102.00，-2.9%；推荐 VZ2105 本轮 $119.00，上一轮 $122.00，-2.5%）",
    businessPriceNote: "2人 $403.00 起（Thai Airways TG101 08:05→09:30 商务舱，2人整单；上一轮 $406.00，-0.7%）",
    direct: true,
    queriedAt: "2026-10-18 18:30 PDT",
    priceBasis: "2成人总价",
    options: [
      { carrier: "Thai AirAsia", flight: "FD4103", depart: "20:40", arrive: "22:05", arrivePlusDay: false, stops: 0, bags: "待定", price: 151.00, refundable: "not stated", changeable: "not stated", recommendReason: "20:40 出发、22:05 抵达（2人整单 $151.00，本轮列表价，上一轮 $154.00，-1.9%）；按推荐规则（上午出发优先）不置顶" },
      { carrier: "Thai VietJet", flight: "VZ123", depart: "19:35", arrive: "20:55", arrivePlusDay: false, stops: 0, bags: "待定", price: 132.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai VietJet", flight: "VZ2107", depart: "20:50", arrive: "22:10", arrivePlusDay: false, stops: 0, bags: "待定", price: 119.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai VietJet", flight: "VZ119", depart: "22:35", arrive: "23:55", arrivePlusDay: false, stops: 0, bags: "待定", price: 119.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai AirAsia", flight: "FD4101", depart: "08:55", arrive: "10:10", arrivePlusDay: false, stops: 0, bags: "待定", price: 99.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai AirAsia", flight: "FD4109", depart: "18:05", arrive: "19:25", arrivePlusDay: false, stops: 0, bags: "待定", price: 151.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai AirAsia", flight: "FD4097", depart: "18:40", arrive: "20:05", arrivePlusDay: false, stops: 0, bags: "待定", price: 109.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai VietJet", flight: "VZ2105", depart: "06:35", arrive: "07:55", arrivePlusDay: false, stops: 0, bags: "待定", price: 119.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "按推荐规则（不过夜＋上午出发最早）置顶：06:35 出发、07:55 抵达；2 人整单 $119.00（本轮列表价，上一轮 $122.00，-2.5%）" },
      { carrier: "Thai VietJet", flight: "VZ111", depart: "14:20", arrive: "15:40", arrivePlusDay: false, stops: 0, bags: "待定", price: 145.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai VietJet", flight: "VZ109", depart: "17:20", arrive: "18:40", arrivePlusDay: false, stops: 0, bags: "待定", price: 145.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai VietJet", flight: "VZ101", depart: "08:25", arrive: "09:45", arrivePlusDay: false, stops: 0, bags: "待定", price: 119.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai VietJet", flight: "VZ115", depart: "09:40", arrive: "11:00", arrivePlusDay: false, stops: 0, bags: "待定", price: 119.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai VietJet", flight: "VZ107", depart: "15:45", arrive: "17:10", arrivePlusDay: false, stops: 0, bags: "待定", price: 132.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG123", depart: "11:05", arrive: "12:30", arrivePlusDay: false, stops: 0, bags: "待定", price: 138.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Bangkok Airways", flight: "PG224", depart: "12:10", arrive: "13:35", arrivePlusDay: false, stops: 0, bags: "待定", price: 197.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG115", depart: "19:35", arrive: "21:00", arrivePlusDay: false, stops: 0, bags: "待定", price: 138.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai VietJet", flight: "VZ103", depart: "12:35", arrive: "13:55", arrivePlusDay: false, stops: 0, bags: "待定", price: 132.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG121", depart: "21:10", arrive: "22:30", arrivePlusDay: false, stops: 0, bags: "待定", price: 138.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai AirAsia", flight: "FD4105", depart: "12:30", arrive: "13:50", arrivePlusDay: false, stops: 0, bags: "待定", price: 109.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG101", depart: "08:05", arrive: "09:30", arrivePlusDay: false, stops: 0, bags: "待定", price: 157.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Bangkok Airways", flight: "PG220", depart: "19:45", arrive: "21:10", arrivePlusDay: false, stops: 0, bags: "待定", price: 155.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG105", depart: "12:15", arrive: "13:35", arrivePlusDay: false, stops: 0, bags: "待定", price: 171.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG111", depart: "15:25", arrive: "16:45", arrivePlusDay: false, stops: 0, bags: "待定", price: 171.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG113", depart: "17:10", arrive: "18:30", arrivePlusDay: false, stops: 0, bags: "待定", price: 189.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG103", depart: "09:30", arrive: "10:55", arrivePlusDay: false, stops: 0, bags: "待定", price: 157.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG107", depart: "14:05", arrive: "15:25", arrivePlusDay: false, stops: 0, bags: "待定", price: 171.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Bangkok Airways", flight: "PG216", depart: "10:10", arrive: "11:35", arrivePlusDay: false, stops: 0, bags: "待定", price: 155.00, refundable: "not stated", changeable: "not stated" },
    ],
    businessOptions: [
      { carrier: "Thai Airways", flight: "TG101", depart: "08:05", arrive: "09:30", arrivePlusDay: false, stops: 0, bags: "待定", price: 403.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "商务舱按推荐规则（不过夜＋上午出发最早）置顶：08:05 出发、09:30 抵达；2 人整单 $403.00（本轮列表价，上一轮 $406.00，-0.7%）" },
      { carrier: "Thai Airways", flight: "TG103", depart: "09:30", arrive: "10:55", arrivePlusDay: false, stops: 0, bags: "待定", price: 460.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG123", depart: "11:05", arrive: "12:30", arrivePlusDay: false, stops: 0, bags: "待定", price: 403.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG115", depart: "19:35", arrive: "21:00", arrivePlusDay: false, stops: 0, bags: "待定", price: 403.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG105", depart: "12:15", arrive: "13:35", arrivePlusDay: false, stops: 0, bags: "待定", price: 573.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG111", depart: "15:25", arrive: "16:45", arrivePlusDay: false, stops: 0, bags: "待定", price: 573.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG113", depart: "17:10", arrive: "18:30", arrivePlusDay: false, stops: 0, bags: "待定", price: 460.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG107", depart: "14:05", arrive: "15:25", arrivePlusDay: false, stops: 0, bags: "待定", price: 573.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG121", depart: "21:10", arrive: "22:30", arrivePlusDay: false, stops: 0, bags: "待定", price: 460.00, refundable: "not stated", changeable: "not stated" },
    ],

    fragile: false,
  },
  {
    id: "bkk-xiy",
    dbSeg: "BKK-XIY",
    ctx: "D22：曼谷段结束，老婆一人回西安（分开行动）",
    route: "曼谷 → 西安",
    date: "2026-12-20",
    dateLabel: "12-20",
    day: 22,
    kind: "intl",
    note: "✅ 已出票：Spring Airlines 9C6294，确认号 BMLFUDL，以出票邮件为准",
    ticketed: true,
    carrier: "Spring Airlines",
    schedule: "9C6294 14:05 → 19:00",
    priceNote: null,
    businessPriceNote: null,
    direct: true,
    queriedAt: null,
    priceBasis: "1成人总价",
    options: null,
    businessOptions: null,
    fragile: true,
  },
  {
    id: "bkk-pek",
    dbSeg: "BKK-PEK",
    ctx: "D22：曼谷段结束，用户一人回北京陪父亲（分开行动）",
    route: "曼谷 → 北京",
    date: "2026-12-20",
    dateLabel: "12-20",
    day: 22,
    kind: "intl",
    note: "✅ 已出票：Air China CA886，确认号 NGNTJ0，以出票邮件为准",
    ticketed: true,
    carrier: "Air China",
    schedule: "CA886 15:15 → 21:00",
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
    ctx: "回程：全家西安→首尔（2大1小）——你先坐高铁从北京到西安汇合（2026-10-13 用户改，北京→首尔一人直飞段已取消）",
    route: "西安 → 首尔",
    date: "2026-12-30",
    dateLabel: "12-30",
    day: 32,
    kind: "intl",
    note: "✅ 已出票：China Eastern Airlines MU853，确认号 QVJDC5，以出票邮件为准",
    ticketed: true,
    carrier: "China Eastern Airlines",
    schedule: "MU853 15:15 → 18:55",
    priceNote: null,
    businessPriceNote: null,
    direct: true,
    fragile: false,
    queriedAt: null,
    priceBasis: "2大1小总价",
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
    day: 34,
    kind: "intl",
    note: "✅ 已出票：Alaska Airlines AS120，确认号 CNESXC，以出票邮件为准",
    ticketed: true,
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
 * 唯一真实来源：Supabase sea_guide_datasets 的 flight_db 数据集（每小时 cron 实查后发布入 DB，只含直飞）。
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
  dep_airport?: string; arr_airport?: string;
}
interface FlightDbDay {
  economy_usd?: number | null; business_usd?: number | null;
  economy_price_basis?: string; business_price_basis?: string;
  economy_queried_at?: string; business_queried_at?: string;
  nonstop_flights?: FlightDbFlight[];
}

function flightDbDay(seg: string, date: string): FlightDbDay | null {
  const segs = getDataset<{ segments?: Record<string, { days?: Record<string, FlightDbDay> }> }>("flight_db")?.segments;
  return segs?.[seg]?.days?.[date] ?? null;
}

/** 某航段某天是否已实查过（区分「还没查」与「查了但没有这班」）。 */
export function flightDbQueriedAt(dbSeg: string, date: string): string | null {
  const day = flightDbDay(dbSeg, date);
  if (!day) return null;
  const raw = day.economy_queried_at || day.business_queried_at || "";
  return raw ? toPDT(raw) : null;
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
/* 「推荐航班」规则与 planner 同口径（2026-10-13 用户）：不过夜优先 → 上午出发（06:00–12:00）优先
   → 出发越早越优先 → 价格越低越优先；过夜 = 起飞+时长跨午夜或时长 ≥8h；全天都过夜才推过夜班。
   此前本文件按「最低价」选推荐，与 planner 口径不一致（红眼/深夜班被标推荐），2026-10-13 裁决统一。 */
function dbDepMinutes(dep: string): number | null {
  /* 2026-10-17 修：必须认 AM/PM——旧实现把 "11:40 PM" 当 11:40，推荐航班的
     上午出发/过夜判断对 12h 格式行全错。数据侧已统一 24h 入库，此处兼容兜底。 */
  const m = String(dep || "").match(/(\d{1,2}):(\d{2})\s*([AP]M)?/i);
  if (!m) return null;
  let h = +m[1];
  const mi = +m[2];
  if (m[3]) {
    const pm = /p/i.test(m[3]);
    if (pm && h < 12) h += 12;
    if (!pm && h === 12) h = 0;
  }
  return h * 60 + mi;
}
function dbDurMinutes(d: string): number | null {
  const dm = String(d || "").match(/(\d+)\s*h(?:r)?\s*(?:(\d+)\s*m)?/i);
  return dm ? +dm[1] * 60 + (dm[2] ? +dm[2] : 0) : null;
}
function dbFlightOvernight(f: FlightDbFlight): boolean {
  const dep = dbDepMinutes(f.dep), dur = dbDurMinutes(f.duration || "");
  if (dep == null || dur == null) return false;
  return dep + dur >= 1440 || dur >= 480;
}
function pickDbRecommend(flights: FlightDbFlight[], cabin: "eco" | "biz"): FlightDbFlight | null {
  let best: FlightDbFlight | null = null;
  let bestKey: [number, number, number, number] | null = null;
  for (const f of flights) {
    const price = cabin === "eco" ? f.price_usd : f.business_price_usd;
    if (price == null) continue;
    const dep = dbDepMinutes(f.dep);
    if (dep == null) continue;
    const key: [number, number, number, number] = [
      dbFlightOvernight(f) ? 1 : 0,
      dep >= 360 && dep < 720 ? 0 : 1,
      dep,
      price,
    ];
    if (!bestKey || key[0] < bestKey[0] || (key[0] === bestKey[0] && (key[1] < bestKey[1] || (key[1] === bestKey[1] && (key[2] < bestKey[2] || (key[2] === bestKey[2] && key[3] < bestKey[3])))))) {
      best = f; bestKey = key;
    }
  }
  return best;
}
function dbRecommendReason(f: FlightDbFlight): string {
  const dep = dbDepMinutes(f.dep) ?? 0;
  if (dbFlightOvernight(f)) return "当天直飞均过夜，按推荐规则选出发最早的一班";
  if (dep >= 360 && dep < 720) return "按推荐规则：不过夜、上午出发优先（早上飞、白天到）";
  return "按推荐规则：不过夜班次中出发最早";
}

function basisToPax(basis: string): string {
  if (basis.includes("2大1小")) return "3人";
  if (basis.includes("1大1小")) return "2人";
  if (basis.includes("2成人")) return "2人";
  return "";
}
function fullCarrier(short: string): string {
  return CARRIER_FULLNAME[short] || short;
}

function dbFlightOption(f: FlightDbFlight, cabin: "eco" | "biz"): FlightOption | null {
  const price = cabin === "eco" ? f.price_usd : f.business_price_usd;
  /* 经济舱：无价也不能丢航班——行在库里就证明这班在经济舱实查里出现过，
     price_usd 为空只是 Google 未在列表显示价（「查询价格」），保留并标待查。
     商务舱：business_price_usd 为空 = 商务舱查询里没这班（多为无商务舱），维持不列。 */
  if (cabin === "biz" && price == null) return null;
  const arrRaw = String(f.arr || "");
  const plusDay = arrRaw.includes("+1");
  const durMins = dbDurMinutes(f.duration ?? "");
  return {
    carrier: fullCarrier(f.airline),
    flight: f.flight ?? '',
    depart: f.dep,
    arrive: arrRaw.replace("+1", "").trim(),
    arrivePlusDay: plusDay || undefined,
    durationMins: durMins ?? undefined,
    depAirport: f.dep_airport,
    arrAirport: f.arr_airport,
    stops: 0,
    price: price ?? null,
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

    if (leg.ticketed) {
      // 2026-10-03 site-improve 交叉核验发现并修复：已出票的腿（AS120 2027-01-01）
      // 仍挂着 dbSeg，flight-db-gflights-fill 的 priority.json 已含 ICN-SEA 2027-01-01，
      // 入库后本函数会把 note（确认号 CNESXC）/carrier/schedule 全部改写成泛搜索口径。
      // 用户铁律：已出票航班以实际出票为准，绝不覆盖。直接跳过。
      leg.flightState = "ok";
      return;
    }

    const seg = leg.dbSeg;
    const date = dateOverride ?? leg.date;
    if (dateOverride && dateOverride !== leg.date) {
      leg.date = dateOverride;
      leg.dateLabel = dateOverride.slice(5).replace("-", "-");
    }
    if (!seg || !date) {
      // 不在库覆盖范围（无 dbSeg 的腿）：静态直飞即全部
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
        // 2026-10-04 site-improve 口径：待查询状态不留任何静态价格/航司残留，
        // 否则预订页标题栏会把旧价当现价展示（none 分支同口径）。库填入后本函数重跑自动接管。
        leg.priceNote = null;
        leg.businessPriceNote = null;
        leg.carrier = null;
        leg.schedule = null;
        leg.queriedAt = null; // 为空时 GuideApp 派生 ecoState='pending'（有旧值会误判为'none'）
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
    const recEcoF = pickDbRecommend(nf, "eco");
    if (recEcoF) {
      const o = ecoOpts.find((x) => x.flight === (recEcoF.flight ?? "") && x.depart === recEcoF.dep);
      if (o) { o.recommend = true; o.recommendReason = dbRecommendReason(recEcoF); }
    }
    const recBizF = pickDbRecommend(nf, "biz");
    if (recBizF) {
      const o = bizOpts.find((x) => x.flight === (recBizF.flight ?? "") && x.depart === recBizF.dep);
      if (o) { o.recommend = true; o.recommendReason = dbRecommendReason(recBizF); }
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
    /* 起价：优先用库里该日汇总价；没有汇总价时取有价航班里的最低价（无价航班不参与，
       全部无价时不写起价，不许拿无价航班凑数） */
    const ecoPriced = ecoOpts.map((o) => o.price).filter((p): p is number => p != null);
    const bizPriced = bizOpts.map((o) => o.price).filter((p): p is number => p != null);
    leg.priceNote = ecoOpts.length > 0 && (day.economy_usd != null || ecoPriced.length > 0)
      ? `${pax ? pax + " " : ""}${fmtUSD(day.economy_usd ?? Math.min(...ecoPriced))} 起`
      : null;
    leg.businessPriceNote = bizOpts.length > 0 && (day.business_usd != null || bizPriced.length > 0)
      ? `${pax ? pax + " " : ""}${fmtUSD(day.business_usd ?? Math.min(...bizPriced))} 起`
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

/**
 * 【日期单一事实源】用云端规划里存好的 plan.timeline 覆盖 FLIGHT_LEGS 的日期。
 * 2026-10-13 用户裁决：行程时间一处定死、存下来，其他地方严格照抄——
 * FLIGHT_LEGS 的写死日期只作离线兜底；规划一加载，日期以时间线为准
 * （dateLabel / day 都是 date 的纯函数，随之重算）。已出票段（icn-sea）的
 * 时间线日期与出票日期同为 2027-01-01，覆盖不改变事实。
 * 由 GuideApp / BookingsPage 在 loadPlannerPlan 后调用。
 */
export function applyPlanTimeline(plan: { timeline?: { legs?: { id: string; date: string }[] } } | null | undefined): void {
  const legs = plan?.timeline?.legs;
  if (!legs?.length) return;
  const byId = new Map(legs.map((l) => [l.id, l.date]));
  const anchorMs = new Date("2026-11-29T00:00:00").getTime();
  for (const leg of FLIGHT_LEGS) {
    const d = byId.get(leg.id);
    if (d && d !== leg.date) {
      leg.date = d;
      leg.dateLabel = d.slice(5);
      leg.day = Math.round((new Date(d + "T00:00:00").getTime() - anchorMs) / 86400000) + 1;
    }
  }
  /* 日期变了，航班库选项要按新日期重新灌一次（数据集在缓存里时同步可得） */
  applyFlightDb();
}
/* 航班库从 DB 数据集到达后重新灌入（2026-10-13：数据在 Supabase sea_guide_datasets.flight_db） */
onDataset("flight_db", () => applyFlightDb());

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
