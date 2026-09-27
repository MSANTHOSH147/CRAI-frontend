import {
  Bell,
  Menu,
  Wifi,
  WifiOff,
} from "lucide-react";

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

export default function Topbar({
  onMenuClick,
}) {
  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  const location = useLocation();

  const [backend, setBackend] =
    useState("checking");

  useEffect(() => {
    let alive = true;

    async function check() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/health",
          {
            cache: "no-store",
          }
        );

        if (alive) {
          setBackend(
            response.ok
              ? "online"
              : "offline"
          );
        }
      } catch {
        if (alive) {
          setBackend("offline");
        }
      }
    }

    check();

    const timer = window.setInterval(
      check,
      30000
    );

    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  const title =
    titles[location.pathname] ||
    (location.pathname.startsWith("/field/")
      ? "checkCrop"
      : location.pathname.startsWith(
          "/evidence/"
        )
        ? "evidence"
        : "home");

  return (
    <header className="crai-v3-topbar">

      <div className="crai-v3-top-left">

        <button
          className="crai-v3-menu"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={19} />
        </button>

        <div className="crai-v3-top-title">
          <span>CRAI</span>
          <b>/</b>
          <strong>{t(title)}</strong>
        </div>

      </div>

      <div className="crai-v3-top-right">

        <div className="crai-v3-field-selector">
          <span className="field-dot" />
          <span>My Field</span>
          <strong>A1 · Tomato</strong>
        </div>

        <div
          className={`crai-v3-connection ${backend}`}
        >
          {backend === "offline" ? (
            <WifiOff size={13} />
          ) : (
            <Wifi size={13} />
          )}

          <span>
            {backend === "online"
              ? "Connected"
              : backend === "offline"
                ? "Offline"
                : "Checking"}
          </span>
        </div>

        <button
          className="crai-v3-lang"
          onClick={() =>
            setLanguage(
              language === "en"
                ? "ta"
                : "en"
            )
          }
        >
          {language === "en"
            ? "தமிழ்"
            : "EN"}
        </button>

        <button
          className="crai-v3-top-icon"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>

        <Link
          to="/settings"
          className="crai-v3-top-icon"
          aria-label="Settings"
        >
          ⚙
        </Link>

      </div>
    </header>
  );
}
