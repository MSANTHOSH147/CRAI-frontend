import React from "react";
import { AlertTriangle, CheckCircle2, Clock3, Info, Radio } from "lucide-react";

const icon = { HIGH: AlertTriangle, CRITICAL: AlertTriangle, STALE: Clock3, RECOVERING: Radio, RESOLVED: CheckCircle2 };

export default function Alerts({ events = [] }) {
  return (
    <div className="alert-list">
      {events.length === 0 ? (
        <div className="empty-state"><Info size={22} /><strong>No field alerts</strong><span>CRAI has no recent event records to show.</span></div>
      ) : events.map((event) => {
        const key = event.status === "RECOVERING" ? "RECOVERING" : event.riskLevel;
        const Icon = icon[key] || Info;
        return (
          <article className={`alert-item tone-${event.riskLevel?.toLowerCase() || "unknown"}`} key={event.eventId}>
            <div className="alert-icon"><Icon size={18} /></div>
            <div><strong>{event.riskLevel || "FIELD UPDATE"}</strong><p>{event.message || "A field event was recorded."}</p><small>{event.status || "UNKNOWN"}</small></div>
          </article>
        );
      })}
    </div>
  );
}
