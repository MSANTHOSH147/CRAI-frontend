import { NavLink } from "react-router-dom";
import { useLanguage } from "../../app/LanguageContext";

const navigation = [
  {
    section: "farmer",
    items: [
      {
        path: "/",
        key: "home",
        icon: "⌂",
      },
      {
        path: "/fields",
        key: "fields",
        icon: "▦",
      },
      {
        path: "/check",
        key: "checkCrop",
        icon: "⌕",
      },
      {
        path: "/alerts",
        key: "alerts",
        icon: "!",
      },
      {
        path: "/ask-crai",
        key: "askCrai",
        icon: "◌",
      },
    ],
  },
  {
    section: "intelligence",
    items: [
      {
        path: "/expert",
        key: "expert",
        icon: "◇",
      },
      {
        path: "/settings",
        key: "settings",
        icon: "⚙",
      },
    ],
  },
];

function sectionLabel(section, language) {
  if (section === "farmer") {
    return language === "ta"
      ? "விவசாயி"
      : "FARMER";
  }

  return language === "ta"
    ? "நுண்ணறிவு"
    : "INTELLIGENCE";
}

export default function Sidebar({
  mobile = false,
  onNavigate,
}) {
  const {
    language,
    t,
  } = useLanguage();

  function handleNavigation() {
    if (onNavigate) {
      onNavigate();
    }
  }

  return (
    <aside
      className={`cr-sidebar ${
        mobile ? "cr-sidebar-mobile" : ""
      }`}
    >
      {/* Brand */}
      <div className="cr-sidebar-brand">
        <div className="cr-sidebar-logo">
          C
        </div>

        <div className="cr-sidebar-brand-copy">
          <strong>CRAI</strong>

          <span>
            {language === "ta"
              ? "பயிர் அபாய நுண்ணறிவு"
              : "Crop Risk & Adaptive Intelligence"}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="cr-sidebar-nav">
        {navigation.map((group) => (
          <div
            className="cr-sidebar-group"
            key={group.section}
          >
            <span className="cr-sidebar-section">
              {sectionLabel(
                group.section,
                language
              )}
            </span>

            <div className="cr-sidebar-links">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={handleNavigation}
                  className={({ isActive }) =>
                    `cr-sidebar-link ${
                      isActive
                        ? "active"
                        : ""
                    }`
                  }
                >
                  <span className="cr-sidebar-icon">
                    {item.icon}
                  </span>

                  <span>
                    {t(item.key)}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Authority footer */}
      <div className="cr-sidebar-footer">
        <div className="cr-sidebar-footer-dot" />

        <div>
          <strong>
            {language === "ta"
              ? "Backend அதிகாரப்பூர்வம்"
              : "Backend authoritative"}
          </strong>

          <span>
            {language === "ta"
              ? "Risk frontend-ல் கணக்கிடப்படாது"
              : "Risk is not calculated in frontend"}
          </span>
        </div>
      </div>

      <style>{`
        .cr-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 40;
          width: 218px;
          display: flex;
          flex-direction: column;
          padding: 17px 12px 13px;
          border-right: 1px solid #dfe7e1;
          background: #ffffff;
        }

        .cr-sidebar-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 2px 5px 19px;
          border-bottom: 1px solid #edf1ee;
        }

        .cr-sidebar-logo {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 8px;
          background: #145a45;
          color: #ffffff;
          font-size: 13px;
          font-weight: 900;
        }

        .cr-sidebar-brand-copy {
          min-width: 0;
        }

        .cr-sidebar-brand-copy strong {
          display: block;
          color: #17201c;
          font-size: 14px;
          line-height: 1;
          letter-spacing: .02em;
        }

        .cr-sidebar-brand-copy span {
          display: block;
          margin-top: 4px;
          color: #8a958f;
          font-size: 7px;
          line-height: 1.35;
        }

        .cr-sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 17px 0;
        }

        .cr-sidebar-group + .cr-sidebar-group {
          margin-top: 19px;
        }

        .cr-sidebar-section {
          display: block;
          padding: 0 9px 6px;
          color: #a0aaa4;
          font-size: 7px;
          font-weight: 850;
          letter-spacing: .12em;
        }

        .cr-sidebar-links {
          display: grid;
          gap: 2px;
        }

        .cr-sidebar-link {
          min-height: 38px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 9px;
          border-radius: 8px;
          color: #65736c;
          text-decoration: none;
          font-size: 10px;
          font-weight: 700;
          transition:
            background .16s ease,
            color .16s ease;
        }

        .cr-sidebar-link:hover {
          background: #f4f7f5;
          color: #145a45;
        }

        .cr-sidebar-link.active {
          background: #edf7f1;
          color: #145a45;
          font-weight: 850;
        }

        .cr-sidebar-icon {
          width: 20px;
          height: 20px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 5px;
          background: #f4f7f5;
          color: #738079;
          font-size: 10px;
          font-weight: 850;
        }

        .cr-sidebar-link.active
          .cr-sidebar-icon {
          background: #dcefe5;
          color: #145a45;
        }

        .cr-sidebar-footer {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          padding: 9px;
          border: 1px solid #e2e9e4;
          border-radius: 8px;
          background: #fafcfb;
        }

        .cr-sidebar-footer-dot {
          width: 7px;
          height: 7px;
          margin-top: 3px;
          flex: 0 0 auto;
          border-radius: 50%;
          background: #4e9b77;
        }

        .cr-sidebar-footer strong {
          display: block;
          color: #4b6257;
          font-size: 8px;
        }

        .cr-sidebar-footer span {
          display: block;
          margin-top: 3px;
          color: #929c97;
          font-size: 7px;
          line-height: 1.35;
        }

        .cr-sidebar-mobile {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 100%;
          border: 0;
          box-shadow: none;
        }

        .cr-sidebar-mobile .cr-sidebar-nav {
          padding-bottom: 15px;
        }

        @media (max-width: 900px) {
          .cr-sidebar:not(.cr-sidebar-mobile) {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cr-sidebar-link {
            transition: none;
          }
        }
      `}</style>
    </aside>
  );
}