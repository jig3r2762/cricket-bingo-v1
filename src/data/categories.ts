import type { GridCategory } from "@/types/game";

export const TEAM_COLORS: Record<string, string> = {
  MI: "#2563eb",
  CSK: "#eab308",
  RCB: "#e11d48",
  RR: "#ec4899",
  DC: "#1e40af",
  SRH: "#f97316",
  GT: "#1d4ed8",
  KKR: "#7c3aed",
  PBKS: "#dc2626",
  LSG: "#0891b2",
};

export const COUNTRY_FLAGS: Record<string, string> = {
  India: "\u{1F1EE}\u{1F1F3}",
  Australia: "\u{1F1E6}\u{1F1FA}",
  England: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
  "South Africa": "\u{1F1FF}\u{1F1E6}",
  "New Zealand": "\u{1F1F3}\u{1F1FF}",
  Afghanistan: "\u{1F1E6}\u{1F1EB}",
  "West Indies": "\u{1F3DD}\u{FE0F}",
  Pakistan: "\u{1F1F5}\u{1F1F0}",
  "Sri Lanka": "\u{1F1F1}\u{1F1F0}",
  Bangladesh: "\u{1F1E7}\u{1F1E9}",
  Zimbabwe: "\u{1F1FF}\u{1F1FC}",
  Ireland: "\u{1F1EE}\u{1F1EA}",
};

export const COUNTRY_CODE_MAP: Record<string, string> = {
  IND: "India",
  AUS: "Australia",
  ENG: "England",
  SA: "South Africa",
  NZ: "New Zealand",
  AFG: "Afghanistan",
  WI: "West Indies",
  PAK: "Pakistan",
  SL: "Sri Lanka",
  BAN: "Bangladesh",
  ZIM: "Zimbabwe",
  IRE: "Ireland",
};

// Full pool of ~42 categories for daily grid generation
export const FULL_CATEGORY_POOL: GridCategory[] = [
  // --- TEAM (10) ---
  { id: "team_mi", label: "Mumbai Indians", shortLabel: "MI", icon: "shield", type: "team", validatorKey: "team:MI" },
  { id: "team_csk", label: "Chennai Super Kings", shortLabel: "CSK", icon: "shield", type: "team", validatorKey: "team:CSK" },
  { id: "team_rcb", label: "Royal Challengers", shortLabel: "RCB", icon: "shield", type: "team", validatorKey: "team:RCB" },
  { id: "team_dc", label: "Delhi Capitals", shortLabel: "DC", icon: "shield", type: "team", validatorKey: "team:DC" },
  { id: "team_srh", label: "Sunrisers Hyderabad", shortLabel: "SRH", icon: "shield", type: "team", validatorKey: "team:SRH" },
  { id: "team_rr", label: "Rajasthan Royals", shortLabel: "RR", icon: "shield", type: "team", validatorKey: "team:RR" },
  { id: "team_kkr", label: "Kolkata Knight Riders", shortLabel: "KKR", icon: "shield", type: "team", validatorKey: "team:KKR" },
  { id: "team_pbks", label: "Punjab Kings", shortLabel: "PBKS", icon: "shield", type: "team", validatorKey: "team:PBKS" },
  { id: "team_gt", label: "Gujarat Titans", shortLabel: "GT", icon: "shield", type: "team", validatorKey: "team:GT" },
  { id: "team_lsg", label: "Lucknow Super Giants", shortLabel: "LSG", icon: "shield", type: "team", validatorKey: "team:LSG" },

  // --- COUNTRY (8) ---
  { id: "country_ind", label: "India", shortLabel: "IND", icon: "flag", type: "country", validatorKey: "country:India" },
  { id: "country_aus", label: "Australia", shortLabel: "AUS", icon: "flag", type: "country", validatorKey: "country:Australia" },
  { id: "country_eng", label: "England", shortLabel: "ENG", icon: "flag", type: "country", validatorKey: "country:England" },
  { id: "country_sa", label: "South Africa", shortLabel: "SA", icon: "flag", type: "country", validatorKey: "country:South Africa" },
  { id: "country_nz", label: "New Zealand", shortLabel: "NZ", icon: "flag", type: "country", validatorKey: "country:New Zealand" },
  { id: "country_pak", label: "Pakistan", shortLabel: "PAK", icon: "flag", type: "country", validatorKey: "country:Pakistan" },
  { id: "country_sl", label: "Sri Lanka", shortLabel: "SL", icon: "flag", type: "country", validatorKey: "country:Sri Lanka" },
  { id: "country_wi", label: "West Indies", shortLabel: "WI", icon: "flag", type: "country", validatorKey: "country:West Indies" },

  // --- STAT (6) ---
  { id: "stat_10k_runs", label: "10K+ Runs", shortLabel: "10K RUNS", icon: "target", type: "stat", validatorKey: "stat:totalRuns>=10000" },
  { id: "stat_5k_odi", label: "5000+ ODI Runs", shortLabel: "5K ODI", icon: "target", type: "stat", validatorKey: "stat:odiRuns>=5000" },
  { id: "stat_300_wkts", label: "300+ Wickets", shortLabel: "300 WKTS", icon: "circle-dot", type: "stat", validatorKey: "stat:totalWickets>=300" },
  { id: "stat_century", label: "Century Maker", shortLabel: "100s", icon: "award", type: "stat", validatorKey: "stat:centuries>=1" },
  { id: "stat_50_tests", label: "50+ Test Matches", shortLabel: "50 TESTS", icon: "target", type: "stat", validatorKey: "stat:testMatches>=50" },
  { id: "stat_1k_ipl", label: "1000+ IPL Runs", shortLabel: "1K IPL", icon: "target", type: "stat", validatorKey: "stat:iplRuns>=1000" },

  // --- ROLE (5) ---
  { id: "role_pacer", label: "Fast Bowler", shortLabel: "PACER", icon: "zap", type: "role", validatorKey: "role:Fast Bowler" },
  { id: "role_spinner", label: "Spin Wizard", shortLabel: "SPINNER", icon: "refresh-cw", type: "role", validatorKey: "role:Spin Bowler" },
  { id: "role_allrounder", label: "All-Rounder", shortLabel: "ALL-RTR", icon: "star", type: "role", validatorKey: "role:All-Rounder" },
  { id: "role_wk", label: "Wicket-Keeper", shortLabel: "WK", icon: "shield", type: "role", validatorKey: "role:WK-Bat" },
  { id: "role_batsman", label: "Batsman", shortLabel: "BAT", icon: "award", type: "role", validatorKey: "role:Batsman" },

  // --- TROPHY (4) ---
  { id: "trophy_ipl", label: "IPL Winner", shortLabel: "IPL", icon: "trophy", type: "trophy", validatorKey: "trophy:IPL" },
  { id: "trophy_cwc", label: "World Cup Winner", shortLabel: "CWC", icon: "trophy", type: "trophy", validatorKey: "trophy:CWC" },
  { id: "trophy_t20wc", label: "T20 WC Winner", shortLabel: "T20WC", icon: "trophy", type: "trophy", validatorKey: "trophy:T20WC" },
  { id: "trophy_ct", label: "Champions Trophy", shortLabel: "CT", icon: "trophy", type: "trophy", validatorKey: "trophy:CT" },

  // --- TEAMMATE (3) ---
  { id: "tm_dhoni", label: "Played with Dhoni", shortLabel: "w/ DHONI", icon: "users", type: "teammate", validatorKey: "teammate:ind_ms_dhoni" },
  { id: "tm_kohli", label: "Played with Kohli", shortLabel: "w/ KOHLI", icon: "users", type: "teammate", validatorKey: "teammate:ind_virat_kohli" },
  { id: "tm_sachin", label: "Played with Sachin", shortLabel: "w/ SACHIN", icon: "users", type: "teammate", validatorKey: "teammate:ind_sachin_tendulkar" },

  // --- ACHIEVEMENT (6) NEW ---
  { id: "ach_captains", label: "Captains", shortLabel: "CAPTAIN", icon: "crown", type: "achievement", validatorKey: "category:Captains" },
  { id: "ach_century_makers", label: "50+ Century Makers", shortLabel: "50+ 100s", icon: "award", type: "achievement", validatorKey: "category:100+ Century Makers" },
  { id: "ach_fastest_bowling", label: "Fastest Bowling", shortLabel: "PACE KING", icon: "zap", type: "achievement", validatorKey: "category:Fastest Bowling" },
  { id: "ach_aggressive_batsmen", label: "Aggressive Batsmen", shortLabel: "AGGR BAT", icon: "flame", type: "achievement", validatorKey: "category:Aggressive Batsmen" },
  { id: "ach_world_cup_winners", label: "World Cup Winners", shortLabel: "WC WIN", icon: "trophy", type: "achievement", validatorKey: "category:World Cup Winners" },
  { id: "ach_ipl_superstars", label: "IPL Superstars", shortLabel: "IPL STAR", icon: "star", type: "achievement", validatorKey: "category:IPL Superstars" },

  // --- COMBO (6) ---
  { id: "combo_mi_ind", label: "MI + Indian", shortLabel: "MI+IND", icon: "shield", type: "combo", comboIcons: ["shield", "flag"], validatorKey: "combo:team:MI+country:India" },
  { id: "combo_csk_pacer", label: "CSK + Pacer", shortLabel: "CSK+PACE", icon: "shield", type: "combo", comboIcons: ["shield", "zap"], validatorKey: "combo:team:CSK+role:Fast Bowler" },
  { id: "combo_aus_300", label: "AUS + 300 Wkts", shortLabel: "AUS+WKTS", icon: "flag", type: "combo", comboIcons: ["flag", "circle-dot"], validatorKey: "combo:country:Australia+stat:totalWickets>=300" },
  { id: "combo_rcb_bat", label: "RCB + Batsman", shortLabel: "RCB+BAT", icon: "shield", type: "combo", comboIcons: ["shield", "award"], validatorKey: "combo:team:RCB+role:Batsman" },
  { id: "combo_ind_spinner", label: "IND + Spinner", shortLabel: "IND+SPIN", icon: "flag", type: "combo", comboIcons: ["flag", "refresh-cw"], validatorKey: "combo:country:India+role:Spin Bowler" },
  { id: "combo_ipl_csk", label: "CSK + IPL Winner", shortLabel: "CSK+IPL", icon: "shield", type: "combo", comboIcons: ["shield", "trophy"], validatorKey: "combo:team:CSK+trophy:IPL" },
];
