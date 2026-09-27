import { useEffect, useState } from "react";
import { useLanguage } from "../app/LanguageContext";
import {
  fetchAdvisoryStatus,
  fetchSystemStatus,
} from "../services/craiData";

export default function SettingsPage() {
  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  const [system, setSystem] = useState(null);
  const [advisory, setAdvisory] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadStatus() {
    setLoading(true);
    setError("");

    try {
      const [
        systemData,
        advisoryData,
      ] = await Promise.all([
        fetchSystemStatus(),
        fetchAdvisoryStatus(),
      ]);

      setSystem(systemData);
      setAdvisory(advisoryData);
    } catch (err) {
      setError(
        err?.message ||
          (language === "ta"
            ? "நிலைத் தகவலை ஏற்ற முடியவில்லை."
            : "Unable to load system status.")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  function changeLanguage(value) {
    setLanguage(value);
  }

  const backendOnline =
    system?.backend === "online";

  const supabaseState =
    system?.supabase;

  const advisoryAvailable =
    advisory?.available === true;

  return (
    <div className="cr-settings-page">
      {/* Header */}
      <section className="cr-settings-header">
        <div>
          <span className="cr-settings-eyebrow">
            CRAI · {t("settings")}
          </span>

          <h1>{t("settings")}</h1>

          <p>
            {language === "ta"
              ? "CRAI பயன்பாடு, மொழி மற்றும் backend நிலையை நிர்வகிக்கவும்."
              : "Manage CRAI language, service status and system transparency."}
          </p>
        </div>
      </section>

      {/* Language */}
      <section className="cr-settings-card">
        <div className="cr-settings-card-head">
          <div>
            <span>
              {language === "ta"
                ? "பயன்பாட்டு மொழி"
                : "App language"}
            </span>

            <h2>
              {language === "ta"
                ? "மொழி"
                : "Language"}
            </h2>
          </div>

          <span className="cr-settings-language-badge">
            {language === "ta"
              ? "தமிழ்"
              : "English"}
          </span>
        </div>

        <div className="cr-language-options">
          <button
            type="button"
            className={
              language === "en"
                ? "active"
                : ""
            }
            onClick={() =>
              changeLanguage("en")
            }
          >
            <span>EN</span>

            <div>
              <strong>
                English
              </strong>

              <small>
                Use CRAI in English
              </small>
            </div>

            {language === "en" && (
              <b>✓</b>
            )}
          </button>

          <button
            type="button"
            className={
              language === "ta"
                ? "active"
                : ""
            }
            onClick={() =>
              changeLanguage("ta")
            }
          >
            <span>த</span>

            <div>
              <strong>
                தமிழ்
              </strong>

              <small>
                CRAI-ஐ தமிழில் பயன்படுத்தவும்
              </small>
            </div>

            {language === "ta" && (
              <b>✓</b>
            )}
          </button>
        </div>

        <div className="cr-settings-language-note">
          <span>✓</span>

          <p>
            {language === "ta"
              ? "இந்த மொழி தேர்வு முழு CRAI பயன்பாட்டிலும் பயன்படுத்தப்படும்."
              : "This language preference is shared across the CRAI application."}
          </p>
        </div>
      </section>

      {/* System status */}
      <section className="cr-settings-card">
        <div className="cr-settings-card-head">
          <div>
            <span>
              {language === "ta"
                ? "கணினி நிலை"
                : "System status"}
            </span>

            <h2>
              {language === "ta"
                ? "சேவைகள்"
                : "Services"}
            </h2>
          </div>

          <button
            type="button"
            className="cr-refresh-button"
            onClick={loadStatus}
            disabled={loading}
          >
            ↻{" "}
            {language === "ta"
              ? "புதுப்பி"
              : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="cr-settings-error">
            <strong>
              {t("error")}
            </strong>

            <span>{error}</span>
          </div>
        )}

        <div className="cr-service-list">
          <ServiceRow
            title={
              language === "ta"
                ? "CRAI Backend"
                : "CRAI Backend"
            }
            description={
              language === "ta"
                ? "FastAPI authoritative intelligence service"
                : "FastAPI authoritative intelligence service"
            }
            status={
              backendOnline
                ? t("online")
                : t("offline")
            }
            state={
              backendOnline
                ? "online"
                : "offline"
            }
          />

          <ServiceRow
            title={
              language === "ta"
                ? "Advisory"
                : "Advisory"
            }
            description={
              language === "ta"
                ? "Qwen explanation and advisory layer"
                : "Qwen explanation and advisory layer"
            }
            status={
              advisoryAvailable
                ? t("available")
                : t("unavailable")
            }
            state={
              advisoryAvailable
                ? "online"
                : "offline"
            }
          />

          <ServiceRow
            title={
              language === "ta"
                ? "Persistence"
                : "Persistence"
            }
            description={
              language === "ta"
                ? "Supabase / PostgreSQL infrastructure"
                : "Supabase / PostgreSQL infrastructure"
            }
            status={getPersistenceLabel(
              supabaseState,
              language
            )}
            state={getPersistenceState(
              supabaseState
            )}
          />
        </div>
      </section>

      {/* Architecture */}
      <section className="cr-settings-card">
        <div className="cr-settings-card-head">
          <div>
            <span>
              {language === "ta"
                ? "தொழில்நுட்ப வெளிப்படைத்தன்மை"
                : "Technical transparency"}
            </span>

            <h2>
              {language === "ta"
                ? "CRAI எப்படி முடிவு செய்கிறது?"
                : "How CRAI makes decisions"}
            </h2>
          </div>
        </div>

        <div className="cr-architecture-list">
          <ArchitectureRow
            number="01"
            title={
              language === "ta"
                ? "Field Evidence"
                : "Field Evidence"
            }
            text={
              language === "ta"
                ? "Camera, sensor மற்றும் பிற field evidence சேகரிக்கப்படுகிறது."
                : "Camera, sensor and other field evidence are collected."
            }
          />

          <ArchitectureRow
            number="02"
            title={
              language === "ta"
                ? "Evidence Fusion"
                : "Evidence Fusion"
            }
            text={
              language === "ta"
                ? "Visual, environmental, temporal மற்றும் spatial evidence இணைக்கப்படுகிறது."
                : "Visual, environmental, temporal and spatial evidence are fused."
            }
          />

          <ArchitectureRow
            number="03"
            title={
              language === "ta"
                ? "Deterministic Risk"
                : "Deterministic Risk"
            }
            text={
              language === "ta"
                ? "CRAI-ன் deterministic engine risk மற்றும் decision-ஐ கணக்கிடுகிறது."
                : "CRAI's deterministic engine calculates risk and the decision."
            }
          />

          <ArchitectureRow
            number="04"
            title={
              language === "ta"
                ? "Advisory"
                : "Advisory"
            }
            text={
              language === "ta"
                ? "Qwen முடிவை விளக்க உதவுகிறது; risk-ஐ கணக்கிடவோ மாற்றவோ முடியாது."
                : "Qwen explains the result; it cannot calculate or override risk."
            }
          />
        </div>
      </section>

      {/* Evidence principle */}
      <section className="cr-settings-trust">
        <div className="cr-settings-trust-icon">
          ✓
        </div>

        <div>
          <strong>
            {language === "ta"
              ? "ஆதாரம் முதலில்"
              : "Evidence first"}
          </strong>

          <p>
            {language === "ta"
              ? "CRAI-ல் ஆதாரம் கிடைக்காதபோது அது பூஜ்ய அபாயமாக கருதப்படாது. தேவையான இடங்களில் மேலும் ஆதாரம் சேகரிக்கப்படுகிறது."
              : "When evidence is missing, CRAI does not treat it as zero risk. Additional evidence is requested when needed."}
          </p>
        </div>
      </section>

      <style>{pageStyles}</style>
    </div>
  );
}

function ServiceRow({
  title,
  description,
  status,
  state,
}) {
  return (
    <div className="cr-service-row">
      <div className="cr-service-icon">
        {state === "online"
          ? "✓"
          : "!"}
      </div>

      <div className="cr-service-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <span
        className={`cr-service-status ${state}`}
      >
        {status}
      </span>
    </div>
  );
}

function ArchitectureRow({
  number,
  title,
  text,
}) {
  return (
    <div className="cr-architecture-row">
      <span className="cr-architecture-number">
        {number}
      </span>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

function getPersistenceState(value) {
  if (!value) {
    return "unknown";
  }

  const normalized =
    String(
      typeof value === "object"
        ? value?.status ||
            value?.state ||
            value?.available
        : value
    ).toLowerCase();

  if (
    normalized === "online" ||
    normalized === "ready" ||
    normalized === "available" ||
    normalized === "true"
  ) {
    return "online";
  }

  if (
    normalized === "offline" ||
    normalized === "unavailable" ||
    normalized === "false"
  ) {
    return "offline";
  }

  return "unknown";
}

function getPersistenceLabel(
  value,
  language
) {
  const state =
    getPersistenceState(value);

  if (state === "online") {
    return language === "ta"
      ? "தயார்"
      : "Ready";
  }

  if (state === "offline") {
    return language === "ta"
      ? "கிடைக்கவில்லை"
      : "Unavailable";
  }

  return language === "ta"
    ? "தெரியவில்லை"
    : "Unknown";
}

const pageStyles = `
.cr-settings-page {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 22px 20px 42px;
  color: #17201c;
}

.cr-settings-header {
  margin-bottom: 15px;
}

.cr-settings-eyebrow {
  display: block;
  color: #78847e;
  font-size: 9px;
  font-weight: 850;
  letter-spacing: .12em;
}

.cr-settings-header h1 {
  margin: 4px 0 0;
  font-size: 27px;
  line-height: 1.1;
  letter-spacing: -.025em;
}

.cr-settings-header p {
  max-width: 650px;
  margin: 7px 0 0;
  color: #68746e;
  font-size: 13px;
  line-height: 1.5;
}

.cr-settings-card {
  margin-top: 10px;
  padding: 14px;
  border: 1px solid #dfe7e1;
  border-radius: 12px;
  background: #fff;
}

.cr-settings-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.cr-settings-card-head > div > span {
  display: block;
  color: #7d8982;
  font-size: 8px;
  font-weight: 850;
  letter-spacing: .08em;
}

.cr-settings-card-head h2 {
  margin: 4px 0 0;
  font-size: 15px;
  line-height: 1.25;
}

.cr-settings-language-badge {
  padding: 5px 8px;
  border-radius: 999px;
  background: #edf7f1;
  color: #176246;
  font-size: 8px;
  font-weight: 850;
}

.cr-language-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.cr-language-options button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 64px;
  padding: 10px;
  border: 1px solid #e1e8e3;
  border-radius: 9px;
  background: #fafcfb;
  color: #26332d;
  text-align: left;
  cursor: pointer;
}

.cr-language-options button > span {
  width: 29px;
  height: 29px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 7px;
  background: #edf1ee;
  color: #587266;
  font-size: 9px;
  font-weight: 850;
}

.cr-language-options button div {
  min-width: 0;
}

.cr-language-options button strong {
  display: block;
  font-size: 10px;
}

.cr-language-options button small {
  display: block;
  margin-top: 3px;
  color: #89938e;
  font-size: 8px;
}

.cr-language-options button b {
  margin-left: auto;
  color: #145a45;
  font-size: 13px;
}

.cr-language-options button.active {
  border-color: #9fc2af;
  background: #f3f9f5;
}

.cr-language-options button.active > span {
  background: #145a45;
  color: #fff;
}

.cr-settings-language-note {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 9px;
  padding: 8px 9px;
  border-radius: 8px;
  background: #f8faf8;
}

.cr-settings-language-note span {
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #e6f2eb;
  color: #145a45;
  font-size: 8px;
  font-weight: 850;
}

.cr-settings-language-note p {
  margin: 0;
  color: #77837d;
  font-size: 8px;
  line-height: 1.45;
}

.cr-refresh-button {
  min-height: 29px;
  padding: 0 9px;
  border: 1px solid #dbe5df;
  border-radius: 7px;
  background: #fff;
  color: #456b5b;
  font-size: 8px;
  font-weight: 800;
  cursor: pointer;
}

.cr-refresh-button:disabled {
  opacity: .5;
  cursor: wait;
}

.cr-settings-error {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 9px;
  padding: 9px;
  border-radius: 8px;
  background: #fff4f2;
  color: #934a40;
  font-size: 8px;
}

.cr-settings-error span {
  color: #9b6259;
}

.cr-service-list {
  display: grid;
  gap: 7px;
}

.cr-service-row {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 59px;
  padding: 9px;
  border: 1px solid #e4eae6;
  border-radius: 8px;
  background: #fafcfb;
}

.cr-service-icon {
  width: 25px;
  height: 25px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #edf7f1;
  color: #176246;
  font-size: 9px;
  font-weight: 850;
}

.cr-service-copy {
  min-width: 0;
  flex: 1;
}

.cr-service-copy strong {
  display: block;
  font-size: 10px;
}

.cr-service-copy span {
  display: block;
  margin-top: 3px;
  color: #89938e;
  font-size: 8px;
  line-height: 1.35;
}

.cr-service-status {
  flex: 0 0 auto;
  padding: 5px 7px;
  border-radius: 999px;
  font-size: 8px;
  font-weight: 850;
}

.cr-service-status.online {
  background: #edf7f1;
  color: #176246;
}

.cr-service-status.offline {
  background: #fff2f2;
  color: #9a3939;
}

.cr-service-status.unknown {
  background: #f1f4f2;
  color: #7b8781;
}

.cr-architecture-list {
  display: grid;
  gap: 7px;
}

.cr-architecture-row {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 10px;
  border: 1px solid #e4eae6;
  border-radius: 8px;
  background: #fafcfb;
}

.cr-architecture-number {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 7px;
  background: #edf7f1;
  color: #145a45;
  font-size: 8px;
  font-weight: 850;
}

.cr-architecture-row strong {
  display: block;
  font-size: 10px;
}

.cr-architecture-row p {
  margin: 3px 0 0;
  color: #77837d;
  font-size: 8px;
  line-height: 1.5;
}

.cr-settings-trust {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 12px;
  padding: 11px 12px;
  border: 1px solid #dfe8e2;
  border-radius: 10px;
  background: #f8faf8;
}

.cr-settings-trust-icon {
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

.cr-settings-trust strong {
  display: block;
  font-size: 10px;
}

.cr-settings-trust p {
  margin: 3px 0 0;
  color: #78847e;
  font-size: 8px;
  line-height: 1.5;
}

@media (max-width: 650px) {
  .cr-settings-page {
    padding: 17px 14px 95px;
  }

  .cr-settings-header h1 {
    font-size: 23px;
  }

  .cr-language-options {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 430px) {
  .cr-service-row {
    align-items: flex-start;
  }

  .cr-service-status {
    margin-left: auto;
  }
}
`;