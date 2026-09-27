import {
  Thermometer,
  Droplets,
  Leaf,
  CloudRain,
  Radio,
} from "lucide-react";

export default function SensorStatus({ sensors }) {
  const raw =
    sensors?.sensor ||
    sensors?.latest ||
    sensors?.reading ||
    sensors?.data ||
    sensors ||
    {};

  const temperature =
    raw.temperature ??
    raw.temp ??
    null;

  const humidity =
    raw.humidity ??
    null;

  const soilMoisture =
    raw.soilMoisture ??
    raw.soil_moisture ??
    null;

  const rain =
    raw.rain ??
    raw.rainfall ??
    null;

  const source =
    raw.source ||
    sensors?.source ||
    (raw.gateway_id ? "SIMULATED" : null);

  const timestamp =
    raw.timestamp ||
    raw.updatedAt ||
    raw.updated_at ||
    null;

  const freshness =
    raw.freshness ||
    sensors?.freshness ||
    null;

  const items = [
    [
      "Temperature",
      temperature,
      "°C",
      Thermometer,
    ],
    [
      "Humidity",
      humidity,
      "%",
      Droplets,
    ],
    [
      "Soil moisture",
      soilMoisture,
      "%",
      Leaf,
    ],
    [
      "Rain",
      rain,
      " mm",
      CloudRain,
    ],
  ];

  return (
    <div>
      <div className="sensor-grid">
        {items.map(([label, value, unit, Icon]) => (
          <div className="sensor-card" key={label}>
            <Icon size={17} />
            <span>{label}</span>

            <b>
              {value == null
                ? "—"
                : `${Number(value).toFixed(2)}${unit}`}
            </b>
          </div>
        ))}
      </div>

      {(source || timestamp || freshness) && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            fontSize: 12,
            color: "#62766e",
          }}
        >
          <Radio size={14} />

          <strong>
            {source === "SIMULATED"
              ? "SIMULATED HARDWARE"
              : source || "SENSOR DATA"}
          </strong>

          {freshness && (
            <span>· {String(freshness)}</span>
          )}

          {timestamp && (
            <span>
              · {new Date(timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
