/** 按行程实际住宿日期实查的酒店价格（USD）。
 * 数据来源：Trip.com 房型级实时价格，2 成人 1 间。
 * 查询时间：2026-09-24 20:15–21:35 PDT（21 家首批）；2026-09-26 07:43–08:26 PDT（30 家补齐，全站 51 家覆盖）；2026-09-27 06:59 PDT（新加坡 4 家按新行程日期 12/12–12/17 重查）；2026-09-27 08:51 PDT（普吉 6 家同日期 12/17–12/20 重查）；2026-09-27 08:54 PDT（清迈 6 家按新行程日期 12/23–12/25 重查）；2026-09-27 08:57 PDT（新加坡 Raffles/Ritz-Carlton/文华东方按 12/12–12/17 重查＋富丽敦套房补齐）；2026-09-27 09:04 PDT（曼谷 9 家按新行程日期 12/20–12/23 重查；2026-09-28 22:08–22:23 UTC（28 家行程酒店按新行程日期全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、曼谷 12/14–12/17、清迈 12/17–12/19；Raffles 新加坡该日期整店售罄）。
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
  checkIn: '2026-12-14', checkOut: '2026-12-17', nights: 3,
  base: { room: 'Athenee King Room（禁烟）', perNightUSD: 234, totalUSD: 747, totalInclTax: true, cancel: '12-13 23:59前免费取消', breakfast: '不含早（可选+$29.77）', note: 'Best price with free cancellation；Pay at hotel' },
  suite: { room: 'Athenee Suite（禁烟）', perNightUSD: 481, totalUSD: 1535, totalInclTax: true, cancel: '12-13 23:59前免费取消', breakfast: '含2份早餐', note: 'Pay at hotel' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:15 UTC',
 },
 'Anantara Chiang Mai': {
  checkIn: '2026-12-17', checkOut: '2026-12-19', nights: 2,
  base: { room: 'Deluxe Room With Garden View', perNightUSD: 482, totalUSD: 1035, totalInclTax: true, cancel: '不可退（Prepay online）', breakfast: '含2份早餐', note: 'Our last 3!' },
  suite: { room: 'Lanna Garden View Suite', perNightUSD: 699, totalUSD: 1499, totalInclTax: true, cancel: '不可退（Prepay online）', breakfast: '含2份早餐', note: 'Early bird price' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:19 UTC',
 },
 'Shangri-La Chiang Mai 清迈香格里拉': {
  checkIn: '2026-12-17', checkOut: '2026-12-19', nights: 2,
  base: { room: 'Deluxe King Room With Pool View', perNightUSD: 239, totalUSD: 513, totalInclTax: true, cancel: '12-16 18:00前免费取消（Prepay online）', breakfast: '不含早（可选+1.43）', note: '多晚14% off（原$281）；复验$239' },
  suite: { room: 'Executive King Suite', perNightUSD: 359, totalUSD: 771, totalInclTax: true, cancel: '12-16 18:00前免费取消（Prepay online）', breakfast: '含2份早餐', note: 'Our last 1!；多晚17% off（原$437）；Horizon Club' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:19 UTC',
 },
 'Chiang Mai Marriott Hotel 清迈万豪': {
  checkIn: '2026-12-17', checkOut: '2026-12-19', nights: 2,
  base: { room: 'Deluxe King - City View', perNightUSD: 213, totalUSD: 459, totalInclTax: true, cancel: '12-16 23:59前免费取消', breakfast: '不含早（可选+2.77）', note: 'pay at hotel / prepay online' },
  suite: { room: 'Executive Suite, 1 Bedroom, 1 King, Club Lounge Access', perNightUSD: 344, totalUSD: 742, totalInclTax: true, cancel: '12-16 23:59前免费取消', breakfast: '不含早（可选+2.77）', note: 'pay at hotel / prepay online' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:19 UTC',
 },
 'JW Marriott Phuket Resort & Spa 普吉JW万豪': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Guest Room, 2 Double, Garden View, Balcony', perNightUSD: 412, totalUSD: 1325, totalInclTax: true, cancel: '12-08 23:59前免费取消', breakfast: '不含早（可选+$31.56）', note: 'Pay at Hotel' },
  suite: { room: '1 Bedroom Suite, 1 King, Oceanfront, Private Pool', perNightUSD: 1440, totalUSD: 4633, totalInclTax: true, cancel: '12-08 23:59前免费取消', breakfast: '不含早（可选+$31.56）', note: 'Pay at Hotel' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:08 UTC',
 },
 'The Surin Phuket': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'One Bedroom Hillside Cottage', perNightUSD: 620, totalUSD: 1993, totalInclTax: true, cancel: '11-11 23:59前免费取消', breakfast: '含2份早餐', note: 'Our last 1!；11% off（原$703）；Last booked 6 hrs ago' },
  suite: { room: 'Beach Suite', perNightUSD: 1265, totalUSD: 4070, totalInclTax: true, cancel: '11-11 23:59前免费取消', breakfast: '含2份早餐', note: 'Our last 1!；11% off（原$1435）' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:08 UTC',
 },
 'Keemala': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Clay Pool Cottage', perNightUSD: 718, totalUSD: 2309, totalInclTax: true, cancel: '不可退', breakfast: '含2份早餐', note: 'Our last 3!；Early Bird 42% off（原$1275）；Pay at Hotel' },
  suite: null, suiteNote: '该日期无可订套房：仅1卧泳池别墅/小屋/树屋房型，无\'Suite\'命名房型',
  source: 'Trip.com', checkedAt: '2026-09-28 22:08 UTC',
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
  base: { room: 'Sea View Room King', perNightUSD: 488, totalUSD: 2661, totalInclTax: true, cancel: '12-04 18:00前免费取消（Prepay online）', breakfast: '不含早（可选+3.79/成人）', note: 'Last booked 3 hrs ago；355 ft² ocean view' },
  suite: { room: 'Family Suite', perNightUSD: 1031, totalUSD: 5617, totalInclTax: true, cancel: '12-04 18:00前免费取消（Prepay online）', breakfast: '不含早（可选+3.79/成人）', note: '882 ft² city view' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:23 UTC',
 },
 'Shangri-La Singapore 香格里拉': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Tower Wing Deluxe King Room', perNightUSD: 286, totalUSD: 1558, totalInclTax: true, cancel: '不可退（Prepay online；Early bird price）', breakfast: '不含早（可选+0.39/成人）', note: '409 ft² city view' },
  suite: { room: 'Horizon Club Junior Suite King', perNightUSD: 514, totalUSD: 2802, totalInclTax: true, cancel: '不可退（Prepay online；Early bird price）', breakfast: '含3份早餐（Horizon Club：早餐+下午茶+晚间鸡尾酒）' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:23 UTC',
 },
 'The Fullerton Hotel Singapore 新加坡富丽敦酒店': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Premier Courtyard Room', perNightUSD: 310, totalUSD: 1690, totalInclTax: true, cancel: '不可退（Prepay online；Early bird price）', breakfast: '不含早', note: 'Last booked 3 hrs ago；452 ft²' },
  suite: { room: 'Premier Collyer Suite', perNightUSD: 583, totalUSD: 3175, totalInclTax: true, cancel: '不可退（Prepay online；Early bird price）', breakfast: '含2份早餐', note: 'Our last 3!；699 ft²' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:23 UTC',
 },
 'The Ritz-Carlton, Millenia Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Deluxe Kallang King Room', perNightUSD: 413, totalUSD: 2252, totalInclTax: true, cancel: '09-30 23:59前免费取消（页面所示；Prepay online）', breakfast: '不含早（可选约+1.00/成人自助）', note: 'Last booked 3 hrs ago；548 ft² city view' },
  suite: { room: 'Club Deluxe King Suite, Club Lounge Access, High Floor', perNightUSD: 844, totalUSD: 4598, totalInclTax: true, cancel: '09-30 23:59前免费取消（页面所示；Prepay online）', breakfast: '含1份早餐', note: '969 ft²' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:23 UTC',
 },
 'The Ritz-Carlton, Bangkok': {
  checkIn: '2026-12-14', checkOut: '2026-12-17', nights: 3,
  base: { room: 'Deluxe King', perNightUSD: 348, totalUSD: 1230, totalInclTax: true, cancel: '12-13 23:59前免费取消', breakfast: '不含早（可选+$33.29）', note: 'Best price with free cancellation；Pay at hotel' },
  suite: null, suiteNote: '该日期无可订套房：房型列表仅Deluxe及Club Lounge房',
  source: 'Trip.com', checkedAt: '2026-09-28 22:15 UTC',
 },
 'The Peninsula Bangkok': {
  checkIn: '2026-12-14', checkOut: '2026-12-17', nights: 3,
  base: { room: 'Deluxe King Room', perNightUSD: 360, totalUSD: 1271, totalInclTax: true, cancel: '不可退', breakfast: '含2份早餐', note: 'Member deal 10% off（原$407）；Our last 4!；Prepay online' },
  suite: { room: 'Deluxe King Suite', perNightUSD: 531, totalUSD: 1874, totalInclTax: true, cancel: '不可退', breakfast: '含2份早餐', note: 'Member deal 10% off（原$600）；Our last 4!；Prepay online' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:15 UTC',
 },
 'Rosewood Bangkok': {
  checkIn: '2026-12-14', checkOut: '2026-12-17', nights: 3,
  base: { room: 'Deluxe Twin Room', perNightUSD: 328, totalUSD: 1046, totalInclTax: true, cancel: '12-07 18:00前免费取消', breakfast: '不含早（可选+$44.86）', note: 'Member deal 15% off（原$389）；Free Gift；Pay at hotel' },
  suite: { room: 'Premier Suite', perNightUSD: 652, totalUSD: 2080, totalInclTax: true, cancel: '12-07 18:00前免费取消', breakfast: '含1份早餐', note: 'Member deal 15% off（原$774）；页面注\'We recommend 2 rooms for your group\'；Prepay online' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:15 UTC',
 },
 '曼谷文华东方': {
  checkIn: '2026-12-14', checkOut: '2026-12-17', nights: 3,
  base: { room: 'Deluxe Premier King Room', perNightUSD: 796, totalUSD: 2540, totalInclTax: true, cancel: '12-13 18:00前免费取消', breakfast: '含2份早餐', note: 'USD 150 hotel credit per stay；Prepay online' },
  suite: { room: 'Junior King Suite With Terrace', perNightUSD: 1799, totalUSD: 5738, totalInclTax: true, cancel: '12-13 18:00前免费取消', breakfast: '不含早（可选+$63.07）', note: 'Member deal 6% off（原$1918）；Our last 2!；Prepay online' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:15 UTC',
 },
 'Capella Bangkok': {
  checkIn: '2026-12-14', checkOut: '2026-12-17', nights: 3,
  base: { room: 'Riverfront Premier King Room', perNightUSD: 940, totalUSD: 2999, totalInclTax: true, cancel: '12-09 15:00前免费取消', breakfast: '含2份早餐', note: 'Best price with breakfast and free cancellation；Prepay online' },
  suite: { room: 'Courtyard Suite', perNightUSD: 1448, totalUSD: 4618, totalInclTax: true, cancel: '12-09 15:00前免费取消', breakfast: '含2份早餐', note: 'Our last 1!；Prepay online' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:15 UTC',
 },
 'Aman Nai Lert Bangkok': {
  checkIn: '2026-12-14', checkOut: '2026-12-17', nights: 3,
  base: null, baseNote: '无标准房型：5种房型均为套房',
  suite: { room: 'Premier Suite', perNightUSD: 1943, totalUSD: 6197, totalInclTax: true, cancel: '不可退', breakfast: '含2份早餐', note: 'Best price with breakfast；含free minibar+机场快速通道+礼宾车；Prepay online' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:15 UTC',
 },
 'Four Seasons Bangkok': {
  checkIn: '2026-12-14', checkOut: '2026-12-17', nights: 3,
  base: { room: 'Deluxe Room - King', perNightUSD: 692, totalUSD: 2207, totalInclTax: true, cancel: '12-13 15:00前免费取消', breakfast: '不含早（可选+$47.30）', note: 'Best price with free cancellation；Our last 1!；Prepay online' },
  suite: null, suiteNote: '该日期无可订套房：仅Deluxe及Premier Riverview房型',
  source: 'Trip.com', checkedAt: '2026-09-28 22:15 UTC',
 },
 'The Siam': {
  checkIn: '2026-12-14', checkOut: '2026-12-17', nights: 3,
  base: null, baseNote: '无标准房型：均为套房/别墅',
  suite: { room: 'Siam Suite', perNightUSD: 636, totalUSD: 2029, totalInclTax: true, cancel: '不可退', breakfast: '含2份早餐', note: 'Special Discount 9% off（原$702）；Prepay online' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:15 UTC',
 },
 '137 Pillars House': {
  checkIn: '2026-12-17', checkOut: '2026-12-19', nights: 2,
  base: null, baseNote: '无标准房型：所列房型均为套房',
  suite: { room: 'Rajah Brooke Suite', perNightUSD: 556, totalUSD: 1321, totalInclTax: true, cancel: '11-25 01:00前免费取消（Prepay online）', breakfast: '含2份早餐', note: 'Our last 5!' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:19 UTC',
 },
 'Four Seasons Resort Chiang Mai': {
  checkIn: '2026-12-17', checkOut: '2026-12-19', nights: 2,
  base: { room: 'Garden View Pavilion King', perNightUSD: 974, totalUSD: 2089, totalInclTax: true, cancel: '不可退（Prepay online）', breakfast: '含2份早餐', note: 'Our last 1!（会话中US$880价已消失，$974为复验最新价）' },
  suite: { room: 'Pool Villa', perNightUSD: 1747, totalUSD: 3747, totalInclTax: true, cancel: '12-10 15:00前免费取消（Prepay online）', breakfast: '含2份早餐', note: 'Our last 1!' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:19 UTC',
 },
 'Raya Heritage': {
  checkIn: '2026-12-17', checkOut: '2026-12-19', nights: 2,
  base: null, baseNote: '无标准房型：所列房型均为套房',
  suite: { room: 'Rin Suite with Terrace', perNightUSD: 461, totalUSD: 988, totalInclTax: true, cancel: '11-26 23:59前免费取消（Prepay online）', breakfast: '含2份早餐', note: 'Our last 1!；含酒店package' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:19 UTC',
 },
 'Amanpuri': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Garden Pool Pavilion', perNightUSD: 2800, totalUSD: 9971, totalInclTax: true, cancel: '11-10 23:59前免费取消', breakfast: '含2份早餐', note: 'Our last 1!' },
  suite: { room: 'Pool Pavilion 2 Bedroom', perNightUSD: 6800, totalUSD: 24215, totalInclTax: true, cancel: '11-10 23:59前免费取消', breakfast: '含2份早餐', note: 'Our last 1!；Amanpuri无名\'Suite\'房型，此为最便宜多卧可订单元' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:08 UTC',
 },
 'Trisara': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Ocean View Pool Villa', perNightUSD: 1957, totalUSD: 6968, totalInclTax: true, cancel: '11-26 23:59前免费取消', breakfast: '含2份早餐', note: 'Our last 5!' },
  suite: { room: 'Signature Ocean View Pool Suite', perNightUSD: 2790, totalUSD: 9935, totalInclTax: true, cancel: '11-26 23:59前免费取消', breakfast: '含2份早餐', note: 'Our last 2!' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:08 UTC',
 },
 'Banyan Tree Phuket': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Banyan Pool Villa', perNightUSD: 689, totalUSD: 2453, totalInclTax: true, cancel: 'US$689计划不可退；免费取消计划US$861/晚（11-27 23:59前）', breakfast: '含2份早餐', note: 'Last booked 7 hrs ago' },
  suite: { room: 'Signature Two Bedroom Pool Villa', perNightUSD: 1184, totalUSD: 4215, totalInclTax: true, cancel: 'US$1184计划不可退；免费取消计划US$1480/晚（11-27 23:59前）', breakfast: '含4份早餐', note: '无\'仅剩X间\'标记；物业无\'Suite\'命名房型，此为最便宜双卧可订单元' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:08 UTC',
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
  base: { room: 'Premier Twin Room With Garden View', perNightUSD: 1174, totalUSD: 7038, totalInclTax: true, cancel: '12-02 23:59前免费取消（Prepay online）', breakfast: '不含早（可选+3.82/成人）', note: 'Trip Coins US$351.90；77㎡ garden view' },
  suite: { room: 'Sentosa Suite', perNightUSD: 1565, totalUSD: 9384, totalInclTax: true, cancel: '12-02 23:59前免费取消（Prepay online）', breakfast: '不含早（可选+3.82/成人）', note: 'Our last 5!；86㎡ ocean view' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:23 UTC',
 },
 'Raffles Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: null, baseNote: '该日期整店售罄（sold out）：12/06–12/11 无可订房',
  suite: null, suiteNote: '该日期整店售罄（sold out）',
  unavailable: '整店售罄：12/06–12/11 无房可订（Raffles为全套房酒店，115间/套）',
  source: 'Trip.com', checkedAt: '2026-09-28 22:23 UTC',
 },
 'Marina Bay Sands': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Sands Premier King', perNightUSD: 697, totalUSD: 3801, totalInclTax: true, cancel: '12-04 23:59前免费取消（Prepay online；连住早鸟价）', breakfast: '含2份早餐' },
  suite: { room: 'Sands Bay Suite King Gardens By The Bay View', perNightUSD: 1317, totalUSD: 7176, totalInclTax: true, cancel: '12-04 23:59前免费取消（Prepay online；连住早鸟价）', breakfast: '含2份早餐', note: '645 ft²' },
  source: 'Trip.com', checkedAt: '2026-09-28 22:23 UTC',
 },
};

export function getLiveHotelPrice(name: string): LiveHotelPrice | undefined {
 return hotelLivePrices[name];
}

/** 当前价格数据覆盖的行程住宿日期快照（行程变化检测用） */
export const livePriceStayDates: Record<string, { checkIn: string; checkOut: string }> = Object.fromEntries(
 Object.entries(hotelLivePrices).map(([name, p]) => [name, { checkIn: p.checkIn, checkOut: p.checkOut }]),
);
