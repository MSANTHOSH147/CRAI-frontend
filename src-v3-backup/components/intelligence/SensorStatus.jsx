import {Thermometer,Droplets,Leaf,CloudRain} from "lucide-react";
export default function SensorStatus({sensors}){
 const items=[["Temperature",sensors?.temperature,"°C",Thermometer],["Humidity",sensors?.humidity,"%",Droplets],["Soil moisture",sensors?.soilMoisture,"%",Leaf],["Rain",sensors?.rain,"mm",CloudRain]];
 return <div className="sensor-grid">{items.map(([l,v,u,I])=><div className="sensor-card" key={l}><I size={17}/><span>{l}</span><b>{v==null?"—":`${v}${u}`}</b></div>)}</div>
}
