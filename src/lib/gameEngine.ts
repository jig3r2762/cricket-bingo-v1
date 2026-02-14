import type { CricketPlayer, GridCategory } from "@/types/game";

// --- Validation ---

function validateSingle(player: CricketPlayer, key: string): boolean {
  const [type, ...rest] = key.split(":");
  const value = rest.join(":"); // rejoin in case value has colons

  switch (type) {
    case "team":
      return player.iplTeams.includes(value);

    case "country":
      return player.country === value;

    case "stat": {
      // format: "statField>=number"
      const match = value.match(/^(\w+)>=(\d+)$/);
      if (!match) return false;
      const field = match[1] as keyof typeof player.stats;
      const threshold = parseInt(match[2], 10);
      return (player.stats[field] ?? 0) >= threshold;
    }

    case "role":
      // "Batsman" matches both "Batsman" and "WK-Bat"
      if (value === "Batsman") {
        return player.primaryRole === "Batsman" || player.primaryRole === "WK-Bat";
      }
      return player.primaryRole === value;

    case "trophy":
      return player.trophies.includes(value);

    case "teammate":
      return player.id !== value && player.teammates.includes(value);

    case "category":
      // Check if player has this category tag
      return (player.categories ?? []).includes(value);

    default:
      return false;
  }
}

export function validate(player: CricketPlayer, category: GridCategory): boolean {
  const key = category.validatorKey;

  if (key.startsWith("combo:")) {
    const comboBody = key.slice("combo:".length);
    // Split on '+' but need to handle "stat:field>=N" which doesn't contain +
    // Format: "type:value+type:value"
    const parts = splitCombo(comboBody);
    return parts.every((part) => validateSingle(player, part));
  }

  return validateSingle(player, key);
}

// Split combo key like "team:MI+country:India" into ["team:MI", "country:India"]
// Handles stat keys like "stat:totalWickets>=300"
function splitCombo(combo: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";

  for (let i = 0; i < combo.length; i++) {
    const ch = combo[i];
    if (ch === "+" && depth === 0) {
      // Check if this + is a combo separator (preceded by a type:value pattern)
      // Simple heuristic: if current contains a ':', this is a separator
      if (current.includes(":")) {
        parts.push(current);
        current = "";
        continue;
      }
    }
    current += ch;
  }
  if (current) parts.push(current);
  return parts;
}

// --- Scoring ---

export function calculateScore(category: GridCategory, streak: number): number {
  let base = 100;

  if (category.type === "combo") base += 50;
  else if (category.type === "teammate") base += 30;
  else if (category.type === "trophy") base += 20;

  const multiplier = Math.min(1 + streak * 0.5, 3.0);
  return Math.round(base * multiplier);
}

// --- Bingo Detection ---

function getWinLines(gridSize: 3 | 4): number[][] {
  const lines: number[][] = [];
  const n = gridSize;

  // Rows
  for (let r = 0; r < n; r++) {
    const row: number[] = [];
    for (let c = 0; c < n; c++) row.push(r * n + c);
    lines.push(row);
  }

  // Columns
  for (let c = 0; c < n; c++) {
    const col: number[] = [];
    for (let r = 0; r < n; r++) col.push(r * n + c);
    lines.push(col);
  }

  // Diagonals
  const d1: number[] = [];
  const d2: number[] = [];
  for (let i = 0; i < n; i++) {
    d1.push(i * n + i);
    d2.push(i * n + (n - 1 - i));
  }
  lines.push(d1, d2);

  return lines;
}

export function checkBingo(
  placements: Record<string, CricketPlayer | null>,
  grid: GridCategory[],
  gridSize: 3 | 4
): number[] | null {
  const totalCells = gridSize * gridSize;

  // Win = every cell on the board is filled
  const allFilled = grid.every((cat) => placements[cat.id] != null);
  if (!allFilled) return null;

  // Return all cell indices as the "win line" for celebration highlight
  return Array.from({ length: totalCells }, (_, i) => i);
}

// --- Eligible Cells ---

export function getEligibleCells(
  player: CricketPlayer,
  grid: GridCategory[],
  placements: Record<string, CricketPlayer | null>
): string[] {
  return grid
    .filter((cat) => !placements[cat.id] && validate(player, cat))
    .map((cat) => cat.id);
}

// --- Find next playable deck index (skip players with no eligible cells) ---

export function findNextPlayableIndex(
  deck: CricketPlayer[],
  startIndex: number,
  grid: GridCategory[],
  placements: Record<string, CricketPlayer | null>
): number {
  for (let i = startIndex; i < deck.length; i++) {
    const eligible = getEligibleCells(deck[i], grid, placements);
    if (eligible.length > 0) return i;
  }
  return -1; // No playable player found
}

// --- Recommended Cell ---

const PRIORITY_ORDER: Record<string, number> = {
  combo: 1,
  teammate: 2,
  trophy: 3,
  stat: 4,
  role: 5,
  team: 6,
  country: 7,
};

export function getRecommendedCell(
  eligibleCellIds: string[],
  grid: GridCategory[]
): string | null {
  if (eligibleCellIds.length === 0) return null;

  const eligible = grid.filter((cat) => eligibleCellIds.includes(cat.id));
  eligible.sort(
    (a, b) => (PRIORITY_ORDER[a.type] ?? 99) - (PRIORITY_ORDER[b.type] ?? 99)
  );

  return eligible[0]?.id ?? null;
}
