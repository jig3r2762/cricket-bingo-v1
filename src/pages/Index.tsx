import { useState, useEffect, useCallback } from "react";
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
import { ArrowLeft, Menu, X, Swords, Coins } from "lucide-react";
import { CoinBalance } from "@/components/wallet/CoinBalance";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { GridCategory } from "@/types/game";
import { shouldUseHashRouter } from "@/lib/iframeUtils";
import { cgGameLoadingStop, cgGameplayStart, cgGameplayStop, cgShowRewardedAd } from "@/lib/crazyGamesSDK";

const IN_IFRAME = shouldUseHashRouter();

const Index = () => {
  const navigate = useNavigate();
  const { loading: playersLoading, error: playersError, players: allPlayers } = usePlayers();

  // Signal CrazyGames SDK that loading is complete once players are ready
  useEffect(() => {
    if (allPlayers.length > 0) cgGameLoadingStop();
  }, [allPlayers.length]);
  const [gridSize, setGridSize] = useState<3 | 4 | null>(() => {
    try {
      const s = localStorage.getItem("cricket-bingo-gridsize");
      return s === "3" ? 3 : s === "4" ? 4 : null;
    } catch { return null; }
  });
  const [timed, setTimed] = useState(false);
  const [gameMode, setGameMode] = useState<"daily" | "ipl">("daily");
  const [sessionGameCount, setSessionGameCount] = useState(1);

  // CrazyGames: auto-start with 3x3, no grid selection friction
  useEffect(() => {
    if (IN_IFRAME && gridSize === null) {
      setGridSize(3);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
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
      <div className="min-h-screen warm-bg flex items-center justify-center">
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
      <div className="min-h-screen warm-bg flex items-center justify-center p-4">
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
      <div className="min-h-screen warm-bg flex items-center justify-center p-4">
        <div className="fixed top-4 right-4 z-50"><ThemeToggle /></div>
        <GridSelection
          onSelect={(size, timedMode, mode) => {
            setGridSize(size);
            setTimed(timedMode ?? false);
            setGameMode(mode ?? "daily");
            try { localStorage.setItem("cricket-bingo-gridsize", String(size)); } catch {}
          }}
          onBattle={() => navigate("/battle")}
        />
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
      <div className="min-h-screen warm-bg flex items-center justify-center">
        <div className="text-secondary/60 font-display text-sm uppercase tracking-widest animate-pulse">
          Loading today's grid...
        </div>
      </div>
    );
  }

  return <GameBoard gridSize={gridSize} timed={timed} mode={gameMode} howToPlay={howToPlay} setHowToPlay={setHowToPlay} adminGrid={adminGrid} gameNumber={sessionGameCount} onPlayAgain={() => setSessionGameCount(c => c + 1)} onBack={() => {
    setGridSize(null);
    setTimed(false);
    setGameMode("daily");
    setSessionGameCount(1);
    try { localStorage.removeItem("cricket-bingo-gridsize"); } catch {}
  }} />;
};

function GameBoard({
  gridSize,
  timed,
  mode,
  howToPlay,
  setHowToPlay,
  adminGrid,
  onBack,
  gameNumber = 1,
  onPlayAgain,
}: {
  gridSize: 3 | 4;
  timed: boolean;
  mode: "daily" | "ipl";
  howToPlay: boolean;
  setHowToPlay: (v: boolean) => void;
  adminGrid?: AdminGrid;
  onBack: () => void;
  gameNumber?: number;
  onPlayAgain?: () => void;
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
    grantWildcard,
    resetGame,
    playRandomGame,
    filledCount,
    remaining,
    isGameOver,
  } = useGameState(gridSize, adminGrid, mode);

  const handleWatchAdForWildcard = useCallback(async () => {
    cgGameplayStop();
    const rewarded = await cgShowRewardedAd();
    cgGameplayStart();
    if (rewarded) grantWildcard();
  }, [grantWildcard]);

  const handlePlayAgain = useCallback(() => {
    playRandomGame();
    onPlayAgain?.();
  }, [playRandomGame, onPlayAgain]);

  const [menuOpen, setMenuOpen] = useState(false);
  const categories = gameState.grid;
  const total = gameState.deck.length;

  return (
    <div className="min-h-screen warm-bg flex flex-col">
      <div
        className={`flex-1 flex flex-col items-center px-3 mx-auto w-full ${IN_IFRAME ? "max-w-xl gap-2 pt-2 pb-4" : "max-w-5xl gap-4 pt-3 pb-24 sm:pb-4"}`}
        style={IN_IFRAME ? { zoom: 0.88 } : undefined}
      >
        {/* User bar with back button */}
        <div className="w-full relative z-30 bg-white border-2 border-gray-200 rounded-2xl px-3 py-2" style={{ boxShadow: "0 3px 0 #e5e7eb" }}>
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="p-2 rounded-xl border-2 border-gray-200 bg-white text-gray-500 hover:text-gray-700 transition-colors"
              style={{ boxShadow: "0 2px 0 #e5e7eb" }}
              title="Back to Grid Selection"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {IN_IFRAME ? (
              /* CrazyGames / iframe mode — show branding text only (no external link) */
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5">
                <span className="text-base leading-none">🏏</span>
                <span className="text-[10px] font-display uppercase tracking-wider text-primary">
                  Cricket Bingo
                </span>
                {mode === "ipl" && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-display uppercase tracking-wider border border-amber-500/50 text-amber-400 bg-amber-500/10">
                    IPL
                  </span>
                )}
              </span>
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
                  <CoinBalance />
                  <button
                    onClick={() => navigate("/battle")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-display uppercase tracking-wider border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    vs Bot
                  </button>
                  {!isGuest && (
                    <button
                      onClick={() => navigate("/paid-battle")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-display uppercase tracking-wider border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      Paid
                    </button>
                  )}
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
            <div className="sm:hidden absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-2xl py-2 px-3 z-50 space-y-1" style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
              <div className="px-3 py-2.5">
                <CoinBalance />
              </div>
              <button
                onClick={() => { setMenuOpen(false); navigate("/battle"); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-display uppercase tracking-wider text-purple-400 hover:bg-purple-500/10 transition-colors flex items-center gap-2"
              >
                <Swords className="w-3.5 h-3.5" />
                vs Bot
              </button>
              {!isGuest && (
                <button
                  onClick={() => { setMenuOpen(false); navigate("/paid-battle"); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-display uppercase tracking-wider text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-2"
                >
                  <Coins className="w-3.5 h-3.5" />
                  Paid Battle
                </button>
              )}
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

        {/* Two-column on desktop, single column on mobile / iframe */}
        <div className={IN_IFRAME ? "contents" : "w-full flex flex-col sm:flex-row sm:items-start sm:gap-6"}>

          {/* Left panel — header, player card, bingo meter */}
          <div className={IN_IFRAME ? "contents" : "flex flex-col gap-4 w-full sm:w-72 lg:w-80 sm:flex-shrink-0"}>
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
              <GameOverScreen gameState={gameState} onReset={handlePlayAgain} gameNumber={IN_IFRAME ? gameNumber : undefined} />
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
                onWatchAdForWildcard={handleWatchAdForWildcard}
              />
              </div>
            ) : null}

            <BingoMeter
              filled={filledCount}
              total={categories.length}
              gridSize={gridSize}
            />
          </div>

          {/* Right panel — bingo grid (fills remaining width on desktop) */}
          <div className={IN_IFRAME ? "contents" : "flex-1"}>
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

        </div>
      </div>

      {/* Mobile bottom bar */}
      {!isGameOver && currentPlayer && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white border-t-2 border-gray-200 p-3 flex items-center justify-between px-5 z-50"
          style={{ boxShadow: "0 -4px 16px rgba(0,0,0,0.08)" }}>
          <button
            onClick={handleSkip}
            className="px-5 py-2.5 rounded-2xl border-2 border-gray-300 text-gray-600 font-body font-bold text-xs uppercase tracking-wider active:scale-95 transition-transform bg-white"
            style={{ boxShadow: "0 3px 0 #d1d5db" }}
          >
            Skip
          </button>
          <div className="text-center">
            <div className="font-display text-2xl leading-none text-candy-orange">{gameState.score}</div>
            <div className="text-[8px] text-muted-foreground uppercase tracking-widest font-body font-bold">Score</div>
          </div>
          <button
            onClick={gameState.wildcardMode ? cancelWildcard : handleWildcard}
            disabled={gameState.wildcardsLeft <= 0 && !gameState.wildcardMode}
            className={`px-5 py-2.5 rounded-2xl font-body font-bold text-xs uppercase tracking-wider active:scale-95 transition-transform border-2
              ${gameState.wildcardMode
                ? "bg-candy-yellow border-yellow-500 text-white"
                : gameState.wildcardsLeft > 0
                  ? "bg-candy-green border-green-600 text-white"
                  : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            style={gameState.wildcardMode
              ? { boxShadow: "0 3px 0 hsl(45 90% 38%)" }
              : gameState.wildcardsLeft > 0
                ? { boxShadow: "0 3px 0 hsl(134 55% 30%)" }
                : {}}
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
