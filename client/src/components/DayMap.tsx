import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CITY_COORDS } from "@/data/cityCoords";
import { stopCoordsForDay, type StopCoord } from "@/data/stopCoords";
import { placesForCity } from "@/data/placeCoords";

interface DayMapProps {
  dayNum: number;
  cityId: string;
  cityZh: string;
  /** 上一天的城市 id；与当天不同即为转场日，画出转场航线 */
  prevCityId: string | null;
  prevCityZh: string | null;
  /** 转场航段名称，如“普吉飞槟城”（转场日才传） */
  transferLabel?: string;
  /** 云端行程：编号与静态对不上，调用方按站点名查好坐标直接传进来 */
  isCloud?: boolean;
  cloudStops?: StopCoord[];
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

/** 候选酒店标记：🏨 蓝色徽章，只标位置、不连线（未预订） */
function hotelIcon(booked: boolean) {
  return L.divIcon({
    className: "sea-daymap-marker",
    html: `<span style="
      display:grid;place-items:center;width:30px;height:30px;border-radius:999px;
      background:${booked ? "#1d4ed8" : "#ffffff"};color:${booked ? "#ffffff" : "#1d4ed8"};
      border:2px solid #1d4ed8;font-size:15px;line-height:1;
      box-shadow:0 2px 8px rgba(29,78,216,.35);
    ">🏨</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  });
}

/** 推荐餐厅标记：🍽️ 橙色徽章，只标位置、不连线 */
function restaurantIcon() {
  return L.divIcon({
    className: "sea-daymap-marker",
    html: `<span style="
      display:grid;place-items:center;width:30px;height:30px;border-radius:999px;
      background:#ffffff;color:#c2410c;
      border:2px solid #ea580c;font-size:15px;line-height:1;
      box-shadow:0 2px 8px rgba(234,88,12,.35);
    ">🍽️</span>`,
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
  isCloud,
  cloudStops,
}: DayMapProps) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const coord = CITY_COORDS[cityId];
  const prevCoord = prevCityId ? CITY_COORDS[prevCityId] : null;
  const isTransfer = Boolean(prevCoord && prevCityId !== cityId);
  /** 云端天：编号与静态对不上，用调用方按站点名查好的坐标；静态天沿用旧逻辑 */
  const routeStops: StopCoord[] | undefined = isCloud ? cloudStops : stopCoordsForDay(dayNum);
  const hasStops = !!routeStops && routeStops.length > 0;
  /**
   * 纯转场日（当天无核实坐标站点）才画城际航线；
   * 有站点的日子（含转场日）一律画编号站点动线——转场信息进 caption，
   * 不让跨城大航线把当天实际景点的视野吞掉。
   */
  const showLeg = isTransfer && !!prevCoord && !hasStops;

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
    /** 单点位日期：fitBounds 零面积会缩到最大 zoom，改用固定缩放的 setView */
    let singleStop: L.LatLng | null = null;
    if (showLeg && prevCoord) {
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
    } else if (hasStops) {
      // 每日地图景点级：有核实坐标的日期画编号站点 + 顺序连线
      // （含转场日：当天实际景点优先，航线不再单独成图）
      const stops = routeStops!;
      {
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
        if (pts.length === 1) {
          singleStop = pts[0];
          map.setView(singleStop, 13, { animate: false });
        } else {
          stopBounds = L.latLngBounds(pts).pad(0.18);
          map.fitBounds(stopBounds);
        }
      }
    } else {
      // 无站点坐标的非纯转场日：回退到城市级标记
      {
        const at = L.latLng(coord[0], coord[1]);
        to = at;
        L.marker(at, { icon: dotIcon(`Day ${dayNum} · ${cityZh}`, true) })
          .bindPopup(`<b>${cityZh}</b>`)
          .addTo(map);
        map.setView(at, 11);
      }
    }

    // 酒店 / 餐厅标记：只标位置、不并入当天动线（用户要求：预订前只看位置、方便选酒店）。
    // 已确认预订的酒店（booked=true）才接入动线：酒店→首站、末站→酒店。
    const { hotels, restaurants } = placesForCity(cityId);
    const placeBoundsPts: L.LatLng[] = [];
    const bookedHotel = hotels.find((h) => h.booked);
    for (const h of hotels) {
      const pt = L.latLng(h.lat, h.lng);
      placeBoundsPts.push(pt);
      L.marker(pt, { icon: hotelIcon(!!h.booked) })
        .bindPopup(
          `<b>🏨 ${h.name}</b><br><span style="font-size:12px;color:#6b7280">${
            h.booked ? "已确认预订" : "候选酒店（未预订，仅标位置）"
          }${h.note ? ` · ${h.note}` : ""}</span>`,
        )
        .addTo(map);
    }
    for (const r of restaurants) {
      const pt = L.latLng(r.lat, r.lng);
      placeBoundsPts.push(pt);
      L.marker(pt, { icon: restaurantIcon() })
        .bindPopup(
          `<b>🍽️ ${r.name}</b><br><span style="font-size:12px;color:#6b7280">推荐餐厅${r.note ? ` · ${r.note}` : ""}</span>`,
        )
        .addTo(map);
    }
    // 已订酒店接入动线
    if (bookedHotel && hasStops && routeStops && routeStops.length > 0) {
      const hpt = L.latLng(bookedHotel.lat, bookedHotel.lng);
      const first = L.latLng(routeStops[0].lat, routeStops[0].lng);
      const last = L.latLng(
        routeStops[routeStops.length - 1].lat,
        routeStops[routeStops.length - 1].lng,
      );
      L.polyline([hpt, first], {
        color: "#1d4ed8",
        weight: 2,
        opacity: 0.7,
        dashArray: "5 5",
      }).addTo(map);
      if (routeStops.length > 1) {
        L.polyline([last, hpt], {
          color: "#1d4ed8",
          weight: 2,
          opacity: 0.7,
          dashArray: "5 5",
        }).addTo(map);
      }
      placeBoundsPts.push(hpt);
    }
    // 视野：把酒店/餐厅也纳入，避免标记落在可视区外
    if (placeBoundsPts.length > 0) {
      const all = L.latLngBounds(placeBoundsPts);
      if (stopBounds) {
        stopBounds.extend(all);
      } else if (singleStop) {
        stopBounds = L.latLngBounds([singleStop]).extend(all).pad(0.18);
        singleStop = null;
      } else if (to) {
        stopBounds = L.latLngBounds([to]).extend(all).pad(0.3);
        to = null;
      } else {
        stopBounds = all.pad(0.3);
      }
    }

    mapRef.current = map;
    // 首次加载偶发空白修复（backlog P1）：与总览地图同因——容器尺寸在 commit
    // 时未稳定，paint 完成后强制刷新尺寸并重算视野，再加一次延迟兜底。
    const refit = () => {
      map.invalidateSize();
      if (showLeg && from && to) {
        map.fitBounds(L.latLngBounds([from, to]).pad(0.35), {
          animate: false,
        });
      } else if (stopBounds) {
        map.fitBounds(stopBounds, { animate: false });
      } else if (singleStop) {
        map.setView(singleStop, 13, { animate: false });
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
        {showLeg
          ? `Day ${dayNum} 转场：${prevCityZh} → ${cityZh}${transferLabel ? `（${transferLabel}）` : ""}`
          : hasStops
            ? `Day ${dayNum}${isTransfer ? ` 转场：${prevCityZh} → ${cityZh}${transferLabel ? `（${transferLabel}）` : ""} ·` : " ·"} 站点顺序动线（编号对应当天时间线）`
            : `Day ${dayNum} · ${cityZh}市内游`}
        <span className="ml-2 text-gray-400">
          ①-⑳ 景点动线 · 🏨 候选酒店（仅位置） · 🍽️ 推荐餐厅
        </span>
      </p>
    </div>
  );
}
