import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

// Existing project CSS
import "./css/index.css";
import "./css/style.css";
// import "./css/gis.css";

// Divya feature CSS
import "./css/alerts.css";
import "./css/notifications.css";
import "./css/emergency.css";
import "./css/map.css";
import "./css/resources.css";

/* Divya layout CSS */
import "./css/sidebar.css";

import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
