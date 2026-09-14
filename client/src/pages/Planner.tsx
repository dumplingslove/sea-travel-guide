/** 行程规划工具（原生集成：Shadow DOM 直挂，不再用 iframe）。 */
import { useEffect, useRef } from "react";
import { initPlanner } from "./planner/planner-logic";

export default function Planner() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const cleanup = initPlanner(hostRef.current);
    return cleanup;
  }, []);

  return (
    <div style={{ minWidth: 0, overflowX: "clip" }}>
      <div ref={hostRef} style={{ display: "block", minWidth: 0 }} />
    </div>
  );
}
