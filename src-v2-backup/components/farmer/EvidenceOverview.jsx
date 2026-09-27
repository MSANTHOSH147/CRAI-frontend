import { Camera, CloudSun, TrendingUp, MapPinned } from "lucide-react";
import EvidenceCard from "../intelligence/EvidenceCard.jsx";

const LABELS = {
  visual: { title: "Visual", icon: Camera },
  environmental: { title: "Environment", icon: CloudSun },
  temporal: { title: "Field trend", icon: TrendingUp },
  spatial: { title: "Spatial context", icon: MapPinned },
};

export default function EvidenceOverview({ evidence }) {
  return (
    <div className="crai-grid crai-grid--4">
      {Object.entries(LABELS).map(([key, { title, icon }]) => {
        const src = evidence?.[key];
        return (
          <EvidenceCard
            key={key}
            icon={icon}
            title={title}
            tone={src?.available ? "ok" : "unknown"}
            status={src?.available ? (src.summary || "Evidence available") : "No current evidence"}
          />
        );
      })}
    </div>
  );
}
