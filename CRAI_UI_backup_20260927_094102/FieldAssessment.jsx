import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Upload,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Thermometer,
  Clock3,
  MapPin,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useFieldSelection } from "../app/FieldContext.jsx";
import { analyzeFieldImage } from "../services/craiData.js";

function numberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/* ---------------------------------------------------------
   CRAI AUTHORITATIVE RESULT EXTRACTION
   --------------------------------------------------------- */

function extractAuthoritative(data) {
  const event = data?.event || null;

  const during =
    event?.during_state ||
    data?.evidence_package?.record?.during_state ||
    data?.package?.record?.during_state ||
    null;

  const outputs =
    data?.analysis?.judge_intelligence?.authoritative_outputs ||
    data?.analysis?.risk ||
    null;

  const decision =
    event?.decision ||
    during?.decision ||
    data?.analysis?.decision ||
    outputs?.decision ||
    data?.decision ||
    null;

  const scoreCandidates = [
    event?.risk_score,
    during?.risk_score,
    data?.risk_score,
    data?.riskScore,
    data?.score,
    data?.analysis?.risk_score,
    data?.analysis?.riskScore,
    data?.analysis?.risk?.risk_score,
    outputs?.risk_score,
    decision?.risk_score,
    decision?.context?.risk_score,
  ];

  const levelCandidates = [
    event?.risk_level,
    during?.risk_level,
    data?.risk_level,
    data?.riskLevel,
    data?.level,
    data?.analysis?.risk_level,
    data?.analysis?.riskLevel,
    data?.analysis?.risk?.risk_level,
    outputs?.risk_level,
    decision?.context?.risk_level,
  ];

  let score = null;

  for (const value of scoreCandidates) {
    const n = numberOrNull(value);

    if (n !== null) {
      score = n;
      break;
    }
  }

  let level = null;

  for (const value of levelCandidates) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim()
    ) {
      level = String(value).toUpperCase();
      break;
    }
  }

  const sources =
    event?.evidence_sources ||
    data?.evidence_sources ||
    data?.analysis?.evidence_sources ||
    data?.evidence?.sources ||
    data?.evidence_package?.evidence_sources ||
    [];

  const eventId =
    event?.event_id ||
    event?.id ||
    data?.event_id ||
    data?.eventId ||
    data?.evidence_package?.event_id ||
    null;

  const decisionReady =
    data?.decision?.ready === true ||
    data?.analysis?.decision?.ready === true ||
    data?.analysis?.judge_intelligence?.decision_trace?.stages?.some(
      (stage) =>
        stage?.stage === "DETERMINISTIC_DECISION" &&
        stage?.status === "COMPLETE"
    ) === true;

  const additionalEvidence =
    data?.status === "ADDITIONAL_EVIDENCE_REQUIRED" ||
    data?.analysis?.additional_evidence_required === true ||
    data?.analysis?.decision?.action ===
      "COLLECT_ADDITIONAL_EVIDENCE" ||
    data?.decision?.action === "COLLECT_ADDITIONAL_EVIDENCE";

  return {
    score,
    level: level || "UNKNOWN",
    decision,
    event,
    during,
    analysis: data?.analysis || null,
    sensor:
      data?.sensor ||
      during?.sensor ||
      event?.sensor ||
      null,
    sources: Array.isArray(sources) ? sources : [],
    eventId,
    decisionReady,
    additionalEvidence,
  };
}

/* ---------------------------------------------------------
   RISK UI
   --------------------------------------------------------- */

function riskTone(level) {
  switch (level) {
    case "CRITICAL":
      return "critical";
    case "HIGH":
      return "high";
    case "MODERATE":
      return "moderate";
    case "LOW":
      return "low";
    default:
      return "unknown";
  }
}

/* ---------------------------------------------------------
   COMPONENT
   --------------------------------------------------------- */

export default function FieldAssessment() {
  const navigate = useNavigate();
  const { id = "A1" } = useParams();

  const { selected, language } = useFieldSelection();

  const farmId = selected?.farmId ?? 1;
  const zoneId = selected?.zoneId ?? id ?? "A1";
  const crop = selected?.crop ?? "Tomato";
  const growthStage =
    selected?.growthStage ?? "Vegetative";

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* -------------------------------------------------------
     CLEANUP IMAGE PREVIEW
     ------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  /* -------------------------------------------------------
     FILE SELECTION
     ------------------------------------------------------- */

  function selectFile(next) {
    if (!next) return;

    setFile(next);
    setResult(null);
    setError("");

    const url = URL.createObjectURL(next);

    setPreview((old) => {
      if (old) {
        URL.revokeObjectURL(old);
      }

      return url;
    });
  }

  /* -------------------------------------------------------
     IMAGE ANALYSIS
     ------------------------------------------------------- */

  async function analyzeCrop() {
    if (!file) {
      setError("Please upload a crop image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      console.log("[CRAI] Starting field image analysis...");

      const data = await analyzeFieldImage({
        file,
        farmId,
        zoneId,
        crop,
        growthStage,
        advisoryLanguage:
          language === "ta" ? "Tamil" : "English",
      });

      console.log("[CRAI] Image analysis response:", data);

      setResult(data);

      const auth = extractAuthoritative(data);

      /*
       * IMPORTANT:
       *
       * If CRAI says more evidence is required,
       * that is a VALID result.
       *
       * We do not call simulator/evaluate.
       * We do not manufacture a risk score.
       */
      if (auth.additionalEvidence && !auth.decisionReady) {
        setError(
          data?.analysis?.adaptive_evidence?.reason ||
            data?.adaptive_evidence?.reason ||
            "CRAI needs additional field evidence before making a risk decision."
        );
      }
    } catch (err) {
      console.error(
        "[CRAI] Field image analysis failed:",
        err
      );

      setError(
        err?.message ||
          "CRAI could not analyze this field image."
      );
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------------------------------
     DERIVED RESULT DATA
     ------------------------------------------------------- */

  const auth = extractAuthoritative(result);

  const {
    score,
    level,
    decision,
    event,
    sources,
    eventId,
    additionalEvidence,
    decisionReady,
  } = auth;

  const visualEvidence =
    result?.analysis?.evidence?.visual ||
    result?.analysis?.visual ||
    null;

  const sensor =
    result?.sensor ||
    result?.analysis?.evidence?.environment ||
    null;

  const adaptive =
    result?.adaptive_evidence ||
    result?.analysis?.adaptive_evidence ||
    null;

  const diseaseAI =
    result?.disease_ai ||
    result?.analysis?.disease_ai ||
    null;

  const isDecisionAvailable =
    decisionReady &&
    score !== null &&
    level !== "UNKNOWN";

  /* -------------------------------------------------------
     RENDER
     ------------------------------------------------------- */

  return (
    <div className="page crai-field-assessment">

      {/* ===================================================
          TOP BAR
      =================================================== */}

      <div className="assessment-topbar">

        <button
          className="assessment-back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Back to field
        </button>

        <div>
          <div className="eyebrow">
            FIELD ASSESSMENT
          </div>

          <h1>
            Check {crop} · Zone {zoneId}
          </h1>

          <p>
            Upload field evidence and let CRAI evaluate
            the current evidence state.
          </p>
        </div>

      </div>

      {/* ===================================================
          MAIN GRID
      =================================================== */}

      <div className="assessment-grid">

        {/* =================================================
            OBSERVATION
        ================================================= */}

        <section className="assessment-card">

          <div className="assessment-card-head">

            <div>
              <div className="eyebrow">
                OBSERVE
              </div>

              <h2>
                Crop image
              </h2>
            </div>

            <div className="assessment-icon">
              <Camera size={20} />
            </div>

          </div>

          {/* UPLOAD */}

          <label className="upload-zone">

            {preview ? (
              <img
                src={preview}
                alt="Uploaded crop"
                className="assessment-preview"
              />
            ) : (
              <>
                <Upload size={34} />

                <strong>
                  Upload crop image
                </strong>

                <span>
                  JPG, PNG or WEBP
                </span>
              </>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                selectFile(
                  e.target.files?.[0] || null
                );

                /*
                 * Allow selecting the same image again.
                 */
                e.target.value = "";
              }}
            />

          </label>

          {/* CONTEXT */}

          <div className="assessment-context">

            <div>
              <span>Crop</span>
              <strong>{crop}</strong>
            </div>

            <div>
              <span>Zone</span>
              <strong>{zoneId}</strong>
            </div>

            <div>
              <span>Stage</span>
              <strong>{growthStage}</strong>
            </div>

          </div>

          {/* ANALYZE */}

          <button
            className="assessment-primary"
            disabled={!file || loading}
            onClick={analyzeCrop}
          >

            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="spin"
                />

                CRAI is evaluating...
              </>
            ) : (
              <>
                <Camera size={18} />

                {result
                  ? "Re-analyze with CRAI"
                  : "Analyze with CRAI"}
              </>
            )}

          </button>

          {/* ERROR / EVIDENCE MESSAGE */}

          {error && (
            <div className="assessment-error">

              <AlertTriangle size={18} />

              <span>
                {error}
              </span>

            </div>
          )}

          {/* SIMULATOR LABEL */}

          <div className="simulated-note">

            <span className="status-dot" />

            Development mode · SIMULATED HARDWARE

          </div>

        </section>

        {/* =================================================
            RESULT
        ================================================= */}

        <section className="assessment-card">

          <div className="assessment-card-head">

            <div>

              <div className="eyebrow">
                DECISION
              </div>

              <h2>
                CRAI risk assessment
              </h2>

            </div>

            {result && !additionalEvidence && (
              <CheckCircle2 size={22} />
            )}

          </div>

          {/* =================================================
              EMPTY
          ================================================= */}

          {!result && !loading && (
            <div className="result-empty">

              <ShieldCheck size={42} />

              <h3>
                Assessment ready
              </h3>

              <p>
                Upload a crop image and select
                Analyze with CRAI.
              </p>

            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="result-empty">

              <Loader2
                size={42}
                className="spin"
              />

              <h3>
                Evaluating evidence...
              </h3>

              <p>
                CRAI is acquiring and fusing
                the available field evidence.
              </p>

            </div>
          )}

          {/* =================================================
              RESULT
          ================================================= */}

          {result && !loading && (
            <div className="assessment-result">

              {/* ---------------------------------------------
                  EVIDENCE STATUS
              --------------------------------------------- */}

              {additionalEvidence && !decisionReady && (
                <div className="assessment-evidence-required">

                  <AlertTriangle size={22} />

                  <div>

                    <strong>
                      Additional evidence required
                    </strong>

                    <p>
                      CRAI has analyzed the uploaded image,
                      but the available evidence is not
                      sufficient for an authoritative risk
                      decision yet.
                    </p>

                  </div>

                </div>
              )}

              {/* ---------------------------------------------
                  RISK
              --------------------------------------------- */}

              <div
                className={`risk-score-panel ${riskTone(
                  level
                )}`}
              >

                <div>

                  <span>
                    CURRENT FIELD RISK
                  </span>

                  <strong>
                    {isDecisionAvailable &&
                    score !== null
                      ? score.toFixed(2)
                      : "—"}
                  </strong>

                  <small>
                    / 100
                  </small>

                </div>

                <div className="risk-level">
                  {isDecisionAvailable
                    ? level
                    : "NOT READY"}
                </div>

              </div>

              {/* ---------------------------------------------
                  DECISION MESSAGE
              --------------------------------------------- */}

              <div className="decision-message">

                <strong>

                  {additionalEvidence &&
                  !decisionReady
                    ? "More field evidence is needed."
                    : decision?.title ||
                      (level === "HIGH"
                        ? "High-priority field inspection"
                        : level === "CRITICAL"
                        ? "Critical field attention required"
                        : level === "MODERATE"
                        ? "Continue targeted monitoring"
                        : level === "LOW"
                        ? "Continue targeted monitoring"
                        : "Assessment not ready.")}
                </strong>

                <p>

                  {additionalEvidence &&
                  !decisionReady
                    ? adaptive?.reason ||
                      result?.analysis
                        ?.adaptive_evidence?.reason ||
                      "CRAI is requesting additional evidence before calculating an authoritative field risk."
                    : decision?.message ||
                      "CRAI's deterministic risk engine remains authoritative. Qwen is used only for explanation and advisory language."}

                </p>

              </div>

              {/* ---------------------------------------------
                  DISEASE AI
              --------------------------------------------- */}

              {diseaseAI && (
                <div className="result-facts">

                  <div>
                    <span>Visual finding</span>

                    <strong>
                      {diseaseAI?.prediction ||
                        diseaseAI?.label ||
                        diseaseAI?.class ||
                        "Detected"}
                    </strong>
                  </div>

                  <div>
                    <span>Visual confidence</span>

                    <strong>
                      {numberOrNull(
                        diseaseAI?.confidence
                      ) !== null
                        ? `${Number(
                            diseaseAI.confidence
                          ).toFixed(2)}%`
                        : "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Visual severity</span>

                    <strong>
                      {diseaseAI?.severity ||
                        "—"}
                    </strong>
                  </div>

                </div>
              )}

              {/* ---------------------------------------------
                  DECISION FACTS
              --------------------------------------------- */}

              <div className="result-facts">

                <div>
                  <span>Decision</span>

                  <strong>
                    {decision?.action ||
                      result?.decision?.action ||
                      (additionalEvidence
                        ? "COLLECT_ADDITIONAL_EVIDENCE"
                        : "—")}
                  </strong>
                </div>

                <div>
                  <span>Priority</span>

                  <strong>
                    {decision?.priority ||
                      result?.decision?.priority ||
                      result?.analysis
                        ?.judge_intelligence
                        ?.authoritative_outputs
                        ?.decision_priority ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Assessment</span>

                  <strong>
                    {result?.analysis
                      ?.judge_intelligence
                      ?.authoritative_outputs
                      ?.assessment_confidence ||
                      result?.during
                        ?.assessment_confidence ||
                      "NOT READY"}
                  </strong>
                </div>

                <div>
                  <span>Event</span>

                  <strong>
                    {eventId ||
                      "Not created"}
                  </strong>
                </div>

              </div>

              {/* ---------------------------------------------
                  SENSOR SNAPSHOT
              --------------------------------------------- */}

              {sensor && (
                <div className="result-facts">

                  <div>
                    <span>Sensor state</span>

                    <strong>
                      {sensor?.available === true
                        ? "AVAILABLE"
                        : "UNAVAILABLE"}
                    </strong>
                  </div>

                  <div>
                    <span>Temperature</span>

                    <strong>
                      {numberOrNull(
                        sensor?.temperature
                      ) !== null
                        ? `${Number(
                            sensor.temperature
                          ).toFixed(2)}°C`
                        : "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Humidity</span>

                    <strong>
                      {numberOrNull(
                        sensor?.humidity
                      ) !== null
                        ? `${Number(
                            sensor.humidity
                          ).toFixed(2)}%`
                        : "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Soil moisture</span>

                    <strong>
                      {numberOrNull(
                        sensor?.soil_moisture
                      ) !== null
                        ? `${Number(
                            sensor.soil_moisture
                          ).toFixed(2)}%`
                        : "—"}
                    </strong>
                  </div>

                </div>
              )}

              {/* ---------------------------------------------
                  EVIDENCE SOURCES
              --------------------------------------------- */}

              <div className="assessment-evidence-row">

                <div>
                  <Eye size={16} />

                  Visual

                  <strong>
                    {sources.includes("VISUAL_AI") ||
                    visualEvidence
                      ? "AVAILABLE"
                      : "—"}
                  </strong>
                </div>

                <div>
                  <Thermometer size={16} />

                  Environment

                  <strong>
                    {sources.includes(
                      "SENSOR_SIMULATED"
                    ) ||
                    sensor
                      ? "AVAILABLE"
                      : "—"}
                  </strong>
                </div>

                <div>
                  <Clock3 size={16} />

                  Temporal

                  <strong>
                    {sources.includes("TEMPORAL")
                      ? "AVAILABLE"
                      : "—"}
                  </strong>
                </div>

                <div>
                  <MapPin size={16} />

                  Spatial

                  <strong>
                    {sources.includes("SPATIAL")
                      ? "AVAILABLE"
                      : "—"}
                  </strong>
                </div>

              </div>

              {/* ---------------------------------------------
                  ADAPTIVE EVIDENCE
              --------------------------------------------- */}

              {adaptive && (
                <div className="decision-message">

                  <strong>
                    Next evidence
                  </strong>

                  <p>
                    {adaptive?.requested_evidence ||
                      adaptive?.action ||
                      adaptive?.adaptive_action ||
                      "Continue evidence acquisition."}

                    {adaptive?.next_best_source
                      ? ` · Source: ${adaptive.next_best_source}`
                      : ""}
                  </p>

                </div>
              )}

              {/* ---------------------------------------------
                  ACTIONS
              --------------------------------------------- */}

              <div className="assessment-result-actions">

                {eventId && (
                  <button
                    className="assessment-secondary"
                    onClick={() =>
                      navigate(
                        `/evidence/${eventId}`
                      )
                    }
                  >
                    View Evidence Package
                  </button>
                )}

                {additionalEvidence &&
                  !decisionReady && (
                    <button
                      className="assessment-secondary"
                      onClick={() => {
                        setResult(null);
                        setError("");
                      }}
                    >
                      Upload New Evidence
                    </button>
                  )}

              </div>

            </div>
          )}

        </section>

      </div>

    </div>
  );
}