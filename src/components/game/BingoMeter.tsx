import { motion } from "framer-motion";

interface BingoMeterProps {
  filled: number;
  total: number;
  gridSize: 3 | 4;
}

export function BingoMeter({ filled, total, gridSize }: BingoMeterProps) {
  const pct = (filled / total) * 100;

  return (
    <div className="w-full max-w-md mx-auto rounded-lg border border-border bg-card px-3 py-3 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm text-foreground">Grid control</span>
        <span className="font-body font-semibold text-xs text-primary">
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
              className="w-2.5 h-2.5 rounded-full border transition-all"
              style={{
                background: pct >= milestone ? "hsl(var(--secondary))" : "hsl(var(--card))",
                borderColor: pct >= milestone ? "hsl(var(--secondary))" : "hsl(var(--border))",
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>{gridSize}x{gridSize}</span>
        <span>{Math.round(pct)}% complete</span>
      </div>
    </div>
  );
}
