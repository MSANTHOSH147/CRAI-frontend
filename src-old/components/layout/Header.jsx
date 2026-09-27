import React from "react";
import { Bell, ChevronDown, Leaf, Menu, Languages } from "lucide-react";
import { navigate } from "../../app/routes";
import { useLanguage } from "../../services/craiData";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <header className="crai-header">
      <div className="header-left">
        <button className="icon-button mobile-only" aria-label="Open navigation">
          <Menu size={20} />
        </button>
        <button className="brand-inline" onClick={() => navigate("/")}>
          <span className="brand-dot"><Leaf size={17} /></span>
          <span>
            <strong>CRAI</strong>
            <small>Crop Risk & Adaptive Intelligence</small>
          </span>
        </button>
      </div>

      <div className="header-right">
        <button
          className="language-button"
          onClick={() => setLanguage(language === "en" ? "ta" : "en")}
          aria-label={language === "en" ? "Switch to Tamil" : "Switch to English"}
        >
          <Languages size={17} />
          {language === "en" ? "தமிழ்" : "English"}
        </button>
        <button className="farm-selector" aria-label="Selected field">
          <span className="status-dot" />
          <span>
            <strong>{t("farm")}</strong>
            <small>Zone A1</small>
          </span>
          <ChevronDown size={16} />
        </button>
        <button className="icon-button notification-button" onClick={() => navigate("/alerts")} aria-label="Alerts">
          <Bell size={19} />
          <span className="notification-dot" />
        </button>
      </div>
    </header>
  );
}
