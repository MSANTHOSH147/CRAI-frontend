import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { analyzeFieldImage } from "../services/craiData";
import { useLanguage } from "../app/LanguageContext";

function getLanguage() {
  return localStorage.getItem("crai-language") || "en";
}

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

function stateText(value, t) {
  const normalized = String(value || "").toUpperCase();

  if (
    value === true ||
    normalized === "AVAILABLE" ||
    normalized === "READY"
  ) {
    return t("available");
  }

  if (
    value === false ||
    normalized === "MISSING" ||
    normalized === "UNAVAILABLE"
  ) {
    return t("unavailable");
  }

  return t("unknown");
}

function extractResult(data) {
  const analysis =
    data?.analysis ||
    data?.result ||
    data?.assessment ||
    {};

  const authoritative =
    analysis?.authoritative ||
    analysis?.decision ||
    analysis?.risk ||
    data?.authoritative ||
    {};

  const evidence =
    analysis?.evidence ||
    analysis?.evidence_fusion ||
    analysis?.evidenceFusion ||
    data?.evidence ||
    {};

  const riskScore =
    authoritative?.risk_score ??
    authoritative?.riskScore ??
    analysis?.risk_score ??
    analysis?.riskScore ??
    data?.risk_score ??
    data?.riskScore ??
    null;

  const riskLevel =
    authoritative?.risk_level ??
    authoritative?.riskLevel ??
    analysis?.risk_level ??
    analysis?.riskLevel ??
    data?.risk_level ??
    data?.riskLevel ??
    null;

  const decision =
    authoritative?.decision ??
    analysis?.decision ??
    data?.decision ??
    null;

  const action =
    authoritative?.action ??
    analysis?.action ??
    data?.action ??
    null;

  const eventId =
    data?.event_id ??
    data?.eventId ??
    analysis?.event_id ??
    analysis?.eventId ??
    null;

  const decisionReady =
    data?.decision_ready !== undefined
      ? Boolean(data.decision_ready)
      : analysis?.decision_ready !== undefined
        ? Boolean(analysis.decision_ready)
        : riskScore !== null &&
          riskScore !== undefined &&
          riskScore !== "";

  return {
    riskScore,
    riskLevel,
    decision,
    action,
    eventId,
    decisionReady,
    evidence: {
      visual:
        evidence?.visual ??
        evidence?.visual_available ??
        data?.visual_available,

      environmental:
        evidence?.environmental ??
        evidence?.environmental_available ??
        data?.environmental_available,

      temporal:
        evidence?.temporal ??
        evidence?.temporal_available ??
        data?.temporal_available,

      spatial:
        evidence?.spatial ??
        evidence?.spatial_available ??
        data?.spatial_available,
    },

    raw: data,
  };
}

export default function FieldAssessment() {
  const { id = "A1" } = useParams();
  const { t, language } = useLanguage();

  const inputRef = useRef(null);
  const cameraRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [crop, setCrop] = useState("Tomato");
  const [growthStage, setGrowthStage] =
    useState("Vegetative");

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function selectFile(selectedFile) {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError(
        language === "ta"
          ? "படக் கோப்பை மட்டும் தேர்ந்தெடுக்கவும்."
          : "Please select an image file."
      );
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError("");
  }

  function handleFileChange(event) {
    selectFile(event.target.files?.[0]);
  }

  async function analyze() {
    if (!file) {
      setError(t("imageRequired"));
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await analyzeFieldImage({
        file,
        farmId: 1,
        zoneId: id,
        crop,
        growthStage,
        advisoryLanguage:
          language === "ta" ? "Tamil" : "English",
      });

      setResult(extractResult(response));
    } catch (err) {
      setError(
        err?.message ||
          (language === "ta"
            ? "படத்தை பகுப்பாய்வு செய்ய முடியவில்லை."
            : "Unable to analyze the image.")
      );
    } finally {
      setLoading(false);
    }
  }

  const riskClass = getRiskClass(
    result?.riskLevel
  );

  return (
    <div className="cr-assessment-page">
      {/* Header */}
      <section className="cr-assessment-header">
        <div>
          <span className="cr-assessment-eyebrow">
            CRAI · {t("checkCrop")}
          </span>

          <h1>{t("checkMyCrop")}</h1>

          <p>
            {language === "ta"
              ? `${id} பகுதியில் உள்ள பயிரின் படத்தை அனுப்பி CRAI ஆதாரங்களைச் சரிபார்க்கவும்.`
              : `Send a crop image from ${id} so CRAI can evaluate the available evidence.`}
          </p>
        </div>

        <Link
          to="/fields"
          className="cr-assessment-back"
        >
          ← {t("fields")}
        </Link>
      </section>

      {/* Crop settings */}
      <section className="cr-assessment-card">
        <div className="cr-assessment-card-head">
          <div>
            <span className="cr-assessment-label">
              {t("crop")}
            </span>

            <h2>
              {language === "ta"
                ? "பயிர் விவரம்"
                : "Crop details"}
            </h2>
          </div>

          <span className="cr-assessment-zone">
            {t("zone")} {id}
          </span>
        </div>

        <div className="cr-assessment-fields">
          <label>
            <span>
              {language === "ta"
                ? "பயிர்"
                : "Crop"}
            </span>

            <select
              value={crop}
              onChange={(event) =>
                setCrop(event.target.value)
              }
            >
              <option value="Tomato">Tomato</option>
              <option value="Chilli">Chilli</option>
              <option value="Brinjal">Brinjal</option>
              <option value="Rice">Rice</option>
              <option value="Cotton">Cotton</option>
            </select>
          </label>

          <label>
            <span>
              {language === "ta"
                ? "வளர்ச்சி நிலை"
                : "Growth stage"}
            </span>

            <select
              value={growthStage}
              onChange={(event) =>
                setGrowthStage(event.target.value)
              }
            >
              <option value="Seedling">
                Seedling
              </option>
              <option value="Vegetative">
                Vegetative
              </option>
              <option value="Flowering">
                Flowering
              </option>
              <option value="Fruiting">
                Fruiting
              </option>
              <option value="Maturity">
                Maturity
              </option>
            </select>
          </label>
        </div>
      </section>

      {/* Upload */}
      <section className="cr-assessment-card">
        <div className="cr-assessment-card-head">
          <div>
            <span className="cr-assessment-label">
              {t("visual")}
            </span>

            <h2>{t("selectCropImage")}</h2>
          </div>

          {file && (
            <span className="cr-image-ready">
              ✓ {t("available")}
            </span>
          )}
        </div>

        {!preview ? (
          <div className="cr-upload-area">
            <div className="cr-upload-icon">
              +
            </div>

            <strong>
              {language === "ta"
                ? "பயிரின் தெளிவான படத்தைத் தேர்ந்தெடுக்கவும்"
                : "Choose a clear crop image"}
            </strong>

            <p>
              {language === "ta"
                ? "நல்ல வெளிச்சத்தில் இலை மற்றும் பயிர் பகுதி தெளிவாக இருக்க வேண்டும்."
                : "Use good lighting and keep the affected crop area visible."}
            </p>

            <div className="cr-upload-actions">
              <button
                type="button"
                className="cr-primary-button"
                onClick={() =>
                  inputRef.current?.click()
                }
              >
                {t("chooseImage")}
              </button>

              <button
                type="button"
                className="cr-secondary-button"
                onClick={() =>
                  cameraRef.current?.click()
                }
              >
                {t("takePhoto")}
              </button>
            </div>
          </div>
        ) : (
          <div className="cr-preview-layout">
            <div className="cr-preview-image-wrap">
              <img
                src={preview}
                alt={
                  language === "ta"
                    ? "தேர்ந்தெடுக்கப்பட்ட பயிர் படம்"
                    : "Selected crop"
                }
                className="cr-preview-image"
              />
            </div>

            <div className="cr-preview-side">
              <span className="cr-preview-file">
                {file?.name}
              </span>

              <span className="cr-preview-size">
                {Math.round(
                  (file?.size || 0) / 1024
                )}{" "}
                KB
              </span>

              <button
                type="button"
                className="cr-secondary-button"
                onClick={() =>
                  inputRef.current?.click()
                }
              >
                {t("chooseImage")}
              </button>

              <button
                type="button"
                className="cr-primary-button"
                onClick={analyze}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="cr-spin">↻</span>
                    {t("analyzing")}
                  </>
                ) : (
                  <>
                    ✦ {t("analyzeCrop")}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
        />

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          hidden
        />
      </section>

      {error && (
        <section className="cr-assessment-error">
          <strong>{t("connectionIssue")}</strong>
          <span>{error}</span>
        </section>
      )}

      {/* Result */}
      {result && (
        <section className="cr-assessment-result">
          <div className="cr-assessment-result-head">
            <div>
              <span className="cr-assessment-label">
                CRAI
              </span>

              <h2>
                {result.decisionReady
                  ? t("decision")
                  : t("moreEvidence")}
              </h2>
            </div>

            {result.riskLevel && (
              <span
                className={`cr-result-risk ${riskClass}`}
              >
                {riskText(
                  result.riskLevel,
                  t
                )}
              </span>
            )}
          </div>

          {result.decisionReady ? (
            <>
              <div className="cr-result-main">
                <div>
                  <span className="cr-result-label">
                    {t("riskScore")}
                  </span>

                  <strong>
                    {result.riskScore !== null
                      ? Math.round(
                          Number(
                            result.riskScore
                          )
                        )
                      : "—"}
                    <small>/100</small>
                  </strong>
                </div>

                <div>
                  <span className="cr-result-label">
                    {t("decision")}
                  </span>

                  <p>
                    {result.action ||
                      result.decision ||
                      t("recommendation")}
                  </p>
                </div>
              </div>

              {result.eventId && (
                <Link
                  to={`/evidence/${encodeURIComponent(
                    result.eventId
                  )}`}
                  className="cr-result-link"
                >
                  {t("evidence")} →
                </Link>
              )}
            </>
          ) : (
            <div className="cr-more-evidence">
              <div className="cr-more-evidence-icon">
                !
              </div>

              <div>
                <strong>
                  {t("moreEvidence")}
                </strong>

                <p>
                  {language === "ta"
                    ? "கிடைத்த ஆதாரங்களின் அடிப்படையில் CRAI இன்னும் உறுதியான முடிவை வழங்கவில்லை."
                    : "CRAI does not produce a final decision until the available evidence is sufficient."}
                </p>
              </div>
            </div>
          )}

          <div className="cr-result-evidence">
            <span className="cr-assessment-label">
              {t("evidenceTitle")}
            </span>

            <div className="cr-result-evidence-grid">
              <EvidenceState
                label={t("visual")}
                value={result.evidence.visual}
                t={t}
              />

              <EvidenceState
                label={t("environmental")}
                value={
                  result.evidence.environmental
                }
                t={t}
              />

              <EvidenceState
                label={t("temporal")}
                value={result.evidence.temporal}
                t={t}
              />

              <EvidenceState
                label={t("spatial")}
                value={result.evidence.spatial}
                t={t}
              />
            </div>
          </div>

          <div className="cr-assessment-trust">
            <span>✓</span>

            <p>
              {language === "ta"
                ? "அபாய மதிப்பெண் CRAI பின்தளத்திலிருந்து வருகிறது. இந்த திரை அபாயத்தை கணக்கிடாது."
                : "Risk and decisions come from the authoritative CRAI backend. This screen does not calculate risk."}
            </p>
          </div>
        </section>
      )}

      <style>{`
        .cr-assessment-page {
          width: 100%;
          max-width: 920px;
          margin: 0 auto;
          padding: 22px 20px 42px;
          color: #17201c;
        }

        .cr-assessment-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 17px;
        }

        .cr-assessment-eyebrow,
        .cr-assessment-label {
          display: block;
          color: #78847e;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: .12em;
        }

        .cr-assessment-header h1 {
          margin: 4px 0 0;
          font-size: 27px;
          line-height: 1.1;
          letter-spacing: -.025em;
        }

        .cr-assessment-header p {
          max-width: 620px;
          margin: 7px 0 0;
          color: #68746e;
          font-size: 13px;
          line-height: 1.5;
        }

        .cr-assessment-back {
          flex: 0 0 auto;
          padding: 8px 10px;
          border: 1px solid #dfe7e1;
          border-radius: 8px;
          background: #fff;
          color: #145a45;
          text-decoration: none;
          font-size: 10px;
          font-weight: 750;
        }

        .cr-assessment-card,
        .cr-assessment-result {
          margin-bottom: 12px;
          padding: 16px;
          border: 1px solid #dfe7e1;
          border-radius: 13px;
          background: #fff;
        }

        .cr-assessment-card-head,
        .cr-assessment-result-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .cr-assessment-card h2,
        .cr-assessment-result h2 {
          margin: 4px 0 0;
          font-size: 17px;
          line-height: 1.25;
        }

        .cr-assessment-zone,
        .cr-image-ready {
          padding: 5px 8px;
          border-radius: 999px;
          background: #edf5f0;
          color: #176246;
          font-size: 8px;
          font-weight: 850;
          white-space: nowrap;
        }

        .cr-assessment-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 14px;
        }

        .cr-assessment-fields label {
          display: block;
        }

        .cr-assessment-fields label > span {
          display: block;
          margin-bottom: 5px;
          color: #758079;
          font-size: 9px;
          font-weight: 700;
        }

        .cr-assessment-fields select {
          width: 100%;
          height: 38px;
          padding: 0 10px;
          border: 1px solid #dfe7e1;
          border-radius: 8px;
          outline: none;
          background: #fafcfb;
          color: #34423b;
          font-size: 11px;
        }

        .cr-assessment-fields select:focus {
          border-color: #8db5a3;
        }

        .cr-upload-area {
          margin-top: 14px;
          padding: 27px 18px;
          border: 1px dashed #cbd9d0;
          border-radius: 11px;
          background: #fafcfb;
          text-align: center;
        }

        .cr-upload-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          margin: 0 auto 10px;
          border-radius: 12px;
          background: #edf5f0;
          color: #145a45;
          font-size: 23px;
        }

        .cr-upload-area strong {
          display: block;
          font-size: 13px;
        }

        .cr-upload-area p {
          max-width: 500px;
          margin: 5px auto 13px;
          color: #7a8580;
          font-size: 10px;
          line-height: 1.5;
        }

        .cr-upload-actions {
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .cr-primary-button,
        .cr-secondary-button {
          min-height: 38px;
          padding: 8px 13px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .cr-primary-button {
          border: 1px solid #145a45;
          background: #145a45;
          color: #fff;
        }

        .cr-primary-button:disabled {
          opacity: .65;
          cursor: wait;
        }

        .cr-secondary-button {
          border: 1px solid #dfe7e1;
          background: #fff;
          color: #145a45;
        }

        .cr-primary-button:hover:not(:disabled) {
          background: #104b3a;
        }

        .cr-secondary-button:hover {
          background: #f3f7f4;
        }

        .cr-preview-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(190px, .75fr);
          gap: 13px;
          margin-top: 14px;
        }

        .cr-preview-image-wrap {
          overflow: hidden;
          min-height: 240px;
          border-radius: 10px;
          background: #edf1ee;
        }

        .cr-preview-image {
          width: 100%;
          height: 100%;
          min-height: 240px;
          display: block;
          object-fit: cover;
        }

        .cr-preview-side {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
          justify-content: center;
        }

        .cr-preview-file {
          overflow: hidden;
          color: #34423b;
          font-size: 11px;
          font-weight: 750;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cr-preview-size {
          color: #8a958f;
          font-size: 9px;
          margin-bottom: 5px;
        }

        .cr-assessment-error {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          padding: 10px 12px;
          border: 1px solid #f0dfb6;
          border-radius: 9px;
          background: #fff8e8;
          color: #795313;
          font-size: 11px;
        }

        .cr-result-risk {
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 850;
        }

        .cr-result-risk.low {
          color: #176246;
          background: #edf7f1;
        }

        .cr-result-risk.moderate {
          color: #8a5a10;
          background: #fff8e8;
        }

        .cr-result-risk.high,
        .cr-result-risk.critical {
          color: #9a3939;
          background: #fff0f0;
        }

        .cr-result-main {
          display: grid;
          grid-template-columns: 170px 1fr;
          gap: 15px;
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid #edf1ee;
        }

        .cr-result-label {
          display: block;
          color: #78847e;
          font-size: 9px;
          font-weight: 750;
        }

        .cr-result-main strong {
          display: block;
          margin-top: 5px;
          color: #145a45;
          font-size: 29px;
          line-height: 1;
        }

        .cr-result-main strong small {
          color: #8a958f;
          font-size: 9px;
        }

        .cr-result-main p {
          margin: 5px 0 0;
          color: #4d5b54;
          font-size: 12px;
          line-height: 1.5;
        }

        .cr-result-link {
          display: inline-block;
          margin-top: 13px;
          color: #145a45;
          text-decoration: none;
          font-size: 10px;
          font-weight: 800;
        }

        .cr-more-evidence {
          display: flex;
          gap: 10px;
          margin-top: 15px;
          padding: 12px;
          border: 1px solid #f0dfb6;
          border-radius: 9px;
          background: #fffaf0;
        }

        .cr-more-evidence-icon {
          width: 28px;
          height: 28px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #f5e5bc;
          color: #795313;
          font-weight: 850;
        }

        .cr-more-evidence strong {
          display: block;
          color: #684c15;
          font-size: 11px;
        }

        .cr-more-evidence p {
          margin: 4px 0 0;
          color: #806f4a;
          font-size: 10px;
          line-height: 1.5;
        }

        .cr-result-evidence {
          margin-top: 17px;
          padding-top: 14px;
          border-top: 1px solid #edf1ee;
        }

        .cr-result-evidence-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 7px;
          margin-top: 9px;
        }

        .cr-result-evidence-item {
          padding: 9px;
          border: 1px solid #e5ebe7;
          border-radius: 8px;
          background: #fafcfb;
        }

        .cr-result-evidence-item strong {
          display: block;
          font-size: 10px;
        }

        .cr-result-evidence-item span {
          display: block;
          margin-top: 4px;
          color: #77847d;
          font-size: 8px;
        }

        .cr-assessment-trust {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid #edf1ee;
        }

        .cr-assessment-trust > span {
          width: 22px;
          height: 22px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 50%;
          background: #edf5f0;
          color: #145a45;
          font-size: 10px;
          font-weight: 850;
        }

        .cr-assessment-trust p {
          margin: 0;
          color: #7b8781;
          font-size: 9px;
          line-height: 1.45;
        }

        .cr-spin {
          display: inline-block;
          margin-right: 5px;
          animation: craiSpin .9s linear infinite;
        }

        @keyframes craiSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 700px) {
          .cr-assessment-page {
            padding: 17px 14px 95px;
          }

          .cr-assessment-header h1 {
            font-size: 23px;
          }

          .cr-assessment-fields,
          .cr-preview-layout,
          .cr-result-main {
            grid-template-columns: 1fr;
          }

          .cr-preview-image-wrap,
          .cr-preview-image {
            min-height: 210px;
          }

          .cr-result-evidence-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 430px) {
          .cr-assessment-header {
            gap: 8px;
          }

          .cr-assessment-back {
            font-size: 9px;
          }

          .cr-upload-actions {
            flex-direction: column;
          }

          .cr-primary-button,
          .cr-secondary-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

function EvidenceState({ label, value, t }) {
  const normalized = String(value || "").toUpperCase();

  const available =
    value === true ||
    normalized === "AVAILABLE" ||
    normalized === "READY";

  return (
    <div className="cr-result-evidence-item">
      <strong>{label}</strong>

      <span>
        <b
          style={{
            color: available
              ? "#2d8a63"
              : "#9a9485",
            marginRight: 4,
          }}
        >
          ●
        </b>

        {stateText(value, t)}
      </span>
    </div>
  );
}