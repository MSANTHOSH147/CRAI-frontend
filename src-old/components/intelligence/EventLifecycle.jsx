import React from "react";
import { Check, Circle, RotateCcw, ShieldAlert } from "lucide-react";

const phases = ["BEFORE", "DURING", "RECOVERY", "AFTER", "RESOLVED"];

export default function EventLifecycle({ status, phase }) {
  const active = status === "RESOLVED" ? 4 : phase === "RECOVERY" || status === "RECOVERING" ? 2 : phase === "AFTER" ? 3 : status ? 1 : 0;
  return (
    <div className="lifecycle-card">
      <div className="section-heading compact-heading"><div><span className="eyebrow">EVENT LIFECYCLE</span><h2>Evidence progression</h2></div></div>
      <div className="lifecycle">
        {phases.map((p, i) => (
          <React.Fragment key={p}>
            <div className={`life-step ${i <= active ? "done" : ""} ${i === active ? "current" : ""}`}>
              <div className="life-dot">{i < active || status === "RESOLVED" && i < 4 ? <Check size={13} /> : i === active ? <ShieldAlert size={13} /> : <Circle size={9} />}</div>
              <span>{p}</span>
            </div>
            {i < phases.length - 1 && <div className={`life-line ${i < active ? "done" : ""}`} />}
          </React.Fragment>
        ))}
      </div>
      <p className="lifecycle-message">
        {status === "RESOLVED" ? "Evidence confirms that the event has recovered." :
         status === "RECOVERING" ? "Field conditions are improving. CRAI is continuing to monitor." :
         phase === "AFTER" ? "Post-event evidence is being recorded." :
         status ? "CRAI is tracking the active field event." :
         "No active event lifecycle is available."}
      </p>
    </div>
  );
}
