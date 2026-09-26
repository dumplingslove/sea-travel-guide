/**
 * 地点详情页共享面板（/attraction/:slug、/restaurant/:slug、/hotel/:slug 用）。
 *
 * 把原来只在攻略 tab 内联详情（GuideApp DetailBody）里才有的研究信息
 * ——小红书口碑、多平台评分、实用信息、避雷、原帖证据、最佳机位、空位余票——
 * 搬到独立详情页，保证两处看到的信息一致。
 */
import { useEffect, useState, type ReactNode } from "react";
import type { Item } from "@/guide/data";
import {
  getGuideFacts,
  getXhsAssessment,
  secondaryEvidence,
  xhsEvidence,
  type GuideKind,
} from "@/guide/research";
import { bangkokOta } from "@/guide/bangkokOta";
import { getPhotoSpots } from "@/guide/attractionPhotoSpots";
import { getPlaceGallery } from "@/guide/placeGalleries";
import { usePaged } from "@/guide/density";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export type DetailKind = GuideKind;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-teal-900 mb-3">{title}</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {children}
      </div>
    </section>
  );
}

/** 实用信息：地址 / 营业 / 价格 / 节奏 / 交通 */
export function FactsPanel({ item, kind }: { item: Item; kind: DetailKind }) {
  const facts = getGuideFacts(item, kind);
  const rows: [string, string][] = [
    ["位置 / 地址", facts.address],
    ["营业 / 开放", facts.hours],
    ["价格 / 门票", facts.price],
    ["建议节奏", facts.schedule],
    ["怎么到 · 怎么串联", facts.transit],
  ];
  return (
    <Section title="🧭 实用信息">
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
        {rows.map(([k, v]) => (
          <div key={k} className="bg-white p-4">
            <dt className="text-xs text-gray-400 mb-1">{k}</dt>
            <dd className="text-sm text-gray-800 leading-relaxed">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-gray-400 mt-3">核验：{facts.verification}</p>
    </Section>
  );
}

/** 避雷与取舍：小红书避雷点 + 行动建议 */
export function AvoidPanel({ item, kind }: { item: Item; kind: DetailKind }) {
  const a = getXhsAssessment(item);
  const facts = getGuideFacts(item, kind);
  if (!a?.avoidNote && !facts.action) return null;
  return (
    <Section title="⚠️ 避雷与取舍">
      {a?.avoidNote && (
        <p className="text-sm text-gray-800 leading-relaxed bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
          {a.avoidNote}
        </p>
      )}
      <p className="text-sm text-gray-700 leading-relaxed">{facts.action}</p>
    </Section>
  );
}

/** 小红书口碑：结论 + 推荐/谨慎/避雷统计 + 推荐理由 */
export function XhsReviewPanel({ item }: { item: Item }) {
  const a = getXhsAssessment(item);
  const evidence = xhsEvidence[item.name] || [];
  const tone =
    a?.verdict === "推荐"
      ? "bg-green-600"
      : a?.verdict === "不推荐"
        ? "bg-red-600"
        : "bg-amber-600";
  return (
    <Section title="📱 小红书口碑">
      {a ? (
        <>
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <span
              className={`text-xs font-bold text-white rounded-full px-3 py-1 ${tone}`}
            >
              {a.verdict}
            </span>
            <span className="text-xs text-gray-400">
              核验进度 {evidence.length}/10 篇
              ·样本计数，不是平台总评分
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(
              [
                ["推荐", a.recommend, "text-green-700"],
                ["谨慎", a.caution, "text-amber-700"],
                ["避雷", a.avoid, "text-red-700"],
              ] as const
            ).map(([label, n, cls]) => (
              <div
                key={label}
                className="text-center bg-gray-50 rounded-lg py-2"
              >
                <p className={`text-xl font-bold ${cls}`}>{n}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="border-t-2 border-teal-600 bg-teal-50/60 rounded-b-lg p-3">
              <p className="text-xs font-bold text-teal-800 mb-1">
                为什么推荐
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{a.why}</p>
            </div>
            <div className="border-t-2 border-red-400 bg-red-50/60 rounded-b-lg p-3">
              <p className="text-xs font-bold text-red-800 mb-1">应该避雷</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {a.avoidNote}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm font-bold text-amber-900">
            这项还没有完成小红书严格逐帖核验
          </p>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            暂不显示推荐率、避雷率或虚构的帖子摘要。现有公开资料保留在其他详情区；严格核验完成后再补原帖与统计。
          </p>
        </div>
      )}
    </Section>
  );
}

/** 多平台评分与实读摘要（目前仅曼谷有 OTA 研究数据） */
export function OtaReviewPanel({ item }: { item: Item }) {
  const row = bangkokOta[item.name];
  if (!row) return null;
  return (
    <Section title="🌐 多平台评分与实读摘要">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <a
          href={row.tripadvisor.url}
          target="_blank"
          rel="noreferrer"
          className="block bg-gray-50 rounded-lg p-3 hover:bg-gray-100"
        >
          <p className="text-xs text-gray-500">TripAdvisor</p>
          <p className="text-lg font-bold text-teal-800">
            {row.tripadvisor.score}
          </p>
          <p className="text-xs text-gray-500">
            {row.tripadvisor.reviews} 条评价 · {row.tripadvisor.title} ↗
          </p>
        </a>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">{row.chinese.site}</p>
          <p className="text-lg font-bold text-teal-800">
            {row.chinese.score || "公开样本"}
          </p>
          <p className="text-xs text-gray-500">
            {row.chinese.reviews
              ? `${row.chinese.reviews} 条评价`
              : "评分/数量未可靠取得"}
            {row.chinese.url ? (
              <>
                {" · "}
                <a
                  href={row.chinese.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-700 underline"
                >
                  打开来源 ↗
                </a>
              </>
            ) : (
              " · 原页面登录受限或报告未提供直链"
            )}
          </p>
        </div>
        {row.google && (
          <a
            href={row.google.url}
            target="_blank"
            rel="noreferrer"
            className="block bg-gray-50 rounded-lg p-3 hover:bg-gray-100"
          >
            <p className="text-xs text-gray-500">Google Maps</p>
            <p className="text-lg font-bold text-teal-800">
              {row.google.score}
            </p>
            <p className="text-xs text-gray-500">
              {row.google.reviews} 条评价 · 打开地点 ↗
            </p>
          </a>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-teal-50/60 border border-teal-100 rounded-lg p-3">
          <p className="text-xs font-bold text-teal-800 mb-1">为什么推荐</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {row.recommend}
          </p>
        </div>
        <div className="bg-red-50/60 border border-red-100 rounded-lg p-3">
          <p className="text-xs font-bold text-red-800 mb-1">应该避雷</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {row.caution}
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        {row.chinese.note} {row.google?.note}{" "}
        评分、数量与摘要只描述这次研究取得的页面及样本，不代表全网一致意见。核验于{" "}
        {row.checked}。
      </p>
    </Section>
  );
}

/** 其他交叉核验入口 */
export function SecondarySourcesPanel({ item }: { item: Item }) {
  const rows = secondaryEvidence[item.name] || [];
  if (!rows.length) return null;
  const groups = ["Tripadvisor", "中文旅游网站", "官方与专业来源"] as const;
  return (
    <Section title="🔗 其他交叉核验入口">
      <p className="text-xs text-gray-400 mb-3">
        按来源分组，不与小红书或上方评分合并计算。
      </p>
      <div className="space-y-3">
        {groups.map((group) => {
          const links = rows.filter((x) => x.group === group);
          if (!links.length) return null;
          return (
            <div key={group}>
              <p className="text-xs font-bold text-gray-500 mb-1">
                {group} · {links.length} 条已导入
              </p>
              <div className="space-y-1.5">
                {links.map((x) => (
                  <a
                    key={x.url}
                    href={x.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm text-teal-700 hover:underline"
                  >
                    <span className="font-medium">{x.title}</span>
                    {x.note && (
                      <span className="text-gray-400"> · {x.note}</span>
                    )}{" "}
                    ↗
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/** 小红书原帖与核验记录 */
export function EvidenceLedgerPanel({ item, kind }: { item: Item; kind: GuideKind }) {
  const evidence = xhsEvidence[item.name] || [];
  const facts = getGuideFacts(item, kind);
  const pager = usePaged(evidence, 6, "条链接");
  return (
    <Section title="🧾 小红书原帖与核验记录">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs text-gray-400">{facts.verification}</p>
        <span
          className={`text-xs font-bold rounded-full px-2.5 py-1 ${
            evidence.length
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {evidence.length ? "有可追溯链接" : "待补"}
        </span>
      </div>
      {evidence.length ? (
        <>
          <div className="space-y-2">
            {pager.visible.map((link, i) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 hover:border-teal-600"
              >
                <span className="text-xs font-bold text-teal-700 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-gray-900 truncate">
                    {link.title}
                  </span>
                  <span className="block text-xs text-gray-400 mt-0.5">
                    {link.note}
                  </span>
                </span>
                <span className="ml-auto text-teal-700 shrink-0">↗</span>
              </a>
            ))}
          </div>
          {pager.toggle}
        </>
      ) : (
        <p className="text-sm text-gray-400 leading-relaxed bg-gray-50 rounded-lg p-4">
          本条尚无可追溯的小红书逐帖链接。当前只呈现已完成的公开资料交叉核对，不补写帖子标题或链接。
        </p>
      )}
    </Section>
  );
}

const CHECKLIST: Record<DetailKind, string[]> = {
  酒店: [
    "确认具体房型、景观、加床与早餐条款",
    "比较含税总价、取消政策与旺季预付要求",
    "把机场或码头接送写入预订备注",
  ],
  餐厅: [
    "确认套餐、税费、服务费与饮食限制",
    "按官方放位规则订位，不把 walk-in 个例当常态",
    "若评价两极，先看近期菜单再决定",
  ],
  景点: [
    "复核当日开放、门票、着装与临时关闭",
    "按天气准备室内替代，不把船班或户外项目排死",
    "下载离线地图，提前确认最后一段交通",
  ],
};

/** 出发前确认清单 */
export function PreTripChecklistPanel({ kind }: { kind: DetailKind }) {
  const title =
    kind === "酒店" ? "订房前确认" : kind === "餐厅" ? "订位与点单" : "出发前确认";
  return (
    <Section title={`✅ ${title}`}>
      <ul className="space-y-2">
        {CHECKLIST[kind].map((x) => (
          <li key={x} className="flex gap-2 text-sm text-gray-700">
            <span className="text-teal-700 font-bold shrink-0">·</span>
            <span>{x}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** 最佳机位（仅景点） */
export function PhotoSpotsPanel({ item }: { item: Item }) {
  const spots = getPhotoSpots(item.city, item.name);
  if (!spots?.length) return null;
  const gallery = getPlaceGallery("景点", item);
  return (
    <Section title="📸 最佳机位">
      <p className="text-xs text-gray-400 mb-3">
        每个机位都写了站在哪、面向哪；样片只用本站图库里视角对得上的照片。
      </p>
      <div className="space-y-4">
        {spots.map((s, i) => {
          const photo =
            s.sampleIndex != null ? gallery[s.sampleIndex] : undefined;
          return (
            <article
              key={i}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-white bg-teal-700 rounded-full w-6 h-6 grid place-items-center shrink-0">
                  {i + 1}
                </span>
                <h4 className="font-bold text-gray-900">{s.name}</h4>
              </div>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-bold">📍 详细位置：</span>
                {s.where}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-bold">📷 拍摄建议：</span>
                {s.how}
              </p>
              {photo ? (
                <figure>
                  <img
                    src={photo.src}
                    alt={s.sampleCaption || `${item.name} · ${s.name}样片`}
                    loading="lazy"
                    className="w-full h-44 object-cover rounded-lg"
                  />
                  <figcaption className="text-xs text-gray-400 mt-1">
                    {s.sampleCaption || "样片"} ·{" "}
                    <a
                      href={photo.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-700 underline"
                    >
                      来源：{photo.title} ↗
                    </a>
                  </figcaption>
                </figure>
              ) : (
                <p className="text-xs text-gray-400">
                  该机位暂无视角对得上的样片，图库复核后补上。
                </p>
              )}
            </article>
          );
        })}
      </div>
    </Section>
  );
}

type AvStatus =
  | "available"
  | "mixed"
  | "full"
  | "soldout"
  | "not_released"
  | "walkin"
  | "unverifiable";

const AV_LABEL: Record<AvStatus, { r: string; a: string; cls: string }> = {
  available: { r: "有位", a: "有票", cls: "bg-green-600" },
  mixed: { r: "部分日期有位", a: "部分日期有票", cls: "bg-amber-600" },
  full: { r: "已订满", a: "已订满", cls: "bg-red-600" },
  soldout: { r: "售罄", a: "售罄", cls: "bg-red-600" },
  not_released: { r: "尚未放位", a: "尚未开售", cls: "bg-gray-500" },
  walkin: { r: "现场排队", a: "随到随买", cls: "bg-blue-600" },
  unverifiable: { r: "在线查不到", a: "在线查不到", cls: "bg-gray-400" },
};

/** 按行程日期空位余票（餐厅/景点；有研究数据时才显示） */
export function AvailabilityInfoPanel({
  name,
  kind,
}: {
  name: string;
  kind: "餐厅" | "景点";
}) {
  const [row, setRow] = useState<{
    status: AvStatus;
    detail: string;
    dates: string;
    party: string;
    channel: string;
    note: string;
    checked_at: string;
  } | null>(null);
  useEffect(() => {
    if (!supabaseConfigured || !supabase) return;
    let live = true;
    supabase
      .from("sea_availability")
      .select("*")
      .eq("kind", kind === "餐厅" ? "restaurant" : "attraction")
      .eq("name", name)
      .eq("trip_ref", "dec2026")
      .maybeSingle()
      .then(({ data }) => {
        if (live && data) setRow(data as never);
      });
    return () => {
      live = false;
    };
  }, [name, kind]);
  if (!row) return null;
  const meta = AV_LABEL[row.status] || AV_LABEL.unverifiable;
  const when = row.checked_at
    ? new Date(row.checked_at).toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  return (
    <Section
      title={`🎫 按行程日期${kind === "餐厅" ? "订位空位" : "门票余量"}`}
    >
      <p className="mb-2">
        <span
          className={`inline-block text-xs font-bold text-white rounded-full px-3 py-1 ${meta.cls}`}
        >
          {kind === "餐厅" ? meta.r : meta.a}
        </span>
        <span className="text-xs text-gray-500 ml-2">
          {row.dates}
          {row.party ? ` · ${row.party}` : ""}
        </span>
      </p>
      <p className="text-sm text-gray-800 leading-relaxed">{row.detail}</p>
      {row.channel && (
        <p className="text-xs text-gray-500 mt-1">查询渠道：{row.channel}</p>
      )}
      {row.note && <p className="text-xs text-gray-500 mt-1">{row.note}</p>}
      <p className="text-xs text-gray-400 mt-2">
        查询于 {when}（北京时间）· 空位余票实时变化，以下单时为准
      </p>
    </Section>
  );
}
