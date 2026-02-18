/**
 * Returns true if the page is running inside an iframe (e.g. CrazyGames embed).
 * Uses a try/catch because cross-origin iframes throw a SecurityError on window.top access.
 */
export function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin access blocked — definitely inside an iframe
    return true;
  }
}
