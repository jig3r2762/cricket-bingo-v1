import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { shouldUseHashRouter } from "@/lib/iframeUtils";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { isMobile } from "@/lib/platform";
import { useTheme } from "@/hooks/useTheme";
import { CookieConsent as WebCookieConsent } from "@/components/web/CookieConsent";
import { CookieConsent as MobileCookieConsent } from "@/components/mobile/CookieConsent";

// Use HashRouter on CrazyGames (external hostname or iframe) so /play doesn't 404.
// BrowserRouter is used on Vercel where server handles all routes normally.
const Router = shouldUseHashRouter() ? HashRouter : BrowserRouter;

// Platform-aware lazy imports for public pages
const Hub = lazy(() => isMobile() ? import("./pages/mobile/Hub") : import("./pages/web/Hub"));
const Privacy = lazy(() => isMobile() ? import("./pages/mobile/Privacy") : import("./pages/web/Privacy"));
const Terms = lazy(() => isMobile() ? import("./pages/mobile/Terms") : import("./pages/web/Terms"));
const HowToPlay = lazy(() => isMobile() ? import("./pages/mobile/HowToPlay") : import("./pages/web/HowToPlay"));
const About = lazy(() => isMobile() ? import("./pages/mobile/About") : import("./pages/web/About"));
const Contact = lazy(() => isMobile() ? import("./pages/mobile/Contact") : import("./pages/web/Contact"));
const Players = lazy(() => isMobile() ? import("./pages/mobile/Players") : import("./pages/web/Players"));
const PlayerProfile = lazy(() => isMobile() ? import("./pages/mobile/PlayerProfile") : import("./pages/web/PlayerProfile"));
const StylePage = lazy(() => isMobile() ? import("./pages/mobile/Style") : import("./pages/web/Style"));

const CookieConsent = () => {
  return isMobile() ? <MobileCookieConsent /> : <WebCookieConsent />;
};

// AuthenticatedApp lazy-loads Firebase + AuthProvider only when user navigates
// away from the landing page (login, play, battle, etc.).
const AuthenticatedApp = lazy(() => import("./AuthenticatedApp"));

const queryClient = new QueryClient();

function PageLoader() {
  const bgClass = isMobile() ? "stadium-bg" : "warm-bg";
  const textClass = isMobile() ? "text-secondary/60" : "text-primary/60";
  return (
    <div className={`min-h-screen ${bgClass} flex items-center justify-center`}>
      <div className={`${textClass} font-display text-sm uppercase tracking-widest animate-pulse`}>
        Loading...
      </div>
    </div>
  );
}

const App = () => {
  useTheme(); // Initialize theme classes on document and body on mount

  useEffect(() => {
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: "#0b0e14" }).catch(() => {});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CookieConsent />
        <Analytics />
        <SpeedInsights />
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public pages — no Firebase, no AuthProvider, SEO-friendly */}
              <Route path="/" element={<Hub />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/how-to-play" element={<HowToPlay />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/players/:id" element={<PlayerProfile />} />
              <Route path="/players" element={<Players />} />
              <Route path="/style" element={<StylePage />} />
              {/* All other routes — Firebase loads here */}
              <Route path="/*" element={<AuthenticatedApp />} />
            </Routes>
          </Suspense>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
