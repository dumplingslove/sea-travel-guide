import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GuideApp } from "@/guide/GuideApp";
import "@/guide/theme-scoped.css";

/**
 * /guide：旧版攻略站（space-2）整体迁移。
 * 10 个 tab 原样保留；打包清单/我的预订/游记走 Supabase sea_guide_records，
 * 未登录时为本地模式（界面如实标注）。
 */
export default function GuidePage() {
  const [client] = useState(() => new QueryClient());
  return (
    <div className="guide-scope">
      <QueryClientProvider client={client}>
        <GuideApp />
      </QueryClientProvider>
    </div>
  );
}
