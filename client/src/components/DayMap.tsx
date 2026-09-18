import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CITY_COORDS } from "@/data/cityCoords";
import { stopCoordsForDay } from "@/data/stopCoords";

interface DayMapProps {
  dayNum: number;
  cityId: string;
  cityZh: string;
  /** 上一天的城市 id；与当天不同即为转场日，画出转场航线 */
  prevCityId: string | null;
  prevCityZh: string | null;
  /** 转场航段名称，如“普吉飞槟城”（转场日才传） */
  transferLabel?: string;
}

function dotIcon(label: string, highlight: boolean) {
  return L.divIcon({
    className: "sea-daymap-marker",
    html: `<span style="
      display:grid;place-items:center;min-width:30px;height:30px;padding:0 8px;border-radius:999px;
      background:${highlight ? "#0f766e" : "#ffffff"};
      color:${highlight ? "#ffffff" : "#0f766e"};
      border:2px solid #0f766e;font-weight:800;font-size:12px;white-space:nowrap;
      box-shadow:0 2px 8px rgba(15,118,110,.35);
    ">${label}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  });
}

/** 站点级编号标记：圆底白字序号，与当天时间线顺序对应 */
function numIcon(n: number) {
  return L.divIcon({
    className: "sea-daymap-marker",
    html: `<span style="
      display:grid;place-items:center;width:28px;height:28px;border-radius:999px;
      background:#0f766e;color:#ffffff;border:2px solid #ffffff;
      font-weight:800;font-size:13px;line-height:1;
      box-shadow:0 2px 8px rgba(15,118,110,.4);
    ">${n}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -12],
  });
}

/**
 * 行程详情页的当天小地图：与顶级地图页共用 CITY_COORDS。
 * 转场日画出上一城→本城的航线；非转场日只标当天城市。
 * 地图内容完全由当天行程数据驱动，不再依赖静态旧图。
 */
export default function DayMap({
  dayNum,
  cityId,
  cityZh,
  prevCityId,
  prevCityZh,
  transferLabel,
}: DayMapProps) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const coord = CITY_COORDS[cityId];
  const prevCoord = prevCityId ? CITY_COORDS[prevCityId] : null;
  const isTransfer = Boolean(prevCoord && prevCityId !== cityId);

  useEffect(() => {
    if (!mapEl.current || mapRef.current || !coord) return;
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

    let from: L.LatLng | null = null;
    let to: L.LatLng | null = null;
    let stopBounds: L.LatLngBounds | null = null;
    if (isTransfer && prevCoord) {
      from = L.latLng(prevCoord[0], prevCoord[1]);
      to = L.latLng(coord[0], coord[1]);
      L.polyline([from, to], {
        color: "#0f766e",
        weight: 3,
        opacity: 0.9,
        dashArray: "8 6",
      }).addTo(map);
      if (transferLabel) {
        L.tooltip({
          permanent: true,
          direction: "center",
          className: "sea-daymap-tip",
        })
          .setLatLng(L.latLng((from.lat + to.lat) / 2, (from.lng + to.lng) / 2))
          .setContent(
            `<span style="background:#0f766e;color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;white-space:nowrap">✈ ${transferLabel}</span>`,
          )
          .addTo(map);
      }
      L.marker(from, { icon: dotIcon(prevCityZh || "", false) })
        .bindPopup(
          `<b>${prevCityZh}</b><br><span style="font-size:12px;color:#6b7280">Day ${dayNum - 1} 出发</span>`,
        )
        .addTo(map);
      L.marker(to, { icon: dotIcon(`Day ${dayNum} · ${cityZh}`, true) })
        .bindPopup(
          `<b>${cityZh}</b><br><span style="font-size:12px;color:#6b7280">Day ${dayNum} 到达</span>`,
        )
        .addTo(map);
      map.fitBounds(L.latLngBounds([from, to]).pad(0.35));
    } else {
      // backlog P1 每日地图景点级：有核实坐标的日期画编号站点 + 顺序连线
      const stops = stopCoordsForDay(dayNum);
      if (stops) {
        const pts = stops.map((s) => L.latLng(s.lat, s.lng));
        stops.forEach((s, i) => {
          L.marker(pts[i], { icon: numIcon(i + 1) })
            .bindPopup(
              `<b>${i + 1} · ${s.name}</b><br><span style="font-size:12px;color:#6b7280">${s.time}${s.note ? ` · ${s.note}` : ""}</span>`,
            )
            .addTo(map);
        });
        if (pts.length > 1) {
          L.polyline(pts, {
            color: "#0f766e",
            weight: 3,
            opacity: 0.85,
          }).addTo(map);
        }
        stopBounds = L.latLngBounds(pts).pad(0.18);
        map.fitBounds(stopBounds);
      } else {
        const at = L.latLng(coord[0], coord[1]);
        to = at;
        L.marker(at, { icon: dotIcon(`Day ${dayNum} · ${cityZh}`, true) })
          .bindPopup(`<b>${cityZh}</b>`)
          .addTo(map);
        map.setView(at, 11);
      }
    }

    mapRef.current = map;
    // 首次加载偶发空白修复（backlog P1）：与总览地图同因——容器尺寸在 commit
    // 时未稳定，paint 完成后强制刷新尺寸并重算视野，再加一次延迟兜底。
    const refit = () => {
      map.invalidateSize();
      if (isTransfer && from && to) {
        map.fitBounds(L.latLngBounds([from, to]).pad(0.35), {
          animate: false,
        });
      } else if (stopBounds) {
        map.fitBounds(stopBounds, { animate: false });
      } else if (to) {
        map.setView(to, 11, { animate: false });
      }
    };
    let raf = 0;
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(refit);
    });
    const timer = window.setTimeout(refit, 400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
    // 地图实例按“天”重建：路由切换 dayNum 时组件 key 变化，这里只初始化一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!coord) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
      <div ref={mapEl} className="w-full z-0" style={{ height: 280 }} />
      <p className="text-xs text-gray-500 px-4 py-2 border-t border-gray-100">
        {isTransfer
          ? `Day ${dayNum} 转场：${prevCityZh} → ${cityZh}${transferLabel ? `（${transferLabel}）` : ""}`
          : stopCoordsForDay(dayNum)
            ? `Day ${dayNum} · 站点顺序动线（编号对应当天时间线）`
            : `Day ${dayNum} · ${cityZh}市内游`}
      </p>
    </div>
  );
}
