import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    }

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-card/40 border border-border/30">
      <Clock className="w-4 h-4 text-primary" />
      <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
        Next puzzle in
      </span>
      <span className="font-mono text-sm text-primary font-bold tabular-nums">
        {timeLeft}
      </span>
    </div>
  );
}
