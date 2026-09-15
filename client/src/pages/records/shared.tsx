/**
 * 顶级功能页（/notes /packing /bookings /expenses /favorites）共享层。
 *
 * 数据层直接复用 client/src/guide/records.ts：同一张 Supabase 表
 * sea_guide_records（owner-only RLS），kind 复用 note/packing/booking，
 * 新增 expense/favorite。攻略站内部工具（打包清单/我的预订/游记）读写
 * 同一张表、同一个 kind，天然互通。
 *
 * 未登录/未配置时降级为本机内存模式，界面如实标注
 * “所有改动只在本次打开期间有效”（与攻略站/规划器同口径）。
 */
import { useEffect, useState, type ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  listRecords,
  saveRecord,
  deleteRecord,
  recordSyncMode,
  type RecordKind,
} from "@/guide/records";

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export function useRecordsData(kinds: RecordKind[]) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["records"], queryFn: listRecords });
  const [syncMode, setSyncMode] = useState<"cloud" | "local" | null>(null);
  useEffect(() => {
    void recordSyncMode().then(setSyncMode);
  }, []);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["records"] });
  const save = useMutation({ mutationFn: saveRecord, onSuccess: invalidate });
  const del = useMutation({ mutationFn: deleteRecord, onSuccess: invalidate });
  const rows = (q.data?.records ?? []).filter((r) => kinds.includes(r.kind));
  return { rows, loading: q.isPending, loadError: q.error, save, del, syncMode };
}

/* ---------- 视觉原子（与顶层站统一：米白底、青绿强调、细边框卡片） ---------- */

export function PageShell({
  eyebrow,
  title,
  summary,
  children,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-[11px] tracking-[0.2em] text-teal-700 font-semibold mb-2">
        {eyebrow}
      </p>
      <h1
        className="text-3xl mb-2 text-[#143c34]"
        style={{ fontFamily: 'Georgia,"Noto Serif SC",serif' }}
      >
        {title}
      </h1>
      <p className="text-sm text-gray-500 mb-6">{summary}</p>
      {children}
    </div>
  );
}

export function SyncBanner({
  mode,
}: {
  mode: "cloud" | "local" | null;
}) {
  if (mode === "local")
    return (
      <p
        role="status"
        className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800"
      >
        ⚠️
        未登录本地模式：所有改动只在本次打开期间有效；登录后可云端同步。
      </p>
    );
  if (mode === "cloud")
    return (
      <p
        role="status"
        className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm text-teal-800"
      >
        ✓ 已登录：记录云端同步（Supabase）。
      </p>
    );
  return null;
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#e5e1d6] shadow-sm p-4">
      {children}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block mb-3">
      <span className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600";

export function PrimaryButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="px-4 py-2 rounded-lg bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  danger,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return (
    <button
      {...rest}
      className={`px-3 py-1.5 rounded-lg text-sm ${
        danger
          ? "text-gray-400 hover:text-red-700 hover:bg-red-50"
          : "text-gray-500 hover:text-teal-800 hover:bg-teal-50"
      }`}
    >
      {children}
    </button>
  );
}

export function EmptyHint({ text }: { text: string }) {
  return <p className="text-sm text-gray-400 py-6 text-center">{text}</p>;
}
