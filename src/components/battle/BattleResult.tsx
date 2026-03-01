import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { RotateCcw, Home, Trophy, Bot, Swords } from "lucide-react";
import type { GameState } from "@/types/game";
import { triggerConfetti } from "@/lib/confetti";

type Outcome = "player" | "bot" | "draw";

interface BattleResultProps {
  playerState: GameState;
  botState: GameState;
  playerFilledCount: number;
  botFilledCount: number;
  onPlayAgain: () => void;
}

function determineWinner(
  playerState: GameState,
  botState: GameState,
  playerFilled: number,
  botFilled: number
): Outcome {
  const playerDone = playerState.status !== "playing";
  const botDone = botState.status !== "playing";

  if (playerDone && !botDone) return "player";
  if (botDone && !playerDone) return "bot";
  if (playerDone && botDone) {
    if (playerState.score > botState.score) return "player";
    if (botState.score > playerState.score) return "bot";
    return "draw";
  }
  // Both still playing — compare progress
  if (playerFilled > botFilled) return "player";
  if (botFilled > playerFilled) return "bot";
  return "draw";
}

export function BattleResult({ playerState, botState, playerFilledCount, botFilledCount, onPlayAgain }: BattleResultProps) {
  const navigate = useNavigate();
  const outcome = determineWinner(playerState, botState, playerFilledCount, botFilledCount);

  useEffect(() => {
    if (outcome === "player") {
      const t = setTimeout(() => triggerConfetti(), 300);
      return () => clearTimeout(t);
    }
  }, [outcome]);

  const headline =
    outcome === "player" ? "You Win! 🏆" :
    outcome === "bot"    ? "CricBot Wins! 🤖" :
    "It's a Draw! 🤝";

  const headlineColor =
    outcome === "player" ? "text-yellow-400" :
    outcome === "bot"    ? "text-red-400" :
    "text-secondary";

  const total = playerState.gridSize * playerState.gridSize;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-background/80"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
        className="glass-card rounded-2xl p-6 w-full max-w-sm text-center space-y-5"
      >
        {/* Icon */}
        <motion.div
          initial={{ rotate: -10, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
          className="flex justify-center"
        >
          {outcome === "player" ? (
            <Trophy className="w-16 h-16 text-yellow-400 drop-shadow-lg" />
          ) : outcome === "bot" ? (
            <Bot className="w-16 h-16 text-red-400" />
          ) : (
            <Swords className="w-16 h-16 text-secondary" />
          )}
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`font-display text-3xl font-extrabold uppercase tracking-wider ${headlineColor}`}
        >
          {headline}
        </motion.h2>

        {/* Score comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl overflow-hidden border border-border/30"
        >
          <div className="grid grid-cols-3 text-[10px] font-display uppercase tracking-wider text-muted-foreground bg-muted/20 px-3 py-2">
            <span className="text-left">You</span>
            <span className="text-center">Stat</span>
            <span className="text-right">CricBot</span>
          </div>
          <div className="divide-y divide-border/20">
            {[
              { label: "Score", player: playerState.score, bot: botState.score },
              { label: "Cells", player: `${playerFilledCount}/${total}`, bot: `${botFilledCount}/${total}` },
              { label: "Streak", player: playerState.maxStreak, bot: botState.maxStreak },
            ].map((row) => (
              <div key={row.label} className="grid grid-cols-3 px-3 py-2 text-sm">
                <span className={`text-left font-bold ${outcome === "player" ? "text-secondary" : "text-muted-foreground"}`}>
                  {row.player}
                </span>
                <span className="text-center text-[10px] font-display uppercase tracking-wider text-muted-foreground self-center">
                  {row.label}
                </span>
                <span className={`text-right font-bold ${outcome === "bot" ? "text-red-400" : "text-muted-foreground"}`}>
                  {row.bot}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-2"
        >
          <button
            onClick={onPlayAgain}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary/20 border border-primary/50 text-primary font-display text-sm uppercase tracking-wider hover:bg-primary/30 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
          <button
            onClick={() => navigate("/play")}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-secondary/10 border border-secondary/30 text-secondary font-display text-xs uppercase tracking-wider hover:bg-secondary/20 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            Back to Main
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
