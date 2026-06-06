import { Capacitor } from "@capacitor/core";

export function isMobile(): boolean {
  // 1. Allow manual override via query param
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("platform") === "mobile") return true;
    if (params.get("platform") === "web") return false;
    
    // 2. Check localStorage override
    try {
      const stored = localStorage.getItem("cricket-bingo-platform");
      if (stored === "mobile") return true;
      if (stored === "web") return false;
    } catch {}
  }

  // 3. Capacitor native app is always mobile UI
  if (Capacitor.isNativePlatform()) {
    return true;
  }

  // 4. User Agent check for phones/tablets
  if (typeof navigator !== "undefined") {
    const ua = navigator.userAgent.toLowerCase();
    if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
      return true;
    }
  }

  // 5. Viewport width fallback (e.g. tablet, small browser width resizing)
  if (typeof window !== "undefined") {
    return window.innerWidth <= 768;
  }

  return false;
}
