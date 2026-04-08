import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/** Routes where ads should NOT be displayed (game/functional screens, not editorial content) */
const NO_AD_ROUTES = ["/login", "/admin", "/play", "/battle", "/paid-battle", "/guess", "/leaderboard", "/stats"];

interface AdSenseProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdSense({ adSlot, adFormat = "auto", className = "" }: AdSenseProps) {
  const location = useLocation();
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  const isBlocked = NO_AD_ROUTES.some((route) => location.pathname.startsWith(route));

  useEffect(() => {
    if (isBlocked || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded or blocked by adblocker
    }
  }, [isBlocked]);

  if (isBlocked) return null;

  return (
    <div className={`ad-container overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-7606459883233703"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}

/** Wrapper for a horizontal banner ad, typically placed between content sections */
export function AdBanner({ className = "" }: { className?: string }) {
  return <AdSense adSlot="YOUR_BANNER_SLOT_ID" adFormat="horizontal" className={className} />;
}
