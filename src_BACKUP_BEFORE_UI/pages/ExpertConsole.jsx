import { useEffect, useState } from "react";
import {
  Database,
  Fingerprint,
  Radio,
  RefreshCw,
  ShieldCheck,
  Thermometer,
  Droplets,
  Leaf,
  Clock3,
} from "lucide-react";

import { useFieldSelection } from "../app/FieldContext.jsx";
import { useCraiData } from "../hooks/useCraiData.js";
import {
  fetchCurrentEvent,
  fetchSystemStatus,
} from "../services/craiData.js";

import EvidenceFusion from "../components/intelligence/EvidenceFusion.jsx";
import EventLifecycle from "../components/intelligence/EventLifecycle.jsx";
import DecisionTrace from "../components/intelligence/DecisionTrace.jsx";
import Card from "../components/common/Card.jsx";
import Badge from "../components/common/Badge.jsx";
import QwenAdvisory from "../components/intelligence/QwenAdvisory.jsx";
import EvidencePackage from "../components/intelligence/EvidencePackage.jsx";
import SensorStatus from "../components/intelligence/SensorStatus.jsx";
import { t } from "../app/i18n.js";

export default function ExpertConsole() {
  const { selected, language } = useFieldSelection();

  const eventState = useCraiData(
    ({ signal }) =>
      fetchCurrentEvent(
        selected.farmId,
        selected.zoneId,
        { signal }
      ),
    [selected.farmId, selected.zoneId]
  );

  const [system, setSystem] = useState(null);

  const refresh = () => {
    eventState.refresh();
    fetchSystemStatus()
      .then(setSystem)
      .catch(() => {});
  };

  useEffect(() => {
    fetchSystemStatus()
      .then(setSystem)
      .catch(() => {});
  }, []);

  const e = eventState.data;
  const sensor = e?.sensors;

  return (
    <div className="page">

      <div className="page-top">
        <div>
          <div className="eyebrow">EXPERT / SIH CONSOLE</div>

          <h1>{t(language, "expertTitle")}</h1>

          <p>
            Technical evidence, lifecycle and audit state
            without hiding the farmer-facing meaning.
          </p>
        </div>

        <button
          className="soft-button"
          onClick={refresh}
          type="button"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="expert-status">
        <div>
          <span className="live-dot" />
          CRAI intelligence online
        </div>

        <span>
          Backend {system?.backend || "checking"}
        </span>

        <span>
          Supabase {system?.supabase?.status || "checking"}
        </span>
      </div>

      <div className="expert-grid">

        <Card>
          <div className="section-head">
            <div>
              <div className="eyebrow">CURRENT FIELD</div>
              <h2>Decision state</h2>
            </div>

            <Badge level={e?.riskLevel}>
              {e?.riskLevel || "UNKNOWN"}
            </Badge>
          </div>

          <div className="expert-score">
            {e?.decisionReady && e.riskScore != null
              ? Math.round(e.riskScore)
              : "—"}

            <small>/100</small>
          </div>

          <p>
            {e?.decisionReady
              ? "Deterministic risk decision available."
              : "Evidence needed before a risk decision."}
          </p>

          <div className="risk-track">
            <span
              style={{
                width:
                  e?.riskScore != null
                    ? `${e.riskScore}%`
                    : "0%",
              }}
            />
          </div>
        </Card>

        <Card>
          <div className="eyebrow">SYSTEM STATE</div>

          <div className="system-list">

            <div>
              <Radio />
              <span>Sensor state</span>
              <b>
                {sensor?.available
                  ? "AVAILABLE"
                  : "UNKNOWN"}
              </b>
            </div>

            <div>
              <Database />
              <span>Persistence</span>
              <b>
                {system?.supabase?.status || "UNKNOWN"}
              </b>
            </div>

            <div>
              <Fingerprint />
              <span>Integrity</span>
              <b>
                {e?.integrity?.hash
                  ? "RECORDED"
                  : "NOT AVAILABLE"}
              </b>
            </div>

          </div>
        </Card>
      </div>

      {/* ===================================================
          REAL SENSOR READINGS
         =================================================== */}

      <section className="section-block">
        <div className="section-head">
          <div>
            <div className="eyebrow">ENVIRONMENTAL EVIDENCE</div>
            <h2>Current sensor readings</h2>
          </div>

          <Radio size={20} />
        </div>

        <SensorStatus sensors={sensor} />

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(180px,1fr))",
            gap: 10,
          }}
        >
          <div className="notice-card">
            <Thermometer size={17} />
            <div>
              <b>Temperature</b>
              <p>
                {sensor?.temperature != null
                  ? `${Number(sensor.temperature).toFixed(2)} °C`
                  : "—"}
              </p>
            </div>
          </div>

          <div className="notice-card">
            <Droplets size={17} />
            <div>
              <b>Humidity</b>
              <p>
                {sensor?.humidity != null
                  ? `${Number(sensor.humidity).toFixed(2)} % RH`
                  : "—"}
              </p>
            </div>
          </div>

          <div className="notice-card">
            <Leaf size={17} />
            <div>
              <b>Soil moisture</b>
              <p>
                {sensor?.soilMoisture != null
                  ? `${Number(sensor.soilMoisture).toFixed(2)} %`
                  : "—"}
              </p>
            </div>
          </div>

          <div className="notice-card">
            <Clock3 size={17} />
            <div>
              <b>Evidence source</b>
              <p>
                {sensor?.source === "SIMULATED"
                  ? "SIMULATED HARDWARE"
                  : sensor?.source || "UNKNOWN"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="expert-action-row"><button className="soft-button" onClick={()=>setEvidenceOpen(true)}><ShieldCheck size={16}/>View Evidence Package</button></div><QwenAdvisory event={e} /><EvidencePackage event={e} open={evidenceOpen} onClose={()=>setEvidenceOpen(false)} />

      <section className="section-block">
        <div className="section-head">
          <div>
            <div className="eyebrow">MULTIMODAL FUSION</div>
            <h2>Why CRAI decided</h2>
          </div>

          <ShieldCheck size={20} />
        </div>

        <EvidenceFusion evidence={e?.evidence} />
      </section>

      <section className="section-block two-col">

        <Card>
          <div className="eyebrow">EVENT LIFECYCLE</div>
          <h2>Evidence progression</h2>

          <EventLifecycle
            stages={e?.lifecycle?.stages || []}
          />
        </Card>

        <Card>
          <div className="eyebrow">AUDIT PIPELINE</div>
          <h2>Decision trace</h2>

          <DecisionTrace
            active={e?.decisionReady ? 6 : 3}
          />
        </Card>

      </section>
    </div>
  );
}

