import {useEffect,useState} from "react";
import {MapPinned,Leaf,ArrowRight,Plus} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {useFieldSelection} from "../app/FieldContext.jsx";
import {useCraiData} from "../hooks/useCraiData.js";
import {fetchEvents} from "../services/craiData.js";
import Modal from "../components/common/Modal.jsx";
import Button from "../components/common/Button.jsx";
import Badge from "../components/common/Badge.jsx";

const zones=[["A1","Zone A1"]];
export default function FieldsPage(){
 const {selected,setSelected}=useFieldSelection(); const navigate=useNavigate(); const [addOpen,setAddOpen]=useState(false);
 const state=useCraiData(({signal})=>fetchEvents(selected.farmId,selected.zoneId,10,{signal}),[selected.farmId,selected.zoneId]);
 const latest=state.data?.[0];
 useEffect(()=>{if(latest?.crop&&!selected.crop)setSelected(s=>({...s,crop:latest.crop}))},[latest?.crop]);
 return <div className="page"><div className="page-top"><div><div className="eyebrow">MY FIELDS</div><h1>Your fields</h1><p>Inspect the configured field zone and its latest CRAI evidence and event state.</p></div><Button onClick={()=>setAddOpen(true)}><Plus size={16}/>Add field</Button></div>
 <div className="field-grid">{zones.map(([id,name])=>{const active=id===selected.zoneId;return <button className={`field-card ${active?"selected":""}`} key={id} onClick={()=>{setSelected(s=>({...s,zoneId:id,zoneName:name}));navigate("/")}}><div className="field-card-map"><div className="mini-plot"/></div><div className="field-card-body"><div className="field-card-title"><span><Leaf size={17}/>{name}</span><ArrowRight size={16}/></div><span className="field-crop">{active?(selected.crop||latest?.crop||"Crop not set"):"Select to load current evidence"}</span><div className="field-card-foot"><Badge level={active&&latest?.riskLevel}>{active?(latest?.riskLevel||"UNKNOWN"):"NOT LOADED"}</Badge><small>{active?"Current zone":"Tap to inspect"}</small></div></div></button>})}</div>
 <div className="info-banner"><div><b>Why zones?</b><span>CRAI evaluates evidence at the field/zone level so a problem in one area does not automatically become a claim about the whole farm.</span></div><button className="link-button" onClick={()=>navigate("/demo")}>See how CRAI decides <ArrowRight size={15}/></button></div>
 <Modal open={addOpen} onClose={()=>setAddOpen(false)} title="Add a field"><div className="empty-inline"><Plus size={22}/><b>Field registration is not connected yet.</b><span>The current backend exposes event and evidence APIs, but no confirmed farmer field-creation contract. Nothing will be falsely saved.</span><Button variant="secondary" onClick={()=>setAddOpen(false)}>Close</Button></div></Modal>
 </div>
}
