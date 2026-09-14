import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

/** True when Supabase env vars are present (injected at build time). */
export const supabaseConfigured: boolean = Boolean(
  supabaseUrl && supabaseAnonKey
);

/** Supabase client, or null when cloud sync is not configured (local-only mode). */
export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

/** App base URL including the GitHub Pages subpath, e.g. https://host/sea-travel-guide/ */
export function appBaseUrl(): string {
  const base = import.meta.env.BASE_URL as string;
  const normalized = base.endsWith("/") ? base : `${base}/`;
  return `${window.location.origin}${normalized}`;
}
