import { motion } from "framer-motion";
import { useMemo } from "react";

interface BingoMeterProps {
  filled: number;
  total: number;
  gridSize: 3 | 4;
}

export function BingoMeter({ filled, total, gridSize }: BingoMeterProps) {
  const pct = (filled / total) * 100;

  // Detect milestone thresholds (25%, 50%, 75%)
  const milestones = useMemo(() => {
    const at25 = filled >= total * 0.25 && (filled - 1) < total * 0.25;
    const at50 = filled >= total * 0.5 && (filled - 1) < total * 0.5;
    const at75 = filled >= total * 0.75 && (filled - 1) < total * 0.75;
    return { at25, at50, at75, passed25: filled >= total * 0.25, passed50: filled >= total * 0.5, passed75: filled >= total * 0.75 };
  }, [filled, total]);

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">
          Bingo Meter
        </span>
        <span className="scoreboard-font text-xs text-accent">
          {filled}/{total} placed
        </span>
      </div>

      {/* Progress bar with milestones */}
      <div className="relative w-full">
        <div className="w-full h-2.5 rounded-full bg-muted/60 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, hsl(var(--electric-cyan)), hsl(var(--neon-green)))`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
        </div>

        {/* Milestone markers */}
        {[25, 50, 75].map((milestone) => (
          <div
            key={milestone}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${milestone}%` }}
          >
            {pct >= milestone && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2.5 h-2.5 rounded-full bg-neon-green border border-green-300"
                style={{ boxShadow: "0 0 8px hsl(var(--neon-green) / 0.6)" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Milestone celebration message */}
      {(milestones.at25 || milestones.at50 || milestones.at75) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-center"
        >
          {milestones.at25 && (
            <span className="text-[11px] font-display text-accent uppercase tracking-wider animate-pulse">
              ✨ 25% Complete — Keep Going!
            </span>
          )}
          {milestones.at50 && (
            <span className="text-[11px] font-display text-secondary uppercase tracking-wider animate-pulse">
              🔥 Halfway There! 50%
            </span>
          )}
          {milestones.at75 && (
            <span className="text-[11px] font-display text-neon-green uppercase tracking-wider animate-pulse">
              🚀 Almost Done! 75%
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}
