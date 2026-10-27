/**
 * 每日行程站点级坐标（backlog P1「每日地图升级为景点级」）。
 *
 * 数据来源：OpenStreetMap Nominatim 地理编码，2026-09-18 实查，
 * 每个坐标的返回 display_name 已逐条核对为对应地标（非近似点）。
 * 只有坐标已核实的日期才列出；未列出的日期 DayMap 保持原有城市级标记。
 * “或 / 二选一”类站点取其中其一的坐标，note 字段如实标注，popup 会展示。
 * 船游日（普吉 Day7/Day8）只列精确地理地标（海岛/海湾），码头集合、皮划艇、
 * 浮潜等无固定点位的泛指项故意不列，note 如实标注“船游到访/区域”。
 */
export interface StopCoord {
  /** 与 guide/data.ts 当天 stops 的 name 一致 */
  name: string;
  /** 与 guide/data.ts 当天 stops 的 time 一致 */
  time: string;
  lat: number;
  lng: number;
  /** 如“二选一，图示其一”等说明 */
  note?: string;
}

export const STOP_COORDS: Record<number, StopCoord[]> = {
  // Day 1 曼谷《抵达 · 休整缓冲》（2026-12-12 周六）：「入住酒店 / 酒店周边轻走」
  // 为泛指不列；湄南河畔晚餐坐标与云端键 909 同一条（OSM Nominatim 2026-09-26
  // 实查，图示 Asiatique 一带）。2026-10-15 补：此前静态天经 stopCoordsForDay(1)
  // 取不到这条已核实坐标，静态回退地图该日无图钉。
  1: [
    {
      name: "湄南河畔晚餐",
      time: "17:30",
      lat: 13.7041568,
      lng: 100.5027137,
      note: "湄南河畔（图示 Asiatique 一带）",
    },
  ],
  // Day 2 曼谷《周末市集 · 黎明寺 · 唐人街》（2026-12-13 周日）
  2: [
    { name: "恰图恰周末市集", time: "09:00", lat: 13.8002651, lng: 100.5511228 },
    { name: "Or Tor Kor Market", time: "13:30", lat: 13.7971301, lng: 100.5475746 },
    { name: "郑王庙", time: "16:00", lat: 13.7438976, lng: 100.4885137 },
    { name: "耀华力路", time: "18:30", lat: 13.7411515, lng: 100.5083113 },
  ],
  // Day 3 曼谷《王城深读 · 暹罗购物》（2026-12-14 周一）
  3: [
    { name: "大皇宫深度游", time: "08:30", lat: 13.7493514, lng: 100.4918643 },
    { name: "卧佛寺与按摩", time: "11:30", lat: 13.7463456, lng: 100.4927381 },
    {
      name: "暹罗商圈 / ICONSIAM",
      time: "15:00",
      lat: 13.7268227,
      lng: 100.510294,
      note: "二选一，图示 ICONSIAM",
    },
    {
      name: "Jodd Fairs 或 Asiatique",
      time: "19:00",
      lat: 13.7681679,
      lng: 100.5709179,
      note: "二选一，图示 Jodd Fairs Ratchada",
    },
  ],
  // Day 4 清迈《飞清迈 · 兰纳古城》（2026-12-15 周二）：转场日同样渲染站点
  // （DayMap 口径：有站点的日子一律画编号动线，转场信息进 caption）。
  // 三条坐标与云端键 912 同源（OSM Nominatim 2026-09-26 实查）；「飞往清迈」
  // 为航段本身不列。2026-10-15 补：此前静态天 stopCoordsForDay(4) 无条目，
  // 静态回退地图该日只有航线、三个古城站点无图钉。
  4: [
    { name: "帕辛寺", time: "13:30", lat: 18.7882068, lng: 98.9813773 },
    { name: "契迪龙寺", time: "15:00", lat: 18.787142, lng: 98.986784 },
    {
      name: "清迈大学夜市",
      time: "18:30",
      lat: 18.8083388,
      lng: 98.9563198,
      note: "图示马林广场夜市",
    },
  ],
  // Day 5 清迈《双龙寺 · 宁曼路 · 烹饪课》（2026-12-16 周三）
  5: [
    { name: "双龙寺", time: "08:00", lat: 18.8050094, lng: 98.9221843 },
    {
      name: "Khao Soi 午餐",
      time: "11:30",
      lat: 18.7953327,
      lng: 98.9832948,
      note: "图示 Khao Soi Khun Yai 本店",
    },
    {
      name: "宁曼路",
      time: "14:00",
      lat: 18.8001262,
      lng: 98.9680725,
      note: "图示 One Nimman，路北端核心区",
    },
    // 16:30 “泰餐烹饪课”无固定集合点位（各校/市场出发不等），故意不列，
    // 编号 1–3 对应时间线前三项。
  ],
  // Day 6 普吉《飞普吉 · 海滩日落》（2026-12-17 周四）：同 Day4 口径，转场日
  // 照样列站点。三条坐标与云端键 906 同源（OSM Nominatim 2026-09-26 实查）；
  // 「飞往普吉」为航段本身不列。2026-10-15 补（此前静态天无图钉，同 Day4）。
  6: [
    {
      name: "卡塔 / 卡伦海滩",
      time: "14:30",
      lat: 7.81936,
      lng: 98.29805,
      note: "二选一，图示卡塔海滩",
    },
    {
      name: "悬崖日落",
      time: "17:15",
      lat: 7.7643212,
      lng: 98.3053958,
      note: "神仙半岛日落点",
    },
    { name: "普吉老镇", time: "20:00", lat: 7.8845565, lng: 98.3920742 },
  ],
  // Day 7 普吉《攀牙湾 · 海蚀洞》（2026-12-18 周五）——船游日：
  // 只有精确地理地标列入；07:00“码头集合”因接送码头随团而异、11:30“海蚀洞皮划艇”
  // 因皮划艇进入的潟湖/hong 随团不同而无固定点位，故意不列、不编造。
  7: [
    {
      name: "攀牙湾",
      time: "09:30",
      lat: 8.2916672,
      lng: 98.5527728,
      note: "船游区域，图示海湾位置",
    },
    {
      name: "007岛",
      time: "14:00",
      lat: 8.2746284,
      lng: 98.5009229,
      note: "船游到访，图示 Ko Khao Phing Kan 岛屿位置",
    },
  ],
  // Day 8 普吉《皮皮岛 · 浮潜》（2026-12-19 周六）——船游日：
  // 06:30“早船出海”泛指、17:00“返回普吉”泛指，均不列；玛雅湾为精确海湾
  // 地标（Ko Phi Phi Le 西侧），列入。小皮皮岛浮潜坐标与云端键 908 同一条
  // （船游到访点，2026-09-26 实查），2026-10-15 补进静态键（此前静态天缺钉）。
  8: [
    {
      name: "玛雅湾",
      time: "09:00",
      lat: 7.6766252,
      lng: 98.7661169,
      note: "船游到访，图示海湾位置",
    },
    {
      name: "小皮皮岛浮潜",
      time: "11:00",
      lat: 7.6853512,
      lng: 98.7657641,
      note: "船游到访",
    },
  ],
  // Day 9 槟城为转场日（普吉→槟城）：同 Day4，转场分支本来就不渲染站点标记，故不列。
  // Day 10 槟城《升旗山 · 极乐寺 · 美食马拉松》（2026-12-21 周一）
  10: [
    { name: "升旗山", time: "07:30", lat: 5.4246532, lng: 100.2688869 },
    { name: "极乐寺", time: "10:30", lat: 5.3997214, lng: 100.2738891 },
    { name: "张弼士故居", time: "15:30", lat: 5.4215176, lng: 100.3347671 },
    { name: "海墘码头", time: "18:00", lat: 5.4119956, lng: 100.3383243 },
    // 13:30“乔治市美食线”为多家摊位串起的泛指路线（亚参叻沙、福建面、扁担饭分食），
    // 无固定可核验坐标，故意不列；编号 1–4 对应时间线其余四项。
  ],
  // Day 11 吉隆坡为转场日（槟城→吉隆坡）：同 Day4，转场分支只画城际航线，
  // 本来就不渲染站点标记，故不列；同样不编造“飞吉隆坡”一类的坐标。
  // Day 12 吉隆坡《黑风洞 · 多元文化》（2026-12-23 周三）
  12: [
    {
      name: "黑风洞",
      time: "08:00",
      lat: 3.237449,
      lng: 101.6836621,
      note: "Sri Subramaniar Swamy Temple 庙本体坐标，非 KTM 车站",
    },
    { name: "国家清真寺", time: "11:30", lat: 3.1420545, lng: 101.6917925 },
    { name: "伊斯兰艺术博物馆", time: "14:00", lat: 3.1414525, lng: 101.6898711 },
    {
      name: "独立广场与茨厂街",
      time: "17:00",
      lat: 3.1487691,
      lng: 101.6936377,
      note: "图示独立广场，茨厂街同市区动线",
    },
  ],
  // Day 13 胡志明市为转场日（吉隆坡→胡志明市）：同 Day4，转场分支只画城际航线，
  // 本来就不渲染站点标记，故不列；同样不编造“飞胡志明市”一类的坐标。
  // Day 14 胡志明市《城市历史 · 古芝地道》（2026-12-25 周五）
  14: [
    {
      name: "统一宫",
      time: "08:00",
      lat: 10.7770348,
      lng: 106.695488,
    },
    {
      name: "战争遗迹博物馆",
      time: "09:45",
      lat: 10.7793647,
      lng: 106.6922806,
    },
    {
      name: "粉红教堂与中央邮政局",
      time: "11:30",
      lat: 10.7883598,
      lng: 106.6906418,
      note: "图示粉红教堂（Nhà thờ Tân Định）本体，中央邮政局邻近同市区动线",
    },
    {
      name: "古芝地道",
      time: "13:30",
      lat: 11.1432528,
      lng: 106.4632107,
      note: "图示游客较少的 Ben Duoc 入口（非 Ben Dinh 大团口）",
    },
    // OSM Nominatim 2026-09-18 实查、display_name 逐条核对：
    // Dinh Độc Lập（135 Nam Kỳ Khởi Nghĩa）/ Bảo tàng Chứng tích Chiến tranh
    // （28 Võ Văn Tần）/ Nhà thờ Tân Định（289 Hai Bà Trưng）/
    // Địa Đạo Bến Dược（Xã An Nhơn Tây）。name/time 与 guide/data.ts Day14
    // 时间线逐字一致校验通过；编号 1–4 对应当天时间线四项。
  ],
  // Day 15 富国岛为转场日（胡志明市→富国岛）：同 Day4，转场分支只画城际航线，
  // 本来就不渲染站点标记，故不列；同样不编造“飞富国岛”一类的坐标。
  // Day 16 富国岛《浮潜 · 跨海缆车》（2026-12-27 周日）
  16: [
    {
      name: "安泰群岛",
      time: "08:00",
      lat: 10.0259,
      lng: 104.0059,
      note: "船游日浮潜行程，图示安泰群岛内的南边手指岛（Hòn Móng Tay）。注意勿与北边同名岛（Northern Fingernail Island，Vung Bau 外海）混淆，此处为运营商实际带客的浮潜区。",
    },
    {
      name: "跨海缆车",
      time: "14:00",
      lat: 10.0270439,
      lng: 104.0072362,
      note: "图示 An Thới 乘车站（Nhà ga An Thới，主岛侧出发站）",
    },
    {
      name: "日落小镇与烟花",
      time: "17:30",
      lat: 10.0283296,
      lng: 104.0041565,
      note: "图示 Kiss Bridge（Cầu Hôn），日落小镇核心区",
    },
    // OSM Nominatim 2026-09-18 实查、display_name 逐条核对：
    // Hòn Móng Tay 安泰群岛内南边手指岛（多家运营商明确提醒勿与北边同名岛
    // Northern Fingernail Island 混淆；mytour.vn 坐标 10°01'33.3"N,104°00'21.2"E
    // 即 10.0259,104.0059，2026-09-18 修正）/ Nhà ga An Thới
    // （aerialway/station，Trần Hưng Đạo，Sun Premier Village Primavera）/
    // Cầu Hôn（man_made/bridge，2 An Thới）。
    // 12:30“午餐与休整”为码头附近简餐、无固定点位，故意不列；
    // 编号 1–3 对应时间线第 1、3、4 项。
  ],
  // Day 17 富国岛《度假日 · 岛味收官》全部为泛指停留（酒店慢早餐/泳池与SPA/
  // 海岛机动时段/海边告别晚餐），无精确可核验坐标，故意不列，保持城市级地图。

  // Day 18 新加坡《飞新加坡 · 滨海湾》（2026-12-29 周二）：同 Day4 口径，
  // 转场日照样列站点。三条坐标与云端键 901 同源（OSM Nominatim 2026-09-26
  // 实查）；「富国岛飞新加坡」为航段本身、「酒店午餐＋午睡」为泛指，均不列。
  // 2026-10-15 补（此前静态天无图钉，同 Day4）。
  18: [
    { name: "鱼尾狮公园", time: "15:30", lat: 1.2856852, lng: 103.8541592 },
    { name: "滨海湾花园（室内温室）", time: "17:00", lat: 1.2811486, lng: 103.86496 },
    {
      name: "擎天树灯光秀（可选）",
      time: "19:45",
      lat: 1.2819993,
      lng: 103.8639356,
      note: "灯光秀在擎天树",
    },
  ],
  // Day 19 新加坡《圣淘沙亲子日》（2026-12-30 周三）
  19: [
    {
      name: "Singapore Oceanarium",
      time: "09:30",
      lat: 1.2583525,
      lng: 103.820484,
    },
    {
      name: "圣淘沙海滩轻走",
      time: "15:30",
      lat: 1.2516244,
      lng: 103.8186878,
      note: "图示西乐索海滩一带",
    },
    // OSM Nominatim 2026-09-18 实查、display_name 逐条核对：
    // Singapore Oceanarium（aquarium，24 Sentosa Gateway，2025年7月扩建更名后的本体）。
    // 圣淘沙海滩轻走坐标与云端键 902 同一条（图示西乐索海滩一带），
    // 2026-10-15 补进静态键（此前静态天缺钉）。
    // 12:30“午餐＋回酒店午睡”/18:00“酒店附近晚餐”均为泛指安排、
    // 无固定可核验点位，故意不列、不编造。
  ],
  // Day 20 新加坡《多元街区 · 星耀樟宜 · 返程》（2026-12-31 周四）
  20: [
    {
      name: "牛车水晨逛（精简版）",
      time: "08:30",
      lat: 1.2815093,
      lng: 103.8441892,
      note: "图示佛牙寺（288 South Bridge Road）；牛车水晨逛泛指寺庙周边骑楼街区",
    },
    {
      name: "Jewel 星耀樟宜",
      time: "13:30",
      lat: 1.3602243,
      lng: 103.9896749,
    },
    // OSM Nominatim 2026-09-18 实查、display_name 逐条核对：
    // Buddha Tooth Relic Temple（place_of_worship，Chinatown，288 South Bridge Road）/
    // Jewel Changi Airport（mall，78 T1 Boulevard，Changi）。
    // 10:30“回酒店收行李”/16:30“办理离境”为泛指安排、无固定可核验点位，
    // 故意不列；编号 1–2 对应时间线第 1、3 项。
  ],

  // ============ 云端13天行程（2026-12-07～12-19）站点坐标 ============
  // 数据来源：OpenStreetMap Nominatim 地理编码，2026-09-26 实查，
  // 每个坐标的返回 display_name 已逐条核对为对应地标（非近似点）。
  // 键 901–913 = 云端 D1–D13（与旧静态编号区分）；findStopCoord 按站点名全局精确匹配，
  // 站点名须与 guide/data.ts stops.name（含 cloudDayOverrides.ts 修正后的新名）一字不差。
  // 无固定点位的泛指项（酒店/午睡/码头集合/皮划艇子项/烹饪课）故意不列。
  // D1 新加坡《抵达新加坡 · 滨海湾》（cloudDayOverrides 已把"富国岛飞新加坡"修正为"抵达樟宜机场"）
  901: [
    { name: "抵达樟宜机场", time: "07:30", lat: 1.3510921, lng: 103.9949824 },
    { name: "鱼尾狮公园", time: "15:30", lat: 1.2856852, lng: 103.8541592 },
    { name: "滨海湾花园（室内温室）", time: "17:00", lat: 1.2811486, lng: 103.86496 },
    {
      name: "擎天树灯光秀（可选）",
      time: "19:45",
      lat: 1.2819993,
      lng: 103.8639356,
      note: "灯光秀在擎天树",
    },
  ],
  // D2 新加坡《圣淘沙亲子日》（海洋馆已有旧键坐标，按名全局命中）
  902: [
    {
      name: "圣淘沙海滩轻走",
      time: "15:30",
      lat: 1.2516244,
      lng: 103.8186878,
      note: "图示西乐索海滩一带",
    },
  ],
  // D3 新加坡 EXTRA《弹性日 · 光影与河》
  903: [
    { name: "ArtScience Museum", time: "09:30", lat: 1.2861382, lng: 103.8592297 },
    // 原 18:00「新加坡河游船（看天气）」坐标已随该站从本日删除（2026-10-24，与当晚已订 Jumbo 冲突；
    // 河船正式可选站在 12-07，见 cloudDayOverrides ordinal 1）
  ],
  // D4 新加坡 EXTRA《弹性日 · 老街区慢逛》
  904: [
    {
      name: "Kampong Glam",
      time: "09:30",
      lat: 1.3034335,
      lng: 103.8596966,
      note: "图示苏丹清真寺一带",
    },
    { name: "乌节路", time: "15:30", lat: 1.2993444, lng: 103.8450261 },
  ],
  // D6 普吉《飞普吉 · 海滩日落》
  906: [
    {
      name: "卡塔 / 卡伦海滩",
      time: "14:30",
      lat: 7.81936,
      lng: 98.29805,
      note: "二选一，图示卡塔海滩",
    },
    {
      name: "悬崖日落",
      time: "17:15",
      lat: 7.7643212,
      lng: 98.3053958,
      note: "神仙半岛日落点",
    },
    { name: "普吉老镇", time: "20:00", lat: 7.8845565, lng: 98.3920742 },
  ],
  // D8 普吉《皮皮岛 · 浮潜》（玛雅湾已有旧键坐标）
  908: [
    {
      name: "小皮皮岛浮潜",
      time: "11:00",
      lat: 7.6853512,
      lng: 98.7657641,
      note: "船游到访",
    },
  ],
  // D9（旧行程：曼谷抵达日口径，现行程 D11 为曼谷抵达日）《抵达 · 休整缓冲》——云端天按站点名全局命中，key/注释仅记来源
  909: [
    {
      name: "湄南河畔晚餐",
      time: "17:30",
      lat: 13.7041568,
      lng: 100.5027137,
      note: "湄南河畔（图示 Asiatique 一带）",
    },
  ],
  // D10（旧行程：曼谷，现行程 D12 周四为四面佛＋暹罗商圈日）——云端天按站点名全局命中，key/注释仅记来源
  910: [
    {
      name: "四面佛＋暹罗商圈",
      time: "09:30",
      lat: 13.7443205,
      lng: 100.5404211,
      note: "图示四面佛",
    },
  ],
  // D12（旧行程：清迈抵达日口径，现行程 D9 为清迈抵达日）《飞清迈 · 兰纳古城》——云端天按站点名全局命中，key/注释仅记来源
  912: [
    { name: "帕辛寺", time: "13:30", lat: 18.7882068, lng: 98.9813773 },
    { name: "契迪龙寺", time: "15:00", lat: 18.787142, lng: 98.986784 },
    {
      name: "清迈大学夜市",
      time: "18:30",
      lat: 18.8083388,
      lng: 98.9563198,
      note: "图示马林广场夜市",
    },
  ],
  // 首尔 D34《飞首尔 · 明洞 · 南山塔夜景》（2026-12-31 周四，云端行程）
  // 首尔 D35《星空图书馆 · 返程》（2027-01-01 周五，云端行程）
  // 坐标来源：OpenStreetMap Nominatim 地理编码，2026-10-04 实查，display_name 已逐条核对为对应地标
  34: [
    { name: "明洞逛街", time: "16:00", lat: 37.5608977, lng: 126.9863762 },
    { name: "南山首尔塔夜景", time: "17:30", lat: 37.55127, lng: 126.9882805 },
  ],
  // ============ 云端定版 stops 补钉（2026-10-26 site-improve-hourly 类别 2/5） ============
  // 缺口：cloudDayOverrides 的定版站点名是带后缀的全名（如「查龙寺 Wat Chalong」
  // 「双龙寺看日落」），findStopCoord 精确匹配永不命中基础名条目，云端天 DayMap
  // 图钉静默缺失（与 2026-10-14 首尔合并名同型事故）。本键按云端全名逐条补钉：
  // 坐标分两类——① 复用本表/EXTRA_ATTRACTION_COORDS/placeCoords 已核验坐标
  // （大佛/查龙寺/神仙半岛/双龙寺/郑王庙/耀华力/Lard Yai/瓦洛洛/普吉老镇）；
  // ② 2026-10-26 map.geocode 实查、full_address 逐条核对为本体（Boat Avenue
  // FULL_ADDRESS 99、NAKA FULL_ADDRESS 100、Night Bazaar FULL_ADDRESS 100、
  // Wat Pha Lat FULL_ADDRESS 100、Talat Noi DISTRICT 100 区级坐标）。
  // 酒店时间/回酒店/换房等泛指站故意不列。
  920: [
    { name: "Boat Avenue 周五夜市 · Fun Friday（定版主线）", time: "傍晚", lat: 7.99666, lng: 98.30185, note: "Boat Avenue, Cherngtalay（geocode 实查）" },
    { name: "NAKA Weekend Market · 周末夜市（确定备选）", time: "晚间（PRU 前后备选）", lat: 7.88106, lng: 98.36592, note: "NAKA 夜市本体（geocode 实查，Wirat Hong Yok 路）" },
    { name: "包车出发 · 普吉大佛", time: "13:00", lat: 7.827598, lng: 98.312853, note: "图示普吉大佛（Nakkerd Hill 山顶）" },
    { name: "查龙寺 Wat Chalong", time: "15:30", lat: 7.84625, lng: 98.3371 },
    { name: "神仙半岛日落", time: "17:00", lat: 7.7643212, lng: 98.3053958, note: "神仙半岛日落点（与「悬崖日落」同点）" },
    { name: "Thalang 路周日步行街 Lard Yai · 老街周日夜市", time: "晚间（正餐后）", lat: 7.8845565, lng: 98.3920742, note: "图示 Thalang 路（普吉老镇）" },
    // 2026-10-27 补钉：普吉 12-13 老城正餐站（cloudDayOverrides 本轮新增）此前无坐标；
    // 按本表既有「二选一，图示其一」口径取 placeCoords 已核验的 Raya exact 坐标
    // （7.8859294,98.3909045，老城 Dibuk 路本体），One Chun 同在老城、note 如实标注。
    { name: "老城正餐 · One Chun / Raya（二选一）", time: "19:00", lat: 7.8859294, lng: 98.3909045, note: "二选一，图示 Raya 本体（老城 Dibuk 路，placeCoords exact 坐标）" },
    { name: "普吉老镇夜景（备选）", time: "20:00", lat: 7.8845565, lng: 98.3920742, note: "图示普吉老镇" },
    { name: "瓦洛洛市场 Warorot（1 小时）", time: "傍晚", lat: 18.7902357, lng: 99.000535 },
    { name: "Night Bazaar 长康路夜市", time: "晚间", lat: 18.78501, lng: 99.00037, note: "Chang Klan 路 104 号（geocode 实查）" },
    { name: "帕拉特寺 Wat Pha Lat（停 30–60 分钟）", time: "16:30", lat: 18.79929, lng: 98.93417, note: "Wat Pha Lat 本体（geocode 实查）" },
    { name: "双龙寺看日落", time: "17:30", lat: 18.8050094, lng: 98.9221843, note: "图示双龙寺（素贴山）" },
    { name: "郑王庙 Wat Arun（渡船过河）", time: "12:00", lat: 13.7438976, lng: 100.4885137, note: "图示郑王庙" },
    { name: "Talat Noi ＋ 宋瓦路老街", time: "16:00", lat: 13.73757, lng: 100.5139, note: "图示 Talat Noi 社区（区级坐标）" },
    { name: "耀华力夜市 · 唐人街吃一圈", time: "18:30", lat: 13.7411515, lng: 100.5083113, note: "图示耀华力路" },
  ],
  // ============ 云端定版 stops 补钉续轮（2026-10-26 site-improve-hourly 类别 2/5） ============
  // 承接键 920：cloudDayOverrides 其余全名站此前同样精确匹配永不命中。本键 10 条，
  // 坐标来源：① map.geocode 2026-10-26 实查 FULL_ADDRESS 本体命中（Exploria
  // 80 Mandai Lake Rd 与站内 detail 地址逐字一致；ACM relevance 100；国家博物馆
  // relevance 100；Dusit Central Park relevance 100；CentralWorld relevance 100；
  // Siam Paragon relevance 99）；② 旧机场路 geocode FULL 99 与 placeCoords 既有
  // exact 坐标（1.3082727,103.8858564）相距约 3 米交叉核验一致，取 geocode 值；
  // ③ ENP geocode FULL 100（19.2144,98.85888）与 StickyMapBar 既有「大象自然公园」
  // 坐标逐字相同、双源一致；④ 泰拳课 geocode FULL_ADDRESS 81 命中 detail 点名的
  // Chiang Mai Muay Thai Gym 本体（76 Wiang Kaew Rd，古城内）。
  // Pokémon/NEXTOPIA 为商场内店铺，坐标取商场本体、note 如实标注楼层。
  // 本轮故意不列：Dib Bangkok（geocode 只命中 Sukhumvit 40 街道级/异馆，无本体）、
  // Jungle Flight JF2（geocode 只命中 Loi Kroh 路市区办公室、非丛林营地，钉办公室
  // 会误导动线）、Jdot Tree（站内 detail 自述地点写法冲突、待复核）、首尔清溪川/
  // 光化门广场/石村湖（map.geocode 对韩国覆盖弱、多次只回 CITY 级，见 placeCoords
  // 文件头注记，留待 Nominatim 渠道轮次，不编造）。
  921: [
    { name: "万态 Exploria 探索馆 · 专程日（与芳林线二选一）", time: "全天（专程日备选）", lat: 1.40421, lng: 103.78844, note: "Exploria 本体，80 Mandai Lake Rd（geocode 实查）" },
    { name: "亚洲文明博物馆 · 敦煌特展 Sacred Caves（半日，与旧机场路二选一）", time: "上午", lat: 1.28745, lng: 103.85138, note: "亚洲文明博物馆本体，1 Empress Pl（geocode 实查）" },
    { name: "旧机场路熟食中心 · 本地老档专程半日（可选）", time: "上午", lat: 1.30825, lng: 103.88583, note: "旧机场路熟食中心本体，51 Old Airport Rd（geocode 实查）" },
    { name: "新加坡国家博物馆 · 全新历史展厅（半日慢逛）", time: "上午", lat: 1.29678, lng: 103.84841, note: "新加坡国家博物馆本体，93 Stamford Rd（geocode 实查）" },
    { name: "Dusit Central Park 屋顶公园（顺路散步）", time: "白天", lat: 13.72839, lng: 100.53738, note: "Dusit Central Park 本体，Rama IV 路 Silom（geocode 实查）" },
    { name: "Pokémon Center Bangkok（Central World 6 楼 · 新开）", time: "下午", lat: 13.74659, lng: 100.53974, note: "图示 CentralWorld 本体（店在 6 楼）" },
    { name: "NEXTOPIA（Siam Paragon 5 楼 · 顺路项）", time: "下午", lat: 13.74563, lng: 100.53463, note: "图示 Siam Paragon 本体（NEXTOPIA 在 5 楼）" },
    { name: "大象自然公园 ENP · 半日上午（定版主线）", time: "07:30", lat: 19.2144, lng: 98.85888, note: "图示 ENP 主园区（Mae Taeng 山谷，酒店接送由运营商负责）" },
    { name: "泰拳体验课（约 1 小时）", time: "15:00", lat: 18.79327, lng: 98.9829, note: "图示 Chiang Mai Muay Thai Gym（古城内 Wiang Kaew 路，geocode 实查）" },
    { name: "Central Embassy · 楼下随便逛", time: "下午", lat: 13.74391, lng: 100.5464, note: "图示 Central Embassy（1031 Ploenchit 路，geocode 以同址命中）" },
  ],
  // ============ 云端 stops 补钉第三轮（2026-10-26 site-improve-hourly 类别 2/5） ============
  // 承接键 921 的「留待 Nominatim 渠道」尾巴：map.geocode 对韩国只回 CITY 级，
  // 本轮改走 OSM Nominatim 直查（2026-10-26 实查、display_name 逐条核对本体）：
  // ① 光化门广场 광화문광장 relation 本体（37.5727839,126.9768558，종로구 사직동）；
  // ② 清溪川取起点清溪广场 청계광장 square 本体（37.5692125,126.9779831，紧邻
  // 光化门、与行程动线「光化门后连逛清溪川」一致；河流本体 way 的质心在东大门
  // 段、不合动线，故不用）；③ 石村湖 석촌호수 relation 湖本体（37.5100884,
  // 127.1040775，송파구 잠실6동，与站内 detail 的松坡区 송파나루길 166 口径一致）。
  // ④ Torry's：上轮 map.geocode 命中异址与 detail 的 Soi Rommanee 冲突而故意不列，
  // 本轮 Nominatim 命中 Torry's Ice Cream Boutique node 本体、display_name 明写
  // 「16, ซอยรมณีย์（Soi Rommanee）」与 detail 逐字一致，冲突解除、补钉。
  // 本轮仍故意不列：Jdot Tree（Nominatim 按旧记地址 사직로2길 12 只命中无名 building，
  // 且站内 detail 自述地点写法冲突未解，钉任一写法都会把待核实地址冒充定论）、
  // Dib Bangkok（Nominatim 空返回、无本体）、Jungle Flight JF2（营地本体仍无命中）。
  922: [
    { name: "光化门圣诞市集 · 最后一天", time: "15:15", lat: 37.5727839, lng: 126.9768558, note: "图示光化门广场本体（Nominatim 实查）" },
    { name: "清溪川 · 首尔灯节", time: "15:45", lat: 37.5692125, lng: 126.9779831, note: "图示清溪广场（清溪川起点，紧邻光化门，Nominatim 实查）" },
    { name: "石村湖灯光节（备选·与光化门线二选一）", time: "17:00", lat: 37.5100884, lng: 127.1040775, note: "图示石村湖本体（松坡区蚕室，Nominatim 实查）" },
    { name: "Torry's Ice Cream 刨冰收尾（先确认打烊时间）", time: "晚间", lat: 7.8854595, lng: 98.3892454, note: "Torry's 本体，16 Soi Rommanee（Nominatim 实查，与 detail 地址一致）" },
  ],
  // ============ 云端 stops 补钉第四轮（2026-10-26 site-improve-hourly 类别 2/5） ============
  // 承接上轮候选：Lennon's／Cloud 11／Seasons 复查 + BAB 两展区与 Layan/Jampa 顺查。
  // 坐标来源（2026-10-26 实查、逐条核对本体）：
  // ① Lennon's：map.geocode FULL_ADDRESS 命中「เลนนอน（Lennon's）, Ploenchit」
  // 本体（13.74335,100.54896），与 placeCoords 既有 Rosewood Bangkok exact
  // 坐标（13.7435351,100.548994）相距约 20 米交叉一致——Lennon's 在 Rosewood
  // 30 楼，取 geocode 本体值、note 如实标注同楼。
  // ② Cloud 11：map.geocode 只回 CITY 级，改 Nominatim 命中「คลาวด์ 11」
  // commercial 本体（13.6834242,100.6082854，Phra Khanong 区），与 detail
  // 「南素坤逸、BTS Punnawithi 步行约 5 分钟」口径一致（Punnawithi 站同区）。
  // ③ BAB One Bangkok 展区：Nominatim 命中 One Bangkok commercial 本体
  // （13.7270987,100.5467662，Lumpini、Rama IV／Wireless 一带），展区就在综合体内。
  // ④ BAB Siam 簇：展区含 BACC／CentralWorld／Siam Paragon 三处、无单一本体，
  // 按本表既有「二选一，图示其一」口径取键 921 已核验的 Siam Paragon 本体
  // 坐标，note 明示只是簇中一处。
  // ⑤ Layan Beach：Nominatim 命中 Layan Beach natural/beach 本体
  // （8.0346279,98.2843289，Cherngtalay），与 detail「酒店旁海滩」口径一致
  // （Banyan Tree 在乐古浪／Bang Tao 北端、Layan 紧邻其北）。
  // ⑥ Jampa：Nominatim 命中 JAMPA restaurant amenity 本体（8.0394207,
  // 98.3173132，Thalang、Thep Krasattri），与 Jampa 位于 Tri Vananda 一带口径一致。
  // ⑦ 137 Pillars 酒店内两项（烹饪课／Spa）：与 Lennon's 同口径——具名活动在
  // 酒店内，取 placeCoords 既有 137 Pillars House exact 坐标（18.7918933,
  // 99.004047），note 明示图示酒店本体；泛指的「酒店时间／泳池／换房入住」仍不列。
  // 本轮仍故意不列：Seasons of Neighbors（Nominatim 空返回、map.geocode 只回
  // Chang Klan STREET 级，无店铺本体，钉街道等于冒充本体）、Jdot Tree／Dib
  // Bangkok／Jungle Flight JF2（理由同键 922 注记，未变）。
  923: [
    { name: "Lennon's 黑胶吧（可选）", time: "21:00", lat: 13.74335, lng: 100.54896, note: "图示 Lennon's 本体（Rosewood Bangkok 30 楼，geocode 实查，与酒店 exact 坐标交叉一致）" },
    { name: "Cloud 11 创意综合体 · 南素坤逸（备选）", time: "傍晚（备选）", lat: 13.6834242, lng: 100.6082854, note: "Cloud 11 本体（Nominatim 实查，南素坤逸 Phra Khanong）" },
    { name: "曼谷艺术双年展 BAB 2026 · One Bangkok 展区（免费填充）", time: "白天", lat: 13.7270987, lng: 100.5467662, note: "图示 One Bangkok 本体（展区在综合体内，Nominatim 实查）" },
    { name: "曼谷艺术双年展 BAB 2026 · Siam 簇（免费填充）", time: "下午", lat: 13.74563, lng: 100.53463, note: "Siam 簇多展区，图示其一 Siam Paragon 本体（BACC／CentralWorld 同片区）" },
    { name: "睡到自然醒 · Layan Beach 散步（定版）", time: "上午", lat: 8.0346279, lng: 98.2843289, note: "图示 Layan Beach 本体（Nominatim 实查，乐古浪北端）" },
    { name: "Jampa 晚餐（tentative · 待确认订金）", time: "19:30", lat: 8.0394207, lng: 98.3173132, note: "图示 Jampa 餐厅本体（Nominatim 实查，Thalang）" },
    { name: "酒店烹饪课 · Cook like a Thai Chef（137 Pillars）", time: "15:00", lat: 18.7918933, lng: 99.004047, note: "图示 137 Pillars House 本体（烹饪课在酒店内，placeCoords exact 坐标）" },
    { name: "酒店 Spa · 137 Pillars 放松", time: "傍晚", lat: 18.7918933, lng: 99.004047, note: "图示 137 Pillars House 本体（Spa 在酒店内，placeCoords exact 坐标）" },
  ],
  35: [
    // 景福宫/土俗村参鸡汤：静态 Day22（首尔第 2 天）站点，此前 stopCoords 侧缺条目、
    // 云端天地图 findStopCoord 精确匹配永不命中（图钉静默缺失，2026-10-14 补）。
    // 景福宫坐标与 StickyMapBar EXTRA 表同源（Nominatim 경복궁，2026-10-14 实查）；
    // 土俗村与 placeCoords exact 条目逐字一致（Nominatim Tosokchon Samgyetang，
    // Jahamun-ro 5-gil，restaurant 本体命中）。
    { name: "景福宫", time: "09:30", lat: 37.579754, lng: 126.9766818 },
    { name: "土俗村参鸡汤", time: "12:00", lat: 37.5776803, lng: 126.9715276 },
    { name: "星空图书馆", time: "10:00", lat: 37.5101676, lng: 127.0600884 },
    {
      // 时间线站点名是合并名「北村韩屋村 · 仁寺洞」（静态 Day22），findStopCoord
      // 精确匹配必须用合并名才能命中；坐标取仁寺洞（2026-10-14 订正，原条目名
      // 单写「仁寺洞」永远匹配不上、图钉静默缺失）
      name: "北村韩屋村 · 仁寺洞",
      time: "13:30",
      lat: 37.5732303,
      lng: 126.9869357,
      note: "图示仁寺洞",
    },
  ],
};

/** 返回某天的站点坐标；没有则返回 undefined（调用方回退到城市级标记） */
export function stopCoordsForDay(dayNum: number): StopCoord[] | undefined {
  const s = STOP_COORDS[dayNum];
  return s && s.length > 0 ? s : undefined;
}

/**
 * 按站点名全局查找坐标（云端行程用：云端天的编号与静态编号对不上，
 * 不能用 stopCoordsForDay）。站点名与 guide/data.ts 的 stops.name 一致时命中；
 * 同名多天时取第一条。找不到返回 undefined。
 */
export function findStopCoord(name: string): StopCoord | undefined {
  const key = name.trim();
  for (const dayNum of Object.keys(STOP_COORDS)) {
    const hit = STOP_COORDS[Number(dayNum)].find((s) => s.name === key);
    if (hit) return hit;
  }
  return undefined;
}

/**
 * 按当天时间线站点名逐个查核实坐标（编号对应当天时间线顺序）。
 * 查不到坐标的站点跳过；全部查不到时返回 undefined（调用方回退到城市级标记）。
 * ItineraryDayCard 与 DayDetail 共用，保证主页和 /day/N 地图一致。
 */
export function cloudStopsForTimeline(
  stops: Array<{ name: string; time: string }>,
): StopCoord[] | undefined {
  const list = stops
    .map((s) => {
      const c = findStopCoord(s.name);
      return c ? { ...c, time: s.time } : undefined;
    })
    .filter((x): x is StopCoord => !!x);
  return list.length > 0 ? list : undefined;
}