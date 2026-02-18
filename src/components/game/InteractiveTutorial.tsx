import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X, Zap } from "lucide-react";
import { BingoGrid } from "./BingoGrid";
import { PlayerCard } from "./PlayerCard";
import {
  TUTORIAL_GRID,
  TUTORIAL_PLAYERS,
  TUTORIAL_ELIGIBLE_CELLS,
} from "@/data/tutorialData";
import type { CricketPlayer } from "@/types/game";

export const TUTORIAL_DONE_KEY = "cricket-bingo-tutorial-done";

type StepKind = "welcome" | "explain" | "interactive" | "auto" | "bingo";

interface TutorialStep {
  kind: StepKind;
  playerIdx: number;   // 0=Kohli, 1=Rohit, 2=Bumrah
  title: string;
  body: string;
  targetCellId?: string;   // for interactive steps: which cell to tap
  showWinRow?: boolean;    // highlight the top row gold (goal explanation)
  showEligible?: boolean;  // light up eligible cells for this player
  dimGrid?: boolean;       // de-emphasize grid to focus on player card
  dimPlayer?: boolean;     // de-emphasize player card to focus on grid
}

const STEPS: TutorialStep[] = [
  // 0: Welcome screen
  {
    kind: "welcome",
    playerIdx: 0,
    title: "Welcome to Cricket Bingo!",
    body: "Never played before? Let's do a quick 1-minute practice game so you know exactly what to do.",
  },
  // 1: Explain the grid
  {
    kind: "explain",
    playerIdx: 0,
    title: "Your Bingo Grid",
    body: "Each cell has a cricket category — a country, IPL team, role or trophy. You'll fill these with players.",
    dimPlayer: true,
  },
  // 2: Explain the goal (highlight top row)
  {
    kind: "explain",
    playerIdx: 0,
    title: "Your Goal",
    body: "WIN by completing any ONE full row, column or diagonal. You don't need to fill the whole grid!",
    showWinRow: true,
  },
  // 3: Explain the player card
  {
    kind: "explain",
    playerIdx: 0,
    title: "A Player Appears",
    body: "Each turn a player card appears. Study their country, IPL team and role — that decides which cells they can go in.",
    dimGrid: true,
  },
  // 4: Explain eligible cells
  {
    kind: "explain",
    playerIdx: 0,
    title: "Glowing Cells = Valid",
    body: "Cells that match the player glow cyan. Only tap a glowing cell! Placing in a wrong cell costs you a life.",
    showEligible: true,
  },
  // 5: Interactive — place Kohli in India
  {
    kind: "interactive",
    playerIdx: 0,
    title: "Your Turn!",
    body: "Virat Kohli plays for India. Tap the INDIA cell to place him on the grid!",
    targetCellId: "country_ind",
  },
  // 6: Auto — celebrate + show Rohit
  {
    kind: "auto",
    playerIdx: 1,
    title: "Correct! +100 pts",
    body: "Kohli placed in India. Next player: Rohit Sharma...",
  },
  // 7: Interactive — place Rohit in MI
  {
    kind: "interactive",
    playerIdx: 1,
    title: "Place Rohit!",
    body: "Rohit is the Mumbai Indians captain. Tap the MI cell to place him!",
    targetCellId: "team_mi",
  },
  // 8: Auto — almost bingo
  {
    kind: "auto",
    playerIdx: 2,
    title: "Top Row: 2 / 3",
    body: "One more cell completes the row — BINGO incoming!",
  },
  // 9: Interactive — place Bumrah in Fast Bowler → triggers bingo
  {
    kind: "interactive",
    playerIdx: 2,
    title: "Win It!",
    body: "Jasprit Bumrah is India's premier fast bowler. Tap PACER to complete the row!",
    targetCellId: "tut_pacer",
  },
  // 10: BINGO!
  {
    kind: "bingo",
    playerIdx: 2,
    title: "BINGO! 🎉",
    body: "You completed a row! That's exactly how you win — complete any row, column or diagonal with the right players. Now try the real game!",
  },
];

interface Props {
  onComplete: () => void;
}

export function InteractiveTutorial({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [placements, setPlacements] = useState<Record<string, CricketPlayer | null>>({});
  const [feedbackStates, setFeedbackStates] = useState<Record<string, "correct" | "wrong" | null>>({});

  const current = STEPS[step];
  const tutPlayer = TUTORIAL_PLAYERS[current.playerIdx];

  const isBingo = current.kind === "bingo";
  const isAuto = current.kind === "auto";
  const isInteractive = current.kind === "interactive";
  const isWelcome = current.kind === "welcome";

  // Win line indices for the bingo step (top row = cells 0, 1, 2)
  const winLine = isBingo ? [0, 1, 2] : null;

  // Compute which cells glow cyan in BingoGrid
  function getEligibleCells(): string[] {
    if (current.showWinRow) {
      // Highlight the top row to explain the goal
      return ["country_ind", "team_mi", "tut_pacer"];
    }
    if (isInteractive && current.targetCellId) {
      // Only the guided target cell glows — keeps tutorial focused
      return [current.targetCellId];
    }
    if (current.showEligible) {
      const all = TUTORIAL_ELIGIBLE_CELLS[tutPlayer.id] ?? [];
      return all.filter((c) => !placements[c]);
    }
    return [];
  }

  // Auto-advance "auto" steps after a delay
  useEffect(() => {
    if (!isAuto) return;
    const t = setTimeout(() => setStep((s) => s + 1), 1800);
    return () => clearTimeout(t);
  }, [step, isAuto]);

  function advance() {
    setStep((s) => s + 1);
  }

  function handleCellClick(cellId: string) {
    if (!isInteractive) return;
    if (placements[cellId]) return; // already filled
    if (cellId !== current.targetCellId) return; // not the guided cell

    const player = TUTORIAL_PLAYERS[current.playerIdx];
    setPlacements((prev) => ({ ...prev, [cellId]: player }));
    setFeedbackStates({ [cellId]: "correct" });

    setTimeout(() => {
      setFeedbackStates({});
      setStep((s) => s + 1);
    }, 700);
  }

  function dismiss() {
    try {
      localStorage.setItem(TUTORIAL_DONE_KEY, "true");
      // Also mark old onboarding key so legacy check passes
      localStorage.setItem("cricket-bingo-onboarded", "true");
    } catch {}
    onComplete();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col bg-black/88 backdrop-blur-sm"
    >
      {/* Skip button */}
      {!isBingo && (
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted/20 border border-border/30 text-muted-foreground text-xs font-display uppercase tracking-wider hover:bg-muted/40 transition-colors"
        >
          <X className="w-3 h-3" /> Skip
        </button>
      )}

      {isWelcome ? (
        /* ── WELCOME SCREEN ── */
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="w-full max-w-sm bg-card/95 border border-border/50 rounded-2xl p-8 text-center shadow-2xl"
          >
            <div className="text-5xl mb-4">🏏</div>
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-wider text-foreground mb-2">
              Cricket Bingo
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {current.body}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={advance}
                className="w-full py-3 rounded-xl font-display text-sm uppercase tracking-wider text-gray-900 font-bold active:scale-95 transition-all flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #00ff41 0%, #00ff88 100%)" }}
              >
                Start Practice Game <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={dismiss}
                className="w-full py-2.5 rounded-xl font-display text-xs uppercase tracking-wider border border-border/40 text-muted-foreground hover:bg-muted/10 transition-colors"
              >
                Skip — I know how to play
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        /* ── GAME PREVIEW + COACH MARK ── */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Step progress dots (steps 1–10) */}
          <div className="flex justify-center gap-1.5 pt-3 pb-1 shrink-0">
            {STEPS.slice(1).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i + 1 === step
                    ? "w-6 bg-primary"
                    : i + 1 < step
                    ? "w-3 bg-primary/50"
                    : "w-3 bg-muted/30"
                }`}
              />
            ))}
          </div>

          {/* Game preview */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 py-2 overflow-hidden min-h-0">
            {/* Player card (hidden on bingo step) */}
            {!isBingo && (
              <div
                className={`w-full max-w-md transition-all duration-300 ${
                  current.dimPlayer ? "opacity-20 pointer-events-none" : ""
                }`}
              >
                <PlayerCard
                  player={tutPlayer}
                  remaining={7}
                  total={15}
                  onSkip={() => {}}
                  onWildcard={() => {}}
                  onInfo={() => {}}
                  wildcardsLeft={1}
                  wildcardMode={false}
                  onCancelWildcard={() => {}}
                />
              </div>
            )}

            {/* Bingo grid */}
            <div
              className={`w-full max-w-[288px] transition-all duration-300 ${
                current.dimGrid ? "opacity-20 pointer-events-none" : ""
              }`}
            >
              <BingoGrid
                categories={TUTORIAL_GRID}
                gridSize={3}
                placements={placements}
                feedbackStates={feedbackStates}
                onCellClick={handleCellClick}
                eligibleCells={getEligibleCells()}
                recommendedCell={current.targetCellId ?? null}
                wildcardMode={false}
                winLine={winLine}
              />
            </div>
          </div>

          {/* Coach mark — slides up from bottom */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="px-4 pb-6 pt-1 shrink-0"
            >
              <div
                className={`w-full max-w-md mx-auto rounded-2xl border p-4 backdrop-blur-sm ${
                  isBingo
                    ? "bg-emerald-950/90 border-emerald-500/50"
                    : isInteractive
                    ? "bg-blue-950/90 border-blue-500/40"
                    : "bg-card/90 border-border/50"
                }`}
              >
                <h3
                  className={`font-display text-base font-extrabold uppercase tracking-wider mb-1 ${
                    isBingo
                      ? "text-emerald-400"
                      : isInteractive
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  {current.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {current.body}
                </p>

                {/* Action area */}
                {isBingo ? (
                  <button
                    onClick={dismiss}
                    className="w-full py-3 rounded-xl font-display text-sm uppercase tracking-wider text-gray-900 font-bold active:scale-95 transition-all flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #00ff41 0%, #00ff88 100%)" }}
                  >
                    <Zap className="w-4 h-4" /> Play for Real!
                  </button>
                ) : isInteractive ? (
                  <div className="flex items-center gap-2 text-primary/80">
                    <motion.span
                      animate={{ y: [-3, 3, -3] }}
                      transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                      className="text-lg leading-none"
                    >
                      👆
                    </motion.span>
                    <span className="text-xs font-display uppercase tracking-wider">
                      Tap the glowing cell above
                    </span>
                  </div>
                ) : isAuto ? (
                  /* Progress bar that auto-advances */
                  <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.8, ease: "linear" }}
                    />
                  </div>
                ) : (
                  <button
                    onClick={advance}
                    className="w-full py-2.5 rounded-xl font-display text-sm uppercase tracking-wider text-gray-900 font-bold active:scale-95 transition-all flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #00ff41 0%, #00ff88 100%)" }}
                  >
                    Got it <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
