/**
 * /bookings 页面上半部分：待预订清单（按城市组织）。
 *
 * 数据源：bookings/bookingGuideData.ts（程序生成自 booking-classification.json，共 211 条）。
 * 每条展示全部详情字段；「加入预订」沿用旧的 ChecklistItem → BookingDialog 通道，
 * 因此「我的预订」（confirmed/pending、逐卡弹窗等）逻辑不受影响。
 */
import { useState } from "react";
import { Card } from "../pages/records/shared";
import {
  BOOKING_GUIDE_CATEGORY_LABELS,
  BOOKING_GUIDE_SECTIONS,
  BOOKING_GUIDE_SOURCE_NOTE,
  BOOKING_GUIDE_TOTAL,
  BOOKING_GUIDE_UPDATED_AT,
  BOOKING_PAGE_BUILD_TIME,
  type BookingGuideEntry,
  type BookingGuideGroup,
} from "./bookingGuideData";
import type { ChecklistItem } from "./bookingChecklist";
import { BOOKING_KIND_LABEL, type BookingKind } from "./bookingTypes";

const CATEGORY_BADGE: Record<string, string> = {
  must_book: "bg-rose-600 text-white",
  peak_recommended: "bg-amber-500 text-white",
  walkup_or_queue: "bg-sky-600 text-white",
  free_no_booking: "bg-emerald-600 text-white",
  unknown: "bg-gray-500 text-white",
};

const CATEGORY_HINT: Record<string, string> = {
  must_book: "行程依赖 / 极难订：优先锁定",
  peak_recommended: "12 月旺季建议提前订",
  walkup_or_queue: "可当天购票或现场排队",
  free_no_booking: "免费或无需预订",
  unknown: "暂无可靠信息，待明确后补充",
};

const TYPE_TO_KIND: Record<string, BookingKind> = {
  酒店: "hotel",
  餐厅: "restaurant",
  景点: "attraction",
  交通: "transport",
};

const KIND_BADGE: Record<BookingKind, string> = {
  hotel: "bg-teal-700 text-white",
  restaurant: "bg-amber-600 text-white",
  attraction: "bg-sky-600 text-white",
  transport: "bg-indigo-600 text-white",
  other: "bg-gray-500 text-white",
};

/** 洛杉矶时间友好显示 */
function fmtTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return (
    d.toLocaleString("zh-CN", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + "（洛杉矶时间）"
  );
}

function isLink(v: string): boolean {
  return /^https?:\/\//i.test((v || "").trim());
}

/** 清单条目 → 旧 ChecklistItem（供「加入预订」弹窗使用，详情全部带进备注） */
function guideToChecklist(item: BookingGuideEntry): ChecklistItem {
  const bkind = TYPE_TO_KIND[item.type] ?? "other";
  const lines: string[] = [];
  const push = (label: string, v: string) => {
    if (v && v.trim()) lines.push(`${label}：${v.trim()}`);
  };
  push("日期/时段", item.itinerary);
  push("人数", item.party);
  push("提前多久", item.leadTime);
  push("价格/币种", item.price);
  push("官方预订链接", item.officialUrl);
  push("Google Maps", item.mapsUrl);
  push("取消政策", item.cancellation);
  push("提前订理由", item.whyEarly);
  push("适合人群", item.suitability);
  push("着装要求", item.dressCode);
  push("儿童", item.children);
  push("提示", item.tips);
  if (item.categoryReason) lines.push(`分类理由：${item.categoryReason.trim()}`);
  return {
    id: `guide-${item.key}`,
    bkind,
    name: item.name,
    city: "",
    guests: item.party || undefined,
    extra: [
      item.price ? `价格：${item.price}` : "",
      item.cancellation ? `取消：${item.cancellation}` : "",
    ]
      .filter(Boolean)
      .join("；"),
    note: lines.join("\n"),
  };
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 py-0.5 text-sm">
      <span className="shrink-0 w-20 text-gray-400">{label}</span>
      <div className="flex-1 min-w-0 text-gray-700 break-words">{children}</div>
    </div>
  );
}

function LinkButtons({ entry }: { entry: BookingGuideEntry }) {
  const links: { href: string; label: string }[] = [];
  if (isLink(entry.officialUrl)) links.push({ href: entry.officialUrl.trim(), label: "官方预订 ↗" });
  if (isLink(entry.mapsUrl)) links.push({ href: entry.mapsUrl.trim(), label: "Google Maps ↗" });
  if (!links.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-xl text-sm font-medium bg-teal-700 text-white hover:bg-teal-800"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}

function EvidenceBlock({ entry }: { entry: BookingGuideEntry }) {
  const [open, setOpen] = useState(false);
  if (!entry.evidence.length) return null;
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-teal-700 font-medium"
      >
        {open ? "收起核实依据 ▲" : `核实依据（${entry.evidence.length}）▼`}
      </button>
      {open && (
        <ul className="mt-1 space-y-1.5 text-xs text-gray-500 break-words">
          {entry.evidence.map((e, i) => (
            <li key={i} className="border-l-2 border-teal-200 pl-2">
              {e.page && <span className="font-medium text-gray-600">{e.page}：</span>}
              {e.url ? (
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-700 underline break-all"
                >
                  {e.note || e.page || e.url}
                </a>
              ) : (
                <span>{e.note}</span>
              )}
              {e.url && e.note && e.note !== e.url && (
                <span className="block mt-0.5">{e.note}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GuideCard({
  entry,
  added,
  onAdd,
}: {
  entry: BookingGuideEntry;
  added: boolean;
  onAdd: (item: ChecklistItem) => void;
}) {
  const bkind = TYPE_TO_KIND[entry.type] ?? "other";
  const catLabel = BOOKING_GUIDE_CATEGORY_LABELS[entry.category] ?? entry.category;
  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_BADGE[entry.category] ?? "bg-gray-500 text-white"}`}
            >
              {catLabel}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${KIND_BADGE[bkind]}`}
            >
              {BOOKING_KIND_LABEL[bkind]}
            </span>
            <h4 className="font-medium text-gray-800">{entry.name}</h4>
          </div>

          {entry.warning && (
            <p className="mt-2 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              ⚠ {entry.warning}
            </p>
          )}

          <div className="mt-2">
            {entry.itinerary && <Row label="日期/时段">{entry.itinerary}</Row>}
            {entry.party && <Row label="人数">{entry.party}</Row>}
            {entry.leadTime && <Row label="提前多久">{entry.leadTime}</Row>}
            {entry.price && <Row label="价格/币种">{entry.price}</Row>}
            {entry.officialUrl && !isLink(entry.officialUrl) && (
              <Row label="官方预订">{entry.officialUrl}</Row>
            )}
            {entry.cancellation && <Row label="取消政策">{entry.cancellation}</Row>}
            {entry.whyEarly && <Row label="提前订理由">{entry.whyEarly}</Row>}
            {entry.suitability && <Row label="适合人群">{entry.suitability}</Row>}
            {entry.dressCode && <Row label="着装要求">{entry.dressCode}</Row>}
            {entry.children && <Row label="儿童">{entry.children}</Row>}
            {entry.tips && (
              <Row label="提示">
                <span className="whitespace-pre-wrap">{entry.tips}</span>
              </Row>
            )}
            {entry.categoryReason && (
              <p className="mt-1 text-xs text-gray-400">{entry.categoryReason}</p>
            )}
          </div>

          <LinkButtons entry={entry} />
          <EvidenceBlock entry={entry} />
        </div>
        <button
          onClick={() => onAdd(guideToChecklist(entry))}
          disabled={added}
          className={`shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            added
              ? "bg-gray-100 text-gray-400 cursor-default"
              : "bg-teal-700 text-white hover:bg-teal-800"
          }`}
        >
          {added ? "已加入 ✓" : "＋ 加入预订"}
        </button>
      </div>
    </Card>
  );
}

function CategoryGroup({
  group,
  addedNames,
  onAdd,
}: {
  group: BookingGuideGroup;
  addedNames: Set<string>;
  onAdd: (item: ChecklistItem) => void;
}) {
  const label = BOOKING_GUIDE_CATEGORY_LABELS[group.category] ?? group.category;
  return (
    <div className="mt-4">
      <div className="flex items-baseline gap-2 mb-2">
        <h4 className="text-sm font-semibold text-gray-700">
          {label}（{group.entries.length}）
        </h4>
        {CATEGORY_HINT[group.category] && (
          <p className="text-xs text-gray-400">{CATEGORY_HINT[group.category]}</p>
        )}
      </div>
      <div className="space-y-2.5">
        {group.entries.map((e) => (
          <GuideCard
            key={e.key}
            entry={e}
            added={addedNames.has(e.name.trim().toLowerCase())}
            onAdd={onAdd}
          />
        ))}
      </div>
    </div>
  );
}

export default function BookingGuideSection({
  addedNames,
  onAdd,
}: {
  addedNames: Set<string>;
  onAdd: (item: ChecklistItem) => void;
}) {
  return (
    <section className="mb-8">
      <div className="mb-1">
        <p className="text-xs font-semibold tracking-widest text-teal-700">
          BOOKING CHECKLIST
        </p>
        <h2 className="text-lg font-bold text-gray-800">待预订清单（按城市）</h2>
        <p className="mt-1 text-sm text-gray-500">
          按这次 12/12–12/31 二十天行程整理：共 {BOOKING_GUIDE_TOTAL}{" "}
          条可预订/需知项目，先「全程交通」再按城市顺序排列，每城内按预订需求分组。点「加入预订」把全部详情带进弹窗，确认无误后保存；出了确认号再回来标记已确认。
        </p>
        <p className="mt-1 text-xs text-gray-400">
          数据更新于 {fmtTime(BOOKING_GUIDE_UPDATED_AT)} · 页面构建于{" "}
          {fmtTime(BOOKING_PAGE_BUILD_TIME)}
        </p>
        <p className="mt-1 text-xs text-gray-400">{BOOKING_GUIDE_SOURCE_NOTE}</p>
      </div>

      {BOOKING_GUIDE_SECTIONS.map((section) => (
        <div key={section.city} className="mt-6">
          <div className="flex items-baseline gap-2 mb-1 border-b border-[#e5e1d6] pb-2">
            <h3 className="text-base font-bold text-gray-800">{section.cityZh}</h3>
            <p className="text-xs text-gray-400">共 {section.count} 条</p>
          </div>
          {section.groups.map((g) => (
            <CategoryGroup
              key={g.category}
              group={g}
              addedNames={addedNames}
              onAdd={onAdd}
            />
          ))}
        </div>
      ))}
    </section>
  );
}
