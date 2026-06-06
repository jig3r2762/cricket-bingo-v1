import { motion } from "framer-motion";

interface BingoMeterProps {
  filled: number;
  total: number;
  gridSize: 3 | 4 | 5;
}

export function BingoMeter({ filled, total, gridSize }: BingoMeterProps) {
  const pct = (filled / total) * 100;

  return (
    <div className="candy-card w-full max-w-md mx-auto px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-extrabold uppercase tracking-wide">Grid control</span>
        <span className="font-bold text-xs text-primary uppercase tracking-wider">
          {filled}/{total} placed
        </span>
      </div>

      <div className="relative w-full progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />

        {[25, 50, 75].map((milestone) => (
          <div
            key={milestone}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${milestone}%` }}
          >
            <div
              className="w-3 h-3 rounded-full border-2 transition-all"
              style={{
                background: pct >= milestone ? "hsl(var(--neon-gold))" : "hsl(var(--card))",
                borderColor: pct >= milestone ? "hsl(var(--shadow-yellow))" : "hsl(var(--border))",
                boxShadow: pct >= milestone ? "0 0 8px hsl(var(--neon-gold) / 0.6)" : "none",
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
        <span>{gridSize}×{gridSize}</span>
        <span>{Math.round(pct)}% complete</span>
      </div>
    </div>
  );
}
