import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { GuideApp, type GuideTab } from "@/guide/GuideApp";
import "@/guide/theme-scoped.css";

/**
 * 攻略分站：旧版 space-2 的独有 tab 已拆成主站一级路由
 * （/attractions /practical /research），
 * /hotels /restaurants /flights /transport 已并入 /bookings 二级菜单
 * （旧路由跳转带参），/map 已并入 /planner 子视图「交互地图」。
 * 不再保留独立的 /guide 入口（/guide 跳转到首页）。
 * 行程/打包清单/我的预订/游记 4 个 tab 主站导航里已有对应页面，不再重复。
 */
export default function GuidePage({ tab }: { tab: GuideTab }) {
  const [client] = useState(() => new QueryClient());
  const [searchParams] = useSearchParams();
  /* 2026-09-28 从行程规划跳过来时（?from=planner），顶部给一个返回按钮，
     同 tab 内跳转、手机上不会重新开 app。 */
  const fromPlanner = searchParams.get("from") === "planner";
  return (
    <div className="guide-scope">
      {fromPlanner && (
        <div style={{ padding: "12px 16px 0" }}>
          <Link
            to="/planner"
            style={{
              display: "inline-block",
              padding: "8px 14px",
              border: "1px solid var(--line)",
              borderRadius: "999px",
              fontSize: "14px",
              textDecoration: "none",
              color: "var(--ink)",
              background: "var(--surface)",
            }}
          >
            ← 返回行程规划
          </Link>
        </div>
      )}
      <QueryClientProvider client={client}>
        <GuideApp key={tab} initialTab={tab} hideChrome />
      </QueryClientProvider>
    </div>
  );
}
