import {
  Bell,
  Camera,
  Home,
  Map,
  MessageCircle,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useLanguage } from "../../app/LanguageContext";

const items = [
  {
    path: "/",
    key: "home",
    icon: Home,
  },
  {
    path: "/fields",
    key: "fields",
    icon: Map,
  },
  {
    path: "/check",
    key: "checkCrop",
    icon: Camera,
    primary: true,
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

export default function MobileBottomNav() {
  const { t } = useLanguage();

  return (
    <nav className="crai-mobile-nav">
      {items.map(item => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `crai-mobile-nav-item ${
                isActive ? "is-active" : ""
              } ${
                item.primary ? "primary" : ""
              }`
            }
          >
            <Icon size={18} strokeWidth={1.9} />
            <span>{t(item.key)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
