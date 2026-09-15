/**
 * 攻略站私人记录（打包清单 / 我的预订 / 游记）的数据层。
 *
 * 原 artifact 走 server 的 api.ts；GitHub Pages 是纯静态站，改走 Supabase
 * 的 sea_guide_records 表（owner-only RLS）。
 *
 * - 已登录：读写 Supabase 云端。
 * - 未登录 / 未配置：降级为本机内存模式，并在界面如实标注
 *   "所有改动只在本次打开期间有效"（与行程规划器同口径）。
 */
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { initialResearchStatus } from "./researchStatusInitial";

export type RecordKind =
  | "booking"
  | "note"
  | "packing"
  | "journal"
  | "expense"
  | "favorite";

export interface GuideRecord {
  id: number;
  kind: RecordKind;
  title: string;
  body: string;
  day: number | null;
  done: boolean;
}

const TABLE = "sea_guide_records";

/** 本机内存兜底（未登录时），与规划器同口径：只在本次打开期间有效。 */
const localStore: GuideRecord[] = [];
let localSeq = -1;

async function currentUserId(): Promise<string | null> {
  if (!supabaseConfigured || !supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/** 'cloud' = 已登录走 Supabase；'local' = 未登录本机内存模式。 */
export async function recordSyncMode(): Promise<"cloud" | "local"> {
  const uid = await currentUserId();
  return uid && supabase ? "cloud" : "local";
}

function toRecord(row: {
  id: number;
  kind: string;
  title: string;
  body: string | null;
  day: number | null;
  done: boolean;
}): GuideRecord {
  return {
    id: row.id,
    kind: row.kind as RecordKind,
    title: row.title,
    body: row.body ?? "",
    day: row.day,
    done: row.done,
  };
}

export async function listRecords(): Promise<{ records: GuideRecord[] }> {
  const uid = await currentUserId();
  if (uid && supabase) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, kind, title, body, day, done")
      .eq("user_id", uid)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return { records: (data ?? []).map(toRecord) };
  }
  return { records: [...localStore] };
}

export async function saveRecord(args: {
  id?: number;
  kind: RecordKind;
  title: string;
  body: string;
  day: number | null;
  done: boolean;
}): Promise<{ id: number }> {
  const uid = await currentUserId();
  if (uid && supabase) {
    if (args.id && args.id > 0) {
      const { error } = await supabase
        .from(TABLE)
        .update({
          kind: args.kind,
          title: args.title,
          body: args.body,
          day: args.day,
          done: args.done,
          updated_at: new Date().toISOString(),
        })
        .eq("id", args.id)
        .eq("user_id", uid);
      if (error) throw error;
      return { id: args.id };
    }
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        user_id: uid,
        kind: args.kind,
        title: args.title,
        body: args.body,
        day: args.day,
        done: args.done,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { id: data.id as number };
  }
  // 本地模式：内存保存
  if (args.id && args.id < 0) {
    const idx = localStore.findIndex((r) => r.id === args.id);
    if (idx >= 0) {
      localStore[idx] = {
        id: args.id,
        kind: args.kind,
        title: args.title,
        body: args.body,
        day: args.day,
        done: args.done,
      };
      return { id: args.id };
    }
  }
  const id = localSeq--;
  localStore.unshift({
    id,
    kind: args.kind,
    title: args.title,
    body: args.body,
    day: args.day,
    done: args.done,
  });
  return { id };
}

export async function deleteRecord(args: { id: number }): Promise<{ ok: true }> {
  const uid = await currentUserId();
  if (uid && supabase && args.id > 0) {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq("id", args.id)
      .eq("user_id", uid);
    if (error) throw error;
    return { ok: true };
  }
  const idx = localStore.findIndex((r) => r.id === args.id);
  if (idx >= 0) localStore.splice(idx, 1);
  return { ok: true };
}

/**
 * 研究进度状态：静态站无 server，固定返回构建时初始快照
 * （ResearchProgressPage 本来就支持 source='initial_snapshot' 降级展示）。
 */
export async function getResearchStatus(): Promise<{
  status: unknown;
  updated_at: string;
  source: string;
}> {
  return {
    status: initialResearchStatus,
    updated_at: initialResearchStatus.updated_at as string,
    source: "initial_snapshot",
  };
}
