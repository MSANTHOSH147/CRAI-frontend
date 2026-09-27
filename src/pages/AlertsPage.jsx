import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchAlerts,
  fetchSystemStatus,
} from "../services/craiData";
import { useLanguage } from "../app/LanguageContext";

function severityClass(severity) {
  return String(severity || "info").toLowerCase();
}

function severityText(severity, t) {
  const key = severityClass(severity);

  if (key === "low") return t("low");
  if (key === "moderate") return t("moderate");
  if (key === "high") return t("high");
  if (key === "critical") return t("critical");

  return t("unknown");
}

function alertTitle(alert, t) {
  const severity = severityClass(alert?.severity);

  if (severity === "critical") {
    return t("critical") + " " + t("risk");
  }

  if (severity === "high") {
    return t("high") + " " + t("risk");
  }

  if (severity === "moderate") {
    return t("moderate") + " " + t("risk");
  }

  if (severity === "low") {
    return t("low") + " " + t("risk");
  }

  return t("alerts");
}

function getTamilAction(alert) {
  const severity = severityClass(alert?.severity);

  if (severity === "critical") {
    return "உடனடியாக வயலைச் சரிபார்த்து, CRAI வழங்கும் பாதுகாப்பு நடவடிக்கையைப் பின்பற்றவும்.";
  }

  if (severity === "high") {
    return "வயலை விரைவாகச் சரிபார்த்து, புதிய அறிகுறிகள் இருந்தால் மீண்டும் படத்தைச் சமர்ப்பிக்கவும்.";
  }

  if (severity === "moderate") {
    return "வயலைத் தொடர்ந்து கண்காணித்து, புதிய மாற்றங்கள் ஏற்பட்டால் மீண்டும் பரிசோதிக்கவும்.";
  }

  if (severity === "low") {
    return "தொடர்ந்து கண்காணிக்கவும். குறிப்பிடத்தக்க மாற்றம் ஏற்பட்டால் மீண்டும் பரிசோதிக்கவும்.";
  }

  return "மேலும் தகவல் கிடைக்கும் வரை வயலைக் கண்காணிக்கவும்.";
}

export default function AlertsPage() {
  const { t, language } = useLanguage();

  const [alerts, setAlerts] = useState([]);
  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAlerts() {
    setLoading(true);
    setError("");

    try {
      const [alertData, systemData] =
        await Promise.all([
          fetchAlerts(),
          fetchSystemStatus(),
        ]);

      setAlerts(alertData || []);
      setSystem(systemData);
    } catch (err) {
      setError(
        err?.message || t("connectionIssue")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();

    const timer = window.setInterval(
      loadAlerts,
      30000
    );

    return () => window.clearInterval(timer);
  }, []);

  const backendOnline =
    system?.backend === "online";

  const criticalCount = alerts.filter(
    (item) =>
      severityClass(item.severity) === "critical"
  ).length;

  const highCount = alerts.filter(
    (item) =>
      severityClass(item.severity) === "high"
  ).length;

  const moderateCount = alerts.filter(
    (item) =>
      severityClass(item.severity) === "moderate"
  ).length;

  return (
    <div className="cr-alerts-page">
      {/* Header */}
      <section className="cr-alerts-header">
        <div>
          <span className="cr-alerts-eyebrow">
            CRAI · {t("farmer")}
          </span>

          <h1>{t("alerts")}</h1>

          <p>
            {language === "ta"
              ? "CRAI கண்டறிந்த முக்கியமான வயல் மாற்றங்களை இங்கே பார்க்கலாம்."
              : "See important field changes detected by CRAI."}
          </p>
        </div>

        <div
          className={`cr-alerts-connection ${
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
        <div className="cr-alerts-error">
          <strong>{t("connectionIssue")}</strong>
          <span>{error}</span>

          <button onClick={loadAlerts}>
            {t("retry")}
          </button>
        </div>
      )}

      {/* Summary */}
      <section className="cr-alert-summary">
        <div className="cr-alert-summary-main">
          <span>{t("alerts")}</span>
          <strong>{alerts.length}</strong>

          <small>
            {language === "ta"
              ? "செயலில் உள்ள நிகழ்வுகள்"
              : "active field events"}
          </small>
        </div>

        <div className="cr-alert-summary-stat critical">
          <span>{t("critical")}</span>
          <strong>{criticalCount}</strong>
        </div>

        <div className="cr-alert-summary-stat high">
          <span>{t("high")}</span>
          <strong>{highCount}</strong>
        </div>

        <div className="cr-alert-summary-stat moderate">
          <span>{t("moderate")}</span>
          <strong>{moderateCount}</strong>
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="cr-alert-loading">
          <div />
          <div />
        </div>
      )}

      {/* Empty */}
      {!loading &&
        !error &&
        alerts.length === 0 && (
          <section className="cr-alert-empty">
            <div className="cr-alert-empty-icon">
              ✓
            </div>

            <h2>{t("noAlerts")}</h2>

            <p>
              {language === "ta"
                ? "CRAI தற்போது செயலில் உள்ள வயல் அபாயங்களை பதிவு செய்யவில்லை."
                : "CRAI has no active field risks to report right now."}
            </p>

            <Link to="/" className="cr-alert-home">
              ← {t("home")}
            </Link>
          </section>
        )}

      {/* Alerts */}
      {!loading && alerts.length > 0 && (
        <section className="cr-alert-list">
          {alerts.map((alert, index) => (
            <AlertCard
              key={
                alert.id ||
                alert.eventId ||
                index
              }
              alert={alert}
              t={t}
              language={language}
            />
          ))}
        </section>
      )}

      <div className="cr-alert-note">
        <span>✓</span>

        <p>
          {language === "ta"
            ? "இந்த எச்சரிக்கைகள் CRAI பின்தளத்தின் அதிகாரப்பூர்வ நிகழ்வு தரவை அடிப்படையாகக் கொண்டவை."
            : "These alerts are based on authoritative CRAI backend event data."}
        </p>
      </div>

      <style>{`
        .cr-alerts-page {
          width: 100%;
          max-width: 1050px;
          margin: 0 auto;
          padding: 22px 20px 42px;
          color: #17201c;
        }

        .cr-alerts-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 17px;
        }

        .cr-alerts-eyebrow {
          display: block;
          color: #78847e;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: .12em;
        }

        .cr-alerts-header h1 {
          margin: 4px 0 0;
          font-size: 27px;
          line-height: 1.1;
          letter-spacing: -.025em;
        }

        .cr-alerts-header p {
          margin: 7px 0 0;
          color: #68746e;
          font-size: 13px;
          line-height: 1.5;
        }

        .cr-alerts-connection {
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

        .cr-alerts-connection span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .cr-alerts-connection.online {
          color: #176246;
          background: #edf7f1;
          border-color: #cfe5d8;
        }

        .cr-alerts-connection.offline {
          color: #8a5a10;
          background: #fff8e8;
          border-color: #f0dfb6;
        }

        .cr-alerts-error {
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

        .cr-alerts-error button {
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

        .cr-alert-summary {
          display: grid;
          grid-template-columns: 1.7fr repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 13px;
        }

        .cr-alert-summary-main,
        .cr-alert-summary-stat {
          min-height: 76px;
          padding: 12px;
          border: 1px solid #dfe7e1;
          border-radius: 11px;
          background: #fff;
        }

        .cr-alert-summary-main span,
        .cr-alert-summary-stat span {
          display: block;
          color: #7c8781;
          font-size: 9px;
          font-weight: 750;
        }

        .cr-alert-summary-main strong {
          display: inline-block;
          margin-top: 4px;
          color: #17201c;
          font-size: 24px;
          line-height: 1;
        }

        .cr-alert-summary-main small {
          margin-left: 6px;
          color: #8b9690;
          font-size: 8px;
        }

        .cr-alert-summary-stat strong {
          display: block;
          margin-top: 8px;
          font-size: 18px;
        }

        .cr-alert-summary-stat.critical {
          border-color: #e7cccc;
        }

        .cr-alert-summary-stat.critical span,
        .cr-alert-summary-stat.critical strong {
          color: #9a3939;
        }

        .cr-alert-summary-stat.high {
          border-color: #ead5c7;
        }

        .cr-alert-summary-stat.high span,
        .cr-alert-summary-stat.high strong {
          color: #9a5a31;
        }

        .cr-alert-summary-stat.moderate {
          border-color: #eadcb9;
        }

        .cr-alert-summary-stat.moderate span,
        .cr-alert-summary-stat.moderate strong {
          color: #8a681d;
        }

        .cr-alert-list {
          display: grid;
          gap: 10px;
        }

        .cr-alert-card {
          padding: 14px 15px;
          border: 1px solid #dfe7e1;
          border-left: 4px solid #b8c4be;
          border-radius: 11px;
          background: #fff;
        }

        .cr-alert-card.low {
          border-left-color: #4e9b77;
        }

        .cr-alert-card.moderate {
          border-left-color: #c79d43;
        }

        .cr-alert-card.high {
          border-left-color: #c76e43;
        }

        .cr-alert-card.critical {
          border-left-color: #b64b4b;
        }

        .cr-alert-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .cr-alert-card-title {
          min-width: 0;
        }

        .cr-alert-card-title span {
          display: block;
          color: #7e8983;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .08em;
        }

        .cr-alert-card-title h2 {
          margin: 4px 0 0;
          font-size: 15px;
          line-height: 1.25;
        }

        .cr-alert-severity {
          flex: 0 0 auto;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 850;
          background: #f1f4f2;
          color: #69766f;
        }

        .cr-alert-severity.low {
          background: #edf7f1;
          color: #176246;
        }

        .cr-alert-severity.moderate {
          background: #fff8e8;
          color: #8a681d;
        }

        .cr-alert-severity.high {
          background: #fff1e9;
          color: #9a5a31;
        }

        .cr-alert-severity.critical {
          background: #fff0f0;
          color: #9a3939;
        }

        .cr-alert-card-body {
          margin-top: 12px;
          padding-top: 11px;
          border-top: 1px solid #edf1ee;
          color: #59665f;
          font-size: 11px;
          line-height: 1.5;
        }

        .cr-alert-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 10px;
        }

        .cr-alert-meta span {
          padding: 4px 6px;
          border: 1px solid #e4eae6;
          border-radius: 6px;
          background: #fafcfb;
          color: #7b8781;
          font-size: 8px;
          font-weight: 700;
        }

        .cr-alert-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 11px;
        }

        .cr-alert-actions a {
          color: #145a45;
          text-decoration: none;
          font-size: 10px;
          font-weight: 800;
        }

        .cr-alert-loading {
          display: grid;
          gap: 9px;
        }

        .cr-alert-loading div {
          height: 108px;
          border-radius: 11px;
          background: #e9efeb;
          animation: crAlertPulse 1.3s ease-in-out infinite;
        }

        @keyframes crAlertPulse {
          0%, 100% {
            opacity: .55;
          }
          50% {
            opacity: 1;
          }
        }

        .cr-alert-empty {
          padding: 34px 20px;
          border: 1px dashed #ccd9d1;
          border-radius: 13px;
          background: #fbfcfb;
          text-align: center;
        }

        .cr-alert-empty-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          margin: 0 auto 10px;
          border-radius: 50%;
          background: #edf7f1;
          color: #176246;
          font-size: 18px;
          font-weight: 850;
        }

        .cr-alert-empty h2 {
          margin: 0;
          font-size: 16px;
        }

        .cr-alert-empty p {
          max-width: 450px;
          margin: 6px auto 13px;
          color: #77847d;
          font-size: 11px;
          line-height: 1.5;
        }

        .cr-alert-home {
          color: #145a45;
          text-decoration: none;
          font-size: 10px;
          font-weight: 800;
        }

        .cr-alert-note {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 13px;
          color: #7c8781;
        }

        .cr-alert-note span {
          width: 21px;
          height: 21px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 50%;
          background: #edf5f0;
          color: #145a45;
          font-size: 9px;
          font-weight: 850;
        }

        .cr-alert-note p {
          margin: 0;
          font-size: 9px;
          line-height: 1.45;
        }

        @media (max-width: 760px) {
          .cr-alerts-page {
            padding: 17px 14px 95px;
          }

          .cr-alerts-header h1 {
            font-size: 23px;
          }

          .cr-alert-summary {
            grid-template-columns: 1fr 1fr;
          }

          .cr-alert-summary-main {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 430px) {
          .cr-alerts-header {
            gap: 8px;
          }

          .cr-alert-card-top {
            gap: 7px;
          }

          .cr-alert-card-title h2 {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}

function AlertCard({ alert, t, language }) {
  const severity = severityClass(alert?.severity);

  const fieldName =
    alert?.fieldName ||
    alert?.zoneName ||
    alert?.zoneId ||
    "A1";

  const action =
    alert?.body ||
    alert?.action ||
    alert?.duringState ||
    (language === "ta"
      ? getTamilAction(alert)
      : t("recommendation"));

  const score =
    alert?.riskScore !== null &&
    alert?.riskScore !== undefined &&
    alert?.riskScore !== ""
      ? Number(alert.riskScore)
      : null;

  return (
    <article
      className={`cr-alert-card ${severity}`}
    >
      <div className="cr-alert-card-top">
        <div className="cr-alert-card-title">
          <span>
            {t("field")} · {fieldName}
          </span>

          <h2>{alertTitle(alert, t)}</h2>
        </div>

        <span
          className={`cr-alert-severity ${severity}`}
        >
          {severityText(severity, t)}
        </span>
      </div>

      <div className="cr-alert-card-body">
        {action}
      </div>

      <div className="cr-alert-meta">
        {score !== null && (
          <span>
            {t("riskScore")}: {Math.round(score)}/100
          </span>
        )}

        {alert?.status && (
          <span>{String(alert.status)}</span>
        )}

        {alert?.createdAt && (
          <span>
            {formatDate(alert.createdAt)}
          </span>
        )}
      </div>

      <div className="cr-alert-actions">
        {alert?.eventId && (
          <Link
            to={`/evidence/${encodeURIComponent(
              alert.eventId
            )}`}
          >
            {t("evidence")} →
          </Link>
        )}

        {alert?.zoneName ||
        alert?.zoneId ||
        alert?.fieldName ? (
          <Link
            to={`/field/${encodeURIComponent(
              alert?.zoneId || "A1"
            )}`}
          >
            {t("details")} →
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function formatDate(value) {
  try {
    return new Date(value).toLocaleString(
      getLanguage() === "ta"
        ? "ta-IN"
        : "en-IN",
      {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return "";
  }
}

function getLanguage() {
  return localStorage.getItem("crai-language") || "en";
}