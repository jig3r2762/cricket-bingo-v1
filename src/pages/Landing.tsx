import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, CalendarDays, Clock, Database, Swords, Trophy } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { shouldUseHashRouter } from "@/lib/iframeUtils";

const features = [
  { icon: CalendarDays, title: "Daily grid", desc: "A seeded puzzle every day, shared by every player." },
  { icon: Database, title: "1,145 players", desc: "Real cricket records, roles, IPL teams, trophies, and teammate links." },
  { icon: Clock, title: "Optional timer", desc: "Play relaxed or turn on a 10-second decision clock." },
  { icon: Trophy, title: "Leaderboard", desc: "Win with a row, column, or diagonal and chase the daily score." },
  { icon: Swords, title: "Battle modes", desc: "Play against a bot, a friend, or enter coin-based 1v1 rooms." },
  { icon: BarChart3, title: "Player database", desc: "Search profiles, stats, teams, trophies, and cricket categories." },
];

const modes = [
  ["Daily Bingo", "Place each cricketer onto a valid category cell and complete a line."],
  ["Guess the Cricketer", "Reveal clues, identify the player, and score more by guessing early."],
  ["Battle", "Same grid, same deck, direct pressure against another player or bot."],
];

function setGuestMode() {
  try {
    localStorage.setItem("cricket-bingo-guest", "true");
  } catch {}
}

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    if (shouldUseHashRouter()) {
      setGuestMode();
      navigate("/play", { replace: true });
    }
  }, [navigate]);

  const handleGuestPlay = () => {
    setGuestMode();
    navigate("/play");
  };

  return (
    <div className="min-h-screen game-bg">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link to="/" className="font-display text-2xl text-foreground">
          Cricket Bingo
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-semibold text-muted-foreground sm:flex">
          <Link to="/players" className="hover:text-primary">Players</Link>
          <Link to="/how-to-play" className="hover:text-primary">How to Play</Link>
          <Link to="/login" className="hover:text-primary">Sign In</Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-8 md:grid-cols-[1.1fr_0.9fr] md:pt-14">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="space-y-6"
          >
            <div className="inline-flex rounded-md border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Daily cricket knowledge game
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-5xl leading-none text-foreground sm:text-7xl">
                Cricket Bingo
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Match real cricketers to teams, countries, roles, trophies, stats, and teammate categories. Complete a line before your cards run out.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={handleGuestPlay} className="candy-btn candy-btn-green px-8 py-3 text-base">
                Play Free
              </button>
              <Link
                to="/players"
                className="rounded-md border border-border bg-card px-8 py-3 text-center text-base font-semibold text-foreground hover:border-primary/40"
              >
                Explore Players
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, type: "spring", stiffness: 260, damping: 28 }}
            className="rounded-xl border border-primary/20 bg-primary/10 p-3 shadow-sm"
          >
            <div className="grid grid-cols-3 gap-2">
              {[
                "MI",
                "IND",
                "10K",
                "WK",
                "IPL",
                "AUS",
                "CSK",
                "300W",
                "CAP",
              ].map((cell, index) => (
                <div key={cell} className={`aspect-square rounded-md border border-border bg-card p-3 ${index === 4 ? "bg-primary text-primary-foreground" : ""}`}>
                  <div className="flex h-full flex-col justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Cell {index + 1}
                    </span>
                    <span className="font-display text-2xl">{cell}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-4 md:grid-cols-3">
            {modes.map(([title, desc]) => (
              <article key={title} className="candy-card p-5">
                <h2 className="font-display text-2xl text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-8 max-w-2xl">
            <h2 className="font-display text-4xl text-foreground">Built like a cricket scorecard, played like bingo.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Every turn asks a real cricket question. Good placement builds your board, your score, and your streak.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="candy-card p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-14 text-center">
          <div className="candy-card p-8">
            <h2 className="font-display text-4xl text-foreground">Start today's grid</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Play as a guest now, then sign in when you want to save stats and compete on the leaderboard.
            </p>
            <button onClick={handleGuestPlay} className="candy-btn candy-btn-green mt-6 px-10 py-3">
              Open Game
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card/70 px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Cricket Bingo. Data from Cricsheet, CC-BY-4.0.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/about" className="hover:text-primary">About</Link>
            <Link to="/privacy" className="hover:text-primary">Privacy</Link>
            <Link to="/terms" className="hover:text-primary">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
