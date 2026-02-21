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

const IPL_TEAMS = [
  { abbr: "MI", name: "Mumbai Indians", color: "#004BA0" },
  { abbr: "CSK", name: "Chennai Super Kings", color: "#FDB913" },
  { abbr: "RCB", name: "Royal Challengers Bengaluru", color: "#EC1C24" },
  { abbr: "KKR", name: "Kolkata Knight Riders", color: "#3A225D" },
  { abbr: "DC", name: "Delhi Capitals", color: "#0078BC" },
  { abbr: "SRH", name: "Sunrisers Hyderabad", color: "#F7A721" },
  { abbr: "RR", name: "Rajasthan Royals", color: "#EA1A85" },
  { abbr: "PBKS", name: "Punjab Kings", color: "#ED1B24" },
  { abbr: "GT", name: "Gujarat Titans", color: "#1D2951" },
  { abbr: "LSG", name: "Lucknow Super Giants", color: "#A72B2A" },
];

const SAMPLE_QUESTIONS = [
  { q: "Which IPL team has MS Dhoni played his entire career with?", a: "Chennai Super Kings (CSK)" },
  { q: "Who is the all-time leading run scorer in IPL history?", a: "Virat Kohli (RCB)" },
  { q: "Which team won the inaugural IPL in 2008?", a: "Rajasthan Royals" },
  { q: "Which player has taken the most wickets in IPL history?", a: "Dwayne Bravo" },
  { q: "Which IPL franchise has won the title the most times?", a: "Mumbai Indians (5 titles)" },
];

const IPL_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the best free IPL quiz game online?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cricket Bingo is the best free IPL quiz game online. Match 3,600+ real IPL player cards to their teams — MI, CSK, RCB, KKR, DC, SRH, RR, PBKS, GT, LSG — on a live bingo grid. New puzzle every day at midnight. No download needed, play free at cricket-bingo.in.",
      },
    },
    {
      "@type": "Question",
      name: "How many IPL teams are in Cricket Bingo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cricket Bingo includes all 10 IPL teams: Mumbai Indians (MI), Chennai Super Kings (CSK), Royal Challengers Bengaluru (RCB), Kolkata Knight Riders (KKR), Delhi Capitals (DC), Sunrisers Hyderabad (SRH), Rajasthan Royals (RR), Punjab Kings (PBKS), Gujarat Titans (GT), and Lucknow Super Giants (LSG).",
      },
    },
    {
      "@type": "Question",
      name: "Is this IPL quiz free to play?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Cricket Bingo IPL Quiz is 100% free. Play instantly as a guest or sign in with Google to track your stats, daily streaks, and rank on the global leaderboard. No app download required — just open cricket-bingo.in in your browser.",
      },
    },
  ],
};

export default function IplQuiz() {
  const navigate = useNavigate();
  const { playAsGuest } = useAuth();

  useSeoHead({
    title: "IPL Quiz — Free IPL Cricket Quiz Questions | Cricket Bingo",
    description:
      "Test your IPL knowledge with the best free IPL quiz game! Match 3,600+ real player cards to IPL teams — MI, CSK, RCB, KKR, DC, SRH, RR, PBKS, GT, LSG. New puzzle every day at cricket-bingo.in.",
    canonical: "https://cricket-bingo.in/ipl-quiz",
    ogTitle: "IPL Quiz — Free IPL Cricket Quiz Game | Cricket Bingo",
    ogDescription:
      "The best free IPL quiz online! Match real IPL players to their teams on a bingo grid. All 10 IPL teams, 3,600+ player cards. Play free — no download.",
    jsonLd: IPL_JSON_LD,
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
          <div className="text-5xl mb-4">🏏</div>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold uppercase tracking-[0.12em] text-secondary mb-4">
            IPL Quiz
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-3">
            The <span className="text-primary font-semibold">ultimate free IPL quiz game</span> — test your IPL knowledge with 3,600+ real player cards. Match players to their IPL teams on a live bingo grid. New puzzle every day!
          </p>
          <p className="text-muted-foreground/70 text-sm mb-8">
            Free to play · No download · Works on mobile
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0,255,65,0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePlay}
              className="px-8 py-3.5 rounded-xl text-gray-900 font-bold text-base uppercase tracking-wider shadow-lg"
              style={{ background: "linear-gradient(135deg, #00ff41 0%, #00ff88 100%)" }}
            >
              Play IPL Quiz Free
            </motion.button>
            <button
              onClick={handleGuest}
              className="px-8 py-3.5 rounded-xl border border-border/50 text-secondary font-medium text-sm uppercase tracking-wider hover:bg-secondary/5 transition-all"
            >
              🎮 Play as Guest
            </button>
          </div>
        </motion.div>

        {/* IPL Teams Grid */}
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl font-extrabold uppercase tracking-wider text-secondary text-center mb-8"
          >
            All 10 IPL Teams — Know Every Player
          </motion.h2>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-5 gap-3"
          >
            {IPL_TEAMS.map((team) => (
              <motion.div
                key={team.abbr}
                variants={fadeUp}
                className="glass-card rounded-xl p-4 text-center border border-border/30"
                style={{ borderTop: `3px solid ${team.color}` }}
              >
                <div className="font-display text-xl font-extrabold text-secondary mb-1">{team.abbr}</div>
                <div className="text-[11px] text-muted-foreground leading-tight">{team.name}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* How it works */}
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl font-extrabold uppercase tracking-wider text-secondary text-center mb-8"
          >
            How This IPL Quiz Game Works
          </motion.h2>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-3 gap-6"
          >
            {[
              { icon: "🃏", title: "See a Player Card", desc: "A real IPL player appears — could be Virat Kohli, Jasprit Bumrah, MS Dhoni, or any of 3,600+ players." },
              { icon: "📍", title: "Match to the Grid", desc: "Place them in the right cell — which IPL team did they play for? Use your IPL knowledge to answer." },
              { icon: "🏆", title: "Complete a BINGO", desc: "Fill a row, column or diagonal of matching categories to win. Score points for every correct answer." },
            ].map((item) => (
              <motion.div key={item.title} variants={fadeUp} className="glass-card rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-display text-sm font-bold text-secondary uppercase tracking-wider mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Sample Questions */}
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl font-extrabold uppercase tracking-wider text-secondary text-center mb-8"
          >
            Sample IPL Quiz Questions
          </motion.h2>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-3 max-w-2xl mx-auto"
          >
            {SAMPLE_QUESTIONS.map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="glass-card rounded-xl p-4">
                <p className="text-secondary text-sm font-medium mb-1">Q: {item.q}</p>
                <p className="text-primary/80 text-sm">
                  <span className="text-muted-foreground">A:</span> {item.a}
                </p>
              </motion.div>
            ))}
          </motion.div>
          <p className="text-center text-muted-foreground/60 text-xs mt-4">
            In Cricket Bingo, you don't type answers — you match player cards to categories on the grid!
          </p>
        </section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-8 text-center"
        >
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-wider text-secondary mb-3">
            Ready to Play the IPL Quiz?
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            New IPL quiz puzzle every day. Sign in to track your streak and compete on the leaderboard — or play instantly as a guest.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePlay}
              className="px-8 py-3 rounded-xl text-gray-900 font-bold text-sm uppercase tracking-wider"
              style={{ background: "linear-gradient(135deg, #00ff41 0%, #00ff88 100%)" }}
            >
              Start IPL Quiz
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
          <a href="/cricket-quiz" className="hover:text-secondary transition-colors">Cricket Quiz</a>
          <a href="/cricket-wordle" className="hover:text-secondary transition-colors">Cricket Wordle</a>
        </nav>
      </div>
    </div>
  );
}
