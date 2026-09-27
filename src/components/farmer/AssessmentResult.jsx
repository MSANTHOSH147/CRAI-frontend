import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Eye,
  Thermometer,
  Activity,
  MapPin,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

function EvidenceCard({ icon: Icon, title, status, text }) {
  const normalized = String(status || "UNKNOWN").toLowerCase();

  return (
    <div className="assessment-evidence-card">
      <div className="assessment-evidence-icon">
        <Icon size={18} />
      </div>

      <div>
        <div className="assessment-evidence-title">
          {title}
        </div>

        <span className={`assessment-status status-${normalized}`}>
          {status || "UNKNOWN"}
        </span>

        <p>{text}</p>
      </div>
    </div>
  );
}

export default function AssessmentResult({
  result,
  imagePreview,
  onEvidence,
  onAsk
}) {
  const analysis = result?.analysis || {};
  const decision =
    analysis?.decision ||
    analysis?.judge_intelligence?.authoritative_outputs ||
    {};

  const risk =
    result?.event?.risk_score ??
    analysis?.risk?.score ??
    decision?.risk_score ??
    null;

  const level =
    result?.event?.risk_level ??
    analysis?.risk?.level ??
    decision?.risk_level ??
    "UNKNOWN";

  const action =
    result?.event?.action ??
    decision?.decision_action ??
    analysis?.decision?.action ??
    "MONITOR";

  const evidence =
    analysis?.evidence ||
    result?.event?.evidence ||
    {};

  const ready =
    analysis?.decision?.ready ??
    decision?.decision_ready ??
    (risk != null);

  const visual =
    evidence?.available?.visual === true ||
    evidence?.visual?.available === true;

  const environmental =
    evidence?.available?.environmental === true ||
    evidence?.environmental?.available === true;

  const temporal =
    evidence?.available?.temporal === true ||
    evidence?.temporal?.available === true;

  const spatial =
    evidence?.available?.spatial === true ||
    evidence?.spatial?.available === true;

  return (
    <div className="assessment-result">
      <div className="assessment-result-head">
        <div>
          <div className="eyebrow">CRAI ASSESSMENT RESULT</div>
          <h2>What CRAI found</h2>
          <p>
            The deterministic CRAI engine remains authoritative.
            Qwen only explains the result.
          </p>
        </div>

        <ShieldCheck size={28} />
      </div>

      <div className="assessment-result-main">
        {imagePreview ? (
          <div className="assessment-result-image">
            <img src={imagePreview} alt="Crop observation" />
            <span>Crop observation</span>
          </div>
        ) : (
          <div className="assessment-result-image assessment-no-image">
            <Eye size={30} />
            <span>Crop image not attached</span>
          </div>
        )}

        <div className="assessment-decision">
          <span className="eyebrow">DETERMINISTIC DECISION</span>

          <div className="assessment-risk-number">
            {ready && risk != null ? Math.round(risk) : "—"}
            <small>/100</small>
          </div>

          <div className={`assessment-risk-level level-${String(level).toLowerCase()}`}>
            {ready ? level : "MORE EVIDENCE NEEDED"}
          </div>

          <div className="assessment-action">
            <span>Action</span>
            <strong>{action}</strong>
          </div>

          {!ready && (
            <div className="assessment-warning">
              <AlertTriangle size={16} />
              CRAI does not convert missing evidence into zero risk.
            </div>
          )}
        </div>
      </div>

      <div className="assessment-section-title">
        <span>WHAT CRAI FOUND</span>
        <small>Evidence state</small>
      </div>

      <div className="assessment-evidence-grid">
        <EvidenceCard
          icon={Eye}
          title="Visual"
          status={visual ? "AVAILABLE" : "MISSING"}
          text={
            visual
              ? "Crop image evidence is available."
              : "No usable visual evidence is currently attached."
          }
        />

        <EvidenceCard
          icon={Thermometer}
          title="Environment"
          status={environmental ? "AVAILABLE" : "MISSING"}
          text={
            environmental
              ? "Environmental telemetry is available."
              : "Fresh environmental evidence is not available."
          }
        />

        <EvidenceCard
          icon={Activity}
          title="Temporal"
          status={temporal ? "AVAILABLE" : "MISSING"}
          text={
            temporal
              ? "Recent field history is available."
              : "More observations are needed."
          }
        />

        <EvidenceCard
          icon={MapPin}
          title="Spatial"
          status={spatial ? "AVAILABLE" : "MISSING"}
          text={
            spatial
              ? "Zone context is available."
              : "Spatial context is not available."
          }
        />
      </div>

      <div className="assessment-explanation">
        <div>
          <div className="eyebrow">WHY THIS DECISION?</div>
          <h3>Evidence → Fusion → Decision</h3>
          <p>
            CRAI combines the available evidence sources and then
            applies its deterministic risk engine. The conversational
            AI does not calculate or override this decision.
          </p>
        </div>

        <CheckCircle2 size={25} />
      </div>

      <div className="assessment-result-actions">
        {result?.event?.event_id && (
          <button
            className="primary-button"
            onClick={onEvidence}
          >
            View Evidence Package
            <ArrowRight size={17} />
          </button>
        )}

        <button
          className="soft-button"
          onClick={onAsk}
        >
          Ask CRAI about this result
        </button>
      </div>
    </div>
  );
}
