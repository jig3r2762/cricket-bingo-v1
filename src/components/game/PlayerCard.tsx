import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info, SkipForward, Sparkles } from "lucide-react";
import { TEAM_COLORS } from "@/data/categories";
import { shouldUseHashRouter } from "@/lib/iframeUtils";
import type { CricketPlayer } from "@/types/game";

const IN_IFRAME = shouldUseHashRouter();

const ROLE_COLORS: Record<string, string> = {
  Batsman: "color-green",
  "WK-Bat": "color-cyan",
  "Fast Bowler": "color-blue",
  "Spin Bowler": "color-purple",
  "All-Rounder": "color-gold",
} as const;

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
  const rolePillClass = ROLE_COLORS[player.primaryRole] ?? "";

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
        <div className="candy-card relative overflow-hidden p-4">
          {/* Team-color glow stripe */}
          <div
            aria-hidden
            className="absolute top-0 left-0 bottom-0 w-1.5"
            style={{
              background: teamColor,
              boxShadow: `0 0 20px ${teamColor}80`,
            }}
          />

          {/* "CURRENT CARD" label + deck progress */}
          <div className="mb-2.5 flex items-center justify-between pl-2">
            <span className="text-[10px] font-display font-extrabold uppercase tracking-[0.18em] text-primary/70">
              Current card
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider">
              <span className="text-secondary">{remaining}</span>
              <span className="text-muted-foreground/60"> / {total}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 pl-2">
            <div className="relative w-16 h-16 shrink-0">
              {player.headshot_url && !imageError ? (
                <img
                  src={player.headshot_url}
                  alt={player.name}
                  className="w-full h-full rounded-xl object-cover border-2"
                  style={{ borderColor: teamColor, boxShadow: `0 4px 0 0 ${teamColor}` }}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div
                  className="w-full h-full rounded-xl flex items-center justify-center font-display text-base font-black border-2"
                  style={{
                    background: `${teamColor}20`,
                    color: teamColor,
                    borderColor: teamColor,
                    boxShadow: `0 4px 0 0 ${teamColor}`,
                  }}
                >
                  {initials}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className={`font-display font-black text-foreground leading-tight uppercase ${
                player.name.length > 20 ? "text-base" : player.name.length > 15 ? "text-lg" : "text-xl"
              }`}>
                {player.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {player.primaryRole && (
                  <span className={`hud-pill ${rolePillClass} !text-[9px] !px-2 !py-0.5`}>
                    {player.primaryRole}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onSkip}
              className="cta-chunky size-sm color-yellow shrink-0"
              aria-label="Skip"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                SKIP <SkipForward className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>

          {wildcardMode && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 mx-2 px-3 py-2 rounded-xl bg-secondary/15 border-2 border-secondary/50 text-center"
              style={{ boxShadow: "0 3px 0 0 hsl(var(--shadow-yellow))" }}
            >
              <span className="font-display font-extrabold text-xs text-secondary uppercase tracking-wider">
                Wildcard active — tap any empty cell
              </span>
              <button
                onClick={onCancelWildcard}
                className="ml-2 text-[10px] text-secondary/80 underline uppercase font-extrabold"
              >
                Cancel
              </button>
            </motion.div>
          )}

          <div className="flex items-center justify-between mt-3 pl-2">
            <div className="flex items-center gap-2">
              <button
                onClick={onWildcard}
                disabled={wildcardsLeft <= 0 || wildcardMode}
                className={`cta-chunky size-sm ${
                  wildcardsLeft > 0 && !wildcardMode ? "color-green" : "is-disabled"
                }`}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  WILD · {wildcardsLeft}
                </span>
              </button>
              {IN_IFRAME && wildcardsLeft === 0 && !wildcardMode && onWatchAdForWildcard && (
                <button
                  onClick={onWatchAdForWildcard}
                  className="cta-chunky size-sm color-orange"
                >
                  <span className="relative z-10">+1 WILD</span>
                </button>
              )}
              <button
                onClick={onInfo}
                className="hud-pill !px-2.5 !py-2"
                aria-label="How to play"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Place or skip
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
