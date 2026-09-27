import {ArrowRight,Radio,ShieldAlert,CheckCircle2} from "lucide-react";
import Button from "../common/Button.jsx";
export default function NextActionCard({event,onAction}){
 const known=event?.decisionReady;
 const high=["HIGH","CRITICAL"].includes(String(event?.riskLevel||"").toUpperCase());
 const resolved=event?.status==="RESOLVED";
 let title=resolved?"Event resolved":high?"Your field needs attention":"Fresh evidence is needed";
 let body=resolved?"The event lifecycle has been closed and recorded.":known?(event.action||"Review the evidence-backed assessment before acting."):
 "CRAI does not guess when evidence is missing. Collect fresh evidence to continue.";
 return <section className={`action-card ${high?"high":""} ${resolved?"resolved":""}`}>
  <div className="action-icon">{resolved?<CheckCircle2 size={22}/>:high?<ShieldAlert size={22}/>:<Radio size={22}/>}</div>
  <div className="action-copy"><div className="eyebrow">WHAT YOU SHOULD DO</div><h2>{title}</h2><p>{body}</p></div>
  <Button variant={high?"danger":"primary"} onClick={onAction}>{resolved?"View record":known?"View assessment":"Collect evidence"}<ArrowRight size={16}/></Button>
 </section>
}
