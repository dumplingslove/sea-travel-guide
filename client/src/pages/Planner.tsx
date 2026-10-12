/** 行程规划页：子菜单（行程安排/检查确认）固定在页面最上方，其下置顶路线总览地图，
 *  再往下直接进入城市与天数选择（大行程说明文字已按用户要求删除）。
 *  可见页签在本文件渲染，点击时驱动规划逻辑（Shadow DOM）里隐藏的 .tab 状态机切换面板；
 *  逻辑内部触发的切换（如检查确认里的「去行程安排」）经 planner:tab 事件回同步高亮。
 *  旧 /map 经 ?view=map 直达全屏地图。 */
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TripOverviewMap from "@/components/TripOverviewMap";
import { usePlanItinerary } from "@/guide/plannerSchedule";
import { initPlanner } from "./planner/planner-logic";
import MapPage from "@/pages/MapPage";

type PlannerTab = "trip" | "order";
const PLANNER_TABS: { key: PlannerTab; label: string }[] = [
  { key: "trip", label: "🗺️ 行程安排" },
  { key: "order", label: "🔍 检查确认" },
];

export default function Planner() {
  const hostRef = useRef<HTMLDivElement>(null);
  const tabsBarRef = useRef<HTMLDivElement>(null);
  const mapBarRef = useRef<HTMLDivElement>(null);
  const plan = usePlanItinerary();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<PlannerTab>("trip");
  const showMap = searchParams.get("view") === "map";
  const stopsKey = plan.cityStops
    .map((c) => `${c.id}:${c.days[0]}-${c.days[1]}`)
    .join("|");

  useEffect(() => {
    if (showMap || !hostRef.current) return;
    const cleanup = initPlanner(hostRef.current);
    return cleanup;
  }, [showMap]);

  /* 逻辑内部切换页签时回同步高亮 */
  useEffect(() => {
    const host = hostRef.current;
    if (showMap || !host) return;
    const onTab = (e: Event) => {
      const t = (e as CustomEvent).detail;
      if (t === "trip" || t === "order") setActiveTab(t);
    };
    host.addEventListener("planner:tab", onTab);
    return () => host.removeEventListener("planner:tab", onTab);
  }, [showMap]);

  const clickTab = (tab: PlannerTab) => {
    setActiveTab(tab);
    const btn = hostRef.current?.shadowRoot?.querySelector(
      `[data-tab="${tab}"]`,
    ) as HTMLElement | null;
    btn?.click();
  };

  /* 吸顶栈度量：页签 top = 顶栏高度；地图 top = 顶栏 + 页签高度；
     --planner-stack-h（顶栏+页签+地图）供逻辑切换页签时计算滚动偏移。 */
  useEffect(() => {
    if (showMap) return;
    const sync = () => {
      const header = document.querySelector("header.sticky");
      const headerH = header ? Math.round(header.getBoundingClientRect().height) : 64;
      const tabsH = tabsBarRef.current
        ? Math.round(tabsBarRef.current.getBoundingClientRect().height)
        : 52;
      const mapH = mapBarRef.current
        ? Math.round(mapBarRef.current.getBoundingClientRect().height)
        : 300;
      document.documentElement.style.setProperty("--planner-header-h", `${headerH}px`);
      document.documentElement.style.setProperty("--planner-tabs-h", `${tabsH}px`);
      document.documentElement.style.setProperty(
        "--planner-stack-h",
        `${headerH + tabsH + mapH}px`,
      );
    };
    sync();
    const ro = new ResizeObserver(sync);
    const header = document.querySelector("header.sticky");
    if (header) ro.observe(header);
    if (tabsBarRef.current) ro.observe(tabsBarRef.current);
    if (mapBarRef.current) ro.observe(mapBarRef.current);
    window.addEventListener("resize", sync);
    const t = window.setTimeout(sync, 800);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
      window.clearTimeout(t);
    };
  }, [showMap]);

  if (showMap) {
    return <MapPage />;
  }

  return (
    <div style={{ minWidth: 0, overflowX: "clip" }}>
      {/* 子菜单：固定在页面最上方（顶栏之下），与预订页同款分段控件 */}
      <div
        ref={tabsBarRef}
        className="sticky z-40 bg-[#f7f4ee]"
        style={{ top: "var(--planner-header-h, 64px)" }}
      >
        <div className="max-w-5xl mx-auto px-4 pt-3">
          <div className="grid grid-cols-2 gap-1 rounded-[14px] border border-[#ddd6c2] bg-[#e9e5d8] p-1">
            {PLANNER_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                aria-selected={activeTab === t.key}
                onClick={() => clickTab(t.key)}
                className={
                  activeTab === t.key
                    ? "rounded-[10px] bg-white px-2 py-2.5 text-[15px] font-bold text-[#134e4a] shadow"
                    : "rounded-[10px] px-2 py-2.5 text-[15px] font-semibold text-gray-500"
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* 路线总览地图：置顶在子菜单之下 */}
      <div
        ref={mapBarRef}
        className="sticky z-30 bg-[#f7f4ee] border-b border-gray-200"
        style={{ top: "calc(var(--planner-header-h, 64px) + var(--planner-tabs-h, 52px))" }}
      >
        <div className="max-w-5xl mx-auto px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h2 className="text-lg font-bold">
              {plan.totalDays}天路线总览
            </h2>
            {plan.source === "cloud" && plan.updatedByName && (
              <span className="text-[11px] text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-2 py-0.5">
                ☁️ 云端已更新
              </span>
            )}
          </div>
          <TripOverviewMap key={stopsKey} stops={plan.cityStops} mapHeight={230} />
        </div>
      </div>
      <div ref={hostRef} style={{ display: "block", minWidth: 0 }} />
    </div>
  );
}
