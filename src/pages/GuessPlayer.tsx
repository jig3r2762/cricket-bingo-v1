import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayers } from "@/contexts/PlayersContext";
import { useGuessGame } from "@/hooks/useGuessGame";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { CricketPlayer } from "@/types/game";
import { shareGameResults } from "@/lib/share";
import { toast } from "sonner";
import { getTodayDateString } from "@/lib/dailyGame";

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
        className="rounded-full object-cover border-4 border-candy-green"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-candy-green flex items-center justify-center text-white font-display"
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

  // Close dropdown on click outside
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
        placeholder="Type a player name..."
        className="w-full px-4 py-3 rounded-xl border border-border bg-card font-body font-semibold text-sm
                   focus:border-candy-green focus:outline-none focus:ring-2 focus:ring-candy-green/30
                   disabled:opacity-50 disabled:cursor-not-allowed
                   "
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

/* ───────────────────────── clue card ───────────────────────── */

function ClueCard({
  icon,
  label,
  text,
  color,
  index,
  revealed,
}: {
  icon: string;
  label: string;
  text: string;
  color: string;
  index: number;
  revealed: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: revealed ? 1 : 0.3, x: 0 }}
      transition={{ delay: revealed ? index * 0.15 : 0 }}
      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
        revealed
          ? "border-border bg-card"
          : "border-dashed border-border bg-muted/40"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          revealed ? color : "bg-muted dark:bg-gray-700"
        }`}
        style={revealed ? { boxShadow: "0 3px 0 rgba(0,0,0,0.15)" } : {}}
      >
        <span className="text-lg">{revealed ? icon : "?"}</span>
      </div>
      <div className="min-w-0">
        <div className="font-body font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
          {revealed ? label : `Clue ${index + 1}`}
        </div>
        <div className="font-body font-semibold text-sm text-foreground truncate">
          {revealed ? text : "Reveal this clue..."}
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────────────────── lives display ───────────────────────── */

function LivesDisplay({ lives, max }: { lives: number; max: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <motion.span
          key={i}
          animate={i >= lives ? { scale: [1, 0.5], opacity: [1, 0.3] } : {}}
          className="text-xl"
        >
          {i < lives ? "❤️" : "🖤"}
        </motion.span>
      ))}
    </div>
  );
}

/* ───────────────────────── result overlay ───────────────────────── */

function RoundResult({
  round,
  onNext,
  isLast,
}: {
  round: ReturnType<typeof useGuessGame>["game"] extends infer G
    ? G extends { rounds: (infer R)[] }
      ? R
      : never
    : never;
  onNext: () => void;
  isLast: boolean;
}) {
  if (!round.guessed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4 mt-6"
    >
      <HeadshotOrInitials player={round.player} size={96} />
      <div>
        <h3 className="font-display text-2xl text-foreground">{round.player.name}</h3>
        <p className="font-body text-sm text-muted-foreground">
          {round.player.countryFlag} {round.player.country} · {round.player.primaryRole}
          {round.player.iplTeams.length > 0 && ` · ${round.player.iplTeams.join(", ")}`}
        </p>
      </div>

      {round.correct ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <div className="inline-block px-6 py-2 rounded-full bg-candy-green text-white font-display text-lg">
            +{round.pointsEarned} pts
          </div>
        </motion.div>
      ) : round.skipped ? (
        <div className="inline-block px-6 py-2 rounded-full bg-gray-300 dark:bg-gray-600 text-foreground font-display text-lg">
          Skipped
        </div>
      ) : (
        <div className="inline-block px-6 py-2 rounded-full bg-candy-red text-white font-display text-lg">
          Wrong!
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="candy-btn candy-btn-green text-sm px-8 py-3"
      >
        {isLast ? "See Results" : "Next Player →"}
      </motion.button>
    </motion.div>
  );
}

/* ───────────────────────── game over ───────────────────────── */

/* ───────────────────────── game over ───────────────────────── */

function GameOverScreen({
  game,
  onPlayAgain,
  onHome,
}: {
  game: NonNullable<ReturnType<typeof useGuessGame>["game"]>;
  onPlayAgain: () => void;
  onHome: () => void;
}) {
  const correctCount = game.rounds.filter((r) => r.correct).length;
  const totalPlayed = game.rounds.filter((r) => r.guessed).length;
  const isDaily = game.mode === "daily";

  const getMessage = () => {
    if (isDaily) {
      const r = game.rounds[0];
      if (r && r.correct) {
        return { emoji: "🎯", text: "Daily Guess Correct!" };
      }
      return { emoji: "❌", text: "Better luck tomorrow!" };
    }
    if (correctCount === 10) return { emoji: "🏆", text: "Perfect Game!" };
    if (correctCount >= 8) return { emoji: "🔥", text: "Cricket Expert!" };
    if (correctCount >= 5) return { emoji: "👏", text: "Well Played!" };
    if (correctCount >= 3) return { emoji: "💪", text: "Good Try!" };
    return { emoji: "📚", text: "Keep Learning!" };
  };

  const msg = getMessage();

  const getStreak = () => {
    if (isDaily) {
      return (game as any).dailyStreak || parseInt(localStorage.getItem("cricket_bingo_daily_guess_streak") || "0", 10);
    }
    return game.maxStreak;
  };

  const getShareText = () => {
    if (isDaily) {
      const r = game.rounds[0];
      const dateStr = getTodayDateString();
      let attemptStatus = "";
      let emojiBlocks = "";
      if (r.correct) {
        attemptStatus = `Guessed the player in ${r.cluesRevealed} clues!`;
        emojiBlocks = "🟩 ".repeat(r.cluesRevealed) + "⬜ ".repeat(5 - r.cluesRevealed);
        emojiBlocks = emojiBlocks.trim();
      } else if (r.skipped) {
        attemptStatus = "Skipped!";
        emojiBlocks = "⬜ ⬜ ⬜ ⬜ ⬜";
      } else {
        attemptStatus = "Attempt failed!";
        emojiBlocks = "🟥 🟥 🟥 🟥 🟥";
      }
      const streak = getStreak();
      const streakText = streak > 0 ? ` | Streak: ${streak}🔥` : "";
      return `🏏 Cricket Guess #Daily (${dateStr})\n\n${attemptStatus}\n${emojiBlocks}\nScore: ${game.score} pts${streakText}\n\nPlay here: cricket-bingo.in/guess`;
    } else {
      return `🏏 Guess the Cricketer (Practice)!\n\nI got ${correctCount}/${totalPlayed} correct\nScore: ${game.score} | Best streak: ${game.maxStreak}🔥\n\nPlay here: cricket-bingo.in/guess`;
    }
  };

  const handleShare = async () => {
    const shareText = getShareText();
    const sharedNatively = await shareGameResults(shareText, "Guess the Cricketer");
    if (!sharedNatively) {
      toast.success("Score copied to clipboard!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen warm-bg flex items-center justify-center p-4"
    >
      <div className="candy-card p-8 max-w-md w-full text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="text-6xl"
        >
          {msg.emoji}
        </motion.div>

        <h1 className="font-display text-3xl text-foreground">{msg.text}</h1>

        <div className="grid grid-cols-3 gap-3">
          <div className="candy-card py-3">
            <div className="font-display text-2xl text-candy-green">{correctCount}/{totalPlayed}</div>
            <div className="font-body font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Correct</div>
          </div>
          <div className="candy-card py-3">
            <div className="font-display text-2xl text-candy-orange">{game.score}</div>
            <div className="font-body font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Score</div>
          </div>
          <div className="candy-card py-3">
            <div className="font-display text-2xl text-candy-red">{getStreak()}{isDaily ? "🔥" : "🔥"}</div>
            <div className="font-body font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Streak</div>
          </div>
        </div>

        {/* Round-by-round summary */}
        {!isDaily && (
          <div className="flex justify-center gap-1 flex-wrap">
            {game.rounds
              .filter((r) => r.guessed)
              .map((r, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    r.correct
                      ? "bg-candy-green text-white"
                      : r.skipped
                        ? "bg-gray-300 dark:bg-gray-600 text-foreground"
                        : "bg-candy-red text-white"
                  }`}
                >
                  {r.correct ? "✓" : r.skipped ? "–" : "✗"}
                </div>
              ))}
          </div>
        )}

        {isDaily && game.rounds[0]?.guessed && (
          <div className="candy-card p-4 space-y-3">
            <h4 className="font-body font-bold text-xs uppercase tracking-wider text-muted-foreground">Today's Mystery Cricketer</h4>
            <HeadshotOrInitials player={game.rounds[0].player} size={80} />
            <div className="font-display text-lg font-bold text-foreground">{game.rounds[0].player.name}</div>
            <p className="text-xs text-muted-foreground leading-normal">
              {game.rounds[0].player.countryFlag} {game.rounds[0].player.country} · {game.rounds[0].player.primaryRole}
              {game.rounds[0].player.iplTeams.length > 0 && ` · ${game.rounds[0].player.iplTeams.join(", ")}`}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {isDaily ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPlayAgain}
              className="candy-btn candy-btn-green text-base px-8 py-4 w-full"
            >
              🎮 Try Practice Mode
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPlayAgain}
              className="candy-btn candy-btn-green text-base px-8 py-4 w-full"
            >
              🎮 Play Again
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleShare}
            className="candy-btn candy-btn-orange text-sm px-8 py-3 w-full"
          >
            📤 Share Result
          </motion.button>
          <button
            onClick={onHome}
            className="font-body font-bold text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────────────────── start screen ───────────────────────── */

/* ───────────────────────── start screen ───────────────────────── */

interface StartScreenProps {
  onStartPractice: () => void;
  onStartDaily: () => void;
  dailyCompleted: boolean;
  onViewDailyResults: () => void;
  onBack: () => void;
}

function StartScreen({
  onStartPractice,
  onStartDaily,
  dailyCompleted,
  onViewDailyResults,
  onBack,
}: StartScreenProps) {
  const dailyStreak = parseInt(localStorage.getItem("cricket_bingo_daily_guess_streak") || "0", 10);

  return (
    <div className="min-h-screen stadium-bg flex items-center justify-center p-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="scoreboard p-7 max-w-md w-full text-center space-y-5 relative z-10"
      >
        <motion.div
          animate={{ rotate: [-6, 6, -6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl"
        >
          🕵️
        </motion.div>
        <h1 className="font-display text-3xl font-black uppercase tracking-wider gold-text">
          Guess the Cricketer
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We&apos;ll show you clues about a mystery cricket player — one at a time.
          Guess who it is with fewer clues for more points!
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="candy-card p-4 text-center">
            <h3 className="font-display text-lg text-candy-green leading-none">Daily Challenge</h3>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">1 Player · Seeded</p>
            {dailyStreak > 0 && (
              <div className="text-xs text-candy-orange font-bold mt-2">
                Streak: {dailyStreak} 🔥
              </div>
            )}
          </div>
          <div className="candy-card p-4 text-center">
            <h3 className="font-display text-lg text-candy-orange leading-none">Practice Mode</h3>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">10 Rounds · Random</p>
          </div>
        </div>

        <div className="candy-card p-4 space-y-2 text-left">
          <div className="font-display font-extrabold text-xs uppercase tracking-widest text-primary/70 mb-2">Scoring</div>
          {[
            { pts: 300, color: "text-primary", label: "Guess with 3 clues" },
            { pts: 200, color: "text-secondary", label: "Reveal 4th clue" },
            { pts: 100, color: "text-destructive", label: "Reveal all 5 clues" },
          ].map((row) => (
            <div key={row.pts} className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{row.label}</span>
              <span className={`font-display text-sm font-black ${row.color}`}>{row.pts} pts</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 mt-2">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              Streak bonus: +50% per consecutive correct
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {dailyCompleted ? (
            <button onClick={onViewDailyResults} className="cta-chunky color-green size-lg w-full">
              <span className="relative z-10 flex items-center justify-center gap-2">
                📊 VIEW TODAY'S DAILY RESULT
              </span>
            </button>
          ) : (
            <button onClick={onStartDaily} className="cta-chunky color-green size-lg w-full">
              <span className="relative z-10 flex items-center justify-center gap-2">
                🎯 PLAY DAILY CHALLENGE
              </span>
            </button>
          )}

          <button onClick={onStartPractice} className="cta-chunky color-orange size-lg w-full">
            <span className="relative z-10 flex items-center justify-center gap-2">
              🎮 RANDOM PRACTICE MODE
            </span>
          </button>
        </div>

        <button
          onClick={onBack}
          className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors pt-1"
        >
          ← Back to Hub
        </button>
      </motion.div>
    </div>
  );
}

/* ───────────────────────── main page ───────────────────────── */

export default function GuessPlayer() {
  const navigate = useNavigate();
  const { players, loading } = usePlayers();
  const { game, startGame, revealNextClue, submitGuess, skipRound, nextRound, restoreGame, totalRounds, maxClues } =
    useGuessGame(players);

  const todayStr = useMemo(() => getTodayDateString(), []);

  // Check if daily is completed for today
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [savedDailyState, setSavedDailyState] = useState<any>(null);

  useEffect(() => {
    try {
      const savedDate = localStorage.getItem("cricket_bingo_daily_guess_date");
      const savedStateStr = localStorage.getItem("cricket_bingo_daily_guess_state");
      if (savedDate === todayStr && savedStateStr) {
        const parsed = JSON.parse(savedStateStr);
        setDailyCompleted(true);
        setSavedDailyState(parsed);
      } else {
        setDailyCompleted(false);
        setSavedDailyState(null);
      }
    } catch (e) {
      console.error("Failed to load daily guess state", e);
    }
  }, [todayStr]);

  // When game changes, check if daily game finished, and save it
  useEffect(() => {
    if (game && game.mode === "daily" && game.status === "finished") {
      try {
        const isCorrect = game.rounds[0]?.correct;
        let newStreak = 0;
        if (isCorrect) {
          const currentStreak = parseInt(localStorage.getItem("cricket_bingo_daily_guess_streak") || "0", 10);
          newStreak = currentStreak + 1;
          localStorage.setItem("cricket_bingo_daily_guess_streak", newStreak.toString());
        } else {
          localStorage.setItem("cricket_bingo_daily_guess_streak", "0");
        }

        // Save game state
        const savedState = {
          ...game,
          dailyStreak: newStreak, // attach streak to the saved state
        };

        localStorage.setItem("cricket_bingo_daily_guess_date", todayStr);
        localStorage.setItem("cricket_bingo_daily_guess_state", JSON.stringify(savedState));
        setDailyCompleted(true);
        setSavedDailyState(savedState);
      } catch (e) {
        console.error("Failed to save daily guess state", e);
      }
    }
  }, [game, todayStr]);

  const handleStartDaily = () => {
    if (dailyCompleted && savedDailyState) {
      restoreGame(savedDailyState);
    } else {
      startGame("daily");
    }
  };

  const handleStartPractice = () => {
    startGame("practice");
  };

  const handleViewDailyResults = () => {
    if (savedDailyState) {
      restoreGame(savedDailyState);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen warm-bg flex items-center justify-center">
        <div className="text-muted-foreground font-display text-sm uppercase tracking-widest animate-pulse">
          Loading players...
        </div>
      </div>
    );
  }

  // Start screen
  if (!game) {
    return (
      <StartScreen
        onStartPractice={handleStartPractice}
        onStartDaily={handleStartDaily}
        dailyCompleted={dailyCompleted}
        onViewDailyResults={handleViewDailyResults}
        onBack={() => navigate("/")}
      />
    );
  }

  // Game over
  if (game.status === "finished") {
    return (
      <GameOverScreen
        game={game}
        onPlayAgain={handleStartPractice}
        onHome={() => navigate("/")}
      />
    );
  }

  const round = game.rounds[game.currentRound];
  const hasGuessed = round.guessed;
  const allCluesRevealed = round.cluesRevealed >= maxClues;

  return (
    <div className="min-h-screen warm-bg">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-card/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="font-body font-bold text-sm text-muted-foreground hover:text-foreground"
          >
            ← Exit
          </button>

          <div className="flex items-center gap-4">
            <div className="font-display text-sm text-candy-green">{game.score} pts</div>
            {game.streak > 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="font-display text-sm text-candy-orange"
              >
                {game.streak}🔥
              </motion.div>
            )}
            <LivesDisplay lives={game.lives} max={game.mode === "daily" ? 1 : 3} />
          </div>

          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <div className="font-body font-bold text-xs text-muted-foreground uppercase tracking-widest">
            Round {game.currentRound + 1} of {totalRounds}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: totalRounds }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < game.currentRound
                    ? game.rounds[i].correct
                      ? "bg-candy-green"
                      : game.rounds[i].skipped
                        ? "bg-gray-300"
                        : "bg-candy-red"
                    : i === game.currentRound
                      ? "bg-candy-orange"
                      : "bg-muted dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mystery heading */}
        <div className="text-center">
          <motion.div
            key={game.currentRound}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-xl text-foreground"
          >
            {hasGuessed ? "" : "🕵️ Who is this cricketer?"}
          </motion.div>
        </div>

        {/* Clues */}
        {!hasGuessed && (
          <motion.div
            key={`clues-${game.currentRound}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {round.clues.map((clue, i) => (
              <ClueCard
                key={i}
                icon={clue.icon}
                label={clue.label}
                text={clue.text}
                color={clue.color}
                index={i}
                revealed={i < round.cluesRevealed}
              />
            ))}
          </motion.div>
        )}

        {/* Actions */}
        {!hasGuessed && (
          <div className="space-y-4">
            {/* Reveal next clue button */}
            {!allCluesRevealed && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={revealNextClue}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-candy-orange text-candy-orange font-body font-bold text-sm hover:bg-candy-orange/5 transition-colors"
              >
                💡 Reveal Next Clue (−100 pts)
              </motion.button>
            )}

            {/* Search input */}
            <PlayerSearch
              players={players}
              onSelect={submitGuess}
              disabled={hasGuessed}
            />

            {/* Skip */}
            <button
              onClick={skipRound}
              className="w-full font-body font-bold text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Skip this round →
            </button>
          </div>
        )}

        {/* Round result */}
        <AnimatePresence>
          {hasGuessed && (
            <RoundResult
              round={round}
              onNext={nextRound}
              isLast={game.currentRound >= totalRounds - 1 || game.lives <= 0}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
