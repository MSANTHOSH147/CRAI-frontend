import {CloudSun,Droplets,Thermometer,Wind,RefreshCw} from "lucide-react";
export default function WeatherCard({sensors,onRefresh,loading=false}){
 const available=Boolean(sensors?.available);
 const item=(label,value,unit,Icon)=> <div className="env-item"><Icon size={16}/><span>{label}</span><b>{value==null?"—":`${value}${unit}`}</b></div>;
 return <section className="saas-card env-card">
  <div className="section-head"><div><div className="eyebrow">LIVE FIELD CONDITIONS</div><h2>Environment</h2></div><button className="icon-button soft" onClick={onRefresh} disabled={loading} aria-label="Refresh environment"><RefreshCw size={16}/></button></div>
  <div className="env-banner"><div><CloudSun size={27}/><div><b>{available?"Fresh field telemetry":"Fresh environmental evidence unavailable"}</b><small>{available?"Latest verified reading":"CRAI will not treat missing evidence as a safe decision."}</small></div></div></div>
  <div className="env-grid">{item("Temperature",sensors?.temperature,"°C",Thermometer)}{item("Humidity",sensors?.humidity,"%",Droplets)}{item("Soil moisture",sensors?.soilMoisture,"%",Droplets)}{item("Wind",null,"",Wind)}</div>
 </section>
}
