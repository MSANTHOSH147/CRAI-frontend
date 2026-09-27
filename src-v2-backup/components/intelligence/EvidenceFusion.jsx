import { Camera, CloudSun, History, MapPinned } from "lucide-react";

const SOURCES = [
  { key: "visual", label: "Visual", icon: Camera },
  { key: "environmental", label: "Environmental", icon: CloudSun },
  { key: "temporal", label: "Temporal", icon: History },
  { key: "spatial", label: "Spatial", icon: MapPinned },
];

export default function EvidenceFusion({ evidence }) {
  return (
    <div className="crai-fusion-grid">
      {SOURCES.map(({ key, label, icon: Icon }) => {
        const src = evidence?.[key];
        const available = src?.available;
        const confidence = typeof src?.confidence === "number" ? src.confidence : null;
        return (
          <div className="crai-fusion-card" key={key}>
            <div className="crai-fusion-card__head">
              <span className="crai-fusion-card__title"><Icon size={15} /> {label}</span>
              <span className={`crai-status-dot crai-status-dot--${available ? "good" : "unknown"}`} />
            </div>
            <span className="crai-muted">
              {available ? (src.summary || "Evidence available") : "No current evidence"}
            </span>
            <div className="crai-fusion-bar">
              <div
                className="crai-fusion-bar__fill"
                style={{ width: confidence !== null ? `${Math.round(confidence * 100)}%` : "0%" }}
              />
            </div>
            <span className="crai-muted" style={{ fontSize: 11.5 }}>
              {confidence !== null ? `${Math.round(confidence * 100)}% confidence` : "Confidence unknown"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
