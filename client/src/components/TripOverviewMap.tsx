import { useEffect, useRef, useState } from "react";
import { useDetailReturn, saveDetailReturn } from "@/components/DetailReturn";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CITY_COORDS, CITY_ID_BY_ZH } from "@/data/cityCoords";

/** 城市 id → 中文名（兜底弹框/未入行程城市用） */
const ID_TO_ZH: Record<string, string> = Object.fromEntries(
  Object.entries(CITY_ID_BY_ZH).map(([zh, id]) => [id, zh]),
);
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
.map-flash{animation:seaMapFlash 1.1s ease-out}
@keyframes seaMapFlash{0%{box-shadow:inset 0 0 0 5px rgba(220,38,38,.9)}100%{box-shadow:inset 0 0 0 0 rgba(220,38,38,0)}}
.sea-focus-pin{background:none;border:none}
.sea-focus-pin span{display:block;font-size:38px;line-height:1;text-align:center;filter:drop-shadow(0 5px 6px rgba(0,0,0,.5));animation:seaPinDrop .45s ease-out}
@keyframes seaPinDrop{0%{transform:translateY(-16px);opacity:0}60%{transform:translateY(2px);opacity:1}100%{transform:translateY(0);opacity:1}}
/* 2026-10-13 用户：地图信息框太占地——弹窗整体收紧；聚焦信息改走地图下方信息条后，
   弹窗只剩点标记时出现，再压一档（更小内边距/字号/限宽） */
.leaflet-popup-content-wrapper{border-radius:10px}
.leaflet-popup-content{margin:5px 8px;font-size:11.5px;line-height:1.4;max-width:185px}
.leaflet-popup-content b{font-size:12px}
.leaflet-popup-close-button{font-size:13px !important;padding:1px 3px 0 0 !important}
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
  /** 当前 stops（供连线聚焦时查两城天数/日期） */
  const stopsRef = useRef<TripStop[]>([]);
  /** 全部航段边（含出发/回程的西雅图端点腿），供「点城市高亮它全部航班」查相邻段 */
  const edgesRef = useRef<
    { fromId: string; toId: string; fromStop?: TripStop; toStop?: TripStop }[]
  >([]);
  /** 当前高亮的航段连线组（红线层组：单段聚焦 1 条，城市聚焦多条） */
  const highlightRef = useRef<L.LayerGroup | null>(null);
  /** 聚焦信息条（2026-10-13 用户：弹窗太占地图——聚焦信息改显示在地图下方一条窄条里） */
  const [focusInfo, setFocusInfo] = useState<string | null>(null);
  /** 聚焦时落下的大头针（2026-10-13 用户：飞到城市必须有 pin/标记，不能只有一个气泡） */
  const focusPinsRef = useRef<L.Marker[]>([]);
  /** 点击展开全屏（2026-09-27 用户要求） */
  const [expanded, setExpanded] = useState(false);
  /** 点击收起（2026-10-04 用户：规划页地图也要能收起，不占屏幕空间） */
  const [collapsed, setCollapsed] = useState(false);
  /** 2026-10-03 用户：跳 /day 详情页回来要恢复原位置 */
  useDetailReturn("home-map");
  /** 地图 popup 原生 <a> 跳转前存返回位置（DayMap 同款兜底） */
  /* 2026-10-04 用户：规划页联动——点城市卡片/标记时平移到该城市。
   * 已在合理缩放（城市级 >=11）只平移；缩太远则平移并缩放到 11。 */
  const clearHighlight = () => {
    if (highlightRef.current) {
      highlightRef.current.remove();
      highlightRef.current = null;
    }
  };

  /** 清除全部聚焦视觉（高亮线+大头针+信息条） */
  const clearFocus = () => {
    clearHighlight();
    focusPinsRef.current.forEach((p) => p.remove());
    focusPinsRef.current = [];
    setFocusInfo(null);
  };

  /** 新建一层高亮线组（替换上一批） */
  const newHighlightGroup = (map: L.Map): L.LayerGroup => {
    clearHighlight();
    highlightRef.current = L.layerGroup().addTo(map);
    return highlightRef.current;
  };

  /** 两端原始坐标（标记优先、无标记按城市坐标兜底——任何已知城市都画得出） */
  const coordOfId = (id: string): L.LatLng | null => {
    const mk = cityMarkersRef.current.get(id);
    if (mk) return mk.getLatLng();
    const c = CITY_COORDS[id];
    return c ? LL(c[0], c[1]) : null;
  };

  /** 跨太平洋防画反：把 b 的经度归一到与 a 相差 ≤180°（连线走短的那条路/太平洋侧） */
  const normLngTo = (a: L.LatLng, b: L.LatLng): L.LatLng => {
    let lng = b.lng;
    while (lng - a.lng > 180) lng -= 360;
    while (a.lng - lng > 180) lng += 360;
    return L.latLng(b.lat, lng);
  };

  /** 在高亮组里画一条红线，返回归一化后的两端（供落 pin） */
  const drawLegLine = (
    group: L.LayerGroup,
    la0: L.LatLng,
    lb0: L.LatLng,
    weight: number,
  ): [L.LatLng, L.LatLng] => {
    const lb = normLngTo(la0, lb0);
    L.polyline([la0, lb], {
      color: "#dc2626",
      weight,
      opacity: 0.95,
    }).addTo(group);
    return [la0, lb];
  };

  const zhOf = (id: string, s?: TripStop) => s?.zh || ID_TO_ZH[id] || id;
  const stayText = (s: TripStop) => `Day ${s.days[0]}–${s.days[1]} · ${s.dates}`;

  /** 在指定坐标落大头针（替换上一批）：城市聚焦落 1 个，航段聚焦两端各 1 个 */
  const placePins = (map: L.Map, latlngs: L.LatLng[]) => {
    focusPinsRef.current.forEach((p) => p.remove());
    focusPinsRef.current = latlngs.map((ll) =>
      L.marker(ll, {
        icon: L.divIcon({
          className: "sea-focus-pin",
          html: "<span>📍</span>",
          iconSize: [40, 40],
          iconAnchor: [20, 38],
        }),
        interactive: false,
        zIndexOffset: 1000,
      }).addTo(map),
    );
  };

  /* 联动反馈：被行程里的元素触发聚焦时，地图描边闪一下红框，告诉用户"看这里" */
  const flashMap = () => {
    const el = mapEl.current;
    if (!el) return;
    el.classList.remove("map-flash");
    void el.offsetWidth;
    el.classList.add("map-flash");
    window.setTimeout(() => el.classList.remove("map-flash"), 1150);
  };

  /* 聚焦一个城市（2026-10-13 用户定稿）：地图不平移、不缩放——把这个城市的全部
     航班一起红线高亮、两端落大头针，信息写到地图下方信息条，不再用弹窗遮地图。
     （此前点城市飞过去、点跨洋段整图换世界副本，用户明确投诉。） */
  const focusCity = (cityId: string) => {
    const map = mapRef.current;
    if (!map) return;
    flashMap();
    map.closePopup();
    const group = newHighlightGroup(map);
    focusPinsRef.current.forEach((p) => p.remove());
    focusPinsRef.current = [];
    const legs = edgesRef.current.filter(
      (e) => e.fromId === cityId || e.toId === cityId,
    );
    const pinKeys = new Set<string>();
    const pins: L.LatLng[] = [];
    const addPin = (ll: L.LatLng) => {
      const k = `${ll.lat.toFixed(3)},${ll.lng.toFixed(3)}`;
      if (pinKeys.has(k)) return;
      pinKeys.add(k);
      pins.push(ll);
    };
    for (const leg of legs) {
      const la = coordOfId(leg.fromId);
      const lb = coordOfId(leg.toId);
      if (!la || !lb) continue;
      const [pa, pb] = drawLegLine(group, la, lb, 4.5);
      addPin(pa);
      addPin(pb);
    }
    const stays = stopsRef.current.filter((s) => s.id === cityId);
    const self = coordOfId(cityId);
    if (!pins.length && self) addPin(self);
    placePins(map, pins);
    const zh = zhOf(cityId, stays[0]);
    const legText = legs
      .map((e) => `${zhOf(e.fromId, e.fromStop)} → ${zhOf(e.toId, e.toStop)}`)
      .join(" · ");
    const stayInfo = stays.length
      ? stays.map((s) => stayText(s)).join("；")
      : "还没排进已保存的行程天数";
    setFocusInfo(
      legs.length
        ? `<b>📍 ${zh}</b> 的航班：${legText}<br/>停留：${stayInfo}`
        : `<b>📍 ${zh}</b> · ${stayInfo}`,
    );
  };

  /* 聚焦一段航线（2026-10-13 用户定稿）：只高亮这一段——红粗线+两端大头针，
     信息写到地图下方信息条；地图不平移、不缩放（此前点跨洋段换世界副本取景、
     再点下一段整图平移一个世界，用户明确投诉）。跨洋段的线从亚洲端向太平洋
     方向伸出画面，方向正确、不再整图搬家。 */
  const focusLeg = (
    fromId: string,
    toId: string,
    fromStop?: TripStop,
    toStop?: TripStop,
  ) => {
    const map = mapRef.current;
    if (!map) return;
    const la = coordOfId(fromId);
    const lb = coordOfId(toId);
    if (!la || !lb) return;
    flashMap();
    map.closePopup();
    const group = newHighlightGroup(map);
    const [pa, pb] = drawLegLine(group, la, lb, 6);
    placePins(map, [pa, pb]);
    /* 站点由连线点击直接传入时优先用它：同城出现两次（如北京在行程首尾各一段）时，
       按 id find 只会命中第一段，分开行动段的北京信息会串成第一段天数 */
    let sa = fromStop;
    let sb = toStop;
    if (!sa || !sb) {
      /* 外部 planner:focus-leg 事件只带城市 id（planner-logic 侧无站点上下文）：
         同城多段时按「到达段紧接出发段结束」在候选对里选衔接最紧的一对——
         如 曼谷→北京 应命中分开行动段的北京（紧接曼谷段结束次日开始），
         而不是行程首段北京；单段城市退化为唯一候选，行为不变。 */
      const fromCands = sa ? [sa] : stopsRef.current.filter((s) => s.id === fromId);
      const toCands = sb ? [sb] : stopsRef.current.filter((s) => s.id === toId);
      let best = Infinity;
      for (const a of fromCands) {
        for (const b of toCands) {
          const score = Math.abs(b.days[0] - a.days[1] - 1);
          if (score < best) {
            best = score;
            sa = a;
            sb = b;
          }
        }
      }
      sa = sa ?? fromCands[0];
      sb = sb ?? toCands[0];
    }
    const endText = (id: string, s?: TripStop) =>
      s ? `<b>${s.zh}</b> ${stayText(s)}` : `<b>${zhOf(id)}</b>`;
    setFocusInfo(
      `✈️ ${endText(fromId, sa)} → ${endText(toId, sb)}`,
    );
  };

  /* 外部聚焦事件：planner-logic.ts 里点城市/航班时 dispatch */
  useEffect(() => {
    const onFocus = (e: Event) => {
      const id = (e as CustomEvent<{ cityId?: string }>).detail?.cityId;
      if (id) focusCity(id);
    };
    const onFocusLeg = (e: Event) => {
      const d = (e as CustomEvent<{ fromId?: string; toId?: string }>).detail;
      if (d?.fromId && d?.toId) focusLeg(d.fromId, d.toId);
    };
    window.addEventListener("planner:focus-city", onFocus);
    window.addEventListener("planner:focus-leg", onFocusLeg);
    return () => {
      window.removeEventListener("planner:focus-city", onFocus);
      window.removeEventListener("planner:focus-leg", onFocusLeg);
    };
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

    stopsRef.current = cur;
    highlightRef.current = null;
    focusPinsRef.current = [];
    setFocusInfo(null);
    const latlngs = cur.map((s) => {
      const c = CITY_COORDS[s.id];
      return LL(c[0], c[1]);
    });
    /* 每段航线单独一条连线（2026-10-13 用户：航班显示两城信息+连线）：
       线上悬停显示「A → B」，点线直接高亮这段并弹两城信息（focusLeg）。
       分开行动的北京/西安是同一时段并列两地（天数区间完全相同）：两人从上一城
       分别前往、之后分别前往下一城，彼此之间没有转场——逐顺序连线会画出一条
       不存在的「北京 → 西安」，且漏掉「上一城 → 西安」与「北京 → 下一城」。
       故并列对之间不连线，改由前后站点向并列两地各连一条分支线。 */
    const sameDays = (a: TripStop, b: TripStop) =>
      a.days[0] === b.days[0] && a.days[1] === b.days[1];
    const coordOfStop = (s: TripStop) => {
      const c = CITY_COORDS[s.id];
      return LL(c[0], c[1]);
    };
    const edges: { from: TripStop; to: TripStop }[] = [];
    for (let i = 1; i < cur.length; i++) {
      if (sameDays(cur[i - 1], cur[i])) continue;
      edges.push({ from: cur[i - 1], to: cur[i] });
    }
    for (let k = 0; k + 1 < cur.length; k++) {
      if (!sameDays(cur[k], cur[k + 1])) continue;
      if (k > 0) edges.push({ from: cur[k - 1], to: cur[k + 1] });
      /* 并列段之后先汇合再同行（2026-10-13 用户改回程：分开行动后你在北京坐高铁去西安
         跟老婆孩子汇合，全家从西安一起走）——画「北京→西安」汇合线，不再画北京→下一站；
         下一站由并列对的后一个城市（汇合点）连出（第一遍循环已生成）。 */
      if (k + 2 < cur.length) edges.push({ from: cur[k], to: cur[k + 1] });
    }
    /* 边表存 ref（含出发/回程西雅图端点腿），供点城市时查它的全部相邻航班 */
    edgesRef.current = [
      ...edges.map((e) => ({
        fromId: e.from.id,
        toId: e.to.id,
        fromStop: e.from,
        toStop: e.to,
      })),
      ...(cur.length
        ? [{ fromId: "seattle", toId: cur[0].id, toStop: cur[0] }]
        : []),
      ...(cur.length
        ? [
            {
              fromId: cur[cur.length - 1].id,
              toId: "seattle",
              fromStop: cur[cur.length - 1],
            },
          ]
        : []),
    ];
    for (const { from, to } of edges) {
      L.polyline([coordOfStop(from), coordOfStop(to)], {
        color: "#0f766e",
        weight: 3,
        opacity: 0.85,
        dashArray: "8 6",
      })
        .bindTooltip(`${from.zh} → ${to.zh}`, { sticky: true, direction: "top" })
        .on("click", () => focusLeg(from.id, to.id, from, to))
        .addTo(map);
    }

    /* 标记按城市合并（2026-10-13 用户：北京既是第一城、后面分开行动又回来，
       两段同坐标各放一个编号标记会完全重叠）：一城一个标记，编号=首次出现的
       顺序，弹窗里把该城的每一段停留都列出来（各自带行程链接）。 */
    const byCity = new Map<string, { stays: TripStop[]; firstIdx: number }>();
    cur.forEach((s, i) => {
      const g = byCity.get(s.id);
      if (g) g.stays.push(s);
      else byCity.set(s.id, { stays: [s], firstIdx: i });
    });
    byCity.forEach((g, cityId) => {
      const c = CITY_COORDS[cityId];
      const first = g.stays[0];
      const stayRows = g.stays
        .map(
          (s) =>
            `<div style="font-size:11.5px;color:#4b5563;margin-top:3px">Day ${s.days[0]}–${s.days[1]} · ${s.dates} <a href="${base}/day/${s.days[0]}" onclick="window.__saveMapDetailReturn && window.__saveMapDetailReturn('home-map-city-${cityId}')" style="color:#0f766e;font-weight:700">行程 →</a></div>`,
        )
        .join("");
      const mk = L.marker(LL(c[0], c[1]), {
        icon: markerIcon(g.firstIdx + 1),
      })
        .bindPopup(
          `<div style="font-family:inherit">
            <div style="font-weight:800;font-size:13px;color:#134e4a">${g.firstIdx + 1}. ${first.zh}${g.stays.length > 1 ? `（共 ${g.stays.length} 段）` : ""}</div>
            ${stayRows}
          </div>`,
          { maxWidth: 200 },
        )
        .bindTooltip(first.zh, {
          permanent: true,
          direction: "top",
          offset: [0, -18],
          className: "sea-zoom-label",
        })
        // 点标记本身：在原地落大头针并弹信息（不再飞过去——与卡片聚焦同口径，地图不搬家）
        .on("click", () => {
          clearHighlight();
          setFocusInfo(null);
          placePins(map, [mk.getLatLng()]);
          mk.openPopup();
        })
        .addTo(map);
      cityMarkersRef.current.set(cityId, mk);
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
      {/* 聚焦信息条：点城市/航班后的信息显示在这里（地图下方），不遮地图 */}
      {focusInfo && !collapsed && (
        <div className="flex items-start gap-2 px-3 py-1.5 bg-red-50 border-t border-red-100">
          <span
            className="flex-1 text-[12px] leading-snug text-gray-800"
            dangerouslySetInnerHTML={{ __html: focusInfo }}
          />
          <button
            type="button"
            onClick={clearFocus}
            aria-label="清除高亮"
            className="shrink-0 text-gray-400 hover:text-gray-600 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}
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
            {totalDays}天路线总览 ·{" "}
            {mapStops.map((s, i) => (
              <span key={`${s.id}-${i}`}>
                {i > 0 && " → "}
                <button
                  type="button"
                  onClick={() => focusCity(s.id)}
                  className="font-semibold text-teal-800 underline decoration-dotted underline-offset-2"
                >
                  {s.zh}
                </button>
              </span>
            ))}{" "}
            · 点城市名高亮它全部航班，点航班卡只高亮那一段；地图不会乱跑，信息在地图下方看
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
