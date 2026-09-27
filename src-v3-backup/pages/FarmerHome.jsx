import {useEffect,useState} from "react";
import {RefreshCw,ChevronRight,MapPinned} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {useFieldSelection} from "../app/FieldContext.jsx";
import {useCraiData} from "../hooks/useCraiData.js";
import {fetchCurrentEvent,fetchEvents} from "../services/craiData.js";
import {subscribeToTables} from "../services/realtime.js";
import FarmerHero from "../components/farmer/FarmerHero.jsx";
import RiskCard from "../components/farmer/RiskCard.jsx";
import WeatherCard from "../components/farmer/WeatherCard.jsx";
import EvidenceOverview from "../components/farmer/EvidenceOverview.jsx";
import NextActionCard from "../components/farmer/NextActionCard.jsx";
import RecentActivity from "../components/farmer/RecentActivity.jsx";
import AskCraiCard from "../components/farmer/AskCraiCard.jsx";
import CropCheckModal from "../components/farmer/CropCheckModal.jsx";
import Drawer from "../components/common/Drawer.jsx";
import Skeleton from "../components/common/Skeleton.jsx";

export default function FarmerHome(){
 const {selected,setSelected}=useFieldSelection(); const navigate=useNavigate(); const [checkOpen,setCheckOpen]=useState(false); const [evidenceKey,setEvidenceKey]=useState(null);
 const eventState=useCraiData(({signal})=>fetchCurrentEvent(selected.farmId,selected.zoneId,{signal}),[selected.farmId,selected.zoneId]);
 const historyState=useCraiData(({signal})=>fetchEvents(selected.farmId,selected.zoneId,6,{signal}),[selected.farmId,selected.zoneId]);
 const event=eventState.data;
 useEffect(()=>subscribeToTables(["farm_events","risk_history"],()=>{eventState.refresh();historyState.refresh()}),[selected.farmId,selected.zoneId]);
 useEffect(()=>{if(event?.crop&&!selected.crop)setSelected(s=>({...s,crop:event.crop}))},[event?.crop]);
 const refresh=()=>{eventState.refresh();historyState.refresh()};
 return <div className="page">
  <div className="page-top"><div><div className="eyebrow">FARMER HOME</div><h1>Good morning, Farmer <span className="wave">👋</span></h1><p>Here’s what CRAI knows about your field — and what it still needs.</p></div><div className="page-actions"><button className="soft-button" onClick={refresh}><RefreshCw size={16}/>Refresh</button><button className="outline-button" onClick={()=>navigate("/fields")}><MapPinned size={16}/>{selected.zoneName}</button></div></div>
  {eventState.status==="loading"&&!event?<Skeleton height={330}/>:<FarmerHero selected={selected} event={event} onCheck={()=>setCheckOpen(true)}/>}
  <div className="dashboard-grid"><RiskCard event={event} onOpen={()=>event?.eventId?navigate(`/evidence/${event.eventId}`):navigate("/demo")}/><WeatherCard sensors={event?.sensors} onRefresh={refresh} loading={eventState.status==="loading"}/></div>
  <section className="section-block"><div className="section-head"><div><div className="eyebrow">WHAT CRAI FOUND</div><h2>Evidence at a glance</h2><p>Four evidence vectors keep the decision grounded.</p></div><button className="link-button" onClick={()=>navigate("/expert")}>Open intelligence <ChevronRight size={15}/></button></div><EvidenceOverview event={event} onOpen={setEvidenceKey}/></section>
  <NextActionCard event={event} onAction={()=>event?.eventId?navigate(`/evidence/${event.eventId}`):navigate("/demo")}/>
  <section className="section-block two-col"><div className="saas-card"><div className="section-head"><div><div className="eyebrow">RECENT ACTIVITY</div><h2>What changed</h2></div><button className="link-button" onClick={()=>navigate("/alerts")}>View alerts <ChevronRight size={15}/></button></div><RecentActivity events={historyState.data||[]}/></div><AskCraiCard/></section>
  <CropCheckModal open={checkOpen} onClose={()=>setCheckOpen(false)} onContinue={()=>navigate("/demo")}/>
  <Drawer open={Boolean(evidenceKey)} onClose={()=>setEvidenceKey(null)} title={evidenceKey?`${evidenceKey[0].toUpperCase()}${evidenceKey.slice(1)} evidence`:"Evidence"}>
   {evidenceKey&&<div className="drawer-evidence"><div className={`big-status ${event?.evidence?.[evidenceKey]?.available?"good":"unknown"}`}>{event?.evidence?.[evidenceKey]?.available?"AVAILABLE":"NOT AVAILABLE"}</div><h3>{event?.evidence?.[evidenceKey]?.summary||"Fresh evidence is not present in the current event record."}</h3><p>CRAI keeps missing evidence explicit. An unavailable vector is not treated as zero risk.</p></div>}
  </Drawer>
 </div>
}
