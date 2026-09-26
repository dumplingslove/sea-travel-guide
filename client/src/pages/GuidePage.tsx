import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
  return (
    <div className="guide-scope">
      <QueryClientProvider client={client}>
        <GuideApp key={tab} initialTab={tab} hideChrome />
      </QueryClientProvider>
    </div>
  );
}
