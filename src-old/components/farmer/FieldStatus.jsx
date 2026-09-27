import React from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, CircleHelp, ShieldAlert } from "lucide-react";
import { navigate } from "../../app/routes";
import { riskTone, riskLabel } from "../../services/craiData";

export default function FieldStatus({ event }) {
  const score = event?.riskScore;
  const level = riskLabel(score, event?.riskLevel);
  const tone = riskTone(level);
  const attention = ["HIGH", "CRITICAL", "MODERATE"].includes(level);

  return (
    <section className={`field-status-card tone-${tone}`}>
      <div className="card-kicker">MY FIELD · ZONE A1</div>
      <div className="field-status-top">
        <div>
          <h2>{event?.crop || "Crop information unavailable"}</h2>
          <p>{event?.growthStage || "Field context unavailable"}</p>
        </div>
        <div className="status-pill">
          {level === "UNKNOWN" ? <CircleHelp size={16} /> : level === "LOW" ? <CheckCircle2 size={16} /> : level === "CRITICAL" ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
          {level}
        </div>
      </div>

      <div className="risk-display">
        <div className="risk-number">{score == null ? "—" : Number(score).toFixed(0)}</div>
        <div>
          <span>/ 100</span>
          <strong>FIELD RISK</strong>
        </div>
      </div>

      <p className="meaning-line">
        {level === "UNKNOWN"
          ? "More evidence is needed before CRAI can make a risk decision."
          : attention
          ? "Your field needs attention."
          : "No immediate protective action is indicated by the current risk state."}
      </p>

      <button className="primary-action" onClick={() => navigate(event?.eventId ? `/fields/${event.eventId}` : "/fields")}>
        View assessment <ArrowRight size={17} />
      </button>
    </section>
  );
}
