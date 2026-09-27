import { Thermometer, Droplets, CloudRain, Waves } from "lucide-react";

export default function SensorStatus({ sensors }) {
  if (!sensors?.available) {
    return <p className="crai-body">Sensor connection unavailable. CRAI will use the last verified reading only when it is still fresh.</p>;
  }
  const items = [
    { icon: Thermometer, label: "Temperature", value: sensors.temperature, unit: "°C" },
    { icon: Droplets, label: "Humidity", value: sensors.humidity, unit: "%" },
    { icon: Waves, label: "Soil moisture", value: sensors.soilMoisture, unit: "%" },
    { icon: CloudRain, label: "Rain", value: sensors.rain, unit: "mm" },
  ];
  return (
    <div className="crai-grid crai-grid--4">
      {items.map(({ icon: Icon, label, value, unit }) => (
        <div key={label} className="crai-flex crai-items-center crai-gap-10">
          <Icon size={16} color="var(--crai-ink-muted)" />
          <div>
            <div className="crai-muted" style={{ fontSize: 11.5 }}>{label}</div>
            <div className="crai-title-md">{value === null || value === undefined ? "—" : `${value}${unit}`}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
