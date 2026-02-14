import { motion } from "framer-motion";

interface BingoMeterProps {
  filled: number;
  total: number;
  gridSize: 3 | 4;
}

export function BingoMeter({ filled, total, gridSize }: BingoMeterProps) {
  const pct = Math.min((filled / gridSize) * 100, 100);
  const lines = gridSize === 3 ? 8 : 10; // possible bingo lines

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">
          Bingo Meter
        </span>
        <span className="scoreboard-font text-xs text-accent">
          {filled}/{total} placed
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, hsl(var(--electric-cyan)), hsl(var(--neon-green)))`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${(filled / total) * 100}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />
      </div>
    </div>
  );
}
