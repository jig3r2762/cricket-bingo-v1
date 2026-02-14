import { motion } from "framer-motion";
import { Flame, Volume2, VolumeX, HelpCircle } from "lucide-react";
import { useState } from "react";

interface GameHeaderProps {
  score: number;
  streak: number;
  onHowToPlay: () => void;
}

export function GameHeader({ score, streak, onHowToPlay }: GameHeaderProps) {
  const [soundOn, setSoundOn] = useState(true);

  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto">
      {/* Score */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/50">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-display">Score</span>
          <motion.span
            key={score}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="scoreboard-font text-lg text-secondary font-bold"
          >
            {score}
          </motion.span>
        </div>

        {streak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-secondary/10 border border-secondary/30"
          >
            <Flame className="w-3.5 h-3.5 text-secondary" />
            <span className="scoreboard-font text-sm text-secondary">{streak}×</span>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setSoundOn(!soundOn)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <button
          onClick={onHowToPlay}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
