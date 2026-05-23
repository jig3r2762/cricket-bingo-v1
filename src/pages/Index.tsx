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
import { ArrowLeft } from "lucide-react";
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
      <div className="min-h-screen game-bg flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <div className="text-muted-foreground font-display text-sm uppercase tracking-widest">
            Loading players...
          </div>
        </div>
      </div>
    );
  }

  if (playersError) {
    return (
      <div className="min-h-screen game-bg flex items-center justify-center p-4">
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
      <div className="min-h-screen game-bg flex items-center justify-center p-4">
        <div className="fixed top-4 right-4 z-50"><ThemeToggle /></div>
        <GridSelection
          onSelect={(size, timedMode, mode) => {
            setGridSize(size);
            setTimed(timedMode ?? false);
            setGameMode(mode ?? "daily");
            try { localStorage.setItem("cricket-bingo-gridsize", String(size)); } catch {}
          }}
          onBattle={() => navigate("/battle")}
          onGuess={() => navigate("/guess")}
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
      <div className="min-h-screen game-bg flex items-center justify-center">
        <div className="text-secondary/60 font-display text-sm uppercase tracking-widest animate-pulse">
          Loading today's grid...
        </div>
      </div>
    );
  }

  return <GameBoard gridSize={gridSize} timed={timed} mode={gameMode} howToPlay={howToPlay} setHowToPlay={setHowToPlay} adminGrid={adminGrid} gameNumber={sessionGameCount} onPlayAgain={() => setSessionGameCount(c => c + 1)} onBack={() => {
    // Back to Hub. Clear local state so a future /play visit starts fresh at GridSelection.
    setGridSize(null);
    setTimed(false);
    setGameMode("daily");
    setSessionGameCount(1);
    try { localStorage.removeItem("cricket-bingo-gridsize"); } catch {}
    navigate("/");
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

  const categories = gameState.grid;
  const total = gameState.deck.length;

  return (
    <div className="min-h-screen stadium-bg flex flex-col relative">
      <div
        className={`relative z-10 flex-1 flex flex-col items-center px-3 mx-auto w-full ${IN_IFRAME ? "max-w-xl gap-2 pt-2 pb-4" : "max-w-5xl gap-4 pt-3 pb-24 sm:pb-4"}`}
        style={IN_IFRAME ? { zoom: 0.88 } : undefined}
      >
        {/* Compact top bar — Hub handles main nav, this is just back + key actions.
            Two groups in a wrap-friendly justify-between layout so the right group
            (coin/admin/auth) wraps below the left group on small phones instead of
            overflowing. */}
        <div className="w-full flex items-center justify-between gap-2 flex-wrap">
          {/* Left group: back + user identity */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <button
              onClick={onBack}
              className="hud-pill shrink-0"
              title="Back to Hub"
              aria-label="Back to Hub"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">HUB</span>
            </button>

            {IN_IFRAME ? (
              <span className="hud-pill">
                <span className="text-sm">🏏</span>
                <span>CRICKET BINGO</span>
                {mode === "ipl" && <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-secondary/20 text-secondary font-black">IPL</span>}
              </span>
            ) : (
              <div className="hud-pill !px-2 !py-1.5 min-w-0">
                {isGuest ? (
                  <span className="text-base shrink-0">🎮</span>
                ) : user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt=""
                    className="w-5 h-5 rounded-full shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-primary/25 flex items-center justify-center text-[10px] font-black text-primary shrink-0">
                    {(user?.displayName || user?.email || "?")[0].toUpperCase()}
                  </span>
                )}
                <span className="truncate max-w-[80px] sm:max-w-[140px]">
                  {isGuest ? "GUEST" : (user?.displayName || "PLAYER")}
                </span>
                {!isGuest && (userData?.currentStreak ?? 0) >= 2 && (
                  <span className="text-orange-400 font-black text-[11px] shrink-0">🔥{userData!.currentStreak}</span>
                )}
              </div>
            )}
          </div>

          {/* Right group: coin + admin + auth. Hidden in iframe mode. */}
          {!IN_IFRAME && (
            <div className="flex items-center gap-2 flex-wrap">
              <CoinBalance />
              {isAdmin && (
                <button
                  onClick={() => navigate("/admin")}
                  className="hud-pill color-cyan !text-[10px]"
                >
                  ADMIN
                </button>
              )}
              {isGuest ? (
                <button
                  onClick={() => signInWithGoogle().catch(() => {})}
                  className="hud-pill color-gold !text-[10px]"
                >
                  SIGN IN
                </button>
              ) : (
                <button
                  onClick={signOut}
                  className="hud-pill !text-[10px]"
                  title="Sign out"
                >
                  OUT
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

      {/* Mobile bottom bar — chunky action dock */}
      {!isGameOver && currentPlayer && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 px-3 pt-2 safe-bottom backdrop-blur-md"
             style={{ background: "linear-gradient(180deg, transparent, hsl(var(--background)) 30%)" }}>
          <div className="scoreboard flex items-center justify-between gap-3 px-4 py-3">
            <button onClick={handleSkip} className="cta-chunky size-sm color-yellow">
              <span className="relative z-10">SKIP</span>
            </button>
            <div className="text-center px-2">
              <div className="score-display color-green text-3xl leading-none">{gameState.score}</div>
              <div className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">Score</div>
            </div>
            <button
              onClick={gameState.wildcardMode ? cancelWildcard : handleWildcard}
              disabled={gameState.wildcardsLeft <= 0 && !gameState.wildcardMode}
              className={`cta-chunky size-sm ${
                gameState.wildcardMode
                  ? "color-orange"
                  : gameState.wildcardsLeft > 0
                    ? "color-green"
                    : "is-disabled"
              }`}
            >
              <span className="relative z-10">{gameState.wildcardMode ? "CANCEL" : "WILD"}</span>
            </button>
          </div>
        </div>
      )}

      <HowToPlayModal open={howToPlay} onClose={() => setHowToPlay(false)} />
      <NotificationPrompt />
    </div>
  );
}

export default Index;
