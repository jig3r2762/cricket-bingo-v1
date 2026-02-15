import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface TurnTimerProps {
  duration: number; // seconds per turn
  onTimeUp: () => void;
  turnKey: number; // changes each turn to reset timer
  paused?: boolean;
}

export function TurnTimer({ duration, onTimeUp, turnKey, paused }: TurnTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    setRemaining(duration);
  }, [turnKey, duration]);

  useEffect(() => {
    if (paused) return;
    if (remaining <= 0) {
      onTimeUpRef.current();
      return;
    }
    const id = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 0.1));
    }, 100);
    return () => clearInterval(id);
  }, [remaining <= 0, paused, remaining]);

  const pct = (remaining / duration) * 100;
  const isLow = remaining <= 3;

  return (
    <div className="w-full flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors ${
            isLow ? "bg-red-500" : remaining <= 5 ? "bg-orange-400" : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
          animate={isLow ? { opacity: [1, 0.5, 1] } : {}}
          transition={isLow ? { duration: 0.5, repeat: Infinity } : {}}
        />
      </div>
      <span className={`font-mono text-xs w-8 text-right tabular-nums ${
        isLow ? "text-red-400 font-bold" : "text-muted-foreground"
      }`}>
        {Math.ceil(remaining)}s
      </span>
    </div>
  );
}
