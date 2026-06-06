import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Swords, Bot, Users, ArrowLeft } from "lucide-react";
import { RoomSetup } from "@/components/mobile/battle/RoomSetup";
import { WaitingRoom } from "@/components/mobile/battle/WaitingRoom";
import { OnlineBattleArena } from "@/components/mobile/battle/OnlineBattleArena";
import { DifficultyPicker } from "@/components/mobile/battle/DifficultyPicker";
import { BotBattleArena } from "@/components/mobile/battle/BotBattleArena";
import type { BotDifficulty } from "@/hooks/useBotOpponent";
import { createRoom, joinRoom, type RoomData } from "@/hooks/useOnlineBattle";
import { usePlayers } from "@/contexts/PlayersContext";
import { useAuth } from "@/contexts/AuthContext";
import { generateRandomGame } from "@/lib/dailyGame";
import { FULL_CATEGORY_POOL } from "@/data/categories";
import type { CricketPlayer, GridCategory } from "@/types/game";
import { toast } from "sonner";

type Phase =
  | "mode-select"
  | "bot-setup"
  | "bot-playing"
  | "online-setup"
  | "online-waiting"
  | "online-playing";

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

  const [phase, setPhase] = useState<Phase>("mode-select");
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  
  // Bot match state
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>("medium");
  const [botGridSize, setBotGridSize] = useState<3 | 4>(3);
  const [botGrid, setBotGrid] = useState<GridCategory[]>([]);
  const [botDeck, setBotDeck] = useState<CricketPlayer[]>([]);

  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const myName = user?.displayName || user?.email?.split("@")[0] || "Player";
  const myUid = user?.uid ?? "";

  // Build player map for deck resolution
  const playerMap = useMemo(
    () => new Map(allPlayers.map((p) => [p.id, p])),
    [allPlayers]
  );

  // ── Start Bot Game ────────────────────────────────────────────────────────
  const handleStartBotGame = useCallback(
    (difficulty: BotDifficulty, size: 3 | 4) => {
      if (allPlayers.length === 0) return;
      const game = generateRandomGame(size, allPlayers, FULL_CATEGORY_POOL);
      setBotDifficulty(difficulty);
      setBotGridSize(size);
      setBotGrid(game.grid as GridCategory[]);
      setBotDeck(game.deck);
      setPhase("bot-playing");
    },
    [allPlayers]
  );

  // ── Host: create a new room ──────────────────────────────────────────────
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
        setPhase("online-waiting");
      } catch (e) {
        console.error(e);
        toast.error("Failed to create multiplayer room");
      } finally {
        setCreating(false);
      }
    },
    [allPlayers, myUid, myName]
  );

  // ── Guest: join existing room ────────────────────────────────────────────
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
        setPhase("online-playing");
      } catch {
        setJoinError("Something went wrong. Please try again.");
      } finally {
        setJoining(false);
      }
    },
    [myUid, myName]
  );

  // ── Host: opponent joined ───────────────────────────────────────────────
  const handleOpponentJoined = useCallback((data: RoomData) => {
    setGameInfo((prev) =>
      prev ? { ...prev, opponentName: data.guestName ?? "Opponent" } : prev
    );
    setPhase("online-playing");
  }, []);

  // ── Go back to mode selection ─────────────────────────────────────────────
  const handleBackToSetup = useCallback(() => {
    setGameInfo(null);
    setPhase("mode-select");
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (playersLoading || authLoading) {
    return (
      <div className="min-h-screen stadium-bg flex items-center justify-center">
        <div className="text-secondary/60 font-display text-sm uppercase tracking-widest animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  // ── Mode select phase ─────────────────────────────────────────────────────
  if (phase === "mode-select") {
    return (
      <div className="min-h-screen stadium-bg flex items-center justify-center p-4 relative">
        <button
          onClick={() => navigate("/")}
          className="fixed top-4 left-4 hud-pill z-20"
          aria-label="Back to Hub"
        >
          <ArrowLeft className="w-4 h-4" /> HUB
        </button>

        <div className="w-full max-w-sm relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Swords className="w-6 h-6 text-primary" />
              <h1 className="font-display text-3xl font-black uppercase tracking-wider gold-text">
                Battle Mode
              </h1>
            </div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
              Select your challenge
            </p>
          </div>

          <div className="space-y-3">
            {/* CricBot card (free, local) */}
            <button
              onClick={() => setPhase("bot-setup")}
              className="mode-card color-orange w-full !flex-row !items-center !min-h-0 !py-4"
            >
              <div className="relative z-10 flex items-center gap-3 w-full text-white">
                <div className="w-11 h-11 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-display text-base font-black uppercase tracking-wider">
                    vs CricBot
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-85 mt-0.5">
                    Practice offline · Free
                  </div>
                </div>
              </div>
            </button>

            {/* VS Player card (online multiplayer) */}
            <button
              onClick={() => {
                if (!user || isGuest) {
                  toast.error("Multiplayer requires a signed-in account");
                  setPhase("mode-select");
                } else {
                  setPhase("online-setup");
                }
              }}
              className="mode-card color-blue w-full !flex-row !items-center !min-h-0 !py-4"
            >
              <div className="relative z-10 flex items-center gap-3 w-full text-white">
                <div className="w-11 h-11 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-display text-base font-black uppercase tracking-wider">
                    vs Player
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-85 mt-0.5">
                    Real-time multiplayer PvP
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Prompt to sign in if guest/logged out */}
          {(!user || isGuest) && (
            <div className="candy-card p-4 rounded-xl text-center space-y-2">
              <p className="text-[11px] text-muted-foreground">
                Want to play against real players? Sign in to unlock online matchmaking!
              </p>
              <button
                onClick={() => signInWithGoogle().catch(() => {})}
                className="text-xs font-display font-black text-primary uppercase tracking-wider hover:underline"
              >
                Sign in with Google
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Bot setup ────────────────────────────────────────────────────────────
  if (phase === "bot-setup") {
    return (
      <DifficultyPicker
        onStart={handleStartBotGame}
      />
    );
  }

  // ── Bot playing ──────────────────────────────────────────────────────────
  if (phase === "bot-playing") {
    return (
      <BotBattleArena
        grid={botGrid}
        deck={botDeck}
        gridSize={botGridSize}
        difficulty={botDifficulty}
        onPlayAgain={() => handleStartBotGame(botDifficulty, botGridSize)}
      />
    );
  }

  // ── Online setup ─────────────────────────────────────────────────────────
  if (phase === "online-setup") {
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

  // ── Online waiting ───────────────────────────────────────────────────────
  if (phase === "online-waiting" && gameInfo) {
    return (
      <WaitingRoom
        roomId={gameInfo.roomId}
        gridSize={gameInfo.gridSize}
        onOpponentJoined={handleOpponentJoined}
        onCancel={handleBackToSetup}
      />
    );
  }

  // ── Online playing ───────────────────────────────────────────────────────
  if (phase === "online-playing" && gameInfo) {
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
        onPlayAgain={handleBackToSetup}
      />
    );
  }

  return null;
}
