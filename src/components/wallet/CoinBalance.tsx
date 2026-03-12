import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { AddCoinsModal } from "./AddCoinsModal";

export function CoinBalance() {
  const { coinBalance, loading } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-7 w-20 rounded-lg bg-border/20 animate-pulse" />
    );
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/15 transition-colors"
        title="Add coins"
      >
        <span className="text-sm leading-none">🪙</span>
        <span className="text-[11px] font-display uppercase tracking-wider scoreboard-font">
          {coinBalance.toLocaleString()}
        </span>
      </button>

      <AddCoinsModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
