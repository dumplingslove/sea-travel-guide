import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CITY_COORDS } from "@/data/cityCoords";
import cities from "@/data/cities.json";

export interface TripStop {
  id: string;
  zh: string;
  en: string;
  days: [number, number] | number[];
  dates: string;
}

function markerIcon(order: number) {
  return L.divIcon({
    className: "sea-route-marker",
    html: `<span style="
      display:grid;place-items:center;width:30px;height:30px;border-radius:50%;
      background:#ffffff;color:#0f766e;
      border:3px solid #0f766e;font-weight:800;font-size:13px;
      box-shadow:0 2px 8px rgba(15,118,110,.35);
    ">${order}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
}

/**
 * 行程首页“路线总览”：与顶级地图页共用 CITY_COORDS 的实时 Leaflet 地图，
 * 取代原来内容过时的静态总览图。点标记可看天数并跳转。
 *
 * stops 可选：传入云端规划解析出的城市站点（城市顺序/天数随规划变化）；
 * 不传则回退静态 cities.json。
 */
export default function TripOverviewMap({ stops }: { stops?: TripStop[] }) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapStops: TripStop[] =
    stops && stops.length ? stops : (cities as TripStop[]);
  const stopsKey = mapStops
    .map((s) => `${s.id}:${s.days[0]}-${s.days[1]}`)
    .join("|");
  const totalDays = mapStops.length
    ? mapStops[mapStops.length - 1].days[1]
    : 20;

  useEffect(() => {
    if (!mapEl.current) return;
    const cur = mapStops;
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const map = L.map(mapEl.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    });
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom",
        maxZoom: 19,
      },
    ).addTo(map);

    const latlngs = cur.map((s) => {
      const c = CITY_COORDS[s.id];
      return L.latLng(c[0], c[1]);
    });
    L.polyline(latlngs, {
      color: "#0f766e",
      weight: 3,
      opacity: 0.85,
      dashArray: "8 6",
    }).addTo(map);

    cur.forEach((s, i) => {
      const c = CITY_COORDS[s.id];
      L.marker([c[0], c[1]], { icon: markerIcon(i + 1) })
        .bindPopup(
          `<div style="min-width:150px;font-family:inherit">
            <div style="font-weight:800;font-size:14px;color:#134e4a">${i + 1}. ${s.zh}</div>
            <div style="font-size:12px;color:#4b5563;margin:4px 0">Day ${s.days[0]}–${s.days[1]} · ${s.dates}</div>
            <a href="${base}/day/${s.days[0]}" style="color:#0f766e;font-weight:700;font-size:12px">第 ${s.days[0]} 天行程 →</a>
          </div>`,
        )
        .addTo(map);
    });

    const bounds = L.latLngBounds(latlngs).pad(0.18);
    map.fitBounds(bounds);
    // 首次加载偶发空白修复（backlog P1）：L.map 在 React commit 时创建，
    // 此时容器尺寸尚未稳定（字体/布局仍在结算），Leaflet 会记住错误的 0×N 尺寸。
    // 在 paint 完成后强制刷新尺寸并重算视野，再加一次延迟兜底。
    let raf = 0;
    const fixSize = () => {
      map.invalidateSize();
      map.fitBounds(bounds, { animate: false });
    };
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(fixSize);
    });
    const timer = window.setTimeout(fixSize, 400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopsKey]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div ref={mapEl} className="w-full z-0" style={{ height: 300 }} />
      <p className="text-xs text-gray-500 px-4 py-2 border-t border-gray-100">
        {totalDays}天路线总览 · {mapStops.map((s) => s.zh).join(" → ")} ·
        点标记查看天数
      </p>
    </div>
  );
}
