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
  base: { room: 'Premier Twin Room With Garden View', perNightUSD: 1174, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 3', breakfast: 'Not included; optional breakfast available for $63.77', note: 'Cheapest bookable rate is \'Pay at hotel\' with instant confirmation. Page did not display a 4-night total for this rate (label \'Total price: 1 room x 4 nights incl. taxes & fees\' without amount), so no total reported. Reference: $1,291/night featured rate for same room showed Total $5,629 (1 room x 4 nights incl. taxes & fees) on search list card.' },
  suite: { room: 'Sentosa Suite', perNightUSD: 1565, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 3', breakfast: 'Not included; optional breakfast available for $63.77', note: '\'Our last 5!\' inventory note. Cheapest bookable rate is \'Pay at hotel\' with instant confirmation. Page did not display a 4-night total for this rate.' },
  baselineUSD: 880, baselineCheckedAt: '2026-10-04T18:16:50Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Capella%20Singapore',
  source: 'Trip.com', checkedAt: '2026-10-04T15:30:00Z',
 },
  'Raffles Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: null,
  suite: null,
  unavailable: '该日期整店售罄（No rooms available for your selected dates）',
  baselineUSD: 920, baselineCheckedAt: '2026-10-04T18:16:50Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Raffles%20Singapore',
  source: 'Trip.com', checkedAt: '2026-10-04T15:30:00Z',
 },
  'Marina Bay Sands': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Sands Premier King', perNightUSD: 699, totalUSD: 3049, totalInclTax: true, cancel: 'Free cancellation before 11:59 PM, Dec 4', breakfast: 'Includes 2 breakfasts', note: 'Prepay online；Instant confirmation；登录会员查询，该房型无会员专属标签；总价为页面显示 Total price: 1 room × 4 nights incl. taxes & fees' },
  suite: { room: 'Sands Bay Suite King Gardens By The Bay View', perNightUSD: 1316, totalUSD: 6580, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online；Instant confirmation；Early bird price；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  suiteNote: '套房价为 2026-10-03 实查（旧日期 12/06–12/11），本轮仅重查基础房',
  baselineUSD: 599, baselineCheckedAt: '2026-10-04T18:16:50Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Marina%20Bay%20Sands%20Singapore',
  source: 'Trip.com', checkedAt: '2026-10-04T17:14:00Z',
 },
  'The Ritz-Carlton, Millenia Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Deluxe Kallang King Room', perNightUSD: 428, totalUSD: 1868, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'optional', note: 'Value deal 17% off（原价 $524/晚）；Early bird price；Confirmed within 12 hours；Prepay online；登录会员查询，该房型无会员专属标签；总价为页面显示 Total price: 1 room × 4 nights incl. taxes & fees' },
  suite: { room: 'Club Deluxe King Suite, Club Lounge Access, High Floor', perNightUSD: 843, totalUSD: 4215, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Oct 5', breakfast: 'Includes 1 great breakfast', note: '1-adult price caveat（该价显示为 1 位成人，"We recommend 2 rooms for your group"）；Prepay online；Instant confirmation；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  suiteNote: '套房价为 2026-10-03 实查（旧日期 12/06–12/11），本轮仅重查基础房',
  baselineUSD: 415, baselineCheckedAt: '2026-10-04T18:16:50Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=The%20Ritz-Carlton%20Millenia%20Singapore',
  source: 'Trip.com', checkedAt: '2026-10-04T17:14:00Z',
 },
  'Mandarin Oriental Singapore 文华东方': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Sea View Room King', perNightUSD: 458, totalUSD: 1998, totalInclTax: true, cancel: 'Free cancellation before 6:00 PM, Dec 4', breakfast: 'optional', memberDeal: 'Platinum Tier Deal 仅部分高阶房型（如 Premier Room With Balcony 含双早 $724→$713/晚）', note: 'Prepay online；Instant confirmation；该房型无会员标签；Platinum Tier Deal 仅部分高阶房型（如 Premier Room With Balcony 含双早 $724→$713/晚）；总价为页面显示 Total price: 1 room × 4 nights incl. taxes & fees' },
  suite: { room: 'Family Suite', perNightUSD: 1275, totalUSD: 6375, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 4', breakfast: 'Includes 1 great breakfast', note: '1-adult price caveat（该价显示为 1 位成人）；Prepay online；Instant confirmation；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  suiteNote: '套房价为 2026-10-03 实查（旧日期 12/06–12/11），本轮仅重查基础房',
  baselineUSD: 360, baselineCheckedAt: '2026-10-04T18:16:50Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Mandarin%20Oriental%20Singapore',
  source: 'Trip.com', checkedAt: '2026-10-04T17:14:00Z',
 },
  'Shangri-La Singapore 香格里拉': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Tower Wing Deluxe King Room', perNightUSD: 260, totalUSD: 1132, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'optional', memberDeal: '会员专属 10% off（原价 $291/晚 → 会员价 $260/晚）', note: '会员专属 Platinum Tier Deal 10% off（原价 $291/晚→会员价 $260/晚）；Early bird price；Instant confirmation；Prepay online；Earn $11.32 Trip Coins；总价为页面显示 Total price: 1 room × 4 nights incl. taxes & fees' },
  suite: null,
  suiteNote: '套房价为 2026-10-03 实查（旧日期 12/06–12/11），本轮仅重查基础房',
  baselineUSD: 219, baselineCheckedAt: '2026-10-04T18:16:50Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Shangri-La%20Singapore',
  source: 'Trip.com', checkedAt: '2026-10-04T17:14:00Z',
 },
  'The Fullerton Hotel Singapore 新加坡富丽敦酒店': {
  checkIn: '2026-12-06', checkOut: '2026-12-10', nights: 4,
  base: { room: 'Premier Courtyard Room', perNightUSD: 283, totalUSD: 1236, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'not stated', memberDeal: '会员专属 10% off（原价 $319/晚 → 会员价 $283/晚）', note: '会员专属 Platinum Tier Deal 10% off（原价 $319/晚→会员价 $283/晚）；Early bird price；Instant confirmation；Prepay online；Earn $61.80 Trip Coins；总价为页面显示 Total price: 1 room × 4 nights incl. taxes & fees' },
  suite: { room: 'Premier Collyer Suite', perNightUSD: 582, totalUSD: 2910, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online；Instant confirmation；Our last 2!；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  suiteNote: '套房价为 2026-10-03 实查（旧日期 12/06–12/11），本轮仅重查基础房',
  baselineUSD: 226, baselineCheckedAt: '2026-10-04T18:16:50Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=The%20Fullerton%20Hotel%20Singapore',
  source: 'Trip.com', checkedAt: '2026-10-04T17:14:00Z',
 },
  'Amanpuri': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Garden Pool Pavilion', perNightUSD: 3300, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 23:59, Nov 9', breakfast: 'Includes 2 great breakfasts', note: 'Cheapest bookable rate for 2 adults, prepay online, instant confirmation. Stock: \'Our last 3!\'. Page shows \'Total price: 1 room x 3 nights incl. taxes & fees\' without numeric total, so no total invented. Note: the search list page moments earlier showed this room at $3,653/night with total $11,751 incl. taxes & fees; prices fluctuated between loads - figure above is from the room-detail page.' },
  suite: null,
  baselineUSD: 1850, baselineCheckedAt: '2026-10-04T18:20:20Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Amanpuri%20Phuket',
  source: 'Trip.com', checkedAt: '2026-10-04T15:12:00Z',
 },
  'Trisara': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Ocean View Pool Villa', perNightUSD: 1921, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 23:59, Nov 25', breakfast: 'Includes 2 great breakfasts', note: 'Cheapest rate: prepay online US$1,921. Alternates: pay at hotel US$1,924 (free cancellation before 23:59, Nov 26); \'Show 4 more room rate (from US$2,044)\'. Stock: \'Our last 5!\'. \'Total price:1 room x 3 nights incl. taxes & fees\' shown without numeric total.' },
  suite: { room: 'Signature Ocean View Pool Suite', perNightUSD: 2721, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 23:59, Nov 25', breakfast: 'Includes 2 great breakfasts', note: 'Cheapest bookable suite (room name contains \'Suite\'), prepay online. Alternates: pay at hotel US$2,726 (cancel before 23:59, Nov 26); 4 more rates from US$2,868. Stock: \'Our last 2!\'. No numeric total displayed.' },
  baselineUSD: 1586, baselineCheckedAt: '2026-10-04T18:20:20Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Trisara%20Phuket',
  source: 'Trip.com', checkedAt: '2026-10-04T15:12:00Z',
 },
  'Banyan Tree Phuket': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Banyan Pool Villa', perNightUSD: 676, totalUSD: 2408, totalInclTax: true, cancel: 'Non-refundable (cheapest rate); free-cancellation variant US$845/night allows free cancellation before 23:59, Nov 26', breakfast: 'Includes 2 great breakfasts', note: 'Total US$2,408 = 1 room x 3 nights incl. taxes & fees, shown numerically on page. Prepay online, instant confirmation. Free-cancel variant totals US$3,010.' },
  suite: null,
  baselineUSD: 671, baselineCheckedAt: '2026-10-04T18:20:20Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Banyan%20Tree%20Phuket',
  source: 'Trip.com', checkedAt: '2026-10-04T15:12:00Z',
 },
  'JW Marriott Phuket Resort & Spa 普吉JW万豪': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Guest Room, 2 Double, Garden View, Balcony', perNightUSD: 363, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 23:59, Dec 7', breakfast: 'Great breakfast for US$31.58 (optional) - breakfast NOT included', note: 'Cheapest rate: pay at hotel / prepay online US$363. \'Show 6 more room rate (from US$398)\'. Page shows \'Total price:1 room x 3 nights incl. taxes & fees\' without numeric total.' },
  suite: { room: '1 Bedroom Suite, 1 King, Oceanfront, Private Pool', perNightUSD: 1292, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 23:59, Dec 7', breakfast: 'Great breakfast for US$31.58 (optional) - breakfast NOT included', note: 'Cheapest bookable suite (room name contains \'Suite\'), pay at hotel / prepay online. \'Show 6 more room rate (from US$1,328)\'. No numeric total displayed.' },
  baselineUSD: 372, baselineCheckedAt: '2026-10-04T18:20:20Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=JW%20Marriott%20Phuket%20Resort%20Spa',
  source: 'Trip.com', checkedAt: '2026-10-04T15:12:00Z',
 },
  'The Surin Phuket': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'One Bedroom Hillside Cottage', perNightUSD: 828, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Original price US$912, 8% off. Stock: \'Our last 1!\'. Prepay online, instant confirmation. \'Total price: 1 room x 3 nights incl. taxes & fees\' shown without numeric total.' },
  suite: { room: 'Beach Suite', perNightUSD: 1557, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Cheapest bookable suite (room name contains \'Suite\'). Original US$1,616, US$59 off. Stock: \'Our last 1!\'. No numeric total displayed.' },
  baselineUSD: 523, baselineCheckedAt: '2026-10-04T18:20:20Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=The%20Surin%20Phuket',
  source: 'Trip.com', checkedAt: '2026-10-04T15:12:00Z',
 },
  'Keemala': {
  checkIn: '2026-12-10', checkOut: '2026-12-13', nights: 3,
  base: { room: 'Clay Pool Cottage', perNightUSD: 693, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Limited Time Offer 45% off (original US$1,365). Stock: \'Our last 4!\'. Instant confirmation; cheapest rate is pay-at-hotel, prepay-online rate also US$693, plus 2 more rates from US$1,133. \'Total price: 1 room x 3 nights incl. taxes & fees\' shown without numeric total.' },
  suite: null,
  baselineUSD: 624, baselineCheckedAt: '2026-10-04T18:20:20Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Keemala%20Phuket',
  source: 'Trip.com', checkedAt: '2026-10-04T15:12:00Z',
 },
  '137 Pillars House': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Rajah Brooke Suite', perNightUSD: 607, totalUSD: 1301, totalInclTax: true, cancel: 'Free Cancellation before 1:00 AM, Nov 21', breakfast: 'Includes 2 great breakfasts', note: 'Our last 5!; Special Discount 8% off (orig $666/night on list page, $670 on detail page); Last booked 1 hr ago; Prepay online, instant confirmation. Total $1,301 shown on search results card (1 room x 2 nights incl. taxes & fees); detail page shows per-night price only.' },
  suite: { room: 'Rajah Brooke Suite', perNightUSD: 607, totalUSD: 1301, totalInclTax: true, cancel: 'Free Cancellation before 1:00 AM, Nov 21', breakfast: 'Includes 2 great breakfasts', note: 'All room types at this hotel are suites; cheapest suite is the same room as base.' },
  baselineUSD: 513, baselineCheckedAt: '2026-10-04T18:48:39Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=137%20Pillars%20House%20Chiang%20Mai',
  source: 'Trip.com', checkedAt: '2026-10-04T15:35:00Z',
 },
  'Four Seasons Resort Chiang Mai': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Upper Garden Pavilion King', perNightUSD: 1597, totalUSD: 3792, totalInclTax: true, cancel: 'Free Cancellation before 15:00, Dec 6', breakfast: 'Includes 2 great breakfasts', note: 'Our last 1!; Prepay online, instant confirmation; list card also flagged \'Only 1 left at this price\'. Total $3,792 shown on search results card (1 room x 2 nights incl. taxes & fees); detail page shows per-night price only.' },
  suite: null,
  baselineUSD: 1651, baselineCheckedAt: '2026-10-04T18:16:59Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Four%20Seasons%20Resort%20Chiang%20Mai',
  source: 'Trip.com', checkedAt: '2026-10-04T15:35:00Z',
 },
  'Raya Heritage': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Rin Suite with Terrace', perNightUSD: 446, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Nov 22', breakfast: 'Includes 2 great breakfasts', note: 'Cheapest rate: Pay at hotel, instant confirmation. 页面未显示该房价的总价 (detail page shows per-night price only). For reference, the search list card showed total $967 incl. taxes & fees for the $451/night rate (Special Discount 9% off, orig $497, prepay, \'Our last 1!\').' },
  suite: { room: 'Rin Suite with Terrace', perNightUSD: 446, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Nov 22', breakfast: 'Includes 2 great breakfasts', note: 'Cheapest bookable suite is the same room as base (all room types are suites).' },
  baselineUSD: 387, baselineCheckedAt: '2026-10-04T18:16:59Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Raya%20Heritage%20Chiang%20Mai',
  source: 'Trip.com', checkedAt: '2026-10-04T15:35:00Z',
 },
  'Anantara Chiang Mai': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Deluxe Room With Garden View', perNightUSD: 422, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Cheapest rate: Pay at hotel, instant confirmation. 页面未显示该房价的总价 (detail page shows per-night price only). For reference, the search list card showed total $974 incl. taxes & fees for the $454/night rate ($14 off, orig $468, non-refundable, prepay). List card also noted \'Last booked 4 hrs ago\'.' },
  suite: { room: 'Lanna Garden View Suite', perNightUSD: 673, totalUSD: null, totalInclTax: 'unknown', cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Cheapest suite rate: Prepay online, Early bird price, instant confirmation. 页面未显示总价. A higher suite rate ($698/night, orig $719) adds free cancellation before 12:00 PM, Nov 27 and \'Our last 4!\'.' },
  baselineUSD: 345, baselineCheckedAt: '2026-10-04T18:16:59Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Anantara%20Chiang%20Mai%20Resort',
  source: 'Trip.com', checkedAt: '2026-10-04T15:35:00Z',
 },
  'Shangri-La Chiang Mai 清迈香格里拉': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Deluxe King Room', perNightUSD: 180, totalUSD: 385, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 12', breakfast: 'Great breakfast for $21.45 (optional) - not included', note: 'Last booked 25 mins ago; Multi-night Discount 15% off (orig $213/night); Prepay online, instant confirmation. Total $385 shown on search results card (1 room x 2 nights incl. taxes & fees); detail page shows per-night price only.' },
  suite: { room: 'Executive King Suite', perNightUSD: 323, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 6:00 PM, Dec 12', breakfast: 'Includes 2 great breakfasts', note: 'Horizon Club Lounge Benefits (incl. breakfasts, afternoon tea, cocktail hour, all-day beverages); Prepay online, instant confirmation; Special Discount 15% off (orig $383). 页面未显示该房价的总价.' },
  baselineUSD: 133, baselineCheckedAt: '2026-10-04T18:16:59Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Shangri-La%20Chiang%20Mai',
  source: 'Trip.com', checkedAt: '2026-10-04T15:35:00Z',
 },
  'Chiang Mai Marriott Hotel 清迈万豪': {
  checkIn: '2026-12-13', checkOut: '2026-12-15', nights: 2,
  base: { room: 'Deluxe King - City View', perNightUSD: 197, totalUSD: 424, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 12', breakfast: 'Great breakfast for $22.79 (optional) - not included', note: 'Last booked 24 mins ago; Pay at hotel (prepay rate also $197/night), instant confirmation. Total $424 shown on search results card (1 room x 2 nights incl. taxes & fees); detail page shows per-night price only.' },
  suite: { room: 'Executive Suite, 1 Bedroom, 1 King, Club Lounge Access', perNightUSD: 328, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 12', breakfast: 'Great breakfast for $22.79 (optional) - not included', note: '818 ft², mountain view, unlimited M Club access (Club Lounge benefits); Instant confirmation, Pay at hotel. 页面未显示该房价的总价. Pricier suites: Diplomatic Suite from $1,672/night, Royal Suite (2 bedroom) from $2,163/night.' },
  baselineUSD: 179, baselineCheckedAt: '2026-10-04T18:16:59Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Chiang%20Mai%20Marriott%20Hotel',
  source: 'Trip.com', checkedAt: '2026-10-04T15:35:00Z',
 },
  'The Ritz-Carlton, Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe King', perNightUSD: 386, totalUSD: 1231, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 14', breakfast: 'Great breakfast for $33.32 (optional)', note: 'Pay at hotel; cheapest bookable option. Total $1,231 from search results page (1 room x 3 nights incl. taxes & fees).' },
  suite: null,
  baselineUSD: 348, baselineCheckedAt: '2026-10-04T18:21:54Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=The%20Ritz-Carlton%20Bangkok',
  source: 'Trip.com', checkedAt: '2026-10-04T15:25:00Z',
 },
  'The Peninsula Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe King Room', perNightUSD: 399, totalUSD: 1272, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online; Member deal 10% off (orig $446); \'Our last 4!\'. Total $1,272 from search results page (incl. taxes & fees). Free-cancellation option available at $416/night (breakfast optional $42.90).' },
  suite: null,
  baselineUSD: 341, baselineCheckedAt: '2026-10-04T18:21:54Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=The%20Peninsula%20Bangkok',
  source: 'Trip.com', checkedAt: '2026-10-04T15:25:00Z',
 },
  'Rosewood Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe King Room', perNightUSD: 351, totalUSD: 1119, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 8', breakfast: 'Great breakfast for $44.90 (optional)', note: 'Pay at hotel; Member deal 15% off (orig $416); \'Our last 1!\'. Total $1,119 from search results page and detail page (1 room x 3 nights incl. taxes & fees).' },
  suite: { room: 'Premier Suite', perNightUSD: 673, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 8', breakfast: 'Includes 1 great breakfast', note: 'Prepay online; Member deal 15% off (orig $800). Page shows \'Total price: 1 room x 3 nights incl. taxes & fees\' but total amount not displayed in accessible text.' },
  baselineUSD: 309, baselineCheckedAt: '2026-10-04T18:21:54Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Rosewood%20Bangkok',
  source: 'Trip.com', checkedAt: '2026-10-04T15:25:00Z',
 },
  '曼谷文华东方': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe Premier King Room', perNightUSD: 682, totalUSD: 2174, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 14', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online; \'USD 150 hotel credit per stay\'. Total $2,174 from search results page (incl. taxes & fees). Hotel is AVAILABLE (not sold out) for these dates - availability flip vs old dates.' },
  suite: null,
  baselineUSD: 460, baselineCheckedAt: '2026-10-04T18:21:54Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Mandarin%20Oriental%20Bangkok',
  source: 'Trip.com', checkedAt: '2026-10-04T15:25:00Z',
 },
  'Capella Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Riverfront King Room', perNightUSD: 905, totalUSD: 2886, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 10', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online; \'Our last 3!\'. Total $2,886 from search results page (1 room x 3 nights incl. taxes & fees).' },
  suite: { room: 'Courtyard Suite', perNightUSD: 1447, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 10', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online; \'Our last 1!\'. Page shows \'Total price: 1 room x 3 nights incl. taxes & fees\' but total amount not displayed in accessible text.' },
  baselineUSD: 893, baselineCheckedAt: '2026-10-04T18:21:54Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Capella%20Bangkok',
  source: 'Trip.com', checkedAt: '2026-10-04T15:25:00Z',
 },
  'Aman Nai Lert Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: null,
  baseNote: 'suite-only property（52 间全套房：Deluxe King Suite / Deluxe Twin Suite / Premier Suite / Corner Suite / Premier Corner Suite / Terrace Suite）',
  suite: { room: 'Premier Suite', perNightUSD: 1943, totalUSD: 6197, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online; cheapest bookable option is non-refundable. Free-cancellation option available at $2,159/night. Total $6,197 from search results page (incl. taxes & fees).' },
  baselineUSD: 1485, baselineCheckedAt: '2026-10-04T18:21:54Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Aman%20Nai%20Lert%20Bangkok',
  source: 'Trip.com', checkedAt: '2026-10-04T15:25:00Z',
 },
  'Four Seasons Bangkok': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Deluxe Palm Court Room - Twin', perNightUSD: 693, totalUSD: 2210, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 14', breakfast: 'Great breakfast for $47.34 (optional)', note: 'Prepay online; \'Our last 1!\' / \'Only 1 left at this price\'. Total $2,210 from search results page (1 room x 3 nights incl. taxes & fees). Confirmed Chao Phraya River property (hotelId 48004058).' },
  suite: null,
  baselineUSD: 564, baselineCheckedAt: '2026-10-04T18:21:54Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Four%20Seasons%20Hotel%20Bangkok',
  source: 'Trip.com', checkedAt: '2026-10-04T15:25:00Z',
 },
  'The Siam': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: null,
  baseNote: 'suite-only property（套房/泳池别墅：Siam Suite / Garden View Suite / Premier Garden View Suite / River View Suite / Premier River View Suite / Courtyard Pool Villa）',
  suite: { room: 'Siam Suite', perNightUSD: 692, totalUSD: 2209, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online; Special Discount 7% off (orig $745); Free minibar; Boat transfer service. Total $2,209 from search results page (incl. taxes & fees).' },
  baselineUSD: 598, baselineCheckedAt: '2026-10-04T18:21:54Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=The%20Siam%20Bangkok',
  source: 'Trip.com', checkedAt: '2026-10-04T15:25:00Z',
 },
  'The Athenee Hotel, a Luxury Collection Hotel, Bangkok 曼谷雅典娜豪华精选酒店': {
  checkIn: '2026-12-15', checkOut: '2026-12-18', nights: 3,
  base: { room: 'Athenee King Room Non smoking', perNightUSD: 234, totalUSD: 747, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 14', breakfast: 'Great breakfast for $29.80 (optional)', note: 'Pay at hotel (cheapest); prepay online also $234. Total $747 from search results page (1 room x 3 nights incl. taxes & fees).' },
  suite: { room: 'Athenee Suite Non smoking', perNightUSD: 443, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 14', breakfast: 'Includes 1 great breakfast', note: 'Prepay online. Page shows \'Total price: 1 room x 3 nights incl. taxes & fees\' but total amount not displayed in accessible text.' },
  baselineUSD: 211, baselineCheckedAt: '2026-10-04T18:21:54Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=The%20Athenee%20Hotel%20Bangkok',
  source: 'Trip.com', checkedAt: '2026-10-04T15:25:00Z',
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
  base: null, suite: null,
  unavailable: 'Trip.com 实时价待查；当前仅有 Google Hotels baseline',
  source: 'Google Hotels', checkedAt: '2026-10-04T18:39:25Z',
  baselineUSD: 484, baselineCheckedAt: '2026-10-04T18:39:25Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Lotte%20Hotel%20Seoul',
 },
  '威斯汀朝鲜首尔 The Westin Josun Seoul': {
  checkIn: '2026-12-31', checkOut: '2027-01-01', nights: 1,
  base: null, suite: null,
  unavailable: 'Trip.com 实时价待查；当前仅有 Google Hotels baseline',
  source: 'Google Hotels', checkedAt: '2026-10-04T18:39:25Z',
  baselineUSD: 558, baselineCheckedAt: '2026-10-04T18:39:25Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=The%20Westin%20Josun%20Seoul',
 },
  '首尔四季酒店 Four Seasons Hotel Seoul': {
  checkIn: '2026-12-31', checkOut: '2027-01-01', nights: 1,
  base: null, suite: null,
  unavailable: 'Trip.com 实时价待查；当前仅有 Google Hotels baseline',
  source: 'Google Hotels', checkedAt: '2026-10-04T18:39:25Z',
  baselineUSD: 886, baselineCheckedAt: '2026-10-04T18:39:25Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Four%20Seasons%20Hotel%20Seoul',
 },
  '首尔江南朝鲜宫殿豪华精选酒店 Josun Palace, a Luxury Collection Hotel': {
  checkIn: '2026-12-31', checkOut: '2027-01-01', nights: 1,
  base: null, suite: null,
  unavailable: 'Trip.com 实时价待查；当前仅有 Google Hotels baseline',
  source: 'Google Hotels', checkedAt: '2026-10-04T18:39:25Z',
  baselineUSD: 707, baselineCheckedAt: '2026-10-04T18:39:25Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Josun%20Palace%20Seoul%20Gangnam',
 },
  '首尔江南安达仕酒店 Andaz Seoul Gangnam': {
  checkIn: '2026-12-31', checkOut: '2027-01-01', nights: 1,
  base: null, suite: null,
  unavailable: 'Trip.com 实时价待查；当前仅有 Google Hotels baseline',
  source: 'Google Hotels', checkedAt: '2026-10-04T18:39:25Z',
  baselineUSD: 879, baselineCheckedAt: '2026-10-04T18:39:25Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Andaz%20Seoul%20Gangnam',
 },
  '首尔新罗酒店 The Shilla Seoul': {
  checkIn: '2026-12-31', checkOut: '2027-01-01', nights: 1,
  base: null, suite: null,
  unavailable: 'Trip.com 实时价待查；当前仅有 Google Hotels baseline',
  source: 'Google Hotels', checkedAt: '2026-10-04T18:39:25Z',
  baselineUSD: 542, baselineCheckedAt: '2026-10-04T18:39:25Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=The%20Shilla%20Seoul',
 },
  '首尔Signiel Signiel Seoul': {
  checkIn: '2026-12-31', checkOut: '2027-01-01', nights: 1,
  base: null, suite: null,
  unavailable: 'Trip.com 实时价待查；当前仅有 Google Hotels baseline',
  source: 'Google Hotels', checkedAt: '2026-10-04T18:39:25Z',
  baselineUSD: 887, baselineCheckedAt: '2026-10-04T18:39:25Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Signiel%20Seoul',
 },
  '首尔梨泰院蒙德里安 Mondrian Seoul Itaewon': {
  checkIn: '2026-12-31', checkOut: '2027-01-01', nights: 1,
  base: null, suite: null,
  unavailable: 'Trip.com 实时价待查；当前仅有 Google Hotels baseline',
  source: 'Google Hotels', checkedAt: '2026-10-04T18:39:25Z',
  baselineUSD: 349, baselineCheckedAt: '2026-10-04T18:39:25Z',
  baselineUrl: 'https://www.google.com/travel/hotels?q=Mondrian%20Seoul%20Itaewon',
 },
  '首尔弘大RYSE RYSE, Autograph Collection': {
  checkIn: '2026-12-31', checkOut: '2027-01-01', nights: 1,
  base: null, suite: null,
  unavailable: 'Trip.com 实时价待查；当前仅有 Google Hotels baseline',
  source: 'Google Hotels', checkedAt: '2026-10-04T18:39:25Z',
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
