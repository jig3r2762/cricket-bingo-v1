import { motion } from "framer-motion";
import { BingoGrid } from "@/components/game/BingoGrid";
import { BingoMeter } from "@/components/game/BingoMeter";
import type { GameState } from "@/types/game";
import type { BotDifficulty } from "@/hooks/useBotOpponent";
import { Bot } from "lucide-react";

interface OpponentPanelProps {
  botGameState: GameState;
  botFilledCount: number;
  isThinking: boolean;
  gridSize: 3 | 4;
  difficulty: BotDifficulty;
}

const DIFFICULTY_LABEL: Record<BotDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const DIFFICULTY_COLOR: Record<BotDifficulty, string> = {
  easy: "text-emerald-400",
  medium: "text-amber-400",
  hard: "text-red-400",
};

export function OpponentPanel({ botGameState, botFilledCount, isThinking, gridSize, difficulty }: OpponentPanelProps) {
  const total = gridSize * gridSize;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Bot header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 ring-2 ring-primary/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-sm font-display font-bold text-secondary">CricBot</div>
            <div className={`text-[10px] font-display uppercase tracking-wider ${DIFFICULTY_COLOR[difficulty]}`}>
              {DIFFICULTY_LABEL[difficulty]}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="scoreboard-font text-xl text-secondary">{botGameState.score}</div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-display">Score</div>
        </div>
      </div>

      {/* Thinking indicator */}
      {isThinking && botGameState.status === "playing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 w-fit"
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <span className="text-[10px] font-display uppercase tracking-wider text-primary">Thinking...</span>
        </motion.div>
      )}

      {/* BingoMeter always visible */}
      <BingoMeter filled={botFilledCount} total={total} gridSize={gridSize} />

      {/* Full grid — hidden on mobile */}
      <div className="hidden sm:block opacity-80 pointer-events-none">
        <BingoGrid
          categories={botGameState.grid}
          gridSize={gridSize}
          placements={botGameState.placements}
          feedbackStates={botGameState.feedbackStates}
          onCellClick={() => {}}
          eligibleCells={[]}
          winLine={botGameState.winLine}
        />
      </div>
    </div>
  );
}
