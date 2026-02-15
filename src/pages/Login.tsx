import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Zap, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function Login() {
  const { user, loading, signInWithGoogle } = useAuth();
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

  if (user) {
    return <Navigate to="/" replace />;
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

  return (
    <div className="min-h-screen stadium-bg flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 right-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-10 w-40 h-40 rounded-full bg-secondary/5 blur-3xl"
        />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Animated card entry */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl p-8 shadow-2xl text-center"
        >
          {/* Animated Logo */}
          <motion.div
            initial={{ opacity: 0, rotate: -180, scale: 0 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 12 }}
            className="mb-2"
          >
            <motion.span
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl block"
            >
              🏏
            </motion.span>
          </motion.div>

          {/* Title with staggered animation */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-2xl uppercase tracking-wider text-secondary mb-1"
          >
            Cricket Bingo
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground text-sm mb-8"
          >
            Test your cricket knowledge daily
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-3 mb-8"
          >
            <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-display text-primary/80 uppercase tracking-wider">
                1,000+ Players
              </span>
            </div>
            <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/10 border border-secondary/20">
              <Zap className="w-3.5 h-3.5 text-secondary" />
              <span className="text-xs font-display text-secondary/80 uppercase tracking-wider">
                Daily Games
              </span>
            </div>
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <span className="text-xs text-destructive">{error}</span>
            </motion.div>
          )}

          {/* Gradient animated button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: !signingIn ? 1.02 : 1, boxShadow: "0 0 20px hsl(var(--primary) / 0.3)" }}
            whileTap={{ scale: !signingIn ? 0.98 : 1 }}
            onClick={handleSignIn}
            disabled={signingIn}
            className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl text-gray-800 font-medium text-sm active:scale-[0.98] transition-all shadow-lg relative overflow-hidden group ${
              signingIn ? "opacity-75 cursor-not-allowed" : ""
            }`}
            style={{
              background: "linear-gradient(135deg, #00ff41 0%, #00ff88 100%)",
            }}
          >
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="relative z-10">
              {signingIn ? "Signing in..." : "Sign in with Google"}
            </span>
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-muted-foreground/50 text-xs mt-6"
          >
            Sign in to save your progress and compete daily
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
