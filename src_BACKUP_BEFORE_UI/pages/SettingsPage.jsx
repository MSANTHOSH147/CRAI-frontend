import {useState} from "react";
import {Languages,ShieldCheck,Server} from "lucide-react";
import {useFieldSelection} from "../app/FieldContext.jsx";
import {isSupabaseConfigured} from "../services/supabase.js";
import {API_BASE} from "../services/craiData.js";
import Card from "../components/common/Card.jsx";
export default function SettingsPage(){
 const {language,setLanguage}=useFieldSelection(); const [expert,setExpert]=useState(false);
 return <div className="page"><div className="page-top"><div><div className="eyebrow">SETTINGS</div><h1>Preferences</h1><p>Keep the farmer experience simple while technical controls stay optional.</p></div></div>
 <div className="settings-grid"><Card><div className="setting-row"><div className="setting-icon"><Languages size={18}/></div><div><b>Language</b><span>Switch farmer-facing labels between English and Tamil.</span></div><button className="toggle-button" onClick={()=>setLanguage(language==="en"?"ta":"en")}>{language==="en"?"English":"தமிழ்"}</button></div><div className="setting-row"><div className="setting-icon"><ShieldCheck size={18}/></div><div><b>Expert details</b><span>Show more technical evidence in intelligence views.</span></div><button className={`switch ${expert?"on":""}`} onClick={()=>setExpert(v=>!v)} aria-pressed={expert}><i/></button></div></Card><Card><div className="eyebrow">CONNECTIONS</div><h2>System configuration</h2><div className="connection-row"><Server size={18}/><span>API</span><b>{API_BASE}</b></div><div className="connection-row"><ShieldCheck size={18}/><span>Supabase</span><b>{isSupabaseConfigured()?"Configured":"Environment not configured"}</b></div></Card></div>
 </div>
}
