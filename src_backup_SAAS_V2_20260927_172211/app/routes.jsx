import { Navigate } from "react-router-dom";

import FarmerHome from "../pages/FarmerHome";
import FieldsPage from "../pages/FieldsPage";
import FieldAssessment from "../pages/FieldAssessment";
import AlertsPage from "../pages/AlertsPage";
import AskCraiPage from "../pages/AskCraiPage";
import ExpertConsole from "../pages/ExpertConsole";
import EvidencePage from "../pages/EvidencePage";
import SettingsPage from "../pages/SettingsPage";

const routes = [
  {
    path: "/",
    element: <FarmerHome />,
  },

  {
    path: "/fields",
    element: <FieldsPage />,
  },

  {
    path: "/field/:id",
    element: <FieldAssessment />,
  },

  {
    path: "/check",
    element: <FieldAssessment />,
  },

  {
    path: "/alerts",
    element: <AlertsPage />,
  },

  {
    path: "/ask-crai",
    element: <AskCraiPage />,
  },

  {
    path: "/expert",
    element: <ExpertConsole />,
  },

  {
    path: "/evidence/:id",
    element: <EvidencePage />,
  },

  {
    path: "/settings",
    element: <SettingsPage />,
  },

  // Old demo route is intentionally disabled.
  {
    path: "/demo",
    element: <Navigate to="/" replace />,
  },

  // Unknown routes return to the farmer home.
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

export default routes;