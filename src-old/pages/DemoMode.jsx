import React from "react";
import { BadgeCheck, Sparkles } from "lucide-react";
import DemoController from "../components/demo/DemoController";
import DemoStep from "../components/demo/DemoStep";
import EvidenceJourney from "../components/demo/EvidenceJourney";
import { DEMO_STEPS } from "../services/demoData";

export default function DemoMode() {
  const [step, setStep] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  return (
    <div className="page demo-page">
      <div className="demo-header">
        <div><span className="eyebrow">SIH PRESENTATION LOOP</span><h1>CRAI — Autonomous Evidence Journey</h1><p>From uncertain observation to evidence-backed action.</p></div>
        <span className="demo-badge"><Sparkles size={15} /> DEMO SCENARIO</span>
      </div>
      <EvidenceJourney active={step} />
      <div className="demo-progress"><span style={{ width: `${((step + 1) / DEMO_STEPS.length) * 100}%` }} /></div>
      <DemoStep stepIndex={step} />
      <DemoController playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={DEMO_STEPS.length} />
      <div className="demo-footer"><BadgeCheck size={16} /> Demonstration data is isolated from production field data.</div>
    </div>
  );
}
