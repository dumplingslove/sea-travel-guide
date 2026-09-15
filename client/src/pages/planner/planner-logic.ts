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
  PLANNER_KL_HOTELS,
  RESEARCH_UPDATED_AT,
  RESEARCH_META,
  type ResearchStatus,
} from "../../planner-data/research-items";

/* ---------------- 类型 ---------------- */
interface ClassicSource { title: string; url: string; author?: string; date?: string; excerpt?: string; commentExcerpt?: string; verdict?: string; readNote?: string }
interface ClassicRoute { verdicts: string[]; days: [string, string][]; sources: ClassicSource[]; xhsEvidence?: { status: string; note?: string } }
interface SpotDetail { name: string; address: string; hours: string; lastEntry: string; price: string; transit: string; must: string; reason: string; avoid: string; sources: [string, string][] }
interface PublicHoliday { countries: string[]; short: string; name: string; sources: [string, string][] }
interface SpecialMarker { city: string; short: string; title: string; body: string }
interface PlannerState { selected: string[]; coupleDays: number; remainingMode: string; pace: string; start: string; schedule: Record<string, { city: string; mode: string }>; edited: boolean; classicCity: string; classicDays: number; calMode: "decision" | "schedule" }
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
const baselineNights: Record<string, number> = {"曼谷":3,"清迈":2,"普吉":3,"槟城":2,"吉隆坡":2,"胡志明市":2,"富国岛":3,"新加坡":3};
const routeProfiles: Record<string, string[]> = {
 "TH-VN":["曼谷","胡志明市","富国岛"],
 "TH-MY":["曼谷","槟城","吉隆坡"],
 "MY-VN":["槟城","吉隆坡","胡志明市"]
};
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
let state: PlannerState = {selected:["TH","VN"],coupleDays:7,remainingMode:"skip",pace:"intense",start:"2026-12-12",schedule:{},edited:false,classicCity:"曼谷",classicDays:3,calMode:"decision"};
let modalDate: string | null = null;

const esc=(s: unknown)=>String(s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"} as Record<string,string>)[m]);
function isoDate(d: Date){return d.toISOString().slice(0,10)}
function addDays(iso: string, n: number){const d=new Date(iso+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+n);return isoDate(d)}
function pairKey(sel: string[] = state.selected){return [...sel].sort((a,b)=>["TH","MY","VN"].indexOf(a)-["TH","MY","VN"].indexOf(b)).join("-")}
function comboCities(sel: string[] = state.selected){return routeProfiles[pairKey(sel)]||[]}
function totalSpotsForCountries(sel: string[]){return sel.flatMap(k=>countries[k].cities).reduce((a,c)=>a+citySpots[c].length,0)}

function allocate(days: number, sel: string[] = state.selected): Record<string, number>{
  const cities=comboCities(sel); if(!cities.length)return {};
  const alloc: Record<string, number> = {}; cities.forEach(c=>alloc[c]=0);
  const activeCount=Math.min(cities.length,Math.max(2,Math.floor(days/2)));
  const active=cities.slice(0,activeCount);
  active.forEach(c=>alloc[c]=1);
  let remain=days-active.length;
  let idx=0;
  while(remain>0){
    const c=active[idx%active.length];
    const cap=Math.ceil(citySpots[c].length/3)+1;
    if(alloc[c]<cap){alloc[c]++;remain--}
    idx++;
    if(idx>100)break;
  }
  return alloc;
}
function capacityForAllocation(alloc: Record<string, number>, mode = "couple"){
  let total=0; const active=Object.keys(alloc).filter(c=>alloc[c]>0), paceCap=({intense:4,standard:3,relaxed:2} as Record<string, number>)[state.pace]||4;
  active.forEach(c=>{const d=alloc[c];total+= mode==="couple"?d*paceCap:Math.round(d*1.5)});
  if(active.length>1) total-=active.length-1; // 换城日扣一个景点位，保留机场与安全缓冲
  return Math.max(0,total);
}
function comboStats(sel: string[], days = 7){
  const alloc=allocate(days,sel), denominator=totalSpotsForCountries(sel);
  let mapped=0;
  Object.entries(alloc).forEach(([city,d])=>{if(d>0)mapped+=classicCoverage(city,d).n});
  return {alloc,cap:mapped,denominator,pct:Math.min(100,Math.round(mapped/denominator*100))};
}
function allocationText(alloc: Record<string, number>){return Object.entries(alloc).filter(([,d])=>d).map(([c,d])=>`${c} ${d}天`).join(" · ")}
function reasonFor(sel: string[], days: number, alloc: Record<string, number>){
  const active=Object.entries(alloc).filter(([,d])=>d).map(([c])=>c); const skipped=sel.flatMap(k=>countries[k].cities).filter(c=>!active.includes(c));
  const cap=comboStats(sel,days).cap, total=totalSpotsForCountries(sel);
  return `${days} 天按各城经典路线逐日命中去重，约覆盖 ${cap}/${total} 个两国精华；把城市控制在 ${active.length} 个，减少转场损耗。${skipped.length?`本轮先舍去 ${skipped.join("、")}，避免“到过但没玩好”。`:""}`;
}
function renderClassicRoute(){
  const city=state.classicCity, days=state.classicDays, route=classicRoutes[city];
  (el("classicCity") as HTMLSelectElement).value=city;
  el("classicDayPills").innerHTML=[1,2,3,4,5].map(n=>`<button class="day-pill ${n===days?"active":""}" data-days="${n}" aria-pressed="${n===days}">${n}天</button>`).join("");
  ([...S.querySelectorAll("#classicDayPills .day-pill")] as HTMLElement[]).forEach(btn=>btn.onclick=()=>{state.classicDays=Number(btn.dataset.days);renderClassicRoute()});
  el("classicVerdict").textContent=`${city} · ${route.verdicts[days-1]}`;
  const cov=classicCoverage(city,days);
  el("classicCoverage").textContent=cov.estimated?`约覆盖 ${cov.n}/${cov.total} 个精华（估算）`:`实际命中 ${cov.n}/${cov.total} 个精华 · ${cov.pct}%`;
  const list=citySpots[city]||[];
  el("classicDays").innerHTML=route.days.slice(0,days).map((d,i)=>{
    const hits=((classicSpotHits[city]||[])[i]||[]).filter(h=>list.includes(h));
    const outside=(classicOutsideDayNote[city]||{})[i];
    const note=outside?`<div class="route-note" style="margin-top:6px">ⓘ ${esc(outside)}</div>`:(hits.length?"":`<div class="route-note" style="margin-top:6px">ⓘ 该日未命中本城精华清单，不计入覆盖。</div>`);
    return `<div class="classic-day"><div class="day-index">DAY ${i+1}</div><div><b>${esc(d[0])}</b><p>${esc(d[1])}</p>${hits.length?`<div style="margin-top:6px">${hits.map(h=>`<span class="spot-chip must">${esc(h)}</span>`).join("")}</div>`:""}${note}</div></div>`;
  }).join("");
  el("classicSources").innerHTML=`<strong>路线出处</strong>${(route.sources||[]).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a>`).join("<span>·</span>")}`;
  renderClassicEvidence(route,city);
}
function renderClassicEvidence(route: ClassicRoute, city: string){
  const wrap=el("classicEvidence");if(!wrap)return;
  const detail=(route.sources||[]).map((s,i)=>{
    const rows=[`<strong>来源${i+1} · ${esc(s.verdict||"未标注")}</strong>`];
    rows.push(s.author&&s.author!=="未记录"?`作者：${esc(s.author)}`:"作者：未在核验报告中记录");
    rows.push(s.date&&s.date!=="未记录"?`日期：${esc(s.date)}`:"日期：未在核验报告中记录");
    if(s.excerpt)rows.push(`正文原话：${esc(s.excerpt)}`);
    rows.push(`实质评论原话：${s.commentExcerpt&&s.commentExcerpt!=="未收录"?esc(s.commentExcerpt):"未收录（核验报告未采集评论区）"}`);
    if(s.readNote)rows.push(`核验备注：${esc(s.readNote)}`);
    return `<div class="route-note">🔎 ${rows.join("<br>")}</div>`;
  }).join("");
  const xhs: { status?: string; note?: string } = route.xhsEvidence || {};
  const badge=xhs.status==="insufficient"
    ?`<div class="route-note" style="margin-top:10px">⚠ <strong>证据不足（小红书详细帖）：</strong>${esc(xhs.note||"小红书路线实证研究进行中，暂未接入。")}在补齐前，本路线按“博客/OTA 出处版”呈现，不作“已验证经典”断言。</div>`:"";
  wrap.innerHTML=detail+badge;
}
function renderCountries(){
  const wrap=el("countryButtons");wrap.innerHTML="";
  ["TH","MY","VN"].forEach(k=>{const v=countries[k],b=document.createElement("button");b.className="country-btn"+(state.selected.includes(k)?" selected":"");b.innerHTML=`<span class="flag">${v.flag}</span><b>${v.name}</b><small>${v.cities.join(" · ")}</small>`;b.setAttribute("aria-pressed",String(state.selected.includes(k)));b.onclick=()=>toggleCountry(k);wrap.appendChild(b)});
}
function toggleCountry(k: string){
  if(state.selected.includes(k)){if(state.selected.length===2){toast("双人段需要保留 2 个国家");return}state.selected=state.selected.filter(x=>x!==k)}
  else {if(state.selected.length===2)state.selected.shift();state.selected.push(k)}
  state.edited=false;updateAll();
}
function renderRecommendation(){
  const stats=comboStats(state.selected,state.coupleDays), names=state.selected.map(k=>countries[k].name).join("＋");
  el("recommendTitle").textContent=`${names}：${allocationText(stats.alloc)}`;
  el("allocation").innerHTML=Object.entries(stats.alloc).filter(([,d])=>d).map(([c,d])=>`<span>${esc(c)} / ${d}D</span>`).join("");
  el("recommendReason").textContent=reasonFor(state.selected,state.coupleDays,stats.alloc);
  el("coupleDays").textContent=state.coupleDays+" 天";
  const unselected=(["TH","MY","VN"] as string[]).find(k=>!state.selected.includes(k)) as string;
  el("remainingLabel").textContent=`${countries[unselected].flag} ${countries[unselected].name}（未选）`;
  (el("remainingMode") as HTMLSelectElement).value=state.remainingMode;
}
function renderCompare(){
  const pairs=[["TH","VN"],["TH","MY"],["MY","VN"]];
  const vals=pairs.map(p=>({...comboStats(p,7),pair:p,key:pairKey(p)}));
  const best=vals.reduce((a,b)=>b.pct>a.pct?b:a,vals[0]);
  el("compareGrid").innerHTML=vals.map(v=>`<article class="card compare ${v.key===best.key?"best":""}">${v.key===best.key?'<span class="tag">覆盖率较高</span>':""}<div class="pair">${v.pair.map(k=>countries[k].name).join("＋")}</div><div class="coverage">${v.cap}/${v.denominator}</div><div class="bar"><i style="width:${v.pct}%"></i></div><p>${allocationText(v.alloc)}<br>按经典路线逐日命中去重：7 天约覆盖 ${v.cap}/${v.denominator}（${v.pct}%）。</p></article>`).join("");
}
function buildRecommendedSchedule(){
  const alloc=allocate(state.coupleDays), schedule: Record<string, { city: string; mode: string }> = {}; let cursor=state.start;
  Object.entries(alloc).filter(([,d])=>d).forEach(([city,days])=>{for(let i=0;i<days;i++){schedule[cursor]={city,mode:"couple"};cursor=addDays(cursor,1)}});
  const unselected=(["TH","MY","VN"] as string[]).find(k=>!state.selected.includes(k)) as string;
  if(state.remainingMode==="family") countries[unselected].cities.forEach(city=>{const days=baselineNights[city];for(let i=0;i<days;i++){schedule[cursor]={city,mode:"family"};cursor=addDays(cursor,1)}});
  for(let i=0;i<3;i++){schedule[cursor]={city:"新加坡",mode:"family"};cursor=addDays(cursor,1)}
  state.schedule=schedule;state.edited=false;
}
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
  const rows=scheduleTransitions(),wrap=el("transferAlerts");
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

  const actionable=items.filter(x=>x.level==="warn"||x.level==="blocked").length, count=el("hardCount");
  count.textContent=actionable?`${actionable} 条需处理`:"全部通过";count.classList.toggle("clear",!actionable);
  el("hardList").innerHTML=items.map(x=>`<article class="hard-item ${x.level}"><strong>${x.level==="blocked"?"⛔ ":x.level==="warn"?"⚠ ":"✓ "}${x.title}</strong><p>${x.body}</p>${x.source?`<div class="hard-meta">${x.source}</div>`:""}</article>`).join("");
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
  el("calModeDecision").classList.toggle("active", d);
  el("calModeSchedule").classList.toggle("active", !d);
  el("calModeDecision").setAttribute("aria-pressed", String(d));
  el("calModeSchedule").setAttribute("aria-pressed", String(!d));
}
function renderCalendar(){
  const grid=el("calendarGrid"),mc=monthCells(),dates=mc.cells;grid.innerHTML="";
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
    const paceCap=({intense:4,standard:3,relaxed:2} as Record<string, number>)[state.pace]||4;
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
  const paceName=({intense:"特种兵",standard:"标准",relaxed:"从容"} as Record<string, string>)[state.pace];
  el("calendarNote").textContent=`当前排入 ${days} 天：双人${paceName}节奏 ${couple} 天，亲子慢节奏 ${family} 天。转场日已保留机场与安全缓冲；已标出泰国 12/5、12/7、12/10、12/31，马来西亚／新加坡 12/25，以及特殊开放与州属假日提醒。日历已按起始日＋最长行程自动扩展至 ${mc.gridStart.slice(5).replace("-","/")}–${mc.gridEnd.slice(5).replace("-","/")}，共 ${Math.round(mc.cells.length/7)} 周。决策视图下每格直接显示 8 城当日适宜度（绿宜／黄谨慎／红不宜）与 56 个方向的直飞汇总，点击日期可看逐城原因、逐方向直飞明细并一键排城。`;
  renderTransferAlerts();
  renderHardConstraints();
}
function cityDayCounts(){const counts: Record<string, { couple: number; family: number }> = {};Object.values(state.schedule).forEach(x=>{const mode=x.mode as "couple"|"family";if(!counts[x.city])counts[x.city]={couple:0,family:0};counts[x.city][mode]=(counts[x.city][mode]||0)+1});return counts}
function renderCoverage(){
  const counts=cityDayCounts();
  el("coverageGrid").innerHTML=Object.keys(citySpots).map(city=>{
    const c=counts[city]||{couple:0,family:0},days=c.couple+c.family;
    const cov=classicCoverage(city,days),list=citySpots[city],hitsArr=classicSpotHits[city]||[];
    const hitSet=new Set<string>(),hitOrdered: string[]=[];
    for(let i=0;i<Math.min(days,hitsArr.length);i++)(hitsArr[i]||[]).forEach(h=>{if(list.includes(h)&&!hitSet.has(h)){hitSet.add(h);hitOrdered.push(h)}});
    const rest=list.filter(s=>!hitSet.has(s));
    const must=hitOrdered,optional=rest.slice(0,2),drop=rest.slice(2);
    return `<article class="card city-summary"><div class="city-top"><div><h3>${esc(city)}</h3><div class="micro">${c.couple?`双人 ${c.couple}天`:""}${c.couple&&c.family?" · ":""}${c.family?`亲子 ${c.family}天`:""}${!days?"未排入":""}</div></div><span>${days}D · 实际命中 ${cov.n}/${cov.total}${cov.estimated?"（估算）":""}</span></div><div class="meter"><b style="width:${cov.pct}%"></b></div><div class="micro" style="margin-bottom:8px">按经典路线逐日命中去重；城外日不计入。</div><div class="spot-groups"><div class="spot-group"><strong>优先排</strong> ${must.length?must.map(s=>`<span class="spot-chip must">${esc(s)}</span>`).join(""):"—"}</div><div class="spot-group"><strong>有余力再去</strong> ${optional.length?optional.map(s=>`<span class="spot-chip">${esc(s)}</span>`).join(""):"—"}</div><div class="spot-group"><strong>本轮建议舍去</strong> ${drop.length?drop.map(s=>`<span class="spot-chip drop">${esc(s)}</span>`).join(""):"—"}</div></div></article>`
  }).join("");
  renderSpotDetails();
}
// 景点详情字段：目前仅曼谷 9 项完成 8 字段研究；其余 7 城研究资料尚未整理为详情字段，
// 结构预留按城接入，数据就绪后直接填入对应数组即可，不拿占位文案冒充完成。
const spotDetails: Record<string, SpotDetail[]> = {"曼谷":bangkokSpotDetails};
const detailCityOrder=["曼谷","清迈","普吉","槟城","吉隆坡","胡志明市","富国岛","新加坡"];
function spotDetailCard(s: SpotDetail, open: boolean){
  return `<details class="spot-detail" ${open?"open":""}><summary>${esc(s.name)}<span>${open?"完整示例":"详情字段"}</span></summary><div class="spot-detail-body"><div class="spot-fields"><div class="spot-field"><b>地址</b><span class="${s.address.includes("待")?"pending-text":""}">${esc(s.address)}</span></div><div class="spot-field"><b>营业时间</b><span class="${s.hours.includes("待")?"pending-text":""}">${esc(s.hours)}</span></div><div class="spot-field"><b>最后入场</b><span class="${s.lastEntry.includes("待")?"pending-text":""}">${esc(s.lastEntry)}</span></div><div class="spot-field"><b>门票／价格</b><span class="${s.price.includes("待")?"pending-text":""}">${esc(s.price)}</span></div><div class="spot-field"><b>交通</b><span class="${s.transit.includes("待")?"pending-text":""}">${esc(s.transit)}</span></div><div class="spot-field"><b>必看／必做</b>${esc(s.must)}</div></div><p><strong>推荐原因：</strong>${esc(s.reason)}</p><p><strong>避坑：</strong><span class="${s.avoid.includes("待")?"pending-text":""}">${esc(s.avoid)}</span></p>${(s.sources||[]).length?`<p class="safety-note"><strong>资料来源：</strong> ${(s.sources||[]).map(sourceLink).join(" · ")}</p>`:""}</div></details>`;
}
function renderSpotDetails(){
  el("spotDetailList").innerHTML=detailCityOrder.map(city=>{
    const details=spotDetails[city];
    if(details&&details.length)return `<h3 style="margin:18px 0 10px">📍 ${esc(city)} · ${details.length} 项已展开</h3>`+details.map((s,i)=>spotDetailCard(s,city==="曼谷"&&i===0)).join("");
    return `<article class="card" style="padding:16px 18px;margin-top:14px"><h3>📍 ${esc(city)}</h3><p class="route-note" style="margin-top:6px">⚠ <strong>详情整理中：</strong>${esc(city)}的景点详情字段（地址／营业时间／最后入场／票价／交通／必看／避坑）研究资料尚未整理完成，暂不展示。数据就绪后接入，不拿占位文案冒充完成。</p></article>`;
  }).join("");
}
function routeDisplayName(route: MatrixRoute){return `${airportCity[route.origin]}（${cityAirportLabels[airportCity[route.origin]]}） → ${airportCity[route.destination]}（${cityAirportLabels[airportCity[route.destination]]}）`}
function actualArrival(route: MatrixRoute, flight: MatrixFlight){const raw=flight.arrival_airport;return raw&&raw!==flight.airport?raw:route.destination}
function safeLinks(airline: MatrixAirline){return (airline.safety?.source_urls||[]).slice(0,2).map((u,i)=>`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">安全来源${i+1} ↗</a>`).join(" · ")}
function renderRail(route: MatrixRoute | null){
  const rail=route?.rail||{},items=rail.conventional||[];
  return `<div class="rail-box"><h4>铁路与联运</h4><p class="micro">高铁：${rail.hsr?.available?"有可用方案":"2026年12月无可用高铁"}</p>${items.length?items.map(x=>`<div class="rail-item"><strong>${esc(x.service)} · ${esc(x.operator)}</strong><p>${esc(x.route)} · ${esc(x.duration)} · ${esc(x.frequency)}</p><p>${esc(x.price)}；${esc(x.booking)}</p>${(x.source_urls||[]).slice(0,2).map((u,i)=>`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">铁路来源${i+1} ↗</a>`).join(" · ")}</div>`).join(""):'<div class="rail-item">该城市对暂无矩阵内的普通铁路／联运方案。</div>'}</div>`;
}
function flightRows(airline: MatrixAirline, route: MatrixRoute, date: string){
  const day=dayCode(date),flights=(airline.flights||[]).filter(f=>(f.operating_days||[]).includes(day));
  if(flights.length)return `<div class="flight-times">${flights.map(f=>`<div class="flight-row"><b>${esc(f.flight_no||airline.code)}</b><span>${esc(f.dep||"时刻待核验")} → ${esc(f.arr||"待核验")} · ${esc(f.duration||"时长待核验")}</span><span>${esc(f.airport||route.origin)} → ${esc(actualArrival(route,f))}</span>${f.note?`<span style="grid-column:1/-1">${esc(f.note)}</span>`:""}</div>`).join("")}</div>`;
  const typical=airline.typical_departures||[];
  return `<div class="flight-times"><div class="flight-row"><b>${esc(airline.code)}</b><span>${typical.length?`典型起飞 ${typical.map(esc).join(" / ")}`:"精确航班号与时刻待核验"}</span><span>${esc(route.origin)} → ${esc(route.destination)}</span></div></div>`;
}
function airlineCard(airline: MatrixAirline, route: MatrixRoute, date: string, allOperating: MatrixAirline[]){
  const verdict=airline.safety?.verdict||"待核验",cls=verdict==="推荐"?"recommended":verdict==="谨慎"||verdict==="待核验"?"caution":"",badge=verdict==="推荐"?"recommended":verdict==="谨慎"?"caution":verdict==="待核验"?"pending":"";
  const safer=allOperating.filter(a=>["推荐","可用"].includes(a.safety?.verdict ?? "")&&a.code!==airline.code).slice(0,4);
  const pendingNote=airline.code==="SK"?"疑似代码共享或系统 artifact，暂不建议据此安排转场。":airline.code==="GF"?"该航司在本航线的安全评级尚未核实，暂不建议作为确定行程依据。":"暂不作为安全优先方案。";
  return `<article class="airline-card ${cls}"><div class="airline-head"><h4>${esc(airline.code)} · ${esc(airline.name)}</h4><div class="badge-row"><span class="badge ${badge}">${esc(verdict)}</span><span class="badge">${airline.safety?.iosa===true?"IOSA":"IOSA 未确认"}</span></div></div><p class="airline-meta">运营日：${airlineDays(airline).map(x=>weekdayZh[x]).join("、")||"待核验"}${airline.schedule_note?` · ${esc(airline.schedule_note)}`:""}</p>${flightRows(airline,route,date)}${verdict==="谨慎"?`<div class="route-alert caution">谨慎选择。更安全替代：${safer.length?safer.map(a=>`${esc(a.code)} ${esc(a.name)}（${esc(a.safety?.verdict ?? "")}）`).join(" / "):"该日期暂无同航线更安全替代，建议改期或中转"}</div>`:""}${verdict==="待核验"?`<div class="route-alert"><strong>安全评级待核验。</strong> ${pendingNote}</div>`:""}<p class="safety-note">${esc(airline.safety?.note||"安全资料待核验")}${safeLinks(airline)?`<br>${safeLinks(airline)}`:""}${airline.merge_note?`<br>${esc(airline.merge_note)}`:""}</p></article>`;
}
function renderTransport(){
  const date=inputVal("transportDate"),from=inputVal("transportFrom"),to=inputVal("transportTo"),route=routeForCities(from,to),result=el("routeResult");
  if(from===to){result.innerHTML='<div class="route-alert">出发和到达城市不能相同。</div>';return}
  if(!route){result.innerHTML=`<div class="route-result-head"><div><h3>${esc(from)} → ${esc(to)}</h3><p>${dateLabel(date)}</p></div><span class="route-status alert">尚未核验</span></div><div class="route-alert">此组合不在最终矩阵内；“尚未核验”不等于“无直飞”。</div>`;return}
  const a=routeAssessment(route,date),partial=route.verification_status.includes("部分待核验"),status=a.kind==="direct"?"当天有直飞":a.kind==="no-service"?"当天无直飞":a.kind==="no-direct"?"已确认无直飞":a.kind==="pending"?"精确日期待核验":"尚未核验";
  const statusClass=a.kind==="direct"?(partial?"partial":""):(a.kind==="pending"?"partial":"alert");
  let html=`<div class="route-result-head"><div><h3>${routeDisplayName(route)}</h3><p>${dateLabel(date)} · ${esc(route.verification_status)}</p></div><span class="route-status ${statusClass}">${status}</span></div>`;
  if(partial)html+='<div class="route-alert caution"><strong>排班模式已核验，精确日期时刻待核验。</strong> 以下时刻可能是典型时段或特定样本，不可直接当作最终可售班次。</div>';
  if((route.calendar_warnings||[]).length)html+=`<div class="route-alert">${(route.calendar_warnings||[]).map(esc).join(" ")}</div>`;
  if(a.kind==="no-service")html+=`<div class="route-alert"><strong>${dateLabel(date)}没有运营直飞。</strong> 建议改到周一、周三、周五或周日，或查看中转／铁路替代。</div>`;
  if(a.kind==="no-direct")html+=`<div class="route-alert"><strong>该方向已完成多源无直飞核验。</strong> ${esc(route.notes||"请改走中转。")}</div>`;
  if(a.kind==="pending")html+='<div class="route-alert caution">该方向有直飞记录，但没有足以按星期确认当天运营的排班数据；请按实际日期复核。</div>';
  if(a.kind==="direct")html+=`<div class="airline-list">${a.airlines.map(x=>airlineCard(x,route,date,a.airlines)).join("")}</div>`;
  if(route.notes)html+=`<div class="route-alert info"><strong>合并备注：</strong>${esc(route.notes)}</div>`;
  html+=renderRail(route);result.innerHTML=html;
}
function initTransport(){
  const cities=Object.keys(cityAirportCodes),from=el("transportFrom") as HTMLSelectElement,to=el("transportTo") as HTMLSelectElement;
  cities.forEach(c=>{from.add(new Option(`${c} · ${cityAirportLabels[c]}`,c));to.add(new Option(`${c} · ${cityAirportLabels[c]}`,c))});from.value="普吉";to.value="槟城";
  [from,to,el("transportDate")].forEach(x=>{x.onchange=renderTransport});
  el("swapRoute").onclick=()=>{const x=from.value;from.value=to.value;to.value=x;renderTransport()};renderTransport();
}
function klHotelStatusLine(h: { sources: Record<string, string> }){
  const label=(k: string)=>{const v=h.sources[k];return v==="done"?"已核验":v==="partial"?"部分":v==="missing"?"缺失":"待补"};
  return `TripAdvisor ${label("tripadvisor")} · Google Maps ${label("google_maps")} · 中文站 ${label("chinese_sites")} · 小红书 ${label("xiaohongshu")} · 照片 ${label("photos")}`;
}
function renderHotels(){
  el("hotelGrid").innerHTML=Object.entries(hotels).map(([city,hotel])=>{
    const flag=`${countries[cityCountry[city]].flag} ${cityCountry[city]}`;
    if(city==="吉隆坡"){
      // 研究 JSON 中的 5 条吉隆坡酒店研究记录仅作研究状态参考；
      // 验收要求第 7 项缺口提示必须原样保留，不得以候选已给出替代。
      const list=PLANNER_KL_HOTELS.map(h=>`<div class="rail-item"><strong>${esc(h.name)}</strong><p class="micro">${esc(klHotelStatusLine(h))}</p></div>`).join("");
      return `<article class="card hotel"><header><h3>${esc(city)}</h3><span class="city">${flag}</span></header>${list}<p><strong>开放问题：</strong>研究报告未给出候选酒店。</p></article>`;
    }
    return `<article class="card hotel ${city==="富国岛"?"warning":""}"><header><h3>${esc(city)}</h3><span class="city">${flag}</span></header><p>${esc(hotel)}</p>${city==="富国岛"?'<p><strong>注意：</strong>原计划 Park Hyatt 尚未开业，不能用于 2026 年 12 月。</p>':'<p>房态需预订时确认。</p>'}</article>`;
  }).join("");
}
function openDay(date: string){modalDate=date;const plan=state.schedule[date];el("modalTitle").textContent=`${date.slice(5).replace("-","月")}日`;renderDayIntel(date);(el("modalCity") as HTMLSelectElement).value=plan?.city||"曼谷";(el("modalMode") as HTMLSelectElement).value=plan?.mode||"couple";el("dayModal").classList.add("open")}
function closeModal(){el("dayModal").classList.remove("open")}
function saveDay(){
  if(!modalDate)return;
  const mode=inputVal("modalMode");
  if(mode==="free")delete state.schedule[modalDate];else state.schedule[modalDate]={city:inputVal("modalCity"),mode};
  state.edited=true;closeModal();renderCalendar();renderCoverage();
  const nextDate=addDays(modalDate,1),blocked=scheduleTransitions().filter(r=>r.assessment.kind!=="direct"&&(r.date===modalDate||r.date===nextDate));
  if(blocked.length){const r=blocked[0],label=r.assessment.kind==="no-direct"?"已确认无直飞":r.assessment.kind==="no-service"?"当天无直飞":"精确日期待核验";toast(`${r.date.slice(5)} ${r.from}→${r.to}：${label}。请查看中转、铁路或改期方案。`,true)}else toast("这一天已调整");
}
function removeDay(){if(!modalDate)return;delete state.schedule[modalDate];state.edited=true;closeModal();renderCalendar();renderCoverage();toast("这一天已留白")}
function planText(){
  const paceName={intense:"特种兵（约4个点/天）",standard:"标准（约3个点/天）",relaxed:"从容（约2个点/天）"}[state.pace];
  const lines=["2026年12月东南亚候选行程",`双人国家：${state.selected.map(k=>countries[k].name).join(" + ")}（${state.coupleDays}天）`,`双人节奏：${paceName}；转场日保留机场与安全缓冲`,""];
  Object.keys(state.schedule).sort().forEach(date=>{const p=state.schedule[date];lines.push(`${date}｜${p.city}｜${p.mode==="family"?"亲子 2大1小（1–2个点＋午休）":`夫妻双人（${paceName}）`}`)});
  lines.push("","硬约束提醒：泰国公共假日 12/5、12/7补假、12/10、12/31；马来西亚／新加坡圣诞节 12/25；另查 12/1、12/9、12/11、12/12 特殊开放。周末限定市场、闭馆日、航线核验、酒店 minimum stay 与 gala dinner 请按页面检查。航班资料核查于 2026-09-14，预订前仍需按实际日期重查。")
  return lines.join("\n")
}
async function copyPlan(){const text=planText();try{await navigator.clipboard.writeText(text)}catch(e){const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove()}toast("行程已复制")}
function toast(msg: string, warning = false){const t=el("toast");t.textContent=msg;t.classList.toggle("warning",warning);t.classList.add("show");const tt=t as unknown as { _timer?: ReturnType<typeof setTimeout> };clearTimeout(tt._timer);tt._timer=setTimeout(()=>{t.classList.remove("show");t.classList.remove("warning")},warning?5000:2200)}
function updateAll(){renderCountries();renderRecommendation();renderCompare();if(!state.edited)buildRecommendedSchedule();renderCalendar();renderCoverage()}

// init controls
([...S.querySelectorAll(".tab")] as HTMLElement[]).forEach(btn=>btn.onclick=()=>{([...S.querySelectorAll(".tab")] as HTMLElement[]).forEach(b=>b.setAttribute("aria-selected",String(b===btn)));([...S.querySelectorAll(".panel")] as HTMLElement[]).forEach(p=>p.classList.toggle("active",p.id===btn.dataset.tab));hostEl.scrollIntoView({behavior:"smooth",block:"start"})});
el("daysMinus").onclick=()=>{state.coupleDays=Math.max(5,state.coupleDays-1);state.edited=false;updateAll()};
el("daysPlus").onclick=()=>{state.coupleDays=Math.min(10,state.coupleDays+1);state.edited=false;updateAll()};
el("remainingMode").onchange=e=>{state.remainingMode=(e.target as HTMLSelectElement).value;state.edited=false;updateAll()};
el("paceSelect").onchange=e=>{state.pace=(e.target as HTMLSelectElement).value;el("coupleLegend").innerHTML=`<i class="dot couple"></i>双人${({intense:"特种兵",standard:"标准",relaxed:"从容"} as Record<string, string>)[state.pace]}`;updateAll()};
el("applyRecommendation").onclick=()=>{state.edited=false;buildRecommendedSchedule();renderCalendar();renderCoverage();(S.querySelector('[data-tab="calendar"]') as HTMLElement).click();toast("已按推荐排入日历")};
el("startDate").onchange=e=>{state.start=(e.target as HTMLInputElement).value;state.edited=false;buildRecommendedSchedule();renderCalendar();renderCoverage()};
el("resetRecommended").onclick=()=>{state.edited=false;buildRecommendedSchedule();renderCalendar();renderCoverage();toast("已恢复智能推荐")};
el("copyPlan").onclick=copyPlan;
el("calModeDecision").onclick=()=>{state.calMode="decision";syncCalMode();renderCalendar()};
el("calModeSchedule").onclick=()=>{state.calMode="schedule";syncCalMode();renderCalendar()};
syncCalMode();
el("closeModal").onclick=closeModal;el("saveDay").onclick=saveDay;el("removeDay").onclick=removeDay;
el("dayModal").onclick=e=>{if((e.target as HTMLElement).id==="dayModal")closeModal()};document.addEventListener("keydown",onKeyDown);
const citySelect=el("modalCity") as HTMLSelectElement;Object.keys(citySpots).forEach(c=>citySelect.add(new Option(c,c)));
const classicCitySelect=el("classicCity") as HTMLSelectElement;Object.keys(classicRoutes).forEach(c=>classicCitySelect.add(new Option(c,c)));
classicCitySelect.onchange=e=>{state.classicCity=(e.target as HTMLSelectElement).value;state.classicDays=3;renderClassicRoute()};
initTransport();renderHotels();renderClassicRoute();buildRecommendedSchedule();updateAll();

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

  return () => { document.removeEventListener("keydown", onKeyDown); };
}
