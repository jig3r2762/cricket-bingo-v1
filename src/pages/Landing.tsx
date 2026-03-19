import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { shouldUseHashRouter } from "@/lib/iframeUtils";
import { ThemeToggle } from "@/components/ThemeToggle";

const floatingEmojis = ["🏏", "🏆", "⭐", "🎯", "🔥", "🎮", "🏅"];

function FloatingEmoji({ emoji, delay, x, duration }: { emoji: string; delay: number; x: number; duration: number }) {
  return (
    <motion.span
      className="absolute text-3xl sm:text-4xl pointer-events-none select-none"
      initial={{ y: "105vh", x, opacity: 0 }}
      animate={{ y: "-10vh", opacity: [0, 0.7, 0.5, 0] }}
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
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
};

// Inline guest helper — avoids importing AuthContext which pulls in Firebase SDK.
function setGuestMode() {
  try { localStorage.setItem("cricket-bingo-guest", "true"); } catch {}
}

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    if (shouldUseHashRouter()) {
      setGuestMode();
      navigate("/play", { replace: true });
    }
  }, []);

  const handlePlayNow = () => navigate("/play");

  const handleGuestPlay = () => {
    setGuestMode();
    navigate("/play");
  };

  return (
    <div className="min-h-screen warm-bg overflow-hidden">
      {/* Floating emojis */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {floatingEmojis.map((emoji, i) => (
          <FloatingEmoji
            key={i}
            emoji={emoji}
            delay={i * 2.5}
            x={40 + i * 60}
            duration={10 + i * 1.5}
          />
        ))}
      </div>

      {/* Top-right theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10">
        {/* ─── HERO ─── */}
        <section className="flex flex-col items-center justify-center min-h-[88vh] px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
          >
            <motion.span
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="text-7xl sm:text-8xl block mb-4"
            >
              🏏
            </motion.span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 250, damping: 22 }}
          >
            <h1 className="font-display text-6xl sm:text-7xl leading-none" style={{ color: "hsl(25 30% 18%)" }}>
              Cricket
            </h1>
            <h1 className="font-display text-6xl sm:text-7xl leading-none text-candy-green">
              Bingo
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-foreground/70 font-body font-semibold text-base sm:text-lg max-w-lg mt-4 mb-8"
          >
            The free online cricket game with{" "}
            <span className="text-candy-green font-bold">3,600+ real player cards.</span>{" "}
            Match cricketers to categories,{" "}
            <span className="text-candy-orange font-bold">beat the clock,</span>{" "}
            and compete globally.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55, type: "spring", stiffness: 250 }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95, y: 4 }}
              onClick={handlePlayNow}
              className="candy-btn candy-btn-green text-lg px-10 py-4"
            >
              🎮 Play Now — Free
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGuestPlay}
              className="px-8 py-3.5 rounded-2xl border-2 border-gray-300 text-foreground font-body font-bold text-sm bg-white hover:border-gray-400 transition-all"
              style={{ boxShadow: "0 4px 0 #d1d5db" }}
            >
              Quick Guest Play
            </motion.button>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-16"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-muted-foreground/60 text-xs font-body font-bold uppercase tracking-widest"
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
            className="font-display text-3xl sm:text-4xl text-foreground text-center mb-12"
          >
            How to Play
          </motion.h2>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {[
              { step: "1", icon: "🧑‍💻", title: "A Player Card Appears", desc: "Each turn reveals a real cricket player card. You have 10 seconds to place them before the clock moves on.", color: "bg-candy-blue", shadow: "0 5px 0 hsl(205 85% 38%)" },
              { step: "2", icon: "📍", title: "Answer the Cricket Question", desc: "Match the player to a grid category — IPL team, role, career stats, trophy, or country. Wrong answers cost you turns.", color: "bg-candy-orange", shadow: "0 5px 0 hsl(28 90% 38%)" },
              { step: "3", icon: "🏆", title: "Compete on the Leaderboard", desc: "Fill a row, column, or diagonal to win. Score higher, climb the global ranks, and challenge your friends!", color: "bg-candy-green", shadow: "0 5px 0 hsl(134 55% 30%)" },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeUp} className="candy-card p-6 text-center">
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${item.color}`}
                  style={{ boxShadow: item.shadow }}>
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <div className="font-body font-bold text-xs text-candy-green uppercase tracking-widest mb-1">Step {item.step}</div>
                <h3 className="font-display text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ─── FEATURES ─── */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl sm:text-4xl text-foreground text-center mb-12"
          >
            Why Play This Free Online Cricket Game
          </motion.h2>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          >
            {[
              { icon: "📅", title: "Daily Cricket Quiz", desc: "A new puzzle every day at midnight. Same grid for everyone.", color: "bg-candy-blue" },
              { icon: "🏏", title: "3,600+ Player Cards", desc: "Real players from Tests, ODIs, T20Is & IPL.", color: "bg-candy-green" },
              { icon: "⏱️", title: "10-Second Turns", desc: "Race against the clock. Faster = higher scores.", color: "bg-candy-orange" },
              { icon: "🏆", title: "Live Leaderboard", desc: "See where you rank globally. Beat today's top score.", color: "bg-candy-yellow" },
              { icon: "🔥", title: "Streaks & Stats", desc: "Track your daily streak. Build the longest streak.", color: "bg-candy-red" },
              { icon: "🎮", title: "Play Free Instantly", desc: "No download, no sign-up. Start in 5 seconds.", color: "bg-candy-purple" },
            ].map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} className="candy-card p-4 text-center">
                <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${f.color}`}
                  style={{ boxShadow: "0 3px 0 rgba(0,0,0,0.15)" }}>
                  <span className="text-2xl">{f.icon}</span>
                </div>
                <h3 className="font-display text-sm text-foreground mb-1">{f.title}</h3>
                <p className="text-muted-foreground font-body text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ─── STATS BAR ─── */}
        <section className="py-16">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto px-4 grid grid-cols-3 gap-6 text-center"
          >
            {[
              { value: "3,600+", label: "Cricket Player Cards", color: "text-candy-green" },
              { value: "42", label: "Quiz Categories", color: "text-candy-orange" },
              { value: "∞", label: "Free Games Daily", color: "text-candy-blue" },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="candy-card py-6 px-4">
                <div className={`font-display text-4xl sm:text-5xl mb-1 ${stat.color}`}>{stat.value}</div>
                <div className="font-body font-bold text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ─── CRICKET QUIZ CATEGORIES ─── */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl sm:text-4xl text-foreground text-center mb-4"
          >
            Cricket Quiz Questions & Categories
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-muted-foreground font-body font-semibold text-sm text-center max-w-2xl mx-auto mb-10"
          >
            Test your cricket general knowledge across 42 unique categories. Each game picks a random set — no two games are alike.
          </motion.p>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { icon: "🏏", label: "IPL Teams", examples: "MI, CSK, RCB, DC, SRH, RR, KKR, GT", color: "bg-candy-orange" },
              { icon: "🌍", label: "Countries", examples: "India, Australia, England, Pakistan, SA", color: "bg-candy-blue" },
              { icon: "⚾", label: "Player Roles", examples: "Batsman, Pacer, Spinner, All-Rounder, WK", color: "bg-candy-green" },
              { icon: "📊", label: "Career Stats", examples: "10K+ runs, 300+ wickets, 50+ Tests", color: "bg-candy-purple" },
              { icon: "🏆", label: "Trophies Won", examples: "IPL, World Cup, T20 WC, Champions Trophy", color: "bg-candy-yellow" },
              { icon: "🤝", label: "Teammates", examples: "Played with Dhoni, Kohli, Sachin", color: "bg-candy-pink" },
              { icon: "⭐", label: "Achievements", examples: "Century makers, captains, IPL MVPs", color: "bg-candy-red" },
              { icon: "🔀", label: "Combo Categories", examples: "Indian + MI, Pacer + CSK, and more", color: "bg-candy-blue" },
            ].map((cat) => (
              <motion.div key={cat.label} variants={fadeUp} className="candy-card p-3 text-center">
                <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${cat.color}`}
                  style={{ boxShadow: "0 2px 0 rgba(0,0,0,0.15)" }}>
                  <span className="text-xl">{cat.icon}</span>
                </div>
                <h3 className="font-display text-sm text-foreground mb-1">{cat.label}</h3>
                <p className="text-muted-foreground font-body text-[10px] leading-relaxed">{cat.examples}</p>
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
            className="font-display text-3xl sm:text-4xl text-foreground text-center mb-12"
          >
            Frequently Asked Questions
          </motion.h2>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {[
              {
                q: "What is Cricket Bingo?",
                a: "Cricket Bingo is a free online cricket quiz game where you match real cricket player cards to categories on a bingo grid. Each day features a new puzzle with players from Tests, ODIs, T20Is, and IPL. Place players correctly based on their stats, teams, and achievements to complete a row, column, or diagonal and get BINGO!",
              },
              {
                q: "How do you play this online cricket game?",
                a: "Each turn, you're shown a cricket player card. Place them on any grid cell whose category they match (e.g., 'Played for MI', 'Scored 10,000+ runs', 'Indian player'). Fill a complete row, column, or diagonal to win. You have limited turns, so choose wisely! You can play a 3x3 or 4x4 grid in relaxed or timed mode.",
              },
              {
                q: "Is this cricket card game free?",
                a: "Yes! Cricket Bingo is 100% free to play. A new puzzle is available every day at midnight. You can play as a guest or sign in with Google to save your stats, streaks, and compete on the global leaderboard. No download or installation required.",
              },
              {
                q: "How many cricket player cards are there?",
                a: "Cricket Bingo features over 3,600 real cricket player cards from international cricket (Tests, ODIs, T20Is) and the Indian Premier League (IPL), sourced from Cricsheet open data.",
              },
              {
                q: "Can I play this cricket game on my phone?",
                a: "Yes! Cricket Bingo is a browser-based online cricket game that works on any device — mobile, tablet, or desktop. No app download needed.",
              },
            ].map((faq) => (
              <motion.article key={faq.q} variants={fadeUp} className="candy-card p-5">
                <h3 className="font-display text-base text-foreground mb-2">{faq.q}</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">{faq.a}</p>
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
            className="max-w-md mx-auto candy-card p-10"
          >
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="font-display text-3xl sm:text-4xl text-foreground mb-4">
              Ready to Play?
            </h2>
            <p className="text-muted-foreground font-body font-semibold text-sm mb-8">
              A new cricket quiz awaits you every day. 3,600+ player cards, 42 categories, zero cost.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95, y: 4 }}
              onClick={handlePlayNow}
              className="candy-btn candy-btn-green text-xl px-12 py-5 w-full"
            >
              🎮 Play Now — It's Free
            </motion.button>
          </motion.div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="border-t-2 border-gray-200 py-8 text-center px-4 space-y-3 bg-white/50">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <a href="/leaderboard" className="hover:text-candy-green transition-colors font-body font-bold">
              Leaderboard
            </a>
            <a href="/privacy" className="hover:text-candy-green transition-colors font-body font-bold">
              Privacy Policy
            </a>
          </div>
          <p className="text-muted-foreground font-body text-xs">
            Cricket Bingo &copy; 2025 &middot; Free online cricket quiz game &middot; Data from{" "}
            <a href="https://cricsheet.org" target="_blank" rel="noopener noreferrer" className="text-candy-green hover:text-candy-green/80 transition-colors">
              Cricsheet
            </a>{" "}
            (CC-BY-4.0)
          </p>
        </footer>
      </div>
    </div>
  );
}
