import { describe, it, expect } from "vitest";
import {
  generateClues,
  getGuessablePlayers,
  pickRandomPlayers,
  calculateGuessScore,
} from "../lib/guessGameEngine";
import type { CricketPlayer } from "../types/game";

const mockPlayer1: CricketPlayer = {
  id: "p1",
  name: "Virat Kohli",
  country: "India",
  countryCode: "IN",
  countryFlag: "🇮🇳",
  iplTeams: ["RCB", "IND"],
  primaryRole: "Batsman",
  stats: {
    testRuns: 8000,
    testWickets: 4,
    testMatches: 110,
    odiRuns: 13000,
    odiWickets: 5,
    odiMatches: 280,
    t20iRuns: 4000,
    t20iWickets: 4,
    t20iMatches: 115,
    iplRuns: 7000,
    iplWickets: 4,
    iplMatches: 230,
    totalRuns: 25000,
    totalWickets: 13,
    centuries: 80,
    iplCenturies: 7,
  },
  trophies: ["WC", "CT", "IPL"],
  teammates: ["p2"],
  categories: ["Captains", "IPL Orange Cap"],
};

const mockUnusablePlayer: CricketPlayer = {
  id: "p2",
  name: "", // empty name
  country: "India",
  countryCode: "IN",
  countryFlag: "🇮🇳",
  iplTeams: [],
  primaryRole: "Batsman",
  stats: {
    testRuns: 0,
    testWickets: 0,
    testMatches: 0,
    odiRuns: 0,
    odiWickets: 0,
    odiMatches: 0,
    t20iRuns: 0,
    t20iWickets: 0,
    t20iMatches: 0,
    iplRuns: 0,
    iplWickets: 0,
    iplMatches: 0,
    totalRuns: 0,
    totalWickets: 0,
    centuries: 0,
    iplCenturies: 0,
  },
  trophies: [],
  teammates: [],
};

describe("guessGameEngine.ts unit tests", () => {
  describe("generateClues()", () => {
    it("should generate exactly 5 clues ordered from broad to specific", () => {
      // Use deterministic mock RNG
      const mockRng = () => 0.1;
      const clues = generateClues(mockPlayer1, mockRng);
      expect(clues).toHaveLength(5);

      // Clue 1: Nationality
      expect(clues[0].label).toBe("Nationality");
      expect(clues[0].text).toContain("India");

      // Clue 2: Role
      expect(clues[1].label).toBe("Role");
      expect(clues[1].text).toContain("Batsman");

      // Clue 3: IPL Team
      expect(clues[2].label).toBe("IPL Team");
      // Since mockRng returns 0.1, Math.floor(0.1 * 2) = 0 -> RCB
      expect(clues[2].text).toContain("RCB");

      // Clue 4: Career Stat
      expect(clues[3].label).toBe("Career Stat");
      expect(clues[3].text).toContain("runs");

      // Clue 5: Achievement / Trophy
      expect(clues[4].label).toBe("Trophy");
      expect(clues[4].text).toContain("winner");
    });
  });

  describe("getGuessablePlayers()", () => {
    it("should filter out players with low stats or missing info", () => {
      const players = [mockPlayer1, mockUnusablePlayer];
      const guessable = getGuessablePlayers(players);
      expect(guessable).toHaveLength(1);
      expect(guessable[0].id).toBe("p1");
    });
  });

  describe("pickRandomPlayers()", () => {
    it("should return correct number of players from the pool", () => {
      const pool = [mockPlayer1, mockPlayer1, mockPlayer1];
      const selected = pickRandomPlayers(pool, 2);
      expect(selected).toHaveLength(2);
    });
  });

  describe("calculateGuessScore()", () => {
    it("should compute correct guess scores based on clues revealed and streaks", () => {
      // Base score for 3 clues = 300
      expect(calculateGuessScore(3, 1)).toBe(300);
      // Base score for 4 clues = 200
      expect(calculateGuessScore(4, 1)).toBe(200);
      // Base score for 5 clues = 100
      expect(calculateGuessScore(5, 1)).toBe(100);

      // Streak bonus: 1.5x multiplier for streak=2, 2.0x for streak=3
      expect(calculateGuessScore(3, 2)).toBe(450); // 300 * 1.5
      expect(calculateGuessScore(3, 3)).toBe(600); // 300 * 2.0
    });
  });
});
