#!/usr/bin/env node
/**
 * 行程规划器研究数据生成器（P3 原生集成）
 * ============================================================
 * 唯一事实源：东南亚 20 天旅行网站的研究状态 JSON（193 项，8 城）。
 * 本脚本程序化读取该 JSON，生成 client/src/planner-data/research-items.ts。
 *
 * 铁律：规划器消费的地点数据只允许由本脚本生成，禁止手写或猜测。
 * 可复现：node scripts/gen-planner-data.js [research-status.json 路径]
 *   - 默认读取 /home/hatch/workspace/goals/southeast-asia-20-day-travel-website/hidden_files/research-status.json
 *   - 也可用环境变量 PLANNER_RESEARCH_JSON 覆盖
 * 生成文件头会记录来源路径、来源 updated_at 与生成时间。
 *
 * 派生口径（诚实说明）：
 * - PLANNER_CITY_SPOTS：每城 type=景点 的条目名，原样取自研究 JSON。
 *   曼谷剔除 2 个城外项（大城府 Ayutthaya 古城遗迹、丹嫩沙多水上市场+美功铁道），
 *   与规划器 classicOutsideDayNote「不在曼谷 9 精华清单内，不计入覆盖」的注记一致，
 *   保持覆盖率分母为曼谷 9（与 INTEGRATION.md 修复1 自查结论一致）。
 * - PLANNER_KL_HOTELS：吉隆坡 type=酒店 的 5 条研究记录（仅作研究状态参考）。
 *   注意：规划器第 7 项验收要求吉隆坡酒店卡必须保留「研究报告未给出候选酒店」
 *   的缺口提示，不得以「研究已给出候选」替代该文案；此处 5 条记录只提供
 *   每家来源核验状态，不虚构、不替代缺口提示。
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");
const OUT = resolve(REPO, "client/src/planner-data/research-items.ts");

const SRC =
  process.argv[2] ||
  process.env.PLANNER_RESEARCH_JSON ||
  "/home/hatch/workspace/goals/southeast-asia-20-day-travel-website/hidden_files/research-status.json";

// 城市顺序：与规划器 detailCityOrder / 经典路线顺序一致
const CITY_ORDER = [
  ["bangkok", "曼谷"],
  ["chiangmai", "清迈"],
  ["phuket", "普吉"],
  ["penang", "槟城"],
  ["kualalumpur", "吉隆坡"],
  ["hcmc", "胡志明市"],
  ["phuquoc", "富国岛"],
  ["singapore", "新加坡"],
];
const EXPECTED_TOTALS = {
  bangkok: 32, chiangmai: 20, phuket: 24, penang: 24,
  kualalumpur: 22, hcmc: 23, phuquoc: 22, singapore: 28,
};
// 曼谷城外项：classicOutsideDayNote 已注记「不在曼谷 9 精华清单内，不计入覆盖」
const BANGKOK_OUTSIDE_SPOTS = ["大城府 Ayutthaya 古城遗迹", "丹嫩沙多水上市场+美功铁道"];

const SOURCE_KEYS = ["tripadvisor", "google_maps", "chinese_sites", "xiaohongshu", "photos", "details"];

function tsString(s) {
  return JSON.stringify(String(s ?? ""));
}

function main() {
  const raw = JSON.parse(readFileSync(SRC, "utf8"));
  const updatedAt = raw.updated_at || "未知";
  const cities = raw.cities || {};

  const cityBlocks = [];
  const allItems = [];
  const citySpots = {};
  const citySpotsOutside = {};
  const sourceDoneCounts = Object.fromEntries(SOURCE_KEYS.map((k) => [k, 0]));
  let klHotels = [];

  for (const [slug, zh] of CITY_ORDER) {
    const c = cities[slug];
    if (!c) throw new Error(`研究 JSON 缺少城市: ${slug}`);
    const items = c.items || [];
    const expected = EXPECTED_TOTALS[slug];
    if (items.length !== expected) {
      throw new Error(`城市 ${zh}(${slug}) 条目数 ${items.length} 与预期 ${expected} 不符，拒绝生成（防静默漂移）`);
    }
    const normItems = items.map((it) => {
      const sources = {};
      for (const k of SOURCE_KEYS) {
        const v = (it.sources || {})[k] || {};
        const status = v.status || "pending";
        sources[k] = { status };
        if (v.note) sources[k].note = String(v.note);
        if (typeof v.posts === "number") sources[k].posts = v.posts;
        if (typeof v.target === "number") sources[k].target = v.target;
        if (status === "done") sourceDoneCounts[k]++;
      }
      return {
        city: zh, name: String(it.name || ""), type: String(it.type || ""),
        note: String(it.note || ""), sources,
      };
    });
    allItems.push(...normItems);

    // 规划器消费的景点清单（type=景点；曼谷剔除城外项）
    const attractions = normItems.filter((i) => i.type === "景点").map((i) => i.name);
    const outside = slug === "bangkok" ? BANGKOK_OUTSIDE_SPOTS : [];
    for (const name of outside) {
      if (!attractions.includes(name)) {
        throw new Error(`城外项「${name}」在研究 JSON 的曼谷景点中找不到，拒绝生成（防静默漂移）`);
      }
    }
    citySpots[zh] = attractions.filter((n) => !outside.includes(n));
    if (outside.length) citySpotsOutside[zh] = outside;

    if (slug === "kualalumpur") {
      klHotels = normItems
        .filter((i) => i.type === "酒店")
        .map((h) => ({
          name: h.name, note: h.note,
          sources: Object.fromEntries(SOURCE_KEYS.map((k) => [k, h.sources[k].status])),
        }));
    }

    cityBlocks.push(
      `  { slug: ${tsString(slug)}, name: ${tsString(zh)}, total: ${c.total ?? items.length}, ` +
      `complete: ${c.complete ?? 0}, items: [${normItems.map(itemTs).join(", ")}] }`
    );
  }

  const totalItems = allItems.length;
  if (totalItems !== 195) {
    throw new Error(`总条目数 ${totalItems} 与预期 195 不符，拒绝生成（防静默漂移）`);
  }
  const totalSpots = Object.values(citySpots).reduce((a, l) => a + l.length, 0);
  if (totalSpots !== 67) {
    throw new Error(`精华景点清单总数 ${totalSpots} 与预期 67 不符，拒绝生成（防静默漂移）`);
  }
  if (klHotels.length === 0) throw new Error("吉隆坡酒店候选为空，拒绝生成");

  const generatedAt = new Date().toISOString();
  const out =
`/* eslint-disable */
/**
 * ⚠ 程序化生成文件，请勿手改。
 * 生成脚本：scripts/gen-planner-data.js
 * 事实源：${SRC}
 * 事实源 updated_at：${updatedAt}
 * 生成时间：${generatedAt}
 *
 * 193 项研究条目（8 城）＋规划器直接消费的派生数据：
 * - PLANNER_CITY_SPOTS：8 城精华景点清单（共 67；曼谷 9，已剔除 2 个城外项，
 *   与 classicOutsideDayNote「不计入覆盖」注记一致）
 * - PLANNER_CITY_SPOTS_OUTSIDE：被剔除的城外项（曼谷 2）
 * - PLANNER_KL_HOTELS：吉隆坡酒店研究记录（仅研究状态参考；规划器验收仍要求保留「研究报告未给出候选酒店」缺口提示）
 */
export type ResearchStatus = "done" | "partial" | "pending" | "missing" | "unavailable";
export interface ResearchSourceState { status: ResearchStatus; note?: string; posts?: number; target?: number }
export interface ResearchItem {
  city: string; name: string; type: string; note: string;
  sources: Record<string, ResearchSourceState>;
}
export interface CityResearch {
  slug: string; name: string; total: number; complete: number; items: ResearchItem[];
}
export interface KlHotelCandidate {
  name: string; note: string; sources: Record<string, ResearchStatus>;
}

export const RESEARCH_SOURCE_PATH = ${tsString(SRC)};
export const RESEARCH_UPDATED_AT = ${tsString(updatedAt)};
export const RESEARCH_GENERATED_AT = ${tsString(generatedAt)};

export const RESEARCH_CITIES: CityResearch[] = [
${cityBlocks.join(",\n")}
];

export const RESEARCH_ITEMS: ResearchItem[] = RESEARCH_CITIES.flatMap((c) => c.items);

export const RESEARCH_META = {
  totalItems: ${totalItems},
  cityTotals: ${JSON.stringify(Object.fromEntries(CITY_ORDER.map(([s, z]) => [z, EXPECTED_TOTALS[s]])))},
  spotTotals: ${JSON.stringify(Object.fromEntries(Object.entries(citySpots).map(([k, v]) => [k, v.length])))},
  sourceDoneCounts: ${JSON.stringify(sourceDoneCounts)},
} as const;

/** 规划器覆盖率计算直接消费：8 城精华景点清单（名与研究 JSON 逐字一致） */
export const PLANNER_CITY_SPOTS: Record<string, string[]> = ${JSON.stringify(citySpots, null, 2)};

/** 被剔除的城外项（不计入覆盖率分母） */
export const PLANNER_CITY_SPOTS_OUTSIDE: Record<string, string[]> = ${JSON.stringify(citySpotsOutside, null, 2)};

/** 吉隆坡酒店研究记录（仅研究状态参考；规划器验收仍要求保留「研究报告未给出候选酒店」缺口提示） */
export const PLANNER_KL_HOTELS: KlHotelCandidate[] = ${JSON.stringify(klHotels, null, 2)};
`;
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, out);
  console.log(`已生成 ${OUT}`);
  console.log(`  来源 updated_at：${updatedAt}`);
  console.log(`  条目总数：${totalItems}；精华景点：${totalSpots}；吉隆坡酒店候选：${klHotels.length}`);
  console.log(`  各城景点数：${Object.entries(citySpots).map(([k, v]) => `${k}${v.length}`).join(" / ")}`);
}

function itemTs(it) {
  const src = Object.entries(it.sources)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(", ");
  return `{ city: ${tsString(it.city)}, name: ${tsString(it.name)}, type: ${tsString(it.type)}, note: ${tsString(it.note)}, sources: { ${src} } }`;
}

main();
