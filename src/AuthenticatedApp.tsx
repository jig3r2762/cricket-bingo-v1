import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PlayersProvider } from "@/contexts/PlayersContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

function PageLoader() {
  return (
    <div className="min-h-screen stadium-bg flex items-center justify-center">
      <div className="text-secondary/60 font-display text-sm uppercase tracking-widest animate-pulse">
        Loading...
      </div>
    </div>
  );
}

const Index = lazy(() => import("./pages/Index"));
const Admin = lazy(() => import("./pages/Admin"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Stats = lazy(() => import("./pages/Stats"));
const Battle = lazy(() => import("./pages/Battle"));
const PaidBattle = lazy(() => import("./pages/PaidBattle"));

export default function AuthenticatedApp() {
  return (
    <AuthProvider>
      <WalletProvider>
        <PlayersProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </PlayersProvider>
      </WalletProvider>
    </AuthProvider>
  );
}
