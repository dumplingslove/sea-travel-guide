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

import { getDatasetStatus, onDataset, type DatasetStatus } from "@/lib/datasets";

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

export const hotelLivePrices: Record<string, LiveHotelPrice> = {};

/** 酒店实查价数据集状态：消费方据此区分「加载中/加载失败」与「确实暂无实时价」，不许混为一谈。 */
export function livePriceDatasetStatus(): DatasetStatus {
  return getDatasetStatus("hotel_live_prices");
}

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
export const livePriceStayDates: Record<string, { checkIn: string; checkOut: string }> = {};

/* 数据来源（2026-10-13 起）：Supabase sea_guide_datasets 的 hotel_live_prices 行，
 * 由 hotel-price-watch 管线实查后写入 DB；本文件不再内嵌价格字面量。
 * 数据到达时灌入上面的存储对象（引用不变，界面重渲染即反映 DB 最新数据）。 */
onDataset("hotel_live_prices", (data) => {
  const rec = (data ?? {}) as Record<string, LiveHotelPrice>;
  for (const k of Object.keys(hotelLivePrices)) delete hotelLivePrices[k];
  Object.assign(hotelLivePrices, rec);
  for (const k of Object.keys(livePriceStayDates)) delete livePriceStayDates[k];
  for (const [name, p] of Object.entries(hotelLivePrices)) {
    livePriceStayDates[name] = { checkIn: p.checkIn, checkOut: p.checkOut };
  }
});
