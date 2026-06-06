import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TimerOff, Calendar, Trophy, Search, Swords,
  ChevronRight, Zap, ArrowLeft,
} from "lucide-react";

interface GridSelectionProps {
  onSelect: (size: 3 | 4 | 5, timed?: boolean, mode?: "daily" | "ipl") => void;
  onBattle?: () => void;
  onGuess?: () => void;
  onChase?: () => void;
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
  color: "green" | "blue" | "yellow" | "purple" | "pink";
  onClick: (
    onSelect: GridSelectionProps["onSelect"],
    timed: boolean,
    onGuess?: () => void,
    onChase?: () => void
  ) => void;
}

const MODES: ModeConfig[] = [
  {
    id: "daily-3",
    label: "DAILY 3×3",
    sub: "9 cells · Same for all",
    icon: Calendar,
    color: "green",
    onClick: (s, t) => s(3, t, "daily"),
  },
  {
    id: "daily-4",
    label: "DAILY 4×4",
    sub: "16 cells · Harder",
    icon: Calendar,
    color: "blue",
    onClick: (s, t) => s(4, t, "daily"),
  },
  {
    id: "daily-5",
    label: "DAILY 5×5",
    sub: "25 cells · Expert",
    icon: Calendar,
    color: "yellow",
    onClick: (s, t) => s(5, t, "daily"),
  },
  {
    id: "chase",
    label: "6-BALL OVER",
    sub: "Chase down target",
    tag: "NEW",
    icon: Zap,
    color: "pink",
    onClick: (_, __, ___, oc) => oc?.(),
  },
  {
    id: "guess",
    label: "GUESS WHO",
    sub: "5 clues · Name it",
    tag: "NEW",
    icon: Search,
    color: "purple",
    onClick: (_, __, og) => og?.(),
  },
  {
    id: "ipl",
    label: "IPL MODE",
    sub: "10 teams · IPL only",
    icon: Trophy,
    color: "yellow",
    onClick: (s, t) => s(3, t, "ipl"),
  },
];

export function GridSelection({ onSelect, onBattle, onGuess, onChase }: GridSelectionProps) {
  const navigate = useNavigate();
  const timed = true;

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto px-4 py-2 relative">

      {/* Back to Hub */}
      <button
        onClick={() => navigate("/")}
        className="hud-pill self-start"
        aria-label="Back to Hub"
      >
        <ArrowLeft className="w-4 h-4" /> HUB
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-2"
      >
        <span className="hud-pill color-pink">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-glow" />
          DAILY CHALLENGE
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-black leading-none tracking-wide gold-text uppercase">
          Pick your match
        </h1>
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
          Match players · Complete lines · Beat the world
        </p>
      </motion.div>

      {/* Mode cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        {MODES.map((mode) => {
          if (mode.id === "guess" && !onGuess) return null;
          if (mode.id === "chase" && !onChase) return null;
          const Icon = mode.icon;
          return (
            <motion.button
              key={mode.id}
              variants={fadeUp}
              onClick={() => mode.onClick(onSelect, timed, onGuess, onChase)}
              className={`mode-card color-${mode.color}`}
            >
              <div className="relative z-10 flex flex-col items-start gap-2 w-full text-white">
                {mode.tag && (
                  <span className="absolute top-0 right-0 px-2 py-0.5 rounded-md text-[9px] font-display font-black bg-white text-foreground uppercase tracking-widest">
                    {mode.tag}
                  </span>
                )}
                <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-display text-base sm:text-lg font-black leading-none">{mode.label}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-85">{mode.sub}</div>
                <ChevronRight className="w-4 h-4 self-end mt-auto opacity-80" />
              </div>
            </motion.button>
          );
        })}

        {/* VS Battle full-width */}
        {onBattle && (
          <motion.button
            variants={fadeUp}
            onClick={onBattle}
            className="mode-card color-pink col-span-2 !flex-row !items-center !min-h-0 !py-3.5"
          >
            <div className="relative z-10 flex items-center gap-3 w-full text-white">
              <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                <Swords className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-display text-base font-black leading-none">VS PLAYER</div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Real-time · First to BINGO</div>
              </div>
              <span className="flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">LIVE</span>
              </span>
            </div>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
