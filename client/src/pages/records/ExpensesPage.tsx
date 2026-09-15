/**
 * /expenses 记账：新增/删除支出（事项、金额、日期、类别），按币种显示总计。
 * kind="expense"（新 kind，攻略站内暂无对应 Tab）。
 *
 * 金额存储说明（诚实实现）：sea_guide_records 表没有 amount 列，
 * 为保持单表设计、避免改表结构，金额等结构化字段以 JSON 存放在 body
 * 中；title 存事项名。读取时 JSON 解析失败则降级为纯文本备注展示。
 */
import { useMemo, useState } from "react";
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

type ExpenseData = {
  amount: number;
  currency: string;
  category: string;
  date: string;
  note: string;
};

const CURRENCIES = ["CNY", "THB", "MYR", "VND", "SGD", "USD"];
const CATEGORIES = ["餐饮", "住宿", "交通", "门票", "购物", "其他"];
const CURRENCY_SYMBOL: Record<string, string> = {
  CNY: "¥",
  THB: "฿",
  MYR: "RM",
  VND: "₫",
  SGD: "S$",
  USD: "$",
};

const emptyExpense: ExpenseData = {
  amount: 0,
  currency: "CNY",
  category: "餐饮",
  date: "",
  note: "",
};

function parseExpense(body: string): ExpenseData {
  try {
    const o = JSON.parse(body) as Partial<ExpenseData>;
    if (o && typeof o.amount === "number")
      return { ...emptyExpense, ...o, amount: o.amount };
  } catch {
    /* 非 JSON 旧数据，降级处理 */
  }
  return { ...emptyExpense, amount: 0, note: body };
}

function formatAmount(amount: number, currency: string): string {
  const sym = CURRENCY_SYMBOL[currency] ?? currency + " ";
  return `${sym}${amount.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}`;
}

function ExpensesInner() {
  const { rows, loading, loadError, save, del, syncMode } =
    useRecordsData(["expense"]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("CNY");
  const [category, setCategory] = useState("餐饮");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const reset = () => {
    setTitle("");
    setAmount("");
    setCurrency("CNY");
    setCategory("餐饮");
    setDate("");
    setNote("");
  };

  const submit = () => {
    const amt = Number(amount);
    if (!title.trim() || !Number.isFinite(amt) || amt <= 0) return;
    const data: ExpenseData = {
      amount: Math.round(amt * 100) / 100,
      currency,
      category,
      date,
      note: note.trim(),
    };
    save.mutate(
      {
        kind: "expense",
        title: title.trim(),
        body: JSON.stringify(data),
        day: null,
        done: false,
      },
      { onSuccess: reset }
    );
  };

  const totals = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const d = parseExpense(r.body);
      map.set(d.currency, (map.get(d.currency) ?? 0) + d.amount);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  return (
    <PageShell
      eyebrow="TRIP EXPENSES"
      title="旅行记账"
      summary="路上的每一笔开销都记下来，按币种汇总，心里有数。"
    >
      <SyncBanner mode={syncMode} />

      {totals.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {totals.map(([cur, sum]) => (
            <Card key={cur}>
              <p className="text-xs text-gray-400">{cur} 总计</p>
              <p
                className="text-xl text-[#143c34] mt-1"
                style={{ fontFamily: 'Georgia,"Noto Serif SC",serif' }}
              >
                {formatAmount(Math.round(sum * 100) / 100, cur)}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <h2
          className="text-lg mb-4 text-[#143c34]"
          style={{ fontFamily: 'Georgia,"Noto Serif SC",serif' }}
        >
          记一笔
        </h2>
        <Field label="事项">
          <input
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：曼谷 → 清迈机票"
            aria-label="支出事项"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="金额">
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              className={inputCls}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              aria-label="支出金额"
            />
          </Field>
          <Field label="币种">
            <select
              className={inputCls}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="币种"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="类别">
            <select
              className={inputCls}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="支出类别"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="日期">
            <input
              type="date"
              className={inputCls}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="支出日期"
            />
          </Field>
        </div>
        <Field label="备注（可选）">
          <input
            className={inputCls}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例如：两人份"
            aria-label="支出备注"
          />
        </Field>
        <PrimaryButton
          onClick={submit}
          disabled={
            save.isPending ||
            !title.trim() ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0
          }
        >
          {save.isPending ? "保存中…" : "记下这笔"}
        </PrimaryButton>
      </Card>

      <h2
        className="text-lg mt-8 mb-3 text-[#143c34]"
        style={{ fontFamily: 'Georgia,"Noto Serif SC",serif' }}
      >
        明细（{rows.length}）
      </h2>
      {loading ? (
        <EmptyHint text="正在读取…" />
      ) : loadError ? (
        <EmptyHint text="读取失败，请稍后重试。" />
      ) : rows.length === 0 ? (
        <EmptyHint text="还没有记账，从第一笔机票开始吧。" />
      ) : (
        <div className="space-y-2">
          {rows.map((r) => {
            const d = parseExpense(r.body);
            return (
              <Card key={r.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-800">{r.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        {d.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {d.date ? `${d.date} · ` : ""}
                      {d.note || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="font-medium text-[#143c34]"
                      style={{ fontFamily: 'Georgia,"Noto Serif SC",serif' }}
                    >
                      {formatAmount(d.amount, d.currency)}
                    </span>
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
    </PageShell>
  );
}

export default function ExpensesPage() {
  return <ExpensesInner />;
}
