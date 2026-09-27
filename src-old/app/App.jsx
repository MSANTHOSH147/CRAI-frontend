import React from "react";
import { getRoute } from "./routes";
import { AppShell } from "../components/layout/AppShell";
import FarmerHome from "../pages/FarmerHome";
import FieldAssessment from "../pages/FieldAssessment";
import AlertsPage from "../pages/AlertsPage";
import AskCraiPage from "../pages/AskCraiPage";
import ExpertConsole from "../pages/ExpertConsole";
import DemoMode from "../pages/DemoMode";
import { SettingsPage } from "../pages/SettingsPage";
import "../styles/crai.css";

export default function App() {
  const [route, setRoute] = React.useState(getRoute());

  React.useEffect(() => {
    const onPop = () => setRoute(getRoute());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  React.useEffect(() => {
    const onNavigate = () => setRoute(getRoute());
    window.addEventListener("crai:navigate", onNavigate);
    return () => window.removeEventListener("crai:navigate", onNavigate);
  }, []);

  const page =
    route.name === "fields" ? <FieldAssessment /> :
    route.name === "field" ? <FieldAssessment fieldId={route.id} /> :
    route.name === "alerts" ? <AlertsPage /> :
    route.name === "ask" ? <AskCraiPage /> :
    route.name === "expert" ? <ExpertConsole /> :
    route.name === "demo" ? <DemoMode /> :
    route.name === "settings" ? <SettingsPage /> :
    <FarmerHome />;

  return <AppShell>{page}</AppShell>;
}
