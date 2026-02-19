import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, LayoutGrid, Timer, TimerOff, Zap, ChevronLeft, Trophy } from "lucide-react";
import { shouldUseHashRouter } from "@/lib/iframeUtils";

const IN_CRAZYGAMES = shouldUseHashRouter();

interface GridSelectionProps {
  onSelect: (size: 3 | 4, timed?: boolean, mode?: "daily" | "ipl") => void;
}

type Step = "mode" | "grid";

const slide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -40 },
};

export function GridSelection({ onSelect }: GridSelectionProps) {
  const [step, setStep] = useState<Step>("mode");
  const [timed, setTimed] = useState(false);
  const [pendingMode, setPendingMode] = useState<"daily" | "ipl">("daily");

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-foreground uppercase tracking-[0.15em] leading-none">
          Cricket
        </h1>
        <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-primary uppercase tracking-[0.15em] leading-none">
          Bingo
        </h1>
        <p className="text-muted-foreground font-body text-sm mt-3 tracking-wide">
          Place legends. Complete the grid.
        </p>
      </motion.div>

      <div className="w-full">
        <AnimatePresence mode="wait">

          {/* Step 1 — Mode */}
          {step === "mode" && (
            <motion.div key="mode" {...slide} transition={{ duration: 0.22 }} className="flex flex-col gap-3 w-full">
              {/* Quick Match */}
              <motion.button
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => { setPendingMode("daily"); setStep("grid"); }}
                className="glass-card p-5 flex items-center gap-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-[hsl(var(--cricket-green)/0.4)] bg-[hsl(var(--cricket-green)/0.1)]">
                  <Zap className="w-7 h-7" style={{ color: "hsl(var(--cricket-green))" }} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-display text-lg font-bold text-foreground tracking-wider">QUICK MATCH</h3>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">3×3 or 4×4 · Daily puzzle · Play at your pace</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180 shrink-0" />
              </motion.button>

              {/* IPL Mode — hidden on CrazyGames until approved */}
              {!IN_CRAZYGAMES && <motion.button
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => { setPendingMode("ipl"); setStep("grid"); }}
                className="glass-card p-5 flex items-center gap-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/40 bg-amber-500/10">
                  <Trophy className="w-7 h-7 text-amber-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-foreground tracking-wider">IPL MODE</h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-display uppercase tracking-wider border border-amber-500/50 text-amber-400 bg-amber-500/10">
                      NEW
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">Pure IPL · All 10 teams · IPL legends only</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180 shrink-0" />
              </motion.button>}
            </motion.div>
          )}

          {/* Step 2 — Grid size + Timer on same screen */}
          {step === "grid" && (
            <motion.div key="grid" {...slide} transition={{ duration: 0.22 }} className="flex flex-col gap-4 w-full">
              {/* Back + label */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep("mode")}
                  className="p-1.5 rounded-lg border border-border/30 text-muted-foreground hover:text-secondary transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">
                  Choose your grid
                </span>
              </div>

              {/* Grid cards side by side */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  onClick={() => onSelect(3, timed, pendingMode)}
                  className="glass-card p-5 flex flex-col items-center gap-3 cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${pendingMode === "ipl" ? "border-amber-500/40 bg-amber-500/10" : "border-[hsl(var(--cricket-green)/0.4)] bg-[hsl(var(--cricket-green)/0.1)]"}`}>
                    <Grid3X3 className="w-6 h-6" style={{ color: pendingMode === "ipl" ? "#f59e0b" : "hsl(var(--cricket-green))" }} />
                  </div>
                  <div className="text-center">
                    <div className="font-display text-xl font-bold text-foreground tracking-wider">3 × 3</div>
                    <div className="text-[10px] text-muted-foreground mt-1">9 cells · Fast</div>
                  </div>
                  {timed && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-display uppercase tracking-wider border border-orange-400/40 text-orange-400 bg-orange-400/10">
                      Timed
                    </span>
                  )}
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => onSelect(4, timed, pendingMode)}
                  className="glass-card p-5 flex flex-col items-center gap-3 cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${pendingMode === "ipl" ? "border-amber-500/40 bg-amber-500/10" : "border-[hsl(var(--golden-trophy)/0.4)] bg-[hsl(var(--golden-trophy)/0.1)]"}`}>
                    <LayoutGrid className="w-6 h-6" style={{ color: pendingMode === "ipl" ? "#f59e0b" : "hsl(var(--golden-trophy))" }} />
                  </div>
                  <div className="text-center">
                    <div className="font-display text-xl font-bold text-foreground tracking-wider">4 × 4</div>
                    <div className="text-[10px] text-muted-foreground mt-1">16 cells · Full</div>
                  </div>
                  {timed && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-display uppercase tracking-wider border border-orange-400/40 text-orange-400 bg-orange-400/10">
                      Timed
                    </span>
                  )}
                </motion.button>
              </div>

              {/* Timer toggle — small, below the cards */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                onClick={() => setTimed((v) => !v)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  timed
                    ? "border-orange-400/50 bg-orange-400/10"
                    : "border-border/30 bg-card/30 hover:border-border/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {timed ? (
                    <Timer className="w-4 h-4 text-orange-400" />
                  ) : (
                    <TimerOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div className="text-left">
                    <div className="text-xs font-display uppercase tracking-wider text-secondary">
                      {timed ? "Timed Mode — 10s per turn" : "Relaxed Mode — no time limit"}
                    </div>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${timed ? "bg-orange-400" : "bg-muted/40"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${timed ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
