import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import type { CricketPlayer, GameState, GridCategory } from "@/types/game";
import { validate, calculateScore, checkBingo, getEligibleCells, getRecommendedCell, findNextPlayableIndex } from "@/lib/gameEngine";
import { generateDailyGame, getTodayDateString } from "@/lib/dailyGame";
import { FULL_CATEGORY_POOL } from "@/data/categories";
import allPlayersRaw from "@/data/players.json";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

const allPlayers = allPlayersRaw as CricketPlayer[];

// --- Storage helpers ---

function storageKey(date: string, gridSize: 3 | 4) {
  return `cricket-bingo-${date}-${gridSize}`;
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(storageKey(state.dailyGameId, state.gridSize), JSON.stringify(state));
  } catch { /* full or unavailable */ }
}

function loadState(date: string, gridSize: 3 | 4): GameState | null {
  try {
    const raw = localStorage.getItem(storageKey(date, gridSize));
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

// --- Pure post-turn logic (module-level, no closure deps) ---

function postTurn(state: GameState): GameState {
  // Check win
  const winLine = checkBingo(state.placements, state.grid, state.gridSize);
  if (winLine) {
    return { ...state, status: "won", winLine, score: state.score + 500 };
  }
  // Check loss: out of remaining turns
  if (state.remainingPlayers <= 0) {
    return { ...state, status: "lost" };
  }
  // Smart deck advancement: skip players who can't fill any unfilled cell
  const nextIdx = findNextPlayableIndex(
    state.deck,
    state.deckIndex,
    state.grid,
    state.placements
  );
  if (nextIdx === -1) {
    // No playable player left in deck → loss
    return { ...state, status: "lost" };
  }
  return { ...state, deckIndex: nextIdx };
}

// --- Initial state factory ---

export interface AdminGrid {
  grid: GridCategory[];
  deckPlayerIds: string[];
}

function createInitialState(gridSize: 3 | 4, adminGrid?: AdminGrid): GameState {
  const date = getTodayDateString();
  const remaining = gridSize === 3 ? 20 : 25;

  if (adminGrid) {
    // Use admin-customized grid, resolve deck player IDs to full objects
    const playerMap = new Map(allPlayers.map((p) => [p.id, p]));
    const deck = adminGrid.deckPlayerIds
      .map((id) => playerMap.get(id))
      .filter((p): p is CricketPlayer => !!p);

    return {
      dailyGameId: date,
      gridSize,
      grid: adminGrid.grid,
      deck: deck.length > 0 ? deck : generateDailyGame(date, gridSize, allPlayers, FULL_CATEGORY_POOL).deck,
      deckIndex: 0,
      placements: {},
      remainingPlayers: remaining,
      wildcardsLeft: 1,
      wildcardMode: false,
      score: 0,
      streak: 0,
      maxStreak: 0,
      status: "playing",
      winLine: null,
      feedbackStates: {},
      history: [],
    };
  }

  const daily = generateDailyGame(date, gridSize, allPlayers, FULL_CATEGORY_POOL);

  return {
    dailyGameId: date,
    gridSize,
    grid: daily.grid,
    deck: daily.deck,
    deckIndex: 0,
    placements: {},
    remainingPlayers: remaining,
    wildcardsLeft: 1,
    wildcardMode: false,
    score: 0,
    streak: 0,
    status: "playing",
    winLine: null,
    feedbackStates: {},
    history: [],
  };
}

// =============================================================
// Hook
// =============================================================

export function useGameState(gridSize: 3 | 4, adminGrid?: AdminGrid) {
  const [gameState, setGameState] = useState<GameState>(() => {
    const date = getTodayDateString();
    const saved = loadState(date, gridSize);

    // If admin grid exists, check if saved game matches it
    if (saved && adminGrid) {
      const savedGridIds = saved.grid.map((c) => c.id).join(",");
      const adminGridIds = adminGrid.grid.map((c) => c.id).join(",");
      if (savedGridIds !== adminGridIds) {
        // Admin changed the grid — discard stale save
        return createInitialState(gridSize, adminGrid);
      }
    }

    if (saved && saved.status === "playing") {
      const nextIdx = findNextPlayableIndex(saved.deck, saved.deckIndex, saved.grid, saved.placements);
      if (nextIdx === -1) return { ...saved, status: "lost" };
      return { ...saved, deckIndex: nextIdx };
    }
    if (saved) return saved;
    return createInitialState(gridSize, adminGrid);
  });

  const { user, userData, refreshUserData } = useAuth();

  // Persist on every state change
  useEffect(() => {
    saveState(gameState);
  }, [gameState]);

  // Save score to Firestore and update streak when game ends
  const scoreSavedRef = useRef(false);
  useEffect(() => {
    if (gameState.status === "playing" || !user || scoreSavedRef.current) return;
    scoreSavedRef.current = true;

    const saveScore = async () => {
      const date = gameState.dailyGameId;
      const filledCount = Object.values(gameState.placements).filter(Boolean).length;

      // Save score document
      const scoreId = `${date}-${gameState.gridSize}-${user.uid}`;
      await setDoc(doc(db, "scores", scoreId), {
        uid: user.uid,
        displayName: user.displayName ?? "",
        photoURL: user.photoURL ?? "",
        score: gameState.score,
        status: gameState.status,
        gridSize: gameState.gridSize,
        filledCount,
        date,
        createdAt: serverTimestamp(),
      });

      // Update streak
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const uData = userSnap.exists() ? userSnap.data() : {};
      const lastPlayed = uData.lastPlayedDate ?? "";
      let currentStreak = uData.currentStreak ?? 0;
      const longestStreak = uData.longestStreak ?? 0;

      if (lastPlayed === date) {
        // Already counted today — no streak change
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);
        if (lastPlayed === yesterdayStr) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      }

      const newLongest = Math.max(longestStreak, currentStreak);
      await setDoc(userRef, {
        currentStreak,
        longestStreak: newLongest,
        lastPlayedDate: date,
      }, { merge: true });

      // Refresh user data in context so UI updates
      await refreshUserData();
    };

    saveScore().catch(console.error);
  }, [gameState.status, user, gameState.dailyGameId, gameState.gridSize, gameState.score, gameState.placements, refreshUserData]);

  // Feedback timer ref (avoids useEffect dependency issues)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleFeedbackClear = useCallback(() => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => {
      setGameState((prev) => {
        // Only clear if there's actually feedback to clear
        const has = Object.values(prev.feedbackStates).some(Boolean);
        if (!has) return prev;
        return { ...prev, feedbackStates: {} };
      });
    }, 700);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  // --- Derived values (render-time) ---

  const currentPlayer: CricketPlayer | null =
    gameState.status === "playing" && gameState.deckIndex < gameState.deck.length
      ? gameState.deck[gameState.deckIndex]
      : null;

  const eligibleCells = useMemo(() => {
    if (!currentPlayer || gameState.wildcardMode) return [];
    return getEligibleCells(currentPlayer, gameState.grid, gameState.placements);
  }, [currentPlayer, gameState.grid, gameState.placements, gameState.wildcardMode]);

  const recommendedCell = useMemo(
    () => getRecommendedCell(eligibleCells, gameState.grid),
    [eligibleCells, gameState.grid]
  );

  // --- Actions (all state reads happen inside functional updater) ---

  // Unified cell click — reads wildcardMode from prev state, no stale closure
  const handleCellClick = useCallback(
    (categoryId: string) => {
      setGameState((prev) => {
        if (prev.status !== "playing") return prev;
        if (prev.placements[categoryId]) return prev;
        if (prev.deckIndex >= prev.deck.length) return prev;

        const player = prev.deck[prev.deckIndex];

        // --- Wildcard path ---
        if (prev.wildcardMode) {
          if (prev.wildcardsLeft <= 0) return prev;
          return postTurn({
            ...prev,
            placements: { ...prev.placements, [categoryId]: player },
            wildcardsLeft: prev.wildcardsLeft - 1,
            wildcardMode: false,
            score: prev.score + 50,
            streak: prev.streak + 1,
            maxStreak: Math.max(prev.maxStreak, prev.streak + 1),
            deckIndex: prev.deckIndex + 1,
            feedbackStates: { [categoryId]: "correct" },
            history: [
              ...prev.history,
              {
                turnNumber: prev.deckIndex,
                playerId: player.id,
                playerName: player.name,
                action: "wildcard" as const,
                targetCellId: categoryId,
                wasValid: true,
              },
            ],
          });
        }

        // --- Normal placement path ---
        const category = prev.grid.find((c) => c.id === categoryId);
        if (!category) return prev;

        const isValid = validate(player, category);
        let next = { ...prev };

        if (isValid) {
          next.placements = { ...prev.placements, [categoryId]: player };
          next.streak = prev.streak + 1;
          next.maxStreak = Math.max(prev.maxStreak, next.streak);
          next.score = prev.score + calculateScore(category, next.streak);
          next.feedbackStates = { [categoryId]: "correct" };
        } else {
          next.streak = 0;
          next.remainingPlayers = prev.remainingPlayers - 1;
          next.feedbackStates = { [categoryId]: "wrong" };
        }

        next.deckIndex = prev.deckIndex + 1;
        next.history = [
          ...prev.history,
          {
            turnNumber: prev.deckIndex,
            playerId: player.id,
            playerName: player.name,
            action: "placed" as const,
            targetCellId: categoryId,
            wasValid: isValid,
          },
        ];

        return postTurn(next);
      });

      scheduleFeedbackClear();
    },
    [scheduleFeedbackClear]
  );

  const handleSkip = useCallback(() => {
    setGameState((prev) => {
      if (prev.status !== "playing") return prev;
      if (prev.deckIndex >= prev.deck.length) return prev;

      const player = prev.deck[prev.deckIndex];

      return postTurn({
        ...prev,
        streak: 0,
        remainingPlayers: prev.remainingPlayers - 1,
        deckIndex: prev.deckIndex + 1,
        wildcardMode: false,
        feedbackStates: {},
        history: [
          ...prev.history,
          {
            turnNumber: prev.deckIndex,
            playerId: player.id,
            playerName: player.name,
            action: "skipped" as const,
          },
        ],
      });
    });
  }, []);

  const handleWildcard = useCallback(() => {
    setGameState((prev) => {
      if (prev.status !== "playing" || prev.wildcardsLeft <= 0) return prev;
      return { ...prev, wildcardMode: true };
    });
  }, []);

  const cancelWildcard = useCallback(() => {
    setGameState((prev) => ({ ...prev, wildcardMode: false }));
  }, []);

  const resetGame = useCallback(() => {
    const date = getTodayDateString();
    const key = storageKey(date, gridSize);
    try { localStorage.removeItem(key); } catch { /* ok */ }
    setGameState(createInitialState(gridSize, adminGrid));
  }, [gridSize, adminGrid]);

  const filledCount = Object.values(gameState.placements).filter(Boolean).length;

  return {
    gameState,
    currentPlayer,
    eligibleCells,
    recommendedCell,
    handleCellClick,
    handleSkip,
    handleWildcard,
    cancelWildcard,
    resetGame,
    filledCount,
    remaining: gameState.remainingPlayers,
    isGameOver: gameState.status !== "playing",
    hasBingo: gameState.status === "won",
  };
}
