import React from "react";
import { ArrowRight, Check, Leaf, Radio } from "lucide-react";

export default function RecommendationCard({ recommendation, onCollect }) {
  const insufficient = !recommendation?.ready;
  return (
    <section className={`recommendation-card ${insufficient ? "needs-evidence" : ""}`}>
      <div className="recommendation-icon"><Leaf size={21} /></div>
      <div className="recommendation-content">
        <span className="eyebrow">WHAT YOU SHOULD DO</span>
        <h2>{insufficient ? "Fresh evidence is needed" : recommendation.title || "Check your field"}</h2>
        <p>{recommendation?.message || "CRAI needs more evidence before giving a protective recommendation."}</p>
        {recommendation?.steps?.length > 0 && (
          <ul className="checklist">
            {recommendation.steps.map((step, i) => (
              <li key={i}><span className={step.done ? "check done" : "check"}>{step.done ? <Check size={13} /> : ""}</span>{step.text}</li>
            ))}
          </ul>
        )}
        <button className="primary-action" onClick={onCollect}>
          {insufficient ? <><Radio size={17} /> Collect fresh evidence</> : <>Start check <ArrowRight size={17} /></>}
        </button>
      </div>
    </section>
  );
}
