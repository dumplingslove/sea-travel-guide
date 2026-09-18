import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CITY_COORDS } from "@/data/cityCoords";
import {
  usePlanItinerary,
  type PlanCityStop,
} from "@/guide/plannerSchedule";

interface CityStop extends PlanCityStop {
  lat: number;
  lng: number;
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

/**
 * 地图页：城市站点来自全站共享的行程事实源（云端规划优先，静态回退）。
 * 站点变化时整个画布按 key 重建，保证地图与列表一致。
 */
export default function MapPage() {
  const plan = usePlanItinerary();
  const stops = useMemo(() => withCoords(plan.cityStops), [plan]);
  const stopsKey = stops
    .map((s) => `${s.id}:${s.days[0]}-${s.days[1]}`)
    .join("|");
  return (
    <MapCanvas
      key={stopsKey}
      stops={stops}
      source={plan.source}
      updatedByName={plan.updatedByName}
    />
  );
}

function MapCanvas({
  stops,
  source,
  updatedByName,
}: {
  stops: CityStop[];
  source: "cloud" | "static";
  updatedByName?: string;
}) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [activeId, setActiveId] = useState<string>(stops[0].id);

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, { zoomControl: true }).setView(
      [11.5, 102.5],
      5,
    );
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom",
        maxZoom: 19,
      },
    ).addTo(map);

    const latlngs = stops.map((s) => L.latLng(s.lat, s.lng));
    L.polyline(latlngs, {
      color: "#0f766e",
      weight: 3,
      opacity: 0.85,
      dashArray: "8 6",
    }).addTo(map);

    markersRef.current = stops.map((s, i) => {
      const m = L.marker([s.lat, s.lng], { icon: markerIcon(i + 1, false) });
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
      m.addTo(map);
      return m;
    });

    map.fitBounds(L.latLngBounds(latlngs).pad(0.18));
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, [stops]);

  const focusCity = (id: string) => {
    setActiveId(id);
    const idx = stops.findIndex((s) => s.id === id);
    const s = stops[idx];
    const map = mapRef.current;
    if (!map || !s) return;
    markersRef.current.forEach((m, i) =>
      m.setIcon(markerIcon(i + 1, i === idx)),
    );
    map.flyTo([s.lat, s.lng], Math.max(map.getZoom(), 7), { duration: 0.8 });
    const marker = markersRef.current[idx];
    window.setTimeout(() => marker.openPopup(), 850);
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
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div
            ref={mapEl}
            className="rounded-2xl overflow-hidden border border-teal-900/10 shadow-sm z-0"
            style={{ height: "62vh", minHeight: 380 }}
          />
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
        </div>
      </div>
    </div>
  );
}
