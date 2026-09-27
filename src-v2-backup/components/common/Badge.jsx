// Maps CRAI's risk levels to the correct visual treatment.
// "unknown" is a first-class state here, not a fallback color.
const LEVELS = {
  low: "low",
  moderate: "moderate",
  high: "high",
  critical: "critical",
  info: "info",
};

export default function Badge({ level, children, dot = true, className = "" }) {
  const normalized = LEVELS[String(level || "").toLowerCase()] || "unknown";
  return (
    <span className={`crai-badge crai-badge--${normalized} ${className}`}>
      {dot && <span className="crai-badge__dot" />}
      {children || (normalized === "unknown" ? "Unknown" : normalized)}
    </span>
  );
}
