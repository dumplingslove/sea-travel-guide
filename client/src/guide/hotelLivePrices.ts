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
}

export const hotelLivePrices: Record<string, LiveHotelPrice> = {
  'Capella Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Premier Twin Room With Garden View', perNightUSD: 1172, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 3', breakfast: 'Great breakfast $63.69/person (optional) - not included', note: 'Cheapest bookable = Pay at hotel rate (prepay rate $1,289); 页面未显示数字总价 (label only)' },
  suite: { room: 'Sentosa Suite', perNightUSD: 1562, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 3', breakfast: 'Great breakfast $63.69/person (optional) - not included', note: 'Pay at hotel (prepay $1,718); 页面未显示数字总价 (label only)' },
  baselineUSD: 996, baselineCheckedAt: '2026-10-05T16:55:32Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Capella%20Singapore&qs=CAEyJ0Noa0k1WXJTd3B2dWpQMVVHZzB2Wnk4eE1XWXljMmd6WnpObkVBRTgA&ved=0CAAQ5JsGahgKEwiI382-_aKXAxUAAAAAHQAAAAAQmQE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-05T16:55:32Z',
 },
  'Raffles Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: null,
  suite: null,
  unavailable: '该日期整店售罄（list card: \'No rooms available for your selected dates\'; detail: \'No availability for these dates\'）; Google Hotels 也显示该日期无价（仅提示 Dec 5-9 有房 $919，非行程日期）',
  baselineUrl: 'https://www.google.com/travel/search?q=Raffles%20Singapore&qs=CAEyIkNoVUl3cjN6c3R1SXpyOWtHZ2t2YlM4d00ydzJNekFRQVE4AA&ved=0CAAQ5JsGahgKEwiQgdyjgKOXAxUAAAAAHQAAAAAQkAE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-05T16:55:32Z',
 },
  'Marina Bay Sands': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Sands Premier King', perNightUSD: 699, totalUSD: 3046, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: 'Includes 2 great breakfasts', note: 'Exclusive price for multi-night stays; Early bird price; total $3,046 = Total price element at $699/night (1 room x 4 nights incl. taxes & fees); search card showed $3,044 at $698/night, price shifted slightly during session' },
  suite: { room: 'Sands Bay Suite King Gardens By The Bay View', perNightUSD: 1317, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: 'Includes 2 great breakfasts', note: '页面未显示数字总价 (label only); 本轮重查为新日期实价' },
  baselineUSD: 603, baselineCheckedAt: '2026-10-05T16:55:32Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Marina%20Bay%20Sands&qs=CAEyIkNoVUkxN3ZWMHVfZnByWUNHZ2t2YlM4d1pHUTVNRE1RQVE4AA&ved=0CAAQ5JsGahcKEwiQncS6n6OXAxUAAAAAHQAAAAAQBg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-05T16:55:32Z',
 },
  'The Ritz-Carlton, Millenia Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Deluxe Kallang Twin Room', perNightUSD: 456, totalUSD: 1987, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Oct 7', breakfast: 'Includes 2 great breakfasts', note: 'Last booked 1 hr ago; \'Best price with breakfast and free cancellation\', \'Extended Moments\'; total $1,987 from search results card (incl. taxes & fees); 注意：上一轮$428为登录会员价（Deluxe Kallang King），本轮未登录，最便宜可见为Twin房型' },
  suite: null,
  suiteNote: '本轮未找到可订套房（2成人可订房型均无 Suite 命名；上一轮 Club Deluxe King Suite $843 为旧日期1成人价口径）',
  baselineUSD: 414, baselineCheckedAt: '2026-10-05T16:55:32Z',
  baselineUrl: 'https://www.google.com/travel/search?q=The%20Ritz%20Carlton%2C%20Millenia%20Singapore&qs=CAEyI0NoWUkzNTZYX29Yb2xMbXVBUm9KTDIwdk1HSjZYMkkwRUFFOAA&ved=0CAAQ5JsGahcKEwjIpeGpoqOXAxUAAAAAHQAAAAAQBg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-05T16:55:32Z',
 },
  'Mandarin Oriental Singapore 文华东方': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Sea View Room King', perNightUSD: 458, totalUSD: 1995, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 4', breakfast: 'Great breakfast $33.73/person (optional) - not included', note: 'Last booked 31 mins ago; total $1,995 from search results card (incl. taxes & fees)' },
  suite: { room: 'Family Suite', perNightUSD: 916, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 4', breakfast: 'Great breakfast $33.73/person (optional) - not included', note: '页面未显示数字总价 (label only); 注意：上一轮$1,275为1成人价口径，口径不同' },
  baselineUSD: 362, baselineCheckedAt: '2026-10-05T16:55:32Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Mandarin%20Oriental%20Singapore&qs=CAEyIkNoVUl3cjN6c3R1SXpyOWtHZ2t2YlM4d09GOW9lSFFRQVE4AA&ved=0CAAQ5JsGahgKEwi4xp-ApaOXAxUAAAAAHQAAAAAQfA&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-05T16:55:32Z',
 },
  'Shangri-La Singapore 香格里拉': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Tower Wing Deluxe King Room', perNightUSD: 288, totalUSD: 1256, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Great breakfast $40.32/person (optional) - not included', note: 'Today\'s best price!; Early bird price; Last booked 2 mins ago; total $1,256 from search results card (incl. taxes & fees); 注意：上一轮$260为登录会员10% off价，本轮未登录，可见公开价$288' },
  suite: null,
  baselineUSD: 234, baselineCheckedAt: '2026-10-05T16:55:32Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Shangri%20La%20Singapore&qs=CAEgACgAMiJDaFVJaV8tY3lLZTE1ZmRCR2drdmJTOHdPVGxpTnpZUUFROA1IAA&ved=0CAAQ5JsGahgKEwigge6BqKOXAxUAAAAAHQAAAAAQnAI&ts=CAESCgoCCAMKAggDEAAaNwoZEhUKCC9tLzA2dDJ0OglTaW5nYXBvcmUaABIaEhQKBwjqDxAMGAYSBwjqDxAMGAoYBDICCAEqCQoFOgNVU0QaAA&ap=KigKEgm_n4mj0e7zPxGd3zAxP_NZQBISCYrFk3YYN_U_EZ3fMHGC91lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-05T16:55:32Z',
 },
  'The Fullerton Hotel Singapore 新加坡富丽敦酒店': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Premier Courtyard Room', perNightUSD: 309, totalUSD: 1349, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Not included (rate has no breakfast; includes 15% Off Airport Transfers perk)', note: 'Today\'s best price!; Early bird price; Last booked 4 hrs ago; total $1,349 from search results card (incl. taxes & fees); 注意：上一轮$283为登录会员10% off价，本轮未登录，可见公开价$309' },
  suite: { room: 'Premier Collyer Suite', perNightUSD: 582, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Our last 2!; 页面未显示数字总价 (label only)' },
  baselineUSD: 221, baselineCheckedAt: '2026-10-05T16:55:32Z',
  baselineUrl: 'https://www.google.com/travel/search?q=The%20Fullerton%20Hotel%20Singapore&qs=CAEyIkNoVUkwT0g5MVl1S3ktQkJHZ2t2YlM4d09EZDNiR1lRQVE4AA&ved=0CAAQ5JsGahcKEwiI7M-hq6OXAxUAAAAAHQAAAAAQBg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-05T16:55:32Z',
 },
  'Amanpuri': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Garden Pool Pavilion', perNightUSD: 3653, totalUSD: 11751, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 9', breakfast: 'Includes 2 great breakfasts', note: 'Our last 3!; Prepay online, instant confirmation; total $11,751 from search results page (1 room x 3 nights incl. taxes & fees); detail page shows per-night only; search-list card earlier showed $3,653/night consistent' },
  suite: null,
  baselineUSD: 2350, baselineCheckedAt: '2026-10-05T14:20:26Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Amanpuri&qs=CAEyJENoY0l4TmYzc0x6WXZjYkZBUm9LTDIwdk1ETnVjR3N4WmhBQjgA&ved=0CAAQ5JsGahcKEwiAlJus_KKXAxUAAAAAHQAAAAAQYQ&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-05T14:20:26Z',
 },
  'Trisara': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Ocean View Pool Villa', perNightUSD: 1917, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Nov 26', breakfast: 'Includes 2 great breakfasts', note: 'Our last 5!; Cheapest bookable = Pay at hotel rate (prepay alternative $2,048); total not displayed numerically for this rate' },
  suite: { room: 'Signature Ocean View Pool Suite', perNightUSD: 2715, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Nov 26', breakfast: 'Includes 2 great breakfasts', note: 'Our last 2!; Cheapest suite = Pay at hotel rate; total not displayed numerically' },
  baselineUSD: 1869, baselineCheckedAt: '2026-10-05T14:20:26Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Trisara&qs=CAEyJkNoZ0lsYi03bzZTTDRwZkVBUm9MTDJjdk1YUnFPVE4yZWpBUUFROAA&ved=0CAAQ5JsGahgKEwi40vaq_6KXAxUAAAAAHQAAAAAQmwE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-05T14:20:26Z',
 },
  'Banyan Tree Phuket': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Banyan Pool Villa', perNightUSD: 746, totalUSD: 2398, totalInclTax: true, cancel: 'Non-refundable (cheapest rate); free-cancellation variant $932/night', breakfast: 'Includes 2 great breakfasts', note: 'Last booked 2 hrs ago; total $2,398 from search results page (1 room x 3 nights incl. taxes & fees)' },
  suite: null,
  baselineUSD: 610, baselineCheckedAt: '2026-10-05T14:20:26Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Banyan%20Tree%20Phuket&qs=CAEyJ0Noa0l6dl9mOUxHVnNMMmFBUm9NTDJjdk1USm9jSFl3Y0dSeEVBRTgA&ved=0CAAQ5JsGahgKEwi4ofbhgaOXAxUAAAAAHQAAAAAQoAE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-05T14:20:26Z',
 },
  'JW Marriott Phuket Resort & Spa 普吉JW万豪': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Guest Room, 2 Double, Garden View, Balcony', perNightUSD: 400, totalUSD: 1286, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 7', breakfast: 'Great breakfast for $31.46 (optional) - not included', note: 'Last booked 22 hrs ago; total $1,286 from search results page (1 room x 3 nights incl. taxes & fees)' },
  suite: { room: 'Two Bedroom Family Suite, 2 Double, Pool View', perNightUSD: 1071, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '未明确 (no breakfast line for this rate; other rates list optional $31.46)', note: 'Our last 4!; Prepay online; cheapest suite this round (prev round: 1 Bedroom Suite Oceanfront Private Pool $1,292 - different room type); total not displayed numerically' },
  baselineUSD: 361, baselineCheckedAt: '2026-10-05T14:20:26Z',
  baselineUrl: 'https://www.google.com/travel/search?q=JW%20Marriott%20Phuket%20Resort%20%26%20Spa&qs=CAEyJ0Noa0l5TXJka2JHeXhhVkVHZzB2Wnk4eE1XSjBkMnM1Y0RscUVBRTgA&ved=0CAAQ5JsGahgKEwi4-q2hhKOXAxUAAAAAHQAAAAAQgQE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-05T14:20:26Z',
 },
  'The Surin Phuket': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'One Bedroom Hillside Cottage', perNightUSD: 903, totalUSD: 2906, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Our last 1!; Special Discount 9% off ($998 -> $903); total $2,906 from search results page (incl. taxes & fees)' },
  suite: { room: 'Beach Suite', perNightUSD: 1710, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Our last 1!; Special Discount $66 Off ($1,776 -> $1,710); other suite Beach Deluxe Suite $1,903/night; total not displayed numerically' },
  baselineUSD: 828, baselineCheckedAt: '2026-10-05T14:20:26Z',
  baselineUrl: 'https://www.google.com/travel/search?q=The%20Surin%20Phuket&qs=CAEyJkNoZ0k1c19kZ1AzeGgtVlBHZ3d2Wnk4eE1tcGlkREEyTkdvUUFROAA&ved=0CAAQ5JsGahcKEwig_PGFhqOXAxUAAAAAHQAAAAAQBw&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-05T14:20:26Z',
 },
  'Keemala': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Clay Pool Cottage', perNightUSD: 805, totalUSD: 2591, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Our last 4!; Early Bird Deal 42% off ($1,431 -> $805); total $2,591 from search results page (incl. taxes & fees)' },
  suite: null,
  baselineUSD: 619, baselineCheckedAt: '2026-10-05T14:20:26Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Keemala&qs=CAEyKENob0k5YmZMdFlpMV9vdWNBUm9OTDJjdk1URmlZemN6WWpsck5oQUI4AA&ved=0CAAQ5JsGahcKEwi43cCEiKOXAxUAAAAAHQAAAAAQBg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-05T14:20:26Z',
 },
  '137 Pillars House': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Rajah Brooke Suite', perNightUSD: 609, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 1:00 AM, Nov 21', breakfast: 'Includes 2 great breakfasts', note: 'Our last 5!; suite-only property; Special Discount 9% off (orig $673); 页面未显示该房价的数字总价 (label \'Total price: 1 room x 2 nights incl. taxes & fees\' only); search card showed total $1,306' },
  suite: { room: 'Rajah Brooke Suite', perNightUSD: 609, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 1:00 AM, Nov 21', breakfast: 'Includes 2 great breakfasts', note: 'All room types at this hotel are suites; cheapest suite is the same room as base.' },
  baselineUSD: 551, baselineCheckedAt: '2026-10-05T14:27:16Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=137%20Pillars%20House%20Chiang%20Mai',
  source: 'Trip.com', checkedAt: '2026-10-05T14:27:16Z',
 },
  'Four Seasons Resort Chiang Mai': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Upper Garden Pavilion King', perNightUSD: 1761, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 3:00 PM, Dec 6', breakfast: 'Includes 2 great breakfasts', note: 'Our last 1!; \'Best price with breakfast and free cancellation\'; 页面未显示数字总价; search card showed total $3,777' },
  suite: null,
  baselineUSD: 1558, baselineCheckedAt: '2026-10-05T14:27:16Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Four%20Seasons%20Resort%20Chiang%20Mai',
  source: 'Trip.com', checkedAt: '2026-10-05T14:27:16Z',
 },
  'Raya Heritage': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Rin Suite with Terrace', perNightUSD: 444, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Nov 22', breakfast: 'Includes 2 great breakfasts', note: 'suite-only property; cheapest plan Pay at hotel; \'best price with breakfast and free cancellation\' plan $459/night (orig $494, 7% off); 页面未显示数字总价; search card showed total $984' },
  suite: { room: 'Rin Suite with Terrace', perNightUSD: 444, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Nov 22', breakfast: 'Includes 2 great breakfasts', note: 'Cheapest bookable suite is the same room as base (all room types are suites).' },
  baselineUSD: 440, baselineCheckedAt: '2026-10-05T14:27:16Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Raya%20Heritage%20Chiang%20Mai',
  source: 'Trip.com', checkedAt: '2026-10-05T14:27:16Z',
 },
  'Anantara Chiang Mai': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Deluxe Room With Garden View', perNightUSD: 428, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable (cheapest plan; free-cancellation plan $700, before 11:59 PM, Nov 29)', breakfast: 'Includes 2 great breakfasts', note: 'Cheapest plan Pay at hotel; \'best price with breakfast\' plan $447/night (orig $475, 6% off); Last booked 53 mins ago; 页面未显示数字总价; search card showed total $959' },
  suite: { room: 'Lanna Garden View Suite', perNightUSD: 672, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable (free-cancellation plan $782, before 11:59 PM, Nov 29)', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online, Early bird price; 页面未显示数字总价' },
  baselineUSD: 400, baselineCheckedAt: '2026-10-05T14:27:16Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Anantara%20Chiang%20Mai%20Resort',
  source: 'Trip.com', checkedAt: '2026-10-05T14:27:16Z',
 },
  'Shangri-La Chiang Mai 清迈香格里拉': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Deluxe King Room', perNightUSD: 183, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 12', breakfast: 'Great breakfast for $21.37 (optional) - not included', note: 'Multi-night Discount 13% off (orig $212); Prepay online; Last booked 1 hr ago; 页面未显示数字总价; search card showed total $392' },
  suite: null,
  suiteNote: '本轮未找到可订套房（展开全部房型：Deluxe King/Twin、Pool View variants、Premier King/Twin，均无 Suite 命名房型；上一轮有 Executive King Suite $323）',
  baselineUSD: 144, baselineCheckedAt: '2026-10-05T14:27:16Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Shangri-La%20Chiang%20Mai',
  source: 'Trip.com', checkedAt: '2026-10-05T14:27:16Z',
 },
  'Chiang Mai Marriott Hotel 清迈万豪': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Deluxe King - City View', perNightUSD: 196, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 12', breakfast: 'Great breakfast for $22.71 (optional) - not included', note: 'Last booked 7 hrs ago; Pay at hotel and prepay both $196; 页面未显示数字总价; search card showed total $423' },
  suite: null,
  suiteNote: '本轮未找到可订套房（展开全部房型：Deluxe/Premium King/Twin、Corner Room、Club Room，均无 Suite 命名房型；上一轮有 Executive Suite $328）',
  baselineUSD: 178, baselineCheckedAt: '2026-10-05T14:27:16Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Chiang%20Mai%20Marriott%20Hotel',
  source: 'Trip.com', checkedAt: '2026-10-05T14:27:16Z',
 },
  'The Ritz-Carlton, Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe King', perNightUSD: 320, totalUSD: 1022, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 14', breakfast: 'Not included; optional $33.19', note: 'Last booked 6 hrs ago; total $1,022 from search listing card (1 room x 3 nights incl. taxes & fees); detail page shows per-night only' },
  suite: null,
  baselineUSD: 291, baselineCheckedAt: '2026-10-05T16:51:34Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=The%20Ritz-Carlton%2C%20Bangkok',
  source: 'Trip.com', checkedAt: '2026-10-05T16:51:34Z',
 },
  'The Peninsula Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe King Room', perNightUSD: 397, totalUSD: 1267, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Our last 4!; Last booked 1 hr ago; Member deal 10% off ($444 -> $397); total $1,267 from search listing card (incl. taxes & fees)' },
  suite: { room: 'Deluxe King Suite', perNightUSD: 586, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Our last 4!; Member deal 10% off ($655 -> $586); 本轮新增可订套房（上一轮无可订套房）; total not displayed numerically' },
  baselineUSD: 262, baselineCheckedAt: '2026-10-05T16:51:34Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=The%20Peninsula%20Bangkok',
  source: 'Trip.com', checkedAt: '2026-10-05T16:51:34Z',
 },
  'Rosewood Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe Twin Room', perNightUSD: 350, totalUSD: 1114, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 8', breakfast: 'Not included; optional $44.76', note: 'Last booked 2 hrs ago; Member deal 15% off ($415 -> $350); search card showed $349, detail page $350; total $1,114 from search listing card (incl. taxes & fees)' },
  suite: { room: 'Premier Suite', perNightUSD: 671, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 8', breakfast: 'Includes 1 great breakfast', note: 'Member deal 15% off ($797 -> $671); total not displayed numerically' },
  baselineUSD: 302, baselineCheckedAt: '2026-10-05T16:51:34Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Rosewood%20Bangkok',
  source: 'Trip.com', checkedAt: '2026-10-05T16:51:34Z',
 },
  '曼谷文华东方': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe Premier King Room', perNightUSD: 539, totalUSD: 1719, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Not included; optional $62.93', note: 'Last booked 1 hr ago; Member deal $4 Off ($543 -> $539); total $1,719 from search listing card (incl. taxes & fees); AVAILABLE for these dates (availability flip confirmed); 注意：上一轮$682含双早，本轮$539为不可退不含早计划，口径不同' },
  suite: { room: 'Junior King Suite With Terrace', perNightUSD: 1759, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 14', breakfast: 'Not included; optional $62.93', note: 'Our last 2!; Member deal 6% off ($1,876 -> $1,759); 本轮新增可订套房（上一轮无可订套房）; total not displayed numerically' },
  baselineUSD: 455, baselineCheckedAt: '2026-10-05T16:51:34Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Mandarin%20Oriental%20Bangkok',
  source: 'Trip.com', checkedAt: '2026-10-05T16:51:34Z',
 },
  'Capella Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Riverfront King Room', perNightUSD: 902, totalUSD: 2875, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 10', breakfast: 'Includes 2 great breakfasts', note: 'Our last 3!; Last booked 7 hrs ago; search card $901, detail $902; total $2,875 from search listing card (incl. taxes & fees)' },
  suite: { room: 'Courtyard Suite', perNightUSD: 1442, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 3:00 PM, Dec 10', breakfast: 'Includes 2 great breakfasts', note: 'Our last 1!; total not displayed numerically' },
  baselineUSD: 737, baselineCheckedAt: '2026-10-05T16:51:34Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Capella%20Bangkok',
  source: 'Trip.com', checkedAt: '2026-10-05T16:51:34Z',
 },
  'Aman Nai Lert Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Premier Suite', perNightUSD: 1943, totalUSD: 6197, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'suite-only property; Last booked 21 hrs ago; total $6,197 from search listing card (incl. taxes & fees)' },
  baseNote: 'suite-only property（52 间全套房：Deluxe King Suite / Deluxe Twin Suite / Premier Suite / Corner Suite / Premier Corner Suite / Terrace Suite）',
  suite: { room: 'Premier Suite', perNightUSD: 1943, totalUSD: 6197, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Cheapest bookable option is non-refundable; free-cancellation option available; same as base (suite-only property)' },
  baselineUSD: 1755, baselineCheckedAt: '2026-10-05T16:51:34Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Aman%20Nai%20Lert%20Bangkok',
  source: 'Trip.com', checkedAt: '2026-10-05T16:51:34Z',
 },
  'Four Seasons Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe Room - King', perNightUSD: 690, totalUSD: 2201, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 14', breakfast: 'Not included; optional $47.20', note: 'Our last 1!; Last booked 4 hrs ago; total $2,201 from search listing card (incl. taxes & fees); Confirmed Chao Phraya River property' },
  suite: null,
  baselineUSD: 561, baselineCheckedAt: '2026-10-05T16:51:34Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Four%20Seasons%20Hotel%20Bangkok%20at%20Chao%20Phraya%20River',
  source: 'Trip.com', checkedAt: '2026-10-05T16:51:34Z',
 },
  'The Siam': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Siam Suite', perNightUSD: 739, totalUSD: 2358, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'suite-only property; total $2,358 from search listing card (incl. taxes & fees)' },
  baseNote: 'suite-only property（套房/泳池别墅：Siam Suite / Garden View Suite / Premier Garden View Suite / River View Suite / Premier River View Suite / Courtyard Pool Villa）',
  suite: { room: 'Siam Suite', perNightUSD: 739, totalUSD: 2358, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'same as base (suite-only property)' },
  baselineUSD: 555, baselineCheckedAt: '2026-10-05T16:51:34Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=The%20Siam',
  source: 'Trip.com', checkedAt: '2026-10-05T16:51:34Z',
 },
  'The Athenee Hotel, a Luxury Collection Hotel, Bangkok 曼谷雅典娜豪华精选酒店': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Athenee King Room Non smoking', perNightUSD: 233, totalUSD: 744, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 14', breakfast: 'Not included; optional $29.70', note: 'Last booked 48 mins ago; total $744 from search listing card (1 room x 3 nights incl. taxes & fees)' },
  suite: { room: 'Athenee Suite Non smoking', perNightUSD: 442, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 14', breakfast: 'Includes 1 great breakfast', note: 'Prepay online; total not displayed numerically' },
  baselineUSD: 211, baselineCheckedAt: '2026-10-05T16:51:34Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=The%20Athenee%20Hotel%2C%20a%20Luxury%20Collection%20Hotel%2C%20Bangkok',
  source: 'Trip.com', checkedAt: '2026-10-05T16:51:34Z',
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
