/** 按行程实际住宿日期实查的酒店价格（USD）。
 * 数据来源：Trip.com 房型级实时价格，2 成人 1 间。
 * 查询时间：2026-09-24 20:15–21:35 PDT（21 家首批）；2026-09-26 07:43–08:26 PDT（30 家补齐，全站 51 家覆盖）；2026-09-27 06:59 PDT（新加坡 4 家按新行程日期 12/12–12/17 重查）；2026-09-27 08:51 PDT（普吉 6 家同日期 12/17–12/20 重查）；2026-09-27 08:54 PDT（清迈 6 家按新行程日期 12/23–12/25 重查）；2026-09-27 08:57 PDT（新加坡 Raffles/Ritz-Carlton/文华东方按 12/12–12/17 重查＋富丽敦套房补齐）；2026-09-27 09:04 PDT（曼谷 9 家按新行程日期 12/20–12/23 重查；2026-09-28 22:08–22:23 UTC（28 家行程酒店按新行程日期全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、曼谷 12/14–12/17、清迈 12/17–12/19；Raffles 新加坡该日期整店售罄）。
 * 2026-09-29 13:37–13:48 UTC（28 家行程酒店全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、曼谷 12/14–12/17、清迈 12/17–12/19；Raffles 新加坡该日期仍整店售罄）。
 * 价格为动态数据：行程日期变化或定期刷新时由 hotel-price-watch 任务重查并更新本文件。
 * 2026-09-30 site-improve：曼谷 9 家（查 12/14–12/17）与清迈 6 家（查 12/17–12/19）为旧行程顺序（曼谷→清迈）日期，用户当前行程为清迈 12/14–12/16、曼谷 12/16–12/19，已标 dateMismatch；待 hotel-price-watch 按新行程重查后清除该标记。
 * 键必须与 data.ts 酒店名逐字一致（含中文后缀）。
 * 2026-10-01 13:41–16:25 UTC（28 家行程酒店全量重查：新加坡/普吉沿用今早 06:41–06:50 PDT 回执（日期无误：新加坡 12/06–12/11、普吉 12/11–12/14）；曼谷按新行程日期 12/16–12/19、清迈按新行程日期 12/14–12/16 重查；Raffles 新加坡仍整店售罄；曼谷文华东方在新日期整店售罄（This hotel is not currently accepting bookings）；Bangkok/Chiang Mai 的 dateMismatch 标记已清除）。
 * 2026-10-02 13:25–13:45 UTC（28 家行程酒店全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、清迈 12/14–12/16、曼谷 12/16–12/19；Raffles 新加坡与曼谷文华东方该日期整店售罄；曼谷丽思卡尔顿本轮无 Suite 命名房型）。
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
  'The Athenee Hotel, a Luxury Collection Hotel, Bangkok 曼谷雅典娜豪华精选酒店': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Athenee King Room Non smoking', perNightUSD: 234, totalUSD: 745, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 15', breakfast: 'not included (optional $29.87)', note: '2 成人；到店支付；即时确认；Best price with free cancellation；Last booked 4 hrs ago' },
  suite: { room: 'Athenee Suite Non smoking', perNightUSD: 432, totalUSD: 1378, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 15', breakfast: 'Includes 2 great breakfasts', note: '2 成人；到店支付；即时确认；明细房费 $1170.61+服务费 $125.26+VAT $81.94' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:14–13:40 UTC',
 },
  'Anantara Chiang Mai': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Deluxe Room With Garden View', perNightUSD: 434, totalUSD: 868, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Pay at hotel；Instant confirmation；2 adults；详情页未显示该费率数字总价（仅标注 incl. taxes & fees）；参考列表页 $469/晚预付费率 2 晚含税总价 $1,007；页面未展示该费率数字总价，总价为每晚×晚数机械推算，非页面原值' },
  suite: { room: 'Lanna Garden View Suite', perNightUSD: 676, totalUSD: 1352, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Prepay online；Early bird price；Instant confirmation；2 adults；详情页未显示该费率数字总价；页面未展示该费率数字总价，总价为每晚×晚数机械推算，非页面原值' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:33 UTC',
 },
  'Shangri-La Chiang Mai 清迈香格里拉': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Deluxe King Room', perNightUSD: 184, totalUSD: 395, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 13', breakfast: 'optional (+$21.45)', note: 'Prepay online；Instant confirmation；2 adults；Multi-night Discount；13% off（原价 $214）' },
  suite: { room: 'Executive King Suite', perNightUSD: 331, totalUSD: 662, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 13', breakfast: 'Includes 2 great breakfasts (incl. Horizon Club lounge)', note: 'Prepay online；Instant confirmation；2 adults；13% off（原价 $384）；全部10种房型中仅此一种名称含 Suite；详情页未显示该费率数字总价；页面未展示该费率数字总价，总价为每晚×晚数机械推算，非页面原值' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:33 UTC',
 },
  'Chiang Mai Marriott Hotel 清迈万豪': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Deluxe King - City View', perNightUSD: 197, totalUSD: 425, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 13', breakfast: 'optional (+$22.85)', note: 'Pay at hotel；Instant confirmation；2 adults' },
  suite: { room: 'Executive Suite, 1 Bedroom, 1 King, Club Lounge Access', perNightUSD: 329, totalUSD: 658, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 13', breakfast: 'optional (+$22.85)', note: 'Pay at hotel/Prepay online；Instant confirmation；2 adults；Unlimited M Club access；全部10种房型中最便宜的 Suite 命名房型；详情页未显示该费率数字总价；页面未展示该费率数字总价，总价为每晚×晚数机械推算，非页面原值' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:33 UTC',
 },
  'JW Marriott Phuket Resort & Spa 普吉JW万豪': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Guest Room,2 Double,Garden View,Balcony', perNightUSD: 413, totalUSD: 1329, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 8', breakfast: 'not included (optional $31.58/person)', note: 'Last booked 3 hrs ago；2 成人' },
  suite: { room: '1 Bedroom Suite, 1 King, Oceanfront, Private Pool', perNightUSD: 1445, totalUSD: 4335, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 8', breakfast: 'not included (optional $31.58/person)', note: '展开 Show 6 Remaining Room Types 后发现；页面未展示该费率全程数字总价；总价按每晚×3晚数机械推算，非页面原值' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:25 UTC',
 },
  'The Surin Phuket': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'One Bedroom Hillside Cottage', perNightUSD: 629, totalUSD: 2022, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 11', breakfast: 'Includes 2 great breakfasts', note: 'Our last 1!；Special Discount 10% off（原价 $705）；在线预付；即时确认' },
  suite: { room: 'Beach Suite', perNightUSD: 1284, totalUSD: 3852, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 11', breakfast: 'Includes 2 great breakfasts', note: 'Our last 1!；10% off（原价 $1,439）；页面未展示该费率全程数字总价；总价按每晚×3晚数机械推算，非页面原值' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:25 UTC',
 },
  'Keemala': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Clay Pool Cottage', perNightUSD: 768, totalUSD: 2472, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Our last 3!；Limited Time Offer 45% off（原价 $1,443）；全房型无 Suite 命名' },
  suite: null,
  suiteNote: 'no suite-named room type for these dates',
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:25 UTC',
 },
'Penang Marriott Hotel 槟城万豪': {
  checkIn: '2026-12-20', checkOut: '2026-12-22', nights: 2,
  base: { room: 'King Room with Sofa Bed City View', perNightUSD: 210, totalUSD: 459, totalInclTax: true, cancel: '12-19 23:59 前免费取消', breakfast: '不含早（+ $19.15/人可选）' },
  suite: { room: 'One-Bedroom King Suite with Sofa Bed City View', perNightUSD: 357, totalUSD: 777, totalInclTax: true, cancel: '12-19 23:59 前免费取消', breakfast: '不含早（+ $19.15/人可选）' },
  source: 'Trip.com', checkedAt: '2026-09-25 03:38 UTC',
 },
'Seven Terraces': {
  checkIn: '2026-12-20', checkOut: '2026-12-22', nights: 2,
  base: { room: 'Terrace Duplex Suite（入门房型本身即套房）', perNightUSD: 173, totalUSD: 385, totalInclTax: true, cancel: '12-13 18:00 前免费取消', breakfast: '含双早' },
  suite: { room: 'Terrace Duplex Suite（无更高阶套房；另有公寓房型 Stewart $282 / Argus $348）', perNightUSD: 173, totalUSD: 385, totalInclTax: true, cancel: '12-13 18:00 前免费取消', breakfast: '含双早' },
  source: 'Trip.com', checkedAt: '2026-09-25 03:43 UTC',
 },
'The Edison George Town': {
  checkIn: '2026-12-20', checkOut: '2026-12-22', nights: 2,
  base: { room: 'Deluxe Room', perNightUSD: 134, totalUSD: 323, totalInclTax: true, cancel: '不可退', breakfast: '含双早', note: '节日 7 折，原价 $203/晚' },
  suite: null, suiteNote: '该日期未找到可订套房',
  source: 'Trip.com', checkedAt: '2026-09-25 03:47 UTC',
 },
'EQ': {
  checkIn: '2026-12-22', checkOut: '2026-12-24', nights: 2,
  base: { room: 'Deluxe Twin / Deluxe King', perNightUSD: 206, totalUSD: 450, totalInclTax: true, cancel: '12-20 12:00 前免费取消', breakfast: '不含早（含早价 $240/晚）' },
  suite: { room: 'Studio Suite', perNightUSD: 464, totalUSD: 1006, totalInclTax: true, cancel: '12-20 12:00 前免费取消', breakfast: '含 1 客早餐', note: '页面显示为单人入住价' },
  source: 'Trip.com', checkedAt: '2026-09-25 03:30 UTC',
 },
'Four Seasons Kuala Lumpur': {
  checkIn: '2026-12-22', checkOut: '2026-12-24', nights: 2,
  base: { room: 'King Room City View', perNightUSD: 362, totalUSD: 786, totalInclTax: true, cancel: '不可退；免费取消替代价 Park View $491/晚（含 $100 酒店消费额）', breakfast: '不含早', note: '仅剩 1 间' },
  suite: { room: 'Park-View Suite（行政酒廊）', perNightUSD: 736, totalUSD: 1594, totalInclTax: true, cancel: '不可退', breakfast: '不含早', note: '仅剩 1 间' },
  source: 'Trip.com', checkedAt: '2026-09-25 03:40 UTC',
 },
'Mai House Saigon': {
  checkIn: '2026-12-24', checkOut: '2026-12-26', nights: 2,
  base: { room: 'Deluxe Room', perNightUSD: 207, totalUSD: 469, totalInclTax: true, cancel: '不可退', breakfast: '不含早', note: '仅剩 2 间' },
  suite: { room: 'Junior Suite', perNightUSD: 312, totalUSD: 707, totalInclTax: true, cancel: '不可退；免费取消价 $361/晚（2 晚 $819）', breakfast: '含双早', note: '仅剩 4 间' },
  source: 'Trip.com', checkedAt: '2026-09-25 03:48 UTC',
 },
'Hôtel des Arts Saigon': {
  checkIn: '2026-12-24', checkOut: '2026-12-26', nights: 2,
  base: { room: 'Deluxe Room 1 King City View', perNightUSD: 303, totalUSD: 686, totalInclTax: true, cancel: '不可退；免费取消价 $321/晚', breakfast: '含双早' },
  suite: { room: 'Executive Studio Suite（空中酒廊）', perNightUSD: 515, totalUSD: 1169, totalInclTax: true, cancel: '不可退', breakfast: '含 1 客早餐', note: '单人入住价口径' },
  source: 'Trip.com', checkedAt: '2026-09-25 03:55 UTC',
 },
'La Festa Phu Quoc, Curio Collection by Hilton': {
  checkIn: '2026-12-26', checkOut: '2026-12-29', nights: 3,
  base: null, baseNote: '该日期基础房已售罄，仅剩套房可订',
  suite: { room: 'King Amalfi Duplex Ocean Suite', perNightUSD: 761, totalUSD: 2587, totalInclTax: true, cancel: '不可退（希尔顿提前购）', breakfast: '含双早', note: '仅剩 1 间；另有 Sorrento $840/晚、Dolce Vita $1,244/晚' },
  source: 'Trip.com', checkedAt: '2026-09-25 04:00 UTC',
 },
'InterContinental Phu Quoc 洲际': {
  checkIn: '2026-12-26', checkOut: '2026-12-29', nights: 3,
  base: { room: 'Classic King Room', perNightUSD: 550, totalUSD: 1871, totalInclTax: true, cancel: '11-28 16:00 前免费取消', breakfast: '含双早' },
  suite: null, suiteNote: '该日期未找到可订套房（在售房型均未明确标注套房）',
  source: 'Trip.com', checkedAt: '2026-09-25 04:10 UTC',
 },
'Fusion Resort Phu Quoc': {
  checkIn: '2026-12-26', checkOut: '2026-12-29', nights: 3,
  base: null, suite: null,
  unavailable: '多渠道均未查到该日期可订价格（Trip.com 无此店；Google Hotels 显示需电话/官网询价；Kayak 显示所选日期无房；官网订房组件无富国岛店）',
  source: 'Trip.com / Google Hotels / Kayak / 官网', checkedAt: '2026-09-25 04:35 UTC',
 },
  'Mandarin Oriental Singapore 文华东方': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Sea View Room King', perNightUSD: 488, totalUSD: 2661, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 4', breakfast: 'not included (optional $33.79)', note: '2 成人；预付；即时确认；Best price with free cancellation；Last booked 36 mins ago' },
  suite: { room: 'Family Suite', perNightUSD: 1276, totalUSD: 6953, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 4', breakfast: 'included (1 great breakfast, 1-adult pricing)', note: '页面明确为 1-adult 定价（We recommend 2 rooms for your group）；该日期无 2 成人套房价展示' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:40 UTC',
 },
  'Shangri-La Singapore 香格里拉': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Tower Wing Deluxe King Room', perNightUSD: 286, totalUSD: 1558, totalInclTax: true, cancel: 'Non-refundable（另有 $357/晚 12/5 前免费取消可选）', breakfast: 'not included (optional $40.40)', note: '2 成人；预付；即时确认；早鸟价 Today\'s best price!；Last booked 41 mins ago' },
  suite: { room: 'Horizon Club Junior Suite King', perNightUSD: 510, totalUSD: 2779, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 3 great breakfasts (3-adult pricing)', note: '页面明确为 3-adult 定价；该日期无 2 成人套房价展示' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:40 UTC',
 },
  'The Fullerton Hotel Singapore 新加坡富丽敦酒店': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Premier Courtyard Room', perNightUSD: 316, totalUSD: 1722, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'not included（该房价未标注早餐、无可选早餐价格显示）', note: '2 成人；预付；即时确认；早鸟价；Last booked 1 hr ago' },
  suite: { room: 'Premier Collyer Suite', perNightUSD: 583, totalUSD: 3175, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Our last 2!；2 成人；预付；即时确认' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:40 UTC',
 },
  'The Ritz-Carlton, Millenia Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Deluxe Kallang King Room', perNightUSD: 413, totalUSD: 2252, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Oct 3', breakfast: 'not included (optional $61.01)', note: '2 成人；预付；即时确认；Best price with free cancellation；Last booked 1 hr ago' },
  suite: { room: 'Club Deluxe King Suite, Club Lounge Access, High Floor', perNightUSD: 878, totalUSD: 4786, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: 'Includes 2 great breakfasts', note: '到店付；2 成人价；无库存预警' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:40 UTC',
 },
  'The Ritz-Carlton, Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe King', perNightUSD: 397, totalUSD: 1265, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 15', breakfast: 'not included (optional $33.29)', note: '2 成人；到店支付；即时确认；无余量提示；明细房费 $1075.14+服务费 $115.04+VAT $75.26' },
  suite: null,
  suiteNote: 'no suite-named room type for these dates（全部11种房型为 Deluxe/Club 系列）',
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:14–13:40 UTC',
 },
  'The Peninsula Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe King Room', perNightUSD: 425, totalUSD: 1355, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Our last 4!；2 成人；在线预付；即时确认；会员价9折（原价 $475）' },
  suite: { room: 'Deluxe King Suite', perNightUSD: 589, totalUSD: 1880, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Our last 4!；2 成人；在线预付；即时确认；会员价9折（原价 $659）' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:14–13:40 UTC',
 },
  'Rosewood Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe King Room', perNightUSD: 374, totalUSD: 1193, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 9', breakfast: 'not included (optional $44.87)', note: 'Our last 1!；2 成人；到店支付；即时确认；会员价85折（原价 $444）' },
  suite: { room: 'Premier Suite', perNightUSD: 632, totalUSD: 2017, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 9', breakfast: 'not included (optional $44.87)', note: '2 成人；到店支付；即时确认；会员价85折（原价 $751）' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:14–13:40 UTC',
 },
  '曼谷文华东方': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: null,
  suite: null,
  unavailable: '该日期整店售罄（This hotel is not currently accepting bookings；房型列表为空）',
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:14–13:40 UTC',
 },
  'Capella Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Riverfront Premier King Room', perNightUSD: 973, totalUSD: 3104, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 11', breakfast: 'Includes 2 great breakfasts', note: '2 成人；在线预付；即时确认；无余量提示' },
  suite: { room: 'Courtyard Suite', perNightUSD: 1450, totalUSD: 4626, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 11', breakfast: 'Includes 2 great breakfasts', note: 'Our last 1!；2 成人；在线预付；即时确认' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:14–13:40 UTC',
 },
  'Aman Nai Lert Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: null,
  baseNote: '纯套房酒店——所有房型均为套房，无标准房型',
  suite: { room: 'Deluxe King Suite', perNightUSD: 1714, totalUSD: 5466, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: '同 base；即为最便宜的 Suite 命名房型' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:14–13:40 UTC',
 },
  'Four Seasons Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe Room - King', perNightUSD: 744, totalUSD: 2373, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 15', breakfast: 'not included (optional $47.46)', note: 'Our last 1!；2 成人；在线预付；即时确认；已核验为河畔物业（Four Seasons Hotel Bangkok at Chao Phraya River）' },
  suite: null,
  suiteNote: 'no suite-named room type for these dates（全部8种房型为 Deluxe/Premier Riverview 系列）',
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:14–13:40 UTC',
 },
  'The Siam': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: null,
  baseNote: '纯套房酒店——所有房型均为套房/泳池别墅，无标准房型',
  suite: { room: 'Siam Suite', perNightUSD: 709, totalUSD: 2261, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: '同 base；即为最便宜的 Suite 命名房型' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:14–13:40 UTC',
 },
  '137 Pillars House': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: null,
  baseNote: '纯套房酒店，无标准房型',
  suite: { room: 'Rajah Brooke Suite', perNightUSD: 602, totalUSD: 1290, totalInclTax: true, cancel: 'Free Cancellation before 1:00 AM, Nov 22', breakfast: 'Includes 2 great breakfasts', note: '同 base；全房型皆 Suite，取最低价' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:33 UTC',
 },
  'Four Seasons Resort Chiang Mai': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Upper Garden Pavilion Twin', perNightUSD: 1785, totalUSD: 3829, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Our last 1!（Only 1 left at this price）；Prepay online；2 adults；同价另有 Upper Garden Pavilion King' },
  suite: null,
  suiteNote: 'no suite-named room type for these dates（全部7种房型核验无 Suite 命名）',
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:33 UTC',
 },
  'Raya Heritage': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: null,
  baseNote: '纯套房酒店，无标准房型',
  suite: { room: 'Rin Suite with Terrace', perNightUSD: 447, totalUSD: 894, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Nov 23', breakfast: 'Includes 2 great breakfasts', note: '同 base；详情页未显示该费率数字总价；页面未展示该费率数字总价，总价为每晚×晚数机械推算，非页面原值' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:33 UTC',
 },
  'Amanpuri': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Garden Pool Pavilion', perNightUSD: 3100, totalUSD: 9971, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 10', breakfast: 'Includes 2 great breakfasts', note: 'Our last 2!；最低价房型 Garden Pavilion 本轮未在可订列表（共6种房型）；全房型无 Suite 命名' },
  suite: null,
  suiteNote: 'no suite-named room type for these dates',
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:25 UTC',
 },
  'Trisara': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Ocean View Pool Villa', perNightUSD: 2013, totalUSD: 6476, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 26（预付精选房价）；$1931/晚到店付备选 11/27前免费取消', breakfast: 'Includes 2 great breakfasts', note: '另有 $1,931/晚到店付房价（11/27前免费取消）为列表最低每晚价，但页面未展示其全程总价；按页面完整展示的总价最低选' },
  suite: { room: 'Signature Ocean View Pool Suite', perNightUSD: 2736, totalUSD: 8208, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 27', breakfast: 'Includes 2 great breakfasts', note: '到店付；页面未展示该费率全程数字总价（仅标注 incl. taxes & fees）；另有 $2,852/晚预付房价 Our last 2!；总价按每晚×3晚数机械推算，非页面原值' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:25 UTC',
 },
  'Banyan Tree Phuket': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Banyan Pool Villa', perNightUSD: 765, totalUSD: 2461, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Last booked 2 hrs ago；全11种房型无 Suite 命名' },
  suite: null,
  suiteNote: 'no suite-named room type for these dates',
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:25 UTC',
 },
'Eastern & Oriental Hotel': {
  checkIn: '2026-12-20', checkOut: '2026-12-22', nights: 2,
  base: { room: 'Studio Twin Suite (Victory Annexe)', perNightUSD: 260, totalUSD: 568, totalInclTax: true, cancel: '12-14 12:00前免费取消', breakfast: '含双早', note: '全店房型皆为Suite；该价仅剩4间' },
  suite: { room: 'Studio Twin Suite (Victory Annexe)（全店房型皆为Suite，最低即套房）', perNightUSD: 260, totalUSD: 568, totalInclTax: true, cancel: '12-14 12:00前免费取消', breakfast: '含双早' },
  source: 'Trip.com', checkedAt: '2026-09-26 14:46 UTC',
 },
'Cheong Fatt Tze Mansion': {
  checkIn: '2026-12-20', checkOut: '2026-12-22', nights: 2,
  base: { room: 'Liang King Room', perNightUSD: 176, totalUSD: 427, totalInclTax: true, cancel: '12-13 01:00前免费取消', breakfast: '含双早', note: '该日期唯一可订房型；该价仅剩5间' },
  suite: null, suiteNote: '该日期无套房',
  source: 'Trip.com', checkedAt: '2026-09-26 14:46 UTC',
 },
'The Prestige Hotel Penang': {
  checkIn: '2026-12-20', checkOut: '2026-12-22', nights: 2,
  base: { room: 'Originals Twin', perNightUSD: 137, totalUSD: 303, totalInclTax: true, cancel: '12-18 18:00前免费取消', breakfast: '不含早（+$11.93/人可选）', note: '7折后价，原价$201' },
  suite: { room: 'Loft Suite', perNightUSD: 248, totalUSD: 541, totalInclTax: true, cancel: '12-18 18:00前免费取消', breakfast: '不含早（+$11.93/人可选）', note: '7折后价，原价$362；总价为明细加总约值' },
  source: 'Trip.com', checkedAt: '2026-09-26 14:46 UTC',
 },
'Mandarin Oriental Kuala Lumpur': {
  checkIn: '2026-12-22', checkOut: '2026-12-24', nights: 2,
  base: { room: 'Deluxe City View Room King Bed', perNightUSD: 212, totalUSD: 462, totalInclTax: true, cancel: '不可退', breakfast: '含双早' },
  suite: { room: 'Park View Suite King Bed', perNightUSD: 541, totalUSD: 1174, totalInclTax: true, cancel: '不可退', breakfast: '不含早（+$24.05/人可选）', note: '含MO行政酒廊权益' },
  source: 'Trip.com', checkedAt: '2026-09-26 15:16 UTC',
 },
'Park Hyatt Kuala Lumpur': {
  checkIn: '2026-12-22', checkOut: '2026-12-24', nights: 2,
  base: { room: 'Twin Room', perNightUSD: 353, totalUSD: 768, totalInclTax: true, cancel: '不可退', breakfast: '不含早（+$33.82/人可选）', note: '同价另有King Room' },
  suite: { room: 'Park Suite King', perNightUSD: 785, totalUSD: 1701, totalInclTax: true, cancel: '不可退', breakfast: '不含早（+$33.82/人可选）' },
  source: 'Trip.com', checkedAt: '2026-09-26 15:16 UTC',
 },
'The St. Regis Kuala Lumpur': {
  checkIn: '2026-12-22', checkOut: '2026-12-24', nights: 2,
  base: { room: 'City View King Room', perNightUSD: 319, totalUSD: 694, totalInclTax: true, cancel: '12-21 23:59前免费取消', breakfast: '不含早（+$31.90/人可选）', note: '到店付/预付同价' },
  suite: { room: 'Executive Junior King Suite', perNightUSD: 368, totalUSD: 800, totalInclTax: true, cancel: '12-21 23:59前免费取消', breakfast: '不含早（+$31.90/人可选）', note: '764平方英尺' },
  source: 'Trip.com', checkedAt: '2026-09-26 15:16 UTC',
 },
'Park Hyatt Saigon': {
  checkIn: '2026-12-24', checkOut: '2026-12-26', nights: 2,
  base: { room: 'Park King City View', perNightUSD: 611, totalUSD: 1321, totalInclTax: true, cancel: '12-10 23:59前免费取消', breakfast: '不含早（+$40.43/人可选）', note: '到店付' },
  suite: { room: 'Park Executive Suite', perNightUSD: 1988, totalUSD: 4295, totalInclTax: true, cancel: '12-10 23:59前免费取消', breakfast: '不含早（+$40.43/人可选）', note: '预付价，原价$2,024' },
  source: 'Trip.com', checkedAt: '2026-09-26 15:07 UTC',
 },
'The Reverie Saigon': {
  checkIn: '2026-12-24', checkOut: '2026-12-26', nights: 2,
  base: { room: 'Deluxe King Room', perNightUSD: 407, totalUSD: 880, totalInclTax: true, cancel: '不可退（早鸟价）', breakfast: '不含早（+$43.12/人可选）' },
  suite: { room: 'Junior Suite', perNightUSD: 646, totalUSD: 1396, totalInclTax: true, cancel: '不可退（早鸟价）', breakfast: '含双早', note: '含迷你吧、欢迎水果、酒廊' },
  source: 'Trip.com', checkedAt: '2026-09-26 15:07 UTC',
 },
'Sheraton Saigon Grand Opera Hotel': {
  checkIn: '2026-12-24', checkOut: '2026-12-26', nights: 2,
  base: { room: 'Guest Room, 1 King Bed', perNightUSD: 263, totalUSD: 568, totalInclTax: true, cancel: '09-27 23:59前免费取消', breakfast: '不含早（+$32.22/人可选）', note: '到店付；2025年翻新' },
  suite: null, suiteNote: '该日期无套房',
  source: 'Trip.com', checkedAt: '2026-09-26 15:07 UTC',
 },
'Caravelle Saigon': {
  checkIn: '2026-12-24', checkOut: '2026-12-26', nights: 2,
  base: { room: 'Deluxe King Room', perNightUSD: 186, totalUSD: 402, totalInclTax: true, cancel: '不可退（早鸟价）', breakfast: '含双早', note: '9折后价，原价$209；该价仅剩5间' },
  suite: { room: 'Executive Suite', perNightUSD: 441, totalUSD: 953, totalInclTax: true, cancel: '12-23 14:00前免费取消', breakfast: '含双早', note: '$22 off后价，原价$463' },
  source: 'Trip.com', checkedAt: '2026-09-26 15:07 UTC',
 },
'JW Marriott Phu Quoc': {
  checkIn: '2026-12-26', checkOut: '2026-12-29', nights: 3,
  base: { room: 'Emerald Bay Room, 1 King Bed, Balcony', perNightUSD: 1051, totalUSD: 3405, totalInclTax: true, cancel: '11-26 23:59前免费取消', breakfast: '含双早', note: '到店付/预付同价' },
  suite: { room: 'Turquoise Suite, 1 King Bed, Ocean View, Balcony', perNightUSD: 1961, totalUSD: 5883, totalInclTax: false, cancel: '11-26 23:59前免费取消', breakfast: '含双早', note: '页面未显示该房型整段总价；页面未显示该房型整段总价；为每晚价×晚数（税前口径）' },
  source: 'Trip.com', checkedAt: '2026-09-26 15:14 UTC',
 },
'Regent Phu Quoc': {
  checkIn: '2026-12-26', checkOut: '2026-12-29', nights: 3,
  base: null, suite: null,
  unavailable: '该日期无可订房：Trip.com明确显示无空房，且要求至少连住5晚（本次3晚不符合要求）；重试确认',
  source: 'Trip.com', checkedAt: '2026-09-26 15:14 UTC',
 },
'New World Phu Quoc': {
  checkIn: '2026-12-26', checkOut: '2026-12-29', nights: 3,
  base: { room: 'Garden Pool Villa - 3 Bedrooms', perNightUSD: 831, totalUSD: 2493, totalInclTax: false, cancel: '11-26 14:00前免费取消', breakfast: '含早（6份）', note: '页面未显示该房型整段总价；可住6人；页面未显示该房型整段总价；为每晚价×晚数（税前口径）' },
  suite: null, suiteNote: '该日期无明确标Suite的房型（均为Villa命名）',
  source: 'Trip.com', checkedAt: '2026-09-26 15:14 UTC',
 },
  'Capella Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Premier Twin Room With Garden View', perNightUSD: 1174, totalUSD: 7039, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 3', breakfast: 'not included (optional $63.73)', note: '到店付；2 成人价；即时确认；无库存预警；预付房价 $1292/晚 5 晚含税总价亦约 $7038.90' },
  suite: { room: 'Sentosa Suite', perNightUSD: 1566, totalUSD: 9385, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 3', breakfast: 'not included (optional $63.73)', note: 'Our last 5!；到店付；2 成人价' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:40 UTC',
 },
  'Raffles Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: null,
  suite: null,
  unavailable: '该日期整店售罄（No rooms available for your selected dates）',
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:40 UTC',
 },
  'Marina Bay Sands': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Sands Premier King', perNightUSD: 697, totalUSD: 3801, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: 'Includes 2 great breakfasts', note: '2 成人；预付；即时确认；多晚连住特价/早鸟价；Last booked 27 mins ago' },
  suite: { room: 'Sands Bay Suite King Gardens By The Bay View', perNightUSD: 1317, totalUSD: 7177, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: 'Includes 2 great breakfasts', note: '2 成人价；无库存预警' },
  source: 'Trip.com', checkedAt: '2026-10-02 ~13:40 UTC',
 },
};

export function getLiveHotelPrice(name: string): LiveHotelPrice | undefined {
 return hotelLivePrices[name];
}

/** 当前价格数据覆盖的行程住宿日期快照（行程变化检测用） */
export const livePriceStayDates: Record<string, { checkIn: string; checkOut: string }> = Object.fromEntries(
 Object.entries(hotelLivePrices).map(([name, p]) => [name, { checkIn: p.checkIn, checkOut: p.checkOut }]),
);
