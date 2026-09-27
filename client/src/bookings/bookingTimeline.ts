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

/** Google Flights 同一天的一个可选行程（价格为查询时总价，USD；城际段=2成人，国际段见 priceBasis）。 */
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

/** 3 段城际 + 5 段国际（北京→新加坡、西安→新加坡、新加坡→西安、曼谷→西安、西安→北京）。用户要求只看直飞：options 仅保留 stops=0，无直飞的段 options 为空。本轮 2026-09-27 16:27 PDT 全量刷新：8 段全部改用 Google Flights 实查（含经济舱/商务舱价格），泰国顺序改为普吉→清迈→曼谷→西安。 */
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
      { carrier: "Air China", flight: "CA889", depart: "09:45", arrive: "16:15", stops: 0, price: 514.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天最低价；09:45出发、16:15抵达，白天航班带2岁娃不折腾" },
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
    note: "D6 转场：新加坡段结束、普吉段开始；Google Flights 实查 2026-09-27 16:27 PDT（2 成人直飞，当天 9 班：酷航×3、新航×6）",
    carrier: "Scoot TR678",
    schedule: "08:40→09:40",
    priceNote: "2人 $345 起",
    businessPriceNote: "2人 $1,809 起（仅新航有商务舱，酷航为廉航无商务舱）",
    direct: true,
    fragile: false,
    queriedAt: "2026-09-27 16:27 PDT",
    options: [
      { carrier: "Scoot", flight: "TR678", depart: "08:40", arrive: "09:40", stops: 0, price: 345.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天最低价；早上到普吉，下午能直接玩" },
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
    priceNote: "2人 $194 起",
    businessPriceNote: "无商务舱直飞（亚航、越捷均为廉航，无商务舱）",
    direct: true,
    fragile: false,
    queriedAt: "2026-09-27 16:27 PDT",
    options: [
      { carrier: "VietJet Air", flight: "VZ415", depart: "08:15", arrive: "10:20", stops: 0, price: 194.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天最低价；早上到清迈，下午能直接玩" },
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
    carrier: "VietJet Air VZ2104",
    schedule: "06:35→07:55",
    priceNote: "2人 $86 起",
    businessPriceNote: "2人 $407 起（仅泰航有商务舱，如 14:05→15:25）",
    direct: true,
    fragile: false,
    queriedAt: "2026-09-27 16:27 PDT",
    options: [
      { carrier: "VietJet Air", flight: "VZ2104", depart: "06:35", arrive: "07:55", stops: 0, price: 86.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "早班机，07:55到曼谷，有一整天可以玩；只比半夜那班贵 $1" },
      { carrier: "VietJet Air", flight: "VZ119", depart: "22:35", arrive: "23:55", stops: 0, price: 85.00, refundable: "not stated", changeable: "not stated", recommendReason: "便宜 $1，但 23:55 半夜到曼谷，到酒店都凌晨了，浪费一天，不推荐" },
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
    note: "用户一人回北京；在西安待3-4天后离开（候选日期，待用户在/planner确认）；Google Flights 实查 2026-09-27 16:27 PDT（1成人，当天 15 班直飞：国航×11、海航×4）",
    carrier: "Hainan Airlines HU7538",
    schedule: "21:50→00:20+1",
    priceNote: "1人 $94 起",
    businessPriceNote: "1人 $231 起（海航 21:50→00:20+1；国航商务 $411–435）",
    direct: true,
    fragile: false,
    queriedAt: "2026-09-27 16:27 PDT（候选日期，待确认后重查）",
    priceBasis: "1成人单价",
    options: [
      { carrier: "Hainan Airlines", flight: "HU7538", depart: "21:50", arrive: "00:20", arrivePlusDay: true, stops: 0, price: 94.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天最低价；晚上飞、半夜到，1个人无所谓" },
    ],
    businessOptions: [
      { carrier: "Hainan Airlines", flight: "HU7538", depart: "21:50", arrive: "00:20", arrivePlusDay: true, stops: 0, price: 231.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "同班商务舱，1人 $231 性价比最高" },
    ],
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
