import React from "react";
import RiskGauge from "../components/intelligence/RiskGauge";
import EventLifecycle from "../components/intelligence/EventLifecycle";
import EvidenceFusion from "../components/intelligence/EvidenceFusion";
import DecisionTrace from "../components/intelligence/DecisionTrace";
import { fetchDashboardData, getSupabaseStatus } from "../services/craiData";
import { Database, Fingerprint, Radio, RefreshCw } from "lucide-react";

export default function ExpertConsole() {
  const [data, setData] = React.useState({ loading: true, event: null, evidence: {}, trace: [], events: [] });
  const [supabase, setSupabase] = React.useState(null);
  const load = React.useCallback(async () => {
    setData((d) => ({ ...d, loading: true }));
    try { setData({ loading: false, ...(await fetchDashboardData()) }); } catch { setData({ loading: false, event: null, evidence: {}, trace: [], events: [] }); }
  }, []);
  React.useEffect(() => { load(); getSupabaseStatus().then(setSupabase).catch(() => setSupabase(null)); }, [load]);

  const e = data.event;
  return (
    <div className="page expert-page">
      <div className="page-intro expert-intro">
        <div><span className="eyebrow">EXPERT / SIH CONSOLE</span><h1>CRAI intelligence workspace</h1><p>Technical evidence, lifecycle and audit state without hiding the farmer-facing meaning.</p></div>
        <button className="secondary-action" onClick={load}><RefreshCw size={16} /> Refresh</button>
      </div>

      <div className="system-banner success"><span className="status-dot" /> CRAI intelligence online <span className="banner-separator" /> Supabase {supabase?.status || "checking"}</div>

      <div className="expert-top-grid">
        <RiskGauge score={e?.riskScore} level={e?.riskLevel} />
        <EventLifecycle status={e?.status} phase={e?.phase} />
        <div className="expert-metrics card">
          <div className="metric"><Radio size={17} /><span>Sensor state</span><strong>{e?.sensorStatus || "UNKNOWN"}</strong></div>
          <div className="metric"><Database size={17} /><span>Persistence</span><strong>{supabase?.rows_visible != null ? `${supabase.rows_visible} row(s)` : "UNKNOWN"}</strong></div>
          <div className="metric"><Fingerprint size={17} /><span>Integrity</span><strong>{e?.integrityHash ? "RECORDED" : "NOT AVAILABLE"}</strong></div>
        </div>
      </div>

      <div className="two-col">
        <EvidenceFusion evidence={data.evidence} riskScore={e?.riskScore} />
        <DecisionTrace steps={data.trace} />
      </div>

      <section className="card technical-card">
        <div className="section-heading"><div><span className="eyebrow">EVENT RECORD</span><h2>Technical evidence</h2></div></div>
        <div className="technical-grid">
          <KeyValue label="Event ID" value={e?.eventId} />
          <KeyValue label="Risk level" value={e?.riskLevel} />
          <KeyValue label="Status" value={e?.status} />
          <KeyValue label="Phase" value={e?.phase} />
          <KeyValue label="Risk score" value={e?.riskScore == null ? "UNKNOWN" : Number(e.riskScore).toFixed(2)} />
          <KeyValue label="Integrity hash" value={e?.integrityHash || "NOT AVAILABLE"} mono />
          <KeyValue label="Created" value={e?.createdAt ? new Date(e.createdAt).toLocaleString() : "NOT AVAILABLE"} />
          <KeyValue label="Updated" value={e?.updatedAt ? new Date(e.updatedAt).toLocaleString() : "NOT AVAILABLE"} />
        </div>
      </section>
    </div>
  );
}
function KeyValue({ label, value, mono }) {
  return <div className="key-value"><span>{label}</span><strong className={mono ? "mono" : ""}>{value || "UNKNOWN"}</strong></div>;
}
