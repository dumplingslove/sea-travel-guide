import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LL, addAmapTiles } from "@/lib/amap";
import { airportForCity, type AirportInfo } from "@/data/airportCoords";
import { CITY_COORDS } from "@/data/cityCoords";
import { placesForCity } from "@/data/placeCoords";
import { findStopCoord, STOP_COORDS } from "@/data/stopCoords";
import { days, attractions } from "@/guide/data";

/**
 * 景点名模糊匹配坐标（2026-10-06）。
 * 背景：data.ts 景点名（如"郑王庙 Wat Arun"）与行程站点名（如"郑王庙"）命名口径不一致，
 * 精确匹配在 8 城漏掉 58 个景点。归一化（去括号/空格/中英文标点）后双向包含即命中，
 * 口径与本文件酒店/餐厅的 includes 匹配一致；要求较短一方 ≥2 字，避免"塔"这类单字误撞。
 * 置信度低于精确匹配与人工核验坐标，故放在兜底链最后。
 */
function findAttractionCoordFuzzy(name: string) {
  const norm = (s: string) =>
    s.toLocaleLowerCase().replace(/[（(].*?[）)]/g, "").replace(/[\s·・—–\-,，.。&＆]/g, "");
  const want = norm(name);
  if (want.length < 2) return undefined;
  for (const dayNum of Object.keys(STOP_COORDS)) {
    const hit = STOP_COORDS[Number(dayNum)].find((s) => {
      const cand = norm(s.name);
      if (cand.length < 2) return false;
      return cand.includes(want) || want.includes(cand);
    });
    if (hit) return hit;
  }
  return undefined;
}

/** 地图错误边界（2026-10-04 用户：收起→展开白屏修三次未好；改打法：
 * 地图再怎么崩也只显示重试按钮，绝不把整页拖白） */
class MapErrorBoundary extends Component<{ children: ReactNode; title: string }, { err: Error | null }> {
  state = { err: null as Error | null };
  static getDerivedStateFromError(err: Error) { return { err }; }
  componentDidCatch(err: Error) { console.error("[StickyMap]", this.props.title, err); }
  render() {
    if (this.state.err) {
      return (
        <div className="sticky z-[6] -mx-4 px-4 bg-[#faf8f3]/95 border-b border-gray-200 py-3 text-sm text-gray-600">
          <span>{this.props.title} 加载出错</span>
          <button
            className="ml-3 text-teal-700 underline"
            onClick={() => this.setState({ err: null })}
          >重试</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * 吸顶地图条（2026-10-03 用户需求；2026-10-03 晚用户改口：行程页要常显地图）：
 * - sticky 在屏幕最上方（header 之下）；alwaysVisible 时常显地图、无需点展开，
 *   否则点 ▾/▴ 展开折叠，折叠时只占一条细 bar
 * - activeCity 变化时：该城市的点高亮（放大+红圈脉冲），其他城市点淡化；
 *   地图平滑飞到该城市
 * - 2026-10-04 用户：点选景点只平移（panTo，保持当前 zoom），不要放大效果；
 *   被选中的景点平移到视野中央
 * - 2026-10-04 用户：景点名称标签默认不显示，标题栏加"名称"开关控制
 *   （替代旧的 zoom>=14 自动显示口径）
 * - 自动标注所涉城市的机场（✈️ 紫色图标）
 */

export type StickyMapKind = "hotel" | "restaurant" | "attraction" | "itinerary" | "airport";

export interface StickyMapItem {
  name: string;
  city: string;
  lat: number;
  lng: number;
  kind: StickyMapKind;
  note?: string;
  /** 候选（非已收藏）：2026-10-04 用户要在预订页地图看到全部候选酒店/餐厅；
   * 候选用小一号灰色 marker，点击只弹信息框，不关联卡片 */
  candidate?: boolean;
}

/** 地图 marker 的稳定 key：`${kind}:${city}:${name}`（预订卡片用它与地图点关联） */
export function stickyItemKey(kind: string, city: string, name: string): string {
  return `${kind}:${city}:${name}`;
}

/** 航班航线：出发/到达两个机场 + 连线（行动安排页航班卡片用） */
export interface FlightRoute {
  /** 与卡片关联的唯一 key（建议用 stickyItemKey("flight", city, title)） */
  key: string;
  /** 显示名，如 "新加坡 → 普吉" */
  name: string;
  /** 出发城市中文名（airportForCity 可查到机场） */
  fromCity: string;
  /** 到达城市中文名 */
  toCity: string;
}

/** 当日路线站点（行程页点选模式：点某天卡片后顶栏地图只显示这一天） */
export interface DayRouteStop {
  name: string;
  lat: number;
  lng: number;
  kind: "attraction" | "restaurant" | "hotel" | "airport";
}
/** 当日路线：stops 按游览顺序排列，景点连线 */
export interface DayRoute {
  day: number;
  city: string;
  label: string;
  stops: DayRouteStop[];
}

const KIND_EMOJI: Record<StickyMapKind, string> = {
  hotel: "🏨",
  restaurant: "🍽️",
  attraction: "🏛️",
  itinerary: "📍",
  airport: "✈️",
};

/**
 * 规范经度（2026-10-04 点选模式重构：所有航线统一挪到以太平洋为中心的世界副本，
 *  每个机场全站只保留一个标记，从根子上杜绝"同一机场在 DOM 里出现两次"）。
 * 把经度平移到离 center 最近的 ±360° 副本（如西雅图 -122.3 → 237.7），
 * 连线自动走最短路径（太平洋），不再逐段 wrap。
 */
const WORLD_CENTER_LNG = 150;
function canonicalLng(lng: number, center: number = WORLD_CENTER_LNG): number {
  return lng + 360 * Math.round((center - lng) / 360);
}

/** 站点编号标记（当日模式：景点按游览顺序编号，与旧 DayMap 视觉一致） */
function numIcon(n: number, active = false) {
  const size = active ? 36 : 28;
  return L.divIcon({
    className: "sea-stickymap-marker",
    html: `<span style="
      display:grid;place-items:center;width:${size}px;height:${size}px;border-radius:999px;
      background:#0f766e;color:#ffffff;border:${active ? 4 : 2}px solid ${active ? "#dc2626" : "#ffffff"};
      font-weight:800;font-size:${active ? 15 : 13}px;line-height:1;
      box-shadow:0 2px 8px rgba(15,118,110,.4);
      ${active ? "animation:sea-pin-pulse 1.2s ease-in-out infinite;" : ""}
    ">${n}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function iconFor(kind: StickyMapKind, active = false, candidate = false) {
  // 候选：小一号灰色（2026-10-04 用户：预订页地图显示全部候选，与已收藏区分）
  const size = candidate ? 22 : active ? 46 : 32;
  const conf: Record<StickyMapKind, [string, string, string]> = {
    hotel: ["#1d4ed8", "#ffffff", "#1d4ed8"],
    restaurant: ["#ffffff", "#c2410c", "#ea580c"],
    attraction: ["#0f766e", "#ffffff", "#0f766e"],
    itinerary: ["#ffffff", "#4b5563", "#9ca3af"],
    airport: ["#7c3aed", "#ffffff", "#7c3aed"],
  };
  const [bg, fg, border] = conf[kind];
  const cBg = candidate ? "#9ca3af" : bg;
  const cBorder = candidate ? "#6b7280" : border;
  return L.divIcon({
    className: "sea-stickymap-marker",
    html: `<span style="
      display:grid;place-items:center;width:${size}px;height:${size}px;border-radius:999px;
      background:${cBg};color:${fg};border:${active ? 4 : 2}px solid ${active ? "#dc2626" : cBorder};
      font-size:${candidate ? 11 : active ? 20 : 15}px;line-height:1;
      box-shadow:0 2px 10px rgba(0,0,0,.3);
      ${active ? "animation:sea-pin-pulse 1.2s ease-in-out infinite;" : ""}
    ">${KIND_EMOJI[kind]}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

/**
 * 行动安排用地图点组装（从 ActionMapView 复制逻辑，避免与其正在进行的改动冲突）：
 * 收藏的酒店/餐厅/景点 + 详细行程里全部景点；itineraryCities 提供时只收录这些城市。
 */
export function buildItemsFromFavorites(
  favorites: { name: string; city: string; type: string }[],
  itineraryCities?: string[],
  /**
   * 是否收录详细行程里的全部景点（2026-10-04 Bug 3：行动安排页只有航班/酒店卡，
   * 行程景点标记永远不可见，传 false 去掉，别留死标记；默认 true 保持行程页行为）
   */
  includeItinerary: boolean = true,
): StickyMapItem[] {
  const out: StickyMapItem[] = [];
  const seen = new Set<string>();
  const allowedCities = itineraryCities ? new Set(itineraryCities) : null;

  const byCity = new Map<string, { name: string; type: string }[]>();
  for (const f of favorites) {
    if (!["hotel", "restaurant", "attraction"].includes(f.type)) continue;
    if (allowedCities && !allowedCities.has(f.city)) continue;
    if (!byCity.has(f.city)) byCity.set(f.city, []);
    byCity.get(f.city)!.push({ name: f.name, type: f.type });
  }
  const cityIdOf = (zh: string): string | null => {
    for (const [id, c] of Object.entries(CITY_COORDS)) {
      if ((c as unknown as { zh?: string }).zh === zh) return id;
    }
    const m: Record<string, string> = {
      "新加坡": "singapore", "曼谷": "bangkok", "清迈": "chiangmai",
      "普吉": "phuket", "首尔": "seoul", "北京": "beijing", "西安": "xian",
    };
    return m[zh] ?? null;
  };
  for (const [cityZh, list] of byCity) {
    const cityId = cityIdOf(cityZh);
    if (!cityId) continue;
    const places = placesForCity(cityId);
    for (const { name, type } of list) {
      const key = `${type}:${name}`;
      if (seen.has(key)) continue;
      let coord: { lat: number; lng: number } | undefined;
      if (type === "hotel")
        coord = places.hotels.find(
          (h) => h.name === name || h.name.includes(name) || name.includes(h.name),
        );
      else if (type === "restaurant")
        coord = places.restaurants.find(
          (r) => r.name === name || r.name.includes(name) || name.includes(r.name),
        );
      else coord = findStopCoord(name);
      if (coord) {
        seen.add(key);
        out.push({
          name,
          city: cityZh,
          kind: type as StickyMapKind,
          lat: coord.lat,
          lng: coord.lng,
        });
      }
    }
  }

  for (const d of days) {
    if (!includeItinerary) break;
    if (allowedCities && !allowedCities.has(d.city)) continue;
    for (const s of d.stops) {
      const key = `itinerary:${s.name}`;
      if (seen.has(key)) continue;
      const coord = findStopCoord(s.name);
      if (coord) {
        seen.add(key);
        out.push({
          name: s.name,
          city: d.city,
          kind: "itinerary",
          lat: coord.lat,
          lng: coord.lng,
          note: `${d.date} ${d.title}`,
        });
      }
    }
  }
  return out;
}

/**
 * 需提前订票景点坐标兜底（2026-10-04 site-improve-hourly 补）。
 * 背景：findStopCoord 只收录行程站点名（精确匹配），MUST_BOOK 里 9/11 项查不到，
 * 导致预订页景点 tab / 行动安排页地图上备选景点大面积缺失（用户要求"备选景点要在地图上显示"）。
 * 以下坐标 2026-10-04 经 map.geocode 实查，full_address 逐条核对为景点本体（非同名商铺/街道）。
 * Siam Niramit 的坐标 2026-10-06 已补（见 EXTRA_ATTRACTION_COORDS）。
 */
const MUST_BOOK_COORDS: Record<string, { lat: number; lng: number }> = {
  "大象自然公园": { lat: 19.2144, lng: 98.85888 }, // Elephant Nature Park 主园区，Mae Taeng, Chiang Mai
  "Phuket Elephant Sanctuary": { lat: 8.02199, lng: 98.38852 }, // Paklok, Thalang, Phuket
  "夜间动物园": { lat: 1.40197, lng: 103.78799 }, // Night Safari, Mandai, Singapore
  "环球影城": { lat: 1.25407, lng: 103.82381 }, // Universal Studios Singapore, Sentosa
  "滨海湾花园": { lat: 1.28213, lng: 103.86372 }, // Gardens by the Bay, 18 Marina Gardens Dr
  "吉姆·汤普森之家": { lat: 13.74876, lng: 100.52848 }, // Jim Thompson House Museum, Pathum Wan, Bangkok
  "因他农国家公园": { lat: 18.53569, lng: 98.52234 }, // Doi Inthanon NP（1009 公路园内实查点）
};

/**
 * 非行程站点景点的坐标兜底（2026-10-06 用户抓包：预订页挑酒店地图普吉只显示 2 个景点；
 * 按"工作模型全局应用"同轮补齐曼谷/新加坡/清迈三行程城市，非行程城市暂不补）。
 * 背景：data.ts 景点名与行程站点名命名口径不一致，精确匹配在 8 城漏掉 58 个景点。
 * 坐标来源分两类：① 复用 stopCoords.ts 里已核验的行程站点坐标（同地异名）；
 * ② 2026-10-06 经 web 实查（Wikipedia / mapcarta-OSM / place listing），取景点本体（非同名商铺），
 * 双源交叉印证处已注明。诚实跳过（不编造）：皮皮岛（群岛无单点）、湄南河游船（线路无单点）。
 */
const EXTRA_ATTRACTION_COORDS: Record<string, { lat: number; lng: number }> = {
  // —— 普吉（2026-10-06 用户抓包"挑酒店地图普吉只显示 2 个景点"后补） ——
  "大佛": { lat: 7.827598, lng: 98.312853 }, // GeoHack/Wikipedia，Nakkerd Hill 山顶
  "查龙寺": { lat: 7.84625, lng: 98.3371 }, // mapcarta/OpenStreetMap
  "神仙半岛": { lat: 7.761831, lng: 98.305351 }, // place listing；Wikimedia Commons 7.7590,98.3033 交叉印证
  "卡塔诺伊海滩": { lat: 7.80657, lng: 98.29678 }, // mapcarta Ao Kata Noi 海湾中心
  "芭东 Bangla 路": { lat: 7.893274, lng: 98.298102 }, // 39 Soi Bangla Rd 沿街商户坐标
  "Siam Niramit": { lat: 7.932287, lng: 98.37563 }, // 官方站登记地址 55/81 Moo 5 的 place 坐标
  // —— 曼谷（同轮按"工作模型全局应用"补齐行程城市） ——
  "大皇宫 & 玉佛寺": { lat: 13.7493514, lng: 100.4918643 }, // 复用行程站点"大皇宫深度游"已核验坐标
  "卧佛寺 Wat Pho": { lat: 13.7463456, lng: 100.4927381 }, // 复用行程站点"卧佛寺与按摩"已核验坐标
  "恰图恰周末市场": { lat: 13.8002651, lng: 100.5511228 }, // 复用行程站点"恰图恰周末市集"已核验坐标（市场/市集同地）
  "伦披尼公园": { lat: 13.73056, lng: 100.54167 }, // Wikipedia Lumphini Park
  "金山寺": { lat: 13.75389, lng: 100.50833 }, // Wikipedia Wat Saket
  "Mahanakhon 天空步道": { lat: 13.72361, lng: 100.52833 }, // Wikipedia King Power Mahanakhon
  "大城府 Ayutthaya 古城遗迹": { lat: 14.34778, lng: 100.56056 }, // Wikipedia UNESCO Historic City of Ayutthaya
  "丹嫩沙多水上市场+美功铁道": { lat: 13.51933, lng: 99.95928 }, // mapcarta/OSM 丹嫩沙多水上市场；美功铁道市场在 Samut Songkhram，单点仅标水上市场
  // —— 新加坡 ——
  "新加坡动物园与Bird Paradise": { lat: 1.403782, lng: 103.79414 }, // Wikipedia Singapore Zoo；Bird Paradise 同属万态片区相邻
  "小印度": { lat: 1.30667, lng: 103.84972 }, // Wikipedia Little India MRT
  // —— 清迈 ——
  "周日步行街": { lat: 18.78821, lng: 98.98799 }, // mapcarta/OSM Sunday Market (Walking Street)
  "Baan Kang Wat": { lat: 18.77631, lng: 98.94836 }, // mapcarta/OSM
  "乌蒙寺": { lat: 18.7831833, lng: 98.9513083 }, // Wikipedia Wat Umong
  "瓦洛洛市场": { lat: 18.790239, lng: 99.000628 }, // place listing，Wichayanon Rd
  // 诚实跳过（不编造）：皮皮岛（群岛无单点）、湄南河游船（线路无单点）
};

/**
 * 候选酒店/餐厅（2026-10-04 用户：预订页地图要看到全部候选，不只已收藏的）。
 * 返回指定城市（中文名）在 cityPlaces 里的全部酒店+餐厅，标 candidate:true。
 * 调用方负责与已收藏去重（同 key 的已收藏优先）。
 */
export function buildCandidateItems(cities: string[]): StickyMapItem[] {
  const out: StickyMapItem[] = [];
  const zhToId: Record<string, string> = {
    "新加坡": "singapore", "曼谷": "bangkok", "清迈": "chiangmai",
    "普吉": "phuket", "首尔": "seoul", "北京": "beijing", "西安": "xian",
    "槟城": "penang", "吉隆坡": "kualalumpur", "胡志明市": "hochiminh", "富国岛": "phuquoc",
  };
  for (const zh of cities) {
    const id = zhToId[zh];
    if (!id) continue;
    const places = placesForCity(id);
    for (const h of places.hotels) {
      out.push({ name: h.name, city: zh, lat: h.lat, lng: h.lng, kind: "hotel", candidate: true, note: "候选酒店" });
    }
    for (const r of places.restaurants) {
      out.push({ name: r.name, city: zh, lat: r.lat, lng: r.lng, kind: "restaurant", candidate: true, note: "候选餐厅" });
    }
    // 2026-10-04 用户：预订页地图要显示该城市 ALL 景点（不是只卖票的11个），
    // 才能判断餐厅/酒店位置是否合理。有坐标的才收录（精确 → 人工核验 → 模糊匹配兜底）。
    for (const a of attractions) {
      if (a.city !== zh) continue;
      const coord = findStopCoord(a.name) ?? MUST_BOOK_COORDS[a.name] ?? EXTRA_ATTRACTION_COORDS[a.name] ?? findAttractionCoordFuzzy(a.name);
      if (coord) {
        out.push({ name: a.name, city: zh, lat: coord.lat, lng: coord.lng, kind: "attraction", candidate: true, note: "景点" });
      }
    }
  }
  return out;
}

interface StickyMapBarProps {
  items: StickyMapItem[];
  /** 当前屏幕中央的城市（中文名）：高亮该城的点并飞过去；null 时不动作。
      activeItemKeys 非 null 时项目级高亮优先，此字段仅用于标题副文案 */
  activeCity: string | null;
  /** bar 上显示的副标题，如 "D9 · 新加坡" */
  activeLabel?: string;
  /**
   * 点选高亮（2026-10-04 用户裁决：废弃滚动侦测，改点卡片高亮）：
   * 非空数组 = 用户点选了某张卡片，只显示该卡片对应的点（航班卡=两机场+连线）；
   * null/undefined/空数组 = 未点选，全部显示（行程页旧的城市级行为此时仍按 activeCity 走）。
   */
  activeItemKeys?: string[] | null;
  /** 航班航线（出发/到达机场标记 + 紫色连线），key 与卡片关联 */
  flightRoutes?: FlightRoute[];
  /**
   * 当日路线（2026-10-04 用户：行程页点某天卡片后，顶栏地图只显示这一天的站点+连线）。
   * 非 null 时进入当日模式：概览 markers 与航线层隐藏，只显示当日的 stops + 按序连线。
   */
  activeDayRoute?: DayRoute | null;
  /**
   * 外部展开信号（2026-10-04 用户：点卡片时自动展开地图）：数字递增时若面板折叠则展开。
   * 不传则无此行为。
   */
  expandSignal?: number;
  /**
   * 标记点被点击时（2026-10-04 用户：地图里的文字加详细信息链接，点击跳转到对应文字位置）：
   * 弹窗里的"查看详情"链接被点时调用，传 marker 的 key（如 hotel:新加坡:Raffles Singapore）。
   * 父组件负责滚到对应卡片。
   */
  onMarkerSelect?: (key: string) => void;
  title?: string;
  defaultCollapsed?: boolean;
  /** localStorage key：记住折叠状态（alwaysVisible 时忽略） */
  storageKey?: string;
  /** 高度变化回调（父组件用它叠放其他 sticky 条） */
  onHeightChange?: (h: number) => void;
  /** 2026-10-04 用户反馈三层吸顶打架：为 true 时地图不吸顶，随页面滚动 */
  disableSticky?: boolean;
  /** 常显模式：地图一直显示，不提供折叠按钮（2026-10-03 晚用户：行程页地图常显） */
  alwaysVisible?: boolean;
  /**
   * 外部指定的吸顶 top（px）。不传时内部按顶栏高度算。
   * 2026-10-04 用户：预订页地图被二级菜单盖住——地图 sticky top 必须 = 顶栏 + 二级菜单，
   * 由 BookingsPage 把算好的值传进来。
   */
  stickyTop?: number;
  /**
   * 点选卡片时是否缩放到该点（默认 true）。
   * 2026-10-04 用户：预订页酒店/餐厅地图要点"全景思维"——显示该城全部酒店+全部景点，
   * 点某张卡只高亮它，不许把地图缩放到只剩一个点。传 false 关闭缩放。
   */
  selectZoom?: boolean;
  /**
   * @deprecated 2026-10-04 用户：其他地图都不需要自动标注机场，此 prop 废弃保留仅防旧调用报错。
   */
  keepAirportsInSelect?: boolean;
}

export default function StickyMapBar({
  items,
  activeCity,
  activeLabel,
  activeItemKeys = null,
  flightRoutes = [],
  activeDayRoute = null,
  expandSignal,
  title = "🗺️ 地图",
  defaultCollapsed = true,
  storageKey,
  onHeightChange,
  alwaysVisible = false,
  stickyTop,
  disableSticky,
  selectZoom = true,
  onMarkerSelect,
}: StickyMapBarProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef(new Map<string, L.Marker>());
  const onMarkerSelectRef = useRef<((key: string) => void) | undefined>(undefined);
  onMarkerSelectRef.current = onMarkerSelect;
  const selKindRef = useRef<string | null>(null);
  const itemByKeyRef = useRef(new Map<string, StickyMapItem>());
  // 航线层：连线按航线 key 存；机场标记按 IATA code 全站唯一（规范经度已统一世界副本，
  // 同一机场不可能出现两次，2026-10-04 点选重构根治 DOM 重复）
  interface RouteAirportEntry {
    marker: L.Marker;
    ap: AirportInfo;
    latlng: L.LatLng;
    /** 哪些航线用到该机场 + 每条航线的角色（出发/到达），用于显隐与 popup */
    roles: Map<string, "dep" | "arr">;
  }
  const routeLayersRef = useRef<{
    lines: Map<string, L.Polyline>;
    airports: Map<string, RouteAirportEntry>;
  }>({ lines: new Map(), airports: new Map() });
  // show-all 下航线首次就绪时适配一次全景，之后不再打扰用户缩放/点选
  const routesFittedRef = useRef(false);
  // 当日路线层：站点 markers（景点按序编号）+ 按序连线；进入当日模式时重建
  const dayLayersRef = useRef<{
    entries: Map<string, { marker: L.Marker; kind: StickyMapKind; num: number }>;
    line: L.Polyline | null;
  }>({ entries: new Map(), line: null });
  // activeItemKeys 每次 render 都是新数组引用，用排序签名去重，避免无意义重飞
  const activeSig = activeItemKeys && activeItemKeys.length ? [...activeItemKeys].sort().join("|") : null;
  // 点选模式：非空选择 = 只显示被选中的；空/null = 全部显示
  const itemMode = activeSig !== null;

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    // 常显模式：永不折叠，忽略 storageKey/defaultCollapsed
    if (alwaysVisible) return false;
    if (storageKey) {
      try {
        const v = localStorage.getItem(storageKey);
        if (v === "0") return false;
        if (v === "1") return true;
      } catch {
        /* 忽略 */
      }
    }
    return defaultCollapsed;
  });
  // 地图懒初始化：折叠模式下首次展开时才创建 Leaflet（display:none 容器里初始化会导致首展视图错乱）；
  // 常显模式直接初始化（容器初始即有尺寸）
  const [mapReady, setMapReady] = useState(!collapsed);
  // 景点名称标签开关（2026-10-04 用户：默认不显示，标题栏开关控制；状态持久化）
  const labelStorageKey = storageKey ? `${storageKey}:labels` : "stickymap:labels";
  const [showLabels, setShowLabels] = useState<boolean>(() => {
    try {
      return localStorage.getItem(labelStorageKey) === "1";
    } catch {
      return false;
    }
  });
  const showLabelsRef = useRef(showLabels);
  const [topPx, setTopPx] = useState(0);

  // sticky top：优先用外部传入的 stickyTop（预订页：顶栏+二级菜单），否则动态测量顶栏
  useEffect(() => {
    if (stickyTop != null) {
      setTopPx(stickyTop);
      return;
    }
    const sync = () => {
      const header = document.querySelector("header.sticky");
      setTopPx(header ? Math.round(header.getBoundingClientRect().height) : 0);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [stickyTop]);

  // 高度变化上报
  useEffect(() => {
    if (!onHeightChange || !wrapRef.current) return;
    const el = wrapRef.current;
    const ro = new ResizeObserver(() => {
      onHeightChange(Math.round(el.getBoundingClientRect().height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [onHeightChange]);

  const toggle = () => {
    if (alwaysVisible) return; // 常显模式无折叠
    const nv = !collapsed;
    setCollapsed(nv);
    // 2026-10-04 根治：收起→展开白屏/报错的根子是 Leaflet 实例在 display:none 里
    // 反复 invalidateSize 也救不回来。改打法：收起直接销毁地图实例，
    // 展开时重建一个干净的（容器此时已有真实尺寸，一次初始化成功）。
    // 错误边界保留作最后一道兜底。
    setMapReady(!nv);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, nv ? "1" : "0");
      } catch {
        /* 忽略 */
      }
    }
  };

  // 外部展开信号：点卡片时自动展开地图面板（常显模式无折叠，直接忽略）
  const lastExpandSigRef = useRef(0);
  useEffect(() => {
    if (alwaysVisible) return;
    if (expandSignal != null && expandSignal > lastExpandSigRef.current) {
      lastExpandSigRef.current = expandSignal;
      setCollapsed(false);
      setMapReady(true); // 重建干净的地图实例（根治打法，见 toggle）
    }
  }, [expandSignal, alwaysVisible]);

  // 名称标签显隐（2026-10-04 用户：默认不显示，标题栏"名称"开关控制；
  // 替代旧的 zoom>=14 自动显示口径）。zoomend 监听只绑一次，用 ref 读最新开关值避免闭包过期。
  // 2026-10-04 真站：航线标记是 flightRoutes 异步到达后（重）建的，updateLabels 只在 zoomend/400ms 跑一次，
  // 重建后 tooltip 永远停在 opacity 0。改为组件级函数，markers/航线层每次（重）建后都调一次。
  /** 候选标按缩放显隐（2026-10-04 用户：总览时 130+ 候选糊成一片看不见；zoom>=10 才显示） */
  const refreshCandidateVisibility = () => {
    const map = mapRef.current;
    if (!map) return;
    const z = map.getZoom();
    const show = z >= 10;
    markersRef.current.forEach((m, key) => {
      const it = itemByKeyRef.current.get(key);
      if (!it?.candidate) return;
      // 被选中的候选保持可见（选择优先于缩放阈值）
      const el = m.getElement();
      if (!el) return;
      el.style.display = show ? "" : "none";
    });
  };
  const refreshLabelVisibility = () => {
    const map = mapRef.current;
    if (!map) return;
    const show = showLabelsRef.current;
    map.eachLayer((layer: unknown) => {
      const m = layer as L.Marker;
      if (m.getTooltip) {
        const tip = m.getTooltip();
        const el = tip && tip.getElement();
        // tooltip 是独立 DOM（不在 marker 元素内）；setVis 用 opacity:0 藏 marker
        // （2026-10-04 从 display:none 改为淡入淡出），这里必须按同一口径判断，
        // 否则当日模式/点选模式下被隐藏标记的标签会飘在地图上。
        const markerEl = m.getElement && m.getElement();
        const markerVisible = !markerEl || (markerEl as HTMLElement).style.opacity !== "0";
        if (el) (el as HTMLElement).style.opacity = show && markerVisible ? "1" : "0";
      }
    });
  };

  // 名称开关变化：持久化 + 立即刷新标签显隐
  useEffect(() => {
    showLabelsRef.current = showLabels;
    try {
      localStorage.setItem(labelStorageKey, showLabels ? "1" : "0");
    } catch {
      /* 忽略 */
    }
    refreshLabelVisibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLabels]);

  // 地图初始化（一次，懒：首次展开后容器有真实尺寸才创建，避免 display:none 里初始化）
  useEffect(() => {
    if (!mapReady || !mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, { zoomControl: true, scrollWheelZoom: false });
    mapRef.current = map;
    addAmapTiles(map);
    // 初始视图：太平洋为中心的概览；航线层就绪后会 fit 到全部航线（routesFittedRef 只做一次）
    map.setView([30, 150], 3);
    const ro = new ResizeObserver(() => map.invalidateSize());
    if (mapEl.current) ro.observe(mapEl.current);
    map.on("zoomend", refreshLabelVisibility);
    map.on("zoomend", refreshCandidateVisibility);
    const t = setTimeout(() => { refreshLabelVisibility(); refreshCandidateVisibility(); }, 400);
    return () => {
      clearTimeout(t);
      map.off("zoomend", refreshLabelVisibility);
      map.off("zoomend", refreshCandidateVisibility);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);

  // markers 重建（items 变化时）
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();
    itemByKeyRef.current.clear();
    const latlngs: L.LatLng[] = [];
    const seen = new Set<string>();
    const addMarker = (it: StickyMapItem) => {
      const key = stickyItemKey(it.kind, it.city, it.name);
      if (seen.has(key)) return;
      seen.add(key);
      const ll = LL(it.lat, it.lng);
      latlngs.push(ll);
      const marker = L.marker(ll, { icon: iconFor(it.kind, false, !!it.candidate) })
        .bindPopup(
          `<b>${it.name}</b><br/>${KIND_EMOJI[it.kind]} ${it.city}${it.note ? `<br/><span style="color:#6b7280;font-size:12px">${it.note}</span>` : ""}<br/><a href="#" data-detail-key="${key}" style="color:#0d9488;font-size:13px;font-weight:600">查看详情 →</a>`,
        )
        .addTo(map);
      // 2026-10-04 用户：弹窗里的"查看详情"点一下，页面滚到对应卡片
      marker.on("popupopen", (e: any) => {
        const el = e.popup?.getElement?.() as HTMLElement | undefined;
        const link = el?.querySelector?.("[data-detail-key]") as HTMLElement | null;
        if (link && !(link as any)._detailBound) {
          (link as any)._detailBound = true;
          link.addEventListener("click", (ev) => {
            ev.preventDefault();
            const k = link.getAttribute("data-detail-key");
            if (k) onMarkerSelectRef.current?.(k);
          });
        }
      });
      marker.bindTooltip(it.name, {
        permanent: true,
        direction: "top",
        offset: [0, -20],
        className: "sea-stickymap-label",
        opacity: 0,
      });
      markersRef.current.set(key, marker);
      itemByKeyRef.current.set(key, it);
    };
    for (const it of items) addMarker(it);
    // 2026-10-04 用户：其他地图都不需要自动标注机场。只有每日行程有坐飞机才标机场
    // （走 activeDayRoute.stops，由 ItineraryDayCard 按转场日显式加入），航班走 flightRoutes 航线层。
    // 此处不再自动加机场。
    if (latlngs.length === 1) map.setView(latlngs[0], 13);
    else if (latlngs.length > 1) {
      // 2026-10-04 用户：每次打开页面要是全局 view（所有酒店都在视野里）。
      // 用 fitBounds 显示全部，不定死 zoom 14。
      map.fitBounds(L.latLngBounds(latlngs).pad(0.05));
    }
    refreshLabelVisibility(); // 2026-10-04 真站：markers 重建后 tooltip 重置为 opacity 0，立即按当前 zoom 恢复
    refreshCandidateVisibility(); // 2026-10-04：重建后按当前 zoom 决定候选标显隐
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, mapReady]);
  // 2026-10-04 修：点选（activeItemKeys）变化不许重建 markers——高亮 effect 已负责更新图标，
  // 重建会导致闪烁和时序错乱。markers 只随 items/mapReady 重建。
  // 2026-10-04 用户：其他地图不再自动加机场（keepAirportsInSelect 废弃）。

  // 航班航线层（2026-10-04 点选重构）：
  // - 每个机场按 IATA code 全站唯一标记，位置取规范经度（太平洋世界副本），DOM 重复从根子上消失
  // - 每条航线 = 紫色虚线连线（规范经度下自动走太平洋短路径）
  // - 点选某航班卡时高亮 effect 只显示该航线；未点选时全部显示
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const layers = routeLayersRef.current;
    layers.lines.forEach((l) => l.remove());
    layers.airports.forEach((a) => a.marker.remove());
    layers.lines.clear();
    layers.airports.clear();
    if (!flightRoutes.length) return;
    const routeNameOf = (key: string) => flightRoutes.find((x) => x.key === key)?.name ?? key;
    /** 规范坐标（code → 唯一位置，多条航线共用） */
    const canon = new Map<string, { ap: AirportInfo; lat: number; lng: number }>();
    const canonOf = (city: string) => {
      const ap = airportForCity(city);
      if (!ap) return null;
      let c = canon.get(ap.code);
      if (!c) {
        c = { ap, lat: ap.lat, lng: canonicalLng(ap.lng) };
        canon.set(ap.code, c);
      }
      return c;
    };
    const ensureAirport = (
      c: { ap: AirportInfo; lat: number; lng: number },
      role: "dep" | "arr",
      routeKey: string,
    ) => {
      let entry = layers.airports.get(c.ap.code);
      if (!entry) {
        const marker = L.marker(LL(c.lat, c.lng), { icon: iconFor("airport") })
          .bindTooltip(`${c.ap.name}（${c.ap.code}）`, {
            permanent: true,
            direction: "top",
            offset: [0, -20],
            className: "sea-stickymap-label",
            opacity: 0,
          })
          .addTo(map);
        entry = { marker, ap: c.ap, latlng: LL(c.lat, c.lng), roles: new Map() };
        layers.airports.set(c.ap.code, entry);
      }
      entry.roles.set(routeKey, role);
      const roleLines = [...entry.roles.entries()]
        .map(([rk, rl]) => `${rl === "dep" ? "🛫 出发" : "🛬 到达"} · ${routeNameOf(rk)}`)
        .join("<br/>");
      entry.marker.bindPopup(`<b>${c.ap.name}（${c.ap.code}）</b><br/>${roleLines}`);
    };
    const pts: L.LatLng[] = [];
    for (const r of flightRoutes) {
      const from = canonOf(r.fromCity);
      const to = canonOf(r.toCity);
      if (!from || !to) continue; // 任一机场查不到坐标就不画这条线
      const line = L.polyline([LL(from.lat, from.lng), LL(to.lat, to.lng)], {
        color: "#7c3aed",
        weight: 3,
        opacity: 0.9,
        dashArray: "8 6",
      }).addTo(map);
      layers.lines.set(r.key, line);
      ensureAirport(from, "dep", r.key);
      ensureAirport(to, "arr", r.key);
      pts.push(LL(from.lat, from.lng), LL(to.lat, to.lng));
    }
    refreshLabelVisibility();
    // 未点选时航线首次就绪 → 适配全部航线全景（只做一次，不打扰后续点选/缩放）
    if (!routesFittedRef.current && pts.length > 1) {
      routesFittedRef.current = true;
      map.fitBounds(L.latLngBounds(pts).pad(0.25));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightRoutes, mapReady]);

  // 当日路线层（2026-10-04 用户：行程页点某天卡片后顶栏地图只显示这一天）：
  // 站点 markers（景点按游览顺序编号）+ 按序连线；activeDayRoute 变化时重建
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const dl = dayLayersRef.current;
    dl.entries.forEach((e) => e.marker.remove());
    dl.entries.clear();
    if (dl.line) {
      dl.line.remove();
      dl.line = null;
    }
    const route = activeDayRoute;
    if (!route || !route.stops.length) return;
    const pts: L.LatLng[] = [];
    let n = 0;
    for (const s of route.stops) {
      const key = stickyItemKey(s.kind, route.city, s.name);
      if (dl.entries.has(key)) continue;
      const num = s.kind === "attraction" ? ++n : 0;
      const ll = LL(s.lat, s.lng);
      pts.push(ll);
      const marker = L.marker(ll, {
        icon: num > 0 ? numIcon(num, false) : iconFor(s.kind, false),
      })
        .bindPopup(`<b>${s.name}</b><br/>${KIND_EMOJI[s.kind]} ${route.city}`)
        .addTo(map);
      marker.bindTooltip(s.name, {
        permanent: true,
        direction: "top",
        offset: [0, -20],
        className: "sea-stickymap-label",
        opacity: 0,
      });
      dl.entries.set(key, { marker, kind: s.kind, num });
    }
    if (pts.length > 1) {
      dl.line = L.polyline(pts, { color: "#0f766e", weight: 3, opacity: 0.85 }).addTo(map);
    }
    refreshLabelVisibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDayRoute, mapReady]);

  // 高亮（2026-10-04 点选重构 v2：废弃滚动侦测；点选后其他的正常显示、不隐藏）
  // - 当日模式（activeDayRoute 非 null，行程页点某天卡片）：只显示当天的站点+连线，
  //   概览 markers 与航线层隐藏；被选中的站点跳动，其他正常显示
  // - 点选模式（itemMode，行动安排页点卡片）：全部显示，被选中的跳动
  //   （2026-10-04 用户：其他的简单显示在地图上，不隐藏不跳动）；航班卡选中时其航线全亮、其他航线变淡
  // - 概览：全部正常显示
  // - 城市级（activeCity，旧行为保留）：高亮该城市的点并飞过去
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const setVis = (m: L.Marker, v: boolean) => {
      const el = m.getElement();
      if (el) {
        el.style.transition = "opacity .3s";
        el.style.opacity = v ? "1" : "0";
        el.style.pointerEvents = v ? "auto" : "none";
      }
    };
    const pts: L.LatLng[] = [];
    const activeSet = itemMode ? new Set(activeSig!.split("|")) : null;
    const dayScope = activeDayRoute != null;
    const dl = dayLayersRef.current;
    const rl = routeLayersRef.current;

    if (dayScope) {
      // 当日模式：概览层与航线层全部隐藏，只显示当日站点+连线
      markersRef.current.forEach((m) => setVis(m, false));
      rl.lines.forEach((l) => l.setStyle({ opacity: 0 }));
      rl.airports.forEach((a) => setVis(a.marker, false));
      if (dl.line) dl.line.setStyle({ opacity: 0.85 });
      dl.entries.forEach((e, key) => {
        const sel = !!activeSet?.has(key);
        e.marker.setIcon(e.num > 0 ? numIcon(e.num, sel) : iconFor(e.kind, sel));
        setVis(e.marker, true);
        if (sel) {
          pts.push(e.marker.getLatLng());
          if (pts.length === 1) selKindRef.current = e.kind;
        }
      });
      if (pts.length) {
        // 点了具体卡片：平移+缩放到位，但用 setView 直接过渡，不要 flyTo 的先拉远再推进效果
        // （2026-10-04 用户：要平移缩放到合适大小，不要从头缩放的效果）
        if (pts.length === 1) {
          const kind = selKindRef.current;
          const target = kind === "hotel" || kind === "restaurant" ? 16 : kind === "attraction" ? 15 : 14;
          const z = Math.max(map.getZoom(), target);
          map.setView(pts[0], z, { animate: true, duration: 0.8 });
        } else map.flyToBounds(L.latLngBounds(pts).pad(0.4), { duration: 0.8 });
      } else {
        // 刚切到当日（还没点具体卡）：看当日全景
        const all = [...dl.entries.values()].map((e) => e.marker.getLatLng());
        if (all.length === 1) map.flyTo(all[0], 14, { duration: 0.8 });
        else if (all.length > 1) map.flyToBounds(L.latLngBounds(all).pad(0.3), { duration: 0.8 });
      }
      refreshLabelVisibility(); // 显隐变化后同步标签（当日模式隐藏了底图标记）
      return;
    }

    // 非当日模式：当日层隐藏
    dl.entries.forEach((e) => setVis(e.marker, false));
    if (dl.line) dl.line.setStyle({ opacity: 0 });

    // 概览 markers：点选模式下全部显示、被选中的跳动；城市模式按城市过滤
    markersRef.current.forEach((m, key) => {
      const it = itemByKeyRef.current.get(key);
      if (!it) return;
      let visible = true;
      let on = false;
      if (itemMode) {
        on = activeSet!.has(key);
        visible = true; // 2026-10-04 用户：其他的简单显示，不隐藏
      } else {
        const inActiveCity = !!activeCity && it.city === activeCity;
        // 2026-10-04 修：城市切换只过滤可见性，不触发脉冲高亮；脉冲只给点选的单项
        on = false;
        visible = !activeCity || inActiveCity;
      }
      m.setIcon(iconFor(it.kind, on, !!it.candidate && !on));
      setVis(m, visible);
      if (on) {
        pts.push(LL(it.lat, it.lng));
        if (pts.length === 1) selKindRef.current = it.kind; // 记录被选类型，用于决定缩放级别
      }
    });
    // 航线层：点选模式下选中航线全亮、其他变淡；机场标记全部显示、选中航线的跳动
    if (itemMode) {
      rl.airports.forEach((a) => {
        const show = [...a.roles.keys()].some((k) => activeSet!.has(k));
        a.marker.setIcon(iconFor("airport", show));
        setVis(a.marker, true);
        if (show) pts.push(a.latlng);
      });
      rl.lines.forEach((line, key) => {
        line.setStyle({ opacity: activeSet!.has(key) ? 0.9 : 0.2 });
      });
    } else {
      rl.airports.forEach((a) => {
        a.marker.setIcon(iconFor("airport", false));
        setVis(a.marker, true);
      });
      rl.lines.forEach((line) => line.setStyle({ opacity: 0.9 }));
    }
    if (itemMode) {
      if (!pts.length) {
        refreshLabelVisibility();
        return; // 选中的 key 对不上任何点时不动地图，避免乱飞
      }
      // 2026-10-04 用户最终要求：点卡的效果 = 像人手拖地图一样平滑挪到那家，
      // 不要闪、不要从高空缩放、不要 flyTo。
      // 行为：平滑 panTo 到那家（起点=当前位置，连贯）；zoom 用 setZoom 平滑到 14，
      // 不用 setView 的动画（长距离会触发先拉远再推进且实测会卡在高空不动）。
      // 2026-10-04 修：pan 和 zoom 串行（pan 完再 zoom），避免重叠动画打架导致飞错地方（如 Raffles 飞到柔佛）。
      if (!selectZoom) {
        // 直接按 activeItemKeys 查坐标，不依赖 pts 数组（pts 可能因时序为空）
        const keys = activeSig!.split("|");
        for (const k of keys) {
          const it = itemByKeyRef.current.get(k);
          if (it && typeof it.lat === "number" && typeof it.lng === "number") {
            const target = LL(it.lat, it.lng);
            const needZoom = map.getZoom() !== 14;
            // 先平滑挪过去
            map.panTo(target, { animate: true, duration: 1.0 });
            if (needZoom) {
              // pan 结束后（moveend）再平滑缩放到 14，串行不打架
              const onMoveEnd = () => {
                map.off("moveend", onMoveEnd);
                // 确认还在目标附近（用户没手动挪走）才 zoom
                if (map.getCenter().distanceTo(target) < 500) {
                  map.setZoom(14, { animate: true });
                }
              };
              map.on("moveend", onMoveEnd);
              // 兜底：2 秒后还没 moveend 也 zoom（防止事件丢）
              setTimeout(() => {
                map.off("moveend", onMoveEnd);
                if (map.getCenter().distanceTo(target) < 5000 && map.getZoom() !== 14) {
                  map.setZoom(14, { animate: true });
                }
              }, 2000);
            }
            break; // 只处理第一个选中的
          }
        }
        refreshLabelVisibility();
        refreshCandidateVisibility();
        return;
      }
      // 2026-10-04 用户：点选平移+缩放到位，用 setView 直接过渡，不要 flyTo 的先拉远再推进效果
      if (pts.length === 1) {
        const kind = selKindRef.current;
        const target = kind === "hotel" || kind === "restaurant" ? 16 : kind === "attraction" ? 15 : 14;
        const z = Math.max(map.getZoom(), target);
        map.setView(pts[0], z, { animate: true, duration: 0.8 });
      } else map.flyToBounds(L.latLngBounds(pts).pad(0.3), { duration: 0.8 });
      refreshLabelVisibility();
      refreshCandidateVisibility();
      return;
    }
    if (!activeCity) {
      refreshLabelVisibility();
      return; // 未点选且无城市：全部显示，不飞
    }
    // 2026-10-04 修：未点选单项时不飞——markers effect 已用 fitBounds+minZoom 14 定位好，
    // 此处再 flyTo 会覆盖掉（之前飞机场 zoom 11 是旧逻辑，已废弃）。
    refreshLabelVisibility();
  }, [activeCity, activeSig, itemMode, items, flightRoutes, activeDayRoute, mapReady, selectZoom]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const i of items) c[i.kind] = (c[i.kind] || 0) + 1;
    c.candidate = items.filter((i) => i.candidate).length;
    return c;
  }, [items]);
  // 标题副文案：点选模式下 📍 显示被选中的卡片名（activeLabel）；
  // 2026-10-04 修：点选时也不许把" N 个点"藏起来——用户会以为地图空了。计数一直显示。
  const dayScope = activeDayRoute != null;
  const titleSub = dayScope
    ? `${activeDayRoute!.stops.length}个站点`
    : `${items.length}个点${counts.candidate ? `（含${counts.candidate}个灰标候选）` : ""}${flightRoutes.length ? ` · ${flightRoutes.length}条航线` : ""}${counts.airport ? ` · ✈️${counts.airport}` : ""}`;

  // 标题栏"名称"开关（2026-10-04 用户：景点名称默认不显示，加开关控制）
  const labelToggle = (
    <label
      className="ml-2 flex items-center gap-1 text-xs font-normal text-gray-500 whitespace-nowrap cursor-pointer select-none"
      title="显示/隐藏景点名称标签"
    >
      <input
        type="checkbox"
        checked={showLabels}
        onChange={(e) => setShowLabels(e.target.checked)}
        className="accent-teal-700 w-3.5 h-3.5"
      />
      名称
    </label>
  );
  const titleInner = (
    <span className="truncate">
      {title}
      {activeLabel && (
        <span className="ml-2 text-xs font-normal text-teal-700">📍 {activeLabel}</span>
      )}
      <span className="ml-2 text-xs font-normal text-gray-400">{titleSub}</span>
    </span>
  );

  // items 为空但有航线/当日路线时地图仍要渲染；三者都空才返回 null
  if (!items.length && !flightRoutes.length && !(activeDayRoute && activeDayRoute.stops.length)) return null;

  return (
    <div
      ref={wrapRef}
      className={`${disableSticky ? "relative" : "sticky"} z-[6] -mx-4 px-4 bg-[#faf8f3]/95 backdrop-blur-sm border-b border-gray-200`}
      style={disableSticky ? undefined : { top: topPx }}
    >
      <style>{`@keyframes sea-pin-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}`}</style>
      {alwaysVisible ? (
        /* 常显模式：标题行不可点，无折叠按钮 */
        <div className="w-full flex items-center justify-between py-1.5 text-sm font-bold text-gray-900">
          {titleInner}
          {labelToggle}
        </div>
      ) : (
        <div className="w-full flex items-center justify-between py-1.5">
          <button
            onClick={toggle}
            className="flex-1 min-w-0 flex items-center justify-between text-sm font-bold text-gray-900 text-left"
            aria-expanded={!collapsed}
          >
            {titleInner}
            <span className="text-teal-700 whitespace-nowrap ml-2">{collapsed ? "▾ 展开" : "▴ 收起"}</span>
          </button>
          {labelToggle}
        </div>
      )}
      {/* 地图容器 className 保持静态，全屏/折叠高矮走 style（Leaflet touch 修复口径） */}
      <div
        ref={mapEl}
        className="rounded-lg overflow-hidden border border-gray-200 mb-2"
        style={{ display: collapsed ? "none" : "block", height: 180, width: "100%", zIndex: 0 }}
      />
    </div>
  );
}

/** 安全版：带错误边界，地图崩了只显示重试条，不拖白整页 */
export function SafeStickyMapBar(props: Parameters<typeof StickyMapBar>[0]) {
  return (
    <MapErrorBoundary title={props.title || "地图"}>
      <StickyMapBar {...props} />
    </MapErrorBoundary>
  );
}
