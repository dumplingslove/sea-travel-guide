/** 按行程实际住宿日期实查的酒店价格（USD）。
 * 数据来源：Trip.com 房型级实时价格，2 成人 1 间。
 * 查询时间：2026-09-24 20:15–21:35 PDT（21 家首批）；2026-09-26 07:43–08:26 PDT（30 家补齐，全站 51 家覆盖）；2026-09-27 06:59 PDT（新加坡 4 家按新行程日期 12/12–12/17 重查）；2026-09-27 08:51 PDT（普吉 6 家同日期 12/17–12/20 重查）；2026-09-27 08:54 PDT（清迈 6 家按新行程日期 12/23–12/25 重查）；2026-09-27 08:57 PDT（新加坡 Raffles/Ritz-Carlton/文华东方按 12/12–12/17 重查＋富丽敦套房补齐）；2026-09-27 09:04 PDT（曼谷 9 家按新行程日期 12/20–12/23 重查；2026-09-28 22:08–22:23 UTC（28 家行程酒店按新行程日期全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、曼谷 12/14–12/17、清迈 12/17–12/19；Raffles 新加坡该日期整店售罄）。
 * 2026-09-29 13:37–13:48 UTC（28 家行程酒店全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、曼谷 12/14–12/17、清迈 12/17–12/19；Raffles 新加坡该日期仍整店售罄）。
 * 价格为动态数据：行程日期变化或定期刷新时由 hotel-price-watch 任务重查并更新本文件。
 * 2026-09-30 site-improve：曼谷 9 家（查 12/14–12/17）与清迈 6 家（查 12/17–12/19）为旧行程顺序（曼谷→清迈）日期，用户当前行程为清迈 12/14–12/16、曼谷 12/16–12/19，已标 dateMismatch；待 hotel-price-watch 按新行程重查后清除该标记。
 * 键必须与 data.ts 酒店名逐字一致（含中文后缀）。
 * 2026-10-01 13:41–16:25 UTC（28 家行程酒店全量重查：新加坡/普吉沿用今早 06:41–06:50 PDT 回执（日期无误：新加坡 12/06–12/11、普吉 12/11–12/14）；曼谷按新行程日期 12/16–12/19、清迈按新行程日期 12/14–12/16 重查；Raffles 新加坡仍整店售罄；曼谷文华东方在新日期整店售罄（This hotel is not currently accepting bookings）；Bangkok/Chiang Mai 的 dateMismatch 标记已清除）。
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
  base: { room: 'Athenee King Room Non smoking', perNightUSD: 232, totalUSD: 741, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 15', breakfast: 'not included (optional $29.71)', note: '最便宜为免费取消、到店付方案' },
  suite: { room: 'Athenee Suite Non smoking', perNightUSD: 441, totalUSD: 1407, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 15', breakfast: 'included (1 great breakfast)', note: '唯一可订套房价为1成人房价口径（含1人早餐，在线预付），页面无2成人套房价' },
  source: 'Trip.com', checkedAt: '2026-10-01 16:25 UTC',
 },
 'Anantara Chiang Mai': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Deluxe Room With Garden View', perNightUSD: 524, totalUSD: 1124, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'included (Includes 2 great breakfasts)', note: '查价中价格浮动（初载 $485/晚总价 $1041，后变为 $524/晚总价 $1124）；同房型 $480/晚到店付方案总价 $1140 更高，未取' },
  suite: { room: 'Lanna Garden View Suite', perNightUSD: 672, totalUSD: 1441, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'included (Includes 2 great breakfasts)', note: '不可退款；在线预付' },
  source: 'Trip.com', checkedAt: '2026-10-01 16:10 UTC',
 },
 'Shangri-La Chiang Mai 清迈香格里拉': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Deluxe King Room', perNightUSD: 185, totalUSD: 397, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 13', breakfast: 'not included (optional $21.39)', note: 'Multi-night Discount 88折（原价 $212）' },
  suite: { room: 'Executive King Suite', perNightUSD: 333, totalUSD: 714, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 13', breakfast: 'included (Includes 2 great breakfasts)', note: 'Multi-night Discount 88折（原价 $382）；含2人早餐' },
  source: 'Trip.com', checkedAt: '2026-10-01 16:10 UTC',
 },
 'Chiang Mai Marriott Hotel 清迈万豪': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Deluxe King - City View', perNightUSD: 196, totalUSD: 423, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 13', breakfast: 'not included (optional $22.73)', note: '到店付；即时确认' },
  suite: { room: 'Executive Suite, 1 Bedroom, 1 King, Club Lounge Access', perNightUSD: 327, totalUSD: 705, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 13', breakfast: 'not included (optional $22.73)', note: '套房在折叠的 Show 4 Remaining Room Types 中；Executive Suite 为含 Suite 命名最便宜房型；含 M Club 行政酒廊礼遇' },
  source: 'Trip.com', checkedAt: '2026-10-01 16:10 UTC',
 },
 'JW Marriott Phuket Resort & Spa 普吉JW万豪': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Guest Room, 1 King, Garden View, Balcony', perNightUSD: 411, totalUSD: 1322, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 8', breakfast: 'not included', note: '早餐可选另付 $31.51；到店付、即时确认' },
  suite: { room: '1 Bedroom Suite, 1 King, Oceanfront, Private Pool', perNightUSD: 1436, totalUSD: 4621, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 8', breakfast: 'not included', note: '早餐可选另付 $31.51；到店付、即时确认' },
  source: 'Trip.com', checkedAt: '2026-10-01 13:50 UTC',
 },
 'The Surin Phuket': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'One Bedroom Hillside Cottage', perNightUSD: 625, totalUSD: 2011, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 11', breakfast: 'included', note: 'Our last 1!；Special Discount 9折（原价 $700），在线预付、即时确认、含2人早餐' },
  suite: { room: 'Beach Suite', perNightUSD: 1276, totalUSD: 4105, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 11', breakfast: 'included', note: 'Our last 1!；Special Discount 9折（原价 $1430），在线预付、即时确认、含2人早餐' },
  source: 'Trip.com', checkedAt: '2026-10-01 13:50 UTC',
 },
 'Keemala': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Clay Pool Cottage', perNightUSD: 806, totalUSD: 2592, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'included', note: '仅3种房型均无 Suite 命名，suite=null；Early Bird 42% off（原价 $1431）；到店付、即时确认、含2人早餐' },
  suite: null, suiteNote: '该日期未找到可订套房',
  source: 'Trip.com', checkedAt: '2026-10-01 13:50 UTC',
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
  base: { room: 'Sea View Room King', perNightUSD: 487, totalUSD: 2655, totalInclTax: true, cancel: 'free cancellation before 6:00 PM, Dec 4', breakfast: 'not included (optional $33.71)', note: 'Trip.com 显示名为 Mandarin Oriental, Singapore' },
  suite: { room: 'Family Suite', perNightUSD: 1018, totalUSD: 5547, totalInclTax: true, cancel: 'free cancellation before 6:00 PM, Dec 4', breakfast: 'not included (optional $33.71)', note: 'Trip.com 显示名为 Mandarin Oriental, Singapore' },
  source: 'Trip.com', checkedAt: '2026-10-01 13:45 UTC',
 },
 'Shangri-La Singapore 香格里拉': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Tower Wing Deluxe King Room', perNightUSD: 285, totalUSD: 1554, totalInclTax: true, cancel: 'non-refundable', breakfast: 'not included (optional $40.31)', note: '最便宜免费取消基础房 $357/晚' },
  suite: { room: 'Horizon Club Junior Suite King', perNightUSD: 510, totalUSD: 2780, totalInclTax: true, cancel: 'non-refundable', breakfast: 'included (3 great breakfasts)', note: '页面显示为3成人价（该房型无2成人价），搜索口径为2成人' },
  source: 'Trip.com', checkedAt: '2026-10-01 13:45 UTC',
 },
 'The Fullerton Hotel Singapore 新加坡富丽敦酒店': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Premier Courtyard Room', perNightUSD: 317, totalUSD: 1728, totalInclTax: true, cancel: 'non-refundable', breakfast: 'not included (no breakfast option on this rate)' },
  suite: { room: 'Premier Collyer Suite', perNightUSD: 581, totalUSD: 3168, totalInclTax: true, cancel: 'non-refundable', breakfast: 'included (2 great breakfasts)', note: 'Our last 2!' },
  source: 'Trip.com', checkedAt: '2026-10-01 13:45 UTC',
 },
 'The Ritz-Carlton, Millenia Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Deluxe Kallang Twin Room', perNightUSD: 507, totalUSD: 2762, totalInclTax: true, cancel: 'free cancellation before 11:59 PM, Dec 4', breakfast: 'not included (optional $60.89)' },
  suite: { room: 'Club Deluxe King Suite, Club Lounge Access, High Floor', perNightUSD: 928, totalUSD: 5056, totalInclTax: true, cancel: 'free cancellation before 11:59 PM, Oct 2', breakfast: 'included (2 great breakfasts)' },
  source: 'Trip.com', checkedAt: '2026-10-01 13:45 UTC',
 },
 'The Ritz-Carlton, Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe King', perNightUSD: 395, totalUSD: 1259, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 15', breakfast: 'not included (optional $33.22)', note: '页面显示 Last booked 3 hrs ago' },
  suite: { room: 'Gardenia Suite, Lumpini Park View', perNightUSD: 1359, totalUSD: 4336, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 15', breakfast: 'not included (optional $33.22)', note: '更贵套房：Marigold Suite $1458；Amaranth Suite $1655；Ritz-Carlton Suite 2BR $19733；3BR $23022' },
  source: 'Trip.com', checkedAt: '2026-10-01 16:25 UTC',
 },
 'The Peninsula Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe King Room', perNightUSD: 422, totalUSD: 1347, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'included (2 great breakfasts)', note: 'Our last 4!；会员价9折（原价 $472），在线预付；免费取消备选 $444/晚' },
  suite: { room: 'Deluxe King Suite', perNightUSD: 586, totalUSD: 1868, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'included (2 great breakfasts)', note: 'Our last 4!；会员价9折（原价 $655），在线预付；免费取消备选 $636/晚' },
  source: 'Trip.com', checkedAt: '2026-10-01 16:25 UTC',
 },
 'Rosewood Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe King Room', perNightUSD: 372, totalUSD: 1185, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 9', breakfast: 'not included (optional $44.78)', note: 'Our last 1!；会员价85折（原价 $441），到店付' },
  suite: { room: 'Premier Suite', perNightUSD: 629, totalUSD: 2005, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 9', breakfast: 'not included (optional $44.78)', note: '会员价85折（原价 $747），到店付；Nara House ($3101)/Thara House ($3594) 无 Suite 命名未计入' },
  source: 'Trip.com', checkedAt: '2026-10-01 16:25 UTC',
 },
 '曼谷文华东方': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: null, baseNote: '该日期无可订基础房',
  suite: null, suiteNote: '该日期未找到可订套房',
  unavailable: '整店售罄：12/16–12/19 Trip.com 显示 This hotel is not currently accepting bookings（邻近日 12/12–12/15 仍有房，$674–$821/晚起）',
  source: 'Trip.com', checkedAt: '2026-10-01 16:25 UTC',
 },
 'Capella Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Riverfront Premier Twin Room', perNightUSD: 967, totalUSD: 3085, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 11', breakfast: 'included (2 great breakfasts)', note: 'Riverfront Premier King 房同价 $967/晚' },
  suite: { room: 'Courtyard Suite', perNightUSD: 1441, totalUSD: 4598, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 11', breakfast: 'included (2 great breakfasts)', note: 'Our last 1!；Verandah ($1704) 无 Suite 命名未计入' },
  source: 'Trip.com', checkedAt: '2026-10-01 16:25 UTC',
 },
 'Aman Nai Lert Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: null, baseNote: '纯套房酒店——所有房型均为套房（Deluxe King/Twin Suite、Premier Suite、Corner Suite、Premier Corner Suite、Terrace Suite），无标准房型',
  suite: { room: 'Deluxe King Suite', perNightUSD: 1720, totalUSD: 5487, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'included (2 great breakfasts)', note: 'Our last 5!；Deluxe Twin Suite 同价 $1720/晚（Our last 4!）；免费取消备选 $1911/晚' },
  source: 'Trip.com', checkedAt: '2026-10-01 16:25 UTC',
 },
'Four Seasons Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe Room - King', perNightUSD: 745, totalUSD: 2376, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 15', breakfast: 'Not included (optional $47.21)', note: '\'Our last 1!\'' },
  suite: null, suiteNote: '该日期无 Suite 命名房型（展开后共8种房型，仅 Deluxe / Palm Court / Riverview / Premier Riverview 标准房）',
  source: 'Trip.com', checkedAt: '2026-10-01 16:25 UTC',
 },
 'The Siam': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: null, baseNote: '纯套房酒店——所有房型均为套房/泳池别墅（Siam Suite、Garden View Suite、Premier Garden View Suite、River View Suite、Premier River View Suite、Courtyard Pool Villa），无标准房型',
  suite: { room: 'Siam Suite', perNightUSD: 711, totalUSD: 2266, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'included (2 great breakfasts)', note: 'Special Discount 94折（原价 $755）；在线预付；Courtyard Pool Villa ($1340) 无 Suite 命名未计入' },
  source: 'Trip.com', checkedAt: '2026-10-01 16:25 UTC',
 },
 '137 Pillars House': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: null, baseNote: '纯套房酒店，无标准房型',
  suite: { room: 'Rajah Brooke Suite', perNightUSD: 609, totalUSD: 1306, totalInclTax: true, cancel: 'Free Cancellation before 1:00 AM, Nov 22', breakfast: 'included (Includes 2 great breakfasts)', note: 'Our last 5!' },
  source: 'Trip.com', checkedAt: '2026-10-01 16:10 UTC',
 },
 'Four Seasons Resort Chiang Mai': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Upper Garden Pavilion Twin', perNightUSD: 1776, totalUSD: 3809, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'included (Includes 2 great breakfasts)', note: 'Our last 1!；不可退款' },
  suite: null, suiteNote: '无以 Suite 命名的房型；仅 Pavilion 房型 + 1间 Pool Villa（$2287/晚，12/7 15:00前免费取消），按命名规则未计入套房',
  source: 'Trip.com', checkedAt: '2026-10-01 16:10 UTC',
 },
 'Raya Heritage': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: null, baseNote: '纯套房酒店，无标准房型（Rin Suite with Terrace、Huen Bon Suite、Kramm Suite with Pool）',
  suite: { room: 'Rin Suite with Terrace', perNightUSD: 470, totalUSD: 1009, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 23', breakfast: 'included (Includes 2 great breakfasts)', note: 'Our last 1!；$445/晚到店付方案总价 $1056 更高，未取' },
  source: 'Trip.com', checkedAt: '2026-10-01 16:10 UTC',
 },
 'Amanpuri': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Garden Pavilion', perNightUSD: 2214, totalUSD: 7122, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 10', breakfast: 'included', note: '全7种房型均无 Suite 命名，suite=null；在线预付、即时确认、含2人早餐' },
  suite: null, suiteNote: '该日期未找到可订套房',
  source: 'Trip.com', checkedAt: '2026-10-01 13:50 UTC',
 },
 'Trisara': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Ocean View Pool Villa', perNightUSD: 2016, totalUSD: 6484, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 26', breakfast: 'included', note: 'Our last 4!；按总价最低选（不同方案税费加成不同）；到店付备选 $1912/晚（总价 $6809，11/27前免费取消）' },
  suite: { room: 'Signature Ocean View Pool Suite', perNightUSD: 2856, totalUSD: 9186, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 26', breakfast: 'included', note: 'Our last 2!；按总价最低选；在线预付、含2人早餐' },
  source: 'Trip.com', checkedAt: '2026-10-01 13:50 UTC',
 },
 'Banyan Tree Phuket': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Banyan Pool Villa', perNightUSD: 761, totalUSD: 2447, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'included', note: '全11种房型均无 Suite 命名，suite=null；在线预付、即时确认、含2人早餐' },
  suite: null, suiteNote: '该日期未找到可订套房',
  source: 'Trip.com', checkedAt: '2026-10-01 13:50 UTC',
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
  base: { room: 'Premier Twin Room With Garden View', perNightUSD: 1171, totalUSD: 7023, totalInclTax: true, cancel: 'free cancellation before 6:00 PM, Dec 3 (pay at hotel rate)', breakfast: 'not included (optional $63.73)', note: '最便宜为到店付方案；在线预付价略高（基础房 $1289/晚、套房 $1718/晚）' },
  suite: { room: 'Sentosa Suite', perNightUSD: 1562, totalUSD: 9364, totalInclTax: true, cancel: 'free cancellation before 6:00 PM, Dec 3 (pay at hotel rate)', breakfast: 'not included (optional $63.73)', note: 'Our last 5!；最便宜为到店付方案' },
  source: 'Trip.com', checkedAt: '2026-10-01 13:45 UTC',
 },
 'Raffles Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: null, baseNote: '该日期无可订基础房',
  suite: null, suiteNote: '该日期未找到可订套房',
  unavailable: '整店售罄：12/06–12/11 Trip.com 无房可订（搜索页：No rooms available for your selected dates；详情页：No availability for these dates）',
  source: 'Trip.com', checkedAt: '2026-10-01 13:45 UTC',
 },
 'Marina Bay Sands': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Sands Premier King', perNightUSD: 696, totalUSD: 3792, totalInclTax: true, cancel: 'free cancellation before 11:59 PM, Dec 4', breakfast: 'included (2 great breakfasts)', note: '最便宜可订方案含2人早餐' },
  suite: { room: 'Sands Bay Suite King Gardens By The Bay View', perNightUSD: 1314, totalUSD: 7161, totalInclTax: true, cancel: 'free cancellation before 11:59 PM, Dec 4', breakfast: 'included (2 great breakfasts)', note: '最便宜可订方案含2人早餐' },
  source: 'Trip.com', checkedAt: '2026-10-01 13:45 UTC',
 },
};

export function getLiveHotelPrice(name: string): LiveHotelPrice | undefined {
 return hotelLivePrices[name];
}

/** 当前价格数据覆盖的行程住宿日期快照（行程变化检测用） */
export const livePriceStayDates: Record<string, { checkIn: string; checkOut: string }> = Object.fromEntries(
 Object.entries(hotelLivePrices).map(([name, p]) => [name, { checkIn: p.checkIn, checkOut: p.checkOut }]),
);
