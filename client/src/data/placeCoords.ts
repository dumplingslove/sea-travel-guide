/**
 * 酒店 / 餐厅 / 商场坐标数据（2026-09-26 人工核验；商场 2026-09-27 Nominatim 地理编码；
 * 2026-09-29 补齐 Amoy Street Food Centre（新加坡）/ 新峰肉骨茶（吉隆坡）2 家此前缺席的餐厅坐标）
 *
 * 来源：Nominatim OSM + map.geocode 交叉核验，每条都核对过 display_name。
 * 2026-09-29 新增 seoul 区块：回程经首尔中转加入行程；3 家酒店坐标 Nominatim 精确命中
 *（map.geocode 对韩国地址覆盖弱：1 条 CITY 级低相关 + 2 条空返回，故以 Nominatim 为准，不编造）。
 * 精度标注：
 *  - "exact"    精确到建筑/店面
 *  - "building" 同建筑内（如酒店内的餐厅，用酒店坐标）
 *  - "street"   街道级（OSM 无精确店面，用街道+门牌号定位）
 *  - "area"     区域级（如酒店在某个公园内，用公园坐标）
 *  - "chain"    连锁店，标的是市中心代表性分店
 *
 * booked: false = 候选（只标位置，不连线）；true = 已确认预订（接入当天动线）。
 * 用户 2026-09-26 确认目前酒店尚未预订，全部为候选。
 */

export interface PlaceCoord {
  name: string;
  lat: number;
  lng: number;
  precision: "exact" | "building" | "street" | "area" | "chain";
  note?: string;
  booked?: boolean;
}

export interface CityPlaces {
  hotels: PlaceCoord[];
  restaurants: PlaceCoord[];
  malls: PlaceCoord[];
}

/** city_id -> 该城市酒店/餐厅 */
export const cityPlaces: Record<string, CityPlaces> = {
  singapore: {
    hotels: [
      { name: "Capella Singapore", lat: 1.2496982, lng: 103.8244312, precision: "exact" },
      { name: "Raffles Singapore", lat: 1.2946815, lng: 103.8546412, precision: "exact" },
      { name: "Marina Bay Sands", lat: 1.2836965, lng: 103.8607226, precision: "exact" },
      { name: "The Ritz-Carlton, Millenia Singapore", lat: 1.2905344, lng: 103.8600739, precision: "exact" },
      { name: "Mandarin Oriental Singapore 文华东方", lat: 1.2906606, lng: 103.8583240, precision: "exact" },
      { name: "Shangri-La Singapore 香格里拉", lat: 1.3114790, lng: 103.8264448, precision: "exact", note: "22 Orange Grove Road" },
      { name: "The Fullerton Hotel Singapore 新加坡富丽敦酒店", lat: 1.2862019, lng: 103.8530726, precision: "exact" },
    ],
    restaurants: [
      { name: "Odette", lat: 1.2899467, lng: 103.851523, precision: "exact" },
      { name: "Burnt Ends", lat: 1.304404, lng: 103.809125, precision: "exact" },
      { name: "Candlenut", lat: 1.3058126, lng: 103.810034, precision: "exact" },
      { name: "Labyrinth", lat: 1.289795, lng: 103.856063, precision: "exact" },
      { name: "Jumbo Seafood", lat: 1.2888992, lng: 103.8446901, precision: "exact", note: "Riverside Point 店" },
      { name: "Song Fa", lat: 1.3190307, lng: 103.8442797, precision: "chain", note: "连锁，Thomson Road 店为代表" },
      { name: "Maxwell Food Centre", lat: 1.2803829, lng: 103.8447131, precision: "exact" },
      { name: "Old Airport Road", lat: 1.3082727, lng: 103.8858564, precision: "exact", note: "Old Airport Road Food Centre" },
      { name: "Hill Street Tai Hwa", lat: 1.3051139, lng: 103.862559, precision: "exact", note: "Crawford Lane 店" },
      { name: "328 Katong Laksa", lat: 1.3073571, lng: 103.907346, precision: "exact" },
      { name: "Ya Kun Kaya Toast", lat: 1.2813622, lng: 103.8448952, precision: "chain", note: "连锁，牛车水 Erskine Road 店为代表" },
      { name: "Lau Pa Sat", lat: 1.2806167, lng: 103.8504802, precision: "exact" },
      { name: "Amoy Street Food Centre", lat: 1.2793019, lng: 103.8466566, precision: "exact", note: "7 Maxwell Rd, 069111（2026-09-29 新增：Nominatim display_name 全地址匹配 + map.geocode FULL_ADDRESS relevance 100 交叉核验）" },
    ],
    malls: [
      { name: "乌节路 ION Orchard", lat: 1.3039479, lng: 103.8319051, precision: "exact" },
      { name: "义安城（高岛屋）", lat: 1.3025211, lng: 103.8353202, precision: "exact" },
      { name: "百利宫 Paragon", lat: 1.3037371, lng: 103.8355203, precision: "exact" },
      { name: "滨海湾金沙 The Shoppes", lat: 1.2840209, lng: 103.8588683, precision: "exact" },
      { name: "武吉士街 Bugis Street", lat: 1.2993775, lng: 103.8557874, precision: "street" },
      { name: "牛车水", lat: 1.2799695, lng: 103.8436879, precision: "area" },
      { name: "慕斯达法中心 Mustafa（小印度）", lat: 1.3101243, lng: 103.8553164, precision: "exact" },
      { name: "星耀樟宜 Jewel", lat: 1.3602243, lng: 103.9896749, precision: "exact" },
    ],
  },
  phuket: {
    hotels: [
      { name: "Amanpuri", lat: 7.9862081, lng: 98.2728216, precision: "exact" },
      { name: "Trisara", lat: 8.0349106, lng: 98.2772827, precision: "exact" },
      { name: "Banyan Tree Phuket", lat: 8.0130233, lng: 98.2958261, precision: "exact" },
      { name: "JW Marriott Phuket Resort & Spa 普吉JW万豪", lat: 8.1661545, lng: 98.2952039, precision: "exact", note: "Mai Khao" },
      { name: "The Surin Phuket", lat: 7.981145, lng: 98.278123, precision: "exact", note: "118 Moo 3 Pansea Beach" },
      { name: "Keemala", lat: 7.9431911, lng: 98.2788779, precision: "exact", note: "Kamala" },
    ],
    restaurants: [
      { name: "PRU", lat: 8.0384118, lng: 98.2765486, precision: "exact" },
      { name: "Jampa", lat: 8.0394207, lng: 98.3173132, precision: "exact" },
      { name: "Blue Elephant", lat: 7.886068, lng: 98.38459, precision: "exact" },
      { name: "Raya", lat: 7.8859294, lng: 98.3909045, precision: "exact", note: "普吉老镇 Dibuk 路店" },
      { name: "Tu Kab Khao", lat: 7.883686, lng: 98.3882023, precision: "exact" },
      { name: "Suay", lat: 7.8809384, lng: 98.3883154, precision: "exact" },
      { name: "Acqua", lat: 7.9166191, lng: 98.291105, precision: "exact" },
      { name: "Kan Eang@Pier", lat: 7.8197104, lng: 98.3504761, precision: "area", note: "位于 Chalong 码头" },
      { name: "Roti Taew Nam", lat: 7.88483, lng: 98.39088, precision: "exact" },
    ],
    malls: [
      { name: "Central Phuket（+连廊对接 Central Floresta）", lat: 7.8911739, lng: 98.3668714, precision: "exact" },
      { name: "普吉老镇周日步行街 Lard Yai（Thalang路）", lat: 7.8845565, lng: 98.3920742, precision: "street" },
      { name: "OTOP 市场", lat: 7.8868490, lng: 98.2956270, precision: "area" },
      { name: "Chillva Market", lat: 7.9073447, lng: 98.3734774, precision: "area" },
      { name: "Naka 周末市场", lat: 7.8805332, lng: 98.3663260, precision: "area" },
    ],
  },
  bangkok: {
    hotels: [
      { name: "The Ritz-Carlton, Bangkok", lat: 13.7282651, lng: 100.5457378, precision: "exact" },
      { name: "The Peninsula Bangkok", lat: 13.7232197, lng: 100.5103607, precision: "exact" },
      { name: "Rosewood Bangkok", lat: 13.7435351, lng: 100.548994, precision: "exact" },
      { name: "曼谷文华东方", lat: 13.7238854, lng: 100.5141549, precision: "exact" },
      { name: "Capella Bangkok", lat: 13.7132727, lng: 100.5111616, precision: "exact" },
      { name: "Aman Nai Lert Bangkok", lat: 13.7463077, lng: 100.5469695, precision: "area", note: "位于 Nai Lert Park 内" },
      { name: "Four Seasons Bangkok", lat: 13.7117012, lng: 100.5099107, precision: "exact" },
      { name: "The Siam", lat: 13.7814475, lng: 100.5053826, precision: "exact" },
      { name: "The Athenee Hotel, a Luxury Collection Hotel, Bangkok 曼谷雅典娜豪华精选酒店", lat: 13.7411701, lng: 100.5481877, precision: "exact", note: "61 Wireless Road" },
    ],
    restaurants: [
      { name: "Sühring", lat: 13.7108224, lng: 100.5455239, precision: "exact" },
      { name: "Gaggan", lat: 13.7407594, lng: 100.5675678, precision: "exact" },
      { name: "Sorn", lat: 13.7272898, lng: 100.57006, precision: "street", note: "Sukhumvit Soi 26，56 号" },
      { name: "Nahm", lat: 13.7235709, lng: 100.5389708, precision: "exact" },
      { name: "Le Du", lat: 13.7250578, lng: 100.529305, precision: "exact" },
      { name: "Nusara", lat: 13.7457, lng: 100.49144, precision: "exact" },
      { name: "Potong", lat: 13.7392761, lng: 100.5084376, precision: "exact" },
      { name: "Jay Fai", lat: 13.7525335, lng: 100.5047365, precision: "exact" },
      { name: "Côte by Mauro Colagreco", lat: 13.7132727, lng: 100.5111616, precision: "building", note: "位于 Capella Bangkok 内" },
      { name: "Thipsamai", lat: 13.7506605, lng: 100.5041368, precision: "street", note: "Maha Chai 路 313-315 号" },
      { name: "耀华力夜市 / T&K", lat: 13.7401179, lng: 100.5106666, precision: "exact", note: "T&K Seafood" },
      { name: "通思密 Thong Smith", lat: 13.7465769, lng: 100.5390414, precision: "building", note: "CentralWorld 店（3F #B302，页面实读）；借用 CentralWorld exact 坐标，building 级（2026-09-29 新增；鲁通船面胜利纪念碑店无可验证坐标，待补）" },
      { name: "Or Tor Kor Market", lat: 13.7971301, lng: 100.5475746, precision: "exact" },
    ],
    malls: [
      { name: "ICONSIAM 暹罗天地", lat: 13.7268227, lng: 100.5102940, precision: "exact" },
      { name: "Siam Paragon 暹罗百丽宫", lat: 13.7467785, lng: 100.5349540, precision: "exact" },
      { name: "CentralWorld", lat: 13.7465769, lng: 100.5390414, precision: "exact" },
      { name: "MBK Center", lat: 13.7447151, lng: 100.5299165, precision: "exact" },
      { name: "Terminal 21", lat: 13.7382452, lng: 100.5607309, precision: "building" },
      { name: "恰图恰周末市场 Chatuchak", lat: 13.8002651, lng: 100.5511228, precision: "area" },
      { name: "Asiatique 河滨夜市", lat: 13.7041568, lng: 100.5027137, precision: "area" },
      { name: "Big C Supercenter（Ratchadamri店）", lat: 13.7470321, lng: 100.5407658, precision: "exact" },
    ],
  },
  chiangmai: {
    hotels: [
      { name: "137 Pillars House", lat: 18.7918933, lng: 99.004047, precision: "exact" },
      { name: "Four Seasons Resort Chiang Mai", lat: 18.9149588, lng: 98.9315215, precision: "exact" },
      { name: "Raya Heritage", lat: 18.8482, lng: 98.9847, precision: "exact", note: "Mae Rim" },
      { name: "Anantara Chiang Mai", lat: 18.7819529, lng: 99.0038970, precision: "exact", note: "123 Charoen Prathet Road" },
      { name: "Shangri-La Chiang Mai 清迈香格里拉", lat: 18.7784060, lng: 99.0007596, precision: "exact" },
      { name: "Chiang Mai Marriott Hotel 清迈万豪", lat: 18.7846730, lng: 98.9999172, precision: "exact", note: "原址为 Le Méridien（现 Chiang Mai Marriott）" },
    ],
    restaurants: [
      { name: "Kiti Panit", lat: 18.7879728, lng: 99.0005014, precision: "exact" },
      { name: "Khao Soi Khun Yai", lat: 18.7953327, lng: 98.9832948, precision: "exact" },
      { name: "Huen Phen", lat: 18.7858382, lng: 98.9851584, precision: "exact" },
      { name: "Khao Kha Moo Chang Phueak", lat: 18.7958314, lng: 98.985547, precision: "exact" },
      { name: "SP Chicken", lat: 18.7876463, lng: 98.9811872, precision: "exact" },
      { name: "Tong Tem Toh", lat: 18.79672, lng: 98.96775, precision: "exact", note: "Nimman Soi 11" },
      { name: "Dash! Restaurant", lat: 18.7832738, lng: 98.9914597, precision: "exact" },
      { name: "Ginger Farm Kitchen", lat: 18.8001262, lng: 98.9680725, precision: "building", note: "位于 One Nimman 内" },
    ],
    malls: [
      { name: "瓦洛洛市场 Warorot", lat: 18.7902357, lng: 99.0005350, precision: "area" },
      { name: "周日步行街（塔佩门–帕辛寺）", lat: 18.7877625, lng: 98.9932697, precision: "area" },
      { name: "周六步行街", lat: 18.7733366, lng: 98.9803664, precision: "street" },
      { name: "宁曼路 / One Nimman", lat: 18.8001262, lng: 98.9680725, precision: "exact" },
      { name: "Baan Kang Wat", lat: 18.7767499, lng: 98.9482643, precision: "exact" },
      { name: "Maya / Central Festival", lat: 18.8024324, lng: 98.9672980, precision: "exact" },
    ],
  },
  penang: {
    hotels: [
      { name: "Eastern & Oriental Hotel", lat: 5.4234635, lng: 100.3355596, precision: "exact" },
      { name: "Cheong Fatt Tze Mansion", lat: 5.4215176, lng: 100.3347671, precision: "exact" },
      { name: "The Prestige Hotel Penang", lat: 5.4164008, lng: 100.3427711, precision: "exact" },
      { name: "Penang Marriott Hotel 槟城万豪", lat: 5.4312388, lng: 100.3172378, precision: "exact" },
      { name: "Seven Terraces", lat: 5.4192451, lng: 100.3376048, precision: "street", note: "14A Stewart Lane（街道级）" },
      { name: "The Edison George Town", lat: 5.4206369, lng: 100.3349752, precision: "exact" },
    ],
    restaurants: [
      { name: "Siam Road Char Kway Teow", lat: 5.4140347, lng: 100.3214920, precision: "street", note: "Siam Road 沿线（街道级）" },
      { name: "Air Itam Bisu Laksa", lat: 5.4014813, lng: 100.2772775, precision: "street", note: "Jalan Pasar, Farlim（Air Itam 区域街道级）" },
      { name: "888 Hokkien Mee（Three Road）", lat: 5.4110973, lng: 100.3306371, precision: "exact" },
      { name: "Penang Road Teochew Chendul", lat: 5.4171400, lng: 100.3306743, precision: "exact" },
      { name: "Hameediyah", lat: 5.4185538, lng: 100.3326523, precision: "exact" },
      { name: "Nasi Kandar Line Clear", lat: 5.4195857, lng: 100.3325264, precision: "exact", note: "Penang Road 分店（复核后）" },
      { name: "Au Jardin", lat: 5.4119979, lng: 100.3275472, precision: "exact" },
      { name: "CEKI Nyonya", lat: 5.4209, lng: 100.332312, precision: "exact", note: "11-A Jalan Sri Bahari" },
      { name: "Green House Prawn Mee", lat: 5.4183797, lng: 100.3279952, precision: "exact" },
    ],
    malls: [
      { name: "乔治市骑楼店", lat: 5.4157748, lng: 100.3364302, precision: "street" },
      { name: "Gurney Plaza", lat: 5.4372970, lng: 100.3094027, precision: "exact" },
    ],
  },
  kualalumpur: {
    hotels: [
      { name: "Mandarin Oriental Kuala Lumpur", lat: 3.1557412, lng: 101.7118967, precision: "exact" },
      { name: "Park Hyatt Kuala Lumpur", lat: 3.1419163, lng: 101.7008270, precision: "exact" },
      { name: "Four Seasons Kuala Lumpur", lat: 3.1580799, lng: 101.7138657, precision: "exact" },
      { name: "The St. Regis Kuala Lumpur", lat: 3.1366351, lng: 101.6887576, precision: "exact" },
      { name: "EQ", lat: 3.1529815, lng: 101.7097204, precision: "exact" },
    ],
    restaurants: [
      { name: "Dewakan", lat: 3.1547191, lng: 101.7185049, precision: "exact" },
      { name: "Beta KL", lat: 3.154642, lng: 101.709036, precision: "exact", note: "10 Jalan Perak（Cormar Suites）" },
      { name: "DC by Darren Chin", lat: 3.141733, lng: 101.627262, precision: "exact", note: "44 Persiaran Zaaba" },
      { name: "Nadodi", lat: 3.1580799, lng: 101.7138657, precision: "building", note: "Four Seasons Hotel 7A 层" },
      { name: "Chim by Chef Noom", lat: 3.144394, lng: 101.71955, precision: "exact", note: "39 Jalan Kamuning" },
      { name: "Jalan Alor", lat: 3.1451796, lng: 101.7076369, precision: "street", note: "亚罗街（街道级）" },
      { name: "Lot 10 Hutong", lat: 3.1469293, lng: 101.7118546, precision: "exact" },
      { name: "Gulainya", lat: 3.149261, lng: 101.653724, precision: "exact", note: "44-G Jalan Medan Setia 2" },
      { name: "Village Park", lat: 3.1377593, lng: 101.6233892, precision: "exact" },
      { name: "THIRTY8", lat: 3.1536113, lng: 101.7121373, precision: "building", note: "Grand Hyatt Kuala Lumpur 38 层" },
      { name: "新峰肉骨茶 Sun Fong Bak Kut Teh（吉隆坡肉骨茶代表店）", lat: 3.14442, lng: 101.71498, precision: "street", note: "35 Medan Imbi（2026-09-29 新增：卡片记35a-41a；map.geocode FULL_ADDRESS 匹配35 Medan Imbi，返回名 Sun Hong 疑为同音异译，故标街道级）" },
    ],
    malls: [
      { name: "Pavilion（武吉免登）", lat: 3.1491540, lng: 101.7129531, precision: "exact" },
      { name: "Suria KLCC（双子塔下）", lat: 3.1573751, lng: 101.7123797, precision: "exact" },
      { name: "中央市场", lat: 3.1440818, lng: 101.6954483, precision: "exact" },
    ],
  },
  hochiminh: {
    hotels: [
      { name: "Park Hyatt Saigon", lat: 10.7775344, lng: 106.7034163, precision: "exact" },
      { name: "The Reverie Saigon", lat: 10.7738731, lng: 106.7048650, precision: "exact" },
      { name: "Sheraton Saigon Grand Opera Hotel", lat: 10.7758480, lng: 106.7039947, precision: "exact" },
      { name: "Caravelle Saigon", lat: 10.7761484, lng: 106.7036096, precision: "exact" },
      { name: "Mai House Saigon", lat: 10.7819244, lng: 106.6915794, precision: "exact" },
      { name: "Hôtel des Arts Saigon", lat: 10.7820238, lng: 106.6971407, precision: "exact" },
    ],
    restaurants: [
      { name: "Anan Saigon", lat: 10.7718032, lng: 106.7029748, precision: "exact" },
      { name: "Pot au Pho", lat: 10.7718032, lng: 106.7029748, precision: "building", note: "Anan Saigon 馆内" },
      { name: "Cuc Gach Quan", lat: 10.7929997, lng: 106.6889296, precision: "exact" },
      { name: "The Deck Saigon", lat: 10.8072710, lng: 106.7445900, precision: "exact" },
      { name: "Pho Hoa Pasteur", lat: 10.7868014, lng: 106.6890460, precision: "exact" },
      { name: "Banh Mi Huynh Hoa", lat: 10.7713922, lng: 106.6927189, precision: "exact" },
      { name: "Com Tam Ba Ghien", lat: 10.7921753, lng: 106.6678540, precision: "street", note: "Đặng Văn Ngữ 街道级" },
      { name: "The Workshop Coffee", lat: 10.7734061, lng: 106.7055391, precision: "exact" },
      { name: "Cong Caphe", lat: 10.7666057, lng: 106.6920800, precision: "chain", note: "129 Bùi Viện（代表性分店）" },
    ],
    malls: [
      { name: "同起街", lat: 10.7762521, lng: 106.7028775, precision: "street" },
      { name: "Tan Dinh / Binh Tay（平西）", lat: 10.7898998, lng: 106.6900513, precision: "area" },
    ],
  },
  phuquoc: {
    hotels: [
      { name: "JW Marriott Phu Quoc", lat: 10.0334818, lng: 104.0281698, precision: "exact" },
      { name: "Regent Phu Quoc", lat: 10.131056, lng: 103.989822, precision: "exact", note: "Bai Truong, Phu Quoc Marina" },
      { name: "New World Phu Quoc", lat: 10.0389602, lng: 104.0273181, precision: "exact" },
      { name: "La Festa Phu Quoc, Curio Collection by Hilton", lat: 10.0294910, lng: 104.0073728, precision: "exact" },
      { name: "InterContinental Phu Quoc 洲际", lat: 10.1126352, lng: 103.9835240, precision: "exact" },
      { name: "Fusion Resort Phu Quoc", lat: 10.3079371, lng: 103.8771327, precision: "exact" },
    ],
    restaurants: [
      { name: "Pink Pearl", lat: 10.0334818, lng: 104.0281698, precision: "building", note: "JW Marriott Phu Quoc 馆内" },
      { name: "Tempus Fugit", lat: 10.0334818, lng: 104.0281698, precision: "building", note: "JW Marriott Phu Quoc 馆内" },
      { name: "Crab House", lat: 10.2167587, lng: 103.9600509, precision: "exact", note: "Nguyễn Trãi（复核后）" },
      { name: "Xin Chao Seafood", lat: 10.1955873, lng: 103.9672131, precision: "street", note: "Trần Hưng Đạo 街道级" },
      { name: "Bun Quay Kien Xay", lat: 10.2153838, lng: 103.9623427, precision: "street", note: "Bạch Đằng 街道级" },
      { name: "Dinh Cau Night Market", lat: 10.2172156, lng: 103.9564314, precision: "area", note: "Dinh Cậu 区域" },
      { name: "Ham Ninh 渔村", lat: 10.1763429, lng: 104.0326339, precision: "area", note: "Hàm Ninh 区域" },
      { name: "On the Rocks", lat: 10.2673529, lng: 103.9497614, precision: "area", note: "Ông Lang 区域" },
      { name: "Ocean Club", lat: 10.131056, lng: 103.989822, precision: "building", note: "Regent Phu Quoc 馆内" },
    ],
    malls: [
      { name: "阳东镇正规商店", lat: 10.1825958, lng: 103.9722233, precision: "area" },
    ],
  },
  seoul: {
    hotels: [
      { name: "乐天酒店首尔 Lotte Hotel Seoul", lat: 37.5652278, lng: 126.9806285, precision: "exact", note: "30 Eulji-ro, Jung-gu（2026-09-29 新增：Nominatim display_name 롯데호텔서울 全地址匹配 hotel/tourism）" },
      { name: "威斯汀朝鲜首尔 The Westin Josun Seoul", lat: 37.5641594, lng: 126.9794846, precision: "exact", note: "106 Sogong-ro, Jung-gu（2026-09-29 新增：Nominatim 웨스틴 조선호텔 全地址匹配）" },
      { name: "首尔四季酒店 Four Seasons Hotel Seoul", lat: 37.5706548, lng: 126.9753742, precision: "exact", note: "97 Saemunan-ro, Jongno-gu（2026-09-29 新增：Nominatim 포시즌스호텔 서울 全地址匹配）" },
    ],
    restaurants: [],
    malls: [],
  },
};

/** 取某城市的酒店+餐厅（DayMap / 城市地图用） */
export function placesForCity(cityId: string): CityPlaces {
  return cityPlaces[cityId] ?? { hotels: [], restaurants: [], malls: [] };
}
