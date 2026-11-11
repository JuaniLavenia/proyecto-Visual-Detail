import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

// After a new deploy, a tab still running the previous build asks for lazy
// chunks whose hashed names no longer exist ("Failed to fetch dynamically
// imported module"). Reload once to pick up the new build; the timestamp guard
// stops a reload loop if the chunk is missing for another reason.
const RELOAD_KEY = "vite-preload-error-reload";
const RELOAD_GUARD_MS = 10_000;

window.addEventListener("vite:preloadError", (event) => {
  let lastReload = 0;
  try {
    lastReload = Number(sessionStorage.getItem(RELOAD_KEY)) || 0;
  } catch {
    // Storage unavailable: fall through and let the error surface.
    return;
  }
  if (Date.now() - lastReload < RELOAD_GUARD_MS) return;

  try {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return;
  }
  event.preventDefault();
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
