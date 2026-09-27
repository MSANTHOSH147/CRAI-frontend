import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileBottomNav from "./MobileBottomNav";

export default function AppShell() {
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const location = useLocation();

  useEffect(() => {
    setMobileSidebarOpen(false);
    document.body.style.overflow =
      mobileSidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [location.pathname]);

  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", handleKey);

    return () =>
      window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="crai-app-shell">
      <Sidebar
        mobile={false}
        onNavigate={() => setMobileSidebarOpen(false)}
      />

      {mobileSidebarOpen && (
        <div
          className="crai-mobile-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`crai-mobile-drawer ${
          mobileSidebarOpen ? "is-open" : ""
        }`}
      >
        <Sidebar
          mobile
          onNavigate={() => setMobileSidebarOpen(false)}
        />
      </aside>

      <div className="crai-app-main">
        <Topbar
          onMenuClick={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="crai-content">
          <Outlet />
        </main>

        <MobileBottomNav />
      </div>
    </div>
  );
}
