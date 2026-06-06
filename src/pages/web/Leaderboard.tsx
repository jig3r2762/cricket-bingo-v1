import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, limit, where, getDocsFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Trophy, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ScoreEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  score: number;
  status: "won" | "lost";
  gridSize: 3 | 4;
  filledCount: number;
  date: string;
}

type GridTab = 3 | 4;

interface PlayerScore {
  uid: string;
  displayName: string;
  photoURL: string;
  score: number;
  status: "won" | "lost";
}

interface LeaderboardData {
  allTime3: PlayerScore[];
  allTime4: PlayerScore[];
  weekly3: PlayerScore[];
  weekly4: PlayerScore[];
}

// Medal animations for podium positions
const medalVariants = {
  1: {
    initial: { y: -20, opacity: 0, rotate: -45 },
    animate: { y: 0, opacity: 1, rotate: 0 },
    transition: { delay: 0.1, type: "spring", stiffness: 200 },
    hover: { y: -8, boxShadow: "0 0 20px hsl(var(--golden-trophy) / 0.6)" },
  },
  2: {
    initial: { y: -15, opacity: 0, rotate: -30 },
    animate: { y: 0, opacity: 1, rotate: 0 },
    transition: { delay: 0.2, type: "spring", stiffness: 200 },
    hover: { y: -6, boxShadow: "0 0 15px rgb(192,192,192,0.4)" },
  },
  3: {
    initial: { y: -10, opacity: 0, rotate: -15 },
    animate: { y: 0, opacity: 1, rotate: 0 },
    transition: { delay: 0.3, type: "spring", stiffness: 200 },
    hover: { y: -4, boxShadow: "0 0 15px rgb(205,127,50,0.4)" },
  },
};

function getMedalColor(rank: number) {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-gray-300";
  if (rank === 3) return "text-amber-600";
  return "text-muted-foreground";
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gridTab, setGridTab] = useState<GridTab>(3);
  const [timeTab, setTimeTab] = useState<"all" | "weekly">("all");
  const [leaderboards, setLeaderboards] = useState<LeaderboardData>({
    allTime3: [],
    allTime4: [],
    weekly3: [],
    weekly4: [],
  });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(false);

    const fetchScores = async () => {
      const scoresRef = collection(db, "scores");

      // Query each grid size separately so high 4x4 scores don't push out 3x3 scores
      const q3 = query(scoresRef, where("gridSize", "==", 3), orderBy("score", "desc"), limit(200));
      const q4 = query(scoresRef, where("gridSize", "==", 4), orderBy("score", "desc"), limit(200));

      // Query scores from the last 7 days.
      const getSevenDaysAgoDateString = () => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };
      const sevenDaysAgoStr = getSevenDaysAgoDateString();

      const qWeekly = query(
        scoresRef,
        where("date", ">=", sevenDaysAgoStr),
        orderBy("date", "desc"),
        limit(1000)
      );

      const [snap3, snap4, snapWeekly] = await Promise.all([
        getDocsFromServer(q3),
        getDocsFromServer(q4),
        getDocsFromServer(qWeekly),
      ]);
      if (cancelled) return;

      const toPlayerScore = (entries: ScoreEntry[]): PlayerScore[] => {
        // Keep only best score per user
        const best = new Map<string, ScoreEntry>();
        for (const e of entries) {
          const existing = best.get(e.uid);
          if (!existing || e.score > existing.score) best.set(e.uid, e);
        }
        return [...best.values()]
          .sort((a, b) => b.score - a.score)
          .slice(0, 50)
          .map(e => ({ uid: e.uid, displayName: e.displayName, photoURL: e.photoURL, score: e.score, status: e.status }));
      };

      const weeklyEntries = snapWeekly.docs.map(d => d.data() as ScoreEntry);

      setLeaderboards({
        allTime3: toPlayerScore(snap3.docs.map(d => d.data() as ScoreEntry)),
        allTime4: toPlayerScore(snap4.docs.map(d => d.data() as ScoreEntry)),
        weekly3: toPlayerScore(weeklyEntries.filter(e => e.gridSize === 3)),
        weekly4: toPlayerScore(weeklyEntries.filter(e => e.gridSize === 4)),
      });
      setLoading(false);
    };

    fetchScores().catch((err) => {
      console.error("Leaderboard fetch error:", err);
      if (!cancelled) { setLoading(false); setFetchError(true); }
    });

    return () => { cancelled = true; };
  }, []);

  const scores = timeTab === "all"
    ? (gridTab === 3 ? leaderboards.allTime3 : leaderboards.allTime4)
    : (gridTab === 3 ? leaderboards.weekly3 : leaderboards.weekly4);
  const userRank = scores.findIndex((e) => e.uid === user?.uid) + 1;

  return (
    <div className="min-h-screen stadium-bg flex flex-col items-center p-4 relative">
      <div className="w-full max-w-lg space-y-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button onClick={() => navigate(-1)} className="hud-pill" aria-label="Back to Hub">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-display text-3xl font-black uppercase tracking-wider gold-text leading-none">
            {gridTab}×{gridTab} {timeTab === "all" ? "ALL-TIME" : "WEEKLY"} SCORERS
          </h1>
        </motion.div>

        {/* Grid Size & Time Tabs */}
        <div className="flex justify-between items-center gap-4 flex-wrap w-full">
          {/* Grid Size Tabs */}
          <div className="flex gap-2">
            {([3, 4] as GridTab[]).map((size) => (
              <button
                key={size}
                onClick={() => setGridTab(size)}
                className={`cta-chunky size-sm ${gridTab === size ? "color-yellow" : ""}`}
              >
                <span className="relative z-10">{size}×{size} GRID</span>
              </button>
            ))}
          </div>

          {/* Time timeframe Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setTimeTab("all")}
              className={`hud-pill !text-[11px] ${timeTab === "all" ? "color-gold" : ""}`}
            >
              ALL-TIME
            </button>
            <button
              onClick={() => setTimeTab("weekly")}
              className={`hud-pill !text-[11px] ${timeTab === "weekly" ? "color-gold" : ""}`}
            >
              WEEKLY
            </button>
          </div>
        </div>

        {/* Your rank indicator */}
        {userRank > 0 && userRank <= 50 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="scoreboard px-4 py-3 text-center"
          >
            <span className="font-display text-sm font-black uppercase tracking-widest">
              YOUR RANK: <span className="gold-text text-lg ml-1">#{userRank}</span>
            </span>
          </motion.div>
        )}

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="candy-card rounded-xl overflow-hidden"
        >
          {loading ? (
            <div className="p-8 text-center text-muted-foreground/60 font-display text-sm uppercase tracking-widest animate-pulse">
              Loading...
            </div>
          ) : fetchError ? (
            <div className="p-8 text-center space-y-2">
              <div className="text-destructive/70 font-display text-sm uppercase tracking-widest">
                Could not load scores
              </div>
              <div className="text-muted-foreground/60 font-body text-xs">
                Check your connection or try again later
              </div>
            </div>
          ) : scores.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="text-muted-foreground/60 font-display text-sm uppercase tracking-widest">
                No scores yet
              </div>
              <div className="text-muted-foreground/50 font-body text-xs">
                Be the first to complete the {gridTab}×{gridTab} puzzle!
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {scores.map((entry, i) => {
                const isMe = entry.uid === user?.uid;
                const rank = i + 1;
                const isMedal = rank <= 3;
                const isEven = i % 2 === 0;

                return (
                  <motion.div
                    key={entry.uid}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.4) }}
                    whileHover={{ backgroundColor: "rgba(120, 119, 198, 0.05)" }}
                    className={`flex items-center gap-3 px-4 py-3 transition-all ${
                      isMe
                        ? "bg-primary/15 border-l-4 border-primary/60 ring-1 ring-inset ring-primary/20"
                        : isEven
                          ? "bg-white/[0.02]"
                          : ""
                    }`}
                  >
                    {/* Medal/Rank badge */}
                    {isMedal ? (
                      <motion.div
                        initial={medalVariants[rank as 1 | 2 | 3].initial}
                        animate={medalVariants[rank as 1 | 2 | 3].animate}
                        whileHover={medalVariants[rank as 1 | 2 | 3].hover}
                        className={`w-9 text-center font-display text-lg font-bold ${getMedalColor(rank)}`}
                      >
                        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                      </motion.div>
                    ) : (
                      <div className={`w-9 text-center font-display text-base font-extrabold tabular-nums ${isMe ? "text-primary" : "text-muted-foreground/80"}`}>
                        #{rank}
                      </div>
                    )}

                    {/* Avatar */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="flex-shrink-0"
                    >
                      {entry.photoURL ? (
                        <img
                          src={entry.photoURL}
                          alt=""
                          className={`w-9 h-9 rounded-full ring-2 ${isMe ? "ring-primary/50" : "ring-border/30"}`}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ring-2 ${
                          isMe ? "bg-primary/30 ring-primary/50 text-primary" : "bg-primary/20 ring-border/30 text-primary"
                        }`}>
                          {(entry.displayName || "?")[0].toUpperCase()}
                        </div>
                      )}
                    </motion.div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${isMe ? "text-primary font-bold" : "text-secondary"}`}>
                        {entry.displayName || "Player"}
                        {isMe && <span className="text-primary/60 text-xs ml-1.5">(you)</span>}
                      </div>
                    </div>

                    {/* Status icon */}
                    {entry.status === "won" ? (
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Trophy className="w-4 h-4 text-yellow-400" />
                      </motion.div>
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive/60" />
                    )}

                    {/* Score */}
                    <motion.div
                      key={entry.score}
                      initial={{ y: -8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className={`font-display text-lg w-16 text-right ${isMe ? "text-primary" : "text-secondary"}`}
                    >
                      {entry.score}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
