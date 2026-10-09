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
 * 2026-10-07 13:40–13:50 UTC（28 家行程酒店全量重查：新加坡 12/06–12/10、普吉 12/10–12/13、清迈 12/13–12/15、曼谷 12/15–12/18；4 浏览器任务并行、全程未登录、Trip.com 无登录墙/验证码；Raffles 新加坡该日期仍整店售罄；文华东方新加坡套房 Family Suite $918→$1274（+38.8%）；丽思卡尔顿新加坡/香格里拉新加坡/清迈万豪昨日可订套房今日无套房可订（有房变无房）；Amanpuri/悦榕庄/Keemala 套房栏为别墅型酒店的方法论口径差异（无明确 Suite 房型名），非真实翻转；其余基础房/套房变动均<10%）
 * 2026-10-08 2026-10-08T14:53–2026-10-08T15:45 UTC（31 家行程酒店全量重查：新加坡 12/06–12/10、普吉 12/10–12/13、清迈 12/13–12/15、曼谷 12/15–12/18；4 浏览器任务并行、全程未登录；Raffles 新加坡售罄状态见本轮；页面未显示数字总价的不做机械相乘（totalUSD=null、totalInclTax='unknown'））
 * 2026-10-09 2026-10-09T13:45:00Z–2026-10-09T14:00:00Z（31 家行程酒店全量重查：新加坡 12/06–12/10、普吉 12/10–12/13、清迈 12/13–12/15、曼谷 12/15–12/18；4 浏览器任务并行、全程未登录；页面未显示数字总价的不做机械相乘（totalUSD=null、totalInclTax='unknown'））
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
  base: { room: 'Premier Twin Room With Garden View', perNightUSD: 1171, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 3', breakfast: '需付费', note: 'Pay at hotel; free parking per room (1 per day) + Guest Benefits (1 per day); also $1,288 prepay rate (free cancel before 11:59 PM, Dec 2, Earn $280.84 Trip Coins); list page showed \'Total price: $5,617 1 room × 4 nights incl. taxes & fees\' but that belonged to the $1,288 rate, not this rate — not used' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Sentosa Suite', perNightUSD: 1562, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 3', breakfast: '需付费', note: 'Pay at hotel; also $1,718 prepay rate (free cancel before 11:59 PM, Dec 2); \'Show 6 Remaining Room Types\' expand button did not respond to clicks — suite verified among visible types only' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 996, baselineCheckedAt: '2026-10-09T13:56:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=capella%20singapore&qs=CAEgASgAMidDaGtJNVlyU3dwdnVqUDFVR2cwdlp5OHhNV1l5YzJnelp6Tm5FQUU&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=MAA&checkin=2026-12-06&checkout=2026-12-10&ved=0CAAQ5JsGahcKEwiwlI_Yg62XAxUAAAAAHQAAAAAQAw',
  source: 'Trip.com', checkedAt: '2026-10-09T13:56:00Z',
 },
  'Raffles Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: null,
  baseNote: 'No bookable rooms for 12/06–12/10, 2026.',
  suite: null,
  suiteNote: 'No bookable rooms for 12/06–12/10, 2026.',
  unavailable: 'No rooms available for your selected dates. You can still book for the following dates: Dec 3-Dec 4 From $1,282; Dec 4-Dec 5; Dec 5-Dec 6 From $1,291；Google shows no price for Dec 6–10; only \'Available for Dec 5 – 9 for $919\' alternative dates',
  baselineUrl: 'https://www.google.com/travel/search?q=raffles%20singapore&ap=MAA&checkin=2026-12-06&checkout=2026-12-10&ved=0CAAQ5JsGahcKEwiYzs2fhK2XAxUAAAAAHQAAAAAQBw&ts=CAAaGhIYEhIKBwjqDxAMGAYSBwjqDxAMGAoyAggCKgIKAA&qs=MiJDaFVJd3IzenN0dUl6cjlrR2drdmJTOHdNMncyTXpBUUFR',
  source: 'Trip.com', checkedAt: '2026-10-09T13:56:00Z',
 },
  'Marina Bay Sands': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Sands Premier King', perNightUSD: 698, totalUSD: 3042, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: '含免费早餐', note: 'Exclusive price for multi-night stays · Early bird price; Prepay online; We Price Match' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Sands Bay Suite King Gardens By The Bay View', perNightUSD: 1316, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: '含免费早餐', note: 'Exclusive price for multi-night stays · Early bird price; Prepay online; 20 additional room types not expanded — suite verified among visible types only' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 617, baselineCheckedAt: '2026-10-09T13:56:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=marina%20bay%20sands%20singapore&ap=MAA&checkin=2026-12-06&checkout=2026-12-10&ved=0CAAQ5JsGahcKEwjgnK3yhK2XAxUAAAAAHQAAAAAQfA&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&qs=CAEyIkNoVUkxN3ZWMHVfZnByWUNHZ2t2YlM4d1pHUTVNRE1RQVE',
  source: 'Trip.com', checkedAt: '2026-10-09T13:56:00Z',
 },
  'The Ritz-Carlton, Millenia Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Deluxe Kallang Twin Room', perNightUSD: 455, totalUSD: 1985, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Oct 10', breakfast: '含免费早餐', note: 'Extended Moments; Prepay online; Access Lower Price button; Last booked 13 mins ago' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Club Deluxe King Suite, Club Lounge Access, High Floor', perNightUSD: 876, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: '含免费早餐', note: 'Pay at hotel; all 9 remaining room types expanded and verified' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 414, baselineCheckedAt: '2026-10-09T13:56:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20ritz%20carlton%20millenia%20singapore&ap=MAA&checkin=2026-12-06&checkout=2026-12-10&ved=0CAAQ5JsGahgKEwjQ5rWThq2XAxUAAAAAHQAAAAAQpQE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&qs=CAEyI0NoWUkzNTZYX29Yb2xMbXVBUm9KTDIwdk1HSjZYMkkwRUFF',
  source: 'Trip.com', checkedAt: '2026-10-09T13:56:00Z',
 },
  'Mandarin Oriental Singapore 文华东方': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Deluxe Room King', perNightUSD: 386, totalUSD: 1685, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 4', breakfast: '需付费', note: 'Best price with free cancellation; Prepay online; Earn $84.25 in Trip Coins; Last booked 26 mins ago; We Price Match' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Family Suite', perNightUSD: 917, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 4', breakfast: '需付费', note: 'Prepay online; Earn $199.82 in Trip Coins; We Price Match; all 16 remaining room types expanded and verified' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 369, baselineCheckedAt: '2026-10-09T13:56:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=mandarin%20oriental%20singapore&ap=MAA&checkin=2026-12-06&checkout=2026-12-10&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&qs=CAEyIkNoVUkxWjNkMU5QR3ZKZ2dHZ2t2YlM4d09GOW9lSFFRQVE&ved=0CAAQ5JsGahgKEwjwv6iqh62XAxUAAAAAHQAAAAAQCA',
  source: 'Trip.com', checkedAt: '2026-10-09T13:56:00Z',
 },
  'Shangri-La Singapore 香格里拉': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Tower Wing Deluxe King Room', perNightUSD: 288, totalUSD: 1255, totalInclTax: true, cancel: 'Non-refundable', breakfast: '需付费', note: 'Today\'s best price!; Early bird price; Prepay online; Earn $12.56 in Trip Coins; Last booked 3 hrs ago; We Price Match; 首单促销（非会员价）：First booking offer up to $12 off / 20% off at check-out' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Horizon Club Junior Suite King', perNightUSD: 500, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Early bird price; Prepay online; Earn $21.81 in Trip Coins; all 9 remaining room types expanded and verified' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 242, baselineCheckedAt: '2026-10-09T13:56:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=shangri%20la%20singapore&ap=KigKEgm_n4mj0e7zPxEigC9AH_NZQBISCYrFk3YYN_U_ESKAL4Bi91lAMAA&checkin=2026-12-06&checkout=2026-12-10&ved=0CAcQh-kJahcKEwjg3PfiiK2XAxUAAAAAHQAAAAAQVg&qs=CAEyIkNoVUlpXy1jeUtlMTVmZEJHZ2t2YlM4d09UbGlOellRQVE4DUgA&ts=CAEaNwoZEhUKCC9tLzA2dDJ0OglTaW5nYXBvcmUaABIaEhQKBwjqDxAMGAYSBwjqDxAMGAoYBDICCAEqCQoFOgNVU0QaAA',
  source: 'Trip.com', checkedAt: '2026-10-09T13:56:00Z',
 },
  'The Fullerton Hotel Singapore 新加坡富丽敦酒店': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Premier Courtyard Room', perNightUSD: 309, totalUSD: 1348, totalInclTax: true, cancel: 'Non-refundable', breakfast: '未明确', note: 'Today\'s best price!; Early bird price; Prepay online; Earn $67.40 in Trip Coins; Last booked 1 hr ago; We Price Match; 首单促销（非会员价）：First booking offer up to $12 off / 20% off at check-out' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Premier Collyer Suite', perNightUSD: 581, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Prepay online; Earn $126.68 in Trip Coins; Our last 2!; all 9 remaining room types expanded and verified' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 235, baselineCheckedAt: '2026-10-09T13:56:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20fullerton%20hotel%20singapore&ap=MAA&checkin=2026-12-06&checkout=2026-12-10&ved=0CAAQ5JsGahgKEwiwuZmEiq2XAxUAAAAAHQAAAAAQoAE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&qs=CAEyIkNoVUkwT0g5MVl1S3ktQkJHZ2t2YlM4d09EZDNiR1lRQVE',
  source: 'Trip.com', checkedAt: '2026-10-09T13:56:00Z',
 },
  'Amanpuri': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Garden Pool Pavilion', perNightUSD: 3653, totalUSD: 11751, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 9', breakfast: '含免费早餐', note: 'Our last 3!; Prepay online; Instant confirmation; Earn $117.52 in Trip Coins' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Garden Pool Pavilion', perNightUSD: 3653, totalUSD: 11751, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 9', breakfast: '含免费早餐', note: 'Trip.com 上房型名中无 \'Suite\' 字样，最便宜可订房替代；Our last 3!; Prepay online; Instant confirmation' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 2255, baselineCheckedAt: '2026-10-09T13:47:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Amanpuri%20Phuket&qs=CAEyJENoY0l4TmYzc0x6WXZjYkZBUm9LTDIwdk1ETnVjR3N4WmhBQjgA&checkin=2026-12-10&checkout=2026-12-13&adults=2&curr=USD&gl=us&ved=0CAAQ5JsGahcKEwiAnKHFg62XAxUAAAAAHQAAAAAQAw&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-09T13:47:00Z',
 },
  'Trisara': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Ocean View Pool Villa', perNightUSD: 1928, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 26', breakfast: '含免费早餐', note: 'Our last 4!; Pay at hotel; Instant confirmation; prepay online option $2,079/night (free cancellation before Nov 25)', memberDeal: 'Limited Time Offer 15% off: Two Bedroom Signature Villa No.20 Original $6,968 → $5,859' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Signature Ocean View Pool Suite', perNightUSD: 2732, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 26', breakfast: '含免费早餐', note: 'Our last 2!; Pay at hotel; Instant confirmation; prepay online option $2,946/night' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 1153, baselineCheckedAt: '2026-10-09T13:47:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Trisara+Phuket&qs=OAA&checkin=2026-12-10&checkout=2026-12-13&adults=2&curr=USD&gl=us',
  source: 'Trip.com', checkedAt: '2026-10-09T13:47:00Z',
 },
  'Banyan Tree Phuket': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Banyan Pool Villa', perNightUSD: 749, totalUSD: 2408, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Best price with breakfast; Prepay online; Instant confirmation; Earn $120.40 in Trip Coins; free-cancellation option available at $936/night' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Banyan Pool Villa', perNightUSD: 749, totalUSD: 2408, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Trip.com 上房型名中无 \'Suite\' 字样，最便宜可订房替代（已展开全部11个房型核验）；Best price with breakfast; Prepay online' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 519, baselineCheckedAt: '2026-10-09T13:47:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Banyan%20Tree%20Phuket&qs=CAEyJ0Noa0l6dl9mOUxHVnNMMmFBUm9NTDJjdk1USm9jSFl3Y0dSeEVBRTgA&checkin=2026-12-10&checkout=2026-12-13&adults=2&curr=USD&gl=us&ved=0CAAQ5JsGahcKEwiQtOLchK2XAxUAAAAAHQAAAAAQAw&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-09T13:47:00Z',
 },
  'JW Marriott Phuket Resort & Spa 普吉JW万豪': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Guest Room,2 Double,Garden View,Balcony', perNightUSD: 467, totalUSD: 1503, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 7', breakfast: '需付费', note: 'Great breakfast optional $31.62; Pay at hotel; Instant confirmation; Best price with free cancellation' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: '1 Bedroom Suite, 1 King, Oceanfront, Whirlpool', perNightUSD: 1160, totalUSD: 3752, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 7', breakfast: '需付费', note: 'Great breakfast optional $31.62; Pay at hotel; Instant confirmation' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 418, baselineCheckedAt: '2026-10-09T13:47:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=JW+Marriott+Phuket+Resort+Spa&qs=OAA&checkin=2026-12-10&checkout=2026-12-13&adults=2&curr=USD&gl=us',
  source: 'Trip.com', checkedAt: '2026-10-09T13:47:00Z',
 },
  'The Surin Phuket': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'One Bedroom Deluxe Cottage', perNightUSD: 667, totalUSD: 2146, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Special Discount 7% off (Original $722 → $667); Prepay online; Confirmed Within 12 Hour(s); Last booked 8 hrs ago', memberDeal: 'Special Discount: base 7% off ($722 → $667); Beach Suite 8% off ($1,846 → $1,698)' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Beach Suite', perNightUSD: 1698, totalUSD: 5463, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Our last 1!; Special Discount 8% off (Original $1,846); Pay at hotel; Instant confirmation' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 660, baselineCheckedAt: '2026-10-09T13:47:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=The+Surin+Phuket&qs=OAA&checkin=2026-12-10&checkout=2026-12-13&adults=2&curr=USD&gl=us',
  source: 'Trip.com', checkedAt: '2026-10-09T13:47:00Z',
 },
  'Keemala': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Clay Pool Cottage', perNightUSD: 767, totalUSD: 2467, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Limited Time Offer 45% off (Original $1,439 → $767); Pay at hotel; Instant confirmation; Our last 4!', memberDeal: 'Limited Time Offer 45% off: $1,439 → $767 (Clay Pool Cottage)' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Clay Pool Cottage', perNightUSD: 767, totalUSD: 2467, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Trip.com 上房型名中无 \'Suite\' 字样，最便宜可订房替代（全部3个房型已核验）；Limited Time Offer 45% off; Pay at hotel' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 618, baselineCheckedAt: '2026-10-09T13:47:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Keemala%20Phuket&qs=CAEyKENob0k5YmZMdFlpMV9vdWNBUm9OTDJjdk1URmlZemN6WWpsck5oQUI4AA&checkin=2026-12-10&checkout=2026-12-13&adults=2&curr=USD&gl=us&ved=0CAAQ5JsGahcKEwiwwd2th62XAxUAAAAAHQAAAAAQBA&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-09T13:47:00Z',
 },
  '137 Pillars House': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Rajah Brooke Suite', perNightUSD: 691, totalUSD: 1482, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts; Special Discount 33% off; Our last 2!; Prepay online; Instant confirmation; 1 king bed, 753 ft², Garden view', memberDeal: 'Special Discount 33% off：原价 $1,062 → $691（Rajah Brooke Suite）' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Rajah Brooke Suite', perNightUSD: 691, totalUSD: 1482, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Cheapest bookable room is itself a Suite; same rate as base' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 580, baselineCheckedAt: '2026-10-09T13:45:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=137%20pillars%20house%20chiang%20mai&qs=CAEgASgAMihDaG9JX0ptRmo4dk8tWmlPQVJvTkwyY3ZNVEZqTTNCamN6azFlUkFCSAA&ved=0CAAQ5JsGahcKEwjAx57Nhq2XAxUAAAAAHQAAAAAQXg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgNEgcI6g8QDBgPGAIyAggBKgkKBToDVVNEGgA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-09T13:45:00Z',
 },
  'Four Seasons Resort Chiang Mai': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Upper Garden Pavilion King', perNightUSD: 1785, totalUSD: 3828, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 6', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts; Our last 1!; Prepay online; Instant confirmation; Mountain view, 753 ft²' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: null,
  suiteNote: 'No room type containing \'Suite\' bookable for these dates (7 room types: Garden/Rice Terrace Pavilions + Pool Villa)',
  baselineUSD: 1459, baselineCheckedAt: '2026-10-09T13:45:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=four%20seasons%20chiang%20mai&qs=CAAgASgA&ved=0CAAQ5JsGahgKEwjAx57Nhq2XAxUAAAAAHQAAAAAQrwI&ts=CAEqCQoFOgNVU0QaAA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-09T13:45:00Z',
 },
  'Raya Heritage': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Rin Suite with Terrace', perNightUSD: 446, totalUSD: 1059, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Nov 22', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts; Our last 1!; Pay at hotel; Instant confirmation; River view, 807 ft², 1 king bed', memberDeal: 'Special Discount 8% off：原价 $497 → $456（Rin Suite with Terrace 预付价）；Huen Bon Suite $651 → $598；Kramm Suite with Pool $753 → $692' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Rin Suite with Terrace', perNightUSD: 446, totalUSD: 1059, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Nov 22', breakfast: '含免费早餐', note: 'Cheapest bookable room is itself a Suite; same rate as base' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 404, baselineCheckedAt: '2026-10-09T13:45:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=raya%20heritage%20chiang%20mai&qs=CAAgASgA&ved=0CAAQ5JsGahgKEwjAx57Nhq2XAxUAAAAAHQAAAAAQlgM&ts=CAEqCQoFOgNVU0QaAA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-09T13:45:00Z',
 },
  'Anantara Chiang Mai': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Deluxe Room With Garden View', perNightUSD: 440, totalUSD: 1045, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts; Pay at hotel; Instant confirmation; Earn $10.45 in Trip Coins; Garden view, 538 ft²', memberDeal: 'Special Discount 6% off：原价 $489 → $460（Deluxe Room With Garden View 预付价）；$22 Off：原价 $728 → $706（Lanna Garden View Suite）' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Lanna Garden View Suite', perNightUSD: 673, totalUSD: 1444, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Early bird price; Prepay online; Instant confirmation; Earn $72.19 in Trip Coins; Garden view, 1130 ft²' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 412, baselineCheckedAt: '2026-10-09T13:45:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=anantara%20chiang%20mai&qs=CAAgASgA&ved=0CAAQ5JsGahgKEwjAx57Nhq2XAxUAAAAAHQAAAAAQ-gM&ts=CAEqCQoFOgNVU0QaAA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-09T13:45:00Z',
 },
  'Shangri-La Chiang Mai 清迈香格里拉': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Deluxe King Room', perNightUSD: 188, totalUSD: 403, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 12', breakfast: '需付费', note: 'Multi-night Discount 8% off; Prepay online; Instant confirmation; Great breakfast for $21.48 (optional); Mountain view, 462 ft²', memberDeal: 'Multi-night Discount 8% off：原价 $206 → $188（Deluxe King Room）；原价 $382 → $348（Executive King Suite）' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Executive King Suite', perNightUSD: 348, totalUSD: 747, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 12', breakfast: '含免费早餐', note: 'Multi-night Discount 8% off; Prepay online; Instant confirmation; Includes Horizon Club Lounge Benefits; 925 ft²' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 157, baselineCheckedAt: '2026-10-09T13:45:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=shangri-la%20chiang%20mai&qs=CAAgASgA&ved=0CAAQ5JsGahgKEwjAx57Nhq2XAxUAAAAAHQAAAAAQ6AQ&ts=CAEqCQoFOgNVU0QaAA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-09T13:45:00Z',
 },
  'Chiang Mai Marriott Hotel 清迈万豪': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Deluxe King - City View', perNightUSD: 197, totalUSD: 425, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 12', breakfast: '需付费', note: 'Pay at hotel; Instant confirmation; Last booked 32 mins ago; Great breakfast for $22.82 (optional); City view, 387 ft²' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Executive Suite, 1 Bedroom, 1 King, Club Lounge Access', perNightUSD: 328, totalUSD: 708, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 12', breakfast: '需付费', note: 'Unlimited M Club access (Club Lounge benefits); Pay at hotel; Instant confirmation; Great breakfast for $22.82 (optional); Mountain view, 818 ft²' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 178, baselineCheckedAt: '2026-10-09T13:45:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=chiang%20mai%20marriott%20hotel&qs=CAAgASgA&ved=0CAAQ5JsGahgKEwjAx57Nhq2XAxUAAAAAHQAAAAAQywU&ts=CAEqCQoFOgNVU0QaAA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-09T13:45:00Z',
 },
  'The Ritz-Carlton, Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe King', perNightUSD: 365, totalUSD: 1163, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 14', breakfast: '需付费', note: 'Search results: Total price $1,163 (1 room × 3 nights incl. taxes & fees); Pay at hotel; Instant confirmation; strikethrough Original price shown next to Current price $365 (exact original not legible)' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: null,
  suiteNote: 'no room type with \'Suite\' in name for these dates (all room types expanded; only Deluxe/Club rooms)',
  baselineUSD: 328, baselineCheckedAt: '2026-10-09T14:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20ritz-carlton%20bangkok%20bangkok%20thailand&qs=CAEgASgAMidDaGtJX01lMTJLNzJxOG9SR2cwdlp5OHhNWGM1WnpOeWVXTmZFQUU&ved=0CAAQ5JsGahcKEwjw0um6g62XAxUAAAAAHQAAAAAQZQ&ts=CAEqBwoFOgNVU0Q&ap=KigKEgk20zfxv3MrQBHYGgBGySJZQBISCUWROeY9ditAEdgaAHoNI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-09T14:00:00Z',
 },
  'The Peninsula Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe King Room', perNightUSD: 399, totalUSD: 1272, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts; Member deal 10% off (Original $446 → $399); Prepay online; Instant confirmation; Our last 4!; search results Total price $1,272 (1 room × 3 nights incl. taxes & fees)', memberDeal: 'Original price $446 → Current price $399 (Member deal 10% off)' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Deluxe King Suite', perNightUSD: 588, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts; Member deal 10% off (Original $658 → $588); Prepay online; Instant confirmation; Our last 4!; detail page showed \'Total price: 1 room × 3 nights incl. taxes & fees\' without explicit dollar amount' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 262, baselineCheckedAt: '2026-10-09T14:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20peninsula%20bangkok&qs=CAEgASgAMiNDaFlJdDVxM2h2YmszdHBYR2dvdmJTOHdaMmM0TUhvNUVBRQ&ved=0CAAQ5JsGahcKEwj4iOmJha2XAxUAAAAAHQAAAAAQBg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgPEgcI6g8QDBgSGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-09T14:00:00Z',
 },
  'Rosewood Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe Twin Room', perNightUSD: 351, totalUSD: 1119, totalInclTax: true, cancel: 'Non-refundable', breakfast: '需付费', note: 'Great breakfast for $44.95 (optional); Member deal 15% off (Original $417 → $351); Pay at hotel; Instant confirmation; Last booked 2 hrs ago; search results Total price $1,119 (1 room × 3 nights incl. taxes & fees)', memberDeal: 'Original price $417 → Current price $351 (Member deal 15% off)' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Premier Suite', perNightUSD: 673, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Includes 1 great breakfast; Member deal 15% off (Original $800 → $673); Prepay online; Instant confirmation; detail page showed \'Total price: 1 room × 3 nights incl. taxes & fees\' without explicit dollar amount' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 287, baselineCheckedAt: '2026-10-09T14:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=rosewood%20bangkok&qs=CAEgASgAMidDaGtJLWZQVTZyLWh6T04yR2cwdlp5OHhNWGM1WnpOeWVqVmZFQUU&ved=0CAAQ5JsGahcKEwiw8a2Rhq2XAxUAAAAAHQAAAAAQbAE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgPEgcI6g8QDBgSGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-09T14:00:00Z',
 },
  '曼谷文华东方': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe Premier King Room', perNightUSD: 545, totalUSD: 1740, totalInclTax: true, cancel: 'Non-refundable', breakfast: '需付费', note: 'Great breakfast for $63.13 (optional); Member deal (Original $546 → $545); Prepay online; Instant confirmation; We Price Match; Last booked 1 hr ago; search results Total price $1,740 (1 room × 3 nights incl. taxes & fees)', memberDeal: 'Original price $546 → Current price $545 (Member deal)' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Junior King Suite With Terrace', perNightUSD: 1749, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '需付费', note: 'Great breakfast for $63.13 (optional); 6% off (Original $1,865 → $1,749); Prepay online; Instant confirmation; Our last 2!; detail page showed \'Total price: 1 room × 3 nights incl. taxes & fees\' without explicit dollar amount' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 507, baselineCheckedAt: '2026-10-09T14:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=mandarin%20oriental%20bangkok&qs=CAEgASgAMiJDaFVJNVpXbnRMYkdzOWtMR2drdmJTOHdPRFZpTjJjUUFR&ved=0CAAQ5JsGahcKEwiwmNykh62XAxUAAAAAHQAAAAAQrgE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgPEgcI6g8QDBgSGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-09T14:00:00Z',
 },
  'Capella Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Riverfront King Room', perNightUSD: 905, totalUSD: 2887, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 10', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts; Prepay online; Instant confirmation; Our last 3!; Earn $144.35 in Trip Coins; Last booked 13 hrs ago; strikethrough Original price shown (exact original not legible); search results Total price $2,887 (1 room × 3 nights incl. taxes & fees)' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Courtyard Suite', perNightUSD: 1469, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 3:00 PM, Dec 10', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts; Prepay online; Instant confirmation; Our last 1!; detail page showed \'Total price: 1 room × 3 nights incl. taxes & fees\' without explicit dollar amount' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 727, baselineCheckedAt: '2026-10-09T14:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=capella%20bangkok&qs=CAEgASgAMidDaGtJNlBHbjRkSzExSnN5R2cwdlp5OHhNW00yZW5wbWVUWmtFQUU&ved=0CAAQ5JsGahgKEwiYs4-BiK2XAxUAAAAAHQowE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgPEgcI6g8QDBgSGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-09T14:00:00Z',
 },
  'Aman Nai Lert Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: null,
  baseNote: '全店可订房型均为套房；基础房栏记 null（套房专属酒店口径，与昨日一致）',
  suite: { room: 'Premier Suite', perNightUSD: 1943, totalUSD: 6197, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts; Prepay online; Instant confirmation; Earn $92.96 in Trip Coins; Last booked 29 mins ago; strikethrough Original price shown (exact original not legible); search results Total price $6,197 (1 room × 3 nights incl. taxes & fees)' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 1755, baselineCheckedAt: '2026-10-09T14:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=aman%20nai%20lert%20bangkok%20thailand&qs=CAEgASgAMihDaG9JaUtXVGw5S0YyUG15QVJvTkwyY3ZNVEZxYW5kdWNXWTRjaEFCSAA&ved=0CAAQ5JsGahcKEwjol9z3iK2XAxUAAAAAHQAAAAAQNQ&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgPEgcI6g8QDBgSGAMyAggBKgkKBToDVVNEGgA&ap=KigKEgkO-kpBFn0rQBGdRe863iJZQBISCXGflymUfytAEZ1F724iI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-09T14:00:00Z',
 },
  'Four Seasons Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe Room - King', perNightUSD: 693, totalUSD: 2210, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 14', breakfast: '需付费', note: 'Great breakfast for $47.35 (optional); Prepay online; Instant confirmation; We Price Match; Our last 1!; Last booked 14 hrs ago; strikethrough Original price shown; First booking offer promos (Up to $12 off / Up to 20% off); search results Total price $2,210 (1 room × 3 nights incl. taxes & fees)' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: null,
  suiteNote: 'no room type with \'Suite\' in name for these dates (all 8 room types shown after expanding; only Deluxe/Premier rooms)',
  baselineUSD: 593, baselineCheckedAt: '2026-10-09T14:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=four%20seasons%20bangkok&qs=CAAgASgA',
  source: 'Trip.com', checkedAt: '2026-10-09T14:00:00Z',
 },
  'The Siam': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: null,
  baseNote: '全店可订房型均为套房/别墅；基础房栏记 null（套房专属酒店口径，与昨日一致）',
  suite: { room: 'Siam Suite', perNightUSD: 744, totalUSD: 2374, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts; Prepay online; Instant confirmation; We Price Match; Free minibar; Boat transfer service to Central Sathorn Pier (2 per day); strikethrough Original price shown; search results Total price $2,374 (1 room × 3 nights incl. taxes & fees)' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 375, baselineCheckedAt: '2026-10-09T14:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20siam%20bangkok&qs=CAAgASgA&ved=0CAAQ5JsGahcKEwiAwI7ciq2XAxUAAAAAHQAAAAAQBw',
  source: 'Trip.com', checkedAt: '2026-10-09T14:00:00Z',
 },
  'The Athenee Hotel, a Luxury Collection Hotel, Bangkok 曼谷雅典娜豪华精选酒店': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Athenee King Room Non smoking', perNightUSD: 234, totalUSD: 747, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 14', breakfast: '需付费', note: 'Great breakfast for $29.80 (optional); Pay at hotel; Instant confirmation; Earn $7.48 in Trip Coins; Last booked 12 hrs ago; strikethrough Original price shown; search results Total price $747 (1 room × 3 nights incl. taxes & fees)' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Athenee Suite Non smoking', perNightUSD: 432, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 14', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts; Pay at hotel; Instant confirmation; detail page showed \'Total price: 1 room × 3 nights incl. taxes & fees\' without explicit dollar amount' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 211, baselineCheckedAt: '2026-10-09T14:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20athenee%20hotel%20bangkok&qs=CAAgASgA',
  source: 'Trip.com', checkedAt: '2026-10-09T14:00:00Z',
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
  'Andaz Singapore 新加坡安达仕酒店': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'King Room', perNightUSD: 262, totalUSD: 1143, totalInclTax: true, cancel: 'Non-refundable', breakfast: '需付费', note: 'Today\'s best price!; Prepay online; Instant confirmation; Last booked 3 hrs ago; We Price Match; 首单促销（非会员价）：First booking offer up to $12 off / 20% off at check-out' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Andaz King Suite', perNightUSD: 485, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '需付费', note: 'Prepay online; Instant confirmation; all 6 remaining room types expanded and verified' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 238, baselineCheckedAt: '2026-10-09T13:56:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=andaz%20singapore&ap=MAA&checkin=2026-12-06&checkout=2026-12-10&ved=0CAAQ5JsGahgKEwig9_yIi62XAxUAAAAAHQAAAAAQkwE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&qs=CAEyJ0Noa0l3ZVByMVB2NXZyVnZHZzB2Wnk4eE1XUjRaR0kwY0dJd0VBRQ',
  source: 'Trip.com', checkedAt: '2026-10-09T13:56:00Z',
 },
  'Hyatt Regency Phuket Resort 普吉凯悦度假酒店': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: '1 King Bed', perNightUSD: 280, totalUSD: 900, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Special Discount 10% off (Original $315 → $280); Prepay online; Instant confirmation; Exclusive price for multi-night stays; Last booked 1 min ago', memberDeal: 'Special Discount 10% off: $315 → $280 (1 King Bed)' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Two Bedroom Regency Suite', perNightUSD: 664, totalUSD: 2137, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 7', breakfast: '需付费', note: 'Great breakfast optional $22.80; Special Discount $8 Off (Original $672); Prepay online; Instant confirmation' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 274, baselineCheckedAt: '2026-10-09T13:47:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Hyatt%20Regency%20Phuket%20Resort&qs=CAEyJkNoZ0loNG1QNHNDc21NOVZHZ3d2Wnk4eGVXZDJjM1kyY2pnUUFROAA&checkin=2026-12-10&checkout=2026-12-13&adults=2&curr=USD&gl=us&ved=0CAAQ5JsGahcKEwjY29Giia2XAxUAAAAAHQAAAAAQBg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-09T13:47:00Z',
 },
  'Park Hyatt Bangkok 曼谷柏悦酒店': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'King Room', perNightUSD: 398, totalUSD: 1279, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 12', breakfast: '需付费', note: 'Great breakfast for $38.59 (optional); Pay at hotel; Instant confirmation; We Price Match; Earn $12.79 in Trip Coins; Last booked 1 hr ago; First booking offer promos (Up to $12 off / Up to 20% off); strikethrough Original price shown; search results Total price $1,279 (1 room × 3 nights incl. taxes & fees)' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Park Deluxe Suite', perNightUSD: 1049, totalUSD: 3366, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 12', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts; Pay at hotel; Instant confirmation; Free Gift; Earn $33.68 in Trip Coins; detail page Total price $3,366 (1 room × 3 nights incl. taxes & fees)' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 321, baselineCheckedAt: '2026-10-09T14:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=park%20hyatt%20bangkok&qs=CAAgASgA',
  source: 'Trip.com', checkedAt: '2026-10-09T14:00:00Z',
 },
  '首尔柏悦酒店 Park Hyatt Seoul': {
  checkIn: '2026-12-31', checkOut: '2027-01-01', nights: 1,
  base: { room: '1 King Bed', perNightUSD: 692, totalUSD: 761.58, totalInclTax: true, cancel: '不可退', breakfast: '不含（+$48.59/人可选）', note: '仅剩4间；总价为页面明示含税总价' },
  suite: { room: 'Park Corner Suite', perNightUSD: 1036, totalUSD: 1139.13, totalInclTax: true, cancel: '12/28 23:59前免费取消', breakfast: '不含', note: '仅剩4间；总价为页面明示含税总价' },
  source: 'Trip.com 实查', checkedAt: '2026-10-08T03:22:00Z',
  baselineUSD: 707, baselineCheckedAt: '2026-10-08T03:22:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=park%20hyatt%20seoul',
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
