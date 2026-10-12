/** 行程规划页：统一的分步规划流程（顶部 TripOverviewMap 为当前规划的结果预览；旧 /map 经 ?view=map 直达全屏地图）。 */
import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import TripOverviewMap from "@/components/TripOverviewMap";
import { usePlanItinerary } from "@/guide/plannerSchedule";
import { initPlanner } from "./planner/planner-logic";
import MapPage from "@/pages/MapPage";

export default function Planner() {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapBarRef = useRef<HTMLDivElement>(null);
  const plan = usePlanItinerary();
  const [searchParams] = useSearchParams();
  const showMap = searchParams.get("view") === "map";
  const stopsKey = plan.cityStops
    .map((c) => `${c.id}:${c.days[0]}-${c.days[1]}`)
    .join("|");

  useEffect(() => {
    if (showMap || !hostRef.current) return;
    const cleanup = initPlanner(hostRef.current);
    return cleanup;
  }, [showMap]);

  /* 2026-10-03 用户：planner tab 吸顶；top 经 CSS 变量传入 Shadow DOM。
     2026-10-13 用户改口径：菜单在最上、地图置顶在菜单体系之下——tabs 的 sticky top = 顶栏高度，
     地图条 sticky top = 顶栏高度 + tabs 高度（量 Shadow DOM 里的 .tabs 实际高度）。 */
  useEffect(() => {
    if (showMap || !hostRef.current) return;
    const host = hostRef.current;
    const sync = () => {
      const header = document.querySelector("header.sticky");
      const headerH = header ? Math.round(header.getBoundingClientRect().height) : 64;
      const tabsEl = host.shadowRoot?.querySelector(".tabs") as HTMLElement | null;
      const tabsH = tabsEl ? Math.round(tabsEl.getBoundingClientRect().height) : 52;
      document.documentElement.style.setProperty("--planner-header-h", `${headerH}px`);
      document.documentElement.style.setProperty("--planner-tabs-h", `${tabsH}px`);
      host.style.setProperty("--planner-tabs-top", `${headerH}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    const header = document.querySelector("header.sticky");
    if (header) ro.observe(header);
    if (mapBarRef.current) ro.observe(mapBarRef.current);
    const tabsEl = host.shadowRoot?.querySelector(".tabs") as HTMLElement | null;
    if (tabsEl) ro.observe(tabsEl);
    window.addEventListener("resize", sync);
    /* Shadow DOM 里的 tabs 在 initPlanner 渲染后才有高度，延迟再校准一次 */
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
      {/* 2026-10-13 用户：地图置顶在菜单体系之下——菜单（planner tabs）钉在最上，这条地图 sticky 在 tabs 正下方。
          注意 DOM 顺序仍在 tabs 之前（tabs 在下方 Shadow DOM 内容里），靠 sticky top 偏移实现视觉上的「菜单在上、地图在下」。 */}
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
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-sm text-gray-500 my-4">
          下方工具可调整城市、天数与日期，改完后<Link to="/" className="underline font-medium text-teal-700">回首页</Link>查看更新后的每日行程。
        </p>
      </div>
      <div ref={hostRef} style={{ display: "block", minWidth: 0 }} />
    </div>
  );
}
