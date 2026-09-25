import { attractions, days, hotels, restaurants, type Item } from './data';
import { extraXhsAssessments, extraXhsEvidence, secondaryEvidence as manualSecondaryEvidence, type SecondaryEvidence } from './researchExtra';
import { generatedSecondaryEvidence } from './researchGenerated';

export const secondaryEvidence:Record<string,SecondaryEvidence[]>={...generatedSecondaryEvidence};
for(const [name,links] of Object.entries(manualSecondaryEvidence)){
 secondaryEvidence[name]=[...(secondaryEvidence[name]||[]),...links].filter((link,index,all)=>all.findIndex(x=>x.url===link.url)===index);
}

export type GuideKind='酒店'|'餐厅'|'景点';
export type EvidenceLink={title:string;url:string;note:string};
export type GuideFacts={address:string;hours:string;price:string;schedule:string;transit:string;action:string;verification:string};
export type XhsAssessment={verdict:'推荐'|'谨慎选择'|'不推荐';recommend:number;caution:number;avoid:number;why:string;avoidNote:string};

const L=(title:string,url:string,note:string):EvidenceLink=>({title,url,note});

/** Only links present in the strict browser-visible Xiaohongshu review log are listed here. */
export const xhsEvidence:Record<string,EvidenceLink[]>={
 'Aman Nai Lert Bangkok':[
  L('曼谷安缦奈乐I：又一新作值不值？','https://www.xiaohongshu.com/explore/68aef1ca000000001d006d8d','2025-08-27 · 正文与113条评论区已滚动复核'),
  L('Aman Nai Lert Bangkok','https://www.xiaohongshu.com/explore/6a23c9b4000000002003954d','图片帖 · 评论区10条已复核')],
 'Capella Bangkok':[
  L('曼谷嘉佩乐，是个好酒店，top1给自己招黑了','https://www.xiaohongshu.com/explore/69feb488000000001a02e2eb','正文与18条评论区已复核'),
  L('一言难尽的全球第一酒店曼谷嘉佩乐','https://www.xiaohongshu.com/explore/691044c80000000004002f90','2025-11-09 · 正文与72条评论区已复核')],
 'Four Seasons Bangkok':[
  L('曼谷四季最好订，也最容易订错。','https://www.xiaohongshu.com/explore/6a7c5dac000000002500442c','重点核对同城两家四季的订错风险'),
  L('曼谷四季 & 嘉佩乐 各有所长','https://www.xiaohongshu.com/explore/693c2b32000000001e038a45','2025-12-12 · 正文与评论区已复核')],
 '曼谷文华东方':[
  L('每当我对文华东方失去耐心之后……','https://www.xiaohongshu.com/explore/69bac668000000001a02fb8e','正文与85条评论区已复核'),
  L('曼谷文华东方，略失望。','https://www.xiaohongshu.com/explore/68e35ff60000000003021a63','2025-10-07 · 负面体验样本')],
 'The Siam':[
  L('The Siam｜绝美，但不会再住了','https://www.xiaohongshu.com/explore/68e3700e0000000004015b56','2025-10-06 · 正文与评论区已复核'),
  L('曼谷The Siam｜住进《博物馆奇妙夜》','https://www.xiaohongshu.com/explore/6a7479a60000000026037c20','设计与古董收藏体验帖')],
 'Sorn':[
  L('为了这家米三泰国菜 我专门飞到了曼谷','https://www.xiaohongshu.com/explore/6970803c000000000d00b5fa','正文与评论区已复核'),
  L('随手订到的Sorn到底值不值','https://www.xiaohongshu.com/explore/69edb79f0000000022028274','价格、订位与菜品反馈已复核')],
 'Sühring':[
  L('Sühring｜曼谷最强米其林三星','https://www.xiaohongshu.com/explore/69fbffc5000000003700dda4','2026升三星与套餐价格样本'),
  L('曼谷｜米三Sühring，难吃，避雷，拉完了','https://www.xiaohongshu.com/explore/69f4997a000000002301522e','负面样本与评论区已复核')],
 'Gaggan':[
  L('Gaggan 5月29日（今日）在曼谷重新开业','https://www.xiaohongshu.com/explore/6a1920df000000003601a820','2026-05-29重开、地址与No Phone政策核对')],
 'Côte by Mauro Colagreco':[
  L('曼谷｜米二Côte by Mauro，根本吃不饱…','https://www.xiaohongshu.com/explore/69f73633000000001b0211e5','午餐价格与份量负面样本'),
  L('曼谷｜Côte by Mauro Colagreco','https://www.xiaohongshu.com/explore/67755ec0000000000b01784b','2025-01-02 · 餐厅定位核对')],
 'Le Du':[
  L('曾经的亚洲Top 1餐厅，现在味道如何？','https://www.xiaohongshu.com/explore/6a660c8e000000000e036547','正文菜品体验已复核'),
  L('曼谷Ledu，曾经的亚洲第一','https://www.xiaohongshu.com/explore/696e3a83000000001a02310c','回访体验与加点建议已复核')],
 'Nusara':[
  L('如果来曼谷只选一家米其林｜强推Nusara','https://www.xiaohongshu.com/explore/699d1c5f0000000015032c84','正面样本与地址核对'),
  L('曼谷｜Nusara米其林避雷 区别对待+食物中毒','https://www.xiaohongshu.com/explore/69d89f2e0000000023025bf9','严重负面样本；用于呈现口碑方差')],
 'Potong':[
  L('提前三个月订｜到底普通不普通？','https://www.xiaohongshu.com/explore/69ae6e9d0000000015039577','预约与份量评论已复核'),
  L('曼谷最难订的POTONG我walk-in进去了','https://www.xiaohongshu.com/explore/69821f98000000000a028254','订位难度与walk-in样本')],
 'Nahm':[
  L('曼谷 米其林一星泰餐厅 Nahm','https://www.xiaohongshu.com/explore/69a0cb0a00000000260339c2','地址与星级展示帖'),
  L('避坑指南｜nahm','https://www.xiaohongshu.com/explore/65d1afd8000000000b00d0a5','2024-02-18 · 负面口碑样本')],
 'Jay Fai':[
  L('米其林一星 Jay Fai','https://www.xiaohongshu.com/explore/69fac657000000002202b429','2026仍营业、预约与营业信息核对'),
  L('曼谷街头米其林｜Raan Jay Fai餐厅宣布关闭！','https://www.xiaohongshu.com/explore/6721a8e8000000003c01b55f','2024关闭传闻样本；与2026营业帖交叉判断')],
 'Thipsamai':[
  L('曼谷必吃老字号｜Thipsamai Pad Thai','https://www.xiaohongshu.com/explore/69ee29df000000001f00714c','鬼门原店体验帖'),
  L('曼谷拔草！米其林餐厅thipsamai','https://www.xiaohongshu.com/explore/66f26fb3000000001a022713','ICONSIAM分店负面样本；与原店区分')],
 '耀华力夜市 / T&K':[
  L('打卡曼谷唐人街T&K SEAFOOD','https://www.xiaohongshu.com/explore/6a9a66b5000000002601950f','打卡样本'),
  L('踩雷 踩雷','https://www.xiaohongshu.com/explore/69481f75000000001e020021','2025-12-22 · 菜品负面样本')],
 'Or Tor Kor Market':[
  L('曼谷OrTorKor Market，凭什么挤进世界前十','https://www.xiaohongshu.com/explore/69b3d9fa000000002302473f','市场定位与环境核对'),
  L('曼谷乍都乍市集案','https://www.xiaohongshu.com/explore/68878001000000002500db30','2025-07-28安全事件记录')],
 '大皇宫 & 玉佛寺':[
  L('曼谷一日游｜玉佛寺→大皇宫→卧佛寺→郑王庙','https://www.xiaohongshu.com/explore/6a060a490000000008030a64','动线、门票与着装评论已复核'),
  L('9.11实拍曼谷大皇宫+玉佛寺｜保姆级避坑攻略','https://www.xiaohongshu.com/explore/6aa3d378000000000d026d7e','2026-09-11实拍信息')],
 '卧佛寺 Wat Pho':[
  L('曼谷一日游｜玉佛寺→大皇宫→卧佛寺→郑王庙','https://www.xiaohongshu.com/explore/6a060a490000000008030a64','动线、300泰铢门票与评论已复核'),
  L('9.11实拍曼谷大皇宫+玉佛寺｜保姆级避坑攻略','https://www.xiaohongshu.com/explore/6aa3d378000000000d026d7e','同日王城线路参照')],
 '郑王庙 Wat Arun':[
  L('郑王庙机位&湄南河游船攻略','https://www.xiaohongshu.com/explore/69415501000000001e025900','机位、船价与末班时间评论已复核'),
  L('在曼谷花得最值的8元游船','https://www.xiaohongshu.com/explore/69bf6e9b000000002102cc76','蓝调时刻与座位建议')],
 '湄南河游船':[
  L('郑王庙机位&湄南河游船攻略','https://www.xiaohongshu.com/explore/69415501000000001e025900','Rajinee码头与蓝旗船信息'),
  L('在曼谷花得最值的8元游船','https://www.xiaohongshu.com/explore/69bf6e9b000000002102cc76','18:00班次与二楼左后方座位建议')],
 '恰图恰周末市场':[
  L('不愧是亚洲天花板！曼谷乍都乍保姆级攻略','https://www.xiaohongshu.com/explore/69c2965d00000000220036e8','分区、营业日与评论区防骗提醒'),
  L('来曼谷必逛乍都乍Chatuchak周末市场','https://www.xiaohongshu.com/explore/684301e6000000002102e12a','市场体量与价格评论')],
 '四面佛':[
  L('曼谷四面佛｜超全参拜攻略','https://www.xiaohongshu.com/explore/6a2546540000000022028974','位置、开放时间与流程核对'),
  L('曼谷四面佛｜超灵验攻略｜拜对才有用','https://www.xiaohongshu.com/explore/69c94ba70000000023017cc7','正文与210条评论区已复核')],
 '金山寺':[
  L('曼谷小众欣赏落日最佳地点','https://www.xiaohongshu.com/explore/69ad225e000000002603fac8','门票涨价评论已复核'),
  L('少有人知的曼谷最高寺庙，珍藏释迦牟尼舍利','https://www.xiaohongshu.com/explore/692e41da000000000d036c79','历史与100泰铢门票评论已复核')],
 'Mahanakhon 天空步道':[
  L('曼谷最刺激景点｜310米玻璃地板','https://www.xiaohongshu.com/explore/69de1ea30000000022029a94','开放时间与最佳到达时段'),
  L('曼谷王权观景台日落门票','https://www.xiaohongshu.com/explore/6a9538310000000012010c33','现场票价与折扣票样本')],
 'ICONSIAM':[
  L('曼谷ICONSIAM暹罗天地｜一篇逛明白','https://www.xiaohongshu.com/explore/69944faa0000000028020a7b','营业时间、动线与评论已复核'),
  L('曼谷ICONSIAM，室内如何造水上市场？','https://www.xiaohongshu.com/explore/69a5586900000000150380d5','SookSiam体验帖')],
 '唐人街耀华力路':[
  L('泰国曼谷的唐人街攻略','https://www.xiaohongshu.com/explore/6a10606a000000000f03ac00','街区历史与位置核对'),
  L('泰国夜景没白来｜被曼谷这条街硬控了','https://www.xiaohongshu.com/explore/6a799365000000002c005bef','MRT出口与夜景时段')],
 '伦披尼公园':[
  L('曼谷·伦披尼公园｜偶遇巨蜥大战','https://www.xiaohongshu.com/explore/69dd34d10000000022025e99','正文与258条评论区已复核；第二篇受UI遮挡未纳入链接')]
};

const overrides:Record<string,Partial<GuideFacts>>={
 'Aman Nai Lert Bangkok':{address:'Nai Lert Park · Chidlom',hours:'酒店全天运营；康养项目按预约',price:'帖子样本：约¥13,000/晚（尊贵双床套房）',action:'优先比较含早餐与可取消房价；新酒店需同时看近期住客反馈'},
 'Capella Bangkok':{address:'湄南河畔 · Charoen Krung',price:'以具体客房、税费与日期为准',action:'优先高楼层河景；办理入住时明确拒绝不需要的付费升级'},
 'Four Seasons Bangkok':{address:'湄南河畔 · Charoen Krung',action:'订房页必须确认是河畔店，不要误订同名服务式公寓'},
 '曼谷文华东方':{address:'48 Oriental Avenue, Bangkok',action:'选河景翻新房；把历史氛围看得比最新硬件更重要时再订'},
 'The Siam':{address:'曼谷老城河畔 · Dusit',transit:'无BTS直达，主要依赖酒店船与打车',action:'只在愿意宅酒店或老城慢游时选；不要把它当市中心通勤酒店'},
 'Sorn':{hours:'仅按预约时段接待',price:'帖子样本：7,800 THB/位，另加税费与服务费',action:'官网放位即订；无位时请酒店礼宾协助，不围绕未确认餐位锁死整晚'},
 'Sühring':{hours:'仅按预约时段接待',price:'帖子样本：7,800 / 9,800 THB 套餐',action:'2026升三星后口碑两极；先看当季菜单与份量再订'},
 'Gaggan':{address:'68 Sukhumvit 31, Bangkok',hours:'2026-05-29翻新重开；仅按预约时段接待',price:'帖子汇总约15,000–20,000 THB/人（含配酒）',action:'订位时核对68 Sukhumvit 31；接受No Phone政策再去'},
 'Côte by Mauro Colagreco':{address:'Capella Bangkok 内',price:'帖子样本：四道式午餐3,800 THB++',action:'午餐份量评价偏小；为河景和体验而去，不把它当饱腹安全牌'},
 'Le Du':{address:'Silom, Bangkok',price:'以当季tasting菜单为准',action:'约15道菜且有蚂蚁卵等大胆食材；接受创意度再订，可考虑加点虾'},
 'Nusara':{address:'336 Maha Rat Road, Bangkok',hours:'仅提供套餐，按预约时段',action:'强推与严重负面体验并存；确认取消条款并保留反馈渠道'},
 'Potong':{address:'唐人街旧药房建筑',hours:'仅按预约时段接待',action:'提前1–3个月订；不要把walk-in个例当成常规策略'},
 'Nahm':{address:'COMO Metropolitan Bangkok, 27 South Sathorn Road',hours:'按官方当季餐期',action:'连续多年获星但口碑分化；先看近期菜单'},
 'Jay Fai':{address:'327 Maha Chai Road, Bangkok',hours:'帖子汇总09:00–19:30；行前再核',price:'约500–1,000 THB/人；招牌菜可能更高',action:'优先邮件或电话预约；walk-in需清晨排号，只作传奇打卡'},
 'Thipsamai':{address:'313–315 Mahachai Road, Samran Rat',hours:'出发前核对鬼门原店当日营业',action:'认准鬼门原店；不要用ICONSIAM分店口碑代替原店'},
 '耀华力夜市 / T&K':{address:'Yaowarat Road, Bangkok',hours:'夜市时段；以当日店面为准',action:'只作扫街一站；负面反馈集中在咸度与咖喱蟹'},
 'Or Tor Kor Market':{address:'Chatuchak 对面 · MRT Kamphaeng Phet',hours:'白天前往；以市场公告为准',action:'价格高于普通市场，只买明码标价商品；保持一般城市安全警觉'},
 '大皇宫 & 玉佛寺':{address:'Na Phra Lan Road, Bangkok',hours:'08:30–16:00；售票截止时间行前确认',price:'500 THB套票（帖子实拍信息）',schedule:'建议2–2.5小时 · 08:30到',action:'有袖上衣、过膝下装；大皇宫与玉佛寺为同一园区'},
 '卧佛寺 Wat Pho':{address:'2 Sanam Chai Road, Phra Borom Maha Ratchawang, Phra Nakhon, Bangkok 10200；大皇宫南侧步行约10–15分钟',hours:'帖子汇总08:00–18:30',price:'300 THB（评论区核对）',schedule:'建议1–1.5小时；按摩另留排队时间',transit:'MRT Sanam Chai 1号口步行约6–8分钟；或从大皇宫南门步行约10–15分钟',action:'46米卧佛、四王塔与按摩学校一起看；08:30前后入场更容易避开旅行团，寺内脱鞋并遮肩盖膝'},
 '郑王庙 Wat Arun':{address:'Wat Arun 河岸码头',hours:'傍晚前到；具体闭园时间行前确认',price:'200 THB（严格记录）',schedule:'建议1–1.5小时',action:'台阶陡；日落可转到河对岸免费观景点'},
 '湄南河游船':{address:'Rajinee码头或Wat Arun码头',hours:'蓝旗船末班约18:40；行前确认',price:'帖子评论：单程30–40 THB',schedule:'18:00左右看蓝调时刻',action:'双层船优先二楼左后方；不要错过末班'},
 '恰图恰周末市场':{address:'MRT Kamphaeng Phet / BTS Mo Chit',hours:'周六日09:00–18:00',price:'免费入场',schedule:'建议3–4小时 · 早到',action:'拿分区图、记中央钟楼；门口面馆曾有找零争议，付款当面点清'},
 '四面佛':{address:'BTS Chit Lom · 爱侣湾酒店旁',hours:'06:00–23:00',price:'免费；供品与还愿舞另付',schedule:'建议30–45分钟',action:'从2号口天桥步行约3–5分钟，与暹罗商圈串联'},
 '金山寺':{address:'Wat Saket · 曼谷老城',hours:'傍晚日落前到；闭园时间行前确认',price:'100 THB（两帖评论核对）',schedule:'约300级缓坡台阶 · 建议1小时'},
 'Mahanakhon 天空步道':{address:'King Power Mahanakhon',hours:'10:00–19:00；最迟约18:30入场',price:'现场约1,080–1,200 THB；折扣票须核验',schedule:'16:00–17:00到，可看白天、日落与夜景'},
 'ICONSIAM':{address:'湄南河西岸 · BTS转接驳船',hours:'10:00–22:00',price:'免费入场',schedule:'建议2–4小时',action:'SookSiam、购物与夜景一站完成；从Saphan Taksin转船'},
 '唐人街耀华力路':{address:'MRT Wat Mangkon 1号口',hours:'夜景较佳时段20:30–22:00',price:'街区免费；餐饮按店家标价',schedule:'建议2–3小时'},
 '伦披尼公园':{address:'Lumphini Park · 市中心',hours:'以公园当日公告为准',price:'免费',schedule:'18:00–19:00更易看到水巨蜥',action:'保持距离，不喂食；日落时段活动更频繁'},
 '888 Hokkien Mee（Three Road）':{address:'67-A, Lebuh Presgrave, George Town, Penang Island 10300 Malaysia',hours:'Trip.com 页面显示 15:00 开门；每周营业日与收摊时间行前再核',price:'TripAdvisor 标注低价位；实际按碗与加料计价，备现金',schedule:'建议开门前后到，避开晚餐长队与最闷热时段',transit:'乔治市核心区可步行或 Grab；地图须导航至 Lebuh Presgrave，不要再前往旧址',action:'点虾汤福建面并按喜好加烧肉或卤排骨；室内闷热、份量偏小且多为自助端盘'},
 '大城府 Ayutthaya 古城遗迹':{address:'大城府（Ayutthaya）· 曼谷以北约80公里；各寺确切门牌暂缺',price:'帖子样本（2025–2026）：玛哈泰寺80泰铢、柴瓦塔那兰寺80泰铢、崖差蒙空寺20–40泰铢、大城府卧佛寺免费；票价有涨价记录，行前核对',schedule:'三大王牌寺庙约3小时走完；建议半天至一天',transit:'曼谷邦苏中央车站（Krung Thep Aphiwat）火车单程15–20泰铢约1–1.5小时；或Mo Chit2 minibus；城内景点间2–3公里，可用Grab或租摩托',action:'遮肩盖膝、不穿无袖；玛哈泰寺看树抱佛头、柴瓦塔那兰寺（部分修缮有脚手架）、崖差蒙空寺（86版西游记取景地、可登塔俯瞰）；巴莱船面/Pa Lek Boat Noodle米其林必比登约20泰铢/碗；警惕车站假工作人员推销2500铢包车'},
 '丹嫩沙多水上市场+美功铁道':{address:'丹嫩沙多 Damnoen Saduak / 美功 Mae Klong Railway Market · 距曼谷约70公里；确切门牌暂缺',hours:'丹嫩沙多水上市场帖子样本08:00–16:00（下午1点后摊位陆续撤离）；美功火车进站帖子样本08:30/11:10/14:30/17:40，行前再核',price:'帖子样本：丹嫩手摇船合理价约400铢/船（可坐多人），电动船开价1000铢/人可讲价至300–500；黑码头开价4000铢/人，须避开',schedule:'两景点相距约20分钟车程，建议打包一日游（上午美功、下午丹嫩），共约3–4小时',transit:'帖子样本：曼谷包车往返2500–2800泰铢；让司机直接开进市场里面，不在外围买票点下车',action:'坚决避开黑码头；周末大堵船，建议工作日上午去；选手摇船；评论多推荐更本地的空叻玛荣作为替代'},
 'Mandarin Oriental Kuala Lumpur':{address:'Kuala Lumpur City Centre, P.O. Box 10905, 50088 Kuala Lumpur；双子塔旁 · KLCC',hours:'OTA样本：入住14:00起，退房12:00前',transit:'LRT Kelana Jaya线/MRT到KLCC站（Moovit列出KLCC、Persiaran KLCC站）；酒店紧邻双子塔与KLCC公园',action:'订Tower View房正对双子塔；有个别房间香薰味过重疑掩盖烟味，入住闻到异味直接要求换房',verification:'已核验 2026-09-16'},
 'Park Hyatt Kuala Lumpur':{address:'Menara Merdeka 118, Presint Merdeka 118, 50118 Kuala Lumpur；Merdeka 118综合体75–114层',hours:'入住15:00起，退房12:00前（Trip.com）',price:'OTA样本（Trip.com）：“Price Range: From RM 1,466”',transit:'位于Merdeka 118综合体内，邻近茨厂街（Petaling Street）一带；打车/Grab前往',action:'2025年8月新开业，客房在100–112层，选高层房看城市天际线；价格高于老牌五星，提前比价',verification:'已核验 2026-09-16'},
 'Four Seasons Kuala Lumpur':{address:'145 Jalan Ampang, 50450 Kuala Lumpur；KLCC商圈',hours:'入住15:00后，退房12:00前（Trip.com/Traveloka）',price:'聚合页样本约 RM 883–1,150/晚起（KAYAK/Trip.com，9 月底抓取）；12 月旺季以官网实时价为准',transit:'LRT到KLCC站约470米（Trip.com）；步行约5分钟到双子塔',action:'楼内有Nadodi（南印度fine dining），可一站式安排晚餐；2026年卫生与设施评价分化，出行前先看近期差评再决定',verification:'已核验 2026-09-16'},
 'The Athenee Hotel':{address:'Wireless Road 曼谷无线路段',hours:'入住 14:00，退房 12:00',price:'9 月约 THB 7,699/晚起；12 月旺季以官网实时价为准'},
 'Anantara Chiang Mai':{address:'Charoen Prathet Road 清迈古城南门旁',hours:'入住 14:00，退房 12:00',price:'9 月约 THB 7,799/晚起；12 月旺季以官网实时价为准'},
 'Shangri-La Chiang Mai':{address:'89/8 Chang Klan Road 尚格里拉路',hours:'入住 15:00，退房 12:00',price:'9 月约 THB 4,599/晚起；12 月旺季以官网实时价为准'},
 'Chiang Mai Marriott Hotel':{address:'Chang Klan Road 清迈夜市旁',hours:'入住 15:00，退房 12:00',price:'9 月约 THB 3,799/晚起；12 月旺季以官网实时价为准'},
 'JW Marriott Phuket':{address:'Mai Khao 迈考海滩',hours:'入住 15:00，退房 12:00',price:'9 月约 THB 12,999/晚起；12 月旺季以官网实时价为准'},
 'The Surin Phuket':{address:'Pansea Beach 攀牙湾畔邦涛',hours:'入住 14:00，退房 12:00',price:'9 月约 THB 18,999/晚起；12 月旺季以官网实时价为准'},
 'Keemala':{address:'Kamala 卡马拉山林',hours:'入住 14:00，退房 12:00',price:'9 月约 THB 28,999/晚起；12 月旺季以官网实时价为准'},
 'Penang Marriott Hotel':{address:'Gurney Drive 葛尼大道',hours:'入住 15:00，退房 12:00',price:'9 月约 MYR 599/晚起；12 月旺季以官网实时价为准'},
 'Seven Terraces':{address:'Stewart Lane 乔治市古迹区',hours:'入住 15:00，退房 12:00',price:'9 月约 MYR 899/晚起；12 月旺季以官网实时价为准'},
 'The Edison George Town':{address:'Lebuh Leith 乔治市莲花河街',hours:'入住 15:00，退房 12:00',price:'9 月约 MYR 799/晚起；12 月旺季以官网实时价为准'},
 'EQ':{address:'Equatorial Plaza, Jalan Sultan Ismail 吉隆坡金三角',hours:'入住 15:00，退房 12:00',price:'9 月约 MYR 899/晚起；12 月旺季以官网实时价为准'},
 'Mai House Saigon':{address:'157 Nam Ky Khoi Nghia 第一郡',hours:'入住 14:00，退房 12:00',price:'9 月约 USD 189/晚起；12 月旺季以官网实时价为准'},
 'Hôtel des Arts Saigon':{address:'76–78 Nguyen Thi Minh Khai 第三郡',hours:'入住 14:00，退房 12:00',price:'9 月约 USD 259/晚起；12 月旺季以官网实时价为准'},
 'La Festa Phu Quoc':{address:'Sunset Town 日落小镇',hours:'入住 15:00，退房 12:00',price:'9 月约 USD 399/晚起；12 月旺季以官网实时价为准'},
 'InterContinental Phu Quoc':{address:'Bai Truong 长滩',hours:'入住 15:00，退房 12:00',price:'9 月约 USD 299/晚起；12 月旺季以官网实时价为准'},
 'Fusion Resort Phu Quoc':{address:'Vung Bau 翁堡海滩',hours:'入住 14:00，退房 12:00',price:'9 月约 USD 449/晚起；12 月旺季以官网实时价为准'},
 'Mandarin Oriental Singapore':{address:'5 Raffles Avenue 滨海湾',hours:'入住 15:00，退房 12:00',price:'9 月约 SGD 599/晚起；12 月旺季以官网实时价为准'},
 'Shangri-La Singapore':{address:'22 Orange Grove Road 乌节路旁',hours:'入住 15:00，退房 12:00',price:'9 月约 SGD 499/晚起；12 月旺季以官网实时价为准'},
 'The Fullerton Hotel Singapore':{address:'1 Fullerton Square 浮尔顿',hours:'入住 15:00，退房 12:00',price:'9 月约 SGD 549/晚起；12 月旺季以官网实时价为准'},
 'Dewakan':{address:'Platinum Park, Level 48, Skyviews, Naza Tower, Persiaran KLCC, 50088 Kuala Lumpur；KLCC旁48层高空',hours:'周一至周六 18:00–23:30（Trip.com）',price:'聚合页样本：11道约RM300/位，17道约RM370/位',transit:'Naza Tower位于Persiaran KLCC，KLCC商圈；LRT Kelana Jaya线到KLCC站后步行/Grab',action:'2026马来西亚唯一米其林二星+绿星；必须提前预订；华人食客口碑两极，风味大胆用发酵与本地香草，保守食客慎选；订窗边位看双子塔夜景',verification:'已核验 2026-09-16'},
 'Beta KL':{address:'Unit 3 & 3A, Ground Floor, Cormar Suites, No. 10, Jalan Perak, 50450 Kuala Lumpur；KLCC商圈',hours:'周二至周四及周日 18:00–22:00，周五周六 18:00–23:00，周一闭店（KL Foodie）',price:'博客样本：Tour of Malaysia菜单RM398/位，A5和牛另加RM220（KL Foodie）',transit:'Jalan Perak，KLCC商圈；LRT到KLCC站后步行/Grab',action:'“环游马来西亚”菜单概念完整，官网/TableApp提前订位；酒水搭配酒精量大，开车者慎选pairing',verification:'已核验 2026-09-16'},
 'DC by Darren Chin':{address:'44 Persiaran Zaaba, Taman Tun Dr Ismail（TTDI）；三层独栋',price:'帖子样本：约RM1,200/位（Tripadvisor食客原话）',transit:'位于TTDI，不在市中心，打车/Grab前往',action:'老牌米其林法餐，Global Menu七道式约会氛围好；主厨自述并非刻意“马来化”而是用本地优质食材；有“食物无记忆点”的两极评价，期望管理重要',verification:'已核验 2026-09-16'},
 'Nadodi':{address:'Four Seasons Hotel Kuala Lumpur内（145 Jalan Ampang，KLCC旁）',hours:'周一至周六 12:00–15:00，18:00–23:00（Trip.com酒店页）',transit:'同四季酒店：LRT到KLCC站约470米',action:'南印度+斯里兰卡风味fine dining，午餐set menu性价比高于晚餐；2026年有老客反映水准下滑、官网菜单与实际不符，订位时先跟餐厅确认当期菜单',verification:'已核验 2026-09-16'},
 'Chim by Chef Noom':{address:'L2-03, TSLAW Tower, 39, Jalan Kamuning, Imbi, 55100 Kuala Lumpur；Imbi区',hours:'周二至周日 17:30–23:00，周一闭店（Wanderlog/Google）',transit:'Jalan Kamuning（Imbi区，Bukit Bintang商圈南侧）；打车/Grab前往',action:'2025年新获米其林一星的现代泰餐，9道式品鉴约3小时；提前预订并尽量选玻璃窗位；有食客反馈龙虾和牛肉同上导致牛肉变凉，介意上菜节奏的可备注',verification:'已核验 2026-09-16'},
 'Jalan Alor':{address:'Jalan Alor, Bukit Bintang（武吉免登）商圈',hours:'街区全天开放；排档集中每晚18:00–次日01:00（Agoda美食指南）',transit:'Bukit Bintang商圈内；LRT/单轨到Bukit Bintang一带再步行，或备MyRapid卡/用Grab（Agoda）',action:'只做“夜市氛围体验”不锁死正餐；白天冷清晚上才热闹；先看价格再点，注意扒手与卫生',verification:'已核验 2026-09-16'},
 'Lot 10 Hutong':{address:'LG层，Lot 10 Shopping Centre, 50 Jalan Sultan Ismail, Bukit Bintang',hours:'10:00–22:00（YouTube探店）',price:'帖子样本：多数档口人均RM10–20；单笔消费低于RM10可能被加收',transit:'Bukit Bintang商圈Lot 10商场LG层；LRT/单轨到Bukit Bintang站步行可达',action:'带现金（不少档口只收现金）；11:00前或19:00后避峰；猪肉粉是隐藏招牌；洗手间收费0.5马币且不干净，提前有数',verification:'已核验 2026-09-16'},
 'Gulainya':{address:'44-G, Plaza Damansara, Jalan Medan Setia 2, Bukit Damansara, 50490 Kuala Lumpur；Damansara Heights住宅区',hours:'11:00–15:00，17:00–21:30，周一闭店（Bangsar Babe）',price:'博客样本（2025年9月）：小份菜RM22–48，甜品约RM8–9',transit:'Bukit Damansara住宅区内，打车/Grab前往',action:'2026年新获米其林必比登的娘惹菜（槟城+马六甲风味），pork-free；店小，周日晚上也满座，务必提前订位；招牌是Gulai Tumis红鲷鱼',verification:'已核验 2026-09-16'},
 'Village Park':{address:'5, Jalan SS 21/37, Damansara Utama, 47400 Petaling Jaya；八打灵再也，不在KL市中心',hours:'每日 6:30–17:30（多条Trip.com帖子一致）',price:'帖子样本：人均约RM12–20；Google价格区间RM1–20',transit:'MRT到Taman Tun Dr Ismail站步行约22分钟，或市区Grab约40分钟（帖子样本）',action:'巴生谷最出名的椰浆饭，招牌是香料炸鸡+参巴酱；8点前到避开早高峰，周末排队15–20分钟是常态；只做早午餐，下午5点半关门别跑空',verification:'已核验 2026-09-16'},
 'THIRTY8':{address:'Level 38, Grand Hyatt Kuala Lumpur, 12, Jalan Pinang, 50450 Kuala Lumpur；KLCC旁',hours:'每日 06:30–10:30，12:00–24:00（Trip.com）',price:'博客样本（2026年现行）：下午茶工作日RM138/位、周末RM168/位；Trip.com价位$$-$$$',transit:'12 Jalan Pinang，KLCC旁；LRT到KLCC站再步行/Grab',action:'只去下午茶最划算（正餐有性价比争议）；smart casual dress code，提前预订；38层看双子塔景观位要早定',verification:'已核验 2026-09-16'},
 '双子塔':{address:'Kuala Lumpur City Centre, 50088 Kuala Lumpur；KLCC',hours:'每日 09:00–21:00（Traveloka）',price:'OTA样本：成人约RM80（Traveloka）；马蜂窝POI记外地成人98/本地35，周一闭馆——两来源有出入，以现场/官网为准',transit:'LRT/MRT到KLCC站，出站即Suria KLCC商场',schedule:'Skybridge空中走廊+观景台，分批限时参观，严格按预定时间入场',action:'务必提前订票，选18:00前后场次一次收日落+夜景；Klook订Skybridge迟到25分钟会被拒绝入场，预留充足交通时间；楼下KLCC公园音乐喷泉晚上值得顺路看',verification:'已核验 2026-09-16'},
 'JW Marriott Phu Quoc':{address:'Eco-Tourism at Bai Khem, Phu Quoc Special Economic Zone, An Giang Province, Vietnam；南岛 Khem 海滩，Sunset Town 附近（Marriott 官网）',price:'OTA样本（Expedia 2026-09-13 查询，9月20日2成人1晚最低 AU$469 含税费；随日期浮动）',schedule:'入住15:00 / 退房12:00（Expedia 样本）',transit:'距富国岛机场约17.4公里（Traveloka）；官网说明酒店不提供班车，需 Grab/打车或酒店租车',action:'Bill Bensley 设计的大学主题校园度假村，Pink Pearl 和 Tempus Fugit 都在度假村内步行可达；南岛行程（跨海缆车/Sunset Town）住这最顺，Khem 海滩早上去人少'},
 'Regent Phu Quoc':{address:'Phu Quoc Marina Integrated Resort Complex, Duong Bao Ward, Duong To, Phu Quoc Special Zone, An Giang Province, 92509, Vietnam；岛西海岸 Long Beach（Bai Truong 长滩）（Regent 官网）',price:'OTA样本（trivago）：约€432/晚起；开业公告参考价 US$361/晚起（IHG 2022）',transit:'距机场约10–15分钟车程（OTA/住客帖子样本）；酒店可安排接送车（住客帖子样本）',action:'全套房+别墅度假村，日落是核心卖点——要无遮挡日落选高层 Sky Pool 房型；Ocean Club 和 Oku 都在度假村内，白天海滩、晚上 Oku 一条线'},
 'New World Phu Quoc':{address:'Khem Beach, An Thoi Ward, Phu Quoc 92500, Vietnam；南岛 Khem 海滩，与 JW Marriott 同片海滩（官网 factsheet）',price:'越南本地站点样本（2trip.vn）：约6,100,000–29,000,000 VND/栋/晚（别墅带私家泳池）',transit:'南岛 Khem 海滩片区；岛内 Grab/打车前往 Sunset Town 与缆车站',action:'366栋茅草顶别墅每栋带私家泳池，家庭友好（儿童俱乐部+儿童泳池）；同海滩更高端的两家是 JW Marriott 与其相邻，New World 性价比更高'},
 'Pink Pearl':{address:'JW Marriott Phu Quoc 度假村内；Khem Beach, An Thoi Ward, Phu Quoc City, Kien Giang Province, Vietnam 92513',hours:'每天18:00–22:00；周日另有早午餐12:00–16:00（官网）',price:'媒体样本：2026年3月新八道式 tasting menu VND 4,988,000++，另有六道式；另加5%服务费与税（官网政策）',transit:'JW Marriott 度假村内；非住客从岛上其他地方打车前往（南岛）',action:'富国岛天花板级法餐（米其林星级主厨 Olivier Elzer），必须提前订位（官网/电话+84 29 7377 9999）；部分晚上有现场歌剧，订位时问清歌剧日期并安排好座位；Smart Casual 着装'},
 'Tempus Fugit':{address:'JW Marriott Phu Quoc 度假村内；Eco-Tourism at Bai Khem, An Thoi Ward, Kien Giang Province, Vietnam 92513',hours:'每天06:30–10:30（早餐）、12:00–22:00（午晚餐）（Marriott 官网）',price:'OTA样本（Traveloka）：午/晚餐约$40–60澳元/人',transit:'JW Marriott 度假村内',action:'度假村全日餐厅，早餐是住客主阵地；建筑系工作室主题装修，非住客中午来吃顿午饭体验性价比最高'},
 'Crab House':{address:'26 Nguyen Trai, Duong Dong, Phu Quoc Island 92500, Vietnam；阳东镇中心（TripAdvisor）',hours:'每天11:00–22:00（TripAdvisor）',price:'住客帖子样本（TripAdvisor 2026年5月）：两人约4,000,000 VND',transit:'阳东镇中心，Dinh Cau 夜市商圈内；岛上打车/Grab 可达',action:'美式手抓海鲜，招牌 Crab House Special 酱+香茅蒜香/中辣是经典点法；旺季晚上7点基本满座，提前订位或错峰；点餐前确认海鲜称重价格'},
 'Xin Chao Seafood':{address:'66 Tran Hung Dao Street, Duong Dong, Phu Quoc Island, Vietnam；阳东镇海边，距夜市约300米（餐厅自述）',hours:'每天11:00–21:30（餐厅 Facebook 商家信息；个别平台标至22:00）',price:'越南本地站点样本（salindaresort.com）：60,000–500,000 VND/道菜',transit:'阳东镇海边，Dinh Cau 夜市步行约300米',action:'本地人也推的海鲜排挡，龙虾/蟹/生蚝现捞现称——点之前先问价、看秤；日落时分海景位抢手，提前到；高峰期可能要等约20分钟'},
 'Bun Quay Kien Xay':{address:'28 Bach Dang Street, Duong Dong, Phu Quoc；阳东镇中心（总店）；另有分店：34 Street 30 Thang 4、Tran Phu 222号对面巷',hours:'每天约07:00–23:00（TripAdvisor；总店中午有午休间隔，本地攻略样本）',price:'越南本地站点样本（salindaresort.com）：40,000–85,000 VND/碗',transit:'阳东镇中心 Bach Dang 大街上；打车/Grab 可达',action:'富国岛必吃 bún quậy 老字号（20多年），汤底偏淡、精髓在自调蘸料——看店内配方表跟着配；早餐9点前后人最多，错峰去'},
 'Dinh Cau Night Market':{address:'Bạch Đằng 路一带，阳东镇中心，Dinh Cau 神庙南约100米；Vo Thi Sau 街也被列为其位置（来源表述不一）',hours:'夜市每天约17:00–23:00开放；各摊位时间不一（Traveloka/越南国家旅游局）',transit:'阳东镇中心；住阳东步行可达，住长滩/南岛打车前往',action:'海鲜烧烤+纪念品一条街（100+摊位），19:00–21:00最热闹；海鲜摊先逛一圈比价再点、现称注意看秤；名字沿用旧称（2016年老夜市已与 Bạch Đằng 夜市合并），问路两个名字都通用；近期有卫生与宰客差评，吃海鲜建议选明码称重的店，夜市以逛吃小吃为主'},
 'Ham Ninh 渔村':{address:'Tỉnh Lộ 47, Ham Ninh Commune, Phu Quoc；岛东岸（与西岸日落区隔海相对），省道47号',hours:'渔村全天开放；各餐厅约09:00–22:00，时间不一',price:'越南本地站点样本（rootytrip）：餐厅人均约100,000–300,000 VND；Bé Ghẹ 约100,000–500,000 VND（aivivu）',transit:'岛东岸省道47号；从岛西侧度假村打车约20分钟（Novotel 目的地页样本）；建议打车/Grab 或包车前往',action:'看日出+吃平价海鲜（咸柠檬蟹/皮皮虾/海胆是招牌），选口碑好的水上餐厅（Bé Ghẹ、Tình Biển）；菜单先问价，带现金（小店多不收卡）；傍晚去能看金色海面日落'},
 'On the Rocks':{address:'Mango Bay Resort, Hẻm 8 Đường Lê Thúc Nha, Cua Duong, Phu Quoc；岛西岸中段（Ong Lang 海滩一带），Mango Bay 度假村内（TripAdvisor）',hours:'每天13:00–21:00（TripAdvisor）',transit:'岛西岸中段 Mango Bay 度假村内；从阳东/长滩打车前往',action:'富国岛日落晚餐名场面，礁石上的海景位是精髓——17:30前到占位看日落；蟹肉牛油果沙拉和 ceviche 是住客高频推荐；先喝杯鸡尾酒再吃晚餐'},
 'Ocean Club':{address:'Regent Phu Quoc 度假村内（西海岸 Long Beach 海滩俱乐部）（IHG 官网）',hours:'每天10:00–22:00（IHG 官网）',price:'官网特别晚宴样本：Sundown by the Sea 每位 VND 3,200,000–4,900,000（含酒水档不同）；活动当晚无单点菜单',transit:'Regent Phu Quoc 度假村内；非住客可预约前往',action:'地中海风海滩俱乐部，白天泳池+海景、晚上主题晚宴；每周四/周日有 Sundown by the Sea 日落晚宴（18:00–22:00，需提前订位）；着装要求：白天 Island Casual、晚上 Island Chic'},
 '跨海缆车':{address:'Sun World Hon Thom 出发站（Anh Duong Station, Sunset Town，安泰镇）→ Hon Thom 岛',hours:'09:00–11:30、13:30–17:00（2026年新版运营指引；中午11:30–13:30休息间隔）',price:'Sun World 官方产品信息（2026年适用）：成人往返765,000 VND，儿童（100–140cm）630,000 VND；含自助午餐成人975,000 VND；另有第三方攻略样本约850,000 VND（含 Aquatopia 水上乐园）',schedule:'单程约15分钟；全长7,899.9米，吉尼斯认证世界最长三线缆车',transit:'Sunset Town（安泰镇）内；南岛酒店（JW Marriott）距缆车站约4.4公里、打车约10分钟（Traveloka 样本）；岛上其他区域打车/Grab 前往',action:'票已含 Hon Thom 岛 Aquatopia 水上乐园；中午11:30–13:30停运，别卡着中午去；早上去人少，岛上玩大半天、下午返程；运营时间可能调整，出行前再核对官网/票面'},
 'Capella Singapore':{address:'1 The Knolls, Sentosa Island, Singapore 098297；圣淘沙岛内',hours:'入住 15:00 起，退房 12:00 前（Trip.com）',price:'OTA样本：约 US$799–1,045/晚起（Trip.com，不同日期抓取）',transit:'MRT HarbourFront 站转 Sentosa Express 至 Imbiah 站，再转巴士/打车（Traveloka）',action:'圣淘沙岛上度假酒店，3 个户外泳池+私人海滩；机场单程接送需提前 24 小时找礼宾预约'},
 'Raffles Singapore':{address:'1 Beach Road, Singapore 189673；市中心滨海湾畔',hours:'入住 15:00 起，退房 12:00 前（Trip.com）',price:'OTA样本：约 SGD 1,510/晚起（Trip.com）',transit:'MRT City Hall（NS25/EW13）步行约 200 米；或 Esplanade（CC3）站步行约 500 米（Traveloka）',action:'百年传奇酒店，Long Bar 的新加坡司令必体验；KAYAK 数据显示提前约 11 周预订更划算'},
 'Marina Bay Sands':{address:'10 Bayfront Avenue, Singapore 018956；滨海湾畔',hours:'入住 15:00 起，退房 11:00 前（Trip.com）',price:'OTA样本：约 SGD 1,100/晚起（Trip.com）',transit:'MRT Bayfront（CE1/DT16）B 出口步行约 3 分钟',action:'57 楼无边泳池只对住客开放，想打卡就得住一晚；退房 11 点偏早，行李可寄存后继续玩'},
 'Odette':{address:'1 St Andrews Road, #01-04 National Gallery Singapore, Singapore 178957；国家美术馆 1 楼',hours:'午餐周二至周六 12:00–13:00（最后入座）；晚餐周一至周六 18:30–20:15（最后入座）；周日休息（官网）',price:'帖子样本：tasting menu S$498/位（mytrip.my）',transit:'MRT City Hall（NS25/EW13）B 出口（supasoya）',action:'米其林三星，官网提前 60 天放位、开订即抢；只做 tasting menu，午餐比晚餐便宜'},
 'Burnt Ends':{address:'7 Dempsey Road, #01-04, Singapore 249671；Dempsey Hill',hours:'周二、周三 18:00–23:00；周四至周六 12:00–14:30、18:00–23:00；周日周一休息（TripAdvisor）',price:'帖子样本：人均约 S$250–300（8days）；omakase 自 S$150/位起（TripAdvisor 评论）',transit:'Dempsey Hill 内，无直达 MRT，打车/Grab 前往',action:'米其林一星开放式炭火厨房；一位难求，帖子称提前 1 个月才订到，确定日期后立刻锁位'},
 'Candlenut':{address:'17A Dempsey Road, Singapore 249676；Dempsey Hill COMO 商区',hours:'午餐每日 12:00–15:00（最后入座 14:30）；晚餐周日至周四 18:00–22:00，周五周六及公假前夕 18:00–23:00（OpenTable）',price:'官网样本：Ah-ma-kase 套餐 S$138++/位（官网 2024 年菜单）',transit:'Dempsey Hill 内，无直达 MRT，打车/Grab 前往',action:'全球首家米其林星级娘惹菜，招牌是 Ah-ma-kase 套餐；Dempsey 偏僻，晚餐打车前往，提前订位'},
 'Labyrinth':{address:'8 Raffles Avenue, #02-23, Singapore 039802；Esplanade 商场 2 楼',hours:'周三、周四 18:30–23:00；周五至周日午餐及晚餐；周一、周二休息（官网）',price:'帖子样本：午餐 S$208/位、晚餐 S$298/位（TripAdvisor 评论）',transit:'MRT Esplanade 站出站即达，商场 2 楼',action:'米其林三星“新派新加坡菜”，全店仅 30 座，务必提前订位；21 道式体验套餐约 3 小时'},
 'Jumbo Seafood':{address:'Block 1206 East Coast Parkway #01-07/08, East Coast Seafood Centre, Singapore 449883；东海岸',hours:'周一至周五 11:30–15:00、16:30–23:00；周六、周日 11:00–23:00（OpenRice）',price:'帖子样本：辣椒螃蟹小份（2 人）约 S$70，按时价（TripAdvisor 评论）',transit:'东海岸公园内，无直达 MRT，打车/Grab 前往',action:'辣椒螃蟹按时价，点单前先看秤、确认每公斤价格；周末及日落前后一位难求，官网提前订位避开排队'},
 'Song Fa':{address:'11 New Bridge Road, #01-01, Singapore 059383；Clarke Quay 旁',hours:'每日 10:00–21:15（OpenRice）',price:'帖子样本：经典肉骨茶 9.9 SGD/份，龙骨汤 13.9 SGD/份（Trip.com 评论）',transit:'MRT Clarke Quay 出站步行约 5 分钟（约 160 米）',action:'米其林必比登，胡椒味肉骨茶；排队是常态，错峰（下午 2 点后）去，胡椒汤免费无限续'},
 'Maxwell Food Centre':{address:'1 Kadayanallur Street, Singapore 069184；牛车水旁',hours:'食阁全天开放；各摊位时间不一',transit:'MRT Maxwell（TE18）2 号口出站即到；或 Chinatown 步行约 5 分钟',action:'天天海南鸡饭是排队王，午市常排 30 分钟以上，早点去；周一不开，别扑空'},
 'Old Airport Road':{address:'51 Old Airport Road, Singapore 390051',hours:'食阁全天开放；各摊位时间不一',transit:'最近 MRT 是 Dakota 站，出站步行一段或打车（akasa.sg）',action:'本地人食堂，70–80 个摊位；先绕一圈看哪家排队再下单，避开周末饭点'},
 'Hill Street Tai Hwa':{address:'466 Crawford Lane, #01-12, Singapore 190466；Lavender 一带',hours:'每日 9:30 开始；周日、周一至 21:00，周二、三、五、六至 20:30，周四至 20:00；每月第 1、3 个周一休息（8days）',price:'帖子样本：$6/$8/$10 三档，$8 最推荐（sgfoodonfoot）',transit:'MRT Lavender（EW 线）A 出口，步行约 5 分钟',action:'米其林一星肉脞面，排队 30 分钟起；怕排可用 WhatsApp（9272-3920）提前至少 1 小时预订外带'},
 '328 Katong Laksa':{address:'216 East Coast Road, Singapore 428914；加东区（另有 51 East Coast Rd 分店，别走错）',hours:'每日 8:00–21:00（TripAdvisor）',price:'帖子样本：SGD 7.80–9.80/碗（Traveloka 攻略）',transit:'加东区 East Coast Rd，打车/Grab 最方便',action:'面条预先剪碎、用勺子吃是特色；评价分化、有人嫌贵，可顺路吃，不必专程长排'},
 'Ya Kun Kaya Toast':{address:'18 China Street, #01-01, Singapore 049560；Far East Square 旗舰店',hours:'周一至周五 7:30–19:00；周六 7:30–16:30；周日 8:30–15:00；公假休息（ordinarypatrons）',transit:'Far East Square 内（莱佛士坊一带）',action:'新加坡式早餐三件套：咖椰吐司+半熟蛋+咖啡；只有旗舰店用传统咖啡杯和大理石桌，值得专程去'},
 'Lau Pa Sat':{address:'18 Raffles Quay, Singapore 048582；CBD 金融区',hours:'食阁全天开放；各摊位时间不一；沙爹街每晚 19:00 起开档（至凌晨 1 点）',transit:'MRT Raffles Place / Telok Ayer 步行可达',action:'沙爹街晚上 7 点后封街开档，7 & 8 号摊最火；带现金，部分老摊只收现金'},
 '滨海湾花园':{address:'18 Marina Gardens Drive, Singapore 018953；滨海湾畔',hours:'双冷室（Flower Dome + Cloud Forest）每日 9:00–21:00，最晚入场 20:30；室外花园免费开放（Trip.com）',price:'OTA样本：双冷室联票约 S$41/成人（Expedia）',transit:'MRT Bayfront（CE1/DT16）出站步行可达',action:'室外花园免费，两个冷室收费；灯光秀每晚 19:45、20:45 免费看，提前 15–20 分钟占位；冷室建议白天玩，傍晚接着看灯光秀',schedule:'Garden Rhapsody 灯光秀：每日 19:45、20:45，Supertree Grove，免费（官网）'},
 'Amanpuri':{address:'Pansea Beach, Cherngtalay, Thalang, Phuket 83110；门牌 118 Srisoonthorn Rd；独享 Pansea Beach 私家海滩，普吉西海岸北端',hours:'入住 14:00 / 退房 12:00（Trip.com）',price:'OTA样本：标准房均价约 C$2,303–C$4,854/晚（Tripadvisor 合作商均价）；住客样本：花园亭阁约 USD 1,900/晚含服务费与税',transit:'普吉机场约 23.8 公里、车程约 41 分钟（Trip.com）；酒店提供机场接送，需提前联系确认费用',action:'安缦旗舰，全亭阁带私家泳池的顶奢；圣诞新年季房价最高且退改严，下单前看清取消条款并走官网/Virtuoso 渠道订以争取礼遇',verification:'2026-09-16 核验：Trip.com/OTA 住客样本'},
 'Trisara':{address:'60/1 Moo 6, Srisoonthorn Road, Choeng Thale, Thalang, Phuket 83110；Amanpuri 与机场之间的西北海岸山岬，Naithon 海滩上方',hours:'入住 14:00 / 退房 12:00（Skyscanner）',price:'OTA样本：USD $584–$5,104/晚（GDS 房价政策；标准房 $759 起）',transit:'距普吉机场约 11 公里、15 分钟车程（Business Travel News）',action:'全私家泳池别墅的隐奢度假村，米其林一星 PRU 就在酒店内；位置偏僻，出行靠酒店车或包车，提前和礼宾约好接送',verification:'2026-09-16 核验：GDS 房价政策/OTA'},
 'Banyan Tree Phuket':{address:'33, 33/27 Moo 4, Srisoonthorn Road, Choeng Thale, Thalang, Phuket 83110；Laguna Phuket 综合度假区内，Bang Tao 湾',hours:'入住 15:00 / 退房 12:00（TravelAgeWest）',price:'OTA样本：USD $275–$794/晚（GDS 房价政策）',transit:'距普吉机场约 16.3 公里（Jetstar）；Laguna 区内有穿梭交通，机场接送约 1,900 THB 单程（OTA 样本）',action:'悦榕庄旗舰，全泳池别墅+顶级 SPA；旺季除夕晚宴强制收费（OTA 样本：成人 THB 20,000），12 月底入住先问清 gala dinner 条款',verification:'2026-09-16 核验：GDS 房价政策/OTA'},
 'PRU':{address:'60/1 Moo 6, Srisoonthorn Road, Choeng Thale, Thalang, Phuket 83110；Trisara 度假村内，Naithon 海滩上方',hours:'晚餐 18:00–22:30（周二至周六；周五、周六另有午餐 12:00–15:00）；2026-08-30 至 09-30 闭店周年季，10-01 重开（phuket101）',price:'活动样本：十周年特别晚宴 THB 10,990/人起（2026-10-27–11-01）；媒体样本：tasting menu 约 £155/人（MoneyWeek）',transit:'酒店内餐厅；非住客自驾/Grab 到 Trisara，酒店有代客泊车',action:'普吉唯一米其林一星+绿星，自有有机农场；官网 dinesuperb 放位即订，12 月旺季提前数周锁位；着装 smart elegant',verification:'2026-09-16 核验：phuket101/Tripadvisor'},
 'Jampa':{address:'46/6 Moo 3, The Community House, Tri Vananda, Thep Krasattri, Phuket 83110；Tri Vananda 度假社区内，机场东南内陆',hours:'周日、周一、周四至周六 12:00–22:00；周二、周三闭店（Tripadvisor）',price:'帖子样本：人均超过 1,000 THB（Wongnai 食客点评）',transit:'内陆社区位置，需 Grab/包车或自驾前往',action:'PRU 的姐妹店，主打零废弃+明火烹饪，比 PRU 好订一截；注意周二周三不开门，行程别排错天',verification:'2026-09-16 核验：Tripadvisor/Wongnai'},
 'Blue Elephant':{address:'96 Krabi, Talat Nuea, Mueang Phuket, Phuket 83000；百年葡式总督府大楼，普吉老城',hours:'每日 11:30–14:30 与 18:30–22:30（末单 13:30/21:30，Klook）',price:'OTA样本：人均约 US$59（Klook 套餐）；帖子样本：约 220–350 港币/人',transit:'普吉老城内，步行可达老城区；住老城外建议 Grab',action:'百年总督府里的皇家泰餐，Peranakan 套餐是普吉独有；午餐套餐性价比高于晚餐，晚餐建议提前预约，庭院蓝色座位拍照早到先占',verification:'2026-09-16 核验：Klook/Tripadvisor'},
 'Raya':{address:'48/1 Dibuk Road, Talat Yai, Mueang Phuket, Phuket 83000；老城 Dibuk 与 Thepkrasattri 路口',hours:'每日 10:00–22:00，末单 21:30（phuket101）',price:'帖子样本：人均 300–600 THB（phuket101/eatingthaifood）',transit:'普吉老城核心，住老城可步行到达',action:'前米其林必比登（2019–2024）；必点 Moo Hong 红烧猪肉和蟹肉咖喱配米粉；午晚饭点排队，错峰 11 点前或 14 点后去',verification:'2026-09-16 核验：phuket101'},
 'Tu Kab Khao':{address:'8 Phang Nga Road, Talat Yai, Mueang Phuket, Phuket 83000；老城 Phang Nga 路，龙虾招牌好认',hours:'每日 11:00–21:00（Tripadvisor 店家页；Klook 另标 11:30–23:00，以店内公示为准）',price:'帖子样本：青咖喱配烤饼 THB 250、泰式炒河粉 THB 220（DanielFoodDiary 2026-08 实付）',transit:'普吉老城内，步行/Grab 均可',action:'米其林餐盘转必比登的老字号；招牌蟹肉咖喱配米粉比预期辣，点单先确认辣度；饭点人多要等位，适合做老城第一顿正餐',verification:'2026-09-16 核验：Tripadvisor/博主实付'},
 'Suay':{address:'50/2 Takua Pa Road, Phuket Town，老城内（另有 Cherngtalay 分店：177/99 Baan Wana Park，每日 16:00–23:00）',hours:'每日 17:00–24:00（Frommers；只做晚餐）',price:'媒体样本：主菜 300–700 THB（Frommers）',transit:'老城内步行/Grab；分店在岛中部，需车程',action:'名厨 Noi 的融合菜，柠檬草羊排和牛颊玛莎曼咖喱是招牌，连续多年米其林餐盘；只开晚餐且座位少，旺季提前一天订位',verification:'2026-09-16 核验：Frommers'},
 'Acqua':{address:'324/15 Prabaramee Road, Kalim Bay, Patong, Kathu, Phuket 83100；芭东以北 Kalim 湾海边',hours:'每日 16:00–23:00（Tripadvisor）',transit:'芭东–卡马拉沿海路上，Grab 约 10 分钟可达芭东；自驾有停车位',action:'米其林指南推荐的撒丁岛意餐；一条点评样本提醒账单另加约 17% 服务费与税，点单结账前先核对明细再签字',verification:'2026-09-16 核验：Tripadvisor'},
 'Kan Eang@Pier':{address:'44/1 Moo 5, Wiset Road, Chalong, Phuket 83130；查龙码头旁，面查龙湾',hours:'每日 10:00–23:00（Tripadvisor/Pelago）',price:'OTA样本：套餐 THB 1,137.83 起（Traveloka）/ USD 24.02 起（Pelago）',transit:'查龙湾位置偏，Grab 或包车前往；Pelago 套餐可选酒店接送，Rawai/Nai Harn/Chalong/Cape Panwa/Siray Bay 接送另加 THB 300',action:'查龙码头海景海鲜大排档，看日落 17:00 后到；点生腌认准当日鲜货，套餐先看清是否含接送与附加费',verification:'2026-09-16 核验：Tripadvisor/Pelago'},
 'Roti Taew Nam':{address:'6 Thep Krasattri Rd, Talat Yai, Mueang Phuket, Phuket 83000；Thep Krasattri 与 Thalang 路口附近，老城',hours:'早市为主约 07:00–12:00（phuket101；部分来源称 06:00 开，另有晚市 18:00–22:00 未经确认）',price:'菜单样本：素饼 THB 20、加蛋饼 20–40、咖喱 50–60、泰式奶茶/咖啡 20–30（phuket101）',transit:'老城内步行可达；早上市内 Grab 也好叫车',action:'只做早餐的炭火烤饼传奇（米其林必比登 2019–2020），11 点前到否则卖完；“两饼一蛋 2:1”是经典点法，配鸡肉玛莎曼咖喱',verification:'2026-09-16 核验：phuket101/Wongnai'},
 '攀牙湾':{address:'普吉东北约 30 公里海域（phuket101）；一日游通常从普吉东岸码头出发（如 Royal Phuket Marina、Bang Rong 码头一带，具体看所选团行程单）',hours:'一日游多为全天 8–9 小时、含酒店接送（phuket101）',price:'OTA样本：基础拼团约 THB 1,200 起，私家快艇/帆船 THB 5,000+（phuket101）；另一样本：拼团 US$55–110/人，私团 US$560 起/团（Viator）；国家公园门票成人 THB 300、儿童 THB 100，多为另付（Easy Day Phuket）',transit:'一日游基本都含酒店接送，无需自己找码头；住得偏（如拉威/奈汉）可能收接送附加费',action:'船型三选一：大船稳但人多、长尾船慢而有味道、快艇覆盖多但颠簸；易晕船选大船+提前吃晕船药坐船尾中部；想避人选 08:00 前出发的早班团，詹姆斯·邦德岛 10 点后旅行团扎堆',schedule:'多为 08:00 出发–16:30 返回（Expedia 样本行程）',verification:'2026-09-16 核验：phuket101/Viator'},
 'Eastern & Oriental Hotel':{address:'10 Lebuh Farquhar, 10200 George Town, Penang；1885年创立的海峡殖民地式地标酒店，世遗核心区内面海',price:'OTA样本：入门房约 USD 138–167/晚起，旺季约 USD 220+/晚（2026年8月博主实测）；房价随日期浮动大',transit:'乔治市老城区步行可达，距 Fort Cornwallis 约1.1km；距槟城国际机场约16km，Grab约30分钟',action:'想体验殖民地风情选遗产翼（Heritage Wing）房型，下单前先确认房型归属；两翼各有一个泳池，胜利翼顶楼无边泳池看海峡日落'},
 'Cheong Fatt Tze Mansion':{address:'14 Lebuh Leith (Leith Street), 10200 George Town；“蓝屋”，客家富豪街一带',hours:'官网每日导览 11:00、14:00、15:30，每团约45分钟；部分区域仅对住客开放',price:'官网价：成人 RM25/位（含GST），12岁以下儿童 RM12.50/位',transit:'乔治市老城区内步行可达，邻近唐人街；Grab定位 Lebuh Leith 即可',action:'只能跟导览进，官网提前订票，现场排队每团限人数可能扑空；自助语音导览需自带耳机和手机，11:00–18:00可入场'},
 'The Prestige Hotel Penang':{address:'8 Gat Lebuh Gereja, 10300 George Town；UNESCO核心区内，Fort Cornwallis 步行约5分钟',price:'OTA样本：约 RM 492–524/晚起（含税费，2026年9月 Expedia/Klook 样本）；自助早餐另收费约 RM48.6/成人',transit:'距机场约16.1km，Grab约30分钟；Pinang Peranakan Mansion 步行约3分钟，娘惹博物馆就在隔壁',action:'Design Hotels 成员，顶楼泳池+世遗街景是卖点；基础房价不含早餐，订房时看清是否含早；位置是逛老城步行圈的最佳据点之一'},
 'Siam Road Char Kway Teow':{address:'82 Jalan Siam, 10400 George Town；Siam Road 与 Anson Road 路口，Hock Ban Hin 咖啡店对面',hours:'周二至周六 12:00–18:00（周六有源记10:00开），周日、周一休息；卖完提前收',price:'RM8–11/碟（美食博主2025实测）',transit:'乔治市内 Grab/步行；路边摊，附近停车难',action:'米其林必比登，炭火炒粿条；12点开档前就开始排队，高峰等1–2小时是常态，备现金，13:30后错峰队会短些；排队是实体队，一个人占座一个人排更省事'},
 'Air Itam Bisu Laksa':{address:'Air Itam Market Food Court, Jalan Pasar, 11500 Air Itam；在 Air Itam 巴刹美食中心内，极乐寺山脚',hours:'约10:00–17:00（商家页标注周三至周日营业）；只开白天，卖完即止',price:'RM4.50/碗（本地美食博客实测）',transit:'乔治市开车约20–30分钟；Rapid Penang 巴士 201/202/203/204/206 到 Ayer Itam Market；可与极乐寺（Kek Lok Si）串成半日游',action:'巴刹里本地人认的“非网红那家”：认准 Bisu Laksa 招牌，别和路口另一家老字号（只开每月三个周末）搞混；上午去料最足，备现金，先点单再找位'},
 'Penang Road Teochew Chendul':{address:'27 & 29 Lebuh Keng Kwee, 10100 George Town；Penang Road 旁小巷口',hours:'工作日约10:30–19:00，周末约10:00–19:30；只收现金',price:'RM5.50/碗（2026年博主实测）',transit:'乔治市世遗核心区步行可达；隔壁几步就是 Penang Road Famous Laksa，可顺路一起吃',action:'排队前先看清门牌27–29号，别排错隔壁另一家（排错也无妨，味道也不错）；队伍长但走得快，适合饭后甜点顺路吃'},
 'Hameediyah':{address:'164A Lebuh Campbell (Campbell Street), 10100 George Town；Chowrasta 巴刹、光大（KOMTAR）步行范围内',hours:'约10:00–22:00；周五分两段 10:00–13:00、15:00–22:00',price:'一般一盘 RM10–15（Traveloka 2026年槟城nasi kandar行情）；清真认证',transit:'世遗核心区内步行；从光大或小印度方向步行可达',action:'1907年创店、马来西亚最老nasi kandar；点单说“banjir”让店员多浇几种咖喱汁；招牌是炸鸡、羊肉kurma和murtabak，避开周五中午礼拜时段的人流断档'},
 'Nasi Kandar Line Clear':{address:'177 Jalan Penang, 10000 George Town；Jalan Penang 旁的露天小巷，与 Lebuh Chulia 交界附近',hours:'24小时营业',price:'常规一盘约 RM14（Foodveler 博主实测）；鱼头咖喱约 RM60，点贵菜前先问价',transit:'乔治市核心区，Chulia Street 一带步行可达；深夜从酒吧街走过来也方便',action:'24小时深夜食堂属性，但TripAdvisor仅3.6分且多条“游客价”投诉；堂食和打包分开排队，店员加菜手快，贵配菜（鱼头/大虾）先问价，结账看小票'},
 'Au Jardin':{address:'125 Jalan Timah, The Warehouse, Hin Bus Depot, George Town；Hin Bus Depot 文创园区内的旧仓库',hours:'周四至周日 11:30–14:00、17:15–22:00；周一至周三休息',price:'媒体样本：午餐4道式 RM388++，晚餐8道式 RM558++（另加税费服务费，菜单每月更换）',transit:'乔治市内 Grab 约10分钟；Hin Bus Depot 园区周末有市集可顺逛',action:'槟城米其林一星，18席小店必须提前官网订位；干草熟成鸭需预订；自带酒开瓶费 RM50/瓶，晚间着装要求长裤有领，不建议带小孩'},
 'CEKI Nyonya':{address:'11-A Jalan Sri Bahari, 10050 George Town；乔治市老城区',hours:'周一、周三至周日 11:30–15:00、17:30–22:00；周二休息',price:'人均 RM20–50（美食博主样本）；热门菜 RM28–60，海鲜按时价',transit:'乔治市老城区内步行/Grab可达',action:'家庭式娘惹菜，Jiu Hu Char 和 Tau Yew Bak 是必点；海鲜类点单前先问时价；位置不多，晚餐建议电话或脸书提前订'},
 'Green House Prawn Mee':{address:'133A Jalan Burma, 10050 George Town；Burma Road 街角（注意别走到223号的 Old Green House，那是傍晚场）',hours:'约09:00起至深夜（商家页标注09:30–01:30）；米其林必比登',price:'小碗 RM9、大碗 RM10（2026年博主实测）；加料 RM2–4.50',transit:'乔治市内 Grab/步行；Burma Road 一带',action:'133A与223号Old Green House是两家店，别跑错；只收现金；汤头偏甜偏油，嗜辣记得把sambal拌进去，另可加otak-otak和loh bak拼单'},
 '乔治市世遗核心区':{address:'核心区约109.38公顷，2008年7月7日列入UNESCO；主干道 Lebuh Pantai、Jalan Masjid Kapitan Keling、Lorong Love、Pengkalan Weld 一带，区内1700+栋历史建筑',hours:'街区全天开放；各景点/摊位时间不一',transit:'整个世遗区约2.5平方公里，全程步行/三轮车最合适；机场到乔治市 Grab 约30分钟',action:'按“和谐街—小印度—Armenian街壁画—姓氏桥”顺时针走最顺；壁画集中在Armenian Street一带，Khoo Kongsi 和姓氏桥（Chew Jetty）是两大必看点；街上多为步行，备好防晒和水'},
 '137 Pillars House':{address:'2 Soi 1, Nawatgate Road, Tambon Watgate, Muang Chiang Mai 50000, Thailand；古城东侧 Wat Gate 滨河区，塔佩门车程约5分钟',hours:'入住15:00起、退房12:00前（Expedia 样本）',price:'OTA样本：Expedia 2026年9月显示 ฿14,250/晚起（2成人，不含税费）',transit:'古城东侧滨河区，距夜市与塔佩门车程约5分钟（OTA样本）；打车/Grab前往',action:'1880年代柚木老宅改建的30间套房精品酒店，每间配管家；旧评价提过蚊虫与隔音问题，备好驱蚊水，浅眠者先问安静房型',verification:'官网地址+OTA入住退房与价格交叉核实'},
 'Four Seasons Resort Chiang Mai':{address:'502 Moo 1, Mae Rim-Samoeng Old Road, Mae Rim, Chiang Mai 50180, Thailand；Mae Rim 山谷稻田区，古城以北约30分钟车程',hours:'入住15:00起、退房12:00前（KAYAK 样本）',transit:'远离市区的田园度假区，距古城车程约30分钟，距机场约21分钟（OTA样本）；建议包车或酒店接送',action:'适合住下来不挪窝的稻田度假村；Rim Tai Kitchen 与招牌体验（水牛 bathing、扎染、陶艺）提前订；稻田景观房值得加钱',verification:'官网地址+OTA交叉核实；价格无THB样本已省略'},
 'Raya Heritage':{address:'157 Moo 6, Tambol Donkaew, Amphoe Mae Rim, Chiang Mai 50180, Thailand；Mae Rim 滨河（Ping River），古城以北约20分钟车程',transit:'位置偏，TripAdvisor 提示建议自驾；距机场约8.7公里，打车/Grab前往',action:'设计酒店代表作，兰纳极简风+滨河庭院；Khu Khao 餐厅每天11:30–23:00，非住客也可去吃；多带私人泳池房型，订房时认准',verification:'官网factsheet地址；价格与入住时间无可靠样本已省略'},
 'Kiti Panit':{address:'19 Tha Phae Road, Chiang Mai 50100；塔佩路，古城东侧塔佩门外',hours:'官网：周三至周一 11:30–15:00、17:00–22:00（21:30最后点单）；周二闭店',price:'帖子样本：两人正餐约2,000–2,600 THB（含酒水，TripAdvisor点评口径）',transit:'塔佩门步行可达，古城东侧',action:'1888年百年中式大宅里的精致兰纳菜，适合把第一顿正餐留给它；晚餐建议提前订位；避雷：调味偏重咸辣，别按街头小吃标准期待分量',verification:'官网营业时间+多来源价格交叉核实'},
 'Khao Soi Khun Yai':{address:'Sri Poom 8 Alley, Chiang Mai 50200；古城北门外 Sri Poom 路小巷，Wat Kuan Kama 旁',hours:'周一至周六10:00–14:00，周日休息（TripAdvisor）；卖完提前打烊',price:'帖子样本：每碗约50–60 THB',transit:'古城北门外步行/骑行可达；无英文招牌，认橙色牌子',action:'只做午市的咖喱面老店，11点前到不用排长队；点单只说鸡肉/牛肉/猪肉；免费饮水自取，吃完到柜台结账；避雷：周日不开，下午去大概率扑空',verification:'TripAdvisor营业时间+点评价格；与expatsthai时间口径有差异已标注'},
 'Huen Phen':{address:'112 Rachamankha Rd, Chiang Mai 50200；古城内，Wat Chedi Luang 南侧',hours:'每天 8:30–16:30、17:00–22:00 两段（TripAdvisor）',price:'帖子样本：主菜约50–160 THB（Frommers 口径）',transit:'古城内步行可达',action:'午市店和晚市店是隔20米的两家：白天吃 khao soi，晚上去古董屋吃正餐；避雷：TripAdvisor 3.6分近年口碑分化，名气大于稳定性，多看近期评价再决定',verification:'TripAdvisor+Frommers+eatingthaifood交叉核实'},
 'Khao Kha Moo Chang Phueak':{address:'Manee Nop Parat, Sri Poom, Chiang Mai 50200；昌普克门（古城北门）外夜市，护城河北侧',hours:'每天 17:00–02:00（TripAdvisor+eatingthaifood）',price:'帖子样本：大份约80 THB（2025年11月点评）',transit:'昌普克门夜市，晚间打车/Grab前往',action:'戴牛仔帽老板娘的猪脚饭，Bourdain背书过的夜宵摊；加卤蛋+蒜头辣椒是标准吃法；人多时直接找店员加单不用重新排队；避雷：只开晚上，白天想吃去 Mun Mueang 路分店（8:00–17:00）',verification:'TripAdvisor+eatingthaifood交叉核实'},
 'SP Chicken':{address:'9/1 Sam Larn Soi 1, Phra Singh, Chiang Mai；古城西侧，Wat Phra Singh 附近',hours:'TripAdvisor列每天10:00–17:00；Frommers称每天11:00–21:00（有出入，按白天去）',price:'帖子样本：半只鸡+配菜两人约200 THB内；只收现金',transit:'古城西侧步行可达（Wat Phra Singh 附近）',action:'米其林指南收录的炭火烤鸡小店，鸡个头小可直接点整只；热门菜卖完收摊，赶早不赶晚；只收现金，备好零钱',verification:'多来源交叉，营业时间有冲突已并列标注'},
 'Tong Tem Toh':{address:'11 Nimmanahaeminda Road Soi 13, Chiang Mai 50200；宁曼路13巷',hours:'周日–周五 8:00–23:00，周六 8:00–24:00（TripAdvisor，2026年9月抓取）',price:'帖子样本：人均约200–300 THB',transit:'宁曼路商圈，Grab/双条车可达',action:'宁曼区本地人也排队的兰纳菜大排档，到店先取号；必点 sai ua 香肠和烤猪肋排；默认偏辣，不吃辣点单时说明；避雷：名气大但出品不稳定，按招牌菜点别乱试',verification:'TripAdvisor+eatingthaifood+restaurantguru交叉核实'},
 'Dash! Restaurant':{address:'38/2 Moon Muang Road Soi 2, Chiang Mai 50200（Dash Teak House）；古城内 Moon Muang 路2巷',hours:'周一至周六 10:00–14:00、17:30–21:30（TripAdvisor）；周日未列，可能休息',price:'帖子样本：每道约200 THB；只收现金',transit:'古城内步行可达',action:'老板Dash本人迎宾、母亲掌勺的泰国家常菜+鸡尾酒；晚餐常满座，建议提前订位；只收现金备好现金；避雷：周日可能不开，出行前先确认',verification:'TripAdvisor营业时间+点评价格'},
 'Ginger Farm Kitchen':{address:'One Nimman, Nimmanahaeminda Road, Chiang Mai 50200；宁曼路 One Nimman（宁曼壹号）商场内',hours:'每天 11:00–22:00（TripAdvisor；restaurantguru称至23:00）',price:'第三方聚合样本：人均约400–600 THB（restaurantguru口径）',transit:'宁曼壹号商场，宁曼路商圈',action:'米其林Bib Gourmand，有机农场直供是卖点，点招牌菜（脆皮猪、khao soi、木瓜沙拉）；避雷：近年英文点评两极，有“游客店”批评，别抱米其林期待',verification:'TripAdvisor+restaurantguru交叉；价格无官网样本'},
 '双龙寺':{address:'Doi Suthep 山顶，古城以西约15公里，海拔约1,073米',hours:'每日约 06:00–18:00（部分来源称至20:00）',price:'多来源样本：外国人门票约30 THB，缆车约50 THB',transit:'古城打车上山约30–45分钟；红色双条车单程约40–60 THB（Chiang Mai Zoo/Huay Kaew路一带拼车）；可与蒲屏皇宫、Wat Pha Lat串联',action:'着装遮肩盖膝，门口可借纱笼，上层平台需脱鞋；309级那伽楼梯或坐缆车上；8点前进山避旅行团+看云海；下山顺路逛 Wat Pha Lat',verification:'traveltriangle+novacircle+Trip.com游记多来源交叉'},
 'Park Hyatt Saigon':{address:'2 Lam Son Square, District 1；Lam Son 广场，歌剧院旁，步行约1分钟到西贡歌剧院',hours:'帖子未注明；OTA 标注入住15:00/退房12:00',price:'OTA 样本：约 $235–242/晚起（KAYAK/HotelsCombined 2026-09-16 数据）',transit:'歌剧院步行约1分钟；滨城市场约1.1 km；Nguyen Hue 步行街约670 m',action:'第一郡最中心的奢华旗舰，与歌剧院同街区，周边全步行可达；顶层有室外泳池，早到房间未备好可先在泳池/大堂吧消磨',verification:'2026-09-16 核实'},
 'The Reverie Saigon':{address:'22-36 Nguyen Hue Boulevard（57-69F Dong Khoi Street），District 1；阮惠步行街正街上',hours:'OTA 标注入住14:00/退房12:00',price:'OTA 样本：约 $104/晚起（KAYAK），Klook 30天最低 US$201.66/晚',transit:'阮惠步行街正街，步行约5分钟到歌剧院，滨城市场约1.1 km',action:'步行街沿线最豪华的一家，房间看步行街夜景优先要高层；旺季价格波动大，提前比价再订',verification:'2026-09-16 核实'},
 'Caravelle Saigon':{address:'19-23 Lam Son Square, District 1；Lam Son 广场，与 Park Hyatt 同街区',hours:'OTA 标注入住14:00/退房12:00',price:'OTA 样本：约 $125/晚起、平均约 $176/晚（momondo）；Klook 30天最低 US$168.78/晚',transit:'西贡歌剧院对面步行不到100 m；与 Park Hyatt 同在 Lam Son 广场',action:'1959年开业的老牌五星，翻新过，位置与 Park Hyatt 几乎等同但价格低一档；要景观房认准歌剧院方向',verification:'2026-09-16 核实'},
 'Anan Saigon':{address:'89 Ton That Dam Street, Ho Chi Minh City 710000；第一郡中央市场区 Ton That Dam 街89号老楼内',hours:'周二至周日 17:00–23:00，周一闭店（TripAdvisor 标注）',price:'帖子样本：米其林一星品尝菜单约 $100 USD/位',transit:'第一郡中心市场区内，距 The Reverie Saigon 步行可达',action:'米其林一星，提前数周发邮件订位；品尝菜单需提前预订，临时到店可能被安排在外廊等座；楼上 Nhau Nhau 酒吧可顺路喝一杯',verification:'2026-09-16 核实'},
 'Pot au Pho':{address:'3F, 89 Tôn Thất Đạm, Bến Nghé, District 1；与 Anan Saigon 同一栋楼3楼，Anan 主厨的分子料理河粉店',hours:'17:00–23:00，周一闭店（评测标注）',price:'帖子样本：约 $100 USD/位的“百元河粉”',transit:'与 Anan 同楼，第一郡中心市场区，Grab 定位 Tôn Thất Đạm 89号',action:'Anan 主厨做的创意高端河粉，价格是普通河粉的几十倍，定位是“体验”不是“吃饱”；只开晚市，周一别跑空',verification:'2026-09-16 核实'},
 'Cuc Gach Quan':{address:'10 Dang Tat, Ward Tan Dinh, District 1；第一郡 Tan Dinh 区 Dang Tat 街10号',hours:'每日 9:00–23:30（TripAdvisor 标注）',price:'帖子样本：两人约 1,000,000+ VND，人均约 500,000 VND',transit:'第一郡内，距中心景点区打 Grab 约5–10分钟',action:'老宅改建的越南风情院子餐厅，环境是卖点；菜单厚如圣经，提前想好要什么；适合安排一顿从容的晚餐而非赶行程',verification:'2026-09-16 核实'},
 'The Deck Saigon':{address:'38 Nguyen U Di, Thao Dien, District 2；第二郡 Thao Dien，西贡河畔',hours:'多来源不一：8:00–23:00（tabelog）/9:00–24:00（guidevietnam），以现场为准',price:'指南样本：菜品 100,000–400,000 VND/道；Happy hour 16:00–18:00',transit:'第二郡，从第一郡打车约15–20分钟；餐厅可订快艇往返接送（2人 VND 2,750,000 含迎宾饮品）',action:'河畔日落位是灵魂，傍晚去并卡 16:00–18:00 happy hour；入口隐蔽不好找，留足打车时间',verification:'2026-09-16 核实'},
 'Pho Hoa Pasteur':{address:'260C Pasteur Street, Ward 8, District 3；第三郡 Pasteur 街260C号，粉红教堂步行可达',hours:'每日 6:00–22:30（Trip.com/TripAdvisor 标注）',price:'帖子样本：大份牛肉粉约 2.5 美元/碗',transit:'第三郡，从第一郡 Grab 约5–10分钟；粉红教堂步行约20分钟',action:'楼高三层，楼下满了直接上楼，空调区在楼上；晚餐时段要等位，错峰（早午餐/下午）最省事；香草撕碎拌进汤，越南辣椒极辣量力加',verification:'2026-09-16 核实'},
 'Banh Mi Huynh Hoa':{address:'26 Le Thi Rieng, Ben Thanh Ward, District 1；第一郡滨城坊 Lê Thị Riêng 街26号',hours:'来源冲突：TripAdvisor 标 6:00–22:00，本地博主称通常约14:00才开门；傍晚去最稳',price:'本地指南样本：招牌特别版约 60,000–70,000 VND/个',transit:'第一郡中心，滨城市场步行圈内',action:'排队策略：高峰排队可达1小时，避开正餐点、选14:00–16:00人少时段；一个分量顶两个普通法棍，馅料9–10种，两人分一个也够；只做外带，买完去附近小公园吃',verification:'2026-09-16 核实'},
 'Com Tam Ba Ghien':{address:'84 Dang Van Ngu, Phường 10, Phú Nhuận；富润郡 Dang Van Ngu 街84号（注意不在第一郡）',hours:'来源冲突：TripAdvisor 标 8:00–20:30，本地媒体称 7:30–21:30',price:'帖子/本地媒体样本：40,000–65,000 VND/份（博主实测 48,000 VND 含冰茶）',transit:'富润郡，第一郡出发 Grab 约10–15分钟',action:'米其林必比登碎米饭，炭烤猪排是招牌；本地人也排队，中午/傍晚饭点早去；店面小有炭火烟味，介意者选外带',verification:'2026-09-16 核实'},
 'The Workshop Coffee':{address:'27 Ngo Duc Ke Street, District 1（2楼）；第一郡吴德继街27号旧楼2楼，入口极低调',hours:'来源冲突：TripAdvisor 标 8:00–21:00，Trip.com/官方页标 8:00–20:30',price:'帖子样本：英式早餐 150,000 VND，柠檬瑞可塔松饼 120,000 VND',transit:'第一郡中心，步行街/歌剧院步行圈内',action:'别被一楼机车停车场入口劝退，直接上楼别有洞天；工业风大空间适合带电脑办公；招牌越南盐咖啡值得一点',verification:'2026-09-16 核实'},
 'Cong Caphe':{address:'第一郡中心店 26/15 Lý Tự Trọng, Bến Nghé, District 1；另有 Đồng Khởi 店（Vincom B, 72 Lê Thánh Tôn）',hours:'Lý Tự Trọng 店 7:00–23:00（tabelog），Đồng Khởi 店 7:30–22:00',price:'旅行指南样本：平均约 45,000–65,000 VND/杯（连锁统一价位带）',transit:'第一郡多家分店，滨城市场/步行街步行圈内都有',action:'招牌必点椰子咖啡和 Bac Xiu；复古军装风装修本身就是打卡点；热门店下午人多，想清静选上午',verification:'2026-09-16 核实'},
 '滨城市场':{address:'Le Loi, Ben Thanh Ward, District 1；第一郡滨城坊黎利街，市中心地标',hours:'市场全天开放；日场约6:00–18:00，夜市约18:00–22:00，各摊位时间不一',price:'讲价样本：摊主预期讲价，Klook 攻略建议从开价一半起砍',transit:'第一郡中心，步行可达；距 Saigon Square 约250 m；周边可串联中央邮局、独立宫',action:'讲价幅度：先砍到开价一半再慢慢谈，绝不付首报价；早上去人少摊主好说话；食品区拉客积极，不想买就摆手走开；带现金、看好随身物品',verification:'2026-09-16 核实'},
'吉姆·汤普森之家':{address:'6/1 Soi Kasemsan 2, Rama 1 Road, Pathumwan, Bangkok 10330, Thailand',hours:'每日 10:00–17:00（Art Center 开到 18:00）',price:'成人 250 泰铢 / 10–21 岁 150 泰铢（凭 ID）/ 10 岁以下免费',transit:'BTS National Stadium 站 1 号出口步行约 5 分钟；Khlong Saen Saep 运河船 Hua Chang 码头步行约 2 分钟',action:'必须跟导览进主楼（票含 30–45 分钟导览，有中文）；室内拍照新规允许无闪光拍摄、但禁闪光灯/视频/摆拍，老导游仍可能说禁拍，按现场导游口径为准；末班场次经常满位，建议早到（导览本身约30–45分钟）',verification:'已核验 2026-09-16'},
'Baan Kang Wat':{address:'191 Soi 6 Raksa, Ban Ram Poeng Road, Suthep, Mueang Chiang Mai',hours:'周二至周日 11:00–18:00，周一闭园；周末市集周六日 8:00–13:00',price:'免费入场（帖子样本）',transit:'市区红色双条车或 Grab，约 7 公里，tuk-tuk 样本价 150–180 泰铢',action:'周一别去；想逛市集周日 8:00 前到；工作日人少；小店多只收现金',verification:'已核验 2026-09-16'},
'乌蒙寺':{address:'135 Suthep, Chiang Mai 50200, Thailand',hours:'每日 4:00–20:00',price:'免费入场，接受捐赠（帖子样本）',transit:'tuk-tuk / 双条车，距清迈大学很近，可与素贴寺顺路',action:'隧道古寺（约700年兰纳遗迹），游隧道与湖边喂鱼；遮盖肩膝、保持安静；建议早上8–11点去',verification:'已核验 2026-09-16'},
'周日步行街':{address:'Rachadamnoen Road, Si Phum, Chiang Mai 50200（塔佩门至帕辛寺段）',hours:'仅周日约 17:00–22:00（封街步行，摊位陆续出摊）',price:'免费开放；具体项目另计',transit:'古城内步行可达；古城外乘双条车/Grab 到塔佩门',action:'只在周日傍晚开，17:00左右到人少好逛；全长约1公里穿舒适鞋；价格可砍价；周六晚是长康路步行街别跑错',verification:'已核验 2026-09-16'},
'因他农国家公园':{address:'清迈西南约120公里，最高峰2565米',hours:'每日 5:30–18:30；Kew Mae Pan 步道每年6–10月关闭',price:'外国人门票300泰铢/成人、150泰铢/儿童（第三方来源样本）；汽车另收30泰铢；皇家双塔另收100泰铢/人',transit:'最省心报清迈出发一日游（含酒店接送）；公共双条车需换乘2.5–3小时以上不推荐',action:'山上景点分散必须包车/跟团，步行不现实；山顶最低约5℃带保暖衣和雨具；避开宋干节等长假（堵车）',verification:'已核验 2026-09-16'},
'大象自然公园':{address:'清迈以北约60公里 Mae Taeng 山谷（约90分钟车程）；不可自行前往，必须预约',hours:'按预约项目时间（半日游7:30–8:00/12:00接客）；每日限流，需提前1–3周预订',price:'官网价（泰铢）：半日游2500/人；SkyWalk全日游3500/人；2天1夜5800/人；Sunshine for Elephants 3500/人；Walking with Elephants 3500/人（不接待儿童）；Elephant Highlands/Care for Elephants 6000/人（不接待儿童）；一周义工15000/人；均含酒店往返接送、餐食、向导、保险',transit:'只能通过官网或市区办公室预订项目，费用含清迈酒店往返接送；不接受自行前往',action:'官网提前数周预订（每日限流）；真正无骑乘无表演的庇护所，认准官方渠道，避开名字相似的"大象营"',verification:'已核验 2026-09-16'},
'契迪龙寺':{address:'103 Prapokklao Road, Si Phum, Mueang Chiang Mai 50200',hours:'每日约6:00–18:00（售票参观区；寺院大院可至更晚）',price:'外国人约50泰铢/成人、20泰铢/儿童，泰国人免费（帖子样本，各来源40–50泰铢浮动，以现场为准）',transit:'古城内步行可达；古城外乘双条车/tuk-tuk/Grab',action:'肩膀膝盖遮盖、入殿脱鞋，入口可借纱笼；清晨6:00–9:00光线好人少；可顺路周日步行街',verification:'已核验 2026-09-16'},
'宁曼路':{address:'Nimmanhaemin Road, Suthep, Mueang Chiang Mai（北起 Huay Kaew 路 Maya 商场路口，向南延伸）',hours:'公共街道无开放时间；One Nimman 商场11:00–22:00（沿街店铺无统一营业时间来源）',price:'免费开放；具体项目另计',transit:'古城乘红色双条车（跟司机说 Nimman / Nimman Soi 1），古城出发约30–40泰铢/人；tuk-tuk/Grab',action:'咖啡馆/买手店/文创聚集区，适合傍晚散步加晚餐；One Nimman 庭院周一/周二16:00起有跳蚤市集',verification:'已核验 2026-09-16'},
'帕辛寺':{address:'2 Sam Lan Road, Si Phum, Mueang Chiang Mai',hours:'每日约6:00–17:00（建筑开放；大院可至黄昏；一来源记约06:00–18:00）',price:'外国人约20–40泰铢（Lai Kham 小堂约40泰铢），泰国人免费（帖子样本）',transit:'古城内步行可达（塔佩门沿 Ratchadamnoen 路向西约1.2公里）；古城外乘双条车/tuk-tuk',action:'肩膀膝盖遮盖、入殿脱鞋，门口可借纱笼；必看 Lai Kham 小堂19世纪兰纳壁画；与契迪龙寺步行10分钟可串游；早7:00–9:00光线好人少',verification:'已核验 2026-09-16'},
'瓦洛洛市场':{address:'Wichayanon Rd, Nawarat 桥北，滨河西侧，Chiang Mai 50300',hours:'周一二三五六日 4:00–19:00，周四 4:00–17:00',price:'免费开放；具体项目另计',transit:'古城乘 tuk-tuk / 双条车 / Grab 前往滨河区',action:'本地人传统市场，适合买果干/干货/伴手礼可砍价；早上4点开市早去生鲜最全；晚上外围变夜市约20:00最热闹；气味大，鼻敏感者慎入',verification:'已核验 2026-09-16'},
'Bitexco 观景台':{address:'Bitexco 金融塔，Hồ Tùng Mậu 36 号，Bến Nghé（票务页地址；楼体官方地址为 Hải Triều 2 号，观景台换票柜台在 4 层 Hải Triều 入口）',hours:'每日 9:30–21:30（售票柜台约 20:45 停止售票；最晚入场为闭馆前 45 分钟）',price:'约240,000 VND/成人（OTA 样本，Klook 同产品约 NT$295）；4 岁以下免费，4–12 岁及 65 岁以上有优惠',transit:'第一郡核心位置，可步行至阮惠步行街；坐 Grab 最方便；机场 109 路公交可到附近',action:'选傍晚时段可一次看日落+夜景，提前到避免 20:45 后买不到票；观景台内禁饮食、禁宠物；工作日人比周末少',verification:'已核验 2026-09-16'},
'中央邮局':{address:'Công xã Paris 2 号，Bến Nghé，District 1（红教堂正对面）',hours:'平日约 7:30–19:00，周末约 8:00–18:00（各来源略有出入；bring-you 记为 8:00–17:00）',price:'免费开放；纪念品与邮票另计',transit:'与红教堂隔街相望步行 2 分钟；第一郡内步行可达；公交 36 路到 Công xã Paris 站；Grab 方便',action:'建议早上 8 点左右去，避开大型旅行团好拍照；可在里面买明信片寄出，国际邮资另付；内部仍是营业邮局，拍照别挡工作人员',verification:'已核验 2026-09-16'},
'古芝地道':{address:'胡志明市古芝县，距市区西北约 50 公里；双入口 Ben Dinh（近）/ Ben Duoc（远）',hours:'每日 7:00–17:00（售票柜台约 16:00 左右关闭）',price:'门票 Ben Dinh 110,000 VND/人，Ben Duoc 90,000 VND/人（航司官网价口径）；实弹射击 60,000 VND/发（最少 600,000 VND 起，帖子样本，费用自理）；Klook 中文导览半日团约 NT$526/人（OTA 样本；多页面组合信息，含第一郡酒店接送）',transit:'最省心报半日团（第一郡酒店 7:30 接、约 14:30 返）；自助可坐公交但需转车、单程约2–3小时，或 Grab 包车前往',action:'报半日团足够（含接送+讲解+门票），建议选上午团避开正午暴晒；隧道低矮狭窄，幽闭恐惧/腰背不适者只参观地面展区即可',verification:'已核验 2026-09-16'},
'同起街':{address:'Đồng Khởi Street，District 1（从红教堂前巴黎公社广场到西贡河 Tôn Đức Thắng，长约630米（一来源记0.6英里约1公里））',hours:'全天开放（街道无门票无闭馆）',price:'免费开放；具体项目另计',transit:'红教堂、中央邮局、歌剧院均在步行范围内；Grab 方便',action:'胡志明最高端购物街（奢侈品店、歌剧院、老牌酒店），适合傍晚散步+看歌剧院夜景；街道单向通行，过马路注意车流',verification:'已核验 2026-09-16'},
'堤岸唐人街':{address:'Chợ Lớn 华人区，横跨第五、六郡；核心地标平西市场 57A Tháp Mười，District 6',hours:'街道全天开放；平西市场约 7:00–18:00',price:'免费开放；具体项目另计',transit:'距第一郡约 5–6 公里，Grab 约 15–20 分钟（约 30,000–50,000 VND 样本）；公交 1 路从滨城市场约 40 分钟（帖子样本，票价 5,000 VND）',action:'批发市场偏本地生活气，游客重点看中式庙宇、吃粤式点心烧腊；寺庙着装需遮肩盖膝；人多注意随身物品',verification:'已核验 2026-09-16'},
'战争遗迹博物馆':{address:'Võ Văn Tần 28 号，Ward 6，District 3',hours:'每日 7:30–17:30（售票柜台约 17:30 关闭）',price:'40,000 VND/成人（官网价口径；6–15 岁儿童 20,000 VND，6 岁以下免费；Trip.com 售约 TWD61）',transit:'第一郡 Grab/出租车约 10–15 分钟',action:'建议 8 点开馆即去避开旅行团，留1.5–3小时（一来源记1.5–2h，一来源记2–3小时）；户外军机展区下午光线好适合拍照',verification:'已核验 2026-09-16'},
'玉皇殿':{address:'Mai Thi Luu 73 号，Đa Kao，District 1',hours:'每日 7:00–18:00；农历初一、十五延长至约 5:00–19:00（法语来源记平日 7:00–17:30）',price:'免费开放；香油钱随喜',transit:'独立宫以北约 1.5 公里，Grab 约 10 分钟（约 50,000 VND 样本）；公交 18/93/150 路可达',action:'寺庙着装：遮肩盖膝，入内殿需脱鞋；殿内禁止拍照（室外可拍）；早上去人少，农历初一十五香客极多建议避开',verification:'已核验 2026-09-16'},
'红教堂':{address:'Công xã Paris 1 号，Bến Nghé，District 1（中央邮局正对面）',hours:'每日 8:00–11:00、15:00–16:00 开放参观（中午闭馆）；弥撒时间另行安排',price:'免费开放；具体项目另计',transit:'中央邮局正对面，过马路 2 分钟；第一郡中心步行可达；公交 36 路到 Công xã Paris 站',action:'2017 年起大修、预计 2027 年底完工，目前外观有脚手架——以拍建筑外观+搭配中央邮局半日游为主；中午闭馆别白跑，早上绕教堂一周光线最好',verification:'已核验 2026-09-16'},
'统一宫':{address:'Nam Kỳ Khởi Nghĩa 135 号，Bến Thành，District 1（另有 Nguyen Du 106 号门）',hours:'参观每日 7:00–18:00（官网 2025-08-01 起；Nguyen Du 门 8:00–16:00）',price:'官网价：通票（含展览）成人 80,000 VND，仅宫殿 40,000 VND，电瓶车 25,000 VND/人·次',transit:'距红教堂、中央邮局步行约 10 分钟；第一郡内 Grab 方便',action:'建议早上早去并蹭多语言免费讲解（有提供时）；留 1.5–2.5 小时，地下战时指挥中心是精华别错过',verification:'已核验 2026-09-16'},
'阮惠步行街':{address:'Nguyễn Huệ Street，Ben Nghe，District 1（从市政厅到西贡河滨，长 670 米、宽 64 米）',hours:'全天开放；周六、日 18:00–22:00 机动车禁行变为纯步行街',price:'免费开放；具体项目另计',transit:'第一郡核心，步行串联同起街、Bitexco；地铁 1 号线歌剧院站可达；Grab 方便',action:'晚上去最有氛围，周末封街后最佳',verification:'已核验 2026-09-16'},
'中央市场':{address:'Jalan Tun Tan Cheng Lock 与 Jalan Hang Kasturi 步行街交界，50050 Kuala Lumpur',hours:'每日10:00–22:00（一来源记10:00–20:00）',price:'免费入场；购物消费另计',transit:'LRT Kelana Jaya线至Pasar Seni站步行约5分钟；LRT Ampang线至Masjid Jamek站步行约10分钟；Go KL紫线巴士',action:'工作日去避开周末人流；摊位可砍价；注意洗手间收费',verification:'已核验 2026-09-16'},
'伊斯兰艺术博物馆':{address:'Jalan Lembah Perdana, Tasik Perdana, 50480 Kuala Lumpur',hours:'每日9:30–18:00（Hari Raya Puasa与Hari Raya Haji闭馆）',price:'成人RM20、学生/老人RM10、6岁以下免费（2024年博客样本）',transit:'LRT至Pasar Seni站步行约10分钟；MRT Muzium Negara站步行约20分钟；KL Sentral打车约5分钟',action:'东南亚最大伊斯兰艺术馆，至少预留1.5小时；着装端庄；室内拍照严禁开闪光灯',verification:'已核验 2026-09-16'},
'吉隆坡塔':{address:'No. 2 Jalan Punchak, Off Jalan P Ramlee, 50250 Kuala Lumpur',hours:'每日9:00–22:00',price:'非马来西亚人（博客2026样本）：观测台约RM80/天空甲板约RM140/联票约RM180；OTA样本：RM65.40/RM114.30/RM147——两组来源口径不一',transit:'单轨至Bukit Nanas站步行3–5分钟；LRT至Dang Wangi站步行10–15分钟；Grab约5–10分钟自KLCC',action:'黄昏时段去看日落+夜景；雨天不开Sky Deck；提前网上购票免排队',verification:'已核验 2026-09-16'},
'国家植物园':{address:'Jalan Kebun Bunga, Tasik Perdana, 55100 Kuala Lumpur',hours:'每日7:00–20:00（Tripadvisor一口径记07:00–22:00）',price:'免费入场；园内Bird Park/Butterfly Park等另收费',transit:'KTM Komuter至旧Kuala Lumpur站，步行经国家清真寺；巴士B115/B112/B101步行约5分钟；自KL Sentral步行路难走',action:'早晨或傍晚凉快时去；免费城市绿肺；可经地下通道步行约8分钟串联国家博物馆；园内指示牌少',verification:'已核验 2026-09-16'},
'天后宫':{address:'65 Persiaran Endah, Taman Persiaran Desa, 50460 Kuala Lumpur',hours:'每日9:00–18:00（少数博客记8:00–22:00）',price:'免费入场；捐赠随意',transit:'建议打车/Grab，市区约20–30分钟；在山上；公共交通：LRT至Bangsar或Mid Valley站后再打车',action:'着装端庄：遮肩盖膝，主殿需脱鞋；早晨或日落去拍照光线好',verification:'已核验 2026-09-16'},
'武吉免登':{address:'Jalan Bukit Bintang, Bukit Bintang, 55100 Kuala Lumpur',hours:'街区全天；Jalan Alor美食街排档集中每晚约18:00–次日01:00',price:'免费开放；具体项目另计',transit:'MRT Kajang线Bukit Bintang站；Monorail Bukit Bintang站',action:'晚上去Jalan Alor吃宵夜（摊位约RM10–25/道，拼桌分享）；现金或QR付款；白天逛商场',verification:'已核验 2026-09-16'},
'独立广场':{address:'Jalan Raja, 50050 Kuala Lumpur',hours:'24小时开放',price:'免费开放；具体项目另计',transit:'LRT Kelana Jaya线/Ampang–Sri Petaling线至Masjid Jamek站步行几分钟；或Bandaraya站步行约9分钟',action:'早晨或黄昏蓝调时刻去拍照最美；中午无遮阴很晒',verification:'已核验 2026-09-16'},
'茨厂街':{address:'Jalan Petaling, 50000 Kuala Lumpur',hours:'每日约10:00–22:00（摊位高峰11:00至晚间）',price:'免费开放；具体项目另计',transit:'MRT Kajang线/LRT Kelana Jaya线至Pasar Seni站步行3–5分钟',action:'下午到晚上最热闹；砍价目标约6–7折；看好随身物品；顺路拍Kwai Chai Hong鬼仔巷',verification:'已核验 2026-09-16'},
'黑风洞':{address:'Batu Caves, Gombak, 68100 Kuala Lumpur（市区以北约13公里）',hours:'每日6:00–21:00（主庙洞6:00–21:00）',price:'主庙洞免费；Ramayana Cave RM15；Cave Villa RM15（持MyKad马来西亚人RM7）',transit:'KTM Komuter自KL Sentral直达Batu Caves站约30–40分钟RM2.60，终点即寺庙入口；Grab约RM20、15–25分钟',action:'穿遮肩盖膝服装，入口有sarong出售（按证据为售卖非租赁）；工作日早上9点前去人少凉快；看好食物防猴子抢',verification:'已核验 2026-09-16'},
'Fort Cornwallis':{address:'Jalan Tun Syed Sheh Barakbah, 10200 George Town, Penang',hours:'每日 8:00-20:00，周二提前至 19:00 关门',price:'非 MyKad 持卡人 RM20/人，MyKad 持卡人 RM10/人（仅刷卡，不收现金）——2026-09 网站样本',transit:'乔治市中心步行可达；Rapid Penang 巴士 U102/U104/U105/U204；Hop-on Hop-off 第14站',action:'傍晚去避暴晒，出堡顺路吃傍晚摆摊的街头小吃；周五-周日有导览（10:00/12:00/14:00/16:00）',verification:'已核验 2026-09-16'},
'Khoo Kongsi':{address:'18 Cannon Square（18 Lebuh Cannon）, 10200 George Town, Penang',hours:'每日 9:00-17:00',price:'成人 RM10/人，儿童 RM1/人（现场票价；个别帖子样本写 15 MYR，未采纳）',transit:'壁画街附近步行可达；入口在 Cannon Street 朝 Acheen 街清真寺方向左侧；三条通道：Cannon Street/Beach Street/Armenian Street',action:'清晨或傍晚去避人潮、光线好；和壁画街串一起走；重点看屋顶剪瓷、宗祠与旧戏台',verification:'已核验 2026-09-16'},
'升旗山':{address:'Jalan Stesen Bukit Bendera, Air Itam, 11500 George Town, Penang',hours:'缆车平日 6:30-22:00，周末及公共假期至 23:00',price:'缆车往返普通通道成人 RM30、儿童/学生 RM15（网站样本）；Fast Lane 往返 Expedia OTA 样本约 $22.26 USD/成人；周一至周四 19:00 后半价（样本）',transit:'升旗山缆车（亚洲最长轨道 1996 米）；Rapid 巴士 1/10/91/21；或从乔治市叫 Grab',action:'务必早去避排队，可买 Fast Lane；周一至周四晚 7 点后半价看夜景最划算；与极乐寺同在 Air Itam 可拼一天',verification:'已核验 2026-09-16'},
'卧佛寺与缅寺':{address:'卧佛寺：24 Lorong Burma, 10250 George Town（槟城旅游局官方）；缅寺：街对面 Lorong Burma, Pulau Tikus',hours:'卧佛寺每日 6:00-17:30（官方）；缅寺约 8:00/9:00-17:00',price:'两寺均免费开放，随喜捐赠',transit:'乔治市叫 Grab 或搭巴士到 Lorong Burma',action:'两寺街对街一次看完（泰式卧佛+缅式立佛，缅寺为马来西亚唯一缅甸寺庙、建于1803年）；着装遮肩盖膝、进殿脱鞋；傍晚可看卧佛寺亮灯舍利塔',verification:'已核验 2026-09-16'},
'和谐街':{address:'Jalan Masjid Kapitan Keling（旧称 Pitt Street）, 10200 George Town, Penang',hours:'街道全天开放；甲必丹吉灵清真寺：周六-周四 13:00-17:00、周五 15:00-17:00（旧来源），新来源称每日开放、避开礼拜时间',price:'免费开放；具体项目另计（清真寺免费、随喜捐赠）',transit:'遗产区核心步行可达：Armenian Street、Khoo Kongsi、小印度步行即到；Rapid Penang 巴士穿越遗产区',action:'清晨或傍晚逛避人潮；进清真寺着装端庄（现场提供长袍/头巾）；一条街集齐清真寺、观音庙、圣乔治教堂、印度庙',verification:'已核验 2026-09-16'},
'姓氏桥':{address:'Pengkalan Weld（Weld Quay）, 10300 George Town, Penang；最出名的是姓周桥（Chew Jetty）',hours:'姓周桥要求游客 9:00-21:00；其他桥无固定开放时间（居民区，请白天或傍晚访问）',price:'免费开放；具体项目另计（欢迎随喜捐赠）',transit:'从 Armenian Street 步行 10-15 分钟；CAT 免费巴士；Rapid Penang 101/104/201；或叫 Grab',action:'傍晚看日落+夜景倒影最出片；仍是住人社区：低声、走主栈道、私宅禁入、拍照先问；穿防滑鞋、带现金',verification:'已核验 2026-09-16'},
'娘惹博物馆':{address:'29 Church Street, 10200 George Town, Penang',hours:'每日 9:30-17:00（含公共假期）',price:'成人 RM25、6-12 岁儿童 RM12、6 岁以下免费；免费英文/中文导览 11:30 与 15:30',transit:'遗产区步行可达（近壁画街、蓝屋）；巴士 103/204/502/CAT Jetty；或叫 Grab',action:'踩着 11:30 或 15:30 的免费中文导览进；与蓝屋+壁画街排半天；预留约 2 小时',verification:'已核验 2026-09-16'},
'极乐寺':{address:'1000-L, Tingkat Lembah Ria 1, Air Itam, 11500 Penang',hours:'每日 8:00-17:00（TripAdvisor；部分游客样本 8:30-17:30）',price:'寺院大院免费；上山斜梯/缆车与宝塔另收费（游客样本价）：到顶往返套票 RM16（含缆车+电瓶车）；第一段缆车 RM3、第二段电瓶车 RM4（明确为往返价）、宝塔 RM4/人；停车 RM3/3小时',transit:'乔治市中心叫 Grab 约 30 分钟；有巴士但班次疏；与升旗山同在 Air Itam 可拼一天',action:'一早去避各层排队（可步行代替）；进门先往最远的观音像/宝塔走（各层开放时间不一）；着装端庄遮肩盖膝；留约 2 小时',verification:'已核验 2026-09-16'},
'Dinh Cau 岩':{address:'阳东镇Khu phố 2 / 白藤街沿岸岩石（阳东镇中心）',hours:'多来源说法不一：7:00–18:00 / 7:00–20:00 / 7:00–20:30 / 全天开放，以现场为准',price:'免费',transit:'镇中心步行可达，日落后步行5分钟到夜市',action:'看日落必去；29级台阶较滑注意脚下；寺庙着装得体、殿内禁拍照',verification:'已核验 2026-09-16'},
'Khem Beach':{address:'岛南端An Thoi区，JW Marriott Phu Quoc Emerald Bay旁（无具体门牌）',hours:'无官方开放时间，白天前往为宜',price:'免费开放；具体项目另计（躺椅/遮阳伞等另收费，停车约1–2万盾）',transit:'打车前往：阳东镇约30–40万盾，机场约25–35万盾',action:'水清沙细椰林多，适合躺平半日；非住客勿闯度假村管辖区，走公共通道进入',verification:'已核验 2026-09-16'},
'VinWonders':{address:'岛北部Bai Dai, Ganh Dau',hours:'每日9:00–19:30',price:'官网价2026：成人≥140cm 95万盾，儿童100–140cm及60岁以上长者71万盾，1m以下免费；官网VinWonders+Safari联票成人150万盾/儿童长者110万盾；OTA样本Traveloka特价约67.3万盾起',transit:'打车/租摩托；持票免费搭VinBus电动班车（机场–大世界–VinWonders–Safari）',action:'园区极大至少留一整天；必看龟形水族馆Neptune Palace、Once秀18:45–19:05与音乐喷泉',verification:'已核验 2026-09-16'},
'Vinpearl Safari':{address:'岛北部Bãi Dài, Gành Dầu（另记Gành Dầu - Cửa Cạn）',hours:'8:30（或9:00）–16:00，不同来源略异',price:'官网调价通知2026-01-07起生效：成人85万盾，儿童/长者65万盾；Night Safari成人70万盾/儿童53万盾',transit:'免费VinBus电动班车接驳（持票乘车）；或打车包车，距阳东镇约30公里',action:'一早入园、预留3–5小时，重点坐Safari巴士+步行区；防晒驱蚊穿舒适鞋',verification:'已核验 2026-09-16'},
'安泰群岛浮潜':{address:'出海集合点：安泰港（An Thoi pier），行程覆盖Hon Thom等安泰群岛海域',hours:'无固定开放时间，看所选团行程单（典型4–8小时）',price:'OTA样本：拼团约29–36美元/人（GetYourGuide），私团样本SGD225.80（Pelago）；最终看所选团行程单',transit:'团多含酒店接送：阳东镇/Bai Truong/安泰免费接，其他区域加价（Ong Lang区25万盾/团起）',action:'优先选小团/私团避开大团时段，确认含浮潜装备、午餐与保险；恶劣天气会取消退款',verification:'已核验 2026-09-16'},
'富国岛夜市':{address:'主指Dinh Cau夜市：阳东镇中心Vo Thi Sau街',hours:'每日约17:00–23:30（多摊位18:00–24:00），20:00后最热闹',price:'免门票进场按消费付费；甜品约2.5–5万盾，海鲜现秤按品项浮动',transit:'镇中心步行可达；离岛住客打车/Grab，深夜返程用叫车软件勿路边拦车',action:'先逛一圈比价再点单；海鲜现秤先问清单位与做法是否加价；看好背包防扒手',verification:'已核验 2026-09-16'},
'富国岛监狱':{address:'350 Nguyen Van Cu Street, An Thoi Ward, Phu Quoc',hours:'7:30–11:00 / 13:30–17:00（午休闭馆；上午时段一来源记8:30–11:30）；另有一来源记7:00–17:00无午休',price:'多来源称免费；一来源称语音导览约5万盾',transit:'岛南An Thoi，距阳东镇约30公里，打车/租摩托约40分钟',action:'预留1.5–2小时；展陈沉重儿童及敏感者慎入、着装得体；注意：多个OTA行程页曾标注因维护暂停开放，出行前务必再确认',verification:'已核验 2026-09-16'},
'护国寺':{address:'ấp Suối Lớn, 岛东南部；距阳东镇约20km、距机场约10km',hours:'每日6:00–18:00',price:'免费',transit:'打车/租摩托前往（山路）；常与星星海滩、监狱、缆车拼成南线一日游',action:'寺庙着装要求：遮住肩膀与膝盖、穿着端庄，进入殿堂需脱鞋；建议清晨或傍晚前往，带帽子防晒',verification:'已核验 2026-09-16'},
'星星海滩':{address:'岛东南海岸（Bãi Sao），机场在其北侧约16公里（即海滩在机场南侧）；无具体门牌',hours:'无官方开放时间，全天可进',price:'免费开放；具体项目另计（躺椅5–7万盾、遮阳伞3–5万盾、吊床3–5万盾、淡水冲洗2–4万盾）',transit:'阳东镇打车/租摩托/跟团，约40分钟–1小时',action:'带泳衣防晒与现金；椰树秋千拍照出片；常与护国寺、监狱拼南线一日游',verification:'已核验 2026-09-16'},
'鱼露工厂与胡椒园':{address:'鱼露：Khai Hoan（阳东镇Hung Vuong街）、Phung Hung（An Thoi镇；一来源记Nguyen Truong To街，一来源记Nguyen Van Cu街）、Hung Thanh（阳东镇Ngo Quyen街）；胡椒园样本：Bungalow Pepper Farm（Suối Cái - Gành Dầu, Cửa Cạn）',hours:'鱼露：Hung Thanh除周日外8:00–17:00，Phung Hung 9:00–21:00；胡椒园无统一时间',price:'参观免费；鱼露售价约4.5–7.8美元/瓶',transit:'阳东镇内步行/打车可达（Hung Thanh在Duong Dong市场旁）；多含在南线一日团行程内',action:'现场可品尝比对、直接从木桶取样；气味浓烈敏感者备口罩/围巾；胡椒11月–次年2月为采收季',verification:'已核验 2026-09-16'},
'Phuket Elephant Sanctuary':{address:'100/9 Moo 2, Paklok, Thalang, Phuket 83110；普吉东北部，Khao Phra Thaeo 国家公园边 30 英亩雨林（Tripadvisor 商家页）',hours:'每日多场次；Canopy Walkway 每日 4 场 09:30–11:00、10:00–11:30、14:00–15:30、14:30–16:00（OTA样本）',price:'官网价：Half Day Program 成人 THB 3,000 起（3.5 小时）；Canopy Walkway Tour 成人 THB 1,900（90 分钟）；儿童 4–12 岁分别为 THB 1,500 / THB 950，4 岁以下免费（博客样本，与官网一致）',transit:'官网提供可选往返拼车接送（if selected）；位置偏远东北部，OTA样本上午场酒店接约 08:15/08:45；或 Grab/Bolt 到主路办公室再转园区接驳皮卡',action:'官网提前预约；纯观察式伦理庇护所，无骑象无共浴；Canopy Walkway 1.5 小时性价比最高，含普吉首家大象医院参观、纪念品、冰饮与小吃；注意勿与 Elephant Jungle Sanctuary 混淆',verification:'已核验 2026-09-16'},
'Siam Niramit':{address:'55/81 Moo 5, Chalermprakiet Rd., Rassada, Muang, Phuket 83000（普吉市区，Traveloka）',hours:'OTA样本：园区约 17:30 开门；自助餐 17:30–20:00；前秀约 19:45；剧院 20:00 开；正秀 20:30–21:50；周二无场次（LuxuryEscapes）',price:'OTA样本：纯演出票 Silver ฿1,530/成人、Gold ฿1,700、Platinum ฿1,870；+自助餐+接送最高 Platinum ฿2,200；Travelocity 晚餐+接送套餐 Silver US$71.22、Gold US$75.76、Platinum US$81.83',transit:'套餐多含酒店往返接送（Travelocity）；自行前往在普吉市区，Grab 可达',action:'建议 17:30 到，先逛百年泰村、吃泰式街头自助，19:45 看 Naga 庭院前秀，20:30 看正秀（70 分钟、150+ 演员/500 套服装）；儿童按身高 100–140cm 享儿童价；提前订含接送套餐最省心',verification:'已核验 2026-09-16'},
'卡塔诺伊海滩':{address:'Karon 一带，Mueang Phuket District；卡塔海滩以南约 0.5 英里（800 米），死路尽头两岬角之间（Expedia）',hours:'全天开放；无门票（evendo）',price:'免费开放；具体项目另计',transit:'无直达公交/宋条车，仅出租车/Bolt/Grab（cestee.fr）；从卡塔可翻山步行（<1km，先陡坡后台阶）；从卡伦打车/tuk-tuk/Grab 约 20–30 分钟（evendo）',action:'5–10 月冲浪季浪大（可达 2 米，hotels.com），不谙水性者谨慎下水；浮潜去南端礁石区；沙滩相对安静适合躺平+日落；自带防晒，入口路边小餐馆价格实惠',verification:'已核验 2026-09-16'},
'大佛':{address:'Soi Yot Sane 1, Karon, Muang, Phuket 83100；Nakkerd 山顶（hotels.com Go Guides）',hours:'每日约 06:00–19:30（Agoda 指南）；另有来源标 06:00–19:00 / 08:00–18:00，以现场为准',price:'免费开放；接受捐款用于维护（Agoda/KKday）',transit:'山上位置：Grab/包车/tuk-tuk；租摩托上山路多弯坡陡、小排量车吃力（hotels.com）；徒步：卡伦出发约 2.5km、卡塔约 8km（Agoda）',action:'宗教场所着装要求：忌沙滩装/短裙，遮住肩膀膝盖，穿得太暴露可向现场免费借纱笼（hotels.com）；清晨或日落前到避人流；与查龙寺串联（相距约 8km），经典半日游',verification:'已核验 2026-09-16'},
'普吉老镇':{address:'以塔朗路（Thalang Road）为核心，Talat Yai, Mueang, Phuket 83000（wanderlog）',hours:'街区全天开放；Lard Yai 周日步行街每周日约 16:00–22:00（wanderlog）',price:'免费开放；具体项目另计',transit:'老城区紧凑，住老城可步行；Grab 在普吉岛常用（KKday）；建议清晨或傍晚凉快时逛（hotels.com）',action:'周日傍晚必去 Lard Yai 夜市（约 16:00 开，建议 17:00 左右到避高峰，带现金，多数摊位不收卡）；Soi Romanee 拍照；中葡骑楼+街头壁画；试本地菜 Raya/Tu Kab Khao（Agoda）',verification:'已核验 2026-09-16'},
'查龙寺':{address:'70/6 Chao Fah Tawan Tok Road, Chalong, Phuket 83130（goldentriangletour）；另见 70 Moo 6 Chaofa Road (West), Chalong, Phuket 83000',hours:'每日约 07:00–17:00（goldentriangletour / Agoda）；建筑内部开放有来源称 09:00–17:00',price:'免费开放；供品（香花金箔）约 THB 20（Trip.com 游记）',transit:'普吉镇西南约 8–9km，芭东东南约 16–18km（hotels.com）；Grab/出租/宋条车；自驾有免费停车（Trip.com 游记）',action:'着装要求：遮住肩膀和膝盖，禁无袖上衣/短裙/短裤，进殿脱鞋（hotels.com / goldentriangletour）；登 60 米三层舍利塔顶层观全景，可远眺大佛；与大佛串联经典半日游',verification:'已核验 2026-09-16'},
'皮皮岛':{address:'普吉东南海域皮皮群岛（Phi Phi Don / Phi Phi Leh）；一日游从普吉东岸码头乘快艇出发（Klook）',hours:'一日游样本：07:00 出发–17:30 返回，约 8.5–10 小时（含酒店接送，Klook）',price:'OTA样本：快艇拼团 ¥264 起/成人（含酒店接送、午餐、浮潜用具、国家公园门票；Klook）；豪华游艇 NT$2,068 起；私人游 ¥4,906；看所选船团行程单',transit:'船团含酒店往返接送，无需自己找码头（Klook）',action:'看所选船团行程单：确认含玛雅湾/猴子海滩/浮潜点、是否含国家公园门票与午餐；注意玛雅湾与罗沙玛湾每年 8/1–9/30 关闭（泰国自然资源部公告，Klook 页面）；多数船团限 65 岁以下，孕妇/心脑血管疾病者不接待；带泳衣、防晒、毛巾、现金',verification:'已核验 2026-09-16'},
'神仙半岛':{address:'普吉岛最南端，Rawai 以南约 2km；Google Maps：Laem Phromthep（แหลมพรหมเทพ，hotels.com / Trip.com）',hours:'24 小时开放；日落约 18:00–18:30（随季节），建议至少提前 30 分钟到占位（phuket101 / airial.travel）',price:'免费开放；具体项目另计',transit:'距芭东约 20km、卡塔约 10km；Grab/出租约 400–800 THB（evendo）；也可宋条车到 Rawai 再转（约 30–50 THB/人）；日落后返程车难找，建议提前约好返程或谈往返（airial.travel）',action:'普吉看日落第一机位，工作日人少；登 Kanchanaphisek 灯塔露台可看皮皮岛方向；礁石岬角无沙滩、不可游泳（phuket101），想游泳去附近奈汉海滩；可与 Rawai/Nai Harn/Ya Nui 串联半日',verification:'已核验 2026-09-16'},
'芭东 Bangla 路':{address:'Soi Bangla, Patong, Kathu, Phuket 83150；芭东海滩旁，长约 400 米（Tripadvisor）',hours:'每日约 18:00 封路变步行街；酒吧约 18:00–深夜，夜总会到凌晨 2–5 点（博客样本 17:00–05:00；视频样本）',price:'免费开放；具体项目另计：本地啤酒约 100–200 THB、鸡尾酒 200–400 THB、大夜店门票 300–1,000 THB（视频样本）',transit:'住芭东步行即达；住别处用 Grab，忌 unmetered 出租/路边 tuk-tuk 宰客（视频样本）',action:'点单先看价目表、用计算器确认金额再结账；人多处看好财物防扒手，背包背前面（journey.tw）；19:00–21:00 较家庭友好，22:00 后气氛最嗨；拒绝毒品搭讪（泰国法律极严）；紧急找 Tourist Police（1155）',verification:'已核验 2026-09-16'},
'ArtScience Museum':{address:'6 Bayfront Avenue, Singapore 018974（滨海湾金沙内）',hours:'周日至周四 10:00–19:00（18:00停止入场）；周五至周六 10:00–21:00（20:15停止入场）',price:'票价按展览另售；OTA样本：Expedia成人约US$17起',action:'展览轮换，行前查官网当前展览并提前订票',verification:'已核验 2026-09-16'},
'Jewel 星耀樟宜':{address:'78 Airport Boulevard, Singapore 819666',hours:'综合体约00:00–23:59；付费景点约10:00–21:00（商铺营业时间未找到可靠来源）',price:'免费入场；Canopy Park等收费项目OTA样本约S$4.80起',transit:'MRT东西线至Changi Airport站（CG2），经T2/T3二层连廊直达Jewel',action:'免费看40米高雨漩涡和森林谷；Canopy Park空中花园需另购票',verification:'已核验 2026-09-16'},
'Kampong Glam':{address:'甘榜格南文化街区（无固定地址；核心在Sultan Mosque/Arab Street一带）',hours:'街区全天开放；餐饮氛围最佳为下午至傍晚',price:'免费开放；具体项目另计',transit:'Bugis MRT（EW12/DT14），步行约10分钟到Sultan Mosque/街区核心',action:'傍晚逛Haji Lane与Bussorah Street；进苏丹清真寺注意着装、脱鞋，避开周五中午礼拜',verification:'已核验 2026-09-16'},
'Singapore Oceanarium':{address:'8 Sentosa Gateway, Sentosa, Singapore 098269（圣淘沙名胜世界）',hours:'周一至周五 10:00–19:00；周末及公众假期 09:00–21:00',price:'官网价：成人票S$49起',transit:'HarbourFront MRT转VivoCity三楼圣淘沙捷运上岛',action:'建议预留约3小时；2025年7月新开业，周末热门时段提前官网购票',verification:'已核验 2026-09-16'},
'乌节路':{address:'乌节路（Orchard Road）购物街区，全长约2.2公里，无固定地址',hours:'商场一般每天约10:00–22:00',price:'免费开放；具体项目另计',transit:'Orchard站（NS22）/Somerset站（NS23）/Dhoby Ghaut站（NE6/NS24/CC1）',action:'白天用商场间空调地下通道串联逛街避暑；12月圣诞灯饰季值得晚上再来',verification:'已核验 2026-09-16'},
'圣淘沙海滩':{address:'Sentosa Island, Singapore 099008（含Siloso/Palawan/Tanjong三片海滩）',hours:'海滩全天开放；日落观赏约17:30–19:00',price:'免费开放；具体项目另计',transit:'HarbourFront MRT→VivoCity三楼圣淘沙捷运至Beach站',action:'三选一：Palawan走吊桥打卡亚洲大陆最南端，Siloso玩水上运动，Tanjong人少适合野餐看日落',verification:'已核验 2026-09-16'},
'夜间动物园':{address:'80 Mandai Lake Rd, Singapore 729826',hours:'每日19:15–24:00（23:15停止入场）',price:'官网价：非居民成人S$58/儿童S$41',transit:'MRT南北线至Khatib站（NS14）转171路公交到园区',action:'开园时段先坐游园电车，再看Creatures of the Night表演（19:30/20:30/21:30）；带驱蚊水',verification:'已核验 2026-09-16'},
'小印度':{address:'Serangoon Rd, Singapore 218021（小印度街区）',hours:'街区全天开放；店铺多约10:00起营业，Mustafa Centre 24小时',price:'免费开放；具体项目另计',transit:'Little India MRT（NE7/DT12），或Farrer Park站（NE8）',action:'中午去Tekka Centre吃印度餐',verification:'已核验 2026-09-16'},
'新加坡动物园与Bird Paradise':{address:'新加坡动物园：80 Mandai Lake Rd, Singapore 729826；Bird Paradise：Mandai Lake Road（同区）',hours:'动物园 08:30–18:00；Bird Paradise 09:00–18:00',price:'官网价：动物园非居民成人S$49/儿童S$34；Bird Paradise本地居民价平日S$39/高峰S$44起（非居民价官网未列明）',transit:'MRT南北线至Khatib站（NS14）转171路公交到Mandai园区',action:'开园就到，动物上午最活跃；两园同区可安排同一天，上午动物园下午鸟园',verification:'已核验 2026-09-16'},
'新加坡河游船':{address:'30 Merchant Road, Singapore 058282（WaterB）；登船点：Fort Canning/Merlion Park/Bayfront North',hours:'每日14:00–21:00，约每30分钟一班，航程约40分钟',price:'OTA样本：Expedia成人S$29',transit:'Merlion Park登船点：Raffles Place MRT（H出口）步行约5分钟',action:'选傍晚班次看日落转夜景；恶劣天气可能延误，提前查天气',verification:'已核验 2026-09-16'},
'牛车水':{address:'Pagoda St, Singapore 059203（牛车水街区）',hours:'店铺约10:00–22:00；佛牙寺一般免费入内',price:'免费开放；具体项目另计',transit:'Chinatown MRT（NE4/DT19），A出口直达宝塔街',action:'下午逛佛牙寺和宝塔街',verification:'已核验 2026-09-16'},
'环球影城':{address:'8 Sentosa Gateway, Resorts World Sentosa, Singapore 098269',hours:'一般10:00–19:00（日期而异，行前查官网日历）',price:'OTA样本：Expedia非旺季成人S$78',transit:'HarbourFront MRT→VivoCity三楼圣淘沙捷运上岛',action:'开园前到直奔热门项目（变形金刚/木乃伊）；多为室内项目，适合避暑',verification:'已核验 2026-09-16'},
'鱼尾狮公园':{address:'1 Fullerton Rd, Singapore 049213',hours:'24小时开放',price:'免费开放；具体项目另计',transit:'Raffles Place MRT步行约5分钟',action:'早上7–9点或傍晚去，人少好拍照，约30分钟打卡',verification:'已核验 2026-09-16'}
};

const S=(verdict:XhsAssessment['verdict'],recommend:number,caution:number,avoid:number,why:string,avoidNote:string):XhsAssessment=>({verdict,recommend,caution,avoid,why,avoidNote});

/** Counts are a transparent coding of the linked strict-review samples, not platform-wide ratings. */
export const xhsAssessments:Record<string,XhsAssessment>={
 'Aman Nai Lert Bangkok':S('推荐',2,0,0,'新开业阶段的设计、私密感和服务体验获得明确好评。','价格约¥13,000/晚；新酒店长期稳定性仍需观察。'),
 'Capella Bangkok':S('谨慎选择',1,0,1,'河畔体验与酒店本身获认可。','“全球第一”抬高预期；有前台推销升级与体验落差反馈。'),
 'Four Seasons Bangkok':S('推荐',1,1,0,'河畔城市度假体验稳定，适合把泳池与观光结合。','曼谷有同名住宿，务必确认是湄南河畔酒店。'),
 '曼谷文华东方':S('谨慎选择',1,0,1,'150年历史、河畔氛围和品牌情怀突出。','硬件年代感与服务落差评价并存，先确认翻新房型。'),
 'The Siam':S('谨慎选择',1,0,1,'Bill Bensley设计、古董收藏和博物馆感独一无二。','位置远且无BTS，密集市中心行程会被交通拖累。'),
 'Sorn':S('推荐',2,0,0,'泰南菜体验和前菜、甜点获得两篇正面反馈。','极难订、7,800 THB/位另加税服，酒单评价一般。'),
 'Sühring':S('谨慎选择',1,0,1,'现代德国菜与升三星后的完整体验有强支持。','升三星后也有“份量小、表现下滑”的强烈负评。'),
 'Gaggan':S('谨慎选择',0,1,0,'2026-05-29翻新重开，表演式长菜单辨识度高。','No Phone政策、约15,000–20,000 THB/人；别用Langsuan旧址。'),
 'Côte by Mauro Colagreco':S('谨慎选择',1,0,1,'嘉佩乐河景与米二地中海料理适合仪式感晚餐。','四道午餐被批评份量小、加点多，不适合以吃饱为目标。'),
 'Le Du':S('推荐',1,1,0,'食材新鲜、回访菜品更精致，加点虾获明确推荐。','约15道菜含蚂蚁卵等大胆食材，接受创意度再订。'),
 'Nusara':S('谨慎选择',1,0,1,'老城屋顶景与现代泰菜有“只选一家就选它”的强推。','另有区别对待与食物中毒投诉，体验方差很大。'),
 'Potong':S('谨慎选择',0,2,0,'唐人街老药房空间与多层体验有辨识度。','需提前1–3个月；份量和性价比评价保留，walk-in不是常规方案。'),
 'Nahm':S('谨慎选择',0,1,1,'长期获星且位于COMO Metropolitan，适合看当季菜单后决定。','明确避坑帖存在，不能只凭历史奖项预订。'),
 'Jay Fai':S('谨慎选择',1,1,0,'2026仍营业并保有米其林一星，传奇打卡属性明确。','预约与排队成本高；关闭传闻反复，行前必须核对。'),
 'Thipsamai':S('推荐',1,0,1,'鬼门原店被视为经典炒河粉打卡点。','ICONSIAM分店有偏甜和“拔草”反馈，别混用两店口碑。'),
 '耀华力夜市 / T&K':S('谨慎选择',0,1,1,'适合放进唐人街扫街路线体验氛围。','炸鸡过咸、咖喱蟹与炸鱿鱼有明确负评，不作正式大餐。'),
 'Or Tor Kor Market':S('谨慎选择',1,1,0,'农产品和熟食质量、市场环境获高赞。','价格高；2025-07-28曾发生严重安全事件，白天去并保持警觉。'),
 '大皇宫 & 玉佛寺':S('推荐',2,0,0,'同一园区、建筑震撼，且可顺路串联卧佛寺。','8:30到避团客；严格遮肩盖膝，现场规则优先。'),
 '卧佛寺 Wat Pho':S('推荐',2,0,0,'46米卧佛与传统按摩可和大皇宫顺路组合。','门票样本为300 THB；按摩另留排队时间。'),
 '郑王庙 Wat Arun':S('推荐',2,0,0,'白瓷佛塔、河岸日落和对岸机位获得一致推荐。','台阶陡；闭园和末班船时间需当天复核。'),
 '湄南河游船':S('推荐',2,0,0,'30–40 THB公共船即可获得高性价比蓝调时刻体验。','末班约18:40；双层船座位和天气会影响体验。'),
 '恰图恰周末市场':S('推荐',2,0,0,'规模、手工艺和分区丰富，周末值得专门安排。','门口面馆有找零争议；只在周末完整营业，价格可比较。'),
 '四面佛':S('推荐',2,0,0,'BTS直达、免费，适合和奇隆/暹罗商圈顺路。','供品与还愿舞另付；按现场秩序参拜，不把体验包装成保证。'),
 '金山寺':S('推荐',2,0,0,'老城制高点、360°日落与相对清静是核心价值。','门票已由50涨至100 THB；傍晚前确认闭园时间。'),
 'Mahanakhon 天空步道':S('推荐',2,0,0,'玻璃地板与白天—日落—夜景连续体验辨识度高。','现场票价高且会变化；天气不好不值得硬上。'),
 'ICONSIAM':S('推荐',2,0,0,'室内水上市场、购物、美食和夜景可一站完成。','体量大易耗时；与寺庙日组合时要控制停留。'),
 '唐人街耀华力路':S('推荐',2,0,0,'20:30–22:00霓虹街景和街区历史都值得看。','餐饮品质差异大，扫街少量分食，别把单一网红店当必吃。'),
 '伦披尼公园':S('推荐',1,0,0,'免费城市绿地，18:00–19:00更易观察水巨蜥。','只核到1篇完整可追溯帖子；与巨蜥保持距离，不喂食。')
};

Object.assign(xhsEvidence,extraXhsEvidence);
Object.assign(xhsAssessments,extraXhsAssessments);

export function getXhsAssessment(item:Item){return xhsAssessments[item.name]}

const transitByCity:Record<string,string>={
 '曼谷':'BTS / MRT与河船优先；老城最后一段步行或打车',
 '清迈':'古城步行，远郊项目用Grab或正规包车',
 '普吉':'酒店接送或Grab；跨海滩预留堵车时间',
 '槟城':'乔治市步行，升旗山与极乐寺用Grab串联',
 '吉隆坡':'轨道交通与Grab组合，雨天优先商场连廊',
 '胡志明市':'第一郡步行与Grab组合，过街保持稳定速度',
 '富国岛':'Grab或酒店车；南北岛不要同日反复折返',
 '新加坡':'MRT与步行；带娃时减少换乘'
};

const daysForCity=(city:string)=>days.filter(d=>d.city===city).map(d=>`Day ${d.day}`).join('–');
const pull=(text:string,re:RegExp)=>text.match(re)?.[0];
const factsKey=(item:Item)=>`${item.city}|${item.name}`;
const allGuideItems:[Item,GuideKind][]=[
 ...hotels.map(item=>[item,'酒店'] as [Item,GuideKind]),
 ...restaurants.map(item=>[item,'餐厅'] as [Item,GuideKind]),
 ...attractions.map(item=>[item,'景点'] as [Item,GuideKind])
];
function makeBaselineFacts(item:Item,kind:GuideKind):GuideFacts{
 const blob=`${item.meta} ${item.detail}`;
 const foundHours=pull(blob,/\d{1,2}:\d{2}(?:[–-]\d{1,2}:\d{2})?(?:[^；。·]{0,18})?/);
 const foundPrice=pull(blob,/(?:免费|(?:约)?(?:¥|RM|S\$|HK\$|US\$)\s?[\d,]+(?:\+\+|k)?(?:\/人)?|(?:约)?[\d,]+(?:\+\+)?\s?(?:泰铢|THB|越南盾|VND|新币|元))/);
 const hours=foundHours||(kind==='酒店'?'前台全天；入住、早餐与设施时段按已选房型确认':kind==='餐厅'?'按餐厅开放餐期到店；订位成功后按确认时间入席':'当前资料未录入可核验的固定开放数字；出发当日从详情来源复核');
 const price=foundPrice||(kind==='酒店'?'按具体房型、税费、日期与取消条款计算':kind==='餐厅'?'按菜单或套餐计价；税费、服务费与饮品另核':'当前资料未录入可核验的固定票价；按当日票种选择');
 return {
  address:`${item.name} · ${item.city}（地图入口已带入地点全名）`,
  hours,
  price,
  schedule:kind==='酒店'?`${daysForCity(item.city)} 行程段住宿候选；入住日先留30分钟办理手续`:kind==='餐厅'?'正餐预留1.5–2.5小时；街头小吃按当天动线灵活停留':'依据当天路线预留1–2小时；远郊、海岛或大型园区至少半天',
  transit:transitByCity[item.city]||'使用详情页地图入口规划最后一段交通',
  action:item.best||'把这一站放在同片区动线中；有预约或天气限制时先确认再出发',
  verification:xhsEvidence[item.name]?.length?'小红书已核验样本 + 公开资料交叉核对':'公开资料已整理；小红书逐帖链接待补'
 };
}

/** Every catalogue row receives a complete, item-addressable facts record; exact verified overrides replace the conservative baseline. */
export const generatedGuideFacts:Record<string,GuideFacts>=Object.fromEntries(allGuideItems.map(([item,kind])=>[factsKey(item),makeBaselineFacts(item,kind)]));
export const guideFactsCount=Object.keys(generatedGuideFacts).length;

export function getGuideFacts(item:Item,_kind:GuideKind):GuideFacts{
 return {...generatedGuideFacts[factsKey(item)]!,...overrides[item.name]};
}

export const strictResearchLinkCount=new Set(Object.values(xhsEvidence).flat().map(link=>link.url)).size;
