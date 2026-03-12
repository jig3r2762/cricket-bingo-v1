import { motion } from "framer-motion";
import { Flame, Volume2, VolumeX, HelpCircle } from "lucide-react";
import { useState } from "react";
import { isSoundEnabled, setSoundEnabled } from "@/lib/sounds";
import { ThemeToggle } from "@/components/ThemeToggle";

interface GameHeaderProps {
  score: number;
  streak: number;
  onHowToPlay: () => void;
}

export function GameHeader({ score, streak, onHowToPlay }: GameHeaderProps) {
  const [soundOn, setSoundOn] = useState(isSoundEnabled);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  return (
    <div>
      {/* Competitive message */}
      <div className="text-center mb-2">
        <p className="text-[10px] text-candy-green font-body font-bold uppercase tracking-widest">
          ↑ Higher score = Higher rank today ↑
        </p>
      </div>

      <div className="flex items-center justify-between w-full max-w-md mx-auto">
      {/* Score */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border-2 border-orange-200" style={{ boxShadow: "0 3px 0 #f97316" }}>
          <span className="text-[10px] text-orange-400 uppercase tracking-wider font-body font-bold">Score</span>
          <motion.span
            key={score}
            initial={{ y: -8, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="score-display text-2xl leading-none"
          >
            {score}
          </motion.span>
        </div>

        {streak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-orange-400 border-2 border-orange-500"
            style={{ boxShadow: "0 3px 0 #ea580c" }}
          >
            <Flame className="w-4 h-4 text-white" />
            <span className="font-display text-base text-white leading-none">{streak}x</span>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleSound}
          className="p-2 rounded-xl bg-white border-2 border-gray-200 text-gray-500 hover:text-gray-700 transition-colors dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
          style={{ boxShadow: "0 2px 0 #d1d5db" }}
          title={soundOn ? "Mute sounds" : "Enable sounds"}
        >
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <button
          onClick={onHowToPlay}
          className="p-2 rounded-xl bg-white border-2 border-gray-200 text-gray-500 hover:text-gray-700 transition-colors dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
          style={{ boxShadow: "0 2px 0 #d1d5db" }}
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        <ThemeToggle />
      </div>
      </div>
    </div>
  );
}
