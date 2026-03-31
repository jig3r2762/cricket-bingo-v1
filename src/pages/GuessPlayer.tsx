import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayers } from "@/contexts/PlayersContext";
import { useGuessGame } from "@/hooks/useGuessGame";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { CricketPlayer } from "@/types/game";

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
        className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 bg-white font-body font-semibold text-sm
                   focus:border-candy-green focus:outline-none focus:ring-2 focus:ring-candy-green/30
                   disabled:opacity-50 disabled:cursor-not-allowed
                   dark:bg-gray-800 dark:border-gray-600 dark:text-white"
      />
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-2xl shadow-xl overflow-hidden"
          >
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className="w-full text-left px-4 py-3 hover:bg-candy-green/10 flex items-center gap-3 transition-colors border-b last:border-b-0 border-gray-100 dark:border-gray-700"
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
          ? "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
          : "border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          revealed ? color : "bg-gray-200 dark:bg-gray-700"
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

  const getMessage = () => {
    if (correctCount === 10) return { emoji: "🏆", text: "Perfect Game!" };
    if (correctCount >= 8) return { emoji: "🔥", text: "Cricket Expert!" };
    if (correctCount >= 5) return { emoji: "👏", text: "Well Played!" };
    if (correctCount >= 3) return { emoji: "💪", text: "Good Try!" };
    return { emoji: "📚", text: "Keep Learning!" };
  };

  const msg = getMessage();

  const shareText = `🏏 Guess the Cricketer!\n\nI got ${correctCount}/${totalPlayed} correct\nScore: ${game.score} | Best streak: ${game.maxStreak}🔥\n\nPlay at cricket-bingo.in/guess`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
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
            <div className="font-display text-2xl text-candy-red">{game.maxStreak}🔥</div>
            <div className="font-body font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Streak</div>
          </div>
        </div>

        {/* Round-by-round summary */}
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

        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlayAgain}
            className="candy-btn candy-btn-green text-base px-8 py-4 w-full"
          >
            🎮 Play Again
          </motion.button>
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

function StartScreen({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen warm-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="candy-card p-8 max-w-md w-full text-center space-y-6"
      >
        <motion.div
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl"
        >
          🕵️
        </motion.div>
        <h1 className="font-display text-3xl text-foreground">Guess the Cricketer</h1>
        <p className="font-body font-semibold text-sm text-muted-foreground leading-relaxed">
          We'll show you clues about a mystery cricket player — one at a time.
          Guess who it is with fewer clues for more points!
        </p>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="candy-card py-3">
            <div className="font-display text-xl text-candy-green">10</div>
            <div className="font-body font-bold text-[10px] text-muted-foreground uppercase">Rounds</div>
          </div>
          <div className="candy-card py-3">
            <div className="font-display text-xl text-candy-red">3</div>
            <div className="font-body font-bold text-[10px] text-muted-foreground uppercase">Lives</div>
          </div>
          <div className="candy-card py-3">
            <div className="font-display text-xl text-candy-orange">5</div>
            <div className="font-body font-bold text-[10px] text-muted-foreground uppercase">Clues</div>
          </div>
        </div>

        <div className="space-y-2 text-left candy-card p-4">
          <div className="font-body font-bold text-xs text-foreground uppercase tracking-widest mb-2">Scoring</div>
          {[
            { clues: 3, pts: 300, color: "text-candy-green", label: "Guess with 3 clues" },
            { clues: 4, pts: 200, color: "text-candy-orange", label: "Reveal 4th clue" },
            { clues: 5, pts: 100, color: "text-candy-red", label: "Reveal all 5 clues" },
          ].map((row) => (
            <div key={row.clues} className="flex justify-between items-center">
              <span className="font-body text-xs text-muted-foreground">
                {row.label}
              </span>
              <span className={`font-display text-sm ${row.color}`}>{row.pts} pts</span>
            </div>
          ))}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-1 mt-1">
            <span className="font-body text-xs text-muted-foreground">
              Streak bonus: +50% per consecutive correct
            </span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, y: 4 }}
          onClick={onStart}
          className="candy-btn candy-btn-green text-lg px-10 py-4 w-full"
        >
          🎯 Start Guessing!
        </motion.button>
        <button
          onClick={onBack}
          className="font-body font-bold text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Home
        </button>
      </motion.div>
    </div>
  );
}

/* ───────────────────────── main page ───────────────────────── */

export default function GuessPlayer() {
  const navigate = useNavigate();
  const { players, loading } = usePlayers();
  const { game, startGame, revealNextClue, submitGuess, skipRound, nextRound, totalRounds, maxClues } =
    useGuessGame(players);

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
    return <StartScreen onStart={startGame} onBack={() => navigate("/play")} />;
  }

  // Game over
  if (game.status === "finished") {
    return (
      <GameOverScreen
        game={game}
        onPlayAgain={startGame}
        onHome={() => navigate("/play")}
      />
    );
  }

  const round = game.rounds[game.currentRound];
  const hasGuessed = round.guessed;
  const allCluesRevealed = round.cluesRevealed >= maxClues;

  return (
    <div className="min-h-screen warm-bg">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b-2 border-gray-200 dark:border-gray-700">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/play")}
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
            <LivesDisplay lives={game.lives} max={3} />
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
                      : "bg-gray-200 dark:bg-gray-600"
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
