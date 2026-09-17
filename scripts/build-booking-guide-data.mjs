/**
 * 预订页「待预订清单（按城市）」数据源生成器。
 *
 * 唯一事实源：~/workspace/goals/southeast-asia-20-day-travel-website/hidden_files/booking-classification.json
 * （entries 共 211 条，section_order = 全程交通/曼谷/清迈/普吉/槟城/吉隆坡/胡志明市/富国岛/新加坡）。
 *
 * 运行：node scripts/build-booking-guide-data.mjs
 * 输出：client/src/bookings/bookingGuideData.ts（程序生成，不要手改）
 *
 * 规则：
 * - URL 只原样搬运 JSON 里的值，绝不编造；official_url 非 http 开头（如"未核实…"）时按原文显示，不当链接。
 * - 已知行程冲突在对应条目处生成 warning 展示（数据源自 JSON 的 tips/children，脚本只把它拎到显眼位置）。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(HERE);
const SRC = "/home/hatch/workspace/goals/southeast-asia-20-day-travel-website/hidden_files/booking-classification.json";
const OUT = join(REPO, "client", "src", "bookings", "bookingGuideData.ts");

const raw = JSON.parse(readFileSync(SRC, "utf-8"));
const entries = raw.entries;
const sectionOrder = raw.section_order;
const categoryLabels = raw.categories;

/** 已知行程冲突：条目 key -> 显眼警告文案（事实均来自 JSON 内的 tips/children 字段） */
const WARNINGS = {
  "singapore-08":
    "行程冲突：Odette 仅接待 9 岁以上儿童——2 岁半孩子不能同行！如带孩子去新加坡，此餐需另作安排（或只安排 1 位家长前往）。",
  "singapore-09":
    "行程冲突：Labyrinth 仅接待 8 岁以上且吃完整菜单的儿童——2 岁半孩子不能同行！此餐需另作安排（完整体验约 3 小时）。",
  "chiangmai-14":
    "行程冲突：周日步行街仅周日开放；本次清迈段为 12-15/16（周二/三），12-20（周日）行程在槟城——对不上。想逛可考虑周六夜市或调整行程。",
};

const URL_IN_TEXT = /(https?:\/\/[^\s）);，"'\]]+)/g;

function normalizeEvidence(ev) {
  if (!ev || !ev.length) return [];
  const out = [];
  for (const it of ev) {
    if (typeof it === "string") {
      const urls = [...it.matchAll(URL_IN_TEXT)].map((m) => m[1]);
      out.push({ page: "", url: urls[0] || "", note: it });
    } else if (it && typeof it === "object") {
      out.push({ page: it.page || "", url: it.url || "", note: it.note || "" });
    }
  }
  return out;
}

const ts = (v) => JSON.stringify(v ?? "", null, 0);

function entryTs(x) {
  const ev = normalizeEvidence(x.evidence)
    .map((e) => `{page:${ts(e.page)},url:${ts(e.url)},note:${ts(e.note)}}`)
    .join(",");
  const warning = WARNINGS[x.key] ? ts(WARNINGS[x.key]) : "undefined";
  return `{
    key:${ts(x.key)},name:${ts(x.name)},type:${ts(x.type)},category:${ts(x.category)},
    categoryReason:${ts(x.category_reason)},itinerary:${ts(x.itinerary)},party:${ts(x.party)},
    leadTime:${ts(x.lead_time)},price:${ts(x.price)},officialUrl:${ts(x.official_url)},
    mapsUrl:${ts(x.maps_url)},cancellation:${ts(x.cancellation)},whyEarly:${ts(x.why_early)},
    suitability:${ts(x.suitability)},dressCode:${ts(x.dress_code)},children:${ts(x.children)},
    tips:${ts(x.tips)},warning:${warning},detailStatus:${ts(x.detail_status)},
    evidence:[${ev}],
  }`;
}

const sections = sectionOrder.map((cityZh) => {
  const items = entries.filter((e) => e.city_zh === cityZh);
  const city = items[0] ? items[0].city : "";
  const cats = [...new Set(items.map((e) => e.category))];
  const groups = cats
    .map((c) => ({
      category: c,
      entries: items.filter((e) => e.category === c),
    }))
    .filter((g) => g.entries.length);
  return { city, cityZh, count: items.length, groups };
});

const groupTs = (g) =>
  `{category:${ts(g.category)},entries:[${g.entries.map(entryTs).join(",")}]}`;

const file = `/**
 * 预订页「待预订清单（按城市）」数据。
 *
 * 程序生成（node scripts/build-booking-guide-data.mjs），不要手改。
 * 事实源：goals/southeast-asia-20-day-travel-website/hidden_files/booking-classification.json
 * 数据更新于：${raw.updated_at}
 */

export interface BookingGuideEvidence { page: string; url: string; note: string }

export interface BookingGuideEntry {
  key: string;
  name: string;
  type: string;
  category: string;
  categoryReason: string;
  itinerary: string;
  party: string;
  leadTime: string;
  price: string;
  officialUrl: string;
  mapsUrl: string;
  cancellation: string;
  whyEarly: string;
  suitability: string;
  dressCode: string;
  children: string;
  tips: string;
  warning?: string;
  detailStatus: string;
  evidence: BookingGuideEvidence[];
}

export interface BookingGuideGroup { category: string; entries: BookingGuideEntry[] }

export interface BookingGuideSection {
  city: string;
  cityZh: string;
  count: number;
  groups: BookingGuideGroup[];
}

/** 数据源更新时间（来自 booking-classification.json） */
export const BOOKING_GUIDE_UPDATED_AT = ${ts(raw.updated_at)};

/** 数据源说明 */
export const BOOKING_GUIDE_SOURCE_NOTE = ${ts(
  "预订需求分类数据基础：195 项研究全覆盖 + 行程补充服务（全程交通/酒店/接送等）。must_book / peak_recommended 的 price / official_url / cancellation 经 2026-09-17 联网核实后回填；未核实的一律显示为「未核实」，不编造。",
)};

/** 构建时刻（每次构建重新生成，页面顶部显示） */
declare const __BOOKING_PAGE_BUILD_TIME__: string;
export const BOOKING_PAGE_BUILD_TIME: string =
  typeof __BOOKING_PAGE_BUILD_TIME__ !== "undefined" ? __BOOKING_PAGE_BUILD_TIME__ : "本地开发模式";

export const BOOKING_GUIDE_CATEGORY_LABELS: Record<string, string> = ${JSON.stringify(
  categoryLabels,
  null,
  2,
)};

export const BOOKING_GUIDE_TOTAL = ${entries.length};

export const BOOKING_GUIDE_SECTIONS: BookingGuideSection[] = [
${sections
  .map(
    (s) =>
      `  {city:${ts(s.city)},cityZh:${ts(s.cityZh)},count:${s.count},groups:[${s.groups
        .map(groupTs)
        .join(",")}]},`,
  )
  .join("\n")}
];
`;

writeFileSync(OUT, file, "utf-8");
console.log(
  `wrote ${OUT}: ${entries.length} entries, ${sections.length} sections, warnings on ${Object.keys(WARNINGS).length} keys`,
);
