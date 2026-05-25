import { useState, useCallback, useMemo } from "react";
import type { CricketPlayer } from "@/types/game";
import { triggerLightTap, triggerSuccessHaptic, triggerErrorHaptic } from "@/lib/haptics";
import {
  generateClues,
  getGuessablePlayers,
  pickRandomPlayers,
  calculateGuessScore,
  type Clue,
} from "@/lib/guessGameEngine";

export interface GuessRound {
  player: CricketPlayer;
  clues: Clue[];
  cluesRevealed: number;
  guessed: boolean;
  skipped: boolean;
  correct: boolean;
  pointsEarned: number;
}

export interface GuessGameState {
  rounds: GuessRound[];
  currentRound: number;
  score: number;
  streak: number;
  maxStreak: number;
  lives: number;
  status: "playing" | "finished";
}

const TOTAL_ROUNDS = 10;
const MAX_LIVES = 3;
const MAX_CLUES = 5;

export function useGuessGame(allPlayers: CricketPlayer[]) {
  const [game, setGame] = useState<GuessGameState | null>(null);

  const guessablePlayers = useMemo(
    () => getGuessablePlayers(allPlayers),
    [allPlayers]
  );

  const startGame = useCallback(() => {
    const selected = pickRandomPlayers(guessablePlayers, TOTAL_ROUNDS);
    const rounds: GuessRound[] = selected.map((player) => ({
      player,
      clues: generateClues(player),
      cluesRevealed: 3, // start with 3 clues shown (country + role + IPL team)
      guessed: false,
      skipped: false,
      correct: false,
      pointsEarned: 0,
    }));

    setGame({
      rounds,
      currentRound: 0,
      score: 0,
      streak: 0,
      maxStreak: 0,
      lives: MAX_LIVES,
      status: "playing",
    });
  }, [guessablePlayers]);

  const revealNextClue = useCallback(() => {
    triggerLightTap().catch(() => {});
    setGame((prev) => {
      if (!prev || prev.status !== "playing") return prev;
      const round = prev.rounds[prev.currentRound];
      if (round.cluesRevealed >= MAX_CLUES) return prev;

      const newRounds = [...prev.rounds];
      newRounds[prev.currentRound] = {
        ...round,
        cluesRevealed: round.cluesRevealed + 1,
      };
      return { ...prev, rounds: newRounds };
    });
  }, []);

  const submitGuess = useCallback((guessedPlayerId: string) => {
    setGame((prev) => {
      if (!prev || prev.status !== "playing") return prev;
      const round = prev.rounds[prev.currentRound];
      const isCorrect = guessedPlayerId === round.player.id;

      if (isCorrect) {
        triggerSuccessHaptic().catch(() => {});
      } else {
        triggerErrorHaptic().catch(() => {});
      }

      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const points = isCorrect
        ? calculateGuessScore(round.cluesRevealed, newStreak)
        : 0;
      const newLives = isCorrect ? prev.lives : prev.lives - 1;

      const newRounds = [...prev.rounds];
      newRounds[prev.currentRound] = {
        ...round,
        guessed: true,
        correct: isCorrect,
        pointsEarned: points,
      };

      const isLastRound = prev.currentRound >= TOTAL_ROUNDS - 1;
      const outOfLives = newLives <= 0;

      return {
        ...prev,
        rounds: newRounds,
        score: prev.score + points,
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        lives: newLives,
        status: isLastRound || outOfLives ? "finished" : "playing",
        // don't advance round yet — show result first
      };
    });
  }, []);

  const skipRound = useCallback(() => {
    triggerLightTap().catch(() => {});
    setGame((prev) => {
      if (!prev || prev.status !== "playing") return prev;
      const round = prev.rounds[prev.currentRound];

      const newRounds = [...prev.rounds];
      newRounds[prev.currentRound] = {
        ...round,
        skipped: true,
        guessed: true,
        pointsEarned: 0,
      };

      const isLastRound = prev.currentRound >= TOTAL_ROUNDS - 1;

      return {
        ...prev,
        rounds: newRounds,
        streak: 0,
        status: isLastRound ? "finished" : "playing",
      };
    });
  }, []);

  const nextRound = useCallback(() => {
    triggerLightTap().catch(() => {});
    setGame((prev) => {
      if (!prev) return prev;
      if (prev.currentRound >= TOTAL_ROUNDS - 1 || prev.lives <= 0) {
        return { ...prev, status: "finished" };
      }
      return { ...prev, currentRound: prev.currentRound + 1 };
    });
  }, []);

  return {
    game,
    startGame,
    revealNextClue,
    submitGuess,
    skipRound,
    nextRound,
    totalRounds: TOTAL_ROUNDS,
    maxClues: MAX_CLUES,
  };
}
