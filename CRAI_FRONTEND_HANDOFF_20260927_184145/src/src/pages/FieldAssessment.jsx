import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronRight,
  Droplets,
  Leaf,
  Loader2,
  ShieldCheck,
  Thermometer,
  Upload,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useLanguage } from "../app/LanguageContext";
import {
  analyzeFieldImage,
  fetchCurrentEvent,
} from "../services/craiData";

const API =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

function n(value) {
  const x = Number(value);
  return Number.isFinite(x) ? x : null;
}

function firstNumber(...values) {
  for (const value of values) {
    const x = n(value);
    if (x !== null) return x;
  }
  return null;
}

function firstText(...values) {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      String(value).trim()
    ) {
      return String(value);
    }
  }

  return null;
}

function extractResult(data) {
  const analysis = data?.analysis || {};
  const judge =
    analysis?.judge_intelligence || {};

  const authoritative =
    judge?.authoritative_outputs || {};

  const during =
    data?.during_state ||
    data?.event?.during_state ||
    {};

  const decision =
    data?.decision ||
    analysis?.decision ||
    during?.decision ||
    {};

  const sensor =
    data?.sensor ||
    data?.sensors ||
    analysis?.sensor ||
    analysis?.sensors ||
    during?.sensor ||
    data?.event?.sensor ||
    judge?.grounded_evidence?.sensor ||
    null;

  const score = firstNumber(
    data?.risk_score,
    data?.riskScore,
    data?.score,

    analysis?.risk_score,
    analysis?.riskScore,
    analysis?.score,

    analysis?.risk?.risk_score,

    authoritative?.risk_score,

    decision?.risk_score,
    decision?.riskScore,
    decision?.context?.risk_score,

    during?.risk_score,

    data?.event?.risk_score
  );

  const level = firstText(
    data?.risk_level,
    data?.riskLevel,

    analysis?.risk_level,
    analysis?.riskLevel,

    analysis?.risk?.risk_level,

    authoritative?.risk_level,

    decision?.risk_level,
    decision?.riskLevel,
    decision?.context?.risk_level,

    during?.risk_level,

    data?.event?.risk_level
  );

  const prediction = firstText(
    data?.prediction,
    analysis?.prediction,
    analysis?.disease?.prediction,
    data?.event?.disease?.prediction,
    during?.disease?.prediction
  );

  const confidence = firstNumber(
    data?.confidence,
    analysis?.confidence,
    analysis?.disease?.confidence,
    data?.event?.disease?.confidence,
    during?.disease?.confidence
  );

  const action = firstText(
    decision?.action,
    decision?.decision_action,
    authoritative?.decision_action,
    data?.action,
    analysis?.action
  );

  const ready =
    data?.decision_ready !== undefined
      ? Boolean(data.decision_ready)
      : analysis?.decision_ready !== undefined
        ? Boolean(analysis.decision_ready)
        : decision?.ready !== undefined
          ? Boolean(decision.ready)
          : authoritative?.risk_score !== null &&
            authoritative?.risk_score !== undefined
            ? true
            : score !== null;

  return {
    raw: data,
    score,
    level: level
      ? level.toUpperCase()
      : score !== null
        ? score >= 70
          ? "CRITICAL"
          : score >= 50
            ? "HIGH"
            : score >= 30
              ? "MODERATE"
              : "LOW"
        : "UNKNOWN",
    prediction,
    confidence,
    action,
    ready,

    sensor: {
      temperature: firstNumber(
        sensor?.temperature,
        sensor?.temp
      ),
      humidity: firstNumber(
        sensor?.humidity
      ),
      soilMoisture: firstNumber(
        sensor?.soil_moisture,
        sensor?.soilMoisture
      ),
      soilPh: firstNumber(
        sensor?.soil_ph,
        sensor?.soilPh
      ),
      source: firstText(
        sensor?.source,
        data?.source
      ),
      timestamp: firstText(
        sensor?.timestamp,
        sensor?.updated_at
      ),
    },

    eventId:
      data?.event_id ||
      data?.eventId ||
      data?.event?.event_id ||
      data?.event?.id ||
      analysis?.event_id ||
      null,

    evidence:
      analysis?.evidence ||
      data?.evidence ||
      {},
  };
}

function riskClass(level) {
  return String(level || "unknown")
    .toLowerCase();
}

export default function FieldAssessment() {
  const { id = "A1" } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] =
    useState("");

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const ui = useMemo(
    () =>
      language === "ta"
        ? {
            back: "வயலுக்கு திரும்பு",
            title: "உங்கள் பயிரை சரிபார்க்கவும்",
            subtitle:
              "பயிரின் படத்தை எடுத்தால் CRAI தற்போதைய நிலையை ஆய்வு செய்யும்.",
            observe: "பயிரை பார்க்கலாம்",
            upload: "பயிர் படத்தை தேர்வு செய்யவும்",
            camera: "கேமராவில் படம் எடுக்கவும்",
            analyze: "CRAI ஆய்வு செய்கிறது...",
            ready: "படம் ஆய்வுக்கு தயாராக உள்ளது",
            analyzing:
              "CRAI உங்கள் பயிர் படத்தையும் தற்போதைய வயல் தகவலையும் இணைத்து ஆய்வு செய்கிறது...",
            result: "ஆய்வு முடிவு",
            finding: "பயிரில் கண்டறிந்தது",
            confidence: "நம்பிக்கை",
            fieldRisk: "வயல் அபாய நிலை",
            decision: "CRAI முடிவு",
            action: "இப்போது செய்ய வேண்டியது",
            temperature: "வெப்பநிலை",
            humidity: "காற்றின் ஈரப்பதம்",
            soilMoisture: "மண் ஈரப்பதம்",
            soilPh: "மண் pH",
            currentReading: "தற்போதைய வயல் அளவீடு",
            fresh: "புதிய அளவீடு",
            simulated:
              "சோதனை சென்சார் தரவு",
            live: "நேரடி சென்சார் தரவு",
            moreEvidence:
              "இன்னும் சில தகவல்கள் தேவை",
            noDecision:
              "CRAI போதுமான ஆதாரம் இல்லாமல் அபாய மதிப்பெண் வழங்காது.",
            viewEvidence:
              "ஆதாரங்களை பார்க்கவும்",
            ask:
              "CRAI-யிடம் கேளுங்கள்",
            retry: "மீண்டும் முயற்சி",
            imageRequired:
              "முதலில் பயிர் படத்தை தேர்வு செய்யவும்.",
            failed:
              "பயிர் படத்தை ஆய்வு செய்ய முடியவில்லை.",
            low: "குறைந்த அபாயம்",
            moderate: "மிதமான அபாயம்",
            high: "அதிக அபாயம்",
            critical: "மிகவும் அதிக அபாயம்",
            unknown: "தெரியவில்லை",
          }
        : {
            back: "Back to field",
            title: "Check your crop",
            subtitle:
              "Take a crop photo and CRAI will assess the current field condition.",
            observe: "Crop observation",
            upload: "Choose crop photo",
            camera: "Take photo",
            analyze: "Analyzing with CRAI...",
            ready: "Photo ready for analysis",
            analyzing:
              "CRAI is combining the crop image with the latest field evidence...",
            result: "Assessment result",
            finding: "What CRAI found",
            confidence: "Confidence",
            fieldRisk: "Field risk",
            decision: "CRAI decision",
            action: "What to do now",
            temperature: "Temperature",
            humidity: "Humidity",
            soilMoisture: "Soil moisture",
            soilPh: "Soil pH",
            currentReading: "Current field reading",
            fresh: "Fresh reading",
            simulated: "Simulated sensor",
            live: "Live sensor",
            moreEvidence: "More evidence needed",
            noDecision:
              "CRAI will not produce a risk score until the evidence is sufficient.",
            viewEvidence: "View evidence",
            ask: "Ask CRAI",
            retry: "Try again",
            imageRequired:
              "Please choose a crop image first.",
            failed:
              "CRAI could not analyze this crop image.",
            low: "Low risk",
            moderate: "Moderate risk",
            high: "High risk",
            critical: "Critical risk",
            unknown: "Unknown",
          },
    [language]
  );

  async function analyzeFile(selectedFile) {
    if (!selectedFile) {
      setError(ui.imageRequired);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      /*
       * IMPORTANT:
       * If the current source is simulated, create one fresh
       * simulator reading before image analysis.
       *
       * If real hardware is connected, DO NOT create simulated
       * readings. The real sensor remains authoritative.
       */
      try {
        const current =
          await fetchCurrentEvent(1, id);

        const source =
          current?.sensorSource ||
          current?.sensors?.source ||
          current?.raw?.sensor?.source ||
          current?.raw?.sensors?.source ||
          "";

        if (
          String(source)
            .toUpperCase()
            .includes("SIM")
        ) {
          await fetch(
            `${API}/api/simulator/step`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                device_id:
                  "CRAI-SIM-001",
                farm_id: 1,
                zone_id: id,
                steps: 1,
              }),
            }
          );
        }
      } catch {
        /*
         * Never block real image analysis just because
         * simulator refresh is unavailable.
         */
      }

      const response =
        await analyzeFieldImage({
          file: selectedFile,
          farmId: 1,
          zoneId: id,
          crop: "Tomato",
          growthStage: "Vegetative",
          advisoryLanguage:
            language === "ta"
              ? "Tamil"
              : "English",
        });

      setResult(
        extractResult(response)
      );
    } catch (err) {
      console.error(
        "[CRAI] crop analysis failed",
        err
      );

      setError(
        err?.message ||
          ui.failed
      );
    } finally {
      setLoading(false);
    }
  }

  function selectFile(selectedFile) {
    if (!selectedFile) return;

    if (
      !selectedFile.type.startsWith(
        "image/"
      )
    ) {
      setError(ui.imageRequired);
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const url =
      URL.createObjectURL(
        selectedFile
      );

    setFile(selectedFile);
    setPreview(url);
    setResult(null);
    setError("");

    /*
     * AUTOMATIC ANALYSIS
     */
    window.setTimeout(
      () => analyzeFile(selectedFile),
      80
    );
  }

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function riskText(level) {
    if (level === "LOW")
      return ui.low;

    if (level === "MODERATE")
      return ui.moderate;

    if (level === "HIGH")
      return ui.high;

    if (level === "CRITICAL")
      return ui.critical;

    return ui.unknown;
  }

  function Reading({
    icon,
    label,
    value,
    unit,
  }) {
    return (
      <div className="crai-v4-reading">
        <div className="crai-v4-reading-icon">
          {icon}
        </div>

        <div>
          <span>{label}</span>
          <strong>
            {value === null
              ? "—"
              : value}
            {value !== null &&
              unit && (
                <small>
                  {unit}
                </small>
              )}
          </strong>
        </div>
      </div>
    );
  }

  return (
    <div className="crai-v4-assessment">

      <div className="crai-v4-assessment-head">

        <button
          className="crai-v4-back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={16} />
          {ui.back}
        </button>

        <div>
          <span className="crai-v4-kicker">
            CRAI · Zone {id}
          </span>

          <h1>{ui.title}</h1>

          <p>
            {ui.subtitle}
          </p>
        </div>

      </div>

      <div className="crai-v4-assessment-grid">

        {/* IMAGE */}

        <section className="crai-v4-upload-card">

          <div className="crai-v4-card-head">
            <div>
              <span>
                {ui.observe}
              </span>

              <h2>
                {ui.upload}
              </h2>
            </div>

            <div className="crai-v4-card-icon">
              <Camera size={18} />
            </div>
          </div>

          <div
            className={`crai-v4-image-zone ${
              preview
                ? "has-image"
                : ""
            }`}
            onClick={() =>
              fileRef.current?.click()
            }
          >

            {preview ? (
              <img
                src={preview}
                className="crai-v4-preview"
                alt="Crop"
              />
            ) : (
              <div className="crai-v4-upload-empty">
                <Upload size={26} />

                <strong>
                  {ui.upload}
                </strong>

                <span>
                  JPG · PNG · WEBP
                </span>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={e =>
                selectFile(
                  e.target.files?.[0]
                )
              }
            />

          </div>

          <div className="crai-v4-upload-actions">

            <button
              onClick={() =>
                fileRef.current?.click()
              }
            >
              <Upload size={15} />
              {ui.upload}
            </button>

            <button
              onClick={() =>
                cameraRef.current?.click()
              }
            >
              <Camera size={15} />
              {ui.camera}
            </button>

            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={e =>
                selectFile(
                  e.target.files?.[0]
                )
              }
            />

          </div>

          {loading && (
            <div className="crai-v4-analyzing">
              <Loader2
                size={16}
                className="spin"
              />

              <div>
                <strong>
                  {ui.analyze}
                </strong>

                <span>
                  {ui.analyzing}
                </span>
              </div>
            </div>
          )}

          {!loading &&
            file &&
            !error && (
              <div className="crai-v4-ready">
                <CheckCircle2 size={15} />
                {ui.ready}
              </div>
            )}

          {error && (
            <div className="crai-v4-error">
              {error}
            </div>
          )}

        </section>

        {/* CURRENT SENSOR READINGS */}

        <section className="crai-v4-reading-card">

          <div className="crai-v4-card-head">
            <div>
              <span>
                {ui.currentReading}
              </span>

              <h2>
                Zone {id}
              </h2>
            </div>

            <span className="crai-v4-reading-badge">
              ●{" "}
              {result?.sensor?.source
                ?.toUpperCase()
                .includes("REAL")
                ? ui.live
                : ui.simulated}
            </span>
          </div>

          <div className="crai-v4-reading-grid">

            <Reading
              icon={
                <Thermometer
                  size={16}
                />
              }
              label={ui.temperature}
              value={
                result?.sensor
                  ?.temperature ??
                null
              }
              unit="°C"
            />

            <Reading
              icon={
                <Droplets size={16} />
              }
              label={ui.humidity}
              value={
                result?.sensor
                  ?.humidity ??
                null
              }
              unit="%"
            />

            <Reading
              icon={
                <Leaf size={16} />
              }
              label={ui.soilMoisture}
              value={
                result?.sensor
                  ?.soilMoisture ??
                null
              }
              unit="%"
            />

            <Reading
              icon={
                <ShieldCheck
                  size={16}
                />
              }
              label={ui.soilPh}
              value={
                result?.sensor
                  ?.soilPh ??
                null
              }
              unit=""
            />

          </div>

          <div className="crai-v4-source-note">
            <span>
              {result?.sensor?.timestamp
                ? ui.fresh
                : "—"}
            </span>
          </div>

        </section>

      </div>

      {/* RESULT */}

      {result && (
        <section className="crai-v4-result">

          <div className="crai-v4-result-head">
            <div>
              <span className="crai-v4-kicker">
                CRAI · {ui.result}
              </span>

              <h2>
                {result.prediction ||
                  "Crop assessment"}
              </h2>

              {result.confidence !==
                null && (
                <p>
                  {ui.confidence}{" "}
                  <strong>
                    {result.confidence.toFixed(
                      1
                    )}
                    %
                  </strong>
                </p>
              )}
            </div>

            {result.ready &&
              result.score !== null && (
                <div
                  className={`crai-v4-score ${riskClass(
                    result.level
                  )}`}
                >
                  <strong>
                    {Math.round(
                      result.score
                    )}
                  </strong>
                  <span>
                    /100
                  </span>
                </div>
              )}
          </div>

          {/* DECISION */}

          {result.ready &&
          result.score !== null ? (
            <div className="crai-v4-decision">

              <div>
                <span>
                  {ui.fieldRisk}
                </span>

                <strong
                  className={`risk-${riskClass(
                    result.level
                  )}`}
                >
                  {riskText(
                    result.level
                  )}
                </strong>
              </div>

              <div>
                <span>
                  {ui.decision}
                </span>

                <strong>
                  {result.action ||
                    "MONITOR"}
                </strong>
              </div>

              <div>
                <span>
                  {ui.action}
                </span>

                <p>
                  {result.action ||
                    (language === "ta"
                      ? "தொடர்ந்து கண்காணிக்கவும்."
                      : "Continue monitoring the field.")}
                </p>
              </div>

            </div>
          ) : (
            <div className="crai-v4-gated">

              <ShieldCheck size={20} />

              <div>
                <strong>
                  {ui.moreEvidence}
                </strong>

                <p>
                  {ui.noDecision}
                </p>
              </div>

            </div>
          )}

          <div className="crai-v4-result-actions">

            {result.eventId && (
              <Link
                to={`/evidence/${result.eventId}`}
                className="crai-v4-primary"
              >
                {ui.viewEvidence}
                <ChevronRight
                  size={15}
                />
              </Link>
            )}

            <Link
              to="/ask-crai"
              className="crai-v4-secondary"
            >
              {ui.ask}
            </Link>

          </div>

        </section>
      )}

    </div>
  );
}
