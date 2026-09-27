import {useMemo,useState} from "react";
import {Bell,Check,Filter,ArrowRight} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {useCraiData} from "../hooks/useCraiData.js";
import {fetchAlerts} from "../services/craiData.js";
import Badge from "../components/common/Badge.jsx";
import Skeleton from "../components/common/Skeleton.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
const filters=["ALL","CRITICAL","HIGH","MODERATE","RESOLVED"];
export default function AlertsPage(){
 const {data:alerts,status,refresh}=useCraiData(fetchAlerts,[]); const [filter,setFilter]=useState("ALL"); const [read,setRead]=useState({}); const navigate=useNavigate();
 const shown=useMemo(()=>{const list=alerts||[];return filter==="ALL"?list:list.filter(a=>String(a.severity).toUpperCase()===filter|| (filter==="RESOLVED"&&a.status==="RESOLVED"))},[alerts,filter]);
 return <div className="page"><div className="page-top"><div><div className="eyebrow">FIELD ALERTS</div><h1>Alerts & events</h1><p>CRAI surfaces recorded field events without hiding their evidence state.</p></div><button className="soft-button" onClick={refresh}>Refresh</button></div>
 <div className="filter-bar"><Filter size={16}/>{filters.map(f=><button key={f} className={filter===f?"active":""} onClick={()=>setFilter(f)}>{f}</button>)}</div>
 {status==="loading"&&<div className="stack">{[1,2,3].map(i=><Skeleton key={i} height={116}/>)}</div>}
 {status==="success"&&!shown.length&&<EmptyState icon={Bell} title="No alerts in this view" body="When CRAI records a field event, it will appear here." action={<button className="outline-button" onClick={()=>setFilter("ALL")}>Show all</button>}/>}
 {status==="success"&&<div className="alert-list">{shown.map(a=><article key={a.id} className={`alert-card ${String(a.severity).toLowerCase()}`}><div className="alert-accent"/><div className="alert-main"><div className="alert-top"><div><Badge level={a.severity}>{a.severity||"INFO"}</Badge><h3>{a.title}</h3><span>{a.fieldName} · {a.zoneName||"Zone"} · {a.status||"Recorded"}</span></div><button className={`read-button ${read[a.id]?"read":""}`} onClick={()=>setRead(r=>({...r,[a.id]:true}))}>{read[a.id]?<Check size={15}/>:<span/>}{read[a.id]?"Read":"Mark read"}</button></div><p>{a.body}</p><div className="alert-actions">{a.eventId&&<button className="link-button" onClick={()=>navigate(`/evidence/${a.eventId}`)}>View evidence <ArrowRight size={15}/></button>}</div></div></article>)}</div>}
 {status==="error"&&<EmptyState title="Alerts unavailable" body="The CRAI event service could not be reached." action={<button className="outline-button" onClick={refresh}>Try again</button>}/>}
 </div>
}
