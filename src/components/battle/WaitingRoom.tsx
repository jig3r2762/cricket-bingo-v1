import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, X } from "lucide-react";
import { subscribeToRoom, type RoomData } from "@/hooks/useOnlineBattle";

interface WaitingRoomProps {
  roomId: string;
  gridSize: 3 | 4;
  onOpponentJoined: (data: RoomData) => void;
  onCancel: () => void;
}

export function WaitingRoom({ roomId, gridSize, onOpponentJoined, onCancel }: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsub = subscribeToRoom(roomId, (data) => {
      if (data?.guestUid) onOpponentJoined(data);
    });
    return unsub;
  }, [roomId, onOpponentJoined]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen stadium-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-8">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-secondary uppercase tracking-wider">
            Waiting for opponent
          </h2>
          <p className="text-muted-foreground text-sm">
            Share this code — {gridSize}×{gridSize} grid
          </p>
        </div>

        {/* Room code card */}
        <motion.div
          animate={{ scale: [1, 1.015, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="glass-card rounded-2xl p-8 border border-primary/40 space-y-5"
        >
          <div className="font-display text-5xl font-extrabold text-primary tracking-[0.25em] select-all">
            {roomId}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-primary/15 border border-primary/40 text-primary font-display text-xs uppercase tracking-wider hover:bg-primary/25 transition-all active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </motion.div>

        {/* Pulse dots */}
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/60"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
            />
          ))}
        </div>

        <button
          onClick={onCancel}
          className="flex items-center gap-2 mx-auto text-muted-foreground hover:text-secondary transition-colors text-sm font-display uppercase tracking-wider"
        >
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  );
}
