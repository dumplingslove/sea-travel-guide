/** 行程规划页：统一的分步规划流程（顶部 TripOverviewMap 为当前规划的结果预览；旧 /map 经 ?view=map 直达全屏地图）。 */
import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import TripOverviewMap from "@/components/TripOverviewMap";
import { usePlanItinerary } from "@/guide/plannerSchedule";
import { initPlanner } from "./planner/planner-logic";
import MapPage from "@/pages/MapPage";

export default function Planner() {
  const hostRef = useRef<HTMLDivElement>(null);
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

  if (showMap) {
    return <MapPage />;
  }

  return (
    <div style={{ minWidth: 0, overflowX: "clip" }}>
      <div className="max-w-5xl mx-auto px-4 pt-8">
        <h2 className="text-xl font-bold mb-3">
          {plan.totalDays}天路线总览
        </h2>
        {plan.source === "cloud" && plan.updatedByName && (
          <p className="text-xs text-teal-700 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 mb-3">
            ☁️ 已按云端规划更新（{plan.updatedByName}
            {plan.updatedAt
              ? ` · ${plan.updatedAt.slice(0, 16).replace("T", " ")}`
              : ""}
            ）
          </p>
        )}
        <div className="mb-8">
          <TripOverviewMap key={stopsKey} stops={plan.cityStops} />
        </div>
        <p className="text-sm text-gray-500 mb-6">
          下方工具可调整城市、天数与日期，改完后<Link to="/" className="underline font-medium text-teal-700">回首页</Link>查看更新后的每日行程。
        </p>
      </div>
      <div ref={hostRef} style={{ display: "block", minWidth: 0 }} />
    </div>
  );
}
