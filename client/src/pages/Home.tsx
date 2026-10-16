import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ItineraryDayCard,
  detailForPlanDay,
  buildDayByDate,
  cityStayRanges,
  parseFavoriteRow,
  toISODate,
  type DayBooking,
  type ParsedFavorite,
} from "@/components/ItineraryDayCard";
import { applyCloudDayOverride } from "@/guide/cloudDayOverrides";
import { useRecordsData } from "@/pages/records/shared";
import { usePlanItinerary, KOREA_CITY_ZH, SEA_CITY_ZH, type PlanDay } from "@/guide/plannerSchedule";
import { parseBookingBody } from "@/bookings/bookingTypes";
import StickyMapBar, { stickyItemKey, type StickyMapItem } from "@/components/StickyMapBar";
import type { DayStopSelection } from "@/components/ItineraryDayCard";
import { findStopCoord } from "@/data/stopCoords";

type Day = PlanDay;

/** 行程页滚动位置的 session 级存取键（东南亚/韩国两个页面各用各的） */
const SEA_SCROLL_KEY = "sea-home-scroll-y-v1";
const KOREA_SCROLL_KEY = "sea-korea-scroll-y-v1";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 pb-8">
      <ItineraryTab koreaOnly={false} />
    </div>
  );
}

function shortDate(d: string): string {
  let m = d.match(/(\d+)月(\d+)日/);
  if (m) return `${m[1]}/${m[2]}`;
  m = d.match(/\d{4}-(\d+)-(\d+)/);
  if (m) return `${Number(m[1])}/${Number(m[2])}`;
  return d;
}

/** 收藏的景点 → 行程排入检查 + 排入某天（2026-10-16 改版）：
 * 此前没排入的只写「建议手动加入某天」，但全站没有这个功能，是断头路。
 * 现在每项可以直接选本城的一天排入：指定日期存进收藏记录 body.assignDate（云端同步），
 * 那天的行程卡会出现「⭐ 我排入这一天的必去景点」，本地图有坐标时同步进当天路线。 */
function FavoriteItineraryCheck({
  cityScheduled,
  dayOptions,
}: {
  cityScheduled: Map<string, Set<string>>;
  /** 本页显示的天（可选排入目标）：day=天号，iso=ISO 日期，city_zh=城市，label=展示文案 */
  dayOptions: { day: number; iso: string; city_zh: string; label: string }[];
}) {
  const { rows, save } = useRecordsData(["favorite"]);
  const [pick, setPick] = useState<Record<string, string>>({});
  const favs = rows
    .map((r) => {
      let body: Record<string, unknown> = {};
      try {
        body = JSON.parse(r.body || "{}") as Record<string, unknown>;
      } catch {
        body = {};
      }
      return {
        id: r.id,
        kind: r.kind,
        rowDay: r.day,
        done: r.done,
        bodyRaw: body,
        name: r.title,
        city: (body.city as string) ?? "",
        type: (body.type as string) ?? "attraction",
        assignDate: typeof body.assignDate === "string" ? body.assignDate : undefined,
      };
    })
    .filter((f) => f.type === "attraction");

  if (!favs.length) return null;

  // 检查每个收藏的景点是否在对应城市的行程中（模糊匹配：名称包含或被包含）
  const checkScheduled = (name: string, city: string) => {
    const scheduled = cityScheduled.get(city);
    if (!scheduled) return false;
    const n = name.toLowerCase();
    for (const s of scheduled) {
      const sl = s.toLowerCase();
      if (sl.includes(n) || n.includes(sl)) return true;
    }
    return false;
  };

  const assignedDayOf = (f: (typeof favs)[number]) =>
    f.assignDate ? dayOptions.find((d) => d.iso === f.assignDate) : undefined;
  const isOk = (f: (typeof favs)[number]) =>
    checkScheduled(f.name, f.city) || !!assignedDayOf(f);
  const unscheduled = favs.filter((f) => !isOk(f));

  const doAssign = (f: (typeof favs)[number], iso: string | null) => {
    const body = { ...f.bodyRaw };
    if (iso) body.assignDate = iso;
    else delete body.assignDate;
    save.mutate({
      id: f.id, kind: f.kind, title: f.name,
      body: JSON.stringify(body), day: f.rowDay, done: f.done,
    });
  };

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-6">
      <h3 className="font-bold text-gray-900 mb-1">⭐ 我的必去景点</h3>
      <p className="text-xs text-gray-500 mb-3">
        在景点页收藏的必去项，系统会检查是否已排入行程；没排入的可以在这里直接选一天排进去
      </p>
      <div className="space-y-2">
        {favs.map((f) => {
          const ok = isOk(f);
          const ad = assignedDayOf(f);
          const cityDays = dayOptions.filter((d) => d.city_zh === f.city);
          const chosen = pick[f.name] ?? cityDays[0]?.iso ?? "";
          return (
            <div key={f.name} className="flex items-center gap-2 text-sm flex-wrap">
              <span>{ok ? "✅" : "⚠️"}</span>
              <span className="font-medium text-gray-900">{f.name}</span>
              <span className="text-xs text-gray-400">{f.city}</span>
              {ad ? (
                <>
                  <span className="text-xs text-violet-700 font-medium">
                    已由我排入 {ad.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => doAssign(f, null)}
                    className="text-xs px-2 py-1 rounded-lg bg-white border border-violet-200 text-gray-500 hover:text-red-600"
                  >
                    取消排入
                  </button>
                </>
              ) : ok ? (
                <span className="text-xs text-gray-500">已排入行程</span>
              ) : (
                <>
                  <span className="text-xs text-gray-500">未排入行程</span>
                  {cityDays.length > 0 && (
                    <>
                      <select
                        value={chosen}
                        onChange={(e) => setPick((p) => ({ ...p, [f.name]: e.target.value }))}
                        className="text-xs px-2 py-1.5 rounded-lg border border-violet-300 bg-white text-gray-700"
                        aria-label={`给${f.name}选择排入哪一天`}
                      >
                        {cityDays.map((d) => (
                          <option key={d.iso} value={d.iso}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={!chosen || save.isPending}
                        onClick={() => chosen && doAssign(f, chosen)}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-violet-700 text-white font-medium disabled:opacity-50"
                      >
                        排入这一天
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      {unscheduled.length > 0 && (
        <p className="text-xs text-amber-700 mt-3">
          还有 {unscheduled.length}{" "}
          个收藏未排入：{unscheduled.map((f) => f.name).join("、")}。在上面选好日期点「排入这一天」，就会出现在那天的行程卡里。
        </p>
      )}
    </div>
  );
}

export function ItineraryTab({
  koreaOnly = false,
  renderDayExtra,
}: {
  koreaOnly?: boolean;
  // 某天卡片后追加的额外内容（2026-10-12 用户：韩国页水原一日游要"容在行程里"，
  // 不再页顶单独写；SEA 页不传，保持原样）
  renderDayExtra?: (day: Day, index: number) => ReactNode;
}) {
  const plan = usePlanItinerary();
  // 顶部导航拆成"东南亚行程"/"韩国行程"两个页面：
  // 东南亚行程只显示 SEA_CITY_ZH（新加坡/普吉/清迈/曼谷），北京/西安不混入；
  // 韩国行程只显示 KOREA_CITY_ZH（首尔）。
  // 天编号（D1、D2…）保持原行程不变，预订/笔记按天关联不受影响。
  const allDays: Day[] = plan.days;
  const days: Day[] = koreaOnly
    ? allDays.filter((d) => KOREA_CITY_ZH.has(d.city_zh))
    : allDays.filter((d) => SEA_CITY_ZH.has(d.city_zh));
  const scrollKey = koreaOnly ? KOREA_SCROLL_KEY : SEA_SCROLL_KEY;
  /* 收藏景点「排入某天」的目标天（本页显示的天）与已排入映射（ISO 日期 → 天号在下方 dayByDate 里查） */
  const dayOptions = days
    .map((d) => {
      const iso = toISODate(d.date);
      return iso ? { day: d.day, iso, city_zh: d.city_zh, label: `D${d.day} · ${shortDate(d.date)} ${d.city_zh}` } : null;
    })
    .filter((x): x is { day: number; iso: string; city_zh: string; label: string } => !!x);
  // 从详情页返回时恢复离开时的滚动位置，不再跳回页面顶部。
  // 位置在卸载时写入 sessionStorage，恢复后立即清除，避免刷新页面时误恢复。
  useLayoutEffect(() => {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(scrollKey);
      sessionStorage.removeItem(scrollKey);
    } catch {
      /* 忽略存储异常 */
    }
    const y = saved ? parseInt(saved, 10) : 0;
    if (y > 0) window.scrollTo(0, y);
    return () => {
      try {
        sessionStorage.setItem(scrollKey, String(window.scrollY));
      } catch {
        /* 忽略存储异常 */
      }
    };
  }, [scrollKey]);
  const dateNavRef = useRef<HTMLDivElement>(null);
  // 2026-10-04 用户：点选模式（废弃滚动联动）——点哪天卡片，顶栏地图就显示那一天的路线，被点的跳动高亮
  const [mapSel, setMapSel] = useState<DayStopSelection | null>(null);
  // 点卡片时自动展开地图的信号
  const [mapExpandSig, setMapExpandSig] = useState(0);
  // 折叠态初始高度按标题行估算，ResizeObserver 会校准精确值
  const [mapBarH, setMapBarH] = useState(48);
  const handleCardSelect = (sel: DayStopSelection | null) => {
    setMapSel(sel);
    if (sel) setMapExpandSig((x) => x + 1);
  };
  const selectedKey = mapSel ? stickyItemKey(mapSel.kind, mapSel.city, mapSel.name) : null;
  // 日期导航紧贴 header 底部：动态测量 header 高度，避免硬编码 top 值与实际高度不一致留下空白条
  // 2026-10-03：吸顶地图条在日期导航之上，日期导航 top = header 高 + 地图条高
  useLayoutEffect(() => {
    const nav = dateNavRef.current;
    if (!nav) return;
    const sync = () => {
      const header = document.querySelector("header.sticky");
      const hh = header ? Math.round(header.getBoundingClientRect().height) : 0;
      nav.style.top = `${hh + mapBarH}px`;
    };
    sync();
    const ro = new ResizeObserver(sync);
    const header = document.querySelector("header.sticky");
    if (header) ro.observe(header);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [mapBarH]);
  const { rows } = useRecordsData(["booking"]);
  const { rows: favRows } = useRecordsData(["favorite"]);
  // 2026-10-03：预订没填天号时按日期自动挂天（不再丢弃）；收藏按城市进每天卡片
  const dayByDate = useMemo(() => buildDayByDate(allDays), [allDays]);
  const stays = useMemo(() => cityStayRanges(allDays), [allDays]);
  const favorites: ParsedFavorite[] = useMemo(
    () =>
      favRows
        .map((r) => parseFavoriteRow({ title: r.title, body: r.body || "" }))
        .filter((f) => ["hotel", "restaurant", "flight"].includes(f.type)),
    [favRows]
  );
  // 每城第几天（用于匹配静态内容：首日=抵达内容，末日=离境内容）
  const idxInCity = new Map<number, number>();
  const cityCounts = new Map<string, number>();
  days.forEach((d) => cityCounts.set(d.city_zh, (cityCounts.get(d.city_zh) || 0) + 1));
  const seen = new Map<string, number>();
  days.forEach((d) => {
    idxInCity.set(d.day, seen.get(d.city_zh) || 0);
    seen.set(d.city_zh, (seen.get(d.city_zh) || 0) + 1);
  });
  const bookingsByDay = new Map<number, DayBooking[]>();
  rows.forEach((r) => {
    // 2026-10-03：day 没手填时按预订日期自动推导天号；手填的优先
    let dayNum: number | null = r.day;
    if (dayNum == null) {
      try {
        const bd = parseBookingBody(r.body || "");
        const iso = bd.date ? toISODate(bd.date) : null;
        dayNum = iso ? dayByDate.get(iso) ?? null : null;
      } catch {
        dayNum = null;
      }
    }
    if (dayNum == null) return;
    const list = bookingsByDay.get(dayNum) || [];
    list.push({ day: dayNum, title: r.title, body: r.body || "", done: !!r.done });
    bookingsByDay.set(dayNum, list);
  });
  // 我排入的必去景点：收藏景点带 assignDate 的，按日期挂到对应天（assignedAttractions 传给当天卡片）
  const assignedByDay = new Map<number, string[]>();
  favRows.forEach((r) => {
    const f = parseFavoriteRow({ title: r.title, body: r.body || "" });
    if (f.type !== "attraction" || !f.assignDate) return;
    const dn = dayByDate.get(f.assignDate);
    if (dn == null) return;
    const list = assignedByDay.get(dn) ?? [];
    list.push(f.name);
    assignedByDay.set(dn, list);
  });
  // 每天的静态内容（首日=抵达，末日=离境，中间=弹性池；云端13天再叠加逐日修正）
  const isCloud = plan.source === "cloud";
  const details = days.map((d) => {
    const ordinal = idxInCity.get(d.day) || 0;
    const total = cityCounts.get(d.city_zh) || 1;
    const base = detailForPlanDay(d, ordinal, total);
    // 2026-10-03：按城市+城内序号修正，不依赖绝对天号
    return isCloud ? applyCloudDayOverride(d.city_zh, ordinal, total, base) : base;
  });
  // 每城全部已排站点名（用于算“本城备选”：整个城市段都没排进去的景点）
  const cityScheduled = new Map<string, Set<string>>();
  days.forEach((d, i) => {
    const det = details[i];
    if (!det) return;
    let s = cityScheduled.get(d.city_zh);
    if (!s) {
      s = new Set<string>();
      cityScheduled.set(d.city_zh, s);
    }
    det.stops.forEach((st) => s.add(st.name));
  });
  const isCloudPlan = plan.source === "cloud";
  // 2026-10-03 用户：吸顶地图的点 = 每天行程的景点（按名查坐标），滚动联动高亮
  // days/details 每 render 都是新数组引用，用天号签名做 memo key，避免地图 markers 无意义重建
  const daysSig = days.map((d) => d.day).join(",");
  const mapItems = useMemo<StickyMapItem[]>(() => {
    const out: StickyMapItem[] = [];
    const seen = new Set<string>();
    days.forEach((d, i) => {
      const det = details[i];
      if (!det) return;
      for (const s of det.stops) {
        const key = `itinerary:${s.name}`;
        if (seen.has(key)) continue;
        const coord = findStopCoord(s.name);
        if (coord) {
          seen.add(key);
          out.push({
            name: s.name,
            city: d.city_zh,
            lat: coord.lat,
            lng: coord.lng,
            kind: "itinerary",
            note: `D${d.day} ${d.date}`,
          });
        }
      }
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysSig]);
  return (
    <>
      {/* 2026-10-04 用户：点选模式——不点显示全部景点；点某天卡片后只显示那一天的站点+连线，被点的跳动高亮，其他正常显示；面板可点击收起 */}
      <StickyMapBar
        items={mapItems}
        activeCity={null}
        activeLabel={mapSel ? `D${mapSel.day} · ${mapSel.city}` : undefined}
        activeItemKeys={selectedKey ? [selectedKey] : null}
        activeDayRoute={mapSel?.route ?? null}
        title="🗺️ 行程地图"
        storageKey="sticky-map-itinerary"
        expandSignal={mapExpandSig}
        onHeightChange={setMapBarH}
      />
      {/* 悬浮日期导航（紧贴吸顶地图条底部，top 由 JS 动态测量 header 高度 + 地图条高设置） */}
      <div ref={dateNavRef} className="sticky z-[5] -mx-4 px-4 py-2 mb-6 bg-[#faf8f3]/95 backdrop-blur-sm border-y border-gray-200">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {days.map((d) => (
            <button
              key={d.day}
              onClick={() =>
                document
                  .getElementById(`day-${d.day}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="whitespace-nowrap flex-shrink-0 text-xs px-2.5 py-1.5 rounded-lg text-teal-800 hover:bg-teal-700 hover:text-white transition-colors"
            >
              D{d.day} {shortDate(d.date)} {d.city_zh}
            </button>
          ))}
        </div>
      </div>

      {/* 收藏的景点：检查是否已排入行程 + 直接排入某天 */}
      <FavoriteItineraryCheck cityScheduled={cityScheduled} dayOptions={dayOptions} />

      {/* 每日完整行程卡（意大利站逻辑：一天一卡，信息全在卡里） */}
      {/* 空状态（days.length===0）时不渲染"X 0 天详细行程"标题，
          避免 /korea 首尔日期未定时出现"韩国 0 天详细行程"这种别扭文案，
          只保留下面的诚实空状态说明 */}
      {days.length > 0 && (
        <h2 className="text-xl font-bold mb-4">
          {koreaOnly ? `韩国 ${days.length} 天详细行程` : `东南亚 ${days.length} 天详细行程`}
        </h2>
      )}
      {days.length === 0 && (
        <p className="text-sm text-gray-500 mb-8">
          {koreaOnly
            ? "韩国行程的天数还没排进来，先去「行程规划」把首尔段日期定下来。"
            : "东南亚行程的天数还没排进来，先去「行程规划」确认日期。"}
        </p>
      )}
      <div className="space-y-8 mb-12">
        {days.map((d, i) => {
          // 跨 tab 转场不丢：prevDay 取全行程（allDays）中的真实前一天，
          // 而不是 KOREA_CITY_ZH 过滤后的前一天。否则 /korea 里首尔首日的
          // “北京飞首尔”转场卡会凭空消失（两个 tab 都看不到这段转场）。
          const gi = allDays.findIndex((x) => x.day === d.day);
          const prevDay = gi > 0 ? allDays[gi - 1] : undefined;
          return (
            <Fragment key={d.day}>
              <ItineraryDayCard
                day={d}
                prevDay={prevDay}
                detail={details[i]}
                bookings={bookingsByDay.get(d.day) || []}
                isCloud={isCloudPlan}
                cityScheduledNames={cityScheduled.get(d.city_zh)}
                favorites={favorites}
                assignedAttractions={assignedByDay.get(d.day)}
                stay={stays.get(d.city_zh) ?? null}
                onSelectStop={handleCardSelect}
                selectedKey={selectedKey}
              />
              {renderDayExtra?.(d, i)}
            </Fragment>
          );
        })}
      </div>
    </>
  );
}

