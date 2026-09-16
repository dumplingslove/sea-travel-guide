/**
* 预订页面「待预订清单」：按 2026-12-12 ~ 12-31 二十天行程整理的可预订项。
*
* 数据来源（更新于 2026-09-16）：
* - 7 段城际航班：Duffel 实测（2026-09-14/15，2 成人，见 planner-logic.ts DUFFEL_MEASURED）
* - 8 城酒店：万豪系主选（用户 Marriott Bonvoy Titanium；hotelCityChecks 2026-09-13 官方页核验）
* - 2 段国际航班：尚未比价，占位待定
*
* 注意：机票价格会变，Duffel 未返回退改信息，出票前重查。
* Titanium 会员权益（升级/酒廊/早餐）以入住时各酒店政策为准，不在此做承诺。
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
/** 需要优先锁定的脆弱航段 */
urgent?: boolean;
}

export interface ChecklistSection {
key: string;
title: string;
hint: string;
items: ChecklistItem[];
}

const DUFFEL = "Duffel 实测 2026-09-14/15 · 2 成人合计 · 价格会变，Duffel 未返回退改信息，出票前重查";

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
