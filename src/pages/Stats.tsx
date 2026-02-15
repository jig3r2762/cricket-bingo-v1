import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Trophy, XCircle, Flame, Target, Percent, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface ScoreRecord {
  score: number;
  status: "won" | "lost";
  gridSize: 3 | 4;
  filledCount: number;
  date: string;
}

export default function Stats() {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchScores = async () => {
      const q = query(collection(db, "scores"), where("uid", "==", user.uid));
      const snap = await getDocs(q);
      const records: ScoreRecord[] = snap.docs.map((d) => d.data() as ScoreRecord);
      records.sort((a, b) => b.date.localeCompare(a.date));
      setScores(records);
      setLoading(false);
    };

    fetchScores().catch(() => setLoading(false));
  }, [user]);

  const gamesPlayed = scores.length;
  const wins = scores.filter((s) => s.status === "won").length;
  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
  const avgScore = gamesPlayed > 0 ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / gamesPlayed) : 0;
  const bestScore = gamesPlayed > 0 ? Math.max(...scores.map((s) => s.score)) : 0;
  const currentStreak = userData?.currentStreak ?? 0;
  const longestStreak = userData?.longestStreak ?? 0;

  // Score distribution (buckets)
  const buckets = [
    { label: "0-200", min: 0, max: 200 },
    { label: "201-500", min: 201, max: 500 },
    { label: "501-1K", min: 501, max: 1000 },
    { label: "1K-2K", min: 1001, max: 2000 },
    { label: "2K+", min: 2001, max: Infinity },
  ];
  const distribution = buckets.map((b) => ({
    ...b,
    count: scores.filter((s) => s.score >= b.min && s.score <= b.max).length,
  }));
  const maxCount = Math.max(1, ...distribution.map((d) => d.count));

  const statCards = [
    { icon: Target, label: "Games Played", value: gamesPlayed, color: "text-primary" },
    { icon: Trophy, label: "Wins", value: wins, color: "text-yellow-400" },
    { icon: Percent, label: "Win Rate", value: `${winRate}%`, color: "text-emerald-400" },
    { icon: TrendingUp, label: "Avg Score", value: avgScore, color: "text-blue-400" },
    { icon: Flame, label: "Current Streak", value: currentStreak, color: "text-orange-400" },
    { icon: Flame, label: "Best Streak", value: longestStreak, color: "text-red-400" },
  ];

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
            onClick={() => navigate("/play")}
            className="p-2 rounded-lg border border-border/30 text-muted-foreground hover:text-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-2xl font-extrabold text-secondary uppercase tracking-wider">
            Your Stats
          </h1>
        </motion.div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground/60 font-display text-sm uppercase tracking-widest animate-pulse">
            Loading...
          </div>
        ) : !user ? (
          <div className="glass-card rounded-2xl p-8 text-center space-y-3">
            <p className="text-muted-foreground text-sm">Sign in to see your stats</p>
          </div>
        ) : (
          <>
            {/* Stat cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {statCards.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-xl p-4 text-center"
                >
                  <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                  <div className={`scoreboard-font text-2xl ${stat.color}`}>{stat.value}</div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-display mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Best score highlight */}
            {bestScore > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-xl p-4 text-center"
              >
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-display mb-1">
                  Personal Best
                </div>
                <div className="scoreboard-font text-4xl text-yellow-400">{bestScore}</div>
              </motion.div>
            )}

            {/* Score distribution */}
            {gamesPlayed > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card rounded-xl p-4"
              >
                <h3 className="font-display text-xs uppercase tracking-wider text-secondary mb-3">
                  Score Distribution
                </h3>
                <div className="space-y-2">
                  {distribution.map((d) => (
                    <div key={d.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground font-mono w-12 text-right">{d.label}</span>
                      <div className="flex-1 h-5 bg-muted/20 rounded overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(d.count / maxCount) * 100}%` }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                          className="h-full bg-primary/60 rounded flex items-center justify-end pr-1"
                        >
                          {d.count > 0 && (
                            <span className="text-[9px] text-white font-bold">{d.count}</span>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recent games */}
            {scores.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card rounded-xl p-4"
              >
                <h3 className="font-display text-xs uppercase tracking-wider text-secondary mb-3">
                  Recent Games
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {scores.slice(0, 20).map((s, i) => (
                    <div key={`${s.date}-${s.gridSize}-${i}`} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/10">
                      <div className="flex items-center gap-2">
                        {s.status === "won" ? (
                          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-destructive/60" />
                        )}
                        <span className="text-xs text-muted-foreground">{s.date}</span>
                        <span className="text-[10px] text-muted-foreground/60">{s.gridSize}x{s.gridSize}</span>
                      </div>
                      <span className="scoreboard-font text-sm text-secondary">{s.score}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
