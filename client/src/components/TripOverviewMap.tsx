import { useEffect, useRef, useState } from "react";
import { useDetailReturn, saveDetailReturn } from "@/components/DetailReturn";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CITY_COORDS } from "@/data/cityCoords";
import { airportForCity } from "@/data/airportCoords";
import { LL, addAmapTiles } from "@/lib/amap";
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
 * 行程首页“路线总览”：与顶级地图页共用 CITY_COORDS 的实时 Leaflet 地图，
 * 取代原来内容过时的静态总览图。点标记可看天数并跳转。
 *
 * stops 可选：传入云端规划解析出的城市站点（城市顺序/天数随规划变化）；
 * 不传则回退静态 cities.json。
 */
export default function TripOverviewMap({ stops, mapHeight }: { stops?: TripStop[]; mapHeight?: number }) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const refitRef = useRef<(() => void) | null>(null);
  /** 城市 id → marker，供外部聚焦事件使用 */
  const cityMarkersRef = useRef(new Map<string, L.Marker>());
  /** 点击展开全屏（2026-09-27 用户要求） */
  const [expanded, setExpanded] = useState(false);
  /** 点击收起（2026-10-04 用户：规划页地图也要能收起，不占屏幕空间） */
  const [collapsed, setCollapsed] = useState(false);
  /** 2026-10-03 用户：跳 /day 详情页回来要恢复原位置 */
  useDetailReturn("home-map");
  /** 地图 popup 原生 <a> 跳转前存返回位置（DayMap 同款兜底） */
  /* 2026-10-04 用户：规划页联动——点城市卡片/标记时平移到该城市。
   * 已在合理缩放（城市级 >=11）只平移；缩太远则平移并缩放到 11。 */
  const focusCity = (cityId: string, openPopup: boolean) => {
    const map = mapRef.current;
    const mk = cityMarkersRef.current.get(cityId);
    if (!map || !mk) return;
    const ll = mk.getLatLng();
    if (map.getZoom() >= 11) map.panTo(ll, { animate: true, duration: 0.8 });
    else map.flyTo(ll, 11, { duration: 0.8 });
    if (openPopup) mk.openPopup();
  };

  /* 外部聚焦事件：planner-logic.ts 里点城市卡片时 dispatch */
  useEffect(() => {
    const onFocus = (e: Event) => {
      const id = (e as CustomEvent<{ cityId?: string }>).detail?.cityId;
      if (id) focusCity(id, true);
    };
    window.addEventListener("planner:focus-city", onFocus);
    return () => window.removeEventListener("planner:focus-city", onFocus);
  }, []);

  /** 地图 popup 原生 <a> 跳转前存返回位置（DayMap 同款兜底） */
  useEffect(() => {
    (window as unknown as { __saveMapDetailReturn?: (cardId: string) => void }).__saveMapDetailReturn =
      (cardId: string) => saveDetailReturn("home-map", cardId);
    return () => {
      delete (window as unknown as { __saveMapDetailReturn?: unknown }).__saveMapDetailReturn;
    };
  }, []);
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
    cityMarkersRef.current.clear();
    // 2026-10-03 白屏修复：过滤掉无坐标的城市，避免 CITY_COORDS[s.id] 为 undefined 导致崩溃
    const cur = mapStops.filter((s) => {
      if (!CITY_COORDS[s.id]) {
        console.warn(`[TripOverviewMap] 跳过无坐标城市: ${s.id}`);
        return false;
      }
      return true;
    });
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const map = L.map(mapEl.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    });
    // Google 中文底图（2026-09-27 用户要求中文标注，高德反爬废弃）；WGS-84 无需转换
    addAmapTiles(map);

    // 缩放显示名称：zoom >= 14 时容器加 .show-labels，CSS 控制城市名称标签显隐
    // （2026-10-03 用户；classList 直操作 DOM，不走 React className，遵守容器 className 静态口径）
    ensureZoomLabelCss();
    const syncLabels = () => {
      mapEl.current?.classList.toggle("show-labels", map.getZoom() >= 14);
    };
    map.on("zoomend", syncLabels);
    syncLabels();

    // 全屏/窗口尺寸变化时自动重算（2026-09-27 全屏空白修复）
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapEl.current) ro.observe(mapEl.current);

    const latlngs = cur.map((s) => {
      const c = CITY_COORDS[s.id];
      return LL(c[0], c[1]);
    });
    L.polyline(latlngs, {
      color: "#0f766e",
      weight: 3,
      opacity: 0.85,
      dashArray: "8 6",
    }).addTo(map);

    cur.forEach((s, i) => {
      const c = CITY_COORDS[s.id];
      const mk = L.marker(LL(c[0], c[1]), { icon: markerIcon(i + 1) })
        .bindPopup(
          `<div style="min-width:150px;font-family:inherit">
            <div style="font-weight:800;font-size:14px;color:#134e4a">${i + 1}. ${s.zh}</div>
            <div style="font-size:12px;color:#4b5563;margin:4px 0">Day ${s.days[0]}–${s.days[1]} · ${s.dates}</div>
            <a href="${base}/day/${s.days[0]}" onclick="window.__saveMapDetailReturn && window.__saveMapDetailReturn('home-map-city-${s.id}')" style="color:#0f766e;font-weight:700;font-size:12px">第 ${s.days[0]} 天行程 →</a>
          </div>`,
        )
        .bindTooltip(s.zh, {
          permanent: true,
          direction: "top",
          offset: [0, -18],
          className: "sea-zoom-label",
        })
        // 2026-10-04 用户：地图联动——点标记平移到该城市并缩放到合理大小（城市级 11）
        .on("click", () => focusCity(s.id, true))
        .addTo(map);
      cityMarkersRef.current.set(s.id, mk);
    });

    // 机场标注（2026-10-03 用户）：行程各城市的机场，紫色 ✈️ 标记；不并入视野计算
    for (const s of cur) {
      const ap = airportForCity(s.zh);
      if (!ap) continue;
      L.marker(LL(ap.lat, ap.lng), { icon: airportIcon() })
        .bindPopup(
          `<b>✈️ ${ap.name}</b><br><span style="font-size:12px;color:#6b7280">${ap.code} · ${s.zh}机场</span>`,
        )
        .addTo(map);
    }

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
    refitRef.current = fixSize;
    mapRef.current = map;
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      ro.disconnect();
      map.off("zoomend", syncLabels);
      refitRef.current = null;
      mapRef.current = null;
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopsKey]);

  const toggleExpand = () => {
    setExpanded((v) => !v);
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
          : "relative bg-white rounded-xl border border-gray-200 overflow-hidden"
      }
    >
      {expanded && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 shrink-0">
          <span className="text-sm font-bold text-teal-800">
            {totalDays}天路线总览
          </span>
          <button
            onClick={toggleExpand}
            className="text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1"
          >
            ✕ 关闭
          </button>
        </div>
      )}
      {/* 地图容器：始终挂载（Leaflet 实例不销毁）；收起时用 display:none 藏，展开后 invalidateSize */}
      <div style={{ display: !expanded && collapsed ? "none" : "contents" }}>
        <div
          ref={mapEl}
          className="leaflet-container w-full z-0"
          style={expanded ? { flex: "1 1 0%", minHeight: 0 } : { height: mapHeight ?? 300 }}
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
          {/* 2026-10-04 用户：点击收起/展开地图，不占屏幕空间 */}
          <button
            onClick={() => setCollapsed(true)}
            className="absolute bottom-2 left-2 z-[500] bg-white/95 hover:bg-white text-teal-800 text-xs font-bold rounded-full px-3 py-1.5 shadow border border-gray-200"
            aria-expanded="true"
          >
            ▴ 收起
          </button>
          <p className="text-xs text-gray-500 px-4 py-2 border-t border-gray-100">
            {totalDays}天路线总览 · {mapStops.map((s) => s.zh).join(" → ")} ·
            点标记查看天数
          </p>
        </>
      )}
      {/* 2026-10-04 修：收起后保留一条细栏放展开按钮（此前绝对定位按钮被 overflow-hidden 裁掉，点不开） */}
      {!expanded && collapsed && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
          <span className="text-xs text-gray-500">🗺️ {totalDays}天路线总览（已收起）</span>
          <button
            onClick={() => {
              setCollapsed(false);
              requestAnimationFrame(() => {
                const m = mapRef.current;
                if (m) {
                  m.invalidateSize();
                  refitRef.current?.();
                }
              });
            }}
            className="bg-white hover:bg-gray-100 text-teal-800 text-xs font-bold rounded-full px-3 py-1.5 shadow border border-gray-200"
            aria-expanded="false"
          >
            ▾ 展开地图
          </button>
        </div>
      )}
    </div>
  );
}
