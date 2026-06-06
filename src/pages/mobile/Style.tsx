import { Coins, Flame, Trophy, Zap, Crown, Target, Clock } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

/**
 * Style sandbox — preview of every chunky 3D primitive in one place.
 * Visit /style to see and tap every component before we touch real screens.
 */

const TEAMS: Array<{ code: string; color: string; shadow: string; label: string }> = [
  { code: "MI",   color: "214 89% 47%", shadow: "214 89% 22%", label: "Mumbai" },
  { code: "CSK",  color: "45 92% 50%",  shadow: "45 92% 26%",  label: "Chennai" },
  { code: "RCB",  color: "348 86% 47%", shadow: "348 86% 24%", label: "Bengaluru" },
  { code: "RR",   color: "330 80% 58%", shadow: "330 80% 32%", label: "Rajasthan" },
  { code: "SRH",  color: "24 95% 53%",  shadow: "24 95% 28%",  label: "Hyderabad" },
  { code: "KKR",  color: "267 65% 35%", shadow: "267 65% 18%", label: "Kolkata" },
  { code: "LSG",  color: "192 92% 38%", shadow: "192 92% 20%", label: "Lucknow" },
  { code: "GT",   color: "222 84% 28%", shadow: "222 84% 14%", label: "Gujarat" },
];

const COLOR_VARIANTS = ["green", "orange", "blue", "purple", "red", "yellow", "pink"] as const;

export default function Style() {
  const { theme, toggle: toggleTheme } = useTheme();

  return (
    <div className="stadium-bg min-h-screen relative">
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-12">

        {/* ─── Header ─────────────────────────────────────── */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-extrabold tracking-tight gold-text">
              STADIUM UI · DESIGN LAB
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Chunky 3D physics + floodlit night palette. Tap anything.
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="hud-pill"
          >
            {theme === "dark" ? "☾ NIGHT" : "☀ DAY"}
          </button>
        </header>

        {/* ─── Scoreboard ─────────────────────────────────── */}
        <section>
          <SectionTitle num="01" title="Scoreboard panel" />
          <div className="scoreboard p-6 mt-4 grid grid-cols-3 gap-6">
            <ScoreColumn label="OVER" value="12.3" />
            <ScoreColumn label="SCORE" value="184" sub="for 3" />
            <ScoreColumn label="BINGOS" value="2" color="green" />
          </div>
        </section>

        {/* ─── HUD pills ──────────────────────────────────── */}
        <section>
          <SectionTitle num="02" title="HUD pills" />
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="hud-pill color-gold"><Coins size={16} /> 1,240</span>
            <span className="hud-pill color-pink"><Flame size={16} /> STREAK · 7</span>
            <span className="hud-pill color-cyan"><Trophy size={16} /> RANK 42</span>
            <span className="hud-pill"><Clock size={16} /> 00:48</span>
            <span className="hud-pill"><Target size={16} /> 6/9</span>
          </div>
        </section>

        {/* ─── Chunky buttons ─────────────────────────────── */}
        <section>
          <SectionTitle num="03" title="Chunky buttons — press them" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {COLOR_VARIANTS.map((c) => (
              <button key={c} className={`cta-chunky color-${c}`}>
                {c.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-3 mt-5">
            <button className="cta-chunky color-green size-sm">SMALL</button>
            <button className="cta-chunky color-green">REGULAR</button>
            <button className="cta-chunky color-green size-lg"><Zap size={22} /> PLAY DAILY</button>
          </div>
        </section>

        {/* ─── Bingo cells ────────────────────────────────── */}
        <section>
          <SectionTitle num="04" title="Bingo cells — empty / filled / win" />
          <div className="grid grid-cols-3 gap-3 mt-4 max-w-md">
            <DemoCell label="MI" sub="TEAM" team={TEAMS[0]} state="team" />
            <DemoCell label="100s" sub="CENTURIES" state="empty" />
            <DemoCell label="WK" sub="KEEPER" state="empty" />
            <DemoCell label="KOHLI" sub="BAT · RCB" state="filled" />
            <DemoCell label="DHONI" sub="WK · CSK" state="win" />
            <DemoCell label="ROHIT" sub="BAT · MI" state="filled" />
            <DemoCell label="PACER" sub="FAST" state="empty" />
            <DemoCell label="IPL" sub="TROPHY" state="empty" />
            <DemoCell label="CSK" sub="TEAM" team={TEAMS[1]} state="team" />
          </div>
        </section>

        {/* ─── Mode cards ─────────────────────────────────── */}
        <section>
          <SectionTitle num="05" title="Mode cards (hub mode-rail)" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <ModeCard icon={<Target size={28} />} title="DAILY" sub="Today's grid" color="green" />
            <ModeCard icon={<Zap size={28} />}   title="BATTLE" sub="vs Bot · free" color="orange" />
            <ModeCard icon={<Trophy size={28} />} title="PAID" sub="Win coins" color="yellow" />
            <ModeCard icon={<Crown size={28} />}  title="GUESS" sub="Identify player" color="purple" />
          </div>
        </section>

        {/* ─── Team-color tiles ───────────────────────────── */}
        <section>
          <SectionTitle num="06" title="Team-color tiles (jerseys)" />
          <div className="grid grid-cols-4 gap-3 mt-4">
            {TEAMS.map((t) => (
              <button
                key={t.code}
                className="tile-3d color-team aspect-square"
                style={{
                  ["--team-color" as string]: t.color,
                  ["--team-shadow" as string]: t.shadow,
                }}
              >
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <span className="font-display text-2xl font-black">{t.code}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{t.label}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ─── LED dot-matrix scoreboard ──────────────────── */}
        <section>
          <SectionTitle num="07" title="LED dot-matrix display" />
          <div className="scoreboard-dotmatrix p-6 mt-4">
            <div className="flex items-baseline justify-around">
              <div className="text-center">
                <div className="text-xs uppercase tracking-widest text-primary/70 mb-1">YOU</div>
                <div className="score-display color-green text-6xl animate-led-flicker">128</div>
              </div>
              <div className="text-2xl font-display text-muted-foreground">VS</div>
              <div className="text-center">
                <div className="text-xs uppercase tracking-widest text-primary/70 mb-1">BOT</div>
                <div className="score-display text-6xl animate-led-flicker">96</div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Progress bar ───────────────────────────────── */}
        <section>
          <SectionTitle num="08" title="Progress / bingo meter" />
          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                <span>BINGO LINES</span><span>2 / 4</span>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{ width: "50%" }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                <span>XP TO LEVEL 8</span><span>740 / 1000</span>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{ width: "74%" }} /></div>
            </div>
          </div>
        </section>

        <footer className="text-center text-xs text-muted-foreground py-8">
          Tap any tile. Toggle day / night up top. Press-down depth = 6px, hover lifts 2px.
        </footer>
      </div>
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────── */

function SectionTitle({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-display text-3xl font-black text-primary/70">{num}</span>
      <h2 className="text-xl font-display font-extrabold uppercase tracking-wide">{title}</h2>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function ScoreColumn({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: "green" }) {
  return (
    <div className="text-center">
      <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">{label}</div>
      <div className={`score-display text-5xl ${color === "green" ? "color-green" : ""}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{sub}</div>}
    </div>
  );
}

function DemoCell({
  label, sub, state, team,
}: {
  label: string;
  sub: string;
  state: "empty" | "filled" | "win" | "team";
  team?: { color: string; shadow: string };
}) {
  if (state === "filled") {
    return (
      <div className="bingo-cell-filled aspect-square">
        <div className="relative z-10 flex flex-col items-center gap-0.5">
          <Crown size={20} className="text-white/90" />
          <span className="font-display text-sm font-black">{label}</span>
          <span className="text-[9px] opacity-80 font-bold uppercase tracking-wider">{sub}</span>
        </div>
      </div>
    );
  }
  if (state === "win") {
    return (
      <div className="bingo-cell-filled bingo-cell-win aspect-square">
        <div className="relative z-10 flex flex-col items-center gap-0.5">
          <Crown size={20} />
          <span className="font-display text-sm font-black">{label}</span>
          <span className="text-[9px] opacity-80 font-bold uppercase tracking-wider">{sub}</span>
        </div>
      </div>
    );
  }
  if (state === "team" && team) {
    return (
      <button
        className="bingo-cell color-team aspect-square"
        style={{
          ["--team-color" as string]: team.color,
          ["--team-shadow" as string]: team.shadow,
        }}
      >
        <div className="relative z-10 flex flex-col items-center gap-0.5">
          <span className="font-display text-xl font-black">{label}</span>
          <span className="text-[9px] opacity-80 font-bold uppercase tracking-wider">{sub}</span>
        </div>
      </button>
    );
  }
  return (
    <button className="bingo-cell aspect-square">
      <div className="relative z-10 flex flex-col items-center gap-0.5">
        <Target size={20} className="text-primary/60" />
        <span className="font-display text-sm font-black">{label}</span>
        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{sub}</span>
      </div>
    </button>
  );
}

function ModeCard({
  icon, title, sub, color,
}: { icon: React.ReactNode; title: string; sub: string; color: "green" | "orange" | "yellow" | "purple" }) {
  return (
    <button className={`mode-card color-${color}`}>
      <div className="relative z-10 flex flex-col items-start gap-2 w-full">
        <div className="w-10 h-10 rounded-xl bg-black/15 flex items-center justify-center">{icon}</div>
        <div className="font-display text-2xl font-black leading-none">{title}</div>
        <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">{sub}</div>
      </div>
    </button>
  );
}
