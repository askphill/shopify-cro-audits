import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Debug labels: ?debug in URL or Cmd/Ctrl+Shift+D to toggle
if (new URLSearchParams(window.location.search).has("debug")) {
  document.body.classList.add("debug-labels");
}
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "D") {
    e.preventDefault();
    document.body.classList.toggle("debug-labels");
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
