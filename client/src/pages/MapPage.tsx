import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CITY_COORDS } from "@/data/cityCoords";
import { airportForCity } from "@/data/airportCoords";
import { placesForCity } from "@/data/placeCoords";
import { mallAnchorId } from "@/guide/data";
import { LL, addAmapTiles, wgs84ToGcj02 } from "@/lib/amap";
import citiesJson from "@/data/cities.json";
import {
  usePlanItinerary,
  type PlanCityStop,
} from "@/guide/plannerSchedule";

interface CityStop extends PlanCityStop {
  lat: number;
  lng: number;
}

/** 行程之外的研究城市：只有坐标与酒店/餐厅数据，无天数、无路线 */
interface ExtraCity {
  id: string;
  zh: string;
  en: string;
  lat: number;
  lng: number;
  hotelCount: number;
  restCount: number;
  mallCount: number;
}

/** 8 城坐标（WGS84），与 cities.json 的顺序一致即行程顺序；数据见 @/data/cityCoords */
const COORDS: Record<string, [number, number]> = CITY_COORDS;

function withCoords(stops: PlanCityStop[]): CityStop[] {
  return stops.map((c) => {
    const coord = COORDS[c.id];
    if (!coord) throw new Error(`missing coords for city ${c.id}`);
    return { ...c, lat: coord[0], lng: coord[1] };
  });
}

function markerIcon(order: number, active: boolean) {
  return L.divIcon({
    className: "sea-route-marker",
    html: `<span style="
      display:grid;place-items:center;width:34px;height:34px;border-radius:50%;
      background:${active ? "#0f766e" : "#ffffff"};
      color:${active ? "#ffffff" : "#0f766e"};
      border:3px solid #0f766e;font-weight:800;font-size:14px;
      box-shadow:0 2px 8px rgba(15,118,110,.35);
    ">${order}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

function hotelIcon() {
  return L.divIcon({
    className: "sea-route-marker",
    html: `<span style="
      display:grid;place-items:center;width:30px;height:30px;border-radius:999px;
      background:#ffffff;color:#1d4ed8;border:2px solid #1d4ed8;font-size:15px;line-height:1;
      box-shadow:0 2px 8px rgba(29,78,216,.35);
    ">🏨</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  });
}

function restaurantIcon() {
  return L.divIcon({
    className: "sea-route-marker",
    html: `<span style="
      display:grid;place-items:center;width:30px;height:30px;border-radius:999px;
      background:#ffffff;color:#c2410c;border:2px solid #ea580c;font-size:15px;line-height:1;
      box-shadow:0 2px 8px rgba(234,88,12,.35);
    ">🍽️</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  });
}

function shoppingIcon() {
  return L.divIcon({
    className: "sea-route-marker",
    html: `<span style="
      display:grid;place-items:center;width:30px;height:30px;border-radius:999px;
      background:#ffffff;color:#7c3aed;border:2px solid #7c3aed;font-size:15px;line-height:1;
      box-shadow:0 2px 8px rgba(124,58,237,.35);
    ">🛍️</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  });
}

/** 机场标记：✈️ 紫色徽章（2026-10-03 用户：所有地图都标机场，用不同图标区分） */
function airportIcon() {
  return L.divIcon({
    className: "sea-airport-marker",
    html: `<span style="
      display:grid;place-items:center;width:32px;height:32px;border-radius:999px;
      background:#7c3aed;color:#ffffff;border:2px solid #ffffff;
      font-size:16px;line-height:1;
      box-shadow:0 2px 8px rgba(124,58,237,.45);
    ">✈️</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

/**
 * 缩放显示名称标签的 CSS（2026-10-03 用户：zoom in 后直接显示名称，不用点）。
 * zoom >= 14 时地图容器加 .show-labels，CSS 才显示标签；低缩放级别隐藏避免重叠。
 * 注意：用 DOM classList 切换，不走 React className（Leaflet touch 修复口径：容器 className 必须静态）。
 */
const ZOOM_LABEL_CSS = `
.leaflet-tooltip.sea-zoom-label{display:none;background:rgba(255,255,255,.95);border:1px solid #d1d5db;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:600;color:#1f2937;box-shadow:0 1px 4px rgba(0,0,0,.15)}
.leaflet-tooltip.sea-zoom-label::before{display:none}
.show-labels .leaflet-tooltip.sea-zoom-label{display:block}
`;
function ensureZoomLabelCss() {
  if (document.querySelector("style[data-sea-zoom-labels]")) return;
  const el = document.createElement("style");
  el.setAttribute("data-sea-zoom-labels", "");
  el.textContent = ZOOM_LABEL_CSS;
  document.head.appendChild(el);
}

/**
 * 地图页：城市站点来自全站共享的行程事实源（云端规划优先，静态回退）。
 * 站点变化时整个画布按 key 重建，保证地图与列表一致。
 * 点选城市时叠加该城候选酒店（🏨）与推荐餐厅（🍽️），只标位置不连线。
 */
export default function MapPage() {
  const plan = usePlanItinerary();
  const stops = useMemo(() => withCoords(plan.cityStops), [plan]);
  const stopsKey = stops
    .map((s) => `${s.id}:${s.days[0]}-${s.days[1]}`)
    .join("|");
  /** 行程之外的研究城市：8 城全量可切，补足酒店/餐厅位置查看 */
  const extraCities: ExtraCity[] = useMemo(() => {
    const stopIds = new Set(plan.cityStops.map((s) => s.id));
    return (citiesJson as { id: string; zh: string; en: string }[])
      .filter((c) => !stopIds.has(c.id))
      .map((c) => {
        const coord = COORDS[c.id];
        const { hotels, restaurants, malls } = placesForCity(c.id);
        return {
          id: c.id,
          zh: c.zh,
          en: c.en,
          lat: coord[0],
          lng: coord[1],
          hotelCount: hotels.length,
          restCount: restaurants.length,
          mallCount: malls.length,
        };
      });
  }, [plan]);
  return (
    <MapCanvas
      key={stopsKey}
      stops={stops}
      extraCities={extraCities}
      source={plan.source}
      updatedByName={plan.updatedByName}
    />
  );
}

function MapCanvas({
  stops,
  extraCities,
  source,
  updatedByName,
}: {
  stops: CityStop[];
  extraCities: ExtraCity[];
  source: "cloud" | "static";
  updatedByName?: string;
}) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const placesLayerRef = useRef<L.LayerGroup | null>(null);
  const [activeId, setActiveId] = useState<string>(stops[0].id);

  /** 在地图上叠加某城市的酒店/餐厅（只标位置，不连线） */
  const showCityPlaces = (cityId: string) => {
    const map = mapRef.current;
    if (!map) return;
    if (placesLayerRef.current) {
      placesLayerRef.current.remove();
      placesLayerRef.current = null;
    }
    const { hotels, restaurants, malls } = placesForCity(cityId);
    if (hotels.length === 0 && restaurants.length === 0 && malls.length === 0) return;
    const layer = L.layerGroup();
    const cityZh =
      stops.find((s) => s.id === cityId)?.zh ??
      extraCities.find((e) => e.id === cityId)?.zh ??
      "";
    for (const h of hotels) {
      L.marker(LL(h.lat, h.lng), { icon: hotelIcon() })
        .bindPopup(
          `<b>🏨 ${h.name}</b><br><span style="font-size:12px;color:#6b7280">候选酒店（未预订，仅标位置）${h.note ? ` · ${h.note}` : ""}</span>`,
        )
        .addTo(layer);
    }
    for (const r of restaurants) {
      L.marker(LL(r.lat, r.lng), { icon: restaurantIcon() })
        .bindPopup(
          `<b>🍽️ ${r.name}</b><br><span style="font-size:12px;color:#6b7280">推荐餐厅${r.note ? ` · ${r.note}` : ""}</span>`,
        )
        .addTo(layer);
    }
    for (const m of malls) {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const mLink = cityZh
        ? `<br><a href="${base}/practical?shop=${encodeURIComponent(cityZh)}#${mallAnchorId(m.name)}" style="color:#7c3aed;font-weight:700;font-size:12px">查看商场详情 →</a>`
        : "";
      L.marker(LL(m.lat, m.lng), { icon: shoppingIcon() })
        .bindPopup(
          `<b>🛍️ ${m.name}</b><br><span style="font-size:12px;color:#6b7280">值得逛商场/市场</span>${mLink}`,
        )
        .addTo(layer);
    }
    // 机场标注（2026-10-03 用户）：点选城市（含行程外研究城市）时一并标机场
    const ap = airportForCity(cityZh);
    if (ap) {
      L.marker(LL(ap.lat, ap.lng), { icon: airportIcon() })
        .bindPopup(
          `<b>✈️ ${ap.name}</b><br><span style="font-size:12px;color:#6b7280">${ap.code} · ${cityZh}机场</span>`,
        )
        .addTo(layer);
    }
    layer.addTo(map);
    placesLayerRef.current = layer;
  };

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, { zoomControl: true }).setView(
      LL(11.5, 102.5),
      5,
    );
    // 高德中文底图（2026-09-27 用户要求）；坐标统一走 LL() 做 GCJ-02 校正
    addAmapTiles(map);

    // 缩放显示名称：zoom >= 14 时容器加 .show-labels，CSS 控制城市名称标签显隐
    // （2026-10-03 用户；classList 直操作 DOM，不走 React className，遵守容器 className 静态口径）
    ensureZoomLabelCss();
    const syncLabels = () => {
      mapEl.current?.classList.toggle("show-labels", map.getZoom() >= 14);
    };
    map.on("zoomend", syncLabels);
    syncLabels();

    const latlngs = stops.map((s) => LL(s.lat, s.lng));
    L.polyline(latlngs, {
      color: "#0f766e",
      weight: 3,
      opacity: 0.85,
      dashArray: "8 6",
    }).addTo(map);

    markersRef.current = stops.map((s, i) => {
      const m = L.marker(LL(s.lat, s.lng), { icon: markerIcon(i + 1, false) });
      m.bindPopup(
        `<div style="min-width:180px;font-family:inherit">
          <div style="font-weight:800;font-size:15px;color:#134e4a">${i + 1}. ${s.zh} <span style="font-weight:400;color:#6b7280;font-size:12px">${s.en}</span></div>
          <div style="font-size:12px;color:#4b5563;margin:6px 0">Day ${s.days[0]}–${s.days[1]} · ${s.dates}</div>
          <div style="display:flex;gap:10px;font-size:12px">
            <a href="${import.meta.env.BASE_URL.replace(/\/$/, "")}/day/${s.days[0]}" style="color:#0f766e;font-weight:700">第 ${s.days[0]} 天行程</a>
            <a href="${import.meta.env.BASE_URL.replace(/\/$/, "")}/practical" style="color:#0f766e;font-weight:700">看攻略</a>
          </div>
        </div>`,
      );
      // 2026-10-03 用户：zoom >= 14 直接显示城市名称，不用点
      m.bindTooltip(s.zh, {
        permanent: true,
        direction: "top",
        offset: [0, -20],
        className: "sea-zoom-label",
      });
      m.addTo(map);
      return m;
    });

    // 机场标注（2026-10-03 用户）：行程各城市的机场，紫色 ✈️ 标记；不并入视野计算
    for (const s of stops) {
      const ap = airportForCity(s.zh);
      if (!ap) continue;
      L.marker(LL(ap.lat, ap.lng), { icon: airportIcon() })
        .bindPopup(
          `<b>✈️ ${ap.name}</b><br><span style="font-size:12px;color:#6b7280">${ap.code} · ${s.zh}机场</span>`,
        )
        .addTo(map);
    }

    map.fitBounds(L.latLngBounds(latlngs).pad(0.18));
    mapRef.current = map;
    return () => {
      map.off("zoomend", syncLabels);
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
      placesLayerRef.current = null;
    };
  }, [stops]);

  const focusCity = (id: string) => {
    setActiveId(id);
    const idx = stops.findIndex((s) => s.id === id);
    const map = mapRef.current;
    if (!map) return;
    if (idx >= 0) {
      // 行程内城市：高亮编号 marker，飞过去
      const s = stops[idx];
      markersRef.current.forEach((m, i) =>
        m.setIcon(markerIcon(i + 1, i === idx)),
      );
      map.flyTo(LL(s.lat, s.lng), Math.max(map.getZoom(), 7), { duration: 0.8 });
      const marker = markersRef.current[idx];
      window.setTimeout(() => marker.openPopup(), 850);
    } else {
      // 行程外研究城市：无编号 marker，直接飞到城市坐标
      const c = extraCities.find((e) => e.id === id);
      if (!c) return;
      markersRef.current.forEach((m, i) => m.setIcon(markerIcon(i + 1, false)));
      map.flyTo(LL(c.lat, c.lng), Math.max(map.getZoom(), 8), { duration: 0.8 });
    }
    // 点选城市后叠加该城酒店/餐厅
    window.setTimeout(() => showCityPlaces(id), 850);
  };

  const firstDate = stops[0]?.dates.split(" ~ ")[0] ?? "";
  const lastDate = stops[stops.length - 1]?.dates.split(" ~ ")[1] ?? "";
  const totalDays = stops[stops.length - 1]?.days[1] ?? 0;

  return (
    <div className="bg-[#f7f4ee] min-h-[calc(100vh-64px)]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-teal-900">
          {totalDays} 天行程地图
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {firstDate} ~ {lastDate} · {stops.length} 城 · 按数字顺序走完全程，点击城市可定位
          {source === "cloud" && updatedByName && (
            <span className="text-teal-700">
              {" "}
              · 云端规划（{updatedByName}）
            </span>
          )}
          <span className="ml-2 text-gray-400">
            · 点选城市后显示 🏨 候选酒店 / 🍽️ 推荐餐厅 / 🛍️ 值得逛商场 / ✈️ 机场（仅位置）
          </span>
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div
            ref={mapEl}
            className="rounded-2xl overflow-hidden border border-teal-900/10 shadow-sm z-0"
            style={{ height: "62vh", minHeight: 380 }}
          />
          <div>
            <ol className="bg-white rounded-2xl border border-teal-900/10 shadow-sm divide-y divide-gray-100 overflow-hidden">
              {stops.map((s, i) => (
              <li key={s.id}>
                <button
                  onClick={() => focusCity(s.id)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                    activeId === s.id ? "bg-teal-50" : "hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`grid place-items-center w-8 h-8 rounded-full border-2 border-teal-700 font-extrabold text-sm shrink-0 ${
                      activeId === s.id
                        ? "bg-teal-700 text-white"
                        : "bg-white text-teal-700"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-teal-900">
                      {s.zh}
                      <span className="ml-1.5 font-normal text-xs text-gray-400">
                        {s.en}
                      </span>
                    </span>
                    <span className="block text-xs text-gray-500 mt-0.5">
                      Day {s.days[0]}–{s.days[1]} · {s.dates}
                    </span>
                  </span>
                  <Link
                    to={`/day/${s.days[0]}`}
                    onClick={(e) => e.stopPropagation()}
                    className="ml-auto text-xs font-bold text-teal-700 hover:underline shrink-0"
                  >
                    行程 →
                  </Link>
                </button>
              </li>
            ))}
            </ol>
            {extraCities.length > 0 && (
              <div className="mt-4 bg-white rounded-2xl border border-teal-900/10 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <span className="font-bold text-teal-900 text-sm">
                    更多研究城市
                  </span>
                  <span className="block text-xs text-gray-400 mt-0.5">
                    不在当前行程内，点选查看 🏨 候选酒店 / 🍽️ 推荐餐厅 / 🛍️ 值得逛商场位置
                  </span>
                </div>
                <ul className="divide-y divide-gray-100">
                  {extraCities.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => focusCity(c.id)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                          activeId === c.id ? "bg-teal-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block font-bold text-teal-900 text-sm">
                            {c.zh}
                            <span className="ml-1.5 font-normal text-xs text-gray-400">
                              {c.en}
                            </span>
                          </span>
                          <span className="block text-xs text-gray-500 mt-0.5">
                            🏨 {c.hotelCount} 家候选 · 🍽️ {c.restCount} 家推荐 · 🛍️ {c.mallCount} 家值得逛
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
