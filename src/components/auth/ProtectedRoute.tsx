import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { shouldUseHashRouter } from "@/lib/iframeUtils";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isGuest } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen stadium-bg flex items-center justify-center">
        <div className="text-secondary/60 font-display text-sm uppercase tracking-widest animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  // On CrazyGames / external hosting, always allow through (guest mode is auto-set)
  if (shouldUseHashRouter()) {
    return <>{children}</>;
  }

  // On our domain: allow authenticated users and guests, redirect others to login
  if (!user && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
