import {Camera,MapPinned,Leaf,UploadCloud} from "lucide-react";
import Button from "../common/Button.jsx";
export default function FarmerHero({selected,event,onCheck}){
 const known=event?.decisionReady;
 return <section className="field-hero">
  <div className="field-map-art"><div className="plot plot-a"/><div className="plot plot-b"/><div className="plot plot-c"/><div className="map-pin"><MapPinned size={18}/></div></div>
  <div className="field-hero-copy">
   <div className="field-badge"><span className="live-dot"/> FIELD CONTEXT · {selected.zoneName}</div>
   <h1>{selected.crop||event?.crop||"Your crop field"}</h1>
   <p>{known?`CRAI has a ${event.riskLevel?.toLowerCase()} risk assessment for ${selected.zoneName}.`:"CRAI is waiting for fresh evidence before making a protective risk decision."}</p>
   <div className="hero-meta"><span><Leaf size={14}/> {selected.crop||event?.crop||"Crop not set"}</span><span><MapPinned size={14}/> {selected.zoneName}</span><span><UploadCloud size={14}/> Evidence-gated</span></div>
   <div className="hero-actions"><Button onClick={onCheck}><Camera size={16}/> Check my crop</Button></div>
  </div>
 </section>
}
