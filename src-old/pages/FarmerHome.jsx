import React from "react";
import { ArrowRight, CloudSun, RefreshCw, ShieldCheck } from "lucide-react";
import FieldStatus from "../components/farmer/FieldStatus";
import EvidenceSummary from "../components/farmer/EvidenceSummary";
import RecommendationCard from "../components/farmer/RecommendationCard";
import { fetchDashboardData } from "../services/craiData";
import { navigate } from "../app/routes";

export default function FarmerHome() {
  const [data, setData] = React.useState({ loading: true, event: null, evidence: {}, events: [], error: null });
  const load = React.useCallback(async () => {
    setData((d) => ({ ...d, loading: true, error: null }));
    try { setData({ loading: false, ...(await fetchDashboardData()), error: null }); }
    catch (e) { setData({ loading: false, event: null, evidence: {}, events: [], error: e.message }); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  if (data.loading) return <PageState label="Loading field intelligence..." />;
  return (
    <div className="page">
      <div className="page-intro">
        <div><span className="eyebrow">FARMER HOME</span><h1>Good morning, Farmer 👋</h1><p>Here's what is happening in your field.</p></div>
        <button className="secondary-action" onClick={load}><RefreshCw size={16} /> Refresh</button>
      </div>

      {data.error && <div className="system-banner error">CRAI intelligence service is unavailable. <button onClick={load}>Retry</button></div>}

      <div className="farmer-grid">
        <FieldStatus event={data.event} />
        <section className="weather-card">
          <div className="weather-icon"><CloudSun size={31} /></div>
          <div><span className="eyebrow">FIELD CONTEXT</span><h2>Live context</h2><p>Environmental details are shown only when fresh evidence is available.</p></div>
          <div className="context-row"><span>Sensor status</span><strong>{data.event?.sensorStatus || "NOT AVAILABLE"}</strong></div>
        </section>
      </div>

      <EvidenceSummary evidence={data.evidence} />

      <RecommendationCard
        recommendation={data.recommendation}
        onCollect={() => navigate("/demo")}
      />

      <section className="section-block">
        <div className="section-heading"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>What changed</h2></div><button className="text-button" onClick={() => navigate("/alerts")}>View alerts <ArrowRight size={15} /></button></div>
        {data.events.length ? (
          <div className="activity-list">{data.events.slice(0, 4).map((e) => <div className="activity-row" key={e.eventId}><ShieldCheck size={17} /><div><strong>{e.message || `${e.riskLevel || "Field"} event recorded`}</strong><small>{e.status || "UNKNOWN"} · {e.updatedAt ? new Date(e.updatedAt).toLocaleString() : "Time unavailable"}</small></div></div>)}</div>
        ) : <div className="empty-state"><ShieldCheck size={22} /><strong>No recent events</strong><span>CRAI has not received a field event yet.</span></div>}
      </section>
    </div>
  );
}

function PageState({ label }) {
  return <div className="page-state"><div className="loader" /><span>{label}</span></div>;
}
