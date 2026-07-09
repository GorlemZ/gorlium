import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { GorliumProvider } from "@gorlium/design-system";
import "../i18n"; // initializes i18next (side effect) before the app renders

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GorliumProvider>
      <App />
    </GorliumProvider>
  </StrictMode>
);
