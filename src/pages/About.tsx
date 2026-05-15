import { Link } from "react-router-dom";
import { useSeoHead } from "@/lib/useSeoHead";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function About() {
  useSeoHead({
    title: "About Cricket Bingo â€” Free Online Cricket Quiz Game",
    description:
      "Cricket Bingo is a free daily cricket quiz game with 3,600+ real player cards. Learn about our mission, features, data sources, and how we built the ultimate cricket knowledge challenge.",
    canonical: "https://cricket-bingo.in/about",
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
          <span className="text-muted-foreground font-body">About</span>
        </nav>

        <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-4">
          About Cricket Bingo
        </h1>
        <p className="text-muted-foreground font-body text-lg leading-relaxed mb-10">
          The free online cricket quiz game that tests how well you truly know the game of cricket.
        </p>

        {/* What is Cricket Bingo */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-foreground mb-4">What is Cricket Bingo?</h2>
          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-3">
            Cricket Bingo is a daily cricket knowledge challenge where you match real cricket player
            cards to categories on a bingo grid. With over 3,600 player cards spanning international
            cricket and the Indian Premier League, it's one of the most comprehensive cricket quiz
            games available online.
          </p>
          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-3">
            Every day at midnight, a new puzzle is generated using a deterministic algorithm. This
            means every player around the world gets the exact same grid and deck of player cards,
            making the daily leaderboard completely fair. Your cricket knowledge is the only
            advantage.
          </p>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            The game is completely free to play, works in any modern web browser on mobile, tablet,
            or desktop, and requires no download or installation. You can play as a guest instantly,
            or sign in with Google to save your progress, track your streaks, and compete on the
            global leaderboard.
          </p>
        </section>

        {/* Our Mission */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-foreground mb-4">Our Mission</h2>
          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-3">
            Cricket is more than just a sport â€” it's a passion shared by billions of fans worldwide.
            We built Cricket Bingo to give cricket fans a fun, daily way to test and expand their
            knowledge of the game they love.
          </p>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            Whether you're a casual fan who follows IPL or a cricket encyclopedia who knows every
            Test player's batting average, Cricket Bingo has something for you. The game rewards
            deep knowledge â€” knowing which players have played for which IPL teams across seasons,
            understanding career statistics, and recognizing trophy-winning squads all give you
            an edge.
          </p>
        </section>

        {/* The Numbers */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-foreground mb-4">Cricket Bingo by the Numbers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: "3,600+", label: "Player Cards" },
              { value: "42", label: "Category Types" },
              { value: "10", label: "IPL Teams" },
              { value: "10+", label: "Countries" },
              { value: "4", label: "Game Modes" },
              { value: "5", label: "Player Roles" },
              { value: "6", label: "Trophy Types" },
              { value: "365", label: "Daily Puzzles/Year" },
            ].map((stat) => (
              <div key={stat.label} className="candy-card p-4 text-center">
                <div className="font-display text-2xl text-candy-green mb-1">{stat.value}</div>
                <div className="font-body font-bold text-[10px] text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Game Modes */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-foreground mb-4">Four Ways to Play</h2>
          <div className="space-y-3">
            <div className="candy-card p-5">
              <h3 className="font-display text-lg text-foreground mb-2">Daily Bingo (Classic Mode)</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                The core experience. A new 3x3 or 4x4 grid every day with 40 player cards in the
                deck. Match players to categories like IPL teams, countries, career stats, trophies,
                player roles, teammates, and combo categories. Complete a row, column, or diagonal
                to get BINGO. Build streaks for score multipliers up to 3x.
              </p>
            </div>
            <div className="candy-card p-5">
              <h3 className="font-display text-lg text-foreground mb-2">Guess the Cricketer</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                A mystery player is hidden behind 5 progressive clues. Each clue reveals more about
                the player â€” their role, teams, stats, and achievements. The fewer clues you need to
                guess correctly, the more points you earn. A true test of cricket trivia depth.
              </p>
            </div>
            <div className="candy-card p-5">
              <h3 className="font-display text-lg text-foreground mb-2">Battle Mode</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                Challenge your friends to a head-to-head cricket quiz. Create a room, share the code,
                and compete on the same grid in real-time. Both players get the same cards in the same
                order â€” the one with better cricket knowledge wins. You can also practice against
                an AI bot opponent.
              </p>
            </div>
            <div className="candy-card p-5">
              <h3 className="font-display text-lg text-foreground mb-2">Paid Battle</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                For competitive players. Stake your in-game coins against an opponent in a high-stakes
                cricket quiz battle. The winner takes the pot. Earn coins through gameplay or purchase
                them. Designed for cricket quiz champions who want to prove they're the best.
              </p>
            </div>
          </div>
        </section>

        {/* Data Sources */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-foreground mb-4">Our Data</h2>
          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-3">
            Cricket Bingo's player database is built from{" "}
            <a href="https://cricsheet.org" target="_blank" rel="noopener noreferrer"
              className="text-candy-green hover:underline">Cricsheet</a>,
            an open-source cricket data project licensed under CC-BY-4.0. This ensures
            our player cards reflect real, verified cricket data.
          </p>
          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-3">
            Each player card includes data from international cricket (Tests, ODIs, T20Is)
            and the Indian Premier League. Player stats, team histories, and career records are
            regularly updated to keep the game accurate and current.
          </p>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            Our database covers players from all major cricket-playing nations including India,
            Australia, England, South Africa, New Zealand, Pakistan, Sri Lanka, West Indies,
            Bangladesh, and Afghanistan â€” plus associate nations that have appeared in ICC events.
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-foreground mb-4">How the Daily Puzzle Works</h2>
          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-3">
            Every day at midnight (IST), a new puzzle is automatically generated using a seeded
            random number generator. The seed is derived from the date, which means:
          </p>
          <ul className="text-muted-foreground font-body text-sm leading-relaxed space-y-2 ml-4 mb-3">
            <li><strong>Same puzzle for everyone:</strong> All players worldwide see the exact same grid and get the same deck of cards in the same order.</li>
            <li><strong>Fair leaderboard:</strong> Since everyone faces the same challenge, leaderboard rankings reflect pure cricket knowledge.</li>
            <li><strong>Guaranteed solvable:</strong> Before any grid goes live, our algorithm verifies that it can be completed â€” you'll never face an impossible puzzle.</li>
            <li><strong>Balanced difficulty:</strong> Each cell is guaranteed to have at least 5 matching players in the deck, so you always have a fair chance.</li>
          </ul>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            After completing the daily puzzle, you can retry with a randomly generated grid
            for unlimited practice games. Practice mode uses the same rules but doesn't count
            toward the daily leaderboard.
          </p>
        </section>

        {/* Technology */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-foreground mb-4">Built with Modern Technology</h2>
          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-3">
            Cricket Bingo is a progressive web app built with React, TypeScript, and modern web
            technologies. It works offline-capable, loads fast even on slow connections, and
            provides a native-app-like experience in your browser.
          </p>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            Real-time features like the leaderboard and battle mode are powered by Firebase,
            ensuring instant updates without page refreshes. The game is hosted on Vercel's
            global edge network for fast load times worldwide.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="font-display text-2xl text-foreground mb-4">Start Playing Today</h2>
          <p className="text-muted-foreground font-body text-sm mb-6">
            Join thousands of cricket fans testing their knowledge every day. Free, no download, play instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/play" className="candy-btn candy-btn-green text-lg px-10 py-4 inline-block">
              Play Now â€” Free
            </Link>
            <Link to="/how-to-play" className="px-8 py-3.5 rounded-xl border border-border text-foreground font-body font-bold text-sm bg-card hover:border-gray-400 transition-all inline-block">
              Learn How to Play
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t-2 border-border pt-6 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mb-3">
            <Link to="/" className="hover:text-candy-green transition-colors font-body font-bold">Home</Link>
            <Link to="/how-to-play" className="hover:text-candy-green transition-colors font-body font-bold">How to Play</Link>
            <Link to="/players" className="hover:text-candy-green transition-colors font-body font-bold">Players</Link>
            <Link to="/leaderboard" className="hover:text-candy-green transition-colors font-body font-bold">Leaderboard</Link>
            <Link to="/privacy" className="hover:text-candy-green transition-colors font-body font-bold">Privacy</Link>
            <Link to="/terms" className="hover:text-candy-green transition-colors font-body font-bold">Terms</Link>
          </div>
          <p className="text-muted-foreground font-body text-xs">
            Cricket Bingo &copy; 2025 &middot; Free online cricket quiz game &middot; Data from{" "}
            <a href="https://cricsheet.org" target="_blank" rel="noopener noreferrer"
              className="text-candy-green hover:text-candy-green/80 transition-colors">Cricsheet</a>{" "}
            (CC-BY-4.0)
          </p>
        </footer>
      </div>
    </div>
  );
}
