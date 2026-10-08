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
  base: { room: 'Premier Twin Room With Garden View', perNightUSD: 1171, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 3', breakfast: '需付费（Great breakfast for $63.62 optional）', note: 'Pay at hotel；2 adults；页面 \'Current price $1,171\' 即每晚价原样抄录，未做除法；列表无单独整段总价数字故 totalUSD=null；含税标签 \'Total price: 1 room × 4 nights incl. taxes & fees\'' },
  suite: { room: 'Sentosa Suite', perNightUSD: 1561, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 3', breakfast: '需付费（Great breakfast for $63.62 optional）', note: 'Pay at hotel；2 adults；\'Current price $1,561\' 为每晚价原样抄录' },
  baselineUSD: 995, baselineCheckedAt: '2026-10-08T15:45:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=capella%20singapore&qs=CAEgASgAMidDaGtJNVlyU3dwdnVqUDFVR2cwdlp5OHhNV1l5YzJnelp6Tm5FQUVIAA&ved=0CAAQ5JsGahcKEwig5rTa0KqXAxUAAAAAHQAAAAAQXA&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=KigKEglNkOZt1_TzPxH9PuOon_RZQBISCdrY8u1bCfQ_Ef0-49zj9FlAMAA',
  source: 'Trip.com', checkedAt: '2026-10-08T15:45:00Z',
 },
  'Raffles Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: null,
  suite: null,
  unavailable: '本轮复核仍整店售罄。Trip.com 房型区页面原文：\'No availability for these dates\'（按钮 Select Different Dates / View Other Hotels），日期 Dec 6–10，1间2成人。Google Hotels 同期亦无价，仅 \'Available for Dec 5 – 9 for $918.\'',
  baselineUrl: 'https://www.google.com/travel/search?q=raffles%20hotel%20singapore&qs=CAEgASgAMiJDaFVJd3IzenN0dUl6cjlrR2drdmJTOHdNMncyTXpBUUFRSAA&ved=0CAAQ5JsGahgKEwig5rTa0KqXAxUAAAAAHQAAAAAQywI&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=KigKEglNkOZt1_TzPxH9PuOon_RZQBISCdrY8u1bCfQ_Ef0-49zj9FlAMAC6AQZwcmljZXM',
  source: 'Trip.com', checkedAt: '2026-10-08T15:45:00Z',
 },
  'Marina Bay Sands': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Sands Premier King', perNightUSD: 697, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: '含免费早餐（Includes 2 great breakfasts）', note: 'Prepay online；2 adults；Exclusive price for multi-night stays · Early bird price；\'Current price $697\' 为每晚价原样抄录；无单独总价数字' },
  suite: { room: 'Sands Bay Suite King Gardens By The Bay View', perNightUSD: 1315, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: '含免费早餐（Includes 2 great breakfasts）', note: 'Prepay online；2 adults；\'Current price $1,315\' 为每晚价原样抄录' },
  baselineUSD: 603, baselineCheckedAt: '2026-10-08T15:45:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=marina%20bay%20sands%20hotel%20singapore&qs=CAEgASgAMiJDaFVJMTd2VjB1X2FwcllDR2drdmJTOHdaR1E1TURNUUFRSAA&ved=0CAAQ5JsGahcKEwjQ_6bi0qqXAxUAAAAAHQAAAAAQYQ&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=KigKEglHDA4mxXP0PxHMllGdufZZQBISCfx8ZAPOnPQ_EcyWUQVC91lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-08T15:45:00Z',
 },
  'The Ritz-Carlton, Millenia Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Deluxe Kallang Twin Room', perNightUSD: 455, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Oct 9', breakfast: '含免费早餐（Includes 2 great breakfasts）', note: 'Prepay online；2 adults；Best price with breakfast and free cancellation；Extended Moments；\'Current price $455\' 为每晚价原样抄录；1成人价$412不适用' },
  suite: { room: 'Club Deluxe King Suite, Club Lounge Access, High Floor', perNightUSD: 876, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: '含免费早餐（Includes 2 great breakfasts）', note: 'Pay at hotel（同房型 prepay 亦 $876）；2 adults；上轮已展开 \'Show 9 Remaining Room Types\' 找到；\'Current price $876\' 为每晚价原样抄录' },
  baselineUSD: 414, baselineCheckedAt: '2026-10-08T15:45:00Z',
  baselineUrl: 'https://www.google.com/travel/hotels/entity/ChYI356X_oXolLmuARoJL20vMGJ6X2I0EAE',
  source: 'Trip.com', checkedAt: '2026-10-08T15:45:00Z',
 },
  'Mandarin Oriental Singapore 文华东方': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Sea View Room King', perNightUSD: 457, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 4', breakfast: '需付费（Great breakfast for $33.68 optional）', note: 'Prepay online；2 adults；Best price with free cancellation；本轮已复核 \'Current price $457\' 为每晚价原样抄录' },
  suite: null,
  suiteNote: '初始可见6房型（Sea View Room King/Twin、Premier Room With Balcony、Marina Bay View Room King/Twin、Club Marina Bay View Room King）无 suite 字样；页面 \'Show 12 Remaining Room Types\' 本轮多次尝试（滚动+视觉点击）均无法点开（元素不可见），套房未验证，填 null',
  baselineUSD: 362, baselineCheckedAt: '2026-10-08T15:45:00Z',
  baselineUrl: 'https://www.google.com/travel/hotels/entity/ChUI1Z3d1NPGvJggGgkvbS8wOF9oeHQQAQ',
  source: 'Trip.com', checkedAt: '2026-10-08T15:45:00Z',
 },
  'Shangri-La Singapore 香格里拉': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Tower Wing Deluxe King Room', perNightUSD: 288, totalUSD: null, totalInclTax: true, cancel: 'Non-refundable', breakfast: '需付费（Great breakfast for $40.27 optional）', note: 'Prepay online；2 adults；Non-refundable；Early bird price；\'Current price $288\' 为每晚价原样抄录' },
  suite: null,
  suiteNote: '初始可见6房型均为 Deluxe 非套房；页面 \'Show 9 Remaining Room Types\' 本轮无法点开（元素不可见），套房未验证，填 null',
  baselineUSD: 248, baselineCheckedAt: '2026-10-08T15:45:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=shangri%20la%20singapore&qs=CAAgASgAMiJDaFVJaV8tY3lLZTE1ZmRCR2drdmJTOHdPVGxpTnpZUUFROA1IAA&ved=0CAAQ5JsGahgKEwjglZ6MhKiXAxUAAAAAHQAAAAAQ9AI&ts=CAEaNQoXEhUKCC9tLzA2dDJ0OglTaW5nYXBvcmUSGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggCKgcKBToDVVNE&ap=KigKEgm_n4mj0e7zPxGd3zAxP_NZQBISCYrFk3YYN_U_EZ3fMHGC91lAMAC6AQZwcmljZXM',
  source: 'Trip.com', checkedAt: '2026-10-08T15:45:00Z',
 },
  'The Fullerton Hotel Singapore 新加坡富丽敦酒店': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Premier Courtyard Room', perNightUSD: 309, totalUSD: null, totalInclTax: true, cancel: 'Non-refundable', breakfast: '未明确（该房价未注明早餐）', note: 'Prepay online；2 adults；Non-refundable；Early bird price；\'Current price $309\' 为每晚价原样抄录' },
  suite: null,
  suiteNote: '初始可见6房型（Premier Courtyard Room/Twin、Heritage King/Twin、Quay Room King、Marina Bay View Room）无套房；页面 \'Show 9 Remaining Room Types\' 本轮无法点开，套房未验证，填 null',
  baselineUSD: 231, baselineCheckedAt: '2026-10-08T15:45:00Z',
  baselineUrl: 'https://www.google.com/travel/search?g2lb=4965990,72471280,72573224,72647020,72686036,72803964,72882230,73064764,121529350,121608706,121738283,121762713,121921501,121951222,122078727&hl=en-US&gl=us&ssta=1&q=The+Fullerton+Hotel+Singapore&ts=CAEaRwopEicyJTB4MzFkYTE5MDkwZjljMTc2ZjoweDQxYzEyYzUwYmFiZjcwZDASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggC&qs=CAEyE0Nnb0kwT0g5MVl1S3ktQkJFQUU4AkIJCdBwv7pQLMFBQgkJ0HC_ulAswUE&ap=ugEGcHJpY2Vz&ictx=111&ved=1t:196224',
  source: 'Trip.com', checkedAt: '2026-10-08T15:45:00Z',
 },
  'Amanpuri': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Garden Pool Pavilion', perNightUSD: 3653, totalUSD: 11751, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 9', breakfast: 'Includes 2 great breakfasts（含免费早餐）', note: 'Prepay online（预付）; Instant confirmation; 列表页显示 Only 3 left at this price' },
  suite: { room: 'Garden Pool Pavilion', perNightUSD: 3653, totalUSD: 11751, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 9', breakfast: 'Includes 2 great breakfasts', note: '该酒店无明确 Suite 房型名，用最便宜可订房型替代' },
  suiteNote: '该酒店无明确 Suite 房型名，用最便宜可订房型替代',
  baselineUSD: 2255, baselineCheckedAt: '2026-10-08T14:53:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=amanpuri%20phuket%20hotel&qs=CAEgASgAMiRDaGNJeE5mM3NMell2Y2JGQVJvS0wyMHZNRE51Y0dzeFpoQUJIAA&ved=0CAAQ5JsGahcKEwjY3r--0KqXAxUAAAAAHQAAAAAQYQ&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgKEgcI6g8QDBgNGAMyAggBKgkKBToDVVNEGgA&ap=KigKEglQUQhIce0fQBEMUeDek5FYQBISCUnQh_yF8h9AEQxR4BLYkVhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-08T14:53:00Z',
 },
  'Trisara': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Ocean View Pool Villa', perNightUSD: 1921, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Nov 26', breakfast: 'Includes 2 great breakfasts（含免费早餐）', note: 'Pay at hotel（到店付），Instant confirmation；同房型另一费率 $2,083/晚（Prepay online，取消政策 Free Cancellation before 11:59 PM, Nov 25，Our last 4!），列表页该费率显示总价 $6,701 含税（1 room × 3 nights incl. taxes & fees）；本费率总价未明确显示，按规则填 null' },
  suite: { room: 'Signature Ocean View Pool Suite', perNightUSD: 2722, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Nov 26', breakfast: 'Includes 2 great breakfasts', note: 'Pay at hotel，Instant confirmation；同房型另一费率 $2,951/晚（Prepay online，取消政策 Free Cancellation before 11:59 PM, Nov 25，Our last 2!）；套房费率总价未明确显示' },
  baselineUSD: 1911, baselineCheckedAt: '2026-10-08T14:53:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Trisara%20Phuket%20hotel&ts=CAEaHBIaEhQKBwjqDxAMGAoSBwjqDxAMGA0YAzICCAEqCQoFOgNVU0QaAA&ved=0CAAQ5JsGahcKEwiIr7Te0aqXAxUAAAAAHQAAAAAQBw&qs=MiZDaGdJbGItN282U0w0cGZFQVJvTEwyY3ZNWFJxT1ROMmVqQVFBUQ',
  source: 'Trip.com', checkedAt: '2026-10-08T14:53:00Z',
 },
  'Banyan Tree Phuket': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Banyan Pool Villa', perNightUSD: 746, totalUSD: 2399, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts（含免费早餐）', note: 'Prepay online（预付）; 列表页显示 Last booked 6 hrs ago, Earn $119.98 in Trip Coins' },
  suite: { room: 'Banyan Pool Villa', perNightUSD: 746, totalUSD: 2399, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: '该酒店无明确 Suite 房型名，用最便宜可订房型替代' },
  suiteNote: '该酒店无明确 Suite 房型名，用最便宜可订房型替代',
  baselineUSD: 570, baselineCheckedAt: '2026-10-08T14:53:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Banyan%20Tree%20Phuket%20hotel&ts=CAEaNgoYEhYKDC9nLzEyaHB2MHBkcToGUGh1a2V0EhoSFAoHCOoPEAwYChIHCOoPEAwYDRgDMgIIASoHCgU6A1VTRA&ved=2ahUKEwirh9SO0qqXAxXjjcUCHfrJE_IQyvcEegQIAxAf&qs=MidDaGtJenZfZjlMR1ZzTDJhQVJvTUwyY3ZNVEpvY0hZd2NHUnhFQUU4DQ&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-08T14:53:00Z',
 },
  'JW Marriott Phuket Resort & Spa 普吉JW万豪': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Guest Room,2 Double,Garden View,Balcony', perNightUSD: 460, totalUSD: 1480, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 7', breakfast: 'Great breakfast for $31.48 (optional)（需付费）', note: 'Pay at hotel（同房型另有同价 $460/晚 Prepay online 费率）；列表页显示 Last booked 21 hrs ago, We Price Match' },
  suite: { room: '1 Bedroom Suite, 1 King, Oceanfront, Whirlpool', perNightUSD: 1151, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 7', breakfast: 'Great breakfast for $31.48 (optional)（需付费）', note: 'Pay at hotel；同房型另有 $1,231/晚 Prepay online 费率（从 $1,231 起更多费率）；套房总价未明确显示' },
  baselineUSD: 401, baselineCheckedAt: '2026-10-08T14:53:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=JW%20Marriott%20Phuket%20Resort%20%26%20Spa&ts=CAEaHBIaEhQKBwjqDxAMGAoSBwjqDxAMGA0YAzICCAEqCQoFOgNVU0QaAA',
  source: 'Trip.com', checkedAt: '2026-10-08T14:53:00Z',
 },
  'The Surin Phuket': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'One Bedroom Deluxe Cottage', perNightUSD: 665, totalUSD: 2138, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts（含免费早餐）', note: 'Special Discount 7% off（原价 $720）; Prepay online; Confirmed Within 12 Hour(s); 列表页显示 Last booked 1 hr ago' },
  suite: { room: 'Beach Suite', perNightUSD: 1692, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: '8% off（原价 $1,840）; Prepay online; Instant confirmation; 更高价套房 Beach Deluxe Suite $1,883/晚（10% off，原价 $2,104，Our last 1!）；套房总价未明确显示' },
  baselineUSD: 828, baselineCheckedAt: '2026-10-08T14:53:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=The%20Surin%20Phuket&ts=CAEaHBIaEhQKBwjqDxAMGAoSBwjqDxAMGA0YAzICCAEqCQoFOgNVU0QaAA',
  source: 'Trip.com', checkedAt: '2026-10-08T14:53:00Z',
 },
  'Keemala': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Clay Pool Cottage', perNightUSD: 806, totalUSD: 2592, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts（含免费早餐）', note: 'Early Bird Deal 42% off（原价 $1,431）; Our last 4!; Pay at hotel（同房型另有同价 $806/晚 Prepay online 费率）; Earn $25.92 in Trip Coins' },
  suite: { room: 'Clay Pool Cottage', perNightUSD: 806, totalUSD: 2592, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: '该酒店无明确 Suite 房型名，用最便宜可订房型替代' },
  suiteNote: '该酒店无明确 Suite 房型名，用最便宜可订房型替代',
  baselineUSD: 622, baselineCheckedAt: '2026-10-08T14:53:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Keemala%20Phuket&ts=CAEaHBIaEhQKBwjqDxAMGAoSBwjqDxAMGA0YAzICCAEqCQoFOgNVU0QaAA&qs=MihDaG9JOWJmTHRZaTFfb3VjQVJvTkwyY3ZNVEZpWXpjellqbHJOaEFC&ved=0CAAQ5JsGahcKEwjwrP_O06qXAxUAAAAAHQAAAAAQBg',
  source: 'Trip.com', checkedAt: '2026-10-08T14:53:00Z',
 },
  '137 Pillars House': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Rajah Brooke Suite', perNightUSD: 606, totalUSD: 1300, totalInclTax: true, cancel: 'Free Cancellation before 1:00 AM, Nov 21', breakfast: 'Includes 2 great breakfasts（免费早餐）', note: 'Special Discount 10% off; Prepay online; Our last 5!' },
  suite: { room: 'Rajah Brooke Suite', perNightUSD: 606, totalUSD: 1300, totalInclTax: true, cancel: 'Free Cancellation before 1:00 AM, Nov 21', breakfast: 'Includes 2 great breakfasts（免费早餐）', note: 'Special Discount 10% off; Prepay online; Our last 5!' },
  suiteNote: '本酒店为全套房酒店，最便宜可订房型即为套房',
  baselineUSD: 551, baselineCheckedAt: '2026-10-08T14:56:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=137%20pillars%20house%20chiang%20mai&qs=CAAgASgASAA&ts=CAEaGhIYEhIKBwjqDxAMGA0SBwjqDxAMGA8yAggCKgcKBToDVVNE&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAC6AQZwcmljZXM',
  source: 'Trip.com', checkedAt: '2026-10-08T14:56:00Z',
 },
  'Four Seasons Resort Chiang Mai': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Upper Garden Pavilion King', perNightUSD: 1778, totalUSD: 3814, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 6', breakfast: 'Includes 2 great breakfasts（免费早餐）', note: 'Prepay online; Our last 1!' },
  suite: null,
  suiteNote: '6 个展示房型均为 Pavilion（Upper Garden/Rice Terrace Pavilion King/Twin），无套房房型；另有 1 个房型折叠未展开（Show 1 Remaining Room Type），未展开查看',
  baselineUSD: 1556, baselineCheckedAt: '2026-10-08T14:56:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=four%20seasons%20resort%20chiang%20mai&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgNEgcI6g8QDBgPGAIyAggBKgkKBToDVVNEGgA&qs=CAEyJkNoZ0lucmlldk8zVi1mdkRBUm9MTDJjdk1YWTRjM2w1WHpZUUFRSAA&ap=MAC6AQZwcmljZXM',
  source: 'Trip.com', checkedAt: '2026-10-08T14:56:00Z',
 },
  'Raya Heritage': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Rin Suite with Terrace', perNightUSD: 445, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Nov 22', breakfast: 'Includes 2 great breakfasts（免费早餐）', note: 'Pay at hotel; Our last 1!；同房型另有 $454/晚预付选项（列表页显示其总价 $975 含税费），但 $445 到店付更便宜且无数字总价显示故填 null' },
  suite: { room: 'Rin Suite with Terrace', perNightUSD: 445, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Nov 22', breakfast: 'Includes 2 great breakfasts（免费早餐）', note: 'Pay at hotel; Our last 1!' },
  suiteNote: '本酒店为全套房酒店（Rin Suite with Terrace / Huen Bon Suite / Kramm Suite with Pool），最便宜可订房型即为套房',
  baselineUSD: 420, baselineCheckedAt: '2026-10-08T14:56:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=raya%20heritage%20chiang%20mai&ved=0CAAQ5JsGahcKEwiA9ePb0qqXAxUAAAAAHQAAAAAQaQ&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgNEgcI6g8QDBgPGAIyAggBKgQKABoA&qs=CAEyKENob0ltTVQ3d08zdDc0SzZBUm9OTDJjdk1URm1OVFIzZEhNMGVoQUI&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-08T14:56:00Z',
 },
  'Anantara Chiang Mai': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Deluxe Room With Garden View', perNightUSD: 426, totalUSD: null, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts（免费早餐）', note: 'Pay at hotel; Early bird price; Instant confirmation；同房型另有 $458/晚预付选项（列表页显示其总价 $983 含税费），但 $426 到店付更便宜且无数字总价显示故填 null' },
  suite: { room: 'Lanna Garden View Suite', perNightUSD: 655, totalUSD: null, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts（免费早餐）', note: 'Early bird price; Special Discount $18 off; 1130 ft²；最便宜套房房型；详情页未显示其数字总价故填 null' },
  baselineUSD: 398, baselineCheckedAt: '2026-10-08T14:56:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=anantara%20chiang%20mai%20resort&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgNEgcI6g8QDBgPGAIyAggBKgkKBToDVVNEGgA&qs=CAEyJkNoZ0lyY3pUaU5TWjhPREJBUm9MTDJjdk1YUnFlRzUzTkRBUUFRSAA&ap=MAC6AQZwcmljZXM',
  source: 'Trip.com', checkedAt: '2026-10-08T14:56:00Z',
 },
  'Shangri-La Chiang Mai 清迈香格里拉': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Deluxe King Room', perNightUSD: 187, totalUSD: 401, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 12', breakfast: 'Great breakfast for $21.38 (optional)（需付费，约 $21.38）', note: 'Multi-night Discount 8% off; Prepay online; 列表页标注 Last booked 30 mins ago' },
  suite: null,
  suiteNote: '6 个展示房型均为非套房（Deluxe King/Twin、Pool View 变体、Premier King/Twin），无套房房型；另有 4 个房型折叠未展开（Show 4 Remaining Room Types），未展开查看',
  baselineUSD: 144, baselineCheckedAt: '2026-10-08T14:56:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=shangri%20la%20chiang%20mai&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgNEgcI6g8QDBgPGAIyAggBKgkKBToDVVNEGgA&qs=CAEyJkNoZ0k4LXVxZ1BfYW9hVHpBUm9MTDJjdk1YUmtNRGRqWjNjUUFR&ved=0CAAQ5JsGahcKEwiog5OV1KqXAxUAAAAAHQAAAAAQBg&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-08T14:56:00Z',
 },
  'Chiang Mai Marriott Hotel 清迈万豪': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Deluxe King - City View', perNightUSD: 196, totalUSD: 423, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 12', breakfast: 'Great breakfast for $22.72 (optional)（需付费，约 $22.72）', note: 'Best price with free cancellation; Pay at hotel 与 Prepay online 均为 $196；Last booked 1 hr ago' },
  suite: null,
  suiteNote: '6 个展示房型均为非套房（Deluxe King/Twin - City View、Premium King/Twin - Mountain View、Corner Room、Club Room King - High Floor, Lounge Access），无套房房型；另有 4 个房型折叠未展开（Show 4 Remaining Room Types），未展开查看',
  baselineUSD: 177, baselineCheckedAt: '2026-10-08T14:56:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=chiang%20mai%20marriott%20hotel&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgNEgcI6g8QDBgPGAIyAggBKgkKBToDVVNEGgA&qs=CAEyJkNoZ0l4TDdocGJEY2tORDFBUm9MTDJjdk1YUm5OV1prZW5NUUFR&ved=0CAAQ5JsGahgKEwiwjNCB1aqXAxUAAAAAHQAAAAAQ2wE&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-08T14:56:00Z',
 },
  'The Ritz-Carlton, Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe King', perNightUSD: 321, totalUSD: 961.53, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 14', breakfast: '需付费（Great breakfast for $33.18 optional）', note: 'Pay at hotel（到店付）；Last booked 1 hr ago；价格明细：房费 $868.59 + 服务费 $92.94 = $961.53，VAT $60.81 到店付，合计约 $1,022.34' },
  suite: null,
  suiteNote: '该日期无 Suite 房型行：页面 11 种房型（Deluxe King / Deluxe Two Double Bed 及其 Balcony、Lumpini Park View 变体 + 5 种 Club 客房）均无 Suite 字样；Club 客房仅有 1-adult 房价（提示 We recommend 2 rooms for your group），不符合 2 成人 1 间条件。',
  baselineUSD: 288, baselineCheckedAt: '2026-10-08T15:15:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20ritz%20carlton%20bangkok%20bangkok%20thailand&qs=CAEgASgAMidDaGtJX01lMTJLNzJxOG9SR2cwdlp5OHhNWGM1WnpOeWVXTmZFQUVIAA&ved=0CAAQ5JsGahcKEwj48ITe0aqXAxUAAAAAHQAAAAAQYw&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgPEgcI6g8QDBgSGAMyAggBKgkKBToDVVNEGgA&ap=KigKEgk20zfxv3MrQBHYGgBGySJZQBISCUWROeY9ditAEdgaAHoNI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-08T15:15:00Z',
 },
  'The Peninsula Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe King Room', perNightUSD: 397, totalUSD: 1267.38, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐（Includes 2 great breakfasts）', note: 'Prepay online 预付；Our last 4!；Last booked 13 mins ago', memberDeal: '原价 $444 → 会员价 $397（Member deal 10% off）' },
  suite: { room: 'Deluxe King Suite', perNightUSD: 586, totalUSD: 1869.0, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐（Includes 2 great breakfasts）', note: 'Prepay online 预付；Our last 4!', memberDeal: '原价 $655 → 会员价 $586（Member deal 10% off）' },
  baselineUSD: 262, baselineCheckedAt: '2026-10-08T15:15:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20peninsula%20bangkok&qs=CAEgASgAMiNDaFlJdDVxM2h2YmszdHBYR2dvdmJTOHdaMmM0TUhvNUVBRUgA&ved=0CAAQ5JsGahcKEwigzb_h0qqXAxUAAAAAHQAAAAAQWQ&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgPEgcI6g8QDBgSGAMyAggBKgkKBToDVVNEGgA&ap=KigKEgkkVdJu-XArQBGfylgJjyBZQBISCeU5mmd3cytAEZ_KWD3TIFlAMAA',
  source: 'Trip.com', checkedAt: '2026-10-08T15:15:00Z',
 },
  'Rosewood Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe Twin Room', perNightUSD: 349, totalUSD: 1048.39, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 8', breakfast: '需付费（Great breakfast for $44.75 optional）', note: 'Pay at hotel（到店付）；Last booked 1 hr ago；明细：3 晚 $1,048.39，VAT $66.30 到店付，合计约 $1,114.69；本轮页面标题未宣称含早餐、房型行写 optional，按房型行记需付费，无矛盾', memberDeal: '原价 $415 → 会员价 $349（Member deal 15% off）' },
  suite: null,
  suiteNote: '4 种 Suite 房型（Premier Suite $671/$785/$923、Manor King Suite $742/$869/$991/$1,022、Manor Twin Suite $742/$869、Rosewood Suite $814/$952）所有房价均为 1 adult（标注 We recommend 2 rooms for your group），无可订 2 成人 1 间套房。',
  baselineUSD: 331, baselineCheckedAt: '2026-10-08T15:15:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=rosewood%20bangkok&qs=CAEgASgAMidDaGtJLWZQVTZyLWh6T04yR2cwdlp5OHhNV1kxYUd4aWVqVmZFQUVIAA&ved=0CAAQ5JsGahcKEwjwy5Lh06qXAxUAAAAAHQAAAAAQYw&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgPEgcI6g8QDBgSGAMyAggBKgkKBToDVVNEGgA&ap=KigKEglQwxi-X3srQBFm9-RH_yJZQBISCRCFuqjdfStAEWb35HtDI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-08T15:15:00Z',
 },
  '曼谷文华东方': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe Premier King Room', perNightUSD: 552, totalUSD: 1761.59, totalInclTax: true, cancel: 'Non-refundable', breakfast: '需付费（Great breakfast for $62.91 optional）', note: 'Prepay online 预付；Last booked 3 hrs ago；明细：3 晚 $1,656.82 + 服务费 $160.14 + VAT $104.77 = $1,761.59；本轮标题未宣称含早餐，房型行写 optional，按房型行记需付费', memberDeal: '原价 $563 → 会员价 $552（Member deal $11 Off）' },
  suite: { room: 'Junior King Suite With Terrace', perNightUSD: 1733, totalUSD: 5526.55, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 14', breakfast: '需付费（Great breakfast for $62.91 optional）', note: 'Prepay online 预付；Our last 2!；明细：3 晚 $5,197.86 + 服务费 $502.41 + VAT $328.69 = $5,526.55', memberDeal: '原价 $1,848 → 会员价 $1,733（Member deal 6% off）' },
  baselineUSD: 470, baselineCheckedAt: '2026-10-08T15:15:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=mandarin%20oriental%20bangkok%20lobby&qs=CAEgASgAMiJDaFVJNVpXbnRMYkdzOWtMR2drdmJTOHdPRFZpTjJjUUFRSAA&ved=0CAAQ5JsGahcKEwiQzY-M1aqXAxUAAAAAHQAAAAAQYg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgPEgcI6g8QDBgSGAMyAggBKgkKBToDVVNEGgA&ap=KigKEgktrj79OnErQBETW4tGyyBZQBISCTFyrfW4cytAERNbi3oPIVlAMAA',
  source: 'Trip.com', checkedAt: '2026-10-08T15:15:00Z',
 },
  'Capella Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Riverfront King Room', perNightUSD: 902, totalUSD: 2876.57, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 10', breakfast: '含免费早餐（Includes 2 great breakfasts）', note: 'Prepay online 预付；Our last 2!；Last booked 6 hrs ago；明细：房费 $2,443.98 + 服务费 $261.51 + VAT $171.08 = $2,876.57' },
  suite: { room: 'Courtyard Suite', perNightUSD: 1464, totalUSD: 4669.62, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 10', breakfast: '含免费早餐（Includes 2 great breakfasts）', note: 'Prepay online 预付；Our last 1!；明细：房费 $3,967.38 + 服务费 $424.52 + VAT $277.72 = $4,669.62' },
  baselineUSD: 727, baselineCheckedAt: '2026-10-08T15:15:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=capella%20bangkok&qs=CAEgASgAMidDaGtJNlBHbjRkSzExSnN5R2cwdlp5OHhNV00yZW5wbWVUWmtFQUU&ved=0CAAEQ__kHahcKEwjoke721aqXAxUAAAAAHQAAAAAQTg&ts=CAEqBwoFOgNVU0Q&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-08T15:15:00Z',
 },
  'Aman Nai Lert Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: null,
  suite: { room: 'Premier Suite', perNightUSD: 1943, totalUSD: 6196.92, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐（Includes 2 great breakfasts）', note: 'Prepay online 预付；明细：房费 $5,265.00 + 服务费 $563.37 + VAT $368.55 = $6,196.92；另有免费取消房价 $2,159/晚' },
  baselineUSD: 1755, baselineCheckedAt: '2026-10-08T15:15:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=aman%20nai%20lert%20bangkok%20thailand&qs=CAEgASgAMihDaG9JaUtXVGw5S0YyUG15QVJvTkwyY3ZNVEZxYW5kdWNXWTRjaEFC&ved=0CAIQ__kHahcKEwiwkOu61qqXAxUAAAAAHQAAAAAQTg&ts=CAEqBwoFOgNVU0Q&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-08T15:15:00Z',
 },
  'Four Seasons Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe Room - King', perNightUSD: 690, totalUSD: 2202.0, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 14', breakfast: '需付费（Great breakfast for $47.18 optional）', note: 'Prepay online 预付；Our last 1!；明细：房费 $1,870.86 + 服务费 $200.19 + VAT $130.95 = $2,202.00' },
  suite: null,
  suiteNote: '该日期无 Suite 房型行：页面共 8 种房型（Deluxe / Deluxe Palm Court / Deluxe Riverview / Premier Riverview 的 King/Twin 变体），均无 Suite 字样房型。',
  baselineUSD: 561, baselineCheckedAt: '2026-10-08T15:15:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=four%20seasons%20bangkok%20thailand&qs=CAEgASgAMihDaG9JNmFxYXpfVFZxZmZGQVJvTkwyY3ZNVEZrZUdzNGJtZHNOaEFC&ved=0CAQQ__kHahcKEwjA8OyL16qXAxUAAAAAHQAAAAAQUA&ts=CAEqBwoFOgNVU0Q&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-08T15:15:00Z',
 },
  'The Siam': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: null,
  suite: { room: 'Siam Suite', perNightUSD: 741, totalUSD: 2363.59, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐（Includes 2 great breakfasts）', note: 'Prepay online 预付；Last booked 8 hrs ago；明细：房费 $2,008.14 + 服务费 $214.87 + VAT $140.58 = $2,363.59；另有早鸟价 $784/晚（不可退）' },
  baselineUSD: 555, baselineCheckedAt: '2026-10-08T15:15:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20siam%20bangkok%20thailand&qs=CAEgASgAMidDaGtJM3MyazRmeUZtS09DQVJvTUwyY3ZNVEpxYzNRd05EQm9FQUU&ved=0CAUQ__kHahcKEwjggb6416qXAxUAAAAAHQAAAAAQTg&ts=CAEqBwoFOgNVU0Q&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-08T15:15:00Z',
 },
  'The Athenee Hotel, a Luxury Collection Hotel, Bangkok 曼谷雅典娜豪华精选酒店': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Athenee King Room Non smoking', perNightUSD: 233, totalUSD: 700.11, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 14', breakfast: '需付费（Great breakfast for $29.69 optional）', note: 'Pay at hotel（到店付）；Last booked 57 mins ago；明细：房费 $632.43 + 服务费 $67.68 = $700.11，VAT $44.28 到店付，合计约 $744.39' },
  suite: { room: 'Athenee Suite Non smoking', perNightUSD: 431, totalUSD: 1291.83, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 14', breakfast: '含免费早餐（Includes 2 great breakfasts）', note: 'Pay at hotel（到店付）；明细：房费 $1,166.97 + 服务费 $124.86 = $1,291.83，VAT $81.69 到店付，合计约 $1,373.52' },
  baselineUSD: 210, baselineCheckedAt: '2026-10-08T15:15:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20athenee%20hotel%20a%20luxury%20collection%20hotel%20bangkok&qs=CAEgASgA&ved=0CAAQ5JsGahcKEwjYnoL816qXAxUAAAAAHQAAAAAQYw&ts=CAEqBwoFOgNVU0Q&ap=KigKEgkAXEGGUnorQBE_6fra7CJZQBISCfahUXLQfCtAET_p-g4xI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-08T15:15:00Z',
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
  base: { room: 'King Room', perNightUSD: 262, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: '需付费（Great breakfast for $42.14 optional）', note: 'Pay at hotel；2 adults；Best price with free cancellation；\'Current price $262\' 为每晚价原样抄录；1成人价$400不适用' },
  suite: null,
  suiteNote: '初始可见6房型（King Room、2 Twin Beds With Heritage View、1 King Bed With Heritage View、King Room With City View、I King Bed Corner City View, Deluxe、1 King Bed Deluxe）无套房；页面 \'Show 6 Remaining Room Types\' 本轮无法点开，套房未验证，填 null',
  baselineUSD: 239, baselineCheckedAt: '2026-10-08T15:45:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=andaz%20singapore%20by%20hyatt&qs=CAEgASgAMidDaGtJd2VQcjFQdjV2clZ2R2cwdlp5OHhNV1I0WkdJMGNHSXdFQUVIAA&ved=0CAAQ5JsGahgKEwjQ_6bi0qqXAxUAAAAAHQAAAAAQkAI&ts=CAESCgoCCAMKAggDEAAaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgKGAQyAggBKgkKBToDVVNEGgA&ap=KigKEglRH_MZTcL0PxHPqFTKyfZZQBISCfDizH_R1vQ_Ec-oVP4N91lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-08T15:45:00Z',
 },
  'Hyatt Regency Phuket Resort 普吉凯悦度假酒店': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: '1 King Bed', perNightUSD: 282, totalUSD: 906, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts（含免费早餐）', note: 'Special Discount 10% off（原价 $316）; Prepay online; Exclusive price for multi-night stays; Earn $9.07 in Trip Coins; 列表页显示 Last booked 30 mins ago' },
  suite: { room: 'Two Bedroom Regency Suite With Ocean View', perNightUSD: 808, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 12:00 PM, Dec 5', breakfast: 'Great breakfast for $22.72 (optional)（需付费）', note: 'Special Discount $40 Off（原价 $848）; Our last 4!; Prepay online; Earn $25.98 in Trip Coins; 同房型另有含早餐费率 $999/晚（Free Cancellation）；其他套房：1 King Bed Hilltop Ocean View Suite $823/晚、Two Bedroom Regency Suite $851/晚（Non-refundable, Our last 1!）' },
  baselineUSD: 269, baselineCheckedAt: '2026-10-08T14:53:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Hyatt%20Regency%20Phuket%20Resort&ts=CAEaHBIaEhQKBwjqDxAMGAoSBwjqDxAMGA0YAzICCAEqCQoFOgNVU0QaAA&ved=0CAAQ5JsGahcKEwi4n5KN1KqXAxUAAAAAHQAAAAAQBg&qs=MiZDaGdJaDRtUDRzQ3NtTTlWR2d3dlp5OHhlV2QyYzNZMmNqZ1FBUQ',
  source: 'Trip.com', checkedAt: '2026-10-08T14:53:00Z',
 },
  'Park Hyatt Bangkok 曼谷柏悦酒店': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'King Room', perNightUSD: 397, totalUSD: 1190.67, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 12', breakfast: '需付费（Great breakfast for $38.45 optional）', note: 'Pay at hotel（到店付）；Last booked 3 hrs ago；明细：房费 $1,082.43 + 服务费 $108.24 = $1,190.67，VAT $83.34 到店付，合计约 $1,274.01' },
  suite: { room: 'Park Deluxe Suite', perNightUSD: 1045, totalUSD: 3135.9, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 12', breakfast: '含免费早餐（Includes 2 great breakfasts）', note: 'Pay at hotel（到店付）；Free Gift；明细：房费 $2,850.81 + 服务费 $285.09 = $3,135.90，VAT $219.51 到店付，合计约 $3,355.41' },
  baselineUSD: 324, baselineCheckedAt: '2026-10-08T15:15:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=park%20hyatt%20bangkok&qs=CAEgASgA&ved=0CAAQ5JsGahcKEwjYsffC2KqXAxUAAAAAHQAAAAAQYQ&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgPEgcI6g8QDBgSGAMyAggBKgkKBToDVVNEGgA&ap=KigKEglWSk-tmXsrQBHBVVSZ2yJZQBISCe4qopcXfitAEcFVVM0fI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-08T15:15:00Z',
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
