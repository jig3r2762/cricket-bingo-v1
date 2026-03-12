import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Coins, Swords } from "lucide-react";
import { EntryFeePicker } from "@/components/battle/EntryFeePicker";
import { WaitingRoom } from "@/components/battle/WaitingRoom";
import { OnlineBattleArena } from "@/components/battle/OnlineBattleArena";
import { subscribeToRoom, type RoomData } from "@/hooks/useOnlineBattle";
import { usePlayers } from "@/contexts/PlayersContext";
import { useAuth } from "@/contexts/AuthContext";
import { generateRandomGame } from "@/lib/dailyGame";
import { FULL_CATEGORY_POOL } from "@/data/categories";
import type { CricketPlayer, GridCategory } from "@/types/game";
import { toast } from "sonner";

type Phase = "setup" | "waiting" | "playing";

interface GameInfo {
  roomId: string;
  myRole: "host" | "guest";
  grid: GridCategory[];
  deckIds: string[];
  gridSize: 3 | 4;
  opponentName: string;
  entryFee: number;
}

export default function PaidBattle() {
  const { players: allPlayers, loading: playersLoading } = usePlayers();
  const { user, isGuest, signInWithGoogle, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("setup");
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const myName = user?.displayName || user?.email?.split("@")[0] || "Player";
  const myUid = user?.uid ?? "";

  const playerMap = useMemo(
    () => new Map(allPlayers.map((p) => [p.id, p])),
    [allPlayers]
  );

  // ── Host: create paid room ────────────────────────────────────────────────
  const handleCreateRoom = useCallback(
    async (entryFee: number, gridSize: 3 | 4) => {
      if (allPlayers.length === 0) return;
      setCreating(true);
      try {
        const game = generateRandomGame(gridSize, allPlayers, FULL_CATEGORY_POOL);
        const deckIds = game.deck.map((p) => p.id);

        const res = await fetch("/api/paid-room-create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: myUid, hostName: myName, entryFee, gridSize, grid: game.grid, deckIds }),
        });

        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error ?? "Failed to create room");
          return;
        }

        const { roomId } = await res.json();
        setGameInfo({
          roomId,
          myRole: "host",
          grid: game.grid as GridCategory[],
          deckIds,
          gridSize,
          opponentName: "Opponent",
          entryFee,
        });
        setPhase("waiting");
      } catch {
        toast.error("Failed to create room. Please try again.");
      } finally {
        setCreating(false);
      }
    },
    [allPlayers, myUid, myName]
  );

  // ── Guest: join paid room ─────────────────────────────────────────────────
  const handleJoinRoom = useCallback(
    async (code: string) => {
      setJoining(true);
      setJoinError(null);
      try {
        const res = await fetch("/api/paid-room-join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: myUid, roomId: code, guestName: myName }),
        });

        if (!res.ok) {
          const err = await res.json();
          setJoinError(err.error ?? "Failed to join room");
          return;
        }

        const { data } = await res.json();
        setGameInfo({
          roomId: code.toUpperCase(),
          myRole: "guest",
          grid: data.grid,
          deckIds: data.deckIds,
          gridSize: data.gridSize,
          opponentName: data.hostName,
          entryFee: data.entryFee ?? 0,
        });
        setPhase("playing");
      } catch {
        setJoinError("Something went wrong. Please try again.");
      } finally {
        setJoining(false);
      }
    },
    [myUid, myName]
  );

  // ── Host: opponent joined ─────────────────────────────────────────────────
  const handleOpponentJoined = useCallback((data: RoomData) => {
    setGameInfo((prev) =>
      prev ? { ...prev, opponentName: data.guestName ?? "Opponent" } : prev
    );
    setPhase("playing");
  }, []);

  // ── Host: cancel with refund ──────────────────────────────────────────────
  const handleCancelWithRefund = useCallback(async () => {
    if (!gameInfo) return;
    try {
      const res = await fetch("/api/paid-room-refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: myUid, roomId: gameInfo.roomId }),
      });
      if (res.ok) {
        toast.success(`${gameInfo.entryFee} 🪙 refunded`);
      } else {
        const err = await res.json();
        toast.error(err.error ?? "Refund failed");
      }
    } catch {
      toast.error("Refund failed. Please contact support.");
    }
    setGameInfo(null);
    setPhase("setup");
  }, [gameInfo, myUid]);

  // ── Game over: call paid-room-finish ─────────────────────────────────────
  const handleGameOver = useCallback(
    async (score: number, filledCount: number, status: string) => {
      if (!gameInfo) return null;
      try {
        const res = await fetch("/api/paid-room-finish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: myUid, roomId: gameInfo.roomId, score, filledCount, status }),
        });
        if (!res.ok) return null;
        const result = await res.json();
        if (result.waiting) return null;
        return { coinsEarned: result.coinsEarned, outcome: result.outcome };
      } catch {
        return null;
      }
    },
    [gameInfo, myUid]
  );

  const handlePlayAgain = useCallback(() => {
    setGameInfo(null);
    setPhase("setup");
  }, []);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (playersLoading || authLoading) {
    return (
      <div className="min-h-screen stadium-bg flex items-center justify-center">
        <div className="text-secondary/60 font-display text-sm uppercase tracking-widest animate-pulse">Loading...</div>
      </div>
    );
  }

  // ── Sign-in gate ──────────────────────────────────────────────────────────
  if (!user || isGuest) {
    return (
      <div className="min-h-screen stadium-bg flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-8 w-full max-w-sm text-center space-y-5">
          <div className="flex items-center justify-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <Swords className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-secondary uppercase tracking-wider">Paid Battle</h2>
          </div>
          <p className="text-sm text-muted-foreground">Sign in to play for real coins.</p>
          <button
            onClick={() => signInWithGoogle().catch(() => {})}
            className="w-full py-3 rounded-xl font-display text-sm uppercase tracking-wider text-gray-800 font-bold transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #00ff41 0%, #00ff88 100%)" }}
          >
            Sign in with Google
          </button>
          <button
            onClick={() => navigate("/play")}
            className="w-full py-2 text-xs font-display uppercase tracking-wider text-muted-foreground hover:text-secondary transition-colors"
          >
            Back to Play
          </button>
        </div>
      </div>
    );
  }

  // ── Setup ─────────────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <EntryFeePicker
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        creating={creating}
        joining={joining}
        joinError={joinError}
      />
    );
  }

  // ── Waiting ───────────────────────────────────────────────────────────────
  if (phase === "waiting" && gameInfo) {
    return (
      <WaitingRoom
        roomId={gameInfo.roomId}
        gridSize={gameInfo.gridSize}
        onOpponentJoined={handleOpponentJoined}
        onCancel={handlePlayAgain}
        entryFee={gameInfo.entryFee}
        onCancelWithRefund={handleCancelWithRefund}
      />
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────
  if (phase === "playing" && gameInfo) {
    const deck = gameInfo.deckIds
      .map((id) => playerMap.get(id))
      .filter((p): p is CricketPlayer => !!p);

    return (
      <OnlineBattleArena
        key={gameInfo.roomId}
        roomId={gameInfo.roomId}
        myRole={gameInfo.myRole}
        grid={gameInfo.grid}
        deck={deck}
        gridSize={gameInfo.gridSize}
        myName={myName}
        opponentName={gameInfo.opponentName}
        onPlayAgain={handlePlayAgain}
        entryFee={gameInfo.entryFee}
        onGameOver={handleGameOver}
      />
    );
  }

  return null;
}
