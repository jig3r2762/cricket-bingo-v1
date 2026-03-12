import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface CoinPack {
  id: string;
  label: string;
  price: number;
  coins: number;
  bonus: string;
  highlight?: boolean;
}

const COIN_PACKS: CoinPack[] = [
  { id: "starter", label: "Starter", price: 50,  coins: 500,  bonus: "" },
  { id: "popular", label: "Popular", price: 100, coins: 1100, bonus: "+10%", highlight: true },
  { id: "value",   label: "Value",   price: 250, coins: 3000, bonus: "+20%" },
  { id: "mega",    label: "Mega",    price: 500, coins: 7000, bonus: "+40%" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddCoinsModal({ open, onClose }: Props) {
  const { user, isAdmin } = useAuth();
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);

  // ── Admin: grant coins directly without payment ──
  const handleAdminGrant = async (pack: CoinPack) => {
    if (!user) return;
    setLoadingPackId(pack.id);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        coinBalance: increment(pack.coins),
      });
      toast.success(`🔑 Admin granted ${pack.coins.toLocaleString()} coins!`);
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to grant coins");
    } finally {
      setLoadingPackId(null);
    }
  };

  // ── Regular user: go through Razorpay ──
  const handleSelectPack = async (pack: CoinPack) => {
    if (!user) {
      toast.error("Please sign in to buy coins");
      return;
    }

    // Admin shortcut
    if (isAdmin) {
      await handleAdminGrant(pack);
      return;
    }

    setLoadingPackId(pack.id);
    try {
      await loadRazorpayScript();

      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, packId: pack.id }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error ?? "Failed to create order");
      }

      const { orderId, amount, currency } = await orderRes.json();

      openRazorpayCheckout({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "Cricket Bingo",
        description: `${pack.coins} coins — ${pack.label} pack`,
        order_id: orderId,
        prefill: {
          name: user.displayName ?? undefined,
          email: user.email ?? undefined,
        },
        theme: { color: "#7c3aed" },
        modal: {
          ondismiss: () => setLoadingPackId(null),
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                uid: user.uid,
                packId: pack.id,
              }),
            });

            if (!verifyRes.ok) {
              const err = await verifyRes.json();
              throw new Error(err.error ?? "Payment verification failed");
            }

            const { newBalance } = await verifyRes.json();
            toast.success(`${pack.coins.toLocaleString()} coins added! Balance: ${newBalance.toLocaleString()} 🪙`);
            onClose();
          } catch (err: any) {
            toast.error(err.message ?? "Could not verify payment");
          } finally {
            setLoadingPackId(null);
          }
        },
      });
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
      setLoadingPackId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="bg-card border border-border/40 text-secondary max-w-sm w-full">
        <DialogHeader>
          <DialogTitle className="font-display text-base uppercase tracking-wider text-secondary flex items-center gap-2">
            🪙 Add Coins
            {isAdmin && (
              <span className="px-2 py-0.5 rounded text-[9px] font-display uppercase tracking-wider bg-green-500/20 border border-green-500/40 text-green-400">
                Admin — No Payment
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground mb-4">
          {isAdmin
            ? "As admin, coins are granted instantly without payment."
            : "Coins are used in paid battle rooms. All purchases are final."}
        </p>

        <div className="grid grid-cols-2 gap-3">
          {COIN_PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => handleSelectPack(pack)}
              disabled={loadingPackId !== null}
              className={`relative flex flex-col items-center gap-1.5 rounded-xl border px-3 py-4 text-center transition-all active:scale-95
                ${pack.highlight
                  ? "border-primary/60 bg-primary/10 ring-1 ring-primary/30"
                  : "border-border/40 bg-card/60 hover:border-border/60 hover:bg-card/80"
                }
                ${loadingPackId === pack.id ? "opacity-60 cursor-wait" : "cursor-pointer"}
                ${loadingPackId !== null && loadingPackId !== pack.id ? "opacity-40 cursor-not-allowed" : ""}
              `}
            >
              {pack.highlight && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-display uppercase tracking-wider bg-primary text-white">
                  Popular
                </span>
              )}
              <span className="text-2xl font-bold text-secondary font-display">
                {pack.coins >= 1000 ? `${pack.coins / 1000}K` : pack.coins}
              </span>
              <span className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">
                coins{pack.bonus && <span className="ml-1 text-emerald-400">{pack.bonus}</span>}
              </span>
              <span className={`mt-1 text-sm font-semibold ${isAdmin ? "text-green-400" : "text-primary"}`}>
                {isAdmin ? "Free 🔑" : `₹${pack.price}`}
              </span>
              {loadingPackId === pack.id && (
                <span className="text-[9px] text-muted-foreground animate-pulse">
                  {isAdmin ? "Granting..." : "Opening..."}
                </span>
              )}
            </button>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
          {isAdmin
            ? "🔑 Admin mode — coins added directly to your account"
            : "Secure payments via Razorpay · INR only"}
        </p>
      </DialogContent>
    </Dialog>
  );
}
