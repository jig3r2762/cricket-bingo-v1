import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { shouldUseHashRouter } from "@/lib/iframeUtils";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Use HashRouter on CrazyGames (external hostname or iframe) so /play doesn't 404.
// BrowserRouter is used on Vercel where server handles all routes normally.
const Router = shouldUseHashRouter() ? HashRouter : BrowserRouter;

// Landing is code-split but does NOT load Firebase — keeps LCP fast for SEO.
const Landing = lazy(() => import("./pages/Landing"));

// AuthenticatedApp lazy-loads Firebase + AuthProvider only when user navigates
// away from the landing page (login, play, battle, etc.).
const AuthenticatedApp = lazy(() => import("./AuthenticatedApp"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen stadium-bg flex items-center justify-center">
      <div className="text-secondary/60 font-display text-sm uppercase tracking-widest animate-pulse">
        Loading...
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Analytics />
      <SpeedInsights />
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Landing page — no Firebase, no AuthProvider */}
            <Route path="/" element={<Landing />} />
            {/* All other routes — Firebase loads here */}
            <Route path="/*" element={<AuthenticatedApp />} />
          </Routes>
        </Suspense>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
