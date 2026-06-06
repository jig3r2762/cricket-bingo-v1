import { useEffect, useState } from "react";
import { signInWithRedirect, getRedirectResult, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export default function MobileAuthTrigger() {
  const [status, setStatus] = useState("Initializing Google Sign-In...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // 1. Check if we are returning from a redirect
        setStatus("Checking login status...");
        const result = await getRedirectResult(auth);
        
        if (result?.user) {
          setStatus("Login successful! Redirecting back to app...");
          const token = await result.user.getIdToken();
          window.location.href = `in.cricketbingo.app://auth-callback?idToken=${token}`;
          return;
        }

        // 2. Check if we already have a logged in user
        if (auth.currentUser) {
          setStatus("Already signed in! Redirecting back to app...");
          const token = await auth.currentUser.getIdToken();
          window.location.href = `in.cricketbingo.app://auth-callback?idToken=${token}`;
          return;
        }

        // 3. Otherwise, trigger redirect to Google sign-in
        setStatus("Redirecting to Google...");
        // Configure provider to request ID token explicitly if needed
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
      } catch (err: any) {
        console.error("Authentication trigger failed:", err);
        setStatus("Authentication failed");
        setError(err.message || "An unknown error occurred during sign-in.");
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h2 className="text-xl font-bold tracking-wide">Cricket Bingo</h2>
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 space-y-3">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm font-semibold">{status}</p>
          {error && (
            <p className="text-xs text-red-400 bg-red-950/45 p-3 rounded-lg border border-red-900/40 text-left">
              {error}
            </p>
          )}
        </div>
        <p className="text-xs text-slate-500">
          This window will close automatically once you are returned to the Cricket Bingo app.
        </p>
      </div>
    </div>
  );
}
