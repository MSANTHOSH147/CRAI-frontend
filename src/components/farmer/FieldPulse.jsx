import React from "react";
import {
  Map,
  Thermometer,
  Droplets,
  Leaf,
  Eye,
  Activity,
  MapPin
} from "lucide-react";

export default function FieldPulse({ event, selected }) {
  const sensors = event?.sensors || {};

  const temperature =
    sensors?.temperature ??
    sensors?.temp ??
    null;

  const humidity =
    sensors?.humidity ??
    null;

  const soilMoisture =
    sensors?.soilMoisture ??
    sensors?.soil_moisture ??
    null;

  const risk = event?.riskScore ?? null;
  const level = event?.riskLevel || "UNKNOWN";

  const fmt = (v, suffix = "") =>
    v == null || Number.isNaN(Number(v))
      ? "—"
      : `${Number(v).toFixed(2)}${suffix}`;

  const evidence = event?.evidence || {};

  const state = (value) => {
    if (value?.available === true) return "AVAILABLE";
    if (value?.available === false) return "MISSING";
    return "UNKNOWN";
  };

  return (
    <section className="crai-field-pulse">
      <div className="crai-field-pulse-head">
        <div>
          <div className="eyebrow">CRAI FIELD PULSE</div>
          <h2>
            {selected?.zoneName ||
              selected?.zoneId ||
              event?.zoneId ||
              "Zone A1"}
          </h2>
          <p>
            {event?.crop ||
              selected?.crop ||
              "Tomato"}{" "}
            · live intelligence view
          </p>
        </div>

        <div className="crai-pulse-icon">
          <Map size={20} />
        </div>
      </div>

      <div className="crai-field-map">
        <div className="crai-map-grid" />
        <div className="crai-field-shape field-one" />
        <div className="crai-field-shape field-two" />
        <div className="crai-field-shape field-three" />

        <div className="crai-map-marker">
          <MapPin size={15} />
          <span>
            {selected?.zoneId ||
              event?.zoneId ||
              "A1"}
          </span>
        </div>

        <div className="crai-map-label">
          <b>FIELD PULSE</b>
          <span>
            Evidence-linked field state
          </span>
        </div>
      </div>

      <div className="crai-pulse-risk">
        <div>
          <span className="eyebrow">CURRENT CRAI DECISION</span>
          <strong>
            {risk == null ? "—" : Math.round(risk)}
            <small>/100</small>
          </strong>
        </div>

        <span className={`crai-pulse-level level-${String(level).toLowerCase()}`}>
          {level}
        </span>
      </div>

      <div className="crai-pulse-sensors">
        <div>
          <Thermometer size={17} />
          <span>Temperature</span>
          <b>{fmt(temperature, "°C")}</b>
        </div>

        <div>
          <Droplets size={17} />
          <span>Humidity</span>
          <b>{fmt(humidity, "%")}</b>
        </div>

        <div>
          <Leaf size={17} />
          <span>Soil moisture</span>
          <b>{fmt(soilMoisture, "%")}</b>
        </div>
      </div>

      <div className="crai-pulse-evidence">
        <div>
          <Eye size={15} />
          <span>Visual</span>
          <b>{state(evidence?.visual)}</b>
        </div>

        <div>
          <Activity size={15} />
          <span>Environment</span>
          <b>{state(evidence?.environmental)}</b>
        </div>

        <div>
          <Activity size={15} />
          <span>Temporal</span>
          <b>{state(evidence?.temporal)}</b>
        </div>

        <div>
          <MapPin size={15} />
          <span>Spatial</span>
          <b>{state(evidence?.spatial)}</b>
        </div>
      </div>

      <div className="crai-simulated-badge">
        SIMULATED HARDWARE · development mode
      </div>
    </section>
  );
}
