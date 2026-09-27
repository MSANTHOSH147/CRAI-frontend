export default function Metric({ label, value, unknown = false, delta, deltaDirection = "up" }) {
  return (
    <div className="crai-metric">
      <span className="crai-metric__label">{label}</span>
      <span className={`crai-metric__value${unknown ? " crai-metric__value--unknown" : ""}`}>
        {unknown ? "—" : value}
      </span>
      {delta && <span className={`crai-metric__delta ${deltaDirection}`}>{delta}</span>}
    </div>
  );
}
