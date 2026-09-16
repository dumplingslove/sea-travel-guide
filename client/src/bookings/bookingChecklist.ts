/**
* 预订页面「待预订清单」：按 2026-12-12 ~ 12-31 二十天行程整理的可预订项。
*
* 数据来源（更新于 2026-09-16）：
* - 国际段：尚未比价，占位待定
* - 7 段城际航班：Duffel 实测（2026-09-14/15，2 成人，见 planner-logic.ts DUFFEL_MEASURED）
* - 8 城酒店：万豪系主选（用户 Marriott Bonvoy Titanium；hotelCityChecks 2026-09-13 官方页核验）
* - 景点门票 / 餐厅：研究报告确认必须或建议提前订票/订位的项目
* （research_notes/sea-guide-2026/details/staging/*.ts，2026-09-16 核验）
*
* 注意：机票价格会变，Duffel 未返回退改信息，出票前重查。
* Titanium 会员权益（升级/酒廊/早餐）以入住时各酒店政策为准，不在此做承诺。
* 景点与餐厅的日期为建议，可按行程调整。
*/
import type { BookingData, BookingKind} from "./bookingTypes";

export interface ChecklistItem {
id: string;
bkind: BookingKind;
name: string;
city: string;
date?: string;
dateEnd?: string;
time?: string;
timeEnd?: string;
guests?: string;
extra?: string;
note?: string;
/** 关联行程天数 Day N */
day?: number | null;
/** 需要优先锁定的项目 */
urgent?: boolean;
}

export interface ChecklistSection {
key: string;
title: string;
hint: string;
items: ChecklistItem[];
}

const DUFFEL =
"Duffel 实测 2026-09-14/15 · 2 成人合计 · 价格会变，Duffel 未返回退改信息，出票前重查";

export const BOOKING_CHECKLIST: ChecklistSection[] = [
{
key: "intl",
title: "国际段（待定）",
hint: "去程/回程国际机票尚未比价，先占位",
items: [
{
id: "intl-out",
bkind: "transport",
name: "去程国际航班 → 曼谷",
city: "曼谷",
date: "2026-12-12",
day: 1,
guests: "2人",
note: "国际段机票尚未比价选定。12/12 当天需抵达曼谷（Day 1 行程从曼谷开始），出票前确认到达时间与转机衔接。",
},
{
id: "intl-back",
bkind: "transport",
name: "回程国际航班 ← 新加坡",
city: "新加坡",
date: "2026-12-31",
day: 20,
guests: "2人",
note: "国际段机票尚未比价选定。新加坡酒店退房日期按实际回程航班调整。",
},
],
},
{
key: "flights",
title: "城际航班（7 段）",
hint: "Duffel 实测直飞当前库存；标 ⚠ 的当天仅 1 班，优先锁定",
items: [
{
id: "f-bkk-cnx",
bkind: "transport",
name: "曼谷 → 清迈",
city: "曼谷",
date: "2026-12-15",
day: 4,
guests: "2人",
extra: "泰航 / 曼谷航空（28 个报价）",
note: `${DUFFEL}：$169.80–277.80`,
},
{
id: "f-cnx-hkt",
bkind: "transport",
name: "清迈 → 普吉",
city: "清迈",
date: "2026-12-17",
time: "14:35",
timeEnd: "16:40",
day: 6,
guests: "2人",
extra: "曼谷航空 PG0248",
note: `${DUFFEL}：$391.80–471.80（仅 1 个报价）`,
urgent: true,
},
{
id: "f-hkt-pen",
bkind: "transport",
name: "普吉 → 槟城",
city: "普吉",
date: "2026-12-20",
time: "14:35",
timeEnd: "16:35",
day: 9,
guests: "2人",
extra: "马航 MH5455",
note: `${DUFFEL}：$205.80（仅 1 个报价）`,
urgent: true,
},
{
id: "f-pen-kul",
bkind: "transport",
name: "槟城 → 吉隆坡",
city: "槟城",
date: "2026-12-22",
day: 11,
guests: "2人",
extra: "马航 / Malindo（28 个报价）",
note: `${DUFFEL}：$67.00–421.20`,
},
{
id: "f-kul-sgn",
bkind: "transport",
name: "吉隆坡 → 胡志明市",
city: "吉隆坡",
date: "2026-12-24",
day: 13,
guests: "2人",
extra: "越捷 / 越航 / 马航等（12 个报价）",
note: `${DUFFEL}：$222.20–557.80`,
},
{
id: "f-sgn-pqc",
bkind: "transport",
name: "胡志明市 → 富国岛",
city: "胡志明市",
date: "2026-12-26",
day: 15,
guests: "2人",
extra: "越捷 / 越航等（22 个报价）",
note: `${DUFFEL}：$130.00–249.00`,
},
{
id: "f-pqc-sin",
bkind: "transport",
name: "富国岛 → 新加坡",
city: "富国岛",
date: "2026-12-29",
day: 18,
guests: "2人",
extra: "越捷 / Scoot（3 个报价；Scoot 由 Hahn Air 出票）",
note: `${DUFFEL}：$334.00–674.00`,
},
],
},
{
key: "hotels",
title: "酒店（8 城）",
hint: "万豪系主选（Titanium）；房型与会员权益按入住时政策确认",
items: [
{
id: "h-bkk",
bkind: "hotel",
name: "The Athenee Hotel, a Luxury Collection Hotel, Bangkok",
city: "曼谷",
date: "2026-12-12",
dateEnd: "2026-12-15",
day: 1,
guests: "1间 · 2人",
extra: "万豪旅享家 · Luxury Collection",
note: "前 Plaza Athénée，王子宫殿旧址，标志性双楼梯大堂，8 家餐厅酒吧。Titanium 会员权益以入住时酒店政策为准。备选：Rosewood Bangkok / The Peninsula Bangkok。",
},
{
id: "h-cnx",
bkind: "hotel",
name: "Chiang Mai Marriott Hotel",
city: "清迈",
date: "2026-12-15",
dateEnd: "2026-12-17",
day: 4,
guests: "1间 · 2人",
extra: "万豪旅享家 · Marriott Hotels",
note: "Night Bazaar 位置。Titanium 会员权益以入住时酒店政策为准。备选：Shangri-La Chiang Mai。\n官网：https://www.marriott.com/en-us/hotels/cnxmc-chiang-mai-marriott-hotel/overview/",
},
{
id: "h-hkt",
bkind: "hotel",
name: "The Naka Island, a Luxury Collection Resort & Spa, Phuket",
city: "普吉",
date: "2026-12-17",
dateEnd: "2026-12-20",
day: 6,
guests: "1间 · 2人",
extra: "万豪旅享家 · Luxury Collection",
note: "Naka Yai Island，需快艇接驳。Titanium 会员权益以入住时酒店政策为准。\n官网：https://www.marriott.com/en-us/hotels/pyxlc-the-naka-island-a-luxury-collection-resort-and-spa-phuket/overview/",
},
{
id: "h-pen",
bkind: "hotel",
name: "Penang Marriott Hotel",
city: "槟城",
date: "2026-12-20",
dateEnd: "2026-12-22",
day: 9,
guests: "1间 · 2人",
extra: "万豪旅享家 · Marriott Hotels",
note: "Gurney Drive 海滨。Titanium 会员权益以入住时酒店政策为准。备选：Seven Terraces。\n官网：https://www.marriott.com/en-us/hotels/penmc-penang-marriott-hotel/overview/",
},
{
id: "h-kul",
bkind: "hotel",
name: "The Ritz-Carlton, Kuala Lumpur",
city: "吉隆坡",
date: "2026-12-22",
dateEnd: "2026-12-24",
day: 11,
guests: "1间 · 2人",
extra: "万豪旅享家 · The Ritz-Carlton",
note: "Golden Triangle。Titanium 会员权益以入住时酒店政策为准。",
},
{
id: "h-sgn",
bkind: "hotel",
name: "Sheraton Saigon Grand Opera Hotel",
city: "胡志明市",
date: "2026-12-24",
dateEnd: "2026-12-26",
day: 13,
guests: "1间 · 2人",
extra: "万豪旅享家 · Sheraton",
note: "88 Dong Khoi 歌剧院旁；研究报告：Sheraton Club 对 Platinum / Titanium / Ambassador 免费（含 +1 宾客）。备选：Mai House Saigon。",
},
{
id: "h-pqc",
bkind: "hotel",
name: "JW Marriott Phu Quoc Emerald Bay Resort & Spa",
city: "富国岛",
date: "2026-12-26",
dateEnd: "2026-12-29",
day: 15,
guests: "1间 · 2人",
extra: "万豪旅享家 · JW Marriott",
note: "Khem Beach。Titanium 会员权益以入住时酒店政策为准。\n官网：https://marriott.com/en-us/hotels/pqcjw-jw-marriott-phu-quoc-emerald-bay-resort-and-spa/overview",
},
{
id: "h-sin",
bkind: "hotel",
name: "The Singapore EDITION",
city: "新加坡",
date: "2026-12-29",
dateEnd: "2027-01-01",
day: 18,
guests: "1间 · 2大1小",
extra: "万豪旅享家 · EDITION",
note: "可参与 Bonvoy。退房日期按回程航班调整。备选：The Fullerton Hotel Singapore。\n官网：https://www.marriott.com/en-us/hotels/sineb-the-singapore-edition/rooms/suites/",
},
],
},
{
key: "attractions",
title: "景点门票（需提前订）",
hint: "研究确认必须/建议提前订票的项目；日期为建议，可按行程调整",
items: [
{
id: "a-bkk-mahanakhon",
bkind: "attraction",
name: "Mahanakhon SkyWalk 观景台",
city: "曼谷",
date: "2026-12-13",
day: 2,
guests: "2人",
extra: "提前订 timed slot",
note: "曼谷最高楼 314 米；建议提前订 timed slot，周末售罄；成人约 ฿880（含 72 层室内 + 74 层室外 + 玻璃栈道）；大风暴雨玻璃栈道关闭。",
},
{
id: "a-cnx-elephant",
bkind: "attraction",
name: "大象自然公园 Elephant Nature Park",
city: "清迈",
date: "2026-12-16",
day: 5,
guests: "2人",
extra: "官网预订项目制 · 每日限流",
note: "必须通过官网提前 1–3 周预订（不可自行前往）；半日游 THB 2,500/人、SkyWalk 全日游 THB 3,500/人等，均含清迈酒店往返接送、餐食、向导、保险。认准官方渠道，避开名字相似的“大象营”。",
urgent: true,
},
{
id: "a-pen-bluemansion",
bkind: "attraction",
name: "张弼士故居（蓝屋）导览 Cheong Fatt Tze Mansion",
city: "槟城",
date: "2026-12-21",
day: 10,
guests: "2人",
extra: "官网提前订票 · 每日导览 11:00 / 14:00 / 15:30",
note: "只能跟导览进（约 45 分钟），官网提前订票，现场每团限人数可能扑空；成人 RM25/位。",
},
{
id: "a-kul-twin",
bkind: "attraction",
name: "双子塔空中走廊 + KL Tower Sky Box",
city: "吉隆坡",
date: "2026-12-23",
day: 12,
guests: "2人",
extra: "提前预订",
note: "研究报告建议提前预订：双子塔空中走廊观景台、KL Tower 421 米 Sky Box 玻璃盒。",
},
{
id: "a-sin-mandai",
bkind: "attraction",
name: "万礼野生动物三园（动物园 / 飞禽天堂 / 夜间动物园）",
city: "新加坡",
date: "2026-12-30",
day: 19,
guests: "2大1小",
extra: "提前订票",
note: "研究报告建议提前订票：日间动物园 + Bird Paradise + Night Safari。",
},
],
},
{
key: "restaurants",
title: "餐厅预订（13 家）",
hint: "研究确认需提前订位的餐厅；日期为建议，可按行程调整",
items: [
{
id: "r-bkk-sorn",
bkind: "restaurant",
name: "Sorn",
city: "曼谷",
date: "2026-12-13",
day: 2,
guests: "2人",
extra: "米其林三星 · 需提前数月预订",
note: "泰南菜；有来源称每月 15 日开放新座位。TripAdvisor 显示仅周日 18:00–22:00、周一至周六休息（座位极少），出行前请官网核实营业时间。tasting menu 约 THB 7,800++/人。",
urgent: true,
},
{
id: "r-bkk-cote",
bkind: "restaurant",
name: "Côte by Mauro Colagreco（Capella Bangkok 内）",
city: "曼谷",
date: "2026-12-12",
day: 1,
guests: "2人",
extra: "米其林二星 · SevenRooms / 经酒店预订",
note: "周末晚餐建议提前 1–2 周；smart casual（禁短裤拖鞋）；周一、周二休息。Carte Blanche 9 道约 THB 7,800/人。",
},
{
id: "r-cnx-kiti",
bkind: "restaurant",
name: "Kiti Panit",
city: "清迈",
date: "2026-12-15",
day: 4,
guests: "2人",
extra: "晚餐建议提前订位",
note: "1888 年百年中式大宅里的精致兰纳菜；周二闭店；两人正餐约 2,000–2,600 THB（含酒水）。调味偏重咸辣。",
},
{
id: "r-cnx-dash",
bkind: "restaurant",
name: "Dash! Restaurant",
city: "清迈",
date: "2026-12-16",
day: 5,
guests: "2人",
extra: "晚餐常满座，建议提前订位",
note: "老板 Dash 本人迎宾、母亲掌勺的泰国家常菜；只收现金；周日可能不开，出行前先确认。每道约 200 THB。",
},
{
id: "r-hkt-pru",
bkind: "restaurant",
name: "PRU（Trisara 度假村内）",
city: "普吉",
date: "2026-12-18",
day: 7,
guests: "2人",
extra: "米其林一星 + 绿星 · 官网 dinesuperb 订位",
note: "普吉唯一米其林一星 + 绿星，自有有机农场；12 月旺季提前数周锁位；着装 smart elegant。tasting menu 约 £155/人。",
urgent: true,
},
{
id: "r-hkt-blue",
bkind: "restaurant",
name: "Blue Elephant（普吉老城）",
city: "普吉",
date: "2026-12-19",
day: 8,
guests: "2人",
extra: "晚餐建议提前预约",
note: "百年总督府里的皇家泰餐，Peranakan 套餐普吉独有；午餐套餐性价比高于晚餐；Klook 套餐人均约 US$59。",
},
{
id: "r-pen-aujardin",
bkind: "restaurant",
name: "Au Jardin",
city: "槟城",
date: "2026-12-20",
day: 9,
guests: "2人",
extra: "米其林一星 · 18 席必须提前官网订位",
note: "干草熟成鸭需预订；自带酒开瓶费 RM50/瓶；晚间着装长裤有领，不建议带小孩。午餐 4 道式 RM388++，晚餐 8 道式 RM558++。",
},
{
id: "r-kul-dewakan",
bkind: "restaurant",
name: "Dewakan",
city: "吉隆坡",
date: "2026-12-22",
day: 11,
guests: "2人",
extra: "米其林二星 + 绿星 · 必须提前预订",
note: "2026 马来西亚唯一米其林二星 + 绿星；订窗边位看双子塔夜景；华人食客口碑两极，风味大胆（发酵与本地香草），保守食客慎选。11 道约 RM300/位，17 道约 RM370/位。",
},
{
id: "r-kul-chim",
bkind: "restaurant",
name: "Chim by Chef Noom",
city: "吉隆坡",
date: "2026-12-23",
day: 12,
guests: "2人",
extra: "米其林一星 · 提前预订",
note: "2025 年新获米其林一星的现代泰餐，9 道式品鉴约 3 小时；尽量选玻璃窗位；周一闭店。",
},
{
id: "r-sgn-anan",
bkind: "restaurant",
name: "Anan Saigon",
city: "胡志明市",
date: "2026-12-24",
day: 13,
guests: "2人",
extra: "米其林一星 · 提前数周发邮件订位",
note: "品尝菜单约 $100 USD/位；临时到店可能被安排在外廊等座；周一闭店。楼上 Nhau Nhau 酒吧可顺路喝一杯。",
},
{
id: "r-pqc-pink",
bkind: "restaurant",
name: "Pink Pearl（JW Marriott 富国岛内）",
city: "富国岛",
date: "2026-12-27",
day: 15,
guests: "2人",
extra: "必须提前订位（官网 / 电话）",
note: "富国岛天花板级法餐；八道式 tasting menu VND 4,988,000++；部分晚上有现场歌剧，订位时问清歌剧日期；Smart Casual 着装。",
},
{
id: "r-sin-candlenut",
bkind: "restaurant",
name: "Candlenut",
city: "新加坡",
date: "2026-12-29",
day: 18,
guests: "2大1小",
extra: "提前订位",
note: "全球首家米其林星级娘惹菜，招牌 Ah-ma-kase 套餐 S$138++/位；Dempsey 偏僻，打车前往。",
},
{
id: "r-sin-labyrinth",
bkind: "restaurant",
name: "Labyrinth",
city: "新加坡",
date: "2026-12-30",
day: 19,
guests: "2大1小",
extra: "米其林三星 · 务必提前订位",
note: "“新派新加坡菜”，全店仅 30 座；21 道式体验套餐约 3 小时；周一、周二休息。午餐 S$208/位、晚餐 S$298/位。",
},
],
},
];

/** 把清单项转成预订弹窗的预设（详情全部带过去） */
export function presetFromChecklist(item: ChecklistItem) {
const data: BookingData = {
bkind: item.bkind,
city: item.city,
date: item.date,
dateEnd: item.dateEnd,
time: item.time,
timeEnd: item.timeEnd,
guests: item.guests,
extra: item.extra,
note: item.note,
};
return {
bkind: item.bkind,
name: item.name,
city: item.city,
date: item.date,
dateEnd: item.dateEnd,
day: item.day?? null,
data,
};
}

/** 清单更新时间（显示在页面上） */
export const CHECKLIST_UPDATED_AT = "2026-09-16";
