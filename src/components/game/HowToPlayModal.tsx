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
      <DialogContent className="player-bar border-border/60 bg-background/95 backdrop-blur-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wider text-foreground uppercase">
            How to <span className="text-primary">Play</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Master Cricket Bingo in 4 steps
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <step.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">{step.title}</h4>
                <p className="text-xs text-muted-foreground font-body">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
