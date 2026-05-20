import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Target, Trophy, Zap, Star } from "lucide-react";

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

export function HowToPlayModal({ open, onClose }: HowToPlayModalProps) {
  const steps = [
    { icon: Target, title: "Read the Player", desc: "A cricket legend appears with their stats and team." },
    { icon: Trophy, title: "Place in the Grid", desc: "Tap the cell whose category matches the player." },
    { icon: Zap, title: "Build Streaks", desc: "Consecutive correct placements multiply your score." },
    { icon: Star, title: "Complete Bingo", desc: "Fill a row, column, or diagonal to win!" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="candy-card !border-2 max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl font-black tracking-wider text-foreground uppercase">
            HOW TO <span className="gold-text">PLAY</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
            Master Cricket Bingo · 4 steps
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          {steps.map((step, i) => {
            const colors = ["color-green", "color-blue", "color-yellow", "color-pink"] as const;
            return (
              <div key={i} className="flex items-start gap-3">
                <div className={`tile-3d ${colors[i]} w-10 h-10 shrink-0 !rounded-xl is-locked`}>
                  <step.icon className="w-4 h-4 relative z-10" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-black text-foreground uppercase tracking-wider">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
