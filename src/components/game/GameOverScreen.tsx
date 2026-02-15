import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, XCircle, Share2, RotateCcw, Download, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { GameState } from "@/types/game";
import { useAuth } from "@/contexts/AuthContext";

// Confetti animation
function triggerConfetti() {
  if (typeof window === "undefined") return;

  // Create multiple confetti pieces
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.className = "fixed pointer-events-none";
    confetti.innerHTML = "🎉";
    confetti.style.left = Math.random() * window.innerWidth + "px";
    confetti.style.top = "-20px";
    confetti.style.fontSize = (Math.random() * 20 + 10) + "px";
    confetti.style.opacity = "1";
    confetti.style.zIndex = "9999";
    document.body.appendChild(confetti);

    const duration = Math.random() * 3 + 2;
    const xOffset = (Math.random() - 0.5) * 400;

    confetti.animate(
      [
        { transform: "translateY(0) translateX(0) rotate(0deg)", opacity: 1 },
        { transform: `translateY(${window.innerHeight + 50}px) translateX(${xOffset}px) rotate(360deg)`, opacity: 0 }
      ],
      {
        duration: duration * 1000,
        easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      }
    );

    setTimeout(() => confetti.remove(), duration * 1000);
  }
}

interface GameOverScreenProps {
  gameState: GameState;
  onReset: () => void;
}

function buildEmojiGrid(state: GameState): string {
  const { grid, gridSize, placements } = state;
  const n = gridSize;
  let rows = "";
  for (let r = 0; r < n; r++) {
    let row = "";
    for (let c = 0; c < n; c++) {
      const cat = grid[r * n + c];
      const filled = placements[cat.id] != null;
      const isWin = state.winLine?.includes(r * n + c);
      if (isWin) row += "\u{1F7E9}";
      else if (filled) row += "\u{1F7E6}";
      else row += "\u{2B1B}";
    }
    rows += row + "\n";
  }
  return rows;
}

function buildShareText(state: GameState, streak: number): string {
  const { gridSize, placements, status, score } = state;
  const n = gridSize;
  const filledCount = Object.values(placements).filter(Boolean).length;
  const total = n * n;

  let text = `\u{1F3CF} Cricket Bingo \u{2014} ${state.dailyGameId}\n`;
  text += `${status === "won" ? "\u{1F3C6} BINGO!" : "\u{274C} Game Over"} | Score: ${score} | ${n}x${n}\n`;
  if (state.maxStreak > 0) text += `\u{1F525} Best Streak: ${state.maxStreak} | Cells: ${filledCount}/${total}\n`;
  if (streak >= 2) text += `\u{1F4C5} Day Streak: ${streak}\n`;
  text += "\n";
  text += buildEmojiGrid(state);

  return text;
}

export function GameOverScreen({ gameState, onReset }: GameOverScreenProps) {
  const isWin = gameState.status === "won";
  const navigate = useNavigate();
  const { userData } = useAuth();
  const currentStreak = userData?.currentStreak ?? 0;
  const filledCount = Object.values(gameState.placements).filter(Boolean).length;
  const total = gameState.gridSize * gameState.gridSize;

  // Trigger confetti on win
  useEffect(() => {
    if (isWin) {
      // Delay slightly for visual effect
      const timer = setTimeout(() => {
        triggerConfetti();
        // Play win sound if possible
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==');
          audio.play().catch(() => {});
        } catch (e) {
          // Silent fail for audio
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isWin]);

  const handleShare = useCallback(() => {
    const text = buildShareText(gameState, currentStreak);
    navigator.clipboard.writeText(text).catch(() => {});
  }, [gameState, currentStreak]);

  const handleDownloadCard = useCallback(() => {
    const canvas = document.createElement("canvas");
    // Draw at desired size
    canvas.width = 480;
    canvas.height = 520;
    const ctx = canvas.getContext("2d")!;

    // Background
    ctx.fillStyle = "#0a0e27";
    ctx.fillRect(0, 0, 480, 520);

    // Border glow
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 478, 518);

    const w = 480;

    // Title
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Cricket Bingo", w / 2, 40);

    // Date
    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText(gameState.dailyGameId, w / 2, 62);

    // Result
    ctx.fillStyle = isWin ? "#facc15" : "#ef4444";
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.fillText(isWin ? "BINGO!" : "Game Over", w / 2, 105);

    // Score
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.fillText(`Score: ${gameState.score}`, w / 2, 135);

    // Stats row
    const n = gameState.gridSize;
    let statsText = `${n}x${n} Grid | Cells: ${filledCount}/${total}`;
    if (gameState.maxStreak > 0) statsText += ` | Best Streak: ${gameState.maxStreak}`;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillText(statsText, w / 2, 160);

    // Day streak
    let gridTop = 185;
    if (currentStreak >= 2) {
      ctx.fillStyle = "#f97316";
      ctx.font = "bold 14px system-ui, sans-serif";
      ctx.fillText(`${currentStreak}-day streak`, w / 2, 182);
      gridTop = 200;
    }

    // Grid
    const cellSize = Math.min(60, (w - 80) / n);
    const gridWidth = cellSize * n;
    const gridLeft = (w - gridWidth) / 2;

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const idx = r * n + c;
        const cat = gameState.grid[idx];
        const filled = gameState.placements[cat.id] != null;
        const isWinCell = gameState.winLine?.includes(idx);

        const x = gridLeft + c * cellSize + 2;
        const y = gridTop + r * cellSize + 2;
        const s = cellSize - 4;

        ctx.fillStyle = isWinCell ? "#22c55e" : filled ? "#3b82f6" : "#1e293b";
        ctx.beginPath();
        ctx.roundRect(x, y, s, s, 6);
        ctx.fill();
      }
    }

    // Footer
    const footerY = gridTop + n * cellSize + 30;
    ctx.fillStyle = "#64748b";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("Play Cricket Bingo!", w / 2, footerY);

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cricket-bingo-${gameState.dailyGameId}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }, [gameState, isWin, filledCount, total, currentStreak]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-card rounded-2xl p-6 text-center space-y-4">
        {isWin ? (
          <>
            <motion.div
              initial={{ rotate: -20, scale: 0, y: -50 }}
              animate={{ rotate: 0, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 0.6, repeat: 2, repeatDelay: 0.1, delay: 0.5 }}
              >
                <Trophy className="w-20 h-20 text-yellow-400 mx-auto drop-shadow-lg" />
              </motion.div>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-display text-4xl font-extrabold text-yellow-400 uppercase tracking-wider"
            >
              🎉 BINGO! 🎉
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-green-400 text-sm font-semibold"
            >
              You completed a line! +500 bonus
            </motion.p>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-destructive/70 mx-auto" />
            <h2 className="font-display text-3xl font-extrabold text-destructive/80 uppercase tracking-wider">
              Game Over
            </h2>
            <p className="text-muted-foreground text-sm">
              Better luck next time!
            </p>
          </>
        )}

        <div className="flex items-center justify-center gap-6 pt-2">
          <div className="text-center">
            <div className="scoreboard-font text-3xl text-secondary">{gameState.score}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-display">
              Final Score
            </div>
          </div>
          <div className="text-center">
            <div className="scoreboard-font text-3xl text-secondary">{filledCount}/{total}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-display">
              Cells Filled
            </div>
          </div>
          {gameState.maxStreak > 0 && (
            <div className="text-center">
              <div className="scoreboard-font text-3xl text-secondary">{gameState.maxStreak}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-display">
                Best Streak
              </div>
            </div>
          )}
        </div>

        {currentStreak >= 2 && (
          <div className="text-orange-400 font-display text-sm tracking-wider">
            {"\u{1F525}"} {currentStreak}-day streak!
          </div>
        )}

        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/15 border border-primary/50 text-primary font-display text-xs uppercase tracking-wider hover:bg-primary/25 transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={handleDownloadCard}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/50 text-emerald-400 font-display text-xs uppercase tracking-wider hover:bg-emerald-500/25 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            Card
          </button>
          <button
            onClick={() => navigate("/leaderboard")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/50 text-amber-400 font-display text-xs uppercase tracking-wider hover:bg-amber-500/25 transition-all active:scale-95"
          >
            <BarChart3 className="w-4 h-4" />
            Ranks
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/15 border border-secondary/50 text-secondary font-display text-xs uppercase tracking-wider hover:bg-secondary/25 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    </motion.div>
  );
}
