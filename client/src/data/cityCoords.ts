/** 8 城 + 首尔坐标（WGS84），行程详情小地图与顶级地图页共用同一套数据
 *  2026-09-29 新增 seoul：回程经首尔中转停留2天（2大1小），首尔市中心行政坐标 Nominatim 核验
 *  2026-10-14 订正 seattle：此前误填 SEA 机场坐标（与 airportCoords 的 SEA 条目逐字
 *  相同，城市图钉落在 SeaTac 机场、市中心图钉与机场图钉完全重叠），改回西雅图
 *  市中心坐标 47.6062,-122.3321（MapQuest 城市坐标）；机场坐标只留 airportCoords。 */
export const CITY_COORDS: Record<string, [number, number]> = {
  bangkok: [13.7563, 100.5018],
  chiangmai: [18.7883, 98.9853],
  phuket: [7.8804, 98.3923],
  penang: [5.4141, 100.3288],
  kualalumpur: [3.139, 101.6869],
  hochiminh: [10.8231, 106.6297],
  phuquoc: [10.227, 103.9639],
  singapore: [1.3521, 103.8198],
  seoul: [37.5667, 126.9783],
  beijing: [39.9042, 116.4074],
  xian: [34.3416, 108.9398],
  seattle: [47.6062, -122.3321],
};

/** 中文城市名 → 城市 id（与 itinerary.json / cities.json 一致） */
export const CITY_ID_BY_ZH: Record<string, string> = {
  "曼谷": "bangkok",
  "清迈": "chiangmai",
  "普吉": "phuket",
  "槟城": "penang",
  "吉隆坡": "kualalumpur",
  "胡志明市": "hochiminh",
  "富国岛": "phuquoc",
  "新加坡": "singapore",
  "首尔": "seoul",
  "北京": "beijing",
  "西安": "xian",
  "西雅图": "seattle",
};
