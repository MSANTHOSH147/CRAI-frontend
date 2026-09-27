import React from "react";
import { DEMO_STEPS } from "../../services/demoData";

export default function EvidenceJourney({ active }) {
  return (
    <div className="journey">
      {DEMO_STEPS.map((step, i) => (
        <React.Fragment key={step.id}>
          <button className={`journey-step ${i === active ? "active" : ""} ${i < active ? "done" : ""}`}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <strong>{step.short}</strong>
          </button>
          {i < DEMO_STEPS.length - 1 && <div className={`journey-line ${i < active ? "done" : ""}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}
