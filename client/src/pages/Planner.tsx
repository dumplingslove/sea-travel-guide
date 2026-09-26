/** 行程规划页：子视图「分步规划」/「交互地图」（旧 /map 已并入此页 ?view=map）。 */
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import TripOverviewMap from "@/components/TripOverviewMap";
import { usePlanItinerary } from "@/guide/plannerSchedule";
import { initPlanner } from "./planner/planner-logic";
import MapPage from "@/pages/MapPage";

export default function Planner() {
  const hostRef = useRef<HTMLDivElement>(null);
  const plan = usePlanItinerary();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<"planner" | "map">(() =>
    searchParams.get("view") === "map" ? "map" : "planner",
  );
  const stopsKey = plan.cityStops
    .map((c) => `${c.id}:${c.days[0]}-${c.days[1]}`)
    .join("|");

  useEffect(() => {
    if (view !== "planner" || !hostRef.current) return;
    const cleanup = initPlanner(hostRef.current);
    return cleanup;
  }, [view]);

  return (
    <div style={{ minWidth: 0, overflowX: "clip" }}>
      <div className="max-w-5xl mx-auto px-4 pt-8">
        {/* 子视图切换：分步规划 / 交互地图 */}
        <div className="flex gap-2 mb-6" role="tablist" aria-label="行程规划子视图">
          {(
            [
              { key: "planner", label: "🧭 分步规划" },
              { key: "map", label: "🗺️ 交互地图" },
            ] as const
          ).map((v) => (
            <button
              key={v.key}
              role="tab"
              aria-selected={view === v.key}
              onClick={() => setView(v.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                view === v.key
                  ? "bg-teal-700 text-white border-teal-700"
                  : "bg-white text-gray-600 border-[#e5e1d6] hover:border-teal-600"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        {view === "map" ? (
          <MapPage />
        ) : (
          <>
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
          </>
        )}
      </div>
      {view === "planner" && (
        <div ref={hostRef} style={{ display: "block", minWidth: 0 }} />
      )}
    </div>
  );
}
