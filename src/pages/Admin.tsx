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
  serverTimestamp,
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
  createdAt: unknown;
}

export default function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"grid" | "users">("grid");

  return (
    <div className="min-h-screen stadium-bg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-xl uppercase tracking-wider text-secondary">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-xs mt-1">
              {user?.email}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/play")}
              className="px-4 py-2 rounded-lg text-xs font-display uppercase tracking-wider border border-border/50 text-secondary hover:bg-secondary/10 transition-colors"
            >
              Back to Game
            </button>
            <button
              onClick={signOut}
              className="px-4 py-2 rounded-lg text-xs font-display uppercase tracking-wider border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-card/40 backdrop-blur-sm rounded-lg p-1 border border-border/30">
          <button
            onClick={() => setTab("grid")}
            className={`flex-1 px-4 py-2 rounded-md text-xs font-display uppercase tracking-wider transition-colors ${
              tab === "grid"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-secondary"
            }`}
          >
            Grid Manager
          </button>
          <button
            onClick={() => setTab("users")}
            className={`flex-1 px-4 py-2 rounded-md text-xs font-display uppercase tracking-wider transition-colors ${
              tab === "users"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-secondary"
            }`}
          >
            User Manager
          </button>
        </div>

        {tab === "grid" ? <GridManager /> : <UserManager />}
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
        list.push({ uid: d.id, ...d.data() } as FirestoreUser);
      });
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

      <div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl overflow-hidden">
        <table className="w-full">
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
