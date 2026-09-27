import {useNavigate,useParams} from "react-router-dom";
import {ArrowLeft,RefreshCw,ShieldCheck,MapPinned} from "lucide-react";
import {useFieldSelection} from "../app/FieldContext.jsx";
import {useCraiData} from "../hooks/useCraiData.js";
import {fetchCurrentEvent} from "../services/craiData.js";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import Card from "../components/common/Card.jsx";
import RiskGauge from "../components/intelligence/RiskGauge.jsx";
import EvidenceFusion from "../components/intelligence/EvidenceFusion.jsx";
import EventLifecycle from "../components/intelligence/EventLifecycle.jsx";
import DecisionTrace from "../components/intelligence/DecisionTrace.jsx";
import SensorStatus from "../components/intelligence/SensorStatus.jsx";
export default function FieldAssessment(){
 const {id}=useParams(); const navigate=useNavigate(); const {selected}=useFieldSelection();
 const state=useCraiData(({signal})=>fetchCurrentEvent(selected.farmId,id||selected.zoneId,{signal}),[selected.farmId,id]);
 const e=state.data;
 return <div className="page"><div className="page-top"><div><button className="back-link" onClick={()=>navigate(-1)}><ArrowLeft size={15}/> Back</button><div className="eyebrow">FIELD ASSESSMENT</div><h1>{e?.crop||selected.crop||"Your field"} · {id||selected.zoneName}</h1><p>One place to understand what CRAI found, what it still needs, and how the event progressed.</p></div><button className="soft-button" onClick={state.refresh}><RefreshCw size={16}/>Refresh</button></div>
 <div className="assessment-top"><Card><div className="section-head"><div><div className="eyebrow">CURRENT RISK</div><h2>Evidence-gated risk</h2></div>{e&&<Badge level={e.riskLevel}>{e.riskLevel||"UNKNOWN"}</Badge>}</div><RiskGauge score={e?.riskScore} level={e?.riskLevel} decisionReady={e?.decisionReady}/></Card><Card><div className="section-head"><div><div className="eyebrow">FIELD CONTEXT</div><h2>{selected.zoneName}</h2></div><MapPinned size={20}/></div><div className="map-preview"><div className="map-plot"/><span><MapPinned size={15}/> {selected.zoneName}</span></div></Card></div>
 <section className="section-block"><div className="section-head"><div><div className="eyebrow">WHAT CRAI USED</div><h2>Evidence fusion</h2><p>Missing vectors remain explicit.</p></div></div><EvidenceFusion evidence={e?.evidence}/></section>
 <section className="section-block two-col"><Card><div className="eyebrow">EDGE TELEMETRY</div><h2>Current sensors</h2><SensorStatus sensors={e?.sensors}/></Card><Card><div className="eyebrow">EVENT LIFECYCLE</div><h2>Evidence progression</h2><EventLifecycle stages={e?.lifecycle?.stages||[]}/></Card></section>
 <section className="section-block two-col"><Card><div className="eyebrow">WHY CRAI DECIDED</div><h2>Decision trace</h2><DecisionTrace active={e?.decisionReady?6:3}/></Card><Card><div className="eyebrow">INTEGRITY</div><h2>Event record</h2><div className="integrity-box"><ShieldCheck size={22}/><b>{e?.integrity?.hash?"Integrity hash recorded":"Integrity hash unavailable"}</b><span>{e?.integrity?.hash||"No hash is exposed in this current event response."}</span></div></Card></section>
 {e?.eventId&&<Button onClick={()=>navigate(`/evidence/${e.eventId}`)}>Open full evidence package</Button>}
 </div>
}
