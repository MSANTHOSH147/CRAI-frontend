import { useState } from "react";
import { Link } from "react-router-dom";
import { BellOff } from "lucide-react";
import { useCraiData } from "../hooks/useCraiData.js";
import { fetchAlerts } from "../services/craiData.js";
import Skeleton from "../components/common/Skeleton.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import Button from "../components/common/Button.jsx";

const BAR_CLASS = { critical: "critical", high: "high", moderate: "moderate", info: "info" };

function AlertItem({ alert }) {
  const [showWhy, setShowWhy] = useState(false);
  const bar = BAR_CLASS[alert.severity] || "info";
  return (
    <div className="crai-alert">
      <div className={`crai-alert__bar crai-alert__bar--${bar}`} />
      <div className="crai-alert__body">
        <div className="crai-alert__head">
          <div>
            <div className="crai-title-md">{alert.title}</div>
            <div className="crai-muted">{alert.fieldName || "Field"} · {alert.createdAt || "recently"}</div>
          </div>
        </div>
        <p className="crai-body crai-mt-8">{alert.body || "CRAI recorded this alert from current field evidence."}</p>
        {showWhy && (
          <p className="crai-muted crai-mt-8">
            This alert was raised from the evidence fusion pipeline. Open the event's evidence package for the full decision trace.
          </p>
        )}
        <div className="crai-alert__actions">
          {alert.eventId && (
            <Button as={Link} to={`/evidence/${alert.eventId}`} variant="primary" size="sm">View assessment</Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setShowWhy((v) => !v)}>Why?</Button>
        </div>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const { data: alerts, status } = useCraiData(fetchAlerts, []);

  return (
    <div className="crai-fade-in">
      <h1 className="crai-title-xl">Alerts</h1>
      <p className="crai-body crai-mt-4">Everything CRAI wants you to know about your fields.</p>

      <div className="crai-section crai-flex-col crai-gap-12">
        {status === "loading" && [0, 1, 2].map((i) => <Skeleton key={i} height={110} radius={16} />)}

        {status === "success" && alerts.length === 0 && (
          <EmptyState icon={BellOff} title="No active alerts" body="Your fields currently have no active risk events." />
        )}

        {status === "success" && alerts.map((a) => <AlertItem key={a.id} alert={a} />)}

        {status === "error" && (
          <EmptyState title="CRAI intelligence is temporarily unavailable" body="Alerts couldn't be loaded right now." />
        )}
      </div>
    </div>
  );
}
