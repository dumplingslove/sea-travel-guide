/** 行程规划工具（P3 移植自 space-3，含 7 项诚实度修复），全视口 iframe 嵌入独立页面。 */
export default function Planner() {
  return (
    <iframe
      src={`${import.meta.env.BASE_URL}planner/index.html`}
      title="行程规划工具"
      style={{ width: "100%", height: "100dvh", border: 0, display: "block" }}
    />
  );
}
