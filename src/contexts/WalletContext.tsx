import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

interface WalletContextValue {
  coinBalance: number;
  bonusCoins: number;
  loading: boolean;
}

const WalletContext = createContext<WalletContextValue>({
  coinBalance: 0,
  bonusCoins: 0,
  loading: true,
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user, isGuest } = useAuth();
  const [coinBalance, setCoinBalance] = useState(0);
  const [bonusCoins, setBonusCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || isGuest) {
      setCoinBalance(0);
      setBonusCoins(0);
      setLoading(false);
      return;
    }

    const ref = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setCoinBalance(data.coinBalance ?? 0);
          setBonusCoins(data.bonusCoins ?? 0);
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, isGuest]);

  return (
    <WalletContext.Provider value={{ coinBalance, bonusCoins, loading }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
