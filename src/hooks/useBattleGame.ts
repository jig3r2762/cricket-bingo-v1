import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { CricketPlayer, GameState, GridCategory } from "@/types/game";
import { getEligibleCells, getRecommendedCell } from "@/lib/gameEngine";
import { validate, calculateScore, checkBingo, findNextPlayableIndex } from "@/lib/gameEngine";
import { postTurn } from "@/hooks/useGameState";

export interface BattleGameInput {
  grid: GridCategory[];
  deck: CricketPlayer[];
  gridSize: 3 | 4;
}

function createBattleState(input: BattleGameInput): GameState {
  return {
    dailyGameId: `battle-${Date.now()}`,
    gridSize: input.gridSize,
    grid: input.grid,
    deck: input.deck,
    deckIndex: 0,
    placements: {},
    remainingPlayers: input.gridSize === 3 ? 20 : 25,
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

export function useBattleGame(input: BattleGameInput) {
  const [gameState, setGameState] = useState<GameState>(() => createBattleState(input));

  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleFeedbackClear = useCallback(() => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => {
      setGameState((prev) => {
        const has = Object.values(prev.feedbackStates).some(Boolean);
        if (!has) return prev;
        return { ...prev, feedbackStates: {} };
      });
    }, 700);
  }, []);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

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

  const handleCellClick = useCallback(
    (categoryId: string) => {
      setGameState((prev) => {
        if (prev.status !== "playing") return prev;
        if (prev.placements[categoryId]) return prev;
        if (prev.deckIndex >= prev.deck.length) return prev;

        const player = prev.deck[prev.deckIndex];

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
    filledCount,
    remaining: gameState.remainingPlayers,
    isGameOver: gameState.status !== "playing",
  };
}
