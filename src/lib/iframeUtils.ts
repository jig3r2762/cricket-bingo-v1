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

/**
 * Our known production domains. Anything else is external hosting (CrazyGames, etc.)
 */
const OUR_HOSTS = ["cricket-bingo.in", "www.cricket-bingo.in", "localhost"];

function isOnOurDomain(): boolean {
  const host = window.location.hostname;
  return OUR_HOSTS.some((h) => host === h) || host.includes("vercel.app");
}

/**
 * Returns true when running on external hosting (CrazyGames CDN, QA tool, etc.)
 * OR inside an iframe. In both cases we need HashRouter and guest-only mode.
 *
 * Why hostname check: CrazyGames QA loads the game directly (not in an iframe)
 * so isInIframe() alone is not enough to detect external hosting.
 */
export function shouldUseHashRouter(): boolean {
  return !isOnOurDomain() || isInIframe();
}
