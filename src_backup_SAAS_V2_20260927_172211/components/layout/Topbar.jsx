import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../../app/LanguageContext";

const pageKeys = {
  "/": "home",
  "/fields": "fields",
  "/check": "checkCrop",
  "/alerts": "alerts",
  "/ask-crai": "askCrai",
  "/expert": "expert",
  "/settings": "settings",
};

export default function Topbar({
  mobileSidebarOpen = false,
  onMenuClick,
}) {
  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  const location = useLocation();

  const [backendOnline, setBackendOnline] =
    useState(null);

  async function checkBackend() {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/health",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      setBackendOnline(response.ok);
    } catch {
      setBackendOnline(false);
    }
  }

  useEffect(() => {
    checkBackend();

    const timer = window.setInterval(
      checkBackend,
      30000
    );

    return () =>
      window.clearInterval(timer);
  }, []);

  const path = location.pathname;

  let pageKey = pageKeys[path];

  if (!pageKey && path.startsWith("/field/")) {
    pageKey = "checkCrop";
  }

  if (!pageKey && path.startsWith("/evidence/")) {
    pageKey = "evidence";
  }

  const pageTitle = pageKey
    ? t(pageKey)
    : "CRAI";

  const statusText =
    backendOnline === null
      ? language === "ta"
        ? "சரிபார்க்கிறது"
        : "Checking"
      : backendOnline
        ? t("online")
        : t("offline");

  return (
    <header className="cr-topbar">
      <div className="cr-topbar-left">
        <button
          type="button"
          className="cr-topbar-menu"
          onClick={onMenuClick}
          aria-label={
            language === "ta"
              ? "மெனுவைத் திறக்கவும்"
              : "Open menu"
          }
          aria-expanded={mobileSidebarOpen}
        >
          {mobileSidebarOpen ? "×" : "☰"}
        </button>

        <div className="cr-topbar-title">
          <span>CRAI</span>
          <strong>{pageTitle}</strong>
        </div>
      </div>

      <div className="cr-topbar-actions">
        <div
          className={`cr-topbar-status ${
            backendOnline === true
              ? "online"
              : backendOnline === false
                ? "offline"
                : "checking"
          }`}
        >
          <span />
          {statusText}
        </div>

        <div className="cr-topbar-language">
          <button
            type="button"
            className={
              language === "en"
                ? "active"
                : ""
            }
            onClick={() =>
              setLanguage("en")
            }
            aria-label="English"
          >
            EN
          </button>

          <button
            type="button"
            className={
              language === "ta"
                ? "active"
                : ""
            }
            onClick={() =>
              setLanguage("ta")
            }
            aria-label="Tamil"
          >
            தமிழ்
          </button>
        </div>

        <Link
          to="/settings"
          className="cr-topbar-settings"
          aria-label={t("settings")}
          title={t("settings")}
        >
          ⚙
        </Link>
      </div>

      <style>{`
        .cr-topbar {
          position: sticky;
          top: 0;
          z-index: 30;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 0 22px;
          border-bottom: 1px solid #dfe7e1;
          background: rgba(255, 255, 255, .96);
          backdrop-filter: blur(10px);
        }

        .cr-topbar-left,
        .cr-topbar-actions {
          display: flex;
          align-items: center;
        }

        .cr-topbar-left {
          min-width: 0;
          gap: 10px;
        }

        .cr-topbar-menu {
          display: none;
          width: 34px;
          height: 34px;
          place-items: center;
          padding: 0;
          border: 1px solid #dce5df;
          border-radius: 8px;
          background: #fff;
          color: #315c4b;
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
        }

        .cr-topbar-title {
          min-width: 0;
        }

        .cr-topbar-title span {
          display: block;
          color: #8a958f;
          font-size: 7px;
          font-weight: 850;
          letter-spacing: .12em;
          line-height: 1;
        }

        .cr-topbar-title strong {
          display: block;
          overflow: hidden;
          margin-top: 3px;
          color: #17201c;
          font-size: 14px;
          line-height: 1;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cr-topbar-actions {
          gap: 8px;
        }

        .cr-topbar-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 28px;
          padding: 0 8px;
          border: 1px solid #dfe7e1;
          border-radius: 999px;
          background: #fff;
          color: #7b8781;
          font-size: 8px;
          font-weight: 800;
          white-space: nowrap;
        }

        .cr-topbar-status span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .cr-topbar-status.online {
          border-color: #cfe5d8;
          background: #edf7f1;
          color: #176246;
        }

        .cr-topbar-status.offline {
          border-color: #ead0d0;
          background: #fff3f3;
          color: #9a3939;
        }

        .cr-topbar-status.checking {
          color: #8a681d;
          background: #fff9eb;
          border-color: #eadcb9;
        }

        .cr-topbar-language {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 2px;
          border: 1px solid #dfe7e1;
          border-radius: 7px;
          background: #f8faf8;
        }

        .cr-topbar-language button {
          min-height: 25px;
          padding: 0 7px;
          border: 0;
          border-radius: 5px;
          background: transparent;
          color: #7b8781;
          font-size: 8px;
          font-weight: 850;
          cursor: pointer;
        }

        .cr-topbar-language button.active {
          background: #fff;
          color: #145a45;
          box-shadow: 0 1px 3px rgba(20, 45, 35, .08);
        }

        .cr-topbar-settings {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          border: 1px solid #dfe7e1;
          border-radius: 7px;
          background: #fff;
          color: #607068;
          text-decoration: none;
          font-size: 12px;
        }

        .cr-topbar-settings:hover {
          color: #145a45;
          border-color: #bdd3c5;
        }

        @media (max-width: 900px) {
          .cr-topbar {
            height: 54px;
            padding: 0 14px;
          }

          .cr-topbar-menu {
            display: grid;
          }

          .cr-topbar-title strong {
            font-size: 13px;
          }
        }

        @media (max-width: 500px) {
          .cr-topbar {
            gap: 8px;
          }

          .cr-topbar-actions {
            gap: 5px;
          }

          .cr-topbar-status {
            padding: 0 6px;
          }

          .cr-topbar-status span {
            width: 5px;
            height: 5px;
          }

          .cr-topbar-language button {
            padding: 0 5px;
          }

          .cr-topbar-settings {
            display: none;
          }
        }

        @media (max-width: 370px) {
          .cr-topbar-status {
            display: none;
          }

          .cr-topbar-title strong {
            max-width: 125px;
          }
        }
      `}</style>
    </header>
  );
}