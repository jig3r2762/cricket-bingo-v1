import { Link } from "react-router-dom";

const popularCategories = [
  { icon: "🏏", label: "IPL Teams", desc: "MI, CSK, RCB, KKR, DC, SRH, RR, PBKS, GT, LSG" },
  { icon: "🌍", label: "Countries", desc: "India, Australia, England, Pakistan, South Africa" },
  { icon: "📊", label: "Career Stats", desc: "10K+ runs, 300+ wickets, 50+ Tests" },
  { icon: "🏆", label: "Trophies", desc: "IPL, World Cup, T20 WC, Champions Trophy" },
];

const quickLinks = [
  { to: "/play", label: "Play Cricket Bingo", icon: "🎯" },
  { to: "/guess", label: "Guess the Cricketer", icon: "🕵️" },
  { to: "/leaderboard", label: "View Leaderboard", icon: "🏅" },
  { to: "/how-to-play", label: "How to Play", icon: "📖" },
  { to: "/players", label: "Player Database", icon: "🏏" },
  { to: "/about", label: "About Cricket Bingo", icon: "ℹ️" },
];

const NotFound = () => {
  return (
    <div className="min-h-screen warm-bg">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-4">🏏</div>
          <h1 className="font-display text-5xl text-foreground mb-2">404</h1>
          <h2 className="font-display text-2xl text-foreground/80 mb-4">
            Oops! That Page Was Bowled Out
          </h2>
          <p className="text-muted-foreground font-body text-base max-w-md mx-auto leading-relaxed">
            The page you're looking for doesn't exist or may have been moved.
            But don't worry — there's plenty of cricket action waiting for you!
          </p>
        </div>

        {/* Quick Links */}
        <section className="mb-12">
          <h3 className="font-display text-xl text-foreground text-center mb-6">
            Where Would You Like to Go?
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="candy-card p-4 text-center hover:border-candy-green transition-all group"
              >
                <div className="text-2xl mb-2">{link.icon}</div>
                <span className="font-display text-sm text-foreground group-hover:text-candy-green transition-colors">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Cricket Categories Info */}
        <section className="mb-12">
          <h3 className="font-display text-xl text-foreground text-center mb-2">
            Explore Cricket Bingo Categories
          </h3>
          <p className="text-muted-foreground font-body text-sm text-center mb-6">
            Cricket Bingo tests your knowledge across 42 categories with 3,600+ real player cards
          </p>
          <div className="grid grid-cols-2 gap-3">
            {popularCategories.map((cat) => (
              <div key={cat.label} className="candy-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{cat.icon}</span>
                  <h4 className="font-display text-sm text-foreground">{cat.label}</h4>
                </div>
                <p className="text-muted-foreground font-body text-xs leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SEO-friendly text content */}
        <section className="candy-card p-6 mb-8">
          <h3 className="font-display text-lg text-foreground mb-3">
            About Cricket Bingo — Free Online Cricket Quiz Game
          </h3>
          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-3">
            Cricket Bingo is a free online cricket game where you match real cricket player cards to
            categories on a bingo grid. With over 3,600 player cards from international cricket
            (Tests, ODIs, T20Is) and the Indian Premier League (IPL), every game is a unique
            cricket knowledge challenge.
          </p>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            A new daily puzzle is available every day at midnight. Place players based on their teams,
            roles, career stats, trophies, and country. Fill a row, column, or diagonal to get BINGO!
            Play for free on any device — no download required.
          </p>
        </section>

        {/* Back to home CTA */}
        <div className="text-center">
          <Link
            to="/"
            className="candy-btn candy-btn-green text-base px-8 py-3 inline-block"
          >
            Back to Cricket Bingo
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
