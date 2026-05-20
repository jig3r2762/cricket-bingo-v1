import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, X } from "lucide-react";
import { subscribeToRoom, type RoomData } from "@/hooks/useOnlineBattle";

interface WaitingRoomProps {
  roomId: string;
  gridSize: 3 | 4;
  onOpponentJoined: (data: RoomData) => void;
  onCancel: () => void;
  entryFee?: number;
  onCancelWithRefund?: () => Promise<void>;
}

export function WaitingRoom({ roomId, gridSize, onOpponentJoined, onCancel, entryFee, onCancelWithRefund }: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);
  const [refunding, setRefunding] = useState(false);

  const handleCancel = async () => {
    if (onCancelWithRefund) {
      setRefunding(true);
      await onCancelWithRefund().catch(() => {});
      setRefunding(false);
    } else {
      onCancel();
    }
  };

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
    <div className="min-h-screen stadium-bg flex items-center justify-center p-4 relative">
      <div className="w-full max-w-sm text-center space-y-7 relative z-10">
        <div className="space-y-1">
          <h2 className="font-display text-3xl font-black uppercase tracking-wider gold-text leading-none">
            Waiting for opponent
          </h2>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-2">
            Share this code · {gridSize}×{gridSize} grid
          </p>
          {entryFee ? (
            <p className="text-secondary text-sm font-display font-extrabold mt-2">
              🪙 POT: {entryFee * 2} · Entry held: {entryFee}
            </p>
          ) : null}
        </div>

        {/* Room code — LED scoreboard */}
        <motion.div
          animate={{ scale: [1, 1.015, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="scoreboard-dotmatrix p-7 space-y-5"
        >
          <div className="score-display color-green text-5xl font-black tracking-[0.25em] select-all animate-led-flicker">
            {roomId}
          </div>
          <button onClick={handleCopy} className="cta-chunky size-sm color-green mx-auto">
            <span className="relative z-10 flex items-center gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "COPIED" : "COPY CODE"}
            </span>
          </button>
        </motion.div>

        {/* Pulse dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
            />
          ))}
        </div>

        <button
          onClick={handleCancel}
          disabled={refunding}
          className={`cta-chunky size-sm color-red mx-auto ${refunding ? "is-disabled" : ""}`}
        >
          <span className="relative z-10 flex items-center gap-2">
            <X className="w-4 h-4" />
            {refunding ? "REFUNDING…" : entryFee ? `CANCEL & REFUND ${entryFee} 🪙` : "CANCEL"}
          </span>
        </button>
      </div>
    </div>
  );
}
