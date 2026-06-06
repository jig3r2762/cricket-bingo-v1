import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isMobile } from "@/lib/platform";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/play" replace />;
  }

  return <>{children}</>;
}
