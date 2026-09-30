/** 按行程实际住宿日期实查的酒店价格（USD）。
 * 数据来源：Trip.com 房型级实时价格，2 成人 1 间。
 * 查询时间：2026-09-24 20:15–21:35 PDT（21 家首批）；2026-09-26 07:43–08:26 PDT（30 家补齐，全站 51 家覆盖）；2026-09-27 06:59 PDT（新加坡 4 家按新行程日期 12/12–12/17 重查）；2026-09-27 08:51 PDT（普吉 6 家同日期 12/17–12/20 重查）；2026-09-27 08:54 PDT（清迈 6 家按新行程日期 12/23–12/25 重查）；2026-09-27 08:57 PDT（新加坡 Raffles/Ritz-Carlton/文华东方按 12/12–12/17 重查＋富丽敦套房补齐）；2026-09-27 09:04 PDT（曼谷 9 家按新行程日期 12/20–12/23 重查；2026-09-28 22:08–22:23 UTC（28 家行程酒店按新行程日期全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、曼谷 12/14–12/17、清迈 12/17–12/19；Raffles 新加坡该日期整店售罄）。
 * 2026-09-29 13:37–13:48 UTC（28 家行程酒店全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、曼谷 12/14–12/17、清迈 12/17–12/19；Raffles 新加坡该日期仍整店售罄）。
 * 价格为动态数据：行程日期变化或定期刷新时由 hotel-price-watch 任务重查并更新本文件。
 * 2026-09-30 site-improve：曼谷 9 家（查 12/14–12/17）与清迈 6 家（查 12/17–12/19）为旧行程顺序（曼谷→清迈）日期，用户当前行程为清迈 12/14–12/16、曼谷 12/16–12/19，已标 dateMismatch；待 hotel-price-watch 按新行程重查后清除该标记。
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
  /** 行程日期调整后查询日期已错位：价格真实但非当前行程日期，仅供参考 */
  dateMismatch?: boolean;
  source: string;
  /** 查询时间（UTC） */
  checkedAt: string;
}

export const hotelLivePrices: Record<string, LiveHotelPrice> = {
 'The Athenee Hotel, a Luxury Collection Hotel, Bangkok 曼谷雅典娜豪华精选酒店': {
  checkIn: '2026-12-14', checkOut: '2026-12-17', nights: 3,
  base: { room: 'Athenee King Room Non smoking', perNightUSD: 234, totalUSD: 747, totalInclTax: true, cancel: 'Free cancellation before 11:59 PM, Dec 13', breakfast: 'Not included (optional $29.81)', note: 'Instant confirmation; pay at hotel or prepay online; earn $7.48 Trip Coins' },
  suite: { room: 'Athenee Suite Non smoking', perNightUSD: 432, totalUSD: 1379, totalInclTax: true, cancel: 'Free cancellation before 11:59 PM, Dec 13', breakfast: 'Includes 2 great breakfasts', note: '925 ft²; instant confirmation; pay at hotel; earn $13.79 Trip Coins' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:46 UTC',
  dateMismatch: true,
 },
 'Anantara Chiang Mai': {
  checkIn: '2026-12-17', checkOut: '2026-12-19', nights: 2,
  base: { room: 'Deluxe Room With Garden View', perNightUSD: 451, totalUSD: 1070, totalInclTax: true, cancel: '不可退款', breakfast: '含2人丰盛早餐', note: '$451/晚为到店付价格（预付价 $499/晚）；即时确认' },
  suite: { room: 'Lanna Garden View Suite', perNightUSD: 604, totalUSD: 1295, totalInclTax: true, cancel: '不可退款', breakfast: '含2人丰盛早餐', note: '早鸟价；在线预付；即时确认（房费 $1,090.83 + 服务费 $116.71 + 税费 $87.27）' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:37 UTC',
  dateMismatch: true,
 },
 'Shangri-La Chiang Mai 清迈香格里拉': {
  checkIn: '2026-12-17', checkOut: '2026-12-19', nights: 2,
  base: { room: 'Deluxe King Room With Pool View', perNightUSD: 239, totalUSD: 513, totalInclTax: true, cancel: '12月16日下午6:00前免费取消', breakfast: '早餐可选，$21.48/份', note: '连住优惠85折（原价 $282）；在线预付；即时确认' },
  suite: { room: 'Executive King Suite', perNightUSD: 360, totalUSD: 771, totalInclTax: true, cancel: '12月16日下午6:00前免费取消', breakfast: '含2人丰盛早餐', note: '仅剩1间；连住优惠83折（原价 $437）；含 Horizon 行政酒廊礼遇；在线预付；即时确认' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:37 UTC',
  dateMismatch: true,
 },
 'Chiang Mai Marriott Hotel 清迈万豪': {
  checkIn: '2026-12-17', checkOut: '2026-12-19', nights: 2,
  base: { room: 'Deluxe King - City View', perNightUSD: 213, totalUSD: 460, totalInclTax: true, cancel: '12月16日晚上11:59前免费取消', breakfast: '早餐可选，$22.83/份（含早价 $228/晚，总价 $492）', note: '到店付；即时确认' },
  suite: { room: 'Executive Suite, 1 Bedroom, 1 King, Club Lounge Access', perNightUSD: 344, totalUSD: 743, totalInclTax: true, cancel: '12月16日晚上11:59前免费取消', breakfast: '早餐可选，$22.83/份', note: '含 M Club 行政酒廊礼遇；到店付；即时确认' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:37 UTC',
  dateMismatch: true,
 },
 'JW Marriott Phuket Resort & Spa 普吉JW万豪': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Guest Room, 2 Double, Garden View, Balcony', perNightUSD: 412, totalUSD: 1327, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 8', breakfast: '早餐可选 $31.63（另付）', note: '最便宜可订房型的最低价方案（早餐可选另付 $31.63、到店付、即时确认）' },
  suite: { room: '1 Bedroom Suite, 1 King, Oceanfront, Private Pool', perNightUSD: 1442, totalUSD: 4638, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 8', breakfast: '早餐可选 $31.60（另付）', note: '房名含 Suite 的最便宜房型（早餐可选另付 $31.60、到店付、即时确认）' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:43 UTC',
 },
 'The Surin Phuket': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'One Bedroom Hillside Cottage', perNightUSD: 614, totalUSD: 1974, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 11', breakfast: '含2份早餐', note: 'Our last 1!；最便宜可订房型的最低价方案（含早、免费取消、在线预付、即时确认、Special Discount 12% off）' },
  suite: { room: 'Beach Suite', perNightUSD: 1253, totalUSD: 4030, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 11', breakfast: '含2份早餐', note: 'Our last 1!；房名含 Suite 的最便宜房型（含早、免费取消、在线预付、即时确认、Special Discount 12% off）' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:43 UTC',
 },
 'Keemala': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Clay Pool Cottage', perNightUSD: 772, totalUSD: 2482, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含2份早餐', note: 'Our last 5!；Trip.com 标注 best price 方案（含早、不可退款、在线预付、即时确认）' },
  suite: { room: 'Tent Pool Villa', perNightUSD: 854, totalUSD: 2746, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含2份早餐', note: 'Our last 5!' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:43 UTC',
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
  base: { room: 'Sea View Room King', perNightUSD: 488, totalUSD: 2660, totalInclTax: true, cancel: 'Free cancellation before 6:00 PM, Dec 4', breakfast: '不含早（可选 $33.79/人）', note: '在线预付；Best price with free cancellation' },
  suite: { room: 'Family Suite', perNightUSD: 1281, totalUSD: 6980, totalInclTax: true, cancel: 'Free cancellation before 6:00 PM, Dec 4', breakfast: '含1份早餐', note: '在线预付；页面单人价口径（多房选择器），2成人建议订2间' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:45 UTC',
 },
 'Shangri-La Singapore 香格里拉': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Tower Wing Deluxe King Room', perNightUSD: 286, totalUSD: 1558, totalInclTax: true, cancel: 'Non-refundable', breakfast: '不含早（可选 $40.40/人）', note: '在线预付；早鸟价。免费取消替代价 $357/晚（到店付，12月5日18:00前免费取消）' },
  suite: { room: 'Horizon Club Junior Suite King', perNightUSD: 514, totalUSD: 2801, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含3份早餐', note: '在线预付；早鸟价；页面显示3成人价口径' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:45 UTC',
 },
 'The Fullerton Hotel Singapore 新加坡富丽敦酒店': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Premier Courtyard Room', perNightUSD: 310, totalUSD: 1689, totalInclTax: true, cancel: 'Non-refundable', breakfast: '不含早（成人早餐询酒店；7–12岁儿童约 SGD 28 ≈ $21.92）', note: '在线预付；早鸟价；Today\'s best price!' },
  suite: { room: 'Premier Collyer Suite', perNightUSD: 582, totalUSD: 3174, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含2份早餐', note: '在线预付；\'Our last 3!\'' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:45 UTC',
 },
 'The Ritz-Carlton, Millenia Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Deluxe Kallang King Room', perNightUSD: 413, totalUSD: 2252, totalInclTax: true, cancel: 'Free cancellation before 11:59 PM, Sep 30', breakfast: '不含早（可选 $61.02/人；或 $465/晚含2早价）', note: '在线预付；Best price with free cancellation' },
  suite: { room: 'Club Deluxe King Suite, Club Lounge Access, High Floor', perNightUSD: 844, totalUSD: 4598, totalInclTax: true, cancel: 'Free cancellation before 11:59 PM, Sep 30', breakfast: '含1份早餐', note: '在线预付；页面单人价口径，建议2成人订2间' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:45 UTC',
 },
 'The Ritz-Carlton, Bangkok': {
  checkIn: '2026-12-14', checkOut: '2026-12-17', nights: 3,
  base: { room: 'Deluxe King', perNightUSD: 386, totalUSD: 1231, totalInclTax: true, cancel: 'Free cancellation before 11:59 PM, Dec 13', breakfast: 'Not included (optional $33.37)', note: 'Instant confirmation; pay at hotel or prepay online' },
  suite: null, suiteNote: 'Trip.com 未显示该日期的可订套房房型（展开后共11种房型，仅 Deluxe/Club 标准房）',
  source: 'Trip.com', checkedAt: '2026-09-29 13:46 UTC',
  dateMismatch: true,
 },
 'The Peninsula Bangkok': {
  checkIn: '2026-12-14', checkOut: '2026-12-17', nights: 3,
  base: { room: 'Deluxe King Room', perNightUSD: 399, totalUSD: 1272, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Member deal 10% off (original $446); \'Our last 4!\'; instant confirmation; prepay online; earn $63.60 Trip Coins' },
  suite: { room: 'Deluxe King Suite', perNightUSD: 588, totalUSD: 1876, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Member deal 10% off (original $658); \'Our last 4!\'; 796 ft² river view; instant confirmation; prepay online; earn $93.80 Trip Coins' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:46 UTC',
  dateMismatch: true,
 },
 'Rosewood Bangkok': {
  checkIn: '2026-12-14', checkOut: '2026-12-17', nights: 3,
  base: { room: 'Deluxe Twin Room', perNightUSD: 328, totalUSD: 1047, totalInclTax: true, cancel: 'Free cancellation before 6:00 PM, Dec 7', breakfast: 'Not included (optional $44.97)', note: 'Member deal 15% off (original $390); instant confirmation; pay at hotel or prepay online; free gift; earn $10.48 Trip Coins' },
  suite: { room: 'Premier Suite', perNightUSD: 589, totalUSD: 1880, totalInclTax: true, cancel: 'Free cancellation before 6:00 PM, Dec 7', breakfast: 'Not included (optional $44.97)', note: 'Member deal 15% off (original $700); \'Our last 5!\'; 645 ft²; free minibar + welcome fruits; butler service; instant confirmation; pay at hotel' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:46 UTC',
  dateMismatch: true,
 },
 '曼谷文华东方': {
  checkIn: '2026-12-14', checkOut: '2026-12-17', nights: 3,
  base: { room: 'Deluxe Premier King Room', perNightUSD: 814, totalUSD: 2596, totalInclTax: true, cancel: 'Free cancellation before 6:00 PM, Dec 13', breakfast: 'Includes 2 great breakfasts', note: 'Instant confirmation; prepay online; earn $25.96 Trip Coins; USD 150 hotel credit per stay' },
  suite: { room: 'Junior King Suite With Terrace', perNightUSD: 1811, totalUSD: 5778, totalInclTax: true, cancel: 'Free cancellation before 6:00 PM, Dec 13', breakfast: 'Not included (optional $63.22)', note: 'Member deal 6% off (original $1,929); \'Our last 2!\'; 1044 ft² terrace; instant confirmation; prepay online; earn $57.78 Trip Coins' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:46 UTC',
  dateMismatch: true,
 },
 'Capella Bangkok': {
  checkIn: '2026-12-14', checkOut: '2026-12-17', nights: 3,
  base: { room: 'Riverfront King Room', perNightUSD: 905, totalUSD: 2887, totalInclTax: true, cancel: 'Free cancellation before 3:00 PM, Dec 9', breakfast: 'Includes 2 great breakfasts', note: '\'Our last 1!\'; instant confirmation; prepay online; earn $144.36 Trip Coins' },
  suite: { room: 'Courtyard Suite', perNightUSD: 1447, totalUSD: 4616, totalInclTax: true, cancel: 'Free cancellation before 3:00 PM, Dec 9', breakfast: 'Includes 2 great breakfasts', note: '\'Our last 1!\'; 1087 ft² pool view; instant confirmation; prepay online; earn $230.83 Trip Coins' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:46 UTC',
  dateMismatch: true,
 },
 'Aman Nai Lert Bangkok': {
  checkIn: '2026-12-14', checkOut: '2026-12-17', nights: 3,
  base: null, baseNote: 'Aman Nai Lert Bangkok 是纯套房酒店——所有房型均为套房（Premier Suite、Corner Suite、Premier Corner Suite、Terrace Suite、Aman Suite），无标准/非套房房型',
  suite: { room: 'Premier Suite', perNightUSD: 1943, totalUSD: 6197, totalInclTax: true, cancel: 'Non-refundable (free-cancellation option at $2,159/night, before 11:59 PM Dec 11)', breakfast: 'Includes 2 great breakfasts', note: 'Instant confirmation; prepay online; earn $92.96 Trip Coins; includes airport limousine transfer, butler service, wellness access' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:46 UTC',
  dateMismatch: true,
 },
 'Four Seasons Bangkok': {
  checkIn: '2026-12-14', checkOut: '2026-12-17', nights: 3,
  base: { room: 'Deluxe Room - King', perNightUSD: 693, totalUSD: 2210, totalInclTax: true, cancel: 'Free cancellation before 3:00 PM, Dec 13', breakfast: 'Not included (optional $47.37)', note: '\'Our last 1!\'; instant confirmation; prepay online（同价另有 Deluxe Palm Court Room - King/Twin、Deluxe Room - Twin）' },
  suite: null, suiteNote: 'Trip.com 未显示该日期的可订套房房型（展开后共8种房型，仅 Deluxe / Premier Riverview 标准房）',
  source: 'Trip.com', checkedAt: '2026-09-29 13:46 UTC',
  dateMismatch: true,
 },
 'The Siam': {
  checkIn: '2026-12-14', checkOut: '2026-12-17', nights: 3,
  base: null, baseNote: 'The Siam 是纯套房酒店——所有房型均为套房/泳池别墅（Siam Suite、Garden View Suite、Premier Garden View Suite、River View Suite、Premier River View Suite、Courtyard Pool Villa），无标准/非套房房型',
  suite: { room: 'Siam Suite', perNightUSD: 622, totalUSD: 1985, totalInclTax: true, cancel: 'Non-refundable', breakfast: 'Includes 2 great breakfasts', note: 'Special Discount 11% off (original $703); 861 ft²; free minibar; boat transfer service; instant confirmation; prepay online' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:46 UTC',
  dateMismatch: true,
 },
 '137 Pillars House': {
  checkIn: '2026-12-17', checkOut: '2026-12-19', nights: 2,
  base: null, baseNote: '纯套房酒店，无标准房型；所有房型均为套房。',
  suite: { room: 'Rajah Brooke Suite', perNightUSD: 597, totalUSD: 1280, totalInclTax: true, cancel: '11月25日凌晨1:00前免费取消', breakfast: '含2人丰盛早餐', note: '仅剩5间；在线预付；5分钟内确认' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:37 UTC',
  dateMismatch: true,
 },
 'Four Seasons Resort Chiang Mai': {
  checkIn: '2026-12-17', checkOut: '2026-12-19', nights: 2,
  base: { room: 'Garden View Pavilion King', perNightUSD: 975, totalUSD: 2091, totalInclTax: true, cancel: '不可退款', breakfast: '含2人丰盛早餐', note: '仅剩1间；在线预付；即时确认' },
  suite: null, suiteNote: '无以\'Suite\'命名的房型；高端房型为 Upper Rice Terrace Pavilion King/Twin（$1,369/晚）和 Pool Villa（$1,749/晚，免费取消）。',
  source: 'Trip.com', checkedAt: '2026-09-29 13:37 UTC',
  dateMismatch: true,
 },
 'Raya Heritage': {
  checkIn: '2026-12-17', checkOut: '2026-12-19', nights: 2,
  base: null, baseNote: '纯套房酒店，无标准房型；所有房型均为套房。',
  suite: { room: 'Rin Suite with Terrace', perNightUSD: 446, totalUSD: 990, totalInclTax: true, cancel: '11月26日下午6:00前免费取消（到店付价）；11月26日晚上11:59前免费取消（预付价）', breakfast: '含2人丰盛早餐', note: '仅剩1间；$446/晚为到店付价格，预付价 $461/晚；列表页显示该房型总价 $990（含税费）' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:37 UTC',
  dateMismatch: true,
 },
 'Amanpuri': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Garden Pool Pavilion', perNightUSD: 3100, totalUSD: 9971, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 10', breakfast: '含2份早餐', note: 'Our last 1!；Trip.com 最低价方案（best price），含早、免费取消、在线预付、即时确认' },
  suite: { room: 'Partial Ocean Pool Pavilion', perNightUSD: 4096, totalUSD: 13176, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 10', breakfast: '含2份早餐', note: 'Our last 5!' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:43 UTC',
 },
 'Trisara': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Ocean View Pool Villa', perNightUSD: 2154, totalUSD: 6930, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 26', breakfast: '含2份早餐', note: 'Our last 5!；最低价方案（含早、免费取消、在线预付、即时确认）；同房型到店付 $2,002/晚方案总价更高未采用' },
  suite: { room: 'Signature Ocean View Pool Suite', perNightUSD: 3068, totalUSD: 9871, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 26', breakfast: '含2份早餐', note: 'Our last 2!；房名含 Suite 的最便宜房型' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:43 UTC',
 },
 'Banyan Tree Phuket': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Banyan Pool Villa', perNightUSD: 763, totalUSD: 2456, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含2份早餐', note: '最便宜可订房型的最低价方案（含早、不可退款、在线预付、即时确认）' },
  suite: { room: 'Serenity Pool Villa', perNightUSD: 830, totalUSD: 2670, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含2份早餐' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:43 UTC',
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
  base: { room: 'Premier Twin Room With Garden View', perNightUSD: 1174, totalUSD: 7037, totalInclTax: true, cancel: 'Free cancellation before 6:00 PM, Dec 3', breakfast: '不含早（可选 $63.84/人）', note: '到店付最低价；预付免费取消价 $1,291/晚，同含税总价' },
  suite: { room: 'Sentosa Suite', perNightUSD: 1565, totalUSD: 9368, totalInclTax: true, cancel: 'Free cancellation before 6:00 PM, Dec 3', breakfast: '不含早（可选 $63.84/人）', note: 'Our last 5!；预付 $1,722/晚，同含税总价' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:45 UTC',
 },
 'Raffles Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: null, baseNote: '整店售罄：12/06–12/11 无可订房',
  suite: null, suiteNote: '整店售罄：12/06–12/11 无可订房',
  unavailable: '整店售罄：12/06–12/11 Trip.com 无房可订（仅邻近日 12/02–12/05 有房，$1,285/晚起）',
  source: 'Trip.com', checkedAt: '2026-09-29 13:45 UTC',
 },
 'Marina Bay Sands': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Sands Premier King', perNightUSD: 697, totalUSD: 3800, totalInclTax: true, cancel: 'Free cancellation before 11:59 PM, Dec 4', breakfast: '含2份早餐', note: '在线预付；早鸟多晚价。Sands Premier Double Queen 同价，\'Our last 1!\'' },
  suite: { room: 'Sands Bay Suite King Gardens By The Bay View', perNightUSD: 1317, totalUSD: 7175, totalInclTax: true, cancel: 'Free cancellation before 11:59 PM, Dec 4', breakfast: '含2份早餐', note: '在线预付' },
  source: 'Trip.com', checkedAt: '2026-09-29 13:45 UTC',
 },
};

export function getLiveHotelPrice(name: string): LiveHotelPrice | undefined {
 return hotelLivePrices[name];
}

/** 当前价格数据覆盖的行程住宿日期快照（行程变化检测用） */
export const livePriceStayDates: Record<string, { checkIn: string; checkOut: string }> = Object.fromEntries(
 Object.entries(hotelLivePrices).map(([name, p]) => [name, { checkIn: p.checkIn, checkOut: p.checkOut }]),
);
