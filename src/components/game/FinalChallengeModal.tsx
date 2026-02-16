import { motion } from "framer-motion";
import { Flame, Lock } from "lucide-react";
import type { GridCategory } from "@/types/game";

interface FinalChallengeModalProps {
  eligibleCells: string[];
  gridSize: 3 | 4;
  grid: GridCategory[];
  placements: Record<string, any | null>;
  onCellSelect: (cellId: string) => void;
}

export function FinalChallengeModal({
  eligibleCells,
  gridSize,
  grid,
  placements,
  onCellSelect,
}: FinalChallengeModalProps) {
  if (eligibleCells.length !== 1) return null;

  const correctCellId = eligibleCells[0];
  const correctCell = grid.find((c) => c.id === correctCellId);
  if (!correctCell) return null;

  // Get all empty cells
  const emptyCellIds = grid
    .filter((c) => !placements[c.id])
    .map((c) => c.id)
    .filter((id) => id !== correctCellId);

  // Shuffle and pick 3 random empty cells as decoys
  const shuffled = emptyCellIds.sort(() => Math.random() - 0.5);
  const fakeCellIds = shuffled.slice(0, 3);

  // Create all 4 options and shuffle
  const options = [correctCellId, ...fakeCellIds]
    .map((cellId) => ({
      cellId,
      isCorrect: cellId === correctCellId,
      category: grid.find((c) => c.id === cellId),
    }))
    .filter((opt) => opt.category)
    .sort(() => Math.random() - 0.5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="player-bar rounded-2xl p-6 w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-secondary" />
            <h2 className="font-display text-xl font-bold text-secondary uppercase tracking-wider">
              Final Showdown
            </h2>
            <Flame className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-sm text-muted-foreground">
            One cell left! Pick the correct one to seal your victory.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {options.map(({ cellId, isCorrect, category }, i) => {
            return (
              <motion.button
                key={cellId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => onCellSelect(cellId)}
                className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer group
                  ${
                    isCorrect
                      ? "border-primary/40 bg-primary/5 hover:border-primary/70 hover:bg-primary/10"
                      : "border-muted/40 bg-muted/5 hover:border-secondary/40 hover:bg-secondary/5"
                  }
                `}
              >
                <div className="font-display text-xs text-muted-foreground opacity-70 mt-2">
                  {category?.shortLabel}
                </div>
                {isCorrect && (
                  <div className="absolute inset-0 rounded-lg border-2 border-primary shadow-[inset_0_0_8px_rgba(0,255,65,0.1)] pointer-events-none" />
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/30 text-center">
          <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">
            💡 Only ONE is correct. Click wisely!
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
