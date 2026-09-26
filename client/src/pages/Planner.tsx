/** 行程规划页：顶部为当前规划的路线总览地图，下方为分步规划工具。 */
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import TripOverviewMap from "@/components/TripOverviewMap";
import { usePlanItinerary } from "@/guide/plannerSchedule";
import { initPlanner } from "./planner/planner-logic";

export default function Planner() {
  const hostRef = useRef<HTMLDivElement>(null);
  const plan = usePlanItinerary();
  const stopsKey = plan.cityStops
    .map((c) => `${c.id}:${c.days[0]}-${c.days[1]}`)
    .join("|");

  useEffect(() => {
    if (!hostRef.current) return;
    const cleanup = initPlanner(hostRef.current);
    return cleanup;
  }, []);

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
