import { Link } from "react-router-dom";
import { useSeoHead } from "@/lib/useSeoHead";
import { ThemeToggle } from "@/components/ThemeToggle";

const scoringTable = [
  { type: "Country / Team", base: 100, streak2: 200, streak4: 300 },
  { type: "Role / Stat", base: 100, streak2: 200, streak4: 300 },
  { type: "Trophy", base: 120, streak2: 240, streak4: 360 },
  { type: "Teammate", base: 130, streak2: 260, streak4: 390 },
  { type: "Combo (e.g. MI + India)", base: 150, streak2: 300, streak4: 450 },
  { type: "Wildcard", base: 50, streak2: 50, streak4: 50 },
  { type: "Bingo Bonus", base: 500, streak2: 500, streak4: 500 },
];

export default function HowToPlay() {
  useSeoHead({
    title: "How to Play Cricket Bingo — Rules, Scoring & Strategy Guide",
    description:
      "Learn how to play Cricket Bingo, the free online cricket quiz game. Complete rules, scoring system, strategy tips, and everything you need to master the game.",
    canonical: "https://cricket-bingo.in/how-to-play",
  });

  return (
    <div className="min-h-screen warm-bg">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link to="/" className="text-candy-green hover:underline font-body font-bold">Home</Link>
          <span className="text-muted-foreground mx-2">/</span>
          <span className="text-muted-foreground font-body">How to Play</span>
        </nav>

        <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-4">
          How to Play Cricket Bingo
        </h1>
        <p className="text-muted-foreground font-body text-lg leading-relaxed mb-10">
          Cricket Bingo is a free daily cricket quiz game that tests your knowledge of cricket
          players, teams, and statistics. Here's everything you need to know to start playing
          and climbing the leaderboard.
        </p>

        {/* What is Cricket Bingo */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-foreground mb-4">What is Cricket Bingo?</h2>
          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-3">
            Cricket Bingo combines the classic game of bingo with cricket trivia. You're presented
            with a grid (3x3 or 4x4) where each cell represents a cricket category — like an
            IPL team, a country, a player role, a statistical milestone, or a trophy.
          </p>
          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-3">
            Each turn, a real cricket player card is drawn from a deck of 40 players. Your job is
            to place that player on a grid cell where they belong. For example, if Virat Kohli
            is drawn and the grid has cells for "RCB" and "India", you can place him on either.
          </p>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            The goal is to complete a full row, column, or diagonal — just like bingo. Every day
            at midnight, a new grid and deck are generated, ensuring a fresh challenge for everyone.
            Since the grid is seeded by date, all players worldwide get the same puzzle, making
            leaderboard rankings fair.
          </p>
        </section>

        {/* Step by Step */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-foreground mb-6">Step-by-Step Guide</h2>

          <div className="space-y-6">
            <div className="candy-card p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-candy-green flex items-center justify-center flex-shrink-0"
                  style={{ boxShadow: "0 3px 0 hsl(134 55% 30%)" }}>
                  <span className="font-display text-white text-lg">1</span>
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground mb-1">Choose Your Grid Size</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">
                    Pick a <strong>3x3 grid</strong> (9 cells, easier) or a <strong>4x4 grid</strong> (16 cells,
                    more challenging). The 3x3 grid gives you 20 turns while the 4x4 gives 25 turns.
                    Beginners should start with 3x3 to learn the categories.
                  </p>
                </div>
              </div>
            </div>

            <div className="candy-card p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-candy-orange flex items-center justify-center flex-shrink-0"
                  style={{ boxShadow: "0 3px 0 hsl(28 90% 38%)" }}>
                  <span className="font-display text-white text-lg">2</span>
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground mb-1">Read the Player Card</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">
                    Each turn reveals a cricket player with their name, country flag, and jersey number.
                    You need to decide which grid cell they match. The game highlights eligible cells
                    to help you — cells the player qualifies for glow cyan, while non-matching cells are dimmed.
                  </p>
                </div>
              </div>
            </div>

            <div className="candy-card p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-candy-blue flex items-center justify-center flex-shrink-0"
                  style={{ boxShadow: "0 3px 0 hsl(205 85% 38%)" }}>
                  <span className="font-display text-white text-lg">3</span>
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground mb-1">Place, Skip, or Use Wildcard</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed mb-2">
                    You have three options each turn:
                  </p>
                  <ul className="text-muted-foreground font-body text-sm leading-relaxed space-y-1 ml-4">
                    <li><strong>Place:</strong> Tap a grid cell to place the player there. If correct, the cell fills and you earn points. If wrong, you lose a turn and your streak resets.</li>
                    <li><strong>Skip:</strong> Discard the current player. Costs one turn and resets your streak.</li>
                    <li><strong>Wildcard:</strong> Place any player on any empty cell with no validation. You get one wildcard per game — save it for combo cells that are hard to fill.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="candy-card p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-candy-yellow flex items-center justify-center flex-shrink-0"
                  style={{ boxShadow: "0 3px 0 hsl(45 90% 38%)" }}>
                  <span className="font-display text-white text-lg">4</span>
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground mb-1">Complete a Line to Win</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">
                    Fill any complete row, column, or diagonal to get BINGO and win the game. A 3x3
                    grid has 8 possible winning lines (3 rows + 3 columns + 2 diagonals), while a 4x4
                    grid has 10 lines. You earn a 500-point bingo bonus when you complete a line.
                    If you run out of turns before completing a line, the game ends.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Types */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-foreground mb-4">Grid Category Types</h2>
          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-6">
            Each cell in the grid represents one of these category types. Understanding them is
            key to placing players correctly.
          </p>

          <div className="space-y-3">
            {[
              { icon: "🏏", name: "IPL Team", desc: "The player must have played for this IPL franchise at any point in their career. Past teams count — if someone played for MI in 2015, the MI cell still accepts them.", example: "MI, CSK, RCB, KKR, DC, SRH, RR, PBKS, GT, LSG" },
              { icon: "🌍", name: "Country", desc: "The player's international team. A player representing India in any format qualifies for the India cell.", example: "India, Australia, England, Pakistan, South Africa, New Zealand" },
              { icon: "⚾", name: "Player Role", desc: "The player's primary playing role. Wicket-keeper batsmen qualify for both 'WK' and 'Batsman' cells.", example: "Batsman, Fast Bowler, Spin Bowler, All-Rounder, Wicket-Keeper" },
              { icon: "📊", name: "Career Stats", desc: "Statistical milestones across the player's career. Stats are aggregated across all formats unless specified.", example: "10,000+ runs, 300+ wickets, 50+ Test matches, Century Maker" },
              { icon: "🏆", name: "Trophy", desc: "Tournaments the player has won. The player must have been part of the winning squad.", example: "IPL Winner, Cricket World Cup, T20 World Cup, Champions Trophy" },
              { icon: "🤝", name: "Teammate", desc: "The drawn player must have appeared in the same playing XI as the named player in an official match.", example: "Played with Dhoni, Played with Kohli, Played with Sachin" },
              { icon: "🔀", name: "Combo", desc: "Two criteria combined — both must be true simultaneously. These are the hardest cells to fill because fewer players qualify. Prioritize placing players here.", example: "MI + India, Australia + Fast Bowler, CSK + IPL Winner" },
            ].map((cat) => (
              <div key={cat.name} className="candy-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{cat.icon}</span>
                  <h3 className="font-display text-base text-foreground">{cat.name}</h3>
                </div>
                <p className="text-muted-foreground font-body text-sm leading-relaxed mb-1">{cat.desc}</p>
                <p className="text-muted-foreground/70 font-body text-xs"><em>Examples: {cat.example}</em></p>
              </div>
            ))}
          </div>
        </section>

        {/* Scoring */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-foreground mb-4">Scoring System</h2>
          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
            Points are calculated based on the cell type and your current streak of consecutive
            correct placements. Harder cells (combos, teammates) earn more base points.
            Building a streak multiplies your score significantly.
          </p>

          <div className="candy-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left p-3 font-display text-foreground">Category</th>
                  <th className="text-center p-3 font-display text-foreground">Base</th>
                  <th className="text-center p-3 font-display text-foreground">Streak 2 (2x)</th>
                  <th className="text-center p-3 font-display text-foreground">Streak 4+ (3x)</th>
                </tr>
              </thead>
              <tbody>
                {scoringTable.map((row) => (
                  <tr key={row.type} className="border-b border-border/20">
                    <td className="p-3 font-body text-muted-foreground">{row.type}</td>
                    <td className="p-3 text-center font-body text-foreground">{row.base}</td>
                    <td className="p-3 text-center font-body text-candy-orange">{row.streak2}</td>
                    <td className="p-3 text-center font-body text-candy-green">{row.streak4}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-muted-foreground font-body text-xs mt-3">
            Streak multiplier: 1x at streak 0, increasing by 0.5x per consecutive correct placement, capped at 3x.
          </p>
        </section>

        {/* Strategy Tips */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-foreground mb-4">Strategy Tips</h2>
          <div className="space-y-3">
            {[
              { title: "Prioritize combo cells", tip: "Combo cells (like 'MI + India') have the fewest eligible players. When a player matches both a combo and a single-category cell, always place them on the combo cell first." },
              { title: "Save your wildcard", tip: "Don't use your wildcard early. Save it for combo or teammate cells that are hard to fill naturally. A well-timed wildcard can turn a loss into a bingo." },
              { title: "Build streaks for big scores", tip: "Consecutive correct placements build your streak multiplier from 1x up to 3x. Even placing a player on an easy cell like 'India' is worth doing to maintain your streak for the next combo cell." },
              { title: "Think about IPL history", tip: "Many players have played for multiple IPL teams across seasons. A player who's currently at GT might have played for MI, RCB, or CSK in earlier seasons — all those teams count." },
              { title: "Don't guess blindly", tip: "Wrong placements cost you a turn AND reset your streak. If you're not sure a player matches a cell, it's often better to skip and save your turns for players you're confident about." },
              { title: "Watch the recommended cell", tip: "The game highlights the optimal cell for each player with a gold border. This is the hardest-to-fill cell the player matches — usually the best strategic choice." },
            ].map((item) => (
              <div key={item.title} className="candy-card p-4">
                <h3 className="font-display text-sm text-foreground mb-1">{item.title}</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">{item.tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Game Modes */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-foreground mb-4">Game Modes</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="candy-card p-5">
              <h3 className="font-display text-lg text-foreground mb-2">Daily Bingo</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                The classic mode. A new grid and deck every day at midnight. Same puzzle for everyone
                worldwide, so leaderboard rankings are fair. Choose 3x3 or 4x4 grid size.
              </p>
            </div>
            <div className="candy-card p-5">
              <h3 className="font-display text-lg text-foreground mb-2">Guess the Cricketer</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                A mystery player is hidden behind 5 progressive clues. Guess correctly with fewer
                clues for more points. Tests your deep cricket knowledge — can you name them from
                just their stats?
              </p>
            </div>
            <div className="candy-card p-5">
              <h3 className="font-display text-lg text-foreground mb-2">Battle Mode</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                Head-to-head competition! Create a room and invite a friend, or play against the bot.
                Same grid, same deck — the player who scores higher wins. Real-time gameplay.
              </p>
            </div>
            <div className="candy-card p-5">
              <h3 className="font-display text-lg text-foreground mb-2">Paid Battle</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                Competitive mode with entry fees and coin rewards. Stake your coins against an
                opponent — winner takes the pot. For serious cricket quiz champions.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="font-display text-2xl text-foreground mb-4">Ready to Test Your Cricket Knowledge?</h2>
          <p className="text-muted-foreground font-body text-sm mb-6">
            A new puzzle is waiting for you. 3,600+ player cards, 42 categories, zero cost.
          </p>
          <Link to="/play" className="candy-btn candy-btn-green text-lg px-10 py-4 inline-block">
            Play Now — Free
          </Link>
        </section>

        {/* Footer */}
        <footer className="border-t-2 border-gray-200 pt-6 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mb-3">
            <Link to="/" className="hover:text-candy-green transition-colors font-body font-bold">Home</Link>
            <Link to="/about" className="hover:text-candy-green transition-colors font-body font-bold">About</Link>
            <Link to="/players" className="hover:text-candy-green transition-colors font-body font-bold">Players</Link>
            <Link to="/leaderboard" className="hover:text-candy-green transition-colors font-body font-bold">Leaderboard</Link>
            <Link to="/privacy" className="hover:text-candy-green transition-colors font-body font-bold">Privacy</Link>
          </div>
          <p className="text-muted-foreground font-body text-xs">
            Cricket Bingo &copy; 2025 &middot; Free online cricket quiz game
          </p>
        </footer>
      </div>
    </div>
  );
}
