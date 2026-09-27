import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  CloudRain,
  Info,
  Loader2,
  MessageCircle,
  RefreshCw,
  ShieldAlert,
  Sprout,
  Sparkles,
  Upload,
  Wind,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useFieldSelection } from "../app/FieldContext.jsx";
import { analyzeFieldImage } from "../services/craiData.js";

function n(value) {
  const x = Number(value);
  return Number.isFinite(x) ? x : null;
}

function getAuth(data) {
  const outputs =
    data?.analysis?.judge_intelligence?.authoritative_outputs ||
    data?.analysis?.risk ||
    {};

  const decision =
    data?.decision ||
    data?.analysis?.decision ||
    data?.event?.decision ||
    outputs?.decision ||
    {};

  const scoreCandidates = [
    data?.risk_score,
    data?.score,
    data?.riskScore,
    data?.analysis?.risk_score,
    data?.analysis?.risk?.risk_score,
    outputs?.risk_score,
    data?.event?.risk_score,
    data?.event?.during_state?.risk_score,
  ];

  const levelCandidates = [
    data?.risk_level,
    data?.level,
    data?.riskLevel,
    data?.analysis?.risk_level,
    data?.analysis?.risk?.risk_level,
    outputs?.risk_level,
    data?.event?.risk_level,
    data?.event?.during_state?.risk_level,
  ];

  const score = scoreCandidates.map(n).find((x) => x !== null) ?? null;
  const level =
    levelCandidates.find(
      (x) => x !== undefined && x !== null && String(x).trim()
    )?.toString().toUpperCase() || "UNKNOWN";

  const eventId =
    data?.event?.event_id ||
    data?.event_id ||
    data?.eventId ||
    null;

  const ready =
    data?.decision?.ready === true ||
    data?.analysis?.decision?.ready === true ||
    false;

  const action =
    decision?.action ||
    decision?.decision_action ||
    outputs?.decision_action ||
    "MONITOR";

  const priority =
    decision?.priority ||
    outputs?.decision_priority ||
    "NORMAL";

  return {
    score,
    level,
    ready,
    action,
    priority,
    eventId,
  };
}

function getVisual(data) {
  return (
    data?.disease_ai ||
    data?.analysis?.disease_ai ||
    data?.analysis?.disease ||
    null
  );
}

function getSensor(data) {
  return (
    data?.sensor ||
    data?.analysis?.evidence?.details?.environmental ||
    null
  );
}

function getAdaptive(data) {
  return (
    data?.adaptive_evidence ||
    data?.analysis?.adaptive_evidence ||
    data?.analysis?.evidence?.adaptive ||
    null
  );
}

function getSources(data) {
  const sources =
    data?.evidence_sources ||
    data?.analysis?.evidence_sources ||
    data?.evidence_package?.evidence_sources ||
    [];

  return Array.isArray(sources) ? sources : [];
}

function isEmergency(data, auth, visual) {
  const action = String(auth.action || "").toUpperCase();
  const priority = String(auth.priority || "").toUpperCase();
  const severity = String(
    visual?.severity || ""
  ).toUpperCase();

  return (
    ["ALERT", "PROTECT", "EMERGENCY"].includes(action) ||
    auth.level === "CRITICAL" ||
    (auth.level === "HIGH" && priority === "HIGH") ||
    severity === "CRITICAL"
  );
}

function farmerState(data, auth, visual) {
  if (!data) return "idle";

  if (isEmergency(data, auth, visual)) {
    return "alert";
  }

  if (auth.ready && auth.score !== null) {
    return auth.level === "LOW" ? "good" : "attention";
  }

  return "provisional";
}

function stateCopy(state) {
  if (state === "alert") {
    return {
      eyebrow: "FIELD ALERT",
      title: "Your field needs attention now",
      body:
        "CRAI detected a condition that may require immediate protective action.",
      icon: ShieldAlert,
      tone: "danger",
    };
  }

  if (state === "good") {
    return {
      eyebrow: "FIELD STATUS",
      title: "Your field looks stable",
      body:
        "CRAI found no immediate high-priority condition in the available evidence.",
      icon: CheckCircle2,
      tone: "good",
    };
  }

  if (state === "attention") {
    return {
      eyebrow: "FIELD STATUS",
      title: "Your field needs attention",
      body:
        "CRAI found signs of crop or environmental stress. Follow the recommended next step below.",
      icon: Sprout,
      tone: "attention",
    };
  }

  if (state === "provisional") {
    return {
      eyebrow: "CRAI IS CHECKING",
      title: "Possible crop stress detected",
      body:
        "CRAI has found a useful signal, but some evidence is uncertain. You can act on the current guidance while CRAI continues improving the assessment.",
      icon: Sparkles,
      tone: "provisional",
    };
  }

  return {
    eyebrow: "FIELD ASSESSMENT",
    title: "Check your crop",
    body:
      "Take a clear crop photo and CRAI will combine the available field evidence.",
    icon: Camera,
    tone: "idle",
  };
}

export default function FieldAssessment() {
  const navigate = useNavigate();
  const { id = "A1" } = useParams();
  const { selected, language } = useFieldSelection();

  const farmId = selected?.farmId ?? 1;
  const zoneId = selected?.zoneId ?? id ?? "A1";
  const crop = selected?.crop ?? "Tomato";
  const growthStage = selected?.growthStage ?? "Vegetative";

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function selectFile(next) {
    if (!next) return;

    setFile(next);
    setResult(null);
    setError("");
    setDetailsOpen(false);

    const url = URL.createObjectURL(next);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return url;
    });
  }

  async function analyzeCrop() {
    if (!file) {
      setError("Please choose a crop photo first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await analyzeFieldImage({
        file,
        farmId,
        zoneId,
        crop,
        growthStage,
        advisoryLanguage: language === "ta" ? "Tamil" : "English",
      });

      setResult(data);
    } catch (err) {
      console.error("[CRAI] Farmer assessment failed:", err);
      setError(
        err?.message ||
          "CRAI could not assess this field right now."
      );
    } finally {
      setLoading(false);
    }
  }

  const auth = useMemo(() => getAuth(result), [result]);
  const visual = useMemo(() => getVisual(result), [result]);
  const sensor = useMemo(() => getSensor(result), [result]);
  const adaptive = useMemo(() => getAdaptive(result), [result]);
  const sources = useMemo(() => getSources(result), [result]);

  const state = farmerState(result, auth, visual);
  const copy = stateCopy(state);
  const StateIcon = copy.icon;

  const visualLabel =
    visual?.prediction ||
    visual?.label ||
    visual?.disease ||
    "Possible crop stress";

  const visualConfidence = n(
    visual?.confidence
  );

  const emergency = state === "alert";

  const recommendation = (() => {
    if (emergency) {
      return {
        title: "Protect the field now",
        text:
          "Follow the immediate field safety or crop-protection action shown by CRAI. Additional evidence can be collected in parallel.",
      };
    }

    if (auth.level === "HIGH") {
      return {
        title: "Inspect the affected area",
        text:
          "Check the affected plants closely and follow CRAI's current advisory. CRAI will continue using available field signals.",
      };
    }

    if (visual?.severity) {
      return {
        title: "Inspect the affected leaves",
        text:
          `CRAI found ${visualLabel.replaceAll("_", " ")}. Check a few nearby plants and avoid making treatment decisions from the image alone.`,
      };
    }

    return {
      title: "Keep monitoring your field",
      text:
        "CRAI is using the available evidence now and will improve the assessment as fresh field signals become available.",
    };
  })();

  const adaptiveText = (() => {
    if (!adaptive) return "CRAI will continue monitoring available field signals.";

    const source =
      adaptive?.next_best_source ||
      adaptive?.source ||
      "available field sensors";

    if (emergency) {
      return `CRAI is continuing to collect ${source} evidence in the background. You do not need to wait for another image before taking action.`;
    }

    return `CRAI may use ${source} to improve confidence. Your current guidance is still available.`;
  })();

  return (
    <div className="crai-farmer-assessment">
      <div className="crai-farmer-shell">

        {/* HEADER */}
        <header className="crai-farmer-header">
          <button
            className="crai-icon-button"
            onClick={() => navigate("/")}
            aria-label="Back"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="crai-header-title">
            <span>MY FIELD</span>
            <strong>
              {crop} · Zone {zoneId}
            </strong>
          </div>

          <div className="crai-header-badge">
            <span />
            Live
          </div>
        </header>

        <main className="crai-farmer-content">

          {/* HERO */}
          <section className={`crai-field-hero ${copy.tone}`}>

            <div className="crai-hero-glow" />

            <div className="crai-hero-copy">
              <div className="crai-status-pill">
                <StateIcon size={15} />
                {copy.eyebrow}
              </div>

              <h1>{copy.title}</h1>

              <p>{copy.body}</p>

              {result && (
                <div className="crai-hero-meta">
                  <span>
                    <Sprout size={14} />
                    {crop}
                  </span>

                  <span>
                    Zone {zoneId}
                  </span>

                  <span>
                    {growthStage}
                  </span>
                </div>
              )}
            </div>

            <div className="crai-hero-orb">
              <div className="crai-orb-ring" />
              <StateIcon size={42} strokeWidth={1.6} />
            </div>
          </section>

          {/* PHOTO + RESULT */}
          <section className="crai-photo-section">

            <div className="crai-section-heading">
              <div>
                <span className="crai-mini-label">
                  FIELD PHOTO
                </span>
                <h2>
                  {file ? "Photo ready" : "Show CRAI your crop"}
                </h2>
              </div>

              {file && (
                <span className="crai-photo-ready">
                  <CheckCircle2 size={15} />
                  Ready
                </span>
              )}
            </div>

            <label className="crai-photo-drop">

              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Selected crop"
                  />

                  <div className="crai-photo-overlay">
                    <span>
                      Tap to change photo
                    </span>
                  </div>
                </>
              ) : (
                <div className="crai-photo-empty">
                  <div className="crai-camera-bubble">
                    <Camera size={28} />
                  </div>

                  <strong>
                    Take or upload a crop photo
                  </strong>

                  <span>
                    A clear photo of the affected leaves
                    works best.
                  </span>

                  <div className="crai-photo-button">
                    <Upload size={17} />
                    Choose photo
                  </div>
                </div>
              )}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => {
                  selectFile(e.target.files?.[0] || null);
                  e.target.value = "";
                }}
              />

            </label>

            <button
              className="crai-primary-action"
              disabled={!file || loading}
              onClick={analyzeCrop}
            >
              {loading ? (
                <>
                  <Loader2 size={19} className="crai-spin" />
                  CRAI is checking...
                </>
              ) : (
                <>
                  <Sparkles size={19} />
                  {result ? "Check again with CRAI" : "Check with CRAI"}
                </>
              )}

              {!loading && <ArrowRight size={18} />}
            </button>

            {error && (
              <div className="crai-inline-error">
                <Info size={18} />
                <span>{error}</span>
              </div>
            )}

          </section>

          {/* WHAT TO DO */}
          {result && (
            <section className={`crai-action-card ${emergency ? "emergency" : ""}`}>

              <div className="crai-action-icon">
                {emergency ? (
                  <ShieldAlert size={22} />
                ) : (
                  <Sprout size={22} />
                )}
              </div>

              <div className="crai-action-copy">
                <span className="crai-mini-label">
                  WHAT TO DO NOW
                </span>

                <h2>{recommendation.title}</h2>

                <p>{recommendation.text}</p>
              </div>

              {auth.eventId && (
                <button
                  className="crai-round-arrow"
                  onClick={() =>
                    navigate(`/evidence/${auth.eventId}`)
                  }
                  aria-label="View evidence"
                >
                  <ArrowRight size={18} />
                </button>
              )}

            </section>
          )}

          {/* PROVISIONAL / CONTINUOUS INTELLIGENCE */}
          {result && !emergency && (
            <section className="crai-monitor-card">

              <div className="crai-monitor-icon">
                <RefreshCw size={19} />
              </div>

              <div>
                <strong>
                  CRAI keeps learning from your field
                </strong>

                <p>{adaptiveText}</p>
              </div>

              <span className="crai-live-dot" />
            </section>
          )}

          {/* EMERGENCY CONTINUOUS MODE */}
          {result && emergency && (
            <section className="crai-emergency-followup">

              <div className="crai-emergency-top">
                <div>
                  <span className="crai-mini-label">
                    CONTINUOUS RESPONSE
                  </span>

                  <h3>
                    CRAI is still gathering evidence
                  </h3>
                </div>

                <Wind size={24} />
              </div>

              <p>
                {adaptiveText}
              </p>

              <div className="crai-response-line">
                <span className="active" />
                Detect
                <span className="active" />
                Assess
                <span className="active" />
                Protect
                <span className="pending" />
                Improve
              </div>

            </section>
          )}

          {/* SIMPLE STATUS */}
          {result && (
            <section className="crai-status-grid">

              <div className="crai-status-tile">
                <div className="crai-status-tile-icon">
                  <Camera size={18} />
                </div>

                <div>
                  <span>Crop photo</span>
                  <strong>
                    {visual ? "Analyzed" : "Available"}
                  </strong>
                </div>
              </div>

              <div className="crai-status-tile">
                <div className="crai-status-tile-icon">
                  <CloudRain size={18} />
                </div>

                <div>
                  <span>Field signals</span>
                  <strong>
                    {sensor ? "Available" : "Updating"}
                  </strong>
                </div>
              </div>

              {auth.score !== null && (
                <div className="crai-status-tile">
                  <div className="crai-status-tile-icon">
                    <ShieldAlert size={18} />
                  </div>

                  <div>
                    <span>Field risk</span>
                    <strong>
                      {auth.level} · {auth.score.toFixed(0)}/100
                    </strong>
                  </div>
                </div>
              )}

            </section>
          )}

          {/* WHY CRAI */}
          {result && (
            <section className="crai-details">

              <button
                className="crai-details-toggle"
                onClick={() => setDetailsOpen((v) => !v)}
              >
                <div>
                  <Info size={18} />
                  <span>
                    Why CRAI says this
                  </span>
                </div>

                <ChevronDown
                  size={19}
                  className={detailsOpen ? "open" : ""}
                />
              </button>

              {detailsOpen && (
                <div className="crai-details-body">

                  <div>
                    <span>Visual signal</span>
                    <strong>
                      {visualLabel.replaceAll("_", " ")}
                    </strong>
                    {visualConfidence !== null && (
                      <small>
                        AI confidence {visualConfidence.toFixed(1)}%
                      </small>
                    )}
                  </div>

                  <div>
                    <span>Evidence approach</span>
                    <strong>
                      Use available evidence now
                    </strong>
                    <small>
                      Better evidence can continue in parallel.
                    </small>
                  </div>

                  <div>
                    <span>CRAI decision</span>
                    <strong>
                      {auth.ready
                        ? `${auth.level} field state`
                        : "Provisional guidance"}
                    </strong>
                    <small>
                      {auth.action}
                    </small>
                  </div>

                  <div className="crai-source-row">
                    {sources.length > 0
                      ? sources.map((source) => (
                          <span key={source}>
                            {String(source).replaceAll("_", " ")}
                          </span>
                        ))
                      : (
                        <>
                          <span>Visual</span>
                          <span>Field context</span>
                        </>
                      )}
                  </div>

                </div>
              )}

            </section>
          )}

          {/* ASK CRAI */}
          <button
            className="crai-ask-card"
            onClick={() => navigate("/ask-crai")}
          >
            <div className="crai-ask-icon">
              <MessageCircle size={21} />
            </div>

            <div>
              <strong>
                Ask CRAI about this field
              </strong>

              <span>
                Ask why, what to do, or what CRAI found.
              </span>
            </div>

            <ArrowRight size={19} />
          </button>

          <div className="crai-simulated-footer">
            <span />
            Development mode · Simulated hardware
          </div>

        </main>
      </div>
    </div>
  );
}
