import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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

  // Allow both authenticated users and guests
  if (!user && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
