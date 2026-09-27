import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchActiveEvents,
  fetchEvents,
  fetchSystemStatus,
} from "../services/craiData";
import { useLanguage } from "../app/LanguageContext";

function getRiskClass(level) {
  return String(level || "unknown").toLowerCase();
}

function riskText(level, t) {
  const key = getRiskClass(level);

  if (key === "low") return t("low");
  if (key === "moderate") return t("moderate");
  if (key === "high") return t("high");
  if (key === "critical") return t("critical");

  return t("unknown");
}

function sourceText(source, t) {
  const value = String(source || "").toUpperCase();

  if (value.includes("REAL") || value.includes("LIVE")) {
    return t("liveHardware");
  }

  if (value.includes("SIM")) {
    return t("simulatedHardware");
  }

  return t("unknown");
}

function evidenceCount(event) {
  const evidence =
    event?.evidence ||
    event?.evidenceFusion ||
    event?.evidence_fusion ||
    {};

  return [
    evidence.visual,
    evidence.environmental,
    evidence.temporal,
    evidence.spatial,
  ].filter(
    (item) => item === true || item === "AVAILABLE"
  ).length;
}

export default function FieldsPage() {
  const { t } = useLanguage();

  const [fields, setFields] = useState([]);
  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadFields() {
    setLoading(true);
    setError("");

    try {
      const [activeResult, systemResult] =
        await Promise.all([
          fetchActiveEvents(),
          fetchSystemStatus(),
        ]);

      let events = activeResult || [];

      /*
       * If there are no active events, use the latest
       * backend event for the known demo field.
       *
       * This is still backend data — never fabricated.
       */
      if (!events.length) {
        try {
          const latest = await fetchEvents(
            1,
            "A1",
            1
          );

          if (latest?.length) {
            events = latest;
          }
        } catch {
          // Keep the screen in a valid empty state.
        }
      }

      setFields(events);
      setSystem(systemResult);
    } catch (err) {
      setError(err?.message || t("connectionIssue"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFields();

    const timer = window.setInterval(
      loadFields,
      30000
    );

    return () => window.clearInterval(timer);
  }, []);

  const backendOnline =
    system?.backend === "online";

  return (
    <div className="cr-fields-page">
      {/* Header */}
      <section className="cr-fields-header">
        <div>
          <span className="cr-fields-eyebrow">
            CRAI · {t("farmer")}
          </span>

          <h1>{t("fields")}</h1>

          <p>
            {getLanguage() === "ta"
              ? "உங்கள் வயல்களின் தற்போதைய நிலையை ஒரே இடத்தில் பார்க்கவும்."
              : "See the current condition of your fields in one place."}
          </p>
        </div>

        <div
          className={`cr-fields-connection ${
            backendOnline ? "online" : "offline"
          }`}
        >
          <span />
          {backendOnline
            ? t("online")
            : t("offline")}
        </div>
      </section>

      {error && (
        <div className="cr-fields-error">
          <strong>{t("connectionIssue")}</strong>
          <span>{error}</span>

          <button onClick={loadFields}>
            {t("retry")}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="cr-fields-loading">
          <div />
          <div />
        </div>
      )}

      {/* Empty */}
      {!loading && !error && !fields.length && (
        <section className="cr-fields-empty">
          <div className="cr-fields-empty-icon">
            ▦
          </div>

          <h2>{t("noFields")}</h2>

          <p>
            {getLanguage() === "ta"
              ? "CRAI-க்கு இதுவரை வயல் நிகழ்வு தரவு கிடைக்கவில்லை."
              : "CRAI has not received field event data yet."}
          </p>

          <Link
            to="/check"
            className="cr-fields-primary-button"
          >
            {t("checkMyCrop")}
          </Link>
        </section>
      )}

      {/* Fields */}
      {!loading && fields.length > 0 && (
        <section className="cr-fields-list">
          {fields.map((field, index) => (
            <FieldCard
              key={
                field.eventId ||
                `${field.zoneId}-${index}`
              }
              field={field}
              t={t}
            />
          ))}
        </section>
      )}

      {/* Check crop */}
      <section className="cr-fields-action">
        <div>
          <span className="cr-fields-action-icon">
            +
          </span>

          <div>
            <strong>{t("checkMyCrop")}</strong>

            <p>
              {getLanguage() === "ta"
                ? "புதிய பயிர் படத்தை CRAI-க்கு அனுப்புங்கள்."
                : "Send a new crop image to CRAI for analysis."}
            </p>
          </div>
        </div>

        <Link to="/check">
          {t("checkCrop")} →
        </Link>
      </section>

      <style>{`
        .cr-fields-page {
          width: 100%;
          max-width: 1050px;
          margin: 0 auto;
          padding: 22px 20px 42px;
          color: #17201c;
        }

        .cr-fields-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 18px;
        }

        .cr-fields-eyebrow {
          display: block;
          color: #78847e;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: .12em;
        }

        .cr-fields-header h1 {
          margin: 4px 0 0;
          font-size: 27px;
          line-height: 1.1;
          letter-spacing: -.025em;
        }

        .cr-fields-header p {
          margin: 7px 0 0;
          color: #68746e;
          font-size: 13px;
        }

        .cr-fields-connection {
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
          white-space: nowrap;
        }

        .cr-fields-connection span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .cr-fields-connection.online {
          color: #176246;
          background: #edf7f1;
          border-color: #cfe5d8;
        }

        .cr-fields-connection.offline {
          color: #8a5a10;
          background: #fff8e8;
          border-color: #f0dfb6;
        }

        .cr-fields-error {
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

        .cr-fields-error button {
          margin-left: auto;
          padding: 5px 9px;
          border: 1px solid #dfc98e;
          border-radius: 7px;
          background: #fff;
          color: #6d4d0d;
          font-size: 10px;
          font-weight: 750;
          cursor: pointer;
        }

        .cr-fields-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 11px;
        }

        .cr-field-item {
          min-width: 0;
          padding: 15px;
          border: 1px solid #dfe7e1;
          border-radius: 12px;
          background: #fff;
        }

        .cr-field-item-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .cr-field-item-label {
          display: block;
          color: #7c8781;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .08em;
        }

        .cr-field-item h2 {
          margin: 4px 0 0;
          font-size: 16px;
          line-height: 1.2;
        }

        .cr-field-item-sub {
          margin-top: 3px;
          color: #78847e;
          font-size: 10px;
        }

        .cr-field-risk {
          flex: 0 0 auto;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 850;
          background: #f1f4f2;
          color: #65736c;
        }

        .cr-field-risk.low {
          background: #edf7f1;
          color: #176246;
        }

        .cr-field-risk.moderate {
          background: #fff8e8;
          color: #8a5a10;
        }

        .cr-field-risk.high,
        .cr-field-risk.critical {
          background: #fff0f0;
          color: #9a3939;
        }

        .cr-field-item-main {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: end;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid #edf1ee;
        }

        .cr-field-action-label {
          color: #78847e;
          font-size: 9px;
        }

        .cr-field-action {
          margin-top: 4px;
          color: #3f4c46;
          font-size: 11px;
          line-height: 1.4;
        }

        .cr-field-score {
          color: #145a45;
          font-size: 22px;
          line-height: 1;
          font-weight: 820;
        }

        .cr-field-score small {
          color: #8a958f;
          font-size: 8px;
          font-weight: 700;
        }

        .cr-field-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 11px;
        }

        .cr-field-meta span {
          padding: 4px 6px;
          border: 1px solid #e4eae6;
          border-radius: 6px;
          background: #fafcfb;
          color: #738079;
          font-size: 8px;
          font-weight: 700;
        }

        .cr-field-view {
          display: inline-block;
          margin-top: 11px;
          color: #145a45;
          text-decoration: none;
          font-size: 10px;
          font-weight: 800;
        }

        .cr-fields-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-top: 14px;
          padding: 13px 15px;
          border: 1px solid #cfe1d7;
          border-radius: 11px;
          background: #edf5f0;
        }

        .cr-fields-action > div {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .cr-fields-action-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 9px;
          background: #145a45;
          color: #fff;
          font-size: 18px;
        }

        .cr-fields-action strong {
          display: block;
          font-size: 12px;
        }

        .cr-fields-action p {
          margin: 3px 0 0;
          color: #708078;
          font-size: 9px;
        }

        .cr-fields-action a {
          flex: 0 0 auto;
          color: #145a45;
          text-decoration: none;
          font-size: 10px;
          font-weight: 800;
        }

        .cr-fields-empty {
          padding: 34px 20px;
          border: 1px dashed #ccd9d1;
          border-radius: 13px;
          background: #fbfcfb;
          text-align: center;
        }

        .cr-fields-empty-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          margin: 0 auto 10px;
          border-radius: 11px;
          background: #edf5f0;
          color: #145a45;
          font-size: 20px;
        }

        .cr-fields-empty h2 {
          margin: 0;
          font-size: 16px;
        }

        .cr-fields-empty p {
          max-width: 430px;
          margin: 6px auto 14px;
          color: #77847d;
          font-size: 11px;
          line-height: 1.5;
        }

        .cr-fields-primary-button {
          display: inline-block;
          padding: 8px 12px;
          border-radius: 8px;
          background: #145a45;
          color: #fff;
          text-decoration: none;
          font-size: 10px;
          font-weight: 800;
        }

        .cr-fields-loading {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 11px;
        }

        .cr-fields-loading div {
          height: 170px;
          border-radius: 12px;
          background: #e9efeb;
          animation: crFieldsPulse 1.3s ease-in-out infinite;
        }

        @keyframes crFieldsPulse {
          0%, 100% {
            opacity: .55;
          }
          50% {
            opacity: 1;
          }
        }

        @media (max-width: 700px) {
          .cr-fields-page {
            padding: 17px 14px 95px;
          }

          .cr-fields-header h1 {
            font-size: 23px;
          }

          .cr-fields-list {
            grid-template-columns: 1fr;
          }

          .cr-fields-loading {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 450px) {
          .cr-fields-header {
            gap: 8px;
          }

          .cr-fields-connection {
            font-size: 8px;
          }

          .cr-fields-action {
            align-items: flex-start;
            flex-direction: column;
          }

          .cr-fields-action a {
            margin-left: 44px;
          }
        }
      `}</style>
    </div>
  );
}

function FieldCard({ field, t }) {
  const risk = field?.riskLevel;
  const score =
    field?.riskScore !== null &&
    field?.riskScore !== undefined &&
    field?.riskScore !== ""
      ? Number(field.riskScore)
      : null;

  const eventId = field?.eventId;
  const zone = field?.zoneId || "A1";
  const crop = field?.crop || "—";

  const action =
    field?.action ||
    field?.duringState ||
    field?.decision ||
    t("moreEvidence");

  const source = sourceText(
    field?.source ||
      field?.sensorSource ||
      field?.sensor?.source,
    t
  );

  const count = evidenceCount(field);

  return (
    <article className="cr-field-item">
      <div className="cr-field-item-top">
        <div>
          <span className="cr-field-item-label">
            {t("field")}
          </span>

          <h2>
            {field?.fieldName ||
              field?.zoneName ||
              zone}
          </h2>

          <div className="cr-field-item-sub">
            {crop} · {zone}
          </div>
        </div>

        <span
          className={`cr-field-risk ${getRiskClass(
            risk
          )}`}
        >
          {riskText(risk, t)}
        </span>
      </div>

      <div className="cr-field-item-main">
        <div>
          <div className="cr-field-action-label">
            {t("action")}
          </div>

          <div className="cr-field-action">
            {action}
          </div>
        </div>

        <div className="cr-field-score">
          {score !== null ? Math.round(score) : "—"}
          <small>/100</small>
        </div>
      </div>

      <div className="cr-field-meta">
        <span>{source}</span>
        <span>
          {count}/4 {t("evidenceTitle")}
        </span>
      </div>

      <Link
        to={`/field/${encodeURIComponent(zone)}`}
        className="cr-field-view"
      >
        {t("details")} →
      </Link>

      {eventId && (
        <Link
          to={`/evidence/${encodeURIComponent(eventId)}`}
          className="cr-field-view"
          style={{ marginLeft: 12 }}
        >
          {t("evidence")} →
        </Link>
      )}
    </article>
  );
}

function getLanguage() {
  return localStorage.getItem("crai-language") || "en";
}