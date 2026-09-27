import { CloudSun, Droplets, CloudRain, Wind } from "lucide-react";
import Card from "../common/Card.jsx";

export default function WeatherCard({ sensors }) {
  const has = sensors?.available;
  return (
    <Card>
      <div className="crai-weather-row">
        <div className="crai-weather-row__main">
          <CloudSun size={40} color="var(--crai-green-600)" />
          <div>
            <div className="crai-weather-row__temp">{has && sensors.temperature != null ? `${sensors.temperature}°` : "—"}</div>
            <div className="crai-muted">{has ? "Current field conditions" : "Waiting for fresh sensor evidence"}</div>
          </div>
        </div>
        <div className="crai-weather-items">
          <div className="crai-weather-item">
            <Droplets size={15} />
            <span><b>{has && sensors.humidity != null ? `${sensors.humidity}%` : "—"}</b> Humidity</span>
          </div>
          <div className="crai-weather-item">
            <CloudRain size={15} />
            <span><b>{has && sensors.rain != null ? `${sensors.rain}mm` : "—"}</b> Rain</span>
          </div>
          <div className="crai-weather-item">
            <Wind size={15} />
            <span><b>{has && sensors.soilMoisture != null ? `${sensors.soilMoisture}%` : "—"}</b> Soil moisture</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
