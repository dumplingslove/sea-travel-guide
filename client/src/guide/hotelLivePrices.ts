/** 按行程实际住宿日期实查的酒店价格（USD）。
 * 数据来源：Trip.com 房型级实时价格，2 成人 1 间。
 * 查询时间：2026-09-24 20:15–21:35 PDT（21 家首批）；2026-09-26 07:43–08:26 PDT（30 家补齐，全站 51 家覆盖）；2026-09-27 06:59 PDT（新加坡 4 家按新行程日期 12/12–12/17 重查）；2026-09-27 08:51 PDT（普吉 6 家同日期 12/17–12/20 重查）；2026-09-27 08:54 PDT（清迈 6 家按新行程日期 12/23–12/25 重查）；2026-09-27 08:57 PDT（新加坡 Raffles/Ritz-Carlton/文华东方按 12/12–12/17 重查＋富丽敦套房补齐）；2026-09-27 09:04 PDT（曼谷 9 家按新行程日期 12/20–12/23 重查；2026-09-28 22:08–22:23 UTC（28 家行程酒店按新行程日期全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、曼谷 12/14–12/17、清迈 12/17–12/19；Raffles 新加坡该日期整店售罄）。
 * 2026-09-29 13:37–13:48 UTC（28 家行程酒店全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、曼谷 12/14–12/17、清迈 12/17–12/19；Raffles 新加坡该日期仍整店售罄）。
 * 价格为动态数据：行程日期变化或定期刷新时由 hotel-price-watch 任务重查并更新本文件。
 * 2026-09-30 site-improve：曼谷 9 家（查 12/14–12/17）与清迈 6 家（查 12/17–12/19）为旧行程顺序（曼谷→清迈）日期，用户当前行程为清迈 12/14–12/16、曼谷 12/16–12/19，已标 dateMismatch；待 hotel-price-watch 按新行程重查后清除该标记。
 * 键必须与 data.ts 酒店名逐字一致（含中文后缀）。
 * 2026-10-01 13:41–16:25 UTC（28 家行程酒店全量重查：新加坡/普吉沿用今早 06:41–06:50 PDT 回执（日期无误：新加坡 12/06–12/11、普吉 12/11–12/14）；曼谷按新行程日期 12/16–12/19、清迈按新行程日期 12/14–12/16 重查；Raffles 新加坡仍整店售罄；曼谷文华东方在新日期整店售罄（This hotel is not currently accepting bookings）；Bangkok/Chiang Mai 的 dateMismatch 标记已清除）。
 * 2026-10-02 13:25–13:45 UTC（28 家行程酒店全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、清迈 12/14–12/16、曼谷 12/16–12/19；Raffles 新加坡与曼谷文华东方该日期整店售罄；曼谷丽思卡尔顿本轮无 Suite 命名房型）。
 * 2026-10-03 16:23–16:53 UTC（28 家行程酒店全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、清迈 12/14–12/16、曼谷 12/16–12/19；Raffles 新加坡与曼谷文华东方该日期仍整店售罄；Amanpuri 基础房 +17.8%（$3,100→$3,653/晚，同为 Garden Pool Pavilion）；Rosewood Bangkok 套房 +10.3%（$632→$697/晚，同为 Premier Suite）；新加坡 7 家页面未显示数字总价、按每晚×晚数机械推算已在 note 标注；无验证码/风控墙）。
 * 2026-10-04 15:12–15:35 UTC（28 家行程酒店按用户新口径重查：新加坡 12/06–12/10 4晚、普吉 12/10–12/13 3晚、清迈 12/13–12/15 2晚、曼谷 12/15–12/18 3晚；新加坡 5 家遇 Trip.com 登录墙、按规则未登录硬刷，保留上一轮价格并标 dateMismatch；Raffles 新加坡该日期仍整店售罄；页面未显示数字总价的不再机械相乘（totalUSD=null、totalInclTax='unknown'）。
 * 2026-10-04 17:14 UTC（新加坡 5 家按 12/06–12/10 4晚重查：用户亲自登录 Trip.com 会员；MBS $699/晚、Ritz $428/晚、文华东方 $458/晚、香格里拉 $260/晚（会员10% off）、富丽敦 $283/晚（会员10% off）；dateMismatch 清除；套房价仍为 10-03 旧日期数据，标 suiteNote 待更新）。
 * 2026-10-04 审计修复：10-03 轮合并时误删 23 家非行程城市酒店（吉隆坡5/槟城5/胡志明9/富国岛4），本轮从 01bc1ee 原样恢复（价格为 2026-09-25/26 实查，checkedAt 保留原值）；恢复后 data.ts 51 名 ↔ 本文件 51 键双向零差异。
 * 2026-10-04（首尔 9 家 Trip.com 深查：入住 2026-12-31/退房 2027-01-01/1晚/2成人1间；每晚价+房型+早餐+取消政策+税费口径实查）。
 * 2026-10-05 14:20–16:56 UTC（28 家行程酒店全量重查：新加坡 12/06–12/10、普吉 12/10–12/13、清迈 12/13–12/15、曼谷 12/15–12/18；全程未登录（Trip.com 无登录墙）；Raffles 新加坡该日期仍整店售罄；新加坡 5 家会员价因未登录不可见（上一轮 17:14 登录价）；页面未显示数字总价的不做机械相乘（totalUSD=null、totalInclTax='unknown'）
 * 2026-10-06 13:54–15:01 UTC（28 家行程酒店全量重查：新加坡 12/06–12/10、普吉 12/10–12/13、清迈 12/13–12/15、曼谷 12/15–12/18；全程未登录、Trip.com 无登录墙/验证码；Raffles 新加坡该日期仍整店售罄；曼谷文华东方恢复可订（10-02 起售罄）；页面未显示数字总价的不做机械相乘（totalUSD=null、totalInclTax='unknown'）；Rosewood 曼谷基础房与曼谷文华东方套房的早餐口径页面自相矛盾，按铁律记"未明确"；新加坡 5 家今日为未登录公开价（昨日 Ritz/香格里拉/富丽敦已是公开价、MBS/文华东方为 10-04 登录价；同口径下 5 家实质持平））
*/

export interface LiveRoomRate {
  /** 房型名称（OTA 原文） */
  room: string;
  /** 每晚 USD */
  perNightUSD: number;
  /** 整段住宿 USD 总价；页面未显示数字总价时为 null（不许用每晚×晚数机械推算） */
  totalUSD: number | null;
  /** 总价是否含税费；页面未说明时为 'unknown' */
  totalInclTax: boolean | "unknown";
  /** 取消政策原文摘要 */
  cancel: string;
  /** 早餐说明 */
  breakfast: string;
  /** 备注（如仅剩几间、单人价等） */
  note?: string;
  /** 会员专属折扣（如 Trip.com Platinum Tier Deal 10% off，原价→会员价）；无则不填 */
  memberDeal?: string;
}

export interface LiveHotelPrice {
  /** 行程住宿日期（入住） YYYY-MM-DD */
  checkIn: string;
  /** 退房 YYYY-MM-DD */
  checkOut: string;
  nights: number;
  /** 最便宜可订基础房；null = 该日期无可订基础房 */
  base: LiveRoomRate | null;
  baseNote?: string;
  /** 最便宜可订套房；null = 该日期未找到可订套房 */
  suite: LiveRoomRate | null;
  suiteNote?: string;
  /** 整店无价（如 Fusion）：说明原因 */
  unavailable?: string;
  /** 行程日期调整后查询日期已错位：价格真实但非当前行程日期，仅供参考 */
  dateMismatch?: boolean;
  source: string;
  /** 查询时间（UTC） */
  checkedAt: string;
  /** Google Hotels 基准价（每晚 USD），横向对比用 baseline；未查到则不填 */
  baselineUSD?: number;
  /** baseline 查询时间 */
  baselineCheckedAt?: string;
  /** Google Hotels 可验证链接（搜索页，用户可点过去核对） */
  baselineUrl?: string;
  /** Amex Travel 实查价（每晚 USD）；未查到则不填，卡片显示"未明确" */
  amexUSD?: number;
  /** Amex 查询时间 */
  amexCheckedAt?: string;
  /** Chase Travel 实查价（每晚 USD）；未查到则不填，卡片显示"未明确" */
  chaseUSD?: number;
  /** Chase 查询时间 */
  chaseCheckedAt?: string;
}

export const hotelLivePrices: Record<string, LiveHotelPrice> = {
  'Capella Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Premier Twin Room With Garden View', perNightUSD: 1292, totalUSD: 5632, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 2', breakfast: '需付费 (page: \'Great breakfast for $63.83 (optional)\')', note: 'Last booked 2 hrs ago; Best price with free cancellation; Instant confirmation; Prepay online; Earn $281.60 in Trip Coins' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page.',
  suite: { room: 'Sentosa Suite', perNightUSD: 1722, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 2', breakfast: '需付费 (page: \'Great breakfast for $63.83 (optional)\')', note: 'Earn $375.46 in Trip Coins; Instant confirmation; Prepay online' },
  suiteNote: 'Cheapest bookable suite; page shows no numeric whole-stay total for suites.',
  baselineUSD: 998, baselineCheckedAt: '2026-10-06T15:01:18Z',
  baselineUrl: 'https://www.google.com/travel/search?q=capella%20singapore&qs=CAEgASgAMidDaGtJNVlyU3dwdnVqUDFVR2cwdlp5OHhNV1l5YzJnelp6Tm5FQUVIAA&ved=0CAAQ5JsGahcKEwiwlL_fvaWXAxUAAAAAHQAAAAAQaw&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=KigKEglNkOZt1_TzPxH9PuOon_RZQBISCdrY8u1bCfQ_Ef0-49zj9FlAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T15:01:18Z',
 },
  'Raffles Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: null,
  baseNote: 'No bookable rooms for Dec 6-10, 2026.',
  suite: null,
  suiteNote: 'No bookable rooms for Dec 6-10, 2026.',
  unavailable: 'No rooms available for Dec 6-10, 2026 on Trip.com (page states \'No rooms available for your selected dates\'; suggests nearby dates: Dec 3-4 from $1,285, Dec 5-6 from $1,294). Google Hotels baseline likewise shows no bookable rooms for Dec 6-10 (only Dec 5-9 for $922).',
  baselineUrl: 'https://www.google.com/travel/search?q=raffles%20singapore&qs=CAEgASgAMiJDaFVJd3IzenN0dUl6cjlrR2drdmJTOHdNMncyTXpBUUFRSAA&ved=0CAAQ5JsGahcKEwjIpbD3v6WXAxUAAAAAHQAAAAAQbQ&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=KigKEglvXOcioKz0PxGzMWV8kfZZQBISCaQZkYskwfQ_EbMxZbDV9llAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T15:01:18Z',
 },
  'Marina Bay Sands': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Sands Premier King', perNightUSD: 700, totalUSD: 3051, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: '含免费早餐 (page: \'Includes 2 great breakfasts\')', note: 'Last booked 6 hrs ago; Best price with breakfast and free cancellation; Exclusive price for multi-night stays, Early bird price; Instant confirmation; Prepay online' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page. | 今日价格为 Trip.com 未登录公开价。 | baselineUrl 说明：任务回执的 baselineUrl 中 q 参数为 capella（疑复制粘贴误差），baselineUSD 603 为 MBS 页面实查值，原样保留。',
  suite: { room: 'Sands Bay Suite King Gardens By The Bay View', perNightUSD: 1319, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: '含免费早餐 (page: \'Includes 2 great breakfasts\')', note: 'Exclusive price for multi-night stays, Early bird price; Instant confirmation; Prepay online' },
  suiteNote: 'Cheapest bookable suite; page shows no numeric whole-stay total for suites. | 今日价格为 Trip.com 未登录公开价。',
  baselineUSD: 603, baselineCheckedAt: '2026-10-06T15:01:18Z',
  baselineUrl: 'https://www.google.com/travel/search?q=capella%20singapore&qs=CAEgASgAMiJDaFVJMTd2VjB1X2ZwcllDR2drdmJTOHdaR1E1TURNUUFRSAA&ved=0CAAQ5JsGahgKEwiwlL_fvaWXAxUAAAAAHQAAAAAQ6wE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=KigKEglNkOZt1_TzPxH9PuOon_RZQBISCdrY8u1bCfQ_Ef0-49zj9FlAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T15:01:18Z',
 },
  'The Ritz-Carlton, Millenia Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Deluxe Kallang Twin Room', perNightUSD: 456, totalUSD: 1989, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Oct 7', breakfast: '含免费早餐 (page: \'Includes 2 great breakfasts\')', note: 'Last booked 12 mins ago; Best price with breakfast and free cancellation; Instant confirmation; Prepay online' },
  baseNote: 'Cheapest bookable base room; total re-verified on latest list page ($1,989, 1 room x 4 nights incl. taxes & fees). | 今日价格为 Trip.com 未登录公开价。',
  suite: { room: 'Club Deluxe King Suite, Club Lounge Access, High Floor', perNightUSD: 878, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '含免费早餐 (page: \'Includes 2 great breakfasts\')', note: 'Instant confirmation; Pay at hotel' },
  suiteNote: 'Cheapest bookable suite; page shows no numeric whole-stay total for suites. | 今日价格为 Trip.com 未登录公开价。',
  baselineUSD: 414, baselineCheckedAt: '2026-10-06T15:01:18Z',
  baselineUrl: 'https://www.google.com/travel/hotels/entity/ChYI356X_oXolLmuARoJL20vMGJ6X2I0EAE?ap=KigKEgl7giMVA4D0PxH8URTX2PZZQBISCQ_ijYOHlPQ_EfxRlFwe91lAMAE&ved=0CAAQ5JsGahgKEwiwlL_fvaWXAxUAAAAAHQAAAAAQowI&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA',
  source: 'Trip.com', checkedAt: '2026-10-06T15:01:18Z',
 },
  'Mandarin Oriental Singapore 文华东方': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Sea View Room King', perNightUSD: 458, totalUSD: 1998, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 4', breakfast: '需付费 (page: \'Great breakfast for $33.78 (optional)\'; Property Policies: Adult breakfast SGD 43.16/person)', note: 'Last booked 3 mins ago; Best price with free cancellation; Instant confirmation; Prepay online; Earn $99.92 in Trip Coins' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page. | 今日价格为 Trip.com 未登录公开价。',
  suite: { room: 'Family Suite', perNightUSD: 918, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 4', breakfast: '需付费 (page: \'Great breakfast for $33.78 (optional)\')', note: 'Earn $200.02 in Trip Coins; Instant confirmation; Prepay online' },
  suiteNote: 'Cheapest bookable suite; page shows no numeric whole-stay total for suites. | 今日价格为 Trip.com 未登录公开价。',
  baselineUSD: 366, baselineCheckedAt: '2026-10-06T15:01:18Z',
  baselineUrl: 'https://www.google.com/travel/search?q=mandarin%20oriental%20singapore&qs=CAEgASgAMiJDaFVJMVozZDFOUEd2SmdnR2drdmJTOHdPRjlvZUhRUUFRSAA&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=KigKEglvXOcioKz0PxGzMWV8kfZZQBISCaQZkYskwfQ_EbMxZbDV9llAMAC6AQZwcmljZXM&ved=0CAAQ5JsGahgKEwjIpbD3v6WXAxUAAAAAHQAAAAAQpwI',
  source: 'Trip.com', checkedAt: '2026-10-06T15:01:18Z',
 },
  'Shangri-La Singapore 香格里拉': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Tower Wing Deluxe King Room', perNightUSD: 289, totalUSD: 1258, totalInclTax: true, cancel: 'Non-refundable', breakfast: '需付费 (page: \'Great breakfast for $40.39 (optional)\'; Property Policies: Adult breakfast SGD 51.60/person)', note: 'Today\'s best price!; Early bird price; Last booked 1 hr ago; Instant confirmation; Prepay online; Earn $12.58 in Trip Coins' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page. | 今日价格为 Trip.com 未登录公开价。',
  suite: { room: 'Horizon Club Junior Suite King', perNightUSD: 501, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '含免费早餐 (page: \'Includes 3 great breakfasts\')', note: 'Instant confirmation; Prepay online; Early bird price; Earn $21.86 in Trip Coins' },
  suiteNote: 'Found after expanding \'Show 9 Remaining Room Types\'; first (cheapest) suite in the ascending-price room list. Next suite: Garden Wing One-Bedroom Suite $697. Page shows no numeric whole-stay total for suites. | 今日价格为 Trip.com 未登录公开价。',
  baselineUSD: 234, baselineCheckedAt: '2026-10-06T15:01:18Z',
  baselineUrl: 'https://www.google.com/travel/hotels/entity/CgoIi_-cyKe15fdBEAE?ved=0CAAQ5JsGahgKEwiwlL_fvaWXAxUAAAAAHQAAAAAQ4QI&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=MAE',
  source: 'Trip.com', checkedAt: '2026-10-06T15:01:18Z',
 },
  'The Fullerton Hotel Singapore 新加坡富丽敦酒店': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Premier Courtyard Room', perNightUSD: 310, totalUSD: 1352, totalInclTax: true, cancel: 'Non-refundable', breakfast: '未明确 (the $310 rate states no breakfast; a separate $359 rate includes \'2 great breakfasts\')', note: 'Today\'s best price!; Early bird price; Last booked 3 hrs ago; Instant confirmation; Prepay online; Earn $67.59 in Trip Coins' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page. | 今日价格为 Trip.com 未登录公开价。',
  suite: { room: 'Premier Collyer Suite', perNightUSD: 583, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '含免费早餐 (page: \'Includes 2 great breakfasts\')', note: 'Our last 2!; Earn $127.02 in Trip Coins' },
  suiteNote: 'Cheapest bookable suite; page shows no numeric whole-stay total for suites. | 今日价格为 Trip.com 未登录公开价。',
  baselineUSD: 234, baselineCheckedAt: '2026-10-06T15:01:18Z',
  baselineUrl: 'https://www.google.com/travel/search?q=fullerton%20hotel%20singapore&qs=CAEgASgAMiJDaFVJME9IOTFZdUt5LUJCR2drdmJTOHdPRGQzYkdZUUFRSAA&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=KigKEglvXOcioKz0PxGzMWV8kfZZQBISCaQZkYskwfQ_EbMxZbDV9llAMAC6AQZwcmljZXM&ved=0CAAQ5JsGahgKEwjIpbD3v6WXAxUAAAAAHQAAAAAQrgM',
  source: 'Trip.com', checkedAt: '2026-10-06T15:01:18Z',
 },
  'Amanpuri': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Garden Pool Pavilion', perNightUSD: 3653, totalUSD: 11751, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 9', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online; Instant confirmation; Earn $117.52 in Trip Coins' },
  baseNote: 'Numeric total $11,751 shown on search-results list (\'Total price: $11,751 1 room x 3 nights incl. taxes & fees\'); detail page shows only \'Total price:1 room x 3 nights incl. taxes & fees\' without a number.',
  suite: null,
  suiteNote: 'No room type with \'Suite\' in the name offered for these dates; room types are Pavilions/Villas (Garden Pool Pavilion, Partial Ocean Pool Pavilion, Ocean Pool Pavilion, Pool Pavilion 2 Bedroom, Three-Bedroom Ocean Villa, 6-Bedroom Ocean Villa).',
  baselineUSD: 2350, baselineCheckedAt: '2026-10-06T13:54:51Z',
  baselineUrl: 'https://www.google.com/travel/search?q=amanpuri%20phuket&qs=CAEgASgAMiRDaGNJeE5mM3NMell2Y2JGQVJvS0wyMHZNRE51Y0dzeFpoQUJIAA&ved=0CAAQ5JsGahcKEwjo7NPfvaWXAxUAAAAAHQAAAAAQXw&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=KigKEglQUQhIce0fQBEMUeDek5FYQBISCUnQh_yF8h9AEQxR4BLYkVhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T13:54:51Z',
 },
  'Trisara': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Ocean View Pool Villa', perNightUSD: 1926, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 26', breakfast: 'Includes 2 great breakfasts', note: 'Pay at hotel; Instant confirmation; 2 adults (cheapest plan of this room type; \'best price\' plan $2,074 also available)' },
  baseNote: 'No numeric whole-stay total shown for the $1,926 plan. The results list showed \'Total price: $6,670 1 room x 3 nights incl. taxes & fees\' for the $2,074 \'best price\' plan only.',
  suite: { room: 'Signature Ocean View Pool Suite', perNightUSD: 2728, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 26', breakfast: 'Includes 2 great breakfasts', note: 'Pay at hotel; Instant confirmation; 2 adults (cheapest Suite plan; $2,938 plan also available)' },
  suiteNote: 'Cheapest room type with \'Suite\' in the name among: Ocean View Pool Villa, Ocean Front Pool Villa, Signature Ocean View Pool Suite, Two-Bedroom Ocean Front Pool Villa, 2 Bedroom Villa (Rv09), Two Bedroom Signature Villa No.20.',
  baselineUSD: 1672, baselineCheckedAt: '2026-10-06T13:54:51Z',
  baselineUrl: 'https://www.google.com/travel/search?q=trisara%20phuket&qs=CAEgASgAMiZDaGdJbGItN282U0w0cGZFQVJvTEwyY3ZNWFJxT1ROMmVqQVFBUUgA&ved=0CAAQ5JsGahgKEwjo7NPfvaWXAxUAAAAAHQAAAAAQ2wE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=KigKEglQUQhIce0fQBEMUeDek5FYQBISCUnQh_yF8h9AEQxR4BLYkVhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T13:54:51Z',
 },
  'Banyan Tree Phuket': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Banyan Pool Villa', perNightUSD: 748, totalUSD: 2406, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online; Instant confirmation; Earn $120.29 in Trip Coins; hotel-level \'Last booked 2 hrs ago\'' },
  baseNote: 'Numeric total $2,406 shown on search-results list (\'Total price: $2,406 1 room x 3 nights incl. taxes & fees\'); detail page shows only the unlabeled total-price line. Page also shows \'Sign in for member prices\' / \'Access Lower Price\' buttons; displayed prices are public.',
  suite: null,
  suiteNote: 'No room type with \'Suite\' in the name offered for these dates; all room types are Villas (Banyan Pool Villa, Serenity Pool Villa, Signature Pool Villa, Grand Lagoon Pool Villa, Signature Two Bedroom Pool Villa, Grand Two Bedroom Pool Villa, Presidential Villa, Presidential Beach Villa, Presidential Spa Villa, Presidential Hillside Villa, Presidential Royal Villa).',
  baselineUSD: 516, baselineCheckedAt: '2026-10-06T13:54:51Z',
  baselineUrl: 'https://www.google.com/travel/search?q=banyan%20tree%20phuket&qs=CAEgASgAMidDaGtJenZfZjlMR1ZzTDJhQVJvTUwyY3ZNVEpvY0hZd2NHUnhFQUVIAA&ved=0CAAQ5JsGahgKEwjo7NPfvaWXAxUAAAAAHQAAAAAQ1wI&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=KigKEglQUQhIce0fQBEMUeDek5FYQBISCUnQh_yF8h9AEQxR4BLYkVhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T13:54:51Z',
 },
  'JW Marriott Phuket Resort & Spa 普吉JW万豪': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Guest Room,2 Double,Garden View,Balcony', perNightUSD: 401, totalUSD: 1290, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 7', breakfast: 'Great breakfast for $31.55 (optional)', note: 'Pay at hotel; Instant confirmation; hotel-level \'Last booked 4 hrs ago\'' },
  baseNote: 'Numeric total $1,290 shown on search-results list (\'Total price: $1,290 1 room x 3 nights incl. taxes & fees\'); detail page shows only the unlabeled total-price line. Breakfast is paid, not included.',
  suite: { room: '1 Bedroom Suite, 1 King, Oceanfront, Whirlpool', perNightUSD: 1093, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 7', breakfast: 'Great breakfast for $31.55 (optional)', note: 'Pay at hotel (Prepay online also available at same price); Instant confirmation; 2 adults' },
  suiteNote: 'Cheapest room type with \'Suite\' in the name among: 1 Bedroom Suite, 1 King, Oceanfront, Whirlpool ($1,093), 1 Bedroom Suite, 1 King, Oceanfront, Private Pool ($1,429).',
  baselineUSD: 361, baselineCheckedAt: '2026-10-06T13:54:51Z',
  baselineUrl: 'https://www.google.com/travel/search?q=JW%20Marriott%20Phuket%20Resort&qs=CAEgACgAMidDaGtJeU1yZGtiR3l4YVZFR2cwdlp5OHhNV0owZDJzNWNEbHFFQUVIAA&ved=0CAAQ5JsGahgKEwjo7NPfvaWXAxUAAAAAHQAAAAAQ5gM&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=KigKEglQUQhIce0fQBEMUeDek5FYQBISCUnQh_yF8h9AEQxR4BLYkVhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T13:54:51Z',
 },
  'The Surin Phuket': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'One Bedroom Hillside Cottage', perNightUSD: 916, totalUSD: 2948, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Our last 1!; Special Discount 8% off ($1,000 -> $916); Prepay online; Instant confirmation; hotel-level \'Last booked 2 hrs ago\'' },
  baseNote: 'Numeric total $2,948 shown on search-results list (\'Total price: $2,948 1 room x 3 nights incl. taxes & fees\'); detail page shows only the unlabeled total-price line. Special Discount 8% off is a public promo, not a member-tier deal.',
  suite: { room: 'Beach Suite', perNightUSD: 1716, totalUSD: null, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Our last 1!; Prepay online; Instant confirmation; 2 adults' },
  suiteNote: 'Cheapest room type with \'Suite\' in the name among: Beach Suite ($1,716), Beach Deluxe Suite ($1,930); rooms sorted by price, one remaining type not expanded but priced above.',
  baselineUSD: 757, baselineCheckedAt: '2026-10-06T13:54:51Z',
  baselineUrl: 'https://www.google.com/travel/search?q=The%20Surin%20Phuket&qs=CAEgACgAMiZDaGdJNXNfZGdQM3hoLVZQR2d3dlp5OHhNbXBpZERBMk5Hb1FBUUgA&ved=0CAAQ5JsGahgKEwjo7NPfvaWXAxUAAAAAHQAAAAAQ8wQ&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=KigKEglQUQhIce0fQBEMUeDek5FYQBISCUnQh_yF8h9AEQxR4BLYkVhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T13:54:51Z',
 },
  'Keemala': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Clay Pool Cottage', perNightUSD: 808, totalUSD: 2599, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Our last 4!; Early Bird Deal 42% off ($1,435 -> $808); Earn $25.99 in Trip Coins; Pay at hotel; Instant confirmation' },
  baseNote: 'Per-night $808 confirmed by the calendar\'s per-day prices (Dec 10/11/12 all \'price USD 808\'). Numeric total $2,599 shown on search-results list (\'Total price: $2,599 1 room x 3 nights incl. taxes & fees\'); detail page shows only the unlabeled total-price line. Early Bird Deal is public, not member-tier.',
  suite: null,
  suiteNote: 'No room type with \'Suite\' in the name offered for these dates; room types: Clay Pool Cottage, Tent Pool Villa, Tree Pool House.',
  baselineUSD: 624, baselineCheckedAt: '2026-10-06T13:54:51Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Keemala%20Phuket&qs=CAEgACgAMihDaG9JOWJmTHRZaTFfb3VjQVJvTkwyY3ZNVEZpWXpjellqbHJOaEFCSAA&ved=0CAAQ5JsGahgKEwjo7NPfvaWXAxUAAAAAHQAAAAAQhQY&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=KigKEglQUQhIce0fQBEMUeDek5FYQBISCUnQh_yF8h9AEQxR4BLYkVhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T13:54:51Z',
 },
  '137 Pillars House': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Rajah Brooke Suite', perNightUSD: 637, totalUSD: 1367, totalInclTax: true, cancel: 'Free Cancellation before 1:00 AM, Nov 21', breakfast: 'Includes 2 great breakfasts', note: 'Our last 5!; Special Discount 5% off', memberDeal: 'Special Discount 5% off: $673->$637' },
  baseNote: 'All room types at this hotel have \'Suite\' in the name; the cheapest bookable room is itself a suite. Prices shown are public prices (not labeled member-only).',
  suite: { room: 'Rajah Brooke Suite', perNightUSD: 637, totalUSD: 1367, totalInclTax: true, cancel: 'Free Cancellation before 1:00 AM, Nov 21', breakfast: 'Includes 2 great breakfasts', note: 'Our last 5!; Special Discount 5% off', memberDeal: 'Special Discount 5% off: $673->$637' },
  suiteNote: 'Cheapest suite is the same as the cheapest room (all room types are suites). Next cheapest: East Borneo Suite $736/night.',
  baselineUSD: 553, baselineCheckedAt: '2026-10-06T14:28:36Z',
  baselineUrl: 'https://www.google.com/travel/search?q=137%20pillars%20house%20chiang%20mai&qs=CAEgASgAMihDaG9JX0ptRmo4dk8tWmlPQVJvTkwyY3ZNVEZqTTNCamN6azFlUkFCSAA&ved=0CAAQ5JsGahcKEwjYt6HfvaWXAxUAAAAAHQAAAAAQbA&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgNEgcI6g8QDBgPGAIyAggBKgkKBToDVVNEGgA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T14:28:36Z',
 },
  'Four Seasons Resort Chiang Mai': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Upper Garden Pavilion King', perNightUSD: 1767, totalUSD: 3789, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 6', breakfast: 'Includes 2 great breakfasts', note: 'Our last 1!' },
  baseNote: 'Prices shown are public prices (not labeled member-only).',
  suite: null,
  suiteNote: 'No room type with \'Suite\'/\'套房\' in the name is bookable for these dates; all 7 shown room types are Pavilions (Upper Garden Pavilion King/Twin $1767, Rice Terrace Pavilion King/Twin $1816, Upper Rice Terrace Pavilion King/Twin $1898) or the Pool Villa ($1931).',
  baselineUSD: 1366, baselineCheckedAt: '2026-10-06T14:28:36Z',
  baselineUrl: 'https://www.google.com/travel/search?q=four%20seasons%20chiang%20mai&qs=CAAgASgA&ved=0CAAQ5JsGahgKEwjYt6HfvaWXAxUAAAAAHQAAAAAQoAI&ts=CAEqCQoFOgNVU0QaAA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T14:28:36Z',
 },
  'Raya Heritage': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Rin Suite with Terrace', perNightUSD: 461, totalUSD: 989, totalInclTax: true, cancel: 'Non-refundable (cheapest rate); free-cancellation rates available from $497', breakfast: 'Includes 2 great breakfasts', note: 'Our last 1!; Special Discount 7% off', memberDeal: 'Special Discount 7% off: $496->$461' },
  baseNote: 'All room types have \'Suite\' in the name; cheapest bookable room is itself a suite. Prices shown are public prices (not labeled member-only).',
  suite: { room: 'Rin Suite with Terrace', perNightUSD: 461, totalUSD: 989, totalInclTax: true, cancel: 'Non-refundable (cheapest suite rate); free-cancellation suite rate available from $784', breakfast: 'Includes 2 great breakfasts', note: 'Our last 1!; Special Discount 7% off', memberDeal: 'Special Discount 7% off: $496->$461' },
  suiteNote: 'Cheapest suite is the same as the cheapest room. Next cheapest suites: Huen Bon Suite $604/night, Kramm Suite with Pool $699/night.',
  baselineUSD: 427, baselineCheckedAt: '2026-10-06T14:28:36Z',
  baselineUrl: 'https://www.google.com/travel/search?q=raya%20heritage%20chiang%20mai&qs=CAAgASgA&ved=0CAAQ5JsGahgKEwjYt6HfvaWXAxUAAAAAHQAAAAAQ6AI&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgNEgcI6g8QDBgPGAIyAggBKgkKBToDVVNEGgA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T14:28:36Z',
 },
  'Anantara Chiang Mai': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Deluxe Room With Garden View', perNightUSD: 447, totalUSD: 958, totalInclTax: true, cancel: 'Non-refundable (cheapest rate); free-cancellation rates available from $497', breakfast: 'Includes 2 great breakfasts', note: 'Last booked 5 hrs ago; Earn $47.92 in Trip Coins', memberDeal: 'Special Discount 6% off: $475->$447' },
  baseNote: 'Prices shown are public prices (not labeled member-only). Cheapest rate is non-refundable.',
  suite: { room: 'Lanna Garden View Suite', perNightUSD: 674, totalUSD: null, totalInclTax: true, cancel: 'Non-refundable (cheapest suite rate); free-cancellation suite rate available from $784', breakfast: 'Includes 2 great breakfasts', note: 'Early bird price' },
  suiteNote: 'Page shows \'Total price: 1 room x 2 nights incl. taxes & fees\' label for the suite but no numeric total, so totalUSD is null. Other suites: Lanna Garden Terrace Suite $774, Lanna River View Suite $792, Lanna Riverfront Suite $801.',
  baselineUSD: 345, baselineCheckedAt: '2026-10-06T14:28:36Z',
  baselineUrl: 'https://www.google.com/travel/search?q=anantara%20chiang%20mai&qs=CAEgASgAMiZDaGdJcmN6VGlOU1o4T0RCQVJvTEwyY3ZNWFJxZUc1M05EQVFBUUgA&ved=0CAAQ5JsGahgKEwjYt6HfvaWXAxUAAAAAHQAAAAAQuwM&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgNEgcI6g8QDBgPGAIyAggBKgkKBToDVVNEGgA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T14:28:36Z',
 },
  'Shangri-La Chiang Mai 清迈香格里拉': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Deluxe King Room', perNightUSD: 186, totalUSD: 398, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 12', breakfast: 'Great breakfast for $21.43 (optional)', note: 'Last booked 37 mins ago; Multi-night Discount 12% off', memberDeal: 'Multi-night Discount 12% off: $213->$186' },
  baseNote: 'Breakfast is paid/optional (需付费) on the cheapest rate. Displayed prices are public; page shows \'Sign in for member prices\' / \'Access Lower Price\' buttons indicating lower member prices exist behind sign-in.',
  suite: null,
  suiteNote: 'No room type with \'Suite\'/\'套房\' in the name among the 6 bookable room types shown (Deluxe King/Twin $186, Deluxe King/Twin with Pool View $191, Premier King/Twin $217). 4 additional room types were collapsed under \'Show 4 Remaining Room Types\' which could not be expanded with the available tools, so a suite option there remains unverified.',
  baselineUSD: 149, baselineCheckedAt: '2026-10-06T14:28:36Z',
  baselineUrl: 'https://www.google.com/travel/search?q=shangri%20la%20chiang%20mai&qs=CAEgASgAMiZDaGdJOC11cWdQX2FvYVR6QVJvTEwyY3ZNWFJrTURkalozY1FBUUgA&ved=0CAAQ5JsGahgKEwjYt6HfvaWXAxUAAAAAHQAAAAAQigU&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgNEgcI6g8QDBgPGAIyAggBKgkKBToDVVNEGgA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T14:28:36Z',
 },
  'Chiang Mai Marriott Hotel 清迈万豪': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Deluxe King - City View', perNightUSD: 196, totalUSD: 424, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 12', breakfast: 'Great breakfast for $22.77 (optional)', note: 'Last booked 1 hr ago' },
  baseNote: 'Breakfast is paid/optional (需付费) on the cheapest rate. Prices shown are public prices (not labeled member-only).',
  suite: { room: 'Executive Suite, 1 Bedroom, 1 King, Club Lounge Access', perNightUSD: 327, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 12', breakfast: 'Great breakfast for $22.77 (optional)', note: 'Unlimited M Club access (Club Lounge benefits)' },
  suiteNote: 'Page shows \'Total price: 1 room x 2 nights incl. taxes & fees\' label for the suite but no numeric total, so totalUSD is null. Other suites: Diplomatic Suite $1668/night, Royal Suite $2159/night.',
  baselineUSD: 178, baselineCheckedAt: '2026-10-06T14:28:36Z',
  baselineUrl: 'https://www.google.com/travel/search?q=chiang%20mai%20marriott%20hotel&qs=CAAgASgA&ved=0CAAQ5JsGahgKEwjYt6HfvaWXAxUAAAAAHQAAAAAQzQY&ts=CAEqCQoFOgNVU0QaAA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T14:28:36Z',
 },
  'The Ritz-Carlton, Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe King', perNightUSD: 321, totalUSD: 1024, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 14', breakfast: '需付费', note: 'Pay at hotel; Instant confirmation. Page shows first-booking promo banners (up to 20% off with promo code); the $321 room price itself has no member-deal label.' },
  baseNote: 'Public price shown to non-logged-in user; no member-deal labeling on this hotel. Breakfast available as paid option (Great breakfast for $33.28).',
  suite: null,
  suiteNote: 'No room type with \'Suite\'/\'套房\' in the name is bookable on Trip.com for 2026-12-15 to 2026-12-18; listed room types are Deluxe/Club only.',
  baselineUSD: 289, baselineCheckedAt: '2026-10-06T14:23:18Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20ritz-carlton%20bangkok%20bangkok%20thailand&gsas=1&ts=CAESCgoCCAMKAggDEAAqCQoFOgNVU0QaAA&ved=0CAAQ5JsGahgKEwi4kbSLwKWXAxUAAAAAHQAAAAAQ0wc&qs=CAAgASgAMidDaGtJX01lMTJLNzJxOG9SR2cwdlp5OHhNWGM1WnpOeWVXTmZFQUU&ap=KigKEglQwxi-X3srQBFm9-RH_yJZQBISCRCFuqjdfStAEWb35HtDI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T14:23:18Z',
 },
  'The Peninsula Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe King Room', perNightUSD: 398, totalUSD: 1269, totalInclTax: true, cancel: 'Non-refundable (cheapest $398 rate); free-cancellation rate also available at $415/night: Free Cancellation before 11:59 PM, Dec 11', breakfast: '含免费早餐', note: 'Our last 4! (Only 4 left at this price); Instant confirmation; Prepay online. Includes 2 great breakfasts.', memberDeal: 'Member deal 10% off: $445->$398' },
  baseNote: 'Public price shown to non-logged-in user; \'Member deal 10% off\' label is visible without login (not member-only).',
  suite: { room: 'Deluxe King Suite', perNightUSD: 587, totalUSD: null, totalInclTax: true, cancel: 'Non-refundable (cheapest $587 rate); free-cancellation rate also available at $638/night: Free Cancellation before 11:59 PM, Dec 11', breakfast: '含免费早餐', note: 'Our last 4!; Instant confirmation; Prepay online. Includes 2 great breakfasts.', memberDeal: 'Member deal 10% off: $657->$587' },
  suiteNote: 'Cheapest bookable suite; Deluxe Twin Suite also available at the same $587/night.',
  baselineUSD: 277, baselineCheckedAt: '2026-10-06T14:23:18Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20peninsula%20bangkok&gsas=1&ts=CAESCgoCCAMKAggDEAAaIAoCGgASGhIUCgcI6g8QDBgPEgcI6g8QDBgSGAMyAggBKgkKBToDVVNEGgA&ved=0CAAQ5JsGahgKEwiYsJCkvqWXAxUAAAAAHQAAAAAQxgE&qs=CAEgASgAMiNDaFlJdDVxM2h2YmszdHBYR2dvdmJTOHdaMmM0TUhvNUVBRUgA&ap=KigKEgk20zfxv3MrQBHYGgBGySJZQBISCUWROeY9ditAEdgaAHoNI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T14:23:18Z',
 },
  'Rosewood Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe Twin Room', perNightUSD: 350, totalUSD: 1116, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 8', breakfast: '未明确', note: 'Pay at hotel; Instant confirmation. Best price with free cancellation. | 页面自相矛盾：房型 JSON 标"含免费早餐"，备注又写早餐 $44.85 付费选项；按铁律记"未明确"。', memberDeal: 'Member deal 15% off: $416->$350' },
  baseNote: 'Public price shown to non-logged-in user; \'Member deal 15% off\' label is visible without login (not member-only). Breakfast available as paid option (Great breakfast for $44.85). Note: base JSON says breakfast 含免费早餐 but baseNote says paid option - keeping base JSON value; page inconsistency flagged.',
  suite: { room: 'Premier Suite', perNightUSD: 673, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 8', breakfast: '含免费早餐', note: 'Instant confirmation; Prepay online. Includes 1 great breakfast.', memberDeal: 'Member deal 15% off: $799->$673' },
  suiteNote: 'Cheapest bookable suite on Trip.com for these dates.',
  baselineUSD: 311, baselineCheckedAt: '2026-10-06T14:23:18Z',
  baselineUrl: 'https://www.google.com/travel/search?q=rosewood%20bangkok&gsas=1&ts=CAESCgoCCAMKAggDEAAqCQoFOgNVU0QaAA&ved=0CAAQ5JsGahcKEwi4kbSLwKWXAxUAAAAAHQAAAAAQfw&qs=CAAgASgAMidDaGtJLWZQVTZyLWh6T04yR2cwdlp5OHhNV1kxYUd4aWVqVmZFQUU&ap=KigKEglQwxi-X3srQBFm9-RH_yJZQBISCRCFuqjdfStAEWb35HtDI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T14:23:18Z',
 },
  '曼谷文华东方': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe Premier Twin Room', perNightUSD: 549, totalUSD: 1750, totalInclTax: true, cancel: 'Non-refundable', breakfast: '需付费', note: 'Instant confirmation; Prepay online; \'Today\'s best price!\' badge. Last booked 10 hrs ago.', memberDeal: 'Member deal 6% off: $585->$549' },
  baseNote: 'AVAILABLE for 2026-12-15 to 2026-12-18 - contrary to the Oct 2 sold-out report, rooms are bookable today. Public price shown to non-logged-in user; \'Member deal 6% off\' label visible without login. Breakfast available as paid option (Great breakfast for $63.05).',
  suite: { room: 'Junior King Suite With Terrace', perNightUSD: 1761, totalUSD: null, totalInclTax: true, cancel: 'Non-refundable', breakfast: '未明确', note: 'Instant confirmation; Prepay online. Includes 1 great breakfast. | 页面自相矛盾：套房 JSON 标"需付费"，备注又写"Includes 1 great breakfast"；按铁律记"未明确"。' },
  suiteNote: 'Cheapest bookable suite on Trip.com for these dates. Breakfast available as paid option (Great breakfast for $63.05). Note: suite JSON says breakfast 需付费 but note says Includes 1 great breakfast - page inconsistency flagged.',
  baselineUSD: 501, baselineCheckedAt: '2026-10-06T14:23:18Z',
  baselineUrl: 'https://www.google.com/travel/search?q=mandarin%20oriental%20bangkok%20lobby&gsas=1&ts=CAESCgoCCAMKAggDEAAqCQoFOgNVU0QaAA&ved=0CAAQ5JsGahgKEwi4kbSLwKWXAxUAAAAAHQAAAAAQxAI&qs=CAAgASgAMiJDaFVJNVpXbnRMYkdzOWtMR2drdmJTOHdPRFZpTjJjUUFR&ap=KigKEglQwxi-X3srQBFm9-RH_yJZQBISCRCFuqjdfStAEWb35HtDI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T14:23:18Z',
 },
  'Capella Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Riverfront King Room', perNightUSD: 904, totalUSD: 2880, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 10', breakfast: '含免费早餐', note: 'Our last 3! (Only 3 left at this price); Instant confirmation; Prepay online. Includes 2 great breakfasts; best price with breakfast and free cancellation.' },
  baseNote: 'Public price shown to non-logged-in user; no member-deal labeling on this hotel. (List page fluctuated between $903-$904/night during the session.)',
  suite: { room: 'Courtyard Suite', perNightUSD: 1446, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 10', breakfast: '含免费早餐', note: 'Our last 1!; Instant confirmation; Prepay online. Includes 2 great breakfasts; best price with breakfast and free cancellation.' },
  suiteNote: 'Cheapest bookable suite on Trip.com for these dates.',
  baselineUSD: 739, baselineCheckedAt: '2026-10-06T14:23:18Z',
  baselineUrl: 'https://www.google.com/travel/search?q=capella%20bangkok&gsas=1&ts=CAESCgoCCAMKAggDEAAqCQoFOgNVU0QaAA&ved=0CAAQ5JsGahgKEwi4kbSLwKWXAxUAAAAAHQAAAAAQnAM&qs=CAAgASgAMidDaGtJNlBHbjRkSzExSnN5R2cwdlp5OHhNV00yZW5wbWVUWmtFQUU&ap=KigKEglQwxi-X3srQBFm9-RH_yJZQBISCRCFuqjdfStAEWb35HtDI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T14:23:18Z',
 },
  'Aman Nai Lert Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Premier Suite', perNightUSD: 1943, totalUSD: 6197, totalInclTax: true, cancel: 'Non-refundable (cheapest $1,943 rate); free-cancellation rate also available at $2,159/night: Free Cancellation before 11:59 PM, Dec 12', breakfast: '含免费早餐', note: 'Instant confirmation; Prepay online. Last booked 11 mins ago. Includes 2 great breakfasts.' },
  baseNote: 'Public price shown to non-logged-in user; no member-deal labeling. All room types at this hotel are suites, so the cheapest bookable room is a suite.',
  suite: { room: 'Premier Suite', perNightUSD: 1943, totalUSD: null, totalInclTax: true, cancel: 'Non-refundable (cheapest $1,943 rate); free-cancellation rate also available at $2,159/night: Free Cancellation before 11:59 PM, Dec 12', breakfast: '含免费早餐', note: 'Instant confirmation; Prepay online. Includes 2 great breakfasts.' },
  suiteNote: 'Same as base - every bookable room type at Aman Nai Lert Bangkok is a suite; \'Premier Suite\' is the cheapest.',
  baselineUSD: 1755, baselineCheckedAt: '2026-10-06T14:23:18Z',
  baselineUrl: 'https://www.google.com/travel/search?q=aman%20nai%20lert%20bangkok%20thailand&gsas=1&ts=CAESCgoCCAMKAggDEAAaIAoCGgASGhIUCgcI6g8QDBgPEgcI6g8QDBgSGAMyAggBKgkKBToDVVNEGgA&ved=0CAAQ5JsGahgKEwi4kbSLwKWXAxUAAAAAHQAAAAAQ5wM&qs=CAEgASgAMihDaG9JaUtXVGw5S0YyUG15QVJvTkwyY3ZNVEZxYW5kdWNXWTRjaEFCSAA&ap=KigKEglQwxi-X3srQBFm9-RH_yJZQBISCRCFuqjdfStAEWb35HtDI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T14:23:18Z',
 },
  'Four Seasons Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe Room - King', perNightUSD: 692, totalUSD: 2205, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 14', breakfast: '需付费', note: 'Our last 1!; Instant confirmation; Prepay online. Best price with free cancellation. (List-page highlight at the same $692/night was \'Deluxe Palm Court Room - Twin\'.)' },
  baseNote: 'Public price shown to non-logged-in user; no member-deal labeling. Breakfast available as paid option (Great breakfast for $47.29). (Trip.com list fluctuated $691-$692/night during the session.)',
  suite: null,
  suiteNote: 'No room type with \'Suite\'/\'套房\' in the name is bookable on Trip.com for 2026-12-15 to 2026-12-18; listed room types are Deluxe / Deluxe Palm Court / Deluxe Riverview / Premier Riverview only.',
  baselineUSD: 563, baselineCheckedAt: '2026-10-06T14:23:18Z',
  baselineUrl: 'https://www.google.com/travel/search?q=four%20seasons%20hotel%20bangkok%20at%20chao%20phraya%20river%20bangkok%20thailand&gsas=1&ts=CAESCgoCCAMKAggDEAAqCQoFOgNVU0QaAA&qs=CAAgASgAMihDaG9JNmFxYXpfVFZxZmZGQVJvTkwyY3ZNVEZrZUdzNGJtZHNOaEFC&ved=0CAAQ5JsGahcKEwjg0q30w6WXAxUAAAAAHQAAAAAQAw',
  source: 'Trip.com', checkedAt: '2026-10-06T14:23:18Z',
 },
  'The Siam': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Siam Suite', perNightUSD: 743, totalUSD: 2368, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Instant confirmation; Prepay online. Includes 2 great breakfasts; best price with breakfast.' },
  baseNote: 'Public price shown to non-logged-in user; no member-deal labeling. All room types at this hotel are suites/villas, so the cheapest bookable room is a suite.',
  suite: { room: 'Siam Suite', perNightUSD: 743, totalUSD: null, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Instant confirmation; Prepay online. Includes 2 great breakfasts.' },
  suiteNote: 'Same as base - every bookable room type at The Siam is a suite/villa; \'Siam Suite\' is the cheapest.',
  baselineUSD: 533, baselineCheckedAt: '2026-10-06T14:23:18Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20siam%20bangkok%20thailand&gsas=1&ts=CAESCgoCCAMKAggDEAAqCQoFOgNVU0QaAA&qs=CAAgASgAMidDaGtJM3MyazRmeUZtS09DQVJvTUwyY3ZNVEpxYzNRd05EQm9FQUU&ved=0CAAQ5JsGahcKEwjIhoqJxKWXAxUAAAAAHQAAAAAQAw',
  source: 'Trip.com', checkedAt: '2026-10-06T14:23:18Z',
 },
  'The Athenee Hotel, a Luxury Collection Hotel, Bangkok 曼谷雅典娜豪华精选酒店': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Athenee King Room Non smoking', perNightUSD: 234, totalUSD: 745, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 14', breakfast: '需付费', note: 'Pay at hotel; Instant confirmation. Best price with free cancellation. Last booked 7 hrs ago.' },
  baseNote: 'Public price shown to non-logged-in user; no member-deal labeling. Breakfast available as paid option (Great breakfast for $29.76).',
  suite: { room: 'Athenee Suite Non smoking', perNightUSD: 443, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 14', breakfast: '含免费早餐', note: 'Prepay online; Instant confirmation. Includes 1 great breakfast.' },
  suiteNote: 'Cheapest bookable suite on Trip.com for these dates (925 ft2, Floor 18-23).',
  baselineUSD: 211, baselineCheckedAt: '2026-10-06T14:23:18Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20athenee%20hotel%20a%20luxury%20collection%20hotel%20bangkok&gsas=1&ts=CAESCgoCCAMKAggDEAAqCQoFOgNVU0QaAA&ved=0CAAQ5JsGahgKEwi4kbSLwKWXAxUAAAAAHQAAAAAQ5gY&qs=CAAgASgA&ap=KigKEglQwxi-X3srQBFm9-RH_yJZQBISCRCFuqjdfStAEWb35HtDI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-06T14:23:18Z',
 },
  'Caravelle Saigon': {
    checkIn: '2026-12-24', checkOut: '2026-12-26', nights: 2,
    base: { room: 'Deluxe King Room', perNightUSD: 186, totalUSD: 402, totalInclTax: true, cancel: '不可退（早鸟价）', breakfast: '含双早', note: '9折后价，原价$209；该价仅剩5间' },
    suite: { room: 'Executive Suite', perNightUSD: 441, totalUSD: 953, totalInclTax: true, cancel: '12-23 14:00前免费取消', breakfast: '含双早', note: '$22 off后价，原价$463' },
    source: 'Trip.com', checkedAt: '2026-09-26 15:07 UTC',
 },
  'Cheong Fatt Tze Mansion': {
    checkIn: '2026-12-20', checkOut: '2026-12-22', nights: 2,
    base: { room: 'Liang King Room', perNightUSD: 176, totalUSD: 427, totalInclTax: true, cancel: '12-13 01:00前免费取消', breakfast: '含双早', note: '该日期唯一可订房型；该价仅剩5间' },
    suite: null, suiteNote: '该日期无套房',
    source: 'Trip.com', checkedAt: '2026-09-26 14:46 UTC',
 },
  'EQ': {
    checkIn: '2026-12-22', checkOut: '2026-12-24', nights: 2,
    base: { room: 'Deluxe Twin / Deluxe King', perNightUSD: 206, totalUSD: 450, totalInclTax: true, cancel: '12-20 12:00 前免费取消', breakfast: '不含早（含早价 $240/晚）' },
    suite: { room: 'Studio Suite', perNightUSD: 464, totalUSD: 1006, totalInclTax: true, cancel: '12-20 12:00 前免费取消', breakfast: '含 1 客早餐', note: '页面显示为单人入住价' },
    source: 'Trip.com', checkedAt: '2026-09-25 03:30 UTC',
 },
  'Eastern & Oriental Hotel': {
    checkIn: '2026-12-20', checkOut: '2026-12-22', nights: 2,
    base: { room: 'Studio Twin Suite (Victory Annexe)', perNightUSD: 260, totalUSD: 568, totalInclTax: true, cancel: '12-14 12:00前免费取消', breakfast: '含双早', note: '全店房型皆为Suite；该价仅剩4间' },
    suite: { room: 'Studio Twin Suite (Victory Annexe)（全店房型皆为Suite，最低即套房）', perNightUSD: 260, totalUSD: 568, totalInclTax: true, cancel: '12-14 12:00前免费取消', breakfast: '含双早' },
    source: 'Trip.com', checkedAt: '2026-09-26 14:46 UTC',
 },
  'Four Seasons Kuala Lumpur': {
    checkIn: '2026-12-22', checkOut: '2026-12-24', nights: 2,
    base: { room: 'King Room City View', perNightUSD: 362, totalUSD: 786, totalInclTax: true, cancel: '不可退；免费取消替代价 Park View $491/晚（含 $100 酒店消费额）', breakfast: '不含早', note: '仅剩 1 间' },
    suite: { room: 'Park-View Suite（行政酒廊）', perNightUSD: 736, totalUSD: 1594, totalInclTax: true, cancel: '不可退', breakfast: '不含早', note: '仅剩 1 间' },
    source: 'Trip.com', checkedAt: '2026-09-25 03:40 UTC',
 },
  'Fusion Resort Phu Quoc': {
    checkIn: '2026-12-26', checkOut: '2026-12-29', nights: 3,
    base: null, suite: null,
    unavailable: '多渠道均未查到该日期可订价格（Trip.com 无此店；Google Hotels 显示需电话/官网询价；Kayak 显示所选日期无房；官网订房组件无富国岛店）',
    source: 'Trip.com / Google Hotels / Kayak / 官网', checkedAt: '2026-09-25 04:35 UTC',
 },
  'Hôtel des Arts Saigon': {
    checkIn: '2026-12-24', checkOut: '2026-12-26', nights: 2,
    base: { room: 'Deluxe Room 1 King City View', perNightUSD: 303, totalUSD: 686, totalInclTax: true, cancel: '不可退；免费取消价 $321/晚', breakfast: '含双早' },
    suite: { room: 'Executive Studio Suite（空中酒廊）', perNightUSD: 515, totalUSD: 1169, totalInclTax: true, cancel: '不可退', breakfast: '含 1 客早餐', note: '单人入住价口径' },
    source: 'Trip.com', checkedAt: '2026-09-25 03:55 UTC',
 },
  'InterContinental Phu Quoc 洲际': {
    checkIn: '2026-12-26', checkOut: '2026-12-29', nights: 3,
    base: { room: 'Classic King Room', perNightUSD: 550, totalUSD: 1871, totalInclTax: true, cancel: '11-28 16:00 前免费取消', breakfast: '含双早' },
    suite: null, suiteNote: '该日期未找到可订套房（在售房型均未明确标注套房）',
    source: 'Trip.com', checkedAt: '2026-09-25 04:10 UTC',
 },
  'JW Marriott Phu Quoc': {
    checkIn: '2026-12-26', checkOut: '2026-12-29', nights: 3,
    base: { room: 'Emerald Bay Room, 1 King Bed, Balcony', perNightUSD: 1051, totalUSD: 3405, totalInclTax: true, cancel: '11-26 23:59前免费取消', breakfast: '含双早', note: '到店付/预付同价' },
    suite: { room: 'Turquoise Suite, 1 King Bed, Ocean View, Balcony', perNightUSD: 1961, totalUSD: 5883, totalInclTax: false, cancel: '11-26 23:59前免费取消', breakfast: '含双早', note: '页面未显示该房型整段总价；页面未显示该房型整段总价；为每晚价×晚数（税前口径）' },
    source: 'Trip.com', checkedAt: '2026-09-26 15:14 UTC',
 },
  'La Festa Phu Quoc, Curio Collection by Hilton': {
    checkIn: '2026-12-26', checkOut: '2026-12-29', nights: 3,
    base: null, baseNote: '该日期基础房已售罄，仅剩套房可订',
    suite: { room: 'King Amalfi Duplex Ocean Suite', perNightUSD: 761, totalUSD: 2587, totalInclTax: true, cancel: '不可退（希尔顿提前购）', breakfast: '含双早', note: '仅剩 1 间；另有 Sorrento $840/晚、Dolce Vita $1,244/晚' },
    source: 'Trip.com', checkedAt: '2026-09-25 04:00 UTC',
 },
  'Mai House Saigon': {
    checkIn: '2026-12-24', checkOut: '2026-12-26', nights: 2,
    base: { room: 'Deluxe Room', perNightUSD: 207, totalUSD: 469, totalInclTax: true, cancel: '不可退', breakfast: '不含早', note: '仅剩 2 间' },
    suite: { room: 'Junior Suite', perNightUSD: 312, totalUSD: 707, totalInclTax: true, cancel: '不可退；免费取消价 $361/晚（2 晚 $819）', breakfast: '含双早', note: '仅剩 4 间' },
    source: 'Trip.com', checkedAt: '2026-09-25 03:48 UTC',
 },
  'Mandarin Oriental Kuala Lumpur': {
    checkIn: '2026-12-22', checkOut: '2026-12-24', nights: 2,
    base: { room: 'Deluxe City View Room King Bed', perNightUSD: 212, totalUSD: 462, totalInclTax: true, cancel: '不可退', breakfast: '含双早' },
    suite: { room: 'Park View Suite King Bed', perNightUSD: 541, totalUSD: 1174, totalInclTax: true, cancel: '不可退', breakfast: '不含早（+$24.05/人可选）', note: '含MO行政酒廊权益' },
    source: 'Trip.com', checkedAt: '2026-09-26 15:16 UTC',
 },
  'New World Phu Quoc': {
    checkIn: '2026-12-26', checkOut: '2026-12-29', nights: 3,
    base: { room: 'Garden Pool Villa - 3 Bedrooms', perNightUSD: 831, totalUSD: 2493, totalInclTax: false, cancel: '11-26 14:00前免费取消', breakfast: '含早（6份）', note: '页面未显示该房型整段总价；可住6人；页面未显示该房型整段总价；为每晚价×晚数（税前口径）' },
    suite: null, suiteNote: '该日期无明确标Suite的房型（均为Villa命名）',
    source: 'Trip.com', checkedAt: '2026-09-26 15:14 UTC',
 },
  'Park Hyatt Kuala Lumpur': {
    checkIn: '2026-12-22', checkOut: '2026-12-24', nights: 2,
    base: { room: 'Twin Room', perNightUSD: 353, totalUSD: 768, totalInclTax: true, cancel: '不可退', breakfast: '不含早（+$33.82/人可选）', note: '同价另有King Room' },
    suite: { room: 'Park Suite King', perNightUSD: 785, totalUSD: 1701, totalInclTax: true, cancel: '不可退', breakfast: '不含早（+$33.82/人可选）' },
    source: 'Trip.com', checkedAt: '2026-09-26 15:16 UTC',
 },
  'Park Hyatt Saigon': {
    checkIn: '2026-12-24', checkOut: '2026-12-26', nights: 2,
    base: { room: 'Park King City View', perNightUSD: 611, totalUSD: 1321, totalInclTax: true, cancel: '12-10 23:59前免费取消', breakfast: '不含早（+$40.43/人可选）', note: '到店付' },
    suite: { room: 'Park Executive Suite', perNightUSD: 1988, totalUSD: 4295, totalInclTax: true, cancel: '12-10 23:59前免费取消', breakfast: '不含早（+$40.43/人可选）', note: '预付价，原价$2,024' },
    source: 'Trip.com', checkedAt: '2026-09-26 15:07 UTC',
 },
  'Penang Marriott Hotel 槟城万豪': {
    checkIn: '2026-12-20', checkOut: '2026-12-22', nights: 2,
    base: { room: 'King Room with Sofa Bed City View', perNightUSD: 210, totalUSD: 459, totalInclTax: true, cancel: '12-19 23:59 前免费取消', breakfast: '不含早（+ $19.15/人可选）' },
    suite: { room: 'One-Bedroom King Suite with Sofa Bed City View', perNightUSD: 357, totalUSD: 777, totalInclTax: true, cancel: '12-19 23:59 前免费取消', breakfast: '不含早（+ $19.15/人可选）' },
    source: 'Trip.com', checkedAt: '2026-09-25 03:38 UTC',
 },
  'Regent Phu Quoc': {
    checkIn: '2026-12-26', checkOut: '2026-12-29', nights: 3,
    base: null, suite: null,
    unavailable: '该日期无可订房：Trip.com明确显示无空房，且要求至少连住5晚（本次3晚不符合要求）；重试确认',
    source: 'Trip.com', checkedAt: '2026-09-26 15:14 UTC',
 },
  'Seven Terraces': {
    checkIn: '2026-12-20', checkOut: '2026-12-22', nights: 2,
    base: { room: 'Terrace Duplex Suite（入门房型本身即套房）', perNightUSD: 173, totalUSD: 385, totalInclTax: true, cancel: '12-13 18:00 前免费取消', breakfast: '含双早' },
    suite: { room: 'Terrace Duplex Suite（无更高阶套房；另有公寓房型 Stewart $282 / Argus $348）', perNightUSD: 173, totalUSD: 385, totalInclTax: true, cancel: '12-13 18:00 前免费取消', breakfast: '含双早' },
    source: 'Trip.com', checkedAt: '2026-09-25 03:43 UTC',
 },
  'Sheraton Saigon Grand Opera Hotel': {
    checkIn: '2026-12-24', checkOut: '2026-12-26', nights: 2,
    base: { room: 'Guest Room, 1 King Bed', perNightUSD: 263, totalUSD: 568, totalInclTax: true, cancel: '09-27 23:59前免费取消', breakfast: '不含早（+$32.22/人可选）', note: '到店付；2025年翻新' },
    suite: null, suiteNote: '该日期无套房',
    source: 'Trip.com', checkedAt: '2026-09-26 15:07 UTC',
 },
  'The Edison George Town': {
    checkIn: '2026-12-20', checkOut: '2026-12-22', nights: 2,
    base: { room: 'Deluxe Room', perNightUSD: 134, totalUSD: 323, totalInclTax: true, cancel: '不可退', breakfast: '含双早', note: '节日 7 折，原价 $203/晚' },
    suite: null, suiteNote: '该日期未找到可订套房',
    source: 'Trip.com', checkedAt: '2026-09-25 03:47 UTC',
 },
  'The Prestige Hotel Penang': {
    checkIn: '2026-12-20', checkOut: '2026-12-22', nights: 2,
    base: { room: 'Originals Twin', perNightUSD: 137, totalUSD: 303, totalInclTax: true, cancel: '12-18 18:00前免费取消', breakfast: '不含早（+$11.93/人可选）', note: '7折后价，原价$201' },
    suite: { room: 'Loft Suite', perNightUSD: 248, totalUSD: 541, totalInclTax: true, cancel: '12-18 18:00前免费取消', breakfast: '不含早（+$11.93/人可选）', note: '7折后价，原价$362；总价为明细加总约值' },
    source: 'Trip.com', checkedAt: '2026-09-26 14:46 UTC',
 },
  'The Reverie Saigon': {
    checkIn: '2026-12-24', checkOut: '2026-12-26', nights: 2,
    base: { room: 'Deluxe King Room', perNightUSD: 407, totalUSD: 880, totalInclTax: true, cancel: '不可退（早鸟价）', breakfast: '不含早（+$43.12/人可选）' },
    suite: { room: 'Junior Suite', perNightUSD: 646, totalUSD: 1396, totalInclTax: true, cancel: '不可退（早鸟价）', breakfast: '含双早', note: '含迷你吧、欢迎水果、酒廊' },
    source: 'Trip.com', checkedAt: '2026-09-26 15:07 UTC',
 },
  'The St. Regis Kuala Lumpur': {
    checkIn: '2026-12-22', checkOut: '2026-12-24', nights: 2,
    base: { room: 'City View King Room', perNightUSD: 319, totalUSD: 694, totalInclTax: true, cancel: '12-21 23:59前免费取消', breakfast: '不含早（+$31.90/人可选）', note: '到店付/预付同价' },
    suite: { room: 'Executive Junior King Suite', perNightUSD: 368, totalUSD: 800, totalInclTax: true, cancel: '12-21 23:59前免费取消', breakfast: '不含早（+$31.90/人可选）', note: '764平方英尺' },
    source: 'Trip.com', checkedAt: '2026-09-26 15:16 UTC',
 },
  '乐天酒店首尔 Lotte Hotel Seoul': {
  checkIn: '2026-12-31', checkOut: '2027-01-01', nights: 1,
  base: { room: 'Main Tower Grand Deluxe Family Twin', perNightUSD: 662.37, totalUSD: 722.04, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 28', breakfast: '需付费', note: 'Limited Time Offer 7% off; Our last 2!; 早餐为Great breakfast for $47.03 (optional)；更便宜的Main Tower Grand Superior Double（$555/晚）页面标注We recommend 2 rooms for your group（仅适合2成人），不符合1间房住2大1小' },
  suite: { room: 'Main Tower Superior Suite Family Twin - Club Lounge Access Included', perNightUSD: 995, totalUSD: 1085, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 28', breakfast: '需付费', note: 'Limited Time Offer 7% off; Our last 3!; 早餐为Great breakfast for $47.03 (optional)' },
  source: 'Trip.com', checkedAt: '2026-10-04T22:02:00-07:00',
  baselineUSD: 484, baselineCheckedAt: '2026-10-04T18:39:25Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Lotte%20Hotel%20Seoul',
 },
  '威斯汀朝鲜首尔 The Westin Josun Seoul': {
  checkIn: '2026-12-31', checkOut: '2027-01-01', nights: 1,
  base: { room: 'Deluxe King Room', perNightUSD: 611.72, totalUSD: 672.89, totalInclTax: true, cancel: 'Free Cancellation before 11:00 PM, Dec 25', breakfast: '需付费', note: 'Best price with free cancellation; Value deal $4 Off; Our last 2!; Children stay for free; 早餐为Great breakfast for $52.10 (optional)；酒店早餐政策：2岁及以下儿童免费' },
  suite: null,
  source: 'Trip.com', checkedAt: '2026-10-04T22:02:00-07:00',
  baselineUSD: 558, baselineCheckedAt: '2026-10-04T18:39:25Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=The%20Westin%20Josun%20Seoul',
 },
  '首尔四季酒店 Four Seasons Hotel Seoul': {
  checkIn: '2026-12-31', checkOut: '2027-01-01', nights: 1,
  base: { room: 'Corner Premier Room', perNightUSD: 1128.1, totalUSD: 1240.91, totalInclTax: true, cancel: 'Non-refundable', breakfast: '需付费', note: 'Today\'s best price!; Our last 1!; Children stay for free; 最便宜可订价为不可取消价，免费取消价$1,253/晚起；早餐为Great breakfast for $62.22 (optional)；酒店早餐政策：4岁及以下儿童免费' },
  suite: null,
  source: 'Trip.com', checkedAt: '2026-10-04T22:02:00-07:00',
  baselineUSD: 886, baselineCheckedAt: '2026-10-04T18:39:25Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Four%20Seasons%20Hotel%20Seoul',
 },
  '首尔江南朝鲜宫殿豪华精选酒店 Josun Palace, a Luxury Collection Hotel': {
  checkIn: '2026-12-31', checkOut: '2027-01-01', nights: 1,
  base: { room: 'Masters 2Queen beds Room', perNightUSD: 820.71, totalUSD: 902.78, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 30', breakfast: '需付费', note: 'Best price with free cancellation; Pay at Hotel; 早餐为Great breakfast for $59.54 (optional)；酒店早餐政策：2岁及以下儿童免费' },
  suite: null,
  source: 'Trip.com', checkedAt: '2026-10-04T22:02:00-07:00',
  baselineUSD: 707, baselineCheckedAt: '2026-10-04T18:39:25Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Josun%20Palace%20Seoul%20Gangnam',
 },
  '首尔江南安达仕酒店 Andaz Seoul Gangnam': {
  checkIn: '2026-12-31', checkOut: '2027-01-01', nights: 1,
  base: { room: 'King Room', perNightUSD: 1034.7, totalUSD: 1034.7, totalInclTax: true, cancel: 'Non-refundable', breakfast: '需付费', note: 'Today\'s best price!; Special Discount 6% off; Our last 3!; Children stay for free; 总价已含Service charge $94.05；早餐为Great breakfast for $49.12 (optional)；酒店早餐政策：5岁及以下儿童免费' },
  suite: null,
  source: 'Trip.com', checkedAt: '2026-10-04T22:02:00-07:00',
  baselineUSD: 879, baselineCheckedAt: '2026-10-04T18:39:25Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Andaz%20Seoul%20Gangnam',
 },
  '首尔新罗酒店 The Shilla Seoul': {
  checkIn: '2026-12-31', checkOut: '2027-01-01', nights: 1,
  base: { room: 'Deluxe Twin Room - Indoor Swimming Pool Access Only', perNightUSD: 610.6, totalUSD: 671.66, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 30', breakfast: '需付费', note: 'Best price with free cancellation; Member deal 17% off; Children stay for free; 早餐为Great breakfast for $66.98 (optional)；酒店早餐政策：2岁及以下儿童免费' },
  suite: { room: 'Premier Suite With Indoor Pool Access Only', perNightUSD: 2645.95, totalUSD: 2910.55, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 30', breakfast: '需付费', note: 'Special Discount $44 Off; 该套房Sleeps显示为2 adults，页面提示We recommend 2 rooms for your group；酒店政策：各年龄儿童可入住且免费，2岁及以下儿童早餐免费；早餐为Great breakfast for $66.98 (optional)' },
  source: 'Trip.com', checkedAt: '2026-10-04T22:02:00-07:00',
  baselineUSD: 542, baselineCheckedAt: '2026-10-04T18:39:25Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=The%20Shilla%20Seoul',
 },
  '首尔Signiel Signiel Seoul': {
  checkIn: '2026-12-31', checkOut: '2027-01-01', nights: 1,
  base: { room: 'Grand Deluxe Double City View', perNightUSD: 993.81, totalUSD: 1083.34, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 17', breakfast: '需付费', note: 'Best price with free cancellation; Our last 3!; Children stay for free; 早餐为Great breakfast for $55.82 (optional)；酒店早餐政策：3岁及以下儿童免费' },
  suite: { room: 'Deluxe Twin Suite', perNightUSD: 1242.25, totalUSD: 1354.17, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 17', breakfast: '需付费', note: '该套房Sleeps显示为2 adults，页面提示We recommend 2 rooms for your group；早餐为Great breakfast for $55.82 (optional)' },
  source: 'Trip.com', checkedAt: '2026-10-04T22:02:00-07:00',
  baselineUSD: 887, baselineCheckedAt: '2026-10-04T18:39:25Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Signiel%20Seoul',
 },
  '首尔梨泰院蒙德里安 Mondrian Seoul Itaewon': {
  checkIn: '2026-12-31', checkOut: '2027-01-01', nights: 1,
  base: { room: 'Signature TWIN', perNightUSD: 346.32, totalUSD: 380.95, totalInclTax: true, cancel: 'Non-refundable', breakfast: '需付费', note: 'Today\'s best price!; Special Discount $13 Off; Children stay for free; 最便宜可订价为不可取消价，免费取消价$373/晚起；早餐为Great breakfast for $44.65 (optional)；酒店早餐政策：3岁及以下儿童免费' },
  suite: { room: 'Suite Studio King', perNightUSD: 447.33, totalUSD: 492.06, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 30', breakfast: '需付费', note: 'Special Discount $17 Off; Children stay for free; Sleeps为2 adults + 1 child (2 years old)；早餐为Great breakfast for $44.65 (optional)' },
  source: 'Trip.com', checkedAt: '2026-10-04T22:02:00-07:00',
  baselineUSD: 349, baselineCheckedAt: '2026-10-04T18:39:25Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Mondrian%20Seoul%20Itaewon',
 },
  '首尔弘大RYSE RYSE, Autograph Collection': {
  checkIn: '2026-12-31', checkOut: '2027-01-01', nights: 1,
  base: { room: 'Editor King Room', perNightUSD: 543.91, totalUSD: 598.3, totalInclTax: true, cancel: 'Non-refundable', breakfast: '需付费', note: 'Today\'s best price!; Special Discount 10% off; 最便宜可订价为不可取消价，免费取消价$604/晚起（总价$665）；早餐为Great breakfast for $37.21 (optional)；酒店早餐政策：11岁及以下儿童KRW 25,000（~$18.61），成人KRW 50,000（~$37.21）' },
  suite: { room: 'Director Suite With King Bed And Sofa Bed', perNightUSD: 708.79, totalUSD: 779.67, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 24', breakfast: '需付费', note: 'Pay at hotel; Sleeps为4 adults；早餐为Great breakfast for $37.21 (optional)' },
  source: 'Trip.com', checkedAt: '2026-10-04T22:02:00-07:00',
  baselineUSD: 504, baselineCheckedAt: '2026-10-04T18:39:25Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=RYSE%20Autograph%20Collection%20Seoul',
 },
};

export function getLiveHotelPrice(name: string): LiveHotelPrice | undefined {
 return hotelLivePrices[name];
}

/**
 * 可展示的最低价房型（2026-10-04 审计修复）：
 * 基础房优先；套房专属酒店（base:null，如 Aman Nai Lert Bangkok、The Siam）用套房价，
 * 否则它们会被显示成"暂无实时价"——库里明明有价。都没有或整店无房返回 null。
 */
export function liveDisplayRate(p: LiveHotelPrice | undefined): LiveRoomRate | null {
  if (!p || p.unavailable) return null;
  return p.base || p.suite || null;
}

/** 当前价格数据覆盖的行程住宿日期快照（行程变化检测用） */
export const livePriceStayDates: Record<string, { checkIn: string; checkOut: string }> = Object.fromEntries(
 Object.entries(hotelLivePrices).map(([name, p]) => [name, { checkIn: p.checkIn, checkOut: p.checkOut }]),
);
