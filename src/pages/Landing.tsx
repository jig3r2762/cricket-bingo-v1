import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const floatingEmojis = ["🏏", "🏆", "⭐", "🎯", "🔥"];

function FloatingEmoji({ emoji, delay, x, duration }: { emoji: string; delay: number; x: number; duration: number }) {
  return (
    <motion.span
      className="absolute text-2xl sm:text-3xl opacity-20 pointer-events-none select-none"
      initial={{ y: "100vh", x, opacity: 0 }}
      animate={{ y: "-10vh", opacity: [0, 0.3, 0.2, 0] }}
      transition={{ delay, duration, repeat: Infinity, ease: "linear" }}
    >
      {emoji}
    </motion.span>
  );
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
};

export default function Landing() {
  const navigate = useNavigate();
  const { playAsGuest } = useAuth();

  const handlePlayNow = () => navigate("/play");

  const handleGuestPlay = () => {
    playAsGuest();
    navigate("/play");
  };

  return (
    <div className="min-h-screen stadium-bg overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 right-10 w-48 h-48 rounded-full bg-primary/5 blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-10 w-56 h-56 rounded-full bg-secondary/5 blur-3xl"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full bg-primary/3 blur-3xl"
        />
      </div>

      {/* Floating emojis */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {floatingEmojis.map((emoji, i) => (
          <FloatingEmoji
            key={i}
            emoji={emoji}
            delay={i * 3}
            x={60 + i * 70}
            duration={12 + i * 2}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* ─── HERO ─── */}
        <section className="flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">
          <motion.div
            initial={{ opacity: 0, rotate: -180, scale: 0 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 12 }}
          >
            <motion.span
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl sm:text-7xl block mb-4"
            >
              🏏
            </motion.span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-5xl sm:text-7xl font-extrabold uppercase tracking-[0.15em] text-secondary mb-3"
          >
            Cricket Bingo
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-muted-foreground text-base sm:text-lg max-w-md mb-8"
          >
            Play cricket while watching cricket. Fill the grid, <span className="text-primary font-semibold">beat the clock,</span> and compete globally.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0,255,65,0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePlayNow}
              className="px-8 py-3.5 rounded-xl text-gray-900 font-bold text-base uppercase tracking-wider shadow-lg relative overflow-hidden group"
              style={{ background: "linear-gradient(135deg, #00ff41 0%, #00ff88 100%)" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="relative z-10">Play Now</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGuestPlay}
              className="px-8 py-3.5 rounded-xl border border-border/50 text-secondary font-medium text-sm uppercase tracking-wider hover:bg-secondary/5 transition-all"
            >
              🎮 Play as Guest
            </motion.button>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-16"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-muted-foreground/40 text-xs font-display uppercase tracking-widest"
            >
              Scroll to learn more ↓
            </motion.div>
          </motion.div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-[0.15em] text-secondary text-center mb-12"
          >
            How It Works
          </motion.h2>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {[
              { step: "1", icon: "🧑‍💻", title: "A Player Appears", desc: "Each turn reveals a cricket player. You have 10 seconds to place them before the clock moves on." },
              { step: "2", icon: "📍", title: "Place Strategically", desc: "Drop them on a grid cell that matches their stats, team, or country. Wrong placements hurt your score." },
              { step: "3", icon: "🏆", title: "Race for the Top", desc: "Fill a row/column/diagonal to bank your score. Fastest players climb the daily leaderboard!" },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeUp} className="glass-card rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="text-primary font-display text-xs uppercase tracking-widest mb-1">Step {item.step}</div>
                <h3 className="font-display text-lg font-bold text-secondary uppercase tracking-wider mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ─── FEATURES ─── */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-[0.15em] text-secondary text-center mb-12"
          >
            Features
          </motion.h2>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          >
            {[
              { icon: "📅", title: "Same Puzzle Daily", desc: "Everyone plays the same puzzle. Your score today determines your rank." },
              { icon: "🏏", title: "3,600+ Players", desc: "Real cricketers across Tests, ODIs, T20Is & IPL. Know the game, dominate the grid." },
              { icon: "⏱️", title: "10-Second Turns", desc: "Race against the clock. Faster decisions = higher scores = higher ranks." },
              { icon: "🏆", title: "Live Leaderboard", desc: "See where you rank globally. Beat today's top score to claim your spot." },
              { icon: "🔥", title: "Streaks", desc: "Play every day. Build your streak. Never miss a puzzle." },
              { icon: "🎮", title: "Play Now", desc: "No sign-up. No limits. Start playing in 5 seconds flat." },
            ].map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="glass-card rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">{f.icon}</div>
                <h3 className="font-display text-xs sm:text-sm font-bold text-secondary uppercase tracking-wider mb-1">{f.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ─── STATS BAR ─── */}
        <section className="py-16 border-y border-border/20">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto px-4 grid grid-cols-3 gap-6 text-center"
          >
            {[
              { value: "3,600+", label: "Cricket Players" },
              { value: "42", label: "Categories" },
              { value: "∞", label: "New Puzzle Daily" },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeUp}>
                <div className="scoreboard-font text-3xl sm:text-4xl text-primary mb-1">{stat.value}</div>
                <div className="font-display text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="max-w-2xl mx-auto px-4 py-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-[0.15em] text-secondary text-center mb-12"
          >
            FAQ
          </motion.h2>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              {
                q: "What is Cricket Bingo?",
                a: "Cricket Bingo is a free daily cricket trivia game where you match cricket players to categories on a bingo grid. Each day features a new puzzle with players from Tests, ODIs, T20Is, and IPL. Place players correctly based on their stats, teams, and achievements to complete a row, column, or diagonal and get BINGO!",
              },
              {
                q: "How do you play Cricket Bingo?",
                a: "Each turn, you're shown a cricket player. Place them on any grid cell whose category they match (e.g., 'Played for MI', 'Scored 10000+ runs', 'Indian player'). Fill a complete row, column, or diagonal to win. You have limited turns, so choose wisely! You can play a 3x3 or 4x4 grid in relaxed or timed mode.",
              },
              {
                q: "Is Cricket Bingo free to play?",
                a: "Yes! Cricket Bingo is completely free to play. A new puzzle is available every day at midnight. You can play as a guest or sign in with Google to save your stats, streaks, and compete on the leaderboard.",
              },
              {
                q: "How many cricket players are in Cricket Bingo?",
                a: "Cricket Bingo features over 3,600 cricket players from international cricket (Tests, ODIs, T20Is) and the Indian Premier League (IPL), sourced from Cricsheet open data.",
              },
            ].map((faq) => (
              <motion.article key={faq.q} variants={fadeUp} className="glass-card rounded-xl p-5">
                <h3 className="font-display text-sm font-bold text-secondary uppercase tracking-wider mb-2">{faq.q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="py-20 text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-[0.15em] text-secondary mb-4">
              Ready to Play?
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              A new cricket puzzle awaits you every day. How well do you know the game?
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0,255,65,0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePlayNow}
              className="px-10 py-4 rounded-xl text-gray-900 font-bold text-lg uppercase tracking-wider shadow-lg"
              style={{ background: "linear-gradient(135deg, #00ff41 0%, #00ff88 100%)" }}
            >
              Play Now — It's Free
            </motion.button>
          </motion.div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="border-t border-border/20 py-8 text-center px-4">
          <p className="text-muted-foreground/50 text-xs">
            Cricket Bingo &copy; 2025 &middot; Data from{" "}
            <a href="https://cricsheet.org" target="_blank" rel="noopener noreferrer" className="text-primary/60 hover:text-primary transition-colors">
              Cricsheet
            </a>{" "}
            (CC-BY-4.0)
          </p>
        </footer>
      </div>
    </div>
  );
}
