import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileBottomNav from "./MobileBottomNav";

export default function AppShell({ routes }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Prevent the page behind the drawer from scrolling.
  useEffect(() => {
    if (!mobileSidebarOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  // ESC closes the mobile drawer.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function toggleSidebar() {
    setMobileSidebarOpen((current) => !current);
  }

  function closeSidebar() {
    setMobileSidebarOpen(false);
  }

  function goHome() {
    navigate("/");
    closeSidebar();
  }

  return (
    <div className="cr-app-shell">
      {/* Desktop sidebar */}
      <aside className="cr-desktop-sidebar">
        <Sidebar />
      </aside>

      {/* Mobile backdrop */}
      <div
        className={`cr-mobile-backdrop ${
          mobileSidebarOpen ? "is-visible" : ""
        }`}
        onClick={closeSidebar}
        aria-hidden={!mobileSidebarOpen}
      />

      {/* Mobile drawer */}
      <aside
        className={`cr-mobile-drawer ${
          mobileSidebarOpen ? "is-open" : ""
        }`}
        aria-hidden={!mobileSidebarOpen}
      >
        <div className="cr-mobile-drawer-head">
          <button
            type="button"
            className="cr-mobile-brand"
            onClick={goHome}
            aria-label="Go to CRAI home"
          >
            <span className="cr-brand-mark">C</span>

            <span>
              <strong>CRAI</strong>
              <small>Crop Intelligence</small>
            </span>
          </button>

          <button
            type="button"
            className="cr-drawer-close"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>

        <div className="cr-mobile-drawer-content">
          <Sidebar mobile onNavigate={closeSidebar} />
        </div>

        <div className="cr-mobile-drawer-footer">
          <span>CRAI Intelligence System</span>
          <span>v1.0</span>
        </div>
      </aside>

      <div className="cr-main-shell">
        <Topbar
          mobileSidebarOpen={mobileSidebarOpen}
          onMenuClick={toggleSidebar}
        />

        <main className="cr-main-content">
          {routes}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}