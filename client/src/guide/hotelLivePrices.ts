/** 按行程实际住宿日期实查的酒店价格（USD）。
 * 数据来源：Trip.com 房型级实时价格，2 成人 1 间。
 * 查询时间：2026-09-24 20:15–21:35 PDT（21 家首批）；2026-09-26 07:43–08:26 PDT（30 家补齐，全站 51 家覆盖）；2026-09-27 06:59 PDT（新加坡 4 家按新行程日期 12/12–12/17 重查）；2026-09-27 08:51 PDT（普吉 6 家同日期 12/17–12/20 重查）；2026-09-27 08:54 PDT（清迈 6 家按新行程日期 12/23–12/25 重查）；2026-09-27 08:57 PDT（新加坡 Raffles/Ritz-Carlton/文华东方按 12/12–12/17 重查＋富丽敦套房补齐）；2026-09-27 09:04 PDT（曼谷 9 家按新行程日期 12/20–12/23 重查；2026-09-28 22:08–22:23 UTC（28 家行程酒店按新行程日期全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、曼谷 12/14–12/17、清迈 12/17–12/19；Raffles 新加坡该日期整店售罄）。
 * 2026-09-29 13:37–13:48 UTC（28 家行程酒店全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、曼谷 12/14–12/17、清迈 12/17–12/19；Raffles 新加坡该日期仍整店售罄）。
 * 2026-10-10 2026-10-10T13:35:00Z–2026-10-10T15:59:00Z（31 家行程酒店全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、清迈 12/14–12/16、曼谷 12/16–12/19；全程未登录、Trip.com 无登录墙/验证码；3家baselineUrl补正重抓（q参数修正，价格一致）；页面未显示数字总价的不做机械相乘（totalUSD=null、totalInclTax='unknown'））
 * 2026-10-12 2026-10-11T22:32–23:00Z（31 家行程酒店全量重查：新加坡 12/06–12/11、普吉 12/11–12/14、清迈 12/14–12/16、曼谷 12/16–12/19；Trip.com英文站公开价+Google Hotels基准，全程未登录、无登录墙/验证码；页面未显示数字总价的不做机械相乘（totalUSD=null、totalInclTax='unknown'））
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
  base: { room: 'Premier Twin Room With Garden View', perNightUSD: 1171, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 3', breakfast: '需付费', note: 'Pay at hotel 到店付；Children stay for free；页面 \'Best price\' 卡另有 $1,288/晚预付价（5晚总价 $7,019，1 room × 5 nights incl. taxes & fees）；Trip.com 早餐 Great breakfast for $63.69 (optional)' },
  baseNote: '详情页该房型最低价为 $1,171/晚（到店付）；$7,019 总价对应的是 $1,288/晚预付价，故 $1,171 价无页面总价，totalUSD 记 null',
  suite: { room: 'Sentosa Suite', perNightUSD: 1561, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 3', breakfast: '需付费', note: 'Pay at hotel 到店付；Children stay for free；另有 $1,717/晚预付价' },
  suiteNote: '房型名含 \'Suite\' 的最便宜可订房型为 Sentosa Suite（$1,561/晚）；Capella Suite $1,795/晚更贵',
  baselineUSD: 4383, baselineCheckedAt: '2026-10-11T22:56:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=capella%20singapore&qs=CAAgASgA&ts=CAESEAoCCAMKAggDCgQIAhAMEAEaGhIYEhIKBwjqDxAMGAYSBwjqDxAMGAsyAggCKgkKBToDVVNEGgA&ved=0CAAQ5JsGahcKEwjIs5qdgrOXAxUAAAAAHQAAAAAQBw',
  source: 'Trip.com', checkedAt: '2026-10-11T22:56:00Z',
 },
  'Raffles Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: null,
  baseNote: 'Trip.com 整店无房',
  suite: null,
  suiteNote: 'Trip.com 整店无房',
  unavailable: 'No rooms available for your selected dates. You can still book for the following dates:',
  baselineUrl: 'https://www.google.com/travel/search?q=raffles%20singapore&qs=CAEgASgAMiJDaFVJd3IzenN0dUl6cjlrR2drdmJTOHdNMncyTXpBUUFRSAA&ts=CAESEAoCCAMKAggDCgQIAhAMEAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgLGAUyAggBKgkKBToDVVNEGgA&ap=KigKEglvXOcioKz0PxGzMWV8kfZZQBISCaQZkYskwfQ_EbMxZbDV9llAMAC6AQhvdmVydmlldw&ved=0CAAQ5JsGahgKEwi47ZqGgLOXAxUAAAAAHQAAAAAQ6wI',
  source: 'Trip.com', checkedAt: '2026-10-11T22:56:00Z',
 },
  'Marina Bay Sands': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Sands Premier King', perNightUSD: 695, totalUSD: 3790, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts；Children stay for free；Prepay online；Exclusive price for multi-night stays · Early bird price' },
  baseNote: '详情页 \'Best price with breakfast and free cancellation\' 卡：$695/晚，Total price $3,790，1 room × 5 nights incl. taxes & fees',
  suite: { room: 'Sands Bay Suite King Gardens By The Bay View', perNightUSD: 1313, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts；Children stay for free；另有 $1,382 含接机+套房礼遇价' },
  suiteNote: '房型名含 \'Suite\' 的最便宜可订房型；Sands Bay Suite Double Queen 同价 $1,313',
  baselineUSD: 651, baselineCheckedAt: '2026-10-11T22:56:00Z',
  baselineUrl: 'https://www.google.com/travel/hotels/entity/ChUI17vV0u_fprYCGgkvbS8wZGQ5MDMQAQ?ap=KigKEglvXOcioKz0PxGzMaXTkPZZQBISCaQZkYskwfQ_EbMxJVnW9llAMAE&ved=0CAAQ5JsGahgKEwi47ZqGgLOXAxUAAAAAHQAAAAAQpQQ&ts=CAESEAoCCAMKAggDCgQIAhAMEAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgLGAUyAggBKgkKBToDVVNEGgA',
  source: 'Trip.com', checkedAt: '2026-10-11T22:56:00Z',
 },
  'The Ritz-Carlton, Millenia Singapore': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Deluxe Kallang King Room', perNightUSD: 498, totalUSD: 2714, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Oct 13', breakfast: '需付费', note: 'Great breakfast for $60.88 (optional)；Prepay online；房型标注 \'3 adults\'；另有 $550 含2份早餐价；注意免费取消截止为 10 月 13 日 23:59（早于入住日）' },
  baseNote: '详情页 \'Best price with free cancellation\' 卡：$498/晚；列表页显示 Total price $2,714（1 room × 5 nights incl. taxes & fees）',
  suite: { room: 'Club Deluxe King Suite, Club Lounge Access, High Floor', perNightUSD: 841, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Oct 13', breakfast: '含免费早餐', note: '$841 为 \'1 adult\' 含1份早餐价；页面所有套房均标注 \'1 adult\'/\'2 adults\' 且提示 \'We recommend 2 rooms for your group\'，无标注适配 2 大 1 小 1 间房的套房价；2 成人含早价 $876' },
  suiteNote: '展开所有房型后，房型名含 \'Suite\' 的最低价为 Club Deluxe King Suite $841/晚（1 成人价）；其余套房（Club Premier King Suite $949、One Bedroom Millenia King Suite $1,288 等）更贵',
  baselineUSD: 498, baselineCheckedAt: '2026-10-11T22:56:00Z',
  baselineUrl: 'https://www.google.com/travel/hotels/entity/ChYI356X_oXolLmuARoJL20vMGJ6X2I0EAE?ap=KigKEglvXOcioKz0PxGzMaXTkPZZQBISCaQZkYskwfQ_EbMxJVnW9llAMAE&ved=0CAAQ5JsGahcKEwiw4I_lgbOXAxUAAAAAHQAAAAAQAg&ts=CAESEAoCCAMKAggDCgQIAhAMEAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgLGAUyAggBKgkKBToDVVNEGgA&utm_campaign=sharing&utm_medium=link&utm_source=htls',
  source: 'Trip.com', checkedAt: '2026-10-11T22:56:00Z',
 },
  'Mandarin Oriental Singapore 文华东方': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Sea View Room King', perNightUSD: 574, totalUSD: 3130, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 4', breakfast: '需付费', note: 'Great breakfast for $33.72 (optional)；Prepay online；Earn $156.49 in Trip Coins；房型标注 \'3 adults\'；另有 $753 含3份早餐价；酒店早餐政策：12 岁及以下儿童免费，但房型价中早餐另付 $33.72/人' },
  baseNote: '列表页及详情页 \'Best price\' 卡均为 $574/晚；列表页显示 Total price $3,130（1 room × 5 nights incl. taxes & fees）',
  suite: { room: 'Family Suite', perNightUSD: 977, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 4', breakfast: '需付费', note: 'Great breakfast for $33.72 (optional)；该房型价格标注 \'2 adults\' 且页面提示 \'We recommend 2 rooms for your group\'，1 间房容纳 2 大 1 小存疑；另有含早价 $1,277' },
  suiteNote: '展开所有房型后，房型名含 \'Suite\' 的最低价为 Family Suite $977/晚；其余套房（Family Suite Twin $998、Sea View Suite With Balcony $1,157 等）更贵且同样标注 2 成人',
  baselineUSD: 352, baselineCheckedAt: '2026-10-11T22:56:00Z',
  baselineUrl: 'https://www.google.com/travel/hotels/entity/ChUI1Z3d1NPGvJggGgkvbS8wOF9oeHQQAQ?ap=KigKEglvXOcioKz0PxGzMaXTkPZZQBISCaQZkYskwfQ_EbMxJVnW9llAMAE&ved=0CAAQ5JsGahcKEwjYw4D1gbOXAxUAAAAAHQAAAAAQAg&ts=CAESEAoCCAMKAggDCgQIAhAMEAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgLGAUyAggBKgkKBToDVVNEGgA&utm_campaign=sharing&utm_medium=link&utm_source=htls',
  source: 'Trip.com', checkedAt: '2026-10-11T22:56:00Z',
 },
  'Shangri-La Singapore 香格里拉': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Tower Wing Deluxe King Room', perNightUSD: 285, totalUSD: 1554, totalInclTax: true, cancel: 'Non-refundable', breakfast: '需付费', note: 'Great breakfast for $40.31 (optional)；Prepay online，Early bird price；Children stay for free；免费取消价 $356/晚（pay at hotel）；Horizon Club 房型标注 \'Room can\'t accommodate children\'，不适用' },
  baseNote: '详情页 \'Today\'s best price!\' $285/晚（Non-refundable）；列表页显示 Total price $1,554（1 room × 5 nights incl. taxes & fees）',
  suite: null,
  suiteNote: '详情页点击 \'More Room Types\' 展开所有房型后，房型名含 \'Suite\' 的房型确实不存在（仅有 Tower Wing / Garden Wing / Horizon Club / Valley Wing Deluxe 等房型），故 suite 记 null',
  baselineUSD: 329, baselineCheckedAt: '2026-10-11T22:56:00Z',
  baselineUrl: 'https://www.google.com/travel/search?ap=KigKEglvXOcioKz0PxGzMaXTkPZZQBISCaQZkYskwfQ_EbMxJVnW9llAMAE&ved=2ahUKEwjLsPuBgrOXAxU-WqsCHZK8JP8Qp-ECegQIAxAE&ts=CAESEAoCCAMKAggDCgQIAhAMEAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgLGAUyAggBKgkKBToDVVNEGgA&utm_campaign=sharing&utm_medium=link&utm_source=htls',
  source: 'Trip.com', checkedAt: '2026-10-11T22:56:00Z',
 },
  'The Fullerton Hotel Singapore 新加坡富丽敦酒店': {
  checkIn: '2026-12-06', checkOut: '2026-12-11', nights: 5,
  base: { room: 'Premier Courtyard Room', perNightUSD: 309, totalUSD: 1685, totalInclTax: true, cancel: 'Non-refundable', breakfast: '未明确', note: 'Our last 5!；Children stay for free；Prepay online，Early bird price；2 adults, 1 child (5 years old)；房型价未提及早餐' },
  baseNote: '详情页 \'Today\'s best price!\' $309/晚；列表页显示 Total price $1,685（1 room × 5 nights incl. taxes & fees）；列表页标注 \'Only 5 left at this price\'',
  suite: { room: 'Premier Collyer Suite', perNightUSD: 581, totalUSD: null, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts；Our last 2!；Children stay for free；另有 $599 价' },
  suiteNote: '展开 \'Show 9 Remaining Room Types\' 后，房型名含 \'Suite\' 的最便宜为 Premier Collyer Suite $581/晚；其余套房 Palladian Suite $768、Loft Suite $1,081 更贵',
  baselineUSD: 307, baselineCheckedAt: '2026-10-11T22:56:00Z',
  baselineUrl: 'https://www.google.com/travel/hotels/entity/ChUI0OH91YuKy-BBGgkvbS8wODd3bGYQAQ?ap=KigKEglvXOcioKz0PxGzMaXTkPZZQBISCaQZkYskwfQ_EbMxJVnW9llAMAE&ved=0CAAQ5JsGahcKEwi4jfPtgbOXAxUAAAAAHQAAAAAQAg&ts=CAESEAoCCAMKAggDCgQIAhAMEAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgLGAUyAggBKgkKBToDVVNEGgA&utm_campaign=sharing&utm_medium=link&utm_source=htls',
  source: 'Trip.com', checkedAt: '2026-10-11T22:56:00Z',
 },
  'Amanpuri': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Garden Pool Pavilion', perNightUSD: 3653, totalUSD: 11751.3, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 10', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts; Prepay online; Instant confirmation; Our last 3!; Earn $117.52 in Trip Coins; 价格明细：房价 $9,900 + 服务费 $1,059.30 + 税费 $792（含城市税$99+VAT$693）' },
  baseNote: '详情页最便宜可订房型为 Garden Pool Pavilion（2 成人方案）；页面同时有 3 成人方案 $3,875/晚',
  suite: null,
  suiteNote: 'Amanpuri 为别墅/Pavilion 型度假村，房型命名为 Pavilion/Villa（如 Garden Pool Pavilion、Ocean Pool Pavilion、Three-Bedroom Ocean Villa），无 Suite 命名房型，故 suite 记 null（方法论口径，非缺货）',
  baselineUSD: 1850, baselineCheckedAt: '2026-10-11T23:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=amanpuri%20phuket%20hotel&qs=CAEgASgAMiRDaGNJeE5mM3NMell2Y2JGQVJvS0wyMHZNRE51Y0dzeFpoQUJIAA&ved=0CAAQ5JsGahcKEwiAk9vf_rKXAxUAAAAAHQAAAAAQXg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgLEgcI6g8QDBgOGAMyAggBKgkKBToDVVNEGgA&ap=KigKEglQUQhIce0fQBEMUeDek5FYQBISCUnQh_yF8h9AEQxR4BLYkVhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T23:00:00Z',
 },
  'Trisara': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Ocean View Pool Villa', perNightUSD: 1925, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Nov 27', breakfast: '含免费早餐', note: 'Pay at hotel；Instant confirmation；Includes 2 great breakfasts；房型标注 Our last 3!；同房型另有 Prepay online 方案 $2,085/晚（免费取消至 11 月 26 日），列表页对该方案显示总价 $6,705' },
  baseNote: '最便宜可订为 Ocean View Pool Villa 房型下 Pay at hotel 方案 $1,925/晚；页面未对该方案显示明确总价数字，故 totalUSD 记 null',
  suite: { room: 'Signature Ocean View Pool Suite', perNightUSD: 2727, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Nov 27', breakfast: '含免费早餐', note: 'Pay at hotel；Instant confirmation；Includes 2 great breakfasts；同房型另有 Prepay online 方案 $2,966/晚（免费取消至 11 月 26 日，Our last 2!）；页面未显示明确总价数字' },
  suiteNote: '含 Suite 命名房型中最便宜可订为 Signature Ocean View Pool Suite',
  baselineUSD: 1642, baselineCheckedAt: '2026-10-11T23:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=trisara%20phuket%20thailand&qs=CAEgASgAMiZDaGdJbGItN282U0w0cGZFQVJvTEwyY3ZNWFJxT1ROMmVqQVFBUUgA&ved=0CAAQ5JsGahcKEwjYgeCMgLOXAxUAAAAAHQAAAAAQXg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgLEgcI6g8QDBgOGAMyAggBKgkKBToDVVNEGgA&ap=KigKEgnNdVlDUREgQBHRDOLpmJFYQBISCVXBW4jbEyBAEdEMosbdkVhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T23:00:00Z',
 },
  'Banyan Tree Phuket': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Banyan Pool Villa', perNightUSD: 764, totalUSD: 2457, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts；Prepay online；Instant confirmation；Earn $122.88 in Trip Coins；总价 $2,457 为列表页 Total price 按钮显示（1 room × 3 nights incl. taxes & fees）' },
  baseNote: '最便宜可订房型为 Banyan Pool Villa（Non-refundable 方案）；同房型另有免费取消方案 $955/晚（Free Cancellation before 11:59 PM, Nov 27）',
  suite: null,
  suiteNote: 'Banyan Tree Phuket 为别墅型度假村，房型命名均为 Pool Villa（如 Banyan Pool Villa、Serenity Pool Villa、Signature Pool Villa、Grand Lagoon Pool Villa 及双卧别墅），无 Suite 命名房型，故 suite 记 null（方法论口径，非缺货）',
  baselineUSD: 524, baselineCheckedAt: '2026-10-11T23:00:00Z',
  baselineUrl: 'https://www.google.com/travel/hotels/entity/CgsIzv_f9LGVsL2aARAB?ap=KigKEgnNdVlDUREgQBHRDCJBmJFYQBISCVXBW4jbEyBAEdEMosbdkVhA&ved=0CAAQ5JsGahgKEwjYgeCMgLOXAxUAAAAAHQAAAAAQzwE&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgLEgcI6g8QDBgOGAMyAggCKgkKBToDVVNEGgA',
  source: 'Trip.com', checkedAt: '2026-10-11T23:00:00Z',
 },
  'JW Marriott Phuket Resort & Spa 普吉JW万豪': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Guest Room,2 Double,Garden View,Balcony', perNightUSD: 473, totalUSD: 1522, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 8', breakfast: '需付费', note: 'Great breakfast for $31.62 (optional)；Pay at hotel；Instant confirmation；Last booked 6 hrs ago；总价 $1,522 为列表页 Total price 按钮显示（1 room × 3 nights incl. taxes & fees）' },
  baseNote: '最便宜可订房型为 Guest Room,2 Double,Garden View,Balcony（Pay at hotel 方案）',
  suite: { room: '1 Bedroom Suite, 1 King, Oceanfront, Whirlpool', perNightUSD: 1167, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 8', breakfast: '需付费', note: 'Pay at hotel；Instant confirmation；Great breakfast for $31.62 (optional)；页面未显示明确总价数字；同房型另有 Prepay online 方案 $1,212/晚' },
  suiteNote: '含 Suite 命名房型中最便宜可订为 1 Bedroom Suite, 1 King, Oceanfront, Whirlpool',
  baselineUSD: 402, baselineCheckedAt: '2026-10-11T23:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=jw%20marriott%20phuket%20resort%20%26%20spa&qs=CAAgASgA&ved=0CAAQ5JsGahcKEwj43erxgLOXAxUAAAAAHQAAAAAQXg&ts=CAEqBwoFOgNVU0Q&ap=KigKEgkTNcOm6FMgQBGXS0_jxpJYQBISCTma_bVyViBAEZdLTxcLk1hAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T23:00:00Z',
 },
  'The Surin Phuket': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'One Bedroom Superior Cottage', perNightUSD: 641, totalUSD: 2061, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Nov 11', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts；Prepay online；Instant confirmation；Special Discount 10% off（原价 $718）；Our last 1!；总价 $2,061 为列表页 Total price 按钮显示（1 room × 3 nights incl. taxes & fees）' },
  baseNote: '最便宜可订房型为 One Bedroom Superior Cottage',
  suite: { room: 'Beach Suite', perNightUSD: 1282, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Nov 11', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts；Prepay online；Instant confirmation；Special Discount 10% off（原价 $1,437）；页面未显示明确总价数字；另有 Beach Deluxe Suite $1,349/晚' },
  suiteNote: '含 Suite 命名房型中最便宜可订为 Beach Suite',
  baselineUSD: 521, baselineCheckedAt: '2026-10-11T23:00:00Z',
  baselineUrl: 'https://www.google.com/travel/hotels/entity/ChgI5s_dgP3xh-VPGgwvZy8xMmpidDA2NGoQAQ?ap=KigKEgnNdVlDUREgQBHRDCJBmJFYQBISCVXBW4jbEyBAEdEMosbdkVhA&ved=0CAAQ5JsGahcKEwio0K-_gLOXAxUAAAAAHQAAAAAQAg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgLEgcI6g8QDBgOGAMyAggCKgkKBToDVVNEGgA&utm_campaign=sharing&utm_medium=link&utm_source=htls',
  source: 'Trip.com', checkedAt: '2026-10-11T23:00:00Z',
 },
  'Keemala': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: 'Clay Pool Cottage', perNightUSD: 809, totalUSD: 2603, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts；Pay at hotel；Instant confirmation；Early Bird Deal 42% off（原价 $1,437）；Our last 3!；Earn $26.03 in Trip Coins；总价 $2,603 为列表页 Total price 按钮显示（1 room × 3 nights incl. taxes & fees）' },
  baseNote: '最便宜可订房型为 Clay Pool Cottage（Non-refundable 方案）；同房型另有免费取消方案 $1,255/晚（Free cancellation until Dec 4）',
  suite: null,
  suiteNote: 'Keemala 为别墅/树屋型度假村，房型命名为 Cottage/Villa/House（如 Clay Pool Cottage、Tent Pool Villa、Tree Pool House），无 Suite 命名房型，故 suite 记 null（方法论口径，非缺货）',
  baselineUSD: 624, baselineCheckedAt: '2026-10-11T23:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=keemala%20phuket%20thailand&qs=CAEgASgAMihDaG9JOWJmTHRZaTFfb3VjQVJvTkwyY3ZNVEZpWXpjellqbHJOaEFCSAA&ved=0CAAQ5JsGahcKEwjQhfTGgLOXAxUAAAAAHQAAAAAQXg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgLEgcI6g8QDBgOGAMyAggBKgkKBToDVVNEGgA&ap=KigKEglF5k8akr8fQBHWKY9U4pFYQBISCRtiOfOmxB9AEdYpj4gmklhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T23:00:00Z',
 },
  '137 Pillars House': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Rajah Brooke Suite', perNightUSD: 602, totalUSD: 1292, totalInclTax: true, cancel: 'Free Cancellation before 1:00 AM, Nov 22', breakfast: '含免费早餐', note: '原价 $673，10% off；Our last 5!；Prepay online；Instant confirmation' },
  baseNote: '全店最便宜可订房型（公开价）；该房型即最便宜 Suite 房型。',
  suite: { room: 'Rajah Brooke Suite', perNightUSD: 602, totalUSD: 1292, totalInclTax: true, cancel: 'Free Cancellation before 1:00 AM, Nov 22', breakfast: '含免费早餐', note: '原价 $673，10% off；Our last 5!；Prepay online；Instant confirmation' },
  suiteNote: '详情页全部房型名称均含 \'Suite\'；最便宜 Suite 与基础房为同一房型。',
  baselineUSD: 595, baselineCheckedAt: '2026-10-11T22:48:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=137%20pillars%20house%20chiang%20mai&qs=CAEgASgAMihDaG9JX0ptRmo4dk8tWmlPQVJvTkwyY3ZNVEZqTTNCamN6azFlUkFCSAA&ved=0CAAQ5JsGahcKEwjYyIXg_rKXAxUAAAAAHQAAAAAQYQ&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgOEgcI6g8QDBgQGAIyAggBKgkKBToDVVNEGgA&ap=KigKEgkr3f-mJ8oyQBEjuy3SIsBYQBISCd5wGYJeyzJAESO7LQZnwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T22:48:00Z',
 },
  'Four Seasons Resort Chiang Mai': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Upper Garden Pavilion King', perNightUSD: 1690, totalUSD: 3625, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Our last 1!；Prepay online' },
  baseNote: '全店最便宜可订房型（公开价）。',
  suite: null,
  suiteNote: '展开全部 7 种房型后，确实没有 \'Suite\' 命名的可订房型（均为 Pavilion / Villa：Upper Garden / Rice Terrace / Upper Rice Terrace Pavilion King/Twin 及 Pool Villa）。',
  baselineUSD: 1527, baselineCheckedAt: '2026-10-11T22:48:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=four%20seasons%20resort%20chiang%20mai&qs=CAAgASgA&ved=0CAEQ__kHahcKEwi46K_I_7KXAxUAAAAAHQAAAAAQYg&ts=CAEqBwoFOgNVU0Q&ap=KigKEgkJt-akmukyQBEWjiB7gLtYQBISCR13wkXR6jJAERaOIK_Eu1hAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T22:48:00Z',
 },
  'Raya Heritage': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Rin Suite with Terrace', perNightUSD: 447, totalUSD: 1060, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Nov 23', breakfast: '含免费早餐', note: 'Our last 1!；Pay at hotel；Instant confirmation' },
  baseNote: '最便宜可订档为 Pay at hotel（$447/晚）；同房型另有 $467/晚 prepay 档（2 晚总价 $1,001）。',
  suite: { room: 'Rin Suite with Terrace', perNightUSD: 447, totalUSD: 1060, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Nov 23', breakfast: '含免费早餐', note: 'Our last 1!；Pay at hotel；Instant confirmation' },
  suiteNote: '全店 3 种房型均含 \'Suite\' 命名（Rin Suite with Terrace / Huen Bon Suite / Kramm Suite with Pool）；最便宜 Suite 与基础房为同一房型。',
  baselineUSD: 427, baselineCheckedAt: '2026-10-11T22:48:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=raya%20heritage%20chiang%20mai&qs=CAEgASgAMiZDaGdJbU1UN3dPM3Q3NEs2QVJvTkwyY3ZNVEZtTlRSM2RITTBlaEFCSAA&ved=0CAAQ5JsGahcKEwiYrNqsgLOXAxUAAAAAHQAAAAAQYA&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgOEgcI6g8QDBgQGAIyAggBKgkKBToDVVNEGgA&ap=KigKEgmjz3GYptgyQBFPpbCC7L5YQBISCSKivljd2TJAEU-lsLYwv1hAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T22:48:00Z',
 },
  'Anantara Chiang Mai': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Deluxe Room With Garden View', perNightUSD: 428, totalUSD: 1016, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Pay at hotel；Instant confirmation；Earn $10.17 Trip Coins' },
  baseNote: '最便宜可订档为 Pay at hotel（Non-refundable）。',
  suite: { room: 'Lanna Garden View Suite', perNightUSD: 674, totalUSD: null, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Our last 5!；Early bird price；Prepay online；Instant confirmation' },
  suiteNote: '共 4 种 Suite 房型，最便宜为 Lanna Garden View Suite；该档总价在页面可见文本及 HTML 范围内未确认到明确数字总价，按规则 totalUSD 记 null（页面标签明确写 incl. taxes & fees，故 totalInclTax 为 true）。',
  baselineUSD: 357, baselineCheckedAt: '2026-10-11T22:48:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=anantara%20chiang%20mai%20resort%20chiang%20mai%20thailand&qs=CAEgASgAMiZDaGdJcmN6VGlOU1o4T0RCQVJvTEwyY3ZNWFJxZUc1M05EQVFBUUgA&ved=0CAAQ5JsGahcKEwjohOSQgbOXAxUAAAAAHQAAAAAQYA&ap=KigKEgnHEyTYhccyQBH6VKkaG8BYQBISCek_Gbi8yDJAEfpUqU5fwFhAMAA&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgOEgcI6g8QDBgQGAIyAggBKgkKBToDVVNEGgA',
  source: 'Trip.com', checkedAt: '2026-10-11T22:48:00Z',
 },
  'Shangri-La Chiang Mai 清迈香格里拉': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Deluxe King Room', perNightUSD: 188, totalUSD: 403, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 13', breakfast: '需付费', note: 'Multi-night Discount 8% off（原价 $206）；Prepay online；Instant confirmation；早餐 $21.48/人（optional）' },
  baseNote: '全店最便宜可订档（公开价）；同房型另有 $194/晚 pay at hotel 档（5% off）。',
  suite: { room: 'Executive King Suite', perNightUSD: 349, totalUSD: 748, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 13', breakfast: '含免费早餐', note: 'Our last 5!；Prepay online；Instant confirmation；Horizon Club Lounge Benefits' },
  suiteNote: '展开全部 10 种房型后，含 \'Suite\' 命名的可订房型仅 Executive King Suite（$349/晚；另有 $361/晚 pay at hotel 档）。',
  baselineUSD: 157, baselineCheckedAt: '2026-10-11T22:48:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=shangri%20la%20chiang%20mai&qs=CAEgASgAMiZDaGdJOC11cWdQX2FvYVR6QVJvTEwyY3ZNWFJrTURkalozY1FBUUgA&ved=0CAAQ5JsGahcKEwiAkLGOgrOXAxUAAAAAHQAAAAAQYA&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgOEgcI6g8QDBgQGAIyAggBKgkKBToDVVNEGgA&ap=KigKEgnNQqC-pMYyQBEoeXV0379YQBISCXS8NKDbxzJAESh5dagjwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T22:48:00Z',
 },
  'Chiang Mai Marriott Hotel 清迈万豪': {
  checkIn: '2026-12-14', checkOut: '2026-12-16', nights: 2,
  base: { room: 'Deluxe King - City View', perNightUSD: 197, totalUSD: 425, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Oct 13', breakfast: '需付费', note: 'Best price with free cancellation；Pay at hotel；Instant confirmation；早餐 $22.82/人（optional）' },
  baseNote: '全店最便宜可订档（公开价）；同房型另有 $197/晚 prepay online 档（2 晚总价同样 $425）。',
  suite: { room: 'Executive Suite, 1 Bedroom, 1 King, Club Lounge Access', perNightUSD: 328, totalUSD: 708, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Oct 13', breakfast: '需付费', note: 'Unlimited M Club access (Club Lounge benefits)；Pay at hotel；Instant confirmation；早餐 $22.82/人（optional）' },
  suiteNote: '展开全部 10 种房型后，含 \'Suite\' 命名的房型共 3 种（Executive Suite $328；Diplomatic Suite $1,673；Royal Suite $2,165），最便宜为 Executive Suite。',
  baselineUSD: 179, baselineCheckedAt: '2026-10-11T22:48:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=chiang%20mai%20marriott%20hotel&qs=CAEgASgAMiZDaGdJeEw3aHBiRGNrTkQxQVJvTEwyY3ZNWFJuTldaa2VuTVFBUUgA&ved=0CAAQ5JsGahcKEwj4hfv6g7OXAxUAAAAAHQAAAAAQYA&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgOEgcI6g8QDBgQGAIyAggBKgkKBToDVVNEGgA&ap=KigKEgmiE1cmKMgyQBGfWjPO2L9YQBISCSXBIAVfyTJAEZ9aMwIdwFhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T22:48:00Z',
 },
  'The Ritz-Carlton, Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe King', perNightUSD: 374, totalUSD: 1194, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 15', breakfast: '需付费', note: 'Great breakfast for $33.35 (optional); Pay at hotel / Prepay online; Instant confirmation; hotel-level \'Last booked 5 hrs ago\'; total $1,194 shown on search results card for this hotel/room/dates' },
  baseNote: '详情页最便宜可订基础房$374/晚；3晚总价$1,194为搜索结果卡片明确显示（含税），详情页仅显示\'incl. taxes & fees\'字样无数字',
  suite: null,
  suiteNote: '展开全部房型后（Deluxe/Club系列共11个房型），未见房型名含Suite的房型',
  baselineUSD: 338, baselineCheckedAt: '2026-10-11T23:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20ritz%20carlton%20bangkok%20bangkok%20thailand&qs=CAEgASgAMidDaGtJX01lMTJLNzJxOG9SR2cwdlp5OHhNWGM1WnpOeWVXTmZFQUVIAA&ved=0CAAQ5JsGahcKEwj4t5Lh_rKXAxUAAAAAHQAAAAAQXg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgQEgcI6g8QDBgTGAMyAggBKgkKBToDVVNEGgA&ap=KigKEgk20zfxv3MrQBHYGgBGySJZQBISCUWROeY9ditAEdgaAHoNI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T23:00:00Z',
 },
  'The Peninsula Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe King Room', perNightUSD: 424, totalUSD: 1353, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts; Prepay online; Instant confirmation; \'Our last 4!\'; \'Earn $67.64 in Trip Coins\'; hotel-level \'Last booked 8 hrs ago\'; free-cancellation rate also available at $445/night; 首次定向搜索因目的地参数残留异常误报无房，已用干净参数重新搜索复核确认有房', memberDeal: 'Member deal 10% off (原价 $474)' },
  baseNote: '详情页最便宜可订基础房为$424/晚会员价（不可退）；3晚总价$1,353为搜索结果卡片明确显示（含税）',
  suite: null,
  suiteNote: '套房房型在\'Show 6 Remaining Room Types\'展开控件之后，该控件在页面AX中未暴露为可点击按钮，为遵守只读铁律未强行展开，最便宜套房价格本次未能确认（非缺货）',
  baselineUSD: 277, baselineCheckedAt: '2026-10-11T23:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20peninsula%20bangkok&qs=CAEgASgAMiNDaFlJdDVxM2h2YmszdHBYR2dvdmJTOHdaMmM0TUhvNUVBRUgA&ved=0CAAQ5JsGahcKEwjY9ZTT_7KXAxUAAAAAHQAAAAAQYA&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgQEgcI6g8QDBgTGAMyAggBKgkKBToDVVNEGgA&ap=KigKEgkkVdJu-XArQBGfylgJjyBZQBISCeU5mmd3cytAEZ_KWD3TIFlAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T23:00:00Z',
 },
  'Rosewood Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe Twin Room', perNightUSD: 373, totalUSD: 1191, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 9', breakfast: '需付费', note: 'Great breakfast for $44.95 (optional); Pay at hotel; Instant confirmation; hotel-level \'Last booked 4 hrs ago\'', memberDeal: 'Member deal 15% off (原价 $443)' },
  baseNote: '详情页最便宜可订基础房$373/晚；3晚总价$1,191为搜索结果卡片明确显示（含税）',
  suite: { room: 'Premier Suite', perNightUSD: 687, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 6:00 PM, Dec 9', breakfast: '含免费早餐', note: 'Includes 1 great breakfast; Prepay online; Instant confirmation; 该$687费率显示\'1 adult\'入住图标；详情页仅显示\'Total price:1 room × 3 nights incl. taxes & fees\'无数字总价', memberDeal: 'Member deal 15% off (原价 $816)' },
  suiteNote: '展开全部房型后最便宜的Suite命名房型为Premier Suite $687/晚',
  baselineUSD: 334, baselineCheckedAt: '2026-10-11T23:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=rosewood%20bangkok&qs=CAEgASgAMidDaGtJLWZQVTZyLWh6T04yR2cwdlp5OHhNV1kxYUd4aWVqVmZFQUVIAA&ved=0CAAQ5JsGahcKEwjInbyogLOXAxUAAAAAHQAAAAAQXg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgQEgcI6g8QDBgTGAMyAggBKgkKBToDVVNEGgA&ap=KigKEglQwxi-X3srQBFm9-RH_yJZQBISCRCFuqjdfStAEWb35HtDI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T23:00:00Z',
 },
  '曼谷文华东方': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: null,
  baseNote: '整店无房',
  suite: null,
  suiteNote: '整店无房',
  unavailable: 'No rooms available for your selected dates. You can still book for the following dates: Dec 13-Dec 14 (From $581), Dec 14-Dec 15 (From $581), Dec 15-Dec 16 (From $581)',
  baselineUSD: 641, baselineCheckedAt: '2026-10-11T23:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=mandarin%20oriental%20bangkok%20lobby&qs=CAEgASgAMiJDaFVJNVpXbnRMYkdzOWtMR2drdmJTOHdPRFZpTjJjUUFRSAA&ved=0CAAQ5JsGahcKEwj4xbOGgbOXAxUAAAAAHQAAAAAQXg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgQEgcI6g8QDBgTGAMyAggBKgkKBToDVVNEGgA&ap=KigKEgktrj79OnErQBETW4tGyyBZQBISCTFyrfW4cytAERNbi3oPIVlAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T23:00:00Z',
 },
  'Capella Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Riverfront Premier Twin Room', perNightUSD: 972, totalUSD: 3100, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 11', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts; Prepay online; Instant confirmation; \'With space for up to 2 guests\'; hotel-level \'Last booked 2 hrs ago\'; \'Earn $154.98 in Trip Coins\'' },
  baseNote: 'Riverfront Premier King Room同为$972/晚；3晚总价$3,100为搜索结果卡片明确显示（含税）',
  suite: { room: 'River Suite', perNightUSD: 1841, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 11', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts; Prepay online; Instant confirmation; \'With space for up to 2 guests\'; \'Our last 4!\'; 详情页仅显示\'Total price:1 room × 3 nights incl. taxes & fees\'无数字总价' },
  suiteNote: '展开全部房型后最便宜的Suite命名房型为River Suite $1,841/晚',
  baselineUSD: 728, baselineCheckedAt: '2026-10-11T23:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=capella%20bangkok&qs=CAEgASgAMidDaGtJNlBHbjRkSzExSnN5R2cwdlp5OHhNV00yZW5wbWVUWmtFQUVIAA&ved=0CAAQ5JsGahcKEwios6DggbOXAxUAAAAAHQAAAAAQXw&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgQEgcI6g8QDBgTGAMyAggBKgkKBToDVVNEGgA&ap=KigKEglhmQJyhmsrQBFzDwnFmSBZQBISCSdPMnIEbitAEXMPCfndIFlAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T23:00:00Z',
 },
  'Aman Nai Lert Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe King Suite', perNightUSD: 1714, totalUSD: 5466, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts; Prepay online; Instant confirmation; \'Our last 5!\'; \'Earn $81.99 in Trip Coins\'; free-cancellation rate also available at $1,904/night' },
  baseNote: '该酒店所有房型均为Suite命名；3晚总价$5,466为搜索结果卡片明确显示（含税）',
  suite: { room: 'Deluxe King Suite', perNightUSD: 1714, totalUSD: 5466, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: '全套房酒店，最便宜套房即最便宜基础房' },
  suiteNote: '全套房酒店（Deluxe King/Twin Suite、Premier Suite、Corner Suite等），最便宜Suite即Deluxe King Suite $1,714/晚',
  baselineUSD: 1485, baselineCheckedAt: '2026-10-11T23:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=aman%20nai%20lert%20bangkok%20thailand&qs=CAEgASgAMihDaG9JaUtXVGw5S0YyUG15QVJvTEwyY3ZNVEZxYW5kdWNXWTRjaEFCSAA&ved=0CAAQ5JsGahcKEwiooM28i7OXAxUAAAAAHQAAAAAQYA&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgQEgcI6g8QDBgTGAMyAggBKgkKBToDVVNEGgA&ap=KigKEglhmQJyhmsrQBFzDwnFmSBZQBISCSdPMnIEbitAEXMPCfndIFlAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T23:00:00Z',
 },
  'Four Seasons Bangkok': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Deluxe Room - King', perNightUSD: 737, totalUSD: 2351, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 15', breakfast: '需付费', note: 'Great breakfast for $47.40 (optional); Prepay online; Instant confirmation; \'Our last 1!\'; hotel-level \'Last booked 14 hrs ago\'; total $2,351 explicitly shown on detail page' },
  baseNote: '详情页最便宜可订基础房；3晚总价$2,351为详情页明确显示的数字（含税）',
  suite: null,
  suiteNote: '详情页房型列表末尾显示\'Show 2 Remaining Room Types\'（应为套房），但点击展开时误触跳转至预订页（已立即用返回键回到详情页，未填写/提交任何信息）；为遵守只读铁律未再尝试点击，套房价格本次未能获取（非缺货）',
  baselineUSD: 599, baselineCheckedAt: '2026-10-11T23:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=four%20seasons%20bangkok&qs=CAEgASgAMihDaG9JNmFxYXpfVFZxZmZGQVJvTEwyY3ZNVEZrZUdzNGJtZHNOaEFCSAA&ved=0CAAQ5JsGahcKEwiooM28i7OXAxUAAAAAHQAAAAAQXg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgQEgcI6g8QDBgTGAMyAggBKgkKBToDVVNEGgA&ap=KigKEgk5_y2BQGsrQBEAsN-ejyBZQBISCVC4vIG-bStAEWb35HtDI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T23:00:00Z',
 },
  'The Siam': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Siam Suite', perNightUSD: 755, totalUSD: 2408, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 15', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts; Prepay online; Instant confirmation; \'Best price with breakfast\'; extra breakfast THB 1,471.25 (~$43.89)/person; Free minibar (1); Boat transfer to Central Sathorn Pier (2 per day)' },
  baseNote: '全套房酒店；3晚总价$2,408为搜索结果卡片明确显示（含税）',
  suite: { room: 'Siam Suite', perNightUSD: 755, totalUSD: 2408, totalInclTax: true, cancel: 'Free Cancellation before 3:00 PM, Dec 15', breakfast: '含免费早餐', note: '全套房酒店，最便宜套房即最便宜基础房' },
  suiteNote: '全套房酒店（Siam Suite、Garden View Suite、River View Suite、Courtyard Pool Villa等），最便宜Suite即Siam Suite $755/晚',
  baselineUSD: 537, baselineCheckedAt: '2026-10-11T23:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20siam%20bangkok%20thailand&qs=CAEgASgAMidDaGtJM3MyazRmeUZtS09DQVJvTUwyY3ZNVEpxYzNRd05EQm9FQUVIAA&ved=0CAAQ5JsGahcKEwiooM28i7OXAxUAAAAAHQAAAAAQYA&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgQEgcI6g8QDBgTGAMyAggBKgkKBToDVVNEGgA&ap=KigKEglhmQJyhmsrQBFzDwnFmSBZQBISCSdPMnIEbitAEXMPCfndIFlAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T23:00:00Z',
 },
  'The Athenee Hotel, a Luxury Collection Hotel, Bangkok 曼谷雅典娜豪华精选酒店': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: { room: 'Athenee King Room Non smoking', perNightUSD: 233, totalUSD: 744, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 15', breakfast: '需付费', note: 'Great breakfast for $29.83 (optional); Pay at hotel; Instant confirmation; \'Earn $7.44 in Trip Coins\'; hotel-level \'Last booked 20 hrs ago\'' },
  baseNote: '详情页最便宜可订基础房$233/晚；3晚总价$744为搜索结果卡片明确显示（含税）',
  suite: { room: 'Athenee Suite Non smoking', perNightUSD: 443, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 15', breakfast: '含免费早餐', note: 'Includes 1 great breakfast; Prepay online; Instant confirmation; \'Earn $14.12 in Trip Coins\'; 该$443费率显示\'1 adult\'入住图标；详情页仅显示\'Total price:1 room × 3 nights incl. taxes & fees\'无数字总价' },
  suiteNote: '通过\'More Room Types\'展开后，最便宜的Suite命名房型为Athenee Suite Non smoking $443/晚',
  baselineUSD: 211, baselineCheckedAt: '2026-10-11T23:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=the%20athenee%20hotel%20a%20luxury%20collection%20hotel%20bangkok&qs=CAAgASgA&ved=0CAAQ5JsGahcKEwjIh4SnjLOXAxUAAAAAHQAAAAAQXg&ts=CAEqBwoFOgNVU0Q&ap=KigKEgkAXEGGUnorQBE_6fra7CJZQBISCeU5mmd3bytAET_p-g4xI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T23:00:00Z',
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
  base: { room: 'King Room', perNightUSD: 261, totalUSD: 1422, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: '需付费', note: 'Great breakfast for $42.18 (optional)；Pay at hotel；Children stay for free；Last booked 8 hrs ago；2 adults, 1 child (5 years old)' },
  baseNote: '详情页 \'Best price with free cancellation\' 卡 $261/晚；列表页显示 Total price $1,422（1 room × 5 nights incl. taxes & fees）',
  suite: { room: 'Andaz King Suite', perNightUSD: 720, totalUSD: null, totalInclTax: true, cancel: 'Free Cancellation before 11:59 PM, Dec 4', breakfast: '含免费早餐', note: '$720 为 \'1 adult, 1 child (5 years old)\' 含2份早餐价；页面所有套房均标注 \'1 adult, 1 child\' 且提示 \'We recommend 2 rooms for your group\'，无标注适配 2 大 1 小 1 间房的套房价' },
  suiteNote: '展开 \'Show 6 Remaining Room Types\' 后，房型名含 \'Suite\' 的最低价为 Andaz King Suite $720/晚；其余套房（Andaz Residence Suite King $763、Andaz Large King Suite $848、Two-Bedroom Suite $1,162）更贵且同样标注 1 大 1 小',
  baselineUSD: 393, baselineCheckedAt: '2026-10-11T22:56:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=andaz%20singapore&qs=CAEgASgAMidDaGtJd2VQcjFQdjV2clZ2R2cwdlp5OHhNV1I0WkdJMGNHSXdFQUVIAA&ved=0CAAQ5JsGahgKEwjYkc6mgrOXAxUAAAAAHQAAAAAQ6gI&ts=CAESEAoCCAMKAggDCgQIAhAMEAEaIAoCGgASGhIUCgcI6g8QDBgGEgcI6g8QDBgLGAUyAggBKgkKBToDVVNEGgA&ap=KigKEglRH_MZTcL0PxHPqFTKyfZZQBISCfDizH_R1vQ_Ec-oVP4N91lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T22:56:00Z',
 },
  'Hyatt Regency Phuket Resort 普吉凯悦度假酒店': {
  checkIn: '2026-12-11', checkOut: '2026-12-14', nights: 3,
  base: { room: '1 King Bed', perNightUSD: 284, totalUSD: 913, totalInclTax: true, cancel: 'Non-refundable', breakfast: '含免费早餐', note: 'Includes 2 great breakfasts；Prepay online；Instant confirmation；Special Discount 10% off（原价 $316）；Exclusive price for multi-night stays；Earn $9.13 in Trip Coins；总价 $913 为列表页 Total price 按钮显示（1 room × 3 nights incl. taxes & fees）' },
  baseNote: '最便宜可订房型为 1 King Bed（Non-refundable 含早方案）；同房型另有免费取消方案 $347/晚（Free Cancellation before 11:59 PM, Dec 7，早餐 $22.82 可选付费）',
  suite: { room: 'Two Bedroom Regency Suite', perNightUSD: 746, totalUSD: null, totalInclTax: 'unknown', cancel: 'Free Cancellation before 11:59 PM, Dec 8', breakfast: '需付费', note: 'Pay at hotel；Instant confirmation；Great breakfast for $22.82 (optional)；Earn $26.56 in Trip Coins；页面未显示明确总价数字；同房型另有 Non-refundable 预付方案 $801/晚（7% off，原价 $863）' },
  suiteNote: '含 Suite 命名房型中最便宜可订为 Two Bedroom Regency Suite（另有 Two Bedroom Regency Suite With Ocean View $805/晚、1 King Bed Hilltop Ocean View Suite $820/晚）',
  baselineUSD: 269, baselineCheckedAt: '2026-10-11T23:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=hyatt%20regency%20phuket%20resort&qs=CAAgASgA&ved=0CAAQ5JsGahcKEwiYlaGHgbOXAxUAAAAAHQAAAAAQXg&ts=CAEaIAoCGgASGhIUCgcI6g8QDBgLEgcI6g8QDBgOGAMyAggBKgkKBToDVVNEGgA&ap=KigKEglpMX4hVMcfQBFqPTLyK5FYQBISCUjJQvRozB9AEWo9MiZwkVhAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T23:00:00Z',
 },
  'Park Hyatt Bangkok 曼谷柏悦酒店': {
  checkIn: '2026-12-16', checkOut: '2026-12-19', nights: 3,
  base: null,
  baseNote: '整店无房',
  suite: null,
  suiteNote: '整店无房',
  unavailable: 'This hotel is not currently accepting bookings',
  baselineUSD: 318, baselineCheckedAt: '2026-10-11T23:00:00Z',
  baselineUrl: 'https://www.google.com/travel/search?q=park%20hyatt%20bangkok&qs=CAAgASgA&ved=0CAAQ5JsGahcKEwiIwIH8jLOXAxUAAAAAHQAAAAAQXg&ts=CAEqBwoFOgNVU0Q&ap=KigKEglWSk-tmXsrQBFzDwnFmSBZQBET_p-g4xI1lAMAA',
  source: 'Trip.com', checkedAt: '2026-10-11T23:00:00Z',
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
