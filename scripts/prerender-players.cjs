/**
 * Prerender player profile pages as static HTML for SEO + AdSense.
 *
 * Vercel serves filesystem matches before applying rewrites, so writing
 * dist/players/{id}/index.html means /players/{id} returns a content-rich
 * page to crawlers instead of the empty SPA shell.
 *
 * Run automatically after `vite build` via the postbuild npm script.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const PLAYERS_PATH = path.join(ROOT, "public", "players.json");

const BASE = "https://cricket-bingo.in";

const TROPHY_NAMES = {
  IPL: "IPL Champion",
  CWC: "ICC Cricket World Cup",
  T20WC: "ICC T20 World Cup",
  CT: "ICC Champions Trophy",
  WTC: "ICC World Test Championship",
};

const ROLE_DISPLAY = {
  "WK-Bat": "Wicket-Keeper Batsman",
  Batsman: "Batsman",
  "Fast Bowler": "Fast Bowler",
  "Spin Bowler": "Spin Bowler",
  "All-Rounder": "All-Rounder",
};

const IPL_TEAM_FULL = {
  MI: "Mumbai Indians",
  CSK: "Chennai Super Kings",
  RCB: "Royal Challengers Bengaluru",
  KKR: "Kolkata Knight Riders",
  DC: "Delhi Capitals",
  SRH: "Sunrisers Hyderabad",
  RR: "Rajasthan Royals",
  PBKS: "Punjab Kings",
  GT: "Gujarat Titans",
  LSG: "Lucknow Super Giants",
};

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function joinList(items) {
  if (!items || items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function generateBio(p) {
  const { name, country, primaryRole, stats, trophies, iplTeams } = p;
  const role = (ROLE_DISPLAY[primaryRole] || primaryRole).toLowerCase();
  const parts = [];

  const formats = [];
  if (stats.testMatches > 0) formats.push(`${stats.testMatches} Test matches`);
  if (stats.odiMatches > 0) formats.push(`${stats.odiMatches} ODIs`);
  if (stats.t20iMatches > 0) formats.push(`${stats.t20iMatches} T20 Internationals`);

  if (formats.length > 0) {
    parts.push(
      `${name} is a ${country} ${role} who has played ${joinList(formats)} for the ${country} national cricket team.`,
    );
  } else if (iplTeams && iplTeams.length) {
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
      `${name} has taken ${stats.totalWickets} career wickets, making significant contributions with the ball.`,
    );
  } else if (stats.totalWickets > 0 && (primaryRole === "All-Rounder" || primaryRole.includes("Bowler"))) {
    parts.push(`${name} has taken ${stats.totalWickets} career wickets.`);
  }

  if (iplTeams && iplTeams.length) {
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

  if (trophies && trophies.length) {
    const trophyList = trophies.map((t) => TROPHY_NAMES[t] || t);
    parts.push(`${name} is a winner of the ${joinList(trophyList)}.`);
  }

  return parts.join(" ");
}

function generateBingoContext(p) {
  const parts = [];
  const { name, country, primaryRole, iplTeams, trophies, stats } = p;
  const roleDisplay = ROLE_DISPLAY[primaryRole] || primaryRole;

  const cells = [country, roleDisplay];
  if (iplTeams && iplTeams.length) cells.push(...iplTeams);
  if (trophies && trophies.length) {
    if (trophies.includes("IPL")) cells.push("IPL Winner");
    if (trophies.includes("CWC")) cells.push("World Cup Winner");
    if (trophies.includes("T20WC")) cells.push("T20 World Cup Winner");
    if (trophies.includes("CT")) cells.push("Champions Trophy Winner");
  }
  if (stats.totalRuns >= 10000) cells.push("10,000+ Career Runs");
  else if (stats.totalRuns >= 5000) cells.push("5,000+ Career Runs");
  if (stats.totalWickets >= 300) cells.push("300+ Career Wickets");
  else if (stats.totalWickets >= 100) cells.push("100+ Career Wickets");
  if (stats.centuries >= 50) cells.push("50+ International Centuries");
  else if (stats.centuries >= 20) cells.push("20+ International Centuries");

  parts.push(
    `In a Cricket Bingo daily puzzle, the ${name} player card can be placed on grid cells matching ${joinList(cells.slice(0, 6))}${cells.length > 6 ? `, and other related categories` : ""}.`,
  );

  if (iplTeams && iplTeams.length === 1) {
    const team = iplTeams[0];
    parts.push(
      `Because ${name} only represented ${IPL_TEAM_FULL[team] || team} in the IPL, the card cannot be placed on other franchise cells — a constraint that often matters when only one cell remains to complete a bingo line.`,
    );
  } else if (iplTeams && iplTeams.length > 1) {
    parts.push(
      `Having represented ${iplTeams.length} different IPL franchises (${joinList(iplTeams.map((t) => IPL_TEAM_FULL[t] || t))}), this card is exceptionally flexible — useful when you need to fill a franchise cell and a country cell on the same row.`,
    );
  }

  if (primaryRole === "All-Rounder") {
    parts.push(
      `As an all-rounder, this card matches batting, bowling, and wicket-taking categories simultaneously, giving you the most placement options.`,
    );
  }

  return parts.join(" ");
}

function formatStatRow(label, matches, runs, wickets) {
  if (!matches || matches === 0) return "";
  return `<tr>
    <td>${label}</td>
    <td>${matches}</td>
    <td>${runs.toLocaleString()}</td>
    <td>${wickets}</td>
  </tr>`;
}

function renderPlayerPage(p, csshref) {
  const bio = generateBio(p);
  const bingoCtx = generateBingoContext(p);
  const roleDisplay = ROLE_DISPLAY[p.primaryRole] || p.primaryRole;
  const description = bio.slice(0, 155);
  const url = `${BASE}/players/${p.id}`;
  const title = `${p.name} — Cricket Stats, IPL Teams & Profile | Cricket Bingo`;

  const trophiesHtml = (p.trophies || [])
    .map((t) => `<li>${escapeHtml(TROPHY_NAMES[t] || t)}</li>`)
    .join("");

  const iplTeamsHtml = (p.iplTeams || [])
    .map((t) => `<li><strong>${escapeHtml(t)}</strong>${IPL_TEAM_FULL[t] ? ` — ${escapeHtml(IPL_TEAM_FULL[t])}` : ""}</li>`)
    .join("");

  const categoriesHtml = (p.categories || [])
    .map((c) => `<span class="chip">${escapeHtml(c)}</span>`)
    .join(" ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.name,
    nationality: p.country,
    description: bio,
    url,
    jobTitle: roleDisplay,
    affiliation: (p.iplTeams || []).map((t) => ({
      "@type": "SportsTeam",
      name: IPL_TEAM_FULL[t] || t,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Players", item: `${BASE}/players` },
      { "@type": "ListItem", position: 3, name: p.name, item: url },
    ],
  };

  const totalRuns = (p.stats.totalRuns || 0).toLocaleString();
  const totalWickets = p.stats.totalWickets || 0;
  const centuries = p.stats.centuries || 0;
  const trophyCount = (p.trophies || []).length;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="theme-color" content="#0a0e1a" />
  <link rel="canonical" href="${url}" />

  <meta property="og:title" content="${escapeHtml(p.name)} — Cricket Stats & Profile" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="profile" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${BASE}/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />

  <link rel="icon" href="/favicon.ico" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
  <link rel="manifest" href="/manifest.json" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>

  <style>
    :root {
      --bg: #0a0e1a;
      --bg-card: #131829;
      --bg-elev: #1a2138;
      --text: #e8eaf2;
      --text-muted: #8b93ad;
      --primary: #34d399;
      --primary-dim: #10b981;
      --gold: #fbbf24;
      --border: rgba(255,255,255,0.08);
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #fafbf8;
        --bg-card: #ffffff;
        --bg-elev: #f3f5ef;
        --text: #1a1f2e;
        --text-muted: #5b6478;
        --border: rgba(0,0,0,0.08);
      }
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    a { color: var(--primary); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .container { max-width: 760px; margin: 0 auto; padding: 24px 16px 80px; }
    nav.crumb { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; }
    nav.crumb a { color: var(--primary); font-weight: 600; }
    h1 {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 800;
      font-size: clamp(32px, 6vw, 48px);
      letter-spacing: 0.02em;
      line-height: 1.05;
      margin: 0 0 12px;
      text-transform: uppercase;
    }
    h2 {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 800;
      font-size: clamp(20px, 4vw, 26px);
      letter-spacing: 0.02em;
      text-transform: uppercase;
      margin: 32px 0 12px;
    }
    h3 {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 700;
      font-size: 18px;
      text-transform: uppercase;
      margin: 20px 0 8px;
    }
    p, li { font-size: 15px; color: var(--text); }
    .meta {
      display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
      color: var(--text-muted); font-size: 14px; margin-bottom: 24px;
    }
    .role-badge {
      display: inline-block; padding: 4px 12px; border-radius: 999px;
      background: var(--primary); color: #062;
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 700; font-size: 12px; text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px; margin-bottom: 24px;
    }
    .stat-card {
      background: var(--bg-card);
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 16px 12px;
      text-align: center;
    }
    .stat-value {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 800; font-size: 24px; color: var(--primary);
      line-height: 1;
    }
    .stat-label {
      font-size: 10px; color: var(--text-muted); text-transform: uppercase;
      letter-spacing: 0.15em; font-weight: 700; margin-top: 6px;
    }
    table {
      width: 100%; border-collapse: collapse;
      background: var(--bg-card); border-radius: 12px; overflow: hidden;
      border: 2px solid var(--border);
    }
    th, td {
      padding: 12px 10px; text-align: left;
      border-bottom: 1px solid var(--border);
      font-size: 14px;
    }
    th {
      font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase;
      letter-spacing: 0.05em; font-weight: 700; color: var(--text);
      background: var(--bg-elev); font-size: 13px;
    }
    td:not(:first-child), th:not(:first-child) { text-align: center; }
    tr:last-child td { border-bottom: none; }
    ul.plain { list-style: none; padding: 0; margin: 0; }
    ul.plain li {
      padding: 8px 12px; background: var(--bg-card);
      border: 1px solid var(--border); border-radius: 8px;
      margin-bottom: 6px; font-size: 14px;
    }
    .chip {
      display: inline-block; padding: 4px 10px; border-radius: 999px;
      background: rgba(52, 211, 153, 0.12); color: var(--primary);
      border: 1px solid rgba(52, 211, 153, 0.25);
      font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.04em;
      margin: 2px 2px 2px 0;
    }
    .cta-card {
      background: var(--bg-card); border: 2px solid var(--border);
      border-radius: 16px; padding: 24px; margin: 32px 0;
    }
    .btn-primary {
      display: inline-block; padding: 14px 28px;
      background: var(--primary); color: #062;
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 800; font-size: 16px;
      text-transform: uppercase; letter-spacing: 0.05em;
      border-radius: 12px;
      box-shadow: 0 6px 0 var(--primary-dim);
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .btn-primary:hover {
      text-decoration: none;
      transform: translateY(2px);
      box-shadow: 0 4px 0 var(--primary-dim);
    }
    footer {
      margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--border);
      text-align: center; font-size: 12px; color: var(--text-muted);
    }
    footer a { margin: 0 8px; color: var(--text-muted); font-weight: 600; }
    footer a:hover { color: var(--primary); }
    .ad-slot {
      display: block; min-height: 120px; margin: 24px 0;
      background: var(--bg-elev); border-radius: 12px;
      text-align: center; padding: 16px;
      color: var(--text-muted); font-size: 11px; text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    @media (max-width: 480px) {
      .container { padding: 16px 12px 60px; }
      table { font-size: 12px; }
      th, td { padding: 8px 6px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <nav class="crumb">
      <a href="/">Home</a> &middot; <a href="/players">Players</a> &middot; <span>${escapeHtml(p.name)}</span>
    </nav>

    <h1>${escapeHtml(p.name)}</h1>
    <div class="meta">
      <span>${escapeHtml(p.countryFlag || "")} ${escapeHtml(p.country)}</span>
      <span>&middot;</span>
      <span class="role-badge">${escapeHtml(roleDisplay)}</span>
      ${trophyCount > 0 ? `<span>&middot;</span><span>🏆 ${trophyCount} ${trophyCount === 1 ? "Trophy" : "Trophies"}</span>` : ""}
    </div>

    <div class="stats-grid">
      ${p.stats.totalRuns > 0 ? `<div class="stat-card"><div class="stat-value">${totalRuns}</div><div class="stat-label">Career Runs</div></div>` : ""}
      ${totalWickets > 0 ? `<div class="stat-card"><div class="stat-value">${totalWickets}</div><div class="stat-label">Career Wickets</div></div>` : ""}
      ${centuries > 0 ? `<div class="stat-card"><div class="stat-value">${centuries}</div><div class="stat-label">Centuries</div></div>` : ""}
      ${trophyCount > 0 ? `<div class="stat-card"><div class="stat-value">${trophyCount}</div><div class="stat-label">Trophies</div></div>` : ""}
    </div>

    <section>
      <h2>About ${escapeHtml(p.name)}</h2>
      <p>${escapeHtml(bio)}</p>
    </section>

    ${(p.stats.testMatches + p.stats.odiMatches + p.stats.t20iMatches + p.stats.iplMatches) > 0 ? `
    <section>
      <h2>Career Statistics</h2>
      <table>
        <thead>
          <tr><th>Format</th><th>Matches</th><th>Runs</th><th>Wickets</th></tr>
        </thead>
        <tbody>
          ${formatStatRow("Tests", p.stats.testMatches, p.stats.testRuns, p.stats.testWickets)}
          ${formatStatRow("ODIs", p.stats.odiMatches, p.stats.odiRuns, p.stats.odiWickets)}
          ${formatStatRow("T20 Internationals", p.stats.t20iMatches, p.stats.t20iRuns, p.stats.t20iWickets)}
          ${formatStatRow("Indian Premier League", p.stats.iplMatches, p.stats.iplRuns, p.stats.iplWickets)}
        </tbody>
      </table>
    </section>` : ""}

    ${iplTeamsHtml ? `
    <section>
      <h2>IPL Teams</h2>
      <ul class="plain">${iplTeamsHtml}</ul>
      <p>${escapeHtml(p.name)} has represented ${joinList((p.iplTeams || []).map((t) => IPL_TEAM_FULL[t] || t))} in the Indian Premier League across various seasons.</p>
    </section>` : ""}

    ${trophiesHtml ? `
    <section>
      <h2>Trophies & Achievements</h2>
      <ul class="plain">${trophiesHtml}</ul>
    </section>` : ""}

    ${categoriesHtml ? `
    <section>
      <h2>Cricket Bingo Categories</h2>
      <p>${escapeHtml(p.name)} matches these special achievement categories in Cricket Bingo grids:</p>
      <p>${categoriesHtml}</p>
    </section>` : ""}

    <section>
      <h2>Playing ${escapeHtml(p.name)} in Cricket Bingo</h2>
      <p>${escapeHtml(bingoCtx)}</p>
    </section>

    <section class="cta-card">
      <h3 style="margin-top:0">Play the Daily Cricket Bingo Puzzle</h3>
      <p>Test your knowledge of ${escapeHtml(p.name)} and ${(1145).toLocaleString()}+ other cricket players in a fresh daily bingo grid. Match players to teams, stats, roles and trophies. Same puzzle worldwide — climb the leaderboard.</p>
      <a href="/play" class="btn-primary">Play Cricket Bingo — Free</a>
    </section>

    <section>
      <h3>About Cricket Bingo</h3>
      <p>Cricket Bingo is a free daily cricket knowledge game with 3,600+ real player cards and 42 category types. Match cricketers to IPL teams, country, role, career stats, and trophies on a 3×3 or 4×4 bingo grid. <a href="/how-to-play">Learn the rules</a> or <a href="/players">browse the player database</a>.</p>
    </section>

    <footer>
      <div>
        <a href="/">Home</a> &middot;
        <a href="/players">All Players</a> &middot;
        <a href="/how-to-play">How to Play</a> &middot;
        <a href="/about">About</a> &middot;
        <a href="/privacy">Privacy</a> &middot;
        <a href="/terms">Terms</a>
      </div>
      <p>Cricket Bingo &copy; 2025 &middot; Data from <a href="https://cricsheet.org" target="_blank" rel="noopener">Cricsheet</a> (CC-BY-4.0)</p>
    </footer>
  </div>

  <script>
    (function(){
      var contentPaths = ['/', '/about', '/how-to-play', '/players', '/privacy', '/terms'];
      var path = window.location.pathname.replace(/\\/$/, '') || '/';
      var isContent = contentPaths.indexOf(path) !== -1 || path.indexOf('/players/') === 0 || path.indexOf('/teams/') === 0 || path.indexOf('/countries/') === 0 || path.indexOf('/trophies/') === 0;
      window.adsbygoogle = window.adsbygoogle || [];
      if (!isContent) { window.adsbygoogle.pauseAdRequests = 1; }
    })();
  </script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7606459883233703" crossorigin="anonymous"></script>
</body>
</html>`;
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error(`[prerender-players] dist/ does not exist. Run vite build first.`);
    process.exit(1);
  }

  const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, "utf-8"));
  const playersOutDir = path.join(DIST, "players");
  if (!fs.existsSync(playersOutDir)) fs.mkdirSync(playersOutDir, { recursive: true });

  let written = 0;
  for (const p of players) {
    if (!p || !p.id) continue;
    const dir = path.join(playersOutDir, p.id);
    fs.mkdirSync(dir, { recursive: true });
    const html = renderPlayerPage(p);
    fs.writeFileSync(path.join(dir, "index.html"), html, "utf-8");
    written += 1;
  }

  console.log(`[prerender-players] Wrote ${written} player profile pages to dist/players/`);
}

main();
