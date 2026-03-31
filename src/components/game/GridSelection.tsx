import { useState } from "react";
import { motion } from "framer-motion";
import { Timer, TimerOff } from "lucide-react";

interface GridSelectionProps {
  onSelect: (size: 3 | 4, timed?: boolean, mode?: "daily" | "ipl") => void;
  onBattle?: () => void;
  onGuess?: () => void;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function GridSelection({ onSelect, onBattle, onGuess }: GridSelectionProps) {
  const [timed, setTimed] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.span
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-5xl block mb-2"
        >
          🏏
        </motion.span>
        <h1 className="font-display text-3xl leading-none" style={{ color: "hsl(25 30% 18%)" }}>
          Play Cricket Games
        </h1>
      </motion.div>

      {/* Timer toggle — applies to bingo modes */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        onClick={() => setTimed((v) => !v)}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border-2 mx-auto transition-all ${
          timed
            ? "border-candy-orange bg-orange-50 dark:bg-orange-950/30"
            : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
        }`}
        style={{ boxShadow: timed ? "0 3px 0 hsl(28 90% 38%)" : "0 3px 0 #d1d5db" }}
      >
        {timed ? (
          <Timer className="w-4 h-4 text-candy-orange" />
        ) : (
          <TimerOff className="w-4 h-4 text-muted-foreground" />
        )}
        <span className={`text-xs font-body font-bold ${timed ? "text-candy-orange" : "text-muted-foreground"}`}>
          {timed ? "Timer ON — 10s per turn" : "Timer OFF — play relaxed"}
        </span>
        <div className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${timed ? "bg-candy-orange" : "bg-gray-300 dark:bg-gray-600"}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${timed ? "translate-x-4" : "translate-x-0.5"}`} />
        </div>
      </motion.button>

      {/* Game mode cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        {/* Daily 3x3 */}
        <motion.button
          variants={fadeUp}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(3, timed, "daily")}
          className="candy-card p-5 flex flex-col items-center gap-3 text-center cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-candy-green flex items-center justify-center"
            style={{ boxShadow: "0 4px 0 hsl(134 55% 30%)" }}>
            <span className="text-2xl">📅</span>
          </div>
          <div>
            <h3 className="font-display text-base text-foreground">DAILY 3x3</h3>
            <p className="text-[10px] text-muted-foreground font-body font-semibold mt-0.5">
              Today's puzzle · 9 cells
            </p>
          </div>
        </motion.button>

        {/* Daily 4x4 */}
        <motion.button
          variants={fadeUp}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(4, timed, "daily")}
          className="candy-card p-5 flex flex-col items-center gap-3 text-center cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-candy-blue flex items-center justify-center"
            style={{ boxShadow: "0 4px 0 hsl(205 85% 38%)" }}>
            <span className="text-2xl">📅</span>
          </div>
          <div>
            <h3 className="font-display text-base text-foreground">DAILY 4x4</h3>
            <p className="text-[10px] text-muted-foreground font-body font-semibold mt-0.5">
              Today's puzzle · 16 cells
            </p>
          </div>
        </motion.button>

        {/* IPL Mode */}
        <motion.button
          variants={fadeUp}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(3, timed, "ipl")}
          className="candy-card p-5 flex flex-col items-center gap-3 text-center cursor-pointer relative overflow-hidden"
        >
          <div className="w-14 h-14 rounded-2xl bg-candy-yellow flex items-center justify-center"
            style={{ boxShadow: "0 4px 0 hsl(45 90% 38%)" }}>
            <span className="text-2xl">🏆</span>
          </div>
          <div>
            <h3 className="font-display text-base text-foreground">IPL MODE</h3>
            <p className="text-[10px] text-muted-foreground font-body font-semibold mt-0.5">
              All 10 teams · IPL only
            </p>
          </div>
        </motion.button>

        {/* Guess the Cricketer */}
        {onGuess && (
          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onGuess}
            className="candy-card p-5 flex flex-col items-center gap-3 text-center cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-1.5 right-1.5">
              <span className="px-1.5 py-0.5 rounded-full bg-candy-orange text-white font-body font-bold text-[8px] uppercase">New</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-candy-orange flex items-center justify-center"
              style={{ boxShadow: "0 4px 0 hsl(28 90% 38%)" }}>
              <span className="text-2xl">🕵️</span>
            </div>
            <div>
              <h3 className="font-display text-base text-foreground">GUESS WHO</h3>
              <p className="text-[10px] text-muted-foreground font-body font-semibold mt-0.5">
                5 clues · Name the player
              </p>
            </div>
          </motion.button>
        )}

        {/* VS Player */}
        {onBattle && (
          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBattle}
            className="candy-card p-5 flex flex-col items-center gap-3 text-center cursor-pointer col-span-2"
          >
            <div className="w-14 h-14 rounded-2xl bg-candy-purple flex items-center justify-center"
              style={{ boxShadow: "0 4px 0 hsl(262 78% 42%)" }}>
              <span className="text-2xl">⚔️</span>
            </div>
            <div>
              <h3 className="font-display text-base text-foreground">VS PLAYER</h3>
              <p className="text-[10px] text-muted-foreground font-body font-semibold mt-0.5">
                Real-time · Same grid · First to fill wins
              </p>
            </div>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
