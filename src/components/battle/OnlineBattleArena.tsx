import { useEffect, useRef, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Swords, Trophy, Users, RotateCcw, Home, Timer } from "lucide-react";
import { BingoGrid } from "@/components/game/BingoGrid";
import { BingoMeter } from "@/components/game/BingoMeter";
import { PlayerCard } from "@/components/game/PlayerCard";
import { GameHeader } from "@/components/game/GameHeader";
import { TurnTimer } from "@/components/game/TurnTimer";
import { useBattleGame } from "@/hooks/useBattleGame";
import { subscribeToRoom, updateProgress, type PlayerProgress, type RoomData } from "@/hooks/useOnlineBattle";
import { triggerConfetti } from "@/lib/confetti";
import type { CricketPlayer, GridCategory } from "@/types/game";

interface OnlineBattleArenaProps {
  roomId: string;
  myRole: "host" | "guest";
  grid: GridCategory[];
  deck: CricketPlayer[];
  gridSize: 3 | 4;
  myName: string;
  opponentName: string;
  onPlayAgain: () => void;
}

type Outcome = "win" | "lose" | "draw";

function computeOutcome(
  myStatus: "playing" | "won" | "lost",
  myScore: number,
  myFilled: number,
  oppStatus: "playing" | "won" | "lost",
  oppScore: number,
): Outcome {
  if (myStatus === "won" && oppStatus !== "won") return "win";
  if (oppStatus === "won" && myStatus !== "won") return "lose";
  // both won or both lost → compare scores
  if (myScore > oppScore) return "win";
  if (oppScore > myScore) return "lose";
  return "draw";
}

export function OnlineBattleArena({
  roomId, myRole, grid, deck, gridSize, myName, opponentName, onPlayAgain,
}: OnlineBattleArenaProps) {
  const navigate = useNavigate();
  const total = gridSize * gridSize;

  // Local game (my side)
  const {
    gameState, currentPlayer, eligibleCells, recommendedCell,
    handleCellClick, handleSkip, handleWildcard, cancelWildcard, filledCount,
  } = useBattleGame({ grid, deck, gridSize });

  // Opponent's live progress from Firestore
  const [oppProgress, setOppProgress] = useState<PlayerProgress | null>(null);

  // Build playerMap for resolving opponent's placements
  const playerMap = useMemo(() => new Map(deck.map((p) => [p.id, p])), [deck]);

  // Opponent's placements resolved to CricketPlayer objects
  const oppPlacements = useMemo<Record<string, CricketPlayer | null>>(() => {
    if (!oppProgress?.placements) return {};
    const result: Record<string, CricketPlayer | null> = {};
    for (const [catId, pid] of Object.entries(oppProgress.placements)) {
      result[catId] = playerMap.get(pid) ?? null;
    }
    return result;
  }, [oppProgress?.placements, playerMap]);

  // Subscribe to Firestore for opponent's updates
  useEffect(() => {
    const oppRole = myRole === "host" ? "guest" : "host";
    return subscribeToRoom(roomId, (data: RoomData | null) => {
      if (!data) return;
      const prog = myRole === "host" ? data.guest : data.host;
      setOppProgress(prog);
    });
  }, [roomId, myRole]);

  // Sync my progress to Firestore after each turn
  const prevDeckIndex = useRef(-1);
  useEffect(() => {
    if (gameState.deckIndex === prevDeckIndex.current && gameState.status === "playing") return;
    prevDeckIndex.current = gameState.deckIndex;

    const placements: Record<string, string> = {};
    for (const [catId, player] of Object.entries(gameState.placements)) {
      if (player) placements[catId] = player.id;
    }

    updateProgress(roomId, myRole, {
      placements,
      score: gameState.score,
      filledCount,
      status: gameState.status,
    }).catch(() => {});
  }, [gameState.deckIndex, gameState.status, roomId, myRole, filledCount, gameState.score, gameState.placements]);

  // Confetti on win
  useEffect(() => {
    if (gameState.status === "won") {
      setTimeout(() => triggerConfetti(), 300);
    }
  }, [gameState.status]);

  // Determine if game is over and what the outcome is
  const myDone = gameState.status !== "playing";
  const oppDone = oppProgress?.status !== undefined && oppProgress.status !== "playing";

  const showResult =
    gameState.status === "won" ||
    oppProgress?.status === "won" ||
    (myDone && oppDone);

  const outcome: Outcome | null = showResult
    ? computeOutcome(
        gameState.status,
        gameState.score,
        filledCount,
        oppProgress?.status ?? "playing",
        oppProgress?.score ?? 0,
      )
    : null;

  const oppFilledCount = oppProgress?.filledCount ?? 0;

  return (
    <div className="min-h-screen stadium-bg flex flex-col">
      {/* Nav bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-card/40 backdrop-blur-sm">
        <button
          onClick={() => navigate("/play")}
          className="p-2 rounded-lg border border-border/30 text-muted-foreground hover:text-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-primary" />
          <span className="font-display text-xs uppercase tracking-widest text-primary">
            {gridSize}×{gridSize} · Room {roomId}
          </span>
          <span className="flex items-center gap-1 text-orange-400 font-display text-[10px] uppercase tracking-wider border border-orange-400/30 rounded px-1.5 py-0.5">
            <Timer className="w-3 h-3" /> 10s
          </span>
        </div>
        <div className="w-9" />
      </div>

      {/* Main layout: player left | opponent right (stacked on mobile) */}
      <div className="flex-1 flex flex-col sm:flex-row gap-4 px-3 py-4 max-w-5xl mx-auto w-full">

        {/* ── MY SIDE ── */}
        <div className="flex-1 flex flex-col gap-3">
          {/* My name chip */}
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-full bg-secondary/20 ring-2 ring-secondary/30 flex items-center justify-center text-sm font-bold text-secondary">
              {myName[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="text-sm font-display text-secondary font-bold truncate max-w-[160px]">{myName}</span>
            <span className="text-[10px] font-display uppercase tracking-wider text-primary/60 border border-primary/20 rounded px-1.5 py-0.5">
              You
            </span>
          </div>

          <GameHeader score={gameState.score} streak={gameState.streak} onHowToPlay={() => {}} />

          {currentPlayer && !myDone && (
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

          {currentPlayer && !myDone && (
            <TurnTimer
              duration={10}
              turnKey={gameState.deckIndex}
              onTimeUp={handleSkip}
              paused={myDone}
            />
          )}

          {myDone && !showResult && (
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="font-display text-sm text-muted-foreground uppercase tracking-wider">
                {gameState.status === "won" ? "✅ Grid complete! Waiting for opponent..." : "Game over — waiting for opponent..."}
              </p>
            </div>
          )}

          <BingoMeter filled={filledCount} total={total} gridSize={gridSize} />

          <BingoGrid
            categories={gameState.grid}
            gridSize={gridSize}
            placements={gameState.placements}
            feedbackStates={gameState.feedbackStates}
            onCellClick={handleCellClick}
            eligibleCells={myDone ? [] : eligibleCells}
            recommendedCell={myDone ? null : recommendedCell}
            wildcardMode={gameState.wildcardMode}
            winLine={gameState.winLine}
          />
        </div>

        {/* ── DIVIDER ── */}
        <div className="hidden sm:flex flex-col items-center gap-2 py-4">
          <div className="w-px flex-1 bg-border/30" />
          <Swords className="w-5 h-5 text-primary/40" />
          <div className="w-px flex-1 bg-border/30" />
        </div>

        {/* ── OPPONENT SIDE ── */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Opponent header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 ring-2 ring-primary/30 flex items-center justify-center text-sm font-bold text-primary">
                {opponentName[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <span className="text-sm font-display font-bold text-secondary truncate max-w-[120px] block">
                  {opponentName}
                </span>
                {oppProgress?.status === "won" && (
                  <span className="text-[10px] text-yellow-400 font-display uppercase tracking-wider">Completed!</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="scoreboard-font text-xl text-secondary">{oppProgress?.score ?? 0}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-display">Score</div>
            </div>
          </div>

          {/* Opponent's meter — always visible */}
          <BingoMeter filled={oppFilledCount} total={total} gridSize={gridSize} />

          {/* Opponent's grid — read-only, hidden on mobile */}
          <div className="hidden sm:block opacity-75 pointer-events-none">
            <BingoGrid
              categories={grid}
              gridSize={gridSize}
              placements={oppPlacements}
              feedbackStates={{}}
              onCellClick={() => {}}
              eligibleCells={[]}
            />
          </div>

          {/* Mobile: show opponent fills count */}
          <div className="sm:hidden text-center">
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-display">
                Opponent: <span className="text-secondary font-bold">{oppFilledCount}/{total}</span> cells
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      {!myDone && currentPlayer && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden player-bar border-t border-border/50 p-3 flex items-center justify-between px-5 z-40">
          <button
            onClick={handleSkip}
            className="px-5 py-2.5 rounded-xl border border-secondary/50 text-secondary font-display text-xs uppercase tracking-wider active:scale-95 transition-transform"
          >
            Skip
          </button>
          <div className="text-center">
            <div className="scoreboard-font text-xl text-secondary leading-none">{gameState.score}</div>
            <div className="text-[8px] text-muted-foreground uppercase tracking-widest font-display">Score</div>
          </div>
          <button
            onClick={gameState.wildcardMode ? cancelWildcard : handleWildcard}
            disabled={gameState.wildcardsLeft <= 0 && !gameState.wildcardMode}
            className={`px-5 py-2.5 rounded-xl font-display text-xs uppercase tracking-wider active:scale-95 transition-transform
              ${gameState.wildcardMode
                ? "bg-yellow-400/20 border border-yellow-400/50 text-yellow-400"
                : gameState.wildcardsLeft > 0
                  ? "bg-primary/15 border border-primary/50 text-primary"
                  : "bg-muted/30 border border-muted/30 text-muted-foreground cursor-not-allowed"
              }`}
          >
            {gameState.wildcardMode ? "Cancel" : "Wild"}
          </button>
        </div>
      )}

      {/* Result overlay */}
      {showResult && outcome && (
        <ResultOverlay
          outcome={outcome}
          myName={myName}
          opponentName={opponentName}
          myScore={gameState.score}
          myFilled={filledCount}
          oppScore={oppProgress?.score ?? 0}
          oppFilled={oppFilledCount}
          total={total}
          onPlayAgain={onPlayAgain}
          onHome={() => navigate("/play")}
        />
      )}
    </div>
  );
}

// ── Result overlay ────────────────────────────────────────────────────────────
function ResultOverlay({
  outcome, myName, opponentName, myScore, myFilled, oppScore, oppFilled, total, onPlayAgain, onHome,
}: {
  outcome: Outcome;
  myName: string;
  opponentName: string;
  myScore: number;
  myFilled: number;
  oppScore: number;
  oppFilled: number;
  total: number;
  onPlayAgain: () => void;
  onHome: () => void;
}) {
  const headline =
    outcome === "win" ? "You Win! 🏆" :
    outcome === "lose" ? `${opponentName} Wins!` :
    "It's a Draw! 🤝";

  const headlineColor =
    outcome === "win" ? "text-yellow-400" :
    outcome === "lose" ? "text-red-400" :
    "text-secondary";

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
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
          className="flex justify-center"
        >
          {outcome === "win"
            ? <Trophy className="w-16 h-16 text-yellow-400 drop-shadow-lg" />
            : outcome === "lose"
            ? <Users className="w-16 h-16 text-red-400" />
            : <Swords className="w-16 h-16 text-secondary" />
          }
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`font-display text-3xl font-extrabold uppercase tracking-wider ${headlineColor}`}
        >
          {headline}
        </motion.h2>

        {/* Score table */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl overflow-hidden border border-border/30"
        >
          <div className="grid grid-cols-3 text-[10px] font-display uppercase tracking-wider text-muted-foreground bg-muted/20 px-3 py-2">
            <span className="text-left truncate">{myName}</span>
            <span className="text-center">Stat</span>
            <span className="text-right truncate">{opponentName}</span>
          </div>
          {[
            { label: "Score", my: myScore, opp: oppScore },
            { label: "Cells", my: `${myFilled}/${total}`, opp: `${oppFilled}/${total}` },
          ].map((row) => (
            <div key={row.label} className="grid grid-cols-3 px-3 py-2.5 text-sm border-t border-border/20">
              <span className={`text-left font-bold ${outcome === "win" ? "text-secondary" : "text-muted-foreground"}`}>
                {row.my}
              </span>
              <span className="text-center text-[10px] font-display uppercase tracking-wider text-muted-foreground self-center">
                {row.label}
              </span>
              <span className={`text-right font-bold ${outcome === "lose" ? "text-red-400" : "text-muted-foreground"}`}>
                {row.opp}
              </span>
            </div>
          ))}
        </motion.div>

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
            onClick={onHome}
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
