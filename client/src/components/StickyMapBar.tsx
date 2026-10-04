import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LL, addAmapTiles } from "@/lib/amap";
import { airportForCity, type AirportInfo } from "@/data/airportCoords";
import { CITY_COORDS } from "@/data/cityCoords";
import { placesForCity } from "@/data/placeCoords";
import { findStopCoord } from "@/data/stopCoords";
import { days } from "@/guide/data";

/**
 * 吸顶地图条（2026-10-03 用户需求；2026-10-03 晚用户改口：行程页要常显地图）：
 * - sticky 在屏幕最上方（header 之下）；alwaysVisible 时常显地图、无需点展开，
 *   否则点 ▾/▴ 展开折叠，折叠时只占一条细 bar
 * - activeCity 变化时：该城市的点高亮（放大+红圈脉冲），其他城市点淡化；
 *   地图平滑飞到该城市
 * - zoom >= 14 时直接显示景点名称标签（与 ActionMapView 同口径）
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

const KIND_EMOJI: Record<StickyMapKind, string> = {
  hotel: "🏨",
  restaurant: "🍽️",
  attraction: "🏛️",
  itinerary: "📍",
  airport: "✈️",
};

/**
 * 航线短路径经度（2026-10-04 Bug 5：跨太平洋航线连线绕地球一圈）。
 * 若两点经度差 >180°，把终点经度 ±360°，让 Polyline 走最短的那一边（如西雅图→北京走太平洋而不是大西洋）。
 */
function shortPathLng(fromLng: number, toLng: number): number {
  let lng = toLng;
  const diff = lng - fromLng;
  if (diff > 180) lng -= 360;
  else if (diff < -180) lng += 360;
  return lng;
}

function iconFor(kind: StickyMapKind, active = false) {
  const size = active ? 46 : 32;
  const conf: Record<StickyMapKind, [string, string, string]> = {
    hotel: ["#1d4ed8", "#ffffff", "#1d4ed8"],
    restaurant: ["#ffffff", "#c2410c", "#ea580c"],
    attraction: ["#0f766e", "#ffffff", "#0f766e"],
    itinerary: ["#ffffff", "#4b5563", "#9ca3af"],
    airport: ["#7c3aed", "#ffffff", "#7c3aed"],
  };
  const [bg, fg, border] = conf[kind];
  return L.divIcon({
    className: "sea-stickymap-marker",
    html: `<span style="
      display:grid;place-items:center;width:${size}px;height:${size}px;border-radius:999px;
      background:${bg};color:${fg};border:${active ? 4 : 2}px solid ${active ? "#dc2626" : border};
      font-size:${active ? 20 : 15}px;line-height:1;
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

interface StickyMapBarProps {
  items: StickyMapItem[];
  /** 当前屏幕中央的城市（中文名）：高亮该城的点并飞过去；null 时不动作。
      activeItemKeys 非 null 时项目级高亮优先，此字段仅用于标题副文案 */
  activeCity: string | null;
  /** bar 上显示的副标题，如 "D9 · 新加坡" */
  activeLabel?: string;
  /**
   * 项目级高亮（2026-10-04 用户：行动安排地图只显示当前屏幕里的具体项目）：
   * 当前可见卡片对应的地图 item key 集合（stickyItemKey 生成）。
   * 传入非 null 数组时按 item 级显示/隐藏（城市级逻辑停用）；
   * 不传（undefined）时保持旧的城市级行为（行程页用）。
   */
  activeItemKeys?: string[] | null;
  /** 航班航线（出发/到达机场标记 + 紫色连线），key 与卡片关联 */
  flightRoutes?: FlightRoute[];
  title?: string;
  defaultCollapsed?: boolean;
  /** localStorage key：记住折叠状态（alwaysVisible 时忽略） */
  storageKey?: string;
  /** 高度变化回调（父组件用它叠放其他 sticky 条） */
  onHeightChange?: (h: number) => void;
  /** 常显模式：地图一直显示，不提供折叠按钮（2026-10-03 晚用户：行程页地图常显） */
  alwaysVisible?: boolean;
}

export default function StickyMapBar({
  items,
  activeCity,
  activeLabel,
  activeItemKeys = null,
  flightRoutes = [],
  title = "🗺️ 地图",
  defaultCollapsed = true,
  storageKey,
  onHeightChange,
  alwaysVisible = false,
}: StickyMapBarProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef(new Map<string, L.Marker>());
  const itemByKeyRef = useRef(new Map<string, StickyMapItem>());
  // 航线层：连线按航线 key 存；机场标记按"IATA+世界副本"去重后共享（多条航线经停同一机场时只建一个 marker）
  // 2026-10-04 真站：HU496（西雅图→北京）与 AS120（首尔→西雅图）共用 SEA，DOM 里出现 dup=1/2、2/2
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
  // activeItemKeys 每次 render 都是新数组引用，用排序签名去重，避免滚动时无意义重飞
  const activeSig = activeItemKeys ? [...activeItemKeys].sort().join("|") : null;

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
  const [topPx, setTopPx] = useState(0);

  // sticky top：紧贴 header 底部（动态测量，避免硬编码）
  useEffect(() => {
    const sync = () => {
      const header = document.querySelector("header.sticky");
      setTopPx(header ? Math.round(header.getBoundingClientRect().height) : 0);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

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
    if (!nv) setMapReady(true); // 首次展开：放行地图初始化
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, nv ? "1" : "0");
      } catch {
        /* 忽略 */
      }
    }
  };

  // zoom >= 14 显示名称标签（与 ActionMapView 同口径）。
  // 2026-10-04 真站：航线标记是 flightRoutes 异步到达后（重）建的，updateLabels 只在 zoomend/400ms 跑一次，
  // 重建后 tooltip 永远停在 opacity 0。改为组件级函数，markers/航线层每次（重）建后都调一次。
  const refreshLabelVisibility = () => {
    const map = mapRef.current;
    if (!map) return;
    const show = map.getZoom() >= 14;
    map.eachLayer((layer: unknown) => {
      const m = layer as L.Marker;
      if (m.getTooltip) {
        const tip = m.getTooltip();
        const el = tip && tip.getElement();
        if (el) (el as HTMLElement).style.opacity = show ? "1" : "0";
      }
    });
  };

  // 地图初始化（一次，懒：首次展开后容器有真实尺寸才创建，避免 display:none 里初始化）
  useEffect(() => {
    if (!mapReady || !mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, { zoomControl: true, scrollWheelZoom: false });
    mapRef.current = map;
    addAmapTiles(map);
    // 初始视图（2026-10-04 Bug 3：行动安排页 items 可能为空，不能依赖 markers effect 设视图，
    // 否则地图空白）：优先按全部航线范围，否则给一个东亚概览
    const routePts: L.LatLng[] = [];
    for (const r of flightRoutes) {
      const from = airportForCity(r.fromCity);
      const to = airportForCity(r.toCity);
      if (!from || !to) continue;
      routePts.push(LL(from.lat, from.lng), LL(to.lat, shortPathLng(from.lng, to.lng)));
    }
    if (routePts.length > 1) map.fitBounds(L.latLngBounds(routePts).pad(0.25));
    else if (routePts.length === 1) map.setView(routePts[0], 5);
    else map.setView([35, 112], 3);
    const ro = new ResizeObserver(() => map.invalidateSize());
    if (mapEl.current) ro.observe(mapEl.current);
    map.on("zoomend", refreshLabelVisibility);
    const t = setTimeout(refreshLabelVisibility, 400);
    return () => {
      clearTimeout(t);
      map.off("zoomend", refreshLabelVisibility);
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
      const marker = L.marker(ll, { icon: iconFor(it.kind) })
        .bindPopup(
          `<b>${it.name}</b><br/>${KIND_EMOJI[it.kind]} ${it.city}${it.note ? `<br/><span style="color:#6b7280;font-size:12px">${it.note}</span>` : ""}`,
        )
        .addTo(map);
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
    // 所涉城市的机场（✈️ 紫色）
    // 2026-10-04 Bug 3：项目级模式（行动安排页）下自动加的机场标记永远不可见（高亮逻辑只认卡片 key），
    // 别留死标记；航班走航线层。城市级模式（行程页）保持原行为。
    const itemModeInit = activeItemKeys !== null;
    if (!itemModeInit) {
      const cities = new Set(items.map((i) => i.city));
      for (const c of cities) {
        const ap = airportForCity(c);
        if (ap)
          addMarker({
            name: `${ap.name}（${ap.code}）`,
            city: c,
            lat: ap.lat,
            lng: ap.lng,
            kind: "airport",
          });
      }
    }
    if (latlngs.length === 1) map.setView(latlngs[0], 13);
    else if (latlngs.length > 1) map.fitBounds(L.latLngBounds(latlngs).pad(0.15));
    refreshLabelVisibility(); // 2026-10-04 真站：markers 重建后 tooltip 重置为 opacity 0，立即按当前 zoom 恢复
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, mapReady, activeItemKeys]);

  // 航班航线层：每条航线 = 紫色虚线连线；机场标记按 IATA+世界副本去重共享
  // （2026-10-04 用户：行动安排里航班卡片在地图上显示两个机场图标以及连线）
  // （2026-10-04 真站：HU496 与 AS120 共用 SEA，旧代码每条航线各建一对标记，DOM 里 dup=1/2、2/2）
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
    /** 取或建共享机场标记；同一机场被多条航线使用时 popup 合并显示各航线角色 */
    const ensureAirport = (ap: AirportInfo, lat: number, lng: number, role: "dep" | "arr", routeKey: string) => {
      const ak = `${ap.code}@${Math.round(lng)}`;
      let entry = layers.airports.get(ak);
      if (!entry) {
        const marker = L.marker(LL(lat, lng), { icon: iconFor("airport") })
          // 2026-10-04 Bug 4：航线标记之前没有 tooltip，补上（zoom>=14 由 refreshLabelVisibility 控制显隐）
          .bindTooltip(`${ap.name}（${ap.code}）`, {
            permanent: true,
            direction: "top",
            offset: [0, -20],
            className: "sea-stickymap-label",
            opacity: 0,
          })
          .addTo(map);
        entry = { marker, ap, latlng: LL(lat, lng), roles: new Map() };
        layers.airports.set(ak, entry);
        // 初始隐藏，等下方高亮 effect 按 activeItemKeys 决定显隐，避免首屏闪现全部航线
        const el = marker.getElement();
        if (el) el.style.opacity = "0";
      }
      entry.roles.set(routeKey, role);
      const roleLines = [...entry.roles.entries()]
        .map(([rk, rl]) => `${rl === "dep" ? "🛫 出发" : "🛬 到达"} · ${routeNameOf(rk)}`)
        .join("<br/>");
      entry.marker.bindPopup(`<b>${ap.name}（${ap.code}）</b><br/>${roleLines}`);
    };
    for (const r of flightRoutes) {
      const from = airportForCity(r.fromCity);
      const to = airportForCity(r.toCity);
      if (!from || !to) continue; // 任一机场查不到坐标就不画这条线
      // 2026-10-04 Bug 5：终点经度走短路径（如西雅图→北京走太平洋），到达标记也用调整后的经度，与连线对齐
      const toLng = shortPathLng(from.lng, to.lng);
      const line = L.polyline([LL(from.lat, from.lng), LL(to.lat, toLng)], {
        color: "#7c3aed",
        weight: 3,
        opacity: 0,
        dashArray: "8 6",
      }).addTo(map);
      layers.lines.set(r.key, line);
      ensureAirport(from, from.lat, from.lng, "dep", r.key);
      ensureAirport(to, to.lat, toLng, "arr", r.key);
    }
    refreshLabelVisibility(); // 2026-10-04 真站：航线层（重）建后 tooltip 重置为 opacity 0，立即按当前 zoom 恢复
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightRoutes, mapReady]);

  // 高亮
  // - 项目级（activeItemKeys 非 null，行动安排页）：只显示当前屏幕里卡片对应的点，
  //   其他全部隐藏；航班卡片显示两机场 + 连线；地图飞到可见点范围
  // - 城市级（activeCity，行程页旧行为）：高亮该城市的点，其他城市隐藏并飞过去
  // 2026-10-03 晚用户：地图不要所有点都一样突出，只高亮当前浏览城市的点
  // 2026-10-04 凌晨用户：非当前城市的点不要显示，只突出当前滚动到的景点/酒店/餐厅
  // 2026-10-04 用户：行动安排地图只高亮当前屏幕里的具体项目；航班显示两机场+连线
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const pts: L.LatLng[] = [];
    const itemMode = activeSig !== null;
    const activeSet = itemMode ? new Set(activeSig.split("|").filter(Boolean)) : null;
    markersRef.current.forEach((m, key) => {
      const it = itemByKeyRef.current.get(key);
      if (!it) return;
      let visible: boolean;
      let on: boolean;
      if (itemMode) {
        // 项目级：只有"在看"的卡片对应的点才显示；自动加的机场标记一律隐藏（航班走航线层）
        visible = activeSet!.has(key) && it.kind !== "airport";
        on = visible;
      } else {
        const inActiveCity = !!activeCity && it.city === activeCity;
        on = inActiveCity && it.kind !== "airport";
        visible = !activeCity || inActiveCity;
      }
      m.setIcon(iconFor(it.kind, on));
      const el = m.getElement();
      if (el) {
        el.style.transition = "opacity .3s";
        el.style.opacity = visible ? "1" : "0";
        el.style.pointerEvents = visible ? "auto" : "none";
      }
      if (on) pts.push(LL(it.lat, it.lng));
    });
    // 航线层显隐（2026-10-04 真站：机场标记去重共享后，按"任一关联航线在看"决定显隐）
    const rl = routeLayersRef.current;
    if (itemMode) {
      rl.airports.forEach((a) => {
        const show = [...a.roles.keys()].some((k) => activeSet!.has(k));
        a.marker.setIcon(iconFor("airport", show));
        const el = a.marker.getElement();
        if (el) {
          el.style.transition = "opacity .3s";
          el.style.opacity = show ? "1" : "0";
          el.style.pointerEvents = show ? "auto" : "none";
        }
        if (show) pts.push(a.latlng);
      });
      rl.lines.forEach((line, key) => {
        line.setStyle({ opacity: activeSet!.has(key) ? 0.9 : 0 });
      });
    } else {
      // 非项目级（行程页旧行为）：航线全显
      rl.airports.forEach((a) => {
        a.marker.setIcon(iconFor("airport", false));
        const el = a.marker.getElement();
        if (el) {
          el.style.opacity = "1";
          el.style.pointerEvents = "auto";
        }
      });
      rl.lines.forEach((line) => line.setStyle({ opacity: 0.9 }));
    }
    if (itemMode) {
      if (!pts.length) return; // 屏幕中央暂无卡片时不动地图，避免乱飞
      if (pts.length === 1) map.flyTo(pts[0], Math.max(map.getZoom(), 12), { duration: 0.8 });
      else map.flyToBounds(L.latLngBounds(pts).pad(0.3), { duration: 0.8 });
      return;
    }
    if (!activeCity) return;
    if (pts.length === 1) map.flyTo(pts[0], Math.max(map.getZoom(), 12), { duration: 0.8 });
    else if (pts.length > 1) map.flyToBounds(L.latLngBounds(pts).pad(0.3), { duration: 0.8 });
    else {
      const ap = airportForCity(activeCity);
      if (ap) map.flyTo(LL(ap.lat, ap.lng), 11, { duration: 0.8 });
    }
    // 2026-10-04 Bug 1：mapReady 加入依赖——地图懒初始化完成后（用户展开地图时）必须重跑一次高亮，
    // 否则 activeItemKeys 早已就绪但高亮从未执行，标记全部保持隐藏
  }, [activeCity, activeSig, items, flightRoutes, mapReady]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const i of items) c[i.kind] = (c[i.kind] || 0) + 1;
    return c;
  }, [items]);
  // 项目级模式下标题显示"在看 N 项"，而不是全部点数
  const itemMode = activeSig !== null;
  const inViewCount = itemMode ? activeSig.split("|").filter(Boolean).length : 0;

  // 2026-10-04 Bug 3：items 为空但有航线时地图仍要渲染（行动安排页只有航班卡）；两者都空才返回 null
  if (!items.length && !flightRoutes.length) return null;

  return (
    <div
      ref={wrapRef}
      className="sticky z-[6] -mx-4 px-4 bg-[#faf8f3]/95 backdrop-blur-sm border-b border-gray-200"
      style={{ top: topPx }}
    >
      <style>{`@keyframes sea-pin-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}`}</style>
      {alwaysVisible ? (
        /* 常显模式：标题行不可点，无折叠按钮 */
        <div className="w-full flex items-center justify-between py-2.5 text-sm font-bold text-gray-900">
          <span className="truncate">
            {title}
            {activeLabel && (
              <span className="ml-2 text-xs font-normal text-teal-700">📍 {activeLabel}</span>
            )}
            <span className="ml-2 text-xs font-normal text-gray-400">
              {itemMode ? `在看 ${inViewCount} 项` : `${items.length}个点`}
              {!itemMode && counts.airport ? ` · ✈️${counts.airport}` : ""}
            </span>
          </span>
        </div>
      ) : (
        <button
          onClick={toggle}
          className="w-full flex items-center justify-between py-2.5 text-sm font-bold text-gray-900"
          aria-expanded={!collapsed}
        >
          <span className="truncate">
            {title}
            {activeLabel && (
              <span className="ml-2 text-xs font-normal text-teal-700">📍 {activeLabel}</span>
            )}
            <span className="ml-2 text-xs font-normal text-gray-400">
              {itemMode ? `在看 ${inViewCount} 项` : `${items.length}个点`}
              {!itemMode && counts.airport ? ` · ✈️${counts.airport}` : ""}
            </span>
          </span>
          <span className="text-teal-700 whitespace-nowrap ml-2">{collapsed ? "▾ 展开" : "▴ 收起"}</span>
        </button>
      )}
      {/* 地图容器 className 保持静态，全屏/折叠高矮走 style（Leaflet touch 修复口径） */}
      <div
        ref={mapEl}
        className="rounded-lg overflow-hidden border border-gray-200 mb-2"
        style={{ display: collapsed ? "none" : "block", height: 300, width: "100%", zIndex: 0 }}
      />
    </div>
  );
}
