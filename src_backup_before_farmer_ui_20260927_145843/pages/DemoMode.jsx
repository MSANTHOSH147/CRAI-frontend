import {useEffect,useState} from "react";
import {ArrowLeft,ArrowRight,Camera,BrainCircuit,Radio,Layers3,ShieldAlert,RefreshCw,CheckCircle2,Database,ChevronRight} from "lucide-react";
import {Link} from "react-router-dom";
import {useFieldSelection} from "../app/FieldContext.jsx";
import {runSimulatorStep} from "../services/craiData.js";
const steps=[
 {tag:"OBSERVE",title:"A crop image arrives",icon:Camera,desc:"CRAI starts with an uncertain observation. It does not immediately claim a risk decision.",visual:"Mobile crop photo",input:"Crop image",intelligence:"Observation received",decision:"Not ready",persistence:"Event ledger"},
 {tag:"DETECT",title:"Visual evidence is inspected",icon:BrainCircuit,desc:"The visual layer turns the image into evidence while preserving uncertainty and confidence.",visual:"Visual evidence candidate",input:"Image evidence",intelligence:"Visual inspection",decision:"Not ready",persistence:"Evidence reference"},
 {tag:"REQUEST",title:"CRAI asks for missing evidence",icon:Radio,desc:"When a signal is incomplete or stale, CRAI requests what it needs instead of guessing.",visual:"Adaptive evidence request",input:"Missing vector",intelligence:"Evidence acquisition",decision:"Waiting",persistence:"Request trace"},
 {tag:"FUSE",title:"Evidence is combined",icon:Layers3,desc:"Visual, environmental, temporal and spatial context become one evidence package.",visual:"Multimodal evidence fusion",input:"4 evidence vectors",intelligence:"Fusion",decision:"Ready when gated",persistence:"Evidence package"},
 {tag:"DECIDE",title:"A protective action is gated",icon:ShieldAlert,desc:"Only sufficient evidence allows a deterministic risk state and action gate.",visual:"Risk + action gate",input:"Fused evidence",intelligence:"Deterministic risk",decision:"Decision",persistence:"Risk history"},
 {tag:"RECOVER",title:"The event is tracked",icon:RefreshCw,desc:"CRAI keeps observing. Recovery is explicit; a single low reading does not erase an active event.",visual:"DURING → RECOVERY",input:"New observation",intelligence:"Lifecycle engine",decision:"Recovery",persistence:"Event timeline"},
 {tag:"RESOLVE",title:"The evidence package is closed",icon:CheckCircle2,desc:"The event becomes a durable, auditable record for later review.",visual:"RESOLVED record",input:"Final evidence",intelligence:"Resolution",decision:"Resolved",persistence:"Supabase"},
];
export default function DemoMode(){
 const {language}=useFieldSelection(); const [i,setI]=useState(0); const [running,setRunning]=useState(false); const s=steps[i]; const Icon=s.icon;
 useEffect(()=>{const f=e=>{if(e.key==="ArrowRight")setI(x=>Math.min(6,x+1));if(e.key==="ArrowLeft")setI(x=>Math.max(0,x-1));if(e.key.toLowerCase()==="r")setI(0)};window.addEventListener("keydown",f);return()=>window.removeEventListener("keydown",f)},[]);
 async function acquire(){setRunning(true);try{await runSimulatorStep({steps:1})}catch{}finally{setRunning(false);setI(3)}}
 return <div className="demo-shell demo-light"><div className="demo-wrap"><div className="demo-top"><Link to="/" className="demo-back"><ArrowLeft size={16}/>Exit demo</Link><div><b>CRAI · Evidence Journey</b><span>SIH presentation mode · 7-step evidence orchestration</span></div><span className="demo-badge">DEMO DATA · NO PRODUCTION CLAIMS · {language==="ta"?"தமிழ் / English":"English / தமிழ்"}</span></div>
 <div className="demo-progress"><div><span style={{width:`${((i+1)/7)*100}%`}}/></div><small>Step {i+1} of 7</small></div>
 <div className="demo-layout"><aside className="demo-nav">{steps.map((x,n)=><button key={x.tag} className={n===i?"active":""} onClick={()=>setI(n)}><small>{String(n+1).padStart(2,"0")} · {x.tag}</small><b>{x.title}</b></button>)}</aside>
 <main className="demo-card"><div className="demo-card-top"><div><div className="eyebrow">STEP {i+1} / 7 · {s.tag}</div><h1>{s.title}</h1><p>{s.desc}</p></div><div className="demo-icon"><Icon size={25}/></div></div>
 <div className="demo-stage"><div className="demo-visual"><div className="field-art"><div className="demo-plot p1"/><div className="demo-plot p2"/><div className="demo-plot p3"/></div><div className="demo-caption"><b>{s.visual}</b><span>CRAI evidence pipeline</span></div></div><div className="demo-explain"><div className="judge-callout"><b>What the judge should notice</b><p>CRAI makes its reasoning visible: observation → evidence → fusion → decision → action → recovery → audit.</p></div><div className="demo-four"><div><small>INPUT</small><b>{s.input}</b></div><div><small>INTELLIGENCE</small><b>{s.intelligence}</b></div><div><small>DECISION</small><b>{s.decision}</b></div><div><small>PERSISTENCE</small><b>{s.persistence}</b></div></div></div></div>
 {i===2&&<button className="demo-acquire" onClick={acquire} disabled={running}>{running?<><RefreshCw className="spin"/>Acquiring evidence…</>:<>Acquire evidence <ChevronRight size={16}/></>}</button>}
 {i===6&&<div className="demo-final"><Database size={20}/><div><b>Event lifecycle complete</b><span>Evidence package → integrity → Supabase persistence</span></div></div>}
 <div className="demo-footer"><button className="demo-reset" onClick={()=>setI(0)}><RefreshCw size={15}/>Reset</button><div><button className="demo-secondary" disabled={i===0} onClick={()=>setI(i-1)}><ArrowLeft size={15}/>Back</button><button className="demo-primary" onClick={()=>setI(Math.min(6,i+1))}>{i===6?"Replay demo":"Next step"}<ArrowRight size={15}/></button></div></div>
 <div className="demo-hint">Keyboard: ← previous · → next · R reset</div>
 </main></div></div></div>
}
