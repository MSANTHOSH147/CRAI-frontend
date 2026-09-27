import React from "react";
import { Activity, Camera, Droplets, MapPin, Radio, TrendingUp } from "lucide-react";

export default function EvidenceFusion({ evidence = {}, riskScore }) {
  const sources = [
    ["Visual", Camera, evidence.visual],
    ["Environment", Droplets, evidence.environment],
    ["Temporal", TrendingUp, evidence.temporal],
    ["Spatial", MapPin, evidence.spatial],
  ];
  return (
    <section className="fusion-card">
      <div className="section-heading"><div><span className="eyebrow">INTELLIGENCE</span><h2>CRAI Evidence Fusion</h2></div><Radio size={19} /></div>
      <div className="fusion-flow">
        <div className="fusion-sources">
          {sources.map(([name, Icon, item]) => (
            <div className="fusion-source" key={name}>
              <div className="fusion-icon"><Icon size={17} /></div>
              <strong>{name}</strong>
              <span>{item?.status || "NOT AVAILABLE"}</span>
            </div>
          ))}
        </div>
        <div className="fusion-arrow">↓</div>
        <div className="fusion-core"><Activity size={20} /><strong>CRAI FUSION</strong><span>Evidence vectors combined</span></div>
        <div className="fusion-arrow">↓</div>
        <div className="fusion-result"><strong>RISK ENGINE</strong><span>{riskScore == null ? "Decision pending" : `${Number(riskScore).toFixed(1)} / 100`}</span></div>
      </div>
      <div className="fusion-note">Contribution breakdown is shown only when supplied by the intelligence backend.</div>
    </section>
  );
}
