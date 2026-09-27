import { NavLink } from "react-router-dom";
import { useLanguage } from "../../app/LanguageContext";

const items = [
  {
    key: "home",
    path: "/",
    icon: "⌂",
    end: true,
  },
  {
    key: "fields",
    path: "/fields",
    icon: "▦",
  },
  {
    key: "checkCrop",
    path: "/check",
    icon: "＋",
  },
  {
    key: "alerts",
    path: "/alerts",
    icon: "!",
  },
  {
    key: "askCrai",
    path: "/ask-crai",
    icon: "✦",
  },
];

export default function MobileBottomNav() {
  const { t } = useLanguage();

  return (
    <nav
      className="cr-mobile-bottom-nav"
      aria-label="Mobile navigation"
    >
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            `cr-mobile-nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="cr-mobile-nav-icon" aria-hidden="true">
            {item.icon}
          </span>

          <span className="cr-mobile-nav-label">
            {t(item.key)}
          </span>
        </NavLink>
      ))}
    </nav>
  );
}