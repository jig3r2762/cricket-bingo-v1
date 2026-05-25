import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Target, Zap, Trophy, Crown, Coins, Flame,
  BarChart3, Award, Settings, Calendar, ChevronRight,
  Menu, LogOut, Home, HelpCircle,
} from "lucide-react";
import { useSeoHead } from "@/lib/useSeoHead";
import { useTheme } from "@/hooks/useTheme";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

/**
 * Stadium Hub — the new root /.
 * Replaces the old marketing Landing page. Renders without Firebase (fast LCP,
 * SEO-friendly). All CTAs route to protected pages that handle login redirect.
 */

const MODES = [
  {
    href: "/play",
    title: "DAILY",
    sub: "Today's grid",
    desc: "One free grid every day",
    icon: Target,
    color: "green" as const,
  },
  {
    href: "/battle",
    title: "BATTLE",
    sub: "vs Bot · free",
    desc: "Race the bot, get a bingo first",
    icon: Zap,
    color: "orange" as const,
  },
  {
    href: "/paid-battle",
    title: "PAID",
    sub: "Stake & win",
    desc: "Real coins, real winners",
    icon: Trophy,
    color: "yellow" as const,
  },
  {
    href: "/guess",
    title: "GUESS",
    sub: "Identify player",
    desc: "From clues, name the cricketer",
    icon: Crown,
    color: "purple" as const,
  },
];

export default function Hub() {
  const { theme, toggle: toggleTheme } = useTheme();

  const [userCoins, setUserCoins] = useState<number | null>(null);
  const [userStreak, setUserStreak] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  useEffect(() => {
    try {
      const coinsVal = localStorage.getItem("cricket-bingo-coins");
      const streakVal = localStorage.getItem("cricket-bingo-streak");
      const roleVal = localStorage.getItem("cricket-bingo-role");
      const userVal = localStorage.getItem("cricket-bingo-username");
      const photoVal = localStorage.getItem("cricket-bingo-photo");
      const guestVal = localStorage.getItem("cricket-bingo-guest") === "true";

      if (coinsVal !== null) setUserCoins(Number(coinsVal));
      if (streakVal !== null) setUserStreak(Number(streakVal));
      if (roleVal !== null) setUserRole(roleVal);
      if (userVal !== null) setUsername(userVal);
      if (photoVal !== null) setUserPhoto(photoVal);
      setIsGuest(guestVal);
    } catch (e) {
      console.error("Error reading from localStorage:", e);
    }
  }, []);

  const handleSignOut = async () => {
    try {
      const { signOut } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      await signOut(auth);
      
      // Clear localStorage
      localStorage.removeItem("cricket-bingo-coins");
      localStorage.removeItem("cricket-bingo-streak");
      localStorage.removeItem("cricket-bingo-role");
      localStorage.removeItem("cricket-bingo-username");
      localStorage.removeItem("cricket-bingo-photo");
      
      // Force refresh
      window.location.reload();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  useSeoHead({
    title: "Cricket Bingo — Free Daily Cricket Quiz Game | 3,600+ Player Cards",
    description:
      "Play Cricket Bingo free online. Match cricket legends to IPL teams, stats, roles & trophies on a daily 3×3 or 4×4 bingo grid. Same grid every day for every player. No download — just open and play.",
    canonical: "https://cricket-bingo.in/",
    ogImage: "https://cricket-bingo.in/og-image.png",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Game",
      name: "Cricket Bingo",
      description:
        "A free daily cricket knowledge game. Match cricket players to teams, roles, stats and trophies on a bingo grid.",
      url: "https://cricket-bingo.in/",
      image: "https://cricket-bingo.in/og-image.png",
      genre: ["Trivia", "Sports", "Puzzle"],
      gamePlatform: ["Web", "Android"],
      applicationCategory: "GameApplication",
      operatingSystem: "Web, Android",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.6",
        ratingCount: "1200",
      },
      publisher: {
        "@type": "Organization",
        name: "Cricket Bingo",
        url: "https://cricket-bingo.in/",
      },
    },
  });

  const today = useMemo(() => {
    const d = new Date();
    const day = d.toLocaleDateString("en-GB", { weekday: "long" }).toUpperCase();
    const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }).toUpperCase();
    return { day, date };
  }, []);

  return (
    <div className="stadium-bg min-h-screen relative">
      <div className="relative z-10 mx-auto max-w-2xl px-4 pt-4 pb-24 sm:pt-6 lg:max-w-3xl">

        {/* ─── Top bar ─────────────────────────────────── */}
        <header className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border-2 border-primary/40">
              <span className="text-primary font-display text-xl font-black">CB</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-display text-lg font-black tracking-wide leading-none">CRICKET BINGO</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Stadium · live</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* User Profile Quick Access (if logged in) */}
            {username ? (
              <div className="hud-pill !px-2 !py-1.5 flex items-center gap-1.5 shrink-0 max-w-[120px] sm:max-w-[180px]">
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt=""
                    className="w-5 h-5 rounded-full shrink-0"
                  />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-primary/25 flex items-center justify-center text-[10px] font-black text-primary shrink-0">
                    {username[0].toUpperCase()}
                  </span>
                )}
                <span className="truncate text-xs font-bold hidden sm:inline">{username}</span>
              </div>
            ) : isGuest ? (
              <div className="hud-pill !px-2 !py-1.5 flex items-center gap-1.5 shrink-0">
                <span className="text-sm shrink-0">🎮</span>
                <span className="text-xs font-bold hidden sm:inline">GUEST</span>
              </div>
            ) : null}

            {/* Hamburger Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="hud-pill !p-2 flex items-center justify-center shrink-0"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-background border-l border-border p-6 flex flex-col justify-between">
                <div className="flex flex-col gap-6 h-full justify-between">
                  {/* Top Section: Header & Profile info */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <SheetTitle className="font-display text-lg font-black tracking-wide">
                        CRICKET BINGO
                      </SheetTitle>
                    </div>

                    {/* Profile & Stats Panel */}
                    <div className="candy-card p-4 space-y-4">
                      {username || isGuest ? (
                        <div className="flex items-center gap-3">
                          {userPhoto ? (
                            <img
                              src={userPhoto}
                              alt=""
                              className="w-12 h-12 rounded-full border-2 border-primary/40 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center text-lg font-black text-primary shrink-0">
                              {isGuest ? "🎮" : username ? username[0].toUpperCase() : "?"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-display text-sm font-black truncate">
                              {isGuest ? "GUEST PLAYER" : username}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                              {userRole === "admin" ? "Admin" : "Player"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-xs text-muted-foreground mb-3">Sign in to save progress and climb the leaderboard!</p>
                          <SheetClose asChild>
                            <Link to="/login" className="cta-chunky color-gold size-sm w-full inline-flex justify-center">
                              <span className="relative z-10">SIGN IN / SIGN UP</span>
                            </Link>
                          </SheetClose>
                        </div>
                      )}

                      {/* User Stats Grid inside the Drawer */}
                      {(username || isGuest) && (
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60">
                          <div className="flex flex-col items-center justify-center bg-background/50 rounded-lg p-2 border border-border/40">
                            <Coins size={14} className="text-yellow-400 mb-1" />
                            <span className="text-[11px] font-black">{userCoins ?? 0}</span>
                            <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">Coins</span>
                          </div>
                          <div className="flex flex-col items-center justify-center bg-background/50 rounded-lg p-2 border border-border/40">
                            <Flame size={14} className="text-pink-500 mb-1" />
                            <span className="text-[11px] font-black">{userStreak ?? 0}</span>
                            <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">Streak</span>
                          </div>
                          <div className="flex flex-col items-center justify-center bg-background/50 rounded-lg p-2 border border-border/40">
                            <Award size={14} className="text-primary mb-1" />
                            <span className="text-[10px] font-black truncate max-w-full text-center">
                              {userRole === "admin" ? "ADMIN" : "PLAYING"}
                            </span>
                            <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">Rank</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-col gap-2">
                      <SheetClose asChild>
                        <Link to="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors text-sm font-bold">
                          <Home size={16} className="text-muted-foreground" />
                          Home
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/play" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors text-sm font-bold">
                          <Target size={16} className="text-muted-foreground" />
                          Play Game
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/leaderboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors text-sm font-bold">
                          <Trophy size={16} className="text-muted-foreground" />
                          Leaderboard
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/stats" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors text-sm font-bold">
                          <BarChart3 size={16} className="text-muted-foreground" />
                          My Stats
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/how-to-play" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors text-sm font-bold">
                          <HelpCircle size={16} className="text-muted-foreground" />
                          How to Play
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/about" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors text-sm font-bold">
                          <Settings size={16} className="text-muted-foreground" />
                          About
                        </Link>
                      </SheetClose>
                      {userRole === "admin" && (
                        <SheetClose asChild>
                          <Link to="/admin" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors text-sm font-bold text-cyan-400">
                            <Settings size={16} className="text-cyan-400" />
                            Admin Panel
                          </Link>
                        </SheetClose>
                      )}
                    </div>
                  </div>

                  {/* Bottom Section: Theme & Auth Actions */}
                  <div className="space-y-4 border-t border-border pt-4">
                    {/* Theme Toggle in Drawer */}
                    <div className="flex items-center justify-between p-2 bg-secondary/15 rounded-lg">
                      <span className="text-xs font-bold text-muted-foreground">Dark Theme</span>
                      <button
                        onClick={toggleTheme}
                        className="hud-pill size-sm"
                        aria-label="Toggle theme"
                      >
                        {theme === "dark" ? "☾" : "☀"}
                      </button>
                    </div>

                    {username || isGuest ? (
                      <button
                        onClick={handleSignOut}
                        className="hud-pill w-full justify-center gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        <LogOut size={14} />
                        SIGN OUT
                      </button>
                    ) : null}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* ─── Today's match hero ─────────────────────── */}
        <section className="scoreboard p-5 sm:p-7 mb-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                {today.day} · {today.date}
              </span>
              <span className="ml-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse-glow" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-destructive">LIVE</span>
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-black leading-tight tracking-tight mb-1">
              CRICKET BINGO
            </h1>
            <p className="text-sm text-muted-foreground mb-5 max-w-md">
              A fresh 3×3 cricket grid every 24 hours. Same grid for everyone. Match cricket legends to teams, stats and trophies. Climb the daily leaderboard.
            </p>

            <Link to="/play" className="cta-chunky color-green size-lg w-full sm:w-auto inline-flex">
              <span className="relative z-10 flex items-center gap-2">
                PLAY TODAY'S GRID <ChevronRight size={22} />
              </span>
            </Link>
          </div>

          <div
            aria-hidden
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.18), transparent 60%)",
            }}
          />
        </section>

        {/* ─── Mode rail ──────────────────────────────── */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="font-display text-lg font-extrabold uppercase tracking-wide">Game Modes</h2>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {MODES.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.href}
                  to={m.href}
                  className={`mode-card color-${m.color}`}
                >
                  <div className="relative z-10 flex flex-col items-start gap-2 w-full text-white">
                    <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <div className="font-display text-xl sm:text-2xl font-black leading-none">{m.title}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-85">{m.sub}</div>
                    <div className="text-[11px] opacity-75 leading-snug mt-auto">{m.desc}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ─── Quick links ────────────────────────────── */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="font-display text-lg font-extrabold uppercase tracking-wide">Quick</h2>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <QuickLink to="/how-to-play" icon={Target} title="HOW TO PLAY" sub="Rules · scoring" />
            <QuickLink to="/about" icon={Settings} title="ABOUT" sub="The team" />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            SEO content — visible to users below the fold, indexed by Google.
            Don't strip this; it's what drives organic traffic from search.
        ═══════════════════════════════════════════════════════════ */}
        <section className="candy-card p-5 sm:p-7 mb-6 space-y-4">
          <h2 className="font-display text-2xl font-black uppercase tracking-wider">What is Cricket Bingo?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Cricket Bingo</strong> is a free daily cricket knowledge game.
            Every 24 hours we generate a fresh bingo grid — 3×3 or 4×4 cells filled with categories like
            <em> Mumbai Indians</em>, <em>WK-Batsman</em>, <em>5,000+ ODI runs</em>, or
            <em> World Cup Winners</em>. We deal you a deck of real cricket players (3,600+ in the database,
            from Sachin Tendulkar to current IPL stars) one at a time. Your job: tap the cell whose category
            matches the player. Wrong cell? You lose a life. Complete a row, column, or diagonal to win the
            <em> bingo</em>.
          </p>

          <h3 className="font-display text-base font-black uppercase tracking-wider pt-2">How it works</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
            <li>One free daily grid — same grid for every player worldwide, so you can compare scores.</li>
            <li>Build streaks of correct placements to multiply your score.</li>
            <li>Complete a bingo line for a +500 bonus and instant share-card.</li>
            <li>Climb the daily leaderboard. Track your stats and longest streak.</li>
            <li>Battle a bot for free, or stake coins in head-to-head paid battles.</li>
          </ul>

          <h3 className="font-display text-base font-black uppercase tracking-wider pt-2">Built for cricket fans</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our player database covers all formats — Test, ODI, T20I, IPL — with categories drawn from
            real career stats, IPL franchise history, captaincy roles, World Cup wins, Orange Cap and
            Purple Cap winners. Whether you grew up watching India lift the 2011 World Cup or you tune in
            for every IPL season, Cricket Bingo tests how well you really know the players. Data sourced
            from <a href="https://cricsheet.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Cricsheet</a> open data (CC-BY-4.0).
          </p>

          <h3 className="font-display text-base font-black uppercase tracking-wider pt-2">No download. No signup needed.</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Play instantly in your browser — desktop, tablet, or mobile. Sign in with Google to save your
            scores and climb the leaderboard, or play as guest. Also available on Android via the Capacitor app.
          </p>
        </section>

        {/* ─── Footer ─────────────────────────────────── */}
        <footer className="text-center text-[10px] text-muted-foreground/70 uppercase tracking-widest font-bold pt-4 space-x-3">
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <span>·</span>
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <span>·</span>
          <Link to="/how-to-play" className="hover:text-foreground transition-colors">How to play</Link>
          <span>·</span>
          <Link to="/players" className="hover:text-foreground transition-colors">Players</Link>
        </footer>
      </div>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────── */

function QuickLink({
  to, icon: Icon, title, sub,
}: { to: string; icon: typeof Trophy; title: string; sub: string }) {
  return (
    <Link to={to} className="candy-card p-3 flex items-center gap-3 hover:border-primary/50 transition-colors">
      <div className="w-9 h-9 rounded-lg bg-primary/15 border-2 border-primary/30 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-primary" />
      </div>
      <div className="min-w-0">
        <div className="font-display text-sm font-black leading-tight">{title}</div>
        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider truncate">{sub}</div>
      </div>
      <ChevronRight size={14} className="ml-auto text-muted-foreground shrink-0" />
    </Link>
  );
}
