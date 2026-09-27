/**
 * /bookings 预订记录：按类型（酒店/餐厅/景点门票/交通/其他）管理，
 * 每条有已确认/待确认状态。新增与编辑统一走 BookingDialog 弹窗。
 *
 * 数据复用 sea_guide_records（kind="booking"）：
 * - title = 预订名称，body = BookingData JSON，done = 已确认，day = 关联天数。
 * - 兼容旧版三行纯文本 body，按 other 类型解析展示。
 */
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  useRecordsData,
  PageShell,
  SyncBanner,
  Card,
  GhostButton,
  EmptyHint,
  AuthorTag,
} from "./shared";
import BookingDialog, { presetFromRow } from "@/bookings/BookingDialog";
import BookingTimeline from "@/bookings/BookingTimeline";
import BookingStatusSummary from "@/bookings/BookingStatusSummary";
import { Flights, HotelCatalog, RestaurantCatalog, Transport, usePlanScope, planDateShort } from "@/guide/GuideApp";
import "@/guide/theme-scoped.css";
import { getRestaurantBookingPolicy } from "@/bookings/restaurantBookingStatus";
import { restaurants } from "@/guide/data";
import {
  presetFromChecklist,
  type ChecklistItem,
} from "@/bookings/bookingTypes";
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

/** 顶部行动总览：现在要干什么，一眼看清 */
function ActionStrip({ confirmedCount }: { confirmedCount: number }) {
  const four = ["新加坡", "普吉", "曼谷", "清迈"];
  const rests = restaurants.filter((r) => four.includes(r.city));
  const mustN = rests.filter(
    (r) => getRestaurantBookingPolicy(r.name)?.policy === "must_book",
  ).length;
  const peakN = rests.filter(
    (r) => getRestaurantBookingPolicy(r.name)?.policy === "peak_recommended",
  ).length;
  const stats = [
    { label: "现在锁", n: 5, cls: "bg-rose-50 text-rose-700 border-rose-200" },
    { label: "酒店待选", n: 4, cls: "bg-amber-50 text-amber-700 border-amber-200" },
    { label: "必订餐厅", n: mustN, cls: "bg-orange-50 text-orange-700 border-orange-200" },
    { label: "建议订位", n: peakN, cls: "bg-sky-50 text-sky-700 border-sky-200" },
    { label: "已确认", n: confirmedCount, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ];
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {stats.map((s) => (
        <span
          key={s.label}
          className={`text-sm font-medium px-3 py-1.5 rounded-full border ${s.cls}`}
        >
          {s.label} <b>{s.n}</b>
        </span>
      ))}
    </div>
  );
}

/** 收藏的待预订：酒店/餐厅收藏后出现在这里，带"何时订"指导，一键转入预订 */
function FavoriteActionList({
  onAddFavorite,
}: {
  onAddFavorite: (name: string, city: string, bkind: BookingKind) => void;
}) {
  const { rows, del } = useRecordsData(["favorite"]);
  const favs = rows
    .map((r) => {
      try {
        const d = JSON.parse(r.body) as {
          city?: string;
          note?: string;
          type?: string;
        };
        return { row: r, city: d.city ?? "", type: d.type ?? "attraction" };
      } catch {
        return { row: r, city: "", type: "attraction" };
      }
    })
    .filter((f) => f.type === "hotel" || f.type === "restaurant");

  if (!favs.length) return null;

  const timingTip = (type: string) =>
    type === "hotel"
      ? "12月是旺季，建议现在就订（提前2-3个月），好房型先到先得"
      : "热门餐厅提前1-2周订位；米其林/必订餐厅现在可查档期";

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <h3 className="font-bold text-gray-900 mb-1">⭐ 我的待预订收藏</h3>
      <p className="text-xs text-gray-500 mb-3">
        在酒店/餐厅页点了收藏的会出现在这里，确认要订就转入预订记录
      </p>
      <div className="space-y-2">
        {favs.map((f) => (
          <div
            key={f.row.id}
            className="flex items-center justify-between gap-2 bg-white rounded-lg border border-amber-100 px-3 py-2"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {f.row.title}
                <span className="ml-2 text-xs font-normal text-gray-400">
                  {f.city} · {f.type === "hotel" ? "酒店" : "餐厅"}
                </span>
              </div>
              <div className="text-xs text-amber-700">{timingTip(f.type)}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() =>
                  onAddFavorite(
                    f.row.title,
                    f.city,
                    f.type === "hotel" ? "hotel" : "restaurant",
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-medium hover:bg-teal-800"
              >
                加入预订
              </button>
              <button
                onClick={() => del.mutate({ id: f.row.id })}
                className="px-2 py-1.5 rounded-lg text-gray-400 text-xs hover:text-gray-600"
                aria-label={`移除收藏${f.row.title}`}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingsInner() {
  const { rows, loading, loadError, save, del, syncMode } =
    useRecordsData(["booking"]);
  const [filter, setFilter] = useState<Filter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preset, setPreset] = useState<BookingPreset | null>(null);
  /** 二次确认删除：用站内按钮代替 window.confirm（原生弹窗在自动化/部分移动端会被吞掉） */
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  /** 二级菜单：预订行动 / 酒店 / 餐厅 / 航班 / 交通（支持 ?menu=action|hotels|restaurants|flights|transport 深链；旧 ?menu=details&view=hotels|restaurants 自动兼容） */
  const [searchParams] = useSearchParams();
  type MenuKey = "action" | "hotels" | "restaurants" | "flights" | "transport";
  const [menu, setMenu] = useState<MenuKey>(() => {
    const m = searchParams.get("menu");
    if (m === "hotels" || m === "restaurants" || m === "flights" || m === "transport") return m;
    if (m === "details") return searchParams.get("view") === "restaurants" ? "restaurants" : "hotels";
    return "action";
  });
  /** 行程规划里定好的城市+日期：预订页只看这些（机票看定好的时间，酒店/餐厅看定好的城市和日期） */
  const { segments } = usePlanScope();
  const planCities = useMemo(() => segments.map((s) => s.city), [segments]);
  const stayDates = useMemo(() => {
    const m: Record<string, string> = {};
    segments.forEach((s) => {
      m[s.city] = `${planDateShort(s.start)}–${planDateShort(s.end)}`;
    });
    return m;
  }, [segments]);
  const scoped = segments.length > 0;
  /** 酒店/餐厅详情里的"预订"按钮：直接打开同一页的预订弹窗 */
  const onBookPreset = (p: BookingPreset) => {
    setPreset(p);
    setDialogOpen(true);
  };

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
  /** 收藏 → 预订：把收藏的酒店/餐厅直接带入预订弹窗 */
  const addFavoriteToBooking = (name: string, city: string, bkind: BookingKind) => {
    setPreset({ bkind, name, city });
    setDialogOpen(true);
  };
  /** 清单项 → 已加入的记录：先按 sourceId（改名后依然对得上），再按名称回退 */
  const matchRecord = useMemo(() => {
    const bySource = new Map<string, number>();
    const byName = new Map<string, number>();
    parsed.forEach((p, i) => {
      if (p.data.sourceId) bySource.set(p.data.sourceId, i);
      byName.set(p.row.title.trim().toLowerCase(), i);
    });
    return (item: ChecklistItem) => {
      const key = item.name.trim().toLowerCase();
      const idx =
        bySource.get(item.id) ?? (byName.has(key) ? byName.get(key) : undefined);
      if (idx == null) return undefined;
      const p = parsed[idx]!;
      return {
        confirmed: p.confirmed,
        summary: bookingSummary(p.data) || undefined,
        onView: () => openEdit(p.row.id),
      };
    };
  }, [parsed]);
  const addFromChecklist = (item: ChecklistItem) => {
    setPreset(presetFromChecklist(item));
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

  const menus: { key: MenuKey; label: string }[] = [
    { key: "action", label: "📋 预订行动" },
    { key: "hotels", label: "🏨 酒店" },
    { key: "restaurants", label: "🍽️ 餐厅" },
    { key: "flights", label: "✈️ 航班" },
    { key: "transport", label: "🚋 交通" },
  ];

  return (
    <PageShell
      eyebrow="MY BOOKINGS"
      title="预订"
      summary="📋 机票、酒店、餐饮、交通收拢在一页：「预订行动」是时间线、状态与你的预订记录；「酒店」「餐厅」「航班」「交通」只显示行程规划里定好的城市和日期（照片、口碑、实时价、订位政策），挑中了直接点预订。"
    >
      <SyncBanner mode={syncMode} />

      {scoped && (
        <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          <span className="font-bold">📅 按行程规划只看这些：</span>
          {segments.map((s) => `${s.city} ${planDateShort(s.start)}–${planDateShort(s.end)}`).join(" · ")}
          <Link to="/planner" className="ml-2 font-medium text-teal-700 underline">
            去行程规划调整 →
          </Link>
        </div>
      )}

      {/* 二级菜单：预订行动 / 酒店与餐厅 / 航班 / 交通 */}
      <div className="flex gap-2 mb-6" role="tablist" aria-label="预订二级菜单">
        {menus.map((m) => (
          <button
            key={m.key}
            role="tab"
            aria-selected={menu === m.key}
            onClick={() => setMenu(m.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              menu === m.key
                ? "bg-teal-700 text-white border-teal-700"
                : "bg-white text-gray-600 border-[#e5e1d6] hover:border-teal-600"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {menu === "action" ? (
        <>
      {/* 行动总览：现在要干什么，一眼看清 */}
      <ActionStrip confirmedCount={confirmedCount} />

      {/* 收藏的待预订：酒店/餐厅页收藏后出现在这里 */}
      <FavoriteActionList onAddFavorite={addFavoriteToBooking} />

      {/* 预订行动时间线：按最晚行动时间排，机票/酒店/餐厅/景点一体 */}
      <h2 className="text-lg font-bold text-gray-900 mb-3">📋 预订行动时间线</h2>
      <BookingTimeline onAdd={addFromChecklist} matchRecord={matchRecord} />

      {/* 城市参考：行程城市每家明细（酒店实时价 / 餐厅政策 / 景点余票）；无保存行程时回退全部城市 */}
      <div id="city-ref" className="scroll-mt-24">
        <BookingStatusSummary scopeCities={scoped ? planCities : undefined} />
      </div>

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
              ? "还没有预订记录。去「酒店与餐厅」里挑一家，点“预订”就会出现在这里。"
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
                    <AuthorTag userId={r.userId} />
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
                <div className="flex shrink-0 items-center gap-1">
                  <GhostButton onClick={() => openEdit(r.id)}>编辑</GhostButton>
                  {confirmDeleteId === r.id ? (
                    <>
                      <span className="text-xs text-red-600 whitespace-nowrap">确定删？</span>
                      <GhostButton
                        danger
                        onClick={() => {
                          setConfirmDeleteId(null);
                          del.mutate({ id: r.id });
                        }}
                      >
                        确认删除
                      </GhostButton>
                      <GhostButton onClick={() => setConfirmDeleteId(null)}>
                        取消
                      </GhostButton>
                    </>
                  ) : (
                    <GhostButton danger onClick={() => setConfirmDeleteId(r.id)}>
                      删除
                    </GhostButton>
                  )}
                </div>
                {del.isError && (
                  <p className="text-xs text-red-600 mt-1">删除失败，请稍后重试。</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
        </>
      ) : menu === "hotels" ? (
        <div className="guide-scope">
          <HotelCatalog onBook={onBookPreset} scopeCities={scoped ? planCities : undefined} stayDates={scoped ? stayDates : undefined} />
        </div>
      ) : menu === "restaurants" ? (
        <div className="guide-scope">
          <RestaurantCatalog onBook={onBookPreset} scopeCities={scoped ? planCities : undefined} stayDates={scoped ? stayDates : undefined} />
        </div>
      ) : menu === "flights" ? (
        <div className="guide-scope">
          <Flights onBook={onBookPreset} />
        </div>
      ) : (
        <div className="guide-scope">
          <Transport scopeCities={scoped ? planCities : undefined} />
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
