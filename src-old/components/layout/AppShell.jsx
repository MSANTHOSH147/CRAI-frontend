import React from "react";
import Header from "./Header";
import BottomNav from "./BottomNav";
import ModeSwitcher from "./ModeSwitcher";

export function AppShell({ children }) {
  return (
    <div className="crai-app">
      <aside className="crai-sidebar">
        <div className="brand-mark">CR</div>
        <div className="sidebar-brand">
          <strong>CRAI</strong>
          <span>Adaptive Field Intelligence</span>
        </div>
        <ModeSwitcher compact />
      </aside>

      <main className="crai-main">
        <Header />
        <div className="mode-switcher-mobile"><ModeSwitcher /></div>
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
