import { Menu, Settings, Wifi, WifiOff } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { useLanguage } from "../../app/LanguageContext";

const titles = {
  "/": "home",
  "/fields": "fields",
  "/check": "checkCrop",
  "/alerts": "alerts",
  "/ask-crai": "askCrai",
  "/expert": "expert",
  "/settings": "settings",
};

export default function Topbar({ onMenuClick }) {
  const { language, setLanguage, t } =
    useLanguage();

  const location = useLocation();

  const [backend, setBackend] =
    useState("checking");

  useEffect(() => {
    let active = true;

    async function checkBackend() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/health",
          {
            cache: "no-store",
          }
        );

        if (active) {
          setBackend(
            response.ok ? "online" : "offline"
          );
        }
      } catch {
        if (active) setBackend("offline");
      }
    }

    checkBackend();

    const timer = window.setInterval(
      checkBackend,
      30000
    );

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const title =
    titles[location.pathname] ||
    (location.pathname.startsWith("/field/")
      ? "checkCrop"
      : location.pathname.startsWith("/evidence/")
        ? "evidence"
        : "home");

  return (
    <header className="crai-topbar">
      <div className="crai-topbar-left">
        <button
          className="crai-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={19} />
        </button>

        <div className="crai-breadcrumb">
          <span>CRAI</span>
          <b>/</b>
          <strong>{t(title)}</strong>
        </div>
      </div>

      <div className="crai-topbar-right">
        <div className="crai-field-context">
          <span className="crai-field-context-dot" />
          <span>A1</span>
          <b>Tomato</b>
        </div>

        <div
          className={`crai-backend-status ${backend}`}
        >
          {backend === "offline" ? (
            <WifiOff size={13} />
          ) : (
            <Wifi size={13} />
          )}

          <span>
            {backend === "online"
              ? t("online")
              : backend === "offline"
                ? t("offline")
                : t("checking")}
          </span>
        </div>

        <div className="crai-language-switch">
          <button
            className={
              language === "en"
                ? "is-active"
                : ""
            }
            onClick={() => setLanguage("en")}
          >
            EN
          </button>

          <button
            className={
              language === "ta"
                ? "is-active"
                : ""
            }
            onClick={() => setLanguage("ta")}
          >
            தமிழ்
          </button>
        </div>

        <Link
          to="/settings"
          className="crai-settings-button"
          aria-label="Settings"
        >
          <Settings size={16} />
        </Link>
      </div>
    </header>
  );
}
