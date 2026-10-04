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

  /* 2026-10-03 用户：planner 三个 tab（大行程/东南亚城市规划/检查确认）吸顶；top 经 CSS 变量传入 Shadow DOM。
     2026-10-03 用户：行程规划地图也置顶吸顶（像首页一样固定在屏幕顶部）——地图条本身 sticky 在站点顶栏下方，
     tabs 的 sticky top = 顶栏高度 + 地图条高度，避免两者重叠。 */
  useEffect(() => {
    if (showMap || !hostRef.current) return;
    const host = hostRef.current;
    const sync = () => {
      const header = document.querySelector("header.sticky");
      const headerH = header ? Math.round(header.getBoundingClientRect().height) : 64;
      const mapH = mapBarRef.current ? Math.round(mapBarRef.current.getBoundingClientRect().height) : 0;
      document.documentElement.style.setProperty("--planner-header-h", `${headerH}px`);
      host.style.setProperty("--planner-tabs-top", `${headerH + mapH}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    const header = document.querySelector("header.sticky");
    if (header) ro.observe(header);
    if (mapBarRef.current) ro.observe(mapBarRef.current);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [showMap]);

  if (showMap) {
    return <MapPage />;
  }

  return (
    <div style={{ minWidth: 0, overflowX: "clip" }}>
      {/* 2026-10-03 用户：行程规划地图置顶吸顶，滚动时保持可见（像首页的吸顶地图条） */}
      <div
        ref={mapBarRef}
        className="sticky z-30 bg-[#f7f4ee] border-b border-gray-200"
        style={{ top: "var(--planner-header-h, 64px)" }}
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
