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
    <div className={`scoreboard w-full max-w-md mx-auto px-4 py-3 ${delta !== null ? "animate-score-flash" : ""}`}>
      <div className="flex items-center justify-between gap-3">

        {/* Score block — LED dot-matrix feel */}
        <div className="flex items-end gap-3 relative">
          <div>
            <p className="text-[9px] text-primary/70 font-bold uppercase tracking-[0.18em] mb-0.5">
              Score
            </p>
            <div className="relative">
              <motion.span
                key={score}
                initial={{ y: -10, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 24 }}
                className="score-display color-green text-4xl leading-none block"
              >
                {score}
              </motion.span>
              <AnimatePresence>
                {delta !== null && (
                  <motion.span
                    key={`delta-${score}`}
                    initial={{ y: 0, opacity: 1, scale: 0.8 }}
                    animate={{ y: -32, opacity: 0, scale: 1.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="absolute -top-1 left-full ml-1.5 text-sm font-display font-black text-secondary whitespace-nowrap pointer-events-none"
                    style={{ textShadow: "0 0 8px hsl(var(--secondary) / 0.6)" }}
                    onAnimationComplete={() => setDelta(null)}
                  >
                    +{delta}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Streak pill — chunky HUD style */}
          <AnimatePresence>
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="hud-pill color-pink mb-0.5"
              >
                {streak >= 3
                  ? <Zap className="w-3.5 h-3.5 fill-current" />
                  : <Flame className="w-3.5 h-3.5" />
                }
                <span>{streak}x</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleSound}
            className="hud-pill !px-2.5 !py-2"
            title={soundOn ? "Mute" : "Unmute"}
            aria-label={soundOn ? "Mute" : "Unmute"}
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onHowToPlay}
            className="hud-pill !px-2.5 !py-2"
            aria-label="How to play"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
