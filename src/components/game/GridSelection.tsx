import { useState } from "react";
import { motion } from "framer-motion";
import {
  Timer, TimerOff, Calendar, Trophy, Search, Swords,
  ChevronRight, Zap,
} from "lucide-react";

interface GridSelectionProps {
  onSelect: (size: 3 | 4, timed?: boolean, mode?: "daily" | "ipl") => void;
  onBattle?: () => void;
  onGuess?: () => void;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 28 } },
};

interface ModeConfig {
  id: string;
  label: string;
  sub: string;
  tag?: string;
  icon: React.FC<{ className?: string }>;
  colorClass: string;
  iconBg: string;
  onClick: (onSelect: GridSelectionProps["onSelect"], timed: boolean, onGuess?: () => void) => void;
}

const MODES: ModeConfig[] = [
  {
    id: "daily-3",
    label: "Daily 3x3",
    sub: "9 cells · Same grid for all",
    icon: Calendar,
    colorClass: "border-primary/40 hover:border-primary/70",
    iconBg: "bg-primary/10 text-primary border-primary/30",
    onClick: (s, t) => s(3, t, "daily"),
  },
  {
    id: "daily-4",
    label: "Daily 4x4",
    sub: "16 cells · Harder challenge",
    icon: Calendar,
    colorClass: "border-blue-500/40 hover:border-blue-500/70",
    iconBg: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    onClick: (s, t) => s(4, t, "daily"),
  },
  {
    id: "ipl",
    label: "IPL Mode",
    sub: "All 10 teams · IPL only",
    icon: Trophy,
    colorClass: "border-secondary/40 hover:border-secondary/70",
    iconBg: "bg-secondary/10 text-secondary border-secondary/30",
    onClick: (s, t) => s(3, t, "ipl"),
  },
  {
    id: "guess",
    label: "Guess Who",
    sub: "5 clues · Name the player",
    tag: "New",
    icon: Search,
    colorClass: "border-violet-500/40 hover:border-violet-500/70",
    iconBg: "bg-violet-500/10 text-violet-500 border-violet-500/30",
    onClick: (_, __, og) => og?.(),
  },
];

export function GridSelection({ onSelect, onBattle, onGuess }: GridSelectionProps) {
  const [timed, setTimed] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto px-4 py-2">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-1"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/8 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-[10px] font-body font-semibold text-primary uppercase tracking-[0.14em]">
            Daily Challenge
          </span>
        </div>
        <h1 className="font-display text-4xl text-foreground leading-none tracking-wide">
          Cricket Bingo
        </h1>
        <p className="text-xs text-muted-foreground font-body">
          Match players · Complete lines · Beat the world
        </p>
      </motion.div>

      {/* Timer toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
        onClick={() => setTimed((v) => !v)}
        className={`flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg border mx-auto transition-all text-sm ${
          timed
            ? "border-secondary/50 bg-secondary/10 text-secondary"
            : "border-border bg-card/60 text-muted-foreground"
        }`}
      >
        {timed
          ? <><Zap className="w-3.5 h-3.5" /><span className="font-body font-semibold text-xs">Timed — 10s per turn</span></>
          : <><TimerOff className="w-3.5 h-3.5" /><span className="font-body font-semibold text-xs">Relaxed — no timer</span></>
        }
        <div className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${timed ? "bg-secondary" : "bg-muted"}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform ${timed ? "translate-x-4" : "translate-x-0.5"}`} />
        </div>
      </motion.button>

      {/* Mode cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-2.5"
      >
        {MODES.map((mode) => {
          if (mode.id === "guess" && !onGuess) return null;
          const Icon = mode.icon;
          return (
            <motion.button
              key={mode.id}
              variants={fadeUp}
              whileTap={{ scale: 0.96 }}
              onClick={() => mode.onClick(onSelect, timed, onGuess)}
              className={`candy-card p-4 flex flex-col items-start gap-3 text-left cursor-pointer relative overflow-hidden group transition-all border ${mode.colorClass}`}
            >
              {mode.tag && (
                <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded text-[9px] font-body font-bold bg-primary text-white uppercase tracking-wide">
                  {mode.tag}
                </span>
              )}
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${mode.iconBg} group-hover:scale-110 transition-transform`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-base text-foreground leading-none mb-1">{mode.label}</h3>
                <p className="text-[10px] text-muted-foreground font-body leading-snug">{mode.sub}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 self-end group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </motion.button>
          );
        })}

        {/* VS Battle full-width */}
        {onBattle && (
          <motion.button
            variants={fadeUp}
            whileTap={{ scale: 0.98 }}
            onClick={onBattle}
            className="candy-card col-span-2 p-4 flex items-center gap-4 text-left cursor-pointer border border-violet-500/30 hover:border-violet-500/60 group transition-all"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center border bg-violet-500/10 text-violet-500 border-violet-500/30 group-hover:scale-110 transition-transform shrink-0">
              <Swords className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-base text-foreground leading-none mb-1">VS Player</h3>
              <p className="text-[10px] text-muted-foreground font-body">Real-time · Same grid · First to BINGO wins</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400 font-body font-semibold">Live</span>
            </div>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
