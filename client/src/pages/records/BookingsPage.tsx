/**
 * /bookings 预订记录：新增/编辑/删除（名称、日期、确认号、备注）。
 * kind="booking"，与攻略站内“我的预订”同表互通。
 *
 * 互通约定：body 用纯文本三行（日期/确认号/备注）存储，攻略站内
 * Tab 直接展示可读；本页编辑时再解析回字段。
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useRecordsData,
  PageShell,
  SyncBanner,
  Card,
  Field,
  inputCls,
  PrimaryButton,
  GhostButton,
  EmptyHint,
} from "./shared";

function composeBody(date: string, code: string, note: string): string {
  const lines: string[] = [];
  if (date.trim()) lines.push(`日期：${date.trim()}`);
  if (code.trim()) lines.push(`确认号：${code.trim()}`);
  if (note.trim()) lines.push(`备注：${note.trim()}`);
  return lines.join("\n");
}

function parseBody(body: string): { date: string; code: string; note: string } {
  const pick = (label: string) => {
    const m = body.match(new RegExp(`^${label}：(.*)$`, "m"));
    return m ? m[1].trim() : "";
  };
  const date = pick("日期");
  const code = pick("确认号");
  const note = pick("备注");
  if (!date && !code && !note) return { date: "", code: "", note: body };
  return { date, code, note };
}

function BookingsInner() {
  const { rows, loading, loadError, save, del, syncMode } =
    useRecordsData(["booking"]);
  const [editId, setEditId] = useState<number | undefined>();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");

  const reset = () => {
    setEditId(undefined);
    setName("");
    setDate("");
    setCode("");
    setNote("");
  };
  const submit = () => {
    if (!name.trim()) return;
    save.mutate(
      {
        id: editId,
        kind: "booking",
        title: name.trim(),
        body: composeBody(date, code, note),
        day: null,
        done: false,
      },
      { onSuccess: reset }
    );
  };
  const beginEdit = (id: number) => {
    const r = rows.find((x) => x.id === id);
    if (!r) return;
    const p = parseBody(r.body);
    setEditId(id);
    setName(r.title);
    setDate(p.date);
    setCode(p.code);
    setNote(p.note);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PageShell
      eyebrow="MY BOOKINGS"
      title="预订记录"
      summary="集中保存酒店、餐厅、航班、门票与确认号，出行时随时查。"
    >
      <SyncBanner mode={syncMode} />
      <Card>
        <h2
          className="text-lg mb-4 text-[#143c34]"
          style={{ fontFamily: 'Georgia,"Noto Serif SC",serif' }}
        >
          {editId ? "编辑预订" : "新增预订"}
        </h2>
        <Field label="名称">
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：曼谷文华东方 · 2晚"
            aria-label="预订名称"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="日期">
            <input
              type="date"
              className={inputCls}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="预订日期"
            />
          </Field>
          <Field label="确认号">
            <input
              className={inputCls}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="例如：MH2026XXXX"
              aria-label="确认号"
            />
          </Field>
        </div>
        <Field label="备注">
          <textarea
            className={inputCls}
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="房型、入住人、特殊要求…"
            aria-label="预订备注"
          />
        </Field>
        <div className="flex gap-2">
          <PrimaryButton onClick={submit} disabled={save.isPending || !name.trim()}>
            {save.isPending ? "保存中…" : editId ? "保存修改" : "保存预订"}
          </PrimaryButton>
          {editId && <GhostButton onClick={reset}>取消</GhostButton>}
        </div>
      </Card>

      <h2
        className="text-lg mt-8 mb-3 text-[#143c34]"
        style={{ fontFamily: 'Georgia,"Noto Serif SC",serif' }}
      >
        全部预订（{rows.length}）
      </h2>
      {loading ? (
        <EmptyHint text="正在读取…" />
      ) : loadError ? (
        <EmptyHint text="读取失败，请稍后重试。" />
      ) : rows.length === 0 ? (
        <EmptyHint text="还没有预订记录，先把酒店订单记下来吧。" />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const p = parseBody(r.body);
            return (
              <Card key={r.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-800">{r.title}</h3>
                    <div className="mt-1 space-y-0.5 text-sm text-gray-600">
                      {p.date && (
                        <p>
                          <span className="text-gray-400">日期：</span>
                          {p.date}
                        </p>
                      )}
                      {p.code && (
                        <p>
                          <span className="text-gray-400">确认号：</span>
                          <span className="font-mono">{p.code}</span>
                        </p>
                      )}
                      {p.note && (
                        <p className="whitespace-pre-wrap break-words">
                          <span className="text-gray-400">备注：</span>
                          {p.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0">
                    <GhostButton onClick={() => beginEdit(r.id)}>编辑</GhostButton>
                    <GhostButton danger onClick={() => del.mutate({ id: r.id })}>
                      删除
                    </GhostButton>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <p className="mt-8 text-xs text-gray-400">
        预订信息保存在这里（登录后云端同步）。
      </p>
    </PageShell>
  );
}

export default function BookingsPage() {
  return <BookingsInner />;
}
