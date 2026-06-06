import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isMobile } from "@/lib/platform";
import { shouldUseHashRouter } from "@/lib/iframeUtils";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isGuest } = useAuth();

  if (loading) {
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
