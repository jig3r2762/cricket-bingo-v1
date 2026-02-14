// Player type matching players.json exactly
export interface CricketPlayer {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  countryFlag: string;
  iplTeams: string[];
  primaryRole: string;
  stats: PlayerStats;
  trophies: string[];
  teammates: string[]; // flat array of player IDs
  headshot_url?: string; // Headshot image URL from Wikimedia Commons
  categories?: string[]; // Achievement categories (Captains, World Cup Winners, etc)
}

export interface PlayerStats {
  testRuns: number;
  testWickets: number;
  testMatches: number;
  odiRuns: number;
  odiWickets: number;
  odiMatches: number;
  t20iRuns: number;
  t20iWickets: number;
  t20iMatches: number;
  iplRuns: number;
  iplWickets: number;
  iplMatches: number;
  totalRuns: number;
  totalWickets: number;
  centuries: number;
  iplCenturies: number;
}

export type CategoryType =
  | "team"
  | "country"
  | "stat"
  | "role"
  | "trophy"
  | "teammate"
  | "achievement"
  | "combo";

export interface GridCategory {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  type: CategoryType;
  comboIcons?: string[];
  validatorKey: string;
}

export interface GameState {
  dailyGameId: string;
  gridSize: 3 | 4;
  grid: GridCategory[];
  deck: CricketPlayer[];
  deckIndex: number;
  placements: Record<string, CricketPlayer | null>;
  remainingPlayers: number;
  wildcardsLeft: number;
  wildcardMode: boolean;
  score: number;
  streak: number;
  maxStreak: number;
  status: "playing" | "won" | "lost";
  winLine: number[] | null;
  feedbackStates: Record<string, "correct" | "wrong" | null>;
  history: HistoryEntry[];
}

export interface HistoryEntry {
  turnNumber: number;
  playerId: string;
  playerName: string;
  action: "placed" | "skipped" | "wildcard";
  targetCellId?: string;
  wasValid?: boolean;
}

export interface DailyGame {
  date: string;
  gridSize: 3 | 4;
  grid: GridCategory[];
  deck: CricketPlayer[];
  seed: number;
}
