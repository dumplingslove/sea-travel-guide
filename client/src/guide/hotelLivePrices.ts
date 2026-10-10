/** 按行程实际住宿日期实查的酒店价格（USD）。
 * 数据来源：Trip.com 房型级实时价格，2 成人 1 间。
 * 查询时间：2026-09-24 20:15–21:35 PDT（21 家首批）；2026-09-26 07:43–08:26 PDT（30 家补齐，全站 51 家覆盖）；2026-09-27 06:59 PDT（新加坡 4 家按新行程日期 12/12–12/17 重查）；2026-09-27 08:51 PDT（普吉 6 家同日期 12/17–12/20 重查）；2026-09-27 08:54 PDT（清迈 6 家按新行程日期 12/23–12/25 重查）；2026-09-27 08:57 PDT（新加坡 Raffles/Ritz-Carlton/文华东方按 12/12–12/17 重查＋富丽敦套房补齐）；2026-09-27 09:04 PDT（曼谷 9 家按新行程日期 12/20–12/23 重查；2026-09-28 22:08–22:23 UTC（28 家行程酒店按新行程日期全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、曼谷 12/14–12/17、清迈 12/17–12/19；Raffles 新加坡该日期整店售罄）。
 * 2026-09-29 13:37–13:48 UTC（28 家行程酒店全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、曼谷 12/14–12/17、清迈 12/17–12/19；Raffles 新加坡该日期仍整店售罄）。
 * 2026-10-10 2026-10-10T13:35:00Z–2026-10-10T15:59:00Z（31 家行程酒店全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、清迈 12/14–12/16、曼谷 12/16–12/19；全程未登录、Trip.com 无登录墙/验证码；3家baselineUrl补正重抓（q参数修正，价格一致）；页面未显示数字总价的不做机械相乘（totalUSD=null、totalInclTax='unknown'））
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
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Premier Twin Room With Garden View', perNightUSD: 1171, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 3', breakfast: '需付费', note: 'Cheapest plan is Pay at hotel ($1,171/night). \'Last booked 2 hrs ago\' on page header. Detail-page summary card shows Total price: $7,022 (1 room × 5 nights incl. taxes & fees) for the $1,288 prepay plan of the same room; no numeric total displayed for the $1,171 plan.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Sentosa Suite', perNightUSD: 1562, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 3', breakfast: '需付费', note: 'Pay at hotel plan. Great breakfast for $63.69 (optional). No stock note for this suite.' },
  suiteNote: 'Cheapest bookable room with \'Suite\' in its name on Trip.com detail page.',
  baselineUSD: 997, baselineCheckedAt: '2026-10-10T15:20:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=capella%20singapore&qs=CAAgASgA&ved=0CAAQ5JsGahcKEwjw9Zmk1q-XAxUAAAAAHQAAAAAQVQ&ts=CAEqBwoFOgNVU0Q&ap=KigKEglNkOZt1_TzPxH9PuOon_RZQBISCdrY8u1bCfQ_Ef0-49zj9FlAMAA',
  source: 'Trip.com', checkedAt: '2026-10-10T15:20:00Z',
 },
  'Raffles Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: null,
  baseNote: 'No bookable rooms for 12/06–12/11, 2026.',
  suite: null,
  unavailable: 'No rooms available for your selected dates. (Page also suggests: You can still book for the following dates: Dec 2-Dec 3 (From $1,502), Dec 3-Dec 4, Dec 4-Dec 5)',
  baselineUrl: 'https://www.google.com/travel/search?q=raffles%20singapore&qs=CAAgASgA&ved=0CAAQ5JsGahgKEwjoj-6746-XAxUAAAAAHQAAAAAQ6AE&ts=CAEqBwoFOgNVU0Q&ap=KigKEglvXOcioKz0PxGkTUrVrPZZQBISCaQZkYskwfQ_EbMxZbDV9llAMAA',
  source: 'Trip.com', checkedAt: '2026-10-10T15:20:00Z',
 },
  'Marina Bay Sands': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Sands Premier King', perNightUSD: 696, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts. Prepay online. \'Exclusive price for multi-night stays · Early bird price\'. Children stay for free. \'Last booked 13 mins ago\'. List card showed Total price: $3,792 (1 room × 5 nights incl. taxes & fees) for this plan; detail page shows the total label without numeric amount.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Sands Bay Suite King Gardens By The Bay View', perNightUSD: 1314, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts. Prepay online. \'Exclusive price for multi-night stays · Early bird price\'. No stock note.' },
  suiteNote: 'Cheapest bookable room with \'Suite\' in its name on Trip.com detail page.',
  baselineUSD: 600, baselineCheckedAt: '2026-10-10T15:20:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=marina%20bay%20sands&qs=CAAgASgA&ved=0CAAQ5JsGahcKEwjg-M6J5K-XAxUAAAAAHQAAAAAQTQ&ts=CAEqBwoFOgNVU0Q&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-10T15:20:00Z',
 },
  'The Ritz-Carlton, Millenia Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Deluxe Kallang King Room', perNightUSD: 498, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Oct 11', breakfast: '需付费', note: 'Best price with free cancellation. Great breakfast for $60.88 (optional). Prepay online. \'Last booked 21 mins ago\'. List card showed Total price: $2,715 (1 room × 5 nights incl. taxes & fees); detail page shows the total label without numeric amount. Note: page literally shows free-cancellation deadline \'Oct 11\'.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Club Deluxe King Suite, Club Lounge Access, High Floor', perNightUSD: 842, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Oct 11', breakfast: '含免费早餐', note: 'Prepay online. Includes 1 great breakfast. No stock note.' },
  suiteNote: 'Cheapest bookable room with \'Suite\' in its name on Trip.com detail page.',
  baselineUSD: 375, baselineCheckedAt: '2026-10-10T15:20:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20ritz-carlton%20millenia%20singapore&qs=CAAgASgA&ved=0CAAQ5JsGahcKEwiw5Ouh6K-XAxUAAAAAHQAAAAAQXw&ts=CAEqBwoFOgNVU0Q&ap=KigKEgnRIcAd45r0PxEePdkO5PZZQBISCVLhtIhnr_Q_ER492UIo91lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-10T15:20:00Z',
 },
  'Mandarin Oriental Singapore 文华东方': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Sea View Room King', perNightUSD: 575, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 4', breakfast: '需付费', note: 'Best price with free cancellation. Great breakfast for $33.72 (optional). Prepay online. Earn $156.56 Trip Coins. \'Last booked 9 mins ago\'. List card showed Total price: $3,131 (1 room × 5 nights incl. taxes & fees); detail page shows the total label without numeric amount.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Family Suite', perNightUSD: 1008, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 4', breakfast: '需付费', note: 'Great breakfast for $33.72 (optional). No stock note.' },
  suiteNote: 'Cheapest bookable room with \'Suite\' in its name on Trip.com detail page.',
  baselineUSD: 346, baselineCheckedAt: '2026-10-10T15:20:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=mandarin%20oriental%20singapore%20lobby&qs=CAAgASgAMiJDaFVJMVozZDFOUEd2SmdnR2drdmJTOHdPRjlvZUhRUUFR&ved=0CAAQ5JsGahcKEwi4657d56-XAxUAAAAAHQAAAAAQXw&ts=CAEqBwoFOgNVU0Q&ap=KigKEgnbidptl5z0PxHzNLsvxfZZQBISCfv4ltgbsfQ_EfM0u2MJ91lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-10T15:20:00Z',
 },
  'Shangri-La Singapore 香格里拉': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Tower Wing Deluxe King Room', perNightUSD: 285, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '需付费', note: 'Prepay online. Early bird price. Great breakfast for $40.31 (optional). Earn $15.55 Trip Coins. \'Last booked 29 mins ago\'. List card showed Total price: $1,554 (1 room × 5 nights incl. taxes & fees); detail page shows the total label without numeric amount.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: null,
  suiteNote: 'No room with \'Suite\' in its name found in the full room list on the Trip.com detail page (only Tower Wing / Garden Wing / Valley Wing / Horizon Club room names).',
  baselineUSD: 231, baselineCheckedAt: '2026-10-10T15:20:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=shangri-la%20singapore&qs=CAAgASgA&ved=0CAAQ5JsGahgKEwjg-M6J5K-XAxUAAAAAHQAAAAAQjwM&ts=CAEqBwoFOgNVU0Q&ap=KigKEgkpyCxRzJT0PxGkTUrVrPZZQBISCbECAibVvfQ_EaQCgjSV91lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-10T15:20:00Z',
 },
  'The Fullerton Hotel Singapore 新加坡富丽敦酒店': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Premier Courtyard Room', perNightUSD: 309, totalUSD: 1685, totalInclTax: true, cancel: 'Non-refundable', breakfast: '未明确', note: 'Prepay online. Early bird price. \'Our last 5!\'. Children stay for free. Earn $84.27 Trip Coins. \'Last booked 2 hrs ago\'. Detail-page \'Today\'s best price!\' card explicitly shows Total price: $1,685, \'1 room × 5 nights incl. taxes & fees\'.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: null,
  suiteNote: 'Detail page shows 6 base room types plus a collapsed \'Show 9 Remaining Room Types\' section (likely containing suites such as Fullerton Suite / Quay Suite); the expander could not be activated in this session, so no Suite-named room price was captured.',
  baselineUSD: 235, baselineCheckedAt: '2026-10-10T15:20:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20fullerton%20hotel%20singapore&qs=CAAgASgA&ved=0CAAQ5JsGahcKEwjItKfK6K-XAxUAAAAAHQAAAAAQXw&ts=CAEqBwoFOgNVU0Q&ap=KigKEgnd2PsBdor0PxH4Rr5Cc_ZZQBISCd5tDm_6nvQ_EfM0u2MJ91lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-10T15:20:00Z',
 },
  'Amanpuri': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Garden Pool Pavilion', perNightUSD: 3653, totalUSD: 11751, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 10', breakfast: '免费', note: 'Our last 2!; 2 great breakfasts included; prepay online, instant confirmation' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Partial Ocean Pool Pavilion', perNightUSD: 4649, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 10', breakfast: '免费', note: 'Our last 5!; 别墅型酒店无明确\'Suite\'命名房型，套房栏用次便宜可订房型替代（口径说明）；详情页未显示该房型明确总价数字，故 totalUSD=null' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 1850, baselineCheckedAt: '2026-10-10T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Amanpuri%20Phuket&checkin=2026-12-11&checkout=2026-12-14&adults=2&currency=USD&ved=0CAAQ5JsGahcKEwj439uvxK-XAxUAAAAAHQAAAAAQBw&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgLEgcI6g8QDBgOGAMyAggBKgkKBToDVVNEGgA&qs=CAEyJENoY0l4TmYzc0x6WXZjYkZBUm9LTDIwdk1ETnVjR3N4WmhBQjgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-10T13:40:00Z',
 },
  'Trisara': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Ocean View Pool Villa', perNightUSD: 1920, totalUSD: 6838, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 27', breakfast: '免费', note: 'Our last 3!; 2 great breakfasts included; pay at hotel, instant confirmation' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Signature Ocean View Pool Suite', perNightUSD: 2720, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 27', breakfast: '免费', note: 'Our last 2!; 详情页未显示该房型明确总价数字，故 totalUSD=null' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 1597, baselineCheckedAt: '2026-10-10T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Trisara%20Phuket&checkin=2026-12-11&checkout=2026-12-14&adults=2&currency=USD&ved=0CAAQ5JsGahgKEwjQ_9bPxK-XAxUAAAAAHQAAAAAQmwE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgLEgcI6g8QDBgOGAMyAggBKgkKBToDVVNEGgA&qs=CAEyJkNoZ0lsYi03bzZTTDRwZkVBUm9MTDJjdk1YUnFPVE4yZWpBUUFR&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-10T13:40:00Z',
 },
  'Banyan Tree Phuket': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Banyan Pool Villa', perNightUSD: 764, totalUSD: 2458, totalInclTax: true, cancel: 'Non-refundable（最便宜选项不可退；另有 $955 选项可免费取消，Free Cancellation before 11:59 PM, Nov 27）', breakfast: '免费', note: '2 great breakfasts included; Earn $122.88 Trip Coins; 入住期间另收 green fund $1/别墅/晚' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Serenity Pool Villa', perNightUSD: 831, totalUSD: null, totalInclTax: true, cancel: 'Non-refundable（另有 $1,038 选项可免费取消，Free Cancellation before 11:59 PM, Nov 27）', breakfast: '免费', note: '别墅型酒店无明确\'Suite\'命名房型，套房栏用最便宜可订替代房型（口径说明）；详情页未显示该房型明确总价数字，故 totalUSD=null' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 529, baselineCheckedAt: '2026-10-10T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Banyan%20Tree%20Phuket&checkin=2026-12-11&checkout=2026-12-14&adults=2&currency=USD&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgLEgcI6g8QDBgOGAMyAggBKgkKBToDVVNEGgA&qs=CAEyJ0Noa0l6dl9mOUxHVnNMMmFBUm9NTDJjdk1USm9jSFl3Y0dSeEVBRQ&ved=0CAAQ5JsGahgKEwiIipnzxK-XAxUAAAAAHQAAAAAQowE&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-10T13:40:00Z',
 },
  'JW Marriott Phuket Resort & Spa 普吉JW万豪': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Guest Room,2 Double,Garden View,Balcony', perNightUSD: 473, totalUSD: 1522, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 8', breakfast: '付费', note: 'Last booked 10 hrs ago; 早餐为可选项 Great breakfast for $31.62（另付）；pay at hotel / prepay online' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: null,
  suiteNote: '套房房型位于折叠区域未展开成功，本次未查到',
  baselineUSD: 427, baselineCheckedAt: '2026-10-10T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=JW%20Marriott%20Phuket%20Resort%20%26%20Spa&checkin=2026-12-11&checkout=2026-12-14&adults=2&currency=USD&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgLEgcI6g8QDBgOGAMyAggBKgkKBToDVVNEGgA&qs=CAEyJ0Noa0l5TXJka2JHeXhhVkVHZzB2Wnk4eE1XSjBkMnM1Y0RscUVBRQ&ved=0CAAQ5JsGahgKEwiosdeVxa-XAxUAAAAAHQAAAAAQpwE&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-10T13:40:00Z',
 },
  'The Surin Phuket': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'One Bedroom Superior Cottage', perNightUSD: 627, totalUSD: 2016, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 11', breakfast: '免费', note: 'Our last 1! / Only 1 left at this price; Special Discount（原价 $719 → $627，通用促销非会员专属）；2 great breakfasts included; prepay online' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Beach Suite', perNightUSD: 1254, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 11', breakfast: '免费', note: '原价 $1,439 → $1,254；详情页未显示该房型明确总价数字，故 totalUSD=null' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 537, baselineCheckedAt: '2026-10-10T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=The%20Surin%20Phuket&checkin=2026-12-11&checkout=2026-12-14&adults=2&currency=USD&ved=0CAAQ5JsGahgKEwjw15Kzxa-XAxUAAAAAHQAAAAAQrgE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgLEgcI6g8QDBgOGAMyAggBKgkKBToDVVNEGgA&qs=CAEyJkNoZ0k1c19kZ1AzeGgtVlBHZ3d2Wnk4eE1tcGlkREEyTkdvUUFR&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-10T13:40:00Z',
 },
  'Keemala': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Clay Pool Cottage', perNightUSD: 767, totalUSD: 2468, totalInclTax: true, cancel: 'Non-refundable', breakfast: '免费', note: 'Our last 3! / Only 3 left at this price; Limited Time Offer 45% off（原价 $1,441 → $767，通用促销非会员专属）；2 great breakfasts included; Earn $24.69 Trip Coins' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Tent Pool Villa', perNightUSD: 839, totalUSD: null, totalInclTax: true, cancel: 'Non-refundable', breakfast: '免费', note: 'Our last 3!; Limited Time Offer 45% off（原价 $1,575 → $839）；别墅型酒店无明确\'Suite\'命名房型，套房栏用最便宜可订替代房型（口径说明）；详情页未显示该房型明确总价数字，故 totalUSD=null' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 620, baselineCheckedAt: '2026-10-10T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Keemala%20Phuket&checkin=2026-12-11&checkout=2026-12-14&adults=2&currency=USD&ved=0CAAQ5JsGahcKEwjorOzNxa-XAxUAAAAAHQAAAAAQBw&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgLEgcI6g8QDBgOGAMyAggBKgkKBToDVVNEGgA&qs=CAEyJkNoZ0k5YmZMdFlpMV9vdWNBUm9OTDJjdk1URmlZemN6WWpsck5oQUI&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-10T13:40:00Z',
 },
  '137 Pillars House': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Rajah Brooke Suite', perNightUSD: 602, totalUSD: 1290, totalInclTax: true, cancel: 'Free Cancellation before 1:00 AM, Nov 22', breakfast: '免费', note: 'Special Discount 10% off（原价 $672 → $602）；Our last 5!；Last booked 10 hrs ago；1 king bed or 2 single beds, Garden view, 753 ft², Floor 1-2；Instant confirmation, Prepay online；含 2 份早餐' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Rajah Brooke Suite', perNightUSD: 602, totalUSD: 1290, totalInclTax: true, cancel: 'Free Cancellation before 1:00 AM, Nov 22', breakfast: '免费', note: '该酒店所有房型均为 Suite 命名（Rajah Brooke / East Borneo / David Fleming Macfie / William Bain / Louis Leonowen Pool Suite），最便宜套房即最便宜基础房' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 597, baselineCheckedAt: '2026-10-10T13:35:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=137%20Pillars%20House%20Chiang%20Mai%20Thailand&qs=CAEyKENob0lfSm1Gajh2Ty1aaU9BUm9OTDJjdk1URmpNM0JqY3prMWVSQUI4AEgA&dates=2026-12-14%2C2026-12-16&hl=en&gl=us&ved=0CCEQssMEahcKEwiY0tu0xK-XAxUAAAAAHQAAAAAQIQ&ts=CAESCgoCCAMKAggDEAAaVQo3EjMyJTB4MzBkYTNhN2U5MGJiNmY1ZDoweDk4ZDQ2MjcwYTU5YjQzNjc6CkNoaWFuZyBNYWkaABIaEhQKBwjqDxAMGA4SBwjqDxAMGBAYAjICCAEqCQoFOgNVU0QaAA&ap=MAC6AQZwcmljZXM',
  source: 'Trip.com', checkedAt: '2026-10-10T13:35:00Z',
 },
  'Four Seasons Resort Chiang Mai': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Upper Garden Pavilion King', perNightUSD: 1819, totalUSD: 3901, totalInclTax: true, cancel: 'Non-refundable', breakfast: '免费', note: 'Our last 1!；Instant confirmation, Prepay online；1 king bed, Mountain view, 753 ft², Floor 2；含 2 份早餐；该房价档无折扣标签' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: null,
  suiteNote: '页面房型为 Pavilion 系列及 Pool Villa，无明确 \'Suite\' 命名房型',
  baselineUSD: 1616, baselineCheckedAt: '2026-10-10T13:35:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Four%20Seasons%20Resort%20Chiang%20Mai%20Thailand&dates=2026-12-14%2C2026-12-16&hl=en&gl=us&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgOEgcI6g8QDBgQGAIyAggBKgkKBToDVVNEGgA&qs=CAEyJkNoZ0lucmlldk8zVi1mdkRBUm9MTDJjdk1YWTRjM2w1WHpZUUFR&ved=0CAAQ5JsGahgKEwjovY6lxa-XAxUAAAAAHQAAAAAQowE&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-10T13:35:00Z',
 },
  'Raya Heritage': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Rin Suite with Terrace', perNightUSD: 462, totalUSD: 990, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 23', breakfast: '免费', note: 'Special Discount 7% off（原价 $497 → $462）；Our last 1!；Instant confirmation, Prepay online；1 king bed, River view, 807 ft², Floor 2-3；含 2 份早餐及每日文化活动/接驳服务' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Rin Suite with Terrace', perNightUSD: 462, totalUSD: 990, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 23', breakfast: '免费', note: '该酒店所有房型均为 Suite 命名（Rin Suite with Terrace / Huen Bon Suite / Kramm Suite with Pool），最便宜套房即最便宜基础房' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 421, baselineCheckedAt: '2026-10-10T13:35:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Raya%20Heritage%20Chiang%20Mai%20Thailand&dates=2026-12-14%2C2026-12-16&hl=en&gl=us&ved=0CAAQ5JsGahcKEwiYv5iExa-XAxUAAAAAHQAAAAAQdg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgOEgcI6g8QDBgQGAIyAggBKgkKBToDVVNEGgA&qs=CAEyKENob0ltTVQ3d08zdDc0SzZBUm9OTDJjdk1URm1OVFIzZEhNMGVoQUI&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-10T13:35:00Z',
 },
  'Anantara Chiang Mai': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Deluxe Room With Garden View', perNightUSD: 430, totalUSD: 1021, totalInclTax: true, cancel: 'Non-refundable', breakfast: '免费', note: 'Pay at hotel；Earn $10.22 in Trip Coins；Last booked 4 hrs ago；1 king bed or 2 single beds, Garden view, 538 ft², Floor 1-4；含 2 份早餐' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Lanna Garden View Suite', perNightUSD: 675, totalUSD: null, totalInclTax: true, cancel: 'Non-refundable', breakfast: '免费', note: 'Early bird price；Earn $72.34 in Trip Coins；Instant confirmation, Prepay online；1 king bed or 2 single beds, Garden view, 1130 ft², Floor 1-2；详情页未明确显示该房型数字总价，故 totalUSD=null（页面标注总价含税费）' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 395, baselineCheckedAt: '2026-10-10T13:35:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Anantara%20Chiang%20Mai%20Thailand&dates=2026-12-14%2C2026-12-16&hl=en&gl=us&ved=0CAAQ5JsGahgKEwiYuYngxK-XAxUAAAAAHQAAAAAQnwE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgOEgcI6g8QDBgQGAIyAggBKgkKBToDVVNEGgA&qs=CAEyJkNoZ0lyY3pUaU5TWjhPREJBUm9MTDJjdk1YUnFlRzUzTkRBUUFR&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-10T13:35:00Z',
 },
  'Shangri-La Chiang Mai 清迈香格里拉': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Deluxe King Room', perNightUSD: 177, totalUSD: 379, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 13', breakfast: '付费', note: 'Special Discount 14% off（原价 $207 → $177）；Last booked 58 mins ago；Instant confirmation, Prepay online；1 king bed, Mountain view, 462 ft², Floor 3-9；早餐需另付 $21.48/份' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Executive King Suite', perNightUSD: 349, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 13', breakfast: '免费', note: '8% off（原价 $382 → $349）；Our last 5!；Horizon Club Lounge Benefits；Instant confirmation, Prepay online；1 king bed, Mountain view, 925 ft²；详情页未明确显示该房型数字总价，故 totalUSD=null（页面标注总价含税费）' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 157, baselineCheckedAt: '2026-10-10T13:35:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Shangri%20La%20Chiang%20Mai%20Thailand&dates=2026-12-14%2C2026-12-16&hl=en&gl=us&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgOEgcI6g8QDBgQGAIyAggBKgkKBToDVVNEGgA&qs=CAEyJkNoZ0k4LXVxZ1BfYW9hVHpBUm9MTDJjdk1YUmtNRGRqWjNjUUFR&ved=0CAAQ5JsGahgKEwig_s3Dxa-XAxUAAAAAHQAAAAAQnAE&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-10T13:35:00Z',
 },
  'Chiang Mai Marriott Hotel 清迈万豪': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Deluxe King - City View', perNightUSD: 197, totalUSD: 425, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 13', breakfast: '付费', note: 'Best price with free cancellation；Last booked 2 hrs ago；Instant confirmation, Pay at hotel（预付同价 $197）；1 king bed, City view, 387 ft²；早餐需另付 $22.82/份' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Executive Suite, 1 Bedroom, 1 King, Club Lounge Access', perNightUSD: 328, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 13', breakfast: '付费', note: 'Unlimited M Club access (Club Lounge benefits)；Instant confirmation, Pay at hotel（预付同价 $328）；1 king bed, Mountain view, 818 ft²；详情页未明确显示该房型数字总价，故 totalUSD=null（页面标注总价含税费）；另有 Diplomatic Suite $1,673、Royal Suite $2,165' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 178, baselineCheckedAt: '2026-10-10T13:35:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Chiang%20Mai%20Marriott%20Hotel%20Thailand&dates=2026-12-14%2C2026-12-16&hl=en&gl=us&ved=0CAAQ5JsGahgKEwiYm_7jxa-XAxUAAAAAHQAAAAAQsgE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgOEgcI6g8QDBgQGAIyAggBKgkKBToDVVNEGgA&qs=CAEyJkNoZ0l4TDdocGJEY2tORDFBUm9MTDJjdk1YUm5OV1prZW5NUUFR&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-10T13:35:00Z',
 },
  'The Ritz-Carlton, Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe King', perNightUSD: 374, totalUSD: 1194, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 15', breakfast: '付费（可选早餐 $33.35/人）', note: 'Pay at hotel / Instant confirmation；列表页标注 Last booked 39 mins ago' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: null,
  suiteNote: '详情页 17 种房型无 Suite 命名房型',
  baselineUSD: 338, baselineCheckedAt: '2026-10-10T13:38:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=The%20Ritz%20Carlton%20Bangkok&qs=CAEyJ0Noa0lfTWUxMks3MnE4b1JHZzB2Wnk4eE1YYzVaek55ZVdOZkVBRTgA&curr=USD&adults=2&rooms=1&dates=20261216%2C20261219&ved=0CAAQ5JsGahcKEwjArrSxxK-XAxUAAAAAHQAAAAAQdQ&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgQEgcI6g8QDBgTGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-10T13:38:00Z',
 },
  'The Peninsula Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe King Room', perNightUSD: 424, totalUSD: 1353, totalInclTax: true, cancel: 'Non-refundable', breakfast: '免费（Includes 2 great breakfasts）', note: 'Our last 4!；Instant confirmation；Prepay online', memberDeal: 'Member deal 10% off：$474 → $424' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Deluxe King Suite', perNightUSD: 589, totalUSD: 1877.13, totalInclTax: true, cancel: 'Non-refundable', breakfast: '免费（Includes 2 great breakfasts）', note: 'Our last 4!；Instant confirmation；Prepay online；总价来自价格明细弹窗（含服务费 $170.64 + VAT $111.63）', memberDeal: 'Member deal 10% off：$658 → $589' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 280, baselineCheckedAt: '2026-10-10T13:38:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=The%20Peninsula%20Bangkok&qs=CAEyI0NoWUl0NXEzaHZiazN0cFhHZ292YlM4d1oyYzRNSG81RUFFOAA&curr=USD&adults=2&rooms=1&dates=20261216%2C20261219&ved=0CAAQ5JsGahcKEwiomJ_lxK-XAxUAAAAAHQAAAAAQBg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgQEgcI6g8QDBgTGAMyAggBKgkKBToDVVNEGgA&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-10T13:38:00Z',
 },
  'Rosewood Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe Twin Room', perNightUSD: 373, totalUSD: 1191, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 9', breakfast: '付费（可选早餐 $44.95/人）', note: 'Pay at hotel；Instant confirmation', memberDeal: 'Member deal 15% off：$444 → $373' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Premier Suite', perNightUSD: 691, totalUSD: 2205.34, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 9', breakfast: '免费（Includes 1 great breakfast）', note: 'Prepay online；总价来自价格明细弹窗（含服务费 $200.48 + VAT $131.16）', memberDeal: 'Member deal 15% off：$821 → $691' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 312, baselineCheckedAt: '2026-10-10T13:38:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Rosewood%20Bangkok&curr=USD&adults=2&rooms=1&dates=20261216%2C20261219&ts=CAEaHBIaEhQKBwjqDxAMGBASBwjqDxAMGBMYAzICCAEqCQoFOgNVU0QaAA&qs=MidDaGtJLWZQVTZyLWh6T04yR2cwdlp5OHhNV1kxYUd4aWVqVmZFQUU&ved=0CAAQ5JsGahcKEwjgiMmFxa-XAxUAAAAAHQAAAAAQBg',
  source: 'Trip.com', checkedAt: '2026-10-10T13:38:00Z',
 },
  '曼谷文华东方': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: null,
  baseNote: 'No bookable rooms for 12/16–12/19, 2026.',
  suite: null,
  unavailable: 'No rooms available for your selected dates. You can still book for the following dates: Dec 13-Dec 14 From $581 / Dec 14-Dec 15 / Dec 15-Dec 16 From $528',
  baselineUSD: 643, baselineCheckedAt: '2026-10-10T13:38:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Mandarin%20Oriental%20Bangkok&curr=USD&adults=2&rooms=1&dates=20261216%2C20261219&ts=CAEaHBIaEhQKBwjqDxAMGBASBwjqDxAMGBMYAzICCAEqCQoFOgNVU0QaAA&qs=MiJDaFVJNVpXbnRMYkdzOWtMR2drdmJTOHdPRFZpTjJjUUFR&ved=0CAAQ5JsGahcKEwiwpYCOxa-XAxUAAAAAHQAAAAAQBg',
  source: 'Trip.com', checkedAt: '2026-10-10T13:38:00Z',
 },
  'Capella Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Riverfront Premier King Room / Riverfront Premier Twin Room', perNightUSD: 972, totalUSD: 3100, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 11', breakfast: '免费（Includes 2 great breakfasts）', note: 'Prepay online；列表页标注 Last booked 3 hrs ago；Earn $154.99 Trip Coins' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'River Suite', perNightUSD: 1830, totalUSD: 5837.8, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 11', breakfast: '免费（Includes 2 great breakfasts）', note: 'Our last 4!；总价来自价格明细弹窗' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 728, baselineCheckedAt: '2026-10-10T13:38:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Capella%20Bangkok&curr=USD&adults=2&rooms=1&dates=20261216%2C20261219&ts=CAEaHBIaEhQKBwjqDxAMGBASBwjqDxAMGBMYAzICCAEqCQoFOgNVU0QaAA&qs=MidDaGtJNlBHbjRkSzExSnN5R2cwdlp5OHhNV00yZW5wbWVUWmtFQUU&ved=0CAAQ5JsGahcKEwjo0JGUxa-XAxUAAAAAHQAAAAAQCA',
  source: 'Trip.com', checkedAt: '2026-10-10T13:38:00Z',
 },
  'Aman Nai Lert Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: null,
  suite: { room: 'Deluxe King Suite', perNightUSD: 1714, totalUSD: 5466, totalInclTax: true, cancel: 'Non-refundable（另有免费取消价 $1,904/晚）', breakfast: '免费（Includes 2 great breakfasts）', note: 'Our last 5!；Prepay online；Free minibar；Suvarnabhumi Airport Arrival Fast Track + Limousine transfer' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 1703, baselineCheckedAt: '2026-10-10T13:38:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Aman%20Nai%20Lert&curr=USD&adults=2&rooms=1&dates=20261216%2C20261219&ts=CAEaHBIaEhQKBwjqDxAMGBASBwjqDxAMGBMYAzICCAEqCQoFOgNVU0QaAA&qs=MihDaG9JaUtXVGw5S0YyUG15QVJvTkwyY3ZNVEZxYW5kdWNXWTRjaEFC&ved=0CAAQ5JsGahcKEwiowfujxa-XAxUAAAAAHQAAAAAQBw',
  source: 'Trip.com', checkedAt: '2026-10-10T13:38:00Z',
 },
  'Four Seasons Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe Room - King（同价另有 Deluxe Palm Court Room - King/Twin、Deluxe Room - Twin）', perNightUSD: 737, totalUSD: 2352, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 15', breakfast: '付费（可选早餐 $47.40/人）', note: 'Our last 1!；Prepay online；另有新客首单优惠（非会员价）' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: null,
  suiteNote: '详情页 8 种房型无 Suite 命名房型',
  baselineUSD: 622, baselineCheckedAt: '2026-10-10T13:38:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Four%20Seasons%20Bangkok&curr=USD&adults=2&rooms=1&dates=20261216%2C20261219&ts=CAEaHBIaEhQKBwjqDxAMGBASBwjqDxAMGBMYAzICCAEqCQoFOgNVU0QaAA&qs=MihDaG9JNmFxYXpfVFZxZmZGQVJvTkwyY3ZNVEZrZUdzNGJtZHNOaEFC&ved=0CAAQ5JsGahcKEwjwhs6oxa-XAxUAAAAAHQAAAAAQBg',
  source: 'Trip.com', checkedAt: '2026-10-10T13:38:00Z',
 },
  'The Siam': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: null,
  suite: { room: 'Siam Suite', perNightUSD: 757, totalUSD: 2414, totalInclTax: true, cancel: 'Non-refundable（另有免费取消价 $896/晚起）', breakfast: '免费（Includes 2 great breakfasts）', note: 'Prepay online；Free minibar；Boat transfer service to Central Sathorn Pier (BTS Saphan Taksin Station)；列表页标注 Last booked 6 hrs ago' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 528, baselineCheckedAt: '2026-10-10T13:38:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=The%20Siam%20Bangkok&curr=USD&adults=2&rooms=1&dates=20261216%2C20261219&ts=CAEaHBIaEhQKBwjqDxAMGBASBwjqDxAMGBMYAzICCAEqCQoFOgNVU0QaAA&qs=MidDaGtJM3MyazRmeUZtS09DQVJvTUwyY3ZNVEpxYzNRd05EQm9FQUU&ved=0CAAQ5JsGahcKEwi4776txa-XAxUAAAAAHQAAAAAQBg',
  source: 'Trip.com', checkedAt: '2026-10-10T13:38:00Z',
 },
  'The Athenee Hotel, a Luxury Collection Hotel, Bangkok 曼谷雅典娜豪华精选酒店': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Athenee King Room Non smoking', perNightUSD: 233, totalUSD: 744, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 15', breakfast: '付费（可选早餐 $29.83/人）', note: 'Pay at hotel；Instant confirmation；列表页标注 Last booked 13 hrs ago；Earn $7.45 Trip Coins' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Athenee Suite Non smoking', perNightUSD: 443, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 15', breakfast: '免费（Includes 1 great breakfast）', note: '页面数字总价未明确显示；$443 为页面多房型组合区展示价；另有 Royal Club Suite $624' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 211, baselineCheckedAt: '2026-10-10T13:38:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=The+Athenee+Hotel+Bangkok+Luxury+Collection&curr=USD&adults=2&rooms=1&dates=20261216%2C20261219&ts=CAEaHBIaEhQKBwjqDxAMGBASBwjqDxAMGBMYAzICCAEqCQoFOgNVU0QaAA',
  source: 'Trip.com', checkedAt: '2026-10-10T13:38:00Z',
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
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'King Room', perNightUSD: 261, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: '需付费', note: 'Prepay online. Great breakfast for $42.18 (optional). \'Last booked 6 hrs ago\'. List card showed Total price: $1,422 (1 room × 5 nights incl. taxes & fees); detail page shows the total label without numeric amount. A $373 \'Best price with free cancellation\' plan (Free Cancellation before 11:59 PM, Dec 4) also exists for the same room.' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Andaz King Suite', perNightUSD: 717, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: '含免费早餐', note: 'Prepay online. Includes 2 great breakfasts. No stock note.' },
  suiteNote: 'Cheapest bookable room with \'Suite\' in its name on Trip.com detail page.',
  baselineUSD: 237, baselineCheckedAt: '2026-10-10T15:20:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=andaz%20singapore&qs=CAAgASgA&ved=0CAAQ5JsGahgKEwjg-M6J5K-XAxUAAAAAHQAAAAAQ7wM&ts=CAEqBwoFOgNVU0Q&ap=KigKEgm_n4mj0e7zPxGkAoL0UfNZQBISCYrFk3YYN_U_EaQCgjSV91lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-10T15:20:00Z',
 },
  'Hyatt Regency Phuket Resort 普吉凯悦度假酒店': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: '1 King Bed', perNightUSD: 280, totalUSD: 902, totalInclTax: true, cancel: 'Non-refundable（最便宜选项不可退；另有 $347 选项可免费取消，Free Cancellation before 11:59 PM, Dec 8）', breakfast: '免费', note: 'Last booked 8 hrs ago; Special Discount 9% off（原价 $310 → $280，通用促销非会员专属）；Exclusive price for multi-night stays; Earn $9.03 Trip Coins' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Two Bedroom Regency Suite', perNightUSD: 599, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 8', breakfast: '付费', note: 'Special Discount $7 off（原价 $606 → $599）；该房型价格按 1 adult 显示（页面提示 We recommend 2 rooms for your group）；早餐为可选项 Great breakfast for $22.82（另付）；详情页未显示该房型明确总价数字，故 totalUSD=null' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 269, baselineCheckedAt: '2026-10-10T13:40:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Hyatt%20Regency%20Phuket%20Resort&checkin=2026-12-11&checkout=2026-12-14&adults=2&currency=USD&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgLEgcI6g8QDBgOGAMyAggBKgkKBToDVVNEGgA&qs=CAEyJkNoZ0loNG1QNHNDc21NOVZHZ3d2Wnk4eGVXZDJjM1kyY2pnUUFR&ved=0CAAQ5JsGahgKEwjAuLLzxa-XAxUAAAAAHQAAAAAQowE&ap=MAA',
  source: 'Trip.com', checkedAt: '2026-10-10T13:40:00Z',
 },
  'Park Hyatt Bangkok 曼谷柏悦酒店': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'King Room', perNightUSD: 404, totalUSD: 1295, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 9', breakfast: '付费（可选早餐 $38.63/人）', note: 'Prepay online；Instant confirmation；列表页标注 Last booked 1 hr ago；Earn $12.96 Trip Coins' },
  baseNote: 'Cheapest bookable base room on Trip.com detail page (public price, no login).',
  suite: { room: 'Park Deluxe Suite', perNightUSD: 1181, totalUSD: 3791.22, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 9', breakfast: '付费（可选早餐 $38.63/人）', note: 'Prepay online；总价来自价格明细弹窗（含服务费 $322.11 + VAT $248.01）；Earn $37.92 Trip Coins' },
  suiteNote: 'Cheapest bookable suite on Trip.com detail page (public price, no login).',
  baselineUSD: 318, baselineCheckedAt: '2026-10-10T13:38:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=Park%20Hyatt%20Bangkok&curr=USD&adults=2&rooms=1&dates=20261216%2C20261219&ts=CAEaHBIaEhQKBwjqDxAMGBASBwjqDxAMGBMYAzICCAEqCQoFOgNVU0QaAA&qs=MidDaGtJOVlPSW04bUYxTkZMR2cwdlp5OHhNV05xYWpneWVqTjRFQUU&ved=0CAAQ5JsGahcKEwio-dm2xa-XAxUAAAAAHQAAAAAQCA',
  source: 'Trip.com', checkedAt: '2026-10-10T13:38:00Z',
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
