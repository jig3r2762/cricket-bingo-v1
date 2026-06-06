import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PlayersProvider } from "@/contexts/PlayersContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { isMobile } from "@/lib/platform";
import { DailyRewardsModal } from "@/components/mobile/DailyRewardsModal";

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

// Platform-aware lazy imports
const Login = lazy(() => isMobile() ? import("./pages/mobile/Login") : import("./pages/web/Login"));
const NotFound = lazy(() => isMobile() ? import("./pages/mobile/NotFound") : import("./pages/web/NotFound"));
const Index = lazy(() => isMobile() ? import("./pages/mobile/Index") : import("./pages/web/Index"));
const Admin = lazy(() => isMobile() ? import("./pages/mobile/Admin") : import("./pages/web/Admin"));
const Leaderboard = lazy(() => isMobile() ? import("./pages/mobile/Leaderboard") : import("./pages/web/Leaderboard"));
const Stats = lazy(() => isMobile() ? import("./pages/mobile/Stats") : import("./pages/web/Stats"));
const Battle = lazy(() => isMobile() ? import("./pages/mobile/Battle") : import("./pages/web/Battle"));
const PaidBattle = lazy(() => isMobile() ? import("./pages/mobile/PaidBattle") : import("./pages/web/PaidBattle"));
const GuessPlayer = lazy(() => isMobile() ? import("./pages/mobile/GuessPlayer") : import("./pages/web/GuessPlayer"));
const ChaseGame = lazy(() => isMobile() ? import("./pages/mobile/ChaseGame") : import("./pages/web/ChaseGame"));

const Hub = lazy(() => isMobile() ? import("./pages/mobile/Hub") : import("./pages/web/Hub"));

export default function AuthenticatedApp() {
  return (
    <AuthProvider>
      <WalletProvider>
        <PlayersProvider>
          <Suspense fallback={<PageLoader />}>
            {isMobile() && <DailyRewardsModal />}
            <Routes>
              {isMobile() && (
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Hub />
                    </ProtectedRoute>
                  }
                />
              )}
              <Route path="/login" element={<Login />} />
              <Route
                path="/play"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stats"
                element={
                  <ProtectedRoute>
                    <Stats />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/battle"
                element={
                  <ProtectedRoute>
                    <Battle />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/paid-battle"
                element={
                  <ProtectedRoute>
                    <PaidBattle />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guess"
                element={
                  <ProtectedRoute>
                    <GuessPlayer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chase"
                element={
                  <ProtectedRoute>
                    <ChaseGame />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </PlayersProvider>
      </WalletProvider>
    </AuthProvider>
  );
}
