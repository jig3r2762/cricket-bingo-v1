import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Users, ArrowLeft, Loader2, Coins } from "lucide-react";
import { peekRoom, type RoomData } from "@/hooks/useOnlineBattle";
import { useWallet } from "@/contexts/WalletContext";

const ENTRY_FEES = [
  { amount: 50, label: "Starter", color: "emerald" },
  { amount: 100, label: "Standard", color: "primary", popular: true },
  { amount: 250, label: "High", color: "amber" },
  { amount: 500, label: "Premium", color: "red" },
];

type View = "pick" | "create-fee" | "create-grid" | "join-code" | "join-confirm";

interface Props {
  onCreateRoom: (entryFee: number, gridSize: 3 | 4) => Promise<void>;
  onJoinRoom: (code: string) => Promise<void>;
  creating: boolean;
  joining: boolean;
  joinError: string | null;
}

export function EntryFeePicker({ onCreateRoom, onJoinRoom, creating, joining, joinError }: Props) {
  const navigate = useNavigate();
  const { coinBalance } = useWallet();
  const [view, setView] = useState<View>("pick");
  const [selectedFee, setSelectedFee] = useState<number | null>(null);
  const [roomPreview, setRoomPreview] = useState<RoomData | null>(null);
  const [peeking, setPeeking] = useState(false);
  const [peekError, setPeekError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [codeLen, setCodeLen] = useState(0);
  const [pendingCode, setPendingCode] = useState("");

  useEffect(() => {
    if (view === "join-code") {
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [view]);

  const handlePeekRoom = async () => {
    const code = inputRef.current?.value ?? "";
    if (code.length !== 6) return;
    setPeeking(true);
    setPeekError(null);
    const result = await peekRoom(code);
    setPeeking(false);
    if ("error" in result) {
      setPeekError(result.error);
      return;
    }
    setPendingCode(code);
    setRoomPreview(result);
    setView("join-confirm");
  };

  const slide = { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 24, position: "absolute" as const }, transition: { duration: 0.22 } };

  return (
    <div className="min-h-screen stadium-bg flex items-center justify-center p-4">
      <button
        onClick={() => navigate("/play")}
        className="fixed top-4 left-4 flex items-center gap-1.5 text-muted-foreground hover:text-secondary transition-colors text-sm z-10"
      >
        <ArrowLeft className="w-4 h-4" /> Play
      </button>

      <div className="w-full max-w-sm">
        <div className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <Swords className="w-5 h-5 text-primary" />
            <h1 className="font-display text-2xl font-extrabold text-secondary uppercase tracking-wider">
              Paid Battle
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">Win 2× your entry fee!</p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-display">
            <span>🪙</span>
            <span>Balance: {coinBalance.toLocaleString()}</span>
          </div>
        </div>

        <AnimatePresence>
          {/* ── Pick mode ── */}
          {view === "pick" && (
            <motion.div key="pick" {...slide} className="space-y-3 w-full">
              <button
                onClick={() => setView("create-fee")}
                className="w-full glass-card p-5 flex items-center gap-4 border border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all active:scale-[0.98] text-left rounded-xl"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                  <Swords className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-display text-sm font-bold text-secondary uppercase tracking-wider">Create Room</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Set an entry fee and share your code</div>
                </div>
              </button>

              <button
                onClick={() => setView("join-code")}
                className="w-full glass-card p-5 flex items-center gap-4 border border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-all active:scale-[0.98] text-left rounded-xl"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="font-display text-sm font-bold text-secondary uppercase tracking-wider">Join Room</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Enter a code and pay the entry fee</div>
                </div>
              </button>
            </motion.div>
          )}

          {/* ── Create: pick fee ── */}
          {view === "create-fee" && (
            <motion.div key="create-fee" {...slide} className="space-y-4 w-full">
              <button onClick={() => setView("pick")} className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <p className="text-center text-sm font-display uppercase tracking-wider text-muted-foreground">Choose entry fee</p>
              <div className="grid grid-cols-2 gap-3">
                {ENTRY_FEES.map((fee) => (
                  <button
                    key={fee.amount}
                    disabled={coinBalance < fee.amount}
                    onClick={() => { setSelectedFee(fee.amount); setView("create-grid"); }}
                    className={`relative glass-card p-4 rounded-xl border transition-all active:scale-[0.97] text-center space-y-1 disabled:opacity-40 disabled:cursor-not-allowed
                      ${fee.popular ? "border-primary/50 bg-primary/5" : "border-border/40 hover:border-border/60"}`}
                  >
                    {fee.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-display uppercase bg-primary text-white">
                        Popular
                      </span>
                    )}
                    <div className="scoreboard-font text-2xl text-amber-400">{fee.amount}</div>
                    <div className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">🪙 coins</div>
                    <div className="text-[10px] text-muted-foreground">{fee.label}</div>
                    {coinBalance < fee.amount && (
                      <div className="text-[9px] text-red-400">Need {fee.amount - coinBalance} more</div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Create: pick grid size ── */}
          {view === "create-grid" && selectedFee && (
            <motion.div key="create-grid" {...slide} className="space-y-5 w-full">
              <button onClick={() => setView("create-fee")} className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="text-center space-y-1">
                <p className="text-sm font-display uppercase tracking-wider text-muted-foreground">Choose grid size</p>
                <p className="text-xs text-amber-400 font-display">Entry: {selectedFee} 🪙 · Pot: {selectedFee * 2} 🪙</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {([3, 4] as const).map((size) => (
                  <button
                    key={size}
                    disabled={creating}
                    onClick={() => onCreateRoom(selectedFee, size)}
                    className="glass-card p-6 rounded-xl border border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all active:scale-[0.97] text-center space-y-1.5 disabled:opacity-50"
                  >
                    <div className="font-display text-3xl font-extrabold text-primary">{size}×{size}</div>
                    <div className="text-xs text-muted-foreground">{size === 3 ? "9 cells · Fast" : "16 cells · Epic"}</div>
                  </button>
                ))}
              </div>
              {creating && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-display uppercase tracking-wider">Creating room...</span>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Join: enter code ── */}
          {view === "join-code" && (
            <motion.div key="join-code" {...slide} className="space-y-5 w-full">
              <button onClick={() => setView("pick")} className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <p className="text-center text-sm font-display uppercase tracking-wider text-muted-foreground">Enter room code</p>
              <input
                ref={inputRef}
                defaultValue=""
                placeholder="A B C 1 2 3"
                maxLength={6}
                className="w-full text-center font-display text-3xl font-bold uppercase tracking-[0.35em] bg-card/50 border border-border/50 rounded-xl px-4 py-4 text-secondary focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/30"
                onChange={(e) => {
                  const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
                  if (e.target.value !== cleaned) e.target.value = cleaned;
                  setCodeLen(cleaned.length);
                }}
                onKeyDown={(e) => { if (e.key === "Enter") handlePeekRoom(); }}
              />
              {peekError && <p className="text-red-400 text-xs text-center font-display">{peekError}</p>}
              <button
                onClick={handlePeekRoom}
                disabled={codeLen < 6 || peeking}
                className="w-full py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-display text-sm uppercase tracking-wider hover:bg-emerald-500/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {peeking && <Loader2 className="w-4 h-4 animate-spin" />}
                {peeking ? "Checking..." : "Check Room"}
              </button>
            </motion.div>
          )}

          {/* ── Join: confirm entry fee ── */}
          {view === "join-confirm" && roomPreview && (
            <motion.div key="join-confirm" {...slide} className="space-y-5 w-full">
              <button onClick={() => { setView("join-code"); setRoomPreview(null); }} className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div className="glass-card rounded-xl border border-border/40 divide-y divide-border/20">
                {[
                  { label: "Host", value: roomPreview.hostName },
                  { label: "Grid", value: `${roomPreview.gridSize}×${roomPreview.gridSize}` },
                  { label: "Entry Fee", value: `${roomPreview.entryFee ?? 0} 🪙` },
                  { label: "Prize Pot", value: `${(roomPreview.entryFee ?? 0) * 2} 🪙` },
                  { label: "Your Balance", value: `${coinBalance.toLocaleString()} 🪙` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">{label}</span>
                    <span className="text-sm font-bold text-secondary">{value}</span>
                  </div>
                ))}
              </div>

              {coinBalance < (roomPreview.entryFee ?? 0) ? (
                <p className="text-red-400 text-xs text-center font-display">
                  Insufficient coins. Need {((roomPreview.entryFee ?? 0) - coinBalance).toLocaleString()} more 🪙
                </p>
              ) : null}

              {joinError && <p className="text-red-400 text-xs text-center font-display">{joinError}</p>}

              <button
                onClick={() => onJoinRoom(pendingCode)}
                disabled={coinBalance < (roomPreview.entryFee ?? 0) || joining}
                className="w-full py-3 rounded-xl bg-primary/20 border border-primary/50 text-primary font-display text-sm uppercase tracking-wider hover:bg-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {joining && <Loader2 className="w-4 h-4 animate-spin" />}
                {joining ? "Joining..." : `Join & Spend ${roomPreview.entryFee ?? 0} 🪙`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
