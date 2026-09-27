export default function EvidenceCard({ icon: Icon, title, status, tone = "ok" }) {
  return (
    <div className="crai-evidence-card">
      <div className={`crai-evidence-card__icon${tone !== "ok" ? ` ${tone}` : ""}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="crai-title-md">{title}</div>
        <div className="crai-muted">{status}</div>
      </div>
    </div>
  );
}
