import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LL, addAmapTiles } from "@/lib/amap";
import { airportForCity } from "@/data/airportCoords";
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

const KIND_EMOJI: Record<StickyMapKind, string> = {
  hotel: "🏨",
  restaurant: "🍽️",
  attraction: "🏛️",
  itinerary: "📍",
  airport: "✈️",
};

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
  /** 当前屏幕中央的城市（中文名）：高亮该城的点并飞过去；null 时不动作 */
  activeCity: string | null;
  /** bar 上显示的副标题，如 "D9 · 新加坡" */
  activeLabel?: string;
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

  // 地图初始化（一次，懒：首次展开后容器有真实尺寸才创建，避免 display:none 里初始化）
  useEffect(() => {
    if (!mapReady || !mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, { zoomControl: true, scrollWheelZoom: false });
    mapRef.current = map;
    addAmapTiles(map);
    const ro = new ResizeObserver(() => map.invalidateSize());
    if (mapEl.current) ro.observe(mapEl.current);
    // zoom >= 14 显示景点名称标签
    const updateLabels = () => {
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
    map.on("zoomend", updateLabels);
    const t = setTimeout(updateLabels, 400);
    return () => {
      clearTimeout(t);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
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
      const key = `${it.kind}:${it.city}:${it.name}`;
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
    if (latlngs.length === 1) map.setView(latlngs[0], 13);
    else if (latlngs.length > 1) map.fitBounds(L.latLngBounds(latlngs).pad(0.15));
  }, [items, mapReady]);

  // 高亮 + 淡化 + 飞到 activeCity
  // 2026-10-03 晚用户：地图不要所有点都一样突出，只高亮当前浏览城市的点，其他淡化
  // 2026-10-04 凌晨用户：非当前城市的点不要显示，只突出当前滚动到的景点/酒店/餐厅
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const pts: L.LatLng[] = [];
    markersRef.current.forEach((m, key) => {
      const it = itemByKeyRef.current.get(key);
      if (!it) return;
      const inActiveCity = !!activeCity && it.city === activeCity;
      const on = inActiveCity && it.kind !== "airport";
      m.setIcon(iconFor(it.kind, on));
      // 非当前城市的点直接隐藏（用户要求：只显示当前浏览的）
      const el = m.getElement();
      if (el) {
        el.style.transition = "opacity .3s";
        el.style.opacity = activeCity ? (inActiveCity ? "1" : "0") : "1";
        el.style.pointerEvents = activeCity && !inActiveCity ? "none" : "auto";
      }
      if (on) pts.push(LL(it.lat, it.lng));
    });
    if (!activeCity) return;
    if (pts.length === 1) map.flyTo(pts[0], Math.max(map.getZoom(), 12), { duration: 0.8 });
    else if (pts.length > 1) map.flyToBounds(L.latLngBounds(pts).pad(0.3), { duration: 0.8 });
    else {
      const ap = airportForCity(activeCity);
      if (ap) map.flyTo(LL(ap.lat, ap.lng), 11, { duration: 0.8 });
    }
  }, [activeCity, items]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const i of items) c[i.kind] = (c[i.kind] || 0) + 1;
    return c;
  }, [items]);

  if (!items.length) return null;

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
              {items.length}个点
              {counts.airport ? ` · ✈️${counts.airport}` : ""}
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
              {items.length}个点
              {counts.airport ? ` · ✈️${counts.airport}` : ""}
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
