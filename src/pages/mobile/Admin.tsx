import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { FULL_CATEGORY_POOL } from "@/data/categories";
import { generateDailyGame, getTodayDateString, buildDeckForGrid } from "@/lib/dailyGame";
import type { GridCategory } from "@/types/game";
import { usePlayers } from "@/contexts/PlayersContext";

interface FirestoreUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: "user" | "admin";
  coinBalance?: number;
  createdAt: unknown;
}

export default function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"grid" | "users" | "coins" | "analytics">("analytics");

  return (
    <div className="min-h-screen stadium-bg relative">
      <div className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl font-black uppercase tracking-wider gold-text">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-xs mt-1 font-bold uppercase tracking-wider">
              {user?.email}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(-1)} className="hud-pill">
              ← HUB
            </button>
            <button onClick={signOut} className="hud-pill !text-[10px]" style={{ color: "hsl(var(--destructive))" }}>
              SIGN OUT
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setTab("analytics")}
            className={`cta-chunky size-sm ${tab === "analytics" ? "color-purple" : ""}`}
          >
            <span className="relative z-10">ANALYTICS</span>
          </button>
          <button
            onClick={() => setTab("grid")}
            className={`cta-chunky size-sm ${tab === "grid" ? "color-green" : ""}`}
          >
            <span className="relative z-10">GRID MANAGER</span>
          </button>
          <button
            onClick={() => setTab("users")}
            className={`cta-chunky size-sm ${tab === "users" ? "color-blue" : ""}`}
          >
            <span className="relative z-10">USERS</span>
          </button>
          <button
            onClick={() => setTab("coins")}
            className={`cta-chunky size-sm ${tab === "coins" ? "color-yellow" : ""}`}
          >
            <span className="relative z-10">COINS</span>
          </button>
        </div>

        {tab === "analytics" && <AnalyticsManager />}
        {tab === "grid" && <GridManager />}
        {tab === "users" && <UserManager />}
        {tab === "coins" && <CoinsManager />}
      </div>
    </div>
  );
}

// =============================================================
// Grid Manager
// =============================================================

function GridManager() {
  const { user } = useAuth();
  const { players: allPlayers } = usePlayers();
  const [gridSize, setGridSize] = useState<3 | 4>(3);
  const [grid, setGrid] = useState<GridCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [swapIndex, setSwapIndex] = useState<number | null>(null);
  const [hasFirestoreGrid, setHasFirestoreGrid] = useState(false);

  const today = getTodayDateString();

  // Load current grid (Firestore or generate)
  const loadGrid = useCallback(async () => {
    const ref = doc(db, "dailyGrid", `${today}-${gridSize}`);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      setGrid(data.grid as GridCategory[]);
      setHasFirestoreGrid(true);
    } else {
      const daily = generateDailyGame(today, gridSize, allPlayers, FULL_CATEGORY_POOL);
      setGrid(daily.grid);
      setHasFirestoreGrid(false);
    }
  }, [today, gridSize]);

  useEffect(() => {
    loadGrid();
  }, [loadGrid]);

  const handleShuffle = () => {
    const daily = generateDailyGame(
      `${today}-shuffle-${Date.now()}`,
      gridSize,
      allPlayers,
      FULL_CATEGORY_POOL
    );
    setGrid(daily.grid);
    setSaved(false);
  };

  const handleSwapCategory = (poolCat: GridCategory) => {
    if (swapIndex === null) return;
    setGrid((prev) => {
      const next = [...prev];
      next[swapIndex] = poolCat;
      return next;
    });
    setSwapIndex(null);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Build a deck that matches the custom grid categories
      const deck = buildDeckForGrid(grid, allPlayers);
      const version = Date.now();
      const ref = doc(db, "dailyGrid", `${today}-${gridSize}`);
      await setDoc(ref, {
        gridSize,
        grid,
        deck: deck.map((p) => p.id),
        version,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
      setSaved(true);
      setHasFirestoreGrid(true);
      // Clear local storage so users pick up the new grid
      try {
        localStorage.removeItem(`cricket-bingo-${today}-${gridSize}`);
      } catch { /* ok */ }
    } catch (err) {
      console.error("Failed to save grid:", err);
    } finally {
      setSaving(false);
    }
  };

  const usedIds = new Set(grid.map((c) => c.id));
  const availablePool = FULL_CATEGORY_POOL.filter((c) => !usedIds.has(c.id));

  return (
    <div className="space-y-6">
      {/* Grid size toggle */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground font-display uppercase tracking-wider">
          Grid Size:
        </span>
        {([3, 4] as const).map((s) => (
          <button
            key={s}
            onClick={() => setGridSize(s)}
            className={`px-3 py-1 rounded-md text-xs font-display uppercase ${
              gridSize === s
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted-foreground border border-border/30 hover:text-secondary"
            }`}
          >
            {s}x{s}
          </button>
        ))}
        {hasFirestoreGrid && (
          <span className="text-xs text-green-400 ml-auto">Custom grid active</span>
        )}
      </div>

      {/* Current Grid */}
      <div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-sm uppercase tracking-wider text-secondary">
            Today's Grid — {today}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleShuffle}
              className="px-3 py-1.5 rounded-lg text-xs font-display uppercase tracking-wider border border-border/50 text-secondary hover:bg-secondary/10 transition-colors"
            >
              Shuffle
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 rounded-lg text-xs font-display uppercase tracking-wider bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : saved ? "Saved!" : "Save to Firestore"}
            </button>
          </div>
        </div>

        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {grid.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => setSwapIndex(swapIndex === i ? null : i)}
              className={`p-3 rounded-lg border text-left transition-all ${
                swapIndex === i
                  ? "border-yellow-400/60 bg-yellow-400/10 ring-1 ring-yellow-400/30"
                  : "border-border/30 bg-card/30 hover:border-primary/40"
              }`}
            >
              <div className="font-display text-xs uppercase tracking-wider text-secondary">
                {cat.shortLabel}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {cat.label}
              </div>
              <div className="text-[9px] text-muted-foreground/50 mt-0.5 font-mono">
                {cat.validatorKey}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Swap Panel */}
      {swapIndex !== null && (
        <div className="bg-card/40 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-4">
          <h3 className="font-display text-xs uppercase tracking-wider text-yellow-400 mb-3">
            Swap "{grid[swapIndex].shortLabel}" with:
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {availablePool.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSwapCategory(cat)}
                className="p-2 rounded-lg border border-border/30 bg-card/20 hover:border-primary/40 hover:bg-primary/5 text-left transition-all"
              >
                <div className="font-display text-xs text-secondary">
                  {cat.shortLabel}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {cat.label}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setSwapIndex(null)}
            className="mt-3 text-xs text-muted-foreground hover:text-secondary transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================
// User Manager
// =============================================================

function UserManager() {
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, "users"));
      const list: FirestoreUser[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (!data.email) return; // skip users with no email
        list.push({
          uid: d.id,
          email: data.email,
          displayName: data.displayName ?? "",
          photoURL: data.photoURL ?? "",
          role: data.role ?? "user",
          createdAt: data.createdAt ?? null,
        });
      });
      console.log("[Admin] Loaded users from Firestore:", list.length, list.map((u) => u.email));
      list.sort((a, b) => {
        if (a.role !== b.role) return a.role === "admin" ? -1 : 1;
        return a.email.localeCompare(b.email);
      });
      setUsers(list);
    } catch (err) {
      console.error("Failed to load users:", err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("permission") || msg.includes("PERMISSION_DENIED")) {
        setError("Permission denied. Deploy Firestore rules: firebase deploy --only firestore:rules");
      } else {
        setError(`Failed to load users: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (uid: string, currentRole: string) => {
    // Don't allow demoting yourself
    if (uid === currentUser?.uid) return;
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await updateDoc(doc(db, "users", uid), { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={loadUsers}
            className="mt-3 text-xs font-display uppercase tracking-wider px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm uppercase tracking-wider text-secondary">
          Users ({users.length})
        </h2>
        <button
          onClick={loadUsers}
          className="text-xs text-muted-foreground hover:text-secondary transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="border-b border-border/20">
              <th className="text-left px-4 py-3 text-[10px] font-display uppercase tracking-wider text-muted-foreground">
                User
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-display uppercase tracking-wider text-muted-foreground">
                Email
              </th>
              <th className="text-center px-4 py-3 text-[10px] font-display uppercase tracking-wider text-muted-foreground">
                Role
              </th>
              <th className="text-center px-4 py-3 text-[10px] font-display uppercase tracking-wider text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid} className="border-b border-border/10 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {u.photoURL ? (
                      <img
                        src={u.photoURL}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary">
                        {u.displayName?.[0] || "?"}
                      </div>
                    )}
                    <span className="text-sm text-secondary">
                      {u.displayName || "—"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {u.email}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded ${
                      u.role === "admin"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted/20 text-muted-foreground"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {u.uid === currentUser?.uid ? (
                    <span className="text-[10px] text-muted-foreground/50">
                      (you)
                    </span>
                  ) : (
                    <button
                      onClick={() => toggleRole(u.uid, u.role)}
                      className="text-[10px] font-display uppercase tracking-wider px-2 py-1 rounded border border-border/30 text-secondary hover:bg-secondary/10 transition-colors"
                    >
                      {u.role === "admin" ? "Demote" : "Promote"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =============================================================
// Coins Manager — grant coins to any user without Razorpay
// =============================================================

function CoinsManager() {
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantAmounts, setGrantAmounts] = useState<Record<string, string>>({});
  const [grantingUid, setGrantingUid] = useState<string | null>(null);
  const [successUid, setSuccessUid] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const list: FirestoreUser[] = [];
        snap.forEach((d) => {
          const data = d.data();
          if (!data.email) return;
          list.push({
            uid: d.id,
            email: data.email,
            displayName: data.displayName ?? "",
            photoURL: data.photoURL ?? "",
            role: data.role ?? "user",
            coinBalance: data.coinBalance ?? 0,
            createdAt: data.createdAt ?? null,
          });
        });
        list.sort((a, b) => a.email.localeCompare(b.email));
        setUsers(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleGrant = async (uid: string) => {
    const raw = grantAmounts[uid] ?? "";
    const amount = parseInt(raw, 10);
    if (!amount || amount <= 0) return;

    setGrantingUid(uid);
    try {
      await updateDoc(doc(db, "users", uid), {
        coinBalance: increment(amount),
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === uid ? { ...u, coinBalance: (u.coinBalance ?? 0) + amount } : u
        )
      );
      setGrantAmounts((prev) => ({ ...prev, [uid]: "" }));
      setSuccessUid(uid);
      setTimeout(() => setSuccessUid(null), 2000);
    } catch (err) {
      console.error("Failed to grant coins:", err);
    } finally {
      setGrantingUid(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground text-sm">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm uppercase tracking-wider text-yellow-400">
          🪙 Grant Coins — No Payment Required
        </h2>
        <span className="text-[10px] text-muted-foreground">Admin only · Updates Firestore directly</span>
      </div>

      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-400/80">
        Enter an amount and click Grant to add coins to any user's balance instantly — no Razorpay involved.
      </div>

      <div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="border-b border-border/20">
              <th className="text-left px-4 py-3 text-[10px] font-display uppercase tracking-wider text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 text-[10px] font-display uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Email</th>
              <th className="text-center px-4 py-3 text-[10px] font-display uppercase tracking-wider text-yellow-400">Balance</th>
              <th className="text-center px-4 py-3 text-[10px] font-display uppercase tracking-wider text-muted-foreground">Grant</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid} className="border-b border-border/10 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {u.photoURL ? (
                      <img src={u.photoURL} alt="" referrerPolicy="no-referrer" className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary">
                        {u.displayName?.[0] || "?"}
                      </div>
                    )}
                    <span className="text-sm text-secondary truncate max-w-[100px]">
                      {u.displayName || u.email.split("@")[0]}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{u.email}</td>
                <td className="px-4 py-3 text-center">
                  <span className="font-display text-sm text-yellow-400">
                    🪙 {(u.coinBalance ?? 0).toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-center">
                    <input
                      type="number"
                      min="1"
                      placeholder="Amount"
                      value={grantAmounts[u.uid] ?? ""}
                      onChange={(e) =>
                        setGrantAmounts((prev) => ({ ...prev, [u.uid]: e.target.value }))
                      }
                      className="w-20 px-2 py-1 rounded-lg text-xs bg-card border border-border/40 text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:border-yellow-500/50"
                    />
                    <button
                      onClick={() => handleGrant(u.uid)}
                      disabled={!grantAmounts[u.uid] || grantingUid === u.uid}
                      className={`px-3 py-1 rounded-lg text-[10px] font-display uppercase tracking-wider transition-colors
                        ${successUid === u.uid
                          ? "bg-green-500/20 border border-green-500/40 text-green-400"
                          : "bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        }`}
                    >
                      {grantingUid === u.uid ? "..." : successUid === u.uid ? "✓ Done" : "Grant"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =============================================================
// Analytics Manager
// =============================================================

import {
  TrendingUp,
  Users,
  Award,
  Trophy,
  Target,
  Calendar,
  PlusCircle,
  CheckCircle,
  XCircle
} from "lucide-react";

function AnalyticsManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<"overview" | "daily" | "players" | "matches">("overview");

  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers30d, setActiveUsers30d] = useState(0);
  const [newSignups30d, setNewSignups30d] = useState(0);
  const [totalGames30d, setTotalGames30d] = useState(0);
  const [avgScore30d, setAvgScore30d] = useState(0);
  const [winRate30d, setWinRate30d] = useState(0);

  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const getPastDateString = (daysAgo: number) => {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };

      const thirtyDaysAgoStr = getPastDateString(30);

      // Fetch users
      const usersSnap = await getDocs(collection(db, "users"));
      const allUsersList: any[] = [];
      usersSnap.forEach((d) => {
        allUsersList.push({ uid: d.id, ...d.data() });
      });

      // Fetch scores for past 30 days
      const scoresQuery = query(
        collection(db, "scores"),
        where("date", ">=", thirtyDaysAgoStr)
      );
      const scoresSnap = await getDocs(scoresQuery);
      const scoresList: any[] = [];
      scoresSnap.forEach((d) => {
        scoresList.push({ id: d.id, ...d.data() });
      });

      // Sort scores in-memory desc by date
      scoresList.sort((a, b) => b.date.localeCompare(a.date));

      // Calculate total registered users
      setTotalUsers(allUsersList.length);

      // Analyze users
      let signupsCount = 0;
      const activeUids = new Set<string>();

      allUsersList.forEach((u) => {
        // Signups count
        if (u.createdAt) {
          try {
            const date = u.createdAt.seconds ? new Date(u.createdAt.seconds * 1000) : new Date(u.createdAt);
            const signupStr = date.toISOString().split("T")[0];
            if (signupStr >= thirtyDaysAgoStr) {
              signupsCount++;
            }
          } catch {
            // handle date parse error
          }
        }

        // Active in 30d
        const loginDate = u.lastLoginDate || "";
        const playedDate = u.lastPlayedDate || "";
        if (loginDate >= thirtyDaysAgoStr || playedDate >= thirtyDaysAgoStr) {
          activeUids.add(u.uid);
        }
      });

      // Add users who played but might not have been counted above
      scoresList.forEach((s) => {
        if (s.uid) activeUids.add(s.uid);
      });

      setActiveUsers30d(activeUids.size);
      setNewSignups30d(signupsCount);
      setTotalGames30d(scoresList.length);

      // Game metrics
      if (scoresList.length > 0) {
        const totalScore = scoresList.reduce((sum, s) => sum + (s.score || 0), 0);
        setAvgScore30d(Math.round(totalScore / scoresList.length));

        const winsCount = scoresList.filter((s) => s.status === "won").length;
        setWinRate30d(Math.round((winsCount / scoresList.length) * 100));
      } else {
        setAvgScore30d(0);
        setWinRate30d(0);
      }

      // Compile daily breakdown
      const dailyBreakdown: any[] = [];
      for (let i = 0; i < 30; i++) {
        const d = getPastDateString(i);
        const dayScores = scoresList.filter((s) => s.date === d);

        // Signups on day d
        const daySignups = allUsersList.filter((u) => {
          if (!u.createdAt) return false;
          try {
            const date = u.createdAt.seconds ? new Date(u.createdAt.seconds * 1000) : new Date(u.createdAt);
            return date.toISOString().split("T")[0] === d;
          } catch {
            return false;
          }
        }).length;

        // Active players on day d
        const dayActivePlayers = new Set<string>();
        dayScores.forEach((s) => {
          if (s.uid) dayActivePlayers.add(s.uid);
        });
        allUsersList.forEach((u) => {
          if (u.lastLoginDate === d) dayActivePlayers.add(u.uid);
        });

        const wins = dayScores.filter((s) => s.status === "won").length;
        const rate = dayScores.length > 0 ? Math.round((wins / dayScores.length) * 100) : 0;

        dailyBreakdown.push({
          date: d,
          activeCount: dayActivePlayers.size,
          gamesPlayed: dayScores.length,
          winRate: rate,
          signups: daySignups,
        });
      }
      setDailyStats(dailyBreakdown);

      // Compile top players in last 30d
      const playerStatsMap = new Map<string, any>();
      scoresList.forEach((s) => {
        if (!s.uid) return;
        const existing = playerStatsMap.get(s.uid) || {
          displayName: s.displayName || "Unknown Player",
          photoURL: s.photoURL || "",
          gamesPlayed: 0,
          wins: 0,
          totalScore: 0,
          highScore: 0,
        };
        existing.gamesPlayed += 1;
        if (s.status === "won") existing.wins += 1;
        existing.totalScore += (s.score || 0);
        existing.highScore = Math.max(existing.highScore, s.score || 0);
        playerStatsMap.set(s.uid, existing);
      });

      const processedPlayers = [...playerStatsMap.entries()].map(([uid, stats]) => ({
        uid,
        ...stats,
        winRate: stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0,
        avgScore: stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0,
      })).sort((a, b) => b.gamesPlayed - a.gamesPlayed || b.avgScore - a.avgScore);

      setTopPlayers(processedPlayers);
      setRecentMatches(scoresList.slice(0, 100)); // limit to last 100 matches in detailed log

    } catch (err) {
      console.error("[Admin Analytics] Fetch error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm font-display uppercase tracking-widest animate-pulse">
        Loading analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center space-y-3">
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={loadAnalytics} className="hud-pill color-pink size-sm uppercase">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub tabs */}
      <div className="flex gap-2 border-b border-border/20 pb-4 overflow-x-auto">
        {(["overview", "daily", "players", "matches"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-display uppercase tracking-wider transition-all border ${
              subTab === t
                ? "bg-primary/10 border-primary text-primary"
                : "border-border/30 text-muted-foreground hover:text-secondary hover:border-border"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {subTab === "overview" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <SummaryCard
              icon={Users}
              label="Active Players (30d)"
              value={activeUsers30d}
              sub={`${totalUsers} total registered`}
              color="text-blue-400"
            />
            <SummaryCard
              icon={Calendar}
              label="Games Played (30d)"
              value={totalGames30d}
              sub={`${dailyStats[0]?.gamesPlayed ?? 0} today`}
              color="text-emerald-400"
            />
            <SummaryCard
              icon={PlusCircle}
              label="New Signups (30d)"
              value={newSignups30d}
              sub="New users added"
              color="text-yellow-400"
            />
            <SummaryCard
              icon={Trophy}
              label="Win Rate (30d)"
              value={`${winRate30d}%`}
              sub="Average win ratio"
              color="text-purple-400"
            />
            <SummaryCard
              icon={TrendingUp}
              label="Avg Score (30d)"
              value={avgScore30d}
              sub="Points per match"
              color="text-cyan-400"
            />
          </div>

          {/* Quick lists on Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Top 5 Active Players */}
            <div className="candy-card p-4 space-y-3">
              <h3 className="font-display text-xs uppercase tracking-wider text-secondary flex items-center gap-2">
                <Trophy size={14} className="text-yellow-400" />
                Most Active Players (30d)
              </h3>
              <div className="divide-y divide-border/10">
                {topPlayers.slice(0, 5).map((p, i) => (
                  <div key={p.uid} className="flex items-center justify-between py-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-display font-black text-muted-foreground w-4">{i + 1}</span>
                      {p.photoURL ? (
                        <img src={p.photoURL} alt="" className="w-6 h-6 rounded-full shrink-0" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/25 flex items-center justify-center font-black text-[10px] text-primary shrink-0">
                          {p.displayName?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <span className="font-semibold text-secondary truncate">{p.displayName}</span>
                    </div>
                    <div className="text-right font-mono font-bold shrink-0">{p.gamesPlayed} games</div>
                  </div>
                ))}
                {topPlayers.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground/60 text-xs">No active players yet.</div>
                )}
              </div>
            </div>

            {/* Recent 5 Matches */}
            <div className="candy-card p-4 space-y-3">
              <h3 className="font-display text-xs uppercase tracking-wider text-secondary flex items-center gap-2">
                <Target size={14} className="text-emerald-400" />
                Recent Matches
              </h3>
              <div className="divide-y divide-border/10">
                {recentMatches.slice(0, 5).map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-2 text-xs">
                    <div className="min-w-0">
                      <div className="font-semibold text-secondary truncate">{m.displayName || "Unknown"}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {m.date} · {m.gridSize}x{m.gridSize}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold">{m.score} pts</span>
                      {m.status === "won" ? (
                        <CheckCircle size={14} className="text-emerald-400" />
                      ) : (
                        <XCircle size={14} className="text-destructive/60" />
                      )}
                    </div>
                  </div>
                ))}
                {recentMatches.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground/60 text-xs">No matches played yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === "daily" && (
        <div className="candy-card p-4 space-y-3">
          <h3 className="font-display text-xs uppercase tracking-wider text-secondary">
            Daily Visitor & Game Breakdown (Last 30 Days)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-border/20 pb-2">
                  <th className="text-left py-2 font-display text-muted-foreground">Date</th>
                  <th className="text-center py-2 font-display text-muted-foreground">Active Visitors</th>
                  <th className="text-center py-2 font-display text-muted-foreground">Games Played</th>
                  <th className="text-center py-2 font-display text-muted-foreground">Win Rate %</th>
                  <th className="text-center py-2 font-display text-muted-foreground">New Signups</th>
                </tr>
              </thead>
              <tbody>
                {dailyStats.map((row) => (
                  <tr key={row.date} className="border-b border-border/10 last:border-0 hover:bg-muted/5">
                    <td className="py-2 text-secondary font-mono">{row.date}</td>
                    <td className="py-2 text-center text-secondary font-bold">{row.activeCount}</td>
                    <td className="py-2 text-center text-secondary font-bold">{row.gamesPlayed}</td>
                    <td className="py-2 text-center">
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          row.gamesPlayed === 0
                            ? "text-muted-foreground/50"
                            : row.winRate >= 50
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-destructive/10 text-destructive/80"
                        }`}
                      >
                        {row.gamesPlayed === 0 ? "-" : `${row.winRate}%`}
                      </span>
                    </td>
                    <td className="py-2 text-center text-secondary font-bold">{row.signups}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === "players" && (
        <div className="candy-card p-4 space-y-3">
          <h3 className="font-display text-xs uppercase tracking-wider text-secondary">
            Player Rankings & Performance (Last 30 Days)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[550px]">
              <thead>
                <tr className="border-b border-border/20 pb-2">
                  <th className="text-left py-2 font-display text-muted-foreground">Player</th>
                  <th className="text-center py-2 font-display text-muted-foreground">Games Played</th>
                  <th className="text-center py-2 font-display text-muted-foreground">Win Rate %</th>
                  <th className="text-center py-2 font-display text-muted-foreground">High Score</th>
                  <th className="text-center py-2 font-display text-muted-foreground">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {topPlayers.map((p, i) => (
                  <tr key={p.uid} className="border-b border-border/10 last:border-0 hover:bg-muted/5">
                    <td className="py-2 flex items-center gap-2">
                      <span className="font-display font-black text-muted-foreground w-4">{i + 1}</span>
                      {p.photoURL ? (
                        <img src={p.photoURL} alt="" className="w-6 h-6 rounded-full shrink-0" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/25 flex items-center justify-center font-black text-[10px] text-primary shrink-0">
                          {p.displayName?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <span className="text-secondary font-semibold">{p.displayName}</span>
                    </td>
                    <td className="py-2 text-center text-secondary font-bold font-mono">{p.gamesPlayed}</td>
                    <td className="py-2 text-center">
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          p.winRate >= 50 ? "bg-emerald-500/10 text-emerald-400" : "bg-destructive/10 text-destructive/80"
                        }`}
                      >
                        {p.winRate}%
                      </span>
                    </td>
                    <td className="py-2 text-center text-secondary font-bold font-mono">{p.highScore}</td>
                    <td className="py-2 text-center text-secondary font-bold font-mono">{p.avgScore}</td>
                  </tr>
                ))}
                {topPlayers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground/60">
                      No players active in the past 30 days.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === "matches" && (
        <div className="candy-card p-4 space-y-3">
          <h3 className="font-display text-xs uppercase tracking-wider text-secondary">
            Matches Log (Last 100 Games)
          </h3>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-border/20 pb-2 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                  <th className="text-left py-2 font-display text-muted-foreground">Date</th>
                  <th className="text-left py-2 font-display text-muted-foreground">Player</th>
                  <th className="text-center py-2 font-display text-muted-foreground">Grid</th>
                  <th className="text-center py-2 font-display text-muted-foreground">Score</th>
                  <th className="text-center py-2 font-display text-muted-foreground">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {recentMatches.map((m) => (
                  <tr key={m.id} className="border-b border-border/10 last:border-0 hover:bg-muted/5">
                    <td className="py-2 text-muted-foreground font-mono">{m.date}</td>
                    <td className="py-2 flex items-center gap-2">
                      {m.photoURL ? (
                        <img src={m.photoURL} alt="" className="w-5 h-5 rounded-full shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-primary/25 flex items-center justify-center font-black text-[9px] text-primary shrink-0">
                          {m.displayName?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <span className="text-secondary font-semibold">{m.displayName || "Unknown"}</span>
                    </td>
                    <td className="py-2 text-center text-secondary font-mono">
                      {m.gridSize}x{m.gridSize}
                    </td>
                    <td className="py-2 text-center text-secondary font-bold font-mono">{m.score}</td>
                    <td className="py-2 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          m.status === "won" ? "text-emerald-400" : "text-destructive/80"
                        }`}
                      >
                        {m.status === "won" ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {m.status === "won" ? "Won" : "Lost"}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentMatches.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground/60">
                      No games played in the past 30 days.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub: string;
  color: string;
}) {
  return (
    <div className="candy-card rounded-xl p-4 flex flex-col justify-between h-28 hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <div className={`font-display text-2xl font-black ${color}`}>{value}</div>
        <div className="text-[9px] text-muted-foreground mt-0.5">{sub}</div>
      </div>
    </div>
  );
}
