import {
  Bell,
  BrainCircuit,
  Camera,
  Home,
  Leaf,
  MessageCircle,
  Settings,
  Sprout,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useLanguage } from "../../app/LanguageContext";

const items = [
  { path: "/", key: "home", icon: Home },
  { path: "/fields", key: "fields", icon: Sprout },
  { path: "/check", key: "checkCrop", icon: Camera },
  { path: "/alerts", key: "alerts", icon: Bell },
  { path: "/ask-crai", key: "askCrai", icon: MessageCircle },
  { path: "/expert", key: "expert", icon: BrainCircuit },
  { path: "/settings", key: "settings", icon: Settings },
];

export default function Sidebar({
  mobile = false,
  onNavigate,
}) {
  const { t } = useLanguage();

  if (mobile) {
    return (
      <div className="crai-sidebar-mobile">
        <div className="crai-mobile-brand">
          <div className="crai-brand-mark">
            <Leaf size={18} />
          </div>

          <div>
            <strong>CRAI</strong>
            <span>
              Crop Risk & Adaptive Intelligence
            </span>
          </div>
        </div>

        <nav className="crai-mobile-menu">
          {items.map(item => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={onNavigate}
                className={({ isActive }) =>
                  isActive
                    ? "is-active"
                    : ""
                }
              >
                <Icon size={17} />
                <span>{t(item.key)}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <aside className="crai-sidebar-rail">

      <div className="crai-rail-brand">
        <div className="crai-brand-mark">
          <Leaf size={19} />
        </div>
      </div>

      <nav className="crai-rail-nav">
        {items.map(item => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `crai-rail-item ${
                  isActive ? "is-active" : ""
                }`
              }
              title={t(item.key)}
            >
              <Icon size={18} />
            </NavLink>
          );
        })}
      </nav>

      <div className="crai-rail-bottom">
        <span className="crai-rail-online" />
      </div>

    </aside>
  );
}
