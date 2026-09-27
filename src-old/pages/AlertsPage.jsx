import React from "react";
import Alerts from "../components/farmer/Alerts";
import { fetchEvents } from "../services/craiData";

export default function AlertsPage() {
  const [state, setState] = React.useState({ loading: true, events: [], error: null });
  React.useEffect(() => {
    fetchEvents().then((events) => setState({ loading: false, events, error: null })).catch((e) => setState({ loading: false, events: [], error: e.message }));
  }, []);
  return (
    <div className="page narrow-page">
      <div className="page-intro"><div><span className="eyebrow">FARM ALERTS</span><h1>Alerts & field updates</h1><p>Only meaningful CRAI events are shown here.</p></div></div>
      {state.error && <div className="system-banner error">Live field data is temporarily unavailable.</div>}
      {state.loading ? <div className="page-state"><div className="loader" /><span>Loading alerts...</span></div> : <Alerts events={state.events} />}
    </div>
  );
}
