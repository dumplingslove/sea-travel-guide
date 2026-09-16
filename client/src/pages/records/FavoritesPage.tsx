/**
 * /favorites 收藏：收藏景点（名称、城市、备注），新增/删除。
 * kind="favorite"（新 kind）。攻略站景点卡片上有一键收藏按钮，
 * 点一下就存到这里；也可以手动添加。
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
  AuthorTag,
} from "./shared";

type FavoriteData = { city: string; note: string };

function parseFavorite(body: string): FavoriteData {
  try {
    const o = JSON.parse(body) as Partial<FavoriteData>;
    if (o && typeof o === "object")
      return { city: o.city ?? "", note: o.note ?? "" };
  } catch {
    /* 非 JSON 旧数据，降级为纯文本备注 */
  }
  return { city: "", note: body };
}

function FavoritesInner() {
  const { rows, loading, loadError, save, del, syncMode } =
    useRecordsData(["favorite"]);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");

  const reset = () => {
    setName("");
    setCity("");
    setNote("");
  };
  const submit = () => {
    if (!name.trim()) return;
    const data: FavoriteData = { city: city.trim(), note: note.trim() };
    save.mutate(
      {
        kind: "favorite",
        title: name.trim(),
        body: JSON.stringify(data),
        day: null,
        done: false,
      },
      { onSuccess: reset }
    );
  };

  return (
    <PageShell
      eyebrow="MY FAVORITES"
      title="我的收藏"
      summary="心仪的景点先收进来，排日程时直接对照着看。"
    >
      <SyncBanner mode={syncMode} />
      <Card>
        <h2
          className="text-lg mb-4 text-[#143c34]"
          style={{ fontFamily: 'Georgia,"Noto Serif SC",serif' }}
        >
          手动添加收藏
        </h2>
        <Field label="景点名称">
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：柴瓦塔那兰寺"
            aria-label="景点名称"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="城市（可选）">
            <input
              className={inputCls}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="例如：大城府"
              aria-label="所在城市"
            />
          </Field>
          <Field label="备注（可选）">
            <input
              className={inputCls}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如：日落前去"
              aria-label="收藏备注"
            />
          </Field>
        </div>
        <PrimaryButton onClick={submit} disabled={save.isPending || !name.trim()}>
          {save.isPending ? "保存中…" : "加入收藏"}
        </PrimaryButton>
        <p className="mt-3 text-xs text-gray-400">
          更快的方式：在<Link to="/practical" className="text-teal-700 hover:underline">实用信息 → 景点指南</Link>的景点卡片上点“＋
          收藏”，会自动存到这里。
        </p>
      </Card>

      <h2
        className="text-lg mt-8 mb-3 text-[#143c34]"
        style={{ fontFamily: 'Georgia,"Noto Serif SC",serif' }}
      >
        已收藏（{rows.length}）
      </h2>
      {loading ? (
        <EmptyHint text="正在读取…" />
      ) : loadError ? (
        <EmptyHint text="读取失败，请稍后重试。" />
      ) : rows.length === 0 ? (
        <EmptyHint text="还没有收藏，去攻略站逛逛，看到喜欢的就点收藏吧。" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {rows.map((r) => {
            const d = parseFavorite(r.body);
            return (
              <Card key={r.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-800">{r.title}</h3>
                    <AuthorTag userId={r.userId} />
                    {d.city && (
                      <p className="text-xs text-teal-700 mt-0.5">{d.city}</p>
                    )}
                    {d.note && (
                      <p className="text-sm text-gray-500 mt-1 break-words">
                        {d.note}
                      </p>
                    )}
                  </div>
                  <GhostButton
                    danger
                    onClick={() => del.mutate({ id: r.id })}
                    aria-label={`取消收藏${r.title}`}
                  >
                    取消收藏
                  </GhostButton>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}

export default function FavoritesPage() {
  return <FavoritesInner />;
}
