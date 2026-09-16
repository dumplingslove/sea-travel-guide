/**
 * 预订数据类型：复用 sea_guide_records 表（kind="booking"）。
 * - title = 预订名称（酒店名 / 餐厅名 / 航段…）
 * - body  = BookingData 的 JSON
 * - done  = 是否已确认
 * - day   = 关联的行程天数（可选）
 *
 * 兼容旧格式：body 为三行纯文本（日期/确认号/备注）时按 other 解析。
 */

export type BookingKind = "hotel" | "restaurant" | "attraction" | "transport" | "other";

export interface BookingData {
  bkind: BookingKind;
  city?: string;
  /** YYYY-MM-DD：入住 / 用餐 / 参观 / 出发日期 */
  date?: string;
  /** YYYY-MM-DD：退房日期（仅酒店） */
  dateEnd?: string;
  /** HH:MM：用餐 / 入场 / 出发时间 */
  time?: string;
  /** HH:MM：到达时间（仅交通） */
  timeEnd?: string;
  /** 人数 / 房间数 / 门票张数 */
  guests?: string;
  /** 房型 / 航班号车次 / 订位渠道 / 票种 */
  extra?: string;
  /** 确认号 */
  code?: string;
  note?: string;
}

export const BOOKING_KIND_LABEL: Record<BookingKind, string> = {
  hotel: "酒店",
  restaurant: "餐厅",
  attraction: "景点门票",
  transport: "交通",
  other: "其他",
};

export const BOOKING_KINDS: BookingKind[] = ["hotel", "restaurant", "attraction", "transport", "other"];

/** 每种类型在表单里的字段文案 */
export const BOOKING_FIELD_LABEL: Record<
  BookingKind,
  { date: string; dateEnd?: string; time?: string; timeEnd?: string; guests?: string; extra?: string }
> = {
  hotel: { date: "入住日期", dateEnd: "退房日期", guests: "房间数", extra: "房型" },
  restaurant: { date: "用餐日期", time: "用餐时间", guests: "用餐人数", extra: "订位渠道 / 套餐" },
  attraction: { date: "参观日期", time: "入场时间", guests: "门票张数", extra: "票种" },
  transport: { date: "出发日期", time: "出发时间", timeEnd: "到达时间", guests: "人数", extra: "航班号 / 车次" },
  other: { date: "日期", time: "时间", guests: "数量", extra: "补充信息" },
};

export function parseBookingBody(body: string): BookingData {
  const t = (body || "").trim();
  if (t.startsWith("{")) {
    try {
      const o = JSON.parse(t);
      if (o && typeof o.bkind === "string" && o.bkind in BOOKING_KIND_LABEL) {
        return o as BookingData;
      }
    } catch {
      /* fall through to legacy */
    }
  }
  const pick = (label: string) => {
    const m = t.match(new RegExp(`^${label}：(.*)$`, "m"));
    return m ? m[1].trim() : "";
  };
  const d: BookingData = { bkind: "other" };
  const date = pick("日期");
  const code = pick("确认号");
  const note = pick("备注");
  if (date) d.date = date;
  if (code) d.code = code;
  d.note = note || (t && !date && !code ? t : undefined);
  return d;
}

export function formatBookingBody(d: BookingData): string {
  const clean: BookingData = { bkind: d.bkind };
  (["city", "date", "dateEnd", "time", "timeEnd", "guests", "extra", "code", "note"] as const).forEach((k) => {
    const v = d[k]?.trim();
    if (v) clean[k] = v;
  });
  return JSON.stringify(clean);
}

/** 列表里的一行摘要 */
export function bookingSummary(d: BookingData): string {
  const parts: string[] = [];
  if (d.city) parts.push(d.city);
  if (d.date) parts.push(d.dateEnd ? `${d.date} → ${d.dateEnd}` : d.date);
  if (d.time) parts.push(d.timeEnd ? `${d.time}–${d.timeEnd}` : d.time);
  if (d.guests) parts.push(d.guests);
  if (d.extra) parts.push(d.extra);
  if (d.code) parts.push(`确认号 ${d.code}`);
  if (!parts.length && d.note) parts.push(d.note);
  return parts.join(" · ");
}

export interface BookingPreset {
  id?: number;
  bkind: BookingKind;
  name: string;
  city?: string;
  date?: string;
  dateEnd?: string;
  day?: number | null;
  confirmed?: boolean;
  /** 编辑已有记录时：完整解析后的数据，用于回填表单 */
  data?: BookingData;
}
