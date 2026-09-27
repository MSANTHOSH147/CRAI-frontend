import { NavLink } from "react-router-dom";
import {
  Bell,
  BrainCircuit,
  Camera,
  Home,
  Leaf,
  MessageCircle,
  Settings,
  Sprout,
  X,
} from "lucide-react";

import { useLanguage } from "../../app/LanguageContext";

const primary = [
  {
    path: "/",
    key: "home",
    icon: Home,
  },
  {
    path: "/fields",
    key: "fields",
    icon: Sprout,
  },
  {
    path: "/check",
    key: "checkCrop",
    icon: Camera,
  },
  {
    path: "/alerts",
    key: "alerts",
    icon: Bell,
  },
  {
    path: "/ask-crai",
    key: "askCrai",
    icon: MessageCircle,
  },
];

const secondary = [
  {
    path: "/expert",
    key: "expert",
    icon: BrainCircuit,
  },
  {
    path: "/settings",
    key: "settings",
    icon: Settings,
  },
];

export default function Sidebar({
  mobile = false,
  onNavigate,
}) {
  const { t } = useLanguage();

  function renderItem(item) {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.path === "/"}
        onClick={onNavigate}
        className={({ isActive }) =>
          `crai-nav-item ${
            isActive ? "is-active" : ""
          }`
        }
      >
        <Icon size={17} strokeWidth={1.8} />
        <span>{t(item.key)}</span>
      </NavLink>
    );
  }

  return (
    <div className={`crai-sidebar ${mobile ? "mobile" : ""}`}>
      {mobile && (
        <button
          className="crai-mobile-close"
          onClick={onNavigate}
          aria-label="Close navigation"
        >
          <X size={19} />
        </button>
      )}

      <div className="cr-logo-block">
        <div className="cr-logo-mark">
          <Leaf size={18} strokeWidth={2.2} />
        </div>

        <div>
          <strong>CRAI</strong>
          <span>Crop Risk & Adaptive Intelligence</span>
        </div>
      </div>

      <div className="cr-nav-section">
        <span className="cr-nav-section-title">
          {t("overview")}
        </span>

        <nav>
          {primary.map(renderItem)}
        </nav>
      </div>

      <div className="cr-nav-section">
        <span className="cr-nav-section-title">
          {t("intelligence")}
        </span>

        <nav>
          {secondary.map(renderItem)}
        </nav>
      </div>

      <div className="cr-sidebar-spacer" />

      <div className="cr-sidebar-status">
        <span className="cr-status-dot" />

        <div>
          <strong>{t("connected")}</strong>
          <span>FastAPI · CRAI Engine</span>
        </div>
      </div>
    </div>
  );
}
