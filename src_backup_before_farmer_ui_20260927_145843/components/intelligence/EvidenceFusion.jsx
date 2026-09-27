import {Camera,Thermometer,TrendingUp,MapPinned} from "lucide-react";
const items=[["visual","Visual",Camera],["environmental","Environment",Thermometer],["temporal","Temporal",TrendingUp],["spatial","Spatial",MapPinned]];
export default function EvidenceFusion({evidence={}}){
 return <div className="fusion-grid">{items.map(([key,label,Icon])=>{const e=evidence[key];const c=typeof e?.confidence==="number"?Math.round(e.confidence*100):null;return <div className="fusion-card" key={key}><div className="fusion-head"><span><Icon size={16}/>{label}</span><i className={e?.available?"good":""}/></div><b>{e?.available?"Available":"Unknown"}</b><p>{e?.summary||"No current evidence is available."}</p><div className="mini-progress"><span style={{width:c!=null?`${c}%`:"0%"}}/></div><small>{c!=null?`${c}% confidence`:"Confidence unknown"}</small></div>})}</div>
}
