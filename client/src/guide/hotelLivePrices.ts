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
  base: { room: 'Premier Twin Room With Garden View', perNightUSD: 1171, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 3', breakfast: '需付费', note: 'Cheapest bookable rate is Pay-at-hotel $1,171/night (prepay alternative $1,289/night). Breakfast $63.67 optional. Search-results page showed whole-stay total $5,618 incl. taxes & fees for the $1,289 prepay rate only. \'Last booked 1 hr ago\'. Promos: First Booking Deal up to 20% off; new-user promo up to $12 off.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Sentosa Suite', perNightUSD: 1562, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 3', breakfast: '需付费', note: 'Pay-at-hotel rate (prepay $1,718/night). Breakfast $63.69 optional. One Bedroom Garden Villa also $1,562/night pay-at-hotel.' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 996, baselineCheckedAt: '2026-10-07T13:50:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=capella%20singapore&qs=CAEgASgAMidDaGtJNVlyU3dwdnVqUDFVR2cwdlp5OHhNV1l5YzJnelp6Tm5FQUVIAA&ved=0CAAQ5JsGahcKEwj40L_Cg6iXAxUAAAAAHQAAAAAQWg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=KigKEglNkOZt1_TzPxH9PuOon_RZQBISCdrY8u1bCfQ_Ef0-49zj9FlAMAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:50:00Z',
 },
  'Raffles Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: null,
  baseNote: 'No bookable rooms for 12/06–12/10, 2026.',
  suite: null,
  suiteNote: 'No bookable rooms for 12/06–12/10, 2026.',
  unavailable: 'No rooms available for your selected dates. You can still book for the following dates: Dec 3-Dec 4 From $1,283; Dec 4-Dec 5; Dec 5-Dec 6 From $1,291. Google Hotels corroborates: its Dec-2026 calendar shows no price for the night of Dec 9, and Google only offers \'Available for Dec 5-9 for $1,074\' (no per-night price for Dec 6-10).',
  baselineUrl: 'https://www.google.com/travel/search?q=raffles%20singapore&qs=CAEgASgAMiJDaFVJd3IzenN0dUl6cjlrR2drdmJTOHdNMncyTXpBUUFRSAA&ved=0CAAQ5JsGahcKEwjglZ6MhKiXAxUAAAAAHQAAAAAQWg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=KigKEglvXOcioKz0PxGzMWV8kfZZQBISCaQZkYskwfQ_EbMxZbDV9llAMAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:50:00Z',
 },
  'Marina Bay Sands': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Sands Premier King', perNightUSD: 698, totalUSD: 3043, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: '含免费早餐', note: 'Prepay online. \'Includes 2 great breakfasts\'. Page header: \'Best price with breakfast and free cancellation\'. Last booked 34 mins ago. Whole-stay total $3,043 incl. taxes & fees shown on search-results card for this $698 rate.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Sands Bay Suite King Gardens By The Bay View', perNightUSD: 1316, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: '含免费早餐', note: 'Prepay online. \'Includes 2 great breakfasts\'. A $1,385 variant with airport transfer + suite exclusives also shown.' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 604, baselineCheckedAt: '2026-10-07T13:50:00Z',
  baselineUrl: 'https://www.google.com/travel/hotels/entity/ChUI17vV0u_fprYCGgkvbS8wZGQ5MDMQAQ?ap=KigKEglNkOZt1_TzPxH9PiMAn_RZQBISCdrY8u1bCfQ_Ef0-o4Xk9FlA&ved=0CAAQ5JsGahgKEwj40L_Cg6iXAxUAAAAAHQAAAAAQ0QE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggCKgkKBToDVVNEGgA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:50:00Z',
 },
  'The Ritz-Carlton, Millenia Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Deluxe Kallang Twin Room', perNightUSD: 455, totalUSD: 1985, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Oct 8', breakfast: '含免费早餐', note: 'Prepay online. \'Includes 2 great breakfasts\'. Page header: \'Best price with breakfast and free cancellation\'. Last booked 30 mins ago. Cheaper 1-adult rates ($412) are flagged \'can\'t accommodate the number of guests\' and are not valid for 2 adults. Whole-stay total $1,985 incl. taxes & fees shown on search-results card for this $455 rate.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: null,
  suiteNote: 'No suite room types shown as bookable for these dates (expanded all room types: only Deluxe/Grand/Elevated Kallang and Deluxe Marina rooms).',
  baselineUSD: 414, baselineCheckedAt: '2026-10-07T13:50:00Z',
  baselineUrl: 'https://www.google.com/travel/hotels/entity/ChYI356X_oXolLmuARoJL20vMGJ6X2I0EAE',
  source: 'Trip.com', checkedAt: '2026-10-07T13:50:00Z',
 },
  'Mandarin Oriental Singapore 文华东方': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Sea View Room King', perNightUSD: 457, totalUSD: 1994, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 4', breakfast: '需付费', note: 'Prepay online. \'Best price with free cancellation\'. Breakfast $33.70 optional. Last booked 40 mins ago. Earn $99.73 in Trip Coins. Whole-stay total $1,994 incl. taxes & fees shown on search-results card for this $457 rate.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Family Suite', perNightUSD: 1274, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 4', breakfast: '含免费早餐', note: 'Prepay online. \'Includes 1 great breakfast\'. 882 ft². Family Suite Twin $1,295, Family Theme Suite $1,528 (\'Our last 1!\'), Residential Suite With Balcony $2,160 (non-refundable) also shown.' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 374, baselineCheckedAt: '2026-10-07T13:50:00Z',
  baselineUrl: 'https://www.google.com/travel/hotels/entity/ChUI1Z3d1NPGvJggGgkvbS8wOF9oeHQQAQ',
  source: 'Trip.com', checkedAt: '2026-10-07T13:50:00Z',
 },
  'Shangri-La Singapore 香格里拉': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Tower Wing Deluxe King Room', perNightUSD: 288, totalUSD: 1255, totalInclTax: true, cancel: 'Non-refundable', breakfast: '需付费', note: '\'Today\'s best price!\', Early bird price, Prepay online. Breakfast $40.30 optional. Last booked 57 mins ago. Earn $12.56 in Trip Coins. A $360/night free-cancellation rate (before 6:00 PM Dec 5, pay at hotel) also available. Whole-stay total $1,255 incl. taxes & fees shown on search-results card for the $288 rate.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: null,
  suiteNote: 'No suite room types shown as bookable for these dates (expanded all room types: Tower Wing, Horizon Club, Valley Wing rooms only). Google headline $242 = \'Nightly price with fees\', Agoda; official site $262.',
  baselineUSD: 242, baselineCheckedAt: '2026-10-07T13:50:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=shangri%20la%20singapore&qs=CAAgASgAMiJDaFVJaV8tY3lLZTE1ZmRCR2drdmJTOHdPVGxpTnpZUUFROA1IAA&ved=0CAAQ5JsGahgKEwjglZ6MhKiXAxUAAAAAHQAAAAAQ9AI&ts=CAEaNQoXEhUKCC9tLzA2dDJ0OglTaW5nYXBvcmUSGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggCKgcKBToDVVNE&ap=KigKEgm_n4mj0e7zPxGd3zAxP_NZQBISCYrFk3YYN_U_EZ3fMHGC91lAMAC6AQZwcmljZXM',
  source: 'Trip.com', checkedAt: '2026-10-07T13:50:00Z',
 },
  'The Fullerton Hotel Singapore 新加坡富丽敦酒店': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Premier Courtyard Room', perNightUSD: 309, totalUSD: 1348, totalInclTax: true, cancel: 'Non-refundable', breakfast: '未明确', note: '\'Today\'s best price!\', Early bird price, Prepay online, Instant confirmation. Last booked 2 hrs ago. Earn $67.42 in Trip Coins. Search card says \'Sign in for member prices\' but all prices were visible without login (no login wall). Whole-stay total $1,348 incl. taxes & fees shown on search-results card for this $309 rate.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Premier Collyer Suite', perNightUSD: 581, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '含免费早餐', note: '\'Our last 2!\'. \'Includes 2 great breakfasts\'. Prepay online, Instant confirmation. Palladian Suite $769 (\'Our last 3!\') and Loft Suite $1,081 also shown.' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 235, baselineCheckedAt: '2026-10-07T13:50:00Z',
  baselineUrl: 'https://www.google.com/travel/search?g2lb=4965990,72471280,72573224,72647020,72686036,72803964,72882230,73064764,121529350,121608706,121738283,121762713,121921501,121951222,122078727&hl=en-US&gl=us&ssta=1&q=The+Fullerton+Hotel+Singapore&ts=CAEaRwopEicyJTB4MzFkYTE5MDkwZjljMTc2ZjoweDQxYzEyYzUwYmFiZjcwZDASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggC&qs=CAEyE0Nnb0kwT0g5MVl1S3ktQkJFQUU4AkIJCdBwv7pQLMFBQgkJ0HC_ulAswUE&ap=ugEGcHJpY2Vz&ictx=111&ved=1t:196224',
  source: 'Trip.com', checkedAt: '2026-10-07T13:50:00Z',
 },
  'Amanpuri': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Garden Pool Pavilion', perNightUSD: 3653, totalUSD: 11751, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 9', breakfast: '含免费早餐', note: 'Member-only prices exist but require sign-in (not accessed). Member-only prices exist but require sign-in (not accessed). Our last 3! (detail); Last booked 8 hrs ago (search list); Includes 2 great breakfasts; Best price with breakfast and free cancellation' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Pool Pavilion 2 Bedroom', perNightUSD: 8081, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Nov 9', breakfast: '含免费早餐', note: 'Our last 1!; no room type explicitly named \'Suite\' at this hotel — cheapest multi-bedroom villa reported' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 2350, baselineCheckedAt: '2026-10-07T13:45:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=amanpuri%20phuket&qs=CAEyJENoY0l4TmYzc0x6WXZjYkZBUm9LTDIwdk1ETnVjR3N4WmhBQjgA&ved=0CAAQ5JsGahcKEwj4nIzJ_6eXAxUAAAAAHQAAAAAQCQ&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:45:00Z',
 },
  'Trisara': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Ocean View Pool Villa', perNightUSD: 1916, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Nov 26', breakfast: '含免费早餐', note: 'Our last 5!; Pay at hotel rate (cheapest rate). Search list showed Total $6,698 (incl. taxes & fees) only for the $2,082/night prepay-online rate of the same room type' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Signature Ocean View Pool Suite', perNightUSD: 2707, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Nov 26', breakfast: '含免费早餐', note: 'Our last 2!; Pay at hotel rate' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 1913, baselineCheckedAt: '2026-10-07T13:45:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Trisara%20Phuket&qs=CAEyJkNoZ0lsYi03bzZTTDRwZkVBUm9MTDJjdk1YUnFPVE4yZWpBUUFROAA&ved=0CAAQ5JsGahcKEwj4vO_ZgKiXAxUAAAAAHQAAAAAQBw&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:45:00Z',
 },
  'Banyan Tree Phuket': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Banyan Pool Villa', perNightUSD: 745, totalUSD: 2396, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Member-only prices require sign-in (\'Sign in for member prices\' shown; not accessed). Member-only prices require sign-in (\'Sign in for member prices\' shown; not accessed). Last booked 5 hrs ago (search list); Best price with breakfast; Includes 2 great breakfasts' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Signature Pool Villa', perNightUSD: 866, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'no room type explicitly named \'Suite\' — cheapest Signature-tier (premium) villa reported; 5 additional room types (\'Show 5 Remaining Room Types\') could not be expanded (control not actionable)' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 538, baselineCheckedAt: '2026-10-07T13:45:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Trisara%20Phuket&qs=CAEyFENnc0l6dl9mOUxHVnNMMmFBUkFCOABIAA&ved=0CAAQ5JsGahgKEwj4vO_ZgKiXAxUAAAAAHQAAAAAQvwE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:45:00Z',
 },
  'JW Marriott Phuket Resort & Spa 普吉JW万豪': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Guest Room,2 Double,Garden View,Balcony', perNightUSD: 399, totalUSD: 1285, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 7', breakfast: '需付费', note: 'Breakfast is an optional add-on: \'Great breakfast for $31.46 (optional)\'; Best price with free cancellation' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: '1 Bedroom Suite, 1 King, Oceanfront, Whirlpool', perNightUSD: 1089, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 7', breakfast: '需付费', note: 'Breakfast is an optional add-on: \'Great breakfast for $31.46 (optional)\'' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 359, baselineCheckedAt: '2026-10-07T13:45:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=jw%20marriott%20phuket%20resort%20spa&qs=CAEyJ0Noa0l5TXJka2JHeXhhVkVHZzB2Wnk4eE1XSjBkMnM1Y0RscUVBRTgA&ved=0CAAQ5JsGahcKEwiwkNnXgaiXAxUAAAAAHQAAAAAQBg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:45:00Z',
 },
  'The Surin Phuket': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'One Bedroom Hillside Cottage', perNightUSD: 892, totalUSD: 2871, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Special Discount 10% off (Original $997 -> $892). Special Discount 10% off (Original $997 -> $892). Only 1 left at this price (search list); Our last 1! (detail); Last booked 4 hrs ago; Includes 2 great breakfasts' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Beach Suite', perNightUSD: 1690, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Special Discount 8% off (Original $1,837 -> $1,690). Special Discount 8% off (Original $1,837 -> $1,690). Our last 1!; Includes 2 great breakfasts' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 762, baselineCheckedAt: '2026-10-07T13:45:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20surin%20phuket&qs=CAEyJkNoZ0k1c19kZ1AzeGgtVlBHZ3d2Wnk4eE1tcGlkREEyTkdvUUFROAA&ved=0CAAQ5JsGahcKEwioroq9gqiXAxUAAAAAHQAAAAAQBw&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:45:00Z',
 },
  'Keemala': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Clay Pool Cottage', perNightUSD: 804, totalUSD: 2588, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Early Bird Deal 42% off (Original $1,429 -> $804). Early Bird Deal 42% off (Original $1,429 -> $804). Only 4 left at this price (search list); Our last 4! (detail); Last booked 6 hrs ago; Includes 2 great breakfasts' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Tent Pool Villa', perNightUSD: 880, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Early Bird Deal 42% off (Original $1,562 -> $880). Early Bird Deal 42% off (Original $1,562 -> $880). Our last 4!; no room type explicitly named \'Suite\' — cheapest upgraded villa beyond base reported' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 623, baselineCheckedAt: '2026-10-07T13:45:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=keemala%20phuket&qs=CAEyKENob0k5YmZMdFlpMV9vdWNBUm9OTDJjdk1URmlZemN6WWpsck5oQUI4AA&ved=0CAAQ5JsGahcKEwi4nPP4gqiXAxUAAAAAHQAAAAAQAw&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:45:00Z',
 },
  '137 Pillars House': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Rajah Brooke Suite', perNightUSD: 639, totalUSD: 1371, totalInclTax: true, cancel: 'Free Cancellation before 1:00 AM, Nov 21', breakfast: '含免费早餐', note: 'Special Discount 5% off ($675 -> $639). Special Discount 5% off ($675 -> $639). All room types at this property are suites; this is the cheapest bookable room overall. Total shown as \'Total price: $1,371, 1 room x 2 nights incl. taxes & fees\'. Availability: \'Last booked 9 hrs ago\'; \'Our last 5!\' shown on a rate row.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Rajah Brooke Suite', perNightUSD: 639, totalUSD: 1371, totalInclTax: true, cancel: 'Free Cancellation before 1:00 AM, Nov 21', breakfast: '含免费早餐', note: 'Special Discount 5% off ($675 -> $639). Special Discount 5% off ($675 -> $639). Cheapest suite = cheapest bookable room; property is all-suites (other suites: East Borneo Suite, D.F. Macfie Suite, etc., all higher priced).' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 668, baselineCheckedAt: '2026-10-07T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=137%20pillars%20house%20chiang%20mai&qs=CAEgASgAMihDaG9JX0ptRmo4dk8tWmlPQVJvTkwyY3ZNVEZqTTNCamN6azFlUkFCSAA&ved=0CAAQ5JsGahcKEwiQ3bOxgKiXAxUAAAAAHQAAAAAQWg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgNEgcI6g8QDBgPGAIyAggBKgkKBToDVVNEGgA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:40:00Z',
 },
  'Four Seasons Resort Chiang Mai': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Upper Garden Pavilion King', perNightUSD: 1759, totalUSD: 3773, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 6', breakfast: '含免费早餐', note: 'Total shown as \'Total price: $3,773, 1 room x 2 nights incl. taxes & fees\'. Availability: \'Our last 1!\'. Room types are Pavilions (Upper Garden Pavilion King/Twin $1,759; Rice Terrace Pavilion King/Twin $1,808; Upper Rice Terrace Pavilion King/Twin $1,891); none explicitly named \'Suite\'. One remaining room type was collapsed and not expandable.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: null,
  suiteNote: 'No suite-type room bookable for these dates.',
  baselineUSD: 1220, baselineCheckedAt: '2026-10-07T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=four%20seasons%20chiang%20mai&qs=CAAgASgA&ved=0CAAQ5JsGahgKEwiQ3bOxgKiXAxUAAAAAHQAAAAAQpQI&ts=CAEqCQoFOgNVU0QaAA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:40:00Z',
 },
  'Raya Heritage': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Rin Suite with Terrace', perNightUSD: 444, totalUSD: 1053.9, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Nov 22', breakfast: '含免费早餐', note: 'Cheapest per-night rate is the Pay-at-hotel option ($444/night); its Price Details popup showed \'1 room x 2 nights: $887.87, Taxes: $166.03, Pay at Hotel: ~ $1,053.90\'. Note: a $454/night prepay rate (Special Discount 8% off, original $494) showed a lower whole-stay total of $974 incl. taxes & fees. All room types are suites. Availability: \'Last booked 9 hrs ago\'; \'Our last 1!\' shown on the $454 rate.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Rin Suite with Terrace', perNightUSD: 444, totalUSD: 1053.9, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Nov 22', breakfast: '含免费早餐', note: 'Cheapest suite = cheapest bookable room; property is all-suites (other suites: Huen Bon Suite $602, Kramm Suite with Pool $696).' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 404, baselineCheckedAt: '2026-10-07T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=raya%20heritage%20chiang%20mai&qs=CAAgASgA&ved=0CAAQ5JsGahgKEwiQ3bOxgKiXAxUAAAAAHQAAAAAQiAM&ts=CAEqCQoFOgNVU0QaAA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:40:00Z',
 },
  'Anantara Chiang Mai': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Deluxe Room With Garden View', perNightUSD: 424, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Cheapest per-night rate is the Pay-at-hotel option ($424/night, instant confirmation, earn $10.07 Trip Coins); no numeric whole-stay total shown for this rate. The $443/night prepay rate (Special Discount 6% off, original $471, includes 2 breakfasts) showed total $951 incl. taxes & fees. Availability: \'Last booked 10 hrs ago\'.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Lanna Garden View Suite', perNightUSD: 655, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Special Discount $17 Off ($672 -> $655). Special Discount $17 Off ($672 -> $655). Cheapest suite; includes 2 breakfasts, prepay online, earn $70.19 Trip Coins. A $690/night rate with Free Cancellation before 12:00 PM, Nov 27 also available (\'Our last 4!\'). Higher suites: Lanna River View Suite $738, Lanna Garden Terrace Suite $764, Lanna Riverfront Suite $791. No numeric whole-stay total shown for the $655 rate.' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 397, baselineCheckedAt: '2026-10-07T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=anantara%20chiang%20mai&qs=CAAgASgA&ved=0CAAQ5JsGahgKEwiQ3bOxgKiXAxUAAAAAHQAAAAAQ6gM&ts=CAEqCQoFOgNVU0QaAA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:40:00Z',
 },
  'Shangri-La Chiang Mai 清迈香格里拉': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Deluxe King Room', perNightUSD: 187, totalUSD: 401, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 12', breakfast: '需付费', note: 'Multi-night Discount 8% off ($205 -> $187). Multi-night Discount 8% off ($205 -> $187). Breakfast: \'Great breakfast for $21.37 (optional)\'. Total shown as \'Total price: $401, 1 room x 2 nights incl. taxes & fees\'. Prepay online. Availability: \'Last booked 2 hrs ago\'; \'Premier King Room Our last 1!\'. \'Sign in for member prices\' shown (not logged in, member prices not visible).' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: null,
  suiteNote: 'No suite-type room bookable for these dates.',
  baselineUSD: 149, baselineCheckedAt: '2026-10-07T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=shangri-la%20chiang%20mai&qs=CAAgASgA&ved=0CAAQ5JsGahgKEwiQ3bOxgKiXAxUAAAAAHQAAAAAQ6gQ&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgPGAIyAggBKgkKBToDVVNEGgA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:40:00Z',
 },
  'Chiang Mai Marriott Hotel 清迈万豪': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Deluxe King - City View', perNightUSD: 196, totalUSD: 422, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Oct 8', breakfast: '需付费', note: 'Breakfast: \'Great breakfast for $22.68 (optional)\'. Total shown as \'Total price: $422, 1 room x 2 nights incl. taxes & fees\'. Both Pay-at-hotel and Prepay-online options at $196/night. Availability: \'Last booked 2 hrs ago\'. Other room types: Deluxe Twin - City View $202, Premium King - Mountain View $215, Corner Room $219, Club Room King - High Floor Lounge Access $261. No room type explicitly named \'Suite\' in the bookable list.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: null,
  suiteNote: 'No suite-type room bookable for these dates.',
  baselineUSD: 178, baselineCheckedAt: '2026-10-07T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=chiang%20mai%20marriott%20hotel&qs=CAAgASgA&ved=0CAAQ5JsGahgKEwiQ3bOxgKiXAxUAAAAAHQAAAAAQ3wU&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgPGAIyAggBKgkKBToDVVNEGgA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:40:00Z',
 },
  'The Ritz-Carlton, Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe King', perNightUSD: 320, totalUSD: 1021, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 14', breakfast: '需付费', note: 'Last booked 2 hrs ago; Pay at hotel; breakfast optional $33.18; total $1,021 shown on Trip.com search list card (incl. taxes & fees).' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: null,
  suiteNote: 'No suite-type rooms shown as bookable for these dates; all 14 listed room types are Deluxe/Club rooms.',
  baselineUSD: 289, baselineCheckedAt: '2026-10-07T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20ritz%20carlton%20bangkok%20bangkok%20thailand&qs=CAEgASgAMidDaGtJX01lMTJLNzJxOG9SR2cwdlp5OHhNWGM1WnpOeWVXTmZFQUVIAA&ved=0CAAQ5JsGahcKEwiY-aueg6iXAxUAAAAAHQAAAAAQWA&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgPEgcI6g8QDBgSGAMyAggBKgkKBToDVVNEGgA&ap=KigKEgk20zfxv3MrQBHYGgBGySJZQBISCUWROeY9ditAEdgaAHoNI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:40:00Z',
 },
  'The Peninsula Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe King Room', perNightUSD: 397, totalUSD: 1265, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Original $444 -> $397 (10% off). Original $444 -> $397 (10% off). Last booked 1 hr ago; Our last 4!; Includes 2 great breakfasts; free-cancellation option available at $414; total $1,265 shown on Trip.com search list card (incl. taxes & fees).' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Deluxe King Suite', perNightUSD: 585, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Original $654 -> $585 (10% off). Original $654 -> $585 (10% off). Our last 4!; Includes 2 great breakfasts; free-cancellation option available at $635; detail page showed \'Total price: 1 room x 3 nights incl. taxes & fees\' with no numeric total.' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 261, baselineCheckedAt: '2026-10-07T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20peninsula%20bangkok&qs=CAAgASgA&ved=0CAAQ5JsGahgKEwiY-aueg6iXAxUAAAAAHQAAAAAQ6QE&ts=CAEqCQoFOgNVU0QaAA&ap=KigKEgk20zfxv3MrQBHYGgBGySJZQBISCUWROeY9ditAEdgaAHoNI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:40:00Z',
 },
  'Rosewood Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe Twin Room', perNightUSD: 349, totalUSD: 1113, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 8', breakfast: '需付费', note: 'Original $414 -> $349 (15% off). Original $414 -> $349 (15% off). Last booked 1 hr ago; Pay at hotel; breakfast optional $44.72; breakfast-included rate also seen at $397/night; total $1,113 shown on Trip.com search list card (incl. taxes & fees).' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Premier Suite', perNightUSD: 670, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 8', breakfast: '含免费早餐', note: 'Original $796 -> $670 (15% off). Original $796 -> $670 (15% off). Includes 1 great breakfast; detail page showed \'Total price: 1 room x 3 nights incl. taxes & fees\' with no numeric total.' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 310, baselineCheckedAt: '2026-10-07T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=rosewood%20bangkok&qs=CAAgASgA&ved=0CAAQ5JsGahgKEwiY-aueg6iXAxUAAAAAHQAAAAAQ0gI&ts=CAEqCQoFOgNVU0QaAA&ap=KigKEgk20zfxv3MrQBHYGgBGySJZQBISCUWROeY9ditAEdgaAHoNI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:40:00Z',
 },
  '曼谷文华东方': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe Premier Twin Room', perNightUSD: 556, totalUSD: 1773, totalInclTax: true, cancel: 'Non-refundable', breakfast: '需付费', note: 'Original $593 -> $556 (6% off). Original $593 -> $556 (6% off). Last booked 17 mins ago; Prepay online; breakfast optional $62.87; Deluxe Premier King Room also $556; total $1,773 shown on Trip.com search list card (incl. taxes & fees).' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Junior King Suite With Terrace', perNightUSD: 1730, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 14', breakfast: '需付费', note: 'Original $1,845 -> $1,730 (6% off). Original $1,845 -> $1,730 (6% off). Our last 2!; breakfast optional $62.87; detail page showed \'Total price: 1 room x 3 nights incl. taxes & fees\' with no numeric total.' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 513, baselineCheckedAt: '2026-10-07T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=mandarin%20oriental%20bangkok%20lobby&qs=CAEgASgAMiJDaFVJNVpXbnRMYkdzOWtMR2drdmJTOHdPRFZpTjJjUUFR&ved=0CAcQ__kHahgKEwiY-aueg6iXAxUAAAAAHQAAAAAQ-AM&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgPEgcI6g8QDBgSGAMyAggBKgkKBToDVVNEGgA&ap=KigKEgk20zfxv3MrQBHYGgBGySJZQBISCUWROeY9ditAEdgaAHoNI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:40:00Z',
 },
  'Capella Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Riverfront King Room', perNightUSD: 900, totalUSD: 2872, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 10', breakfast: '含免费早餐', note: 'Our last 3!; Includes 2 great breakfasts; no specific member deal shown; total $2,872 shown on Trip.com search list card (incl. taxes & fees).' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Courtyard Suite', perNightUSD: 1440, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 3:00 PM, Dec 10', breakfast: '含免费早餐', note: 'Our last 1!; Includes 2 great breakfasts; detail page showed \'Total price: 1 room x 3 nights incl. taxes & fees\' with no numeric total.' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 731, baselineCheckedAt: '2026-10-07T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=capella%20bangkok&qs=CAAgASgAMidDaGtJNlBHbjRkSzExSnN5R2cwdlp5OHhNV00yZW5wbWVUWmtFQUU&ved=0CAAQ5JsGahgKEwiY-aueg6iXAxUAAAAAHQAAAAAQzgQ&ts=CAEqCQoFOgNVU0QaAA&ap=KigKEgk20zfxv3MrQBHYGgBGySJZQBISCUWROeY9ditAEdgaAHoNI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:40:00Z',
 },
  'Aman Nai Lert Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Premier Suite', perNightUSD: 1943, totalUSD: 6197, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Last booked 22 hrs ago; Prepay online; Includes 2 great breakfasts; all room types at this hotel are suites; free-cancellation option available at $2,159; total $6,197 shown on Trip.com search list card (incl. taxes & fees).' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Premier Suite', perNightUSD: 1943, totalUSD: 6197, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Same as cheapest base room: all Aman Nai Lert room types are suites (cheapest = Premier Suite).' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 1755, baselineCheckedAt: '2026-10-07T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=aman%20nai%20lert%20bangkok%20thailand&qs=CAAgASgAMihDaG9JaUtXVGw5S0YyUG15QVJvTkwyY3ZNVEZxYW5kdWNXWTRjaEFC&ved=0CAIQ__kHahgKEwiY-aueg6iXAxUAAAAAHQAAAAAQkgU&ts=CAEqCQoFOgNVU0QaAA&ap=KigKEgk20zfxv3MrQBHYGgBGySJZQBISCUWROeY9ditAEdgaAHoNI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:40:00Z',
 },
  'Four Seasons Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe Room - King', perNightUSD: 689, totalUSD: 2198, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 14', breakfast: '需付费', note: 'Our last 1!; Last booked 22 hrs ago; breakfast optional $47.15; total $2,198 shown on Trip.com search list card for the $689/night room (incl. taxes & fees); no specific member deal shown.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: null,
  suiteNote: 'No suite-type rooms shown as bookable for these dates; all 8 listed room types are Deluxe/Premier rooms.',
  baselineUSD: 561, baselineCheckedAt: '2026-10-07T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=four%20seasons%20hotel%20bangkok%20at%20chao%20phraya%20river%20bangkok%20thailand&qs=CAAgASgAMihDaG9JNmFxYXpfVFZxZmZGQVJvTkwyY3ZNVEZrZUdzNGJtZHNOaEFCSAA&ved=0CAAQ5JsGahgKEwiY-aueg6iXAxUAAAAAHQAAAAAQ8wU&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgPEgcI6g8QDBgSGAMyAggBKgkKBToDVVNEGgA&ap=KigKEgk20zfxv3MrQBHYGgBGySJZQBISCUWROeY9ditAEdgaAHoNI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:40:00Z',
 },
  'The Siam': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Siam Suite', perNightUSD: 739, totalUSD: 2356, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Prepay online; Includes 2 great breakfasts; all room types at this hotel are suites; no specific member deal shown; total $2,356 shown on Trip.com search list card (incl. taxes & fees).' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Siam Suite', perNightUSD: 739, totalUSD: 2356, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Same as cheapest base room: all The Siam room types are suites (cheapest = Siam Suite).' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 573, baselineCheckedAt: '2026-10-07T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20siam%20bangkok%20thailand&qs=CAAgASgAMidDaGtJM3MyazRmeUZtS09DQVJvTUwyY3ZNVEpxYzNRd05EQm9FQUU&ved=0CAAQ5JsGahgKEwiY-aueg6iXAxUAAAAAHQAAAAAQlAc&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=KigKEgk20zfxv3MrQBHYGgBGySJZQBISCUWROeY9ditAEdgaAHoNI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:40:00Z',
 },
  'The Athenee Hotel, a Luxury Collection Hotel, Bangkok 曼谷雅典娜豪华精选酒店': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Athenee King Room Non smoking', perNightUSD: 233, totalUSD: 743, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 14', breakfast: '需付费', note: 'Last booked 6 mins ago; Only 1 left at this price; Pay at hotel; breakfast optional $29.67; no specific member deal shown; total $743 shown on Trip.com search list card (incl. taxes & fees).' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Athenee Suite Non smoking', perNightUSD: 441, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 14', breakfast: '含免费早餐', note: 'Includes 1 great breakfast; page showed suite rate for 1 adult (2-adult rate not displayed; page said \'We recommend 2 rooms for your group\'); detail page showed \'Total price: 1 room x 3 nights incl. taxes & fees\' with no numeric total.' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 210, baselineCheckedAt: '2026-10-07T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20athenee%20hotel%20bangkok%20thailand&qs=CAAgASgAMiZDaGdJc0pyNm9OS3hnY2o5QVJvTEwyY3ZNWFpmZGw5MGRHSVFBUQ&ved=0CAAQ5JsGahgKEwiY-aueg6iXAxUAAAAAHQAAAAAQ3Qc&ts=CAEqCQoFOgNVU0QaAA&ap=KigKEgk20zfxv3MrQBHYGgBGySJZQBISCUWROeY9ditAEdgaAHoNI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-07T13:40:00Z',
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
