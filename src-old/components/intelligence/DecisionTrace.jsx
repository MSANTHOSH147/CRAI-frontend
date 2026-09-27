import React from "react";
import { CheckCircle2, CircleDashed, Database, Radio, ShieldCheck } from "lucide-react";

export default function DecisionTrace({ steps = [] }) {
  const icons = [CircleDashed, Radio, Database, ShieldCheck];
  return (
    <section className="trace-card">
      <div className="section-heading"><div><span className="eyebrow">AUDIT PIPELINE</span><h2>Decision trace</h2></div><CheckCircle2 size={19} /></div>
      <div className="trace-list">
        {steps.length ? steps.map((step, i) => {
          const Icon = icons[i % icons.length];
          return <div className="trace-item" key={`${step.timestamp || i}-${i}`}><div className="trace-icon"><Icon size={16} /></div><div><strong>{step.title}</strong><p>{step.description}</p>{step.timestamp && <small>{new Date(step.timestamp).toLocaleString()}</small>}</div></div>;
        }) : <div className="empty-inline">Decision trace is not available for this record.</div>}
      </div>
    </section>
  );
}
