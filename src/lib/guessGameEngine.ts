import type { CricketPlayer } from "@/types/game";

export interface Clue {
  icon: string;
  label: string;
  text: string;
  color: string;
}

/**
 * Generate 5 clues for a player, ordered from broad → specific.
 * 1. Country  2. Role  3. IPL Team  4. Stat  5. Achievement/Trophy
 */
export function generateClues(player: CricketPlayer): Clue[] {
  const clues: Clue[] = [];

  // 1. Country
  clues.push({
    icon: player.countryFlag || "🌍",
    label: "Nationality",
    text: `This player is from ${player.country}`,
    color: "bg-candy-blue",
  });

  // 2. Role
  const roleMap: Record<string, string> = {
    Batsman: "a Batsman",
    "Fast Bowler": "a Fast Bowler",
    "Spin Bowler": "a Spin Bowler",
    "All-Rounder": "an All-Rounder",
    "WK-Bat": "a Wicketkeeper-Batsman",
  };
  clues.push({
    icon: "🏏",
    label: "Role",
    text: `They are ${roleMap[player.primaryRole] || player.primaryRole}`,
    color: "bg-candy-orange",
  });

  // 3. IPL Team (pick a random one if multiple)
  if (player.iplTeams.length > 0) {
    const team =
      player.iplTeams.length === 1
        ? player.iplTeams[0]
        : player.iplTeams[Math.floor(Math.random() * player.iplTeams.length)];
    const teamLabel =
      player.iplTeams.length > 1
        ? `They have played for ${team} (and ${player.iplTeams.length - 1} other IPL team${player.iplTeams.length > 2 ? "s" : ""})`
        : `They play for ${team} in the IPL`;
    clues.push({
      icon: "🏟️",
      label: "IPL Team",
      text: teamLabel,
      color: "bg-candy-purple",
    });
  } else {
    clues.push({
      icon: "🏟️",
      label: "IPL",
      text: "They have not played in the IPL",
      color: "bg-candy-purple",
    });
  }

  // 4. Stat clue — pick the most interesting stat
  const statClue = pickStatClue(player);
  clues.push({
    icon: "📊",
    label: "Career Stat",
    text: statClue,
    color: "bg-candy-green",
  });

  // 5. Achievement / Trophy / Teammate
  const achievementClue = pickAchievementClue(player);
  clues.push({
    icon: achievementClue.icon,
    label: achievementClue.label,
    text: achievementClue.text,
    color: "bg-candy-red",
  });

  return clues;
}

function pickStatClue(player: CricketPlayer): string {
  const s = player.stats;
  const options: string[] = [];

  if (s.totalRuns >= 10000)
    options.push(`They have scored ${Math.floor(s.totalRuns / 1000) * 1000}+ international runs`);
  else if (s.totalRuns >= 5000)
    options.push(`They have scored ${Math.floor(s.totalRuns / 1000) * 1000}+ international runs`);
  else if (s.totalRuns >= 1000)
    options.push(`They have scored ${Math.floor(s.totalRuns / 500) * 500}+ international runs`);

  if (s.totalWickets >= 300)
    options.push(`They have taken ${Math.floor(s.totalWickets / 100) * 100}+ international wickets`);
  else if (s.totalWickets >= 100)
    options.push(`They have taken ${Math.floor(s.totalWickets / 50) * 50}+ international wickets`);

  if (s.iplRuns >= 3000)
    options.push(`They have ${Math.floor(s.iplRuns / 1000) * 1000}+ IPL runs`);
  else if (s.iplRuns >= 1000)
    options.push(`They have ${Math.floor(s.iplRuns / 500) * 500}+ IPL runs`);

  if (s.iplWickets >= 100)
    options.push(`They have taken ${Math.floor(s.iplWickets / 50) * 50}+ IPL wickets`);
  else if (s.iplWickets >= 50)
    options.push(`They have taken 50+ IPL wickets`);

  if (s.centuries >= 10)
    options.push(`They have hit ${Math.floor(s.centuries / 5) * 5}+ international centuries`);
  else if (s.centuries >= 1)
    options.push(`They have ${s.centuries} international century${s.centuries > 1 ? "ies" : ""}`);

  if (s.testMatches >= 100)
    options.push(`They have played ${Math.floor(s.testMatches / 25) * 25}+ Test matches`);
  else if (s.testMatches >= 50)
    options.push(`They have played 50+ Test matches`);

  if (options.length === 0) {
    if (s.t20iMatches > 0)
      return `They have played ${s.t20iMatches} T20I match${s.t20iMatches > 1 ? "es" : ""}`;
    return `They have played ${s.odiMatches + s.testMatches + s.t20iMatches} international matches`;
  }

  return options[Math.floor(Math.random() * options.length)];
}

function pickAchievementClue(player: CricketPlayer): {
  icon: string;
  label: string;
  text: string;
} {
  const options: { icon: string; label: string; text: string }[] = [];

  // Trophies
  const trophyNames: Record<string, string> = {
    IPL: "IPL",
    CWC: "Cricket World Cup",
    T20WC: "T20 World Cup",
    CT: "Champions Trophy",
  };
  for (const t of player.trophies) {
    if (trophyNames[t]) {
      options.push({
        icon: "🏆",
        label: "Trophy",
        text: `They are a ${trophyNames[t]} winner`,
      });
    }
  }

  // Categories / achievements
  if (player.categories) {
    for (const cat of player.categories) {
      if (cat === "Captains")
        options.push({ icon: "👑", label: "Achievement", text: "They have captained their national team" });
      if (cat === "IPL Orange Cap")
        options.push({ icon: "🧢", label: "Achievement", text: "They have won the IPL Orange Cap" });
      if (cat === "IPL Purple Cap")
        options.push({ icon: "🧢", label: "Achievement", text: "They have won the IPL Purple Cap" });
      if (cat === "Aggressive Batsmen")
        options.push({ icon: "💥", label: "Style", text: "They are known as an aggressive batsman" });
      if (cat === "T20 Specialist")
        options.push({ icon: "⚡", label: "Style", text: "They are a T20 specialist" });
    }
  }

  // Fallback: number of IPL teams
  if (player.iplTeams.length >= 3) {
    options.push({
      icon: "🔄",
      label: "Career",
      text: `They have played for ${player.iplTeams.length} different IPL teams`,
    });
  }

  if (options.length === 0) {
    return {
      icon: "🎯",
      label: "Career",
      text: `Their primary format is ${player.stats.testMatches > player.stats.t20iMatches ? "Tests" : "T20s"}`,
    };
  }

  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Filter players that have enough data for good clues.
 * At minimum: has a name, country, role, and some stats.
 */
export function getGuessablePlayers(allPlayers: CricketPlayer[]): CricketPlayer[] {
  return allPlayers.filter((p) => {
    const totalMatches =
      p.stats.testMatches + p.stats.odiMatches + p.stats.t20iMatches + p.stats.iplMatches;
    // Need some career presence + IPL connection for interesting clues
    return totalMatches >= 10 && p.iplTeams.length > 0 && p.name.length > 0;
  });
}

/**
 * Pick N unique random players from the pool.
 */
export function pickRandomPlayers(
  pool: CricketPlayer[],
  count: number
): CricketPlayer[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Score based on how many clues were revealed (1-indexed).
 *  3 clues (default) = 300, 4 clues = 200, 5 clues = 100 */
export function calculateGuessScore(cluesRevealed: number, streak: number): number {
  const baseScores: Record<number, number> = { 3: 300, 4: 200, 5: 100 };
  const base = baseScores[cluesRevealed] ?? 100;
  const multiplier = 1 + (streak - 1) * 0.5; // 1x, 1.5x, 2x, 2.5x ...
  return Math.round(base * Math.max(1, multiplier));
}
