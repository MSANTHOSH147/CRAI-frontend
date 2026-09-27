import React from "react";
import { Sprout, MonitorCog, PlayCircle } from "lucide-react";
import { navigate, getRoute } from "../../app/routes";

export default function ModeSwitcher({ compact = false }) {
  const route = getRoute();
  const mode = route.name === "expert" ? "expert" : route.name === "demo" ? "demo" : "farmer";
  const items = [
    ["farmer", "Farmer", Sprout, "/"],
    ["expert", "Expert", MonitorCog, "/expert"],
    ["demo", "Demo", PlayCircle, "/demo"],
  ];
  return (
    <div className={compact ? "mode-switcher compact" : "mode-switcher"}>
      {items.map(([id, label, Icon, path]) => (
        <button key={id} className={mode === id ? "mode-btn active" : "mode-btn"} onClick={() => navigate(path)}>
          <Icon size={16} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
