import { motion, AnimatePresence } from "framer-motion";
import { Flame, HelpCircle, Volume2, VolumeX, Zap } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { isSoundEnabled, setSoundEnabled } from "@/lib/sounds";

interface GameHeaderProps {
  score: number;
  streak: number;
  onHowToPlay: () => void;
}

export function GameHeader({ score, streak, onHowToPlay }: GameHeaderProps) {
  const [soundOn, setSoundOn] = useState(isSoundEnabled);
  const [prevScore, setPrevScore] = useState(score);
  const [delta, setDelta] = useState<number | null>(null);

  if (score !== prevScore) {
    const diff = score - prevScore;
    setDelta(diff > 0 ? diff : null);
    setPrevScore(score);
  }

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-lg border border-border bg-card/90 backdrop-blur-sm px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">

        {/* Score block */}
        <div className="flex items-end gap-3 relative">
          <div>
            <p className="text-[9px] text-muted-foreground font-body font-semibold uppercase tracking-[0.12em] mb-0.5">
              Score
            </p>
            <div className="relative">
              <motion.span
                key={score}
                initial={{ y: -10, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 24 }}
                className="score-display text-4xl leading-none block"
              >
                {score}
              </motion.span>
              {/* Score delta pop */}
              <AnimatePresence>
                {delta !== null && (
                  <motion.span
                    key={`delta-${score}`}
                    initial={{ y: 0, opacity: 1, scale: 0.8 }}
                    animate={{ y: -32, opacity: 0, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="absolute -top-1 left-full ml-1.5 text-xs font-display font-bold text-primary whitespace-nowrap pointer-events-none"
                    onAnimationComplete={() => setDelta(null)}
                  >
                    +{delta}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Streak badge */}
          <AnimatePresence>
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="mb-0.5 flex items-center gap-1 rounded-md border border-secondary/40 bg-secondary/10 px-2 py-1"
              >
                {streak >= 3
                  ? <Zap className="w-3.5 h-3.5 text-secondary fill-secondary" />
                  : <Flame className="w-3.5 h-3.5 text-secondary" />
                }
                <span className="font-display text-xs text-secondary leading-none">
                  {streak}x
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleSound}
            className="p-2 rounded-md bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            title={soundOn ? "Mute" : "Unmute"}
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onHowToPlay}
            className="p-2 rounded-md bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
