import type { CricketPlayer, GridCategory, DailyGame } from "@/types/game";
import { validate } from "./gameEngine";

// --- Seeded RNG (mulberry32) ---

function createRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate a 32-bit seed from a date string
function dateSeed(dateStr: string): number {
  let hash = 0;
  const key = "cricket-bingo-" + dateStr;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return hash;
}

// Seeded shuffle (Fisher-Yates)
function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- Solvability Check ---

function isSolvable(
  grid: GridCategory[],
  players: CricketPlayer[]
): boolean {
  // Build per-cell candidate lists
  const candidates: string[][] = grid.map((cat) =>
    players.filter((p) => validate(p, cat)).map((p) => p.id)
  );

  // Quick fail: any cell with zero candidates
  if (candidates.some((c) => c.length === 0)) return false;

  // Backtracking with most-constrained-first ordering
  const order = grid
    .map((_, i) => i)
    .sort((a, b) => candidates[a].length - candidates[b].length);

  const used = new Set<string>();

  function backtrack(step: number): boolean {
    if (step === order.length) return true;
    const cellIdx = order[step];
    for (const pid of candidates[cellIdx]) {
      if (used.has(pid)) continue;
      used.add(pid);
      if (backtrack(step + 1)) return true;
      used.delete(pid);
    }
    return false;
  }

  return backtrack(0);
}

// --- Coverage-guaranteed deck builder ---
// Ensures every cell has at least `minPerCell` players in the deck,
// so you never get stuck with unfillable cells mid-game.

function buildCoverDeck(
  grid: GridCategory[],
  allPlayers: CricketPlayer[],
  deckSize: number,
  shuffleFn: <T>(arr: T[]) => T[],
  minPerCell = 4
): CricketPlayer[] {
  const playerMap = new Map(allPlayers.map((p) => [p.id, p]));

  // Per-cell candidate lists (shuffled so picks are varied)
  const perCell: string[][] = grid.map((cat) =>
    shuffleFn(
      allPlayers.filter((p) => validate(p, cat)).map((p) => p.id)
    )
  );

  // 1. Guarantee minimum coverage per cell
  const picked = new Set<string>();
  for (const candidates of perCell) {
    let count = 0;
    for (const pid of candidates) {
      if (count >= minPerCell) break;
      if (!picked.has(pid)) {
        picked.add(pid);
        count++;
      }
    }
  }

  // 2. Fill remaining slots with other relevant players
  const relevantSet = new Set<string>();
  for (const cat of grid) {
    for (const p of allPlayers) {
      if (validate(p, cat)) relevantSet.add(p.id);
    }
  }
  const remaining = shuffleFn(
    allPlayers.filter((p) => relevantSet.has(p.id) && !picked.has(p.id))
  );
  for (const p of remaining) {
    if (picked.size >= deckSize) break;
    picked.add(p.id);
  }

  // 3. If still under deckSize, pad with distractors
  if (picked.size < deckSize) {
    const distractors = shuffleFn(
      allPlayers.filter((p) => !relevantSet.has(p.id))
    );
    for (const p of distractors) {
      if (picked.size >= deckSize) break;
      picked.add(p.id);
    }
  }

  // Resolve IDs back to player objects and shuffle
  const deck = [...picked]
    .map((id) => playerMap.get(id))
    .filter((p): p is CricketPlayer => !!p);
  return shuffleFn(deck);
}

// --- Daily Game Generator ---

export function generateDailyGame(
  date: string,
  gridSize: 3 | 4,
  allPlayers: CricketPlayer[],
  categoryPool: GridCategory[]
): DailyGame {
  const seed = dateSeed(date + "-" + gridSize);
  const rng = createRng(seed);
  const cellCount = gridSize * gridSize;

  // Try to pick a solvable grid
  let grid: GridCategory[] = [];
  let attempts = 0;
  const maxAttempts = 50;

  while (attempts < maxAttempts) {
    const shuffled = seededShuffle(categoryPool, rng);
    grid = shuffled.slice(0, cellCount);

    if (isSolvable(grid, allPlayers)) break;
    attempts++;
  }

  const shuffle = <T>(arr: T[]) => seededShuffle(arr, rng);
  const deck = buildCoverDeck(grid, allPlayers, 40, shuffle);

  return { date, gridSize, grid, deck, seed };
}

// Build a deck for an arbitrary grid (used by admin-saved grids)
export function buildDeckForGrid(
  grid: GridCategory[],
  allPlayers: CricketPlayer[]
): CricketPlayer[] {
  return buildCoverDeck(grid, allPlayers, 60, randomShuffle);
}

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// --- Random Game Generator (new shuffle every time) ---

function randomShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateRandomGame(
  gridSize: 3 | 4,
  allPlayers: CricketPlayer[],
  categoryPool: GridCategory[]
): DailyGame {
  const cellCount = gridSize * gridSize;
  const gameId = `game-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Try to pick a solvable grid
  let grid: GridCategory[] = [];
  let attempts = 0;
  const maxAttempts = 50;

  while (attempts < maxAttempts) {
    const shuffled = randomShuffle(categoryPool);
    grid = shuffled.slice(0, cellCount);
    if (isSolvable(grid, allPlayers)) break;
    attempts++;
  }

  const deck = buildCoverDeck(grid, allPlayers, 60, randomShuffle);

  return { date: gameId, gridSize, grid, deck, seed: Date.now() };
}
