import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Zap, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function Login() {
  const { user, loading, isGuest, signInWithGoogle, playAsGuest } = useAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen stadium-bg flex items-center justify-center">
        <div className="text-secondary/60 font-display text-sm uppercase tracking-widest animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (user || isGuest) {
    return <Navigate to="/play" replace />;
  }

  const handleSignIn = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Sign in error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Sign in failed. Please try again."
      );
    } finally {
      setSigningIn(false);
    }
  };

  const handleGuestPlay = () => {
    playAsGuest();
    navigate("/play");
  };

  return (
    <div className="min-h-screen stadium-bg flex items-center justify-center p-4 relative">
      <div className="w-full max-w-sm relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="scoreboard p-7 text-center"
        >
          {/* Bouncing cricket ball */}
          <motion.div
            initial={{ opacity: 0, rotate: -180, scale: 0 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 12 }}
            className="mb-3"
          >
            <motion.span
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl block"
            >
              🏏
            </motion.span>
          </motion.div>

          <h1 className="font-display text-3xl font-black uppercase tracking-wider gold-text mb-1">
            Cricket Bingo
          </h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-6">
            Test your cricket knowledge
          </p>

          {/* Trust badges as HUD pills */}
          <div className="flex justify-center gap-2 mb-7">
            <span className="hud-pill !text-[10px]">
              <Users className="w-3.5 h-3.5 text-primary" />
              3,600+ PLAYERS
            </span>
            <span className="hud-pill color-gold !text-[10px]">
              <Zap className="w-3.5 h-3.5" />
              DAILY
            </span>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-3 rounded-xl bg-destructive/15 border-2 border-destructive/40 flex items-start gap-2 mb-4"
            >
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <span className="text-xs text-destructive text-left font-bold">{error}</span>
            </motion.div>
          )}

          {/* Google Sign In — chunky */}
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className={`cta-chunky color-green size-lg w-full mb-3 ${signingIn ? "is-disabled" : ""}`}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {signingIn ? "SIGNING IN…" : "SIGN IN WITH GOOGLE"}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-muted-foreground/60 font-display font-bold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Play as Guest */}
          <button onClick={handleGuestPlay} className="cta-chunky color-yellow w-full">
            <span className="relative z-10 flex items-center justify-center gap-2">
              🎮 PLAY AS GUEST
            </span>
          </button>

          <p className="text-muted-foreground/60 text-[11px] mt-5 font-bold uppercase tracking-wider">
            Sign in to save scores & climb the leaderboard
          </p>
        </motion.div>
      </div>
    </div>
  );
}
