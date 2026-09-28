/**
 * /bookings 预订行动时间线：13 天行程（2026-12-12 ～ 12-24）
 * 新加坡 D1-5 → 普吉 D6-8 → 曼谷 D9-11 → 清迈 D12-13。
 *
 * 组织原则（对标 Google Travel / Booking.com / Trip.com）：
 * 按"最晚行动时间"排，不是按"酒店/餐厅/景点"分类堆。
 * 行动（时间线）/ 参考（城市明细）/ 记录（我的预订）三层各司其职。
 */

export type BookByGroup = "now" | "d60" | "d30" | "d14" | "local";

export interface FlightLegInfo {
  id: string;
  route: string;
  date: string; // YYYY-MM-DD，国际段待定则为空
  dateLabel: string;
  day: number;
  kind: "intercity" | "intl";
  note: string;
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
 *  亚洲城际段只保留直飞（stops=0）；跨太平洋回程段为方便比价含优选中转（stops/via 如实标注）。 */
export interface FlightOption {
  carrier: string;
  flight: string;
  depart: string;
  arrive: string;
  /** 到达为次日时 true，展示为 06:50+1 */
  arrivePlusDay?: boolean;
  /** 中转次数；0=直飞 */
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
 * 用户要求：亚洲城际段只看直飞（options 仅保留 stops=0，无直飞的段 options 为空）；跨太平洋去回程为方便比价含优选中转（2026-09-27 用户要求把回程三城三天选项全部放入预订）。 */
export const FLIGHT_LEGS: FlightLegInfo[] = [
  {
    id: "intl-out-bj",
    route: "北京 → 新加坡",
    date: "2026-12-06",
    dateLabel: "12-06",
    day: 1,
    kind: "intl",
    note: "去程国际段（用户一家三口）；Google Flights 实查 2026-09-27 16:27 PDT（2大1小，当天 6 班直飞：国航×3、新航×3）",
    carrier: "Air China CA889",
    schedule: "09:45→16:15",
    priceNote: "3人 $514 起",
    businessPriceNote: "3人 $3,153 起",
    direct: true,
    fragile: false,
    queriedAt: "2026-09-27 16:27 PDT（候选日期，待确认后重查）",
    priceBasis: "2大1小总价",
    options: [
      { carrier: "Air China", flight: "CA889", depart: "09:45", arrive: "16:15", stops: 0, price: 514.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天最低价之一；09:45出发、16:15抵达，白天航班带2岁娃不折腾" },
      { carrier: "Air China", flight: "CA969", depart: "15:45", arrive: "21:55", stops: 0, price: 514.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Air China", flight: "CA975", depart: "00:15", arrive: "06:50", stops: 0, price: 514.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Singapore Airlines", flight: "SQ805", depart: "08:45", arrive: "15:20", stops: 0, price: 548.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Singapore Airlines", flight: "SQ801", depart: "00:10", arrive: "06:45", stops: 0, price: 548.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Singapore Airlines", flight: "SQ807", depart: "16:40", arrive: "22:55", stops: 0, price: 1128.00, refundable: "not stated", changeable: "not stated" },
    ],
    businessOptions: [
      { carrier: "Air China", flight: "CA889", depart: "09:45", arrive: "16:15", stops: 0, price: 3153.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "同班商务舱" },
    ],
  },
  {
    id: "intl-out",
    route: "西安 → 新加坡",
    date: "2026-12-06",
    dateLabel: "12-06",
    day: 1,
    kind: "intl",
    note: "去程国际段（岳父母）；Google Flights 实查 2026-09-27 16:42 PDT（2 成人，当天 2 班直飞：酷航红眼、东航白天）",
    carrier: "China Eastern MU2069",
    schedule: "07:20→12:55",
    priceNote: "2人 $418 起",
    businessPriceNote: "2人 $2,126 起（东航 MU2069 07:20→12:55，酷航为廉航无商务舱）",
    direct: true,
    fragile: true,
    queriedAt: "2026-09-27 16:27 PDT（候选日期，待确认后重查）",
    priceBasis: "2成人总价",
    options: [
      { carrier: "China Eastern", flight: "MU2069", depart: "07:20", arrive: "12:55", stops: 0, price: 418.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "白天航班，07:20出发、12:55抵达；岳父母不用半夜赶飞机，中午到新加坡下午从容入住；只比红眼贵 $35" },
      { carrier: "Scoot", flight: "TR135", depart: "01:55", arrive: "07:50", stops: 0, price: 383.00, refundable: "not stated", changeable: "not stated", recommendReason: "便宜 $35，但 01:55 红眼出发，老人半夜赶飞机太辛苦，不推荐" },
    ],
    businessOptions: [
      { carrier: "China Eastern", flight: "MU2069", depart: "07:20", arrive: "12:55", stops: 0, price: 2126.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "东航白天班商务舱，岳父母飞得舒服" },
    ],
  },
  {
    id: "sin-hkt",
    route: "新加坡 → 普吉",
    date: "2026-12-11",
    dateLabel: "12-11",
    day: 6,
    kind: "intercity",
    note: "D6 转场：新加坡段结束、普吉段开始；Duffel 实查 2026-09-27 18:13 PDT（2 成人直飞，当天 14 班：酷航×3、新航×6、曼谷航空×5）",
    carrier: "Singapore Airlines SQ0740",
    schedule: "18:35→19:35",
    priceNote: "2人 $381.40 起",
    businessPriceNote: "2人 $1,809 起（仅新航有商务舱，酷航为廉航无商务舱）",
    direct: true,
    fragile: false,
    queriedAt: "2026-09-27 18:13 PDT",
    options: [
      { carrier: "Singapore Airlines", flight: "SQ0740", depart: "18:35", arrive: "19:35", stops: 0, bags: "1件", price: 381.40, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天最低价直飞；18:35出发、19:35抵达普吉" },
      { carrier: "Scoot", flight: "TR0678", depart: "08:40", arrive: "09:40", stops: 0, bags: "1件", price: 457.40, refundable: "not stated", changeable: "not stated" },
      { carrier: "Scoot", flight: "TR0652", depart: "18:15", arrive: "19:20", stops: 0, bags: "1件", price: 457.40, refundable: "not stated", changeable: "not stated" },
      { carrier: "Scoot", flight: "TR0664", depart: "12:00", arrive: "13:05", stops: 0, bags: "1件", price: 519.40, refundable: "not stated", changeable: "not stated" },
      { carrier: "Singapore Airlines", flight: "SQ0728", depart: "09:00", arrive: "10:05", stops: 0, bags: "1件", price: 543.40, refundable: "not stated", changeable: "not stated" },
      { carrier: "Singapore Airlines", flight: "SQ0724", depart: "06:55", arrive: "07:50", stops: 0, bags: "1件", price: 543.40, refundable: "not stated", changeable: "not stated" },
      { carrier: "Singapore Airlines", flight: "SQ0736", depart: "16:10", arrive: "17:10", stops: 0, bags: "1件", price: 653.40, refundable: "not stated", changeable: "not stated" },
      { carrier: "Singapore Airlines", flight: "SQ0726", depart: "08:15", arrive: "09:15", stops: 0, bags: "1件", price: 653.40, refundable: "not stated", changeable: "not stated" },
      { carrier: "Bangkok Airways", flight: "PG4724", depart: "18:35", arrive: "19:35", stops: 0, bags: "1件", price: 685.40, refundable: "not stated", changeable: "not stated" },
      { carrier: "Singapore Airlines", flight: "SQ0732", depart: "12:50", arrive: "13:55", stops: 0, bags: "1件", price: 775.40, refundable: "not stated", changeable: "not stated" },
      { carrier: "Bangkok Airways", flight: "PG4716", depart: "08:15", arrive: "09:15", stops: 0, bags: "1件", price: 811.40, refundable: "not stated", changeable: "not stated" },
      { carrier: "Bangkok Airways", flight: "PG4722", depart: "16:10", arrive: "17:10", stops: 0, bags: "1件", price: 811.40, refundable: "not stated", changeable: "not stated" },
      { carrier: "Bangkok Airways", flight: "PG4718", depart: "09:00", arrive: "10:05", stops: 0, bags: "1件", price: 811.40, refundable: "not stated", changeable: "not stated" },
      { carrier: "Bangkok Airways", flight: "PG4726", depart: "12:50", arrive: "13:55", stops: 0, bags: "1件", price: 1045.40, refundable: "not stated", changeable: "not stated" },
    ],
    businessOptions: [
      { carrier: "Singapore Airlines", flight: "SQ", depart: "", arrive: "", stops: 0, price: 1809.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天唯一有商务舱的直飞（新航）" },
    ],
  },
  {
    id: "sin-xiy",
    route: "新加坡 → 西安",
    date: "2026-12-11",
    dateLabel: "12-11",
    day: 6,
    kind: "intl",
    note: "新加坡段结束：岳父母带娃回西安；Google Flights 实查 2026-09-27 16:42 PDT（2大1小，当天 2 班直飞：酷航半夜到、东航傍晚到）",
    carrier: "China Eastern MU2072",
    schedule: "13:55→19:20",
    priceNote: "3人 $1,733 起",
    businessPriceNote: "3人 $3,512 起（东航 MU2072 13:55→19:20，酷航为廉航无商务舱）",
    direct: true,
    fragile: true,
    queriedAt: "2026-09-27 16:27 PDT（候选日期，待确认后重查）",
    priceBasis: "2大1小总价",
    options: [
      { carrier: "China Eastern", flight: "MU2072", depart: "13:55", arrive: "19:20", stops: 0, price: 1733.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "下午出发、19:20傍晚抵达西安；带2岁娃不用半夜折腾，接机、回家都从容；比半夜到的酷航贵 $472，但带娃这钱值得花" },
      { carrier: "Scoot", flight: "TR134", depart: "19:15", arrive: "00:45", arrivePlusDay: true, stops: 0, price: 1261.00, refundable: "not stated", changeable: "not stated", recommendReason: "便宜 $472，但 00:45+1 半夜抵达，带2岁娃太折腾，不推荐" },
    ],
    businessOptions: [
      { carrier: "China Eastern", flight: "MU2072", depart: "13:55", arrive: "19:20", stops: 0, price: 3512.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "东航傍晚到商务舱，带娃不折腾" },
    ],
  },
  {
    id: "hkt-cnx",
    route: "普吉 → 清迈",
    date: "2026-12-14",
    dateLabel: "12-14",
    day: 9,
    kind: "intercity",
    note: "D9 转场：普吉段结束、清迈段开始；Google Flights 实查 2026-09-27 16:27 PDT（2 成人直飞，当天 5 班：亚航×3、越捷×2）",
    carrier: "VietJet Air VZ415",
    schedule: "08:15→10:20",
    priceNote: "2人 $220 起",
    businessPriceNote: "无商务舱直飞（亚航、越捷均为廉航，无商务舱）",
    direct: true,
    fragile: false,
    queriedAt: "2026-09-27 16:27 PDT",
    options: [
      { carrier: "VietJet Air", flight: "VZ415", depart: "08:15", arrive: "10:20", stops: 0, price: 220.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天最低价；早上到清迈，下午能直接玩" },
      { carrier: "Thai AirAsia", flight: "FD3167", depart: "18:55", arrive: "20:55", stops: 0, price: 245.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "VietJet Air", flight: "VZ417", depart: "13:25", arrive: "15:40", stops: 0, price: 279.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai AirAsia", flight: "FD3159", depart: "09:00", arrive: "11:00", stops: 0, price: 280.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai AirAsia", flight: "FD3161", depart: "10:35", arrive: "12:35", stops: 0, price: 280.00, refundable: "not stated", changeable: "not stated" },
    ],
    businessOptions: [],
  },
  {
    id: "cnx-bkk",
    route: "清迈 → 曼谷",
    date: "2026-12-17",
    dateLabel: "12-17",
    day: 12,
    kind: "intercity",
    note: "D12 转场：清迈段结束、曼谷段开始；Google Flights 实查 2026-09-27 16:42 PDT（2 成人直飞，当天 27 班：越捷×9、亚航×5、曼谷航空×2、泰航×11）",
    carrier: "VietJet Air VZ2105",
    schedule: "06:35→07:55",
    priceNote: "2人 $102 起",
    businessPriceNote: "2人 $407 起（仅泰航有商务舱，如 14:05→15:25）",
    direct: true,
    fragile: false,
    queriedAt: "2026-09-27 16:27 PDT",
    options: [
      { carrier: "VietJet Air", flight: "VZ2105", depart: "06:35", arrive: "07:55", stops: 0, price: 102.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "早班机，07:55到曼谷，有一整天可以玩" },
      { carrier: "VietJet Air", flight: "VZ119", depart: "22:35", arrive: "23:55", stops: 0, price: 102.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "VietJet Air", flight: "VZ103", depart: "12:35", arrive: "13:55", stops: 0, price: 111.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai AirAsia", flight: "FD4097", depart: "18:00", arrive: "19:25", stops: 0, price: 119.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai AirAsia", flight: "FD4101", depart: "08:55", arrive: "10:10", stops: 0, price: 133.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Bangkok Airways", flight: "PG216", depart: "10:10", arrive: "11:35", stops: 0, price: 137.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Bangkok Airways", flight: "PG220", depart: "19:45", arrive: "21:10", stops: 0, price: 137.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG121", depart: "21:10", arrive: "22:30", stops: 0, price: 141.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG101", depart: "08:05", arrive: "09:30", stops: 0, price: 149.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Thai Airways", flight: "TG111", depart: "15:25", arrive: "16:45", stops: 0, price: 161.00, refundable: "not stated", changeable: "not stated" },
    ],
    businessOptions: [
      { carrier: "Thai Airways", flight: "TG", depart: "14:05", arrive: "15:25", stops: 0, price: 407.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天有商务舱的直飞（泰航）" },
    ],
  },
  {
    id: "bkk-xiy",
    route: "曼谷 → 西安",
    date: "2026-12-19",
    dateLabel: "12-19",
    day: 14,
    kind: "intl",
    note: "回程：用户夫妻一起回西安（2成人）；曼谷 12/19 离开；在西安待3-4天；Google Flights 实查 2026-09-27 16:27 PDT（2成人，当天唯一真直飞：春秋航空）",
    carrier: "Spring Airlines 9C6294",
    schedule: "14:35→19:30",
    priceNote: "2人 $256 起",
    businessPriceNote: "无商务舱直飞（春秋航空为廉航，无商务舱）",
    direct: true,
    fragile: true,
    queriedAt: "2026-09-27 16:27 PDT",
    priceBasis: "2成人总价",
    options: [
      { carrier: "Spring Airlines", flight: "9C6294", depart: "14:35", arrive: "19:30", stops: 0, price: 256.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天唯一真直飞，3小时55分；下午出发、晚上到西安，时间友好" },
    ],
    businessOptions: [],
  },
  {
    id: "xiy-pek",
    route: "西安 → 北京",
    date: "2026-12-22",
    dateLabel: "12-22",
    day: 17,
    kind: "intl",
    note: "用户一人回北京；在西安待3-4天后离开（候选日期，待用户在/planner确认）；Google Flights 实查 2026-09-27 16:46 PDT（1成人，当天 15 班直飞：国航×11、海航×4）",
    carrier: "Air China CA1236",
    schedule: "20:35→23:00",
    priceNote: "1人 $111 起",
    businessPriceNote: "1人 $231 起（国航 CA1236 20:35→23:00）",
    direct: true,
    fragile: false,
    queriedAt: "2026-09-27 16:27 PDT（候选日期，待确认后重查）",
    priceBasis: "1成人单价",
    options: [
      { carrier: "Air China", flight: "CA1236", depart: "20:35", arrive: "23:00", stops: 0, price: 111.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天最低价；20:35出发、23:00抵达，晚上到北京不折腾" },
      { carrier: "Air China", flight: "CA1232", depart: "11:00", arrive: "13:15", stops: 0, price: 114.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Air China", flight: "CA1210", depart: "14:00", arrive: "16:15", stops: 0, price: 114.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Air China", flight: "CA1202", depart: "18:15", arrive: "20:45", stops: 0, price: 114.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Hainan Airlines", flight: "HU7138", depart: "10:00", arrive: "12:30", stops: 0, price: 383.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Hainan Airlines", flight: "HU7238", depart: "15:30", arrive: "18:10", stops: 0, price: 383.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Hainan Airlines", flight: "HU7538", depart: "21:50", arrive: "00:20", arrivePlusDay: true, stops: 0, price: 383.00, refundable: "not stated", changeable: "not stated" },
    ],
    businessOptions: [
      { carrier: "Air China", flight: "CA1236", depart: "20:35", arrive: "23:00", stops: 0, price: 231.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "国航商务舱，1人 $231" },
    ],
  },
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
    id: "pek-sea-1231",
    route: "北京 → 西雅图",
    date: "2026-12-31",
    dateLabel: "12-31",
    day: 18,
    kind: "intl",
    note: "回程国际段候选（北京出发，2大1小）；Google Flights 实查 2026-09-27 17:49 PDT。当天无直飞。商务舱最低约 $6,465（东航+阿拉斯加，经停上海/温哥华）。国内集结：只需老婆+Dylan 从西安到北京会合（用户已在北京）",
    carrier: null,
    schedule: null,
    priceNote: "3人 $2,616 起",
    businessPriceNote: null,
    direct: false,
    fragile: false,
    queriedAt: "2026-09-27 17:49 PDT（候选日期，待确认后重查）",
    priceBasis: "2大1小总价",
    options: [
      { carrier: "Korean Air + Alaska Airlines", flight: "KE852 / AS120", depart: "10:40", arrive: "12:55", stops: 1, via: "首尔", price: 2616.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天最低价；首尔中转6h15m，总时长18h15m" },
      { carrier: "Korean Air + Alaska Airlines", flight: "KE2052 / AS120", depart: "11:45", arrive: "12:55", stops: 1, via: "首尔（金浦→仁川换机场）", price: 2643.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Korean Air + Delta Air Lines", flight: "KE864 / DL196", depart: "01:30", arrive: "11:56", arrivePlusDay: true, stops: 1, via: "首尔", price: 2663.00, refundable: "not stated", changeable: "not stated" },
    ],
    businessOptions: null,
  },
  {
    id: "pek-sea-0101",
    route: "北京 → 西雅图",
    date: "2027-01-01",
    dateLabel: "01-01",
    day: 18,
    kind: "intl",
    note: "回程国际段候选（北京出发，2大1小）；Google Flights 实查 2026-09-27 17:49 PDT。当天无直飞。商务舱最低约 $6,592（菲律宾航空经停马尼拉）。国内集结：只需老婆+Dylan 从西安到北京会合（用户已在北京）",
    carrier: null,
    schedule: null,
    priceNote: "3人 $2,978 起",
    businessPriceNote: null,
    direct: false,
    fragile: false,
    queriedAt: "2026-09-27 17:49 PDT（候选日期，待确认后重查）",
    priceBasis: "2大1小总价",
    options: [
      { carrier: "Turkish Airlines", flight: "TK197 / TK203", depart: "08:40", arrive: "17:10", stops: 1, via: "伊斯坦布尔", price: 2978.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天最低价；伊斯坦布尔中转仅1h15m，总时长24h30m" },
      { carrier: "Turkish Airlines + Alaska Airlines", flight: "TK89 / TK179 / AS1375 / AS2134", depart: "00:50", arrive: "20:34", arrivePlusDay: true, stops: 3, via: "伊斯坦布尔/洛杉矶/波特兰（自助转机）", price: 3012.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Cathay Pacific + Alaska Airlines", flight: "CX345 / CX838 / AS1603", depart: "07:30", arrive: "14:40", stops: 2, via: "香港/温哥华", price: 3306.00, refundable: "not stated", changeable: "not stated" },
    ],
    businessOptions: null,
  },
  {
    id: "pek-sea-0102",
    route: "北京 → 西雅图",
    date: "2027-01-02",
    dateLabel: "01-02",
    day: 18,
    kind: "intl",
    note: "回程国际段候选（北京出发，2大1小）；Google Flights 实查 2026-09-27 17:49 PDT。当天有直飞（海航 HU495）。商务舱最低约 $10,280（东航+阿拉斯加，经停上海/温哥华）。国内集结：只需老婆+Dylan 从西安到北京会合（用户已在北京）",
    carrier: "Hainan Airlines HU495",
    schedule: "13:40→08:20",
    priceNote: "3人 $3,750 起",
    businessPriceNote: null,
    direct: true,
    fragile: false,
    queriedAt: "2026-09-27 17:49 PDT（候选日期，待确认后重查）",
    priceBasis: "2大1小总价",
    options: [
      { carrier: "Hainan Airlines", flight: "HU495", depart: "13:40", arrive: "08:20", stops: 0, price: 6925.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天唯一回程直飞；10h40m，带娃最省心（比最便宜中转贵约$3,175）" },
      { carrier: "Sichuan Airlines + Turkish Airlines", flight: "3U6876 / 3U3827 / TK203", depart: "20:15", arrive: "17:10", arrivePlusDay: true, stops: 2, via: "天府/伊斯坦布尔", price: 3750.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Turkish Airlines", flight: "TK197 / TK203", depart: "08:40", arrive: "17:10", stops: 1, via: "伊斯坦布尔", price: 4030.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Korean Air", flight: "KE2052 / KE47", depart: "11:45", arrive: "14:10", stops: 1, via: "首尔（金浦→仁川换机场）", price: 4164.00, refundable: "not stated", changeable: "not stated" },
    ],
    businessOptions: null,
  },
  {
    id: "pvg-sea-1231",
    route: "上海 → 西雅图",
    date: "2026-12-31",
    dateLabel: "12-31",
    day: 18,
    kind: "intl",
    note: "回程国际段候选（上海出发，2大1小）；Google Flights 实查 2026-09-27 17:49 PDT。三天都有达美直飞 DL280。商务舱最低约 $9,013（加航经停温哥华）。国内集结：用户从北京、老婆+Dylan 从西安前往上海会合",
    carrier: "Delta Air Lines DL280",
    schedule: "17:25→12:05",
    priceNote: "3人 $2,616 起",
    businessPriceNote: null,
    direct: true,
    fragile: false,
    queriedAt: "2026-09-27 17:49 PDT（候选日期，待确认后重查）",
    priceBasis: "2大1小总价",
    options: [
      { carrier: "Delta Air Lines", flight: "DL280", depart: "17:25", arrive: "12:05", stops: 0, price: 3658.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "三天中直飞最便宜的一天；10h40m直达，只比最便宜中转贵约$1,000，带娃首选" },
      { carrier: "Korean Air + Alaska Airlines", flight: "KE888 / AS120", depart: "14:00", arrive: "12:55", stops: 1, via: "首尔", price: 2616.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "American Airlines", flight: "AA128 / AA708", depart: "18:50", arrive: "23:09", stops: 1, via: "达拉斯", price: 2907.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Korean Air", flight: "KE888 / KE47", depart: "14:00", arrive: "14:10", stops: 1, via: "首尔", price: 3291.00, refundable: "not stated", changeable: "not stated" },
    ],
    businessOptions: null,
  },
  {
    id: "pvg-sea-0101",
    route: "上海 → 西雅图",
    date: "2027-01-01",
    dateLabel: "01-01",
    day: 18,
    kind: "intl",
    note: "回程国际段候选（上海出发，2大1小）；Google Flights 实查 2026-09-27 17:49 PDT。三天都有达美直飞 DL280。商务舱最低约 $9,213（韩亚+阿拉斯加经停首尔）。国内集结：用户从北京、老婆+Dylan 从西安前往上海会合",
    carrier: "Delta Air Lines DL280",
    schedule: "17:25→12:04",
    priceNote: "3人 $3,444 起",
    businessPriceNote: null,
    direct: true,
    fragile: false,
    queriedAt: "2026-09-27 17:49 PDT（候选日期，待确认后重查）",
    priceBasis: "2大1小总价",
    options: [
      { carrier: "Delta Air Lines", flight: "DL280", depart: "17:25", arrive: "12:04", stops: 0, price: 4909.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天直飞；10h39m，带娃最省心" },
      { carrier: "Japan Airlines", flight: "JL80 / JL68", depart: "10:00", arrive: "10:05", stops: 1, via: "东京（羽田→成田换机场）", price: 3444.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Korean Air + Alaska Airlines", flight: "KE882 / KE71 / AS1603", depart: "11:20", arrive: "14:40", stops: 2, via: "首尔/温哥华（自助转机）", price: 3510.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "American Airlines", flight: "AA128 / AA708", depart: "18:50", arrive: "23:09", stops: 1, via: "达拉斯", price: 3730.00, refundable: "not stated", changeable: "not stated" },
    ],
    businessOptions: null,
  },
  {
    id: "pvg-sea-0102",
    route: "上海 → 西雅图",
    date: "2027-01-02",
    dateLabel: "01-02",
    day: 18,
    kind: "intl",
    note: "回程国际段候选（上海出发，2大1小）；Google Flights 实查 2026-09-27 17:49 PDT。三天都有达美直飞 DL280。商务舱最低约 $10,827（东航+韩亚+达美经停首尔/温哥华）。国内集结：用户从北京、老婆+Dylan 从西安前往上海会合",
    carrier: "Delta Air Lines DL280",
    schedule: "17:25→12:04",
    priceNote: "3人 $3,750 起",
    businessPriceNote: null,
    direct: true,
    fragile: false,
    queriedAt: "2026-09-27 17:49 PDT（候选日期，待确认后重查）",
    priceBasis: "2大1小总价",
    options: [
      { carrier: "Delta Air Lines", flight: "DL280", depart: "17:25", arrive: "12:04", stops: 0, price: 5531.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天直飞；10h39m，带娃最省心" },
      { carrier: "Sichuan Airlines + Turkish Airlines", flight: "3U6996 / 3U3827 / TK203", depart: "18:45", arrive: "17:10", arrivePlusDay: true, stops: 2, via: "天府/伊斯坦布尔", price: 3750.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "American Airlines", flight: "AA128 / AA708", depart: "18:50", arrive: "23:09", stops: 1, via: "达拉斯", price: 3955.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Turkish Airlines", flight: "TK281 / TK203", depart: "09:55", arrive: "17:10", arrivePlusDay: true, stops: 1, via: "伊斯坦布尔（中转22h25m，自助转机）", price: 3998.00, refundable: "not stated", changeable: "not stated" },
    ],
    businessOptions: null,
  },
  {
    id: "ckg-sea-1231",
    route: "重庆 → 西雅图",
    date: "2026-12-31",
    dateLabel: "12-31",
    day: 18,
    kind: "intl",
    note: "回程国际段候选（重庆出发，2大1小）；Google Flights 实查 2026-09-27 17:49 PDT。当天有直飞（海航 HU445）。商务舱最低约 $6,583（东航+阿拉斯加，经停上海/温哥华）。国内集结：用户从北京、老婆+Dylan 从西安前往重庆会合",
    carrier: "Hainan Airlines HU445",
    schedule: "12:20→08:05",
    priceNote: "3人 $2,723 起",
    businessPriceNote: null,
    direct: true,
    fragile: false,
    queriedAt: "2026-09-27 17:49 PDT（候选日期，待确认后重查）",
    priceBasis: "2大1小总价",
    options: [
      { carrier: "Hainan Airlines", flight: "HU445", depart: "12:20", arrive: "08:05", stops: 0, price: 6263.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天唯一直飞；11h45m，带娃最省心（比最便宜中转贵约$3,540）" },
      { carrier: "Qatar Airways", flight: "QR881 / QR719", depart: "01:10", arrive: "11:40", stops: 1, via: "多哈", price: 2723.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Capital Airlines + Alaska Airlines", flight: "JD5692 / JD471 / AS1601", depart: "10:55", arrive: "07:10", arrivePlusDay: true, stops: 3, via: "杭州/青岛/温哥华（自助转机，中段航班号未显示）", price: 2972.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Air China + Cathay Pacific + Alaska Airlines", flight: "CA419 / CX838 / AS1603", depart: "11:50", arrive: "14:40", stops: 2, via: "香港/温哥华", price: 3579.00, refundable: "not stated", changeable: "not stated" },
    ],
    businessOptions: null,
  },
  {
    id: "ckg-sea-0101",
    route: "重庆 → 西雅图",
    date: "2027-01-01",
    dateLabel: "01-01",
    day: 18,
    kind: "intl",
    note: "回程国际段候选（重庆出发，2大1小）；Google Flights 实查 2026-09-27 17:49 PDT。当天无直飞。商务舱最低约 $7,174（厦航+阿拉斯加经停厦门/温哥华）。国内集结：用户从北京、老婆+Dylan 从西安前往重庆会合",
    carrier: null,
    schedule: null,
    priceNote: "3人 $3,753 起",
    businessPriceNote: null,
    direct: false,
    fragile: false,
    queriedAt: "2026-09-27 17:49 PDT（候选日期，待确认后重查）",
    priceBasis: "2大1小总价",
    options: [
      { carrier: "Spring Airlines + Korean Air + Alaska Airlines", flight: "9C6108 / KE882 / KE71 / AS1603", depart: "05:40", arrive: "14:40", stops: 3, via: "上海/首尔/温哥华（自助转机）", price: 3753.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天最低价；3停自助转机共25小时，带娃慎选" },
      { carrier: "Cathay Pacific + Alaska Airlines", flight: "CX929 / CX888 / AS1601", depart: "17:15", arrive: "07:10", arrivePlusDay: true, stops: 2, via: "香港/温哥华", price: 3966.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "XiamenAir + Air Canada", flight: "MF8434 / MF805 / AC8810", depart: "15:30", arrive: "21:57", stops: 2, via: "厦门/温哥华（自助转机）", price: 4390.00, refundable: "not stated", changeable: "not stated" },
    ],
    businessOptions: null,
  },
  {
    id: "ckg-sea-0102",
    route: "重庆 → 西雅图",
    date: "2027-01-02",
    dateLabel: "01-02",
    day: 18,
    kind: "intl",
    note: "回程国际段候选（重庆出发，2大1小）；Google Flights 实查 2026-09-27 17:49 PDT。当天无直飞（海航改经北京中转）。商务舱最低约 $9,707（东航+阿拉斯加经停上海/温哥华）。国内集结：用户从北京、老婆+Dylan 从西安前往重庆会合",
    carrier: null,
    schedule: null,
    priceNote: "3人 $3,190 起",
    businessPriceNote: null,
    direct: false,
    fragile: false,
    queriedAt: "2026-09-27 17:49 PDT（候选日期，待确认后重查）",
    priceBasis: "2大1小总价",
    options: [
      { carrier: "Qatar Airways", flight: "QR881 / QR719", depart: "01:10", arrive: "11:40", stops: 1, via: "多哈", price: 3190.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天最低价；多哈中转2h40m，总时长26h30m" },
      { carrier: "China Eastern + EVA Air", flight: "MU5796 / MU9605 / BR386 / BR24", depart: "06:40", arrive: "17:30", stops: 3, via: "昆明/河内/台北（自助转机）", price: 3323.00, refundable: "not stated", changeable: "not stated" },
      { carrier: "Air China + Korean Air", flight: "CA439 / KE41", depart: "08:30", arrive: "09:05", stops: 1, via: "首尔（自助转机）", price: 5275.00, refundable: "not stated", changeable: "not stated" },
    ],
    businessOptions: null,
  },
];

/** 每城住宿段：时间线只列"选 1 家"的行动，候选明细在城市参考区。 */
export const HOTEL_STAYS = [
  { city: "新加坡", checkInLabel: "12-12", nights: 5, daysLabel: "D1–D5" },
  { city: "普吉", checkInLabel: "12-17", nights: 3, daysLabel: "D6–D8" },
  { city: "曼谷", checkInLabel: "12-20", nights: 3, daysLabel: "D9–D11" },
  { city: "清迈", checkInLabel: "12-23", nights: 2, daysLabel: "D12–D13" },
];

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
