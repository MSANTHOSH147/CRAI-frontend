import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchEventDetail,
  fetchEventTimeline,
  fetchEvidencePackage,
  verifyEvidence,
} from "../services/craiData";
import { useLanguage } from "../app/LanguageContext";

function evidenceLabel(key, t) {
  const map = {
    visual: t("visual"),
    environmental: t("environmental"),
    temporal: t("temporal"),
    spatial: t("spatial"),
  };

  return map[key] || key;
}

function stateLabel(value, t) {
  const state = String(value || "UNKNOWN").toUpperCase();

  if (state === "AVAILABLE") return t("available");
  if (state === "MISSING") return t("missing");
  if (state === "UNCERTAIN") return t("uncertain");
  if (state === "STALE") return t("stale");

  return t("unknown");
}

function riskLabel(value, t) {
  const risk = String(value || "").toUpperCase();

  if (risk === "LOW") return t("low");
  if (risk === "MODERATE") return t("moderate");
  if (risk === "HIGH") return t("high");
  if (risk === "CRITICAL") return t("critical");

  return t("unknown");
}

function lifecycleLabel(value, t) {
  const phase = String(value || "").toUpperCase();

  if (phase === "BEFORE") return t("before");
  if (phase === "DURING") return t("during");
  if (phase === "RECOVERY") return t("recovery");
  if (phase === "AFTER") return t("after");
  if (phase === "RESOLVED") return t("resolved");

  return value || t("unknown");
}

function formatDate(value, language) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString(
      language === "ta" ? "ta-IN" : "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return String(value);
  }
}

function extractEvidenceStates(packageData) {
  const evidence =
    packageData?.evidence ||
    packageData?.evidence_sources ||
    packageData?.sources ||
    {};

  return {
    visual:
      evidence?.visual?.state ||
      evidence?.visual?.status ||
      (evidence?.visual ? "AVAILABLE" : "UNKNOWN"),

    environmental:
      evidence?.environmental?.state ||
      evidence?.environmental?.status ||
      (evidence?.environmental
        ? "AVAILABLE"
        : "UNKNOWN"),

    temporal:
      evidence?.temporal?.state ||
      evidence?.temporal?.status ||
      (evidence?.temporal ? "AVAILABLE" : "UNKNOWN"),

    spatial:
      evidence?.spatial?.state ||
      evidence?.spatial?.status ||
      (evidence?.spatial ? "AVAILABLE" : "UNKNOWN"),
  };
}

export default function EvidencePage() {
  const { id } = useParams();
  const { t, language } = useLanguage();

  const [event, setEvent] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [evidencePackage, setEvidencePackage] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const [verification, setVerification] =
    useState(null);

  const [error, setError] = useState("");

  async function loadEvidence() {
    if (!id) {
      setError(t("unknown"));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [
        eventData,
        timelineData,
        packageData,
      ] = await Promise.all([
        fetchEventDetail(id),
        fetchEventTimeline(id),
        fetchEvidencePackage(id),
      ]);

      setEvent(eventData || null);

      setTimeline(
        Array.isArray(timelineData)
          ? timelineData
          : timelineData?.timeline || []
      );

      setEvidencePackage(
        packageData || null
      );

      setVerification(null);
    } catch (err) {
      setError(
        err?.message ||
          (language === "ta"
            ? "ஆதாரத் தரவை ஏற்ற முடியவில்லை."
            : "Unable to load the evidence record.")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvidence();
  }, [id]);

  async function handleVerify() {
    if (!id || verifying) return;

    setVerifying(true);
    setVerification(null);

    try {
      const result = await verifyEvidence(id);
      setVerification(result);
    } catch (err) {
      setVerification({
        valid: false,
        reason:
          err?.message ||
          (language === "ta"
            ? "சரிபார்ப்பு தோல்வியடைந்தது."
            : "Verification failed."),
      });
    } finally {
      setVerifying(false);
    }
  }

  if (loading) {
    return (
      <div className="cr-evidence-page">
        <div className="cr-evidence-loading">
          <div />
          <div />
          <div />
        </div>

        <style>{loadingStyles}</style>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="cr-evidence-page">
        <section className="cr-evidence-error">
          <div className="cr-evidence-error-icon">
            !
          </div>

          <h1>{t("error")}</h1>

          <p>
            {error ||
              (language === "ta"
                ? "நிகழ்வு கிடைக்கவில்லை."
                : "The requested event could not be found.")}
          </p>

          <button onClick={loadEvidence}>
            {t("retry")}
          </button>

          <Link to="/alerts">
            ← {t("alerts")}
          </Link>
        </section>

        <style>{pageStyles}</style>
      </div>
    );
  }

  const eventData =
    event?.event ||
    event?.data ||
    event;

  const packageData =
    evidencePackage?.package ||
    evidencePackage;

  const eventId =
    eventData?.eventId ||
    eventData?.event_id ||
    id;

  const crop =
    eventData?.crop ||
    eventData?.cropName ||
    "—";

  const zone =
    eventData?.zoneName ||
    eventData?.zoneId ||
    eventData?.zone_id ||
    "—";

  const riskLevel =
    eventData?.riskLevel ||
    eventData?.risk_level ||
    packageData?.riskLevel ||
    packageData?.risk_level;

  const riskScore =
    eventData?.riskScore ??
    eventData?.risk_score ??
    packageData?.riskScore ??
    packageData?.risk_score;

  const status =
    eventData?.status ||
    "UNKNOWN";

  const lifecycle =
    eventData?.lifecyclePhase ||
    eventData?.lifecycle_phase ||
    eventData?.phase ||
    eventData?.duringState ||
    "UNKNOWN";

  const decision =
    eventData?.decision ||
    eventData?.action ||
    eventData?.recommendedAction ||
    packageData?.decision ||
    "—";

  const integrityHash =
    evidencePackage?.integrity_hash ||
    evidencePackage?.integrityHash ||
    packageData?.integrity_hash ||
    packageData?.integrityHash ||
    "—";

  const evidenceStates =
    extractEvidenceStates(packageData);

  const verified =
    verification?.valid === true ||
    verification?.verified === true;

  return (
    <div className="cr-evidence-page">
      {/* Header */}
      <section className="cr-evidence-header">
        <div>
          <Link
            to="/alerts"
            className="cr-evidence-back"
          >
            ← {t("alerts")}
          </Link>

          <span className="cr-evidence-eyebrow">
            CRAI · {t("evidence")}
          </span>

          <h1>{t("evidencePackage")}</h1>

          <p>
            {language === "ta"
              ? "CRAI முடிவை உருவாக்க பயன்படுத்திய ஆதாரங்களையும் நிகழ்வு வரலாற்றையும் பார்க்கவும்."
              : "Review the evidence and event history behind the CRAI decision."}
          </p>
        </div>

        <span className="cr-evidence-authority">
          {language === "ta"
            ? "அதிகாரப்பூர்வ பதிவு"
            : "Authoritative record"}
        </span>
      </section>

      {/* Event identity */}
      <section className="cr-evidence-card">
        <div className="cr-section-heading">
          <div>
            <span>{t("event")}</span>
            <h2>{eventId}</h2>
          </div>

          <span className="cr-evidence-status">
            {String(status)}
          </span>
        </div>

        <div className="cr-evidence-summary-grid">
          <SummaryItem
            label={t("crop")}
            value={crop}
          />

          <SummaryItem
            label={t("field")}
            value={zone}
          />

          <SummaryItem
            label={t("risk")}
            value={riskLabel(
              riskLevel,
              t
            )}
            tone={String(
              riskLevel || ""
            ).toLowerCase()}
          />

          <SummaryItem
            label={t("riskScore")}
            value={
              riskScore !== null &&
              riskScore !== undefined
                ? `${Math.round(
                    Number(riskScore)
                  )}/100`
                : "—"
            }
          />

          <SummaryItem
            label={t("lifecycle")}
            value={lifecycleLabel(
              lifecycle,
              t
            )}
          />

          <SummaryItem
            label={t("decision")}
            value={decision}
          />
        </div>
      </section>

      {/* Evidence fusion */}
      <section className="cr-evidence-card">
        <div className="cr-section-heading">
          <div>
            <span>{t("evidence")}</span>

            <h2>
              {language === "ta"
                ? "பல ஆதார இணைப்பு"
                : "Multi-source evidence"}
            </h2>
          </div>

          <span className="cr-evidence-count">
            4
          </span>
        </div>

        <div className="cr-evidence-grid">
          {Object.entries(
            evidenceStates
          ).map(([key, value]) => (
            <EvidenceSource
              key={key}
              name={evidenceLabel(key, t)}
              state={value}
              t={t}
            />
          ))}
        </div>

        <div className="cr-evidence-explanation">
          <strong>
            {language === "ta"
              ? "ஆதார நிலை"
              : "Evidence status"}
          </strong>

          <p>
            {language === "ta"
              ? "கிடைக்காத ஆதாரம் பூஜ்யமாக கருதப்படாது. CRAI கிடைக்கும் ஆதாரங்களின் நிலையை வெளிப்படையாகக் காட்டுகிறது."
              : "Missing evidence is not treated as zero risk. CRAI explicitly records the state of each evidence source."}
          </p>
        </div>
      </section>

      {/* Integrity */}
      <section className="cr-evidence-card">
        <div className="cr-section-heading">
          <div>
            <span>{t("integrity")}</span>

            <h2>
              {language === "ta"
                ? "ஆதார தொகுப்பு ஒருமைப்பாடு"
                : "Evidence package integrity"}
            </h2>
          </div>

          {verified && (
            <span className="cr-verified">
              ✓{" "}
              {language === "ta"
                ? "சரிபார்க்கப்பட்டது"
                : "Verified"}
            </span>
          )}
        </div>

        <div className="cr-hash-box">
          <span>
            {language === "ta"
              ? "Integrity hash"
              : "Integrity hash"}
          </span>

          <code>{integrityHash}</code>
        </div>

        <button
          type="button"
          className="cr-verify-button"
          onClick={handleVerify}
          disabled={verifying}
        >
          {verifying
            ? language === "ta"
              ? "சரிபார்க்கிறது..."
              : "Verifying..."
            : language === "ta"
              ? "ஆதார தொகுப்பை சரிபார்"
              : "Verify Evidence Package"}
        </button>

        {verification && (
          <div
            className={`cr-verification-result ${
              verified
                ? "valid"
                : "invalid"
            }`}
          >
            <strong>
              {verified
                ? `✓ ${
                    language === "ta"
                      ? "ஆதார தொகுப்பு சரியானது"
                      : "Evidence package is valid"
                  }`
                : `! ${
                    language === "ta"
                      ? "சரிபார்ப்பு தோல்வியடைந்தது"
                      : "Evidence verification failed"
                  }`}
            </strong>

            {verification.reason && (
              <span>
                {verification.reason}
              </span>
            )}
          </div>
        )}

        <p className="cr-integrity-note">
          {language === "ta"
            ? "Hash பதிவு ஒருமைப்பாட்டைச் சரிபார்க்க உதவுகிறது; ஆதாரங்களில் உள்ள உண்மைகளை தனியாக நிரூபிக்காது."
            : "The hash verifies record integrity; it does not independently prove the truth of the underlying observations."}
        </p>
      </section>

      {/* Timeline */}
      <section className="cr-evidence-card">
        <div className="cr-section-heading">
          <div>
            <span>{t("timeline")}</span>

            <h2>
              {language === "ta"
                ? "நிகழ்வு வாழ்க்கைச் சுழற்சி"
                : "Event lifecycle"}
            </h2>
          </div>
        </div>

        <div className="cr-timeline">
          {timeline.length === 0 ? (
            <div className="cr-timeline-empty">
              {language === "ta"
                ? "Timeline தரவு இல்லை."
                : "No timeline data available."}
            </div>
          ) : (
            timeline.map(
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

                const itemDecision =
                  item?.decision ||
                  item?.action ||
                  item?.state ||
                  "";

                return (
                  <div
                    className="cr-timeline-item"
                    key={
                      item?.id ||
                      `${phase}-${index}`
                    }
                  >
                    <div className="cr-timeline-marker">
                      <span />
                    </div>

                    <div className="cr-timeline-content">
                      <div className="cr-timeline-top">
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

                      {itemDecision && (
                        <p>
                          {itemDecision}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>
      </section>

      {/* Trust footer */}
      <section className="cr-evidence-trust">
        <span>✓</span>

        <div>
          <strong>
            {language === "ta"
              ? "CRAI ஆதார அடிப்படையிலான முடிவு"
              : "CRAI evidence-first decision"}
          </strong>

          <p>
            {language === "ta"
              ? "Risk மற்றும் decision backend-ல் கணக்கிடப்படுகின்றன. இந்த பக்கம் பதிவு செய்யப்பட்ட முடிவையும் அதன் ஆதாரங்களையும் மட்டுமே காட்டுகிறது."
              : "Risk and decisions are calculated by the backend. This page displays the recorded decision and its supporting evidence."}
          </p>
        </div>
      </section>

      <style>{pageStyles}</style>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  tone,
}) {
  return (
    <div className="cr-summary-item">
      <span>{label}</span>

      <strong
        className={
          tone ? `tone-${tone}` : ""
        }
      >
        {value}
      </strong>
    </div>
  );
}

function EvidenceSource({
  name,
  state,
  t,
}) {
  const normalized =
    String(state || "UNKNOWN").toUpperCase();

  const className =
    normalized.toLowerCase();

  return (
    <div
      className={`cr-evidence-source ${className}`}
    >
      <div className="cr-evidence-source-icon">
        {normalized === "AVAILABLE"
          ? "✓"
          : normalized === "MISSING"
            ? "—"
            : "!"}
      </div>

      <div>
        <strong>{name}</strong>

        <span>
          {stateLabel(
            normalized,
            t
          )}
        </span>
      </div>
    </div>
  );
}

const loadingStyles = `
.cr-evidence-page {
  max-width: 1050px;
  margin: 0 auto;
  padding: 22px 20px 42px;
}

.cr-evidence-loading {
  display: grid;
  gap: 10px;
}

.cr-evidence-loading div {
  height: 120px;
  border-radius: 12px;
  background: #e9efeb;
  animation: crEvidencePulse 1.2s ease-in-out infinite;
}

@keyframes crEvidencePulse {
  0%, 100% { opacity: .5; }
  50% { opacity: 1; }
}
`;

const pageStyles = `
.cr-evidence-page {
  width: 100%;
  max-width: 1050px;
  margin: 0 auto;
  padding: 22px 20px 42px;
  color: #17201c;
}

.cr-evidence-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 15px;
}

.cr-evidence-back {
  display: block;
  margin-bottom: 10px;
  color: #145a45;
  text-decoration: none;
  font-size: 10px;
  font-weight: 800;
}

.cr-evidence-eyebrow {
  display: block;
  color: #78847e;
  font-size: 9px;
  font-weight: 850;
  letter-spacing: .12em;
}

.cr-evidence-header h1 {
  margin: 4px 0 0;
  font-size: 27px;
  line-height: 1.1;
  letter-spacing: -.025em;
}

.cr-evidence-header p {
  max-width: 620px;
  margin: 7px 0 0;
  color: #68746e;
  font-size: 13px;
  line-height: 1.5;
}

.cr-evidence-authority,
.cr-evidence-status {
  flex: 0 0 auto;
  padding: 6px 9px;
  border: 1px solid #cfe5d8;
  border-radius: 999px;
  background: #edf7f1;
  color: #176246;
  font-size: 8px;
  font-weight: 850;
  white-space: nowrap;
}

.cr-evidence-card {
  margin-top: 10px;
  padding: 14px;
  border: 1px solid #dfe7e1;
  border-radius: 12px;
  background: #fff;
}

.cr-section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.cr-section-heading span:first-child {
  display: block;
  color: #7d8982;
  font-size: 8px;
  font-weight: 850;
  letter-spacing: .08em;
}

.cr-section-heading h2 {
  margin: 4px 0 0;
  font-size: 15px;
  line-height: 1.25;
}

.cr-evidence-count {
  min-width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 7px;
  background: #edf7f1;
  color: #145a45;
  font-size: 10px;
  font-weight: 850;
}

.cr-evidence-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
}

.cr-summary-item {
  min-height: 63px;
  padding: 10px;
  border: 1px solid #e5ebe7;
  border-radius: 8px;
  background: #fafcfb;
}

.cr-summary-item span {
  display: block;
  color: #89938e;
  font-size: 8px;
  font-weight: 750;
}

.cr-summary-item strong {
  display: block;
  margin-top: 5px;
  color: #26332d;
  font-size: 11px;
  line-height: 1.3;
  word-break: break-word;
}

.cr-summary-item strong.tone-low {
  color: #176246;
}

.cr-summary-item strong.tone-moderate {
  color: #8a681d;
}

.cr-summary-item strong.tone-high {
  color: #9a5a31;
}

.cr-summary-item strong.tone-critical {
  color: #9a3939;
}

.cr-evidence-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 7px;
}

.cr-evidence-source {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 62px;
  padding: 9px;
  border: 1px solid #e2e9e4;
  border-radius: 8px;
  background: #fafcfb;
}

.cr-evidence-source-icon {
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

.cr-evidence-source strong {
  display: block;
  font-size: 10px;
}

.cr-evidence-source span {
  display: block;
  margin-top: 3px;
  color: #89938e;
  font-size: 8px;
  font-weight: 750;
}

.cr-evidence-source.available {
  border-color: #cfe5d8;
  background: #f4faf6;
}

.cr-evidence-source.available .cr-evidence-source-icon {
  background: #dff0e6;
  color: #176246;
}

.cr-evidence-source.available span {
  color: #176246;
}

.cr-evidence-source.missing {
  border-color: #e4e8e5;
}

.cr-evidence-source.uncertain,
.cr-evidence-source.stale {
  border-color: #eadcb9;
  background: #fffaf0;
}

.cr-evidence-source.uncertain .cr-evidence-source-icon,
.cr-evidence-source.stale .cr-evidence-source-icon {
  background: #fff0c9;
  color: #8a681d;
}

.cr-evidence-source.uncertain span,
.cr-evidence-source.stale span {
  color: #8a681d;
}

.cr-evidence-explanation {
  margin-top: 10px;
  padding: 10px;
  border-left: 3px solid #b9cfc2;
  background: #f8faf8;
}

.cr-evidence-explanation strong {
  font-size: 9px;
}

.cr-evidence-explanation p {
  margin: 4px 0 0;
  color: #6f7c75;
  font-size: 9px;
  line-height: 1.5;
}

.cr-hash-box {
  padding: 10px;
  border: 1px solid #e2e8e4;
  border-radius: 8px;
  background: #f8faf8;
}

.cr-hash-box span {
  display: block;
  margin-bottom: 5px;
  color: #818c86;
  font-size: 8px;
  font-weight: 800;
}

.cr-hash-box code {
  display: block;
  color: #425149;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 8px;
  line-height: 1.5;
  word-break: break-all;
}

.cr-verify-button {
  min-height: 38px;
  margin-top: 9px;
  padding: 0 13px;
  border: 0;
  border-radius: 8px;
  background: #145a45;
  color: #fff;
  font-size: 9px;
  font-weight: 850;
  cursor: pointer;
}

.cr-verify-button:disabled {
  opacity: .55;
  cursor: wait;
}

.cr-verified {
  padding: 5px 8px;
  border-radius: 999px;
  background: #edf7f1;
  color: #176246;
  font-size: 8px;
  font-weight: 850;
}

.cr-verification-result {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 9px;
  padding: 9px;
  border-radius: 8px;
  font-size: 9px;
}

.cr-verification-result.valid {
  background: #edf7f1;
  color: #176246;
}

.cr-verification-result.invalid {
  background: #fff2f2;
  color: #994444;
}

.cr-verification-result span {
  font-size: 8px;
  opacity: .85;
}

.cr-integrity-note {
  margin: 9px 0 0;
  color: #818c86;
  font-size: 8px;
  line-height: 1.5;
}

.cr-timeline {
  position: relative;
}

.cr-timeline-item {
  display: flex;
  gap: 10px;
  min-height: 61px;
}

.cr-timeline-marker {
  position: relative;
  width: 15px;
  flex: 0 0 15px;
}

.cr-timeline-marker::after {
  content: "";
  position: absolute;
  top: 16px;
  left: 6px;
  bottom: -2px;
  width: 1px;
  background: #dce5df;
}

.cr-timeline-item:last-child
.cr-timeline-marker::after {
  display: none;
}

.cr-timeline-marker span {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #145a45;
}

.cr-timeline-content {
  flex: 1;
  padding-bottom: 12px;
}

.cr-timeline-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.cr-timeline-top strong {
  font-size: 10px;
}

.cr-timeline-top time {
  color: #89938e;
  font-size: 8px;
}

.cr-timeline-content p {
  margin: 4px 0 0;
  color: #68746e;
  font-size: 9px;
  line-height: 1.45;
}

.cr-timeline-empty {
  padding: 15px;
  border-radius: 8px;
  background: #f8faf8;
  color: #7c8781;
  font-size: 9px;
  text-align: center;
}

.cr-evidence-trust {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 12px;
  padding: 11px 12px;
  border: 1px solid #dfe8e2;
  border-radius: 10px;
  background: #f8faf8;
}

.cr-evidence-trust > span {
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

.cr-evidence-trust strong {
  display: block;
  font-size: 10px;
}

.cr-evidence-trust p {
  margin: 3px 0 0;
  color: #78847e;
  font-size: 8px;
  line-height: 1.5;
}

.cr-evidence-error {
  max-width: 520px;
  margin: 60px auto;
  padding: 25px;
  border: 1px solid #e1e7e3;
  border-radius: 13px;
  background: #fff;
  text-align: center;
}

.cr-evidence-error-icon {
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

.cr-evidence-error h1 {
  margin: 0;
  font-size: 18px;
}

.cr-evidence-error p {
  margin: 7px 0 14px;
  color: #758079;
  font-size: 10px;
  line-height: 1.5;
}

.cr-evidence-error button {
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

.cr-evidence-error a {
  display: block;
  margin-top: 12px;
  color: #145a45;
  text-decoration: none;
  font-size: 9px;
  font-weight: 800;
}

@media (max-width: 760px) {
  .cr-evidence-page {
    padding: 17px 14px 95px;
  }

  .cr-evidence-header h1 {
    font-size: 23px;
  }

  .cr-evidence-summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .cr-evidence-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 430px) {
  .cr-evidence-header {
    gap: 8px;
  }

  .cr-evidence-authority {
    font-size: 7px;
  }

  .cr-evidence-summary-grid {
    grid-template-columns: 1fr 1fr;
  }

  .cr-evidence-grid {
    grid-template-columns: 1fr 1fr;
  }

  .cr-timeline-top {
    align-items: flex-start;
    flex-direction: column;
    gap: 3px;
  }
}
`;