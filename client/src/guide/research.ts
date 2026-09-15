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
 '丹嫩沙多水上市场+美功铁道':{address:'丹嫩沙多 Damnoen Saduak / 美功 Mae Klong Railway Market · 距曼谷约70公里；确切门牌暂缺',hours:'丹嫩沙多水上市场帖子样本08:00–16:00（下午1点后摊位陆续撤离）；美功火车进站帖子样本08:30/11:10/14:30/17:40，行前再核',price:'帖子样本：丹嫩手摇船合理价约400铢/船（可坐多人），电动船开价1000铢/人可讲价至300–500；黑码头开价4000铢/人，须避开',schedule:'两景点相距约20分钟车程，建议打包一日游（上午美功、下午丹嫩），共约3–4小时',transit:'帖子样本：曼谷包车往返2500–2800泰铢；让司机直接开进市场里面，不在外围买票点下车',action:'坚决避开黑码头；周末大堵船，建议工作日上午去；选手摇船；评论多推荐更本地的空叻玛荣作为替代'}
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
