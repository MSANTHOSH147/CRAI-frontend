import {Clock3,ArrowUpRight} from "lucide-react";
import {Link} from "react-router-dom";
export default function RecentActivity({events=[]}){
 if(!events.length) return <div className="activity-empty"><Clock3 size={20}/><div><b>No recent field activity</b><span>CRAI hasn't received an event for this zone yet.</span></div></div>;
 return <div className="activity-list">{events.slice(0,5).map(e=><Link key={e.eventId} to={`/evidence/${e.eventId}`} className="activity-row">
   <div className={`activity-dot ${String(e.riskLevel||"").toLowerCase()}`}/><div className="activity-copy"><b>{e.riskLevel?`${e.riskLevel} field risk`:"Field event"}</b><span>{e.status||"Recorded"} · {e.zoneName||"Zone"}</span></div><div className="activity-score">{e.riskScore!=null?Math.round(e.riskScore):"—"}<ArrowUpRight size={15}/></div>
 </Link>)}</div>
}
