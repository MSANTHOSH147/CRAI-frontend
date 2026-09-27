import { Navigate } from "react-router-dom";

import AppShell from "../components/layout/AppShell";

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
    element: <AppShell />,
    children: [
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
      {
        path: "/demo",
        element: <Navigate to="/" replace />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
];

export default routes;
