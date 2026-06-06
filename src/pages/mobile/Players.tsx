import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSeoHead } from "@/lib/useSeoHead";
import { ThemeToggle } from "@/components/mobile/ThemeToggle";
import type { CricketPlayer } from "@/types/game";

type SortField = "name" | "totalRuns" | "totalWickets" | "centuries";
type SortDir = "asc" | "desc";

const ROLES = ["All", "Batsman", "WK-Bat", "Fast Bowler", "Spin Bowler", "All-Rounder"];
const COUNTRIES = ["All", "India", "Australia", "England", "South Africa", "Pakistan", "New Zealand", "Sri Lanka", "West Indies", "Bangladesh"];
const PAGE_SIZE = 50;

const roleBadgeColor: Record<string, string> = {
  Batsman: "bg-candy-blue",
  "WK-Bat": "bg-candy-purple",
  "Fast Bowler": "bg-candy-red",
  "Spin Bowler": "bg-candy-orange",
  "All-Rounder": "bg-candy-green",
};

const trophyLabels: Record<string, string> = {
  IPL: "IPL",
  CWC: "World Cup",
  T20WC: "T20 WC",
  CT: "Champions Trophy",
  WTC: "WTC",
};

export default function Players() {
  useSeoHead({
    title: "Cricket Player Database — 1,100+ Players | Cricket Bingo",
    description:
      "Browse 1,100+ real cricket player cards in Cricket Bingo. Search by name, filter by country, role, or IPL team. View career stats, trophies, and more for every player.",
    canonical: "https://cricket-bingo.in/players",
  });

  const [allPlayers, setAllPlayers] = useState<CricketPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}players.json`)
      .then((res) => res.json())
      .then((data: CricketPlayer[]) => { setAllPlayers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("All");
  const [role, setRole] = useState("All");
  const [team, setTeam] = useState("All");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);

  const iplTeams = useMemo(() => {
    const teams = new Set<string>();
    allPlayers.forEach((p) => p.iplTeams?.forEach((t: string) => teams.add(t)));
    return ["All", ...Array.from(teams).sort()];
  }, [allPlayers]);

  const filtered = useMemo(() => {
    let list = allPlayers;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (country !== "All") list = list.filter((p) => p.country === country);
    if (role !== "All") list = list.filter((p) => p.primaryRole === role);
    if (team !== "All") list = list.filter((p) => p.iplTeams?.includes(team));

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") {
        cmp = a.name.localeCompare(b.name);
      } else {
        const av = a.stats?.[sortField] ?? 0;
        const bv = b.stats?.[sortField] ?? 0;
        cmp = av - bv;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [allPlayers, search, country, role, team, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "name" ? "asc" : "desc");
    }
    setPage(0);
  };

  const resetFilters = () => {
    setSearch("");
    setCountry("All");
    setRole("All");
    setTeam("All");
    setPage(0);
  };

  const sortIcon = (field: SortField) =>
    sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="min-h-screen warm-bg">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link to="/" className="text-candy-green hover:underline font-body font-bold">Home</Link>
          <span className="text-muted-foreground mx-2">/</span>
          <span className="text-muted-foreground font-body">Player Database</span>
        </nav>

        <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-4">
          Cricket Player Database
        </h1>
        <p className="text-muted-foreground font-body text-base leading-relaxed mb-2">
          Browse all {allPlayers.length.toLocaleString()} cricket player cards in Cricket Bingo. Search by name,
          filter by country, playing role, or IPL team. Every player includes career statistics
          from Tests, ODIs, T20Is, and the Indian Premier League.
        </p>
        {loading && (
          <div className="text-center py-16">
            <div className="text-muted-foreground font-display text-sm uppercase tracking-widest animate-pulse">
              Loading player database...
            </div>
          </div>
        )}

        <p className="text-muted-foreground font-body text-sm leading-relaxed mb-8">
          Player data sourced from{" "}
          <a href="https://cricsheet.org" target="_blank" rel="noopener noreferrer"
            className="text-candy-green hover:underline">Cricsheet</a> (CC-BY-4.0).
          Stats include international and IPL career records.
        </p>

        {/* Filters */}
        <div className="candy-card p-4 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="font-body font-bold text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder="Player name..."
                className="w-full px-3 py-2 rounded-xl border border-border/40 bg-background text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-candy-green/50"
              />
            </div>
            <div>
              <label className="font-body font-bold text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">Country</label>
              <select
                value={country}
                onChange={(e) => { setCountry(e.target.value); setPage(0); }}
                className="w-full px-3 py-2 rounded-xl border border-border/40 bg-background text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-candy-green/50"
              >
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="font-body font-bold text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => { setRole(e.target.value); setPage(0); }}
                className="w-full px-3 py-2 rounded-xl border border-border/40 bg-background text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-candy-green/50"
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="font-body font-bold text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">IPL Team</label>
              <select
                value={team}
                onChange={(e) => { setTeam(e.target.value); setPage(0); }}
                className="w-full px-3 py-2 rounded-xl border border-border/40 bg-background text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-candy-green/50"
              >
                {iplTeams.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full px-3 py-2 rounded-xl border border-border/40 text-sm font-body font-bold text-muted-foreground hover:text-foreground hover:border-candy-green transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground font-body text-sm">
            Showing {paged.length} of {filtered.length.toLocaleString()} players
          </p>
          {totalPages > 1 && (
            <p className="text-muted-foreground font-body text-xs">
              Page {page + 1} of {totalPages}
            </p>
          )}
        </div>

        {/* Table */}
        <div className="candy-card overflow-x-auto mb-6">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left p-3 font-display text-foreground cursor-pointer hover:text-candy-green"
                  onClick={() => handleSort("name")}>
                  Player{sortIcon("name")}
                </th>
                <th className="text-left p-3 font-display text-foreground hidden sm:table-cell">Country</th>
                <th className="text-left p-3 font-display text-foreground hidden sm:table-cell">Role</th>
                <th className="text-left p-3 font-display text-foreground hidden md:table-cell">IPL Teams</th>
                <th className="text-center p-3 font-display text-foreground cursor-pointer hover:text-candy-green"
                  onClick={() => handleSort("totalRuns")}>
                  Runs{sortIcon("totalRuns")}
                </th>
                <th className="text-center p-3 font-display text-foreground cursor-pointer hover:text-candy-green"
                  onClick={() => handleSort("totalWickets")}>
                  Wkts{sortIcon("totalWickets")}
                </th>
                <th className="text-center p-3 font-display text-foreground cursor-pointer hover:text-candy-green hidden sm:table-cell"
                  onClick={() => handleSort("centuries")}>
                  100s{sortIcon("centuries")}
                </th>
                <th className="text-left p-3 font-display text-foreground hidden lg:table-cell">Trophies</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((player) => (
                <tr key={player.id} className="border-b border-border/20 hover:bg-candy-green/5 transition-colors">
                  <td className="p-3">
                    <Link to={`/players/${player.id}`} className="font-body font-bold text-foreground hover:text-candy-green transition-colors">
                      {player.name}
                    </Link>
                    <div className="sm:hidden text-xs text-muted-foreground">
                      {player.countryFlag} {player.country} &middot; {player.primaryRole}
                    </div>
                  </td>
                  <td className="p-3 hidden sm:table-cell">
                    <span className="font-body text-muted-foreground">
                      {player.countryFlag} {player.country}
                    </span>
                  </td>
                  <td className="p-3 hidden sm:table-cell">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-white font-body font-bold text-[10px] ${roleBadgeColor[player.primaryRole] || "bg-gray-400"}`}>
                      {player.primaryRole}
                    </span>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <span className="font-body text-xs text-muted-foreground">
                      {player.iplTeams?.join(", ") || "—"}
                    </span>
                  </td>
                  <td className="p-3 text-center font-body text-foreground">
                    {(player.stats?.totalRuns ?? 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-center font-body text-foreground">
                    {player.stats?.totalWickets ?? 0}
                  </td>
                  <td className="p-3 text-center font-body text-foreground hidden sm:table-cell">
                    {player.stats?.centuries ?? 0}
                  </td>
                  <td className="p-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {player.trophies?.map((t: string) => (
                        <span key={t} className="inline-block px-1.5 py-0.5 rounded bg-candy-yellow/20 text-candy-yellow font-body font-bold text-[9px]">
                          {trophyLabels[t] || t}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground font-body">
                    No players found matching your filters. Try adjusting your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-10">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 rounded-xl border border-border/40 text-sm font-body font-bold text-foreground disabled:opacity-30 hover:border-candy-green transition-all"
            >
              Previous
            </button>
            <span className="text-sm font-body text-muted-foreground px-4">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 rounded-xl border border-border/40 text-sm font-body font-bold text-foreground disabled:opacity-30 hover:border-candy-green transition-all"
            >
              Next
            </button>
          </div>
        )}

        {/* SEO content */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-foreground mb-4">
            About the Cricket Bingo Player Database
          </h2>
          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-3">
            The Cricket Bingo player database contains over {allPlayers.length.toLocaleString()} real cricket players
            from international cricket and the Indian Premier League. Each player card includes
            comprehensive career statistics across all formats — Tests, ODIs, T20 Internationals,
            and IPL matches.
          </p>
          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-3">
            Players are categorized by their country (India, Australia, England, South Africa,
            Pakistan, New Zealand, Sri Lanka, West Indies, Bangladesh), primary playing role
            (Batsman, Wicket-Keeper Batsman, Fast Bowler, Spin Bowler, All-Rounder), IPL team
            history, career statistics, and trophies won.
          </p>
          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-3">
            This data powers the Cricket Bingo game, where each player card can match multiple
            grid categories. For example, a player like Virat Kohli matches categories for India,
            RCB, Batsman, 10,000+ runs, Century Maker, IPL Winner, World Cup Winner, and various
            combo categories. Understanding these connections is key to mastering the game.
          </p>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            Use the search and filters above to explore players by any combination of country,
            role, and IPL team. Click column headers to sort by runs, wickets, or centuries.
            Whether you're researching for the daily bingo puzzle or just exploring cricket
            statistics, this database has you covered.
          </p>
        </section>

        {/* Country breakdown */}
        <section className="mb-10">
          <h2 className="font-display text-xl text-foreground mb-4">Players by Country</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {COUNTRIES.filter((c) => c !== "All").map((c) => {
              const count = allPlayers.filter((p) => p.country === c).length;
              return (
                <button
                  key={c}
                  onClick={() => { setCountry(c); setPage(0); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="candy-card p-3 text-center hover:border-candy-green transition-all"
                >
                  <div className="font-display text-lg text-candy-green">{count}</div>
                  <div className="font-body font-bold text-[10px] text-muted-foreground uppercase tracking-widest">{c}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="font-display text-2xl text-foreground mb-4">Test Your Knowledge</h2>
          <p className="text-muted-foreground font-body text-sm mb-6">
            Think you know these players? Put your cricket knowledge to the test in Cricket Bingo.
          </p>
          <Link to="/play" className="candy-btn candy-btn-green text-lg px-10 py-4 inline-block">
            Play Now — Free
          </Link>
        </section>

        {/* Footer */}
        <footer className="border-t-2 border-border pt-6 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mb-3">
            <Link to="/" className="hover:text-candy-green transition-colors font-body font-bold">Home</Link>
            <Link to="/about" className="hover:text-candy-green transition-colors font-body font-bold">About</Link>
            <Link to="/how-to-play" className="hover:text-candy-green transition-colors font-body font-bold">How to Play</Link>
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
