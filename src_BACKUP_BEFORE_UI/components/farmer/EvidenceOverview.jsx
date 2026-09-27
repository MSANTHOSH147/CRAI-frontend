import {Camera,Thermometer,TrendingUp,MapPinned,ChevronRight} from "lucide-react";
const items=[["visual","Visual evidence",Camera],["environmental","Environment",Thermometer],["temporal","Field trend",TrendingUp],["spatial","Spatial context",MapPinned]];
export default function EvidenceOverview({event,onOpen}){
 return <div className="evidence-grid">{items.map(([key,label,Icon])=>{
   const e=event?.evidence?.[key]; const available=e?.available;
   return <button key={key} className="evidence-card" onClick={()=>onOpen?.(key)}>
    <div className="evidence-card-top"><span className={`evidence-icon ${available?"available":""}`}><Icon size={18}/></span><ChevronRight size={15}/></div>
    <b>{label}</b><span className={`evidence-status ${available?"available":""}`}>{available?"AVAILABLE":"NOT AVAILABLE"}</span>
    <p>{available?(e.summary||"Evidence is present in the current package."):"Fresh evidence is not present in the current event."}</p>
   </button>
 })}</div>
}
