import { motion } from "framer-motion";
import { Grid3X3, LayoutGrid } from "lucide-react";

interface GridSelectionProps {
  onSelect: (size: 3 | 4) => void;
}

export function GridSelection({ onSelect }: GridSelectionProps) {
  const options = [
    {
      size: 3 as const,
      title: "QUICK MATCH",
      subtitle: "3 × 3",
      description: "9 cells · Fast rounds",
      icon: Grid3X3,
      difficulty: "EASY",
      color: "var(--cricket-green)",
    },
    {
      size: 4 as const,
      title: "CLASSIC",
      subtitle: "4 × 4",
      description: "16 cells · Full challenge",
      icon: LayoutGrid,
      difficulty: "HARD",
      color: "var(--golden-trophy)",
    },
  ];

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-sm mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-foreground uppercase tracking-[0.15em] leading-none">
          Cricket
        </h1>
        <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-primary uppercase tracking-[0.15em] leading-none">
          Bingo
        </h1>
        <p className="text-muted-foreground font-body text-sm mt-3 tracking-wide">Place legends. Complete the grid.</p>
      </motion.div>

      <div className="flex flex-col gap-3 w-full">
        {options.map((opt, i) => (
          <motion.button
            key={opt.size}
            initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            onClick={() => onSelect(opt.size)}
            className="relative glass-card p-5 flex items-center gap-4 group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              ["--btn-color" as string]: `hsl(${opt.color})`,
            }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border"
              style={{
                borderColor: `hsl(${opt.color} / 0.4)`,
                background: `hsl(${opt.color} / 0.1)`,
              }}
            >
              <opt.icon className="w-7 h-7" style={{ color: `hsl(${opt.color})` }} />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-foreground tracking-wider">{opt.title}</h3>
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-display uppercase tracking-wider border"
                  style={{
                    borderColor: `hsl(${opt.color} / 0.4)`,
                    color: `hsl(${opt.color})`,
                    background: `hsl(${opt.color} / 0.1)`,
                  }}
                >
                  {opt.difficulty}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                <span className="font-display font-semibold tracking-wider" style={{ color: `hsl(${opt.color})` }}>
                  {opt.subtitle}
                </span>
                {" · "}{opt.description}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
