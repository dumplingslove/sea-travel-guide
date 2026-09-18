/**
 * 每日行程站点级坐标（backlog P1「每日地图升级为景点级」）。
 *
 * 数据来源：OpenStreetMap Nominatim 地理编码，2026-09-18 实查，
 * 每个坐标的返回 display_name 已逐条核对为对应地标（非近似点）。
 * 只有坐标已核实的日期才列出；未列出的日期 DayMap 保持原有城市级标记。
 * “或 / 二选一”类站点取其中其一的坐标，note 字段如实标注，popup 会展示。
 */
export interface StopCoord {
  /** 与 guide/data.ts 当天 stops 的 name 一致 */
  name: string;
  /** 与 guide/data.ts 当天 stops 的 time 一致 */
  time: string;
  lat: number;
  lng: number;
  /** 如“二选一，图示其一”等说明 */
  note?: string;
}

export const STOP_COORDS: Record<number, StopCoord[]> = {
  // Day 2 曼谷《周末市集 · 黎明寺 · 唐人街》（2026-12-13 周日）
  2: [
    { name: "恰图恰周末市集", time: "09:00", lat: 13.8002651, lng: 100.5511228 },
    { name: "Or Tor Kor Market", time: "13:30", lat: 13.7971301, lng: 100.5475746 },
    { name: "郑王庙", time: "16:00", lat: 13.7438976, lng: 100.4885137 },
    { name: "耀华力路", time: "18:30", lat: 13.7411515, lng: 100.5083113 },
  ],
  // Day 3 曼谷《王城深读 · 暹罗购物》（2026-12-14 周一）
  3: [
    { name: "大皇宫深度游", time: "08:30", lat: 13.7493514, lng: 100.4918643 },
    { name: "卧佛寺与按摩", time: "11:30", lat: 13.7463456, lng: 100.4927381 },
    {
      name: "暹罗商圈 / ICONSIAM",
      time: "15:00",
      lat: 13.7268227,
      lng: 100.510294,
      note: "二选一，图示 ICONSIAM",
    },
    {
      name: "Jodd Fairs 或 Asiatique",
      time: "19:00",
      lat: 13.7681679,
      lng: 100.5709179,
      note: "二选一，图示 Jodd Fairs Ratchada",
    },
  ],
  // Day 1 曼谷站点为“入住酒店 / 酒店周边轻走 / 湄南河畔晚餐”等泛指，
  // 无精确坐标可核验，故意不列——保持城市级地图，不编造点位。
};

/** 返回某天的站点坐标；没有则返回 undefined（调用方回退到城市级标记） */
export function stopCoordsForDay(dayNum: number): StopCoord[] | undefined {
  const s = STOP_COORDS[dayNum];
  return s && s.length > 0 ? s : undefined;
}
