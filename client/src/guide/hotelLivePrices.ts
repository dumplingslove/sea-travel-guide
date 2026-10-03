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
*/

export interface LiveRoomRate {
  /** 房型名称（OTA 原文） */
  room: string;
  /** 每晚 USD */
  perNightUSD: number;
  /** 整段住宿 USD 总价 */
  totalUSD: number;
  /** 总价是否含税费 */
  totalInclTax: boolean;
  /** 取消政策原文摘要 */
  cancel: string;
  /** 早餐说明 */
  breakfast: string;
  /** 备注（如仅剩几间、单人价等） */
  note?: string;
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
}

export const hotelLivePrices: Record<string, LiveHotelPrice> = {
  'Capella Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Premier Twin Room With Garden View', perNightUSD: 1174, totalUSD: 5870, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 3', breakfast: 'optional (Great breakfast for $63.77)', note: 'Pay at hotel；Instant confirmation；Last booked 2 hrs ago；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  suite: { room: 'Sentosa Suite', perNightUSD: 1565, totalUSD: 7825, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 3', breakfast: 'optional (Great breakfast for $63.77)', note: 'Pay at hotel；Instant confirmation；Our last 5!；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'Raffles Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: null,
  suite: null,
  unavailable: '该日期整店售罄（No availability for these dates；同店 12/16–12/19 另有房，不影响本行程日期）',
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'Marina Bay Sands': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Sands Premier King', perNightUSD: 697, totalUSD: 3485, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online；Instant confirmation；Exclusive price for multi-night stays · Early bird price；Last booked 3 hrs ago；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  suite: { room: 'Sands Bay Suite King Gardens By The Bay View', perNightUSD: 1316, totalUSD: 6580, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online；Instant confirmation；Early bird price；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'The Ritz-Carlton, Millenia Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Deluxe Kallang King Room', perNightUSD: 413, totalUSD: 2065, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Oct 5', breakfast: 'optional (Great breakfast for $60.95)', note: 'Prepay online；Instant confirmation；Best price with free cancellation；We Price Match；Last booked 12 mins ago；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  suite: { room: 'Club Deluxe King Suite, Club Lounge Access, High Floor', perNightUSD: 843, totalUSD: 4215, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Oct 5', breakfast: 'Includes 1 great breakfast', note: '1-adult price caveat（该价显示为 1 位成人，"We recommend 2 rooms for your group"）；Prepay online；Instant confirmation；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'Mandarin Oriental Singapore 文华东方': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Sea View Room King', perNightUSD: 488, totalUSD: 2440, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 4', breakfast: 'optional (Great breakfast for $33.76)', note: 'Prepay online；Instant confirmation；Best price with free cancellation；We Price Match；Last booked 2 hrs ago；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  suite: { room: 'Family Suite', perNightUSD: 1275, totalUSD: 6375, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 4', breakfast: 'Includes 1 great breakfast', note: '1-adult price caveat（该价显示为 1 位成人）；Prepay online；Instant confirmation；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'Shangri-La Singapore 香格里拉': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Tower Wing Deluxe King Room', perNightUSD: 286, totalUSD: 1430, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'optional (Great breakfast for $40.36)', note: 'Prepay online；Instant confirmation；Early bird price；Today\'s best price!；First booking offer；Last booked 4 mins ago；同房型另有免费取消价 $357/晚（Pay at hotel）；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  suite: null,
  suiteNote: '页面全部 11 个房型均为 Deluxe / Horizon Club / Valley Wing 命名，无任何房型名称含 Suite',
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'The Fullerton Hotel Singapore 新加坡富丽敦酒店': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Premier Courtyard Room', perNightUSD: 315, totalUSD: 1575, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'not stated（$315 档价未显示早餐说明）', note: 'Prepay online；Instant confirmation；Early bird price；Today\'s best price!；First booking offer；Last booked 12 hrs ago；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  suite: { room: 'Premier Collyer Suite', perNightUSD: 582, totalUSD: 2910, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online；Instant confirmation；Our last 2!；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'Amanpuri': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Garden Pool Pavilion', perNightUSD: 3653, totalUSD: 11751, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 10', breakfast: 'Includes 2 great breakfasts', note: 'Our last 2!（"Only 2 left at this price"）；Prepay online；Instant confirmation；2 adults' },
  suite: null,
  suiteNote: '该店房型为 Garden/Partial Ocean/Ocean Pool Pavilion 及别墅，无 Suite 命名房型',
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'Trisara': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Ocean View Pool Villa', perNightUSD: 1921, totalUSD: 5763, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 27', breakfast: 'Includes 2 great breakfasts', note: 'Pay at hotel；Instant confirmation；Last booked 4 hrs ago（酒店级）；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  suite: { room: 'Signature Ocean View Pool Suite', perNightUSD: 2721, totalUSD: 8163, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 27', breakfast: 'Includes 2 great breakfasts', note: 'Pay at hotel；Instant confirmation；2 adults；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'Banyan Tree Phuket': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Banyan Pool Villa', perNightUSD: 763, totalUSD: 2455, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online；Instant confirmation；Last booked 4 mins ago（酒店级）；同房型免费取消价 $954/晚' },
  suite: null,
  suiteNote: '全部房型为 Pool Villa 命名（Banyan / Serenity / Signature / Grand Lagoon / Two Bedroom），无 Suite 命名房型',
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'JW Marriott Phuket Resort & Spa 普吉JW万豪': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Guest Room,2 Double,Garden View,Balcony', perNightUSD: 412, totalUSD: 1326, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 8', breakfast: 'optional (Great breakfast for $31.58)', note: 'Pay at hotel；Instant confirmation；Last booked 7 hrs ago（酒店级）' },
  suite: { room: '1 Bedroom Suite, 1 King, Oceanfront, Private Pool', perNightUSD: 1442, totalUSD: 4326, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 8', breakfast: 'optional (Great breakfast for $31.58)', note: 'Pay at hotel；Instant confirmation；2 adults；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'The Surin Phuket': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'One Bedroom Superior Cottage', perNightUSD: 640, totalUSD: 2059, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 11', breakfast: 'Includes 2 great breakfasts', note: '10% off（原价 $717）；Our last 2!；Prepay online；Instant confirmation；2 adults；Last booked 9 hrs ago（酒店级）' },
  suite: { room: 'Beach Suite', perNightUSD: 1281, totalUSD: 3843, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 11', breakfast: 'Includes 2 great breakfasts', note: '10% off（原价 $1,435）；Prepay online；Instant confirmation；2 adults；总价为每晚×晚数机械推算，非页面原值（页面仅标注 incl. taxes & fees 标签、未显示数字总价）' },
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'Keemala': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Clay Pool Cottage', perNightUSD: 767, totalUSD: 2466, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Limited Time Offer 45% off（原价 $1,439）；Our last 3!（"Only 3 left at this price"）；Pay at hotel；Instant confirmation；2 adults' },
  suite: null,
  suiteNote: '该日期仅 3 种房型（Clay Pool Cottage / Tent Pool Villa / Tree Pool House），无 Suite 命名房型',
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  '137 Pillars House': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: null,
  baseNote: 'suite-only property（30 间套房围绕 1880 年代柚木宅邸），无基础房型类别',
  suite: { room: 'Rajah Brooke Suite', perNightUSD: 602, totalUSD: 1290, totalInclTax: true, cancel: 'Free Cancellation before 1:00 AM, Nov 22', breakfast: 'Includes 2 great breakfasts', note: 'Our last 5!；Prepay online；Instant confirmation；9% off Special Discount（原价 $665）' },
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'Four Seasons Resort Chiang Mai': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Upper Garden Pavilion King', perNightUSD: 1781, totalUSD: 3820, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 1 great breakfast', note: 'Our last 1!；Prepay online；Instant confirmation；1-adult price caveat（房型最多住 1 成人，页面提示需加订房间）；Last booked 7 hrs ago（酒店级）' },
  suite: null,
  suiteNote: '全列表无 Suite 命名房型（Upper Garden Pavilion / Rice Terrace Pavilion / Upper Rice Terrace Pavilion / Pool Villa）',
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'Raya Heritage': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: null,
  baseNote: 'suite-only property（全套房设计酒店），无基础房型类别',
  suite: { room: 'Rin Suite with Terrace', perNightUSD: 446, totalUSD: 1059, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Nov 23', breakfast: 'Includes 2 great breakfasts', note: 'Our last 1!；Pay at hotel；Instant confirmation；sleeps 2' },
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'Anantara Chiang Mai': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Deluxe Room With Garden View', perNightUSD: 440, totalUSD: 1045, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Pay at hotel；Instant confirmation；2 adults；Earn $10.45 Trip Coins' },
  suite: { room: 'Lanna Garden View Suite', perNightUSD: 674, totalUSD: 1446, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online；Instant confirmation；Early bird price；Earn $72.32 Trip Coins' },
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'Shangri-La Chiang Mai 清迈香格里拉': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Deluxe King Room', perNightUSD: 180, totalUSD: 385, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 13', breakfast: 'optional ($21.45/adult)', note: 'Prepay online；Instant confirmation；Multi-night Discount 15% off；Last booked 11 mins ago（酒店级）' },
  suite: null,
  suiteNote: '展开全部房型后无 Suite 命名房型（仅 Deluxe / Premier King/Twin）',
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'Chiang Mai Marriott Hotel 清迈万豪': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Deluxe King - City View', perNightUSD: 197, totalUSD: 424, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 13', breakfast: 'optional ($22.79)', note: 'Pay at hotel；Instant confirmation；Best price with free cancellation；Last booked 5 hrs ago（酒店级）' },
  suite: { room: 'Executive Suite, 1 Bedroom, 1 King, Club Lounge Access', perNightUSD: 328, totalUSD: 707, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 13', breakfast: 'optional ($22.79)', note: 'Pay at hotel；Instant confirmation；Unlimited M Club access（行政酒廊）' },
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'The Ritz-Carlton, Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe King', perNightUSD: 396, totalUSD: 1263, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 15', breakfast: 'optional (Great breakfast for $33.32)', note: 'Pay at hotel；Instant confirmation；Last booked 5 hrs ago（酒店级）' },
  suite: null,
  suiteNote: '页面无 Suite 命名房型（仅 Deluxe/Club 房型）',
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'The Peninsula Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe King Room', perNightUSD: 424, totalUSD: 1352.22, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Member deal 10% off（原价 $474）；Prepay online；Instant confirmation；Our last 4!；Last booked 1 hr ago（酒店级）' },
  suite: { room: 'Deluxe King Suite', perNightUSD: 588, totalUSD: 1875.42, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Member deal 10% off（原价 $657）；Prepay online；Instant confirmation；Our last 4!' },
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'Rosewood Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe King Room', perNightUSD: 373, totalUSD: 1190.05, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 9', breakfast: 'optional (Great breakfast for $44.90)', note: 'Member deal 15% off（原价 $443）；Pay at hotel；Instant confirmation；Our last 1!；Last booked 1 hr ago（酒店级）' },
  suite: { room: 'Premier Suite', perNightUSD: 697, totalUSD: 2223.61, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 9', breakfast: 'Includes 1 great breakfast', note: 'Member deal 15% off（原价 $828）；Prepay online；Instant confirmation' },
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  '曼谷文华东方': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: null,
  suite: null,
  unavailable: '该日期整店不接受预订（"This hotel is not currently accepting bookings"）',
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'Capella Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Riverfront Premier King Room', perNightUSD: 971, totalUSD: 3096.88, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 11', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online；Instant confirmation；Last booked 10 hrs ago（酒店级）；Earn $154.85 Trip Coins' },
  suite: { room: 'Courtyard Suite', perNightUSD: 1447, totalUSD: 4616, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 11', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online；Instant confirmation；Our last 1!；Earn $230.78 Trip Coins' },
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'Aman Nai Lert Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: null,
  baseNote: 'suite-only property（52 间全套房：Deluxe King Suite / Deluxe Twin Suite / Premier Suite / Corner Suite / Premier Corner Suite / Terrace Suite）',
  suite: { room: 'Deluxe King Suite', perNightUSD: 1714, totalUSD: 5466, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online；Instant confirmation；Our last 5!；Last booked 19 mins ago（酒店级）；Earn $81.99 Trip Coins' },
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'Four Seasons Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe Room - King', perNightUSD: 737, totalUSD: 2349.85, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 15', breakfast: 'optional (Great breakfast for $47.34)', note: 'Prepay online；Instant confirmation；Our last 1!；Last booked 46 mins ago（酒店级）；Earn 1,175 Trip Coins（≈$11.75）' },
  suite: null,
  suiteNote: '该日期页面无 Suite 命名房型（仅 Deluxe/Premier 房型）',
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'The Siam': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: null,
  baseNote: 'suite-only property（套房/泳池别墅：Siam Suite / Garden View Suite / Premier Garden View Suite / River View Suite / Premier River View Suite / Courtyard Pool Villa）',
  suite: { room: 'Siam Suite', perNightUSD: 705, totalUSD: 2248.87, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Special Discount 7% off（原价 $759）；Prepay online；Instant confirmation；Free minibar（1）；Boat transfer service to Central Sathorn Pier（2/day）；Siam Suite 标注 "No windows"；Earn 1,125 Trip Coins（≈$11.25）' },
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
  'The Athenee Hotel, a Luxury Collection Hotel, Bangkok 曼谷雅典娜豪华精选酒店': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Athenee King Room Non smoking', perNightUSD: 233, totalUSD: 743.43, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 15', breakfast: 'optional (Great breakfast for $29.80)', note: 'Pay at hotel；Instant confirmation；Last booked 4 hrs ago（酒店级）；Earn 744 Trip Coins（≈$7.44）' },
  suite: { room: 'Athenee Suite Non smoking', perNightUSD: 442, totalUSD: 1411.02, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 15', breakfast: 'Includes 1 great breakfast', note: 'Prepay online；Instant confirmation；1-adult price caveat（该套房费率标注为 "1 adult"，而搜索条件为 2 成人）；Earn 1,412 Trip Coins（≈$14.12）' },
  source: 'Trip.com', checkedAt: '2026-10-03 ~16:23–16:53 UTC',
 },
};

export function getLiveHotelPrice(name: string): LiveHotelPrice | undefined {
 return hotelLivePrices[name];
}

/** 当前价格数据覆盖的行程住宿日期快照（行程变化检测用） */
export const livePriceStayDates: Record<string, { checkIn: string; checkOut: string }> = Object.fromEntries(
 Object.entries(hotelLivePrices).map(([name, p]) => [name, { checkIn: p.checkIn, checkOut: p.checkOut }]),
);
