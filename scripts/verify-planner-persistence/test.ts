/**
 * 规划器持久化链路的代码级验证（跑真实业务模块，不跑浏览器）：
 * 1. planToItinerary：规划 JSON -> 全站 Day 数组（城市/天数/日期/星期/城市段）
 * 2. detailDayForPlanDay：改序后每日详情按“城市内第 N 天”映射
 * 3. 本地缓存回退：cachePlannerPlanLocally -> readPlannerCache（模拟刷新）
 *
 * 用法：
 *   node --import /tmp/verify/loader.mjs /tmp/verify/test.ts save   # 写缓存到 /tmp/verify/ls.json（模拟保存）
 *   node --import /tmp/verify/loader.mjs /tmp/verify/test.ts load   # 从缓存读（模拟刷新后加载）
 *   node --import /tmp/verify/loader.mjs /tmp/verify/test.ts pure   # 纯函数验证
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import {
  planToItinerary,
  detailDayForPlanDay,
  cachePlannerPlanLocally,
  readPlannerCache,
  type PlannerPlan,
} from "@/guide/plannerSchedule";
import { days as detailDays } from "@/guide/data";

const LS_FILE = "/tmp/verify/ls.json";

// 用文件模拟 localStorage，跨进程持久 = 模拟浏览器刷新
function installFakeLocalStorage() {
  const store = new Map(
    existsSync(LS_FILE)
      ? Object.entries(JSON.parse(readFileSync(LS_FILE, "utf8")))
      : []
  );
  (globalThis as any).localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, v);
      writeFileSync(LS_FILE, JSON.stringify(Object.fromEntries(store)));
    },
    removeItem: (k: string) => store.delete(k),
  };
}

let failures = 0;
function check(name: string, cond: boolean, extra?: unknown) {
  if (cond) {
    console.log(`  ✓ ${name}`);
  } else {
    failures++;
    console.log(`  ✗ ${name}${extra !== undefined ? " -> " + JSON.stringify(extra) : ""}`);
  }
}

// 构造一份“规划器保存”的 20 天经典规划（等价于 serializePlan 输出）
function classicPlan(): PlannerPlan {
  const cities: [string, number][] = [
    ["曼谷", 3], ["清迈", 2], ["普吉", 3], ["槟城", 2],
    ["吉隆坡", 2], ["胡志明市", 2], ["富国岛", 3], ["新加坡", 3],
  ];
  const schedule: Record<string, { city: string; mode: string }> = {};
  let d = new Date(2026, 11, 12);
  for (const [city, n] of cities) {
    for (let i = 0; i < n; i++) {
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      schedule[iso] = { city, mode: city === "新加坡" ? "亲子慢节奏" : "单独两人" };
      d = new Date(d.getTime() + 86400000);
    }
  }
  return {
    version: 1,
    selected: ["TH", "MY", "VN", "SG"],
    coupleDays: 17,
    remainingMode: "family",
    pace: "intense",
    start: "2026-12-12",
    schedule,
    wz: {
      cities: cities.map(([c]) => c),
      days: Object.fromEntries(cities),
      order: cities.map(([c]) => c),
      start: "2026-12-12",
      modes: { "新加坡": "family" },
    },
    hotelSelections: {},
    flightSelections: {},
  };
}

function swappedPlan(): PlannerPlan {
  // 清迈 <-> 普吉 对调（Day 4-5 变普吉，Day 6-8 变清迈）
  const p = classicPlan();
  const cities: [string, number][] = [
    ["曼谷", 3], ["普吉", 2], ["清迈", 3], ["槟城", 2],
    ["吉隆坡", 2], ["胡志明市", 2], ["富国岛", 3], ["新加坡", 3],
  ];
  const schedule: Record<string, { city: string; mode: string }> = {};
  let d = new Date(2026, 11, 12);
  for (const [city, n] of cities) {
    for (let i = 0; i < n; i++) {
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      schedule[iso] = { city, mode: "单独两人" };
      d = new Date(d.getTime() + 86400000);
    }
  }
  p.schedule = schedule;
  return p;
}

async function main() {
  const mode = process.argv[2] || "pure";
  installFakeLocalStorage();

  if (mode === "pure" || mode === "all") {
    console.log("== planToItinerary（规划 JSON -> 全站行程）");
    const it = planToItinerary(classicPlan())!;
    check("20 天", it.totalDays === 20, it.totalDays);
    check("source=cloud", it.source === "cloud");
    check("Day1 曼谷 12-12 周六", it.days[0].day === 1 && it.days[0].city_zh === "曼谷" && it.days[0].date === "12-12" && it.days[0].weekday === "周六" && it.days[0].city_id === "bangkok", it.days[0]);
    check("Day9 槟城 12-20 周日", it.days[8].city_zh === "槟城" && it.days[8].date === "12-20" && it.days[8].weekday === "周日", it.days[8]);
    check("Day20 新加坡 12-31 周四", it.days[19].city_zh === "新加坡" && it.days[19].date === "12-31" && it.days[19].weekday === "周四", it.days[19]);
    check("8 个城市段", it.cityStops.length === 8, it.cityStops.length);
    check("曼谷段 Day1-3 / 12-12 ~ 12-14", it.cityStops[0].days[0] === 1 && it.cityStops[0].days[1] === 3 && it.cityStops[0].dates === "12-12 ~ 12-14", it.cityStops[0]);
    check("富国岛段 Day15-17", it.cityStops[6].days[0] === 15 && it.cityStops[6].days[1] === 17 && it.cityStops[6].id === "phuquoc", it.cityStops[6]);
    check("dateRangeLong", it.dateRangeLong === "2026-12-12 ～ 2026-12-31", it.dateRangeLong);
    check("空 schedule 返回 null（静态回退）", planToItinerary({ ...classicPlan(), schedule: {} }) === null);

    console.log("== detailDayForPlanDay（改序后详情映射）");
    const sw = planToItinerary(swappedPlan())!;
    const r6 = detailDayForPlanDay(sw.days, 6, detailDays);
    check("Day6 改为清迈 -> shifted", r6.shifted === true && r6.detail?.city === "清迈", { shifted: r6.shifted, city: r6.detail?.city });
    check("Day6 取清迈第 1 天攻略（原 Day4）", r6.ordinalInCity === 1 && r6.detail?.day === 4, { ordinal: r6.ordinalInCity, day: r6.detail?.day });
    const r4 = detailDayForPlanDay(sw.days, 4, detailDays);
    check("Day4 改为普吉 -> 取普吉第 1 天攻略（原 Day6）", r4.shifted === true && r4.detail?.day === 6, { day: r4.detail?.day });
    const r1 = detailDayForPlanDay(sw.days, 1, detailDays);
    check("Day1 城市未变 -> 不 shifted", r1.shifted === false && r1.detail?.day === 1);
    const rStatic = detailDayForPlanDay(null, 9, detailDays);
    check("无云端规划 -> 原版 Day9", rStatic.shifted === false && rStatic.detail?.day === 9);
  }

  if (mode === "save" || mode === "all") {
    console.log("== 保存（写本地缓存，模拟点「保存到云端」前的缓存写入）");
    const loaded = cachePlannerPlanLocally(classicPlan(), "测试账号");
    check("缓存写入成功", loaded.plan.schedule["2026-12-12"]?.city === "曼谷");
    console.log(`   缓存文件: ${LS_FILE}`);
  }

  if (mode === "load" || mode === "all") {
    console.log("== 刷新后加载（读缓存，模拟 planner 初始化）");
    const loaded = readPlannerCache();
    check("读到缓存", !!loaded, loaded);
    if (loaded) {
      const it = planToItinerary(loaded.plan)!;
      check("刷新后规划不丢：20 天", it.totalDays === 20);
      check("刷新后 Day1 仍是曼谷", it.days[0].city_zh === "曼谷");
      check("缓存署名保留", loaded.updatedByName === "测试账号", loaded.updatedByName);
      check("source=cache（云端失败回退）", loaded.source === "cache");
    }
  }

  if (failures) {
    console.log(`\n${failures} 项失败`);
    process.exit(1);
  }
  console.log("\n全部通过");
}

main();
