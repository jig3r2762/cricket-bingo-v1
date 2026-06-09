import { describe, it, expect } from "vitest";
import {
  validate,
  calculateScore,
  checkBingo,
  getEligibleCells,
  findNextPlayableIndex,
  getRecommendedCell,
} from "../lib/gameEngine";
import type { CricketPlayer, GridCategory } from "../types/game";

const mockPlayer1: CricketPlayer = {
  id: "p1",
  name: "Virat Kohli",
  country: "India",
  countryCode: "IN",
  countryFlag: "🇮🇳",
  iplTeams: ["RCB"],
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
  trophies: ["WC", "CT"],
  teammates: ["p2", "p3"],
  categories: ["Captains", "IPL Orange Cap"],
};

const mockPlayer2: CricketPlayer = {
  id: "p2",
  name: "AB de Villiers",
  country: "South Africa",
  countryCode: "ZA",
  countryFlag: "🇿🇦",
  iplTeams: ["RCB", "DD"],
  primaryRole: "WK-Bat",
  stats: {
    testRuns: 8000,
    testWickets: 0,
    testMatches: 114,
    odiRuns: 9000,
    odiWickets: 0,
    odiMatches: 228,
    t20iRuns: 1600,
    t20iWickets: 0,
    t20iMatches: 78,
    iplRuns: 5000,
    iplWickets: 0,
    iplMatches: 184,
    totalRuns: 18600,
    totalWickets: 0,
    centuries: 47,
    iplCenturies: 3,
  },
  trophies: [],
  teammates: ["p1"],
  categories: ["Captains"],
};

describe("gameEngine.ts unit tests", () => {
  describe("validate()", () => {
    it("should validate country", () => {
      const cat: GridCategory = {
        id: "c1",
        label: "India",
        shortLabel: "IN",
        icon: "🇮🇳",
        type: "country",
        validatorKey: "country:India",
      };
      expect(validate(mockPlayer1, cat)).toBe(true);
      expect(validate(mockPlayer2, cat)).toBe(false);
    });

    it("should validate overseas player", () => {
      const cat: GridCategory = {
        id: "c2",
        label: "Overseas",
        shortLabel: "OS",
        icon: "🌍",
        type: "role",
        validatorKey: "overseas",
      };
      expect(validate(mockPlayer1, cat)).toBe(false); // Indian player
      expect(validate(mockPlayer2, cat)).toBe(true); // SA player with IPL teams
    });

    it("should validate iplTeams length limit", () => {
      const cat: GridCategory = {
        id: "c3",
        label: "2+ IPL Teams",
        shortLabel: "IPL",
        icon: "🏏",
        type: "stat",
        validatorKey: "iplTeams>=2",
      };
      expect(validate(mockPlayer1, cat)).toBe(false); // Only RCB
      expect(validate(mockPlayer2, cat)).toBe(true); // RCB + DD
    });

    it("should validate specific team", () => {
      const cat: GridCategory = {
        id: "c4",
        label: "RCB",
        shortLabel: "RCB",
        icon: "❤️",
        type: "team",
        validatorKey: "team:RCB",
      };
      expect(validate(mockPlayer1, cat)).toBe(true);
      expect(validate(mockPlayer2, cat)).toBe(true);
    });

    it("should validate career stats", () => {
      const cat: GridCategory = {
        id: "c5",
        label: "10000+ Runs",
        shortLabel: "Runs",
        icon: "📊",
        type: "stat",
        validatorKey: "stat:totalRuns>=10000",
      };
      expect(validate(mockPlayer1, cat)).toBe(true);
      expect(validate(mockPlayer2, cat)).toBe(true);
    });

    it("should validate role (including Batsman/WK-Bat combo matches)", () => {
      const batsmanCat: GridCategory = {
        id: "c6",
        label: "Batsman",
        shortLabel: "Bat",
        icon: "🏏",
        type: "role",
        validatorKey: "role:Batsman",
      };
      const wkCat: GridCategory = {
        id: "c7",
        label: "WK-Bat",
        shortLabel: "WK",
        icon: "🧤",
        type: "role",
        validatorKey: "role:WK-Bat",
      };
      expect(validate(mockPlayer1, batsmanCat)).toBe(true); // Batsman matches Batsman
      expect(validate(mockPlayer2, batsmanCat)).toBe(true); // WK-Bat matches Batsman
      expect(validate(mockPlayer1, wkCat)).toBe(false); // Batsman does not match WK-Bat
      expect(validate(mockPlayer2, wkCat)).toBe(true); // WK-Bat matches WK-Bat
    });

    it("should validate trophies", () => {
      const cat: GridCategory = {
        id: "c8",
        label: "World Cup",
        shortLabel: "WC",
        icon: "🏆",
        type: "trophy",
        validatorKey: "trophy:WC",
      };
      expect(validate(mockPlayer1, cat)).toBe(true);
      expect(validate(mockPlayer2, cat)).toBe(false);
    });

    it("should validate teammates", () => {
      const cat: GridCategory = {
        id: "c9",
        label: "Teammate of AB",
        shortLabel: "Teammate",
        icon: "🤝",
        type: "teammate",
        validatorKey: "teammate:p2",
      };
      expect(validate(mockPlayer1, cat)).toBe(true);
      expect(validate(mockPlayer2, cat)).toBe(false); // cannot be teammate of yourself
    });

    it("should validate categories", () => {
      const cat: GridCategory = {
        id: "c10",
        label: "Captains",
        shortLabel: "Cap",
        icon: "👑",
        type: "achievement",
        validatorKey: "category:Captains",
      };
      expect(validate(mockPlayer1, cat)).toBe(true);
      expect(validate(mockPlayer2, cat)).toBe(true);
    });

    it("should validate combos (combo:team:RCB+country:India)", () => {
      const cat: GridCategory = {
        id: "c11",
        label: "RCB + Indian",
        shortLabel: "Combo",
        icon: "🔥",
        type: "combo",
        validatorKey: "combo:team:RCB+country:India",
      };
      expect(validate(mockPlayer1, cat)).toBe(true); // RCB + India
      expect(validate(mockPlayer2, cat)).toBe(false); // RCB + SA
    });
  });

  describe("calculateScore()", () => {
    it("should calculate score correctly with multiplier capping at 3.0", () => {
      const cat: GridCategory = {
        id: "c1",
        label: "India",
        shortLabel: "IN",
        icon: "🇮🇳",
        type: "country",
        validatorKey: "country:India",
      };
      // base is 100
      // streak = 0 -> multiplier = 1 -> score = 100
      expect(calculateScore(cat, 0)).toBe(100);
      // streak = 1 -> multiplier = 1.5 -> score = 150
      expect(calculateScore(cat, 1)).toBe(150);
      // streak = 4 -> multiplier = 3.0 -> score = 300
      expect(calculateScore(cat, 4)).toBe(300);
      // streak = 10 -> multiplier = 3.0 (capped) -> score = 300
      expect(calculateScore(cat, 10)).toBe(300);
    });

    it("should award higher base score for combo, teammate, and trophy types", () => {
      const comboCat: GridCategory = {
        id: "c1",
        label: "Combo",
        shortLabel: "Combo",
        icon: "🔥",
        type: "combo",
        validatorKey: "combo:...",
      };
      const tmCat: GridCategory = {
        id: "c2",
        label: "Teammate",
        shortLabel: "TM",
        icon: "🤝",
        type: "teammate",
        validatorKey: "teammate:...",
      };
      const trCat: GridCategory = {
        id: "c3",
        label: "Trophy",
        shortLabel: "TR",
        icon: "🏆",
        type: "trophy",
        validatorKey: "trophy:...",
      };

      // Combo base = 150
      expect(calculateScore(comboCat, 0)).toBe(150);
      // Teammate base = 130
      expect(calculateScore(tmCat, 0)).toBe(130);
      // Trophy base = 120
      expect(calculateScore(trCat, 0)).toBe(120);
    });
  });

  describe("checkBingo()", () => {
    it("should only return all indices as win line when every cell is filled", () => {
      const grid: GridCategory[] = [
        { id: "1", label: "A", shortLabel: "A", icon: "", type: "country", validatorKey: "" },
        { id: "2", label: "B", shortLabel: "B", icon: "", type: "country", validatorKey: "" },
        { id: "3", label: "C", shortLabel: "C", icon: "", type: "country", validatorKey: "" },
      ];

      const placementsPartial = {
        "1": mockPlayer1,
        "2": null,
        "3": null,
      };
      expect(checkBingo(placementsPartial, grid, 3)).toBeNull();

      const placementsFull = {
        "1": mockPlayer1,
        "2": mockPlayer2,
        "3": mockPlayer1,
      };
      expect(checkBingo(placementsFull, grid, 3)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });
  });

  describe("getEligibleCells()", () => {
    it("should return unfilled cell IDs matching validation", () => {
      const grid: GridCategory[] = [
        { id: "c1", label: "India", shortLabel: "IN", icon: "🇮🇳", type: "country", validatorKey: "country:India" },
        { id: "c2", label: "Overseas", shortLabel: "OS", icon: "🌍", type: "role", validatorKey: "overseas" },
      ];
      const placements = {
        c1: null,
        c2: null,
      };
      expect(getEligibleCells(mockPlayer1, grid, placements)).toEqual(["c1"]);
      expect(getEligibleCells(mockPlayer2, grid, placements)).toEqual(["c2"]);
    });
  });

  describe("findNextPlayableIndex()", () => {
    it("should return the index of the first player with eligible cells or -1 if none", () => {
      const deck = [mockPlayer1, mockPlayer2];
      const grid: GridCategory[] = [
        { id: "c1", label: "Overseas", shortLabel: "OS", icon: "🌍", type: "role", validatorKey: "overseas" },
      ];
      // mockPlayer1 (Indian) has no eligible cells, mockPlayer2 (Overseas) has 1
      const placements = { c1: null };

      expect(findNextPlayableIndex(deck, 0, grid, placements)).toBe(1);
      
      // If c1 is filled, nobody has eligible cells
      const placementsFilled = { c1: mockPlayer2 };
      expect(findNextPlayableIndex(deck, 0, grid, placementsFilled)).toBe(-1);
    });
  });

  describe("getRecommendedCell()", () => {
    it("should sort and return cells by category type priority order", () => {
      const grid: GridCategory[] = [
        { id: "c_team", label: "Team", shortLabel: "T", icon: "", type: "team", validatorKey: "" },
        { id: "c_combo", label: "Combo", shortLabel: "C", icon: "", type: "combo", validatorKey: "" },
        { id: "c_trophy", label: "Trophy", shortLabel: "Tr", icon: "", type: "trophy", validatorKey: "" },
      ];

      // priority order: combo (1) > trophy (3) > team (6)
      expect(getRecommendedCell(["c_team", "c_combo", "c_trophy"], grid)).toBe("c_combo");
      expect(getRecommendedCell(["c_team", "c_trophy"], grid)).toBe("c_trophy");
    });
  });
});
