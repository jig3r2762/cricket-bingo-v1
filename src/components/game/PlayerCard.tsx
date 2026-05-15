import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info, SkipForward, Sparkles } from "lucide-react";
import { TEAM_COLORS } from "@/data/categories";
import { shouldUseHashRouter } from "@/lib/iframeUtils";
import type { CricketPlayer } from "@/types/game";

const IN_IFRAME = shouldUseHashRouter();

const ROLE_COLORS: Record<string, string> = {
  Batsman: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  "WK-Bat": "bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30",
  "Fast Bowler": "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  "Spin Bowler": "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30",
  "All-Rounder": "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
};

interface PlayerCardProps {
  player: CricketPlayer;
  remaining: number;
  total: number;
  onSkip: () => void;
  onWildcard: () => void;
  onInfo: () => void;
  wildcardsLeft: number;
  wildcardMode: boolean;
  onCancelWildcard: () => void;
  onWatchAdForWildcard?: () => void;
}

export function PlayerCard({
  player,
  remaining,
  total,
  onSkip,
  onWildcard,
  onInfo,
  wildcardsLeft,
  wildcardMode,
  onCancelWildcard,
  onWatchAdForWildcard,
}: PlayerCardProps) {
  const teamColor = TEAM_COLORS[player.iplTeams?.[0]] || "#1a6b3c";
  const [imageError, setImageError] = useState(false);
  const initials = player.name
    .split(" ")
    .map((namePart) => namePart[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const roleClass = ROLE_COLORS[player.primaryRole] ?? "bg-muted text-muted-foreground border-border";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={player.id}
        initial={{ x: 42, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -42, opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 34 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="relative bg-card rounded-lg overflow-hidden border border-border shadow-sm">
          <div className="absolute top-0 left-0 bottom-0 w-1" style={{ background: teamColor }} />

          <div className="pl-4 pr-4 pt-3.5 pb-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-body font-semibold uppercase tracking-widest text-muted-foreground">
                Current card
              </span>
              <div className="font-body text-xs text-muted-foreground font-medium">
                <span className="text-secondary font-semibold">{remaining}</span>
                <span className="text-muted-foreground/60"> / {total} left</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 shrink-0">
                {player.headshot_url && !imageError ? (
                  <img
                    src={player.headshot_url}
                    alt={player.name}
                    className="w-full h-full rounded-md object-cover ring-1 ring-border"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-md flex items-center justify-center font-display text-sm font-bold ring-1 ring-border"
                    style={{ background: `${teamColor}1a`, color: teamColor }}
                  >
                    {initials}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className={`font-display text-foreground leading-tight ${
                  player.name.length > 20 ? "text-base" : player.name.length > 15 ? "text-lg" : "text-2xl"
                }`}>
                  {player.name}
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] text-muted-foreground font-body">{player.countryCode}</span>
                  {player.primaryRole && (
                    <span className={`px-1.5 py-px rounded text-[9px] font-body font-semibold border ${roleClass}`}>
                      {player.primaryRole}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={onSkip}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground font-body font-semibold text-xs transition-colors shrink-0 px-2 py-1 rounded-md hover:bg-muted/60"
              >
                Skip <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {wildcardMode && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2.5 px-3 py-2 rounded-md bg-secondary/10 border border-secondary/40 text-center"
              >
                <span className="font-body font-semibold text-xs text-secondary uppercase tracking-wider">
                  Wildcard active: tap any empty cell
                </span>
                <button
                  onClick={onCancelWildcard}
                  className="ml-2 text-[10px] text-secondary/70 underline uppercase font-semibold"
                >
                  Cancel
                </button>
              </motion.div>
            )}

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={onWildcard}
                  disabled={wildcardsLeft <= 0 || wildcardMode}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-body font-semibold text-xs transition-all active:scale-95 ${
                    wildcardsLeft > 0 && !wildcardMode
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Wild ({wildcardsLeft})
                </button>
                {IN_IFRAME && wildcardsLeft === 0 && !wildcardMode && onWatchAdForWildcard && (
                  <button
                    onClick={onWatchAdForWildcard}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md font-display text-xs uppercase tracking-wider border border-secondary/40 text-secondary hover:bg-secondary/10 transition-all active:scale-95"
                  >
                    +1 Wild
                  </button>
                )}
                <button
                  onClick={onInfo}
                  className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Place or skip</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
