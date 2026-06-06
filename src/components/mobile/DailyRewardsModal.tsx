import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Lock, Coins, Gift } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getTodayDateString } from "@/lib/dailyGame";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { triggerConfetti } from "@/lib/confetti";
import { playCorrect } from "@/lib/sounds";
import { toast } from "sonner";

const REWARDS = [50, 100, 150, 200, 300, 400, 750];

export function DailyRewardsModal() {
  const { user, userData, refreshUserData } = useAuth();
  const [open, setOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const todayStr = getTodayDateString();

  // Show modal if user is logged in, has a valid streak, and hasn't claimed today's reward yet
  useEffect(() => {
    if (!user || !userData) {
      setOpen(false);
      return;
    }

    const hasClaimedToday = userData.lastRewardClaimedDate === todayStr;
    if (!hasClaimedToday) {
      setOpen(true);
    }
  }, [user, userData, todayStr]);

  if (!userData) return null;

  const currentStreak = userData.loginStreak ?? 1;
  const hasClaimedToday = userData.lastRewardClaimedDate === todayStr;

  const handleClaim = async () => {
    if (!user || claiming || hasClaimedToday) return;
    setClaiming(true);

    try {
      const rewardAmount = REWARDS[(currentStreak - 1) % 7];
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        coinBalance: increment(rewardAmount),
        lastRewardClaimedDate: todayStr,
      });

      triggerConfetti();
      playCorrect();
      toast.success(`Claimed Day ${currentStreak} Reward: ${rewardAmount} 🪙!`);
      
      await refreshUserData();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to claim reward");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-card border border-border/40 text-secondary max-w-md w-full p-6">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50 text-primary animate-bounce-in">
            <Gift className="w-6 h-6" />
          </div>
          <DialogTitle className="font-display text-2xl font-black uppercase tracking-wider text-center gold-text">
            Daily Login Rewards
          </DialogTitle>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Log in daily to claim free coins and build your streak!
          </p>
        </DialogHeader>

        {/* 7-Day Grid */}
        <div className="grid grid-cols-4 gap-2.5 my-4">
          {REWARDS.map((coins, index) => {
            const dayNum = index + 1;
            const isCompleted = dayNum < currentStreak || (dayNum === currentStreak && hasClaimedToday);
            const isActive = dayNum === currentStreak && !hasClaimedToday;
            const isLocked = dayNum > currentStreak;

            return (
              <div
                key={dayNum}
                className={`relative flex flex-col items-center justify-between p-2.5 rounded-xl border transition-all text-center select-none aspect-[4/5]
                  ${isActive
                    ? "border-primary bg-primary/10 ring-2 ring-primary/40 animate-pulse-glow"
                    : isCompleted
                      ? "border-emerald-500/30 bg-emerald-500/5 opacity-80"
                      : "border-border/30 bg-muted/20 opacity-55"
                  }
                  ${dayNum === 7 ? "col-span-2 aspect-auto flex-row px-4 justify-between" : ""}
                `}
              >
                {/* Visual indicator (check, coin, lock) */}
                <div className="flex items-center gap-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <Coins className="w-4 h-4 text-amber-400 shrink-0 animate-float" />
                  )}
                  {dayNum === 7 && (
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-amber-400">
                      WEEKLY BONUS!
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center">
                  <span className="font-display text-[15px] font-black leading-none text-secondary">
                    +{coins}
                  </span>
                  <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">
                    Day {dayNum}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          onClick={handleClaim}
          disabled={claiming || hasClaimedToday}
          className={`cta-chunky color-green w-full ${claiming || hasClaimedToday ? "is-disabled" : ""}`}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {hasClaimedToday ? "CLAIMED TODAY" : `CLAIM DAY ${currentStreak} REWARD`}
          </span>
        </button>
      </DialogContent>
    </Dialog>
  );
}
