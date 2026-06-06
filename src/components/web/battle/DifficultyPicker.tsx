import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Swords, Zap, Brain, Trophy } from "lucide-react";
import type { BotDifficulty } from "@/hooks/useBotOpponent";

interface DifficultyPickerProps {
  onStart: (difficulty: BotDifficulty, gridSize: 3 | 4) => void;
}

const DIFFICULTIES: { key: BotDifficulty; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  {
    key: "easy",
    label: "Easy",
    desc: "Bot is slow (8–12s/turn) and sometimes skips. Good for beginners.",
    icon: <Zap className="w-6 h-6" />,
    color: "text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10",
  },
  {
    key: "medium",
    label: "Medium",
    desc: "Bot thinks 4–7s, always picks the smartest cell. A fair challenge.",
    icon: <Brain className="w-6 h-6" />,
    color: "text-amber-400 border-amber-500/40 hover:bg-amber-500/10",
  },
  {
    key: "hard",
    label: "Hard",
    desc: "Bot moves every 2–4s and never misses. Can you keep up?",
    icon: <Trophy className="w-6 h-6" />,
    color: "text-red-400 border-red-500/40 hover:bg-red-500/10",
  },
];

export function DifficultyPicker({ onStart }: DifficultyPickerProps) {
  const [step, setStep] = useState<"difficulty" | "gridsize">("difficulty");
  const [selectedDifficulty, setSelectedDifficulty] = useState<BotDifficulty | null>(null);

  return (
    <div className="min-h-screen stadium-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === "difficulty" ? (
            <motion.div
              key="difficulty"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Swords className="w-7 h-7 text-primary" />
                  <h1 className="font-display text-2xl font-extrabold text-secondary uppercase tracking-wider">
                    vs CricBot
                  </h1>
                </div>
                <p className="text-muted-foreground text-sm">
                  Race against the AI — first to fill the grid wins!
                </p>
              </div>

              <div className="space-y-3">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => {
                      setSelectedDifficulty(d.key);
                      setStep("gridsize");
                    }}
                    className={`w-full glass-card rounded-xl p-4 border text-left flex items-center gap-4 transition-all active:scale-95 ${d.color}`}
                  >
                    <div className={d.color.split(" ")[0]}>{d.icon}</div>
                    <div className="flex-1">
                      <div className="font-display text-sm font-bold uppercase tracking-wider">
                        {d.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{d.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="gridsize"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep("difficulty")}
                  className="p-2 rounded-lg border border-border/30 text-muted-foreground hover:text-secondary transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="font-display text-lg font-bold text-secondary uppercase tracking-wider">
                  Pick Grid Size
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {([3, 4] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => onStart(selectedDifficulty!, size)}
                    className="glass-card rounded-xl p-6 border border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all active:scale-95 text-center space-y-2"
                  >
                    <div className="font-display text-3xl font-extrabold text-primary">
                      {size}×{size}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {size === 3 ? "9 cells · Fast" : "16 cells · Epic"}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
