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
/* 大行程转场航班库：Google Flights 实查（hidden_files/flight-db/december-2026.json
   的构建期同步副本，由 flight-db-gflights-fill 每轮填充后同步；只含直飞，价格为整单总价 USD） */
import flightDbJson from "../../data/flight-db-december-2026.json";
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
interface CitySuit { city: string; level: SuitLevel; reasons: {text: string; link?: string; linkText?: string}[] }
/* 2026-09-28 必去景点闭馆数据：必去=闭馆日用 🚫（critical），非必去=⚠️（warning）。
   判定标准：该城市行程中不可替代的核心地标/体验。 */
interface MustGoClosure { name: string; mustGo: boolean; closedDow: number[]; reason: string; spot?: string }
const MUST_GO_CLOSURES: Record<string, MustGoClosure[]> = {
  "曼谷": [
    { name: "恰图恰周末市场", mustGo: true, closedDow: [1,2,3,4,5], reason: "仅周末开放", spot: "恰图恰周末市场" },
    { name: "大皇宫/玉佛寺", mustGo: true, closedDow: [], reason: "王室仪式可能临时关闭，出发前查官网", spot: "大皇宫 & 玉佛寺" },
  ],
  "清迈": [
    { name: "周日步行街", mustGo: true, closedDow: [1,2,3,4,5,6], reason: "仅周日开放" },
    { name: "周六步行街", mustGo: false, closedDow: [0,1,2,3,4,5], reason: "仅周六开放" },
  ],
  "普吉": [
    { name: "Lard Yai 周日步行街", mustGo: false, closedDow: [1,2,3,4,5,6], reason: "仅周日开放" },
    { name: "Siam Niramit", mustGo: false, closedDow: [2], reason: "每周二休演" },
  ],
  "吉隆坡": [
    { name: "双子塔", mustGo: true, closedDow: [1], reason: "周一闭馆" },
  ],
};
type DaySeverity = "ok" | "warn" | "critical";
interface DayIssue { severity: DaySeverity; text: string; why?: string; link?: string; linkText?: string }
/** 某天某城市的闭馆问题：返回带严重级别的问题列表 */
function dayClosureIssues(city: string, date: string): DayIssue[] {
  const dow = new Date(date + "T12:00:00Z").getUTCDay();
  const out: DayIssue[] = [];
  for (const c of MUST_GO_CLOSURES[city] || []) {
    if (c.closedDow.includes(dow)) {
      out.push({ 
        severity: c.mustGo ? "critical" : "warn", 
        text: `${c.name}今日不开（${c.reason}）${c.mustGo ? " · 必去" : ""}`,
        why: c.mustGo ? `「必去」是按该城市行程中不可替代的核心地标/体验暂定的，点上方「查看${city}景点」核实` : undefined,
        link: c.spot ? `/sea-travel-guide/travel-research?from=planner&spot=${encodeURIComponent(c.spot)}` : undefined,
        linkText: c.spot ? `查看${c.name}详情 →` : undefined
      });
    }
  }
  return out;
}
/** 某一天 8 个城市各自是否适宜：闭馆日、限定日缺失、公共假日、特殊开放日、跨年旺季。 */
function citySuitability(date: string): CitySuit[] {
  const dow = new Date(date + "T12:00:00Z").getUTCDay(), weekend = dow === 0 || dow === 6;
  const holiday = publicHolidays[date], markers = specialDateMarkers[date] || [];
  return decisionCityList.map(city => {
    const reasons: {text: string; link?: string; linkText?: string}[] = []; let level: SuitLevel = "ok";
    const warn = (r: string, link?: string, linkText?: string) => { if (level === "ok") level = "warn"; reasons.push({text: r, link, linkText}); };
    const block = (r: string, link?: string, linkText?: string) => { level = "blocked"; reasons.push({text: r, link, linkText}); };
    if (holiday && holiday.countries.includes(cityCountry[city])) warn(`撞上${holiday.name}，人多、酒店贵`);
    if (date >= "2026-12-24" && date <= "2026-12-31") warn("圣诞/跨年旺季，人多价高，奢华酒店可能有 minimum stay");
    markers.filter(m => m.city === city).forEach(m => warn(`${m.title}：${m.body}`));
    if (city === "曼谷" && !weekend) warn("恰图恰周末市场今日不开", "/sea-travel-guide/travel-research?from=planner&spot=恰图恰周末市场", "查看恰图恰详情 →");
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
  if(!grid) return; /* 日历只在 🔍 检查确认 tab 里渲染 */
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
function openDay(date: string){modalDate=date;const plan=state.schedule[date];el("modalTitle").textContent=`${date.slice(5).replace("-","月")}日`;renderDayIntel(date);(el("modalCity") as HTMLSelectElement).value=plan?.city||"曼谷";(el("modalMode") as HTMLSelectElement).value=plan?.mode||"couple";el("dayModal").classList.add("open")}
function closeModal(){el("dayModal").classList.remove("open")}
function saveDay(){
  if(!modalDate)return;
  const mode=inputVal("modalMode");
  if(mode==="free")delete state.schedule[modalDate];else state.schedule[modalDate]={city:inputVal("modalCity"),mode};
  state.edited=true;closeModal();renderCalendar();
  const nextDate=addDays(modalDate,1),blocked=scheduleTransitions().filter(r=>r.assessment.kind!=="direct"&&(r.date===modalDate||r.date===nextDate));
  if(blocked.length){const r=blocked[0],label=r.assessment.kind==="no-direct"?"已确认无直飞":r.assessment.kind==="no-service"?"当天无直飞":"精确日期待核验";toast(`${r.date.slice(5)} ${r.from}→${r.to}：${label}。请查看中转、铁路或改期方案。`,true)}else toast("这一天已调整");
}
function removeDay(){if(!modalDate)return;delete state.schedule[modalDate];state.edited=true;closeModal();renderCalendar();toast("这一天已留白")}
function planText(){
  const lines=["2026年12月东南亚行程",""];
  Object.keys(state.schedule).sort().forEach(date=>{const p=state.schedule[date];lines.push(`${date}｜${p.city}｜${p.mode==="family"?"亲子 2大1小（1–2个点＋午休）":p.mode==="free"?"留白 / 休整":"双人"}`)});
  lines.push("","硬约束提醒：泰国公共假日 12/5、12/7补假、12/10、12/31；马来西亚／新加坡圣诞节 12/25；另查 12/1、12/9、12/11、12/12 特殊开放。周末限定市场、闭馆日、航线核验、酒店 minimum stay 与 gala dinner 请按页面检查。航班资料核查于 2026-09-14，预订前仍需按实际日期重查。")
  return lines.join("\n")
}
async function copyPlan(){const text=planText();try{await navigator.clipboard.writeText(text)}catch(e){const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove()}toast("行程已复制")}
function toast(msg: string, warning = false){const t=el("toast");t.textContent=msg;t.classList.toggle("warning",warning);t.classList.add("show");const tt=t as unknown as { _timer?: ReturnType<typeof setTimeout> };clearTimeout(tt._timer);tt._timer=setTimeout(()=>{t.classList.remove("show");t.classList.remove("warning")},warning?5000:2200)}
function updateAll(){renderCalendar();renderTrip();cachePlannerLocal()}


/* ================= 🗺️ 大行程总览（11/28 去程＋中间各段；回程城市三选一待定） ================= */
interface TripSegDef { id: string; label: string; sub: string; mode: string; note: string; cta?: boolean }
const TRIP_ANCHOR = "2026-11-29";   /* 中间段起始日（11/28 为去程航班日） */
const TRIP_MIDDLE_DAYS = 36;        /* 11/29–1/3（2026-09-29 用户：回程加首尔停留2天） */
const TRIP_SEGS: TripSegDef[] = [
  { id:"beijing1", label:"北京", sub:"陪父亲＋倒时差（带娃）", mode:"🏠 家庭", note:"11/28落地北京；末段飞新加坡（日期随天数自动算）" },
  { id:"singapore", label:"新加坡", sub:"亲子段（2大1小＋岳父母）", mode:"👨‍👩‍👧 亲子慢节奏", note:"每天最多 2 个大点，中午留午睡" },
  { id:"couple", label:"夫妻东南亚", sub:"", mode:"⚡ 特种兵", note:"岳父母带娃回西安，你俩继续东南亚", cta:true },
  { id:"xian", label:"西安", sub:"夫妻一起回西安（3-4天）", mode:"🏠 家庭", note:"泰国结束后两人一起飞西安" },
  { id:"beijing3", label:"北京", sub:"用户一人回北京陪父亲", mode:"🏠 家庭", note:"西安待几天后你一人飞回北京；最后大家在回程城市集结，经首尔一起飞西雅图" },
  /* 2026-09-29 用户：回程北京经首尔转机，在首尔停留2天（2大1小） */
  { id:"seoul", label:"首尔", sub:"回程中转停留2天（2大1小）", mode:"🏠 家庭", note:"北京飞首尔，玩2天后飞西雅图" },
];
let tripDays: Record<string, number> = { beijing1:7, singapore:5, couple:8, xian:4, beijing3:1, seoul:2 };
/* 夫妻东南亚段城市顺序统一用 wz.order（向导里可调）；最后一段飞西安的航班跟着末城动态变 */
const CITY_AIRPORT: Record<string,string> = { "普吉":"HKT", "清迈":"CNX", "曼谷":"BKK", "槟城":"PEN", "吉隆坡":"KUL", "胡志明市":"SGN", "富国岛":"PQC", "新加坡":"SIN", "北京":"PEK", "西安":"XIY", "首尔":"ICN" };
function coupleLastCity(){ const a=wz.order.filter(c=>wz.cities.includes(c)); return a[a.length-1] || "曼谷"; }
function thailandToXianLeg(){
  const last = coupleLastCity(), code = CITY_AIRPORT[last] || "BKK";
  return { code: `${code}-XIY`, label: `${last}→西安` };
}
function singaporeToFirstCityLeg(){
  const a = wz.order.filter(c=>wz.cities.includes(c));
  const first = a[0] || "普吉";
  const code = CITY_AIRPORT[first] || "HKT";
  return { code: `SIN-${code}`, label: `新加坡→${first}` };
}
/* 回西雅图出发城市：2026-09-29 用户定为北京（经首尔中转停留2天），可在大行程里改 */
type ReturnCityCode = "" | "PEK" | "PVG" | "CKG";
let returnCity: ReturnCityCode = "PEK";
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
interface FlightDbFlight { airline: string; flight: string|null; dep: string; arr: string; duration: string; price_usd?: number|null; business_price_usd?: number|null; via?: string }
interface FlightDbDay {
  economy_usd?: number|null; business_usd?: number|null;
  economy_price_basis?: string; business_price_basis?: string;
  economy_queried_at?: string; business_queried_at?: string;
  nonstop_flights?: FlightDbFlight[];
  /* 一次转机（2026-09-28 用户：回西雅图三段也要查一次转机） */
  onestop_flights?: FlightDbFlight[];
  onestop_economy_usd?: number|null; onestop_business_usd?: number|null;
  onestop_economy_price_basis?: string; onestop_business_price_basis?: string;
  onestop_economy_queried_at?: string; onestop_business_queried_at?: string;
}
interface TripFlightLeg { results: number; eco: number|null; biz: number|null; basis: string; carriers: string[]; direct: boolean; queriedAt: string; flights: {airline:string;flight:string;dep:string;arr:string;duration:string;price:number|null;bizPrice:number|null;via?:string}[]; onestopResults: number; onestopEco: number|null; onestopBiz: number|null; onestopBasis: string; onestopQueriedAt: string; onestopFlights: {airline:string;flight:string;dep:string;arr:string;duration:string;price:number|null;bizPrice:number|null;via:string}[] }
/* 大行程转场航班实查（只看直飞）：从 Google Flights 航班库按 "<航段代码>|<日期>" 构建。
   库里没有该日期 = 还没查过 → "待查询"；库里有但直飞为 0 = 实查确认无直飞 → "暂无直飞"。 */
const TRIP_FLIGHTS: Record<string, TripFlightLeg> = {};
for(const [code, seg] of Object.entries((flightDbJson as {segments: Record<string,{days?: Record<string,FlightDbDay>}>}).segments)){
  for(const [date, d] of Object.entries(seg.days||{})){
    const nf=d.nonstop_flights||[];
    const of=d.onestop_flights||[];
    TRIP_FLIGHTS[`${code}|${date}`]={
      results: nf.length,
      eco: d.economy_usd ?? null,
      biz: d.business_usd ?? null,
      basis: d.economy_price_basis || d.business_price_basis || "",
      carriers: [...new Set(nf.map(f=>f.airline))],
      direct: nf.length>0,
      queriedAt: (d.economy_queried_at || d.business_queried_at || "").slice(0,10),
      flights: nf.map(f=>({airline:f.airline, flight:f.flight??"", dep:f.dep, arr:f.arr, duration:f.duration||"", price:(f.price_usd??null) as number|null, bizPrice:(f.business_price_usd??null) as number|null})),
      /* 一次转机（2026-09-28 用户：回西雅图三段） */
      onestopResults: of.length,
      onestopEco: d.onestop_economy_usd ?? null,
      onestopBiz: d.onestop_business_usd ?? null,
      onestopBasis: d.onestop_economy_price_basis || d.onestop_business_price_basis || "",
      onestopQueriedAt: (d.onestop_economy_queried_at || d.onestop_business_queried_at || "").slice(0,10),
      onestopFlights: of.map(f=>({airline:f.airline, flight:f.flight??"", dep:f.dep, arr:f.arr, duration:f.duration||"", price:(f.price_usd??null) as number|null, bizPrice:(f.business_price_usd??null) as number|null, via:f.via||""})),
    };
  }
}
/* 段间转场航班：在 after 段之后、before 段之前插入一行；legs 的 key = "<航段代码>|<转场日期ISO>"（例 "PEK-SIN|2026-12-12"） */
interface TripTransition { after: string; before: string; title: string; legs: { code: string; label: string }[]; note?: string; noFlight?: boolean }
const TRIP_TRANSITIONS: TripTransition[] = [
  { after:"beijing1", before:"singapore", title:"北京→新加坡（2大1小）＋ 西安→新加坡（岳父母2人）",
    legs:[{code:"PEK-SIN",label:"北京→新加坡"},{code:"XIY-SIN",label:"西安→新加坡"}] },
  { after:"singapore", before:"couple", title:"__SIN_FIRST__（2人）＋ 新加坡→西安（岳父母带娃 2大1小）",
    legs:[{code:"__SIN_FIRST_CODE__",label:"__SIN_FIRST_LABEL__"},{code:"SIN-XIY",label:"新加坡→西安"}] },
  { after:"couple", before:"xian", title:"__COUPLE_XIY__",
    legs:[{code:"__COUPLE_XIY_CODE__",label:"__COUPLE_XIY_LABEL__"}] },
  /* 用户 2026-09-28：西安→北京不坐飞机了，删掉这张机票卡；航班库也不再查 XIY-PEK */
  { after:"xian", before:"beijing3", title:"西安→北京（用户一人）", noFlight:true,
    note:"你坐高铁去北京，不需要机票。",
    legs:[] },
  /* 2026-09-29 用户：回程经首尔中转，在首尔停留2天；航段代码随回程城市动态变 */
  { after:"beijing3", before:"seoul", title:"__RETURN_SEOUL__（2大1小）",
    legs:[{code:"__RETURN_ICN_CODE__",label:"__RETURN_ICN_LABEL__"}] },
];
/* 航司英文名→中文名（2026-09-28 用户：回西雅图三段航班信息中文显示） */
const AIRLINE_CN: Record<string,string> = {
  "United": "美联航", "Delta": "达美航空", "American Airlines": "美国航空", "American": "美国航空",
  "Air China": "中国国航", "China Eastern": "中国东航", "China Southern": "中国南航",
  "Hainan Airlines": "海南航空", "XiamenAir": "厦门航空", "Xiamen Air": "厦门航空",
  "Sichuan Airlines": "四川航空", "Shenzhen Airlines": "深圳航空",
  "Korean Air": "大韩航空", "Asiana": "韩亚航空", "Asiana Airlines": "韩亚航空",
  "Japan Airlines": "日本航空", "ANA": "全日空", "All Nippon Airways": "全日空",
  "Cathay Pacific": "国泰航空", "EVA Air": "长荣航空", "China Airlines": "中华航空",
  "Singapore Airlines": "新加坡航空", "Thai Airways": "泰国航空",
  "Air Canada": "加拿大航空", "Alaska Airlines": "阿拉斯加航空",
  "Juneyao Airlines": "吉祥航空", "Spring Airlines": "春秋航空",
  "Lucky Air": "祥鹏航空", "Tibet Airlines": "西藏航空",
};
/* 回西雅图航段代码（2026-09-29 用户：改经首尔中转停留2天）：XX→首尔 ＋ 首尔→西雅图 */
const RETURN_SEA_CODES = new Set(["PEK-ICN", "PVG-ICN", "CKG-ICN", "ICN-SEA"]);
/* 时长转中文：16h25m → 16小时25分 */
function durationCn(d: string): string {
  if(!d) return "";
  return d.replace(/(\d+)h/i, "$1小时").replace(/(\d+)m/i, "$1分");
}
/* 段间转场航班信息卡：路线 + 状态徽章 + 放大价格 + 班次逐行，不再挤成灰色小字段落
   2026-09-28：回西雅图三段另有一次转机航班，分区显示；回西雅图三段全部中文显示 */
function tripFlightCard(key: string, label: string){
  const d=TRIP_FLIGHTS[key];
  const segCode=key.split("|")[0];
  const isReturnSea=RETURN_SEA_CODES.has(segCode); /* 回西雅图三段：中文显示 */
  const airlineName=(en: string)=>isReturnSea?(AIRLINE_CN[en]||en):en;
  const head=(status:string,cls:string)=>`<div class="tfi-head"><b>${label}</b><span class="tfi-status ${cls}">${status}</span></div>`;
  if(!d) return `<div class="tfi-leg">${head("⏳ 航班待查询","pending")}<p class="tfi-note">Google Flights 库正在逐日填充，该日期还没查到，不能据此推断当天无直飞。</p></div>`;
  /* 一次转机分区（有就显示） */
  const onestopHtml=(()=>{
    if(!d.onestopQueriedAt && !d.onestopResults) return "";
    if(!d.onestopResults) return `<div class="tfi-onestop"><div class="tfi-onestop-head">🔄 一次转机 <span class="tfi-status none">暂无</span></div><p class="tfi-note">Google Flights 实查确认当天无一次转机${d.onestopQueriedAt?`（${d.onestopQueriedAt}）`:""}。</p></div>`;
    const prices: string[]=[];
    if(d.onestopEco!=null) prices.push(`<span class="tfi-price">经济 <b>$${d.onestopEco}</b></span>`);
    if(d.onestopBiz!=null) prices.push(`<span class="tfi-price">商务 <b>$${d.onestopBiz}</b></span>`);
    const rows=d.onestopFlights.map(f=>{
      const dh=Number(f.dep.slice(0,2));
      const redeye=!isNaN(dh)&&dh<6;
      const pe=f.price!=null?`<span class="tfi-fprice">经济 $${f.price}</span>`:`<span class="tfi-fprice na">经济 —</span>`;
      const pb=f.bizPrice!=null?`<span class="tfi-fprice biz">商务 $${f.bizPrice}</span>`:`<span class="tfi-fprice na">商务 —</span>`;
      const al=isReturnSea&&f.airline?`<span class="tfi-airline">${airlineName(f.airline)}</span>`:"";
      const dur=f.duration?`<span class="tfi-dur">${isReturnSea?durationCn(f.duration):f.duration}</span>`:"";
      return `<li>${al}<span class="tfi-no">${f.flight}</span><span class="tfi-onestop-via">🔄 经${f.via||"停"}</span><span class="tfi-times">${f.dep} → ${f.arr.replace("+1","+1天")}</span>${dur}${redeye?`<span class="tfi-redeye">🌙 红眼</span>`:""}<span class="tfi-fprices">${pe}${pb}</span></li>`;
    }).join("");
    return `<div class="tfi-onestop"><div class="tfi-onestop-head">🔄 一次转机 <span class="tfi-status ok">${d.onestopResults}班</span></div>
      <div class="tfi-prices">${prices.join("")||"价格待查"}${d.onestopBasis?`<span class="tfi-basis">（${d.onestopBasis}）</span>`:""}</div>
      <ul class="tfi-flights">${rows}</ul>
      ${d.onestopQueriedAt?`<div class="tfi-src">Google Flights ${d.onestopQueriedAt} 实查 · 非实时价，出票前重查</div>`:""}</div>`;
  })();
  if(!d.direct) return `<div class="tfi-leg">${head("⚪ 暂无直飞","none")}<p class="tfi-note">Google Flights 实查确认当天无直飞${d.queriedAt?`（${d.queriedAt}）`:""}。</p>${onestopHtml}</div>`;
  const prices: string[]=[];
  if(d.eco!=null) prices.push(`<span class="tfi-price">经济 <b>$${d.eco}</b></span>`);
  if(d.biz!=null) prices.push(`<span class="tfi-price">商务 <b>$${d.biz}</b></span>`);
  const rows=d.flights.map(f=>{
    const dh=Number(f.dep.slice(0,2));
    const redeye=!isNaN(dh)&&dh<6;
    const pe=f.price!=null?`<span class="tfi-fprice">经济 $${f.price}</span>`:`<span class="tfi-fprice na">经济 —</span>`;
    const pb=f.bizPrice!=null?`<span class="tfi-fprice biz">商务 $${f.bizPrice}</span>`:`<span class="tfi-fprice na">商务 —</span>`;
    const al=isReturnSea&&f.airline?`<span class="tfi-airline">${airlineName(f.airline)}</span>`:"";
    const dur=f.duration?`<span class="tfi-dur">${isReturnSea?durationCn(f.duration):f.duration}</span>`:"";
    return `<li>${al}<span class="tfi-no">${f.flight}</span><span class="tfi-nonstop">✈️ 直飞</span><span class="tfi-times">${f.dep} → ${f.arr.replace("+1","+1天")}</span>${dur}${redeye?`<span class="tfi-redeye">🌙 红眼</span>`:""}<span class="tfi-fprices">${pe}${pb}</span></li>`;
  }).join("");
  return `<div class="tfi-leg">${head(`🟢 ${d.results}班直飞`,"ok")}
    <div class="tfi-prices">${prices.join("")||"价格待查"}${d.basis?`<span class="tfi-basis">（${d.basis}）</span>`:""}</div>
    ${d.carriers.length?`<div class="tfi-carriers">${d.carriers.map(c=>airlineName(c)).join(" / ")}</div>`:""}
    <div class="tfi-flcap">各航班整单价（经济 / 商务）</div>
    <ul class="tfi-flights">${rows}</ul>
    ${d.queriedAt?`<div class="tfi-src">Google Flights ${d.queriedAt} 实查 · 非实时价，出票前重查</div>`:""}${onestopHtml}</div>`;
}
/* 回西雅图卡片：2026-09-29 用户定为北京经首尔中转、首尔停留2天（2大1小）；
   出发城市仍可在大行程里改（北京 / 上海 / 重庆），中转首尔逻辑不变 */
function renderReturnCard(ranges: Record<string,{from:string;to:string}>){
  const lastDay=ranges["seoul"].to, nextDay=addDays(lastDay,1);
  const choice=tripFlyChoice("return");
  const flyDate=choice==="last"?lastDay:nextDay;
  /* 2026-10-02 用户定：回程已定为北京→首尔→西雅图，卡片只讲首尔→西雅图；
     北京→首尔段在上面的转场行里，不在这里重复；集结行和城市按钮已删 */
  const returnCards=tripFlightCard(`ICN-SEA|${flyDate}`,`首尔 → 西雅图`);
  return `<div class="card trip-seg">
    <div class="trip-seg-head">
      <div class="trip-seg-title">✈️ 回西雅图 <span class="trip-seg-sub">· ${dateLabel(flyDate)} 首尔 → 西雅图</span></div>
      <div class="micro trip-flydays">起飞日：
        <button class="${choice==="last"?"primary":"ghost"}" data-flyday="return|last">首尔最后一天 ${dateLabel(lastDay)} 飞</button>
        <button class="${choice==="next"?"primary":"ghost"}" data-flyday="return|next">次日 ${dateLabel(nextDay)} 飞</button>
      </div>
      <p class="micro">北京 → 首尔段的航班卡在上面的转场行里；首尔停留 2 天，当地怎么玩见「旅行研究 · 首尔」。</p>
      <div class="micro" style="margin-top:10px"><b>✈️ 首尔 → 西雅图</b> · ${dateLabel(flyDate)} 起飞 · 2大1小整单价（USD，Google Flights 实查）</div>
      <div class="trip-flightinfo">${returnCards}</div>
      <p class="micro">航班库正在按新行程查北京→首尔、首尔→西雅图的实查价；上面天数凑满后，这里会自动出价对比。</p>
    </div>
  </div>`;
}
function renderTrip(){
  const body=el("tripBody"); const ranges=tripRanges(); const total=tripTotal(); const ok=total===TRIP_MIDDLE_DAYS;
  const segCard=(s: TripSegDef)=>{
    const r=ranges[s.id], d=tripDays[s.id]||0;
    /* 北京（你一人）是独立的一段，永远按原样显示；回程集结城市是它之后单独的卡片，不许把这段改名成上海/重庆 */
    const wzCities = wz.order.filter(c=>wz.cities.includes(c));
    const coupleSub = s.id==="couple" ? (wzCities.length?wzCities.join("→")+"（两人）":"待选") : s.sub;
    return `<div class="card trip-seg">
      <div class="trip-seg-head">
        <div class="trip-seg-title">${s.label} <span class="trip-seg-sub">· ${coupleSub}</span></div>
        <div class="trip-seg-meta">${s.mode} · ${s.note}</div>
        <div class="trip-seg-dates">📅 ${dateLabel(r.from)} – ${dateLabel(r.to)}</div>
        ${s.cta?`<div class="trip-seg-cta"><button class="ghost" id="tripToWizard">去「东南亚城市规划」定这 ${d} 天的城市 →</button></div>`:""}
      </div>
      <div class="stepper trip-stepper" aria-label="${s.label}天数"><button data-tripday="${s.id}|-1" aria-label="减少一天">−</button><output>${d} 天</output><button data-tripday="${s.id}|1" aria-label="增加一天">＋</button></div>
    </div>`;
  };
  const parts: string[] = [];
  for(const s of TRIP_SEGS){
    const segHtml = segCard(s);
    const t=TRIP_TRANSITIONS.find(x=>x.after===s.id);
    if(t){
      /* 起飞日二选一：本段最后一天飞（默认）或次日飞，日期明确写出来，不许含糊；
         用户 2026-09-28：西安→北京坐高铁，灵活不需要选出发日，只标日期 */
      const choice=t.noFlight ? "last" : tripFlyChoice(t.after);
      const date=choice==="last"?ranges[t.after].to:ranges[t.before].from;
      const lastD=ranges[t.after].to, nextD=ranges[t.before].from;
      const xiyLeg = thailandToXianLeg();
      const sinLeg = singaporeToFirstCityLeg();
      /* 2026-09-29：回程经首尔中转，航段代码随回程城市动态变（默认北京） */
      const rc = (returnCity || "PEK") as Exclude<ReturnCityCode,"">;
      const rm = RETURN_CITY_META[rc];
      const title = t.title
        .replace("__COUPLE_XIY__", `${xiyLeg.label}（2人）`)
        .replace("__SIN_FIRST__", `${sinLeg.label}`)
        .replace("__RETURN_SEOUL__", `${rm.city}→首尔`);
      const legs = t.legs.map(l=>({
        code: l.code.replace("__COUPLE_XIY_CODE__", xiyLeg.code).replace("__SIN_FIRST_CODE__", sinLeg.code)
          .replace("__RETURN_ICN_CODE__", `${rc}-ICN`),
        label: l.label.replace("__COUPLE_XIY_LABEL__", xiyLeg.label).replace("__SIN_FIRST_LABEL__", sinLeg.label)
          .replace("__RETURN_ICN_LABEL__", `${rm.city}→首尔`),
      }));
      const cards=legs.map(l=>tripFlightCard(`${l.code}|${date}`,l.label)).join("");
      const dayWord=t.noFlight?"出发日":"起飞日", goWord=t.noFlight?"走":"飞";
      /* 视觉分组：段卡片+它的转场包在同一个容器里，左边一条竖线连起来，一眼看出按钮归谁 */
      parts.push(`<div class="trip-seg-group">${segHtml}
      <div class="trip-flight"><span>${t.noFlight?"🧳":"✈️"}</span><strong>${t.noFlight?"":"✈ "}${dateLabel(date)} ${title}</strong><span>转场</span></div>
    ${t.note?`<p class="micro">${t.note}</p>`:""}
    ${t.noFlight
      ? `<div class="micro trip-flydays">${dayWord}：${dateLabel(date)}</div>`
      : `<div class="micro trip-flydays">${dayWord}：
      <button class="${choice==="last"?"primary":"ghost"}" data-flyday="${t.after}|last">本段最后一天 ${dateLabel(lastD)} ${goWord}</button>
      <button class="${choice==="next"?"primary":"ghost"}" data-flyday="${t.after}|next">次日 ${dateLabel(nextD)} ${goWord}</button>
    </div>`}
    ${cards?`<div class="trip-flightinfo">${cards}</div>`:""}</div>`);
    }else{
      parts.push(`<div class="trip-seg-group">${segHtml}</div>`);
    }
  }
  body.innerHTML=`
    <div class="trip-flight"><span>✈️</span><strong>11/28（周六）西雅图 → 北京</strong><span>去程（时间已定）</span></div>
    ${parts.join("\n    ")}
    ${renderReturnCard(ranges)}
    <p class="micro trip-summary" role="status">已分配 <b>${total}</b> / ${TRIP_MIDDLE_DAYS} 天（北京→新加坡→夫妻东南亚→西安→北京（你一人）→首尔（2天）→西雅图）</p>
    ${ok?"":`<p class="micro" role="alert">⚠️ <span class="mismatch">${total<TRIP_MIDDLE_DAYS?`还差 <b>${TRIP_MIDDLE_DAYS-total}</b> 天`:`多了 <b>${total-TRIP_MIDDLE_DAYS}</b> 天`}</span>：11/29–1/1 共 ${TRIP_MIDDLE_DAYS} 天，建议用上面各段的 ＋ / － 凑满；当前为草稿，也可以先保存。</p>`}
    <p class="micro" id="tripSaveNote" role="status" aria-live="polite"></p>
    <div class="wz-nav"><span class="micro">改天数后点保存，同步到云端</span><button class="primary" id="tripSave">💾 保存大行程</button></div>`;
  body.querySelectorAll("[data-tripday]").forEach(b=>(b as HTMLElement).onclick=()=>{
    const [id,dd]=((b as HTMLElement).dataset.tripday||"").split("|");
    tripDays[id]=Math.min(20,Math.max(1,(tripDays[id]||1)+Number(dd)));
    syncWzStart(); /* 大行程天数一变，向导日期锚点立即跟上，不许两处各选一次 */
    renderTrip(); wzRender(); cachePlannerLocal();
  });
  /* coupleOrder 已统一为 wz.order，大行程不再提供顺序调整 */
  const tw=body.querySelector("#tripToWizard") as HTMLElement|null;
  if(tw) tw.onclick=()=>{ (S.querySelector('[data-tab="wizard"]') as HTMLElement).click(); };
  const sv=body.querySelector("#tripSave") as HTMLButtonElement|null;
  if(sv) sv.onclick=async ()=>{ sv.disabled=true; try{ await persistPlanToCloud(t=>{ el("tripSaveNote").textContent=t; }); }finally{ sv.disabled=false; } };
  body.querySelectorAll("[data-flyday]").forEach(b=>(b as HTMLElement).onclick=()=>{
    const [key,val]=((b as HTMLElement).dataset.flyday||"").split("|");
    tripFlightDay[key]=val==="next"?"next":"last";
    renderTrip(); cachePlannerLocal();
  });
}

/* ================= 🧭 东南亚城市规划向导 ================= */
interface WzCityMeta { tagline: string; decNote: string; stayArea: string; staySource: string; recDays: number; recReason: string }
/* 向导城市池：只含东南亚 7 城。新加坡已在大行程里单独成段（亲子 5 天），不在这里重复选、不重复占天数。 */
const WZ_ORDER = ["曼谷","清迈","普吉","槟城","吉隆坡","胡志明市","富国岛"];
const WZ_META: Record<string, WzCityMeta> = {
 /* recDays/recReason：基于研究数据的推荐天数（精华景点数量×每天3-4个的节奏，结合路线帖共识的"甜点"判断） */
 "曼谷":{tagline:"经典推荐：城市层次完整",decNote:"恰图恰只在周末开；周一博物馆闭馆风险；12/5、12/7、12/10、12/31为泰国假日，人多价高",stayArea:"素坤逸商圈（BTS沿线）或暹罗商圈",staySource:"路线帖住宿案例",recDays:3,recReason:"9个精华景点，老城+河岸+市场三线全覆盖，3天是经典不赶的节奏"},
 "清迈":{tagline:"推荐起点：古城＋素贴山",decNote:"周六/周日步行街只在对应日子开；12月旺季大象项目建议提前6–8周订",stayArea:"古城东南（步行可达塔佩门/清迈门）或宁曼路周边",staySource:"路线帖共识",recDays:2,recReason:"古城+素贴山核心2天够，想加市场/手作/烹饪课再+1天"},
 "普吉":{tagline:"核心初识：本岛＋出海",decNote:"出海看海况，建议留1天机动；Lard Yai只在周日；Siam Niramit周二休演",stayArea:"卡塔/卡伦海滩（近码头，方便出海）",staySource:"路线帖共识",recDays:3,recReason:"本岛+出海+老城三线，3天经典；多1天可做度假留白"},
 "槟城":{tagline:"甜点天数：历史、美食、山景齐",decNote:"12/25圣诞假日人多；升旗山与极乐寺可拼成Air Itam山线一天",stayArea:"乔治市镇中心（交通方便）或巴都丁宜海边",staySource:"路线帖住宿案例",recDays:3,recReason:"乔治市+升旗山+娘惹线，3天是公认的甜点天数"},
 "吉隆坡":{tagline:"核心推荐：市区＋黑风洞",decNote:"双子塔周一闭馆，提前3–4周在线抢票；12/25圣诞",stayArea:"武吉免登（近地铁/Pavilion/阿罗街）或KLCC附近",staySource:"路线帖评论共识",recDays:2,recReason:"市区+黑风洞2天核心，想加文化深度/近郊再+1天"},
 "胡志明市":{tagline:"经典推荐：再加古芝地道",decNote:"12月无全国性公共假日；古芝地道与湄公河三角洲不要塞在同一天",stayArea:"第一郡（独立宫旁，步行可达各景点）",staySource:"路线帖共识",recDays:3,recReason:"一区核心2天+古芝地道1天，3天经典；湄公河三角洲需再+1天"},
 "富国岛":{tagline:"经典推荐：海、陆、夜市齐",decNote:"风浪可能导致出海取消，建议留1天机动；Park Hyatt 2027-03才开业，本次不可选",stayArea:"中央西岸长滩/阳东镇（Dinh Cau日落＋夜市近）",staySource:"路线帖（信息较弱）",recDays:3,recReason:"海+陆+夜市三线，3天经典；想加主题乐园/北岛再+1天"}
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
  if(n>2) n=2; /* 2026-09-28 向导精简为2步，定顺序升级为独立 tab */
  wz.step=n; wzRender();
  (el("wizard") as HTMLElement).scrollIntoView({behavior:"smooth",block:"start"});
}
/* 跳转到 🔍 检查确认 tab */
function wzGoOrder(){
  if(!wz.order.filter(c=>wz.cities.includes(c)).length){ toast("先选城市",true); return }
  if(!wzBudgetOk()) return;
  (S.querySelector('[data-tab="order"]') as HTMLElement).click();
}
/* 向导选择的同步指纹：用于判断是否需要重排日历 */
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
  else body.innerHTML=wzStep2();
  wzWire();
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
  return `<div class="section-head"><div><p class="eyebrow">STEP 1/2</p><h2>先选城市</h2><p class="lede">点卡片选中／取消。展开每城的「精华景点」可直接看景点详细信息（关键信息、游览重点、怎么安排），结合景点再决定去不去。这里只细分大行程「夫妻东南亚」段（${tripDays["couple"]||0} 天）：7 城都在东南亚，新加坡已在大行程里单独安排亲子游，不在这里重复选。</p></div>
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
    const meta=WZ_META[city];
    /* 2026-09-28 用户要求：推荐天数基于研究数据明示，一键应用；自动生成的逐日详细 tour 换成城市景点列表链接 */
    const recLine=meta?`<div class="micro wz-rec">💡 推荐 <b>${meta.recDays} 天</b>：${esc(meta.recReason)}${d!==meta.recDays?` <button class="link-btn" data-wzrec="${city}">一键设为 ${meta.recDays} 天</button>`:` <span class="micro">✓ 已是推荐天数</span>`}</div>`:"";
    const attrLink=`<div class="micro wz-attrlink"><a href="/sea-travel-guide/travel-research?from=planner&kind=景点&city=${encodeURIComponent(city)}">🏛 查看${esc(city)}景点列表，自己挑 →</a><span class="micro">（不再自动生成逐日 tour，景点你自己定）</span></div>`;
    const idx = wz.order.filter(c=>wz.cities.includes(c)).indexOf(city);
    const cnt = wz.order.filter(c=>wz.cities.includes(c)).length;
    const upBtn = idx>0 ? `<button class="icon-btn" data-wzordup="${idx}" aria-label="${city}前移">↑</button>` : `<span class="wz-ph"></span>`;
    const dnBtn = idx<cnt-1 ? `<button class="icon-btn" data-wzorddn="${idx}" aria-label="${city}后移">↓</button>` : `<span class="wz-ph"></span>`;
    return `<div class="card wz-dayrow"><div class="wz-move">${upBtn}${dnBtn}</div><div><b>${idx+1}. ${city}</b><div class="micro">${esc(verdict)} · 实际命中 ${cov.n}/${cov.total} 个精华</div>
      ${recLine}
      ${wzCoverageChips(city,Math.min(d,5))}
      ${attrLink}</div>
      <div class="stepper" aria-label="${city}天数"><button data-wzday="${city}|-1" aria-label="减少一天">−</button><output>${d} 天</output><button data-wzday="${city}|1" aria-label="增加一天"${atCap?" disabled title=\"已达大行程天数上限\"":""}>＋</button></div></div>`;
  }).join("");
  return `<div class="section-head"><div><p class="eyebrow">STEP 2/2</p><h2>定天数与顺序</h2><p class="lede">1–6 天可调，用 ↑ ↓ 定城市顺序；每城下方直接标注"优先排 / 有余力再去 / 建议舍去"——这是按当前天数算出的取舍优先级（不是景点评分），帮你判断几天够。各城天数之和必须等于大行程「夫妻东南亚」的天数，到上限后 ＋ 会自动锁死。</p></div></div>
    <div class="card" style="margin-bottom:12px"><div class="micro">🗺️ 大行程「夫妻东南亚」段共 <b>${seaBudget}</b> 天；下面已分配 <b>${total}</b> 天${budgetDiff===0?" ✓ 刚好":budgetDiff>0?`，还剩 <b>${budgetDiff}</b> 天没分配（加满才能去检查确认）`:`，<span class="mismatch">⚠️ 超出 <b>${-budgetDiff}</b> 天（先减天数）</span>`}（天数去「🗺️ 大行程」调整）</div></div>
    ${rows}
    <div class="wz-nav"><button class="ghost" id="wzBack2">← 上一步</button><span class="micro">总计 <b>${total}</b> 天</span><button class="primary" id="wzNext2">下一步：检查确认 →</button></div>`;
}
/* 🔍 检查确认 tab：统一日历排雷。
   2026-09-28 用户要求：从向导 Step 3 升级为独立 tab，一上来就显示日历；
   点日期看详情（modal），排雷报告移除（山寨感）；
   大行程结构性改动回「🗺️ 大行程」做，这里只给跳转。 */
/* 全行程统一日历 + 日期问题（含严重级别），供 🔍 检查确认 tab 用 */
function wzUnifiedCalendar(){
  const ranges=tripRanges();
  const seaRows=wzRanges();
  /* 建立日期→城市映射：先按大行程段，再用东南亚段城市覆盖 couple 段 */
  const dayCity: Record<string,{seg:string;label:string;city:string}> = {};
  const segColor: Record<string,string> = { beijing1:"#3b82f6", singapore:"#22c55e", couple:"#f59e0b", xian:"#8b5cf6", beijing3:"#3b82f6" };
  const segCity: Record<string,string> = { beijing1:"北京", singapore:"新加坡", xian:"西安", beijing3:"北京" };
  for(const s of TRIP_SEGS){
    const r=ranges[s.id]; if(!r) continue;
    for(let d=r.from; d<=r.to; d=addDays(d,1)){
      dayCity[d]={ seg:s.id, label:s.label, city:segCity[s.id]||s.label };
    }
  }
  for(const r of seaRows){
    for(let d=r.from; d<=r.to; d=addDays(d,1)){
      if(dayCity[d]) dayCity[d]={ seg:"couple", label:"东南亚", city:r.city };
    }
  }
  /* 转场日 */
  const legs=wzLegs();
  const legByDate: Record<string,string> = {};
  legs.forEach(l=>legByDate[l.date]=`${l.from}→${l.to}`);
  /* 大行程转场日也打 ✈️ 徽标（2026-09-28 用户：北京/新加坡/西安的转场也要有标识，不只东南亚内部） */
  const flightByDate: Record<string,string> = {};
  for(const t of TRIP_TRANSITIONS){
    if(t.noFlight) continue; /* 西安→北京坐高铁，不打 ✈️ */
    const choice = tripFlyChoice(t.after);
    const tdate = choice==="last" ? ranges[t.after]?.to : ranges[t.before]?.from;
    if(tdate) flightByDate[tdate]=t.title;
  }
  const b3 = ranges["beijing3"];
  if(b3){
    const rc = tripFlyChoice("return");
    const flyDate = rc==="last" ? b3.to : addDays(b3.to, 1);
    flightByDate[flyDate]="回西雅图";
  }
  /* 按月分组 */
  const dates=Object.keys(dayCity).sort();
  if(!dates.length) return '<p class="micro">暂无行程日期。</p>';
  const months: Record<string,string[]> = {};
  dates.forEach(d=>{ const m=d.slice(0,7); (months[m]=months[m]||[]).push(d); });
  const monthNames=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
  let html="";
  for(const m of Object.keys(months).sort()){
    const [y,mo]=m.split("-").map(Number);
    const firstDow=new Date(m+"-01T12:00:00Z").getUTCDay();
    const startPad=(firstDow+6)%7; /* 周一开头 */
    html+=`<div class="wz-calmonth"><h4>${y}年${monthNames[mo-1]}</h4><div class="wz-calgrid"><div class="wz-calwd">一</div><div class="wz-calwd">二</div><div class="wz-calwd">三</div><div class="wz-calwd">四</div><div class="wz-calwd">五</div><div class="wz-calwd">六</div><div class="wz-calwd">日</div>`;
    for(let i=0;i<startPad;i++) html+=`<div class="wz-calday empty"></div>`;
    for(const d of months[m]){
      const info=dayCity[d];
      const issues=wzDayIssues(d, info.city, legByDate[d]);
      const sev=issues.some(x=>x.severity==="critical")?"critical":issues.length?"warn":"ok";
      const badges=[(legByDate[d]||flightByDate[d])?'<span class="wz-badge fly" title="转场日">✈️</span>':"", sev==="critical"?'<span class="wz-badge crit" title="必去闭馆">🚫</span>':sev==="warn"?'<span class="wz-badge warn" title="有提醒">⚠️</span>':""].join("");
      const color=segColor[info.seg]||"#94a3b8";
      html+=`<button class="wz-calday ${sev}" data-ordday="${d}" style="border-top:3px solid ${color}"><span class="wz-caldate">${Number(d.slice(8))}</span><span class="wz-calcity">${info.city}</span><span class="wz-calbadges">${badges}</span></button>`;
    }
    html+=`</div></div>`;
  }
  return html;
}
/* 大行程转场日的航班检查：北京→新加坡 / 新加坡→东南亚 / 东南亚→西安 / 回西雅图。
   用 TRIP_FLIGHTS（Google Flights 实查库）；库里没有=待查询，有但直飞为0=暂无直飞。 */
function tripTransitionFlightIssues(date: string): DayIssue[] {
  const out: DayIssue[] = [];
  const ranges = tripRanges();
  const check = (code: string, label: string) => {
    const d = TRIP_FLIGHTS[`${code}|${date}`];
    if(!d) return; /* 还没查过，不打扰 */
    if(!d.direct) out.push({ severity: "critical", text: `✈️ ${label}（${date.slice(5).replace("-","/")}）：实查确认无直飞`, why: `Google Flights ${d.queriedAt||"近期"}实查当天无直飞，需要改期或看中转方案` });
  };
  /* 北京→新加坡：beijing1 最后一天 */
  const b1 = ranges["beijing1"], sg = ranges["singapore"];
  if(b1 && sg && date === b1.to){
    check("PEK-SIN", "北京→新加坡");
    check("XIY-SIN", "西安→新加坡（岳父母）");
  }
  /* 新加坡→东南亚段：singapore 最后一天 */
  const cp = ranges["couple"];
  if(sg && cp && date === sg.to){
    const firstCity = wz.order.filter(c=>wz.cities.includes(c))[0];
    const cityCode: Record<string,string> = {"普吉":"HKT","清迈":"CNX","曼谷":"BKK","槟城":"PEN","吉隆坡":"KUL","胡志明市":"SGN","富国岛":"PQC"};
    if(firstCity && cityCode[firstCity]) check(`SIN-${cityCode[firstCity]}`, `新加坡→${firstCity}`);
    check("SIN-XIY", "新加坡→西安（岳父母带娃）");
  }
  /* 东南亚段→西安：couple 最后一天 */
  const xa = ranges["xian"];
  if(cp && xa && date === cp.to){
    const cities = wz.order.filter(c=>wz.cities.includes(c));
    const lastCity = cities[cities.length-1];
    const cityCode: Record<string,string> = {"普吉":"HKT","清迈":"CNX","曼谷":"BKK","槟城":"PEN","吉隆坡":"KUL","胡志明市":"SGN","富国岛":"PQC"};
    if(lastCity && cityCode[lastCity]) check(`${cityCode[lastCity]}-XIY`, `${lastCity}→西安`);
  }
  return out;
}
function wzDayIssues(date: string, city: string, legLabel?: string): DayIssue[] {
  const out: DayIssue[]=[];
  out.push(...tripTransitionFlightIssues(date));
  out.push(...dayClosureIssues(city, date));
  const suits=citySuitability(date).filter(x=>x.city===city&&x.level!=="ok");
  /* 去重（2026-09-28 用户：dayClosureIssues 已按严重级别+深链输出过的，不再重复一条提醒） */
  const closureNames=(MUST_GO_CLOSURES[city]||[]).map(c=>c.name);
  suits.forEach(s=>s.reasons.forEach(r=>{
    if(closureNames.some(n=>r.text.includes(n))) return;
    out.push({ severity:s.level==="blocked"?"critical":"warn", text:`${city}：${r.text}`, link:r.link, linkText:r.linkText });
  }));
  const hd=publicHolidays[date];
  if(hd&&hd.countries.includes(cityCountry[city])) out.push({ severity:"warn", text:`${hd.short}（${hd.name}）人多价高` });
  if(legLabel){
    const legs=wzLegs();
    const leg=legs.find(l=>l.date===date);
    if(leg){
      const c=wzLegCheck(leg.from,leg.to,date);
      if(c.level==="blocked") out.push({ severity:"critical", text:`转场 ${legLabel}：无直飞` });
      else if(c.level!=="pass") out.push({ severity:"warn", text:`转场 ${legLabel}：直飞待确认` });
    }
  }
  return out;
}
/* 🔍 检查确认 tab：日历置顶纯展示，点日期原地展开看详情（含原因+跳转）；
   调整入口放日历下方；本 tab 不做任何编辑。 */
let ordExpandedDay: string | null = null;
/* 检查确认 tab 的回程摘要（2026-10-02 用户：检查确认里要有北京→首尔、首尔→西雅图的航班信息和日期） */
function ordReturnSummary(): string {
  const ranges = tripRanges();
  const bj3 = ranges["beijing3"], seoul = ranges["seoul"];
  if(!bj3 || !seoul) return "";
  const rc = (returnCity || "PEK") as Exclude<ReturnCityCode,"">;
  const rm = RETURN_CITY_META[rc];
  /* 北京→首尔：起飞日二选一（beijing3最后一天 或 seoul第一天） */
  const bjChoice = tripFlyChoice("beijing3");
  const bjFlyDate = bjChoice==="last" ? bj3.to : seoul.from;
  const bjCard = tripFlightCard(`${rc}-ICN|${bjFlyDate}`, `${rm.city}→首尔（2大1小）`);
  /* 首尔→西雅图：起飞日二选一（seoul最后一天 或 次日） */
  const seaChoice = tripFlyChoice("return");
  const seaFlyDate = seaChoice==="last" ? seoul.to : addDays(seoul.to, 1);
  const seaCard = tripFlightCard(`ICN-SEA|${seaFlyDate}`, `首尔 → 西雅图（2大1小）`);
  return `<div class="card" style="margin:16px 0">
    <div class="trip-seg-head"><div class="trip-seg-title">✈️ 回程：${rm.city} → 首尔 → 西雅图</div>
    <div class="micro">首尔停留 2 天（${dateLabel(seoul.from)} – ${dateLabel(seoul.to)}）</div></div>
    <div style="margin:8px 0"><b>${rm.city} → 首尔</b> · 📅 ${dateLabel(bjFlyDate)} 起飞 · 2大1小
      <div class="trip-flightinfo" style="margin-top:6px">${bjCard}</div></div>
    <div style="margin:8px 0"><b>首尔 → 西雅图</b> · 📅 ${dateLabel(seaFlyDate)} 起飞 · 2大1小整单价（USD，Google Flights 实查）
      <div class="trip-flightinfo" style="margin-top:6px">${seaCard}</div></div>
  </div>`;
}
function renderOrderTab(){
  const body = el("orderBody");
  body.innerHTML = `
    <div class="wz-unical-legend" style="margin-bottom:10px">
      <span><i class="wz-segdot" style="background:#3b82f6"></i>北京</span>
      <span><i class="wz-segdot" style="background:#22c55e"></i>新加坡</span>
      <span><i class="wz-segdot" style="background:#f59e0b"></i>东南亚段</span>
      <span><i class="wz-segdot" style="background:#8b5cf6"></i>西安</span>
      <span><i class="wz-segdot" style="background:#ec4899"></i>首尔/回程</span>
      <span class="wz-legbadge">✈️ 转场</span>
      <span class="wz-legbadge">⚠️ 提醒</span>
      <span class="wz-legbadge">🚫 必去闭馆</span>
      <span class="micro">点任意一天展开详情</span>
    </div>
    <div class="wz-unical">${wzUnifiedCalendar()}</div>
    <div id="ordDayDetail"></div>
    ${ordReturnSummary()}
    ${buildCityTaboos()}
    <div class="card" style="margin-top:16px"><div class="micro">📅 夫妻东南亚段：<b>${dateLabel(wz.start)} – ${dateLabel(addDays(wz.start,(tripDays["couple"]||0)-1))}</b>（共 ${tripDays["couple"]||0} 天，来自「🗺️ 大行程」）</div>
      <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="ghost" id="ordToTrip">🗺️ 去大行程调整天数 →</button>
        <button class="ghost" id="ordToWizard">🧭 去改东南亚城市顺序 →</button>
      </div></div>
    <p class="micro" id="ordSaveNote" role="status" aria-live="polite" style="margin:14px 0 0"></p>
    <div class="wz-nav"><button class="primary" id="ordSave">💾 保存规划</button></div>`;
  wireOrderTab();
}
/* 检查确认底部：全行程避雷清单（2026-09-28 用户：把所有需要避雷的点列出来供参考） */
/* 检查确认底部：选中城市的整体禁忌/问题汇总（2026-09-28 用户：不要按日期的全程避雷清单，要选中城市整体上有哪些禁忌/问题，供参考） */
function buildCityTaboos(): string {
  /* 选中的城市：新加坡（固定段）+ 向导选中的东南亚城市（wz 是模块级状态） */
  const cities: string[] = ["新加坡"];
  for(const c of wz.order){
    if(wz.cities.includes(c) && !cities.includes(c)) cities.push(c);
  }
  /* 每个城市的整体禁忌：MUST_GO_CLOSURES 的常驻规律 + 泰国周一博物馆 */
  const dowName = ["周日","周一","周二","周三","周四","周五","周六"];
  const sections = cities.map(city=>{
    const closures = MUST_GO_CLOSURES[city] || [];
    const items: string[] = [];
    for(const c of closures){
      const closedDays = c.closedDow.length ? `（${c.closedDow.map(d=>dowName[d]).join("、")}不开）` : "";
      const link = c.spot ? ` <a href="/sea-travel-guide/travel-research?from=planner&spot=${encodeURIComponent(c.spot)}">查看${esc(c.name)}详情 →</a>` : "";
      items.push(`<p class="micro">${c.mustGo?"🚫":"⚠️"} <b>${esc(c.name)}</b>${closedDays}：${esc(c.reason)}${link}</p>`);
    }
    /* 泰国城市周一博物馆闭馆风险 */
    if(["曼谷","清迈","普吉"].includes(city)){
      items.push(`<p class="micro">⚠️ <b>泰国博物馆</b>：周一闭馆风险高，需逐馆核对开放时间</p>`);
    }
    if(!items.length) return "";
    return `<div style="margin-bottom:12px"><h4 style="margin:0 0 6px">${esc(city)}</h4>${items.join("")}</div>`;
  }).filter(Boolean).join("");
  
  if(!sections){
    return `<div class="card" style="margin-top:16px"><h3>📋 选中城市整体禁忌</h3><p class="micro">所选城市暂无已收录的整体禁忌信息。</p></div>`;
  }
  
  return `<div class="card" style="margin-top:16px">
    <h3>📋 选中城市整体禁忌 <span class="micro">（不跟具体日期挂钩，供选城/排期参考）</span></h3>
    ${sections}
  </div>`;
}
function wireOrderTab(){
  const S2 = el("orderBody");
  const q = (s: string) => S2.querySelector(s) as HTMLElement | null;
  const qa = (s: string) => [...S2.querySelectorAll(s)] as HTMLElement[];
  const on = (id: string, fn: () => void) => { const b = q("#"+id); if(b) b.onclick = fn; };
  on("ordToTrip", ()=>{ (S.querySelector('[data-tab="trip"]') as HTMLElement).click(); });
  on("ordToWizard", ()=>{ (S.querySelector('[data-tab="wizard"]') as HTMLElement).click(); wzSetStep(2); });
  on("ordSave", wzSavePlan);
  /* 点日期 → 在日历下方原地展开详情（不弹窗，纯信息展示） */
  qa("[data-ordday]").forEach(b=>b.onclick=()=>toggleOrdDay(b.dataset.ordday!));
}
/* 检查确认日期详情：转场日的航班 availability 卡（2026-09-28 用户：要看到所有转场的航班，不只是 critical） */
function dayFlightCards(d: string): string {
  const ranges = tripRanges();
  const cards: string[] = [];
  /* 大行程转场：北京→新加坡 / 新加坡→首城 / 末城→西安 */
  for(const t of TRIP_TRANSITIONS){
    if(t.noFlight) continue;
    const choice = tripFlyChoice(t.after);
    const date = choice==="last" ? ranges[t.after]?.to : ranges[t.before]?.from;
    if(date !== d) continue;
    const xiyLeg = thailandToXianLeg();
    const sinLeg = singaporeToFirstCityLeg();
    /* 2026-10-02 修：回程 XX→首尔段的占位符也要在这里替换，否则检查确认 tab 的北京→首尔卡片 label 显示原文、航班查不到 */
    const rc = (returnCity || "PEK") as Exclude<ReturnCityCode,"">;
    const rm = RETURN_CITY_META[rc];
    for(const l of t.legs){
      const code = l.code.replace("__COUPLE_XIY_CODE__", xiyLeg.code).replace("__SIN_FIRST_CODE__", sinLeg.code).replace("__RETURN_ICN_CODE__", `${rc}-ICN`);
      const label = l.label.replace("__COUPLE_XIY_LABEL__", xiyLeg.label).replace("__SIN_FIRST_LABEL__", sinLeg.label).replace("__RETURN_ICN_LABEL__", `${rm.city}→首尔`);
      cards.push(tripFlightCard(`${code}|${d}`, label));
    }
  }
  /* 东南亚城市间转场：普吉→清迈 等（wzLegs） */
  const legs = wzLegs();
  for(const leg of legs){
    if(leg.date !== d) continue;
    const fromCode = CITY_AIRPORT[leg.from], toCode = CITY_AIRPORT[leg.to];
    if(fromCode && toCode){
      cards.push(tripFlightCard(`${fromCode}-${toCode}|${d}`, `${leg.from}→${leg.to}`));
    }
  }
  /* 回西雅图：2026-09-29 改经首尔中转 —— 首尔最后一天（或次日）显示首尔→西雅图航班卡；
     XX→首尔段已在上面的 TRIP_TRANSITIONS 转场循环里按回程城市动态渲染 */
  const seoul = ranges["seoul"];
  if(seoul){
    const choice = tripFlyChoice("return");
    const flyDate = choice==="last" ? seoul.to : addDays(seoul.to, 1);
    if(flyDate === d){
      cards.push(tripFlightCard(`ICN-SEA|${d}`, `首尔 → 西雅图（2大1小）`));
    }
  }
  return cards.length ? `<div class="trip-flightinfo" style="margin-top:12px">${cards.join("")}</div>` : "";
}
/* 点日期 → 在日历下方原地展开详情卡（含原因说明+跳转链接）；再点一次收起 */
function toggleOrdDay(d: string){
  const detail = el("ordDayDetail");
  if(ordExpandedDay === d){ ordExpandedDay = null; detail.innerHTML = ""; return; }
  ordExpandedDay = d;
  const rows = wzRanges(), ranges = tripRanges();
  let city = "", segLabel = "";
  for(const s of TRIP_SEGS){
    const r = ranges[s.id];
    if(r && d>=r.from && d<=r.to){ segLabel=s.label; city=s.id==="couple"?"":s.label; break; }
  }
  if(!city){
    for(const r of rows){ if(d>=r.from&&d<=r.to){ city=r.city; segLabel="东南亚"; break; } }
  }
  const legs = wzLegs();
  const leg = legs.find(l=>l.date===d);
  const issues = wzDayIssues(d, city||segLabel, leg?`${leg.from}→${leg.to}`:undefined);
  const wd = ["周日","周一","周二","周三","周四","周五","周六"][new Date(d+"T12:00:00Z").getUTCDay()];
  const crit = issues.filter(x=>x.severity==="critical");
  const warn = issues.filter(x=>x.severity!=="critical");
  const cityLink = city ? `<a href="/sea-travel-guide/travel-research?from=planner&kind=景点&city=${encodeURIComponent(city)}">🏛 查看${esc(city)}景点 →</a>` : "";
  const flightCards = dayFlightCards(d);
  detail.innerHTML = `
  <div class="card ord-daydetail" style="margin:12px 0;border-left:4px solid ${crit.length?"#ef4444":warn.length?"#f59e0b":"#22c55e"}">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <b>${d.slice(5).replace("-","/")} ${wd} · ${city||segLabel}</b>
      <button class="icon-btn" id="ordDayClose" aria-label="收起">×</button>
    </div>
    ${leg?`<p><b>✈️ 转场：</b>${leg.from} → ${leg.to}</p>`:""}
    ${flightCards?`<div><h4 style="margin:8px 0 4px">✈️ 航班 availability</h4>${flightCards}</div>`:""}
    ${crit.length?`<div class="wz-risk-sec crit"><h4>🚫 严重（${crit.length}）</h4>${crit.map(x=>`<p>🚫 ${esc(x.text)}${x.link?` <a href="${x.link}">${esc(x.linkText||"查看详情 →")}</a>`:""}${x.why?`<br><span class="micro">💡 ${esc(x.why)}</span>`:""}</p>`).join("")}</div>`:""}
    ${warn.length?`<div class="wz-risk-sec"><h4>⚠️ 提醒（${warn.length}）</h4>${warn.map(x=>`<p class="micro">⚠️ ${esc(x.text)}${x.link?` <a href="${x.link}">${esc(x.linkText||"查看详情 →")}</a>`:""}${x.why?`<br><span class="micro">💡 ${esc(x.why)}</span>`:""}</p>`).join("")}</div>`:""}
    ${!issues.length&&!flightCards?`<p class="micro">✅ 当天无问题，放心玩。</p>`:""}
    ${cityLink?`<p style="margin-top:8px">${cityLink}</p>`:""}
  </div>`;
  el("ordDayClose").onclick = ()=>{ ordExpandedDay = null; detail.innerHTML = ""; };
  detail.scrollIntoView({behavior:"smooth", block:"nearest"});
}
function wzApplySchedule(){
  const m=buildMergedSchedule();
  state.schedule=m.schedule; state.edited=true; state.start=m.start;
  syncStartDateInput();
  renderCalendar();
}
/* 向导/检查确认的保存：先同步排期再走云端保存（未登录则本机缓存） */
function wzSaveNote(t: string){ const n=S.getElementById("wzSaveNote")||S.getElementById("ordSaveNote"); if(n) n.textContent=t; }
async function wzSavePlan(){
  if(!wzBudgetOk()) return; /* 天数对不上时不许保存 */
  const btn=(S.getElementById("wzSave")||S.getElementById("ordSave")) as HTMLButtonElement|null;
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
  on("wzNext1",()=>wzSetStep(2)); on("wzBack2",()=>wzSetStep(1)); on("wzNext2",wzGoOrder);
  S.querySelectorAll("[data-wzordup]").forEach(b=>(b as HTMLElement).onclick=()=>{ const i=Number((b as HTMLElement).dataset.wzordup), arr=wz.order.filter(c=>wz.cities.includes(c)); if(i>0){ const c=arr[i]; arr[i]=arr[i-1]; arr[i-1]=c; wz.order=[...WZ_ORDER.filter(x=>!wz.cities.includes(x)),...arr]; } cachePlannerLocal(); wzRender(); });
  S.querySelectorAll("[data-wzorddn]").forEach(b=>(b as HTMLElement).onclick=()=>{ const i=Number((b as HTMLElement).dataset.wzorddn), arr=wz.order.filter(c=>wz.cities.includes(c)); if(i<arr.length-1){ const c=arr[i]; arr[i]=arr[i+1]; arr[i+1]=c; wz.order=[...WZ_ORDER.filter(x=>!wz.cities.includes(x)),...arr]; } cachePlannerLocal(); wzRender(); });
  S.querySelectorAll("[data-wzday]").forEach(b=>{
    (b as HTMLElement).onclick=()=>{
      const d=(b as HTMLElement).dataset.wzday!;
      const rows=wzRanges(), ranges=tripRanges();
      let city="", segLabel="";
      for(const s of TRIP_SEGS){
        const r=ranges[s.id];
        if(r&&d>=r.from&&d<=r.to){ segLabel=s.label; city=s.id==="couple"?"":s.label; break; }
      }
      if(!city){
        for(const r of rows){ if(d>=r.from&&d<=r.to){ city=r.city; segLabel="东南亚"; break; } }
      }
      const legs=wzLegs();
      const leg=legs.find(l=>l.date===d);
      const issues=wzDayIssues(d, city||segLabel, leg?`${leg.from}→${leg.to}`:undefined);
      const wd=["周日","周一","周二","周三","周四","周五","周六"][new Date(d+"T12:00:00Z").getUTCDay()];
      toast(`${d.slice(5).replace("-","/")} ${wd} · ${city||segLabel}${leg?` ✈️转场${leg.from}→${leg.to}`:""}${issues.length?"<br>"+issues.map(x=>`${x.severity==="critical"?"🚫":"⚠️"} ${esc(x.text)}`).join("<br>"):"<br>✅ 当天无问题"}`, issues.some(x=>x.severity==="critical"));
    };
  });
  /* Step 3 内嵌了原日期排期页：重排／复制／视图切换按钮只在 Step 3 渲染出来后才存在，按需绑定 */
  on("resetRecommended",()=>{ wzApplySchedule(); wzLastCalSig=wzCalSig(); syncCalMode(); toast("已按向导重排日历"); });
  on("copyPlan",copyPlan);
  on("calModeDecision",()=>{state.calMode="decision";syncCalMode();renderCalendar()});
  on("calModeSchedule",()=>{state.calMode="schedule";syncCalMode();renderCalendar()});
  S.querySelectorAll("[data-wzday]").forEach(b=>(b as HTMLElement).onclick=(e)=>{ e.stopPropagation(); const [city,d]=((b as HTMLElement).dataset.wzday||"").split("|"); const dd=Number(d);
    /* 硬约束：已达大行程上限时 ＋ 不再生效（按钮本身已 disabled，这里防极端情况） */
    if(dd>0&&wzOrderTotal()>=(tripDays["couple"]||0)){ toast("已达大行程「夫妻东南亚」的天数上限",true); return; }
    wz.days[city]=Math.min(6,Math.max(1,(wz.days[city]||1)+dd)); wzRender() });
  /* 2026-09-28：一键应用推荐天数（需检查大行程上限） */
  S.querySelectorAll("[data-wzrec]").forEach(b=>(b as HTMLElement).onclick=(e)=>{ e.stopPropagation(); const city=(b as HTMLElement).dataset.wzrec||""; const rec=WZ_META[city]?.recDays; if(!rec) return;
    const cur=wz.days[city]||1, diff=rec-cur, budget=tripDays["couple"]||0;
    if(diff>0&&wzOrderTotal()+diff>budget){ toast(`设为 ${rec} 天会超出大行程「夫妻东南亚」的 ${budget} 天上限，先去大行程加天数或从别的城减`,true); return; }
    wz.days[city]=rec; wzRender(); toast(`${city}已设为推荐的 ${rec} 天`); });
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
([...S.querySelectorAll(".tab")] as HTMLElement[]).forEach(btn=>btn.onclick=()=>{([...S.querySelectorAll(".tab")] as HTMLElement[]).forEach(b=>b.setAttribute("aria-selected",String(b===btn)));([...S.querySelectorAll(".panel")] as HTMLElement[]).forEach(p=>p.classList.toggle("active",p.id===btn.dataset.tab));if(btn.dataset.tab==="order") renderOrderTab();hostEl.scrollIntoView({behavior:"smooth",block:"start"})});
/* 日历／景点取舍已并入向导步骤内按需渲染：开始日期、重排、复制、视图切换按钮只在 Step 3 出现，由 wzWire() 按需绑定；
   云端保存统一走向导 Step 3 的「保存规划」与大行程的「保存大行程」，不再有独立的「保存到云端」按钮。
   旧 day-modal 已删除（2026-09-28），其事件绑定一并移除。 */
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
    setSyncNote("☁️ 未找到云端规划，已按向导默认排期；去「🧭 东南亚城市规划」点「保存规划」同步到全站。");
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
