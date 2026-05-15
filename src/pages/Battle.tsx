import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Swords } from "lucide-react";
import { RoomSetup } from "@/components/battle/RoomSetup";
import { WaitingRoom } from "@/components/battle/WaitingRoom";
import { OnlineBattleArena } from "@/components/battle/OnlineBattleArena";
import { createRoom, joinRoom, type RoomData } from "@/hooks/useOnlineBattle";
import { usePlayers } from "@/contexts/PlayersContext";
import { useAuth } from "@/contexts/AuthContext";
import { generateRandomGame } from "@/lib/dailyGame";
import { FULL_CATEGORY_POOL } from "@/data/categories";
import type { CricketPlayer, GridCategory } from "@/types/game";

type Phase = "setup" | "waiting" | "playing";

interface GameInfo {
  roomId: string;
  myRole: "host" | "guest";
  grid: GridCategory[];
  deckIds: string[];
  gridSize: 3 | 4;
  opponentName: string;
}

export default function Battle() {
  const { players: allPlayers, loading: playersLoading } = usePlayers();
  const { user, isGuest, signInWithGoogle, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("setup");
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const myName = user?.displayName || user?.email?.split("@")[0] || "Player";
  // user.uid is required â€” guests are blocked below before reaching any Firestore calls
  const myUid = user?.uid ?? "";

  // Build player map for deck resolution
  const playerMap = useMemo(
    () => new Map(allPlayers.map((p) => [p.id, p])),
    [allPlayers]
  );

  // â”€â”€ Host: create a new room â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleCreateRoom = useCallback(
    async (gridSize: 3 | 4) => {
      if (allPlayers.length === 0) return;
      setCreating(true);
      try {
        const game = generateRandomGame(gridSize, allPlayers, FULL_CATEGORY_POOL);
        const deckIds = game.deck.map((p) => p.id);
        const roomId = await createRoom(gridSize, game.grid as GridCategory[], deckIds, myUid, myName);
        setGameInfo({
          roomId,
          myRole: "host",
          grid: game.grid as GridCategory[],
          deckIds,
          gridSize,
          opponentName: "Opponent",
        });
        setPhase("waiting");
      } catch (e) {
        console.error(e);
      } finally {
        setCreating(false);
      }
    },
    [allPlayers, myUid, myName]
  );

  // â”€â”€ Guest: join existing room â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleJoinRoom = useCallback(
    async (code: string) => {
      setJoining(true);
      setJoinError(null);
      try {
        const result = await joinRoom(code, myUid, myName);
        if ("error" in result) {
          setJoinError(result.error);
          return;
        }
        const { data } = result;
        setGameInfo({
          roomId: code.toUpperCase(),
          myRole: "guest",
          grid: data.grid,
          deckIds: data.deckIds,
          gridSize: data.gridSize,
          opponentName: data.hostName,
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

  // â”€â”€ Host: opponent joined (WaitingRoom fires this) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleOpponentJoined = useCallback((data: RoomData) => {
    setGameInfo((prev) =>
      prev ? { ...prev, opponentName: data.guestName ?? "Opponent" } : prev
    );
    setPhase("playing");
  }, []);

  // â”€â”€ Play Again: go back to setup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handlePlayAgain = useCallback(() => {
    setGameInfo(null);
    setPhase("setup");
  }, []);

  // â”€â”€ Loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (playersLoading || authLoading) {
    return (
      <div className="min-h-screen stadium-bg flex items-center justify-center">
        <div className="text-secondary/60 font-display text-sm uppercase tracking-widest animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  // â”€â”€ Sign-in gate: guests have no Firebase auth â†’ Firestore writes fail â”€â”€â”€
  if (!user || isGuest) {
    return (
      <div className="min-h-screen stadium-bg flex items-center justify-center p-4">
        <div className="glass-card rounded-xl p-8 w-full max-w-sm text-center space-y-5">
          <div className="flex items-center justify-center gap-2">
            <Swords className="w-6 h-6 text-primary" />
            <h2 className="font-display text-xl font-bold text-secondary uppercase tracking-wider">vs Player</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Real-time multiplayer requires a signed-in account so your opponent can find you.
          </p>
          <button
            onClick={() => signInWithGoogle().catch(() => {})}
            className="w-full py-3 rounded-xl font-display text-sm uppercase tracking-wider text-foreground font-bold transition-all active:scale-95"
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

  // â”€â”€ Setup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (phase === "setup") {
    return (
      <RoomSetup
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        creating={creating}
        joining={joining}
        joinError={joinError}
      />
    );
  }

  // â”€â”€ Waiting (host waiting for guest) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (phase === "waiting" && gameInfo) {
    return (
      <WaitingRoom
        roomId={gameInfo.roomId}
        gridSize={gameInfo.gridSize}
        onOpponentJoined={handleOpponentJoined}
        onCancel={handlePlayAgain}
      />
    );
  }

  // â”€â”€ Playing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (phase === "playing" && gameInfo) {
    // Resolve deck from deckIds + local player map
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
      />
    );
  }

  return null;
}
