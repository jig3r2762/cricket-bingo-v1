import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Swords, Trophy, Home } from "lucide-react";
import { BingoGrid } from "@/components/web/game/BingoGrid";
import { BingoMeter } from "@/components/web/game/BingoMeter";
import { PlayerCard } from "@/components/web/game/PlayerCard";
import { GameHeader } from "@/components/web/game/GameHeader";
import { useBattleGame } from "@/hooks/useBattleGame";
import { useBotOpponent, type BotDifficulty } from "@/hooks/useBotOpponent";
import { OpponentPanel } from "./OpponentPanel";
import { BattleResult } from "./BattleResult";
import { triggerConfetti } from "@/lib/confetti";
import type { CricketPlayer, GridCategory } from "@/types/game";
import { useAuth } from "@/contexts/AuthContext";
import { trackQuestProgress } from "@/lib/quests";

interface BotBattleArenaProps {
  grid: GridCategory[];
  deck: CricketPlayer[];
  gridSize: 3 | 4;
  difficulty: BotDifficulty;
  onPlayAgain: () => void;
}

type Outcome = "win" | "lose" | "draw";

function computeOutcome(
  myStatus: "playing" | "won" | "lost",
  myScore: number,
  oppStatus: "playing" | "won" | "lost",
  oppScore: number,
): Outcome {
  if (myStatus === "won" && oppStatus !== "won") return "win";
  if (oppStatus === "won" && myStatus !== "won") return "lose";
  if (myScore > oppScore) return "win";
  if (oppScore > myScore) return "lose";
  return "draw";
}

export function BotBattleArena({
  grid, deck, gridSize, difficulty, onPlayAgain,
}: BotBattleArenaProps) {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const total = gridSize * gridSize;

  // Local game (player side)
  const {
    gameState, currentPlayer, eligibleCells, recommendedCell,
    handleCellClick, handleSkip, handleWildcard, cancelWildcard, filledCount,
  } = useBattleGame({ grid, deck, gridSize });

  // Bot game
  const { botGameState, botFilledCount, isThinking } = useBotOpponent({
    grid,
    deck,
    gridSize,
    difficulty,
    enabled: gameState.status === "playing", // stop bot when player finishes
  });

  // Confetti on win
  useEffect(() => {
    if (gameState.status === "won") {
      setTimeout(() => triggerConfetti(), 300);
    }
  }, [gameState.status]);

  // Determine outcome
  const myDone = gameState.status !== "playing";
  const oppDone = botGameState.status !== "playing";

  const showResult =
    gameState.status === "won" ||
    botGameState.status === "won" ||
    (myDone && oppDone);

  const outcome: Outcome | null = showResult
    ? computeOutcome(
        gameState.status,
        gameState.score,
        botGameState.status,
        botGameState.score,
      )
    : null;

  // Track quest progress when player wins against bot
  const questTrackedRef = useRef(false);
  useEffect(() => {
    if (outcome === "win" && !questTrackedRef.current) {
      questTrackedRef.current = true;
      const uid = user && !isGuest ? user.uid : null;
      trackQuestProgress("win_bot_battle", 1, uid).catch(console.error);
    }
  }, [outcome, user, isGuest]);

  return (
    <div className="min-h-screen stadium-bg flex flex-col">
      {/* Nav bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-card/40 backdrop-blur-sm">
        <button
          onClick={() => navigate("/")}
          className="hud-pill"
          aria-label="Back to Hub"
        >
          <ArrowLeft className="w-4 h-4" /> HUB
        </button>
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-primary animate-pulse" />
          <span className="font-display text-xs uppercase tracking-widest text-primary">
            CricBot Practice ({gridSize}×{gridSize})
          </span>
        </div>
        <div className="w-[70px]" /> {/* Spacer to balance Back button */}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-5xl w-full mx-auto p-4 gap-6 items-stretch justify-center">
        {/* Left / Top: Player's game */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 ring-2 ring-emerald-500/30 flex items-center justify-center font-display text-xs font-black text-emerald-400">
                P
              </div>
              <div>
                <div className="text-sm font-display font-bold text-secondary">You</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Player</div>
              </div>
            </div>
            <div className="text-right">
              <div className="scoreboard-font text-xl text-secondary">{gameState.score}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-display">Score</div>
            </div>
          </div>

          <BingoMeter filled={filledCount} total={total} gridSize={gridSize} />

          <div className="flex-1 flex flex-col justify-center items-center py-2 relative">
            <BingoGrid
              categories={gameState.grid}
              gridSize={gridSize}
              placements={gameState.placements}
              feedbackStates={gameState.feedbackStates}
              onCellClick={handleCellClick}
              eligibleCells={eligibleCells}
              winLine={gameState.winLine}
            />
          </div>

          {/* Current card/skips */}
          <div className="h-[120px] flex items-center justify-center">
            {gameState.status === "playing" && currentPlayer && (
              <PlayerCard
                player={currentPlayer}
                remaining={gameState.remainingPlayers}
                total={deck.length}
                onSkip={handleSkip}
                onWildcard={handleWildcard}
                onInfo={() => {}}
                wildcardsLeft={gameState.wildcardsLeft}
                wildcardMode={gameState.wildcardMode}
                onCancelWildcard={cancelWildcard}
              />
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-border/20 self-stretch my-4" />

        {/* Right / Bottom: Bot's game info */}
        <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4 bg-card/25 p-4 rounded-2xl border border-border/20">
          <OpponentPanel
            botGameState={botGameState}
            botFilledCount={botFilledCount}
            isThinking={isThinking}
            gridSize={gridSize}
            difficulty={difficulty}
          />
        </div>
      </div>

      {/* Game Over Modal */}
      {showResult && (
        <BattleResult
          playerState={gameState}
          botState={botGameState}
          playerFilledCount={filledCount}
          botFilledCount={botFilledCount}
          onPlayAgain={onPlayAgain}
        />
      )}
    </div>
  );
}
