import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { GridSelection } from "@/components/game/GridSelection";
import { PlayerCard } from "@/components/game/PlayerCard";
import { BingoGrid } from "@/components/game/BingoGrid";
import { BingoMeter } from "@/components/game/BingoMeter";
import { GameHeader } from "@/components/game/GameHeader";
import { HowToPlayModal } from "@/components/game/HowToPlayModal";
import { GameOverScreen } from "@/components/game/GameOverScreen";
import { TurnTimer } from "@/components/game/TurnTimer";
import { InteractiveTutorial, TUTORIAL_DONE_KEY } from "@/components/game/InteractiveTutorial";
import { NotificationPrompt } from "@/components/game/NotificationPrompt";
import { useGameState, type AdminGrid } from "@/hooks/useGameState";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayers } from "@/contexts/PlayersContext";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { getTodayDateString } from "@/lib/dailyGame";
import { ArrowLeft, Menu, X } from "lucide-react";
import type { GridCategory } from "@/types/game";
import { isInIframe } from "@/lib/iframeUtils";

const IN_IFRAME = isInIframe();

const Index = () => {
  const { loading: playersLoading, error: playersError } = usePlayers();
  const [gridSize, setGridSize] = useState<3 | 4 | null>(() => {
    try {
      const s = localStorage.getItem("cricket-bingo-gridsize");
      return s === "3" ? 3 : s === "4" ? 4 : null;
    } catch { return null; }
  });
  const [timed, setTimed] = useState(false);
  const [howToPlay, setHowToPlay] = useState(false);
  const [adminGrid, setAdminGrid] = useState<AdminGrid | undefined>(undefined);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [tutorialDone, setTutorialDone] = useState(() => {
    try {
      return (
        localStorage.getItem(TUTORIAL_DONE_KEY) === "true" ||
        localStorage.getItem("cricket-bingo-onboarded") === "true"
      );
    } catch {
      return true;
    }
  });

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

  if (playersLoading) {
    return (
      <div className="min-h-screen stadium-bg flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-bounce">🏏</div>
          <div className="text-secondary/60 font-display text-sm uppercase tracking-widest animate-pulse">
            Loading players...
          </div>
        </div>
      </div>
    );
  }

  if (playersError) {
    return (
      <div className="min-h-screen stadium-bg flex items-center justify-center p-4">
        <div className="text-center space-y-3 max-w-sm">
          <div className="text-4xl">⚠️</div>
          <p className="text-destructive font-display text-sm uppercase tracking-wider">
            Failed to load player data
          </p>
          <p className="text-muted-foreground text-xs">{playersError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg text-xs font-display uppercase tracking-wider bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!gridSize) {
    return (
      <div className="min-h-screen stadium-bg flex items-center justify-center p-4">
        <GridSelection onSelect={(size, timedMode) => {
          setGridSize(size);
          setTimed(timedMode ?? false);
          try { localStorage.setItem("cricket-bingo-gridsize", String(size)); } catch {}
        }} />
        <AnimatePresence>
          {!tutorialDone && (
            <InteractiveTutorial onComplete={() => setTutorialDone(true)} />
          )}
        </AnimatePresence>
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

  return <GameBoard gridSize={gridSize} timed={timed} howToPlay={howToPlay} setHowToPlay={setHowToPlay} adminGrid={adminGrid} onBack={() => {
    setGridSize(null);
    setTimed(false);
    try { localStorage.removeItem("cricket-bingo-gridsize"); } catch {}
  }} />;
};

function GameBoard({
  gridSize,
  timed,
  howToPlay,
  setHowToPlay,
  adminGrid,
  onBack,
}: {
  gridSize: 3 | 4;
  timed: boolean;
  howToPlay: boolean;
  setHowToPlay: (v: boolean) => void;
  adminGrid?: AdminGrid;
  onBack: () => void;
}) {
  const { user, userData, signOut, isAdmin, isGuest, signInWithGoogle } = useAuth();
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

  const [menuOpen, setMenuOpen] = useState(false);
  const categories = gameState.grid;
  const total = gameState.deck.length;

  return (
    <div className="min-h-screen stadium-bg flex flex-col">
      <div className="flex-1 flex flex-col items-center gap-4 px-3 pt-3 pb-24 sm:pb-4 max-w-xl mx-auto w-full">
        {/* User bar with back button */}
        <div className="w-full relative z-30 bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl px-3 py-2">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="p-2 rounded-lg border border-border/30 text-muted-foreground hover:text-secondary transition-colors"
              title="Back to Grid Selection"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {IN_IFRAME ? (
              /* CrazyGames / iframe mode — show branding link instead of auth */
              <a
                href="https://cricket-bingo.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <span className="text-base leading-none">🏏</span>
                <span className="text-[10px] font-display uppercase tracking-wider text-primary">
                  cricket-bingo.in
                </span>
              </a>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  {isGuest ? (
                    <div className="w-8 h-8 rounded-full bg-secondary/20 ring-2 ring-secondary/30 flex items-center justify-center text-lg">
                      🎮
                    </div>
                  ) : user?.photoURL ? (
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
                      {isGuest ? "Guest" : (user?.displayName || "Player")}
                      {!isGuest && (userData?.currentStreak ?? 0) >= 2 && (
                        <span className="ml-1.5 text-orange-400 text-xs">{"\u{1F525}"}{userData!.currentStreak}</span>
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 truncate max-w-[140px] leading-tight">
                      {isGuest ? "Sign in to save progress" : user?.email}
                    </span>
                  </div>
                </div>
                {/* Desktop nav buttons */}
                <div className="hidden sm:flex items-center gap-2">
                  {!isGuest && (
                    <>
                      <button
                        onClick={() => navigate("/stats")}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-display uppercase tracking-wider border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      >
                        Stats
                      </button>
                      <button
                        onClick={() => navigate("/leaderboard")}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-display uppercase tracking-wider border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        Ranks
                      </button>
                    </>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => navigate("/admin")}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-display uppercase tracking-wider border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                    >
                      Admin
                    </button>
                  )}
                  {isGuest ? (
                    <button
                      onClick={() => signInWithGoogle().catch(() => {})}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-display uppercase tracking-wider border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                    >
                      Sign In
                    </button>
                  ) : (
                    <button
                      onClick={signOut}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-display uppercase tracking-wider border border-border/30 text-muted-foreground hover:text-secondary transition-colors"
                    >
                      Sign Out
                    </button>
                  )}
                </div>
                {/* Mobile hamburger */}
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="sm:hidden p-2 rounded-lg border border-border/30 text-muted-foreground hover:text-secondary transition-colors"
                >
                  {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            )}
          </div>

          {/* Mobile dropdown menu — only in non-iframe mode */}
          {!IN_IFRAME && menuOpen && (
            <div className="sm:hidden absolute top-full left-0 right-0 mt-1 bg-card/95 backdrop-blur-md border border-border/30 rounded-xl py-2 px-3 z-50 space-y-1">
              {!isGuest && (
                <>
                  <button
                    onClick={() => { setMenuOpen(false); navigate("/stats"); }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-display uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    Stats
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); navigate("/leaderboard"); }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-display uppercase tracking-wider text-amber-400 hover:bg-amber-500/10 transition-colors"
                  >
                    Ranks
                  </button>
                </>
              )}
              {isAdmin && (
                <button
                  onClick={() => { setMenuOpen(false); navigate("/admin"); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-display uppercase tracking-wider text-primary hover:bg-primary/10 transition-colors"
                >
                  Admin
                </button>
              )}
              {isGuest ? (
                <button
                  onClick={() => { setMenuOpen(false); signInWithGoogle().catch(() => {}); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-display uppercase tracking-wider text-primary hover:bg-primary/10 transition-colors"
                >
                  Sign In
                </button>
              ) : (
                <button
                  onClick={() => { setMenuOpen(false); signOut(); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-display uppercase tracking-wider text-muted-foreground hover:bg-muted/20 transition-colors"
                >
                  Sign Out
                </button>
              )}
            </div>
          )}
        </div>

        <GameHeader score={gameState.score} streak={gameState.streak} onHowToPlay={() => setHowToPlay(true)} />

        {timed && !isGameOver && currentPlayer && (
          <TurnTimer
            duration={10}
            turnKey={gameState.deckIndex}
            onTimeUp={handleSkip}
            paused={isGameOver}
          />
        )}

        {isGameOver ? (
          <GameOverScreen gameState={gameState} onReset={playRandomGame} />
        ) : currentPlayer ? (
          <div className="relative z-10 w-full">
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
          </div>
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
      <NotificationPrompt />
    </div>
  );
}

export default Index;
