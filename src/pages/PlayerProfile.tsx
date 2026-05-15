import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useSeoHead } from "@/lib/useSeoHead";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { CricketPlayer } from "@/types/game";

const TROPHY_NAMES: Record<string, string> = {
  IPL: "IPL Champion",
  CWC: "ICC Cricket World Cup",
  T20WC: "ICC T20 World Cup",
  CT: "ICC Champions Trophy",
  WTC: "ICC World Test Championship",
};

const TROPHY_COLORS: Record<string, string> = {
  IPL: "bg-candy-blue/20 text-candy-blue border-candy-blue/20",
  CWC: "bg-candy-green/20 text-candy-green border-candy-green/20",
  T20WC: "bg-candy-purple/20 text-candy-purple border-candy-purple/20",
  CT: "bg-candy-orange/20 text-candy-orange border-candy-orange/20",
  WTC: "bg-candy-red/20 text-candy-red border-candy-red/20",
};

const ROLE_COLORS: Record<string, string> = {
  Batsman: "bg-candy-blue",
  "WK-Bat": "bg-candy-purple",
  "Fast Bowler": "bg-candy-red",
  "Spin Bowler": "bg-candy-orange",
  "All-Rounder": "bg-candy-green",
};

const ROLE_DISPLAY: Record<string, string> = {
  "WK-Bat": "Wicket-Keeper Batsman",
  Batsman: "Batsman",
  "Fast Bowler": "Fast Bowler",
  "Spin Bowler": "Spin Bowler",
  "All-Rounder": "All-Rounder",
};

function joinList(items: string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function generateBio(p: CricketPlayer): string {
  const { name, country, primaryRole, stats, trophies, iplTeams } = p;
  const role = (ROLE_DISPLAY[primaryRole] || primaryRole).toLowerCase();
  const parts: string[] = [];

  const formats: string[] = [];
  if (stats.testMatches > 0) formats.push(`${stats.testMatches} Test matches`);
  if (stats.odiMatches > 0) formats.push(`${stats.odiMatches} ODIs`);
  if (stats.t20iMatches > 0) formats.push(`${stats.t20iMatches} T20 Internationals`);

  if (formats.length > 0) {
    parts.push(
      `${name} is a ${country} ${role} who has played ${joinList(formats)} for the ${country} national cricket team.`
    );
  } else if (iplTeams?.length) {
    parts.push(`${name} is a ${country} ${role} who has featured in the Indian Premier League.`);
  } else {
    parts.push(`${name} is a ${country} ${role}.`);
  }

  if (stats.totalRuns >= 1000) {
    let s = `${name} has scored ${stats.totalRuns.toLocaleString()} career runs across all formats`;
    if (stats.centuries > 0) s += `, including ${stats.centuries} centuries`;
    parts.push(s + ".");
  } else if (stats.totalRuns > 0) {
    parts.push(`${name} has scored ${stats.totalRuns.toLocaleString()} career runs.`);
  }

  if (stats.totalWickets >= 50) {
    parts.push(
      `${name} has taken ${stats.totalWickets} career wickets, making significant contributions with the ball.`
    );
  } else if (stats.totalWickets > 0 && (primaryRole === "All-Rounder" || primaryRole.includes("Bowler"))) {
    parts.push(`${name} has taken ${stats.totalWickets} career wickets.`);
  }

  if (iplTeams?.length) {
    const teamStr =
      iplTeams.length === 1
        ? `represented ${iplTeams[0]}`
        : `represented ${joinList(iplTeams)}`;
    if (stats.iplMatches > 0) {
      let s = `In the Indian Premier League, ${name} has ${teamStr} in ${stats.iplMatches} matches`;
      if (stats.iplRuns > 0) s += `, scoring ${stats.iplRuns.toLocaleString()} runs`;
      if (stats.iplWickets > 0) s += ` and taking ${stats.iplWickets} wickets`;
      parts.push(s + ".");
    } else {
      parts.push(`In the Indian Premier League, ${name} has ${teamStr}.`);
    }
  }

  if (trophies?.length) {
    const trophyList = trophies.map((t) => TROPHY_NAMES[t] || t);
    parts.push(`${name} is a winner of the ${joinList(trophyList)}.`);
  }

  return parts.join(" ");
}

function StatRow({ label, matches, runs, wickets }: {
  label: string;
  matches: number;
  runs: number;
  wickets: number;
}) {
  if (matches === 0) return null;
  return (
    <tr className="border-b border-border/20">
      <td className="p-3 font-body font-bold text-foreground">{label}</td>
      <td className="p-3 text-center font-body text-muted-foreground">{matches}</td>
      <td className="p-3 text-center font-body text-foreground">{runs.toLocaleString()}</td>
      <td className="p-3 text-center font-body text-foreground">{wickets}</td>
    </tr>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen warm-bg">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-3xl mx-auto px-4 py-12">{children}</div>
    </div>
  );
}

function ProfileContent({ player, id }: { player: CricketPlayer; id: string }) {
  const bio = generateBio(player);
  const roleDisplay = ROLE_DISPLAY[player.primaryRole] || player.primaryRole;
  const hasStats =
    player.stats.testMatches > 0 ||
    player.stats.odiMatches > 0 ||
    player.stats.t20iMatches > 0 ||
    player.stats.iplMatches > 0;

  useSeoHead({
    title: `${player.name} â€” Cricket Stats & Profile | Cricket Bingo`,
    description: bio.slice(0, 155),
    canonical: `https://cricket-bingo.in/players/${id}`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: player.name,
      nationality: player.country,
      description: bio,
      url: `https://cricket-bingo.in/players/${player.id}`,
    },
  });

  return (
    <Shell>
      <nav className="mb-8 text-sm">
        <Link to="/" className="text-candy-green hover:underline font-body font-bold">Home</Link>
        <span className="text-muted-foreground mx-2">/</span>
        <Link to="/players" className="text-candy-green hover:underline font-body font-bold">Players</Link>
        <span className="text-muted-foreground mx-2">/</span>
        <span className="text-muted-foreground font-body">{player.name}</span>
      </nav>

      <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-3">
        {player.name}
      </h1>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="font-body text-muted-foreground text-sm">
          {player.countryFlag} {player.country}
        </span>
        <span className="text-muted-foreground/40">Â·</span>
        <span
          className={`inline-block px-3 py-1 rounded-full text-white font-body font-bold text-xs ${ROLE_COLORS[player.primaryRole] ?? "bg-gray-400"}`}
        >
          {roleDisplay}
        </span>
      </div>

      {/* Quick highlights */}
      <div className="flex flex-wrap gap-3 mb-8">
        {player.stats.totalRuns > 0 && (
          <div className="candy-card px-4 py-3 text-center min-w-[80px]">
            <div className="font-display text-xl text-candy-green">{player.stats.totalRuns.toLocaleString()}</div>
            <div className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">Career Runs</div>
          </div>
        )}
        {player.stats.totalWickets > 0 && (
          <div className="candy-card px-4 py-3 text-center min-w-[80px]">
            <div className="font-display text-xl text-candy-orange">{player.stats.totalWickets}</div>
            <div className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">Wickets</div>
          </div>
        )}
        {player.stats.centuries > 0 && (
          <div className="candy-card px-4 py-3 text-center min-w-[80px]">
            <div className="font-display text-xl text-candy-blue">{player.stats.centuries}</div>
            <div className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">Centuries</div>
          </div>
        )}
        {(player.trophies?.length ?? 0) > 0 && (
          <div className="candy-card px-4 py-3 text-center min-w-[80px]">
            <div className="font-display text-xl text-candy-yellow">{player.trophies.length}</div>
            <div className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">Trophies</div>
          </div>
        )}
      </div>

      {/* Bio */}
      <section className="mb-8">
        <h2 className="font-display text-xl text-foreground mb-3">About {player.name}</h2>
        <p className="text-muted-foreground font-body text-sm leading-relaxed">{bio}</p>
      </section>

      {/* Career stats */}
      {hasStats && (
        <section className="mb-8">
          <h2 className="font-display text-2xl text-foreground mb-4">Career Statistics</h2>
          <div className="candy-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left p-3 font-display text-foreground">Format</th>
                  <th className="text-center p-3 font-display text-foreground">Matches</th>
                  <th className="text-center p-3 font-display text-foreground">Runs</th>
                  <th className="text-center p-3 font-display text-foreground">Wickets</th>
                </tr>
              </thead>
              <tbody>
                <StatRow label="Tests" matches={player.stats.testMatches} runs={player.stats.testRuns} wickets={player.stats.testWickets} />
                <StatRow label="ODIs" matches={player.stats.odiMatches} runs={player.stats.odiRuns} wickets={player.stats.odiWickets} />
                <StatRow label="T20 Internationals" matches={player.stats.t20iMatches} runs={player.stats.t20iRuns} wickets={player.stats.t20iWickets} />
                <StatRow label="IPL" matches={player.stats.iplMatches} runs={player.stats.iplRuns} wickets={player.stats.iplWickets} />
                {(player.stats.totalRuns > 0 || player.stats.totalWickets > 0) && (
                  <tr className="bg-candy-green/5">
                    <td className="p-3 font-body font-bold text-foreground">Career Total</td>
                    <td className="p-3 text-center font-body text-muted-foreground">â€”</td>
                    <td className="p-3 text-center font-display text-candy-green">{player.stats.totalRuns.toLocaleString()}</td>
                    <td className="p-3 text-center font-display text-candy-green">{player.stats.totalWickets}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* IPL teams */}
      {(player.iplTeams?.length ?? 0) > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-2xl text-foreground mb-4">IPL Teams</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {player.iplTeams.map((team) => (
              <span key={team} className="px-4 py-2 rounded-xl border-2 border-border/40 font-body font-bold text-sm text-foreground bg-background">
                {team}
              </span>
            ))}
          </div>
          <p className="text-muted-foreground font-body text-xs">
            {player.name} has represented {joinList(player.iplTeams)} in the Indian Premier League.
          </p>
        </section>
      )}

      {/* Trophies */}
      {(player.trophies?.length ?? 0) > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-2xl text-foreground mb-4">International Trophies</h2>
          <div className="flex flex-wrap gap-2">
            {player.trophies.map((t) => (
              <span key={t} className={`px-4 py-2 rounded-xl font-body font-bold text-sm border ${TROPHY_COLORS[t] ?? "bg-candy-yellow/20 text-candy-yellow border-candy-yellow/20"}`}>
                {TROPHY_NAMES[t] ?? t}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Achievement categories */}
      {(player.categories?.length ?? 0) > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-2xl text-foreground mb-4">Achievement Categories</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {player.categories!.map((cat) => (
              <span key={cat} className="px-3 py-1.5 rounded-lg bg-candy-purple/10 text-candy-purple font-body font-bold text-xs border border-candy-purple/20">
                {cat}
              </span>
            ))}
          </div>
          <p className="text-muted-foreground font-body text-xs">
            These special achievement categories appear as grid cells in Cricket Bingo.
          </p>
        </section>
      )}

      {/* Cricket Bingo CTA */}
      <section className="candy-card p-6 mb-8">
        <h2 className="font-display text-xl text-foreground mb-3">
          Play {player.name} in Cricket Bingo
        </h2>
        <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
          {player.name} appears as a player card in the daily Cricket Bingo puzzle. Place this
          card on grid cells matching {player.country}
          {(player.iplTeams?.length ?? 0) > 0 ? `, ${joinList(player.iplTeams)}` : ""},{" "}
          {roleDisplay}
          {(player.trophies?.length ?? 0) > 0 ? `, or trophy categories` : ""} to score points
          and complete a bingo line.
        </p>
        <Link to="/play" className="candy-btn candy-btn-green inline-block">
          Play Cricket Bingo â€” Free
        </Link>
      </section>

      <footer className="border-t-2 border-border pt-6 text-center">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mb-3">
          <Link to="/" className="hover:text-candy-green transition-colors font-body font-bold">Home</Link>
          <Link to="/players" className="hover:text-candy-green transition-colors font-body font-bold">All Players</Link>
          <Link to="/how-to-play" className="hover:text-candy-green transition-colors font-body font-bold">How to Play</Link>
          <Link to="/privacy" className="hover:text-candy-green transition-colors font-body font-bold">Privacy</Link>
          <Link to="/terms" className="hover:text-candy-green transition-colors font-body font-bold">Terms</Link>
        </div>
        <p className="text-muted-foreground font-body text-xs">
          Cricket Bingo &copy; 2025 &middot; Player data from{" "}
          <a href="https://cricsheet.org" target="_blank" rel="noopener noreferrer" className="text-candy-green hover:text-candy-green/80 transition-colors">
            Cricsheet
          </a>{" "}
          (CC-BY-4.0)
        </p>
      </footer>
    </Shell>
  );
}

export default function PlayerProfile() {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<CricketPlayer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setPlayer(null);
    fetch(`${import.meta.env.BASE_URL}players.json`)
      .then((res) => res.json())
      .then((data: CricketPlayer[]) => {
        setPlayer(data.find((p) => p.id === id) ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Shell>
        <div className="text-center py-24">
          <div className="text-muted-foreground font-display text-sm uppercase tracking-widest animate-pulse">
            Loading...
          </div>
        </div>
      </Shell>
    );
  }

  if (!player) {
    return (
      <Shell>
        <nav className="mb-8 text-sm">
          <Link to="/" className="text-candy-green hover:underline font-body font-bold">Home</Link>
          <span className="text-muted-foreground mx-2">/</span>
          <Link to="/players" className="text-candy-green hover:underline font-body font-bold">Players</Link>
        </nav>
        <h1 className="font-display text-3xl text-foreground mb-4">Player Not Found</h1>
        <p className="text-muted-foreground font-body mb-6">
          We couldn&apos;t find a player with that ID. Browse the full player database below.
        </p>
        <Link to="/players" className="candy-btn candy-btn-green inline-block">
          Browse All Players
        </Link>
      </Shell>
    );
  }

  return <ProfileContent player={player} id={id!} />;
}
