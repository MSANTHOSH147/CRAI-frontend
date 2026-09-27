import {Bell,Languages,Activity,ChevronDown,CheckCircle2,Server,MapPin} from "lucide-react";
import {useEffect,useState} from "react";
import {useFieldSelection} from "../../app/FieldContext.jsx";
import FieldSelector from "./FieldSelector.jsx";
import Drawer from "../common/Drawer.jsx";
import {fetchSystemStatus} from "../../services/craiData.js";

export default function Topbar(){
 const {language,setLanguage,notificationsOpen,setNotificationsOpen}=useFieldSelection();
 const [fieldOpen,setFieldOpen]=useState(false);
 const [statusOpen,setStatusOpen]=useState(false);
 const [system,setSystem]=useState(null);
 useEffect(()=>{fetchSystemStatus().then(setSystem).catch(()=>{})},[]);
 return <header className="topbar">
  <div className="topbar-left"><div className="mobile-brand">CRAI</div><span className="top-context">CURRENT FIELD</span></div>
  <div className="topbar-actions">
   <button className="header-pill" onClick={()=>setLanguage(language==="en"?"ta":"en")}><Languages size={16}/>{language==="en"?"தமிழ்":"English"}</button>
   <button className="header-pill" onClick={()=>setStatusOpen(true)}><i className="live-dot"/>Live<ChevronDown size={14}/></button>
   <button className="icon-button" onClick={()=>setNotificationsOpen(true)} aria-label="Notifications"><Bell size={18}/><span className="notify-dot"/></button>
   <FieldSelector onOpen={()=>setFieldOpen(true)}/>
  </div>
  {fieldOpen&&<FieldMenu onClose={()=>setFieldOpen(false)}/>}
  <Drawer open={statusOpen} onClose={()=>setStatusOpen(false)} title="System status">
   <div className="status-panel">
    <div className="status-row"><Server size={18}/><span>CRAI backend</span><strong className={system?.backend==="online"?"good-text":""}>{system?.backend||"Checking…"}</strong></div>
    <div className="status-row"><CheckCircle2 size={18}/><span>Supabase</span><strong>{system?.supabase?.status||"Checking…"}</strong></div>
    <div className="status-row"><Activity size={18}/><span>Data mode</span><strong>Evidence-gated</strong></div>
   </div>
  </Drawer>
  <Drawer open={notificationsOpen} onClose={()=>setNotificationsOpen(false)} title="Notifications">
   <div className="notice-card"><div className="notice-icon"><Bell size={18}/></div><div><b>CRAI alerts</b><p>Active field events appear here when the intelligence layer records them.</p></div></div>
   <div className="empty-inline">No additional notifications loaded.</div>
  </Drawer>
 </header>
}

function FieldMenu({onClose}){
 const {selected,setSelected}=useFieldSelection();
 const options=[
  {zoneId:"A1",zoneName:"Zone A1",crop:selected.crop},
  {zoneId:"A2",zoneName:"Zone A2",crop:null},
  {zoneId:"B1",zoneName:"Zone B1",crop:null}
 ];
 return <div className="field-menu-overlay" onClick={onClose}><div className="field-menu" onClick={e=>e.stopPropagation()}><div className="menu-title">Select field</div>{options.map(o=><button key={o.zoneId} className={o.zoneId===selected.zoneId?"selected":""} onClick={()=>{setSelected({...selected,...o,fieldName:"My Field"});onClose()}}><MapPin size={16}/><span><b>My Field</b><small>{o.zoneName}{o.crop?` · ${o.crop}`:""}</small></span>{o.zoneId===selected.zoneId&&<CheckCircle2 size={16}/>}</button>)}</div></div>
}
