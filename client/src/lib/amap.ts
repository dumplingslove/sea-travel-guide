import L from "leaflet";

/**
 * 高德中文底图 + WGS-84 → GCJ-02 坐标校正（2026-09-27 用户要求：行程地图用中文地图）。
 *
 * 高德瓦片按 GCJ-02 坐标系渲染，站内核实坐标是 WGS-84（Google Maps 来源）。
 * 在东南亚直接叠加会有约 100–400 米偏移，街道级放大后肉眼可见，
 * 因此所有 marker / polyline / bounds / setView / flyTo 入口统一走 LL() 转换。
 * 纯数学函数（经典 eviltransform），不依赖任何外部 API。
 */

const PI = Math.PI;
const A = 6378245.0;
const EE = 0.00669342162296594323;

function transformLat(x: number, y: number): number {
  let ret =
    -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0;
  ret +=
    ((160.0 * Math.sin((y / 12.0) * PI) + 320 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0;
  return ret;
}

function transformLng(x: number, y: number): number {
  let ret =
    300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0;
  ret +=
    ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0;
  return ret;
}

/**
 * WGS-84 → GCJ-02，返回 [lat, lng]。
 * 注意：经典实现里有 outOfChina 短路，但高德全球瓦片统一按 GCJ-02 渲染，
 * 海外同样存在偏移，因此不对中国境外做豁免，全部转换。
 */
export function wgs84ToGcj02(lat: number, lng: number): [number, number] {
  const dLat = transformLat(lng - 105.0, lat - 35.0);
  const dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  const adjLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
  const adjLng = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI);
  return [lat + adjLat, lng + adjLng];
}

/** WGS-84 经纬度 → Leaflet LatLng。当前底图为 Esri（WGS-84），直接透传不做 GCJ-02 转换。 */
export function LL(lat: number, lng: number): L.LatLng {
  return L.latLng(lat, lng);
}

/** 地图底图：Google Maps 中文标注（hl=zh-CN）。2026-09-27 用户要求中文地图；高德 appmaptile 反爬返回空白图已废弃，Esri 为英文标注。Google 用 WGS-84，无需坐标转换。 */
export function addAmapTiles(map: L.Map): L.TileLayer {
  return L.tileLayer(
    "https://mt{s}.google.com/vt/lyrs=m&hl=zh-CN&x={x}&y={y}&z={z}",
    {
      subdomains: "0123",
      attribution: "&copy; Google Maps",
      maxZoom: 19,
    },
  ).addTo(map);
}
