import { useState, type CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/_core/hooks/useAuth";

/* 右下角三按钮（与「家庭财务中枢」、露营站同一排布，从下往上）：分享链接 / 强制刷新 / 登录。
   取代原先单独的 ForceRefreshButton（2026-10-25 用户要求三站统一）。
   登录跳 /login 页——该页含「粘贴链接登录」，避开 iOS 桌面 App 与 Safari 存储隔离：
   邮件链接点开只登录浏览器、App 里不认，所以 App 里要长按拷贝链接、回站内粘贴。 */
const SITE_URL = "https://dumplingslove.github.io/sea-travel-guide/";

const btnStyle: CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: "50%",
  background: "#16213e",
  border: "1px solid #667eea",
  color: "#8f9bff",
  fontSize: "1.35em",
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};

export default function FloatingActions() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");

  if (location.pathname === "/login") return null;

  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 2200);
  };

  const forceRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    showToast("🧹 正在清缓存…");
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
    } catch {
      /* 清理失败也继续刷新 */
    }
    const url = new URL(window.location.href);
    url.searchParams.set("_fr", String(Date.now()));
    window.location.replace(url.toString());
  };

  const share = async () => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(SITE_URL);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      const ta = document.createElement("textarea");
      ta.value = SITE_URL;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        ok = true;
      } catch {
        ok = false;
      }
      document.body.removeChild(ta);
    }
    if (ok) {
      setCopied(true);
      showToast("✅ 链接已复制，快去分享吧！");
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      showToast("复制失败，链接是：" + SITE_URL);
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          right: 18,
          bottom: 18,
          zIndex: 9000,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <button
          type="button"
          style={btnStyle}
          title={user ? `已登录：${user.email}（点击去登录页）` : "登录（邮箱链接 / 粘贴链接）"}
          aria-label="登录"
          onClick={() => navigate("/login")}
        >
          {user ? "✅" : "🔒"}
        </button>
        <button
          type="button"
          style={{ ...btnStyle, opacity: refreshing ? 0.55 : 1 }}
          title="强制刷新：清缓存并重新加载最新版本"
          aria-label="强制刷新"
          onClick={forceRefresh}
          disabled={refreshing}
        >
          {refreshing ? "⏳" : "🔄"}
        </button>
        <button
          type="button"
          style={btnStyle}
          title="复制本站链接"
          aria-label="分享链接"
          onClick={share}
        >
          {copied ? "✅" : "🔗"}
        </button>
      </div>
      {toast && (
        <div
          style={{
            position: "fixed",
            right: 18,
            bottom: 240,
            zIndex: 9001,
            background: "#16213e",
            border: "1px solid #667eea",
            color: "#cfe3ff",
            borderRadius: 9,
            padding: "6px 12px",
            fontSize: "0.85em",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            maxWidth: "calc(100vw - 36px)",
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}
