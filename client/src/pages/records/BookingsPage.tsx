/**
 * /bookings 预订记录：按类型（酒店/餐厅/景点门票/交通/其他）管理，
 * 每条有已确认/待确认状态。新增与编辑统一走 BookingDialog 弹窗。
 *
 * 数据复用 sea_guide_records（kind="booking"）：
 * - title = 预订名称，body = BookingData JSON，done = 已确认，day = 关联天数。
 * - 兼容旧版三行纯文本 body，按 other 类型解析展示。
 */
import { useMemo, useState } from "react";
import {
  useRecordsData,
  PageShell,
  SyncBanner,
  Card,
  GhostButton,
  EmptyHint,
} from "./shared";
import BookingDialog, { presetFromRow } from "@/bookings/BookingDialog";
import {
  BOOKING_KIND_LABEL,
  BOOKING_KINDS,
  bookingSummary,
  parseBookingBody,
  type BookingKind,
  type BookingPreset,
} from "@/bookings/bookingTypes";

const kindBadge: Record<BookingKind, string> = {
  hotel: "bg-teal-700 text-white",
  restaurant: "bg-amber-600 text-white",
  attraction: "bg-sky-600 text-white",
  transport: "bg-indigo-600 text-white",
  other: "bg-gray-500 text-white",
};

type Filter = BookingKind | "all" | "pending" | "confirmed";

function BookingsInner() {
  const { rows, loading, loadError, save, del, syncMode } =
    useRecordsData(["booking"]);
  const [filter, setFilter] = useState<Filter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preset, setPreset] = useState<BookingPreset | null>(null);

  const parsed = useMemo(
    () =>
      rows.map((r) => ({
        row: r,
        data: parseBookingBody(r.body),
        confirmed: r.done,
      })),
    [rows]
  );
  const confirmedCount = parsed.filter((p) => p.confirmed).length;

  const shown = parsed.filter((p) => {
    if (filter === "all") return true;
    if (filter === "pending") return !p.confirmed;
    if (filter === "confirmed") return p.confirmed;
    return p.data.bkind === filter;
  });

  const openNew = (bkind: BookingKind = "hotel") => {
    setPreset({ bkind, name: "" });
    setDialogOpen(true);
  };
  const openEdit = (id: number) => {
    const r = rows.find((x) => x.id === id);
    if (!r) return;
    setPreset(presetFromRow(r));
    setDialogOpen(true);
  };
  const toggleConfirmed = (id: number, current: boolean) => {
    const r = rows.find((x) => x.id === id);
    if (!r) return;
    save.mutate({ id: r.id, kind: r.kind, title: r.title, body: r.body, day: r.day, done: !current });
  };

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: `全部 ${rows.length}` },
    { key: "pending", label: `待确认 ${rows.length - confirmedCount}` },
    { key: "confirmed", label: `已确认 ${confirmedCount}` },
    ...BOOKING_KINDS.map((k) => ({
      key: k as Filter,
      label: BOOKING_KIND_LABEL[k],
    })),
  ];

  return (
    <PageShell
      eyebrow="MY BOOKINGS"
      title="预订记录"
      summary="酒店、餐厅、景点门票、航班逐条记录：确认号、出票状态一目了然。从酒店/餐厅/航班页点“预订”会自动带过来。"
    >
      <SyncBanner mode={syncMode} />

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          共 {rows.length} 条 · 已确认 {confirmedCount} · 待确认{" "}
          {rows.length - confirmedCount}
        </p>
        <button
          onClick={() => openNew()}
          className="px-4 py-2 rounded-xl bg-teal-700 text-white text-sm font-medium hover:bg-teal-800"
        >
          ＋ 新增预订
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f.key
                ? "bg-teal-700 text-white border-teal-700"
                : "bg-white text-gray-600 border-[#e5e1d6] hover:border-teal-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <EmptyHint text="正在读取…" />
      ) : loadError ? (
        <EmptyHint text="读取失败，请稍后重试。" />
      ) : shown.length === 0 ? (
        <EmptyHint
          text={
            rows.length === 0
              ? "还没有预订记录。去酒店页挑一家，点“预订”就会出现在这里。"
              : "这个筛选下没有记录。"
          }
        />
      ) : (
        <div className="space-y-3">
          {shown.map(({ row: r, data: d, confirmed }) => (
            <Card key={r.id}>
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleConfirmed(r.id, confirmed)}
                  aria-label={confirmed ? `标记${r.title}为待确认` : `标记${r.title}为已确认`}
                  title={confirmed ? "已确认，点击改回待确认" : "待确认，点击标记已确认"}
                  className={`mt-0.5 w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center text-sm transition-colors ${
                    confirmed
                      ? "bg-teal-600 border-teal-600 text-white"
                      : "border-gray-300 text-transparent hover:border-teal-600"
                  }`}
                >
                  ✓
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${kindBadge[d.bkind]}`}
                    >
                      {BOOKING_KIND_LABEL[d.bkind]}
                    </span>
                    <h3 className="font-medium text-gray-800">{r.title}</h3>
                    {r.day != null && (
                      <span className="text-xs text-gray-400">Day {r.day}</span>
                    )}
                  </div>
                  {bookingSummary(d) && (
                    <p className="mt-1.5 text-sm text-gray-600">
                      {bookingSummary(d)}
                    </p>
                  )}
                  {d.note && (
                    <p className="mt-1 text-sm text-gray-500 whitespace-pre-wrap break-words">
                      {d.note}
                    </p>
                  )}
                  {!confirmed && (
                    <p className="mt-1.5 text-xs text-amber-700">
                      待确认：出票 / 收到确认号后点左侧圆圈标记。
                    </p>
                  )}
                </div>
                <div className="flex shrink-0">
                  <GhostButton onClick={() => openEdit(r.id)}>编辑</GhostButton>
                  <GhostButton danger onClick={() => del.mutate({ id: r.id })}>
                    删除
                  </GhostButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <BookingDialog
        open={dialogOpen}
        preset={preset}
        onClose={() => {
          setDialogOpen(false);
          setPreset(null);
        }}
      />

      <p className="mt-8 text-xs text-gray-400">
        预订信息保存在这里（登录后云端同步）。旧版纯文本记录会自动兼容展示。
      </p>
    </PageShell>
  );
}

export default function BookingsPage() {
  return <BookingsInner />;
}
