/** /packing 打包清单：新增物品、勾选已打包、删除。kind="packing"，与攻略站内打包清单同表互通。 */
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
import type { GuideRecord } from "@/guide/records";

const SUGGESTIONS = [
  "护照与签证副本",
  "轻薄雨衣",
  "SPF50 防晒",
  "防蚊用品",
  "海岛防水袋",
  "全球转换插头",
  "常用药与处方证明",
  "泳衣与沙滩巾",
];

function PackingInner() {
  const { rows, loading, loadError, save, del, syncMode } =
    useRecordsData(["packing"]);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  const add = (title: string, body = "") => {
    const t = title.trim();
    if (!t) return;
    save.mutate(
      { kind: "packing", title: t, body, day: null, done: false },
      {
        onSuccess: () => {
          setName("");
          setNote("");
        },
      }
    );
  };
  const toggle = (r: GuideRecord) =>
    save.mutate({
      id: r.id,
      kind: r.kind,
      title: r.title,
      body: r.body,
      day: r.day,
      done: !r.done,
    });

  const doneCount = rows.filter((r) => r.done).length;

  return (
    <PageShell
      eyebrow="PACKING LIST"
      title="打包清单"
      summary="按四国、海岛和长途飞行整理行李；勾选状态保存在私人数据库中。"
    >
      <SyncBanner mode={syncMode} />
      <Card>
        <h2
          className="text-lg mb-4 text-[#143c34]"
          style={{ fontFamily: 'Georgia,"Noto Serif SC",serif' }}
        >
          添加物品
        </h2>
        <div className="flex gap-2">
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add(name, note)}
            placeholder="例如：转换插头"
            aria-label="物品名称"
          />
          <PrimaryButton onClick={() => add(name, note)} disabled={save.isPending || !name.trim()}>
            添加
          </PrimaryButton>
        </div>
        <div className="mt-3">
          <Field label="备注（可选）">
            <input
              className={inputCls}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如：英标+欧标各带一个"
              aria-label="物品备注"
            />
          </Field>
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500 mb-2">热带海岛清单建议</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => add(s, "建议清单")}
                className="px-3 py-1.5 rounded-full border border-teal-200 bg-teal-50 text-sm text-teal-800 hover:bg-teal-100"
              >
                ＋ {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <h2
        className="text-lg mt-8 mb-3 text-[#143c34]"
        style={{ fontFamily: 'Georgia,"Noto Serif SC",serif' }}
      >
        清单（{doneCount}/{rows.length} 已打包）
      </h2>
      {rows.length > 0 && (
        <div className="h-2 rounded-full bg-gray-200 mb-4 overflow-hidden">
          <div
            className="h-full bg-teal-600 transition-all"
            style={{ width: `${(doneCount / rows.length) * 100}%` }}
          />
        </div>
      )}
      {loading ? (
        <EmptyHint text="正在读取…" />
      ) : loadError ? (
        <EmptyHint text="读取失败，请稍后重试。" />
      ) : rows.length === 0 ? (
        <EmptyHint text="清单是空的，从上面的建议里一键添加吧。" />
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggle(r)}
                  aria-label={`${r.done ? "取消已打包" : "标记已打包"}：${r.title}`}
                  className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center text-sm ${
                    r.done
                      ? "bg-teal-600 border-teal-600 text-white"
                      : "border-gray-300 text-transparent hover:border-teal-500"
                  }`}
                >
                  ✓
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      r.done ? "line-through text-gray-400" : "text-gray-800"
                    }`}
                  >
                    {r.title}
                  </p>
                  {r.body && (
                    <p className="text-xs text-gray-500 mt-0.5">{r.body}</p>
                  )}
                </div>
                <GhostButton danger onClick={() => del.mutate({ id: r.id })}>
                  删除
                </GhostButton>
              </div>
            </Card>
          ))}
        </div>
      )}
      <p className="mt-8 text-xs text-gray-400">
        打包清单保存在这里（登录后云端同步）。
      </p>
    </PageShell>
  );
}

export default function PackingPage() {
  return <PackingInner />;
}
