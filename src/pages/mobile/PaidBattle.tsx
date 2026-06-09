import { useNavigate } from "react-router-dom";
import { Coins, Swords, ArrowLeft } from "lucide-react";

export default function PaidBattle() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen stadium-bg flex items-center justify-center p-4 relative">
      <button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 hud-pill z-20"
        aria-label="Back to Hub"
      >
        <ArrowLeft className="w-4 h-4" /> HUB
      </button>

      <div className="w-full max-w-sm relative z-10 space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center border-2 border-yellow-500/40 text-yellow-400 animate-bounce-in">
          <Coins className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            <h1 className="font-display text-2xl font-black uppercase tracking-wider gold-text">
              Paid Battle
            </h1>
          </div>
          <span className="inline-block bg-yellow-500/20 text-yellow-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-yellow-500/35 uppercase tracking-wider">
            Coming Soon / Maintenance
          </span>
        </div>

        <div className="candy-card p-5 rounded-2xl border border-border/30 bg-muted/10 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Paid competitive rooms are currently under maintenance as we prepare our secure payment channels for Google Play and Android production.
          </p>
          <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">
            Stay tuned for upcoming updates!
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="cta-chunky color-green w-full"
        >
          <span className="relative z-10">← BACK TO MAIN MENU</span>
        </button>
      </div>
    </div>
  );
}
