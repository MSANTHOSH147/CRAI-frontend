import { BrowserRouter, useRoutes } from "react-router-dom";
import { LanguageProvider } from "./LanguageContext";
import routes from "./routes";

function AppRoutes() {
  return useRoutes(routes);
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AppRoutes />
      </LanguageProvider>
    </BrowserRouter>
  );
}
