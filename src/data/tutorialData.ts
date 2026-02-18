import type { GridCategory, CricketPlayer } from "@/types/game";

/**
 * Tutorial grid: 3×3
 * Top row (indices 0, 1, 2) is the WIN row: India → MI → Fast Bowler
 * The three tutorial players are designed to fill exactly this row → BINGO!
 */
export const TUTORIAL_GRID: GridCategory[] = [
  // Row 1 — WIN ROW
  { id: "country_ind", label: "India",               shortLabel: "IND",      icon: "🇮🇳", type: "country", validatorKey: "country:India" },
  { id: "team_mi",     label: "Mumbai Indians",       shortLabel: "MI",       icon: "🔵", type: "team",    validatorKey: "team:MI" },
  { id: "tut_pacer",   label: "Fast Bowler",          shortLabel: "PACER",    icon: "⚡", type: "role",    validatorKey: "role:Fast Bowler" },
  // Row 2
  { id: "team_csk",    label: "Chennai Super Kings",  shortLabel: "CSK",      icon: "🟡", type: "team",    validatorKey: "team:CSK" },
  { id: "tut_bat",     label: "Batsman",              shortLabel: "BAT",      icon: "🏏", type: "role",    validatorKey: "role:Batsman" },
  { id: "tut_ipl",     label: "IPL Winner",           shortLabel: "IPL",      icon: "🏆", type: "trophy",  validatorKey: "trophy:IPL" },
  // Row 3
  { id: "tut_10k",     label: "10,000+ Runs",         shortLabel: "10K RUNS", icon: "📊", type: "stat",    validatorKey: "stat:totalRuns>=10000" },
  { id: "country_aus", label: "Australia",            shortLabel: "AUS",      icon: "🦘", type: "country", validatorKey: "country:Australia" },
  { id: "tut_spin",    label: "Spin Bowler",          shortLabel: "SPINNER",  icon: "🌀", type: "role",    validatorKey: "role:Spin Bowler" },
];

const ZERO_STATS = {
  testRuns: 0, testWickets: 0, testMatches: 0,
  odiRuns: 0, odiWickets: 0, odiMatches: 0,
  t20iRuns: 0, t20iWickets: 0, t20iMatches: 0,
  iplRuns: 0, iplWickets: 0, iplMatches: 0,
  totalRuns: 0, totalWickets: 0, centuries: 0, iplCenturies: 0,
};

/**
 * Three tutorial players that fill the top row in order:
 * 1. Virat Kohli → India (cell 0)
 * 2. Rohit Sharma → MI (cell 1)
 * 3. Jasprit Bumrah → Fast Bowler (cell 2) → BINGO!
 */
export const TUTORIAL_PLAYERS: CricketPlayer[] = [
  {
    id: "tut_kohli",
    name: "Virat Kohli",
    country: "India",
    countryCode: "IND",
    countryFlag: "🇮🇳",
    iplTeams: ["RCB"],
    primaryRole: "Batsman",
    stats: { ...ZERO_STATS, testRuns: 8848, odiRuns: 13906, totalRuns: 26000, centuries: 80 },
    trophies: ["T20WC"],
    teammates: [],
    headshot_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Virat_Kohli_in_PMO_New_Delhi.jpg/120px-Virat_Kohli_in_PMO_New_Delhi.jpg",
  },
  {
    id: "tut_rohit",
    name: "Rohit Sharma",
    country: "India",
    countryCode: "IND",
    countryFlag: "🇮🇳",
    iplTeams: ["MI"],
    primaryRole: "Batsman",
    stats: { ...ZERO_STATS, odiRuns: 10709, totalRuns: 17000, centuries: 30 },
    trophies: ["IPL", "T20WC", "CWC"],
    teammates: [],
    headshot_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Prime_Minister_Of_Bharat_Shri_Narendra_Damodardas_Modi_with_Shri_Rohit_Gurunath_Sharma_%28Cropped%29.jpg/120px-Prime_Minister_Of_Bharat_Shri_Narendra_Damodardas_Modi_with_Shri_Rohit_Gurunath_Sharma_%28Cropped%29.jpg",
  },
  {
    id: "tut_bumrah",
    name: "Jasprit Bumrah",
    country: "India",
    countryCode: "IND",
    countryFlag: "🇮🇳",
    iplTeams: ["MI"],
    primaryRole: "Fast Bowler",
    stats: { ...ZERO_STATS, testWickets: 195, odiWickets: 149, totalWickets: 400 },
    trophies: ["T20WC", "CWC"],
    teammates: [],
  },
];

/**
 * Pre-computed eligible cells for each tutorial player.
 * Used to light up cyan-glowing cells in BingoGrid during the tutorial.
 */
export const TUTORIAL_ELIGIBLE_CELLS: Record<string, string[]> = {
  tut_kohli:  ["country_ind", "tut_bat", "tut_10k"],
  tut_rohit:  ["country_ind", "team_mi", "tut_bat", "tut_ipl", "tut_10k"],
  tut_bumrah: ["country_ind", "team_mi", "tut_pacer"],
};
