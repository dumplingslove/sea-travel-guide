/**
 * 各城市机场坐标（2026-10-03 用户：所有地图都要标注机场，用不同图标显示）
 * 坐标为机场主航站楼附近，WGS84
 */
export interface AirportInfo {
  /** 中文城市名（与行程城市名对应） */
  cityZh: string;
  /** 机场中文名 */
  name: string;
  /** IATA 代码 */
  code: string;
  lat: number;
  lng: number;
}

export const AIRPORTS: AirportInfo[] = [
  { cityZh: "北京", name: "北京首都国际机场", code: "PEK", lat: 40.0799, lng: 116.6031 },
  { cityZh: "新加坡", name: "新加坡樟宜机场", code: "SIN", lat: 1.3644, lng: 103.9915 },
  { cityZh: "普吉", name: "普吉国际机场", code: "HKT", lat: 8.1132, lng: 98.3168 },
  { cityZh: "清迈", name: "清迈国际机场", code: "CNX", lat: 18.7669, lng: 98.9629 },
  { cityZh: "曼谷", name: "素万那普国际机场", code: "BKK", lat: 13.69, lng: 100.7501 },
  { cityZh: "西安", name: "西安咸阳国际机场", code: "XIY", lat: 34.4384, lng: 108.757 },
  { cityZh: "首尔", name: "首尔仁川国际机场", code: "ICN", lat: 37.4602, lng: 126.4407 },
  { cityZh: "西雅图", name: "西雅图-塔科马国际机场", code: "SEA", lat: 47.4502, lng: -122.3088 },
];

/** 按中文城市名查机场 */
export function airportForCity(cityZh: string): AirportInfo | undefined {
  return AIRPORTS.find((a) => a.cityZh === cityZh);
}
