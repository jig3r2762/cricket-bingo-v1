import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayers } from "@/contexts/PlayersContext";
import { ThemeToggle } from "@/components/web/ThemeToggle";
import type { CricketPlayer } from "@/types/game";
import { shareGameResults } from "@/lib/share";
import { toast } from "sonner";
import { getTodayDateString } from "@/lib/dailyGame";
import { triggerLightTap, triggerSuccessHaptic, triggerErrorHaptic } from "@/lib/haptics";

/* ───────────────────────── Seeded RNG (mulberry32) ───────────────────────── */
function createRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateSeed(dateStr: string): number {
  let hash = 0;
  const key = "cricket-bingo-chase-" + dateStr;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return hash;
}

/* ───────────────────────── Clue Generation ───────────────────────── */
function generateChaseClues(player: CricketPlayer, rng?: () => number): string[] {
  const random = rng || Math.random;
  const clues: string[] = [];

  // Ball 1: Stat clue
  const s = player.stats;
  let statText = "";
  if (s.totalRuns >= 5000) {
    statText = `Scored ${Math.floor(s.totalRuns / 1000) * 1000}+ international runs in career.`;
  } else if (s.totalWickets >= 150) {
    statText = `Taken ${Math.floor(s.totalWickets / 50) * 50}+ international wickets in career.`;
  } else if (s.iplRuns >= 1000) {
    statText = `Scored ${Math.floor(s.iplRuns / 500) * 500}+ IPL runs.`;
  } else if (s.iplWickets >= 50) {
    statText = `Taken ${Math.floor(s.iplWickets / 25) * 25}+ IPL wickets.`;
  } else {
    statText = `Played ${s.odiMatches + s.testMatches + s.t20iMatches + s.iplMatches} matches across formats.`;
  }
  clues.push(statText);

  // Ball 2: Trophies or achievements
  let achievementsText = "Trophies: None";
  if (player.trophies.length > 0) {
    const tNames = player.trophies.map((t) => {
      if (t === "IPL") return "IPL Champion";
      if (t === "CWC") return "World Cup Winner";
      if (t === "T20WC") return "T20 World Cup Winner";
      if (t === "CT") return "Champions Trophy Winner";
      return t;
    });
    achievementsText = `Trophies: ${tNames.join(", ")}`;
  } else if (player.categories && player.categories.includes("Captains")) {
    achievementsText = "Has captained their international national team.";
  } else if (player.stats.centuries > 0) {
    achievementsText = `Has scored ${player.stats.centuries} international century/centuries.`;
  } else {
    const formats: string[] = [];
    if (player.stats.testMatches > 0) formats.push("Tests");
    if (player.stats.odiMatches > 0) formats.push("ODIs");
    if (player.stats.t20iMatches > 0) formats.push("T20Is");
    achievementsText = `Has represented their country in ${formats.join(" & ")} formats.`;
  }
  clues.push(achievementsText);

  // Ball 3: IPL Teams
  const teamsText =
    player.iplTeams.length > 0
      ? `IPL Franchises represented: ${player.iplTeams.join(", ")}`
      : "Has never played in the IPL.";
  clues.push(teamsText);

  // Ball 4: Role
  const roleText = `Primary playing role: ${player.primaryRole}`;
  clues.push(roleText);

  // Ball 5: Nickname or special categories
  let specText = "";
  if (player.categories && player.categories.includes("Aggressive Batsmen")) {
    specText = "Known in the community for an aggressive batting style.";
  } else if (player.categories && player.categories.includes("T20 Specialist")) {
    specText = "Recognized as a T20 format specialist.";
  } else if (player.stats.iplCenturies > 0) {
    specText = `Has scored ${player.stats.iplCenturies} century/centuries in the IPL.`;
  } else {
    specText = `Primary format: ${player.stats.testMatches > player.stats.t20iMatches ? "Test matches" : "T20 matches"}`;
  }
  clues.push(specText);

  // Ball 6: Nationality
  const natText = `Plays for/from country: ${player.countryFlag} ${player.country}`;
  clues.push(natText);

  return clues;
}

/* ───────────────────────── helpers ───────────────────────── */
function HeadshotOrInitials({ player, size = 80 }: { player: CricketPlayer; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const initials = player.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (player.headshot_url && !imgError) {
    return (
      <img
        src={player.headshot_url}
        alt={player.name}
        width={size}
        height={size}
        className="rounded-full object-cover border-4 border-candy-green mx-auto"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-candy-green flex items-center justify-center text-white font-display mx-auto"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

/* ───────────────────────── autocomplete ───────────────────────── */
function PlayerSearch({
  players,
  onSelect,
  disabled,
}: {
  players: CricketPlayer[];
  onSelect: (id: string) => void;
  disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return players
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, players]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        listRef.current &&
        !listRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (id: string) => {
    setQuery("");
    setOpen(false);
    onSelect(id);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        disabled={disabled}
        placeholder="Type player name here..."
        className="w-full px-4 py-3 rounded-xl border border-border bg-card font-body font-semibold text-sm
                   focus:border-candy-green focus:outline-none focus:ring-2 focus:ring-candy-green/30
                   disabled:opacity-50 disabled:cursor-not-allowed text-center"
      />
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
          >
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className="w-full text-left px-4 py-3 hover:bg-primary/8 flex items-center gap-3 transition-colors border-b last:border-b-0 border-border"
              >
                <span className="text-lg">{p.countryFlag}</span>
                <div>
                  <div className="font-body font-bold text-sm text-foreground">{p.name}</div>
                  <div className="font-body text-xs text-muted-foreground">
                    {p.primaryRole} · {p.iplTeams.join(", ") || p.country}
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── MAIN PAGE ───────────────────────── */
export default function ChaseGame() {
  const navigate = useNavigate();
  const { players, loading } = usePlayers();

  const [mode, setMode] = useState<"menu" | "daily" | "practice">("menu");
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [currentBall, setCurrentBall] = useState(1); // 1 to 6
  const [selectedPlayer, setSelectedPlayer] = useState<CricketPlayer | null>(null);
  const [clues, setClues] = useState<string[]>([]);
  const [deliveries, setDeliveries] = useState<(number | "W" | null)[]>([null, null, null, null, null, null]);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [savedDailyState, setSavedDailyState] = useState<any>(null);

  const todayStr = useMemo(() => getTodayDateString(), []);

  // Filter only guessable players (needs enough stats)
  const guessablePool = useMemo(() => {
    return players.filter((p) => {
      const totalMatches =
        p.stats.testMatches + p.stats.odiMatches + p.stats.t20iMatches + p.stats.iplMatches;
      return totalMatches >= 10 && p.iplTeams.length > 0 && p.name.length > 0;
    });
  }, [players]);

  // Load daily completed state from localStorage
  useEffect(() => {
    try {
      const savedDate = localStorage.getItem("cricket_bingo_daily_chase_date");
      const savedStateStr = localStorage.getItem("cricket_bingo_daily_chase_state");
      if (savedDate === todayStr && savedStateStr) {
        const parsed = JSON.parse(savedStateStr);
        setDailyCompleted(true);
        setSavedDailyState(parsed);
      } else {
        setDailyCompleted(false);
        setSavedDailyState(null);
      }
    } catch (e) {
      console.error("Failed to load daily chase state", e);
    }
  }, [todayStr]);

  const startChase = (gameMode: "daily" | "practice") => {
    triggerLightTap().catch(() => {});
    if (gameMode === "daily" && dailyCompleted && savedDailyState) {
      // Restore daily
      setSelectedPlayer(savedDailyState.player);
      setClues(savedDailyState.clues);
      setDeliveries(savedDailyState.deliveries);
      setCurrentBall(savedDailyState.currentBall);
      setGameState(savedDailyState.gameState);
      setMode("daily");
      return;
    }

    let targetPlayer: CricketPlayer;
    if (gameMode === "daily") {
      const seed = dateSeed(todayStr);
      const rng = createRng(seed);
      const index = Math.floor(rng() * guessablePool.length);
      targetPlayer = guessablePool[index];
    } else {
      const index = Math.floor(Math.random() * guessablePool.length);
      targetPlayer = guessablePool[index];
    }

    const playerSeed = dateSeed(todayStr + "-" + targetPlayer.id + "-chase-clues");
    const playerRng = gameMode === "daily" ? createRng(playerSeed) : undefined;
    const generatedClues = generateChaseClues(targetPlayer, playerRng);

    setSelectedPlayer(targetPlayer);
    setClues(generatedClues);
    setDeliveries([null, null, null, null, null, null]);
    setCurrentBall(1);
    setGameState("playing");
    setMode(gameMode);
  };

  const handleGuess = (guessedPlayerId: string) => {
    if (!selectedPlayer || gameState !== "playing") return;

    const isCorrect = guessedPlayerId === selectedPlayer.id;

    if (isCorrect) {
      triggerSuccessHaptic().catch(() => {});
      // Hits runs based on current ball
      // Ball 1: 6 runs, Ball 2: 4 runs, Ball 3: 3 runs, Ball 4: 2 runs, Ball 5: 1 run, Ball 6: 1 run
      const runMap: Record<number, number> = { 1: 6, 2: 4, 3: 3, 4: 2, 5: 1, 6: 1 };
      const runs = runMap[currentBall] || 1;

      const newDeliveries = [...deliveries];
      newDeliveries[currentBall - 1] = runs;
      setDeliveries(newDeliveries);
      setGameState("won");

      if (mode === "daily") {
        const currentStreak = parseInt(
          localStorage.getItem("cricket_bingo_daily_chase_streak") || "0",
          10
        );
        const newStreak = currentStreak + 1;
        localStorage.setItem("cricket_bingo_daily_chase_streak", newStreak.toString());

        const stateToSave = {
          player: selectedPlayer,
          clues,
          deliveries: newDeliveries,
          currentBall,
          gameState: "won",
          dailyStreak: newStreak,
        };
        localStorage.setItem("cricket_bingo_daily_chase_date", todayStr);
        localStorage.setItem("cricket_bingo_daily_chase_state", JSON.stringify(stateToSave));
        setDailyCompleted(true);
        setSavedDailyState(stateToSave);
      }
    } else {
      triggerErrorHaptic().catch(() => {});
      const newDeliveries = [...deliveries];
      newDeliveries[currentBall - 1] = "W";
      setDeliveries(newDeliveries);

      if (currentBall >= 6) {
        setGameState("lost");
        if (mode === "daily") {
          localStorage.setItem("cricket_bingo_daily_chase_streak", "0");
          const stateToSave = {
            player: selectedPlayer,
            clues,
            deliveries: newDeliveries,
            currentBall: 6,
            gameState: "lost",
            dailyStreak: 0,
          };
          localStorage.setItem("cricket_bingo_daily_chase_date", todayStr);
          localStorage.setItem("cricket_bingo_daily_chase_state", JSON.stringify(stateToSave));
          setDailyCompleted(true);
          setSavedDailyState(stateToSave);
        }
      } else {
        setCurrentBall(currentBall + 1);
      }
    }
  };

  const handleShare = async () => {
    if (!selectedPlayer) return;
    const isDaily = mode === "daily";
    const streak = isDaily
      ? savedDailyState?.dailyStreak ||
        parseInt(localStorage.getItem("cricket_bingo_daily_chase_streak") || "0", 10)
      : 0;

    let text = "";
    if (gameState === "won") {
      const runs = deliveries.find((d) => typeof d === "number") || 1;
      text = `🏏 Cricket Guess #6BallChase (${isDaily ? todayStr : "Practice"})\n\nResult: Won! Hit a ${runs}️⃣ on Ball ${currentBall}!\n🔥 Streak: ${streak > 0 ? `${streak}🔥` : "1"}\n\nPlay here: cricket-bingo.in/chase`;
    } else {
      text = `🏏 Cricket Guess #6BallChase (${isDaily ? todayStr : "Practice"})\n\nResult: Bowled Out! 🔴\n\nPlay here: cricket-bingo.in/chase`;
    }

    const shared = await shareGameResults(text, "6-Ball Over Run Chase");
    if (!shared) {
      toast.success("Score copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen warm-bg flex items-center justify-center">
        <div className="text-muted-foreground font-display text-sm uppercase tracking-widest animate-pulse">
          Preparing pitch...
        </div>
      </div>
    );
  }

  // --- Render Menu Screen ---
  if (mode === "menu") {
    const activeStreak = parseInt(localStorage.getItem("cricket_bingo_daily_chase_streak") || "0", 10);
    return (
      <div className="min-h-screen stadium-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="scoreboard p-8 max-w-md w-full text-center space-y-6 relative z-10"
        >
          <div className="text-6xl animate-bounce">🏏</div>
          <h1 className="font-display text-3xl font-black uppercase tracking-wider gold-text">
            6-Ball Run Chase
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You have **one over (6 balls)** to chase the target score by identifying the mystery cricketer. 
            Each wrong guess bowls a delivery, revealing an easier clue. Guess early to hit a **Sixer**!
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="candy-card p-4 text-center">
              <h3 className="font-display text-lg text-candy-green leading-none">Daily Chase</h3>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">1 Player · Seeded</p>
              {activeStreak > 0 && (
                <div className="text-xs text-candy-orange font-bold mt-2">
                  Streak: {activeStreak} 🔥
                </div>
              )}
            </div>
            <div className="candy-card p-4 text-center">
              <h3 className="font-display text-lg text-candy-orange leading-none">Infinite Practice</h3>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">Endless · Random</p>
            </div>
          </div>

          <div className="candy-card p-4 text-left text-xs text-muted-foreground space-y-2">
            <div className="font-display font-extrabold uppercase tracking-widest text-primary/70 mb-1 text-center">Scoring Breakdown</div>
            <div className="flex justify-between"><span>Ball 1 Guess (Sixer)</span><span className="font-bold text-primary">6 Runs</span></div>
            <div className="flex justify-between"><span>Ball 2 Guess (Boundary)</span><span className="font-bold text-secondary">4 Runs</span></div>
            <div className="flex justify-between"><span>Ball 3 Guess (Triple)</span><span className="font-bold">3 Runs</span></div>
            <div className="flex justify-between"><span>Ball 4 Guess (Double)</span><span className="font-bold">2 Runs</span></div>
            <div className="flex justify-between"><span>Ball 5/6 Guess (Single)</span><span className="font-bold">1 Run</span></div>
            <div className="flex justify-between border-t border-border pt-1 mt-1"><span>Wrong on all 6</span><span className="font-bold text-destructive">Wicket / Out</span></div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {dailyCompleted ? (
              <button onClick={() => startChase("daily")} className="cta-chunky color-green size-lg w-full">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  📊 VIEW TODAY'S CHASE RESULT
                </span>
              </button>
            ) : (
              <button onClick={() => startChase("daily")} className="cta-chunky color-green size-lg w-full">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  🎯 START DAILY CHASE
                </span>
              </button>
            )}

            <button onClick={() => startChase("practice")} className="cta-chunky color-orange size-lg w-full">
              <span className="relative z-10 flex items-center justify-center gap-2">
                ⚡ INFINITE PRACTICE MODE
              </span>
            </button>
          </div>

          <button
            onClick={() => navigate("/")}
            className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors pt-1 block mx-auto"
          >
            ← Back to Hub
          </button>
        </motion.div>
      </div>
    );
  }

  // --- Render Gameplay or Results Screen ---
  return (
    <div className="min-h-screen warm-bg">
      <div className="sticky top-0 z-40 bg-card/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMode("menu")}
            className="font-body font-bold text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
          <div className="font-display text-sm font-bold text-foreground">
            {mode === "daily" ? "📆 DAILY CHASE" : "⚡ PRACTICE CHASE"}
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Scorecard Over Indicator */}
        <div className="candy-card p-4 text-center">
          <div className="font-display font-extrabold text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Over Progress</div>
          <div className="flex justify-center gap-2.5">
            {deliveries.map((val, idx) => {
              const active = currentBall === idx + 1 && gameState === "playing";
              return (
                <div
                  key={idx}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-display text-sm font-black border-2 transition-all ${
                    val === "W"
                      ? "bg-candy-red border-candy-red text-white"
                      : typeof val === "number"
                        ? "bg-candy-green border-candy-green text-white"
                        : active
                          ? "border-candy-orange text-candy-orange scale-110 shadow-lg"
                          : "border-border text-muted-foreground bg-muted/20"
                  }`}
                >
                  {val === "W" ? "W" : typeof val === "number" ? val : idx + 1}
                </div>
              );
            })}
          </div>
        </div>

        {gameState === "playing" ? (
          <div className="space-y-6 text-center">
            {/* Clue Panel */}
            <div className="scoreboard p-6 space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-candy-orange/10 border border-candy-orange/30 text-candy-orange text-xs font-display font-bold uppercase tracking-wider">
                Ball {currentBall} Clue
              </div>
              <motion.p
                key={currentBall}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-body text-base font-semibold leading-relaxed text-foreground"
              >
                {clues[currentBall - 1]}
              </motion.p>
            </div>

            {/* Guess Inputs */}
            <div className="space-y-4 pt-2">
              <PlayerSearch players={players} onSelect={handleGuess} disabled={false} />
              <button
                onClick={() => handleGuess("skip-ball")}
                className="w-full font-body font-bold text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Dot Ball / Skip Clue →
              </button>
            </div>
          </div>
        ) : (
          /* GameOver / Results Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="scoreboard p-8 text-center space-y-6"
          >
            <div className="text-6xl">{gameState === "won" ? "🏆" : "🔴"}</div>
            <h2 className="font-display text-3xl font-black uppercase text-foreground">
              {gameState === "won" ? "MATCH WON!" : "BOWLED OUT!"}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {gameState === "won"
                ? `Incredible chase! You guessed the player correctly on Ball ${currentBall} and hit a ${deliveries.find((d) => typeof d === "number")}!`
                : "You couldn't chase down the target and got bowled out. Better luck in the next match!"}
            </p>

            {/* Answer Display */}
            {selectedPlayer && (
              <div className="candy-card p-4 space-y-3">
                <h4 className="font-body font-bold text-xs uppercase tracking-wider text-muted-foreground">Today's Mystery Cricketer</h4>
                <HeadshotOrInitials player={selectedPlayer} size={80} />
                <div className="font-display text-lg font-bold text-foreground">{selectedPlayer.name}</div>
                <p className="text-xs text-muted-foreground leading-normal">
                  {selectedPlayer.countryFlag} {selectedPlayer.country} · {selectedPlayer.primaryRole}
                  {selectedPlayer.iplTeams.length > 0 && ` · ${selectedPlayer.iplTeams.join(", ")}`}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              {mode === "daily" ? (
                <button
                  onClick={() => startChase("practice")}
                  className="candy-btn candy-btn-green text-base px-8 py-4 w-full"
                >
                  🎮 Try Practice Mode
                </button>
              ) : (
                <button
                  onClick={() => startChase("practice")}
                  className="candy-btn candy-btn-green text-base px-8 py-4 w-full"
                >
                  🎮 Play Again
                </button>
              )}
              <button
                onClick={handleShare}
                className="candy-btn candy-btn-orange text-sm px-8 py-3 w-full"
              >
                📤 Share Result
              </button>
              <button
                onClick={() => setMode("menu")}
                className="font-body font-bold text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Selection
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
