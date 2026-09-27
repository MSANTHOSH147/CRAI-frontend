import React from "react";
import { ArrowDown, CheckCircle2, Radio, Search, ShieldCheck, Sprout } from "lucide-react";
import { DEMO_STEPS } from "../../services/demoData";

const icons = [Search, Sprout, Radio, Radio, ShieldCheck, ShieldCheck, Sprout, Radio, CheckCircle2];

export default function DemoStep({ stepIndex }) {
  const step = DEMO_STEPS[stepIndex];
  const Icon = icons[stepIndex] || Sprout;
  return (
    <section className="demo-stage">
      <div className="demo-step-meta">STEP {String(stepIndex + 1).padStart(2, "0")} / {DEMO_STEPS.length}</div>
      <div className="demo-step-icon"><Icon size={28} /></div>
      <span className="eyebrow">{step.kicker}</span>
      <h1>{step.title}</h1>
      <p className="demo-lead">{step.description}</p>
      <div className="demo-detail-grid">
        {step.details.map((d, i) => (
          <div className="demo-detail" key={i}><strong>{d.label}</strong><span>{d.value}</span></div>
        ))}
      </div>
      <div className="demo-principle">{step.quote}</div>
      {stepIndex < DEMO_STEPS.length - 1 && <div className="demo-down"><ArrowDown size={18} /></div>}
    </section>
  );
}
