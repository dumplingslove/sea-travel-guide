export type HotelGroup='Marriott'|'Hyatt'|'Other';
export type Item={name:string;city:string;meta:string;detail:string;best?:string;source?:string;hotelGroup?:HotelGroup;brand?:string;loyaltyProgram?:'Marriott Bonvoy'|'World of Hyatt'|'不适用';officialUrl?:string;officialCheck?:string};
export type HotelGroupChoice={group:'Marriott'|'Hyatt';hotel:string|null;brand:string|null;loyaltyProgram:'Marriott Bonvoy'|'World of Hyatt';officialUrl:string;status:'verified'|'not-found'|'coming-soon';note:string};
export type HotelCityCheck={city:string;dates:string;checked:string;choices:[HotelGroupChoice,HotelGroupChoice]};
export type Day={day:number;date:string;city:string;title:string;stops:{time:string;name:string;detail:string}[];food:string;tip:string};
export const cities=["曼谷","清迈","普吉","槟城","吉隆坡","胡志明市","富国岛","新加坡"];
export const days:Day[]=[
{day:1,date:"12月12日 周六",city:"曼谷",title:"抵达 · 休整缓冲",stops:[{time:"13:00",name:"入住酒店",detail:"放下行李，留足跨洲飞行后的缓冲。小红书路线共识：住暹罗 Siam / Asok 素坤逸，BTS 方便、远离老城大堵车。"},{time:"15:30",name:"酒店周边轻走",detail:"只在酒店附近散步、做个按摩或找家咖啡馆坐下，倒时差为主；不排远点、不进需要赶时间的景点。"},{time:"17:30",name:"湄南河畔晚餐",detail:"从水面看寺庙与河岸灯火，轻松开启旅程；Asiatique 河滨夜市（4 篇路线帖）是晚餐后选项。"}],food:"首晚以河畔泰餐为主；朱拉隆功夜市是 5 篇路线帖的高频晚餐选择，若体力好可把晚餐挪过去。",tip:"抵达日只休整、不排寺庙与跨城项目——大皇宫、玉佛寺、卧佛寺统一放在 Day3 王城日一次看完，避免 Day1/Day3 重复跑。曼谷交通差，机场往返务必至少提前 4 小时。"},
{day:2,date:"12月13日 周日",city:"曼谷",title:"周末市集 · 黎明寺 · 唐人街",stops:[{time:"09:00",name:"恰图恰周末市集",detail:"周日限定，先逛家居、手工艺与古着区。4 篇路线帖覆盖；乍都乍只在周六日开放，本日正好。"},{time:"13:30",name:"Or Tor Kor Market",detail:"熟食与水果选择丰富，但价格高于普通市场，只买明码标价商品。"},{time:"16:00",name:"郑王庙",detail:"6 篇路线帖共同覆盖；搭摆渡船过河，傍晚拍白瓷佛塔。"},{time:"18:30",name:"耀华力路",detail:"沿唐人街边走边吃（4 篇路线帖覆盖）；胜利纪念碑船面一条街 RuaThong 是多篇推荐的白天选项。"}],food:"Jay Fai 仅作传奇打卡，性价比与咸度评价分化；正式晚餐优先 Potong，扫街以少量试吃为主。",tip:"市集范围巨大，提前标记目标区；餐厅订位与扫街二选一，别硬塞；打车用 Grab / Bolt 防宰。"},
{day:3,date:"12月14日 周一",city:"曼谷",title:"王城深读 · 暹罗购物",stops:[{time:"08:30",name:"大皇宫深度游",detail:"避开旅行团高峰，补足壁画与玉佛寺细节。"},{time:"11:30",name:"卧佛寺与按摩",detail:"参观后体验古法按摩。"},{time:"15:00",name:"暹罗商圈 / ICONSIAM",detail:"集中采购设计品牌与手信；ICONSIAM 5 篇路线帖覆盖，暹罗商圈内四面佛（5 篇）可顺路祈福。"},{time:"19:00",name:"Jodd Fairs 或 Asiatique",detail:"夜市收尾；Jodd Fairs 是多篇路线帖的夜市选项。"}],food:"Thipsamai 炒河粉；晚餐可选 Sorn / Sühring（需提前数月抢位）。",tip:"王城与寺庙集中在今天一次看完（Day1 已改为纯休整缓冲，不再重复跑）。两家三星都极难订；没有确认前不要围绕它们锁死整晚。寺庙着装不露肩、不过膝；丹嫩沙多水上市场（4 篇）与美功铁道市场（2 篇）需早班出发、提前查火车时间，可替换下午购物段。"},
{day:4,date:"12月15日 周二",city:"清迈",title:"飞清迈 · 兰纳古城",stops:[{time:"08:00",name:"飞往清迈",detail:"短途航班约1小时，预留机场交通与安检。"},{time:"13:30",name:"帕辛寺",detail:"看兰纳建筑与壁画；7 篇路线帖覆盖的古城寺庙核心。"},{time:"15:00",name:"契迪龙寺",detail:"走进古城中心的大佛塔遗址（7 篇路线帖覆盖）；塔佩门（7 篇）建议早上 8 点前去，时间不够可移至明晨。"},{time:"18:30",name:"清迈大学夜市",detail:"路线共识的必去夜市（8 篇提及清迈大学）；长康路夜市是备选。"}],food:"Huen Phen 老牌泰北菜（现行必比登身份未证实）；夜市补泰北香肠与芒果糯米饭。",tip:"住古城内或宁曼路（逛吃方便）是路线帖共识；进寺庙脱鞋、穿长裤，门票多为 50 铢/人，多备泰铢现金。"},
{day:5,date:"12月16日 周三",city:"清迈",title:"双龙寺 · 宁曼路 · 烹饪课",stops:[{time:"08:00",name:"双龙寺",detail:"7 篇路线帖覆盖，清晨上山俯瞰清迈盆地；素贴山早晚冷，备外套。"},{time:"11:30",name:"Khao Soi 午餐",detail:"Khao Soi Khun Yai 周一至周六 10:00–14:00、周日休；10:00 到，先点单付款拿号。"},{time:"14:00",name:"宁曼路",detail:"8 篇路线帖覆盖的咖啡馆与设计小店区，慢逛。"},{time:"16:30",name:"泰餐烹饪课",detail:"从市场选菜到完成多道泰北菜。粘粘瀑布被多篇称为“最好玩、不要错过”，可替换此段，需包车或一日游团。"}],food:"Khao Soi Khun Yai；晚餐看体力选 Kiti Panit。",tip:"JJ Market 与椰子市集仅周末开放（本日周三不去）；郊外点位包车或报团，不建议无证租摩托；大象体验选拒绝骑乘的保护区。"},
{day:6,date:"12月17日 周四",city:"普吉",title:"飞普吉 · 海滩日落",stops:[{time:"09:00",name:"飞往普吉",detail:"直飞约2小时。"},{time:"14:30",name:"卡塔 / 卡伦海滩",detail:"卡塔 4 篇、卡伦 4 篇；卡伦海水偏黄被多篇提醒，卡塔综合评价更高。"},{time:"17:15",name:"悬崖日落",detail:"海景餐厅看安达曼海落日；神仙半岛（2 篇）是备选日落点。"},{time:"20:00",name:"普吉老镇",detail:"5 篇路线帖覆盖的骑楼夜景与甜品；江西冷购物区（3 篇）可顺路。"}],food:"Mom Tri’s Kitchen 或 Blue Elephant。",tip:"把海景桌写进订位备注；夕阳时间前45分钟抵达。普吉打车贵，跳岛日选包接送团；住卡伦/卡塔看海，或芭东图热闹。"},
{day:7,date:"12月18日 周五",city:"普吉",title:"攀牙湾 · 海蚀洞",stops:[{time:"07:00",name:"码头集合",detail:"全天船程，提前吃早餐并备防晒。跳岛选中文导游、包接送（路线共识）。"},{time:"09:30",name:"攀牙湾",detail:"穿行石灰岩喀斯特群岛。"},{time:"11:30",name:"海蚀洞皮划艇",detail:"由向导带领穿过洞穴。"},{time:"14:00",name:"007岛",detail:"短暂停靠与观景。"}],food:"回岛后吃 Kan Eang@Pier 海鲜。",tip:"船班受海况影响；贵重物品放防水袋。出海穿沙滩袜，备晕船药；班赞海鲜市场（4 篇）当晚可去，狠砍价到三分之一。"},
{day:8,date:"12月19日 周六",city:"普吉",title:"皮皮岛 · 浮潜",stops:[{time:"06:30",name:"早船出海",detail:"尽量避开玛雅湾人潮。"},{time:"09:00",name:"玛雅湾",detail:"遵守海湾生态管制，以当日开放规则为准。"},{time:"11:00",name:"小皮皮岛浮潜",detail:"珊瑚与热带鱼水域；皇帝岛+珊瑚岛是路线帖另一高频跳岛线。"},{time:"17:00",name:"返回普吉",detail:"休息并整理次日行李。马杀鸡（4 篇）是回岛晚上的放松选项。"}],food:"晚餐选 PRU 或 Jampa，需预订。",tip:"不要把次日航班排太早，给海况延误留余量。丛林飞跃（3 篇）与西蒙秀（2 篇）可视体力插入海岛日。"},
{day:9,date:"12月20日 周日",city:"槟城",title:"飞槟城 · 世遗街区",stops:[{time:"11:30",name:"普吉退房，转场机场",detail:"直飞当天仅1班、无备选；提前3小时到 HKT。上午不排远点，酒店附近简单走走即可。"},{time:"14:35",name:"普吉飞槟城",detail:"马航 MH5455 14:35–16:35 直飞；Duffel实测当天仅1班，优先锁定，出票前重查。"},{time:"17:30",name:"姓氏桥",detail:"看百年水上聚落；4 篇路线帖共识：半小时足够。日落前后去，光线最好。"},{time:"19:00",name:"乔治市 City Walk",detail:"壁画街（7 篇）+爱情巷（4 篇）夜景；张弼士故居（蓝屋）日间导览赶不上，改到次日下午。"}],food:"Siam Road 炒粿条周日休，本日改吃汕头街甜品；深夜虾面认准 133A Jalan Burma 的 Green House。",tip:"乔治市核心区适合步行；中午炎热时安排室内博物馆。壁画文创普通，不必购买；蓝屋需预约。"},
{day:10,date:"12月21日 周一",city:"槟城",title:"升旗山 · 极乐寺 · 美食马拉松",stops:[{time:"07:30",name:"升旗山",detail:"5 篇路线帖覆盖；早班缆车上山空气凉爽，快速票值得买。"},{time:"10:30",name:"极乐寺",detail:"看万佛宝塔与观音像；太热可只在山脚拍照（路线帖共识）。"},{time:"13:30",name:"乔治市美食线",detail:"亚参叻沙、福建面、扁担饭分食；槟榔律叻沙人多需提前。"},{time:"15:30",name:"张弼士故居",detail:"蓝屋建筑与华商故事；日间导览需预约，约1小时。"},{time:"18:00",name:"海墘码头",detail:"看日落后回城；巴都丁宜海滩（五点半前到看日落）是备选。"}],food:"Air Itam Bisu Laksa 周一营业；Au Jardin 周一至周三休，本日晚餐优先 Auntie Gaik Lean’s（仅预约）。",tip:"街头美食按小份共享；星级餐厅与扫街不要排在同一餐。升旗山缆车与美食线是路线共识串法。"},
{day:11,date:"12月22日 周二",city:"吉隆坡",title:"双子塔 · 武吉免登",stops:[{time:"09:00",name:"飞吉隆坡",detail:"短途约1小时。"},{time:"13:30",name:"双子塔与KLCC",detail:"7 篇路线帖覆盖；先在公园找经典构图，再进观景层，观景票建议提前锁定时段。"},{time:"16:30",name:"武吉免登",detail:"Pavilion（5 篇）与精品店集中采购；吉隆坡塔（4 篇）可顺路。"},{time:"19:00",name:"亚罗街",detail:"烧鸡翅、沙爹与海鲜（5 篇路线帖覆盖）。"}],food:"Jalan Alor 只作夜市氛围与少量试吃；想坐得舒服可选 THIRTY8。",tip:"双子塔观景票建议提前锁定时段。住宿共识：武吉免登；MDAC 入境卡提前填，免签；Sky51 需预约，低销 100RM。"},
{day:12,date:"12月23日 周三",city:"吉隆坡",title:"黑风洞 · 多元文化",stops:[{time:"08:00",name:"黑风洞",detail:"避开正午攀爬272级彩色阶梯。"},{time:"11:30",name:"国家清真寺",detail:"留意开放时段与着装（4 篇路线帖覆盖）。"},{time:"14:00",name:"伊斯兰艺术博物馆",detail:"室内精品馆藏，避暑休整。"},{time:"17:00",name:"独立广场与茨厂街",detail:"独立广场（5 篇）、占美清真寺（5 篇，注意开放时间）与中央艺术坊（4 篇）同市区动线；茨厂街（6 篇）手信、工艺与唐人街。"}],food:"Dewakan 两星+绿星，但华人食客对大胆风味评价两极；备选 Beta / DC by Darren Chin。",tip:"Dewakan 是一次性大餐，至少提前一月询位。粉色清真寺（4 篇）距离远，时间不够可舍；路线共识串法是独立广场+清真寺+茨厂街同一动线。"},
{day:13,date:"12月24日 周四",city:"胡志明市",title:"飞胡志明 · 平安夜",stops:[{time:"08:30",name:"飞胡志明市",detail:"约2小时，入境预留时间。"},{time:"14:30",name:"滨城市场外观",detail:"8/10 篇路线帖覆盖；可换钱、买伴手礼，记得砍价；游客价争议多，不在此购物或随意吃喝。"},{time:"16:30",name:"咖啡公寓",detail:"9/10 篇路线帖覆盖：9 层 50 多家咖啡馆，电梯收费可消费抵扣；老楼咖啡馆看阮惠步行街。"},{time:"19:00",name:"西贡河晚餐",detail:"平安夜城市灯光；范五老街（8/10 篇）夜生活建议 21 点后，体力好可去。"}],food:"Anan Saigon；咖啡安排 The Workshop 或 Cong Caphe。",tip:"越南电子签需提前办理；平安夜餐厅和交通都会拥挤。住宿共识：第一郡最方便、景点步行可达。"},
{day:14,date:"12月25日 周五",city:"胡志明市",title:"城市历史 · 古芝地道",stops:[{time:"08:00",name:"统一宫",detail:"看1960年代建筑与历史现场（6/10 篇覆盖）。"},{time:"09:45",name:"战争遗迹博物馆",detail:"内容沉重，留足心理与参观时间。"},{time:"11:30",name:"粉红教堂与中央邮政局",detail:"粉红教堂 10/10 篇路线帖打卡；内部开放时间不稳定，出发前查谷歌地图，对面 GS25 二三楼 / cong cafe 是机位。中央邮政局 9/10 篇，8:00–18:00，可寄明信片，内部购买较贵。红教堂维修中，多篇确认勿跑空。"},{time:"13:30",name:"古芝地道",detail:"半日往返；优先选择游客较少的 Ben Duoc 小团，常规大巴多去 Ben Dinh。"}],food:"Pho Hoa Pasteur 与 Banh Mi Huynh Hoa。",tip:"古芝往返耗时，下午不要再塞复杂市内项目。胡志明美术馆（7/10 篇）周一闭馆，本日周五可去，黄墙拱形窗出片，可替换下午时段；离境日提前 3-4 小时到机场。"},
{day:15,date:"12月26日 周六",city:"富国岛",title:"飞富国岛 · 长滩",stops:[{time:"09:00",name:"飞富国岛",detail:"约1小时。"},{time:"13:30",name:"酒店海滩",detail:"泳池、沙滩与SPA恢复体力。"},{time:"17:30",name:"长滩日落",detail:"西海岸看日落；日落小镇（9/10 篇）傍晚有烟花秀，21:00（周二除外）。"},{time:"19:00",name:"富国岛夜市",detail:"阳东夜市（6/10 篇）；以小吃为主，海鲜先问清“1kg 多少钱”、盯着捞、拍视频，正餐去明码标价餐厅。"}],food:"Crab House 或 Xin Chao 海鲜。",tip:"岛上路程比地图观感长，入住后不跨岛。住宿共识：南部日落小镇方便看烟花坐缆车；中国公民免签但须直飞进出（转机需签证），不租摩托；落地签人多慢。"},
{day:16,date:"12月27日 周日",city:"富国岛",title:"浮潜 · 跨海缆车",stops:[{time:"08:00",name:"安泰群岛",detail:"手指岛、龟岛周边浮潜。"},{time:"12:30",name:"午餐与休整",detail:"码头附近简餐。"},{time:"14:00",name:"跨海缆车",detail:"9/10 篇路线帖覆盖的世界最长缆车；成人700,000、儿童550,000越南盾；早 9:30 或末班前避排队，11:30–13:30停运，按当日天气与维护调整。"},{time:"17:30",name:"日落小镇与烟花",detail:"日落小镇（9/10 篇）南法风情彩色建筑；kiss of the sea 烟花秀 21:00（周二除外）。"}],food:"回酒店后 Pink Pearl 高规格晚餐。",tip:"缆车运行受天气与维护影响，出发前确认当日状态。海星沙滩（7/10 篇）10 点前去、海星没想象中多、勿触摸；富国大世界建筑仿制感强、贡多拉排队长，可舍。"},
{day:17,date:"12月28日 周一",city:"富国岛",title:"度假日 · 岛味收官",stops:[{time:"09:00",name:"酒店慢早餐",detail:"把长线旅行中唯一的完整慢晨留给海岛。"},{time:"11:00",name:"泳池与SPA",detail:"不排刚性项目；Tina's house and spa 被路线帖避雷。"},{time:"15:00",name:"海岛机动时段",detail:"优先补海况延误或继续酒店休息；胡椒园/鱼露工厂缺少已核实点位，不列正式项目。"},{time:"17:30",name:"海边告别晚餐",detail:"悬崖或沙滩日落位；on the rock 日落餐厅需预订。"}],food:"On the Rocks 或 Regent Ocean Club。",tip:"如果前两天海况不佳，这天可作为出海机动补位。日落小镇=越南横店，空置率高、餐厅质素普通，逛逛即可（路线共识）。"},
{day:18,date:"12月29日 周二",city:"新加坡",title:"飞新加坡 · 滨海湾",stops:[{time:"07:30",name:"富国岛飞新加坡",detail:"Duffel实测有3个直飞结果（越捷／Scoot，Scoot由Hahn Air出票）；选早班直飞，出票前重查时刻。"},{time:"15:30",name:"鱼尾狮公园",detail:"10/10 篇路线帖地标必打卡；建议早上避开旅行团，本日下午到人会多。"},{time:"17:00",name:"滨海湾花园",detail:"9/10 篇路线帖覆盖；云雾森林强烈推荐，下午去逛完等开灯，温室是雨天可靠备份。"},{time:"19:45",name:"擎天树灯光秀",detail:"超级树夜晚灯光秀（9/10 篇）；研究快照记录场次为19:45/20:45，出发前再确认。"}],food:"Maxwell 熟食中心或 Jumbo 辣椒蟹。",tip:"12月多阵雨；把室内温室与ArtScience作为弹性替换。地铁为主，EZ-Link 卡或 Visa 信用卡直接刷，一人一卡（不能两人共用）；新加坡地铁不能用支付宝，打车贵。"},
{day:19,date:"12月30日 周三",city:"新加坡",title:"圣淘沙亲子日",stops:[{time:"09:00",name:"环球影城",detail:"全天主项目；Minion Land 于2025年2月开放。路线共识：环球影城为最小环球，去过其他的可不去。"},{time:"15:30",name:"Singapore Oceanarium",detail:"原S.E.A.海洋馆，2025年7月扩建更名。路线帖 SG1：海洋馆不如国内，视体力决定。"},{time:"18:30",name:"圣淘沙海滩",detail:"看落日后回城；天际线斜坡滑车、时光之翼是路线帖备选。"},{time:"20:00",name:"怡丰城",detail:"晚餐与补给。"}],food:"园内简餐，晚餐回市区吃 Song Fa 肉骨茶。",tip:"两大项目同日密度高；带娃时优先环球影城，海洋馆视体力决定。圣淘沙（8/10 篇）可替换为旧禧街警察局+福康宁公园市区线。"},
{day:20,date:"12月31日 周四",city:"新加坡",title:"多元街区 · 星耀樟宜 · 返程",stops:[{time:"08:30",name:"牛车水",detail:"佛牙寺与骑楼晨逛（8/10 篇）；佛牙寺需着装得体。旧禧街警察局（8/10 篇）上午光线最好，可同动线串联。"},{time:"10:30",name:"小印度或乌节路",detail:"文化街区与最后采购二选一；小印度（6/10 篇）看好随身物品，别去偏僻小巷。哈芝巷（7/10 篇）店铺开门晚，10 点后去。"},{time:"14:00",name:"Jewel 星耀樟宜",detail:"40米雨漩涡与室内花园（7/10 篇）。"},{time:"17:00",name:"办理离境",detail:"按国际航班要求预留时间。"}],food:"Ya Kun 早餐（路线共识：亚坤早餐是新加坡高频早餐选择）；离境前在机场完成最后一餐。",tip:"把Jewel放在安检前；跨年航班务必复核航站楼与值机时间。福康宁公园树洞（8/10 篇）蚊虫多，需驱蚊水；物价贵，餐厅另加约 19% 税费服务费。"}
];


const checked='公开资料与旅行者反馈研究快照 · 2026-09-12；小红书城市经典路线帖（每城10篇，2026-09-15 实读）已用于本行程编排；逐项（每项≥10篇）严格核验仍在进行';
const H=(name:string,city:string,meta:string,detail:string,best:string,hotelGroup:HotelGroup='Other',brand?:string,loyaltyProgram?:Item['loyaltyProgram'],officialUrl?:string):Item=>({name,city,meta,detail,best,source:checked,hotelGroup,brand,loyaltyProgram:loyaltyProgram||(hotelGroup==='Marriott'?'Marriott Bonvoy':hotelGroup==='Hyatt'?'World of Hyatt':'不适用'),officialUrl,officialCheck:officialUrl?'官方酒店页核验 · 2026-09-13':undefined});
export const hotelCityChecks:HotelCityCheck[]=[
 {city:'曼谷',dates:'12/12–14',checked:'2026-09-13',choices:[
  {group:'Marriott',hotel:'The Ritz-Carlton, Bangkok',brand:'The Ritz-Carlton',loyaltyProgram:'Marriott Bonvoy',officialUrl:'https://www.marriott.com/offers/extended-moments-OFF-160475/BKKRB-the-ritz-carlton-bangkok',status:'verified',note:'官方页面确认酒店位于 189 Wireless Road；按万豪奢华品牌层级列为本城顶级选择。'},
  {group:'Hyatt',hotel:'Park Hyatt Bangkok',brand:'Park Hyatt',loyaltyProgram:'World of Hyatt',officialUrl:'https://www.hyatt.com/park-hyatt/en-US/bkkph-park-hyatt-bangkok',status:'verified',note:'官方酒店页确认在营，位于 Central Embassy。'}]},
 {city:'清迈',dates:'12/15–16',checked:'2026-09-13',choices:[
  {group:'Marriott',hotel:'Chiang Mai Marriott Hotel',brand:'Marriott Hotels',loyaltyProgram:'Marriott Bonvoy',officialUrl:'https://www.marriott.com/en-us/hotels/cnxmc-chiang-mai-marriott-hotel/overview/',status:'verified',note:'官方页确认 Night Bazaar 位置及在营状态；为当前官方检索到的本城万豪系顶级选择。'},
  {group:'Hyatt',hotel:null,brand:null,loyaltyProgram:'World of Hyatt',officialUrl:'https://www.hyatt.com/promo/hotels-southeast-asia?src=adm_pfx_corp_apac_facebook_resorts_summer_cv_2017',status:'not-found',note:'截至核验日，Hyatt 官方站点检索未找到清迈在营酒店；不以曼谷或普吉酒店替代，订房前复核。'}]},
 {city:'普吉',dates:'12/17–19',checked:'2026-09-13',choices:[
  {group:'Marriott',hotel:'The Naka Island, a Luxury Collection Resort & Spa, Phuket',brand:'The Luxury Collection',loyaltyProgram:'Marriott Bonvoy',officialUrl:'https://www.marriott.com/en-us/hotels/pyxlc-the-naka-island-a-luxury-collection-resort-and-spa-phuket/overview/',status:'verified',note:'官方页确认 Luxury Collection 品牌与 Naka Yai Island 位置；需快艇接驳。'},
  {group:'Hyatt',hotel:'Hyatt Regency Phuket Resort',brand:'Hyatt Regency',loyaltyProgram:'World of Hyatt',officialUrl:'https://www.hyatt.com/pt-PT/hotel/thailand/hyatt-regency-phuket-resort/phuhr',status:'verified',note:'官方酒店页确认在营，位于 Kamala；纠正“普吉没有 Hyatt”的旧判断。'}]},
 {city:'槟城',dates:'12/20–21',checked:'2026-09-13',choices:[
  {group:'Marriott',hotel:'Penang Marriott Hotel',brand:'Marriott Hotels',loyaltyProgram:'Marriott Bonvoy',officialUrl:'https://www.marriott.com/en-us/hotels/penmc-penang-marriott-hotel/overview/?scid=f2ae0541-1279-4f24-b197-a979c79310b0',status:'verified',note:'官方页确认 Gurney Drive / 55 Persiaran Gurney 及在营状态。'},
  {group:'Hyatt',hotel:null,brand:null,loyaltyProgram:'World of Hyatt',officialUrl:'https://www.hyatt.com/promo/hotels-southeast-asia?src=adm_pfx_corp_apac_facebook_resorts_summer_cv_2017',status:'not-found',note:'截至核验日，Hyatt 官方站点检索未找到槟城在营酒店；不以关丹等异地酒店替代，订房前复核。'}]},
 {city:'吉隆坡',dates:'12/22–23',checked:'2026-09-13',choices:[
  {group:'Marriott',hotel:'The Ritz-Carlton, Kuala Lumpur',brand:'The Ritz-Carlton',loyaltyProgram:'Marriott Bonvoy',officialUrl:'https://www.marriott.com/en-us/destinations/malaysia/kuala-lumpur/ev-charging-hotels.mi',status:'verified',note:'万豪官方目的地页将其列为 Golden Triangle 五星酒店；按奢华品牌层级列为本城顶级选择。'},
  {group:'Hyatt',hotel:'Park Hyatt Kuala Lumpur',brand:'Park Hyatt',loyaltyProgram:'World of Hyatt',officialUrl:'https://www.hyatt.com/park-hyatt/en-US/kulph-park-hyatt-kuala-lumpur',status:'verified',note:'官方酒店页与 2025-08-07 开业公告确认已在营。'}]},
 {city:'胡志明市',dates:'12/24–25',checked:'2026-09-13',choices:[
  {group:'Marriott',hotel:'JW Marriott Hotel & Suites Saigon',brand:'JW Marriott',loyaltyProgram:'Marriott Bonvoy',officialUrl:'https://www.marriott.com/en-us/hotels/sgnjs-jw-marriott-hotel-and-suites-saigon/overview/',status:'verified',note:'官方页确认 305 间客房与套房、260 间公寓及在营状态。'},
  {group:'Hyatt',hotel:'Park Hyatt Saigon',brand:'Park Hyatt',loyaltyProgram:'World of Hyatt',officialUrl:'https://www.hyatt.com/park-hyatt/en-US/saiph-park-hyatt-saigon',status:'verified',note:'官方酒店页确认 245 间客房及 Lam Son Square 位置。'}]},
 {city:'富国岛',dates:'12/26–28',checked:'2026-09-13',choices:[
  {group:'Marriott',hotel:'JW Marriott Phu Quoc Emerald Bay Resort & Spa',brand:'JW Marriott',loyaltyProgram:'Marriott Bonvoy',officialUrl:'https://marriott.com/en-us/hotels/pqcjw-jw-marriott-phu-quoc-emerald-bay-resort-and-spa/overview',status:'verified',note:'官方页确认 Khem Beach、JW Marriott 品牌与在营状态。'},
  {group:'Hyatt',hotel:null,brand:'Park Hyatt（即将开业）',loyaltyProgram:'World of Hyatt',officialUrl:'https://www.hyatt.com/en-US/promo/hotels-in-vietnam?src=corp_aspac_en_disp_ao_dv360_dirresp_rmkweb_banner_cm_evergreen&dclid=CN6F4IGEqJADFVwYewcdJ2cEMw&gad_source=7&gclid=EAIaIQobChMI4oXp8YOokAMV317CBR1ffyxUEAEYASAAEgK5O_D_BwE',status:'coming-soon',note:'Hyatt 官方越南酒店列表把 Park Hyatt Phu Quoc 标为 Coming Soon；截至核验日不能当作在营酒店。'}]},
 {city:'新加坡',dates:'12/29–31',checked:'2026-09-13',choices:[
  {group:'Marriott',hotel:'The Singapore EDITION',brand:'EDITION',loyaltyProgram:'Marriott Bonvoy',officialUrl:'https://www.marriott.com/en-us/hotels/sineb-the-singapore-edition/rooms/suites/',status:'verified',note:'官方页确认 EDITION 奢华品牌与在营套房；列为可参与 Bonvoy 的顶级选择。丽思卡尔顿美年不参与 Bonvoy，故不作为本栏主选。'},
  {group:'Hyatt',hotel:'Andaz Singapore',brand:'Andaz',loyaltyProgram:'World of Hyatt',officialUrl:'https://www.hyatt.com/andaz/en-US/sinaz-andaz-singapore',status:'verified',note:'官方酒店页确认在营、5 Fraser Street 与奢华生活方式定位；按品牌层级列为本城顶级选择。'}]}
];
export const hotels:Item[]=[
H('曼谷文华东方','曼谷','湄南河畔 · 1876年开业','河畔历史酒店；2026年馆内 Anne-Sophie Pic at Le Normandie 为米其林二星。服务评价并非一致，亦有设施老化、浴室偏小与服务落差反馈。','介意硬件年代感或服务评价分化者先比较新酒店房型。'),
H('Capella Bangkok','曼谷','湄南河畔 · 河景客房与别墅','河景、Living Room 与接驳船受赞。部分评价提到空调噪音、低楼层景观受泡池遮挡及早餐选择偏少。','优先高楼层河景房，并在订房时确认噪音与景观遮挡。'),
H('Aman Nai Lert Bangkok','曼谷','Chidlom · 2025年开业','位于 Nai Lert Park 七英亩绿地，共52间套房及约1,500㎡康养中心；属于新开业、早期评价优秀，不能等同长期口碑。','适合重视私密与康养者；旺季尽早锁定可取消价。'),
H('Four Seasons Bangkok','曼谷','湄南河畔 · 城市度假型酒店','2025全球奢华酒店榜单样本中排名靠前；与嘉佩乐是不同取向。小红书反复提醒曼谷有同名四季住宿，预订时最容易订错。','务必确认预订的是湄南河畔酒店；适合把泳池、河岸与城市观光结合。'),
H('The Siam','曼谷','Dusit老城河畔 · Bill Bensley设计','酒店兼具度假空间与私人博物馆氛围，公共区域与古董收藏突出；房间宽敞，但远离BTS，日常出行主要依赖酒店船与打车。','适合愿意宅酒店和慢游老城的人；密集市中心行程不建议住这里。'),
H('137 Pillars House','清迈','Wat Gate · 1880年代宅邸','30间套房围绕1880年代殖民柚木宅邸；历史氛围突出。需留意蚊虫、偶有噪音、泳池较小及躺椅有限。','选安静房位并备防蚊用品。'),
H('Four Seasons Resort Chiang Mai','清迈','Mae Rim · 独立度假目的地','稻田、水疗与服务口碑强，但距古城较远，不适合每天往返；亦有虫咬与主泳池水偏冷反馈。','适合安排完整宅酒店日，而非古城密集游览。'),
H('Raya Heritage','清迈','Mae Rim / Don Kaeo · 郊区设计酒店','适合宅酒店与摄影；位置不便、周边餐饮少且虫多，部分房型与公共区域观感可能和宣传图有落差。','先确认房型实拍与接送安排。'),
H('Amanpuri','普吉','Pansea Beach · 1988年开业','安缦首家度假村，私人白沙滩与椰林见长；圣诞与新年是旺季，常客集中回访。','12月务必提前预订。'),
H('Trisara','普吉','西北海岸 · 私密泳池别墅','约39栋别墅及住宅区、私人海滩，PRU餐厅在内；适合安静度假。','若想把PRU与酒店体验合并，这是最顺的选择。'),
H('Banyan Tree Phuket','普吉','Laguna Bang Tao · 家庭别墅','1994年开业的首家悦榕庄；双卧泳池别墅和儿童俱乐部适合家庭。部分2026住客提到设施老化、偶发跳电、等车久及早餐选择有限。','旺季避开早餐高峰，并预留园区接驳时间。'),
H('Eastern & Oriental Hotel','槟城','10 Lebuh Farquhar · 1885年开业','海峡殖民历史酒店，海景套房与乔治市位置是主要卖点。','优先确认海景翼别与翻新状态。'),
H('Cheong Fatt Tze Mansion','槟城','14 Lebuh Leith · 18间客房','蓝屋庭院、历史感和拍照体验突出；住客评价多次提到隔音一般。','想住历史建筑可选，浅眠者先确认安静房位。'),
H('The Prestige Hotel Penang','槟城','8 Gat Lebuh Gereja · 世遗核心区','162间房的设计酒店，步行探索方便；房间不算大，淋浴间布局较特别。','更适合情侣与年轻旅客，订前查看浴室布局。'),
H('Mandarin Oriental Kuala Lumpur','吉隆坡','KLCC · 位置型经典酒店','紧邻双子塔与公园，服务仍是强项；但2026评价多次提到硬件偏旧、维护与早餐反馈分化。','按具体房型确认塔景；重视新硬件可比较Park Hyatt或EQ。'),
H('Park Hyatt Kuala Lumpur','吉隆坡','Merdeka 118 75–114层 · 2025年8月开业','位于Merdeka 118的75–114层，已于2025年8月开业；252间客房及30米泳池。','适合新酒店与高空景观偏好，避免使用未经证实的高度排名。','Hyatt','Park Hyatt','World of Hyatt','https://www.hyatt.com/park-hyatt/en-US/kulph-park-hyatt-kuala-lumpur'),
H('Four Seasons Kuala Lumpur','吉隆坡','双子塔旁 · 位置优先','靠近KLCC且有家庭房型，但2026年卫生、设施和服务评价分化；并非所有房型都有塔景。','按房型图确认景观，不以未证实的无遮挡角度作为订房依据。'),
H('Park Hyatt Saigon','胡志明市','2 Lam Son Square · 245间客房','老牌奢华酒店，园景泳池与服务稳定；“服务第一”和“圣诞装饰出名”均无充分依据。','想要稳妥位置与经典风格可优先。','Hyatt','Park Hyatt','World of Hyatt','https://www.hyatt.com/park-hyatt/en-US/saiph-park-hyatt-saigon'),
H('The Reverie Saigon','胡志明市','Times Square · LHW成员','意式巴洛克极致奢华风，审美明显两极；高层景观和服务是强项，也有临街夜间噪音反馈。','先看官网或OTA实拍；怕吵者要求高楼层、远离夜店一侧。'),
H('Caravelle Saigon','胡志明市','19–23 Lam Son Square · 1959年开业','1959年圣诞前夜开业，曾是国际战地记者据点；位置与历史突出，但设施有年头。','重历史与位置可选，追求新奢硬件则比较Park Hyatt或Reverie。'),
H('JW Marriott Phu Quoc','富国岛','Khem Beach · Bill Bensley设计','法式学院主题和设计感突出；位置偏南、离阳东镇约30分钟，酒店餐饮昂贵，旺季服务可能波动。','适合以酒店和南岛为主；外出用Grab，餐厅提前预订。','Marriott','JW Marriott','Marriott Bonvoy','https://marriott.com/en-us/hotels/pqcjw-jw-marriott-phu-quoc-emerald-bay-resort-and-spa/overview'),
H('Regent Phu Quoc','富国岛','Long Beach · 潟湖泳池别墅','现代奢华、儿童俱乐部和早餐口碑强；雨季有潮湿反馈，旺季活动名额少且服务可能波动。','入住第一天预约活动；房型人数限制与加床政策先确认。'),
H('New World Phu Quoc','富国岛','Khem Beach · 泳池别墅','Rosewood集团旗下新世界品牌；白沙滩与性价比突出，但2026评价显示服务和维护稳定性有波动。','对服务稳定性敏感者优先JW或Regent。'),
H('Capella Singapore','新加坡','Sentosa · 私密度高','雨林与别墅式度假氛围，离市中心较远，进城依赖车辆或接驳。','适合圣淘沙段宅酒店；城市观光日需留交通时间。'),
H('Raffles Singapore','新加坡','City Hall · 1887年开业','2026年为开业139周年；庭院、Long Bar和管家服务受赞，白天游客打卡多。适合看重历史氛围与服务者。','重历史体验可选；想安静可避开Long Bar一侧。'),
H('Marina Bay Sands','新加坡','Marina Bay · 57层泳池','适合地标体验与城市天际线，不是强亲子酒店：无儿童俱乐部，旺季也有延迟入住反馈。','房型需区分滨海湾城市天际线景与花园景。')
];

const R=(name:string,city:string,meta:string,detail:string,best:string):Item=>({name,city,meta,detail,best,source:checked});
export const restaurants:Item[]=[
R('Sorn','曼谷','2026米其林三星 · 泰南菜','泰国两家三星之一；预约极难、口味偏辣、份量较足。未核实的具体菜名已删除。','尽早关注官方订位规则。'),
R('Sühring','曼谷','2026米其林三星 · 现代德国菜','双胞胎主厨在庭院别墅呈现现代德国菜，2026已升三星；近期评价从“最强”到严重失望，升星后体验方差需要正视。','先看当季菜单与份量，接受德餐风格和口碑分化再订。'),
R('Gaggan','曼谷','2026-05-29翻新重开 · No Phone','现址为68 Sukhumvit 31，不是Langsuan旧址；表演式长菜单并执行禁用手机政策。价格高，主厨旗下多店，订位时必须核对店名与地址。','接受No Phone与高预算再订；不要使用旧地址。'),
R('Nahm','曼谷','COMO Metropolitan · 现代泰餐','长期米其林餐厅，但近期公开评价与小红书体验并非一致，既有展示帖也有明确避坑帖。','先看当季菜单和近期口碑，不把历史奖项等同当晚体验。'),
R('Le Du','曼谷','2026米其林一星 · 现代泰餐','泰国食材与西式技法结合；创意、桌距与组合评价分化。','不要把它视为无争议“开创者”。'),
R('Nusara','曼谷','2026米其林一星 · 老城屋顶景','从厨房到屋顶再到餐厅的渐进式体验，主要景观为Wat Pho与老城屋顶，并非湄南河畔老宅。','提前订位并预留完整晚餐时段。'),
R('Potong','曼谷','2026米其林一星 · 泰中融合','唐人街家族中药铺改造的多层体验；与其搭电梯，逐层步行更完整。','高峰提前数月订；删除名人背书式营销。'),
R('Jay Fai','曼谷','2026米其林一星 · 传奇打卡','仍营业，但四菜近5,000泰铢、除蟹肉蛋卷外偏咸等评价使性价比争议大；本人是否每天掌勺未完全确认。','只作传奇打卡，非必吃；营业与预约规则行前查官方。'),
R('Côte by Mauro Colagreco','曼谷','2026米其林二星 · 地中海料理','河景、日落与服务受赞；套餐时间长、份量可能偏多，也有缺少惊喜的评价。','预留完整晚餐时段。'),
R('Thipsamai','曼谷','313–315 Mahachai Road · 历史炒河粉店','游客热门，口味偏甜；原店较有锅气，橘汁按时价可能偏贵。','现行近况依据有限，出发前查营业时间。'),
R('耀华力夜市 / T&K','曼谷','唐人街扫街 · 非代表性正餐','T&K综合评价分化，烤大虾和海鲜粉丝煲较受支持；环境吵、楼梯陡。','作为扫街一站，不把鱼翅汤或咖喱蟹包装成唯一必点。'),
R('Or Tor Kor Market','曼谷','高品质市场 · 价格较高','农产品与熟食丰富，但明显比普通市场贵。','只买明码标价商品。'),
R('Kiti Panit','清迈','Tha Phae Road · 兰纳菜','1888年前后的中国商号/家族宅邸；不在Wat Gate。','按招牌单点更稳，谨慎对待推销的昂贵套餐。'),
R('Khao Soi Khun Yai','清迈','周一至周六10:00–14:00 · 周日休','先点单付款拿号；牛肉口味及全店可能午后售罄。','10:00到，最迟11:00前。'),
R('Huen Phen','清迈','老牌泰北菜 · 现行必比登未证实','午餐区与晚餐古董宅是相距约20米的不同空间；口味与服务评价分化。','按用餐时段找对入口。'),
R('Khao Kha Moo Chang Phueak','清迈','昌卜门 / 北门 · 猪脚饭','标志性摊主是牛仔帽女士；不应写成长柄门或“爷爷”。','作为夜市一站，不用“全城最好”绝对化。'),
R('SP Chicken','清迈','10:00–17:00 · 常提前售罄','烤鸡外脆多汁，午餐常排20–30分钟；鸡只偏小，鸡胸偶尔偏干。','早去，并搭配酱料、青木瓜沙拉。'),
R('Tong Tem Toh','清迈','宁曼路 · 开放式无空调','方便、价格合理，但口味偏温和；晚餐排队，烤猪肉可能偏干。','定位为方便型选择，不作绝对排名。'),
R('Dash! Restaurant','清迈','只收现金 · 建议预约','柚木宅氛围稳定；周一至周六约10:00–14:00、17:30–21:30，周日营业待确认，辣度也可能不稳定。','备现金；周日先确认。'),
R('Ginger Farm Kitchen','清迈','One Nimman · 商场方便餐','环境舒适、菜单完整，但口味偏游客化、价格偏高。','适合低风险方便餐，不作地道程度的绝对判断。'),
R('PRU','普吉','2026米其林一星+绿星 · Trisara','普吉现行唯一一星；5/7道菜单约4,500++/5,500++泰铢。','18:30场可看日落，必须提前预订。'),
R('Jampa','普吉','2026米其林绿星 · Thep Krasattri','农场到餐桌与柴火料理；有4道午餐和7道体验。','提前预约并留出北部交通时间。'),
R('Blue Elephant','普吉','米其林指南推荐 · 非星级','位于20世纪初锡矿总督老宅，兼设烹饪学校。','不使用“米其林星级”表述。'),
R('Raya','普吉','普吉老镇 · 泰南菜','蟹肉咖喱米粉与普吉炖五花肉受欢迎；泰南口味很辣。','点餐明确要求mild。'),
R('Tu Kab Khao','普吉','米其林必比登 · 8 Phangnga Rd','120年中葡老宅，11:00–21:00；高峰需等位。','认蓝钻大龙虾标志并提前预约。'),
R("Mom Tri's Kitchen",'普吉','12 Kata Noi Road · 日落餐厅','景观和700+酒单是卖点；菜量偏小、价格高。','17:30左右到，为景观与氛围买单。'),
R('Suay','普吉','16:00–23:00 · Cherng Talay','创意泰餐，近Bang Tao/Surin；部分日期现场音乐较吵。','介意噪音可选工作日。'),
R('Acqua','普吉','Kalim路边 · 现代意大利餐','米其林指南收录，但没有海景；双人约8,000泰铢，另加约17%税服费。','不要按“海景餐厅”预订。'),
R('Kan Eang@Pier','普吉','Chalong码头 · 海鲜','1973年起经营，约10:00–23:00；炸海苔虾和蓝泳蟹咖喱受欢迎。','日落前到。'),
R('Roti Taew Nam','普吉','07:00–12:00 · 早餐','炭火煎饼，排队且午前结束；室内炭火味重，奶茶很甜。','早到并优先坐室外。'),
R('Siam Road Char Kway Teow','槟城','必比登 · 周二至周六12:00–18:30','周日周一休；每份炭火现炒，高峰排1–2小时。','13:30后通常相对快。'),
R('Air Itam Bisu Laksa','槟城','10:00–17:00 · 周二周三休','聋哑摊主经营，汤底清亮、姜花香明显；别与街角周末网红店混淆。','点餐耐心，确认开店日。'),
R('888 Hokkien Mee（Three Road）','槟城','67-A, Lebuh Presgrave · 米其林指南收录','虾汤以鲜甜浓郁见长，可加烧肉或卤排骨；公开评价也反复提醒排队、闷热与份量偏小。','15:00开门前后到，备现金；不要再导航至旧址。'),
R('Penang Road Teochew Chendul','槟城','10:00–19:30 · 煎蕊','槟城潮州煎蕊代表店。','避开午后最热与旅行团高峰。'),
R('Hameediyah','槟城','164 Lebuh Campbell · 1907年创立','老牌nasi kandar，排队移动快；banjir混合咖喱很辣且分量大。','不吃辣说no banjir，两人可分食。'),
R('Nasi Kandar Line Clear','槟城','177 Jalan Penang · 营业时间待复核','以24小时营业著称，但缺少官方闭环；海鲜按市价。','行前确认时间，海鲜先问价。'),
R('Au Jardin','槟城','2026米其林一星 · RM630++','周四至周日11:30–14:00/17:15–22:00；仅18席，2026 Asia’s 50 Best第39。','提前预约；周一至周三休。'),
R("Auntie Gaik Lean's",'槟城','2026米其林一星 · 1 Lebuh Bishop','周三至周日12:00–14:30/18:00–21:30；不接walk-in，座位少且较吵。','通过官方WhatsApp预约并确认人数。'),
R('CEKI Nyonya','槟城','娘惹菜备选 · 口碑分化','价格、推销与菜品稳定性评价分化；“Nat Geo榜单”无依据。','仅作Auntie Gaik Lean约不到时备选，海鲜先问价。'),
R('Green House Prawn Mee','槟城','133A Jalan Burma · 09:30–次日01:30','深夜档与223号Old Green House是两家店；后者15:00–23:45、周日休。','认准地址，点虾面优于卤面。'),
R('Dewakan','吉隆坡','2026米其林二星+绿星 · 48层','马来西亚现行唯一二星并有绿星；服务好评多，但华人食客对发酵、本地香草和大胆风味评价严重两极。','不是大众安全牌，先看菜单再订。'),
R('Beta KL','吉隆坡','2026米其林一星 · 马来西亚主题菜单','服务、菜品与鸡尾酒获赞，可照顾无麸质需求；酒水搭配酒精量较大。','提前说明饮食限制。'),
R('DC by Darren Chin','吉隆坡','2026米其林一星 · 法餐技法+本地食材','主厨强调使用本地优质食材，并非刻意把法餐“马来化”；价格高。','为完整品鉴预留预算与时间。'),
R('Nadodi','吉隆坡','南印度+斯里兰卡风味 · 品鉴菜单','约10道、约3小时；停车难、价格高，个别菜评价不稳。','预留交通和完整晚餐时间。'),
R('Chim by Chef Noom','吉隆坡','2026米其林一星 · 高端品鉴菜单','服务与摆盘受赞，菜品稳定性评价分化。','人均价格待官方菜单确认，不标低价。'),
R('Jalan Alor','吉隆坡','18:00–次日01:00 · 夜市氛围','适合热闹气氛和少量试吃，不作为最佳地道正餐。','先看价格，注意扒手与卫生。'),
R('Lot 10 Hutong','吉隆坡','10:00–22:00 · LG层','集合金莲记、颂记、津记和何荣记；略贵于街边但有空调。','11:00前或19:00后避峰，带现金。'),
R('Gulainya','吉隆坡','2026新获必比登 · 娘惹菜','位于Segambut，菜系为Peranakan，并非泛称马来家常菜。','具体菜品小红书依据不足，按官方菜单点。'),
R('Village Park','吉隆坡','知名椰浆饭 · 常排15–20分钟','炸鸡椰浆饭是招牌，是KL/PJ最知名选择之一，不作唯一排名。','建议早到。'),
R('THIRTY8','吉隆坡','Grand Hyatt 38层 · 下午茶','下午茶约12:00–17:00；2026价格工作日RM138/人、周末RM168/人，smart casual。','建议预订并确认窗边位。'),
R('Anan Saigon','胡志明市','2023胡志明市首家一星 · 2026继续保星','提前数周邮件预订通常可行，不应渲染成绝对难订。','地址89 Ton That Dam；以官网菜单为准。'),
R('Pot au Pho','胡志明市','Anan楼上 · 高端现代河粉概念','约US$100/人；2026营业状态缺少直接闭环，未经证实的具体菜名已删除。','出发前确认是否仍营业。'),
R('Cuc Gach Quan','胡志明市','10 Dang Tat · 老宅家常菜','锦鲤池与家常越菜受欢迎；内部台阶较多。','腿脚不便者慎选。'),
R('The Deck Saigon','胡志明市','Thao Dien · 日落酒水体验','河景氛围强，食物性价比与服务评价分化；不是必吃fine dining。','17:15–17:30前落座河边位。'),
R('Pho Hoa Pasteur','胡志明市','260C Pasteur · 06:00–22:30','老牌河粉店，汤清、分量大；“1968年”缺少直接依据。','晚餐可能等位。'),
R('Banh Mi Huynh Hoa','胡志明市','26 Lê Thị Riêng · 约60k+越南盾','料多、黄油蛋黄酱重，口味两极且容易腻。','建议两人分一个，价格以现场为准。'),
R('Com Tam Ba Ghien','胡志明市','必比登 · 84 Dang Van Ngu','08:00–20:30，炭烤猪排与大份量受欢迎；店内较热。','早去避排队。'),
R('The Workshop Coffee','胡志明市','27 Ngo Duc Ke二层 · 精品咖啡','多种冲煮方式；“百年老楼”无依据，入口楼梯较陡。','作为第一郡顺路休息。'),
R('Cong Caphe','胡志明市','连锁咖啡 · 椰子咖啡','适合逛累后顺路坐，不包装成独家目的地。','粉红教堂对面分店上午光线较好。'),
R('Pink Pearl','富国岛','18:00–22:00 · 六道菜约HK$1,427/人','需满10岁、smart casual、禁沙滩装和人字拖，需预约并可能另加税服。','提前预约并确认八道菜等其他菜单。'),
R('Tempus Fugit','富国岛','JW万豪全日餐厅 · 早餐06:30–10:30','早餐口碑不错，成人约900,900越南盾；不采用未经证实的早餐排名。','住店外客先确认价格与预约。'),
R('Crab House','富国岛','26 Nguyen Trai · 11:00–22:00','Combo份量很大；人均约¥300–550，双人一份套餐常吃不完。','选medium辣度并控制份量。'),
R('Xin Chao Seafood','富国岛','66 Tran Hung Dao · 日落海鲜','11:00–21:30，常排15–20分钟；海鲜按时价且有偏贵反馈。','日落前30分钟订临海位，点单先问价。'),
R('Bun Quay Kien Xay','富国岛','Bạch Đằng街 · 搅拌粉','小卷米粉与现调蘸料是岛上特色；28号门牌尚未独立闭环。','以现场导航为准。'),
R('Dinh Cau Night Market','富国岛','约16:30–深夜 · 小吃','适合椰子冰、烤鱿鱼等；海鲜排档价格与品质风险高。','海鲜大餐去明码标价餐厅，烤海胆扇贝先问价。'),
R('Ham Ninh 渔村','富国岛','高脚屋海鲜 · 先确认时价','蟹个头不大但肉紧甜；游客区仍需在称重前确认价格。','选择明码标价店。'),
R('On the Rocks','富国岛','Ong Lang · 悬崖日落','11:00–22:00；人均¥200–400仅为参考，缺少直接价源。','价格以现场菜单为准。'),
R('Ocean Club','富国岛','Regent · 主菜约£25起','龙虾卷、泳池与海滩氛围受赞。','适合住店日午餐。'),
R('Odette','新加坡','2026米其林三星 · National Gallery','翻新后仍保三星，口碑极高但非零差评；具体价格缺少本轮直接来源。','价格以预订时官网菜单为准。'),
R('Burnt Ends','新加坡','2026米其林一星 · 柴火烧烤','属于全城最难订之一，名额有限且不接受walk-in。','按官方放位节奏抢订。'),
R('Candlenut','新加坡','2026米其林一星 · Dempsey','2016–2026连续获星，世界首家获米其林星的娘惹餐厅；评价并非一边倒。','提前预约。'),
R('Labyrinth','新加坡','2026米其林一星 · Esplanade Mall','地址8 Raffles Ave #02-23；创意叙事强，部分食客认为重形式，口味两极。','先看当季菜单再决定。'),
R('Jumbo Seafood','新加坡','Riverside Point · 30 Merchant Rd','东海岸老店已于2026-09-30关闭，仅推荐仍营业的Riverside Point。螃蟹按重量计价。','下单前确认总价；辣椒蟹口味可与No Signboard/Long Beach比较。'),
R('Song Fa','新加坡','肉骨茶 · 人均约S$20','可续汤；总店无冷气，午晚餐尖峰排队。','怕热或带长辈可选商场分店。'),
R('Maxwell Food Centre','新加坡','熟食中心 · Tian Tian / Ah Tai并列','先占座再点餐；想吃招牌排Tian Tian，想省时可试Ah Tai。','不再断言Ah Tai的主厨履历。'),
R('Old Airport Road','新加坡','熟食中心 · 多摊取舍','Lao Fu Zi #01-12为必比登；Dong Ji #01-138一人作业、10:00–14:00，排队常更久。','按队伍与营业时间取舍。'),
R('Hill Street Tai Hwa','新加坡','2026唯一星级小贩 · 466 Crawford Lane','排队通常30–60分钟；勿与名称相似Tai Wah分店混淆。','早到但不保证短队。'),
R('328 Katong Laksa','新加坡','游客友好经典 · 分店地址待确认','剪短面条只用勺子吃；游客多、价格偏高，具体分店地址来源冲突。','并列考虑Janggut（更本地）或Sungei Road（炭火传统）。'),
R('Ya Kun Kaya Toast','新加坡','连锁早餐 · Far East Square老店','咖椰吐司、半熟蛋与咖啡/茶是经典组合。','想要老店氛围去Far East Square，图方便选就近分店。'),
R('Lau Pa Sat','新加坡','19:00后沙爹街 · 周末假日15:00后','体验型、烟大，部分摊位起点份量多。','多人分食更划算。')
];

const A=(name:string,city:string,meta:string,detail:string,best:string):Item=>({name,city,meta,detail,best,source:checked});
export const attractions:Item[]=[
A('大皇宫 & 玉佛寺','曼谷','核心寺庙 · 票价时间待官方复核','严格遮肩盖膝，禁紧身、破洞与透明衣物。','早到避团客。'),A('卧佛寺 Wat Pho','曼谷','46米卧佛 · 传统按摩学校','可与大皇宫步行组合。','留出按摩排队时间。'),A('郑王庙 Wat Arun','曼谷','河畔佛塔 · 开放阶梯','只能登开放阶梯或平台，台阶陡，不应写登顶。','傍晚看河对岸剪影。'),A('湄南河游船','曼谷','长尾船/公共快船','私人长尾船需提前议价并穿救生衣。','清晨或傍晚避热。'),A('恰图恰周末市场','曼谷','仅周末优先','手工艺、古董与设计小店丰富；不爱购物可跳过。','清晨去，正午炎热拥挤。'),A('吉姆·汤普森之家','曼谷','约45分钟导览 · 室内禁拍','必须跟讲解员参观，2026仍营业；商业化感评价分化。','按导览场次到。'),A('唐人街耀华力路','曼谷','白天老街 · 夜间扫街','夜市餐饮评价分化，不称必吃圣地。','分白天与晚间体验。'),A('伦披尼公园','曼谷','清晨跑步 · 划船与巨蜥','近期强口碑证据有限，作为城市喘息空间。','清晨去。'),A('ICONSIAM','曼谷','河景+SookSiam+奢华购物','与暹罗商圈功能不同，不做二选一。','河畔日单独安排。'),A('四面佛','曼谷','06:00–22:00 · Ratchadamri','供品约25泰铢，顺时针参拜四面。','与暹罗/奇隆顺路。'),A('金山寺','曼谷','约300级缓坡台阶','阶数来源不一，不使用343级精确说法。','傍晚登高。'),A('Mahanakhon 天空步道','曼谷','78层 · 314米 · 玻璃地板','票价随时段变化。','晴天日落前到。'),
A('大城府 Ayutthaya 古城遗迹','曼谷','世界遗产古城 · 票价时间待官方复核','UNESCO世界遗产；三大王牌寺庙：玛哈泰寺（树抱佛头）80泰铢、柴瓦塔那兰寺80泰铢（部分区域修缮中）、崖差蒙空寺20–40泰铢（86版西游记取景地、可登塔俯瞰）；进寺遮肩盖膝、不穿无袖。','邦苏火车站单程15–20泰铢，或包车一日。'),A('丹嫩沙多水上市场+美功铁道','曼谷','曼谷周边经典一日游 · 票价时间待官方复核','美功火车进站帖子样本08:30/11:10/14:30/17:40，火车贴身而过是核心体验，注意安全；丹嫩沙多水上市场帖子样本08:00–16:00（下午1点后摊位陆续撤离）；手摇船合理价约400铢/船，黑码头开价4000铢/人须避开。','让司机直接开进市场里面；工作日上午去避周末堵船。'),
A('双龙寺','清迈','约50泰铢 · 06:00–18:00','外籍游客进入佛塔区购票；遮肩盖膝、主殿脱鞋。','清晨或日出优先。'),A('契迪龙寺','清迈','约40泰铢 · 06:00–18:00','14世纪佛塔遗址，可与帕辛寺步行串联。','清晨或傍晚。'),A('帕辛寺','清迈','兰纳建筑 · Viharn Lai Kham壁画','古城核心寺庙。','与契迪龙寺同线。'),A('因他农国家公园','清迈','海拔2,565米 · 全天约10小时','单程约2小时，12月山上较凉，带外套建议仍需行前核对天气。','选择含双塔与瀑布的正规团。'),A('大象自然公园','清迈','救援象 · 不骑乘不强迫洗澡','以喂食和观察为主；没有幼象、以年长救援象为主不是缺点。','预订前核对具体项目伦理标准。'),A('周日步行街','清迈','周日17:00–22:00','与周六Wua Lai二选一，不连续两晚。','17:00入场避高峰。'),A('宁曼路','清迈','咖啡与设计区 · One Nimman','商圈约11:00–22:00，周末有市集与音乐。','白天或傍晚慢逛。'),A('Baan Kang Wat','清迈','周二至周日10:00–18:00','周一闭园；约40家职人小店。','周二至周五去，可与乌蒙寺同线。'),A('乌蒙寺','清迈','免费 · 13世纪隧道寺','隧道低矮注意头部，仍是修行寺院。','保持安静，与Baan Kang Wat同线。'),A('瓦洛洛市场','清迈','05:00–18:00 · 市场体验','买泰北香肠、辣椒酱与猪皮脆片；不再重复列为餐厅。','早上去，顺访花市。'),
A('攀牙湾','普吉','大船09:30–17:00参考','大船较平稳、快艇颠簸；部分产品限制60岁以上、孕妇及特定疾病人群。','报名前核对健康与年龄条款。'),A('皮皮岛','普吉','公园费成人400/儿童200泰铢','现场现金另付；旺季拥挤，快艇颠簸。','选早班，家庭可考虑双体船。'),A('大佛','普吉','2026-03-03重开 · 免费','2024年8月滑坡后关闭、2026年3月重开；山上猴子较凶。','行前让酒店确认开放，收好食物。'),A('普吉老镇','普吉','中葡骑楼 · 周日夜市','Lard Yai周日16:00–22:00。','17:00左右到并带现金。'),A('查龙寺','普吉','60米佛塔 · 遮肩盖膝','普吉重要寺庙。','与大佛/老镇同线。'),A('神仙半岛','普吉','日落观景','可搭Rawai与风车观景台。','提前到占位。'),A('卡塔诺伊海滩','普吉','海滩 · 自由海滩船班待核','自由海滩具体船费与码头依据不足。','按海况现场确认。'),A('Phuket Elephant Sanctuary','普吉','观察式 · 无接触','明确不骑象、不洗澡，与允许互动的营地区分。','选择官方项目。'),A('Siam Niramit','普吉','周二闭馆 · 2026起无动物表演','营业约17:30–22:30，演出约20:30–21:50。','提前到逛泰式村。'),A('芭东 Bangla 路','普吉','成人限定 · 可选','酒吧街不适合家庭专程夜游。','如住芭东可傍晚快速路过。'),
A('乔治市世遗核心区','槟城','2008列入UNESCO · 壁画骑楼','适合步行。','正午进博物馆避热。'),A('Khoo Kongsi','槟城','宗祠建筑','乔治市代表性宗祠。','与世遗街区同线。'),A('姓氏桥','槟城','仍有居民生活 · 商业化较重','以Chew Jetty为主，私宅勿入。','清晨去避人流。'),A('极乐寺','槟城','观音像约30米 · 万佛宝塔','塔内或有劝捐。','先乘车到山顶再步行下山省体力。'),A('升旗山','槟城','缆车+The Habitat','缆车每年可能维修停运。','出行前查官网运营状态。'),A('Fort Cornwallis','槟城','小体量堡垒','适合快速游览。','与海滨步行线结合。'),A('娘惹博物馆','槟城','室内文化体验','可与Auntie Gaik Lean同区串联。','雨天或正午安排。'),A('卧佛寺与缅寺','槟城','双寺同线','尊重宗教场所着装。','短程组合。'),A('小印度','槟城','街区漫步','香料、纺织与餐饮。','傍晚较舒适。'),A('和谐街','槟城','一街多宗教','步行观察多元宗教建筑。','与小印度同线。'),
A('双子塔','吉隆坡','09:00–21:00 · 成人约RM80','空中走廊+观景台，具体楼层不写未核实数字。','提前预订。'),A('黑风洞','吉隆坡','免费 · 07:00–21:00','272级阶梯；猴子会抢食物和塑料袋。','早晨去，遮肩盖膝。'),A('独立广场','吉隆坡','免费 · 全天','95米旗杆；2026完成修复。','早晨或黄昏。'),A('吉隆坡塔','吉隆坡','观景台RM80 · Sky Deck套票RM110','Sky Box另付RM10/人且无现金支付；2026仍开放。','晴天看景。'),A('茨厂街','吉隆坡','约10:00–午夜','福建面、牛肉粉与南香鸡饭等老店集中。','与REXKL、中央市场同线。'),A('武吉免登','吉隆坡','商圈约10:00–22:00','Pavilion、Lot 10等集中。','步行连接商场。'),A('伊斯兰艺术博物馆','吉隆坡','RM14 · 09:30–18:00','周一闭馆信息与部分来源冲突。','出行前官网确认。'),A('中央市场','吉隆坡','免费 · 通常10:00–22:00','适合买本地手工艺；议价常见。','与茨厂街同线。'),A('天后宫','吉隆坡','六层山顶寺庙','“东南亚最大之一”依据不足；早晨或傍晚光线较好。','不使用未证实之最。'),A('国家植物园','吉隆坡','免费公园 · 城市绿地','KL Bird Park是旁边另收费独立景点，成人约RM63、09:00–18:00。','与博物馆同区，别误以为飞禽公园免费。'),
A('滨城市场','胡志明市','仅看建筑 · 不推荐购物吃喝','游客价与品质争议集中。','快速外观后去Tan Dinh或Binh Tay。'),A('战争遗迹博物馆','胡志明市','40,000越南盾 · 07:30–17:30','展览内容沉重，建议90分钟至2小时。','可租语音导览。'),A('统一宫','胡志明市','40,000越南盾起 · 08:00–17:00','联票80,000–105,000越南盾。','时间以现场为准。'),A('中央邮局','胡志明市','Alfred Foulhoux设计 · 仍营业','1886–1891年建，常被误传为Eiffel设计。','白天顺路寄明信片。'),A('红教堂','胡志明市','修缮至2027年底 · 仅外观','2026年12月仍有围挡与脚手架，不能按正常开放参观。','与邮局和书街合并15分钟短停。'),A('古芝地道','胡志明市','约10万越南盾上下 · 射击另收费','Ben Duoc小团较安静；默认大团多去游客化的Ben Dinh。','认准Ben Duoc并备水。'),A('玉皇殿','胡志明市','约1909年 · 香火旺','本地人常去求子与姻缘，不写“求签很灵”。','保持安静。'),A('Bitexco 观景台','胡志明市','49层 · 约240,000越南盾','仍营业但不是全市最高；Landmark 81的79–81层为更高替代。','按所在片区和预算选择。'),A('堤岸唐人街','胡志明市','天后宫+平西市场','平西市场比滨城更贴近日常采购。','安排半日。'),A('阮惠步行街','胡志明市','傍晚街区','咖啡公寓与夜景是主要体验。','轻量散步。'),A('同起街','胡志明市','核心商圈','与歌剧院和酒店同线。','顺路即可。'),
A('跨海缆车','富国岛','成人700,000/儿童550,000越南盾','09:00–11:30、13:30–17:00运行，中午停运；票含Aquatopia。','天气与维护可能关闭。'),A('星星海滩','富国岛','白沙海滩 · 评价分化','近年有垃圾与付费躺椅问题；Paradiso一带相对整洁。','06:00–09:00或16:00–18:00。'),A('Khem Beach','富国岛','公共海滩 · 部分区域受酒店管理','水清且相对私密，但非住客可能遇到入口限制。','提前确认公共入口或住沿线酒店。'),A('安泰群岛浮潜','富国岛','约08:30–17:30','Gam Ghi适合浮潜，May Rut偏拍照；全天约9小时。','备泳衣、防水袋与毛巾。'),A('VinWonders','富国岛','09:00–19:30 · 约880k越南盾','设施约10:00开放、18:00陆续关闭；美人鱼秀评价两极。','别下午才进园。'),A('Vinpearl Safari','富国岛','150种/3000+动物','可与VinWonders联票，长颈鹿餐厅热门。','上午Safari、下午乐园。'),A('Dinh Cau 岩','富国岛','免费 · 日落点','本地人与游客都会到访。','傍晚去。'),A('Ham Ninh 渔村','富国岛','长堤与渔船 · 海鲜街','与海鲜体验合并，称重前确认价格。','半日即可。'),A('富国岛夜市','富国岛','约16:30–深夜','适合小吃，海鲜先问价。','别把海鲜大餐押在夜市。'),A('护国寺','富国岛','免费 · 海边寺庙','可见猴子，注意随身物品。','与南岛线路同线。'),A('富国岛监狱','富国岛','历史爱好者可选','内容沉重，不作为度假主推。','按兴趣停留。'),A('鱼露工厂与胡椒园','富国岛','顺路可选 · 具体点位未闭环','本轮未核实具体可参观地点、收费与购物风险。','不单独成正式项目。'),
A('滨海湾花园','新加坡','Garden Rhapsody 19:45/20:45','灯光秀户外免费，大雨或雷暴可能取消；双温室为室内雨备。','出发前查活动日历。'),A('环球影城','新加坡','Minion Land 2025-02-14开放','部分项目户外，雨天可能暂停。','放在预报较好日。'),A('Singapore Oceanarium','新加坡','2025-07重开 · 22展区','面积扩至约3倍，建议1.5–2.5小时；高峰可能分时入场。','提前买票，雨天强选。'),A('夜间动物园','新加坡','18:00–23:59 · 成人约S$58','热门19:00场可能售罄，入场与游园车排队长。','提前订票早到，电车右侧视野较好，禁闪光灯。'),A('新加坡动物园与Bird Paradise','新加坡','08:30起 · 两园同在Mandai','动物园多户外；Bird Paradise 09:00–18:00，部分有顶。','晴天同日安排，雨天改Oceanarium。'),A('鱼尾狮公园','新加坡','免费24小时 · Spectra约20:00','Spectra具体场次以官网为准，大雨雷暴可能取消。','雨天改金沙商场或ArtScience。'),A('Jewel 星耀樟宜','新加坡','40米室内瀑布 · 免费','灯光秀平日约20:00/21:00，周末假日前夕可能加22:00，均以当日官网为准。','全室内，适合抵离日。'),A('ArtScience Museum','新加坡','室内雨备 · teamLab','特展轮换，出发前查官网。','雨天强选。'),A('牛车水','新加坡','佛牙寺免费 · 07:00–17:00','街区与室内寺庙组合。','雨天也可。'),A('小印度','新加坡','Tekka+寺庙','进兴都庙脱鞋；Mustafa Centre可作雨备。','咖喱怕辣要提前说。'),A('Kampong Glam','新加坡','Haji Lane+苏丹清真寺','进清真寺需遮肩盖膝，现场提供长袍。','雨天改Bugis室内。'),A('乌节路','新加坡','圣诞灯饰约11月初至1月1日','2026具体亮灯日期尚未公布。','出发前查主办方官网。'),A('圣淘沙海滩','新加坡','Skyline Luge雨天/闪电关闭','夜滑仅周五、周六；12月雨季需准备室内备选。','放在预报较好时段。'),A('新加坡河游船','新加坡','约40分钟 · Clarke Quay上船','19:30左右可看昼夜转换并可能从水上看灯光秀；大雨影响体验。','天气合适再去。')
];
export const shopping={"曼谷":"ICONSIAM、暹罗商圈、恰图恰；买泰丝、香氛、设计杂货。","清迈":"瓦洛洛市场、宁曼路、Baan Kang Wat；买泰北香肠、木雕与棉织品。","普吉":"老镇周日步行街、Central Phuket；买锡器、腰果与海岛度假品。","槟城":"乔治市骑楼店、Gurney Plaza；买豆蔻制品、白咖啡与娘惹工艺。","吉隆坡":"Pavilion、Suria KLCC、中央市场；买锡器、巴迪布与本地设计。","胡志明市":"同起街、Tan Dinh 或 Binh Tay；滨城市场只看建筑，不建议购物。","富国岛":"阳东镇正规商店；夜市先问价，鱼露与易碎品托运前二次密封。","新加坡":"乌节路、Marina Bay Sands、Jewel；集中采购国际品牌与娘惹手信。"};
