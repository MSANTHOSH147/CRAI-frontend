import {ShieldCheck,ArrowRight} from "lucide-react";
import {Link} from "react-router-dom";
import Badge from "../common/Badge.jsx";
export default function RiskCard({event,onOpen}){
 const known=event?.decisionReady && typeof event.riskScore==="number";
 const level=event?.riskLevel||"UNKNOWN";
 return <div className="risk-card">
  <div className="card-kicker"><span>FIELD RISK</span><ShieldCheck size={18}/></div>
  <div className="risk-main"><div><div className={`risk-number ${known?`risk-${String(level).toLowerCase()}`:"unknown"}`}>{known?Math.round(event.riskScore):"—"}</div><div className="risk-denom">/ 100</div></div>{known?<Badge level={level}>{level}</Badge>:<Badge>UNKNOWN</Badge>}</div>
  <div className="risk-track"><span style={{width:known?`${Math.max(0,Math.min(100,event.riskScore))}%`:"0%"}}/></div>
  <div className="risk-scale"><span>LOW</span><span>MODERATE</span><span>HIGH</span><span>CRITICAL</span></div>
  <p>{known?"CRAI has enough evidence to show a current risk state.":"CRAI needs fresh evidence before making a protective risk decision."}</p>
  <button className="text-action" onClick={onOpen || undefined}>View assessment <ArrowRight size={15}/></button>
 </div>
}
