import { useMemo, useCallback } from "react";
import { BingoCell } from "./BingoCell";
import type { GridCategory, CricketPlayer } from "@/types/game";

interface BingoGridProps {
  categories: GridCategory[];
  gridSize: 3 | 4;
  placements: Record<string, CricketPlayer | null>;
  feedbackStates: Record<string, "correct" | "wrong" | null>;
  onCellClick: (categoryId: string) => void;
  eligibleCells?: string[];
  recommendedCell?: string | null;
  wildcardMode?: boolean;
  winLine?: number[] | null;
}

export function BingoGrid({
  categories, gridSize, placements, feedbackStates, onCellClick,
  eligibleCells = [], recommendedCell, wildcardMode, winLine,
}: BingoGridProps) {
  // Use a Set for O(1) lookups instead of Array.includes on every cell
  const eligibleSet = useMemo(() => new Set(eligibleCells), [eligibleCells]);
  const winLineSet = useMemo(() => new Set(winLine ?? []), [winLine]);

  return (
    <div
      className={`grid gap-2 w-full mx-auto ${
        gridSize === 3
          ? "grid-cols-3 max-w-xs"
          : "grid-cols-4 max-w-sm sm:max-w-md"
      }`}
    >
      {categories.map((cat, i) => (
        <BingoCell
          key={cat.id}
          category={cat}
          placedPlayer={placements[cat.id]}
          feedbackState={feedbackStates[cat.id]}
          onClick={() => onCellClick(cat.id)}
          index={i}
          isEligible={eligibleSet.has(cat.id)}
          isRecommended={recommendedCell === cat.id}
          isWildcardTarget={wildcardMode && !placements[cat.id]}
          isWinLine={winLineSet.has(i)}
        />
      ))}
    </div>
  );
}
