import { motion } from "framer-motion";
import { useMemo } from "react";

interface BingoMeterProps {
  filled: number;
  total: number;
  gridSize: 3 | 4;
}

export function BingoMeter({ filled, total, gridSize }: BingoMeterProps) {
  const pct = (filled / total) * 100;

  const milestones = useMemo(() => {
    const at25 = filled >= total * 0.25 && (filled - 1) < total * 0.25;
    const at50 = filled >= total * 0.5 && (filled - 1) < total * 0.5;
    const at75 = filled >= total * 0.75 && (filled - 1) < total * 0.75;
    return { at25, at50, at75, passed25: filled >= total * 0.25, passed50: filled >= total * 0.5, passed75: filled >= total * 0.75 };
  }, [filled, total]);

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-display text-sm text-foreground">
          Bingo Meter
        </span>
        <span className="font-body font-bold text-xs text-candy-green">
          {filled}/{total} placed
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative w-full progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />

        {/* Milestone markers */}
        {[25, 50, 75].map((milestone) => (
          <div
            key={milestone}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${milestone}%` }}
          >
            <div
              className="w-3.5 h-3.5 rounded-full border-2 transition-all"
              style={{
                background: pct >= milestone ? "white" : "hsl(134 40% 78%)",
                borderColor: pct >= milestone ? "hsl(134 55% 30%)" : "hsl(134 35% 68%)",
                boxShadow: pct >= milestone ? "0 0 6px hsl(134 61% 41% / 0.5)" : "none",
              }}
            />
          </div>
        ))}
      </div>

      {/* Milestone celebration message */}
      {(milestones.at25 || milestones.at50 || milestones.at75) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="text-center"
        >
          {milestones.at25 && (
            <span className="text-xs font-body font-bold text-candy-blue animate-pulse-big">
              ✨ 25% Complete — Keep Going!
            </span>
          )}
          {milestones.at50 && (
            <span className="text-xs font-body font-bold text-candy-orange animate-pulse-big">
              🔥 Halfway There! 50%
            </span>
          )}
          {milestones.at75 && (
            <span className="text-xs font-body font-bold text-candy-green animate-pulse-big">
              🚀 Almost Done! 75%
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}
