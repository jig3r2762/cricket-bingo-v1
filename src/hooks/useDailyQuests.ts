import { useState, useEffect, useCallback } from "react";
import { useOptionalAuth } from "@/contexts/AuthContext";
import { getTodayDateString } from "@/lib/dailyGame";
import {
  getDailyQuestsForDate,
  createInitialQuestState,
  type DailyQuestsState,
  type QuestDef,
  type QuestProgress
} from "@/lib/quests";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { triggerConfetti } from "@/lib/confetti";
import { playCorrect } from "@/lib/sounds";
import { toast } from "sonner";

export interface QuestWithProgress extends QuestDef, QuestProgress {}

export function useDailyQuests() {
  const auth = useOptionalAuth();
  const user = auth?.user ?? null;
  const userData = auth?.userData ?? null;
  const isGuest = auth?.isGuest ?? false;
  const today = getTodayDateString();

  const [questsState, setQuestsState] = useState<DailyQuestsState>(() => {
    // Try to load from localStorage first
    try {
      const raw = localStorage.getItem("cricket-bingo-quests");
      if (raw) {
        const parsed = JSON.parse(raw) as DailyQuestsState;
        if (parsed.date === today) return parsed;
      }
    } catch {
      // Ignore storage errors on initialization
    }
    return createInitialQuestState(today);
  });

  // Sync with Firestore userData when it updates
  useEffect(() => {
    if (user && !isGuest && userData?.dailyQuests) {
      const dbQuests = userData.dailyQuests as DailyQuestsState;
      if (dbQuests.date === today) {
        setQuestsState(dbQuests);
        // Save to local storage as well for fast load next time
        try {
          localStorage.setItem("cricket-bingo-quests", JSON.stringify(dbQuests));
        } catch {
          // Ignore storage write errors
        }
      }
    }
  }, [user, isGuest, userData, today]);

  // Listen for local events dispatched by trackQuestProgress
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as DailyQuestsState;
      if (detail && detail.date === today) {
        setQuestsState(detail);
      }
    };
    window.addEventListener("cricket-bingo-quests-updated", handleUpdate);
    return () => window.removeEventListener("cricket-bingo-quests-updated", handleUpdate);
  }, [today]);

  // Combine definitions with progress
  const quests: QuestWithProgress[] = getDailyQuestsForDate(today).map((def) => {
    const prog = questsState.progress[def.id] || { current: 0, completed: false, claimed: false };
    return {
      ...def,
      ...prog,
    };
  });

  const claimQuestReward = useCallback(async (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return;

    // Build next state (avoiding direct nested mutation)
    const nextState = {
      ...questsState,
      progress: {
        ...questsState.progress,
        [questId]: {
          ...questsState.progress[questId],
          claimed: true,
        }
      }
    };

    try {
      if (user && !isGuest) {
        // Authenticated user: Sync to Firestore
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          coinBalance: increment(quest.reward),
          dailyQuests: nextState,
        });
        if (auth?.refreshUserData) {
          await auth.refreshUserData();
        }
      } else {
        // Guest user: Sync to local storage
        try {
          const currentCoins = Number(localStorage.getItem("cricket-bingo-coins") ?? "0");
          localStorage.setItem("cricket-bingo-coins", String(currentCoins + quest.reward));
          localStorage.setItem("cricket-bingo-quests", JSON.stringify(nextState));
          // Dispatch storage event manually for guest coin balance updates
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("cricket-bingo-coins-updated"));
        } catch {
          // Ignore local storage errors for guests
        }
      }

      window.dispatchEvent(new Event("cricket-bingo-coins-updated"));
      setQuestsState(nextState);
      triggerConfetti();
      playCorrect();
      toast.success(`Claimed Quest Reward: +${quest.reward} 🪙!`);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message ?? "Failed to claim reward");
    }
  }, [quests, questsState, user, isGuest, auth]);

  return {
    quests,
    claimQuestReward,
    hasUnclaimed: quests.some((q) => q.completed && !q.claimed),
  };
}
