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

  const inputRef = useRef<HTMLInputElement>(null);
  const [codeLen, setCodeLen] = useState(0);

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
    <div className="min-h-screen stadium-bg flex items-center justify-center p-4 relative">
      <button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 hud-pill z-20"
        aria-label="Back to Hub"
      >
        <ArrowLeft className="w-4 h-4" /> HUB
      </button>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center space-y-2 mb-7">
          <div className="flex items-center justify-center gap-2">
            <Swords className="w-6 h-6 text-primary" />
            <h1 className="font-display text-3xl font-black uppercase tracking-wider gold-text">
              VS PLAYER
            </h1>
          </div>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Race to fill the grid first</p>
        </div>

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
              <button onClick={() => setView("create")} className="mode-card color-green w-full !flex-row !items-center !min-h-0 !py-4">
                <div className="relative z-10 flex items-center gap-3 w-full text-white">
                  <div className="w-11 h-11 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                    <Swords className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-display text-base font-black uppercase tracking-wider">CREATE GAME</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-85 mt-0.5">
                      Get a 6-letter code
                    </div>
                  </div>
                </div>
              </button>

              <button onClick={() => setView("join")} className="mode-card color-blue w-full !flex-row !items-center !min-h-0 !py-4">
                <div className="relative z-10 flex items-center gap-3 w-full text-white">
                  <div className="w-11 h-11 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-display text-base font-black uppercase tracking-wider">JOIN GAME</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-85 mt-0.5">
                      Enter friend's code
                    </div>
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
              <button onClick={() => setView("pick")} className="hud-pill" aria-label="Back">
                <ArrowLeft className="w-4 h-4" /> BACK
              </button>

              <p className="text-center text-xs font-display font-extrabold uppercase tracking-widest text-primary/70">
                Choose grid size
              </p>

              <div className="grid grid-cols-2 gap-3">
                {([3, 4] as const).map((size) => (
                  <button
                    key={size}
                    disabled={creating}
                    onClick={() => onCreateRoom(size)}
                    className={`mode-card ${size === 3 ? "color-green" : "color-blue"} aspect-square !p-4 ${creating ? "is-disabled" : ""}`}
                  >
                    <div className="relative z-10 flex flex-col items-center justify-center gap-1 w-full text-white">
                      <div className="font-display text-4xl font-black">{size}×{size}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-85">
                        {size === 3 ? "9 cells · fast" : "16 cells · epic"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {creating && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-display font-bold uppercase tracking-wider">Creating room…</span>
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
              <button onClick={() => setView("pick")} className="hud-pill" aria-label="Back">
                <ArrowLeft className="w-4 h-4" /> BACK
              </button>

              <div className="space-y-3">
                <p className="text-center text-xs font-display font-extrabold uppercase tracking-widest text-primary/70">
                  Enter room code
                </p>

                <input
                  ref={inputRef}
                  defaultValue=""
                  placeholder="A B C 1 2 3"
                  maxLength={6}
                  className="w-full text-center font-display font-black uppercase candy-card !rounded-xl px-3 py-4 text-secondary focus:outline-none focus:border-primary placeholder:text-muted-foreground/30 placeholder:tracking-[0.15em] text-[clamp(1.5rem,9vw,2.25rem)] tracking-[0.2em] sm:tracking-[0.35em]"
                  onChange={(e) => {
                    const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
                    if (e.target.value !== cleaned) e.target.value = cleaned;
                    setCodeLen(cleaned.length);
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                />

                {joinError && (
                  <p className="text-destructive text-xs text-center font-display font-bold">{joinError}</p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={codeLen < 6 || joining}
                  className={`cta-chunky color-blue w-full ${codeLen < 6 || joining ? "is-disabled" : ""}`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {joining && <Loader2 className="w-4 h-4 animate-spin" />}
                    {joining ? "JOINING…" : "JOIN GAME"}
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
