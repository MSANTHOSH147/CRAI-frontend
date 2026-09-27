import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchCurrentEvent,
  fetchSystemStatus,
} from "../services/craiData";
import { useLanguage } from "../app/LanguageContext";

function riskKey(level) {
  return String(level || "unknown").toLowerCase();
}

function translateRisk(level, t) {
  const key = riskKey(level);

  if (key === "low") return t("low");
  if (key === "moderate") return t("moderate");
  if (key === "high") return t("high");
  if (key === "critical") return t("critical");

  return t("unknown");
}

function evidenceLabel(value, t) {
  if (value === true || value === "AVAILABLE") return t("available");
  if (value === false || value === "MISSING") return t("unavailable");
  return t("unknown");
}

function sourceLabel(source, t) {
  const value = String(source || "").toUpperCase();

  if (value.includes("REAL") || value.includes("LIVE")) {
    return t("liveHardware");
  }

  if (value.includes("SIM")) {
    return t("simulatedHardware");
  }

  return t("unknown");
}

function getEvidence(event) {
  const evidence =
    event?.evidence ||
    event?.evidenceFusion ||
    event?.evidence_fusion ||
    {};

  return {
    visual:
      evidence?.visual ??
      event?.visualEvidence ??
      event?.visual_evidence,

    environmental:
      evidence?.environmental ??
      evidence?.environment ??
      event?.environmentalEvidence,

    temporal:
      evidence?.temporal ??
      event?.temporalEvidence,

    spatial:
      evidence?.spatial ??
      event?.spatialEvidence,
  };
}

export default function FarmerHome() {
  const { t } = useLanguage();

  const [event, setEvent] = useState(null);
  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHome() {
    setLoading(true);
    setError("");

    try {
      const [currentEvent, systemStatus] = await Promise.all([
        fetchCurrentEvent(1, "A1"),
        fetchSystemStatus(),
      ]);

      setEvent(currentEvent);
      setSystem(systemStatus);
    } catch (err) {
      setError(err?.message || t("connectionIssue"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHome();

    const timer = window.setInterval(loadHome, 30000);

    return () => window.clearInterval(timer);
  }, []);

  const evidence = getEvidence(event);

  const riskLevel = event?.riskLevel || null;

  const riskScore =
    event?.riskScore !== null &&
    event?.riskScore !== undefined &&
    event?.riskScore !== ""
      ? Number(event.riskScore)
      : null;

  const decisionReady =
    event?.decisionReady ??
    event?.decision_ready ??
    (riskScore !== null);

  const source = sourceLabel(
    event?.source ||
      event?.sensorSource ||
      event?.sensor?.source,
    t
  );

  const backendOnline = system?.backend === "online";

  const temperature =
    event?.temperature ??
    event?.sensorData?.temperature ??
    event?.sensor?.temperature;

  const humidity =
    event?.humidity ??
    event?.sensorData?.humidity ??
    event?.sensor?.humidity;

  const soilMoisture =
    event?.soilMoisture ??
    event?.soil_moisture ??
    event?.sensorData?.soil_moisture ??
    event?.sensor?.soil_moisture;

  return (
    <div className="cr-home-page">
      {/* Header */}
      <section className="cr-home-welcome">
        <div>
          <span className="cr-home-eyebrow">
            CRAI · {t("farmer")}
          </span>

          <h1>
            {t("home")}
          </h1>

          <p>
            {languageAwareIntro(t)}
          </p>
        </div>

        <div
          className={`cr-home-connection ${
            backendOnline ? "online" : "offline"
          }`}
        >
          <span />
          {backendOnline ? t("online") : t("offline")}
        </div>
      </section>

      {error && (
        <div className="cr-home-error">
          <strong>{t("connectionIssue")}</strong>
          <span>{error}</span>
          <button onClick={loadHome}>{t("retry")}</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <section className="cr-home-loading">
          <div className="cr-loading-line large" />
          <div className="cr-loading-line" />
          <div className="cr-loading-grid">
            <div />
            <div />
            <div />
          </div>
        </section>
      )}

      {/* Main dashboard */}
      {!loading && (
        <>
          {/* Field + risk */}
          <section className="cr-home-primary-grid">
            <div className="cr-home-card cr-field-card">
              <div className="cr-card-top">
                <div>
                  <span className="cr-card-label">
                    {t("field")}
                  </span>

                  <h2>
                    {event?.fieldName ||
                      event?.zoneName ||
                      "A1"}
                  </h2>

                  <span className="cr-card-muted">
                    {event?.crop || "Tomato"} ·{" "}
                    {event?.zoneId || "A1"}
                  </span>
                </div>

                <span className="cr-field-status">
                  {event ? t("available") : t("unknown")}
                </span>
              </div>

              <div className="cr-field-details">
                <div>
                  <span>{t("crop")}</span>
                  <strong>
                    {event?.crop || "—"}
                  </strong>
                </div>

                <div>
                  <span>{t("source") || "Source"}</span>
                  <strong>{source}</strong>
                </div>
              </div>

              <Link
                to="/field/A1"
                className="cr-home-secondary-button"
              >
                {t("details")} →
              </Link>
            </div>

            <div
              className={`cr-home-card cr-risk-card ${riskKey(
                riskLevel
              )}`}
            >
              <div className="cr-card-top">
                <div>
                  <span className="cr-card-label">
                    {t("risk")}
                  </span>

                  <h2>
                    {riskLevel
                      ? translateRisk(riskLevel, t)
                      : t("unknown")}
                  </h2>
                </div>

                <div className="cr-risk-score">
                  {riskScore !== null
                    ? Math.round(riskScore)
                    : "—"}
                  <small>/100</small>
                </div>
              </div>

              <div className="cr-risk-message">
                {decisionReady && event?.action
                  ? event.action
                  : riskLevel
                    ? t("recommendation")
                    : t("moreEvidence")}
              </div>

              <Link
                to="/expert"
                className="cr-home-secondary-button"
              >
                {t("details")} →
              </Link>
            </div>
          </section>

          {/* Decision */}
          <section className="cr-home-card cr-decision-card">
            <div className="cr-card-top">
              <div>
                <span className="cr-card-label">
                  {t("decision")}
                </span>

                <h2>
                  {decisionReady && event?.action
                    ? event.action
                    : t("moreEvidence")}
                </h2>
              </div>

              <span className="cr-decision-badge">
                {decisionReady
                  ? t("available")
                  : t("unknown")}
              </span>
            </div>

            <p>
              {decisionReady
                ? decisionExplanation(event, t)
                : t("moreEvidence")}
            </p>
          </section>

          {/* Evidence */}
          <section className="cr-home-card">
            <div className="cr-card-top">
              <div>
                <span className="cr-card-label">
                  {t("evidenceTitle")}
                </span>

                <h2>{t("availableEvidence")}</h2>
              </div>

              <Link
                to={
                  event?.eventId
                    ? `/evidence/${event.eventId}`
                    : "/expert"
                }
                className="cr-text-link"
              >
                {t("details")} →
              </Link>
            </div>

            <div className="cr-evidence-grid">
              <EvidenceItem
                label={t("visual")}
                value={evidenceLabel(
                  evidence.visual,
                  t
                )}
                available={
                  evidence.visual === true ||
                  evidence.visual === "AVAILABLE"
                }
              />

              <EvidenceItem
                label={t("environmental")}
                value={evidenceLabel(
                  evidence.environmental,
                  t
                )}
                available={
                  evidence.environmental === true ||
                  evidence.environmental === "AVAILABLE"
                }
              />

              <EvidenceItem
                label={t("temporal")}
                value={evidenceLabel(
                  evidence.temporal,
                  t
                )}
                available={
                  evidence.temporal === true ||
                  evidence.temporal === "AVAILABLE"
                }
              />

              <EvidenceItem
                label={t("spatial")}
                value={evidenceLabel(
                  evidence.spatial,
                  t
                )}
                available={
                  evidence.spatial === true ||
                  evidence.spatial === "AVAILABLE"
                }
              />
            </div>
          </section>

          {/* Conditions */}
          <section className="cr-home-card">
            <div className="cr-card-top">
              <div>
                <span className="cr-card-label">
                  {t("fieldConditions")}
                </span>

                <h2>{event?.crop || "—"}</h2>
              </div>

              <span className="cr-card-muted">
                {source}
              </span>
            </div>

            <div className="cr-condition-grid">
              <Condition
                label="°C"
                value={temperature}
                name={
                  t("temperature") ||
                  (getCurrentLanguage() === "ta"
                    ? "வெப்பநிலை"
                    : "Temperature")
                }
              />

              <Condition
                label="%"
                value={humidity}
                name={
                  t("humidity") ||
                  (getCurrentLanguage() === "ta"
                    ? "ஈரப்பதம்"
                    : "Humidity")
                }
              />

              <Condition
                label="%"
                value={soilMoisture}
                name={
                  t("soilMoisture") ||
                  (getCurrentLanguage() === "ta"
                    ? "மண் ஈரப்பதம்"
                    : "Soil Moisture")
                }
              />
            </div>
          </section>

          {/* Primary actions */}
          <section className="cr-home-action-grid">
            <Link
              to="/check"
              className="cr-home-action primary"
            >
              <span className="cr-home-action-icon">
                +
              </span>

              <span>
                <strong>{t("checkMyCrop")}</strong>
                <small>
                  {t("selectCropImage")}
                </small>
              </span>

              <b>→</b>
            </Link>

            <Link
              to="/ask-crai"
              className="cr-home-action"
            >
              <span className="cr-home-action-icon">
                ✦
              </span>

              <span>
                <strong>{t("askCrai")}</strong>
                <small>
                  {t("askForGuidance")}
                </small>
              </span>

              <b>→</b>
            </Link>
          </section>
        </>
      )}

      <style>{`
        .cr-home-page {
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
          padding: 22px 20px 42px;
          color: #17201c;
        }

        .cr-home-welcome {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 17px;
        }

        .cr-home-eyebrow,
        .cr-card-label {
          display: block;
          color: #78847e;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: .12em;
        }

        .cr-home-welcome h1 {
          margin: 4px 0 0;
          font-size: 27px;
          line-height: 1.1;
          letter-spacing: -.025em;
        }

        .cr-home-welcome p {
          margin: 7px 0 0;
          color: #68746e;
          font-size: 13px;
        }

        .cr-home-connection {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 9px;
          border: 1px solid #dfe7e1;
          border-radius: 999px;
          background: #fff;
          color: #68746e;
          font-size: 9px;
          font-weight: 800;
        }

        .cr-home-connection span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .cr-home-connection.online {
          color: #176246;
          background: #edf7f1;
          border-color: #cfe5d8;
        }

        .cr-home-connection.offline {
          color: #8a5a10;
          background: #fff8e8;
          border-color: #f0dfb6;
        }

        .cr-home-error {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-wrap: wrap;
          margin-bottom: 13px;
          padding: 10px 12px;
          border: 1px solid #f0dfb6;
          border-radius: 9px;
          background: #fff8e8;
          color: #795313;
          font-size: 11px;
        }

        .cr-home-error button {
          margin-left: auto;
          border: 1px solid #dfc98e;
          background: #fff;
          border-radius: 7px;
          padding: 5px 9px;
          color: #6d4d0d;
          font-size: 10px;
          font-weight: 750;
          cursor: pointer;
        }

        .cr-home-primary-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 12px;
          margin-bottom: 12px;
        }

        .cr-home-card {
          background: #fff;
          border: 1px solid #dfe7e1;
          border-radius: 13px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .cr-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .cr-home-card h2 {
          margin: 4px 0 0;
          font-size: 17px;
          line-height: 1.25;
          letter-spacing: -.015em;
        }

        .cr-card-muted {
          display: block;
          margin-top: 4px;
          color: #7b8780;
          font-size: 11px;
        }

        .cr-field-status,
        .cr-decision-badge {
          padding: 5px 8px;
          border-radius: 999px;
          background: #edf7f1;
          color: #176246;
          font-size: 8px;
          font-weight: 850;
          white-space: nowrap;
        }

        .cr-field-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 18px;
          padding-top: 13px;
          border-top: 1px solid #edf1ee;
        }

        .cr-field-details span {
          display: block;
          color: #89938e;
          font-size: 9px;
        }

        .cr-field-details strong {
          display: block;
          margin-top: 3px;
          font-size: 12px;
        }

        .cr-home-secondary-button {
          display: inline-block;
          margin-top: 14px;
          padding: 7px 10px;
          border: 1px solid #dfe7e1;
          border-radius: 7px;
          color: #145a45;
          background: #fafcfb;
          text-decoration: none;
          font-size: 10px;
          font-weight: 750;
        }

        .cr-home-secondary-button:hover {
          background: #edf5f0;
        }

        .cr-risk-card.low {
          border-color: #cfe5d8;
        }

        .cr-risk-card.moderate {
          border-color: #ead8ac;
        }

        .cr-risk-card.high,
        .cr-risk-card.critical {
          border-color: #e6c9c9;
        }

        .cr-risk-score {
          color: #145a45;
          font-size: 30px;
          line-height: 1;
          font-weight: 820;
          letter-spacing: -.04em;
        }

        .cr-risk-score small {
          margin-left: 2px;
          color: #89938e;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0;
        }

        .cr-risk-message {
          min-height: 38px;
          margin-top: 17px;
          padding-top: 12px;
          border-top: 1px solid #edf1ee;
          color: #56635c;
          font-size: 12px;
          line-height: 1.5;
        }

        .cr-decision-card {
          display: block;
        }

        .cr-decision-card p {
          max-width: 850px;
          margin: 8px 0 0;
          color: #66726c;
          font-size: 12px;
          line-height: 1.55;
        }

        .cr-text-link {
          color: #145a45;
          text-decoration: none;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .cr-evidence-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-top: 14px;
        }

        .cr-evidence-item {
          min-width: 0;
          padding: 10px;
          border: 1px solid #e6ece8;
          border-radius: 9px;
          background: #fafcfb;
        }

        .cr-evidence-item strong {
          display: block;
          font-size: 11px;
        }

        .cr-evidence-state {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 5px;
          color: #78847e;
          font-size: 9px;
        }

        .cr-evidence-state span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #a0aaa5;
        }

        .cr-evidence-state.available {
          color: #176246;
        }

        .cr-evidence-state.available span {
          background: #2d8a63;
        }

        .cr-condition-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 14px;
        }

        .cr-condition {
          padding: 11px;
          border: 1px solid #e6ece8;
          border-radius: 9px;
          background: #fafcfb;
        }

        .cr-condition-name {
          display: block;
          color: #7b8780;
          font-size: 9px;
        }

        .cr-condition-value {
          display: block;
          margin-top: 4px;
          font-size: 16px;
          font-weight: 780;
        }

        .cr-condition-unit {
          color: #7b8780;
          font-size: 9px;
          margin-left: 2px;
        }

        .cr-home-action-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .cr-home-action {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 68px;
          padding: 11px 13px;
          border: 1px solid #dfe7e1;
          border-radius: 11px;
          background: #fff;
          color: #17201c;
          text-decoration: none;
        }

        .cr-home-action:hover {
          border-color: #b8cfc3;
          background: #f8fbf9;
        }

        .cr-home-action.primary {
          background: #edf5f0;
          border-color: #cfe1d7;
        }

        .cr-home-action-icon {
          width: 34px;
          height: 34px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #145a45;
          color: #fff;
          font-size: 18px;
          font-weight: 500;
        }

        .cr-home-action:not(.primary) .cr-home-action-icon {
          background: #f0f4f2;
          color: #145a45;
        }

        .cr-home-action span:nth-child(2) {
          min-width: 0;
          flex: 1;
        }

        .cr-home-action strong {
          display: block;
          font-size: 12px;
        }

        .cr-home-action small {
          display: block;
          margin-top: 3px;
          color: #78847e;
          font-size: 9px;
          line-height: 1.35;
        }

        .cr-home-action b {
          color: #145a45;
          font-size: 15px;
        }

        .cr-home-loading {
          display: grid;
          gap: 10px;
        }

        .cr-loading-line {
          height: 14px;
          width: 45%;
          border-radius: 6px;
          background: #e9efeb;
          animation: crPulse 1.3s ease-in-out infinite;
        }

        .cr-loading-line.large {
          width: 24%;
          height: 25px;
        }

        .cr-loading-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .cr-loading-grid div {
          height: 110px;
          border-radius: 12px;
          background: #e9efeb;
          animation: crPulse 1.3s ease-in-out infinite;
        }

        @keyframes crPulse {
          0%, 100% {
            opacity: .55;
          }
          50% {
            opacity: 1;
          }
        }

        @media (max-width: 900px) {
          .cr-home-page {
            padding: 17px 14px 95px;
          }

          .cr-home-primary-grid,
          .cr-home-action-grid {
            grid-template-columns: 1fr;
          }

          .cr-home-welcome h1 {
            font-size: 23px;
          }

          .cr-evidence-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 500px) {
          .cr-home-welcome {
            gap: 8px;
          }

          .cr-home-connection {
            font-size: 8px;
          }

          .cr-evidence-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .cr-condition-grid {
            grid-template-columns: 1fr 1fr;
          }

          .cr-condition:last-child {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </div>
  );
}

function EvidenceItem({ label, value, available }) {
  return (
    <div className="cr-evidence-item">
      <strong>{label}</strong>

      <div
        className={`cr-evidence-state ${
          available ? "available" : ""
        }`}
      >
        <span />
        {value}
      </div>
    </div>
  );
}

function Condition({ name, value, label }) {
  const numeric =
    value !== null &&
    value !== undefined &&
    value !== "" &&
    !Number.isNaN(Number(value));

  return (
    <div className="cr-condition">
      <span className="cr-condition-name">{name}</span>

      <span className="cr-condition-value">
        {numeric ? Number(value).toFixed(1) : "—"}

        {numeric && (
          <span className="cr-condition-unit">
            {label}
          </span>
        )}
      </span>
    </div>
  );
}

function decisionExplanation(event, t) {
  if (!event) return t("moreEvidence");

  if (event.action) {
    return event.action;
  }

  if (event.decision) {
    return event.decision;
  }

  return t("recommendation");
}

function languageAwareIntro(t) {
  return t("homeIntro");
}
