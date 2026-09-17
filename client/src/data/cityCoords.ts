/** 8 城坐标（WGS84），行程详情小地图与顶级地图页共用同一套数据 */
export const CITY_COORDS: Record<string, [number, number]> = {
  bangkok: [13.7563, 100.5018],
  chiangmai: [18.7883, 98.9853],
  phuket: [7.8804, 98.3923],
  penang: [5.4141, 100.3288],
  kualalumpur: [3.139, 101.6869],
  hochiminh: [10.8231, 106.6297],
  phuquoc: [10.227, 103.9639],
  singapore: [1.3521, 103.8198],
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
};
