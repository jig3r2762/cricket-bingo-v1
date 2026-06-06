import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { shouldUseHashRouter } from "@/lib/iframeUtils";

export type UserRole = "user" | "admin";

interface UserData {
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  createdAt: unknown;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string;
  lastLoginDate?: string;
  loginStreak?: number;
  lastRewardClaimedDate?: string;
  coinBalance?: number;
  dailyQuests?: unknown;
}

interface AuthContextValue {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  playAsGuest: () => void;
  isAdmin: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function cacheUserStats(data: UserData | null) {
  try {
    if (data) {
      localStorage.setItem("cricket-bingo-coins", String(data.coinBalance ?? 0));
      localStorage.setItem("cricket-bingo-streak", String(data.currentStreak ?? 0));
      localStorage.setItem("cricket-bingo-role", data.role ?? "player");
      localStorage.setItem("cricket-bingo-username", data.displayName ?? "");
      localStorage.setItem("cricket-bingo-photo", data.photoURL ?? "");
    } else {
      localStorage.removeItem("cricket-bingo-coins");
      localStorage.removeItem("cricket-bingo-streak");
      localStorage.removeItem("cricket-bingo-role");
      localStorage.removeItem("cricket-bingo-username");
      localStorage.removeItem("cricket-bingo-photo");
    }
    window.dispatchEvent(new Event("cricket-bingo-coins-updated"));
  } catch (err) {
    console.error("Failed to cache user stats in localStorage:", err);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => {
    try {
      return localStorage.getItem("cricket-bingo-guest") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);

        if (firebaseUser) {
          // User signed in — clear guest mode
          setIsGuest(false);
          try { localStorage.removeItem("cricket-bingo-guest"); } catch {}
          await ensureUserDoc(firebaseUser);
          let data = await fetchUserData(firebaseUser.uid);
          if (data) {
            data = await updateLoginStreak(firebaseUser.uid, data);
          }
          cacheUserStats(data);
          setUserData(data);
        } else {
          const isGuestMode = shouldUseHashRouter() || localStorage.getItem("cricket-bingo-guest") === "true";
          if (!isGuestMode) {
            cacheUserStats(null);
          }
          setUserData(null);
          // Auto-guest on CrazyGames / external hosting so ProtectedRoute
          // doesn't redirect to a login page that can't work there.
          if (shouldUseHashRouter()) {
            setIsGuest(true);
          }
        }
      } catch (err) {
        console.error("Auth state change error:", err);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let appUrlListener: any = null;

    const setupDeepLink = async () => {
      const { App } = await import("@capacitor/app");
      const { Browser } = await import("@capacitor/browser");

      appUrlListener = await App.addListener("appUrlOpen", async (event: { url: string }) => {
        console.log("App opened with URL:", event.url);
        try {
          const urlObj = new URL(event.url);
          if (urlObj.host === "auth-callback" || urlObj.protocol === "in.cricketbingo.app:") {
            const params = new URLSearchParams(urlObj.search);
            const idToken = params.get("idToken");
            if (idToken) {
              setLoading(true);
              const credential = GoogleAuthProvider.credential(idToken);
              await signInWithCredential(auth, credential);
              console.log("Firebase signInWithCredential successful!");
            }
          }
        } catch (err) {
          console.error("Deep link sign-in error:", err);
        } finally {
          await Browser.close().catch(() => {});
          setLoading(false);
        }
      });
    };

    setupDeepLink();

    return () => {
      if (appUrlListener) {
        appUrlListener.remove();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const { Browser } = await import("@capacitor/browser");
        await Browser.open({ url: "https://cricket-bingo.in/mobile-auth-trigger" });
        return;
      }
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Google sign-in failed:", err.message);
        if (err.message.includes("popup")) {
          throw new Error("Please allow popups for Google sign-in");
        }
      }
      throw err;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    cacheUserStats(null);
    setUserData(null);
    setIsGuest(false);
    try { localStorage.removeItem("cricket-bingo-guest"); } catch {}
  };

  const playAsGuest = () => {
    setIsGuest(true);
    try { localStorage.setItem("cricket-bingo-guest", "true"); } catch {}
  };

  const isAdmin = userData?.role === "admin";

  const refreshUserData = async () => {
    if (user) {
      const data = await fetchUserData(user.uid);
      cacheUserStats(data);
      setUserData(data);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, userData, loading, isGuest, signInWithGoogle, signOut, playAsGuest, isAdmin, refreshUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useOptionalAuth() {
  const ctx = useContext(AuthContext);
  return ctx;
}

// --- Firestore helpers ---

import { getTodayDateString } from "@/lib/dailyGame";

async function updateLoginStreak(uid: string, currentData: UserData): Promise<UserData> {
  const todayStr = getTodayDateString();
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const y = yesterday.getFullYear();
  const m = String(yesterday.getMonth() + 1).padStart(2, "0");
  const d = String(yesterday.getDate()).padStart(2, "0");
  const yesterdayStr = `${y}-${m}-${d}`;

  let streak = currentData.loginStreak ?? 1;
  const lastLogin = currentData.lastLoginDate ?? "";

  if (!lastLogin) {
    streak = 1;
  } else if (lastLogin === yesterdayStr) {
    // If they already claimed Day 7, reset streak to 1. Otherwise increment.
    if (currentData.lastRewardClaimedDate === lastLogin && currentData.loginStreak === 7) {
      streak = 1;
    } else {
      streak = (currentData.loginStreak ?? 0) + 1;
      if (streak > 7) streak = 1;
    }
  } else if (lastLogin !== todayStr) {
    // Over 1 day gap
    streak = 1;
  }

  const ref = doc(db, "users", uid);
  const updates = {
    lastLoginDate: todayStr,
    loginStreak: streak,
  };

  await setDoc(ref, updates, { merge: true });
  return { ...currentData, ...updates };
}

async function ensureUserDoc(user: User) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const isFirstUser = await checkFirstUser();
    const data: UserData = {
      email: user.email ?? "",
      displayName: user.displayName ?? "",
      photoURL: user.photoURL ?? "",
      role: isFirstUser ? "admin" : "user",
      createdAt: serverTimestamp(),
      currentStreak: 0,
      longestStreak: 0,
      lastPlayedDate: "",
      loginStreak: 1,
      lastLoginDate: getTodayDateString(),
    };
    await setDoc(ref, data);
  } else {
    // Sync Google profile updates (name/avatar) if they changed
    const existing = snap.data();
    const updates: Partial<UserData> = {};
    if (user.displayName && existing.displayName !== user.displayName) {
      updates.displayName = user.displayName;
    }
    if (user.photoURL && existing.photoURL !== user.photoURL) {
      updates.photoURL = user.photoURL;
    }
    if (Object.keys(updates).length > 0) {
      await setDoc(ref, updates, { merge: true });
    }
  }
}

async function fetchUserData(uid: string): Promise<UserData | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserData) : null;
}

async function checkFirstUser(): Promise<boolean> {
  const ref = doc(db, "meta", "init");
  try {
    return await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) {
        transaction.set(ref, { initialized: true, createdAt: serverTimestamp() });
        return true;
      }
      return false;
    });
  } catch {
    return false;
  }
}
