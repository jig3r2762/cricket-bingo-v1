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
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

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
          const data = await fetchUserData(firebaseUser.uid);
          setUserData(data);
        } else {
          setUserData(null);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
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

// --- Firestore helpers ---

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
    };
    await setDoc(ref, data);
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
