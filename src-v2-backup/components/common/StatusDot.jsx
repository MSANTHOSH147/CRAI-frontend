const MAP = { good: "good", warn: "warn", bad: "bad" };

export default function StatusDot({ status }) {
  const cls = MAP[status] || "unknown";
  return <span className={`crai-status-dot crai-status-dot--${cls}`} />;
}
