import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchCurrentEvent,
  fetchEventDetail,
  fetchEventTimeline,
  fetchEvidencePackage,
  fetchSystemStatus,
} from "../services/craiData";
import { useLanguage } from "../app/LanguageContext";

const EVIDENCE_KEYS = [
  "visual",
  "environmental",
  "temporal",
  "spatial",
];

function riskLabel(value, t) {
  const key = String(value || "").toUpperCase();

  if (key === "LOW") return t("low");
  if (key === "MODERATE") return t("moderate");
  if (key === "HIGH") return t("high");
  if (key === "CRITICAL") return t("critical");

  return t("unknown");
}

function lifecycleLabel(value, t) {
  const key = String(value || "").toUpperCase();

  if (key === "BEFORE") return t("before");
  if (key === "DURING") return t("during");
  if (key === "RECOVERY") return t("recovery");
  if (key === "AFTER") return t("after");
  if (key === "RESOLVED") return t("resolved");

  return t("unknown");
}

function evidenceLabel(key, t) {
  const labels = {
    visual: t("visual"),
    environmental: t("environmental"),
    temporal: t("temporal"),
    spatial: t("spatial"),
  };

  return labels[key] || key;
}

function evidenceState(value, t) {
  const state = String(value || "UNKNOWN").toUpperCase();

  if (state === "AVAILABLE") return t("available");
  if (state === "MISSING") return t("missing");
  if (state === "UNCERTAIN") return t("uncertain");
  if (state === "STALE") return t("stale");

  return t("unknown");
}

function normalizeEvidence(packageData) {
  const source =
    packageData?.evidence ||
    packageData?.evidence_sources ||
    packageData?.sources ||
    {};

  return EVIDENCE_KEYS.reduce(
    (result, key) => {
      const item = source?.[key];

      result[key] =
        item?.state ||
        item?.status ||
        (item ? "AVAILABLE" : "UNKNOWN");

      return result;
    },
    {}
  );
}

function formatDate(value, language) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString(
      language === "ta" ? "ta-IN" : "en-IN",
      {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return String(value);
  }
}

export default function ExpertConsole() {
  const { t, language } = useLanguage();

  const [event, setEvent] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [evidencePackage, setEvidencePackage] =
    useState(null);
  const [system, setSystem] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadConsole() {
    setLoading(true);
    setError("");

    try {
      const current =
        await fetchCurrentEvent(1, "A1");

      setSystem(
        await fetchSystemStatus()
      );

      if (!current) {
        setEvent(null);
        setTimeline([]);
        setEvidencePackage(null);
        return;
      }

      const eventId =
        current?.eventId ||
        current?.event_id ||
        current?.id;

      let detail = current;
      let evidence = null;
      let history = [];

      if (eventId) {
        const [
          detailData,
          timelineData,
          evidenceData,
        ] = await Promise.all([
          fetchEventDetail(eventId),
          fetchEventTimeline(eventId),
          fetchEvidencePackage(eventId),
        ]);

        detail =
          detailData?.event ||
          detailData?.data ||
          detailData ||
          current;

        evidence = evidenceData || null;

        history = Array.isArray(
          timelineData
        )
          ? timelineData
          : timelineData?.timeline || [];
      }

      setEvent(detail);
      setEvidencePackage(evidence);
      setTimeline(history);
    } catch (err) {
      setError(
        err?.message ||
          (language === "ta"
            ? "Expert Console தரவை ஏற்ற முடியவில்லை."
            : "Unable to load Expert Console data.")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConsole();

    const timer = window.setInterval(
      loadConsole,
      30000
    );

    return () =>
      window.clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="cr-expert-page">
        <div className="cr-expert-loading">
          <div />
          <div />
          <div />
        </div>

        <style>{loadingStyles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cr-expert-page">
        <section className="cr-expert-error">
          <div>!</div>

          <h1>{t("error")}</h1>

          <p>{error}</p>

          <button onClick={loadConsole}>
            {t("retry")}
          </button>
        </section>

        <style>{pageStyles}</style>
      </div>
    );
  }

  const eventData = event || {};

  const eventId =
    eventData?.eventId ||
    eventData?.event_id ||
    eventData?.id ||
    "—";

  const crop =
    eventData?.crop ||
    eventData?.cropName ||
    "—";

  const zone =
    eventData?.zoneName ||
    eventData?.zoneId ||
    eventData?.zone_id ||
    "A1";

  const riskLevel =
    eventData?.riskLevel ||
    eventData?.risk_level ||
    "";

  const riskScore =
    eventData?.riskScore ??
    eventData?.risk_score ??
    null;

  const decision =
    eventData?.decision ||
    eventData?.action ||
    eventData?.recommendedAction ||
    "—";

  const decisionReady =
    eventData?.decisionReady ??
    eventData?.decision_ready ??
    (riskScore !== null &&
      riskScore !== undefined);

  const status =
    eventData?.status ||
    "UNKNOWN";

  const lifecycle =
    eventData?.lifecyclePhase ||
    eventData?.lifecycle_phase ||
    eventData?.phase ||
    eventData?.duringState ||
    "UNKNOWN";

  const packageData =
    evidencePackage?.package ||
    evidencePackage ||
    {};

  const evidence =
    normalizeEvidence(packageData);

  const integrityHash =
    evidencePackage?.integrity_hash ||
    evidencePackage?.integrityHash ||
    packageData?.integrity_hash ||
    packageData?.integrityHash ||
    "—";

  const temperature =
    eventData?.temperature ??
    eventData?.sensorData?.temperature ??
    eventData?.sensors?.temperature;

  const humidity =
    eventData?.humidity ??
    eventData?.sensorData?.humidity ??
    eventData?.sensors?.humidity;

  const soilMoisture =
    eventData?.soilMoisture ??
    eventData?.soil_moisture ??
    eventData?.sensorData?.soil_moisture ??
    eventData?.sensors?.soil_moisture;

  const sensorState =
    eventData?.sensorState ||
    eventData?.sensor_state ||
    eventData?.sensorStatus ||
    "UNKNOWN";

  const source =
    eventData?.source ||
    eventData?.sensorSource ||
    "UNKNOWN";

  const backendOnline =
    system?.backend === "online";

  const eventLink =
    eventId !== "—"
      ? `/evidence/${encodeURIComponent(
          eventId
        )}`
      : "/alerts";

  return (
    <div className="cr-expert-page">
      {/* Header */}
      <section className="cr-expert-header">
        <div>
          <span className="cr-expert-eyebrow">
            CRAI · {t("intelligence")}
          </span>

          <h1>{t("expert")}</h1>

          <p>
            {language === "ta"
              ? "CRAI-ன் அதிகாரப்பூர்வ risk, evidence மற்றும் lifecycle நிலையை இங்கே பார்க்கலாம்."
              : "Review the authoritative CRAI risk, evidence and event lifecycle."}
          </p>
        </div>

        <div
          className={`cr-expert-status ${
            backendOnline
              ? "online"
              : "offline"
          }`}
        >
          <span />
          {backendOnline
            ? t("online")
            : t("offline")}
        </div>
      </section>

      {/* Event identity */}
      <section className="cr-expert-card">
        <div className="cr-expert-card-head">
          <div>
            <span>{t("event")}</span>
            <h2>{eventId}</h2>
          </div>

          <span className="cr-expert-event-status">
            {String(status)}
          </span>
        </div>

        <div className="cr-expert-identity-grid">
          <Metric
            label={t("crop")}
            value={crop}
          />

          <Metric
            label={t("field")}
            value={zone}
          />

          <Metric
            label={t("lifecycle")}
            value={lifecycleLabel(
              lifecycle,
              t
            )}
          />

          <Metric
            label={t("source")}
            value={source}
          />
        </div>
      </section>

      {/* Authoritative risk */}
      <section className="cr-expert-card">
        <div className="cr-expert-card-head">
          <div>
            <span>
              {language === "ta"
                ? "அதிகாரப்பூர்வ முடிவு"
                : "Authoritative decision"}
            </span>

            <h2>
              {language === "ta"
                ? "Risk & Action"
                : "Risk & Action"}
            </h2>
          </div>

          <span
            className={`cr-decision-ready ${
              decisionReady
                ? "ready"
                : "pending"
            }`}
          >
            {decisionReady
              ? language === "ta"
                ? "முடிவு தயாராக உள்ளது"
                : "Decision ready"
              : language === "ta"
                ? "ஆதாரம் தேவை"
                : "Evidence needed"}
          </span>
        </div>

        <div className="cr-risk-panel">
          <div
            className={`cr-risk-score ${
              String(
                riskLevel || ""
              ).toLowerCase()
            }`}
          >
            <span>
              {riskLabel(
                riskLevel,
                t
              )}
            </span>

            <strong>
              {riskScore !== null &&
              riskScore !== undefined
                ? Math.round(
                    Number(riskScore)
                  )
                : "—"}
            </strong>

            <small>/100</small>
          </div>

          <div className="cr-risk-decision">
            <span>
              {t("decision")}
            </span>

            <strong>
              {decisionReady
                ? decision
                : language === "ta"
                  ? "மேலும் ஆதாரம் சேகரிக்கவும்"
                  : "Collect additional evidence"}
            </strong>

            <p>
              {language === "ta"
                ? "Risk மற்றும் decision frontend-ல் கணக்கிடப்படவில்லை."
                : "Risk and decision are not calculated in the frontend."}
            </p>
          </div>
        </div>
      </section>

      {/* Evidence fusion */}
      <section className="cr-expert-card">
        <div className="cr-expert-card-head">
          <div>
            <span>{t("evidence")}</span>

            <h2>
              {language === "ta"
                ? "Evidence Fusion"
                : "Evidence Fusion"}
            </h2>
          </div>

          <Link
            to={eventLink}
            className="cr-expert-link"
          >
            {t("evidence")} →
          </Link>
        </div>

        <div className="cr-expert-evidence-grid">
          {EVIDENCE_KEYS.map((key) => {
            const state =
              evidence[key];

            return (
              <div
                key={key}
                className={`cr-expert-evidence ${
                  String(
                    state || "UNKNOWN"
                  ).toLowerCase()
                }`}
              >
                <div className="cr-evidence-symbol">
                  {String(state).toUpperCase() ===
                  "AVAILABLE"
                    ? "✓"
                    : String(
                          state
                        ).toUpperCase() ===
                        "MISSING"
                      ? "—"
                      : "!"}
                </div>

                <div>
                  <strong>
                    {evidenceLabel(
                      key,
                      t
                    )}
                  </strong>

                  <span>
                    {evidenceState(
                      state,
                      t
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cr-evidence-note">
          {language === "ta"
            ? "CRAI visual, environmental, temporal மற்றும் spatial ஆதாரங்களை இணைத்து decision readiness-ஐ தீர்மானிக்கிறது."
            : "CRAI combines visual, environmental, temporal and spatial evidence to determine decision readiness."}
        </div>
      </section>

      {/* Field telemetry */}
      <section className="cr-expert-card">
        <div className="cr-expert-card-head">
          <div>
            <span>{t("field")}</span>

            <h2>
              {language === "ta"
                ? "தற்போதைய நிலை"
                : "Current field state"}
            </h2>
          </div>
        </div>

        <div className="cr-telemetry-grid">
          <Telemetry
            label={t("temperature")}
            value={
              temperature !==
                null &&
              temperature !==
                undefined
                ? `${Number(
                    temperature
                  ).toFixed(1)}°C`
                : "—"
            }
          />

          <Telemetry
            label={t("humidity")}
            value={
              humidity !==
                null &&
              humidity !==
                undefined
                ? `${Number(
                    humidity
                  ).toFixed(1)}%`
                : "—"
            }
          />

          <Telemetry
            label={t("soilMoisture")}
            value={
              soilMoisture !==
                null &&
              soilMoisture !==
                undefined
                ? `${Number(
                    soilMoisture
                  ).toFixed(1)}%`
                : "—"
            }
          />

          <Telemetry
            label={
              language === "ta"
                ? "Sensor நிலை"
                : "Sensor state"
            }
            value={sensorState}
          />
        </div>
      </section>

      {/* Lifecycle */}
      <section className="cr-expert-card">
        <div className="cr-expert-card-head">
          <div>
            <span>{t("lifecycle")}</span>

            <h2>
              {language === "ta"
                ? "நிகழ்வு வாழ்க்கைச் சுழற்சி"
                : "Event lifecycle"}
            </h2>
          </div>
        </div>

        <div className="cr-lifecycle">
          {[
            "BEFORE",
            "DURING",
            "RECOVERY",
            "AFTER",
            "RESOLVED",
          ].map((phase, index) => {
            const current =
              String(
                lifecycle
              ).toUpperCase();

            const active =
              current === phase;

            const passed =
              [
                "BEFORE",
                "DURING",
                "RECOVERY",
                "AFTER",
                "RESOLVED",
              ].indexOf(current) >
              index;

            return (
              <div
                key={phase}
                className={`cr-lifecycle-step ${
                  active
                    ? "active"
                    : passed
                      ? "passed"
                      : ""
                }`}
              >
                <div>
                  {active || passed
                    ? "✓"
                    : index + 1}
                </div>

                <span>
                  {lifecycleLabel(
                    phase,
                    t
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Timeline */}
      <section className="cr-expert-card">
        <div className="cr-expert-card-head">
          <div>
            <span>{t("timeline")}</span>

            <h2>
              {language === "ta"
                ? "சமீபத்திய நிகழ்வுகள்"
                : "Recent event history"}
            </h2>
          </div>
        </div>

        {timeline.length === 0 ? (
          <div className="cr-empty-small">
            {language === "ta"
              ? "Timeline தரவு இல்லை."
              : "No timeline data available."}
          </div>
        ) : (
          <div className="cr-expert-timeline">
            {timeline.slice(0, 8).map(
              (item, index) => {
                const phase =
                  item?.phase ||
                  item?.lifecyclePhase ||
                  item?.lifecycle_phase ||
                  item?.status ||
                  "UNKNOWN";

                const timestamp =
                  item?.timestamp ||
                  item?.createdAt ||
                  item?.created_at ||
                  item?.time;

                const action =
                  item?.decision ||
                  item?.action ||
                  item?.state ||
                  "";

                return (
                  <div
                    key={
                      item?.id ||
                      `${phase}-${index}`
                    }
                    className="cr-expert-timeline-item"
                  >
                    <div className="cr-timeline-dot" />

                    <div>
                      <div className="cr-timeline-row">
                        <strong>
                          {lifecycleLabel(
                            phase,
                            t
                          )}
                        </strong>

                        <time>
                          {formatDate(
                            timestamp,
                            language
                          )}
                        </time>
                      </div>

                      {action && (
                        <p>{action}</p>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* Integrity */}
      <section className="cr-expert-card">
        <div className="cr-expert-card-head">
          <div>
            <span>{t("integrity")}</span>

            <h2>
              {language === "ta"
                ? "Evidence Record"
                : "Evidence Record"}
            </h2>
          </div>
        </div>

        <div className="cr-expert-hash">
          <span>Integrity hash</span>
          <code>{integrityHash}</code>
        </div>

        <Link
          to={eventLink}
          className="cr-expert-verify-link"
        >
          {language === "ta"
            ? "முழு ஆதாரப் பதிவைப் பார்க்கவும் →"
            : "Open full evidence record →"}
        </Link>
      </section>

      {/* Architecture */}
      <section className="cr-expert-architecture">
        <div className="cr-architecture-icon">
          ✓
        </div>

        <div>
          <strong>
            {language === "ta"
              ? "CRAI Architecture"
              : "CRAI Architecture"}
          </strong>

          <p>
            {language === "ta"
              ? "FastAPI மற்றும் deterministic CRAI fusion engine risk மற்றும் decision-க்கு அதிகாரப்பூர்வ ஆதாரம். Qwen explanation/advisory மட்டும் வழங்குகிறது; அது risk-ஐ கணக்கிடவோ மாற்றவோ முடியாது."
              : "FastAPI and the deterministic CRAI fusion engine are authoritative for risk and decisions. Qwen provides explanation/advisory only and cannot calculate or override risk."}
          </p>
        </div>
      </section>

      <style>{pageStyles}</style>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="cr-expert-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Telemetry({ label, value }) {
  return (
    <div className="cr-telemetry">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const loadingStyles = `
.cr-expert-page {
  max-width: 1050px;
  margin: 0 auto;
  padding: 22px 20px 42px;
}

.cr-expert-loading {
  display: grid;
  gap: 10px;
}

.cr-expert-loading div {
  height: 120px;
  border-radius: 12px;
  background: #e9efeb;
  animation: crExpertPulse 1.2s ease-in-out infinite;
}

@keyframes crExpertPulse {
  0%, 100% {
    opacity: .5;
  }
  50% {
    opacity: 1;
  }
}
`;

const pageStyles = `
.cr-expert-page {
  width: 100%;
  max-width: 1050px;
  margin: 0 auto;
  padding: 22px 20px 42px;
  color: #17201c;
}

.cr-expert-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 15px;
}

.cr-expert-eyebrow {
  display: block;
  color: #78847e;
  font-size: 9px;
  font-weight: 850;
  letter-spacing: .12em;
}

.cr-expert-header h1 {
  margin: 4px 0 0;
  font-size: 27px;
  line-height: 1.1;
  letter-spacing: -.025em;
}

.cr-expert-header p {
  max-width: 650px;
  margin: 7px 0 0;
  color: #68746e;
  font-size: 13px;
  line-height: 1.5;
}

.cr-expert-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border: 1px solid #dfe7e1;
  border-radius: 999px;
  background: #fff;
  color: #78847e;
  font-size: 8px;
  font-weight: 850;
  white-space: nowrap;
}

.cr-expert-status span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.cr-expert-status.online {
  border-color: #cfe5d8;
  background: #edf7f1;
  color: #176246;
}

.cr-expert-status.offline {
  border-color: #eadcb9;
  background: #fff8e8;
  color: #8a681d;
}

.cr-expert-card {
  margin-top: 10px;
  padding: 14px;
  border: 1px solid #dfe7e1;
  border-radius: 12px;
  background: #fff;
}

.cr-expert-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.cr-expert-card-head > div > span {
  display: block;
  color: #7d8982;
  font-size: 8px;
  font-weight: 850;
  letter-spacing: .08em;
}

.cr-expert-card-head h2 {
  margin: 4px 0 0;
  font-size: 15px;
  line-height: 1.25;
}

.cr-expert-event-status,
.cr-decision-ready {
  padding: 5px 8px;
  border-radius: 999px;
  font-size: 8px;
  font-weight: 850;
}

.cr-expert-event-status {
  background: #f1f4f2;
  color: #69766f;
}

.cr-decision-ready.ready {
  background: #edf7f1;
  color: #176246;
}

.cr-decision-ready.pending {
  background: #fff8e8;
  color: #8a681d;
}

.cr-expert-link,
.cr-expert-verify-link {
  color: #145a45;
  text-decoration: none;
  font-size: 9px;
  font-weight: 850;
}

.cr-expert-identity-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 7px;
}

.cr-expert-metric {
  min-height: 61px;
  padding: 9px;
  border: 1px solid #e5ebe7;
  border-radius: 8px;
  background: #fafcfb;
}

.cr-expert-metric span,
.cr-telemetry span {
  display: block;
  color: #89938e;
  font-size: 8px;
  font-weight: 750;
}

.cr-expert-metric strong {
  display: block;
  margin-top: 5px;
  color: #26332d;
  font-size: 10px;
  line-height: 1.3;
  word-break: break-word;
}

.cr-risk-panel {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 10px;
}

.cr-risk-score {
  min-height: 130px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid #dfe7e1;
  border-radius: 10px;
  background: #f8faf8;
}

.cr-risk-score span {
  font-size: 9px;
  font-weight: 850;
}

.cr-risk-score strong {
  margin-top: 4px;
  font-size: 40px;
  line-height: 1;
}

.cr-risk-score small {
  margin-top: 3px;
  color: #8a958f;
  font-size: 8px;
}

.cr-risk-score.low {
  border-color: #cfe5d8;
  background: #f2faf5;
  color: #176246;
}

.cr-risk-score.moderate {
  border-color: #eadcb9;
  background: #fffaf0;
  color: #8a681d;
}

.cr-risk-score.high {
  border-color: #ead5c7;
  background: #fff7f2;
  color: #9a5a31;
}

.cr-risk-score.critical {
  border-color: #e7cccc;
  background: #fff5f5;
  color: #9a3939;
}

.cr-risk-decision {
  min-height: 130px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 14px;
  border: 1px solid #e1e8e3;
  border-radius: 10px;
  background: #fafcfb;
}

.cr-risk-decision span {
  color: #7f8a84;
  font-size: 8px;
  font-weight: 850;
  letter-spacing: .06em;
}

.cr-risk-decision strong {
  margin-top: 6px;
  font-size: 15px;
  line-height: 1.35;
}

.cr-risk-decision p {
  margin: 7px 0 0;
  color: #7a8680;
  font-size: 8px;
  line-height: 1.5;
}

.cr-expert-evidence-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 7px;
}

.cr-expert-evidence {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 61px;
  padding: 9px;
  border: 1px solid #e2e9e4;
  border-radius: 8px;
  background: #fafcfb;
}

.cr-evidence-symbol {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #edf1ee;
  color: #78847e;
  font-size: 10px;
  font-weight: 850;
}

.cr-expert-evidence strong {
  display: block;
  font-size: 10px;
}

.cr-expert-evidence span {
  display: block;
  margin-top: 3px;
  color: #89938e;
  font-size: 8px;
  font-weight: 750;
}

.cr-expert-evidence.available {
  border-color: #cfe5d8;
  background: #f4faf6;
}

.cr-expert-evidence.available .cr-evidence-symbol {
  background: #dff0e6;
  color: #176246;
}

.cr-expert-evidence.available span {
  color: #176246;
}

.cr-expert-evidence.uncertain,
.cr-expert-evidence.stale {
  border-color: #eadcb9;
  background: #fffaf0;
}

.cr-expert-evidence.uncertain .cr-evidence-symbol,
.cr-expert-evidence.stale .cr-evidence-symbol {
  background: #fff0c9;
  color: #8a681d;
}

.cr-expert-evidence.uncertain span,
.cr-expert-evidence.stale span {
  color: #8a681d;
}

.cr-evidence-note {
  margin-top: 10px;
  padding: 9px 10px;
  border-left: 3px solid #b9cfc2;
  background: #f8faf8;
  color: #6f7c75;
  font-size: 8px;
  line-height: 1.5;
}

.cr-telemetry-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 7px;
}

.cr-telemetry {
  min-height: 65px;
  padding: 10px;
  border: 1px solid #e4eae6;
  border-radius: 8px;
  background: #fafcfb;
}

.cr-telemetry strong {
  display: block;
  margin-top: 6px;
  color: #26332d;
  font-size: 14px;
}

.cr-lifecycle {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
}

.cr-lifecycle-step {
  position: relative;
  text-align: center;
}

.cr-lifecycle-step::after {
  content: "";
  position: absolute;
  top: 13px;
  left: calc(50% + 13px);
  right: calc(-50% + 13px);
  height: 1px;
  background: #dfe6e1;
}

.cr-lifecycle-step:last-child::after {
  display: none;
}

.cr-lifecycle-step > div {
  position: relative;
  z-index: 1;
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  margin: 0 auto 6px;
  border: 1px solid #dce4df;
  border-radius: 50%;
  background: #fff;
  color: #8a958f;
  font-size: 8px;
  font-weight: 850;
}

.cr-lifecycle-step span {
  color: #8a958f;
  font-size: 8px;
  font-weight: 750;
}

.cr-lifecycle-step.active > div {
  border-color: #145a45;
  background: #145a45;
  color: #fff;
}

.cr-lifecycle-step.active span,
.cr-lifecycle-step.passed span {
  color: #145a45;
}

.cr-lifecycle-step.passed > div {
  border-color: #b9d3c4;
  background: #edf7f1;
  color: #176246;
}

.cr-expert-timeline {
  display: grid;
}

.cr-expert-timeline-item {
  position: relative;
  display: flex;
  gap: 10px;
  min-height: 55px;
}

.cr-expert-timeline-item:not(:last-child)::before {
  content: "";
  position: absolute;
  top: 8px;
  bottom: -2px;
  left: 4px;
  width: 1px;
  background: #dfe6e1;
}

.cr-timeline-dot {
  position: relative;
  z-index: 1;
  width: 9px;
  height: 9px;
  margin-top: 4px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #145a45;
}

.cr-expert-timeline-item > div:last-child {
  flex: 1;
  padding-bottom: 9px;
}

.cr-timeline-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.cr-timeline-row strong {
  font-size: 10px;
}

.cr-timeline-row time {
  color: #8a958f;
  font-size: 8px;
}

.cr-expert-timeline-item p {
  margin: 4px 0 0;
  color: #6f7c75;
  font-size: 8px;
  line-height: 1.45;
}

.cr-empty-small {
  padding: 15px;
  border-radius: 8px;
  background: #f8faf8;
  color: #7d8982;
  font-size: 9px;
  text-align: center;
}

.cr-expert-hash {
  padding: 10px;
  border: 1px solid #e2e8e4;
  border-radius: 8px;
  background: #f8faf8;
}

.cr-expert-hash span {
  display: block;
  margin-bottom: 5px;
  color: #818c86;
  font-size: 8px;
  font-weight: 800;
}

.cr-expert-hash code {
  display: block;
  color: #425149;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 8px;
  line-height: 1.5;
  word-break: break-all;
}

.cr-expert-verify-link {
  display: inline-block;
  margin-top: 10px;
}

.cr-expert-architecture {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 12px;
  padding: 11px 12px;
  border: 1px solid #dfe8e2;
  border-radius: 10px;
  background: #f8faf8;
}

.cr-architecture-icon {
  width: 21px;
  height: 21px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #e6f2eb;
  color: #145a45;
  font-size: 9px;
  font-weight: 850;
}

.cr-expert-architecture strong {
  display: block;
  font-size: 10px;
}

.cr-expert-architecture p {
  margin: 3px 0 0;
  color: #78847e;
  font-size: 8px;
  line-height: 1.5;
}

.cr-expert-error {
  max-width: 520px;
  margin: 60px auto;
  padding: 25px;
  border: 1px solid #e1e7e3;
  border-radius: 13px;
  background: #fff;
  text-align: center;
}

.cr-expert-error > div {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  margin: 0 auto 10px;
  border-radius: 50%;
  background: #fff2f2;
  color: #9a3939;
  font-weight: 850;
}

.cr-expert-error h1 {
  margin: 0;
  font-size: 18px;
}

.cr-expert-error p {
  margin: 7px 0 14px;
  color: #758079;
  font-size: 10px;
}

.cr-expert-error button {
  min-height: 36px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: #145a45;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
}

@media (max-width: 760px) {
  .cr-expert-page {
    padding: 17px 14px 95px;
  }

  .cr-expert-header h1 {
    font-size: 23px;
  }

  .cr-expert-identity-grid,
  .cr-telemetry-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .cr-expert-evidence-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .cr-risk-panel {
    grid-template-columns: 1fr;
  }

  .cr-risk-score {
    min-height: 105px;
  }
}

@media (max-width: 430px) {
  .cr-expert-header {
    gap: 8px;
  }

  .cr-expert-status {
    font-size: 7px;
  }

  .cr-expert-identity-grid {
    grid-template-columns: 1fr 1fr;
  }

  .cr-expert-evidence-grid {
    grid-template-columns: 1fr 1fr;
  }

  .cr-lifecycle {
    gap: 2px;
  }

  .cr-lifecycle-step span {
    font-size: 7px;
  }

  .cr-timeline-row {
    flex-direction: column;
    gap: 2px;
  }
}
`;