import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, AlertCircle, CheckCircle2, CloudOff } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { supabaseConfigured } from "@/lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, sendMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!authLoading && isAuthenticated) {
    navigate("/", { replace: true });
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("请输入邮箱");
      return;
    }
    setLoading(true);
    try {
      await sendMagicLink(email.trim());
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "发送失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <img
              src={`${import.meta.env.BASE_URL}images/logo.svg`}
              alt="Logo"
              className="w-10 h-10"
            />
            <span className="font-bold text-teal-800 text-xl">
              东南亚20天旅行指南
            </span>
          </div>
          <p className="text-sm text-gray-500">
            登录后云端同步笔记、打包、预订、记账与收藏
          </p>
        </div>

        {!supabaseConfigured ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
            <CloudOff size={28} className="mx-auto text-gray-400 mb-3" />
            <p className="font-medium">云同步尚未启用</p>
            <p className="text-sm text-gray-500 mt-1">
              你的记录会保存在本机浏览器中，登录功能暂不可用。
            </p>
          </div>
        ) : sent ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
            <CheckCircle2 size={28} className="mx-auto text-emerald-500 mb-3" />
            <p className="font-medium">已发送，请去邮箱点击登录链接</p>
            <p className="text-sm text-gray-500 mt-1">
              链接发往 {email}，点击后自动登录并回到本站。
            </p>
            <button
              onClick={() => setSent(false)}
              className="text-sm text-teal-700 hover:text-teal-900 transition-colors mt-4"
            >
              换个邮箱
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4"
          >
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                邮箱
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  autoComplete="email"
                />
              </div>
              <p className="text-xs text-gray-500">
                无需密码，输入邮箱后我们会发一封登录链接给你。
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "发送中..." : "发送登录链接"}
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-teal-800 transition-colors"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
