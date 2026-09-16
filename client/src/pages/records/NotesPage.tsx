/** /notes 笔记：新增/编辑/删除文本笔记（标题+正文+关联日期）。kind="note"，与攻略站内部游记工具同表互通。 */
import { useState } from "react";
import { Link } from "react-router-dom";
import itinerary from "@/data/itinerary.json";
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

type Day = { day: number; date: string; city_zh: string };
const days = itinerary as Day[];

function NotesInner() {
  const { rows, loading, loadError, save, del, syncMode } =
    useRecordsData(["note"]);
  const [editId, setEditId] = useState<number | undefined>();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [day, setDay] = useState<number | null>(null);

  const reset = () => {
    setEditId(undefined);
    setTitle("");
    setBody("");
    setDay(null);
  };
  const submit = () => {
    if (!title.trim()) return;
    save.mutate(
      {
        id: editId,
        kind: "note",
        title: title.trim(),
        body,
        day,
        done: false,
      },
      { onSuccess: reset }
    );
  };
  const beginEdit = (id: number) => {
    const r = rows.find((x) => x.id === id);
    if (!r) return;
    setEditId(id);
    setTitle(r.title);
    setBody(r.body);
    setDay(r.day);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PageShell
      eyebrow="PERSONAL NOTES"
      title="旅行笔记"
      summary="出发前做功课、路上随时记。与攻略站内的记录共用同一云端数据。"
    >
      <SyncBanner mode={syncMode} />
      <Card>
        <h2
          className="text-lg mb-4 text-[#143c34]"
          style={{ fontFamily: 'Georgia,"Noto Serif SC",serif' }}
        >
          {editId ? "编辑笔记" : "写一条笔记"}
        </h2>
        <Field label="标题">
          <input
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：大城府包车砍价要点"
            aria-label="笔记标题"
          />
        </Field>
        <Field label="关联日期（可选）">
          <select
            className={inputCls}
            value={day ?? ""}
            onChange={(e) =>
              setDay(e.target.value === "" ? null : Number(e.target.value))
            }
            aria-label="关联行程日期"
          >
            <option value="">不关联具体日期</option>
            {days.map((d) => (
              <option key={d.day} value={d.day}>
                Day {d.day} · {d.city_zh}（{d.date}）
              </option>
            ))}
          </select>
        </Field>
        <Field label="正文">
          <textarea
            className={inputCls}
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="把想法、提醒、灵感都记下来…"
            aria-label="笔记正文"
          />
        </Field>
        <div className="flex gap-2">
          <PrimaryButton onClick={submit} disabled={save.isPending || !title.trim()}>
            {save.isPending ? "保存中…" : editId ? "保存修改" : "保存笔记"}
          </PrimaryButton>
          {editId && <GhostButton onClick={reset}>取消</GhostButton>}
        </div>
      </Card>

      <h2
        className="text-lg mt-8 mb-3 text-[#143c34]"
        style={{ fontFamily: 'Georgia,"Noto Serif SC",serif' }}
      >
        全部笔记（{rows.length}）
      </h2>
      {loading ? (
        <EmptyHint text="正在读取…" />
      ) : loadError ? (
        <EmptyHint text="读取失败，请稍后重试。" />
      ) : rows.length === 0 ? (
        <EmptyHint text="还没有笔记，在上面写第一条吧。" />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const d = r.day ? days.find((x) => x.day === r.day) : null;
            return (
              <Card key={r.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-800">{r.title}</h3>
                    {d && (
                      <p className="text-xs text-teal-700 mt-0.5">
                        Day {d.day} · {d.city_zh}
                      </p>
                    )}
                    {r.body && (
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap break-words">
                        {r.body}
                      </p>
                    )}
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
        游记保存在这里（登录后云端同步）。
      </p>
    </PageShell>
  );
}

export default function NotesPage() {
  return <NotesInner />;
}
