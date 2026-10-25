/**
 * 已订对账共用尺（2026-10-24 误报修复，NextActionQueue 与 DailyDigestBanner 共用）：
 * 监控/候选状态与已订记录冲突时一律以已订记录为准。
 *
 * 名称对账：去括号后缀（中英文括号）后包含匹配——「Jumbo Seafood」⊂「Jumbo Seafood（珍宝海鲜）」；
 * 太短的名字只认全等，防误连。航班对账：航班号去空白后在记录全文里出现即算已订。
 */
export const bareName = (s: string) =>
  s.trim().toLowerCase().replace(/[（(][^）)]*[）)]/g, "").trim();

export const nameHit = (a: string, b: string) => {
  const x = bareName(a);
  const y = bareName(b);
  if (!x || !y) return false;
  if (x.length < 3 || y.length < 3) return x === y;
  return x === y || x.includes(y) || y.includes(x);
};

export const flightNoHit = (flightNo: string | undefined, pool: string[]) => {
  const no = (flightNo ?? "").replace(/\s+/g, "").toLowerCase();
  if (no.length < 4) return false;
  return pool.some((h) => h.includes(no));
};
