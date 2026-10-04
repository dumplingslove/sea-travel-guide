import { useState } from "react";

/**
 * 强制刷新按钮（2026-10-03 用户：调试期间手机上没法强制刷新，加个右下角一键强制更新按钮）
 * 点击后：清 Service Worker + Cache API 缓存，然后带时间戳硬重载，绕过浏览器缓存
 */
export default function ForceRefreshButton() {
  const [busy, setBusy] = useState(false);

  const forceRefresh = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // 1. 注销所有 Service Worker
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      // 2. 清 Cache Storage
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
    } catch {
      /* 忽略清理错误，直接硬重载 */
    }
    // 3. 带时间戳硬重载，绕过 HTTP 缓存
    const url = new URL(window.location.href);
    url.searchParams.set("_fr", String(Date.now()));
    window.location.href = url.toString();
  };

  return (
    <button
      onClick={forceRefresh}
      disabled={busy}
      title="强制刷新：清缓存并重新加载最新版本"
      aria-label="强制刷新"
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 9999,
        width: 48,
        height: 48,
        borderRadius: "50%",
        border: "2px solid #0f766e",
        background: "#ffffff",
        color: "#0f766e",
        fontSize: 22,
        lineHeight: 1,
        cursor: "pointer",
        boxShadow: "0 2px 12px rgba(0,0,0,.25)",
        opacity: busy ? 0.5 : 0.9,
      }}
    >
      {busy ? "⏳" : "🔄"}
    </button>
  );
}
