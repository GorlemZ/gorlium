import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { GorliumProvider } from "@gorlium/design-system";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GorliumProvider>
      <App />
    </GorliumProvider>
  </StrictMode>
);
