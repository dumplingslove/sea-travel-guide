import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CITY_COORDS } from "@/data/cityCoords";
import { stopCoordsForDay, type StopCoord } from "@/data/stopCoords";
import { placesForCity } from "@/data/placeCoords";
import { LL, addAmapTiles } from "@/lib/amap";
import {
  placeDetailPath,
  placeSlug,
  findPlace,
} from "@/guide/placeDetail";
import { useDetailReturn, saveDetailReturn } from "@/components/DetailReturn";
import { mallAnchorId } from "@/guide/data";
import { airportForCity } from "@/data/airportCoords";

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

function shoppingIcon() {
  return L.divIcon({
    className: "sea-daymap-marker",
    html: `<span style="
      display:grid;place-items:center;width:30px;height:30px;border-radius:999px;
      background:#ffffff;color:#7c3aed;
      border:2px solid #7c3aed;font-size:15px;line-height:1;
      box-shadow:0 2px 8px rgba(124,58,237,.35);
    ">🛍️</span>`,
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
 * 缩放显示名称标签的 CSS（2026-10-03 用户：zoom in 后直接显示景点名称，不用点）。
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
  useDetailReturn("day-map");
  // Leaflet 弹窗是原生 HTML <a>，用全局函数在跳转前存返回位置
  useEffect(() => {
    (window as unknown as { __saveMapDetailReturn?: (cardId: string) => void }).__saveMapDetailReturn =
      (cardId: string) => saveDetailReturn("day-map", cardId);
    return () => {
      delete (window as unknown as { __saveMapDetailReturn?: unknown }).__saveMapDetailReturn;
    };
  }, []);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  /** 全屏切换后重算视野：effect 内赋值，toggle 里调用 */
  const refitRef = useRef<(() => void) | null>(null);
  /** 点击展开全屏（2026-09-27 用户要求：看清每个地点的位置） */
  const [expanded, setExpanded] = useState(false);
  /** 点击收起（2026-10-04 用户：所有地图都要能收起） */
  const [collapsed, setCollapsed] = useState(false);
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  const coord = CITY_COORDS[cityId];
  const prevCoord = prevCityId ? CITY_COORDS[prevCityId] : null;
  const isTransfer = Boolean(prevCoord && prevCityId !== cityId);
  /** 云端天：编号与静态对不上，用调用方按站点名查好的坐标；静态天沿用旧逻辑 */
  const routeStops: StopCoord[] | undefined = isCloud ? cloudStops : stopCoordsForDay(dayNum);
  /**
   * 地图内容签名：决定地图实例何时重建。
   * 背景（2026-09-26 线上实测）：/day/12 首屏先用静态 20 天行程渲染（D12=吉隆坡），
   * 云端 13 天规划异步到达后文字重渲染为清迈，但 effect 依赖 [] 永不重跑，
   * 地图永远卡在首屏的吉隆坡标记。签名覆盖所有影响地图内容的输入，
   * 内容变化即销毁重建；用序列化签名而不用数组 identity，避免每次渲染抖动。
   */
  const stopsSig = (routeStops ?? [])
    .map((s) => `${s.name}|${s.time}|${s.lat}|${s.lng}`)
    .join(";");
  const mapSig = [
    dayNum,
    cityId,
    cityZh,
    prevCityId ?? "",
    prevCityZh ?? "",
    transferLabel ?? "",
    isCloud ? "cloud" : "static",
    stopsSig,
  ].join("~");
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
    // Google 中文底图（2026-09-27 用户要求中文标注，高德反爬废弃）；WGS-84 无需转换
    addAmapTiles(map);

    // 缩放显示名称：zoom >= 14 时容器加 .show-labels，CSS 控制景点名称标签显隐
    // （2026-10-03 用户；classList 直操作 DOM，不走 React className，遵守容器 className 静态口径）
    ensureZoomLabelCss();
    const syncLabels = () => {
      mapEl.current?.classList.toggle("show-labels", map.getZoom() >= 14);
    };
    map.on("zoomend", syncLabels);
    syncLabels();

    // 全屏/窗口尺寸变化时自动重算（2026-09-27 全屏空白修复）：
    // ResizeObserver 监听容器尺寸，变化时强制 invalidateSize，避免全屏后瓦片不加载
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapEl.current) ro.observe(mapEl.current);

    let from: L.LatLng | null = null;
    let to: L.LatLng | null = null;
    let stopBounds: L.LatLngBounds | null = null;
    /** 单点位日期：fitBounds 零面积会缩到最大 zoom，改用固定缩放的 setView */
    let singleStop: L.LatLng | null = null;
    if (showLeg && prevCoord) {
      from = LL(prevCoord[0], prevCoord[1]);
      to = LL(coord[0], coord[1]);
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
          .setLatLng(LL((from.lat + to.lat) / 2, (from.lng + to.lng) / 2))
          .setContent(
            `<span style="background:#0f766e;color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;white-space:nowrap">✈ ${transferLabel}</span>`,
          )
          .addTo(map);
      }
      L.marker(from, { icon: dotIcon(prevCityZh || "", false) })
        .bindPopup(
          `<b>${prevCityZh}</b><br><span style="font-size:12px;color:#6b7280">Day ${dayNum - 1} 出发</span>`,
        )
        .bindTooltip(prevCityZh || "", {
          permanent: true,
          direction: "top",
          offset: [0, -16],
          className: "sea-zoom-label",
        })
        .addTo(map);
      L.marker(to, { icon: dotIcon(`Day ${dayNum} · ${cityZh}`, true) })
        .bindPopup(
          `<b>${cityZh}</b><br><span style="font-size:12px;color:#6b7280">Day ${dayNum} 到达</span>`,
        )
        .bindTooltip(cityZh, {
          permanent: true,
          direction: "top",
          offset: [0, -18],
          className: "sea-zoom-label",
        })
        .addTo(map);
      map.fitBounds(L.latLngBounds([from, to]).pad(0.35));
    } else if (hasStops) {
      // 每日地图景点级：有核实坐标的日期画编号站点 + 顺序连线
      // （含转场日：当天实际景点优先，航线不再单独成图）
      const stops = routeStops!;
      {
        const pts = stops.map((s) => LL(s.lat, s.lng));
        stops.forEach((s, i) => {
          // 详情链接：只有 slug 能在站内找到对应条目时才给，避免 404
          const stopSlug = placeSlug(cityId, s.name);
          const stopLink = findPlace("attraction", stopSlug)
            ? `<br><a href="${base}${placeDetailPath("attraction", cityId, s.name)}" onclick="window.__saveMapDetailReturn && window.__saveMapDetailReturn('day-${dayNum}-map-${s.name}')" style="color:#0f766e;font-weight:700;font-size:12px">查看详情 →</a>`
            : "";
          L.marker(pts[i], { icon: numIcon(i + 1) })
            .bindPopup(
              `<b>${i + 1} · ${s.name}</b><br><span style="font-size:12px;color:#6b7280">${s.time}${s.note ? ` · ${s.note}` : ""}</span>${stopLink}`,
            )
            .bindTooltip(s.name, {
              permanent: true,
              direction: "top",
              offset: [0, -14],
              className: "sea-zoom-label",
            })
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
        const at = LL(coord[0], coord[1]);
        to = at;
        L.marker(at, { icon: dotIcon(`Day ${dayNum} · ${cityZh}`, true) })
          .bindPopup(`<b>${cityZh}</b>`)
          .bindTooltip(cityZh, {
            permanent: true,
            direction: "top",
            offset: [0, -18],
            className: "sea-zoom-label",
          })
          .addTo(map);
        map.setView(at, 11);
      }
    }

    // 酒店 / 餐厅标记：只标位置、不并入当天动线（用户要求：预订前只看位置、方便选酒店）。
    // 已确认预订的酒店（booked=true）才接入动线：酒店→首站、末站→酒店。
    const { hotels, restaurants, malls } = placesForCity(cityId);
    const placeBoundsPts: L.LatLng[] = [];
    const bookedHotel = hotels.find((h) => h.booked);
    for (const h of hotels) {
      const pt = LL(h.lat, h.lng);
      placeBoundsPts.push(pt);
      const hLink = findPlace("hotel", placeSlug(cityId, h.name))
        ? `<br><a href="${base}${placeDetailPath("hotel", cityId, h.name)}" onclick="window.__saveMapDetailReturn && window.__saveMapDetailReturn('day-${dayNum}-map-hotel-${h.name}')" style="color:#1d4ed8;font-weight:700;font-size:12px">查看酒店详情 →</a>`
        : "";
      L.marker(pt, { icon: hotelIcon(!!h.booked) })
        .bindPopup(
          `<b>🏨 ${h.name}</b><br><span style="font-size:12px;color:#6b7280">${
            h.booked ? "已确认预订" : "候选酒店（未预订，仅标位置）"
          }${h.note ? ` · ${h.note}` : ""}</span>${hLink}`,
        )
        .addTo(map);
    }
    for (const r of restaurants) {
      const pt = LL(r.lat, r.lng);
      placeBoundsPts.push(pt);
      const rLink = findPlace("restaurant", placeSlug(cityId, r.name))
        ? `<br><a href="${base}${placeDetailPath("restaurant", cityId, r.name)}" onclick="window.__saveMapDetailReturn && window.__saveMapDetailReturn('day-${dayNum}-map-restaurant-${r.name}')" style="color:#c2410c;font-weight:700;font-size:12px">查看餐厅详情 →</a>`
        : "";
      L.marker(pt, { icon: restaurantIcon() })
        .bindPopup(
          `<b>🍽️ ${r.name}</b><br><span style="font-size:12px;color:#6b7280">推荐餐厅${r.note ? ` · ${r.note}` : ""}</span>${rLink}`,
        )
        .addTo(map);
    }
    for (const m of malls) {
      const pt = LL(m.lat, m.lng);
      placeBoundsPts.push(pt);
      const mLink = `<br><a href="${base}/practical?shop=${encodeURIComponent(cityZh)}#${mallAnchorId(m.name)}" style="color:#7c3aed;font-weight:700;font-size:12px">查看商场详情 →</a>`;
      L.marker(pt, { icon: shoppingIcon() })
        .bindPopup(
          `<b>🛍️ ${m.name}</b><br><span style="font-size:12px;color:#6b7280">值得逛商场/市场</span>${mLink}`,
        )
        .addTo(map);
    }
    // 机场标注（2026-10-03 用户：所有地图都标机场，紫色 ✈️ 区分）；
    // 不并入视野计算，避免机场偏远把当天景点视野撑大
    const ap = airportForCity(cityZh);
    if (ap) {
      L.marker(LL(ap.lat, ap.lng), { icon: airportIcon() })
        .bindPopup(
          `<b>✈️ ${ap.name}</b><br><span style="font-size:12px;color:#6b7280">${ap.code} · ${cityZh}机场</span>`,
        )
        .addTo(map);
    }
    // 已订酒店接入动线
    if (bookedHotel && hasStops && routeStops && routeStops.length > 0) {
      const hpt = LL(bookedHotel.lat, bookedHotel.lng);
      const first = LL(routeStops[0].lat, routeStops[0].lng);
      const last = LL(
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
    // 全屏切换后复用同一套视野重算
    refitRef.current = refit;
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      ro.disconnect();
      map.off("zoomend", syncLabels);
      refitRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // 地图实例随内容签名重建：静态→云端数据到达、切天、换城市时都会重跑；
    // cleanup 负责销毁旧实例。禁止改回 []（2026-09-26 D12 线上事故教训）。
  }, [mapSig]);

  if (!coord) return null;

  const toggleExpand = () => {
    setExpanded((v) => !v);
    // 等 DOM class 切换完成后再刷新尺寸并重算视野
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const m = mapRef.current;
        if (m) {
          m.invalidateSize();
          refitRef.current?.();
        }
      }),
    );
  };

  // 全屏时：Esc 关闭 + 锁 body 滚动
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [expanded]);

  return (
    <div
      className={
        expanded
          ? "fixed inset-0 z-[90] bg-white flex flex-col"
          : "relative bg-white rounded-xl border border-gray-200 overflow-hidden mb-6"
      }
    >
      {expanded && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 shrink-0">
          <span className="text-sm font-bold text-teal-800">
            Day {dayNum} · {cityZh} 地图
          </span>
          <button
            onClick={toggleExpand}
            className="text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1"
          >
            ✕ 关闭
          </button>
        </div>
      )}
      {/*
        地图容器 className 必须保持静态：Leaflet 初始化时会往容器上加
        leaflet-touch-drag / leaflet-touch-zoom 等 class（决定 touch-action，
        手机双指缩放靠它）。之前这里用 expanded 拼 className，点全屏那一下
        React 重写 class 会把 Leaflet 的标记清掉，全屏后双指就被浏览器劫持、
        地图收不到手势（加减按钮不受影响）。高矮差异走 style，不碰 className。
      */}
      <div
        style={{ display: !expanded && collapsed ? "none" : "contents" }}
      >
      <div
        ref={mapEl}
        className="leaflet-container w-full z-0"
        style={expanded ? { flex: "1 1 0%", minHeight: 0 } : { height: 280 }}
      />
      </div>
      {!expanded && !collapsed && (
        <>
          <button
            onClick={toggleExpand}
            className="absolute top-2 right-2 z-[500] bg-white/95 hover:bg-white text-teal-800 text-xs font-bold rounded-full px-3 py-1.5 shadow border border-gray-200"
          >
            ⛶ 全屏
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="absolute top-2 left-2 z-[500] bg-white/95 hover:bg-white text-teal-800 text-xs font-bold rounded-full px-3 py-1.5 shadow border border-gray-200"
          >
            ▴ 收起
          </button>
          <p className="text-xs text-gray-500 px-4 py-2 border-t border-gray-100">
            {showLeg
              ? `Day ${dayNum} 转场：${prevCityZh} → ${cityZh}${transferLabel ? `（${transferLabel}）` : ""}`
              : hasStops
                ? `Day ${dayNum}${isTransfer ? ` 转场：${prevCityZh} → ${cityZh}${transferLabel ? `（${transferLabel}）` : ""} ·` : " ·"} 站点顺序动线（编号对应当天时间线）`
                : `Day ${dayNum} · ${cityZh}市内游`}
            <span className="ml-2 text-gray-400">
              ①-⑳ 景点动线 · 🏨 候选酒店（仅位置） · 🍽️ 推荐餐厅 · ✈️ 机场 ·
              放大地图显示景点名称
            </span>
          </p>
        </>
      )}
      {!expanded && collapsed && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
          <span className="text-xs text-gray-500">🗺️ Day {dayNum} · {cityZh}地图（已收起）</span>
          <button
            onClick={() => {
              setCollapsed(false);
              requestAnimationFrame(() => {
                const m = mapRef.current;
                if (m) m.invalidateSize();
              });
            }}
            className="bg-white hover:bg-gray-100 text-teal-800 text-xs font-bold rounded-full px-3 py-1.5 shadow border border-gray-200"
          >
            ▾ 展开地图
          </button>
        </div>
      )}
    </div>
  );
}
