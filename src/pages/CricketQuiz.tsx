import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useSeoHead } from "@/lib/useSeoHead";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 28 } },
};

const CATEGORIES = [
  { icon: "🏏", label: "IPL Teams", desc: "MI, CSK, RCB, KKR, DC, SRH, RR, PBKS, GT, LSG" },
  { icon: "🌍", label: "Countries", desc: "India, Australia, England, Pakistan, SA, NZ, WI, SL" },
  { icon: "⚡", label: "Player Roles", desc: "Batsman, Fast Bowler, Spin Bowler, All-Rounder, WK" },
  { icon: "📊", label: "Career Stats", desc: "10,000+ runs, 300+ wickets, 5,000+ ODI runs, 50+ Tests" },
  { icon: "🏆", label: "Trophies", desc: "IPL, Cricket World Cup, T20 World Cup, Champions Trophy" },
  { icon: "👥", label: "Teammates", desc: "Players who shared a team (IPL or international)" },
];

const FAQ = [
  {
    q: "Is this cricket quiz free to play?",
    a: "Yes! Cricket Bingo is 100% free. Play as a guest instantly or sign in with Google to save your stats and streaks.",
  },
  {
    q: "What cricket quiz questions does this game have?",
    a: "Instead of typed answers, you match real player cards to categories — IPL teams, countries, roles (batsman/bowler/all-rounder), career stats (10,000+ runs), and trophies (World Cup, IPL). 42 categories total.",
  },
  {
    q: "How many cricket players are in the quiz?",
    a: "3,600+ real players from Tests, ODIs, T20Is, and the IPL. Sourced from Cricsheet open data (CC-BY-4.0).",
  },
  {
    q: "Can I play on mobile?",
    a: "Yes! Cricket Bingo works on any device — mobile, tablet, or desktop. No app download needed.",
  },
  {
    q: "Is there a new quiz every day?",
    a: "Yes! A new puzzle drops at midnight every day. Same grid for all players — your cricket GK determines your rank.",
  },
];

const CRICKET_QUIZ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function CricketQuiz() {
  const navigate = useNavigate();
  const { playAsGuest } = useAuth();

  useSeoHead({
    title: "Cricket Quiz — Free Online Cricket GK Questions & Answers | Cricket Bingo",
    description:
      "Play the best free online cricket quiz! Test your cricket general knowledge with 3,600+ real player cards. Match players to 42 categories — IPL teams, stats, trophies, roles & countries. New puzzle every day.",
    canonical: "https://cricket-bingo.in/cricket-quiz",
    ogTitle: "Cricket Quiz — Free Online Cricket GK Questions | Cricket Bingo",
    ogDescription:
      "The best free cricket quiz online! 3,600+ real player cards, 42 cricket GK categories — IPL teams, stats, trophies & more. New puzzle every day. No download needed.",
    jsonLd: CRICKET_QUIZ_JSON_LD,
  });

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
          <div className="text-5xl mb-4">🎯</div>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold uppercase tracking-[0.12em] text-secondary mb-4">
            Cricket Quiz
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-3">
            The best <span className="text-primary font-semibold">free online cricket quiz</span> — test your cricket general knowledge with 3,600+ real player cards. New puzzle every day, works on any device!
          </p>
          <p className="text-muted-foreground/70 text-sm mb-8">
            Free to play · No download · Sign in to track your streak
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0,255,65,0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePlay}
              className="px-8 py-3.5 rounded-xl text-gray-900 font-bold text-base uppercase tracking-wider shadow-lg"
              style={{ background: "linear-gradient(135deg, #00ff41 0%, #00ff88 100%)" }}
            >
              Play Cricket Quiz Free
            </motion.button>
            <button
              onClick={handleGuest}
              className="px-8 py-3.5 rounded-xl border border-border/50 text-secondary font-medium text-sm uppercase tracking-wider hover:bg-secondary/5 transition-all"
            >
              🎮 Play as Guest
            </button>
          </div>
        </motion.div>

        {/* What makes it different */}
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl font-extrabold uppercase tracking-wider text-secondary text-center mb-4"
          >
            Not Your Typical Cricket Quiz
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-muted-foreground text-sm text-center max-w-xl mx-auto mb-10"
          >
            Most cricket quizzes give you MCQ questions. Cricket Bingo is different — you get a real player card and must match them to a live bingo grid. Your cricket GK is tested in real-time against a ticking clock.
          </motion.p>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          >
            {[
              { icon: "⚡", title: "Timed Rounds", desc: "10 seconds per player card. Race against the clock." },
              { icon: "📅", title: "Daily Puzzle", desc: "Same grid for all players every day. Compare globally." },
              { icon: "🏆", title: "Leaderboard", desc: "Compete with players worldwide. Climb the ranks." },
              { icon: "🔥", title: "Streaks", desc: "Play daily to build your longest streak." },
              { icon: "🃏", title: "3,600+ Players", desc: "Real cricketers from Tests, ODIs, T20Is & IPL." },
              { icon: "📱", title: "Play Anywhere", desc: "Mobile, tablet, desktop — no app needed." },
            ].map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="glass-card rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">{f.icon}</div>
                <h3 className="font-display text-xs font-bold text-secondary uppercase tracking-wider mb-1">{f.title}</h3>
                <p className="text-muted-foreground text-xs">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Categories */}
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl font-extrabold uppercase tracking-wider text-secondary text-center mb-8"
          >
            42 Cricket Quiz Categories
          </motion.h2>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto"
          >
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.label} variants={fadeUp} className="glass-card rounded-xl p-4 flex gap-4 items-start">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h3 className="font-display text-sm font-bold text-secondary uppercase tracking-wider mb-1">{cat.label}</h3>
                  <p className="text-muted-foreground text-xs">{cat.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl font-extrabold uppercase tracking-wider text-secondary text-center mb-8"
          >
            Cricket Quiz FAQ
          </motion.h2>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-3 max-w-2xl mx-auto"
          >
            {FAQ.map((item, i) => (
              <motion.article key={i} variants={fadeUp} className="glass-card rounded-xl p-5">
                <h3 className="font-display text-sm font-bold text-secondary uppercase tracking-wider mb-2">{item.q}</h3>
                <p className="text-muted-foreground text-sm">{item.a}</p>
              </motion.article>
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
            Start Today's Cricket Quiz
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            A new cricket quiz puzzle every day. Sign in to save your streak, or just play as a guest — it's free!
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
            <a
              href="/"
              className="px-8 py-3 rounded-xl border border-border/50 text-muted-foreground text-sm hover:text-secondary transition-colors inline-flex items-center justify-center"
            >
              Learn More
            </a>
          </div>
        </motion.div>

        {/* Footer nav — anchor tags so Google can crawl these links */}
        <nav className="text-center mt-8 text-xs text-muted-foreground/50 space-x-4">
          <a href="/" className="hover:text-secondary transition-colors">Home</a>
          <a href="/ipl-quiz" className="hover:text-secondary transition-colors">IPL Quiz</a>
          <a href="/cricket-wordle" className="hover:text-secondary transition-colors">Cricket Wordle</a>
        </nav>
      </div>
    </div>
  );
}
