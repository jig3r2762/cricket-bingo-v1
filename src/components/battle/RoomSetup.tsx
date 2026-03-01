import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Users, ArrowLeft, Loader2 } from "lucide-react";

interface RoomSetupProps {
  onCreateRoom: (gridSize: 3 | 4) => Promise<void>;
  onJoinRoom: (code: string) => Promise<void>;
  creating: boolean;
  joining: boolean;
  joinError: string | null;
}

export function RoomSetup({ onCreateRoom, onJoinRoom, creating, joining, joinError }: RoomSetupProps) {
  const navigate = useNavigate();
  const [view, setView] = useState<"pick" | "create" | "join">("pick");

  // Uncontrolled input: value lives in the DOM, never touched by React re-renders
  const inputRef = useRef<HTMLInputElement>(null);
  // Only track length for enabling/disabling the button (minimal re-renders)
  const [codeLen, setCodeLen] = useState(0);

  // Focus the input after the join view animation settles
  useEffect(() => {
    if (view === "join") {
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [view]);

  const handleSubmit = () => {
    const code = inputRef.current?.value ?? "";
    if (code.length === 6) onJoinRoom(code);
  };

  return (
    <div className="min-h-screen stadium-bg flex items-center justify-center p-4">
      {/* Back to /play — top-left corner */}
      <button
        onClick={() => navigate("/play")}
        className="fixed top-4 left-4 flex items-center gap-1.5 text-muted-foreground hover:text-secondary transition-colors text-sm z-10"
      >
        <ArrowLeft className="w-4 h-4" /> Play
      </button>

      <div className="w-full max-w-sm">
        <div className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center gap-2">
            <Swords className="w-6 h-6 text-primary" />
            <h1 className="font-display text-2xl font-extrabold text-secondary uppercase tracking-wider">
              vs Player
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">Race to fill the grid first!</p>
        </div>

        {/* No mode="wait" — prevents Framer Motion from unmounting children during re-renders */}
        <AnimatePresence>
          {view === "pick" && (
            <motion.div
              key="pick"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24, position: "absolute" }}
              transition={{ duration: 0.22 }}
              className="space-y-3 w-full"
            >
              <button
                onClick={() => setView("create")}
                className="w-full glass-card p-5 flex items-center gap-4 border border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all active:scale-[0.98] text-left rounded-xl"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                  <Swords className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-display text-sm font-bold text-secondary uppercase tracking-wider">
                    Create Game
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Get a 6-letter code to share with a friend
                  </div>
                </div>
              </button>

              <button
                onClick={() => setView("join")}
                className="w-full glass-card p-5 flex items-center gap-4 border border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-all active:scale-[0.98] text-left rounded-xl"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="font-display text-sm font-bold text-secondary uppercase tracking-wider">
                    Join Game
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Enter a friend's room code to play
                  </div>
                </div>
              </button>
            </motion.div>
          )}

          {view === "create" && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24, position: "absolute" }}
              transition={{ duration: 0.22 }}
              className="space-y-5 w-full"
            >
              <button
                onClick={() => setView("pick")}
                className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <p className="text-center text-sm font-display uppercase tracking-wider text-muted-foreground">
                Choose grid size
              </p>

              <div className="grid grid-cols-2 gap-3">
                {([3, 4] as const).map((size) => (
                  <button
                    key={size}
                    disabled={creating}
                    onClick={() => onCreateRoom(size)}
                    className="glass-card p-6 rounded-xl border border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all active:scale-[0.97] text-center space-y-1.5 disabled:opacity-50"
                  >
                    <div className="font-display text-3xl font-extrabold text-primary">{size}×{size}</div>
                    <div className="text-xs text-muted-foreground">
                      {size === 3 ? "9 cells · Fast" : "16 cells · Epic"}
                    </div>
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

          {view === "join" && (
            <motion.div
              key="join"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24, position: "absolute" }}
              transition={{ duration: 0.22 }}
              className="space-y-5 w-full"
            >
              <button
                onClick={() => setView("pick")}
                className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div className="space-y-3">
                <p className="text-center text-sm font-display uppercase tracking-wider text-muted-foreground">
                  Enter room code
                </p>

                {/* Uncontrolled input — value never overwritten by React re-renders */}
                <input
                  ref={inputRef}
                  defaultValue=""
                  placeholder="A B C 1 2 3"
                  maxLength={6}
                  className="w-full text-center font-display text-3xl font-bold uppercase tracking-[0.35em] bg-card/50 border border-border/50 rounded-xl px-4 py-4 text-secondary focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/30 placeholder:tracking-[0.2em]"
                  onChange={(e) => {
                    // Format in-place: uppercase, alphanumeric only, max 6
                    const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
                    if (e.target.value !== cleaned) e.target.value = cleaned;
                    setCodeLen(cleaned.length);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                />

                {joinError && (
                  <p className="text-red-400 text-xs text-center font-display">{joinError}</p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={codeLen < 6 || joining}
                  className="w-full py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-display text-sm uppercase tracking-wider hover:bg-emerald-500/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {joining && <Loader2 className="w-4 h-4 animate-spin" />}
                  {joining ? "Joining..." : "Join Game"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
