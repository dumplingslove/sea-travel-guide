import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, AlertCircle, CheckCircle2, CloudOff } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { supabaseConfigured } from "@/lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, sendMagicLink, completeWithPastedLink } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [pasted, setPasted] = useState("");
  const [pasteError, setPasteError] = useState("");
  const [pasting, setPasting] = useState(false);

  const handlePasteLogin = async () => {
    setPasteError("");
    if (!pasted.trim()) {
      setPasteError("先把拷贝的登录链接粘贴进来");
      return;
    }
    setPasting(true);
    try {
      await completeWithPastedLink(pasted);
      /* 登录成功后 useAuth 的监听会更新状态，本页自动跳回首页 */
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "登录失败，请稍后重试";
      setPasteError(
        /expired|invalid|already/i.test(msg)
          ? "这个链接已经失效或被用过了。链接是一次性的：在任何地方用过都会作废——包括在浏览器里点开过、或刚刚在另一个设备/浏览器里粘贴登录过。这个设备请点下面「重新发送」单独发一封新邮件，收到后只长按拷贝、不要点开、也不要先在别处粘贴。"
          : msg
      );
    } finally {
      setPasting(false);
    }
  };

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
              东南亚旅行指南
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
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="text-center">
              <CheckCircle2 size={28} className="mx-auto text-emerald-500 mb-3" />
              <p className="font-medium">登录邮件已发送到 {email}</p>
            </div>
            <div className="text-sm text-gray-600 mt-4 space-y-2">
              <p><b>在浏览器里用：</b>去邮箱点开邮件里的登录链接即可，会自动登录。</p>
              <p><b>在手机桌面 App 里用：</b>不要点开链接（点开只会登录浏览器，App 里还是未登录，这是苹果的隔离机制）。在邮件里<b>长按登录链接 → 拷贝</b>，回到这里粘贴：</p>
              <p><b>一封链接只能给一个设备用一次：</b>电脑、iPad、手机 App 要分别登录的，每个设备各发送一封，只用自己最新收到的那封——重新发送会让之前的链接作废，在别处粘贴登录过也会作废。</p>
            </div>
            {pasteError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm mt-3">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{pasteError}</span>
              </div>
            )}
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder="把拷贝的登录链接粘贴到这里"
              rows={3}
              className="w-full mt-3 px-3 py-2 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 break-all"
            />
            <button
              onClick={handlePasteLogin}
              disabled={pasting}
              className="w-full py-2 mt-2 rounded-lg bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 disabled:opacity-60"
            >
              {pasting ? "登录中..." : "用粘贴的链接在 App 里登录"}
            </button>
            <div className="text-center mt-4">
              <button
                onClick={() => { setSent(false); setPasted(""); setPasteError(""); }}
                className="text-sm text-teal-700 hover:text-teal-900 transition-colors"
              >
                重新发送 / 换个邮箱
              </button>
            </div>
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
                若你是从手机桌面 App 打开的本页：发送后别点开邮件里的链接（会跑去浏览器），
                下一步会教你长按拷贝链接、回来粘贴登录。
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "发送中..." : "发送登录链接"}
            </button>

            {/* 2026-10-17 用户在 iPad 上找不到粘贴框（此前只在「已发送」视图里出现，
                没点发送就看不到）——改为登录页常显：已有登录邮件的人直接粘贴登录 */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-500">
                已经收到过登录邮件？在邮件里<b>长按登录链接 → 拷贝</b>（不要点开），粘贴到这里直接登录（桌面 App 必须用这个方式）。注意链接一次性且一封只能给一个设备用：在别处点开过或粘贴登录过的就作废了，这个设备请重新发送一封、只用最新那封。
              </p>
              {pasteError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm mt-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{pasteError}</span>
                </div>
              )}
              <textarea
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                placeholder="把拷贝的登录链接粘贴到这里"
                rows={3}
                className="w-full mt-2 px-3 py-2 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 break-all"
              />
              <button
                type="button"
                onClick={handlePasteLogin}
                disabled={pasting}
                className="w-full py-2 mt-2 rounded-lg bg-white border border-teal-700 text-teal-800 text-sm font-medium hover:bg-teal-50 disabled:opacity-60"
              >
                {pasting ? "登录中..." : "用粘贴的链接登录"}
              </button>
            </div>
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
