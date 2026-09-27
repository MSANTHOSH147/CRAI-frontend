import {
  Bell,
  Languages,
  Activity,
  ChevronDown,
  CheckCircle2,
  Server,
  MapPin,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldSelection } from "../../app/FieldContext.jsx";
import FieldSelector from "./FieldSelector.jsx";
import { fetchSystemStatus } from "../../services/craiData.js";

export default function Topbar() {
  const {
    language,
    setLanguage,
    notificationsOpen,
    setNotificationsOpen,
  } = useFieldSelection();

  const [fieldOpen, setFieldOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [system, setSystem] = useState(null);

  useEffect(() => {
    fetchSystemStatus()
      .then(setSystem)
      .catch(() => {});
  }, []);

  function toggleStatus() {
    setNotificationsOpen(false);
    setStatusOpen((v) => !v);
  }

  function toggleNotifications() {
    setStatusOpen(false);
    setNotificationsOpen(!notificationsOpen);
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="mobile-brand">CRAI</div>
        <span className="top-context">CURRENT FIELD</span>
      </div>

      <div className="topbar-actions">

        <button
          className="header-pill"
          onClick={() => setLanguage(language === "en" ? "ta" : "en")}
          type="button"
        >
          <Languages size={16} />
          {language === "en" ? "தமிழ்" : "English"}
        </button>

        {/* LIVE STATUS */}
        <button
          className="header-pill"
          onClick={toggleStatus}
          type="button"
          aria-expanded={statusOpen}
        >
          <i className="live-dot" />
          Live
          <ChevronDown
            size={14}
            style={{
              transform: statusOpen ? "rotate(180deg)" : "none",
              transition: "transform .2s ease",
            }}
          />
        </button>

        {/* NOTIFICATIONS */}
        <button
          className="icon-button"
          onClick={toggleNotifications}
          aria-label="Notifications"
          aria-expanded={notificationsOpen}
          type="button"
        >
          <Bell size={18} />
          <span className="notify-dot" />
        </button>

        <FieldSelector onOpen={() => setFieldOpen(true)} />
      </div>

      {fieldOpen && <FieldMenu onClose={() => setFieldOpen(false)} />}

      {/* =====================================================
          FIXED LIVE PANEL
          This does NOT participate in page layout.
         ===================================================== */}
      {statusOpen && (
        <>
          <div
            onClick={() => setStatusOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999,
              background: "transparent",
            }}
          />

          <div
            role="dialog"
            aria-label="System status"
            style={{
              position: "fixed",
              top: 82,
              right: 210,
              width: 330,
              maxWidth: "calc(100vw - 32px)",
              zIndex: 1000,
              background: "#ffffff",
              border: "1px solid rgba(20,90,69,.12)",
              borderRadius: 18,
              boxShadow: "0 18px 50px rgba(23,32,28,.16)",
              padding: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div>
                <div className="eyebrow">SYSTEM STATUS</div>
                <strong style={{ fontSize: 18 }}>CRAI intelligence</strong>
              </div>

              <button
                type="button"
                onClick={() => setStatusOpen(false)}
                className="icon-button"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="status-panel">
              <div className="status-row">
                <Server size={18} />
                <span>CRAI backend</span>
                <strong className="good-text">
                  {system?.backend || "checking"}
                </strong>
              </div>

              <div className="status-row">
                <CheckCircle2 size={18} />
                <span>Supabase</span>
                <strong>
                  {system?.supabase?.status || "checking"}
                </strong>
              </div>

              <div className="status-row">
                <Activity size={18} />
                <span>Data mode</span>
                <strong>Evidence-gated</strong>
              </div>
            </div>

            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                borderRadius: 12,
                background: "#f2f7f3",
                fontSize: 12,
                color: "#557067",
              }}
            >
              Live status reflects CRAI system connectivity.
            </div>
          </div>
        </>
      )}

      {/* =====================================================
          FIXED NOTIFICATION PANEL
          This does NOT participate in page layout.
         ===================================================== */}
      {notificationsOpen && (
        <>
          <div
            onClick={() => setNotificationsOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999,
              background: "transparent",
            }}
          />

          <div
            role="dialog"
            aria-label="Notifications"
            style={{
              position: "fixed",
              top: 82,
              right: 120,
              width: 360,
              maxWidth: "calc(100vw - 32px)",
              zIndex: 1000,
              background: "#ffffff",
              border: "1px solid rgba(20,90,69,.12)",
              borderRadius: 18,
              boxShadow: "0 18px 50px rgba(23,32,28,.16)",
              padding: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div>
                <div className="eyebrow">ALERT CENTER</div>
                <strong style={{ fontSize: 18 }}>Notifications</strong>
              </div>

              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                className="icon-button"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="notice-card">
              <div className="notice-icon">
                <Bell size={18} />
              </div>

              <div>
                <b>CRAI alerts</b>
                <p>
                  Active field events appear here when the intelligence
                  layer records them.
                </p>
              </div>
            </div>

            <div className="empty-inline">
              No additional notifications loaded.
            </div>
          </div>
        </>
      )}
    </header>
  );
}

function FieldMenu({ onClose }) {
  const { selected, setSelected } = useFieldSelection();

  const options = [
    {
      zoneId: "A1",
      zoneName: "Zone A1",
      crop: selected.crop,
    },
    {
      zoneId: "A2",
      zoneName: "Zone A2",
      crop: null,
    },
    {
      zoneId: "B1",
      zoneName: "Zone B1",
      crop: null,
    },
  ];

  return (
    <div className="field-menu-overlay" onClick={onClose}>
      <div
        className="field-menu"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="menu-title">Select field</div>

        {options.map((o) => (
          <button
            key={o.zoneId}
            className={
              o.zoneId === selected.zoneId ? "selected" : ""
            }
            onClick={() => {
              setSelected({
                ...selected,
                ...o,
                fieldName: "My Field",
              });
              onClose();
            }}
            type="button"
          >
            <MapPin size={16} />

            <span>
              <b>My Field</b>
              <small>
                {o.zoneName}
                {o.crop ? ` · ${o.crop}` : ""}
              </small>
            </span>

            {o.zoneId === selected.zoneId && (
              <CheckCircle2 size={16} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
