import { useCallback, useEffect, useMemo, useState } from "react";
import type { User, AuthError } from "@supabase/supabase-js";
import { supabase, supabaseConfigured, appBaseUrl } from "@/lib/supabase";
import { upsertMyProfile } from "@/lib/profiles";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } =
    options ?? {};

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    let mounted = true;
    supabase.auth.getSession().then(({ data, error: err }) => {
      if (!mounted) return;
      if (err) setError(err);
      const u = data.session?.user ?? null;
      setUser(u);
      if (u && supabase) upsertMyProfile(supabase, u);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u && supabase) upsertMyProfile(supabase, u);
      }
    );
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const sendMagicLink = useCallback(async (email: string): Promise<void> => {
    if (!supabaseConfigured || !supabase) {
      throw new Error("云同步尚未启用");
    }
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: appBaseUrl() },
    });
    if (err) throw err;
  }, []);

  /* 桌面 App（iOS 主屏幕 PWA）登录：iOS 的桌面 App 与 Safari 存储隔离，邮件里的登录链接
     点开只会登录 Safari、App 里仍是未登录（系统行为，不是本站 bug）。解法：用户在邮件里
     长按登录链接「拷贝」，回到 App 粘贴——本函数解析链接里的凭证，在当前 App 上下文内
     直接建会话：优先 token_hash 走 verifyOtp（不需要发起端一致），其次 PKCE code，
     最后 hash 里的 access/refresh token。凭证一次性：已在浏览器点开过的链接会失效，
     需重新发送一封、只拷贝不点开。 */
  const completeWithPastedLink = useCallback(async (raw: string): Promise<void> => {
    if (!supabaseConfigured || !supabase) {
      throw new Error("云同步尚未启用");
    }
    let url: URL;
    try {
      url = new URL(raw.trim());
    } catch {
      throw new Error("这不像一个完整链接——请在邮件里长按登录链接、选「拷贝」，再回来粘贴");
    }
    const q = url.searchParams;
    const tokenHash = q.get("token") || q.get("token_hash");
    if (tokenHash) {
      const type = (q.get("type") || "magiclink") as "magiclink";
      const { error: err } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      if (err) throw err;
      return;
    }
    const code = q.get("code");
    if (code) {
      const { error: err } = await supabase.auth.exchangeCodeForSession(code);
      if (err) throw err;
      return;
    }
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const at = hash.get("access_token");
    const rt = hash.get("refresh_token");
    if (at && rt) {
      const { error: err } = await supabase.auth.setSession({ access_token: at, refresh_token: rt });
      if (err) throw err;
      return;
    }
    throw new Error("链接里没找到登录凭证，可能拷贝不完整，请重新拷贝邮件里的登录链接");
  }, []);

  const logout = useCallback(async () => {
    if (!supabaseConfigured || !supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!supabaseConfigured || !supabase) return;
    const { data } = await supabase.auth.getSession();
    setUser(data.session?.user ?? null);
  }, []);

  const state = useMemo(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, error]
  );

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, loading, state.user]);

  return {
    ...state,
    refresh,
    logout,
    sendMagicLink,
    completeWithPastedLink,
  };
}
