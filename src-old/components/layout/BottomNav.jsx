import React from "react";
import { Home, Sprout, Bell, MessageCircle, UserRound } from "lucide-react";
import { navigate, getRoute } from "../../app/routes";

export default function BottomNav() {
  const route = getRoute();
  const items = [
    ["/", "Home", Home],
    ["/fields", "Fields", Sprout],
    ["/alerts", "Alerts", Bell],
    ["/ask-crai", "Ask CRAI", MessageCircle],
    ["/settings", "Profile", UserRound],
  ];
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {items.map(([path, label, Icon]) => {
        const active =
          (path === "/" && route.name === "home") ||
          (path === "/fields" && (route.name === "fields" || route.name === "field")) ||
          (path === "/alerts" && route.name === "alerts") ||
          (path === "/ask-crai" && route.name === "ask") ||
          (path === "/settings" && route.name === "settings");
        return (
          <button key={path} className={active ? "bottom-nav-item active" : "bottom-nav-item"} onClick={() => navigate(path)}>
            <Icon size={19} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
