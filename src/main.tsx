import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import App from "./App.tsx";
import "./index.css";
import { cgInit, cgGameLoadingStart } from "./lib/crazyGamesSDK";

// Only load CrazyGames SDK on external hosting (not on our own domain).
// Loading it on cricket-bingo.in causes SDK init errors since it's not a CrazyGames context.
const OWN_HOSTS = ["cricket-bingo.in", "www.cricket-bingo.in", "localhost"];
const isOwnDomain =
  OWN_HOSTS.includes(window.location.hostname) ||
  window.location.hostname.includes("vercel.app");

function loadCrazyGamesSDK(): Promise<void> {
  if (isOwnDomain) return Promise.resolve();
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "//sdk.crazygames.com/crazygames-sdk-v3.js";
    s.onload = () => resolve();
    s.onerror = () => resolve(); // fail gracefully
    document.head.appendChild(s);
  });
}

// Load SDK (if needed), then init and signal loading start — React renders in parallel
loadCrazyGamesSDK().then(() => cgInit()).then(() => cgGameLoadingStart());

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
