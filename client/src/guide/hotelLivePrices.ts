/** 按行程实际住宿日期实查的酒店价格（USD）。
 * 数据来源：Trip.com 房型级实时价格，2 成人 1 间。
 * 查询时间：2026-09-24 20:15–21:35 PDT（21 家首批）；2026-09-26 07:43–08:26 PDT（30 家补齐，全站 51 家覆盖）；2026-09-27 06:59 PDT（新加坡 4 家按新行程日期 12/12–12/17 重查）；2026-09-27 08:51 PDT（普吉 6 家同日期 12/17–12/20 重查）；2026-09-27 08:54 PDT（清迈 6 家按新行程日期 12/23–12/25 重查）；2026-09-27 08:57 PDT（新加坡 Raffles/Ritz-Carlton/文华东方按 12/12–12/17 重查＋富丽敦套房补齐）。
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
  checkIn: '2026-12-23', checkOut: '2026-12-25', nights: 2,
  base: null, suite: null,
  unavailable: '该日期无可订房：Trip.com列表页明确显示Sold out（2026-12-23至12-25）',
  source: 'Trip.com', checkedAt: '2026-09-27 15:54 UTC',
 },
 'Shangri-La Chiang Mai 清迈香格里拉': {
  checkIn: '2026-12-23', checkOut: '2026-12-25', nights: 2,
  base: { room: 'Deluxe King Room（1 king bed，山景，462 ft²）', perNightUSD: 332, totalUSD: 711, totalInclTax: true, cancel: '12-22 18:00前免费取消（预付）', breakfast: '不含早（+$21.55/人可选）', note: '13% off，原价$385/晚；Deluxe Twin同价；Our last 4!' },
  suite: null, suiteNote: '已展开全部房型：无可订Suite房型',
  source: 'Trip.com', checkedAt: '2026-09-27 15:54 UTC',
 },
 'Chiang Mai Marriott Hotel 清迈万豪': {
  checkIn: '2026-12-23', checkOut: '2026-12-25', nights: 2,
  base: { room: 'Deluxe King - City View（1 king bed，387 ft²）', perNightUSD: 364, totalUSD: 786, totalInclTax: true, cancel: '12-22 23:59前免费取消（到店付/预付同价）', breakfast: '不含早（+$22.90/人可选）', note: 'Last booked 1 hr ago' },
  suite: { room: 'Executive Suite, 1 Bedroom, 1 King, Club Lounge Access（818 ft²，山景）', perNightUSD: 529, totalUSD: 1058, totalInclTax: false, cancel: '12-22 23:59前免费取消', breakfast: '不含早（+$22.90/人可选）', note: '含M Club行政酒廊；2晚总价页面未显示（按每晚价×2估算，税费另计）' },
  source: 'Trip.com', checkedAt: '2026-09-27 15:54 UTC',
 },
 'JW Marriott Phuket Resort & Spa 普吉JW万豪': {
  checkIn: '2026-12-17', checkOut: '2026-12-20', nights: 3,
  base: { room: 'Guest Room 2 Double Garden View（阳台；1 King同价）', perNightUSD: 481, totalUSD: 1547, totalInclTax: true, cancel: '12-14 23:59前免费取消（到店付；预付同价）', breakfast: '不含早（+$31.73/人可选）', note: 'Last booked 4 hrs ago' },
  suite: { room: '1 Bedroom Suite 1 King Oceanfront（漩涡浴缸）', perNightUSD: 1177, totalUSD: 3531, totalInclTax: false, cancel: '12-14 23:59前免费取消（到店付；预付$1,217/晚）', breakfast: '不含早（+$31.73/人可选）', note: '3晚总价页面未显示（按每晚价×3估算，税费另计）' },
  source: 'Trip.com', checkedAt: '2026-09-27 15:51 UTC',
 },
 'The Surin Phuket': {
  checkIn: '2026-12-17', checkOut: '2026-12-20', nights: 3,
  base: { room: 'Two-Bedroom Family Cottages', perNightUSD: 1620, totalUSD: 5212, totalInclTax: true, cancel: '11-17 23:59前免费取消', breakfast: '含4人早', note: '11% off，原价$1,837/晚；Our last 1!；原$737/晚的One Bedroom Hillside Cottage本轮无可订' },
  suite: { room: 'Beach Suite', perNightUSD: 1782, totalUSD: 5346, totalInclTax: false, cancel: '11-17 23:59前免费取消', breakfast: '含双早', note: '11% off，原价$2,021/晚；3晚总价页面未显示（按每晚价×3估算，税费另计）' },
  source: 'Trip.com', checkedAt: '2026-09-27 15:51 UTC',
 },
 'Keemala': {
  checkIn: '2026-12-17', checkOut: '2026-12-20', nights: 3,
  base: { room: 'Tent Pool Villa', perNightUSD: 899, totalUSD: 2891, totalInclTax: true, cancel: '不可退（到店付）', breakfast: '含双早', note: '45% off，原价$1,687/晚；Our last 4!' },
  suite: null, suiteNote: '该日期无套房（在售均为Villa命名房型）',
  source: 'Trip.com', checkedAt: '2026-09-27 15:51 UTC',
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
  checkIn: '2026-12-12', checkOut: '2026-12-17', nights: 5,
  base: { room: 'Sea View Room King', perNightUSD: 490, totalUSD: 2671, totalInclTax: true, cancel: '12-10 18:00前免费取消（预付）', breakfast: '不含早（+$33.79/人可选）', note: 'Last booked 24 mins ago；Sea View Room Twin $511/晚、Marina Bay View Room Twin $616/晚均Our last 4!' },
  suite: { room: 'Family Suite', perNightUSD: 1353, totalUSD: 6765, totalInclTax: false, cancel: '12-10 18:00前免费取消（预付）', breakfast: '含1份早餐', note: '该价为1成人价；2成人价页面未列；Family Suite Twin $1,378/晚（1成人价）Our last 1!；5晚总价页面未显示（按每晚价×5估算，税费另计）' },
  source: 'Trip.com', checkedAt: '2026-09-27 15:57 UTC',
 },
 'Shangri-La Singapore 香格里拉': {
  checkIn: '2026-12-12', checkOut: '2026-12-17', nights: 5,
  base: { room: 'Tower Wing Deluxe King Room（409平方英尺，城市景观）', perNightUSD: 271, totalUSD: 1355, totalInclTax: false, cancel: '不可退（早鸟预付价）', breakfast: '不含早（+$40.40/人可选）', note: '总价页面未显示（按每晚价×5估算，税费另计）；免费取消替代价$338/晚（12-11 18:00前，到店付款）；First booking offer促销' },
  suite: null, suiteNote: '该日期 Trip.com 上无可订套房（已展开全部房型）',
  source: 'Trip.com', checkedAt: '2026-09-27 13:59 UTC',
 },
 'The Fullerton Hotel Singapore 新加坡富丽敦酒店': {
  checkIn: '2026-12-12', checkOut: '2026-12-17', nights: 5,
  base: { room: 'Premier Courtyard Room（452平方英尺，1张大床）', perNightUSD: 329, totalUSD: 1793, totalInclTax: true, cancel: '不可退（预付）', breakfast: '不含早', note: '多晚连住专享价·今日最优价；Marina Bay View Room $480仅剩5间；Esplanade Room King $499仅剩2间' },
  suite: { room: 'Palladian Suite（1 king bed，742–1001 ft²）', perNightUSD: 774, totalUSD: 4220, totalInclTax: true, cancel: '不可退（预付）', breakfast: '含双早', note: 'Our last 3!；Loft Suite $1,352/晚更贵' },
  source: 'Trip.com', checkedAt: '2026-09-27 15:57 UTC',
 },
 'The Ritz-Carlton, Millenia Singapore': {
  checkIn: '2026-12-12', checkOut: '2026-12-17', nights: 5,
  base: { room: 'Deluxe Kallang King', perNightUSD: 413, totalUSD: 2253, totalInclTax: true, cancel: '9-28 23:59前免费取消（预付）', breakfast: '不含早（+$61.01/人可选）', note: 'Last booked 43 mins ago' },
  suite: { room: 'Club Deluxe King Suite（行政酒廊，高层）', perNightUSD: 844, totalUSD: 4220, totalInclTax: false, cancel: '9-28 23:59前免费取消（预付）', breakfast: '含1份早餐', note: '该价为1成人价；2成人站内建议订2间；5晚总价页面未显示（按每晚价×5估算，税费另计）' },
  source: 'Trip.com', checkedAt: '2026-09-27 15:57 UTC',
 },
 'The Ritz-Carlton, Bangkok': {
  checkIn: '2026-12-12', checkOut: '2026-12-15', nights: 3,
  base: { room: 'Deluxe King', perNightUSD: 368, totalUSD: 1301, totalInclTax: true, cancel: '12-11 23:59前免费取消', breakfast: '不含早（+$33.47/人可选）' },
  suite: null, suiteNote: '该日期无套房',
  source: 'Trip.com', checkedAt: '2026-09-26 14:57 UTC',
 },
 'The Peninsula Bangkok': {
  checkIn: '2026-12-12', checkOut: '2026-12-15', nights: 3,
  base: { room: 'Deluxe King Room', perNightUSD: 401, totalUSD: 1278, totalInclTax: true, cancel: '最低价不可退；免费取消价$418/晚', breakfast: '含双早', note: '会员9折后价，原价$448；该价仅剩4间' },
  suite: { room: 'Deluxe King Suite', perNightUSD: 591, totalUSD: 1885, totalInclTax: true, cancel: '最低价不可退；免费取消价$642/晚', breakfast: '含双早', note: '会员9折后价，原价$661；该价仅剩4间' },
  source: 'Trip.com', checkedAt: '2026-09-26 14:57 UTC',
 },
 'Rosewood Bangkok': {
  checkIn: '2026-12-12', checkOut: '2026-12-15', nights: 3,
  base: { room: 'Deluxe Twin Room', perNightUSD: 299, totalUSD: 954, totalInclTax: true, cancel: '12-05 18:00前免费取消', breakfast: '不含早（+$45.11/人可选）', note: '会员85折后价，原价$355' },
  suite: { room: 'Premier Suite', perNightUSD: 530, totalUSD: 1690, totalInclTax: true, cancel: '12-05 18:00前免费取消', breakfast: '不含早（+$45.11/人可选）', note: '会员85折后价，原价$629；含免费迷你吧、私人管家' },
  source: 'Trip.com', checkedAt: '2026-09-26 14:57 UTC',
 },
 '曼谷文华东方': {
  checkIn: '2026-12-12', checkOut: '2026-12-15', nights: 3,
  base: { room: 'Deluxe Premier King Room', perNightUSD: 818, totalUSD: 2609, totalInclTax: true, cancel: '12-11 18:00前免费取消', breakfast: '含双早', note: '每住送$150酒店消费额' },
  suite: { room: 'Junior King Suite With Terrace', perNightUSD: 1841, totalUSD: 5873, totalInclTax: true, cancel: '12-11 18:00前免费取消', breakfast: '不含早（+$63.42/人可选）', note: '会员价，原价$1,892；该价仅剩4间' },
  source: 'Trip.com', checkedAt: '2026-09-26 14:57 UTC',
 },
 'Capella Bangkok': {
  checkIn: '2026-12-12', checkOut: '2026-12-15', nights: 3,
  base: { room: 'Riverfront Twin Room', perNightUSD: 990, totalUSD: 3159, totalInclTax: true, cancel: '12-07 15:00前免费取消', breakfast: '含双早', note: '该价仅剩1间' },
  suite: { room: 'Courtyard Suite', perNightUSD: 1477, totalUSD: 4710, totalInclTax: true, cancel: '12-07 15:00前免费取消', breakfast: '含双早', note: '该价仅剩1间' },
  source: 'Trip.com', checkedAt: '2026-09-26 14:57 UTC',
 },
 'Aman Nai Lert Bangkok': {
  checkIn: '2026-12-12', checkOut: '2026-12-15', nights: 3,
  base: { room: 'Premier Suite', perNightUSD: 1476, totalUSD: 4708, totalInclTax: true, cancel: '不可退', breakfast: '含双早', note: '全套房酒店，最低即套房' },
  suite: { room: 'Premier Suite（全套房酒店，最低即套房）', perNightUSD: 1476, totalUSD: 4708, totalInclTax: true, cancel: '不可退', breakfast: '含双早' },
  source: 'Trip.com', checkedAt: '2026-09-26 14:57 UTC',
 },
 'Four Seasons Bangkok': {
  checkIn: '2026-12-12', checkOut: '2026-12-15', nights: 3,
  base: { room: 'Deluxe Room - King', perNightUSD: 696, totalUSD: 2221, totalInclTax: true, cancel: '12-11 15:00前免费取消', breakfast: '不含早（+$47.57/人可选）', note: '湄南河畔本店；该价仅剩1间' },
  suite: null, suiteNote: '该日期无套房',
  source: 'Trip.com', checkedAt: '2026-09-26 14:57 UTC',
 },
 'The Siam': {
  checkIn: '2026-12-12', checkOut: '2026-12-15', nights: 3,
  base: { room: 'Siam Suite', perNightUSD: 638, totalUSD: 2036, totalInclTax: true, cancel: '不可退', breakfast: '含双早', note: '9折后价，原价$705；全套房酒店；含免费迷你吧、每日2班接驳船' },
  suite: { room: 'Siam Suite（全套房酒店，最低即套房）', perNightUSD: 638, totalUSD: 2036, totalInclTax: true, cancel: '不可退', breakfast: '含双早' },
  source: 'Trip.com', checkedAt: '2026-09-26 14:57 UTC',
 },
 '137 Pillars House': {
  checkIn: '2026-12-23', checkOut: '2026-12-25', nights: 2,
  base: { room: 'Rajah Brooke Suite（1 king bed，753 ft²，花园景观）', perNightUSD: 1379, totalUSD: 2958, totalInclTax: true, cancel: '11-08 23:59前免费取消（预付）', breakfast: '含双早', note: '21% off，原价$1,763/晚；到店付价$1,569/晚；Our last 2!' },
  suite: { room: 'Rajah Brooke Suite（全店房型皆为Suite，最低即套房）', perNightUSD: 1379, totalUSD: 2958, totalInclTax: true, cancel: '11-08 23:59前免费取消（预付）', breakfast: '含双早' },
  source: 'Trip.com', checkedAt: '2026-09-27 15:54 UTC',
 },
 'Four Seasons Resort Chiang Mai': {
  checkIn: '2026-12-23', checkOut: '2026-12-25', nights: 2,
  base: null, suite: null,
  unavailable: '该日期无可订房：Trip.com列表页明确显示Sold out（2026-12-23至12-25）',
  source: 'Trip.com', checkedAt: '2026-09-27 15:54 UTC',
 },
 'Raya Heritage': {
  checkIn: '2026-12-23', checkOut: '2026-12-25', nights: 2,
  base: { room: 'Huen Bon Suite（1 king bed，河景，807 ft²）', perNightUSD: 987, totalUSD: 2118, totalInclTax: true, cancel: '11-08 23:59前免费取消（预付）', breakfast: '含双早', note: '预付价$987/晚；到店付$913/晚（免费取消到11-08 18:00）；12月24日房价含2人强制圣诞晚宴，加人另收费；Our last 1!' },
  suite: { room: 'Huen Bon Suite（本身即为套房，最低即套房）', perNightUSD: 987, totalUSD: 2118, totalInclTax: true, cancel: '11-08 23:59前免费取消（预付）', breakfast: '含双早' },
  source: 'Trip.com', checkedAt: '2026-09-27 15:54 UTC',
 },
 'Amanpuri': {
  checkIn: '2026-12-17', checkOut: '2026-12-20', nights: 3,
  base: { room: 'Three-Bedroom Ocean Villa', perNightUSD: 14391, totalUSD: 46293, totalInclTax: true, cancel: '11-16 23:59前免费取消', breakfast: '含双早', note: '该价仅剩1间；可住5位成人；本轮重查价格无变化' },
  suite: null, suiteNote: '该日期无套房（在售均为Villa命名房型）',
  source: 'Trip.com', checkedAt: '2026-09-27 15:51 UTC',
 },
 'Trisara': {
  checkIn: '2026-12-17', checkOut: '2026-12-20', nights: 3,
  base: { room: 'Ocean View Pool Junior Suite', perNightUSD: 1922, totalUSD: 6184, totalInclTax: true, cancel: '不可退（预付）', breakfast: '含双早', note: 'Our last 4!；Last booked 6 hrs ago' },
  suite: { room: 'Signature Ocean View Pool Suite', perNightUSD: 3205, totalUSD: 9615, totalInclTax: false, cancel: '不可退', breakfast: '含双早', note: '到店付价；预付价$3,567/晚；Our last 3!；3晚总价页面未显示（按每晚价×3估算，税费另计）' },
  source: 'Trip.com', checkedAt: '2026-09-27 15:51 UTC',
 },
 'Banyan Tree Phuket': {
  checkIn: '2026-12-17', checkOut: '2026-12-20', nights: 3,
  base: { room: 'Banyan Pool Villa', perNightUSD: 916, totalUSD: 2947, totalInclTax: true, cancel: '不可退', breakfast: '含双早', note: '该价仅剩3间；免费取消价$1,145/晚、总计$3,684；本轮重查价格无变化' },
  suite: null, suiteNote: '该日期无明确标Suite的房型（均为Pool Villa/Residence命名）',
  source: 'Trip.com', checkedAt: '2026-09-27 15:51 UTC',
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
  checkIn: '2026-12-12', checkOut: '2026-12-17', nights: 5,
  base: { room: 'Premier King Room With Garden View（828平方英尺，花园景观）', perNightUSD: 1218, totalUSD: 6090, totalInclTax: false, cancel: '12月9日18:00前免费取消（到店付款）', breakfast: '不含早（+$63.83/人可选）', note: '到店付款价；5晚总价页面未显示（按每晚价×5估算，税费另计）；预付替代价$1,340/晚（5晚含税$7,303，12-8前免费取消）' },
  suite: { room: 'Sentosa Suite（925平方英尺，海景）', perNightUSD: 1581, totalUSD: 7905, totalInclTax: false, cancel: '12月9日18:00前免费取消（到店付款）', breakfast: '不含早（+$63.83/人可选）', note: '总价按每晚价×5估算；预付价$1,740/晚（12-8前免费取消，仅剩5间）；One Bedroom Garden Villa同价$1,581–$1,740（别墅非套房）' },
  source: 'Trip.com', checkedAt: '2026-09-27 13:59 UTC',
 },
 'Raffles Singapore': {
  checkIn: '2026-12-12', checkOut: '2026-12-17', nights: 5,
  base: { room: 'State Room Suite 2 Doubles', perNightUSD: 1367, totalUSD: 7449, totalInclTax: true, cancel: '不可退（预付）', breakfast: '含双早', note: '全套房酒店，最低即套房；可免费取消替代价$1,444/晚（12-09 18:00前）；Last booked 18 hrs ago' },
  suite: { room: 'State Room Suite 2 Doubles（全套房酒店，最低即套房）', perNightUSD: 1367, totalUSD: 7449, totalInclTax: true, cancel: '不可退（预付）', breakfast: '含双早' },
  source: 'Trip.com', checkedAt: '2026-09-27 15:57 UTC',
 },
 'Marina Bay Sands': {
  checkIn: '2026-12-12', checkOut: '2026-12-17', nights: 5,
  base: { room: 'Sands Premier King（484平方英尺，2–12层）', perNightUSD: 741, totalUSD: 4036, totalInclTax: true, cancel: '12月10日23:59前免费取消（预付）', breakfast: '含双早', note: '多晚连住专享价·早鸟价；Sands Premier Double Queen同$741/晚，仅剩4间' },
  suite: { room: 'Sands Bay Suite King Gardens By The Bay View（871平方英尺，6–34层）', perNightUSD: 1391, totalUSD: 6955, totalInclTax: false, cancel: '12月10日23:59前免费取消（预付）', breakfast: '含双早', note: '总价页面未显示（按每晚价×5估算）；$1,464/晚另含单程机场接送+套房礼遇；多款高阶房型仅剩1间' },
  source: 'Trip.com', checkedAt: '2026-09-27 13:59 UTC',
 },
};

export function getLiveHotelPrice(name: string): LiveHotelPrice | undefined {
 return hotelLivePrices[name];
}

/** 当前价格数据覆盖的行程住宿日期快照（行程变化检测用） */
export const livePriceStayDates: Record<string, { checkIn: string; checkOut: string }> = Object.fromEntries(
 Object.entries(hotelLivePrices).map(([name, p]) => [name, { checkIn: p.checkIn, checkOut: p.checkOut }]),
);
