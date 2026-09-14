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

  const logout = useCallback(async () => {
    if (!supabaseConfigured || !supabase) return;
    const confirmed = window.confirm(
      "确定要退出登录吗？\n退出后需要重新通过邮箱收取登录链接才能登录。"
    );
    if (!confirmed) return;
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
  };
}
