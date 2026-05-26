import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { getTodayDateString } from "./dailyGame";

export interface QuestDef {
  id: string;
  title: string;
  description: string;
  reward: number;
  target: number;
}

export const QUEST_POOL: QuestDef[] = [
  { id: "daily_bingo_play", title: "Daily Challenger", description: "Complete today's daily grid match", reward: 50, target: 1 },
  { id: "daily_bingo_win", title: "Bingo Champion", description: "Achieve a Bingo line in today's grid", reward: 100, target: 1 },
  { id: "score_milestone", title: "Cricket Expert", description: "Score 1,000+ points on today's grid", reward: 100, target: 1 },
  { id: "guess_streak", title: "Streak Master", description: "Get a correct guess streak of 3 in Guess Mode", reward: 100, target: 3 },
  { id: "win_bot_battle", title: "Bot Crusher", description: "Win a free Battle Mode match against the Bot", reward: 100, target: 1 },
  { id: "clue_master", title: "Super Mind", description: "Correctly guess a player using 3 or fewer clues", reward: 50, target: 1 },
  { id: "play_paid_battle", title: "High Roller", description: "Play a Paid Battle match", reward: 150, target: 1 },
];

export interface QuestProgress {
  current: number;
  completed: boolean;
  claimed: boolean;
}

export interface DailyQuestsState {
  date: string;
  progress: Record<string, QuestProgress>;
}

// Seeded random number generator
function getSeededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function getDailyQuestsForDate(dateStr: string): QuestDef[] {
  const rand = getSeededRandom(dateStr);
  const pool = [...QUEST_POOL];
  const selected: QuestDef[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(rand() * pool.length);
    selected.push(pool.splice(idx, 1)[0]);
  }
  return selected;
}

// Initialize empty progress for today
export function createInitialQuestState(dateStr: string): DailyQuestsState {
  const quests = getDailyQuestsForDate(dateStr);
  const progress: Record<string, QuestProgress> = {};
  quests.forEach((q) => {
    progress[q.id] = { current: 0, completed: false, claimed: false };
  });
  return { date: dateStr, progress };
}

// Global update function that pages/hooks can import and trigger
export async function trackQuestProgress(questId: string, amount: number, userId: string | null) {
  const today = getTodayDateString();
  const quests = getDailyQuestsForDate(today);
  const targetQuest = quests.find(q => q.id === questId);
  if (!targetQuest) return; // Not active today

  // 1. Update LocalStorage
  let localState: DailyQuestsState;
  try {
    const raw = localStorage.getItem("cricket-bingo-quests");
    if (raw) {
      localState = JSON.parse(raw);
      if (localState.date !== today) {
        localState = createInitialQuestState(today);
      }
    } else {
      localState = createInitialQuestState(today);
    }
  } catch {
    localState = createInitialQuestState(today);
  }

  const p = localState.progress[questId] || { current: 0, completed: false, claimed: false };
  if (p.claimed) return; // Already claimed

  // Add the progress
  p.current = Math.min(targetQuest.target, p.current + amount);
  if (p.current >= targetQuest.target) {
    p.completed = true;
  }
  localState.progress[questId] = p;
  localStorage.setItem("cricket-bingo-quests", JSON.stringify(localState));

  // Dispatch custom event to notify React UI listeners immediately
  window.dispatchEvent(new CustomEvent("cricket-bingo-quests-updated", { detail: localState }));

  // 2. Update Firestore if logged in
  if (userId) {
    try {
      const ref = doc(db, "users", userId);
      // We can update the dailyQuests map in the user document
      await setDoc(ref, {
        dailyQuests: localState
      }, { merge: true });
    } catch (err) {
      console.error("Failed to save quest progress to Firestore:", err);
    }
  }
}
