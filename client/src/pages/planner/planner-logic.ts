/**
 * 行程规划工具 · 原生集成（/planner 直挂，不再用 iframe）
 * ------------------------------------------------------------------
 * 移植自 ~/workspace/sea-migration/planner-port/planner/index.html
 * （P3 移植版，含 INTEGRATION.md 记录的 7 项诚实度修复，原样保留）。
 * 运行在 Shadow DOM 内：样式零泄漏、ID 零冲突。
 * 地点数据直接消费研究数据（client/src/planner-data/research-items.ts，
 * 由 scripts/gen-planner-data.js 从 research-status.json 程序化生成）。
 * 航班矩阵：client/src/planner-data/flight-matrix.js（56 方向，字节级拷贝，只读）。
 *
 * 与 iframe 版的差异（诚实记录）：
 * 1. citySpots 改由 PLANNER_CITY_SPOTS（研究 JSON 景点条目）提供——已逐项核对，
 *    与原 citySpots 逐字一致（曼谷 9 项为城内项，2 城外项剔除，见生成脚本注释）。
 *    classicSpotHits 61 个命中名全部命中清单，无"估算"降级（移植时已程序化校验）。
 * 2. 吉隆坡酒店卡：验收要求必须保留「研究报告未给出候选酒店」的缺口提示。
 *    研究 JSON 中确有 5 条吉隆坡酒店研究记录（PLANNER_KL_HOTELS），仅作研究
 *    状态参考展示，不得以「研究已给出候选、缺口已满足」替代该文案。
 * 3. .tabs 取消吸顶（应用内嵌时避免盖住站点导航）；tab 切换滚动改为宿主 scrollIntoView。
 * 4. 顶部追加一行研究数据来源说明（researchProvenance）。
 */
import plannerCss from "./planner.css?raw";
import plannerBody from "./planner-body.html?raw";
import "../../planner-data/flight-matrix.js";
import {
  PLANNER_CITY_SPOTS,
  RESEARCH_UPDATED_AT,
  RESEARCH_META,
  type ResearchStatus,
} from "../../planner-data/research-items";
/* 景点详细信息：攻略站 8 城 69 个景点的完整条目（名称/关键信息/游览重点/怎么安排），
   供分步规划 Step1 选城时直接结合决策，不再只看城市名。 */
import { attractions } from "../../guide/data";
import {
  savePlannerPlan,
  loadPlannerPlan,
  cachePlannerPlanLocally,
  type PlannerPlan,
  type LoadedPlan,
} from "../../guide/plannerSchedule";

/* ---------------- 类型 ---------------- */
interface ClassicSource { title: string; url: string; author?: string; date?: string; excerpt?: string; commentExcerpt?: string; verdict?: string; readNote?: string }
interface ClassicRoute { verdicts: string[]; days: [string, string][]; sources: ClassicSource[]; xhsEvidence?: { status: string; note?: string } }
interface SpotDetail { name: string; address: string; hours: string; lastEntry: string; price: string; transit: string; must: string; reason: string; avoid: string; sources: [string, string][] }
interface PublicHoliday { countries: string[]; short: string; name: string; sources: [string, string][] }
interface SpecialMarker { city: string; short: string; title: string; body: string }
interface PlannerState { start: string; schedule: Record<string, { city: string; mode: string }>; edited: boolean; calMode: "decision" | "schedule" }
interface MatrixFlight { flight_no?: string; dep?: string; arr?: string; duration?: string; airport?: string; arrival_airport?: string; operating_days?: string[]; note?: string }
interface MatrixAirline { code: string; name: string; operating_days?: string[]; typical_departures?: string[]; schedule_note?: string; merge_note?: string; flights?: MatrixFlight[]; safety?: { verdict?: string; iosa?: boolean; note?: string; source_urls?: string[] } }
interface MatrixRoute { origin: string; destination: string; direct?: string; verification_status: string; calendar_warnings?: string[]; notes?: string; airlines?: MatrixAirline[]; rail?: { hsr?: { available?: boolean }; conventional?: { service: string; operator: string; route: string; duration: string; frequency: string; price: string; booking: string; source_urls?: string[] }[] } }
interface RouteAssessment { kind: "unknown" | "no-direct" | "pending" | "no-service" | "direct"; airlines: MatrixAirline[] }

/**
 * 挂载规划器到宿主元素。返回卸载函数（StrictMode 安全，可重复挂载）。
 */
export function initPlanner(hostEl: HTMLElement): () => void {
  const shadow: ShadowRoot = hostEl.shadowRoot ?? hostEl.attachShadow({ mode: "open" });
  shadow.innerHTML = `<style>${plannerCss}</style><div class="planner-scope">${plannerBody}</div>`;
  const S: ShadowRoot = shadow;

  const el = (id: string): HTMLElement => {
    const n = S.getElementById(id);
    if (!n) throw new Error(`planner: #${id} 不存在`);
    return n as HTMLElement;
  };
  /* 日历/景点详情等区块已并入向导步骤内按需渲染，不在 DOM 时返回 null 而不是抛错 */
  const elOpt = (id: string): HTMLElement | null => S.getElementById(id) as HTMLElement | null;
  const inputVal = (id: string): string => (el(id) as HTMLInputElement | HTMLSelectElement).value;

  /* 地点清单：研究数据（程序化生成），替换原 citySpots 字面量 */
  const citySpots: Record<string, string[]> = PLANNER_CITY_SPOTS;

  const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };

/* citySpots 已删除：改由 research-items.ts（PLANNER_CITY_SPOTS，研究 JSON 程序化生成）提供 */

const classicRoutes: Record<string, ClassicRoute> = {
 "曼谷":{
  verdicts:["极限打卡：只看老城核心","核心初识：老城＋河岸","经典推荐：城市层次完整","从容版：加入市场与社区","深度版：近郊历史也覆盖"],
  days:[
   ["王城与河岸","大皇宫 → 卧佛寺 → 渡船到郑王庙 → 唐人街晚餐"],
   ["新旧曼谷","Jim Thompson House / 暹罗商圈 → 伦披尼公园 → Mahanakhon 日落"],
   ["大城府一日","Ayutthaya 寺庙遗址与河畔；晚上回曼谷"],
   ["市场与运河","美功铁道市场 / 水上市场二选一，或改走吞武里运河社区"],
   ["留白与在地感","恰图恰（周末）/ Bang Krachao 骑行 / 博物馆三选一，晚上按摩或屋顶酒吧"]
  ],
  sources:[
   {title:"How to Plan a Trip to Bangkok (First-Timers' Travel Guide 2026)",url:"https://www.thailandhighlights.com/thailand/bangkok/how-to-plan-a-trip",author:"未记录",date:"未记录",excerpt:"D2 大皇宫/Wat Pho/Wat Arun/唐人街；D3 大城府一日；D4 市场线（Mahachai + 美功铁道 + 丹嫩莎朵水上市场）",commentExcerpt:"未收录",verdict:"keep（2026-09-14 逐源打开核验）",readNote:"HTTP 200 实开，标题一致，为真实的曼谷首访行程攻略。D2（Jim Thompson/暹罗/伦披尼/Mahanakhon）该文无此安排，但经多源共识验证为公认走法（detourista 2026 攻略 Day 2 原话：\"SIAM, MAHANAKHON & RIVER CRUISE… Jim Thompson House Museum… Mahanakhon Skywalk\"）。"},
   {title:"5 Days Itinerary in Bangkok | Authentic City Guide and Blog",url:"https://www.thetravelblogs.com/5-days-itinerary-in-bangkok/",author:"未记录",date:"未记录",excerpt:"D1 恰图恰+按摩+唐人街；D2 大皇宫+寺庙+渡船到 Wat Arun；D3 大城；D4 考山路+夜市；D5 博物馆+泰拳+暹罗购物",commentExcerpt:"未收录",verdict:"keep（2026-09-14 逐源打开核验）",readNote:"真实的个人 5 天曼谷行程；天数顺序不同但元素一致（王城线、市场线、留白线均对上）。"}
  ],
  xhsEvidence:{status:"insufficient",note:"小红书详细帖实证研究进行中（另有专人负责），暂未接入。"}
 },
 "清迈":{
  verdicts:["古城精华打卡","推荐起点：古城＋素贴山","经典推荐：再加市场与手作","从容版：加烹饪课或大象保护","深度版：自然、社区与慢生活"],
  days:[
   ["兰纳古城","帕辛寺 → 契迪龙寺 → 三王纪念碑 → 夜市 / 周日步行街"],
   ["素贴山线","双龙寺 → 悟孟寺或 Wat Pha Lat → 宁曼路晚餐"],
   ["市场与手作","Jing Jai / 瓦洛洛市场 → Baan Kang Wat 手作村"],
   ["在地体验","正规泰餐烹饪课；或选择 Elephant Nature Park 伦理型大象项目"],
   ["山野一日","因他农国家公园；若不想远行则留在古城做按摩、咖啡与慢逛"]
  ],
  sources:[
   {title:"Itinerary for 5 day trip to Chaing Mai",url:"https://roamaround.app/itinerary/chaing-mai/5-days/66b233ad08eb8eb28e144131",author:"未记录",date:"未记录",excerpt:"D1 古城 Wat Phra Singh；D2 Elephant Nature Park 伦理大象；D3 双龙寺+宁曼晚餐；D4 烹饪课+夜市+按摩；D5 因他农国家公园——与本 5 天计划几乎逐天对应",commentExcerpt:"未收录",verdict:"replace（2026-09-14 核查指令 R1；核查员+协调员双重实开验证）",readNote:"原 Tripadvisor 3 天文（作者 Chawadee Nualkhair，2024-03-25）撑不起 5 天计划，已替换为逐天对应的 5 天版本。"},
   {title:"Chiang Mai Itinerary: 5 Days of Discovery",url:"https://itimaker.com/blog/chiang-mai-itinerary-5-days",author:"未记录",date:"未记录",excerpt:"D1 Wat Phra Singh→Wat Chedi Luang→三王纪念碑→按摩；D2 双龙寺+徒步；D3 Warorot 市场+手工艺村；D4 烹饪课；D5 拜县（Pai）一日",commentExcerpt:"未收录",verdict:"keep（2026-09-14 逐源打开核验）",readNote:"4/5 天大体一致；D5 拜县 vs 因他农属公认经典替代，无需改描述。D3 的 Jing Jai 与 Baan Kang Wat 为真实热门地点，本次抓取的公开英文来源未逐字覆盖（部分支持）。"}
  ],
  xhsEvidence:{status:"insufficient",note:"小红书详细帖实证研究进行中（另有专人负责），暂未接入。"}
 },
 "普吉":{
  verdicts:["一日只够海岛或本岛二选一","核心初识：本岛＋出海","经典推荐：海、城、寺都有","从容版：加度假留白","深度版：再加大象保护或第二条海线"],
  days:[
   ["本岛文化线","查龙寺 → 普吉老城 → 南部观景台 / 神仙半岛日落"],
   ["安达曼海一日","皮皮岛 / 攀牙湾二选一，按海况预订快艇或双体船"],
   ["海滩与夜色","Kata / Karon 放松 → 按摩 → 芭东或老城夜市"],
   ["度假日","上午泳池与私家海滩，下午咖啡或日落餐厅，不再硬塞远程景点"],
   ["保护与自然","Phuket Elephant Sanctuary；或用作第二个海岛日与坏天气机动日"]
  ],
  sources:[
   {title:"3-Day Phuket Itinerary for First Timers: Must-Do Activities",url:"https://www.viator.com/en-SG/blog/Phuket/d349/How-To-Spend-3-Days-in-Phuket/i277",author:"未记录",date:"未记录",excerpt:"D1 查龙寺+普吉老城+Big Buddha；D2 皮皮岛（Maya Bay）；D3 James Bond Island/攀牙湾；芭东 Bangla Road 夜生活",commentExcerpt:"未收录",verdict:"keep（2026-09-14 逐源打开核验）",readNote:"与本计划 D1/D2/D3 核心逻辑一致（D4 度假日、D5 大象营超出 3 天范围，由来源2支撑）。"},
   {title:"The Ultimate 3 to 5 Day Phuket Itinerary",url:"https://ahmeddawn.com/blog/the-ultimate-3-to-5-day-phuket-itinerary",author:"未记录",date:"未记录",excerpt:"\"Big Buddha、Old Phuket Town、Wat Chalong\"；\"Phi Phi Islands Day Trip… based on sea conditions\"；\"Kata Beach and Karon Beach、Night Markets\"；\"Elephant Sanctuary Tour: Opt for a responsible sanctuary\"",commentExcerpt:"未收录",verdict:"keep（2026-09-14 逐源打开核验；清单式 3–5 天指南，非逐日行程）",readNote:"D3\"按摩\"元素无直接原文支持但不属编造（部分支持）；D4 度假留白逻辑见 crazydsadventures 原话：\"Save one flexible day for weather, spa time, or another beach\"。"}
  ],
  xhsEvidence:{status:"insufficient",note:"小红书详细帖实证研究进行中（另有专人负责），暂未接入。"}
 },
 "槟城":{
  verdicts:["只够乔治市一圈","最低建议：古城＋升旗山","甜点天数：历史、美食、山景齐","从容版：加海边或娘惹深潜","深度版：再加花园、咖啡与烹饪"],
  days:[
   ["乔治市核心","亚美尼亚街 → 邱公司 → 姓氏桥 → 小印度 / 和谐街 → 熟食中心"],
   ["Air Itam 山线","极乐寺 → 升旗山 → Air Itam 亚参叻沙"],
   ["娘惹与殖民史","娘惹博物馆 → 蓝屋 / 康华利斯堡 → 海墘日落"],
   ["海边或自然","Batu Ferringhi 与夜市；或植物园、浮罗池滑街区慢逛"],
   ["美食深潜","市场早餐 → 烹饪课 / 咖啡巡游 → 最后一轮福建面、炒粿条、煎蕊"]
  ],
  sources:[
   {title:"A Perfect 3-Day Penang Itinerary: George Town & Beyond",url:"https://www.theflashpacker.net/3-day-penang-itinerary-malaysia/",author:"未记录",date:"未记录",excerpt:"D1 遗产徒步（Pinang Peranakan Mansion、Khoo Kongsi、Street Of Harmony）+街头美食团；D2 街头艺术+姓氏桥（Chew Jetty）；D3 升旗山+极乐寺；延伸含 Batu Ferringhi 海滩、植物园、烹饪课",commentExcerpt:"未收录",verdict:"keep（2026-09-14 逐源打开核验）",readNote:"作者亲历 3 天+4–7 天延伸；本 5 天计划是把该 3 天+延伸建议重组而成，核心元素全有原文支撑。"},
   {title:"Perfect 5-Day Penang Itinerary 2026",url:"https://my.trip.com/guide/info/itinerary-in-penang.html",author:"未记录",date:"未记录",excerpt:"5-Day Itinerary: Deeper Penang Exploration 与本计划高度吻合（Day4 亚美尼亚街+姓氏桥+蓝屋；Day5 Chowrasta/Ayer Itam 市场+烹饪课+cendol+夜市）",commentExcerpt:"未收录",verdict:"keep（2026-09-14 逐源打开核验）",readNote:"该页另有\"详细版 5 天\"编排不同（Day3 Balik Pulau、Day4 国家公园），属正常编排差异。"}
  ],
  xhsEvidence:{status:"insufficient",note:"小红书详细帖实证研究进行中（另有专人负责），暂未接入。"}
 },
 "吉隆坡":{
  verdicts:["城市地标打卡","核心推荐：市区＋黑风洞","经典推荐：文化层次完整","从容版：加近郊半日","深度版：马六甲一日也能放进来"],
  days:[
   ["KLCC 与夜景","双子塔 → KLCC Park → 武吉免登 → Jalan Alor 夜市"],
   ["历史与街区","独立广场 → 中央市场 → 茨厂街 / 鬼仔巷 → 天后宫"],
   ["黑风洞与博物馆","黑风洞早场 → 伊斯兰艺术博物馆 → Perdana 植物园"],
   ["近郊选择","布城建筑与湖巡游；或 Kuala Selangor 萤火虫 / 天空之镜"],
   ["马六甲一日","荷兰红屋 → 鸡场街 → 圣保罗山 → 河畔，晚间回吉隆坡"]
  ],
  sources:[
   {title:"2026 Kuala Lumpur Itinerary (5 Days 4 Nights) with Budget",url:"https://thepinaysolobackpacker.com/kuala-lumpur-itinerary/",author:"未记录",date:"未记录",excerpt:"D1 老城线（Masjid Jamek→独立广场→茨厂街/鬼仔巷→中央市场）+傍晚双子塔→KLCC公园灯光秀；D2 黑风洞早场→布城半日→吉隆坡塔→武吉免登→Jalan Alor夜市；D3 天后宫→小印度→国家清真寺→伊斯兰艺术博物馆→Perdana植物园；D4 云顶高原一日；D5 自由活动后离境",commentExcerpt:"未收录",verdict:"fix（2026-09-14 核查指令 R3：链接有效，说明文案已修正）",readNote:"该文 Day 4 为云顶高原、Day 5 为离境，不含马六甲；支持老城+KLCC夜景、黑风洞+布城、天后宫+伊斯兰艺术博物馆+Perdana植物园组合。本 5 天计划经多源共识验证为经典组合（马六甲一日见 Trip.com \"Day Trip to Malacca… Jonker Street… St. Paul's Church… river cruise\"）。"},
   {title:"Review my Kuala Lumpur trip: Itinerary & tips for first timers",url:"https://whereismai.com/kuala-lumpur-travel-guide-blog-things-to-do-places-to-stay/",author:"未记录",date:"未记录",excerpt:"D1 双子塔→Aquaria KLCC→Jalan Alor；D2 天后宫→茨厂街→鬼仔巷→Jamek清真寺→独立广场→生命之河；D3 黑风洞→Pavilion→武吉免登；D4 Kuala Selangor 萤火虫/蓝眼泪/天空之镜；D5 吉隆坡塔",commentExcerpt:"未收录",verdict:"fix（2026-09-14 核查指令 R3：链接有效，说明文案已修正）",readNote:"D3 非伊斯兰艺术博物馆+Perdana植物园；D5 为吉隆坡塔而非马六甲。来源标注已修正为如实说明各自支持的天数，不再暗示整套 5 天计划出自该文。"}
  ],
  xhsEvidence:{status:"insufficient",note:"小红书详细帖实证研究进行中（另有专人负责），暂未接入。"}
 },
 "胡志明市":{
  verdicts:["一区历史核心打卡","舒适看完城市核心","经典推荐：再加古芝地道","从容版：补美食与华人区","深度版：加湄公河三角洲"],
  days:[
   ["一区历史环线","战争遗迹博物馆 → 统一宫 → 红教堂外观 → 中央邮局 → 滨城市场"],
   ["现代西贡与街区","堤岸 / 平西市场 → 阮惠步行街 → Bitexco 日落 → 美食巡游"],
   ["古芝地道","半日或一日古芝；回城后安排轻松晚餐与按摩"],
   ["咖啡与表演","精品咖啡、街巷小吃、同起街；晚上可看 A O Show"],
   ["湄公河一日","湄公河三角洲水道与乡村；不要与古芝硬塞同一天"]
  ],
  sources:[
   {title:"Ho Chi Minh City Itinerary: How Many Days + 1-5 Day Plans (2026)",url:"https://www.itimaker.com/blog/ho-chi-minh-city-itinerary",author:"未记录",date:"未记录",excerpt:"D1 战争遗迹博物馆→统一宫→圣母大教堂→中央邮局→滨城市场；D2 堤岸→阮惠步行街→美食；D3 Bitexco观景台→阮惠；D4 古芝地道一日游；D5 Tao Dan公园→西贡河滨",commentExcerpt:"未收录",verdict:"fix（2026-09-14 核查指令 R4：链接有效，说明文案已修正）",readNote:"D1 与本计划逐项对应；该文古芝在 Day 4。D4\"咖啡与表演\"部分支持（咖啡文化多源；A O Show 在本次核验的 4 个来源中均未提及→未证实）。"},
   {title:"3D2N Ho Chi Minh City Itinerary: Tunnels, River Cruises & the Best of Saigon",url:"https://www.klook.com/en-SG/blog/hochiminh-itinerary/",author:"未记录",date:"未记录",excerpt:"D1 战争遗迹博物馆→西贡河夜游；D2 \"Choose one: Cu Chi Tunnels day tour or Mekong Delta day tour\"；D3 一区购物街→Cộng Cà Phê→阮惠步行街",commentExcerpt:"未收录",verdict:"fix（2026-09-14 核查指令 R4：原文为 3D2N 行程，说明文案已修正）",readNote:"作者明确反对把古芝和湄公河硬塞同一行程（\"I only picked one day trip outside the city instead of two… trying to squeeze both into a 3D2N trip meant barely any time left\"）；本计划 D3+D5 分开两天与之相符。无 A O Show、无同起街。"}
  ],
  xhsEvidence:{status:"insufficient",note:"小红书详细帖实证研究进行中（另有专人负责），暂未接入。"}
 },
 "富国岛":{
  verdicts:["只够度假村与日落","海岛核心：南岛或北岛二选一","经典推荐：海、陆、夜市齐","从容版：加主题乐园或北岛","深度版：南北岛都覆盖仍有放空"],
  days:[
   ["中央西岸","度假村 / Long Beach → Dinh Cau 日落 → 阳东夜市"],
   ["南岛海线","An Thoi 群岛浮潜 → Sun World 跨海缆车 → Sunset Town"],
   ["海滩与岛内","Sao / Khem Beach → 护国寺 → 胡椒园或鱼露工厂"],
   ["北岛选择","Vinpearl Safari / VinWonders；不想乐园则国家公园与 Cua Can"],
   ["真正度假日","保留整天给酒店、海滩与 SPA；也作为风浪导致出海取消的机动日"]
  ],
  sources:[
   {title:"3-Day Phu Quoc Itinerary for First Timers",url:"https://www.viator.com/en-SG/blog/Phu-Quoc/d22452/How-to-Spend-3-Days-in-Phu-Quoc/i30067",author:"未记录",date:"未记录",excerpt:"An Thoi 群岛浮潜、Vinpearl Safari/国家公园/Cua Can 皮划艇、胡椒园/鱼露厂/珍珠农场",commentExcerpt:"未收录",verdict:"keep（2026-09-14 逐源打开核验）",readNote:"与本计划 D2/D3/D4 直接对应。"},
   {title:"7 Days in Phu Quoc Island Itinerary: A Tropical Paradise Exploration",url:"https://www.agoda.com/travel-guides/vietnam/phu-quoc-island/7-days-in-phu-quoc-island-itinerary-a-tropical-paradise-exploration/",author:"未记录",date:"2024-03-14 更新",excerpt:"D1 Dinh Cau 日落+夜市；D3 Sao Beach+An Thoi 浮潜；D4 胡椒园+鱼露厂；D5 VinWonders+Safari；D6 Spa+D7 轻松海滩",commentExcerpt:"未收录",verdict:"keep（2026-09-14 逐源打开核验）",readNote:"D5\"风浪机动日\"编排逻辑未见明确来源，属合理规划建议（部分支持）。"}
  ],
  xhsEvidence:{status:"insufficient",note:"小红书详细帖实证研究进行中（另有专人负责），暂未接入。"}
 },
 "新加坡":{
  verdicts:["一日滨海湾打卡","城市经典：滨海湾＋文化街区","亲子最低推荐：再加圣淘沙","亲子从容版：加万礼动物园","完整亲子版：留出雨天与机场半日"],
  days:[
   ["滨海湾经典","鱼尾狮 → 艺术科学博物馆 → 滨海湾花园双馆 → Supertree 灯光秀"],
   ["多元文化街区","牛车水 → 小印度 → 甘榜格南；两岁幼儿中午回酒店午休"],
   ["圣淘沙亲子日","新加坡海洋生态馆为主；环球影城按身高与午睡情况选半日或整日"],
   ["万礼动物园日","新加坡动物园 / 飞禽天堂二选一；夜间动物园仅在孩子作息允许时加入"],
   ["机动与机场","Jewel Changi 室内雨天方案 → 乌节路；或把这天留给补眠与返程"]
  ],
  sources:[
   {title:"5-Day Family Adventure in Singapore - Unforgettable Attractions and Culinary Delights - Plantrip",url:"https://plantrip.io/itinerary/959481",author:"未记录",date:"未记录",excerpt:"D1 鱼尾狮→MBS SkyPark→滨海湾花园→艺术科学馆；D2 小印度→甘榜格南；D3 环球影城；D4 圣淘沙+S.E.A. 海洋生态馆；D5 植物园→乌节路",commentExcerpt:"未收录",verdict:"replace（2026-09-14 核查指令 R2；协调员实开验证）",readNote:"AI 辅助+人工审核，139 人浏览；家庭亲子版贴合带娃语境。原 duende 文（作者在新加坡住过 3 年）未收录圣淘沙/Jewel，已替换。"},
   {title:"Ultimate Singapore Itinerary: 2, 3, and 5 Days in the Lion City",url:"http://klook.com/en-SG/blog/things-to-do-in-singapore/",author:"未记录",date:"未记录",excerpt:"D1 滨海湾花园双馆+MBS SkyPark+灯光秀；D2 USS+Skyline Luge+Wings of Time；D3 Mandai 动物园+小印度/甘榜格南；D5 \"allow yourself several hours to explore Jewel Changi Airport before your flight\"",commentExcerpt:"未收录",verdict:"keep（2026-09-14 逐源打开核验）",readNote:"D4\"动物园日\"依据其 D3 的 Mandai；海洋生态馆该文未点名但为圣淘沙标准搭配。D3 圣淘沙多源公认（alike.io 原话：\"Sentosa Island (Universal Studios, S.E.A. Aquarium, beaches)\"）。D2\"幼儿中午回酒店午休\"为带娃规划建议，未证实但非编造。"}
  ],
  xhsEvidence:{status:"insufficient",note:"小红书详细帖实证研究进行中（另有专人负责），暂未接入。"}
 }
};
// 经典路线逐日→精华点真实命中映射（planner-port 移植核验）。
// 命中名必须与 citySpots[city] 逐字一致；命中为空的日=城外日或未命中清单日，不计入覆盖。
// 覆盖率=去重命中数/该城清单总数；若映射名与清单对不上，classicCoverage 自动降级为"估算"。
const classicSpotHits: Record<string, string[][]> = {
 "曼谷":[
  ["大皇宫/玉佛寺/卧佛寺","郑王庙+湄南河游船 Wat Arun","唐人街耀华力路 Chinatown"],
  ["四面佛+暹罗商圈+Jim Thompson House","伦披尼公园 Lumphini","Mahanakhon"],
  [],
  [],
  ["恰图恰周末市场 Chatuchak"]
 ],
 "清迈":[
  ["契迪龙寺+帕辛寺 Wat Chedi Luang·Wat Phra Singh","周日步行街 Sunday Walking Street"],
  ["双龙寺 Wat Phra That Doi Suthep","宁曼路 Nimman"],
  ["瓦洛洛市场 Warorot Market","乌蒙寺+Baan Kang Wat"],
  ["Elephant Nature Park 大象自然公园"],
  ["因他农国家公园 Doi Inthanon"]
 ],
 "普吉":[
  ["查龙寺 Wat Chalong","普吉老镇 Phuket Old Town","神仙半岛+卡塔诺伊 Promthep Cape·Kata Noi"],
  ["攀牙湾/皮皮岛 Phang Nga Bay·Phi Phi"],
  ["芭东Bangla路"],
  [],
  ["Phuket Elephant Sanctuary"]
 ],
 "槟城":[
  ["乔治市UNESCO核心区","Khoo Kongsi 龙山堂邱公司","姓氏桥 Clan Jetties","小印度+和谐街 Little India·Kapitan Keling"],
  ["极乐寺 Kek Lok Si","升旗山 Penang Hill"],
  ["娘惹博物馆 Pinang Peranakan Mansion","康华利斯堡 Fort Cornwallis"],
  [],
  []
 ],
 "吉隆坡":[
  ["双子塔+KL Tower","武吉免登 Bukit Bintang"],
  ["独立广场+中央市场+茨厂街","天后宫 Thean Hou Temple"],
  ["黑风洞 Batu Caves","伊斯兰艺术博物馆","Perdana植物园"],
  [],
  []
 ],
 "胡志明市":[
  ["战争遗迹博物馆","统一宫 Independence Palace","红教堂+中央邮局","滨城市场 Ben Thanh Market"],
  ["堤岸唐人街+平西市场 Cholon","阮惠步行街+同起街","Bitexco Sky Deck"],
  ["古芝地道 Cu Chi Tunnels"],
  [],
  []
 ],
 "富国岛":[
  ["Dinh Cau Rock"],
  ["An Thoi群岛浮潜","Sun World跨海缆车"],
  ["Sao Beach 星星海滩","Khem Beach","Ho Quoc Pagoda 护国寺","富国岛监狱/鱼露工厂/胡椒园"],
  ["VinWonders+Vinpearl Safari"],
  []
 ],
 "新加坡":[
  ["鱼尾狮公园+Spectra+河游船","ArtScience Museum 艺术科学博物馆","Gardens by the Bay 滨海湾花园"],
  ["牛车水/小印度/甘榜格南"],
  ["Singapore Oceanarium 海洋馆","Universal Studios Singapore 环球影城","Sentosa圣淘沙+Skyline Luge"],
  ["万礼三园：动物园/飞禽天堂/夜间动物园"],
  ["Jewel Changi 星耀樟宜+乌节路圣诞灯饰"]
 ]
};
const classicOutsideDayNote: Record<string, Record<number, string>> = {
 "曼谷":{2:"大城府（城外）：不在曼谷 9 精华清单内，不计入覆盖",3:"美功铁道／水上市场／运河社区（城外）：不在曼谷 9 精华清单内，不计入覆盖"},
 "清迈":{},
 "普吉":{3:"度假留白日：未安排清单内景点，不计入覆盖"},
 "槟城":{3:"Batu Ferringhi／植物园／浮罗池滑（城外或未入清单）：不计入覆盖",4:"美食深潜日：未安排清单内景点，不计入覆盖"},
 "吉隆坡":{3:"布城／瓜雪（城外）：不计入覆盖",4:"马六甲一日（城外）：不计入覆盖"},
 "胡志明市":{3:"咖啡与表演日：未新增清单内景点",4:"湄公河三角洲（城外）：不计入覆盖"},
 "富国岛":{4:"真正度假日：未安排清单内景点，不计入覆盖"},
 "新加坡":{}
};
function classicCoverage(city: string, days: number){
  const list=citySpots[city]||[],hits=classicSpotHits[city]||[];
  const seen=new Set();let estimated=false;
  for(let i=0;i<Math.min(days,hits.length);i++){
    (hits[i]||[]).forEach(name=>{if(list.includes(name))seen.add(name);else estimated=true});
  }
  const n=seen.size,total=list.length;
  return {n,total,pct:total?Math.round(n/total*100):0,estimated};
}
const countries: Record<string, { name: string; flag: string; cities: string[] }> = {TH:{name:"泰国",flag:"🇹🇭",cities:["曼谷","清迈","普吉"]},MY:{name:"马来西亚",flag:"🇲🇾",cities:["槟城","吉隆坡"]},VN:{name:"越南",flag:"🇻🇳",cities:["胡志明市","富国岛"]},SG:{name:"新加坡",flag:"🇸🇬",cities:["新加坡"]}};
const cityCountry: Record<string, string> = {};Object.entries(countries).forEach(([k,v])=>v.cities.forEach(c=>cityCountry[c]=k));
const hotels: Record<string, string> = {"曼谷":"The Ritz-Carlton, Bangkok / Park Hyatt Bangkok","清迈":"Chiang Mai Marriott Hotel","普吉":"JW Marriott Phuket Resort & Spa","槟城":"Penang Marriott Hotel","吉隆坡":"待定","胡志明市":"JW Marriott Hotel & Suites Saigon","富国岛":"Park Hyatt 预计 2027-03 开业；候选 New World / Regent","新加坡":"Grand Hyatt Singapore"};
const baselineNights: Record<string, number> = {"曼谷":3,"清迈":2,"普吉":3,"槟城":2,"吉隆坡":2,"胡志明市":2,"富国岛":3}; /* 向导默认天数（新加坡不在向导城市池里） */
const publicHolidays: Record<string, PublicHoliday> = {
 "2026-12-05":{countries:["TH"],short:"泰国国王纪念日",name:"国王普密蓬诞辰／国庆日／父亲节",sources:[["泰国国家旅游局 2026 假日表","https://tourismthailand.com/blog/thailand-public-holidays.html"]]},
 "2026-12-07":{countries:["TH"],short:"泰国补假",name:"国王诞辰／国庆日／父亲节补假",sources:[["泰国国家旅游局 2026 假日表","https://tourismthailand.com/blog/thailand-public-holidays.html"]]},
 "2026-12-10":{countries:["TH"],short:"泰国宪法日",name:"宪法日",sources:[["泰国国家旅游局 2026 假日表","https://tourismthailand.com/blog/thailand-public-holidays.html"]]},
 "2026-12-25":{countries:["MY","SG"],short:"马／新圣诞节",name:"圣诞节",sources:[["马来西亚 2026 年 12 月假日表","https://www.traveloka.com/en-my/explore/tips/december-public-holiday/1003282"],["新加坡人力部公布日历的报道","https://www.hcamag.com/asia/specialisation/benefits/singapore-releases-public-holidays-for-2026/539279"]]},
 "2026-12-31":{countries:["TH"],short:"泰国除夕",name:"除夕（银行假日）",sources:[["泰国国家旅游局 2026 假日表","https://tourismthailand.com/blog/thailand-public-holidays.html"]]}
};
const specialDateMarkers: Record<string, SpecialMarker[]> = {
 "2026-12-01":[{city:"新加坡",short:"USS 私人活动",title:"环球影城私人活动日",body:"购票前按实际日期再次确认开放时段。"}],
 "2026-12-09":[{city:"新加坡",short:"Skyway 维护",title:"OCBC Skyway 全天维护关闭",body:"滨海湾花园两座温室照常开放，空中步道当天不要排。"}],
 "2026-12-11":[{city:"吉隆坡",short:"雪兰莪州假",title:"雪兰莪州苏丹诞辰",body:"雪兰莪州属假日；吉隆坡与布城不放假，但进出周边的人流可能增加。"}],
 "2026-12-12":[{city:"新加坡",short:"USS 私人活动",title:"环球影城私人活动日",body:"购票前按实际日期再次确认开放时段。"}]
};
const constraintSources: Record<string, [string, string]> = {
 chatuchak:["恰图恰营业日","https://www.tripadvisor.ca/Attraction_Review-g293916-d450971-Reviews-or50-Chatuchak_Weekend_Market-Bangkok.html"],
 chiangMaiSaturday:["清迈周六步行街","https://www.tripadvisor.co.nz/ShowUserReviews-g293917-d2233777-r145754718-Saturday_Night_Market_Walking_Street_Wua_Lai_Road-Chiang_Mai.html"],
 chiangMaiSunday:["清迈周日步行街","https://www.tripadvisor.ie/Attraction_Review-g17588730-d19881385-Reviews-Sunday_Night_Market-Si_Phum_Chiang_Mai.html"],
 lardYai:["普吉 Lard Yai 周日市场","https://www.tripadvisor.co.nz/ShowUserReviews-g1215781-d8776186-r1050639534-Sunday_Walking_Street_Market_Lard_Yai-Phuket_Town_Phuket.html"],
 museums:["泰国国家旅游局：曼谷博物馆开放日示例","https://www.tourismthailand.org/Articles/5-amazing-museums-in-bangkok-to-spend-all-day-long"],
 parkHyatt:["Park Hyatt Phu Quoc 2027-03 开放预订报道","https://onemileatatime.com/news/park-hyatt-phu-quoc/"],
 festiveHotel:["曼谷文华东方 2026 旺季条款","https://media.ffycdn.net/eu/mandarin-oriental-hotel-group/d/yKJgufDiG2JzihcU"]
};
const flightMatrix: Record<string, MatrixRoute> = (window as unknown as { FLIGHT_MATRIX?: Record<string, MatrixRoute> }).FLIGHT_MATRIX || {};
const cityAirportCodes: Record<string, string> = {"曼谷":"BKK","清迈":"CNX","普吉":"HKT","槟城":"PEN","吉隆坡":"KUL","胡志明市":"SGN","富国岛":"PQC","新加坡":"SIN"};
const airportCity: Record<string, string> = {BKK:"曼谷",CNX:"清迈",HKT:"普吉",PEN:"槟城",KUL:"吉隆坡",SGN:"胡志明市",PQC:"富国岛",SIN:"新加坡"};
const cityAirportLabels: Record<string, string> = {"曼谷":"BKK / DMK","清迈":"CNX","普吉":"HKT","槟城":"PEN","吉隆坡":"KUL / SZB","胡志明市":"SGN","富国岛":"PQC","新加坡":"SIN"};
const weekdayCodes=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const weekdayZh: Record<string, string> = {Sun:"周日",Mon:"周一",Tue:"周二",Wed:"周三",Thu:"周四",Fri:"周五",Sat:"周六"};
const safetyRank: Record<string, number> = {"推荐":0,"可用":1,"谨慎":2,"待核验":3};
const bangkokSpotDetails: SpotDetail[] = [
 {name:"大皇宫/玉佛寺/卧佛寺",address:"大皇宫：Na Phra Lan Road, Phra Borom Maha Ratchawang, Phra Nakhon, Bangkok 10200；卧佛寺：Sanam Chai Road / Maharaj Road，紧邻大皇宫南侧；常用邮政地址“2 Sanam Chai Rd, Bangkok 10200”待核验",hours:"大皇宫／玉佛寺每日 08:30–15:30（售票处）；卧佛寺每日 08:00–19:30",lastEntry:"大皇宫 15:30 停止售票与入场，园内约 16:30 清场；卧佛寺最后入场时间待核验，建议不晚于 18:30",price:"大皇宫＋玉佛寺外国游客 500 THB，身高 120cm 以下儿童免费；卧佛寺 300 THB，身高 120cm 以下儿童免费；寺内泰式按摩 30/60/120 分钟为 340/520/1,040 THB",transit:"大皇宫：湄南河快船至 Tha Chang 码头步行约 5 分钟，或 MRT Sanam Chai 站步行约 15 分钟；卧佛寺：MRT Sanam Chai 站步行约 5 分钟，或至 Tha Tien 码头",must:"玉佛寺翡翠玉佛、节基王殿、拉玛坚壁画长廊；卧佛寺 46 米贴金卧佛、佛足 108 吉祥纹、108 只铜钵、四世王塔群与泰式按摩学校",reason:"王室建筑、佛教艺术与曼谷老城最具代表性的核心组合，步行衔接效率高。",avoid:"大皇宫可能因王室仪式临时关闭，出发前查官网；着装需遮肩及过膝；建议 08:30 到场避开团队。",sources:[["大皇宫官网","https://royalgrandpalace.th/en/home"],["TripAdvisor 大皇宫页面","https://www.Tripadvisor.Co.nz/Attraction_Review-g293916-d317603-Reviews-The_Grand_Palace-Bangkok.html"],["卧佛寺官网参观信息","https://watpho.com/en/contact/plan"],["Trip.com 大皇宫交通","https://www.trip.com/blog/top-12-reasons-to-visit-grand-palace-bangkok"]]},
 {name:"郑王庙+湄南河游船 Wat Arun",address:"郑王庙：158 Thanon Wang Doem, Wat Arun, Bangkok Yai, Bangkok 10600；旅游船以 Sathorn 中央码头为枢纽，往返 Phra Arthit 并停靠 ICONSIAM、Ratchawongse、Wat Arun、Tha Chang 等码头",hours:"郑王庙每日 08:00–18:00；Blue Flag 旅游船 Sathorn 09:00–19:15、Phra Arthit 08:30–19:00；普通快船工作日约 06:00–21:30、周末及节假日约 06:00–18:40",lastEntry:"郑王庙最后入场时间待核验，建议不晚于 17:00；Blue Flag 旅游船 12 月班次待核验，以码头公示为准",price:"郑王庙外国人 200 THB；Blue Flag 一日票 150 THB、单程 40 THB；橙旗 18 THB、黄旗 23 THB、绿黄旗按距离 16/23/35 THB、红旗 32 THB，票价可能随油价调整",transit:"从 Tha Tien 码头乘约 4.5 THB 摆渡船过河到郑王庙；Blue Flag 旅游船可从 BTS Saphan Taksin 站 2 号出口旁的 Sathorn 码头登船",must:"郑王庙中央大佛塔与瓷片镶嵌、登塔河景、Tha Tien 对岸日落剪影；用一日船票串联大皇宫、卧佛寺、郑王庙、唐人街和 ICONSIAM",reason:"把老城寺庙与湄南河交通合成一条顺路动线，白天看建筑、傍晚看河岸灯光。",avoid:"郑王庙法事或王室活动可能临时调整；旅游船票价与班次会随季节和油价变化，出发前看官方账号及码头公示。",sources:[["郑王庙官方 Facebook","https://web.facebook.com/watarunofficial/"],["Tusk Travel 郑王庙 2026 指南","https://www.tusktravel.com/blog/wat-arun-bangkok-travel-guide/"],["Chao Phraya Express Boat 路线与票价","https://thailandboat.com/bangkok/chao-phraya-express-boat"],["Traveloka 旅游船班次","https://www.traveloka.com/en-au/activities/thailand/product/chao-phraya-hop-on-hop-off-tourist-boat-tour-2000717244350?funnel_id=flight.DES-BKK.internalLink&funnel_source=backlink"]]},
 {name:"恰图恰周末市场 Chatuchak",address:"Kamphaeng Phet Road, Lat Yao, Chatuchak, Bangkok 10900",hours:"主市场周六、周日 09:00–18:00；周三、周四 07:00–18:00 仅植物区；周五 18:00–24:00 为批发场",lastEntry:"开放式市场无统一最后入场；建议 16:00 前到达，主市场按 18:00 收市",price:"免费入场；购物与餐饮自付，可适度议价",transit:"BTS Mo Chit 站 1 号出口；MRT Chatuchak Park 站 1 号出口，或 Kamphaeng Phet 站进入植物区",must:"26 个分区的服装、手工艺、古董、二手与植物；周末集中逛吃、砍价与泰式按摩",reason:"曼谷最具代表性的周末市集，适合用半日至一日集中采购和体验街头饮食。",avoid:"主市场只在周末全开；12 月周末游客多，建议 09:00 到达并先锁定分区，注意防晒、防盗和补水。",sources:[["TripAdvisor 恰图恰页面","https://www.tripadvisor.ca/Attraction_Review-g293916-d450971-Reviews-or50-Chatuchak_Weekend_Market-Bangkok.html"],["Agoda 恰图恰开放时间指南","https://www.agoda.com/travel-guides/thailand/bangkok/chatuchak-weekend-market-timings-your-guide-to-bangkoks-best/"],["Traveloka 恰图恰交通","https://www.traveloka.com/en-ph/explore/tips/things-to-know-before-visiting-chatuchak-weekend-market-in-bangkok-trp/334192"]]},
 {name:"四面佛+暹罗商圈+Jim Thompson House",address:"四面佛：494 Ratchadamri Road, Lumphini, Pathum Wan, Bangkok 10330；暹罗商圈：Rama I Road、BTS Siam 周边；Jim Thompson House：6 Soi Kasemsan 2, Rama 1 Road, Wang Mai, Pathum Wan, Bangkok 10330",hours:"四面佛每日 06:00–22:00；暹罗商圈各商场营业时间待核验；Jim Thompson House 每日 10:00–17:00",lastEntry:"四面佛与商场无统一最后入场；Jim Thompson House 最后一场导览 17:00",price:"四面佛及商场免费入场；Jim Thompson House 成人 250 THB、10–21 岁 150 THB、10 岁以下儿童免费，仅现场售票",transit:"BTS Chit Lom 站到四面佛；BTS Siam 站直达商圈；BTS National Stadium 站 1 号出口步行约 5–6 分钟到 Jim Thompson House，也可乘运河船至 Hua Chang 码头",must:"四面梵天与还愿舞、Siam Paragon 美食与 SEA LIFE、Jim Thompson House 的 6 栋榫卯柚木老屋、东南亚艺术收藏和丝绸店",reason:"祈福、购物与泰式住宅文化可沿 BTS 一线串联，雨天也容易调整。",avoid:"Jim Thompson House 主屋必须跟导览进入，约 35–45 分钟；12 月圣诞季商圈人流大，活动与营业时间出发前查各商场官网。",sources:[["Jim Thompson House 官网","https://jimthompsonhouse.org/"],["Jim Thompson House 参观信息","https://jimthompsonhouse.org/visitor-information/"],["Phuket101 四面佛指南","https://www.phuket101.net/erawan-shrine/"],["Trip.com 四面佛与暹罗交通","https://ph.trip.com/travel-guide/attraction/bangkok/thao-maha-brahma-77017/?curr=IDR&locale=en-PH"]]},
 {name:"金山寺 Wat Saket",address:"344 Thanon Chakkraphatdi Phong, Ban Bat, Pom Prap Sattru Phai, Bangkok 10100",hours:"每日 07:00–19:00；个别来源写 09:00 开门，以 07:00–19:00 为主",lastEntry:"最后入场时间待核验；按 19:00 闭园计，建议不晚于 18:00 开始登山",price:"门票待核验：Trip.com 与 The Bear Travel 为外国人 50 THB，Bangkokian 为 100 THB；原官网域名已被赌博网站占用，请现场确认",transit:"MRT Sam Yot 站步行约 15–20 分钟；或乘 Khlong Saen Saep 运河船至 Panfa Leelard 码头，再步行 5–10 分钟",must:"344 级台阶、山顶金塔与印度佛舍利、360° 曼谷老城全景，日落时段最佳",reason:"老城少见的制高点，能在寺庙密集的一天中补足城市全景。",avoid:"台阶多且正午暴晒；票价和最后入场存在多源分歧，不要按旧官网域名购票。",sources:[["The Bear Travel 金山寺","https://thebear.travel/th/188/Wat-Saket:-The-Temple-of-the-Golden-Mount-in-Bangkok"],["Trip.com 金山寺","https://www.trip.com/travel-guide/attraction/bangkok/wat-sa-ket-ratchaworamahawihan-77023"],["Bangkokian 金山寺","https://bangkokian.com/wat-saket-the-golden-mount-bangkok/"]]},
 {name:"Mahanakhon SkyWalk",address:"114 Naradhiwat Rajanagarindra Road, Si Lom, Bang Rak, Bangkok 10500",hours:"SkyWalk 每日 10:00–19:00；SkyVerse 10:00–21:00；Sky Beach 10:00–24:00，最后上楼 23:00",lastEntry:"日间场 15:30；日落场 18:30；19:00 后观景台仅对 Sky Beach 客人开放",price:"门票价格待核验：官方未公示固定价；2026 年 8–9 月第三方渠道约成人 1,050 THB（74/78 楼＋屋顶）、儿童及 60 岁以上约 450 THB，仅 74 楼约 850 THB",transit:"BTS Silom 线 Chong Nonsi 站，步行不到 10 分钟",must:"74 楼室内 360° 全景、78 楼露天玻璃栈道、约 50 秒高速电梯与 16:00–19:00 日落场",reason:"曼谷最完整的现代城市高空视角，与老城寺庙形成强烈反差。",avoid:"雨天或暴风时 78 楼露天观景台可能关闭且不退款；恐高者慎走玻璃栈道，日落票建议提前购买。",sources:[["King Power Mahanakhon 官网","https://kingpowermahanakhon.co.th/mahanakhon-skyverse/"],["The Standard Sky Beach","https://www.standardhotels.com/bangkok/features/skybeach-rooftopbar-bkk"],["Viator 日落场入场时间","https://www.viator.com/tours/Bangkok/King-Power-MahaNakhon-SkyWalk-at-Bangkok-Admission-Ticket/d343-103612P176"],["Readme 2026-09 价格参考","https://en.readme.me/p/58339"]]},
 {name:"ICONSIAM",address:"299 Charoen Nakhon Road, Khlong Ton Sai, Khlong San, Bangkok 10600",hours:"每日 10:00–22:00",lastEntry:"商场无统一最后入场；建议 21:00 前到达，餐厅、展览与接驳船各自收班",price:"免费入场；餐饮、购物与展览自付",transit:"BTS Gold Line Charoen Nakhon 站与商场直连；或从 BTS Saphan Taksin 站 2 号出口旁 Sathorn 码头乘接驳船，约每 10 分钟一班，参考时段 08:00–23:30",must:"G 层 SookSiam 室内水上市场式美食区、River Park 河岸、顶层观景与 12 月圣诞季灯饰",reason:"雨天友好，能把河岸交通、集中餐饮、购物和夜景合并在同一站。",avoid:"12 月活动季及周末人流大；接驳船班次和末班时间可能调整，当日确认。",sources:[["ICONSIAM 官网","https://www.iconsiam.com/"],["Klook ICONSIAM 指南","https://www.klook.com/en-AU/blog/iconsiam-guide-bangkok/"],["Phuket101 ICONSIAM 指南","https://www.phuket101.net/bangkok/iconsiam-bangkok/"]]},
 {name:"唐人街耀华力路 Chinatown",address:"Yaowarat Road, Samphanthawong, Bangkok 10100",hours:"街区无统一营业时间，日间店铺约 09:00–18:00、夜市小吃摊约 16:00–24:00，具体时段待核验",lastEntry:"开放街区无统一最后入场",price:"免费；餐饮与购物按店消费",transit:"MRT Wat Mangkon 站 1/2 号出口；或湄南河快船至 Ratchawong 码头 N5，再步行约 5–10 分钟",must:"18:00–22:00 的耀华力路街边小吃与霓虹街景、金店街、龙莲寺 Wat Mangkon Kamalawat",reason:"曼谷夜间烟火气最强的街区之一，适合老城行程后的晚餐与夜游。",avoid:"白天部分摊位未开，夜间非常拥挤；热门店先确认营业日与价格，注意保管财物。",sources:[["TripAdvisor 曼谷唐人街","https://www.tripadvisor.ca/Attraction_Review-g293916-d447272-Reviews-or30-Chinatown_Bangkok-Bangkok.html"],["Indochina Voyages 唐人街 2026 指南","https://www.indochinavoyages.com/travel-blog/china-town-in-bangkok-thailand"],["Trip.com 唐人街交通","https://us.trip.com/moments/detail/chinatown-2035757-132044348/"]]},
 {name:"伦披尼公园 Lumphini",address:"Rama IV Road, Wang Mai, Pathum Wan, Bangkok 10330",hours:"每日 04:30–22:00；园内骑行仅 10:00–15:00",lastEntry:"22:00 闭园；免费公园无单独售票截止",price:"免费",transit:"MRT Silom 站 1 号出口或 Lumphini 站 3 号出口；BTS Sala Daeng 站 5 号出口或 Ratchadamri 站 4 号出口",must:"湖上鸭子船与皮划艇、巨蜥、拉玛六世王纪念像、黄昏有氧操及季节性 Music in the Park",reason:"高密度行程中的低强度恢复点，适合清晨运动或傍晚散步。",avoid:"中午暴晒；园内巨蜥较多，应保持距离且不要投喂；禁飞无人机、禁烟酒。",sources:[["曼谷市政府 Greener Bangkok 官方页","https://greener.bangkok.go.th/park/suan-lumpini/"],["Trip.com 伦披尼公园","https://www.trip.com/moments/detail/bangkok-191-136721636/"],["Hotels.com 伦披尼交通","https://www.hotels.com/go/thailand/lumpini-park?intlid=gglist|listitem"]]}
];
let state: PlannerState = {start:"2026-12-12",schedule:{},edited:false,calMode:"decision"};
let modalDate: string | null = null;

const esc=(s: unknown)=>String(s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"} as Record<string,string>)[m]);
function isoDate(d: Date){return d.toISOString().slice(0,10)}
function addDays(iso: string, n: number){const d=new Date(iso+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+n);return isoDate(d)}
function monthCells(){
  // 按起始日＋最长行程动态渲染：从最早相关周的周一起，到最晚已排日期所在周的周日止。
  const sched=Object.keys(state.schedule).sort();
  const first=sched.length?sched[0]:state.start, last=sched.length?sched[sched.length-1]:state.start;
  const earliest=first<state.start?first:state.start, latest=last>state.start?last:state.start;
  const gridStart=addDays(earliest,-((new Date(earliest+"T12:00:00Z").getUTCDay()+6)%7));
  const gridEnd=addDays(latest,6-((new Date(latest+"T12:00:00Z").getUTCDay()+6)%7));
  const n=Math.round((new Date(gridEnd+"T12:00:00Z").getTime()-new Date(gridStart+"T12:00:00Z").getTime())/86400000)+1;
  return {cells:Array.from({length:n},(_,i)=>addDays(gridStart,i)),gridStart,gridEnd,lastScheduled:latest};
}
function monthYearLabel(iso: string){return `${iso.slice(0,4)}年${Number(iso.slice(5,7))}月`}
function routeForCities(from: string, to: string){const a=cityAirportCodes[from],b=cityAirportCodes[to];return flightMatrix[`${a}-${b}`]||null}
function dayCode(date: string){return weekdayCodes[new Date(date+"T12:00:00Z").getUTCDay()]}
function airlineDays(airline: MatrixAirline){return [...new Set([...(airline.operating_days||[]),...(airline.flights||[]).flatMap(f=>f.operating_days||[])])]}
function operatingAirlines(route: MatrixRoute | null, date: string){const day=dayCode(date);return (route?.airlines||[]).filter(a=>airlineDays(a).includes(day)).sort((a,b)=>(safetyRank[a.safety?.verdict ?? ""]??9)-(safetyRank[b.safety?.verdict ?? ""]??9)||a.name.localeCompare(b.name))}
function routeAssessment(route: MatrixRoute | null, date: string): RouteAssessment{
  if(!route)return {kind:"unknown",airlines:[]};
  if(route.direct==="no")return {kind:"no-direct",airlines:[]};
  const airlines=operatingAirlines(route,date),hasSchedule=(route.airlines||[]).some(a=>airlineDays(a).length);
  if(!hasSchedule)return {kind:"pending",airlines:[]};
  if(!airlines.length)return {kind:"no-service",airlines:[]};
  return {kind:"direct",airlines};
}
function scheduleTransitions(){
  const dates=Object.keys(state.schedule).sort(), rows=[];
  for(let i=1;i<dates.length;i++){
    const prev=state.schedule[dates[i-1]],curr=state.schedule[dates[i]];
    if(addDays(dates[i-1],1)===dates[i]&&prev.city!==curr.city){
      const route=routeForCities(prev.city,curr.city),assessment=routeAssessment(route,dates[i]);
      rows.push({date:dates[i],from:prev.city,to:curr.city,route,assessment});
    }
  }
  return rows;
}
function renderTransferAlerts(){
  const wrap=elOpt("transferAlerts");
  if(!wrap) return;
  const rows=scheduleTransitions();
  if(!rows.length){wrap.innerHTML='<div class="transfer-alert"><strong>暂无转场</strong><p>当前日历没有连续两天切换城市。安排城市后，这里会按当天星期查询完整矩阵。</p></div>';return}
  wrap.innerHTML=rows.map(r=>{
    const routeLabel=`${r.date.slice(5)} · ${esc(r.from)}→${esc(r.to)}`,a=r.assessment;
    if(a.kind==="direct")return `<div class="transfer-alert"><strong>${routeLabel}</strong><p>✓ 当天有直飞 · ${a.airlines.map(x=>`${esc(x.code)} ${esc(x.name)}`).join(" / ")} · 安全优先排序。${r.route.verification_status.includes("部分待核验")?" 排班模式已核验，精确日期时刻待核验。":""}</p></div>`;
    if(a.kind==="no-service")return `<div class="transfer-alert blocked"><strong>${routeLabel}</strong><p>⚠ 当天无运营直飞。${esc((r.route.calendar_warnings||[]).join(" ")||"请改期或查看中转、铁路方案。")}</p></div>`;
    if(a.kind==="no-direct")return `<div class="transfer-alert blocked"><strong>${routeLabel}</strong><p>⚠ 已确认无直飞。${esc(r.route.notes||"请查看合理中转方案。")}</p></div>`;
    return `<div class="transfer-alert blocked"><strong>${routeLabel}</strong><p>⚠ ${a.kind==="pending"?"排班模式已核验，精确日期时刻待核验":"尚未核验"}；不能据此推断当天无直飞，请先复核再定转场。</p></div>`;
  }).join("");
}
function sourceLink(source: [string, string]){return `<a href="${source[1]}" target="_blank" rel="noopener noreferrer">${esc(source[0])} ↗</a>`}
function dateLabel(date: string){const names=["周日","周一","周二","周三","周四","周五","周六"],d=new Date(date+"T12:00:00Z");return `${date.slice(5).replace("-","/")}（${names[d.getUTCDay()]}）`}
function renderHardConstraints(){
  const items: { level: string; title: string; body: string; source: string }[] = [], entries=Object.entries(state.schedule).sort(([a],[b])=>a.localeCompare(b));
  const cityDates=(city: string)=>entries.filter(([,p])=>p.city===city).map(([d])=>d);
  const add=(level: string,title: string,body: string,source="")=>items.push({level,title,body,source});

  let holidayHits=0;
  entries.forEach(([date,plan])=>{
    const h=publicHolidays[date];
    if(h&&h.countries.includes(cityCountry[plan.city])){
      holidayHits++;
      add("warn",`${dateLabel(date)} · ${plan.city}撞上${h.name}`,"景点更拥挤，酒店更贵，且部分高端酒店可能要求 minimum stay；餐厅与酒店都应提前订。",h.sources.map(sourceLink).join(" · "));
    }
  });
  if(!holidayHits)add("pass","公共假日检查通过","当前城市分配没有撞上已列出的泰国、马来西亚或新加坡 2026 年 12 月公共假日。",`<a href="https://www.humanresourcesonline.net/public-holidays-in-vietnam-2026-11-official-days-to-note" target="_blank" rel="noopener noreferrer">越南 2026 假日表：12 月无全国性公共假日 ↗</a> · 建议临行前再确认临时公告`);

  entries.forEach(([date,plan])=>{
    (specialDateMarkers[date]||[]).filter(marker=>marker.city===plan.city).forEach(marker=>add("warn",`${dateLabel(date)} · ${marker.title}`,marker.body,"2026 年 12 月特殊开放日核查"));
  });

  const limited=[
    {city:"曼谷",name:"恰图恰周末市场",days:[0,6],dayText:"周六或周日",source:constraintSources.chatuchak},
    {city:"清迈",name:"周六步行街",days:[6],dayText:"周六",source:constraintSources.chiangMaiSaturday},
    {city:"清迈",name:"周日步行街",days:[0],dayText:"周日",source:constraintSources.chiangMaiSunday},
    {city:"普吉",name:"Lard Yai 周日步行街",days:[0],dayText:"周日",source:constraintSources.lardYai}
  ];
  let limitedMisses=0;
  limited.forEach(rule=>{
    const dates=cityDates(rule.city);if(!dates.length)return;
    if(!dates.some(date=>rule.days.includes(new Date(date+"T12:00:00Z").getUTCDay()))){
      limitedMisses++;
      add("warn",`这次去赶不上${rule.name}`,`${rule.city}当前排在 ${dates.map(dateLabel).join("、")}；建议把${rule.city}挪到${rule.dayText}，否则这个限定日体验本次就没有。`,sourceLink(rule.source));
    }
  });
  if(!limitedMisses)add("pass","限定日景点已对上","当前已排城市没有错过恰图恰、清迈周六/周日步行街或普吉 Lard Yai 的限定开放日；未排入的城市不参与检查。","营业日仍建议出行前再确认。 ");

  const mondayThai=entries.filter(([date,plan])=>cityCountry[plan.city]==="TH"&&new Date(date+"T12:00:00Z").getUTCDay()===1);
  if(mondayThai.length)add("warn","泰国周一博物馆闭馆风险",`${mondayThai.map(([d,p])=>`${dateLabel(d)} ${p.city}`).join("、")}：若安排博物馆，请逐馆核对；Museum Siam 等馆周一闭馆，曼谷国家博物馆周一、周二闭馆，不能把所有馆一概而论。`,sourceLink(constraintSources.museums)+" · 建议出行前再确认");

  const mondayKL=cityDates("吉隆坡").filter(date=>new Date(date+"T12:00:00Z").getUTCDay()===1);
  if(mondayKL.length)add("blocked","双子塔周一闭馆",`${mondayKL.map(dateLabel).join("、")} 安排在吉隆坡；双子塔不要排在这些日期。建议改到周二至周日，并提前 3–4 周在线抢票。`,"双子塔 2026 开放时间核查");
  const tuesdayPhuket=cityDates("普吉").filter(date=>new Date(date+"T12:00:00Z").getUTCDay()===2);
  if(tuesdayPhuket.length)add("warn","Siam Niramit 每周二休演",`${tuesdayPhuket.map(dateLabel).join("、")} 安排在普吉；若计划看 Siam Niramit，请换到非周二。`,"Siam Niramit 2026 演出日历核查");

  if(cityDates("曼谷").length)add("warn","11 月中下旬复核大皇宫开放状态","王太后火化仪式存在临时闭馆风险；排曼谷前先复核官方公告，并准备卧佛寺、郑王庙等备选。","行前提醒");
  if(cityDates("清迈").length)add("warn","10 月底前完成 Elephant Nature Park 预订","12 月旺季建议提前 6–8 周预订，不接受 walk-in。","行前提醒");
  if(cityDates("吉隆坡").length)add("warn","双子塔票提前 3–4 周在线预订","12 月时段票可能提前 18–25 天售罄；行程日期确定后立即锁票。","行前提醒");

  const transfers=scheduleTransitions(), problemTransfers=transfers.filter(r=>r.assessment.kind!=="direct");
  problemTransfers.forEach(r=>{
    if(r.assessment.kind==="no-service")add("blocked",`${dateLabel(r.date)} · ${r.from}→${r.to}当天无直飞`,(r.route.calendar_warnings||[]).join(" ")+" 请改期，或查看中转／普通铁路替代。","来源：最终 56 对矩阵 · 2026-09-14");
    else if(r.assessment.kind==="no-direct")add("blocked",`${dateLabel(r.date)} · ${r.from}→${r.to}已确认无直飞`,r.route.notes||"请选择中转方案。","来源：最终 56 对矩阵 · 多源交叉核验");
    else add("warn",`${dateLabel(r.date)} · ${r.from}→${r.to}精确日期待核验`,"排班模式已核验，精确日期时刻待核验；不能据此推断当天无直飞。","来源：最终 56 对矩阵 · 2026-09-14");
  });
  const partialTransfers=transfers.filter(r=>r.assessment.kind==="direct"&&r.route.verification_status.includes("部分待核验"));
  partialTransfers.forEach(r=>add("warn",`${dateLabel(r.date)} · ${r.from}→${r.to}需复核时刻`,"排班模式已核验，精确日期时刻待核验。先用星期模式排顺序，出票前再锁定班次。","来源：最终 56 对矩阵 · 2026-09-14"));
  const kulSin=transfers.filter(r=>[r.from,r.to].includes("吉隆坡")&&[r.from,r.to].includes("新加坡"));
  kulSin.forEach(r=>add("warn",`${dateLabel(r.date)} · 隆新无可用高铁`,"2026年12月无可用高铁；可选直飞，或经新山搭 ETS＋Shuttle Tebrau 联运。","2026-09 交通核查"));
  if(!problemTransfers.length&&!partialTransfers.length)add("pass","航班衔接未触发硬警告","连续换城段在所选星期均有直飞，且没有命中精确日期待核验项目。","来源：最终 56 对矩阵 · 2026-09-14；出票前仍需重查");

  if(cityDates("富国岛").length)add("blocked","Park Hyatt Phu Quoc 在本次 12 月行程不可选","该酒店目前从 2027 年 3 月 1 日起才开放预订；富国岛请改选 New World、Regent 或其他实际可订酒店。",sourceLink(constraintSources.parkHyatt));
  const festive=entries.filter(([date])=>date>="2026-12-24"&&date<="2026-12-31");
  if(festive.length)add("warn","圣诞／跨年酒店条款必须逐家核验",`${festive[0][0].slice(5).replace("-","/")}–${festive[festive.length-1][0].slice(5).replace("-","/")} 有已排住宿：旺季奢华酒店常见 minimum stay、提前全额付款或强制 gala dinner；并非每家都相同，订前看清条款。`,sourceLink(constraintSources.festiveHotel)+"（具体酒店建议出行前再确认）");

  const family=entries.filter(([,p])=>p.mode==="family");
  if(family.length)add("pass","带娃节奏已保留",`${family.length} 个亲子日继续按每天 1–2 个景点＋午休计算；转场当天不要追加晚场。`,`亲子日：${family.map(([d,p])=>`${d.slice(5)} ${p.city}`).join("、")}`);

  const actionable=items.filter(x=>x.level==="warn"||x.level==="blocked").length, count=elOpt("hardCount"), list=elOpt("hardList");
  if(!count||!list) return;
  count.textContent=actionable?`${actionable} 条需处理`:"全部通过";count.classList.toggle("clear",!actionable);
  list.innerHTML=items.map(x=>`<article class="hard-item ${x.level}"><strong>${x.level==="blocked"?"⛔ ":x.level==="warn"?"⚠ ":"✓ "}${x.title}</strong><p>${x.body}</p>${x.source?`<div class="hard-meta">${x.source}</div>`:""}</article>`).join("");
}
/* ---------------- 决策日历：城市适宜度 × 当日直飞 ---------------- */
const decisionCityList = ["曼谷","清迈","普吉","槟城","吉隆坡","胡志明市","富国岛","新加坡"];
type SuitLevel = "ok" | "warn" | "blocked";
interface CitySuit { city: string; level: SuitLevel; reasons: string[] }
/** 某一天 8 个城市各自是否适宜：闭馆日、限定日缺失、公共假日、特殊开放日、跨年旺季。 */
function citySuitability(date: string): CitySuit[] {
  const dow = new Date(date + "T12:00:00Z").getUTCDay(), weekend = dow === 0 || dow === 6;
  const holiday = publicHolidays[date], markers = specialDateMarkers[date] || [];
  return decisionCityList.map(city => {
    const reasons: string[] = []; let level: SuitLevel = "ok";
    const warn = (r: string) => { if (level === "ok") level = "warn"; reasons.push(r); };
    const block = (r: string) => { level = "blocked"; reasons.push(r); };
    if (holiday && holiday.countries.includes(cityCountry[city])) warn(`撞上${holiday.name}，人多、酒店贵`);
    if (date >= "2026-12-24" && date <= "2026-12-31") warn("圣诞/跨年旺季，人多价高，奢华酒店可能有 minimum stay");
    markers.filter(m => m.city === city).forEach(m => warn(`${m.title}：${m.body}`));
    if (city === "曼谷" && !weekend) warn("恰图恰周末市场今日不开");
    if (city === "清迈") { if (dow !== 6) warn("周六步行街今日不开"); if (dow !== 0) warn("周日步行街今日不开"); }
    if (city === "普吉") { if (dow !== 0) warn("Lard Yai 周日步行街今日不开"); if (dow === 2) warn("Siam Niramit 每周二休演"); }
    if (cityCountry[city] === "TH" && dow === 1) warn("泰国周一博物馆闭馆风险，需逐馆核对");
    if (city === "吉隆坡" && dow === 1) block("双子塔周一闭馆");
    return { city, level, reasons };
  });
}
interface DayFlightSummary { direct: number; noService: number; noDirect: number; pending: number; problems: string[] }
/** 某一天 56 个有向城市对的直飞汇总（按星期查矩阵）。 */
function dayFlightSummary(date: string): DayFlightSummary {
  const s: DayFlightSummary = { direct: 0, noService: 0, noDirect: 0, pending: 0, problems: [] };
  for (const from of decisionCityList) for (const to of decisionCityList) {
    if (from === to) continue;
    const a = routeAssessment(routeForCities(from, to), date);
    if (a.kind === "direct") s.direct++;
    else if (a.kind === "no-service") { s.noService++; s.problems.push(`${from}→${to}今日无直飞`); }
    else if (a.kind === "no-direct") s.noDirect++;
    else s.pending++;
  }
  return s;
}
function suitDot(level: SuitLevel){ return level === "blocked" ? "🔴" : level === "warn" ? "🟡" : "🟢"; }
function renderDayIntel(date: string){
  const suits = citySuitability(date), fs = dayFlightSummary(date);
  el("dayIntel").innerHTML = `
  <div class="intel-sec"><h4>当日城市适宜度 <span class="intel-sub">🟢宜 · 🟡谨慎 · 🔴不宜</span></h4>
  ${suits.map(x => `<div class="intel-row ${x.level}"><span class="suit-pill ${x.level}">${suitDot(x.level)} ${x.level === "blocked" ? "不宜" : x.level === "warn" ? "谨慎" : "宜"}</span><b>${x.city}</b><span class="intel-reasons">${x.reasons.length ? esc(x.reasons.join("；")) : "无已知限制"}</span><button class="ghost intel-set" data-city="${x.city}">排为此城</button></div>`).join("")}</div>
  <div class="intel-sec"><h4>当日直飞 <span class="intel-sub">${fs.direct}/56 方向有直飞</span></h4>
  <p class="intel-flights">✈ ${fs.direct} 方向有直飞${fs.noService ? ` · ⚠ 当日无直飞：${esc(fs.problems.join("、"))}` : ""}${fs.pending ? ` · ${fs.pending} 方向精确日期待核验` : ""} · ${fs.noDirect} 方向确认无直飞</p>
  <p class="intel-flights micro">时刻与可售班次以预订时重查为准；隔日航线（普吉↔槟城、清迈↔胡志明市）在周二、周四、周六无直飞。</p></div>`;
  S.querySelectorAll(".intel-set").forEach(btn => btn.addEventListener("click", () => {
    (el("modalCity") as HTMLSelectElement).value = (btn as HTMLElement).dataset.city || "";
  }));
}
function syncCalMode(){
  const d = state.calMode === "decision";
  const t1=elOpt("calModeDecision"), t2=elOpt("calModeSchedule");
  if(!t1||!t2) return;
  t1.classList.toggle("active", d);
  t2.classList.toggle("active", !d);
  t1.setAttribute("aria-pressed", String(d));
  t2.setAttribute("aria-pressed", String(!d));
}
function renderCalendar(){
  const grid=elOpt("calendarGrid");
  if(!grid) return; /* 日历只在向导 Step 3 里渲染，其它步骤直接跳过 */
  const mc=monthCells(),dates=mc.cells;grid.innerHTML="";
  S.querySelector(".calendar")?.setAttribute("aria-label",`${monthYearLabel(mc.gridStart)}–${monthYearLabel(mc.gridEnd)}行程日历`);
  const transferByDate=Object.fromEntries(scheduleTransitions().map(item=>[item.date,item]));
  dates.forEach(date=>{
    const plan=state.schedule[date],d=new Date(date+"T12:00:00Z"),inMonth=date>=state.start&&date<=mc.lastScheduled;
    const wd=["周日","周一","周二","周三","周四","周五","周六"][d.getUTCDay()];
    const holidayData=publicHolidays[date];
    const holiday=holidayData&&(!plan||holidayData.countries.includes(cityCountry[plan.city]))?holidayData.short:"";
    const specials=(specialDateMarkers[date]||[]).filter(marker=>!plan||marker.city===plan.city);
    const dayMarker=[holiday,...specials.map(marker=>marker.short)].filter(Boolean).join(" · ");
    const transition=transferByDate[date],transfer=Boolean(transition),assessment=transition?.assessment;
    const transferCopy=transfer?(assessment.kind==="direct"?`✈ 当天 ${assessment.airlines.length} 家直飞`:assessment.kind==="no-service"?"⚠ 当天无直飞":assessment.kind==="no-direct"?"⚠ 已确认无直飞":"⚠ 精确日期待核验"):"";
    const paceCap=4; /* 双人节奏固定为特种兵默认（约4个点/天），节奏选择器已随智能推荐页移除 */
    const decision=state.calMode==="decision";
    const suits=decision?citySuitability(date):null, fs=decision?dayFlightSummary(date):null;
    const intelHtml=decision&&suits&&fs?`
      <span class="city-strip" aria-hidden="true">${suits.map(x=>`<span class="city-dot ${x.level}" title="${x.city}：${esc(x.reasons.join("；")||"无已知限制")}">${suitDot(x.level)}${x.city}</span>`).join("")}</span>
      ${suits.some(x=>x.level!=="ok")?`<span class="city-why">${suits.filter(x=>x.level!=="ok").map(x=>`<span class="${x.level}">${x.city}：${esc(x.reasons[0]||"")}</span>`).join("")}</span>`:""}
      <span class="flight-line">✈ 当日直飞 <b>${fs.direct}/56</b> 方向</span>
      ${fs.noService?`<span class="no-service-line" role="alert"><b>⚠ 今日无直飞</b>：${esc(fs.problems.map(p=>p.replace(/今日无直飞$/,"")).join("、"))}</span>`:""}`:"";
    const b=document.createElement("button");b.className=`day ${inMonth?"":"out"} ${dayMarker?"holiday":""} ${decision?"decision":""}`;
    b.innerHTML=`<span class="date-no">${d.getUTCDate()}</span><span class="date-wd">${wd}</span>${dayMarker?`<span class="holiday-label">${esc(dayMarker)}</span>`:""}${intelHtml}${plan?`<span class="day-plan ${plan.mode} ${transfer?"transfer":""}">${plan.mode==="family"?"👨‍👩‍👧":"↗"} ${esc(plan.city)}<small>${transfer?esc(transferCopy):(plan.mode==="family"?"1–2点 · 午休":`约${paceCap}个点`)}</small></span>`:""}`;
    const suitNote=decision&&suits?`；适宜度：${suits.map(x=>`${x.city}${suitDot(x.level)}`).join(" ")}`:"";
    const noSvcNote=decision&&fs&&fs.noService?`；今日无直飞：${fs.problems.map(p=>p.replace(/今日无直飞$/,"")).join("、")}`:"";
    b.setAttribute("aria-label",`${date} ${wd}${plan?` ${plan.city} ${plan.mode==="family"?"亲子":"双人"}模式`:" 未安排"}${dayMarker?` ${dayMarker}`:""}${decision&&fs?`；${fs.direct}/56 方向直飞`:""}${noSvcNote}${suitNote}`);b.onclick=()=>openDay(date);grid.appendChild(b);
  });
  const days=Object.keys(state.schedule).length, couple=Object.values(state.schedule).filter(x=>x.mode==="couple").length, family=days-couple;
  const paceName="特种兵";
  const note=elOpt("calendarNote");
  if(note) note.textContent=`当前排入 ${days} 天：双人${paceName}节奏 ${couple} 天，亲子慢节奏 ${family} 天。转场日已保留机场与安全缓冲；已标出泰国 12/5、12/7、12/10、12/31，马来西亚／新加坡 12/25，以及特殊开放与州属假日提醒。日历已按起始日＋最长行程自动扩展至 ${mc.gridStart.slice(5).replace("-","/")}–${mc.gridEnd.slice(5).replace("-","/")}，共 ${Math.round(mc.cells.length/7)} 周。决策视图下每格直接显示 8 城当日适宜度（绿宜／黄谨慎／红不宜）与 56 个方向的直飞汇总，点击日期可看逐城原因、逐方向直飞明细并一键排城。`;
  renderTransferAlerts();
  renderHardConstraints();
}
/* 景点取舍已并入向导 Step 2（定天数）：每城行内直接标注"优先排 / 有余力再去 / 建议舍去"，
   不再有独立 tab；旧的 coverageGrid 卡片渲染与 cityDayCounts 已删除。 */
// 景点详情字段：目前仅曼谷 9 项完成 8 字段研究；其余 7 城研究资料尚未整理为详情字段，
// 结构预留按城接入，数据就绪后直接填入对应数组即可，不拿占位文案冒充完成。
const spotDetails: Record<string, SpotDetail[]> = {"曼谷":bangkokSpotDetails};
const detailCityOrder=["曼谷","清迈","普吉","槟城","吉隆坡","胡志明市","富国岛","新加坡"];
function spotDetailCard(s: SpotDetail, open: boolean){
  return `<details class="spot-detail" ${open?"open":""}><summary>${esc(s.name)}<span>${open?"完整示例":"详情字段"}</span></summary><div class="spot-detail-body"><div class="spot-fields"><div class="spot-field"><b>地址</b><span class="${s.address.includes("待")?"pending-text":""}">${esc(s.address)}</span></div><div class="spot-field"><b>营业时间</b><span class="${s.hours.includes("待")?"pending-text":""}">${esc(s.hours)}</span></div><div class="spot-field"><b>最后入场</b><span class="${s.lastEntry.includes("待")?"pending-text":""}">${esc(s.lastEntry)}</span></div><div class="spot-field"><b>门票／价格</b><span class="${s.price.includes("待")?"pending-text":""}">${esc(s.price)}</span></div><div class="spot-field"><b>交通</b><span class="${s.transit.includes("待")?"pending-text":""}">${esc(s.transit)}</span></div><div class="spot-field"><b>必看／必做</b>${esc(s.must)}</div></div><p><strong>推荐原因：</strong>${esc(s.reason)}</p><p><strong>避坑：</strong><span class="${s.avoid.includes("待")?"pending-text":""}">${esc(s.avoid)}</span></p>${(s.sources||[]).length?`<p class="safety-note"><strong>资料来源：</strong> ${(s.sources||[]).map(sourceLink).join(" · ")}</p>`:""}</div></details>`;
}
function renderSpotDetails(){
  const listEl=elOpt("spotDetailList");
  if(!listEl) return;

  listEl.innerHTML=detailCityOrder.map(city=>{
    const details=spotDetails[city];
    if(details&&details.length)return `<h3 class="sec-title">📍 ${esc(city)} · ${details.length} 项已展开</h3>`+details.map((s,i)=>spotDetailCard(s,city==="曼谷"&&i===0)).join("");
    return `<article class="card card-slim"><h3>📍 ${esc(city)}</h3><p class="route-note">⚠ <strong>详情整理中：</strong>${esc(city)}的景点详情字段（地址／营业时间／最后入场／票价／交通／必看／避坑）研究资料尚未整理完成，暂不展示。数据就绪后接入，不拿占位文案冒充完成。</p></article>`;
  }).join("");
}
function openDay(date: string){modalDate=date;const plan=state.schedule[date];el("modalTitle").textContent=`${date.slice(5).replace("-","月")}日`;renderDayIntel(date);(el("modalCity") as HTMLSelectElement).value=plan?.city||"曼谷";(el("modalMode") as HTMLSelectElement).value=plan?.mode||"couple";el("dayModal").classList.add("open")}
function closeModal(){el("dayModal").classList.remove("open")}
function saveDay(){
  if(!modalDate)return;
  const mode=inputVal("modalMode");
  if(mode==="free")delete state.schedule[modalDate];else state.schedule[modalDate]={city:inputVal("modalCity"),mode};
  state.edited=true;closeModal();renderCalendar();renderSpotDetails();
  const nextDate=addDays(modalDate,1),blocked=scheduleTransitions().filter(r=>r.assessment.kind!=="direct"&&(r.date===modalDate||r.date===nextDate));
  if(blocked.length){const r=blocked[0],label=r.assessment.kind==="no-direct"?"已确认无直飞":r.assessment.kind==="no-service"?"当天无直飞":"精确日期待核验";toast(`${r.date.slice(5)} ${r.from}→${r.to}：${label}。请查看中转、铁路或改期方案。`,true)}else toast("这一天已调整");
}
function removeDay(){if(!modalDate)return;delete state.schedule[modalDate];state.edited=true;closeModal();renderCalendar();renderSpotDetails();toast("这一天已留白")}
function planText(){
  const lines=["2026年12月东南亚行程",""];
  Object.keys(state.schedule).sort().forEach(date=>{const p=state.schedule[date];lines.push(`${date}｜${p.city}｜${p.mode==="family"?"亲子 2大1小（1–2个点＋午休）":p.mode==="free"?"留白 / 休整":"双人"}`)});
  lines.push("","硬约束提醒：泰国公共假日 12/5、12/7补假、12/10、12/31；马来西亚／新加坡圣诞节 12/25；另查 12/1、12/9、12/11、12/12 特殊开放。周末限定市场、闭馆日、航线核验、酒店 minimum stay 与 gala dinner 请按页面检查。航班资料核查于 2026-09-14，预订前仍需按实际日期重查。")
  return lines.join("\n")
}
async function copyPlan(){const text=planText();try{await navigator.clipboard.writeText(text)}catch(e){const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove()}toast("行程已复制")}
function toast(msg: string, warning = false){const t=el("toast");t.textContent=msg;t.classList.toggle("warning",warning);t.classList.add("show");const tt=t as unknown as { _timer?: ReturnType<typeof setTimeout> };clearTimeout(tt._timer);tt._timer=setTimeout(()=>{t.classList.remove("show");t.classList.remove("warning")},warning?5000:2200)}
function updateAll(){renderCalendar();renderSpotDetails();renderTrip();cachePlannerLocal()}


/* ================= 🗺️ 大行程总览（11/28 去程＋中间各段＋1/2 回程；回北京之后暂不规划） ================= */
interface TripSegDef { id: string; label: string; sub: string; mode: string; note: string; cta?: boolean }
const TRIP_ANCHOR = "2026-11-29";   /* 中间段起始日（11/28 为去程航班日） */
const TRIP_MIDDLE_DAYS = 34;        /* 11/29–1/1 */
const TRIP_SEGS: TripSegDef[] = [
  { id:"beijing1", label:"北京", sub:"陪父亲＋倒时差（带娃）", mode:"🏠 家庭", note:"11/28落地北京；末段飞新加坡（日期随天数自动算）" },
  { id:"singapore", label:"新加坡", sub:"亲子段（2大1小＋岳父母）", mode:"👨‍👩‍👧 亲子慢节奏", note:"每天最多 2 个大点，中午留午睡" },
  { id:"couple", label:"夫妻东南亚", sub:"普吉→清迈→曼谷（两人）", mode:"⚡ 特种兵", note:"岳父母带娃回西安，你俩直飞普吉", cta:true },
  { id:"xian", label:"西安", sub:"夫妻一起回西安（3-4天）", mode:"🏠 家庭", note:"泰国结束后两人一起飞西安" },
  { id:"beijing3", label:"北京", sub:"用户一人回北京陪父亲", mode:"🏠 家庭", note:"西安待几天后你一人飞回北京；最后大家在回程城市集结，一起飞西雅图" },
];
let tripDays: Record<string, number> = { beijing1:7, singapore:5, couple:8, xian:4, beijing3:1 };
/* 夫妻东南亚段城市顺序（用户可调）；最后一段飞西安的航班跟着末城动态变 */
let coupleOrder: string[] = ["普吉","清迈","曼谷"];
const CITY_AIRPORT: Record<string,string> = { "普吉":"HKT", "清迈":"CNX", "曼谷":"BKK", "新加坡":"SIN", "北京":"PEK", "西安":"XIY" };
function coupleLastCity(){ return coupleOrder[coupleOrder.length-1] || "曼谷"; }
function thailandToXianLeg(){
  const last = coupleLastCity(), code = CITY_AIRPORT[last] || "BKK";
  return { code: `${code}-XIY`, label: `${last}→西安` };
}
/* 回西雅图出发城市（未定）：北京首都 / 上海浦东 / 重庆江北三选一，用户在大行程里定 */
type ReturnCityCode = "" | "PEK" | "PVG" | "CKG";
let returnCity: ReturnCityCode = "";
const RETURN_CITY_META: Record<Exclude<ReturnCityCode,"">,{city:string;airport:string}> = {
  PEK:{city:"北京",airport:"北京首都"},
  PVG:{city:"上海",airport:"上海浦东"},
  CKG:{city:"重庆",airport:"重庆江北"},
};
/* 每段转场的起飞日：key = transition.after（回程用 "return"）；
   "last" = 本段最后一天飞（默认：最后一天要算上坐飞机的时间），"next" = 次日飞 */
let tripFlightDay: Record<string,"last"|"next"> = {};
function tripFlyChoice(key: string): "last"|"next"{ return tripFlightDay[key]==="next" ? "next" : "last"; }
function tripTotal(){ return TRIP_SEGS.reduce((a,s)=>a+(tripDays[s.id]||0),0); }
function tripRanges(){
  const out: Record<string,{from:string;to:string}> = {}; let cur = TRIP_ANCHOR;
  for(const s of TRIP_SEGS){ const d=tripDays[s.id]||0; const from=cur; const to=addDays(cur,d-1); out[s.id]={from,to}; cur=addDays(cur,d); }
  return out;
}
interface TripFlightLeg { results: number; min: number; max: number; carriers: string[]; direct: boolean }
/* 大行程转场航班实查（只看直飞；待 Google Flights 航班库填充后接入，当前为空即显示"待查询"） */
const TRIP_FLIGHTS: Record<string, TripFlightLeg> = {};
/* 段间转场航班：在 after 段之后、before 段之前插入一行；legs 的 key = "<航段代码>|<转场日期ISO>"（例 "PEK-SIN|2026-12-12"） */
interface TripTransition { after: string; before: string; title: string; legs: { code: string; label: string }[] }
const TRIP_TRANSITIONS: TripTransition[] = [
  { after:"beijing1", before:"singapore", title:"北京→新加坡（2大1小）＋ 西安→新加坡（岳父母2人）",
    legs:[{code:"PEK-SIN",label:"北京→新加坡"},{code:"XIY-SIN",label:"西安→新加坡"}] },
  { after:"singapore", before:"couple", title:"新加坡→普吉（2人）＋ 新加坡→西安（岳父母带娃 2大1小）",
    legs:[{code:"SIN-HKT",label:"新加坡→普吉"},{code:"SIN-XIY",label:"新加坡→西安"}] },
  { after:"couple", before:"xian", title:"__COUPLE_XIY__",
    legs:[{code:"__COUPLE_XIY_CODE__",label:"__COUPLE_XIY_LABEL__"}] },
  { after:"xian", before:"beijing3", title:"西安→北京（用户一人）",
    legs:[{code:"XIY-PEK",label:"西安→北京"}] },
];
function tripFlightNote(key: string, label: string){
  const d=TRIP_FLIGHTS[key];
  if(!d) return `${label}：航班待查询（Google Flights 库填充中）`;
  if(!d.direct) return `${label}：暂无直飞`;
  return `${label}：${d.results}个结果，$${d.min}–$${d.max}，${d.carriers.join(" / ")}`;
}
/* 回西雅图卡片：出发城市三选一（未定）＋起飞日二选一，全部在大行程里定清楚 */
function renderReturnCard(ranges: Record<string,{from:string;to:string}>){
  const lastDay=ranges["beijing3"].to, nextDay=addDays(lastDay,1);
  const choice=tripFlyChoice("return");
  const flyDate=choice==="last"?lastDay:nextDay;
  const cityBtns=[`<button class="${returnCity===""?"primary":"ghost"}" data-returncity="">待定</button>`]
    .concat((Object.keys(RETURN_CITY_META) as Exclude<ReturnCityCode,"">[])
      .map(c=>`<button class="${returnCity===c?"primary":"ghost"}" data-returncity="${c}">${RETURN_CITY_META[c].airport}</button>`))
    .join(" ");
  const dest=returnCity?`${RETURN_CITY_META[returnCity].city} → 西雅图`:`？ → 西雅图（出发城市待定）`;
  const gather=returnCity?`你${returnCity==="PEK"?"已在北京":"从北京出发"}；其他家人前往${RETURN_CITY_META[returnCity].city}的路线待定；会合后一起飞西雅图`:`回程城市待定：你从北京出发，其他家人前往集合城市的路线待定；会合后一起飞西雅图`;
  return `<div class="card trip-seg">
    <div class="trip-seg-head">
      <div class="trip-seg-title">✈️ 回西雅图 <span class="trip-seg-sub">· ${dateLabel(flyDate)} ${dest}</span></div>
      <div class="micro">🧑‍🤝‍🧑 集结：${gather}</div>
      <div class="micro">出发城市：${cityBtns}</div>
      <div class="micro">起飞日：
        <button class="${choice==="last"?"primary":"ghost"}" data-flyday="return|last">集结最后一天 ${dateLabel(lastDay)} 飞</button>
        <button class="${choice==="next"?"primary":"ghost"}" data-flyday="return|next">次日 ${dateLabel(nextDay)} 飞</button>
      </div>
      <p class="micro">北京 / 上海 / 重庆三地回西雅图的国际票价、国内集结成本、总耗时、前一晚机场住宿、带娃难度待比较，先不定；起飞日定清楚，查价才不会错位。</p>
    </div>
  </div>`;
}
function renderTrip(){
  const body=el("tripBody"); const ranges=tripRanges(); const total=tripTotal(); const ok=total===TRIP_MIDDLE_DAYS;
  const segCard=(s: TripSegDef)=>{
    const r=ranges[s.id], d=tripDays[s.id]||0;
    /* 北京（你一人）是独立的一段，永远按原样显示；回程集结城市是它之后单独的卡片，不许把这段改名成上海/重庆 */
    const coupleSub = s.id==="couple" ? coupleOrder.join("→")+"（两人）" : s.sub;
    const coupleOrderBtns = s.id==="couple" ? `<div class="trip-order-btns" style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;"><span class="micro">城市顺序：</span>${coupleOrder.map((c,i)=>`<span class="micro" style="display:inline-flex;align-items:center;gap:2px;"><b>${c}</b>${i>0?`<button class="ghost" data-coupleup="${i}" aria-label="${c}上移" style="padding:2px 6px;">↑</button>`:""}${i<coupleOrder.length-1?`<button class="ghost" data-coupledown="${i}" aria-label="${c}下移" style="padding:2px 6px;">↓</button>`:""}</span>`).join('<span class="micro"> → </span>')}</div>` : "";
    return `<div class="card trip-seg">
      <div class="trip-seg-head">
        <div class="trip-seg-title">${s.label} <span class="trip-seg-sub">· ${coupleSub}</span></div>
        <div class="trip-seg-meta">${s.mode} · ${s.note}</div>
        <div class="trip-seg-dates">📅 ${dateLabel(r.from)} – ${dateLabel(r.to)}</div>
        ${coupleOrderBtns}
        ${s.cta?`<div class="trip-seg-cta"><button class="ghost" id="tripToWizard">去「东南亚城市规划」定这 ${d} 天的城市 →</button></div>`:""}
      </div>
      <div class="stepper trip-stepper" aria-label="${s.label}天数"><button data-tripday="${s.id}|-1" aria-label="减少一天">−</button><output>${d} 天</output><button data-tripday="${s.id}|1" aria-label="增加一天">＋</button></div>
    </div>`;
  };
  const parts: string[] = [];
  for(const s of TRIP_SEGS){
    parts.push(segCard(s));
    const t=TRIP_TRANSITIONS.find(x=>x.after===s.id);
    if(t){
      /* 起飞日二选一：本段最后一天飞（默认）或次日飞，日期明确写出来，不许含糊 */
      const choice=tripFlyChoice(t.after);
      const date=choice==="last"?ranges[t.after].to:ranges[t.before].from;
      const lastD=ranges[t.after].to, nextD=ranges[t.before].from;
      const xiyLeg = thailandToXianLeg();
      const title = t.title.replace("__COUPLE_XIY__", `${xiyLeg.label}（2人）`);
      const legs = t.legs.map(l=>({
        code: l.code.replace("__COUPLE_XIY_CODE__", xiyLeg.code),
        label: l.label.replace("__COUPLE_XIY_LABEL__", xiyLeg.label),
      }));
      const notes=legs.map(l=>tripFlightNote(`${l.code}|${date}`,l.label)).join(" · ");
      parts.push(`<div class="trip-flight"><span>✈️</span><strong>✈ ${dateLabel(date)} ${title}</strong><span>转场</span></div>
    <div class="micro">起飞日：
      <button class="${choice==="last"?"primary":"ghost"}" data-flyday="${t.after}|last">本段最后一天 ${dateLabel(lastD)} 飞</button>
      <button class="${choice==="next"?"primary":"ghost"}" data-flyday="${t.after}|next">次日 ${dateLabel(nextD)} 飞</button>
    </div>
    <p class="micro">${notes}</p>`);
    }
  }
  /* 国内集结段：回程城市定下来后单独的一步，排在北京独自停留之后、国际航班之前，不许并入北京那段。
     只写你本人的路线（你从北京出发）；其他家人前往集合城市的具体路线不编造，统一写"路线待定"。 */
  const gatherRow=(()=>{
    if(!returnCity) return "";
    const m=RETURN_CITY_META[returnCity];
    const date=ranges["beijing3"].to;
    const legs=returnCity==="PEK"
      ? []
      : [{code:`PEK-${returnCity}`,label:`北京→${m.city}（你一人）`}];
    const title=returnCity==="PEK" ? "国内集结（北京）" : `北京→${m.city}（国内集结）`;
    const others=returnCity==="PEK" ? "你已在北京" : "";
    const notes=legs.map(l=>tripFlightNote(`${l.code}|${date}`,l.label)).join(" · ");
    return `<div class="trip-flight"><span>✈️</span><strong>✈ ${dateLabel(date)} ${title}</strong><span>转场</span></div>
    <p class="micro">${others?others+"；":""}其他家人前往${m.city}的路线待定，需在国际航班起飞前到达。</p>
    ${notes?`<p class="micro">${notes}</p>`:""}`;
  })();
  body.innerHTML=`
    <div class="trip-flight"><span>✈️</span><strong>11/28（周六）西雅图 → 北京</strong><span>去程（时间已定）</span></div>
    ${parts.join("\n    ")}
    ${gatherRow}
    ${renderReturnCard(ranges)}
    <p class="micro trip-summary" role="status">已分配 <b>${total}</b> / ${TRIP_MIDDLE_DAYS} 天（北京→新加坡→夫妻东南亚→西安→北京（你一人）；回西雅图${returnCity?`从${RETURN_CITY_META[returnCity].airport}出发`:"（出发城市待定：北京 / 上海 / 重庆）"}）</p>
    ${ok?"":`<p class="micro" role="alert">⚠️ <span class="mismatch">${total<TRIP_MIDDLE_DAYS?`还差 <b>${TRIP_MIDDLE_DAYS-total}</b> 天`:`多了 <b>${total-TRIP_MIDDLE_DAYS}</b> 天`}</span>：11/29–1/1 共 ${TRIP_MIDDLE_DAYS} 天，建议用上面各段的 ＋ / － 凑满；当前为草稿，也可以先保存。</p>`}
    <p class="micro" id="tripSaveNote" role="status" aria-live="polite"></p>
    <div class="wz-nav"><span class="micro">改天数后点保存，同步到云端</span><button class="primary" id="tripSave">💾 保存大行程</button></div>`;
  body.querySelectorAll("[data-tripday]").forEach(b=>(b as HTMLElement).onclick=()=>{
    const [id,dd]=((b as HTMLElement).dataset.tripday||"").split("|");
    tripDays[id]=Math.min(20,Math.max(1,(tripDays[id]||1)+Number(dd)));
    syncWzStart(); /* 大行程天数一变，向导日期锚点立即跟上，不许两处各选一次 */
    renderTrip(); wzRender(); cachePlannerLocal();
  });
  body.querySelectorAll("[data-coupleup]").forEach(b=>(b as HTMLElement).onclick=()=>{
    const i=Number((b as HTMLElement).dataset.coupleup);
    if(i>0){ const c=coupleOrder[i]; coupleOrder[i]=coupleOrder[i-1]; coupleOrder[i-1]=c; }
    renderTrip(); cachePlannerLocal();
  });
  body.querySelectorAll("[data-coupledown]").forEach(b=>(b as HTMLElement).onclick=()=>{
    const i=Number((b as HTMLElement).dataset.coupledown);
    if(i<coupleOrder.length-1){ const c=coupleOrder[i]; coupleOrder[i]=coupleOrder[i+1]; coupleOrder[i+1]=c; }
    renderTrip(); cachePlannerLocal();
  });
  const tw=body.querySelector("#tripToWizard") as HTMLElement|null;
  if(tw) tw.onclick=()=>{ (S.querySelector('[data-tab="wizard"]') as HTMLElement).click(); };
  const sv=body.querySelector("#tripSave") as HTMLButtonElement|null;
  if(sv) sv.onclick=async ()=>{ sv.disabled=true; try{ await persistPlanToCloud(t=>{ el("tripSaveNote").textContent=t; }); }finally{ sv.disabled=false; } };
  body.querySelectorAll("[data-flyday]").forEach(b=>(b as HTMLElement).onclick=()=>{
    const [key,val]=((b as HTMLElement).dataset.flyday||"").split("|");
    tripFlightDay[key]=val==="next"?"next":"last";
    renderTrip(); cachePlannerLocal();
  });
  body.querySelectorAll("[data-returncity]").forEach(b=>(b as HTMLElement).onclick=()=>{
    const v=((b as HTMLElement).dataset.returncity||"") as ReturnCityCode;
    returnCity=(v==="PEK"||v==="PVG"||v==="CKG")?v:"";
    renderTrip(); cachePlannerLocal();
  });
}

/* ================= 🧭 东南亚城市规划向导 ================= */
interface WzCityMeta { tagline: string; decNote: string; stayArea: string; staySource: string }
/* 向导城市池：只含东南亚 7 城。新加坡已在大行程里单独成段（亲子 5 天），不在这里重复选、不重复占天数。 */
const WZ_ORDER = ["曼谷","清迈","普吉","槟城","吉隆坡","胡志明市","富国岛"];
const WZ_META: Record<string, WzCityMeta> = {
 "曼谷":{tagline:"经典推荐：城市层次完整",decNote:"恰图恰只在周末开；周一博物馆闭馆风险；12/5、12/7、12/10、12/31为泰国假日，人多价高",stayArea:"素坤逸商圈（BTS沿线）或暹罗商圈",staySource:"路线帖住宿案例"},
 "清迈":{tagline:"推荐起点：古城＋素贴山",decNote:"周六/周日步行街只在对应日子开；12月旺季大象项目建议提前6–8周订",stayArea:"古城东南（步行可达塔佩门/清迈门）或宁曼路周边",staySource:"路线帖共识"},
 "普吉":{tagline:"核心初识：本岛＋出海",decNote:"出海看海况，建议留1天机动；Lard Yai只在周日；Siam Niramit周二休演",stayArea:"卡塔/卡伦海滩（近码头，方便出海）",staySource:"路线帖共识"},
 "槟城":{tagline:"甜点天数：历史、美食、山景齐",decNote:"12/25圣诞假日人多；升旗山与极乐寺可拼成Air Itam山线一天",stayArea:"乔治市镇中心（交通方便）或巴都丁宜海边",staySource:"路线帖住宿案例"},
 "吉隆坡":{tagline:"核心推荐：市区＋黑风洞",decNote:"双子塔周一闭馆，提前3–4周在线抢票；12/25圣诞",stayArea:"武吉免登（近地铁/Pavilion/阿罗街）或KLCC附近",staySource:"路线帖评论共识"},
 "胡志明市":{tagline:"经典推荐：再加古芝地道",decNote:"12月无全国性公共假日；古芝地道与湄公河三角洲不要塞在同一天",stayArea:"第一郡（独立宫旁，步行可达各景点）",staySource:"路线帖共识"},
 "富国岛":{tagline:"经典推荐：海、陆、夜市齐",decNote:"风浪可能导致出海取消，建议留1天机动；Park Hyatt 2027-03才开业，本次不可选",stayArea:"中央西岸长滩/阳东镇（Dinh Cau日落＋夜市近）",staySource:"路线帖（信息较弱）"}
};
/* 2026-09-27 用户明确：查机票一律用 Google Flights，不再使用 Duffel。
   此处 2026-09-14/15 的 7 条 Duffel 历史直飞/价格已删除；精确日期的实查数据改由
   Google Flights 航班库（hidden_files/flight-db/december-2026.json）提供，
   库里还没有的日期显示"待查询"，不沿用旧价、也不写成"无直飞"。 */
interface WzState { step: number; cities: string[]; days: Record<string, number>; order: string[]; start: string; modes: Record<string, string> }
const wz: WzState = { step:1, cities:[...WZ_ORDER], days:{...baselineNights}, order:[...WZ_ORDER], start:"2026-12-12", modes:{} };
/* 向导日期锚点：永远等于大行程「夫妻东南亚」段起始日，不可单独编辑；大行程天数/云端加载后都要重同步 */
function syncWzStart(){ const c=tripRanges().couple; if(c&&c.from) wz.start=c.from; }
syncWzStart();
function wzDirectCount(city: string){ let n=0; for(const to of WZ_ORDER){ if(to===city)continue; const r=routeForCities(city,to); if(r&&r.direct!=="no")n++ } return n }
function wzRanges(){ const rows: {city:string;from:string;to:string;mode:string}[] = []; let cur=wz.start; for(const city of wz.order){ if(!wz.cities.includes(city))continue; const d=wz.days[city]||1, from=cur, to=addDays(cur,d-1); rows.push({city,from,to,mode:wz.modes[city]||"couple"}); cur=addDays(to,1) } return rows }
/* 日历排期 = 大行程「新加坡」固定阶段（亲子）＋ 向导细分的「夫妻东南亚」城市。
   向导不再单独含新加坡，也不再自带可编辑日期（日期继承大行程），两者不可能各选一次、产生不一致。 */
function buildMergedSchedule(){
  const schedule: Record<string,{city:string;mode:string}> = {};
  const sg=tripRanges().singapore;
  if(sg){ for(let d=sg.from; d<=sg.to; d=addDays(d,1)){ schedule[d]={city:"新加坡",mode:"family"}; } }
  for(const r of wzRanges()){ for(let d=r.from; d<=r.to; d=addDays(d,1)){ schedule[d]={city:r.city,mode:r.mode}; } }
  return {schedule, start: sg?sg.from:wz.start};
}
function syncStartDateInput(){ const sd=S.getElementById("startDate") as HTMLInputElement|null; if(sd) sd.value=state.start; }
/* 日历的初始排期：新加坡固定阶段＋向导夫妻段细分（不再走已删除的智能推荐） */
function buildDefaultScheduleFromWizard(){
  const m=buildMergedSchedule();
  state.schedule=m.schedule; state.edited=false; state.start=m.start;
  syncStartDateInput();
}
function wzLegs(){ const rows=wzRanges(), legs: {from:string;to:string;date:string}[] = []; for(let i=1;i<rows.length;i++) legs.push({from:rows[i-1].city,to:rows[i].city,date:rows[i].from}); return legs }
/* 向导已分配天数（只计夫妻段城市） */
function wzOrderTotal(){ return wz.order.filter(c=>wz.cities.includes(c)).reduce((a,c)=>a+(wz.days[c]||1),0); }
/* 硬约束：已分配必须恰好等于大行程给「夫妻东南亚」的天数，多一天少一天都不许往下走 */
function wzBudgetOk(){
  const total=wzOrderTotal(), budget=tripDays["couple"]||0;
  if(total>budget){ toast(`已分配 ${total} 天，超出大行程「夫妻东南亚」的 ${budget} 天，先减天数`,true); return false; }
  if(total<budget){ toast(`还剩 ${budget-total} 天没分配，加满 ${budget} 天才能继续`,true); return false; }
  return true;
}
function wzLegCheck(from: string, to: string, date: string){
  const route=routeForCities(from,to), a=routeAssessment(route,date);
  if(a.kind==="direct"){ const partial=route&&route.verification_status.includes("部分待核验"); return {level:"pass", html:`<b>✓ 当天有直飞</b>（按星期查矩阵）：${a.airlines.map(x=>esc(`${x.code} ${x.name}`)).join(" / ")}${partial?'<br>⚠ 排班模式已核验，精确日期时刻待核验，出票前重查':""}`} }
  if(a.kind==="no-service") return {level:"blocked", html:`<b>⛔ ${dateLabel(date)}无直飞</b>：${esc((route?.calendar_warnings||[]).join(" ")||"请改期或看中转/铁路方案。")}`};
  if(a.kind==="no-direct") return {level:"blocked", html:`<b>⛔ 已确认无直飞</b>：${esc(route?.notes||"请改走中转。")}`};
  return {level:"warn", html:`<b>⚠ 精确日期待查询</b>：Google Flights 航班库正在逐日填充，当前日期暂无实查数据；不能据此推断当天无直飞，出票前以实查为准。`};
}
function wzSetStep(n: number){
  if(n===2&&wz.cities.length<2){ toast("至少选 2 个城市才能继续",true); return }
  if(n>=3&&!wz.order.filter(c=>wz.cities.includes(c)).length){ toast("先选城市",true); return }
  if(n>=3&&!wzBudgetOk()) return; /* 天数与大行程不一致时锁死，不许进定日期 */
  wz.step=n; wzRender();
  (el("wizard") as HTMLElement).scrollIntoView({behavior:"smooth",block:"start"});
}
/* Step 3 日历与向导选择的同步指纹：指纹变化（城市／天数／顺序／起止）时才按向导重排日历，
   Step 3 里的逐日手工微调不会被反复渲染覆盖；点「🔄 按向导重排日历」可强制同步。 */
let wzLastCalSig="";
function wzCalSig(){
  const cities=wz.order.filter(c=>wz.cities.includes(c));
  return JSON.stringify({cities,days:cities.map(c=>wz.days[c]||1),couple:tripDays["couple"]||0,start:wz.start});
}
function wzRender(){
  const steps=[...S.querySelectorAll("#wzSteps li")] as HTMLElement[];
  steps.forEach(li=>{ const n=Number(li.dataset.wzstep); li.classList.toggle("active",n===wz.step); li.classList.toggle("done",n<wz.step); li.onclick=()=>wzSetStep(n) });
  const body=el("wzBody");
  if(wz.step===1) body.innerHTML=wzStep1();
  else if(wz.step===2) body.innerHTML=wzStep2();
  else body.innerHTML=wzStep3();
  wzWire();
  if(wz.step===2) renderSpotDetails();
  else if(wz.step===3){
    const sig=wzCalSig();
    if(sig!==wzLastCalSig){ wzApplySchedule(); wzLastCalSig=sig; }
    syncStartDateInput(); syncCalMode(); renderCalendar();
  }
}
function wzStep1(){
  const cards=WZ_ORDER.map(city=>{
    const m=WZ_META[city], sel=wz.cities.includes(city), cc=cityCountry[city];
    return `<article class="card wz-city ${sel?"selected":""}" data-city="${city}" role="button" tabindex="0" aria-pressed="${sel}">
      <header><b>${city}</b><span class="micro">${countries[cc].flag} ${countries[cc].name}</span>${sel?'<span class="wz-pick">✓ 已选</span>':""}</header>
      <p class="wz-rec">建议 ${baselineNights[city]} 天 · ${esc(m.tagline)}</p>
      <p class="micro">📅 ${esc(m.decNote)}</p>
      <p class="micro">🏨 ${esc(m.stayArea)}<span class="wz-src">（${esc(m.staySource)}）</span></p>
      <p class="micro">✈ 直飞通达 ${wzDirectCount(city)}/6 城</p>
      ${wzSpotsHtml(city)}
      ${wzCovPreview(city)}
    </article>`;
  }).join("");
  return `<div class="section-head"><div><p class="eyebrow">STEP 1/3</p><h2>先选城市</h2><p class="lede">点卡片选中／取消。展开每城的「精华景点」可直接看景点详细信息（关键信息、游览重点、怎么安排），结合景点再决定去不去。这里只细分大行程「夫妻东南亚」段（${tripDays["couple"]||0} 天）：7 城都在东南亚，新加坡已在大行程里单独安排亲子游，不在这里重复选。</p></div>
    <div class="wz-quick"><button class="ghost" id="wzAll">7城全选</button><button class="ghost" id="wzClear">清空</button></div></div>
    <div class="wz-city-grid">${cards}</div>
    <div class="wz-nav"><span class="micro">已选 <b>${wz.cities.length}</b> 城</span><button class="primary" id="wzNext1">下一步：定天数 →</button></div>`;
}
/* 选城步骤的景点详细信息：取自攻略站景点指南的完整条目（与 /attractions 同源），
   按城过滤；曼谷剔除 2 个城外项（大城府、丹嫩沙多＋美功），与覆盖率口径一致。 */
const WZ_OUTSIDE_SPOTS=new Set(["大城府 Ayutthaya 古城遗迹","丹嫩沙多水上市场+美功铁道"]);
function wzCityAttractions(city: string){
  return attractions.filter(a=>a.city===city&&!WZ_OUTSIDE_SPOTS.has(a.name));
}
function wzSpotsHtml(city: string){
  const list=wzCityAttractions(city);
  if(!list.length) return "";
  const items=list.map(a=>`<li><b>${esc(a.name)}</b><span class="wz-spot-meta">${esc(a.meta)}</span><span class="wz-spot-detail">${esc(a.detail)}</span>${a.best?`<span class="wz-spot-best">📋 ${esc(a.best)}</span>`:""}</li>`).join("");
  return `<details class="wz-spots"><summary>🏛 精华景点 ${list.length} 个 · 展开看详情</summary><ul>${items}</ul><a href="/sea-travel-guide/attractions" target="_blank" rel="noopener">在景点指南查看完整攻略 ↗</a></details>`;
}
/* 各天数覆盖预览：1–5 天分别覆盖哪几天经典路线、舍弃哪几天（评语+逐日主题+精华命中数） */
function wzCovRow(city: string, n: number){
  const route=classicRoutes[city], k=Math.min(n,5), days=route.days.slice(0,5);
  const verdict=n<=5?route.verdicts[n-1]:"深度版＋留白";
  const cov=classicCoverage(city,k);
  const chip=(t:string,cls:string)=>`<span class="spot-chip ${cls}">${esc(t)}</span>`;
  const dayNum=(t:string)=>days.findIndex(x=>x[0]===t)+1;
  const covChips=days.slice(0,k).map(([t])=>chip(`Day${dayNum(t)} ${t}`,"must")).join("");
  const skipChips=days.slice(k).map(([t])=>chip(t,"drop")).join("");
  const skipLine=skipChips
    ? `<div class="micro wz-covline"><span class="wz-covlabel">🚫 舍弃</span>${skipChips}</div>`
    : `<div class="micro wz-covline"><span class="wz-covlabel">🚫 舍弃</span>${n>=5?"5 天经典路线全走完"+(n>5?"，第 6 天为留白机动日":""):"无"}</div>`;
  return `<div class="wz-covrow"><b>${n} 天</b><span class="micro">${esc(verdict)}</span>
    <div class="micro wz-covline"><span class="wz-covlabel">✅ 覆盖 ${cov.n}/${cov.total} 精华</span>${covChips}</div>
    ${skipLine}
  </div>`;
}
function wzCovPreview(city: string){
  const rows=[1,2,3,4,5].map(n=>wzCovRow(city,n)).join("");
  return `<details class="wz-cov"><summary>📅 各天数覆盖预览：选 1/2/3/4/5 天分别覆盖／舍弃哪些</summary><div>${rows}</div></details>`;
}
/* 定天数页的行内景点取舍标注：给定天数下"优先排 / 有余力再去 / 建议舍去"三组（与旧景点取舍 tab 同口径），
   帮用户判断每城几天够。这是规划优先级取舍，不是景点评分。 */
function wzCoverageChips(city: string, days: number){
  const list=citySpots[city]||[], hitsArr=classicSpotHits[city]||[];
  const hitSet=new Set<string>(), hitOrdered: string[]=[];
  for(let i=0;i<Math.min(days,hitsArr.length);i++)(hitsArr[i]||[]).forEach(h=>{if(list.includes(h)&&!hitSet.has(h)){hitSet.add(h);hitOrdered.push(h)}});
  const rest=list.filter(s=>!hitSet.has(s));
  const chip=(t:string,cls:string)=>`<span class="spot-chip ${cls}">${esc(t)}</span>`;
  const grp=(label:string,cls:string,arr:string[])=>`<div class="spot-group"><strong>${label}</strong> ${arr.length?arr.map(s=>chip(s,cls)).join(""):"—"}</div>`;
  return `<div class="spot-groups wz-annot">${grp(`✅ 优先排（${days}天能覆盖）`,"must",hitOrdered)}${grp("🟡 有余力再去","",rest.slice(0,2))}${grp("🚫 建议舍去","drop",rest.slice(2))}</div>`;
}
function wzStep2(){
  const total=wzOrderTotal();
  const seaBudget=tripDays["couple"]||0;
  const budgetDiff=seaBudget-total;
  const atCap=total>=seaBudget;
  const rows=wz.order.filter(c=>wz.cities.includes(c)).map(city=>{
    const d=wz.days[city]||1, route=classicRoutes[city], verdict=d<=5?route.verdicts[d-1]:"深度版＋留白", cov=classicCoverage(city,Math.min(d,5));
    return `<div class="card wz-dayrow"><div><b>${city}</b><div class="micro">${esc(verdict)} · 实际命中 ${cov.n}/${cov.total} 个精华</div>
      ${wzCoverageChips(city,Math.min(d,5))}
      <details class="wz-cov wz-cov-inline"><summary>看 ${d} 天逐日主题</summary><div>${wzCovRow(city,d)}</div></details></div>
      <div class="stepper" aria-label="${city}天数"><button data-wzday="${city}|-1" aria-label="减少一天">−</button><output>${d} 天</output><button data-wzday="${city}|1" aria-label="增加一天"${atCap?" disabled title=\"已达大行程天数上限\"":""}>＋</button></div></div>`;
  }).join("");
  return `<div class="section-head"><div><p class="eyebrow">STEP 2/3</p><h2>定每城天数</h2><p class="lede">1–6 天可调；每城下方直接标注"优先排 / 有余力再去 / 建议舍去"——这是按当前天数算出的取舍优先级（不是景点评分），帮你判断几天够。各城天数之和必须等于大行程「夫妻东南亚」的天数，到上限后 ＋ 会自动锁死。</p></div></div>
    <div class="card" style="margin-bottom:12px"><div class="micro">🗺️ 大行程「夫妻东南亚」段共 <b>${seaBudget}</b> 天；下面已分配 <b>${total}</b> 天${budgetDiff===0?" ✓ 刚好":budgetDiff>0?`，还剩 <b>${budgetDiff}</b> 天没分配（加满才能定日期）`:`，<span class="mismatch">⚠️ 超出 <b>${-budgetDiff}</b> 天（先减天数）</span>`}（天数去「🗺️ 大行程」调整）</div></div>
    ${rows}
    <div class="wz-nav"><button class="ghost" id="wzBack2">← 上一步</button><span class="micro">总计 <b>${total}</b> 天</span><button class="primary" id="wzNext2">下一步：定日期 →</button></div>
    <details class="spot-details-fold"><summary>📋 景点详情字段（研究资料：曼谷已完成，其余整理中）</summary><div class="spot-detail-list" id="spotDetailList"></div></details>`;
}
function wzStep3(){
  const rows=wzRanges();
  const orderRows=rows.map((r,i)=>{
    const up=i>0?`<button class="icon-btn" data-wzup="${i}" aria-label="${r.city}前移">↑</button>`:"<span class='wz-ph'></span>";
    const down=i<rows.length-1?`<button class="icon-btn" data-wzdown="${i}" aria-label="${r.city}后移">↓</button>`:"<span class='wz-ph'></span>";
    return `<div class="card wz-orderrow"><div class="wz-move">${up}${down}</div>
      <div><b>${i+1}. ${r.city}</b><div class="micro">${r.from.slice(5).replace("-","/")} – ${r.to.slice(5).replace("-","/")} · ${wz.days[r.city]}天</div></div>
      <select data-wzmode="${r.city}" aria-label="${r.city}旅行模式"><option value="couple" ${r.mode==="couple"?"selected":""}>双人快节奏</option><option value="family" ${r.mode==="family"?"selected":""}>亲子慢节奏</option></select></div>`;
  }).join("");
  const legs=wzLegs().map(l=>{ const c=wzLegCheck(l.from,l.to,l.date); return `<div class="wz-leg ${c.level}"><strong>${l.date.slice(5).replace("-","/")} · ${l.from} → ${l.to}</strong><p>${c.html}</p></div>` }).join("");
  const suitRows=rows.map(r=>{
    const notes: string[]=[];
    for(let d=r.from;d<=r.to;d=addDays(d,1)){ const s=citySuitability(d).find(x=>x.city===r.city); if(s&&s.level!=="ok") notes.push(`${d.slice(5).replace("-","/")}: ${s.reasons.join("；")}`) }
    if(!notes.length) return "";
    return `<div class="wz-leg warn"><strong>${r.city} · ${r.from.slice(5).replace("-","/")}–${r.to.slice(5).replace("-","/")}</strong><p>${notes.map(n=>`⚠ ${esc(n)}`).join("<br>")}</p></div>`;
  }).join("");
  return `<div class="section-head"><div><p class="eyebrow">STEP 3/3</p><h2>定具体日期</h2><p class="lede">城市顺序用 ↑ ↓ 调；下面就是日期排期——每天的限制（直飞、适宜度、节假日）直接标在格子里，点任意日期可改城市或模式。对照着排期定日期：改了上面的顺序／天数后，点「🔄 按向导重排日历」同步到下方日历。</p></div></div>
    <div class="card" style="margin-bottom:12px"><div class="micro">📅 夫妻东南亚段：<b>${dateLabel(wz.start)} – ${dateLabel(addDays(wz.start,(tripDays["couple"]||0)-1))}</b>（共 ${tripDays["couple"]||0} 天，来自「🗺️ 大行程」，这里不重复选日期） <button class="ghost" id="wzToTrip">去大行程调整 →</button></div></div>
    ${orderRows}
    <h3 class="sec-title">✈ 转场直飞检查</h3>${legs||'<p class="micro">只有一城，无转场。</p>'}
    ${suitRows?`<h3 class="sec-title">📅 日期适宜度提醒</h3>${suitRows}`:""}
    <h3 class="sec-title">📅 日期排期</h3>
    <p class="micro" style="margin:-6px 0 10px">决策视图下每格直接显示当日适宜度与直飞汇总；点任意日期可改城市或模式，保存后同步到首页、每日详情与地图。</p>
    <div class="btn-row" style="margin-bottom:10px"><button class="ghost" id="resetRecommended">🔄 按向导重排日历</button><button class="ghost" id="copyPlan">复制当前行程</button></div>
    <p class="planner-sync-note micro" id="plannerSyncNote" role="status" style="margin:0 0 12px"></p>
    <div class="calendar-tools">
      <div class="field"><label for="startDate">开始日期（来自大行程）</label><input id="startDate" type="date" aria-label="开始日期（来自大行程，只读）" value="${state.start}" disabled title="日期来自「🗺️ 大行程」，去大行程调整天数"></div>
      <div class="cal-mode-toggle" role="group" aria-label="日历视图">
        <button class="ghost active" id="calModeDecision" aria-pressed="true">决策视图</button>
        <button class="ghost" id="calModeSchedule" aria-pressed="false">排期视图</button>
      </div>
      <div class="legend"><span id="coupleLegend"><i class="dot couple"></i>双人</span><span><i class="dot family"></i>亲子慢节奏</span><span><i class="dot holiday"></i>节假日</span><span><i class="dot suit-ok"></i>宜</span><span><i class="dot suit-warn"></i>谨慎</span><span><i class="dot suit-blocked"></i>不宜</span></div>
    </div>
    <section class="card hard-check" aria-labelledby="hardCheckTitle">
      <div class="hard-check-head">
        <div><h3 id="hardCheckTitle">硬性条件检查</h3><p>每次改排期都会重算：先列真正撞上的限制，再说明这次会错过什么。</p></div>
        <span class="hard-count" id="hardCount">检查中</span>
      </div>
      <div class="hard-list" id="hardList" aria-live="polite"></div>
    </section>
    <div class="transfer-alerts" id="transferAlerts" aria-live="polite"></div>
    <div class="calendar" aria-label="行程日历">
      <div class="weekdays"><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div><div>日</div></div>
      <div class="calendar-grid" id="calendarGrid"></div>
    </div>
    <div class="calendar-note" id="calendarNote"></div>
    <p class="micro" id="wzSaveNote" role="status" aria-live="polite" style="margin:14px 0 0"></p>
    <div class="wz-nav"><button class="ghost" id="wzBack3">← 上一步</button><button class="primary" id="wzSave">💾 保存规划</button></div>`;
}
function wzApplySchedule(){
  const m=buildMergedSchedule();
  state.schedule=m.schedule; state.edited=true; state.start=m.start;
  syncStartDateInput();
  renderCalendar(); renderSpotDetails();
}
/* 向导最后一步的保存：向导选择变化时先把排期写入日历（Step 3 里的逐日手工微调予以保留），再走云端保存（未登录则本机缓存） */
function wzSaveNote(t: string){ const n=S.getElementById("wzSaveNote"); if(n) n.textContent=t; }
async function wzSavePlan(){
  if(!wzBudgetOk()) return; /* 天数对不上时不许保存 */
  const btn=S.getElementById("wzSave") as HTMLButtonElement|null;
  if(btn) btn.disabled=true;
  try{
    const sig=wzCalSig(); if(sig!==wzLastCalSig){ wzApplySchedule(); wzLastCalSig=sig; }
    await persistPlanToCloud(wzSaveNote);
  }finally{ if(btn) btn.disabled=false; }
}
/* 云端保存（日历 tab 的「保存到云端」与向导最后一步的「保存规划」共用） */
async function persistPlanToCloud(note: (t: string)=>void){
  note("正在保存到云端…");
  try{
    const loaded=await savePlannerPlan(serializePlan());
    lastCacheJson=JSON.stringify(loaded.plan);
    note(`✓ 已保存到云端 · ${loaded.updatedByName} · ${fmtSyncTime(loaded.updatedAt)}；首页、每日详情与地图已同步更新。`);
    toast("规划已保存到云端，全站已同步更新");
  }catch(err){
    const plan=serializePlan(); lastCacheJson=JSON.stringify(plan);
    if((err as Error)?.message==="not-logged-in"){
      const cached=cachePlannerPlanLocally(plan,"本机（未登录）");
      note(`⚠️ 未登录：已保存到本机缓存（${fmtSyncTime(cached.updatedAt)}），刷新不丢；登录后再点保存，同步到云端全站。`);
      toast("未登录，已暂存到本机",true);
    }else{
      cachePlannerPlanLocally(plan,"本机");
      note("⚠️ 云端保存失败，已保留本机缓存；网络恢复后重试。");
      toast("云端保存失败，已保留本机缓存",true);
    }
  }
}
function wzWire(){
  S.querySelectorAll(".wz-city").forEach(card=>{
    const toggle=()=>{ const c=(card as HTMLElement).dataset.city||"";
      if(wz.cities.includes(c)) wz.cities=wz.cities.filter(x=>x!==c); else { wz.cities.push(c); wz.order=[...WZ_ORDER.filter(x=>wz.cities.includes(x))]; }
      wzRender() };
    (card as HTMLElement).onclick=toggle;
    (card as HTMLElement).onkeydown=(e)=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggle() } };
  });
  /* 景点详情展开区：内部点击／按键不冒泡，避免展开详情时误触卡片选中 */
  S.querySelectorAll(".wz-spots,.wz-cov").forEach(d=>{
    (d as HTMLElement).onclick=e=>e.stopPropagation();
    (d as HTMLElement).onkeydown=e=>e.stopPropagation();
  });
  const on=(id:string,fn:()=>void)=>{ const n=S.getElementById(id); if(n) (n as HTMLElement).onclick=fn };
  on("wzAll",()=>{ wz.cities=[...WZ_ORDER]; wz.order=[...WZ_ORDER]; Object.assign(wz.days,baselineNights); wzRender() });
  on("wzClear",()=>{ wz.cities=[]; wzRender() });
  on("wzNext1",()=>wzSetStep(2)); on("wzBack2",()=>wzSetStep(1)); on("wzNext2",()=>wzSetStep(3));
  on("wzBack3",()=>wzSetStep(2));
  on("wzToTrip",()=>{ (S.querySelector('[data-tab="trip"]') as HTMLElement).click(); });
  on("wzSave",wzSavePlan);
  /* Step 3 内嵌了原日期排期页：重排／复制／视图切换按钮只在 Step 3 渲染出来后才存在，按需绑定 */
  on("resetRecommended",()=>{ wzApplySchedule(); wzLastCalSig=wzCalSig(); syncCalMode(); toast("已按向导重排日历"); });
  on("copyPlan",copyPlan);
  on("calModeDecision",()=>{state.calMode="decision";syncCalMode();renderCalendar()});
  on("calModeSchedule",()=>{state.calMode="schedule";syncCalMode();renderCalendar()});
  S.querySelectorAll("[data-wzday]").forEach(b=>(b as HTMLElement).onclick=(e)=>{ e.stopPropagation(); const [city,d]=((b as HTMLElement).dataset.wzday||"").split("|"); const dd=Number(d);
    /* 硬约束：已达大行程上限时 ＋ 不再生效（按钮本身已 disabled，这里防极端情况） */
    if(dd>0&&wzOrderTotal()>=(tripDays["couple"]||0)){ toast("已达大行程「夫妻东南亚」的天数上限",true); return; }
    wz.days[city]=Math.min(6,Math.max(1,(wz.days[city]||1)+dd)); wzRender() });
  S.querySelectorAll("[data-wzup]").forEach(b=>(b as HTMLElement).onclick=()=>{ const i=Number((b as HTMLElement).dataset.wzup), arr=wz.order.filter(c=>wz.cities.includes(c)); if(i>0){ const city=arr[i]; arr[i]=arr[i-1]; arr[i-1]=city; wz.order=[...WZ_ORDER.filter(c=>!wz.cities.includes(c)),...arr]; } wzRender() });
  S.querySelectorAll("[data-wzdown]").forEach(b=>(b as HTMLElement).onclick=()=>{ const i=Number((b as HTMLElement).dataset.wzdown), arr=wz.order.filter(c=>wz.cities.includes(c)); if(i<arr.length-1){ const city=arr[i]; arr[i]=arr[i+1]; arr[i+1]=city; wz.order=[...WZ_ORDER.filter(c=>!wz.cities.includes(c)),...arr]; } wzRender() });
  S.querySelectorAll("[data-wzmode]").forEach(s=>((s as HTMLSelectElement).onchange=(e)=>{ wz.modes[(s as HTMLElement).dataset.wzmode||""]=(e.target as HTMLSelectElement).value }));
}
function initWizard(){ wzRender() }

/* ---- 云端规划持久化（Supabase sea_planner_schedules + 本地缓存回退） ---- */
function serializePlan(): PlannerPlan{
  return {
    version:2, /* v2: 向导不再含新加坡、日期继承大行程夫妻段；v1 旧规划加载时按新模型迁移重排 */
    selected:[],
    coupleDays:0,
    remainingMode:"skip",
    pace:"standard",
    start:state.start,
    schedule:Object.fromEntries(Object.entries(state.schedule).map(([k,v])=>[k,{city:v.city,mode:v.mode}])),
    wz:{cities:[...wz.cities],days:{...wz.days},order:[...wz.order],start:wz.start,modes:{...wz.modes}},
    hotelSelections:{},
    flightSelections:{},
    trip:{...tripDays},
    coupleOrder:[...coupleOrder],
    returnCity,
    tripFlightDay:{...tripFlightDay},
  };
}
function applyLoadedPlan(p: PlannerPlan){
  if(p.start) state.start=p.start;
  if(p.schedule&&typeof p.schedule==="object") state.schedule=JSON.parse(JSON.stringify(p.schedule));
  if(p.wz){
    /* 兼容迁移：旧规划的向导可能含新加坡、带独立起始日；新模型里新加坡归大行程、日期继承夫妻段 */
    if(Array.isArray(p.wz.cities)&&p.wz.cities.length) wz.cities=p.wz.cities.filter(c=>c!=="新加坡"&&WZ_ORDER.includes(c));
    if(p.wz.days&&typeof p.wz.days==="object"){ const d={...p.wz.days}; delete d["新加坡"]; wz.days=d; }
    if(Array.isArray(p.wz.order)&&p.wz.order.length) wz.order=p.wz.order.filter(c=>c!=="新加坡"&&WZ_ORDER.includes(c));
    if(p.wz.modes&&typeof p.wz.modes==="object"){ const m={...p.wz.modes}; delete m["新加坡"]; wz.modes=m; }
  }
  if(Array.isArray(p.coupleOrder)&&p.coupleOrder.length) coupleOrder=[...p.coupleOrder];
  if(p.returnCity==="PEK"||p.returnCity==="PVG"||p.returnCity==="CKG") returnCity=p.returnCity;
  if(p.tripFlightDay&&typeof p.tripFlightDay==="object"){
    for(const [k,v] of Object.entries(p.tripFlightDay)){ if(v==="last"||v==="next") tripFlightDay[k]=v; }
  }
  if(p.trip&&typeof p.trip==="object"){
    for(const s of TRIP_SEGS){ const v=(p.trip as Record<string,unknown>)[s.id]; if(typeof v==="number"&&v>=1&&v<=20) tripDays[s.id]=v; }
  }
  syncWzStart(); /* 向导日期一律继承大行程夫妻段，忽略旧保存的独立起始日 */
  if(!p.version||p.version<2){
    /* v1 旧规划：按新模型重排日历（新加坡固定阶段＋向导细分），旧日期作废 */
    buildDefaultScheduleFromWizard();
  }
  state.edited=true; /* 已加载的规划不再被默认排期覆盖 */
  syncStartDateInput();
}
function setSyncNote(t: string){ const n=S.getElementById("plannerSyncNote"); if(n) n.textContent=t; }
function fmtSyncTime(iso: string){ try{ const d=new Date(iso); return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; }catch{ return ""; } }
let lastCacheJson="";
function cachePlannerLocal(){
  try{
    const plan=serializePlan(), json=JSON.stringify(plan);
    if(json===lastCacheJson) return;
    lastCacheJson=json;
    cachePlannerPlanLocally(plan,"本机自动缓存");
  }catch{/* 缓存失败不影响主流程 */}
}

// init controls
([...S.querySelectorAll(".tab")] as HTMLElement[]).forEach(btn=>btn.onclick=()=>{([...S.querySelectorAll(".tab")] as HTMLElement[]).forEach(b=>b.setAttribute("aria-selected",String(b===btn)));([...S.querySelectorAll(".panel")] as HTMLElement[]).forEach(p=>p.classList.toggle("active",p.id===btn.dataset.tab));hostEl.scrollIntoView({behavior:"smooth",block:"start"})});
/* 日历／景点取舍已并入向导步骤内按需渲染：开始日期、重排、复制、视图切换按钮只在 Step 3 出现，由 wzWire() 按需绑定；
   云端保存统一走向导 Step 3 的「保存规划」与大行程的「保存大行程」，不再有独立的「保存到云端」按钮。 */
el("closeModal").onclick=closeModal;el("saveDay").onclick=saveDay;el("removeDay").onclick=removeDay;
el("dayModal").onclick=e=>{if((e.target as HTMLElement).id==="dayModal")closeModal()};document.addEventListener("keydown",onKeyDown);
const citySelect=el("modalCity") as HTMLSelectElement;Object.keys(citySpots).forEach(c=>citySelect.add(new Option(c,c)));
syncWzStart();
initWizard();

/* 异步加载云端最新规划（卸载安全：中途卸载则丢弃结果） */
let alive=true;
(async()=>{
  let loaded: LoadedPlan|null=null;
  try{ loaded=await loadPlannerPlan(); }catch{ loaded=null; }
  if(!alive) return;
  if(loaded&&loaded.plan&&Object.keys(loaded.plan.schedule||{}).length){
    applyLoadedPlan(loaded.plan);
    lastCacheJson=JSON.stringify(loaded.plan);
    setSyncNote(loaded.source==="cloud"
      ? `☁️ 已加载云端最新规划 · ${loaded.updatedByName} 保存于 ${fmtSyncTime(loaded.updatedAt)}`
      : `📴 云端不可用，已加载本机缓存 · ${loaded.updatedByName} ${fmtSyncTime(loaded.updatedAt)}`);
    wzRender();
  }else{
    buildDefaultScheduleFromWizard();
    setSyncNote("☁️ 未找到云端规划，已按向导默认排期；去「🧭 东南亚城市规划」第三步点「保存规划」同步到全站。");
  }
  updateAll();
})();

  /* ---- 研究数据来源说明（原生集成追加） ---- */
  {
    const hero = S.querySelector(".hero");
    if (hero) {
      const p = document.createElement("p");
      p.className = "micro";
      p.id = "researchProvenance";
      p.style.cssText = "margin:12px 0 0;max-width:780px";
      const totals = (Object.entries(RESEARCH_META.cityTotals) as [string, number][]).map(([c, n]) => `${c}${n}`).join(" · ");
      p.textContent = `地点数据来源：研究数据 research-status.json（${RESEARCH_UPDATED_AT} 更新，共 ${RESEARCH_META.totalItems} 项：${totals}），由脚本程序化生成；其中 67 个精华景点用于覆盖率计算。`;
      hero.after(p);
    }
  }

  return () => { alive=false; document.removeEventListener("keydown", onKeyDown); };
}
