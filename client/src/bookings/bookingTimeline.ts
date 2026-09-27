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
  direct?: boolean | null;
  fragile?: boolean | null;
  /** Duffel 实查的当天全部直飞选项（价格为查询时总价，USD；城际段=2成人，国际段见 priceBasis）；空 = 未查询 */
  options?: FlightOption[] | null;
  /** 实查时间戳，如 "2026-09-27 02:17 PDT" */
  queriedAt?: string | null;
  /** 价格口径说明，如 "1成人单价"；缺省为 2 成人总价 */
  priceBasis?: string | null;
}

/** Duffel 同一天的一个可选行程（价格为查询时总价，USD；城际段=2成人，国际段=1成人）。 */
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

/** 3 段城际 + 5 段国际（北京→新加坡、西安→新加坡、新加坡→西安、清迈→北京、清迈→西安）。用户要求只看直飞：options 仅保留 stops=0，无直飞的段 options 为空。本轮 2026-09-27 09:25 PDT 实查刷新：PEK→SIN（2大1小）、XIY→SIN（2成人）、SIN→XIY（2大1小）（Duffel 搜索 3/3，全部成功）。 */
export const FLIGHT_LEGS: FlightLegInfo[] = [
  {
    id: "intl-out-bj",
    route: "北京 → 新加坡",
    date: "2026-12-12",
    dateLabel: "12-12",
    day: 1,
    kind: "intl",
    note: "去程国际段（用户一家三口）；Duffel 实查 2026-09-27 09:25 PDT（2大1小，当天多班真直飞）",
    carrier: "Air China CA0889",
    schedule: "09:45→16:15",
    priceNote: "3人 $643.00 起",
    direct: true,
    fragile: false,
    queriedAt: "2026-09-27 09:25 PDT",
    priceBasis: "2大1小总价",
    options: [
      { carrier: "Air China", flight: "CA0889", depart: "09:45", arrive: "16:15", stops: 0, bags: "1件", price: 643.00, refundable: "no", changeable: "yes", recommend: true, recommendReason: "当天最低价；09:45出发、16:15抵达，白天航班带2岁娃不折腾" },
      { carrier: "Air China", flight: "CA0975", depart: "00:15", arrive: "06:50", stops: 0, bags: "1件", price: 674.00, refundable: "no", changeable: "yes" },
      { carrier: "Singapore Airlines", flight: "SQ0805", depart: "08:45", arrive: "15:20", stops: 0, bags: "1件", price: 756.80, refundable: "yes", changeable: "yes" },
    ],
  },
  {
    id: "intl-out",
    route: "西安 → 新加坡",
    date: "2026-12-12",
    dateLabel: "12-12",
    day: 1,
    kind: "intl",
    note: "去程国际段（岳父母）；Duffel 实查 2026-09-27 09:25 PDT（2 成人，当天唯一真直飞）",
    carrier: "Scoot（Hahn Air 出票）TR0135",
    schedule: "01:55→07:50",
    priceNote: "2人 $578.80 起",
    direct: true,
    fragile: true,
    queriedAt: "2026-09-27 09:25 PDT",
    priceBasis: "2成人总价",
    options: [
      { carrier: "Scoot（Hahn Air 出票）", flight: "TR0135", depart: "01:55", arrive: "07:50", stops: 0, bags: "1件", price: 578.80, refundable: "no", changeable: "yes", recommend: true, recommendReason: "当天唯一真直飞，5小时55分；01:55红眼出发、07:50当天抵达；老人半夜赶飞机较辛苦，介意可考虑提前一天到新加坡" },
    ],
  },
  {
    id: "sin-hkt",
    route: "新加坡 → 普吉",
    date: "2026-12-17",
    dateLabel: "12-17",
    day: 6,
    kind: "intercity",
    note: "D6 转场：新加坡段结束、普吉段开始；Duffel 实查 2026-09-27 06:14 PDT（2 成人直飞，当天 13 班可选）",
    carrier: "Scoot TR0652",
    schedule: "18:15→19:20",
    priceNote: "2人 $741.40 起",
    direct: true,
    fragile: false,
    queriedAt: "2026-09-27 06:14 PDT",
    options: [
      { carrier: "Scoot", flight: "TR0652", depart: "18:15", arrive: "19:20", stops: 0, bags: "1件", price: 741.40, refundable: "no", changeable: "yes", recommend: true, recommendReason: "当天最低价；酷航是新航旗下廉航，新加坡进出首选" },
      { carrier: "Scandinavian Airlines Ireland Limited", flight: "SL0103", depart: "15:30", arrive: "16:20", stops: 0, bags: "待定", price: 745.40, refundable: "no", changeable: "yes" },
      { carrier: "Scoot", flight: "TR0678", depart: "08:40", arrive: "09:40", stops: 0, bags: "1件", price: 865.40, refundable: "no", changeable: "yes" },
      { carrier: "Scoot", flight: "TR0644", depart: "11:15", arrive: "12:20", stops: 0, bags: "1件", price: 865.40, refundable: "no", changeable: "yes" },
      { carrier: "Singapore Airlines", flight: "SQ0724", depart: "06:55", arrive: "07:50", stops: 0, bags: "1件", price: 933.40, refundable: "yes", changeable: "yes" },
      { carrier: "Singapore Airlines", flight: "SQ0740", depart: "18:35", arrive: "19:35", stops: 0, bags: "1件", price: 989.40, refundable: "yes", changeable: "yes" },
      { carrier: "Bangkok Airways", flight: "PG4716", depart: "08:15", arrive: "09:15", stops: 0, bags: "1件", price: 1045.40, refundable: "yes", changeable: "yes" },
      { carrier: "Bangkok Airways", flight: "PG4722", depart: "16:10", arrive: "17:10", stops: 0, bags: "1件", price: 1045.40, refundable: "yes", changeable: "yes" },
      { carrier: "Bangkok Airways", flight: "PG4724", depart: "18:35", arrive: "19:35", stops: 0, bags: "1件", price: 1045.40, refundable: "yes", changeable: "yes" },
      { carrier: "Singapore Airlines", flight: "SQ0732", depart: "12:50", arrive: "13:55", stops: 0, bags: "1件", price: 1227.40, refundable: "yes", changeable: "yes" },
      { carrier: "Singapore Airlines", flight: "SQ0728", depart: "09:00", arrive: "10:05", stops: 0, bags: "1件", price: 1227.40, refundable: "yes", changeable: "yes" },
      { carrier: "Singapore Airlines", flight: "SQ0736", depart: "16:10", arrive: "17:10", stops: 0, bags: "1件", price: 1227.40, refundable: "yes", changeable: "yes" },
      { carrier: "Singapore Airlines", flight: "SQ0726", depart: "08:15", arrive: "09:15", stops: 0, bags: "1件", price: 1227.40, refundable: "yes", changeable: "yes" },
    ],
  },
  {
    id: "sin-xiy",
    route: "新加坡 → 西安",
    date: "2026-12-17",
    dateLabel: "12-17",
    day: 6,
    kind: "intl",
    note: "新加坡段结束：岳父母带娃回西安；Duffel 实查 2026-09-27 09:25 PDT（2大1小，当天唯一真直飞）",
    carrier: "Scoot（Hahn Air 出票）TR0134",
    schedule: "19:15→00:45+1",
    priceNote: "3人 $1575.00 起",
    direct: true,
    fragile: true,
    queriedAt: "2026-09-27 09:25 PDT",
    priceBasis: "2大1小总价",
    options: [
      { carrier: "Scoot（Hahn Air 出票）", flight: "TR0134", depart: "19:15", arrive: "00:45", arrivePlusDay: true, stops: 0, bags: "1件", price: 1575.00, refundable: "not stated", changeable: "not stated", recommend: true, recommendReason: "当天唯一真直飞，5小时30分；注意 00:45+1 半夜抵达西安，带2岁娃需提前安排接机" },
    ],
  },
  {
    id: "hkt-bkk",
    route: "普吉 → 曼谷",
    date: "2026-12-20",
    dateLabel: "12-20",
    day: 9,
    kind: "intercity",
    note: "D9 转场：普吉段结束、曼谷段开始；Duffel 实查 2026-09-27 06:14 PDT（2 成人直飞，当天 15 班可选；泰航当天 9 班同价 $231.80，可退可改）",
    carrier: "Bangkok Airways PG0270",
    schedule: "07:45→09:20",
    priceNote: "2人 $207.80 起",
    direct: true,
    fragile: false,
    queriedAt: "2026-09-27 06:14 PDT",
    options: [
      { carrier: "Bangkok Airways", flight: "PG0270", depart: "07:45", arrive: "09:20", stops: 0, bags: "1件", price: 207.80, refundable: "no", changeable: "yes", recommend: true, recommendReason: "当天最低价+早班机；曼谷航空是精品航司，票价含20kg行李+餐食+贵宾室" },
      { carrier: "Bangkok Airways", flight: "PG0280", depart: "22:00", arrive: "23:35", stops: 0, bags: "1件", price: 207.80, refundable: "no", changeable: "yes" },
      { carrier: "Thai Airways", flight: "TG0228", depart: "09:05", arrive: "10:35", stops: 0, bags: "1件", price: 231.80, refundable: "yes", changeable: "yes" },
      { carrier: "Thai Airways", flight: "TG0202", depart: "09:50", arrive: "11:20", stops: 0, bags: "1件", price: 231.80, refundable: "yes", changeable: "yes" },
      { carrier: "Thai Airways", flight: "TG0204", depart: "10:25", arrive: "11:55", stops: 0, bags: "1件", price: 231.80, refundable: "yes", changeable: "yes" },
      { carrier: "Thai Airways", flight: "TG0206", depart: "11:50", arrive: "13:20", stops: 0, bags: "1件", price: 231.80, refundable: "yes", changeable: "yes" },
      { carrier: "Thai Airways", flight: "TG0208", depart: "13:40", arrive: "15:10", stops: 0, bags: "1件", price: 231.80, refundable: "yes", changeable: "yes" },
      { carrier: "Thai Airways", flight: "TG0212", depart: "16:05", arrive: "17:35", stops: 0, bags: "1件", price: 231.80, refundable: "yes", changeable: "yes" },
      { carrier: "Thai Airways", flight: "TG0216", depart: "17:10", arrive: "18:40", stops: 0, bags: "1件", price: 231.80, refundable: "yes", changeable: "yes" },
      { carrier: "Thai Airways", flight: "TG0218", depart: "19:25", arrive: "21:00", stops: 0, bags: "1件", price: 231.80, refundable: "yes", changeable: "yes" },
      { carrier: "Thai Airways", flight: "TG0222", depart: "20:40", arrive: "22:15", stops: 0, bags: "1件", price: 231.80, refundable: "yes", changeable: "yes" },
      { carrier: "Bangkok Airways", flight: "PG0274", depart: "15:00", arrive: "16:35", stops: 0, bags: "1件", price: 231.80, refundable: "no", changeable: "yes" },
      { carrier: "Bangkok Airways", flight: "PG0278", depart: "19:50", arrive: "21:25", stops: 0, bags: "1件", price: 231.80, refundable: "no", changeable: "yes" },
      { carrier: "Bangkok Airways", flight: "PG0272", depart: "10:20", arrive: "11:55", stops: 0, bags: "1件", price: 261.80, refundable: "no", changeable: "yes" },
      { carrier: "Bangkok Airways", flight: "PG0276", depart: "12:45", arrive: "14:20", stops: 0, bags: "1件", price: 261.80, refundable: "no", changeable: "yes" },
    ],
  },
  {
    id: "bkk-cnx",
    route: "曼谷 → 清迈",
    date: "2026-12-23",
    dateLabel: "12-23",
    day: 12,
    kind: "intercity",
    note: "D12 转场：曼谷段结束、清迈段开始；Duffel 实查 2026-09-27 02:46 PDT（2 成人直飞，当天 13 班可选；可退可改）",
    carrier: "Thai Airways TG0100",
    schedule: "06:00→07:20",
    priceNote: "2人 $167.80 起",
    direct: true,
    fragile: false,
    queriedAt: "2026-09-27 02:46 PDT",
    options: [
      { carrier: "Thai Airways", flight: "TG0100", depart: "06:00", arrive: "07:20", bags: "1件", price: 167.80, refundable: "yes", changeable: "yes", recommend: true, recommendReason: "当天最低价+早班机+可退可改；上午到清迈，下午能直接玩" },
      { carrier: "Thai Airways", flight: "TG0122", depart: "09:00", arrive: "10:20", bags: "1件", price: 227.80, refundable: "yes", changeable: "yes" },
      { carrier: "Thai Airways", flight: "TG0114", depart: "17:30", arrive: "18:50", bags: "1件", price: 227.80, refundable: "yes", changeable: "yes" },
      { carrier: "Thai Airways", flight: "TG0102", depart: "07:25", arrive: "08:45", bags: "1件", price: 243.80, refundable: "yes", changeable: "yes" },
      { carrier: "Thai Airways", flight: "TG0120", depart: "19:05", arrive: "20:25", bags: "1件", price: 243.80, refundable: "yes", changeable: "yes" },
      { carrier: "Bangkok Airways", flight: "PG0215", depart: "08:05", arrive: "09:25", bags: "1件", price: 257.80, refundable: "yes", changeable: "yes" },
      { carrier: "Thai Airways", flight: "TG0104", depart: "10:15", arrive: "11:30", bags: "1件", price: 273.80, refundable: "yes", changeable: "yes" },
      { carrier: "Thai Airways", flight: "TG0112", depart: "15:05", arrive: "16:25", bags: "1件", price: 273.80, refundable: "yes", changeable: "yes" },
      { carrier: "Bangkok Airways", flight: "PG0223", depart: "10:00", arrive: "11:20", bags: "1件", price: 299.80, refundable: "yes", changeable: "yes" },
      { carrier: "Bangkok Airways", flight: "PG0219", depart: "17:40", arrive: "19:00", bags: "1件", price: 299.80, refundable: "yes", changeable: "yes" },
      { carrier: "Thai Airways", flight: "TG0106", depart: "12:00", arrive: "13:20", bags: "1件", price: 315.80, refundable: "yes", changeable: "yes" },
      { carrier: "Bangkok Airways", flight: "PG0225", depart: "12:25", arrive: "13:45", bags: "1件", price: 381.80, refundable: "yes", changeable: "yes" },
      { carrier: "Thai Airways", flight: "TG0110", depart: "13:25", arrive: "14:40", bags: "1件", price: 395.80, refundable: "yes", changeable: "yes" },
    ],
  },
  {
    id: "intl-back-bj",
    route: "清迈 → 北京",
    date: "2026-12-25",
    dateLabel: "12-25",
    day: 14,
    kind: "intl",
    note: "回程国际段（用户回北京）；新行程清迈酒店 12/25 退房，当天离开；以下为 Duffel 2026-09-27 按 12/24 查得（1成人），12/25 今晚自动重查更新",
    carrier: "Air China CA0824",
    schedule: "23:05→04:20+1",
    priceNote: "1人 $226.60 起（12/24 查得）",
    direct: true,
    fragile: true,
    queriedAt: "2026-09-27 02:46 PDT",
    priceBasis: "1成人单价",
    options: [
      { carrier: "Air China", flight: "CA0824", depart: "23:05", arrive: "04:20", arrivePlusDay: true, stops: 0, bags: "1件", price: 226.60, refundable: "no", changeable: "yes", recommend: true, recommendReason: "12/24 当天唯一真直飞且最低价；23:05红眼、04:20到北京，4小时15分；凌晨到需提前安排接机/酒店入住" },
    ],
  },
  {
    id: "intl-back-xiy",
    route: "清迈 → 西安",
    date: "2026-12-25",
    dateLabel: "12-25",
    day: 14,
    kind: "intl",
    note: "回程国际段（妻子回西安）；新行程清迈酒店 12/25 退房，当天离开；Duffel 2026-09-27 按 12/24 实查当天无直飞（按用户要求只保留直飞），12/25 今晚自动重查更新",
    carrier: null,
    schedule: null,
    priceNote: "暂无直飞（12/24 查得）",
    direct: false,
    fragile: false,
    queriedAt: "2026-09-27 02:40 PDT",
    priceBasis: "1成人单价",
    options: [
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
