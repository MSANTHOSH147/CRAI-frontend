import React from "react";
import RiskGauge from "../components/intelligence/RiskGauge";
import EventLifecycle from "../components/intelligence/EventLifecycle";
import EvidenceFusion from "../components/intelligence/EvidenceFusion";
import DecisionTrace from "../components/intelligence/DecisionTrace";
import EvidenceSummary from "../components/farmer/EvidenceSummary";
import RecommendationCard from "../components/farmer/RecommendationCard";
import { fetchEventAssessment } from "../services/craiData";
import { getRoute, navigate } from "../app/routes";

export default function FieldAssessment({ fieldId }) {
  const id = fieldId || getRoute().id;
  const [state, setState] = React.useState({ loading: true, event: null, evidence: {}, trace: [], recommendation: null, error: null });

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try { const result = await fetchEventAssessment(id); if (alive) setState({ loading: false, ...result, error: null }); }
      catch (e) { if (alive) setState((s) => ({ ...s, loading: false, error: e.message })); }
    })();
    return () => { alive = false; };
  }, [id]);

  if (state.loading) return <div className="page-state"><div className="loader" /><span>Loading assessment...</span></div>;
  if (!state.event) return <div className="page"><div className="empty-state"><h2>No assessment available</h2><p>CRAI does not have a field event record for this selection.</p><button className="primary-action" onClick={() => navigate("/fields")}>Back to fields</button></div></div>;

  return (
    <div className="page">
      <div className="page-intro">
        <div><button className="back-link" onClick={() => navigate("/fields")}>← My fields</button><span className="eyebrow">FIELD ASSESSMENT</span><h1>{state.event.crop || "Field assessment"}</h1><p>Event {state.event.eventId}</p></div>
      </div>

      <div className="expert-top-grid">
        <RiskGauge score={state.event.riskScore} level={state.event.riskLevel} />
        <EventLifecycle status={state.event.status} phase={state.event.phase} />
      </div>

      <EvidenceSummary evidence={state.evidence} />
      <div className="two-col">
        <EvidenceFusion evidence={state.evidence} riskScore={state.event.riskScore} />
        <RecommendationCard recommendation={state.recommendation} onCollect={() => navigate("/demo")} />
      </div>
      <DecisionTrace steps={state.trace} />
    </div>
  );
}
