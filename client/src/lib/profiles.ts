import type { SupabaseClient, User } from "@supabase/supabase-js";

/** Display name shown on shared records/notes, e.g. "darancai". */
export function displayNameFor(email: string | undefined | null): string {
  if (!email) return "家人";
  const local = email.split("@")[0];
  return local || "家人";
}

/** Fire-and-forget: keep my row in sea_profiles fresh so shared
 *  records/notes can show who wrote them. */
export function upsertMyProfile(
  supabase: SupabaseClient,
  user: Pick<User, "id" | "email">
): void {
  if (!user.email) return;
  void supabase
    .from("sea_profiles")
    .upsert(
      {
        id: user.id,
        email: user.email,
        display_name: displayNameFor(user.email),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .then(({ error }) => {
      if (error) console.warn("同步个人资料失败", error.message);
    });
}

/** Map of user_id -> display_name for labeling shared records/notes. */
export async function fetchProfileMap(
  supabase: SupabaseClient
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const { data, error } = await supabase
      .from("sea_profiles")
      .select("id, display_name");
    if (error) {
      console.warn("加载用户资料失败", error.message);
      return map;
    }
    for (const row of data || []) {
      map.set(row.id, row.display_name);
    }
  } catch {
    /* labels just fall back */
  }
  return map;
}
