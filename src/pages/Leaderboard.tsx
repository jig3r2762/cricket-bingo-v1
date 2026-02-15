import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { getTodayDateString } from "@/lib/dailyGame";
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

type Tab = "today" | "alltime";

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
  const [tab, setTab] = useState<Tab>("today");
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const fetchScores = async () => {
      const scoresRef = collection(db, "scores");
      let q;

      if (tab === "today") {
        const today = getTodayDateString();
        q = query(
          scoresRef,
          where("date", "==", today),
          orderBy("score", "desc"),
          limit(50),
        );
      } else {
        q = query(
          scoresRef,
          orderBy("score", "desc"),
          limit(50),
        );
      }

      const snap = await getDocs(q);
      if (cancelled) return;

      const entries: ScoreEntry[] = snap.docs.map((d) => d.data() as ScoreEntry);
      setScores(entries);
      setLoading(false);
    };

    fetchScores().catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [tab]);

  const userRank = scores.findIndex((e) => e.uid === user?.uid) + 1;

  return (
    <div className="min-h-screen stadium-bg flex flex-col items-center p-4">
      <div className="w-full max-w-lg space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg border border-border/30 text-muted-foreground hover:text-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-2xl font-extrabold text-secondary uppercase tracking-wider">
            Leaderboard
          </h1>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2"
        >
          {(["today", "alltime"] as Tab[]).map((t) => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl font-display text-xs uppercase tracking-wider transition-all ${
                tab === t
                  ? "bg-primary/20 border border-primary/50 text-primary"
                  : "bg-card/40 border border-border/30 text-muted-foreground hover:text-secondary"
              }`}
            >
              {t === "today" ? "Today" : "All Time"}
            </motion.button>
          ))}
        </motion.div>

        {/* Your rank indicator (if not in top 50) */}
        {userRank > 0 && userRank <= 50 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-2 rounded-lg bg-primary/15 border border-primary/40 text-center text-sm font-display text-primary uppercase tracking-wider"
          >
            Your Rank: #{userRank}
          </motion.div>
        )}

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {loading ? (
            <div className="p-8 text-center text-muted-foreground/60 font-display text-sm uppercase tracking-widest animate-pulse">
              Loading...
            </div>
          ) : scores.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground/60 font-display text-sm uppercase tracking-widest">
              No scores yet
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {scores.map((entry, i) => {
                const isMe = entry.uid === user?.uid;
                const rank = i + 1;
                const isMedal = rank <= 3;

                return (
                  <motion.div
                    key={`${entry.uid}-${entry.date}-${entry.gridSize}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.4) }}
                    whileHover={{ backgroundColor: "rgba(120, 119, 198, 0.05)" }}
                    className={`flex items-center gap-3 px-4 py-3 transition-all ${
                      isMe ? "bg-primary/10 border-l-2 border-primary/50" : ""
                    }`}
                  >
                    {/* Medal/Rank badge */}
                    {isMedal ? (
                      <motion.div
                        initial={medalVariants[rank as 1 | 2 | 3].initial}
                        animate={medalVariants[rank as 1 | 2 | 3].animate}
                        whileHover={medalVariants[rank as 1 | 2 | 3].hover}
                        className={`w-8 text-center font-display text-lg font-bold ${getMedalColor(rank)}`}
                      >
                        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                      </motion.div>
                    ) : (
                      <div className={`w-8 text-center font-display text-sm font-bold ${getMedalColor(rank)}`}>
                        {rank}
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
                          className="w-8 h-8 rounded-full ring-2 ring-border/30"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 ring-2 ring-border/30 flex items-center justify-center text-sm text-primary font-bold">
                          {(entry.displayName || "?")[0].toUpperCase()}
                        </div>
                      )}
                    </motion.div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${isMe ? "text-primary" : "text-secondary"}`}>
                        {entry.displayName || "Player"}
                        {isMe && <span className="text-primary/60 text-xs ml-1">(you)</span>}
                      </div>
                      {tab === "alltime" && (
                        <div className="text-[10px] text-muted-foreground/60">{entry.date}</div>
                      )}
                    </div>

                    {/* Grid size badge */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="px-2 py-0.5 rounded-md bg-card/60 border border-border/20 text-[10px] text-muted-foreground font-display"
                    >
                      {entry.gridSize}x{entry.gridSize}
                    </motion.div>

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
                      className="scoreboard-font text-lg text-secondary w-16 text-right"
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
