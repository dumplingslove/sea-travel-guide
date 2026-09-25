/** 按行程实际住宿日期实查的酒店价格（USD）。
 * 数据来源：Trip.com 房型级实时价格，2 成人 1 间。
 * 查询时间：2026-09-24 20:15–21:35 PDT（= 2026-09-25 03:15–04:35 UTC）。
 * 价格为动态数据：行程日期变化或定期刷新时由 hotel-price-watch 任务重查并更新本文件。
 * 键必须与 data.ts 酒店名逐字一致（含中文后缀）。
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
  source: string;
  /** 查询时间（UTC） */
  checkedAt: string;
}

export const hotelLivePrices: Record<string, LiveHotelPrice> = {
 'The Athenee Hotel, a Luxury Collection Hotel, Bangkok 曼谷雅典娜豪华精选酒店': {
  checkIn: '2026-12-12', checkOut: '2026-12-15', nights: 3,
  base: { room: 'Athenee King Room（禁烟）', perNightUSD: 248, totalUSD: 876, totalInclTax: true, cancel: '免费取消', breakfast: '不含早' },
  suite: null, suiteNote: '该日期未找到可订套房',
  source: 'Trip.com', checkedAt: '2026-09-25 03:22 UTC',
 },
 'Anantara Chiang Mai': {
  checkIn: '2026-12-15', checkOut: '2026-12-17', nights: 2,
  base: { room: 'Deluxe Room Garden View', perNightUSD: 456, totalUSD: 1082, totalInclTax: true, cancel: '早鸟价不可退；免费取消价 $532/晚', breakfast: '含早' },
  suite: { room: 'Lanna Garden View Suite（105㎡）', perNightUSD: 599, totalUSD: 1421, totalInclTax: true, cancel: '不可退；免费取消价 $741/晚（2 晚 $1,760）', breakfast: '含早' },
  source: 'Trip.com', checkedAt: '2026-09-25 03:22 UTC',
 },
 'Shangri-La Chiang Mai 清迈香格里拉': {
  checkIn: '2026-12-15', checkOut: '2026-12-17', nights: 2,
  base: { room: 'Deluxe King Room Pool View', perNightUSD: 203, totalUSD: 483, totalInclTax: true, cancel: '12-14 18:00 前免费取消', breakfast: '不含早（+ $21.54/人可选）' },
  suite: { room: 'Executive King Suite', perNightUSD: 314, totalUSD: 746, totalInclTax: true, cancel: '12-14 18:00 前免费取消', breakfast: '含双早 + 行政酒廊', note: '85 折后价，原价 $380/晚' },
  source: 'Trip.com', checkedAt: '2026-09-25 03:26 UTC',
 },
 'Chiang Mai Marriott Hotel 清迈万豪': {
  checkIn: '2026-12-15', checkOut: '2026-12-17', nights: 2,
  base: { room: 'Deluxe King City View', perNightUSD: 179, totalUSD: 426, totalInclTax: true, cancel: '12-14 23:59 前免费取消', breakfast: '不含早（+ $22.89/人可选）' },
  suite: { room: 'Executive Suite 1 Bedroom（行政酒廊）', perNightUSD: 299, totalUSD: 710, totalInclTax: true, cancel: '12-14 23:59 前免费取消', breakfast: '不含早（+ $22.89/人可选）' },
  source: 'Trip.com', checkedAt: '2026-09-25 03:28 UTC',
 },
 'JW Marriott Phuket Resort & Spa 普吉JW万豪': {
  checkIn: '2026-12-17', checkOut: '2026-12-20', nights: 3,
  base: { room: 'Guest Room 2 Double Garden View（阳台）', perNightUSD: 434, totalUSD: 1544, totalInclTax: true, cancel: '12-14 23:59 前免费取消', breakfast: '不含早（+ $31.71/人可选）' },
  suite: { room: '1 Bedroom Suite 1 King Oceanfront（漩涡浴缸）', perNightUSD: 1061, totalUSD: 3779, totalInclTax: true, cancel: '12-14 23:59 前免费取消', breakfast: '不含早（+ $31.71/人可选）' },
  source: 'Trip.com', checkedAt: '2026-09-25 03:31 UTC',
 },
 'The Surin Phuket': {
  checkIn: '2026-12-17', checkOut: '2026-12-20', nights: 3,
  base: { room: 'One Bedroom Hillside Cottage', perNightUSD: 737, totalUSD: 2625, totalInclTax: true, cancel: '11-17 23:59 前免费取消', breakfast: '含双早', note: '88 折后价，原价 $857/晚' },
  suite: { room: 'Beach Suite', perNightUSD: 1589, totalUSD: 5659, totalInclTax: true, cancel: '11-17 23:59 前免费取消', breakfast: '含双早', note: '88 折后价，原价 $1,849/晚' },
  source: 'Trip.com', checkedAt: '2026-09-25 03:33 UTC',
 },
 'Keemala': {
  checkIn: '2026-12-17', checkOut: '2026-12-20', nights: 3,
  base: { room: 'Tent Pool Villa', perNightUSD: 810, totalUSD: 2886, totalInclTax: true, cancel: '不可退', breakfast: '含双早', note: '限时 45 折，原价 $1,597/晚' },
  suite: null, suiteNote: '该日期未找到可订套房',
  source: 'Trip.com', checkedAt: '2026-09-25 03:36 UTC',
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
  checkIn: '2026-12-29', checkOut: '2027-01-01', nights: 3,
  base: { room: 'Sea View Room King', perNightUSD: 1147, totalUSD: 4124, totalInclTax: true, cancel: '预付不可退', breakfast: '不含早' },
  suite: { room: 'Premier Family Suite（95㎡）', perNightUSD: 2189, totalUSD: 7873, totalInclTax: true, cancel: '不可退；含早价 $2,204/晚（3 晚 $7,929）', breakfast: '不含早（含早另计）' },
  source: 'Trip.com', checkedAt: '2026-09-25 03:22 UTC',
 },
 'Shangri-La Singapore 香格里拉': {
  checkIn: '2026-12-29', checkOut: '2027-01-01', nights: 3,
  base: { room: 'Tower Wing Deluxe King', perNightUSD: 360, totalUSD: 1295, totalInclTax: true, cancel: '早鸟不可退；免费取消价 $450/晚（12-28 18:00 前）', breakfast: '不含早（+ $40.35/人可选）' },
  suite: null, suiteNote: '该日期未找到可订套房',
  source: 'Trip.com', checkedAt: '2026-09-25 03:25 UTC',
 },
 'The Fullerton Hotel Singapore 新加坡富丽敦酒店': {
  checkIn: '2026-12-29', checkOut: '2027-01-01', nights: 3,
  base: { room: 'Premier Courtyard Room', perNightUSD: 758, totalUSD: 2728, totalInclTax: true, cancel: '预付不可退（多晚连住价）', breakfast: '不含早' },
  suite: { room: 'Premier Collyer Suite（65㎡）', perNightUSD: 2835, totalUSD: 8505, totalInclTax: false, cancel: '预付不可退', breakfast: '含双早', note: '总价为税前小计；仅剩 4 间' },
  source: 'Trip.com', checkedAt: '2026-09-25 03:35 UTC',
 },
 'The Ritz-Carlton, Millenia Singapore': {
  checkIn: '2026-12-29', checkOut: '2027-01-01', nights: 3,
  base: { room: 'Deluxe Kallang King（51㎡）', perNightUSD: 844, totalUSD: 3037, totalInclTax: true, cancel: '9-26 23:59 前免费取消（预付）', breakfast: '不含早（+ $60.94/人可选）' },
  suite: { room: 'Club Premier King Suite（72㎡，行政酒廊，高层海湾景）', perNightUSD: 2447, totalUSD: 7341, totalInclTax: false, cancel: '9-26 23:59 前免费取消（预付）', breakfast: '含早', note: '总价为税前小计；Club Deluxe King Suite 同价 $2,447/晚' },
  source: 'Trip.com', checkedAt: '2026-09-25 03:45 UTC',
 },
};

export function getLiveHotelPrice(name: string): LiveHotelPrice | undefined {
 return hotelLivePrices[name];
}

/** 当前价格数据覆盖的行程住宿日期快照（行程变化检测用） */
export const livePriceStayDates: Record<string, { checkIn: string; checkOut: string }> = Object.fromEntries(
 Object.entries(hotelLivePrices).map(([name, p]) => [name, { checkIn: p.checkIn, checkOut: p.checkOut }]),
);
