import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { ArrowLeft, LogOut, Menu, Home, Trophy, BarChart3, HelpCircle, Settings, Award, Flame, Coins } from "lucide-react";
import { CoinBalance } from "@/components/wallet/CoinBalance";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
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
  const [timed, setTimed] = useState(true);
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
        className={`relative z-10 flex-1 flex flex-col items-center px-3 mx-auto w-full ${IN_IFRAME ? "max-w-xl gap-2 pt-2 pb-24 sm:pb-4" : "max-w-5xl gap-4 pt-3 pb-24 sm:pb-4"}`}
        style={IN_IFRAME ? { zoom: 0.88 } : undefined}
      >
        {/* Compact top bar — Hub handles main nav, this is just back + key actions.
            Two groups in a wrap-friendly justify-between layout so the right group
            (coin/admin/auth) wraps below the left group on small phones instead of
            overflowing. */}
        <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Left group: back + user identity */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <button
              onClick={onBack}
              className="hud-pill shrink-0 !p-2 flex items-center justify-center"
              title="Back to Hub"
              aria-label="Back to Hub"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline ml-1 text-xs">HUB</span>
            </button>

            {IN_IFRAME ? (
              <span className="hud-pill shrink-0">
                <span className="text-sm">🏏</span>
                <span className="text-xs">CRICKET BINGO</span>
                {mode === "ipl" && <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-secondary/20 text-secondary font-black">IPL</span>}
              </span>
            ) : (
              <div className="hud-pill !px-2 !py-1.5 min-w-0 flex items-center gap-1">
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
                <span className="truncate max-w-[80px] sm:max-w-[140px] hidden sm:inline text-xs">
                  {isGuest ? "GUEST" : (user?.displayName || "PLAYER")}
                </span>
                {!isGuest && (userData?.currentStreak ?? 0) >= 2 && (
                  <span className="text-orange-400 font-black text-[11px] shrink-0">🔥{userData!.currentStreak}</span>
                )}
              </div>
            )}
          </div>

          {/* Right group: coin + admin + auth. Hidden in iframe mode. */}
          {/* Right group: coin + admin + auth. Hidden in iframe mode. */}
          {!IN_IFRAME && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CoinBalance />
              
              {/* Desktop-only controls */}
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
                {isAdmin && (
                  <button
                    onClick={() => navigate("/admin")}
                    className="hud-pill color-cyan !text-[10px] !px-2.5 !py-1"
                  >
                    ADMIN
                  </button>
                )}
                {isGuest ? (
                  <button
                    onClick={() => signInWithGoogle().catch(() => {})}
                    className="hud-pill color-gold !text-[10px] !px-2.5 !py-1"
                  >
                    SIGN IN
                  </button>
                ) : (
                  <button
                    onClick={signOut}
                    className="hud-pill !text-[10px] !p-2 flex items-center justify-center shrink-0"
                    title="Sign out"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Drawer Menu for Mobile Navigation & Stats */}
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    className="hud-pill !p-2 flex items-center justify-center shrink-0"
                    aria-label="Open menu"
                  >
                    <Menu className="w-4 h-4 text-foreground" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-background border-l border-border p-6 flex flex-col justify-between">
                  <div className="flex flex-col gap-6 h-full justify-between">
                    {/* Top Section: Header & Profile info */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-border pb-4">
                        <SheetTitle className="font-display text-lg font-black tracking-wide">
                          CRICKET BINGO
                        </SheetTitle>
                      </div>

                      {/* Profile & Stats Panel */}
                      <div className="candy-card p-4 space-y-4">
                        <div className="flex items-center gap-3">
                          {isGuest ? (
                            <div className="w-12 h-12 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center text-lg font-black text-primary shrink-0">
                              🎮
                            </div>
                          ) : user?.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt=""
                              className="w-12 h-12 rounded-full border-2 border-primary/40 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center text-lg font-black text-primary shrink-0">
                              {(user?.displayName || user?.email || "?")[0].toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-display text-sm font-black truncate">
                              {isGuest ? "GUEST PLAYER" : (user?.displayName || "PLAYER")}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                              {isAdmin ? "Admin" : "Player"}
                            </div>
                          </div>
                        </div>

                        {/* User Stats Grid inside the Drawer */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60">
                          <div className="flex flex-col items-center justify-center bg-background/50 rounded-lg p-2 border border-border/40">
                            <Coins size={14} className="text-yellow-400 mb-1" />
                            <span className="text-[11px] font-black">{userData?.coinBalance ?? 0}</span>
                            <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">Coins</span>
                          </div>
                          <div className="flex flex-col items-center justify-center bg-background/50 rounded-lg p-2 border border-border/40">
                            <Flame size={14} className="text-pink-500 mb-1" />
                            <span className="text-[11px] font-black">{userData?.currentStreak ?? 0}</span>
                            <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">Streak</span>
                          </div>
                          <div className="flex flex-col items-center justify-center bg-background/50 rounded-lg p-2 border border-border/40">
                            <Award size={14} className="text-primary mb-1" />
                            <span className="text-[10px] font-black truncate max-w-full text-center">
                              {isAdmin ? "ADMIN" : "PLAYING"}
                            </span>
                            <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">Rank</span>
                          </div>
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="flex flex-col gap-2">
                        <SheetClose asChild>
                          <button
                            onClick={onBack}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors text-sm font-bold w-full text-left"
                          >
                            <Home size={16} className="text-muted-foreground" />
                            Back to Hub
                          </button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link to="/leaderboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors text-sm font-bold">
                            <Trophy size={16} className="text-muted-foreground" />
                            Leaderboard
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link to="/stats" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors text-sm font-bold">
                            <BarChart3 size={16} className="text-muted-foreground" />
                            My Stats
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link to="/how-to-play" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors text-sm font-bold">
                            <HelpCircle size={16} className="text-muted-foreground" />
                            How to Play
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link to="/about" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors text-sm font-bold">
                            <Settings size={16} className="text-muted-foreground" />
                            About
                          </Link>
                        </SheetClose>
                        {isAdmin && (
                          <SheetClose asChild>
                            <Link to="/admin" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors text-sm font-bold text-cyan-400">
                              <Settings size={16} className="text-cyan-400" />
                              Admin Panel
                            </Link>
                          </SheetClose>
                        )}
                      </div>
                    </div>

                    {/* Bottom Section: Theme & Auth Actions */}
                    <div className="space-y-4 border-t border-border pt-4">
                      {isGuest ? (
                        <button
                          onClick={() => signInWithGoogle().catch(() => {})}
                          className="hud-pill w-full justify-center gap-2 text-gold border-gold/30 hover:bg-gold/10"
                        >
                          SIGN IN
                        </button>
                      ) : (
                        <button
                          onClick={signOut}
                          className="hud-pill w-full justify-center gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          <LogOut size={14} />
                          SIGN OUT
                        </button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
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
              recommendedCell={null}
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
