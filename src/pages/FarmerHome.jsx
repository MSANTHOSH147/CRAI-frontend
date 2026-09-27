import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bell,
  BrainCircuit,
  Camera,
  ChevronRight,
  CircleHelp,
  Droplets,
  Gauge,
  Leaf,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Search,
  Settings,
  Sprout,
  Thermometer,
  Wind,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  fetchCurrentEvent,
  fetchSystemStatus,
} from "../services/craiData";

import { useLanguage } from "../app/LanguageContext";

function safeText(value, fallback = "—") {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value
      .map(item => safeText(item, ""))
      .filter(Boolean)
      .join(", ") || fallback;
  }

  if (typeof value === "object") {
    if (value.label !== undefined) {
      return safeText(value.label, fallback);
    }

    if (value.name !== undefined) {
      return safeText(value.name, fallback);
    }

    if (value.value !== undefined) {
      return safeText(value.value, fallback);
    }

    if (value.status !== undefined) {
      return safeText(value.status, fallback);
    }

    if (value.message !== undefined) {
      return safeText(value.message, fallback);
    }

    return fallback;
  }

  return fallback;
}

function numberValue(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function riskKey(level) {
  const value = safeText(level, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  if (value.includes("critical")) return "critical";
  if (value.includes("high")) return "high";
  if (value.includes("moderate")) return "moderate";
  if (value.includes("low")) return "low";

  return "unknown";
}

function riskLabel(level, t) {
  const key = riskKey(level);

  if (key === "critical") return t("critical");
  if (key === "high") return t("high");
  if (key === "moderate") return t("moderate");
  if (key === "low") return t("low");

  return t("unknown");
}

function evidenceState(value) {
  const text = safeText(value, "")
    .toLowerCase();

  if (
    text.includes("available") ||
    text.includes("verified") ||
    text.includes("ready")
  ) {
    return "available";
  }

  if (
    text.includes("uncertain") ||
    text.includes("pending")
  ) {
    return "uncertain";
  }

  if (
    text.includes("stale") ||
    text.includes("historical")
  ) {
    return "stale";
  }

  return "missing";
}

function getEvidence(event, key) {
  const evidence =
    event?.evidence ||
    event?.evidenceFusion ||
    event?.evidence_fusion ||
    event?.analysis?.evidence ||
    {};

  const aliases = {
    visual: [
      "visual",
      "visual_evidence",
      "visualEvidence",
    ],
    environmental: [
      "environmental",
      "environment",
      "environmental_evidence",
      "environmentalEvidence",
    ],
    temporal: [
      "temporal",
      "temporal_evidence",
      "temporalEvidence",
    ],
    spatial: [
      "spatial",
      "spatial_evidence",
      "spatialEvidence",
    ],
  };

  for (const alias of aliases[key] || []) {
    if (evidence?.[alias] !== undefined) {
      return evidence[alias];
    }
  }

  return null;
}

function getEvidenceDisplay(event, key, t) {
  const raw = getEvidence(event, key);

  if (raw === null || raw === undefined) {
    return {
      state: "missing",
      label: t("moreEvidence"),
      detail: t("noEvidence"),
    };
  }

  const rawText = safeText(
    raw?.status ??
      raw?.state ??
      raw?.availability ??
      raw,
    ""
  );

  const state = evidenceState(rawText);

  if (state === "available") {
    return {
      state,
      label: t("available"),
      detail:
        key === "visual"
          ? "Crop image evaluated"
          : key === "environmental"
            ? "Current field conditions"
            : key === "temporal"
              ? "Recent field history"
              : "Nearby field context",
    };
  }

  if (state === "uncertain") {
    return {
      state,
      label: t("uncertain"),
      detail: t("moreEvidence"),
    };
  }

  if (state === "stale") {
    return {
      state,
      label: t("stale"),
      detail: "Fresh evidence requested",
    };
  }

  return {
    state: "missing",
    label: t("unavailable"),
    detail: t("moreEvidence"),
  };
}

function Metric({ icon, label, value, unit }) {
  return (
    <div className="crai-v3-metric">
      <div className="crai-v3-metric-icon">
        {icon}
      </div>

      <div className="crai-v3-metric-copy">
        <span>{label}</span>
        <strong>
          {value}
          {unit && (
            <small>{unit}</small>
          )}
        </strong>
      </div>
    </div>
  );
}

function EvidenceModule({
  icon,
  title,
  data,
}) {
  return (
    <div className="crai-v3-evidence-module">
      <div className="crai-v3-evidence-top">
        <div className="crai-v3-evidence-icon">
          {icon}
        </div>

        <span
          className={`crai-v3-state ${data.state}`}
        >
          <i />
          {data.label}
        </span>
      </div>

      <strong>{title}</strong>
      <span>{data.detail}</span>
    </div>
  );
}

function FieldMapVisual({ risk }) {
  return (
    <div className="crai-v3-field-map">
      <div className="crai-v3-map-toolbar">
        <button aria-label="Map layers">
          <Leaf size={15} />
        </button>

        <button aria-label="Search field">
          <Search size={15} />
        </button>
      </div>

      <div className="crai-v3-field-grid">
        <div className="field-patch p1" />
        <div className="field-patch p2" />
        <div className="field-patch p3" />
        <div className="field-patch p4" />
        <div className="field-patch p5" />
        <div className="field-patch p6" />
        <div className="field-patch p7" />
        <div className="field-patch p8" />
        <div className="field-patch p9" />
      </div>

      <div className="crai-v3-map-overlay">
        <div className="crai-v3-map-title">
          <span>Zone A1</span>
          <strong>Tomato field</strong>
        </div>

        <div className="crai-v3-map-risk">
          <span>Current risk</span>
          <strong className={`risk-${risk}`}>
            {risk === "unknown"
              ? "—"
              : risk.toUpperCase()}
          </strong>
        </div>

        <div className="crai-v3-map-location">
          <MapPin size={13} />
          <span>Field A1</span>
        </div>
      </div>
    </div>
  );
}

export default function FarmerHome() {
  const { t } = useLanguage();

  const [event, setEvent] = useState(null);
  const [system, setSystem] = useState(null);
  const [status, setStatus] =
    useState("loading");

  async function load() {
    setStatus("loading");

    try {
      const [eventResult, systemResult] =
        await Promise.all([
          fetchCurrentEvent(1, "A1"),
          fetchSystemStatus(),
        ]);

      setEvent(eventResult || null);
      setSystem(systemResult || null);
      setStatus(
        eventResult ? "ready" : "empty"
      );
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    load();

    const timer = window.setInterval(
      load,
      30000
    );

    return () =>
      window.clearInterval(timer);
  }, []);

  const normalized = useMemo(() => {
    const source =
      event?.source ??
      event?.sensorSource ??
      event?.sensor_source ??
      event?.sensors?.source ??
      event?.raw?.sensor?.source ??
      event?.raw?.sensors?.source ??
      event?.reading?.source ??
      event?.analysis?.source;

    const temperature =
      numberValue(
        event?.temperature ??
        event?.sensors?.temperature ??
        event?.sensor?.temperature ??
        event?.raw?.sensor?.temperature ??
        event?.raw?.sensors?.temperature ??
        event?.telemetry?.temperature ??
        event?.reading?.temperature
      );

    const humidity =
      numberValue(
        event?.humidity ??
        event?.sensors?.humidity ??
        event?.sensor?.humidity ??
        event?.raw?.sensor?.humidity ??
        event?.raw?.sensors?.humidity ??
        event?.telemetry?.humidity ??
        event?.reading?.humidity
      );

    const soilMoisture =
      numberValue(
        event?.soil_moisture ??
        event?.soilMoisture ??
        event?.sensors?.soilMoisture ??
        event?.sensor?.soil_moisture ??
        event?.sensor?.soilMoisture ??
        event?.raw?.sensor?.soil_moisture ??
        event?.raw?.sensors?.soil_moisture ??
        event?.telemetry?.soil_moisture ??
        event?.reading?.soil_moisture
      );

    const soilPh =
      numberValue(
        event?.soil_ph ??
        event?.soilPh ??
        event?.sensors?.soilPh ??
        event?.sensor?.soil_ph ??
        event?.sensor?.soilPh ??
        event?.raw?.sensor?.soil_ph ??
        event?.raw?.sensors?.soil_ph ??
        event?.telemetry?.soil_ph ??
        event?.reading?.soil_ph
      );

    const riskScore =
      numberValue(
        event?.riskScore ??
        event?.risk_score ??
        event?.analysis?.risk_score ??
        event?.analysis?.riskScore
      );

    const riskLevel = safeText(
      event?.riskLevel ??
        event?.risk_level ??
        event?.analysis?.risk_level,
      ""
    );

    const decision = safeText(
      event?.decision ??
        event?.action ??
        event?.analysis?.decision ??
        event?.analysis?.action,
      ""
    );

    const crop = safeText(
      event?.crop ??
        event?.cropName ??
        event?.analysis?.crop,
      "Tomato"
    );

    const zone = safeText(
      event?.zoneName ??
        event?.zone ??
        event?.zone_id,
      "A1"
    );

    const growthStage = safeText(
      event?.growthStage ??
        event?.growth_stage,
      "Vegetative"
    );

    const eventId = safeText(
      event?.eventId ??
        event?.event_id,
      ""
    );

    const decisionReady =
      event?.decisionReady ??
      event?.decision_ready ??
      event?.analysis?.decision_ready ??
      riskScore !== null;

    return {
      source: safeText(source, ""),
      temperature,
      humidity,
      soilMoisture,
      soilPh,
      riskScore,
      riskLevel,
      risk: riskKey(riskLevel),
      decision,
      crop,
      zone,
      growthStage,
      eventId,
      decisionReady: Boolean(decisionReady),
    };
  }, [event]);

  const evidence = {
    visual: getEvidenceDisplay(
      event,
      "visual",
      t
    ),
    environmental: getEvidenceDisplay(
      event,
      "environmental",
      t
    ),
    temporal: getEvidenceDisplay(
      event,
      "temporal",
      t
    ),
    spatial: getEvidenceDisplay(
      event,
      "spatial",
      t
    ),
  };

  const hardwareLabel =
    normalized.source
      .toUpperCase()
      .includes("REAL")
      ? t("liveHardware")
      : normalized.source
        ? t("simulatedHardware")
        : "—";

  const recommendation =
    normalized.decisionReady &&
    normalized.decision
      ? normalized.decision
      : t("moreEvidence");

  if (status === "loading") {
    return (
      <div className="crai-v3-page">
        <div className="crai-v3-loading">
          {t("loadingField")}
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="crai-v3-page">
        <div className="crai-v3-empty">
          <CircleHelp size={22} />
          <strong>{t("error")}</strong>
          <button onClick={load}>
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="crai-v3-page">

      {/* HEADER */}

      <section className="crai-v3-heading">
        <div>
          <span className="crai-v3-eyebrow">
            CRAI · {t("farmer")}
          </span>

          <h1>
            {t("goodMorning")}, Farmer.
          </h1>

          <p>
            {t("homeIntro")}
          </p>
        </div>

        <div className="crai-v3-heading-actions">
          <button className="crai-v3-icon-button">
            <Bell size={17} />
          </button>

          <button className="crai-v3-profile">
            <span className="crai-v3-profile-avatar">
              F
            </span>

            <span>
              <strong>My Farm</strong>
              <small>
                Zone {normalized.zone}
              </small>
            </span>

            <ChevronRight size={14} />
          </button>
        </div>
      </section>

      {/* TOP PRODUCT GRID */}

      <section className="crai-v3-main-grid">

        {/* LEFT COLUMN */}

        <div className="crai-v3-left-column">

          {/* WEATHER / FIELD STATUS */}

          <div className="crai-v3-status-card">

            <div className="crai-v3-status-header">
              <div>
                <span className="crai-v3-section-kicker">
                  CURRENT FIELD
                </span>

                <h2>
                  {normalized.crop}
                </h2>

                <p>
                  Zone {normalized.zone} ·{" "}
                  {normalized.growthStage}
                </p>
              </div>

              <span className="crai-v3-live-pill">
                <i />
                {hardwareLabel}
              </span>
            </div>

            <div className="crai-v3-risk-row">

              <div className="crai-v3-risk-copy">
                <span>FIELD STATUS</span>

                <strong>
                  {normalized.decisionReady
                    ? riskLabel(
                        normalized.riskLevel,
                        t
                      )
                    : "Evidence gated"}
                </strong>

                <p>
                  {normalized.decisionReady
                    ? recommendation
                    : t("moreEvidence")}
                </p>
              </div>

              <div className="crai-v3-risk-number">
                <strong>
                  {normalized.riskScore === null
                    ? "—"
                    : Math.round(
                        normalized.riskScore
                      )}
                </strong>

                <span>/100</span>
              </div>

            </div>

            <div className="crai-v3-risk-bar">
              <span
                className={`risk-fill ${normalized.risk}`}
                style={{
                  width:
                    normalized.riskScore === null
                      ? "0%"
                      : `${Math.min(
                          100,
                          Math.max(
                            0,
                            normalized.riskScore
                          )
                        )}%`,
                }}
              />
            </div>

            <div className="crai-v3-status-footer">

              <div>
                <span>DECISION</span>
                <strong>
                  {safeText(
                    normalized.decision,
                    normalized.decisionReady
                      ? "Monitor"
                      : "More evidence"
                  )}
                </strong>
              </div>

              <Link
                to={
                  normalized.eventId
                    ? `/evidence/${normalized.eventId}`
                    : "/check"
                }
                className="crai-v3-text-link"
              >
                View details
                <ChevronRight size={14} />
              </Link>

            </div>
          </div>

          {/* METRICS */}

          <div className="crai-v3-section-head">
            <div>
              <span>FIELD CONDITIONS</span>
              <strong>Current readings</strong>
            </div>

            <span className="crai-v3-small-status">
              ● Updated
            </span>
          </div>

          <div className="crai-v3-metric-grid">

            <Metric
              icon={
                <Thermometer size={16} />
              }
              label={t("temperature")}
              value={
                normalized.temperature === null
                  ? "—"
                  : normalized.temperature.toFixed(1)
              }
              unit={
                normalized.temperature === null
                  ? ""
                  : "°C"
              }
            />

            <Metric
              icon={
                <Droplets size={16} />
              }
              label={t("humidity")}
              value={
                normalized.humidity === null
                  ? "—"
                  : normalized.humidity.toFixed(0)
              }
              unit={
                normalized.humidity === null
                  ? ""
                  : "%"
              }
            />

            <Metric
              icon={
                <Sprout size={16} />
              }
              label={t("soilMoisture")}
              value={
                normalized.soilMoisture === null
                  ? "—"
                  : normalized.soilMoisture.toFixed(0)
              }
              unit={
                normalized.soilMoisture === null
                  ? ""
                  : "%"
              }
            />

            <Metric
              icon={
                <Gauge size={16} />
              }
              label="Soil pH"
              value={
                normalized.soilPh === null
                  ? "—"
                  : normalized.soilPh.toFixed(1)
              }
            />

          </div>

          {/* EVIDENCE */}

          <div className="crai-v3-panel">

            <div className="crai-v3-panel-header">
              <div>
                <span className="crai-v3-section-kicker">
                  CRAI INTELLIGENCE
                </span>

                <h3>
                  Evidence supporting this field
                </h3>
              </div>

              <Link
                to={
                  normalized.eventId
                    ? `/evidence/${normalized.eventId}`
                    : "/expert"
                }
                className="crai-v3-text-link"
              >
                Full evidence
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="crai-v3-evidence-grid">

              <EvidenceModule
                icon={<Camera size={15} />}
                title={t("visual")}
                data={evidence.visual}
              />

              <EvidenceModule
                icon={<Wind size={15} />}
                title={t("environmental")}
                data={evidence.environmental}
              />

              <EvidenceModule
                icon={<Activity size={15} />}
                title={t("temporal")}
                data={evidence.temporal}
              />

              <EvidenceModule
                icon={<MapPin size={15} />}
                title={t("spatial")}
                data={evidence.spatial}
              />

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}

        <div className="crai-v3-right-column">

          {/* FIELD MAP */}

          <FieldMapVisual
            risk={normalized.risk}
          />

          {/* AI PANEL */}

          <div className="crai-v3-ai-card">

            <div className="crai-v3-ai-head">
              <div>
                <div className="crai-v3-ai-title">
                  <span className="crai-v3-ai-mark">
                    <BrainCircuit size={16} />
                  </span>

                  <div>
                    <strong>CRAI Assistant</strong>
                    <span>
                      {t("explanationOnly")}
                    </span>
                  </div>
                </div>
              </div>

              <MoreHorizontal size={18} />
            </div>

            <div className="crai-v3-ai-body">

              <div className="crai-v3-ai-message">
                <strong>
                  {normalized.decisionReady
                    ? "Field summary"
                    : "Evidence review"}
                </strong>

                <p>
                  {normalized.decisionReady
                    ? `Your ${normalized.crop} field in Zone ${normalized.zone} is currently ${riskLabel(
                        normalized.riskLevel,
                        t
                      ).toLowerCase()}. CRAI recommends: ${safeText(
                        normalized.decision,
                        "continue monitoring"
                      )}.`
                    : "CRAI does not have enough current evidence to make a deterministic risk decision yet."}
                </p>
              </div>

              <div className="crai-v3-ai-actions">
                <Link
                  to="/ask-crai"
                  className="crai-v3-ai-action"
                >
                  <MessageCircle size={15} />
                  Ask CRAI
                </Link>

                <Link
                  to="/check"
                  className="crai-v3-ai-action"
                >
                  <Camera size={15} />
                  Check crop
                </Link>
              </div>

            </div>

            <div className="crai-v3-ai-footer">
              <span>
                CRAI intelligence online
              </span>

              <span className="crai-v3-ai-dot" />
            </div>

          </div>

          {/* QUICK ACTION */}

          <div className="crai-v3-next-action">

            <div className="crai-v3-next-icon">
              <Sprout size={18} />
            </div>

            <div>
              <span>NEXT ACTION</span>
              <strong>
                {normalized.decisionReady
                  ? safeText(
                      normalized.decision,
                      "Continue monitoring"
                    )
                  : "Provide more evidence"}
              </strong>
            </div>

            <Link to="/check">
              <ChevronRight size={17} />
            </Link>

          </div>

        </div>

      </section>

      {/* LOWER PRODUCT STRIP */}

      <section className="crai-v3-lower-grid">

        <Link
          to="/fields"
          className="crai-v3-lower-card"
        >
          <div className="crai-v3-lower-icon">
            <Sprout size={18} />
          </div>

          <div>
            <span>FIELD MANAGEMENT</span>
            <strong>My Fields</strong>
            <small>
              View your field intelligence
            </small>
          </div>

          <ChevronRight size={16} />
        </Link>

        <Link
          to="/alerts"
          className="crai-v3-lower-card"
        >
          <div className="crai-v3-lower-icon amber">
            <Bell size={18} />
          </div>

          <div>
            <span>ATTENTION</span>
            <strong>Field alerts</strong>
            <small>
              Review active CRAI events
            </small>
          </div>

          <ChevronRight size={16} />
        </Link>

        <Link
          to="/expert"
          className="crai-v3-lower-card"
        >
          <div className="crai-v3-lower-icon purple">
            <BrainCircuit size={18} />
          </div>

          <div>
            <span>INTELLIGENCE</span>
            <strong>Expert Console</strong>
            <small>
              Inspect the decision trace
            </small>
          </div>

          <ChevronRight size={16} />
        </Link>

      </section>

    </div>
  );
}

