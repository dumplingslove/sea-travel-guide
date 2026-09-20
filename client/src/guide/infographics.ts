import ig6temples from './assets/infographics/chiangmai/chiangmai-6temples-001.png';
import igCm1Route from './assets/infographics/chiangmai/cm1-handdrawn-route.webp';
import igCm2Itinerary from './assets/infographics/chiangmai/cm2-3d2n-itinerary.webp';
import igCm3Cover from './assets/infographics/chiangmai/cm3-cover-collage.webp';
import igCm3Day1 from './assets/infographics/chiangmai/cm3-day1-itinerary.webp';
import igCm3Day2 from './assets/infographics/chiangmai/cm3-day2-itinerary.webp';
import igCm3Day3 from './assets/infographics/chiangmai/cm3-day3-itinerary.webp';
import igCm3Hotel from './assets/infographics/chiangmai/cm3-hotel-transport.webp';
import igCm3FoodMap from './assets/infographics/chiangmai/cm3-food-map-simcard.webp';
import igCm4Route from './assets/infographics/chiangmai/cm4-handdrawn-itinerary.webp';
import igCm6Routes from './assets/infographics/chiangmai/cm6-3routes-map.webp';
import igCm6Day3 from './assets/infographics/chiangmai/cm6-day3-poster.webp';
import igCm7Day2 from './assets/infographics/chiangmai/cm7-day2-suburb-map.webp';
import igCm7Day3 from './assets/infographics/chiangmai/cm7-day3-market-univ-map.webp';
import igCm8Route from './assets/infographics/chiangmai/cm8-route-poster.webp';
import igCm10Detail from './assets/infographics/chiangmai/cm10-itinerary-detail.webp';
import igCm10Prep from './assets/infographics/chiangmai/cm10-prep-guide.webp';
import igCm10Transport from './assets/infographics/chiangmai/cm10-transport-guide.webp';
import igCm10Food from './assets/infographics/chiangmai/cm10-food-guide.webp';
import igCm10Payment from './assets/infographics/chiangmai/cm10-payment-guide.webp';
import igCm10Hotel from './assets/infographics/chiangmai/cm10-hotel-guide.webp';
import igCmXiriChi from './assets/infographics/chiangmai/xirimuyixizhu-chiangmai-plan.webp';
import igBkXiri from './assets/infographics/bangkok/xirimuyixizhu-bangkok-plan.webp';
import igHcmMuxia from './assets/infographics/hochiminh/muxia-vietnam-handmap.webp';
import igPgXiri from './assets/infographics/penang/xirimuyixizhu-penang-plan.webp';
import igSgXiri from './assets/infographics/singapore/xirimuyixizhu-singapore-plan.webp';
import igMultiCost from './assets/infographics/multi/saltydog-cost-breakdown.webp';
import igMultiHotel from './assets/infographics/multi/saltydog-hotel-breakdown.webp';
import igMultiApps from './assets/infographics/multi/saltydog-useful-apps.webp';
import igMultiRoute from './assets/infographics/multi/kapeidimeng-route-transport-map.webp';
import igMultiCmBk from './assets/infographics/multi/xirimuyixizhu-chiangmai-bangkok-plan.webp';
import igMultiKk from './assets/infographics/multi/xirimuyixizhu-kotakinabalu-plan.webp';
import igMultiPack from './assets/infographics/multi/xirimuyixizhu-packing-list.webp';

export interface Infographic {
file: string;
title: string;
summary: string;
source: string;
postUrl: string;
}

/**
* 攻略信息图：小红书攻略帖中的设计信息图/手绘路线图/文字攻略图。
* 归档清单见 research_notes/sea-guide-2026/xiaohongshu-audit/infographics/README.md
* （2026-09-20 审计版：CM3 五张已按实际内容重命名；route-posts-summary-images 整批 12 张已补录）。
* crossCity 为跨城通用图（花费/住宿/APP/路线交通/行李清单等），在各城市板块末尾以"跨城参考"分组展示。
*/
const chiangmai: Infographic[] = [
{
file: ig6temples,
title: '清迈最值得去的 6 个寺庙对比',
summary: '6 寺庙对比长图：双龙寺 / 契迪龙寺 / 帕辛寺 / 七塔寺 / 悟孟寺 / 松德寺的门票、建议时长、交通、特色对比表与推荐游览顺序。',
source: '用户提供',
postUrl: '',
},
{
file: igCm1Route,
title: '清迈 4 天 3 晚自由行攻略 · 手绘路线图',
summary: '《清迈4天3晚自由行攻略》图1：手绘风格全城路线图（Day1古城/Day2文艺/Day3自然/Day4素贴山购物）。',
source: '小红书@你在发光耶✨',
postUrl: 'https://www.xiaohongshu.com/explore/6a26af2d0000000016025566',
},
{
file: igCm2Itinerary,
title: '清迈天灯节 3 天 2 夜行程',
summary: '《清迈天灯节3天2夜行程》图1：3 天 2 夜行程设计信息图（Day1宁曼路/Day2天灯节/Day3双龙寺瓦洛洛）。',
source: '小红书@林晨.',
postUrl: 'https://www.xiaohongshu.com/explore/6a9aa42000000000110362f7',
},
{
file: igCm3Cover,
title: '清迈 3 天 2 晚攻略详细版 · 封面',
summary: '《清迈回来啦！3天2晚攻略详细版》图1：封面拼贴。',
source: '小红书@白清澄',
postUrl: 'https://www.xiaohongshu.com/explore/6a41018600000000080303ba',
},
{
file: igCm3Day1,
title: '清迈 3 天 2 晚攻略 · Day1 古城一日游',
summary: '图2"Day1-4行程海报"之 Day1 部分：古城一日游文字图（塔佩门→契迪龙寺路线、门票50铢、lila马杀鸡）。注：海报 Day2–Day4 部分缺失待补。',
source: '小红书@白清澄',
postUrl: 'https://www.xiaohongshu.com/explore/6a41018600000000080303ba',
},
{
file: igCm3Day2,
title: '清迈 3 天 2 晚攻略 · Day2 丛林飞跃+料理课',
summary: '图2海报 Day2 部分：丛林飞跃+泰餐料理课（Skyline 378/人、Baan Farm 800铢、宁曼一号）。',
source: '小红书@白清澄',
postUrl: 'https://www.xiaohongshu.com/explore/6a41018600000000080303ba',
},
{
file: igCm3Day3,
title: '清迈 3 天 2 晚攻略 · Day3 集市购物日',
summary: '图2海报 Day3 部分：集市购物一日游（清迈大学/JJ market/椰林市集，机位标注）。',
source: '小红书@白清澄',
postUrl: 'https://www.xiaohongshu.com/explore/6a41018600000000080303ba',
},
{
file: igCm3Hotel,
title: '清迈 3 天 2 晚攻略 · 住宿交通',
summary: '图4住宿交通文字图（Travelodge Nimman 酒店、Grab/Bolt、机场350铢）。',
source: '小红书@白清澄',
postUrl: 'https://www.xiaohongshu.com/explore/6a41018600000000080303ba',
},
{
file: igCm3FoodMap,
title: '清迈 3 天 2 晚攻略 · 美食+景点分布+电话卡',
summary: '图5+图6：美食推荐（考索/Thai food good taste）+ 景点分布图 + 转换头 + 电话卡（移动漫游避雷）。注：独立的图3"Day3详情"单图缺失待补。',
source: '小红书@白清澄',
postUrl: 'https://www.xiaohongshu.com/explore/6a41018600000000080303ba',
},
{
file: igCm4Route,
title: '这次清迈真的玩爽了 · 手绘行程信息图',
summary: '《这次清迈真的玩爽了》图1：手绘行程信息图（Day1抵达大学夜市/Day2 JJ市场椰林/Day3造纸老虎大象咖啡/Day4粘粘瀑布）。',
source: '小红书@lucky Vicki',
postUrl: 'https://www.xiaohongshu.com/explore/6a4622d90000000017008582',
},
{
file: igCm6Routes,
title: '刚回！清迈三天两晚 · 三条路线地图',
summary: '《刚回！清迈三天两晚》图1：清迈三条路线地图（15 个点位：素贴山/双龙寺/宁曼路/唐人街/粘粘瀑布等）。',
source: '小红书@速溶砂糖',
postUrl: 'https://www.xiaohongshu.com/explore/6a97650400000000250366b5',
},
{
file: igCm6Day3,
title: '刚回！清迈三天两晚 · Day3 行程海报',
summary: '《刚回！清迈三天两晚》图4：Day3 行程海报（粘粘瀑布→椰林集市→造纸公园→丛林飞跃→林杰寺，A–E站）。',
source: '小红书@速溶砂糖',
postUrl: 'https://www.xiaohongshu.com/explore/6a97650400000000250366b5',
},
{
file: igCm7Day2,
title: '清迈 3 日不踩雷 · Day2 郊区路线地图',
summary: '《清迈3日旅行全景点不踩雷》图3：Day2 郊区路线地图（老虎王国→造纸公园→elelycafe→天使瀑布→黏黏瀑布，含门票价）。',
source: '小红书@小游本游啊（打工人旅行版）',
postUrl: 'https://www.xiaohongshu.com/explore/697d83b3000000001a0293f4',
},
{
file: igCm7Day3,
title: '清迈 3 日不踩雷 · Day3 集市大学路线地图',
summary: '《清迈3日旅行全景点不踩雷》图4：Day3 集市大学路线地图（JJ market→瓦洛洛→清迈大学→大学夜市→机场）。',
source: '小红书@小游本游啊（打工人旅行版）',
postUrl: 'https://www.xiaohongshu.com/explore/697d83b3000000001a0293f4',
},
{
file: igCm8Route,
title: '听劝！去清迈闭眼抄这篇 3 天路线',
summary: '《听劝！去清迈闭眼抄这篇3天路线！》设计路线海报（Day1宁曼路/Maya/Day2素贴山双龙寺/Day3契迪龙寺塔佩门，步行/打车时长）。',
source: '小红书@泰泰太好啦',
postUrl: 'https://www.xiaohongshu.com/explore/6a603ec7000000001003f802',
},
{
file: igCm10Detail,
title: '第一次来清迈 3 天 2 夜 · 行程详情',
summary: '《第一次来清迈，3天2夜行程》图2：行程详情文字图（D1古城/D2摩托双夜市/D3集市，含门票/开放时间/亮点）。',
source: '小红书@阿文阿珍侣行记',
postUrl: 'https://www.xiaohongshu.com/explore/69638677000000001a034bed',
},
{
file: igCm10Prep,
title: '第一次来清迈 3 天 2 夜 · 出发前准备篇',
summary: '《第一次来清迈，3天2夜行程》图3：出发前准备篇（TDAC/护照/电话卡/现金/换汇点/转换插头/物品/APP）。',
source: '小红书@阿文阿珍侣行记',
postUrl: 'https://www.xiaohongshu.com/explore/69638677000000001a034bed',
},
{
file: igCm10Transport,
title: '第一次来清迈 3 天 2 夜 · 交通篇',
summary: '《第一次来清迈，3天2夜行程》图4：交通篇（曼谷→清迈大交通对比、本地打车/突突车/租摩托/包车费用）。',
source: '小红书@阿文阿珍侣行记',
postUrl: 'https://www.xiaohongshu.com/explore/69638677000000001a034bed',
},
{
file: igCm10Food,
title: '第一次来清迈 3 天 2 夜 · 美食篇',
summary: '《第一次来清迈，3天2夜行程》图5：美食篇文字信息图（美食小贴士：现金/夜市/7-11）。',
source: '小红书@阿文阿珍侣行记',
postUrl: 'https://www.xiaohongshu.com/explore/69638677000000001a034bed',
},
{
file: igCm10Payment,
title: '第一次来清迈 3 天 2 夜 · 支付篇',
summary: '《第一次来清迈，3天2夜行程》图6：支付篇文字信息图（换汇/支付宝/VISA/ATM手续费）。',
source: '小红书@阿文阿珍侣行记',
postUrl: 'https://www.xiaohongshu.com/explore/69638677000000001a034bed',
},
{
file: igCm10Hotel,
title: '第一次来清迈 3 天 2 夜 · 住宿篇',
summary: '《第一次来清迈，3天2夜行程》图7：住宿篇文字信息图（三家酒店对比+订单截图：辛哈拉/POR/兰普）。',
source: '小红书@阿文阿珍侣行记',
postUrl: 'https://www.xiaohongshu.com/explore/69638677000000001a034bed',
},
{
file: igCmXiriChi,
title: '《7月新马泰 solo trip 16天》清迈行程 7.17–7.20',
summary: '作者自制行程图：清迈 7.17–7.20 逐日安排。',
source: '小红书@洗日暮倚修竹',
postUrl: 'https://www.xiaohongshu.com/explore/6a75d9460000000032033a39',
},
];

const bangkok: Infographic[] = [
{
file: igBkXiri,
title: '《7月新马泰 solo trip 16天》曼谷行程 7.21–7.23',
summary: '作者自制行程图：曼谷 7.21–7.23 逐日安排（含曼谷→巴东勿刹交通）。',
source: '小红书@洗日暮倚修竹',
postUrl: 'https://www.xiaohongshu.com/explore/6a75d9460000000032033a39',
},
];

const hochiminh: Infographic[] = [
{
file: igHcmMuxia,
title: '《越南一路南下旅行地图》手绘风',
summary: '手绘风越南南下地图：河内→顺化→岘港→归仁→芽庄→胡志明市，各段交通时间与代表景点，附大叻支线。',
source: '小红书@沐夏在生活',
postUrl: 'https://www.xiaohongshu.com/explore/6a089297000000003701c4f9',
},
];

const penang: Infographic[] = [
{
file: igPgXiri,
title: '《7月新马泰 solo trip 16天》槟城行程 7.24–7.27',
summary: '作者自制行程图：槟城 7.24–7.27 逐日安排。',
source: '小红书@洗日暮倚修竹',
postUrl: 'https://www.xiaohongshu.com/explore/6a75d9460000000032033a39',
},
];

const singapore: Infographic[] = [
{
file: igSgXiri,
title: '《7月新马泰 solo trip 16天》新加坡中转一日行程',
summary: '作者自制行程图：新加坡中转一日行程。',
source: '小红书@洗日暮倚修竹',
postUrl: 'https://www.xiaohongshu.com/explore/6a75d9460000000032033a39',
},
];

/** 跨城通用图：在各城市板块末尾以"跨城参考"分组展示。 */
const crossCity: Infographic[] = [
{
file: igMultiCost,
title: '新马泰六城总花费明细（合计 5096.42）',
summary: '新马泰六城总花费明细表（项目/类目/外币/人民币/备注），可做预算参考。',
source: '小红书@Salty dog',
postUrl: 'https://www.xiaohongshu.com/explore/67ed2791000000001c016fd3',
},
{
file: igMultiHotel,
title: '新马泰住宿明细（总 980）',
summary: '各城市每晚住宿价格明细，附预订截图。',
source: '小红书@Salty dog',
postUrl: 'https://www.xiaohongshu.com/explore/67ed2791000000001c016fd3',
},
{
file: igMultiApps,
title: '出行常用 APP 清单',
summary: '航旅纵横 / 去哪儿 / Agoda / Grab / Bolt / Google Maps / Easybook。',
source: '小红书@Salty dog',
postUrl: 'https://www.xiaohongshu.com/explore/67ed2791000000001c016fd3',
},
{
file: igMultiRoute,
title: '十天新马泰路线 & 交通地图',
summary: 'Google Maps 底图红箭头路线：清迈→曼谷→槟城→新加坡。',
source: '小红书@卡佩迪蒙',
postUrl: 'https://www.xiaohongshu.com/explore/69243d0e000000001e020df8',
},
{
file: igMultiCmBk,
title: '清迈 Day2–3 + 曼谷衔接行程图',
summary: '作者自制行程图：清迈后半程与曼谷衔接安排（含红丝绒火车）。',
source: '小红书@洗日暮倚修竹',
postUrl: 'https://www.xiaohongshu.com/explore/6a75d9460000000032033a39',
},
{
file: igMultiKk,
title: '亚庇行程',
summary: '亚庇行程（跳岛、红树林一日团）。注：亚庇不在本次 8 城行程内，仅供参考。',
source: '小红书@洗日暮倚修竹',
postUrl: 'https://www.xiaohongshu.com/explore/6a75d9460000000032033a39',
},
{
file: igMultiPack,
title: '行李清单（35L 登山包约 15 斤）',
summary: '作者备忘录截图：35L 登山包 + lulu 牛角包约 15 斤行李清单。',
source: '小红书@洗日暮倚修竹',
postUrl: 'https://www.xiaohongshu.com/explore/6a75d9460000000032033a39',
},
];

export const infographicsByCity: Record<string, Infographic[]> = {
'清迈': chiangmai,
'曼谷': bangkok,
'胡志明市': hochiminh,
'槟城': penang,
'新加坡': singapore,
};

export function getInfographics(city: string): Infographic[] {
return infographicsByCity[city]?? [];
}

export function getCrossCityInfographics(): Infographic[] {
return crossCity;
}
