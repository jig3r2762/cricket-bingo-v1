import { motion, AnimatePresence } from "framer-motion";
import { SkipForward, Sparkles, Info } from "lucide-react";
import type { CricketPlayer } from "@/types/game";
import { TEAM_COLORS } from "@/data/categories";
import { useState } from "react";

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
}

export function PlayerCard({
  player, remaining, total, onSkip, onWildcard, onInfo,
  wildcardsLeft, wildcardMode, onCancelWildcard,
}: PlayerCardProps) {
  const teamColor = TEAM_COLORS[player.iplTeams?.[0]] || "#6366f1";
  const [imageError, setImageError] = useState(false);

  // Get player initials for fallback
  const initials = player.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={player.id}
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="relative player-bar rounded-2xl overflow-hidden">
          {/* Team color accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
            style={{ background: `linear-gradient(90deg, ${teamColor}, ${teamColor}88)` }}
          />

          <div className="px-4 pt-4 pb-3">
            {/* Main row: avatar + name + skip */}
            <div className="flex items-center gap-3">
              {/* Player photo or initials badge */}
              <div className="relative w-12 h-12 shrink-0">
                {player.headshot_url && !imageError ? (
                  <img
                    src={player.headshot_url}
                    alt={player.name}
                    className="w-full h-full rounded-full object-cover border-2"
                    style={{borderColor: teamColor}}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center font-display text-sm font-bold border-2"
                    style={{
                      borderColor: teamColor,
                      background: `${teamColor}20`,
                      color: teamColor,
                    }}
                  >
                    {initials}
                  </div>
                )}
              </div>

              {/* Name block */}
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-xl font-extrabold text-foreground uppercase tracking-wider leading-tight truncate">
                  {player.name}
                </h2>
              </div>

              {/* Skip button */}
              <button
                onClick={onSkip}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground font-display text-sm uppercase tracking-wider transition-colors shrink-0"
              >
                SKIP <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Wildcard mode banner */}
            {wildcardMode && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 px-3 py-1.5 rounded-lg bg-yellow-400/15 border border-yellow-400/40 text-center"
              >
                <span className="font-display text-xs text-yellow-400 uppercase tracking-wider">
                  Wildcard Active — tap any empty cell
                </span>
                <button
                  onClick={onCancelWildcard}
                  className="ml-2 text-[10px] text-yellow-400/70 underline uppercase"
                >
                  Cancel
                </button>
              </motion.div>
            )}

            {/* Bottom row: wildcard + info + remaining */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={onWildcard}
                  disabled={wildcardsLeft <= 0 || wildcardMode}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-display text-xs uppercase tracking-wider transition-all active:scale-95
                    ${wildcardsLeft > 0 && !wildcardMode
                      ? "bg-primary/15 border border-primary/40 text-primary hover:bg-primary/25 hover:border-primary/60"
                      : "bg-muted/30 border border-muted/30 text-muted-foreground cursor-not-allowed"
                    }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Wild ({wildcardsLeft})
                </button>
                <button
                  onClick={onInfo}
                  className="w-7 h-7 rounded-full border border-glass-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="scoreboard-font text-xs text-muted-foreground uppercase">
                <span className="text-foreground font-bold">{remaining}</span> remaining
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
