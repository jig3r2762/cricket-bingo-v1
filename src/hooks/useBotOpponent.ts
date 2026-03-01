import { useState, useRef, useEffect, useCallback } from "react";
import type { CricketPlayer, GameState, GridCategory } from "@/types/game";
import { getEligibleCells, getRecommendedCell } from "@/lib/gameEngine";
import { postTurn } from "@/hooks/useGameState";

export type BotDifficulty = "easy" | "medium" | "hard";

export interface BotOpponentInput {
  grid: GridCategory[];
  deck: CricketPlayer[];
  gridSize: 3 | 4;
  difficulty: BotDifficulty;
  enabled: boolean;
}

function createBotInitialState(input: BotOpponentInput): GameState {
  return {
    dailyGameId: `bot-${Date.now()}`,
    gridSize: input.gridSize,
    grid: input.grid,
    deck: input.deck,
    deckIndex: 0,
    placements: {},
    remainingPlayers: input.gridSize === 3 ? 20 : 25,
    wildcardsLeft: 0, // bot never uses wildcards
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

function getThinkTime(difficulty: BotDifficulty): number {
  switch (difficulty) {
    case "easy":   return 8000 + Math.random() * 4000;   // 8–12s
    case "medium": return 4000 + Math.random() * 3000;   // 4–7s
    case "hard":   return 2000 + Math.random() * 2000;   // 2–4s
  }
}

function botPickCell(
  state: GameState,
  difficulty: BotDifficulty
): string | null {
  const player = state.deck[state.deckIndex];
  if (!player) return null;

  const eligible = getEligibleCells(player, state.grid, state.placements);
  if (eligible.length === 0) return null;

  if (difficulty === "easy") {
    // Random 30% chance to skip even when eligible
    if (Math.random() < 0.3) return null;
    // Pick a random eligible cell
    return eligible[Math.floor(Math.random() * eligible.length)];
  }

  // medium / hard: always pick recommended cell
  return getRecommendedCell(eligible, state.grid);
}

function applyBotTurn(state: GameState, difficulty: BotDifficulty): GameState {
  if (state.status !== "playing") return state;
  if (state.deckIndex >= state.deck.length) return state;

  const player = state.deck[state.deckIndex];
  const eligible = getEligibleCells(player, state.grid, state.placements);

  // Forced skip: no eligible cells
  if (eligible.length === 0) {
    return postTurn({
      ...state,
      streak: 0,
      remainingPlayers: state.remainingPlayers - 1,
      deckIndex: state.deckIndex + 1,
      feedbackStates: {},
      history: [
        ...state.history,
        {
          turnNumber: state.deckIndex,
          playerId: player.id,
          playerName: player.name,
          action: "skipped" as const,
        },
      ],
    });
  }

  const chosenCellId = botPickCell(state, difficulty);

  // Bot chose to skip (easy mode random skip)
  if (!chosenCellId) {
    return postTurn({
      ...state,
      streak: 0,
      remainingPlayers: state.remainingPlayers - 1,
      deckIndex: state.deckIndex + 1,
      feedbackStates: {},
      history: [
        ...state.history,
        {
          turnNumber: state.deckIndex,
          playerId: player.id,
          playerName: player.name,
          action: "skipped" as const,
        },
      ],
    });
  }

  const category = state.grid.find((c) => c.id === chosenCellId)!;
  const newStreak = state.streak + 1;
  const newScore = state.score + (category.type === "combo" ? 150 : category.type === "teammate" ? 130 : 100) * Math.min(1 + state.streak * 0.5, 3.0);

  return postTurn({
    ...state,
    placements: { ...state.placements, [chosenCellId]: player },
    streak: newStreak,
    maxStreak: Math.max(state.maxStreak, newStreak),
    score: Math.round(newScore),
    deckIndex: state.deckIndex + 1,
    feedbackStates: { [chosenCellId]: "correct" },
    history: [
      ...state.history,
      {
        turnNumber: state.deckIndex,
        playerId: player.id,
        playerName: player.name,
        action: "placed" as const,
        targetCellId: chosenCellId,
        wasValid: true,
      },
    ],
  });
}

export function useBotOpponent(input: BotOpponentInput) {
  const { grid, deck, gridSize, difficulty, enabled } = input;

  // Source of truth lives in a ref to avoid stale closures in setTimeout callbacks
  const stateRef = useRef<GameState>(createBotInitialState(input));
  const [botGameState, setBotGameState] = useState<GameState>(() => stateRef.current);
  const [isThinking, setIsThinking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const scheduleTurn = useCallback(() => {
    if (!enabledRef.current) return;
    if (stateRef.current.status !== "playing") return;

    setIsThinking(true);
    const delay = getThinkTime(difficulty);

    timerRef.current = setTimeout(() => {
      if (!enabledRef.current) return;
      if (stateRef.current.status !== "playing") return;

      const nextState = applyBotTurn(stateRef.current, difficulty);
      stateRef.current = nextState;
      setBotGameState(nextState);
      setIsThinking(false);

      // Schedule next turn if still playing
      if (nextState.status === "playing") {
        scheduleTurn();
      }
    }, delay);
  }, [difficulty]);

  // Start bot loop when enabled becomes true
  useEffect(() => {
    if (!enabled) return;

    // Minimum 2s start delay before first bot move
    timerRef.current = setTimeout(() => {
      scheduleTurn();
    }, 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, scheduleTurn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const botFilledCount = Object.values(botGameState.placements).filter(Boolean).length;

  return { botGameState, botFilledCount, isThinking };
}
