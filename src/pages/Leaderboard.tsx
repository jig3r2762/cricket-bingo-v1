import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { getTodayDateString } from "@/lib/dailyGame";
import { ArrowLeft, Trophy, XCircle } from "lucide-react";

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

  return (
    <div className="min-h-screen stadium-bg flex flex-col items-center p-4">
      <div className="w-full max-w-lg space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg border border-border/30 text-muted-foreground hover:text-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-2xl font-extrabold text-secondary uppercase tracking-wider">
            Leaderboard
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(["today", "alltime"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl font-display text-xs uppercase tracking-wider transition-all ${
                tab === t
                  ? "bg-primary/20 border border-primary/50 text-primary"
                  : "bg-card/40 border border-border/30 text-muted-foreground hover:text-secondary"
              }`}
            >
              {t === "today" ? "Today" : "All Time"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
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
                return (
                  <div
                    key={`${entry.uid}-${entry.date}-${entry.gridSize}`}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      isMe ? "bg-primary/10" : ""
                    }`}
                  >
                    {/* Rank */}
                    <div className={`w-8 text-center font-display text-sm font-bold ${
                      i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-muted-foreground"
                    }`}>
                      {i + 1}
                    </div>

                    {/* Avatar */}
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
                    <div className="px-2 py-0.5 rounded-md bg-card/60 border border-border/20 text-[10px] text-muted-foreground font-display">
                      {entry.gridSize}x{entry.gridSize}
                    </div>

                    {/* Status icon */}
                    {entry.status === "won" ? (
                      <Trophy className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive/60" />
                    )}

                    {/* Score */}
                    <div className="scoreboard-font text-lg text-secondary w-16 text-right">
                      {entry.score}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
