import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Trophy, Zap, ChevronRight, X } from "lucide-react";

const STORAGE_KEY = "cricket-bingo-onboarded";

const steps = [
  {
    icon: Target,
    title: "A Player Appears",
    description: "Each turn, a cricket player is shown with their stats, team, and role. Study them carefully!",
    emoji: "🏏",
    color: "text-primary",
    bgColor: "bg-primary/15 border-primary/30",
  },
  {
    icon: Trophy,
    title: "Place in the Grid",
    description: "Tap the cell whose category matches the player. Green = correct, Red = wrong. Build your grid!",
    emoji: "🎯",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/15 border-emerald-400/30",
  },
  {
    icon: Zap,
    title: "Get BINGO!",
    description: "Complete a row, column, or diagonal to win! Use wildcards wisely and build streaks for bonus points.",
    emoji: "⚡",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/15 border-yellow-400/30",
  },
];

export function OnboardingOverlay() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [step, setStep] = useState(0);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleDismiss();
    }
  };

  const current = steps[step];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-sm bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-6 relative"
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/50" : "w-4 bg-muted/30"
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="flex justify-center mb-4"
        >
          <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center ${current.bgColor}`}>
            <span className="text-3xl">{current.emoji}</span>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-6"
        >
          <h3 className={`font-display text-xl font-bold uppercase tracking-wider mb-2 ${current.color}`}>
            {current.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {current.description}
          </p>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border/40 text-muted-foreground font-display text-xs uppercase tracking-wider hover:bg-muted/10 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs uppercase tracking-wider text-gray-900 font-medium transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #00ff41 0%, #00ff88 100%)" }}
          >
            {step < steps.length - 1 ? (
              <>Next <ChevronRight className="w-4 h-4" /></>
            ) : (
              "Let's Play!"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
