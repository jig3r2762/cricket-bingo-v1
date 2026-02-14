import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GridSelection } from "@/components/game/GridSelection";
import { PlayerCard } from "@/components/game/PlayerCard";
import { BingoGrid } from "@/components/game/BingoGrid";
import { BingoMeter } from "@/components/game/BingoMeter";
import { GameHeader } from "@/components/game/GameHeader";
import { HowToPlayModal } from "@/components/game/HowToPlayModal";
import { GameOverScreen } from "@/components/game/GameOverScreen";
import { useGameState, type AdminGrid } from "@/hooks/useGameState";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { getTodayDateString } from "@/lib/dailyGame";
import type { GridCategory } from "@/types/game";

const Index = () => {
  const [gridSize, setGridSize] = useState<3 | 4 | null>(null);
  const [howToPlay, setHowToPlay] = useState(false);
  const [adminGrid, setAdminGrid] = useState<AdminGrid | undefined>(undefined);
  const [loadingGrid, setLoadingGrid] = useState(false);

  // Listen for admin-set grid in real time (updates live when admin saves)
  useEffect(() => {
    if (!gridSize) return;
    setLoadingGrid(true);

    const today = getTodayDateString();
    const ref = doc(db, "dailyGrid", `${today}-${gridSize}`);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setAdminGrid({
            grid: data.grid as GridCategory[],
            deckPlayerIds: data.deck as string[],
          });
        }
        setLoadingGrid(false);
      },
      () => {
        // Firestore unavailable — fall back to local generation
        setLoadingGrid(false);
      },
    );

    return unsubscribe;
  }, [gridSize]);

  if (!gridSize) {
    return (
      <div className="min-h-screen stadium-bg flex items-center justify-center p-4">
        <GridSelection onSelect={setGridSize} />
      </div>
    );
  }

  if (loadingGrid) {
    return (
      <div className="min-h-screen stadium-bg flex items-center justify-center">
        <div className="text-secondary/60 font-display text-sm uppercase tracking-widest animate-pulse">
          Loading today's grid...
        </div>
      </div>
    );
  }

  return <GameBoard gridSize={gridSize} howToPlay={howToPlay} setHowToPlay={setHowToPlay} adminGrid={adminGrid} />;
};

function GameBoard({
  gridSize,
  howToPlay,
  setHowToPlay,
  adminGrid,
}: {
  gridSize: 3 | 4;
  howToPlay: boolean;
  setHowToPlay: (v: boolean) => void;
  adminGrid?: AdminGrid;
}) {
  const { user, userData, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const {
    gameState,
    currentPlayer,
    eligibleCells,
    recommendedCell,
    handleCellClick,
    handleSkip,
    handleWildcard,
    cancelWildcard,
    resetGame,
    playRandomGame,
    filledCount,
    remaining,
    isGameOver,
  } = useGameState(gridSize, adminGrid);

  const categories = gameState.grid;
  const total = gameState.deck.length;

  return (
    <div className="min-h-screen stadium-bg flex flex-col">
      <div className="flex-1 flex flex-col items-center gap-4 px-3 pt-3 pb-24 sm:pb-4 max-w-xl mx-auto w-full">
        {/* User bar */}
        <div className="w-full flex items-center justify-between bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl px-3 py-2">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="w-8 h-8 rounded-full ring-2 ring-primary/30"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 ring-2 ring-primary/30 flex items-center justify-center text-sm text-primary font-bold">
                {(user?.displayName || user?.email || "?")[0].toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm text-secondary font-medium truncate max-w-[140px] leading-tight">
                {user?.displayName || "Player"}
                {(userData?.currentStreak ?? 0) >= 2 && (
                  <span className="ml-1.5 text-orange-400 text-xs">{"\u{1F525}"}{userData!.currentStreak}</span>
                )}
              </span>
              <span className="text-[10px] text-muted-foreground/60 truncate max-w-[140px] leading-tight">
                {user?.email}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/leaderboard")}
              className="px-3 py-1.5 rounded-lg text-[10px] font-display uppercase tracking-wider border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              Ranks
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="px-3 py-1.5 rounded-lg text-[10px] font-display uppercase tracking-wider border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
              >
                Admin
              </button>
            )}
            <button
              onClick={signOut}
              className="px-3 py-1.5 rounded-lg text-[10px] font-display uppercase tracking-wider border border-border/30 text-muted-foreground hover:text-secondary transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        <GameHeader score={gameState.score} streak={gameState.streak} onHowToPlay={() => setHowToPlay(true)} />

        {isGameOver ? (
          <GameOverScreen gameState={gameState} onReset={playRandomGame} />
        ) : currentPlayer ? (
          <PlayerCard
            player={currentPlayer}
            remaining={remaining}
            total={total}
            onSkip={handleSkip}
            onWildcard={handleWildcard}
            onInfo={() => setHowToPlay(true)}
            wildcardsLeft={gameState.wildcardsLeft}
            wildcardMode={gameState.wildcardMode}
            onCancelWildcard={cancelWildcard}
          />
        ) : null}

        <BingoMeter
          filled={filledCount}
          total={categories.length}
          gridSize={gridSize}
        />

        <BingoGrid
          categories={categories}
          gridSize={gridSize}
          placements={gameState.placements}
          feedbackStates={gameState.feedbackStates}
          onCellClick={handleCellClick}
          eligibleCells={eligibleCells}
          recommendedCell={recommendedCell}
          wildcardMode={gameState.wildcardMode}
          winLine={gameState.winLine}
        />
      </div>

      {/* Mobile bottom bar */}
      {!isGameOver && currentPlayer && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden player-bar border-t border-border/50 p-3 flex items-center justify-between px-5 z-50">
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

      <HowToPlayModal open={howToPlay} onClose={() => setHowToPlay(false)} />
    </div>
  );
}

export default Index;
