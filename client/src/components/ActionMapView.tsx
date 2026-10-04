import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CITY_COORDS } from "@/data/cityCoords";
import { placesForCity } from "@/data/placeCoords";
import { findStopCoord } from "@/data/stopCoords";
import { LL, addAmapTiles } from "@/lib/amap";
import { days } from "@/guide/data";

/** 行动安排用：收藏的酒店/餐厅/景点 + 行程里全部景点，一张图看距离 */
export interface ActionMapItem {
  name: string;
  city: string;
  kind: "hotel" | "restaurant" | "attraction" | "itinerary";
  lat: number;
  lng: number;
  note?: string;
}

function iconFor(kind: ActionMapItem["kind"]) {
  const style = (bg: string, fg: string, border: string, emoji: string) =>
    L.divIcon({
      className: "sea-actionmap-marker",
      html: `<span style="
        display:grid;place-items:center;width:32px;height:32px;border-radius:999px;
        background:${bg};color:${fg};border:2px solid ${border};font-size:15px;line-height:1;
        box-shadow:0 2px 8px rgba(0,0,0,.25);
      ">${emoji}</span>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  switch (kind) {
    case "hotel": return style("#1d4ed8", "#ffffff", "#1d4ed8", "🏨");
    case "restaurant": return style("#ffffff", "#c2410c", "#ea580c", "🍽️");
    case "attraction": return style("#0f766e", "#ffffff", "#0f766e", "🏛️");
    case "itinerary": return style("#ffffff", "#4b5563", "#9ca3af", "📍");
  }
}

const KIND_LABEL: Record<ActionMapItem["kind"], string> = {
  hotel: "🏨 收藏酒店",
  restaurant: "🍽️ 收藏餐厅",
  attraction: "🏛️ 收藏景点",
  itinerary: "📍 行程景点",
};

/**
 * @param favorites 收藏项 {name, city, type: hotel|restaurant|attraction}
 * @param itineraryCities 行程实际城市列表（中文名）；提供时地图只显示这些城市的点，不相关的城市不显示（2026-10-03 用户：行动安排地图只显示大行程定下的城市）
 * 地图自动包含：收藏的酒店/餐厅/景点 + 详细行程(days)里全部景点
 */
export default function ActionMapView({
  favorites,
  itineraryCities,
}: {
  favorites: { name: string; city: string; type: string }[];
  itineraryCities?: string[];
}) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [cityFilter, setCityFilter] = useState<string>("all");

  /* 组装地图点 */
  const items = useMemo<ActionMapItem[]>(() => {
    const out: ActionMapItem[] = [];
    const seen = new Set<string>();
    /* 2026-10-03 用户：只显示行程实际城市的点 */
    const allowedCities = itineraryCities ? new Set(itineraryCities) : null;

    /* 1. 收藏的酒店/餐厅：按城市查 placeCoords */
    const byCity = new Map<string, { name: string; type: string }[]>();
    for (const f of favorites) {
      if (!["hotel", "restaurant", "attraction"].includes(f.type)) continue;
      if (allowedCities && !allowedCities.has(f.city)) continue;
      if (!byCity.has(f.city)) byCity.set(f.city, []);
      byCity.get(f.city)!.push({ name: f.name, type: f.type });
    }
    /* 城市中文名 -> cityId 映射 */
    const cityIdOf = (zh: string): string | null => {
      for (const [id, c] of Object.entries(CITY_COORDS)) {
        if ((c as unknown as { zh?: string }).zh === zh) return id;
      }
      /* 兜底：常见映射 */
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
        if (type === "hotel") coord = places.hotels.find((h) => h.name === name || h.name.includes(name) || name.includes(h.name));
        else if (type === "restaurant") coord = places.restaurants.find((r) => r.name === name || r.name.includes(name) || name.includes(r.name));
        else coord = findStopCoord(name);
        if (coord) {
          seen.add(key);
          out.push({ name, city: cityZh, kind: type as ActionMapItem["kind"], lat: coord.lat, lng: coord.lng });
        }
      }
    }

    /* 2. 详细行程里全部景点：days[].stops[] 按名查 stopCoords */
    for (const d of days) {
      if (allowedCities && !allowedCities.has(d.city)) continue;
      for (const s of d.stops) {
        const key = `itinerary:${s.name}`;
        if (seen.has(key)) continue;
        const coord = findStopCoord(s.name);
        if (coord) {
          seen.add(key);
          out.push({
            name: s.name, city: d.city, kind: "itinerary",
            lat: coord.lat, lng: coord.lng, note: `${d.date} ${d.title}`,
          });
        }
      }
    }
    return out;
  }, [favorites, itineraryCities]);

  const cities = useMemo(() => {
    const s = new Set(items.map((i) => i.city));
    return [...s].sort();
  }, [items]);

  const visible = cityFilter === "all" ? items : items.filter((i) => i.city === cityFilter);

  useEffect(() => {
    if (!mapEl.current) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    const map = L.map(mapEl.current, { zoomControl: true, scrollWheelZoom: false });
    mapRef.current = map;
    addAmapTiles(map);

    const ro = new ResizeObserver(() => map.invalidateSize());
    if (mapEl.current) ro.observe(mapEl.current);

    const latlngs: L.LatLng[] = [];
    for (const it of visible) {
      const ll = LL(it.lat, it.lng);
      latlngs.push(ll);
      const marker = L.marker(ll, { icon: iconFor(it.kind) })
        .bindPopup(
          `<b>${it.name}</b><br/>${KIND_LABEL[it.kind]} · ${it.city}${it.note ? `<br/><span style="color:#6b7280;font-size:12px">${it.note}</span>` : ""}`
        )
        .addTo(map);
      // 2026-10-03 用户：zoom in 到一定程度后直接显示名字，不用点
      marker.bindTooltip(it.name, {
        permanent: true,
        direction: "top",
        offset: [0, -18],
        className: "sea-actionmap-label",
        opacity: 0, // 默认隐藏，靠 zoom 控制
      });
    }
    // 根据 zoom 级别显示/隐藏标签：>=14 显示名字
    const updateLabels = () => {
      const z = map.getZoom();
      const show = z >= 14;
      map.eachLayer((layer: unknown) => {
        const m = layer as L.Marker;
        if (m.getTooltip) {
          const tip = m.getTooltip();
          if (tip) {
            const el = tip.getElement();
            if (el) el.style.opacity = show ? "1" : "0";
          }
        }
      });
    };
    map.on("zoomend", updateLabels);
    // 初始化时也跑一次
    setTimeout(updateLabels, 300);
    if (latlngs.length === 1) map.setView(latlngs[0], 14);
    else if (latlngs.length > 1) map.fitBounds(L.latLngBounds(latlngs).pad(0.15));
    else map.setView(LL(1.3521, 103.8198), 11);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [visible, expanded]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { hotel: 0, restaurant: 0, attraction: 0, itinerary: 0 };
    for (const i of visible) c[i.kind]++;
    return c;
  }, [visible]);

  if (!items.length) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 mb-5">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h4 className="text-sm font-bold text-gray-900">
          🗺️ 位置总览
          <span className="ml-2 text-xs font-normal text-gray-500">
            🏨{counts.hotel} 🍽️{counts.restaurant} 🏛️{counts.attraction} 📍{counts.itinerary}
          </span>
        </h4>
        <div className="flex items-center gap-2">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2 py-1"
          >
            <option value="all">全部城市</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-teal-700 border border-teal-300 rounded-lg px-2 py-1"
          >
            {expanded ? "⤢ 收起" : "⛶ 全屏"}
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-2">
        收藏的酒店/餐厅/景点 + 行程里全部景点都在图上，一眼看酒店位置合不合适、离各景点多远。图例：🏨收藏酒店 🍽️收藏餐厅 🏛️收藏景点 📍行程景点
      </p>
      {/* 地图容器 className 保持静态，全屏高矮走 style（Leaflet touch 修复口径） */}
      <div
        ref={mapEl}
        className="sea-actionmap-container rounded-lg overflow-hidden border border-gray-200"
        style={{ height: expanded ? "70vh" : 320, width: "100%", zIndex: 0 }}
      />
    </div>
  );
}
