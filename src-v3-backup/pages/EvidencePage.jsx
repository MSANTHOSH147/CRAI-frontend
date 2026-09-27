import {useState} from "react";
import {useNavigate,useParams} from "react-router-dom";
import {ArrowLeft,CheckCircle2,ShieldCheck,Database} from "lucide-react";
import {useCraiData} from "../hooks/useCraiData.js";
import {fetchEventDetail,fetchEventTimeline,fetchEvidencePackage,verifyEvidence} from "../services/craiData.js";
import Badge from "../components/common/Badge.jsx";
import Card from "../components/common/Card.jsx";
import EvidenceFusion from "../components/intelligence/EvidenceFusion.jsx";
import EventLifecycle from "../components/intelligence/EventLifecycle.jsx";
import Button from "../components/common/Button.jsx";
const tabs=["Overview","Evidence","Timeline","Integrity"];
export default function EvidencePage(){
 const {id}=useParams(); const nav=useNavigate(); const [tab,setTab]=useState("Overview"); const [verify,setVerify]=useState(null);
 const event=useCraiData(({signal})=>fetchEventDetail(id,{signal}),[id]); const timeline=useCraiData(({signal})=>fetchEventTimeline(id,{signal}),[id]); const pkg=useCraiData(({signal})=>fetchEvidencePackage(id,{signal}),[id]);
 const e=event.data;
 async function doVerify(){try{setVerify(await verifyEvidence(id))}catch(err){setVerify({status:"VERIFY_UNAVAILABLE"})}}
 return <div className="page"><button className="back-link" onClick={()=>nav(-1)}><ArrowLeft size={15}/> Back</button><div className="page-top compact"><div><div className="eyebrow">EVIDENCE PACKAGE</div><h1>{id}</h1><p>Persistent event record · evidence · lifecycle · integrity</p></div>{e&&<Badge level={e.riskLevel}>{e.riskLevel||"UNKNOWN"}</Badge>}</div>
 <div className="tabs">{tabs.map(t=><button key={t} className={tab===t?"active":""} onClick={()=>setTab(t)}>{t}</button>)}</div>
 <Card className="evidence-panel">{tab==="Overview"&&<div className="overview-grid"><div><span>Field</span><b>{e?.fieldName||"My Field"}</b></div><div><span>Zone</span><b>{e?.zoneName||e?.zoneId||"Unknown"}</b></div><div><span>Crop</span><b>{e?.crop||"Unknown"}</b></div><div><span>Status</span><b>{e?.status||"Unknown"}</b></div><div><span>Risk score</span><b>{e?.decisionReady?Math.round(e.riskScore):"Unknown"}</b></div><div><span>Action</span><b>{e?.action||"Not available"}</b></div></div>}
 {tab==="Evidence"&&<EvidenceFusion evidence={e?.evidence}/>}
 {tab==="Timeline"&&<div className="raw-timeline"><EventLifecycle stages={e?.lifecycle?.stages||[]}/><pre>{JSON.stringify(timeline.data||timeline.error?timeline.data||{message:"Timeline unavailable"}:[],null,2)}</pre></div>}
 {tab==="Integrity"&&<div className="integrity-detail"><div className="integrity-box"><CheckCircle2 size={24}/><b>{e?.integrity?.hash?"Hash recorded":"Hash unavailable"}</b><span>{e?.integrity?.hash||"No integrity hash in current response."}</span></div><Button variant="secondary" onClick={doVerify}><ShieldCheck size={16}/>Verify integrity</Button>{verify&&<div className="notice-card"><Database size={17}/><div><b>{verify.status||"Verification response"}</b><p>The verification endpoint response is shown as returned by CRAI.</p></div></div>}</div>}</Card>
 <details className="technical-details"><summary>Technical evidence package</summary><pre>{JSON.stringify(pkg.data||{},null,2)}</pre></details>
 </div>
}
