import React from "react";
import { Activity, Camera, Droplets, MapPin, Thermometer, TrendingUp, WifiOff } from "lucide-react";

const iconMap = { visual: Camera, environment: Thermometer, temporal: TrendingUp, spatial: MapPin };

export default function EvidenceSummary({ evidence = {} }) {
  const cards = [
    ["visual", "Visual evidence", evidence.visual],
    ["environment", "Environment", evidence.environment],
    ["temporal", "Field trend", evidence.temporal],
    ["spatial", "Spatial context", evidence.spatial],
  ];

  return (
    <section className="section-block">
      <div className="section-heading">
        <div><span className="eyebrow">WHAT CRAI FOUND</span><h2>Evidence at a glance</h2></div>
      </div>
      <div className="evidence-grid">
        {cards.map(([key, title, item]) => {
          const Icon = iconMap[key] || Activity;
          const status = item?.status || "NOT AVAILABLE";
          return (
            <article className="evidence-card" key={key}>
              <div className="evidence-icon"><Icon size={19} /></div>
              <div className="evidence-card-main">
                <div className="evidence-title-row"><h3>{title}</h3><span className={`mini-status status-${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span></div>
                <p>{item?.summary || "More evidence is needed."}</p>
                {item?.detail && <span className="evidence-detail">{item.detail}</span>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
