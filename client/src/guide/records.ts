/**
 * 攻略站私人记录（打包清单 / 我的预订 / 游记）的数据层。
 *
 * 原 artifact 走 server 的 api.ts；GitHub Pages 是纯静态站，改走 Supabase
 * 的 sea_guide_records 表。
 *
 * 家庭共享：darancai@gmail.com 与 nckuang123@gmail.com 两个账号
 * 登录后读写同一批记录（RLS family_shared_* 策略），界面用
 * sea_profiles 的 display_name 标注每条记录是谁添加的。
 *
 * - 已登录：读写 Supabase 云端（家庭共享范围）。
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
  /** 建记录者的 Supabase user id；本地模式为 null。用于署名展示。 */
  userId: string | null;
}

const TABLE = "sea_guide_records";

/** 家庭共享的两个登录邮箱：登录后可互看互改对方记录。 */
export const FAMILY_EMAILS = [
  "darancai@gmail.com",
  "nckuang123@gmail.com",
] as const;

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

/**
 * 家庭共享范围内可见的 user id 列表：从 sea_profiles 按家庭邮箱解析
 * 出两个账号的 id（带缓存）。解析失败时退回仅自己，避免把页面打空。
 */
let familyIdsCache: string[] | null = null;
async function sharedUserIds(): Promise<string[]> {
  const uid = await currentUserId();
  if (!uid || !supabase) return [];
  if (familyIdsCache) return familyIdsCache;
  try {
    const { data, error } = await supabase
      .from("sea_profiles")
      .select("id")
      .in("email", [...FAMILY_EMAILS]);
    if (error) throw error;
    const ids = (data ?? []).map((r) => r.id as string);
    if (!ids.includes(uid)) ids.push(uid);
    familyIdsCache = ids;
    return ids;
  } catch {
    return [uid];
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
  user_id?: string | null;
}): GuideRecord {
  return {
    id: row.id,
    kind: row.kind as RecordKind,
    title: row.title,
    body: row.body ?? "",
    day: row.day,
    done: row.done,
    userId: row.user_id ?? null,
  };
}

export async function listRecords(): Promise<{ records: GuideRecord[] }> {
  const uid = await currentUserId();
  if (uid && supabase) {
    const ids = await sharedUserIds();
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, kind, title, body, day, done, user_id")
      .in("user_id", ids.length > 0 ? ids : [uid])
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
      const ids = await sharedUserIds();
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
        .in("user_id", ids.length > 0 ? ids : [uid]);
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
        userId: null,
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
    userId: null,
  });
  return { id };
}

export async function deleteRecord(args: { id: number }): Promise<{ ok: true }> {
  const uid = await currentUserId();
  if (uid && supabase && args.id > 0) {
    const ids = await sharedUserIds();
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq("id", args.id)
      .in("user_id", ids.length > 0 ? ids : [uid]);
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
