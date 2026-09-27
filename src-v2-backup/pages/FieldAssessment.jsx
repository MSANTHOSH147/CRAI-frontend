import { useParams } from "react-router-dom";
import { useCraiData } from "../hooks/useCraiData.js";
import { fetchFieldDetail, fetchCurrentEvent } from "../services/craiData.js";

import Card from "../components/common/Card.jsx";
import Badge from "../components/common/Badge.jsx";
import Skeleton from "../components/common/Skeleton.jsx";
import SectionHeader from "../components/common/SectionHeader.jsx";
import RiskGauge from "../components/intelligence/RiskGauge.jsx";
import SensorStatus from "../components/intelligence/SensorStatus.jsx";
import EventLifecycle from "../components/intelligence/EventLifecycle.jsx";
import { Layers, Locate, Plus, Minus } from "lucide-react";

export default function FieldAssessment() {
  const { id } = useParams();
  const { data: field, status: fieldStatus } = useCraiData(({ signal }) => fetchFieldDetail(id, { signal }), [id]);
  const { data: event, status: eventStatus } = useCraiData(
    ({ signal }) => fetchCurrentEvent(id, field?.zone || "default", { signal }),
    [id, field?.zone]
  );

  const loading = fieldStatus === "loading";

  return (
    <div className="crai-fade-in">
      {loading ? (
        <Skeleton height={40} width={220} />
      ) : (
        <>
          <div className="crai-flex crai-items-center crai-justify-between" style={{ flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 className="crai-title-xl">{field?.name || "Field"}</h1>
              <p className="crai-body">{field?.crop || "Crop not set"}{field?.zone ? ` · ${field.zone}` : ""}</p>
            </div>
            <Badge level={event?.riskLevel}>{event?.riskLevel || "Unknown"}</Badge>
          </div>
        </>
      )}

      <div className="crai-section">
        <div className="crai-map">
          {field?.imageUrl ? <img className="crai-map__img" src={field.imageUrl} alt="" /> : null}
          <div className="crai-map__controls">
            <button className="crai-map__ctrl" type="button"><Plus size={16} /></button>
            <button className="crai-map__ctrl" type="button"><Minus size={16} /></button>
            <button className="crai-map__ctrl" type="button"><Locate size={16} /></button>
            <button className="crai-map__ctrl" type="button"><Layers size={16} /></button>
          </div>
          <span className="crai-map__note">
            {field?.imageUrl ? "Field imagery" : "Live map integration not connected — showing placeholder"}
          </span>
        </div>
      </div>

      <div className="crai-section">
        <div className="crai-grid crai-grid--2">
          <Card>
            <div className="crai-eyebrow">Field risk</div>
            <RiskGauge score={event?.riskScore} level={event?.riskLevel} decisionReady={event?.decisionReady} />
          </Card>
          <Card>
            <div className="crai-eyebrow crai-mt-4">Current conditions</div>
            <div className="crai-mt-12">
              <SensorStatus sensors={event?.sensors} />
            </div>
          </Card>
        </div>
      </div>

      <div className="crai-section">
        <SectionHeader eyebrow="Lifecycle" title="Event lifecycle" />
        <Card>
          {eventStatus === "loading" ? (
            <Skeleton height={80} radius={16} />
          ) : (
            <EventLifecycle stages={event?.lifecycle?.stages || []} />
          )}
        </Card>
      </div>

      <div className="crai-section">
        <SectionHeader eyebrow="Guidance" title="AI recommendation" />
        <Card>
          <p className="crai-body">
            {event?.action?.recommendation || "CRAI has not generated a recommendation yet — more evidence is needed."}
          </p>
        </Card>
      </div>
    </div>
  );
}
