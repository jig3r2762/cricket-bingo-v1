import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import App from "./App.tsx";
import "./index.css";
import { cgInit, cgGameLoadingStart } from "./lib/crazyGamesSDK";

// Init SDK first (async), then signal loading start — React renders in parallel
cgInit().then(() => cgGameLoadingStart());

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
