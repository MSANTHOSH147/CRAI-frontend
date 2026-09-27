import React from "react";
import { ShieldCheck } from "lucide-react";
import { riskLabel, riskTone } from "../../services/craiData";

export default function RiskGauge({ score, level }) {
  const value = score == null ? null : Math.max(0, Math.min(100, Number(score)));
  const resolvedLevel = riskLabel(value, level);
  const tone = riskTone(resolvedLevel);
  return (
    <div className={`risk-gauge-card tone-${tone}`}>
      <div className="gauge-header"><span className="eyebrow">CURRENT RISK</span><ShieldCheck size={19} /></div>
      <div className="gauge-value">{value == null ? "—" : value.toFixed(1)}</div>
      <div className="gauge-label">{resolvedLevel}</div>
      <div className="gauge-track"><span style={{ width: `${value ?? 0}%` }} /></div>
      <div className="gauge-scale"><span>LOW</span><span>MODERATE</span><span>HIGH</span><span>CRITICAL</span></div>
    </div>
  );
}
