import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 28 } },
};

// Simulated shareable emoji grid to visually demonstrate the concept
const DEMO_GRID_3 = [
  ["🟩", "⬛", "⬛"],
  ["🟦", "🟩", "⬛"],
  ["⬛", "🟦", "🟩"],
];

const COMPARISONS = [
  { feature: "About", wordle: "Guess a 5-letter word", bingo: "Match real cricket players" },
  { feature: "Format", wordle: "Type letters, get color clues", bingo: "Drag cards to a live bingo grid" },
  { feature: "Players", wordle: "Words", bingo: "3,600+ real cricketers" },
  { feature: "Daily", wordle: "1 word per day", bingo: "New grid every midnight" },
  { feature: "Share", wordle: "Emoji letter grid", bingo: "Emoji bingo grid + score" },
  { feature: "Compete", wordle: "Share your grid", bingo: "Global leaderboard + streaks" },
];

export default function CricketWordle() {
  const navigate = useNavigate();
  const { playAsGuest } = useAuth();

  const handlePlay = () => navigate("/play");
  const handleGuest = () => { playAsGuest(); navigate("/play"); };

  return (
    <div className="min-h-screen stadium-bg overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="text-5xl mb-4">🏏</div>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold uppercase tracking-[0.12em] text-secondary mb-4">
            Cricket Wordle
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-3">
            Love Wordle? Try <span className="text-primary font-semibold">Cricket Bingo</span> — the Wordle-style daily cricket puzzle with 3,600+ real player cards. Share your emoji grid with friends, just like Wordle!
          </p>
          <p className="text-muted-foreground/70 text-sm mb-8">
            Free · Daily puzzle · Shareable emoji grid · No download
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0,255,65,0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePlay}
              className="px-8 py-3.5 rounded-xl text-gray-900 font-bold text-base uppercase tracking-wider shadow-lg"
              style={{ background: "linear-gradient(135deg, #00ff41 0%, #00ff88 100%)" }}
            >
              Play Cricket Bingo Free
            </motion.button>
            <button
              onClick={handleGuest}
              className="px-8 py-3.5 rounded-xl border border-border/50 text-secondary font-medium text-sm uppercase tracking-wider hover:bg-secondary/5 transition-all"
            >
              🎮 Play as Guest
            </button>
          </div>
        </motion.div>

        {/* Emoji grid demo */}
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl font-extrabold uppercase tracking-wider text-secondary text-center mb-4"
          >
            Share Your Result — Like Wordle
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-sm text-center mb-8"
          >
            After every game, share your emoji grid on WhatsApp, Twitter, or Instagram.
          </motion.p>

          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-6 text-center font-mono max-w-xs"
            >
              <p className="text-secondary text-sm font-bold mb-1">🏏 Cricket Bingo – Feb 18</p>
              <p className="text-secondary/80 text-xs mb-3">🏆 BINGO! | 3×3 Grid</p>
              <div className="space-y-1 mb-3">
                {DEMO_GRID_3.map((row, i) => (
                  <div key={i} className="text-2xl tracking-wider">{row.join("")}</div>
                ))}
              </div>
              <p className="text-muted-foreground text-xs">Score: 850 · 🔥3 days</p>
              <p className="text-primary/80 text-xs mt-1">Can you beat me? 👇</p>
              <p className="text-secondary/60 text-xs">cricket-bingo.in</p>
            </motion.div>
          </div>

          <p className="text-center text-muted-foreground/50 text-xs mt-4">
            🟩 = win line cell · 🟦 = filled cell · ⬛ = empty
          </p>
        </section>

        {/* Comparison */}
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl font-extrabold uppercase tracking-wider text-secondary text-center mb-8"
          >
            Cricket Bingo vs Wordle
          </motion.h2>

          <div className="overflow-x-auto">
            <table className="w-full max-w-2xl mx-auto">
              <thead>
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-display uppercase tracking-wider text-muted-foreground w-32"></th>
                  <th className="text-center px-4 py-2 text-xs font-display uppercase tracking-wider text-muted-foreground">Wordle</th>
                  <th className="text-center px-4 py-2 text-xs font-display uppercase tracking-wider text-primary">Cricket Bingo 🏏</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISONS.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-card/20" : ""}>
                    <td className="px-4 py-3 text-xs font-display uppercase tracking-wider text-muted-foreground">{row.feature}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground/70 text-center">{row.wordle}</td>
                    <td className="px-4 py-3 text-xs text-secondary text-center font-medium">{row.bingo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Why cricket fans love it */}
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl font-extrabold uppercase tracking-wider text-secondary text-center mb-8"
          >
            Why Cricket Fans Love It
          </motion.h2>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto"
          >
            {[
              { icon: "🏏", title: "Real Cricket Players", desc: "Not made-up words — 3,600+ real cricketers from IPL, Tests, ODIs, and T20Is. Virat, Rohit, Bumrah, Dhoni and many more." },
              { icon: "🧠", title: "Tests Your Cricket GK", desc: "Know which team Hardik played for? Know who has 10,000+ Test runs? Cricket Bingo tests the knowledge you actually have." },
              { icon: "📅", title: "Daily Challenge", desc: "Fresh puzzle every midnight. Same grid for all players — your cricket knowledge is the only advantage." },
              { icon: "📤", title: "Share With Friends", desc: "Post your emoji grid on WhatsApp groups, Twitter, or Instagram Stories. Challenge your cricket-mad friends." },
            ].map((item) => (
              <motion.div key={item.title} variants={fadeUp} className="glass-card rounded-xl p-5 flex gap-4">
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <h3 className="font-display text-sm font-bold text-secondary uppercase tracking-wider mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-8 text-center"
        >
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-wider text-secondary mb-3">
            Play Today's Cricket Puzzle
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            If you love Wordle, you'll love Cricket Bingo. New puzzle every day, free forever, share your result like Wordle.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePlay}
              className="px-8 py-3 rounded-xl text-gray-900 font-bold text-sm uppercase tracking-wider"
              style={{ background: "linear-gradient(135deg, #00ff41 0%, #00ff88 100%)" }}
            >
              Play Now — Free
            </motion.button>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 rounded-xl border border-border/50 text-muted-foreground text-sm hover:text-secondary transition-colors"
            >
              Learn More
            </button>
          </div>
        </motion.div>

        {/* Footer nav */}
        <div className="text-center mt-8 text-xs text-muted-foreground/50 space-x-4">
          <button onClick={() => navigate("/")} className="hover:text-secondary transition-colors">Home</button>
          <button onClick={() => navigate("/ipl-quiz")} className="hover:text-secondary transition-colors">IPL Quiz</button>
          <button onClick={() => navigate("/cricket-quiz")} className="hover:text-secondary transition-colors">Cricket Quiz</button>
        </div>
      </div>
    </div>
  );
}
