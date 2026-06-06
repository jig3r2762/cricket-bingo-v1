import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { AddCoinsModal } from "./AddCoinsModal";

export function CoinBalance() {
  const { coinBalance, loading } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) {
    return <div className="h-7 w-20 rounded-full bg-border/20 animate-pulse" />;
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="hud-pill color-gold"
        title="Add coins"
      >
        <span className="text-sm leading-none">🪙</span>
        <span className="tabular-nums">{coinBalance.toLocaleString()}</span>
      </button>

      <AddCoinsModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
