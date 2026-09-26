/**
 * 酒店 / 餐厅坐标数据（2026-09-26 人工核验）
 *
 * 来源：Nominatim OSM + map.geocode 交叉核验，每条都核对过 display_name。
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
}

/** city_id -> 该城市酒店/餐厅 */
export const cityPlaces: Record<string, CityPlaces> = {
  singapore: {
    hotels: [
      { name: "Capella Singapore", lat: 1.2496982, lng: 103.8244312, precision: "exact" },
      { name: "Raffles Singapore", lat: 1.2946815, lng: 103.8546412, precision: "exact" },
      { name: "Marina Bay Sands", lat: 1.2836965, lng: 103.8607226, precision: "exact" },
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
    ],
  },
  phuket: {
    hotels: [
      { name: "Amanpuri", lat: 7.9862081, lng: 98.2728216, precision: "exact" },
      { name: "Trisara", lat: 8.0349106, lng: 98.2772827, precision: "exact" },
      { name: "Banyan Tree Phuket", lat: 8.0130233, lng: 98.2958261, precision: "exact" },
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
      { name: "Or Tor Kor Market", lat: 13.7971301, lng: 100.5475746, precision: "exact" },
    ],
  },
  chiangmai: {
    hotels: [
      { name: "137 Pillars House", lat: 18.7918933, lng: 99.004047, precision: "exact" },
      { name: "Four Seasons Resort Chiang Mai", lat: 18.9149588, lng: 98.9315215, precision: "exact" },
      { name: "Raya Heritage", lat: 18.8482, lng: 98.9847, precision: "exact", note: "Mae Rim" },
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
  },
};

/** 取某城市的酒店+餐厅（DayMap / 城市地图用） */
export function placesForCity(cityId: string): CityPlaces {
  return cityPlaces[cityId] ?? { hotels: [], restaurants: [] };
}
