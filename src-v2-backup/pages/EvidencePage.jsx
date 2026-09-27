import { useParams } from "react-router-dom";
import { useState } from "react";
import { useCraiData } from "../hooks/useCraiData.js";
import { fetchEventDetail, fetchEvidencePackage } from "../services/craiData.js";

import Card from "../components/common/Card.jsx";
import Badge from "../components/common/Badge.jsx";
import Skeleton from "../components/common/Skeleton.jsx";
import EventLifecycle from "../components/intelligence/EventLifecycle.jsx";
import EvidenceFusion from "../components/intelligence/EvidenceFusion.jsx";

const TABS = ["Observation", "Sensors", "Evidence", "Lifecycle", "Risk", "Integrity"];

export default function EvidencePage() {
  const { id } = useParams();
  const [tab, setTab] = useState(TABS[0]);
  const { data: event, status } = useCraiData(({ signal }) => fetchEventDetail(id, { signal }), [id]);
  const { data: pkg } = useCraiData(({ signal }) => fetchEvidencePackage(id, { signal }), [id]);

  const loading = status === "loading";

  return (
    <div className="crai-fade-in">
      <div className="crai-flex crai-items-center crai-justify-between" style={{ flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="crai-title-xl">Evidence Package</h1>
          <p className="crai-body">Event {id}</p>
        </div>
        {loading ? <Skeleton width={90} height={26} radius={999} /> : <Badge level={event?.riskLevel}>{event?.riskLevel || "Unknown"}</Badge>}
      </div>

      <div className="crai-tabs crai-mt-16">
        {TABS.map((t) => (
          <div key={t} className={`crai-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)} role="button" tabIndex={0}>
            {t}
          </div>
        ))}
      </div>

      <Card>
        {loading && <Skeleton height={180} radius={12} />}

        {!loading && tab === "Observation" && (
          <>
            <div className="crai-kv"><span className="crai-kv__k">Field</span><span className="crai-kv__v">{event?.fieldName || "Unknown"}</span></div>
            <div className="crai-kv"><span className="crai-kv__k">Zone</span><span className="crai-kv__v">{event?.zoneName || "Unknown"}</span></div>
            <div className="crai-kv"><span className="crai-kv__k">Crop</span><span className="crai-kv__v">{event?.crop || "Not set"}</span></div>
            <div className="crai-kv"><span className="crai-kv__k">Created</span><span className="crai-kv__v">{event?.createdAt || "—"}</span></div>
          </>
        )}

        {!loading && tab === "Sensors" && (
          <>
            <div className="crai-kv"><span className="crai-kv__k">Temperature</span><span className="crai-kv__v">{event?.sensors?.temperature ?? "—"}</span></div>
            <div className="crai-kv"><span className="crai-kv__k">Humidity</span><span className="crai-kv__v">{event?.sensors?.humidity ?? "—"}</span></div>
            <div className="crai-kv"><span className="crai-kv__k">Soil moisture</span><span className="crai-kv__v">{event?.sensors?.soilMoisture ?? "—"}</span></div>
            <div className="crai-kv"><span className="crai-kv__k">Last reading</span><span className="crai-kv__v">{event?.sensors?.updatedAt || "—"}</span></div>
          </>
        )}

        {!loading && tab === "Evidence" && <EvidenceFusion evidence={event?.evidence} />}

        {!loading && tab === "Lifecycle" && <EventLifecycle stages={event?.lifecycle?.stages || []} />}

        {!loading && tab === "Risk" && (
          <>
            <div className="crai-kv"><span className="crai-kv__k">Risk score</span><span className="crai-kv__v">{event?.decisionReady ? event.riskScore : "Unknown"}</span></div>
            <div className="crai-kv"><span className="crai-kv__k">Risk level</span><span className="crai-kv__v">{event?.riskLevel || "Unknown"}</span></div>
            <div className="crai-kv"><span className="crai-kv__k">Decision ready</span><span className="crai-kv__v">{event?.decisionReady ? "Yes" : "No"}</span></div>
            <div className="crai-kv"><span className="crai-kv__k">Action</span><span className="crai-kv__v">{event?.action?.recommendation || "None yet"}</span></div>
          </>
        )}

        {!loading && tab === "Integrity" && (
          <>
            <div className="crai-kv"><span className="crai-kv__k">Event ID</span><span className="crai-kv__v mono">{event?.eventId}</span></div>
            <div className="crai-kv"><span className="crai-kv__k">Integrity hash</span><span className="crai-kv__v mono">{event?.integrity?.hash || "Not yet generated"}</span></div>
            <div className="crai-kv"><span className="crai-kv__k">Verified</span><span className="crai-kv__v">{event?.integrity?.verified ? "Yes" : "Unknown"}</span></div>
            <div className="crai-kv"><span className="crai-kv__k">Last updated</span><span className="crai-kv__v">{event?.updatedAt || "—"}</span></div>
          </>
        )}
      </Card>

      {pkg && (
        <p className="crai-muted crai-mt-12">
          Raw evidence package data is available via <code>fetchEvidencePackage()</code> for further technical review.
        </p>
      )}
    </div>
  );
}
