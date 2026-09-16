import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { saveRecord } from "@/guide/records";
import {
  BOOKING_FIELD_LABEL,
  BOOKING_KIND_LABEL,
  BOOKING_KINDS,
  formatBookingBody,
  parseBookingBody,
  type BookingData,
  type BookingKind,
  type BookingPreset,
} from "./bookingTypes";

const inputCls =
  "w-full rounded-lg border border-[#e5e1d6] bg-white px-3 py-2 text-sm outline-none focus:border-teal-600";
const labelCls = "block text-xs font-medium text-gray-500 mb-1";

export default function BookingDialog({
  open,
  preset,
  onClose,
}: {
  open: boolean;
  preset: BookingPreset | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [bkind, setBkind] = useState<BookingKind>("hotel");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [data, setData] = useState<BookingData>({ bkind: "hotel" });
  const [confirmed, setConfirmed] = useState(false);
  const [day, setDay] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | undefined>();

  useEffect(() => {
    if (open && preset) {
      setBkind(preset.bkind);
      setName(preset.name || "");
      setCity(preset.city || "");
      setData(
        preset.data || {
          bkind: preset.bkind,
          city: preset.city,
          date: preset.date,
          dateEnd: preset.dateEnd,
        }
      );
      setConfirmed(!!preset.confirmed);
      setDay(preset.day ? String(preset.day) : "");
      setEditId(preset.id);
      setError(null);
    }
  }, [open, preset]);

  if (!open) return null;

  const FL = BOOKING_FIELD_LABEL[bkind];
  const set = (k: keyof BookingData, v: string) =>
    setData((d) => ({ ...d, [k]: v }));

  const submit = async () => {
    if (!name.trim()) {
      setError("请填写预订名称");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveRecord({
        id: editId,
        kind: "booking",
        title: name.trim(),
        body: formatBookingBody({ ...data, bkind, city: city || undefined }),
        day: day.trim() ? Number(day.trim()) : null,
        done: confirmed,
      });
      qc.invalidateQueries({ queryKey: ["records"] });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  const switchKind = (k: BookingKind) => {
    setBkind(k);
    setData((d) => ({ ...d, bkind: k }));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={editId ? "编辑预订" : "新增预订"}
    >
      <div className="w-full sm:max-w-lg bg-[#faf8f3] rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#faf8f3] border-b border-[#e5e1d6] px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#143c34]">
            {editId ? "编辑预订" : "新增预订"}
          </h2>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="w-8 h-8 rounded-full hover:bg-gray-200 text-gray-500 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* 类型选择 */}
          <div>
            <span className={labelCls}>预订类型</span>
            <div className="flex flex-wrap gap-2">
              {BOOKING_KINDS.map((k) => (
                <button
                  key={k}
                  onClick={() => switchKind(k)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    bkind === k
                      ? "bg-teal-700 text-white border-teal-700"
                      : "bg-white text-gray-600 border-[#e5e1d6] hover:border-teal-600"
                  }`}
                >
                  {BOOKING_KIND_LABEL[k]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>名称 *</label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={bkind === "hotel" ? "酒店名称" : bkind === "restaurant" ? "餐厅名称" : bkind === "transport" ? "如：曼谷 → 清迈" : "项目名称"}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>城市</label>
              <input
                className={inputCls}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="如：曼谷"
              />
            </div>
            <div>
              <label className={labelCls}>关联行程天数（可选）</label>
              <input
                className={inputCls}
                value={day}
                onChange={(e) => setDay(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="如：4"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{FL.date}</label>
              <input
                type="date"
                className={inputCls}
                value={data.date || ""}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>
            {FL.dateEnd ? (
              <div>
                <label className={labelCls}>{FL.dateEnd}</label>
                <input
                  type="date"
                  className={inputCls}
                  value={data.dateEnd || ""}
                  onChange={(e) => set("dateEnd", e.target.value)}
                />
              </div>
            ) : FL.time ? (
              <div>
                <label className={labelCls}>{FL.time}</label>
                <input
                  type="time"
                  className={inputCls}
                  value={data.time || ""}
                  onChange={(e) => set("time", e.target.value)}
                />
              </div>
            ) : null}
          </div>

          {FL.timeEnd && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{FL.timeEnd}</label>
                <input
                  type="time"
                  className={inputCls}
                  value={data.timeEnd || ""}
                  onChange={(e) => set("timeEnd", e.target.value)}
                />
              </div>
              {FL.guests && (
                <div>
                  <label className={labelCls}>{FL.guests}</label>
                  <input
                    className={inputCls}
                    value={data.guests || ""}
                    onChange={(e) => set("guests", e.target.value)}
                    placeholder="如：2"
                    inputMode="numeric"
                  />
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {FL.guests && !FL.timeEnd && (
              <div>
                <label className={labelCls}>{FL.guests}</label>
                <input
                  className={inputCls}
                  value={data.guests || ""}
                  onChange={(e) => set("guests", e.target.value)}
                  placeholder="如：2"
                  inputMode="numeric"
                />
              </div>
            )}
            {FL.extra && (
              <div className={FL.guests && !FL.timeEnd ? "" : "col-span-2"}>
                <label className={labelCls}>{FL.extra}</label>
                <input
                  className={inputCls}
                  value={data.extra || ""}
                  onChange={(e) => set("extra", e.target.value)}
                  placeholder={bkind === "transport" ? "如：PG0248" : ""}
                />
              </div>
            )}
          </div>

          <div>
            <label className={labelCls}>确认号</label>
            <input
              className={inputCls}
              value={data.code || ""}
              onChange={(e) => set("code", e.target.value)}
              placeholder="出票/订位后填写"
            />
          </div>

          <div>
            <label className={labelCls}>备注</label>
            <textarea
              className={inputCls}
              rows={2}
              value={data.note || ""}
              onChange={(e) => set("note", e.target.value)}
              placeholder="取消政策、特殊要求等"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 accent-teal-700"
            />
            已确认（收到确认号 / 出票完成）
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              onClick={submit}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 disabled:opacity-50"
            >
              {saving ? "保存中…" : editId ? "保存修改" : "保存预订"}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#e5e1d6] bg-white text-sm font-medium text-gray-600 hover:border-teal-600"
            >
              取消
            </button>
          </div>

          {/* 兼容旧数据的说明：仅编辑旧记录时展示原解析结果 */}
          {editId && (
            <p className="text-xs text-gray-400">
              旧版纯文本记录会自动转为结构化格式保存。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** 从一条记录行构造编辑预设 */
export function presetFromRow(row: {
  id: number;
  title: string;
  body: string;
  day: number | null;
  done: boolean;
}): BookingPreset {
  const d = parseBookingBody(row.body);
  return {
    id: row.id,
    bkind: d.bkind,
    name: row.title,
    city: d.city,
    date: d.date,
    dateEnd: d.dateEnd,
    day: row.day,
    confirmed: row.done,
    data: d,
  };
}
