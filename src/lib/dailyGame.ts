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

  // If all attempts fail, relax: use the last grid anyway
  // (extremely unlikely with 3670 players and ~42 categories)

  // Build deck: players valid for at least one cell (relevant), padded with distractors
  const relevantSet = new Set<string>();
  for (const cat of grid) {
    for (const p of allPlayers) {
      if (validate(p, cat)) relevantSet.add(p.id);
    }
  }

  const relevant = allPlayers.filter((p) => relevantSet.has(p.id));
  const distractors = allPlayers.filter((p) => !relevantSet.has(p.id));

  let deckPool = [...relevant];
  if (deckPool.length < 40) {
    const shuffledDistractors = seededShuffle(distractors, rng);
    deckPool = [...deckPool, ...shuffledDistractors.slice(0, 40 - deckPool.length)];
  }

  const deck = seededShuffle(deckPool, rng).slice(0, 40);

  return { date, gridSize, grid, deck, seed };
}

// Build a deck for an arbitrary grid (used by admin-saved grids)
export function buildDeckForGrid(
  grid: GridCategory[],
  allPlayers: CricketPlayer[]
): CricketPlayer[] {
  const relevantSet = new Set<string>();
  for (const cat of grid) {
    for (const p of allPlayers) {
      if (validate(p, cat)) relevantSet.add(p.id);
    }
  }
  const relevant = allPlayers.filter((p) => relevantSet.has(p.id));
  const distractors = allPlayers.filter((p) => !relevantSet.has(p.id));

  let deckPool = [...relevant];
  if (deckPool.length < 40) {
    deckPool = [...deckPool, ...randomShuffle(distractors).slice(0, 40 - deckPool.length)];
  }
  return randomShuffle(deckPool).slice(0, 60);
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

  // Build deck: only players valid for at least one cell
  const relevantSet = new Set<string>();
  for (const cat of grid) {
    for (const p of allPlayers) {
      if (validate(p, cat)) relevantSet.add(p.id);
    }
  }

  const relevant = allPlayers.filter((p) => relevantSet.has(p.id));
  const deck = randomShuffle(relevant).slice(0, 60);

  return { date: gameId, gridSize, grid, deck, seed: Date.now() };
}
