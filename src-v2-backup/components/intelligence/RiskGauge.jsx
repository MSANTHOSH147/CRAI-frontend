// Semi-circular risk gauge. Deliberately shows "—  UNKNOWN"
// rather than a fake needle position when riskScore is null —
// CRAI never manufactures certainty from missing evidence.
const LEVEL_COLOR = {
  low: "var(--crai-green-500)",
  moderate: "var(--crai-amber)",
  high: "#C1622F",
  critical: "var(--crai-red)",
};

export default function RiskGauge({ score, level, decisionReady }) {
  const known = decisionReady && typeof score === "number";
  const pct = known ? Math.max(0, Math.min(100, score)) / 100 : 0;
  const color = known ? (LEVEL_COLOR[String(level || "").toLowerCase()] || "var(--crai-green-500)") : "var(--crai-unknown)";

  // Semi-circle arc geometry
  const r = 80;
  const cx = 100, cy = 100;
  const circumference = Math.PI * r;
  const dash = known ? circumference * pct : 0;

  return (
    <div className="crai-gauge">
      <svg viewBox="0 0 200 118" fill="none">
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          stroke="var(--crai-border-strong)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {known && (
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
        )}
      </svg>
      <div className="crai-gauge__center">
        <span className={`crai-gauge__value${known ? "" : " crai-gauge__value--unknown"}`}>
          {known ? Math.round(score) : "—"}
        </span>
        <span className="crai-gauge__label">{known ? (level || "risk") : "Unknown"}</span>
      </div>
    </div>
  );
}
