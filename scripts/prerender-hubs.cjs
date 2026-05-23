/**
 * Prerender hub pages for IPL teams, countries, and trophies.
 *
 * Each hub page lists players belonging to that category with full text
 * content, giving AdSense crawlers ~30 additional unique pages on top of
 * the player profiles.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const PLAYERS_PATH = path.join(ROOT, "public", "players.json");
const BASE = "https://cricket-bingo.in";

const IPL_TEAMS = {
  MI: { name: "Mumbai Indians", founded: 2008, titles: 5, color: "#004BA0" },
  CSK: { name: "Chennai Super Kings", founded: 2008, titles: 5, color: "#FFFF3C" },
  RCB: { name: "Royal Challengers Bengaluru", founded: 2008, titles: 1, color: "#EC1C24" },
  KKR: { name: "Kolkata Knight Riders", founded: 2008, titles: 3, color: "#3A225D" },
  DC: { name: "Delhi Capitals", founded: 2008, titles: 0, color: "#17479E" },
  SRH: { name: "Sunrisers Hyderabad", founded: 2013, titles: 1, color: "#FB643E" },
  RR: { name: "Rajasthan Royals", founded: 2008, titles: 1, color: "#254AA5" },
  PBKS: { name: "Punjab Kings", founded: 2008, titles: 0, color: "#ED1B24" },
  GT: { name: "Gujarat Titans", founded: 2022, titles: 1, color: "#1B2133" },
  LSG: { name: "Lucknow Super Giants", founded: 2022, titles: 0, color: "#A72056" },
};

const COUNTRIES = {
  India: { flag: "🇮🇳", description: "the most successful nation in modern cricket with two World Cup titles, two T20 World Cups, and two Champions Trophies" },
  Australia: { flag: "🇦🇺", description: "the most decorated team in ICC tournament history with six 50-over World Cup titles" },
  England: { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", description: "the birthplace of cricket and 2019 ODI World Cup winners" },
  "South Africa": { flag: "🇿🇦", description: "one of the most consistent ICC tournament performers with the 2025 WTC title" },
  "New Zealand": { flag: "🇳🇿", description: "the inaugural ICC World Test Championship winners (2021) and consistent World Cup finalists" },
  Pakistan: { flag: "🇵🇰", description: "1992 World Cup and 2017 Champions Trophy winners with a long fast-bowling tradition" },
  "Sri Lanka": { flag: "🇱🇰", description: "1996 World Cup champions and 2014 T20 World Cup winners" },
  "West Indies": { flag: "🌴", description: "two-time ODI World Cup winners (1975, 1979) and two-time T20 World Cup champions (2012, 2016)" },
  Bangladesh: { flag: "🇧🇩", description: "a rising cricket nation with multiple Asia Cup final appearances" },
  Afghanistan: { flag: "🇦🇫", description: "the newest Test-playing nation with a strong T20 squad" },
};

const TROPHIES = {
  IPL: { name: "Indian Premier League", desc: "the world's most-watched T20 franchise tournament held annually since 2008" },
  CWC: { name: "ICC Cricket World Cup", desc: "the premier 50-over international cricket tournament held every four years" },
  T20WC: { name: "ICC T20 World Cup", desc: "the premier T20 international tournament for national teams" },
  CT: { name: "ICC Champions Trophy", desc: "an ODI tournament for top-ranked nations, contested since 1998" },
  WTC: { name: "ICC World Test Championship", desc: "the two-year league cycle culminating in a final between the top two Test sides" },
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

const SHARED_CSS = `
:root {
  --bg: #0a0e1a; --bg-card: #131829; --bg-elev: #1a2138;
  --text: #e8eaf2; --text-muted: #8b93ad;
  --primary: #34d399; --primary-dim: #10b981;
  --gold: #fbbf24; --border: rgba(255,255,255,0.08);
}
@media (prefers-color-scheme: light) {
  :root { --bg: #fafbf8; --bg-card: #ffffff; --bg-elev: #f3f5ef;
    --text: #1a1f2e; --text-muted: #5b6478; --border: rgba(0,0,0,0.08); }
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--bg); color: var(--text);
  font-family: 'Inter', system-ui, -apple-system, sans-serif; line-height: 1.6;
  -webkit-font-smoothing: antialiased; }
a { color: var(--primary); text-decoration: none; }
a:hover { text-decoration: underline; }
.container { max-width: 880px; margin: 0 auto; padding: 24px 16px 80px; }
nav.crumb { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; }
nav.crumb a { color: var(--primary); font-weight: 600; }
h1 { font-family: 'Barlow Condensed', sans-serif; font-weight: 800;
  font-size: clamp(32px, 6vw, 48px); letter-spacing: 0.02em; line-height: 1.05;
  margin: 0 0 12px; text-transform: uppercase; }
h2 { font-family: 'Barlow Condensed', sans-serif; font-weight: 800;
  font-size: clamp(20px, 4vw, 26px); letter-spacing: 0.02em;
  text-transform: uppercase; margin: 32px 0 12px; }
h3 { font-family: 'Barlow Condensed', sans-serif; font-weight: 700;
  font-size: 18px; text-transform: uppercase; margin: 20px 0 8px; }
p, li { font-size: 15px; color: var(--text); }
.meta { display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
  color: var(--text-muted); font-size: 14px; margin-bottom: 24px; }
.stat-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 12px; margin: 24px 0; }
.stat-card { background: var(--bg-card); border: 2px solid var(--border);
  border-radius: 12px; padding: 16px 12px; text-align: center; }
.stat-value { font-family: 'Barlow Condensed', sans-serif; font-weight: 800;
  font-size: 24px; color: var(--primary); line-height: 1; }
.stat-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase;
  letter-spacing: 0.15em; font-weight: 700; margin-top: 6px; }
.player-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px; margin: 16px 0; }
.player-card { background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 10px; padding: 12px; display: block; transition: border-color 0.15s; }
.player-card:hover { border-color: var(--primary); text-decoration: none; }
.player-card .name { font-weight: 700; color: var(--text); font-size: 14px;
  margin-bottom: 2px; }
.player-card .sub { font-size: 11px; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.05em; }
.btn-primary { display: inline-block; padding: 14px 28px; background: var(--primary);
  color: #062; font-family: 'Barlow Condensed', sans-serif; font-weight: 800;
  font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em;
  border-radius: 12px; box-shadow: 0 6px 0 var(--primary-dim);
  transition: transform 0.1s, box-shadow 0.1s; }
.btn-primary:hover { text-decoration: none; transform: translateY(2px); box-shadow: 0 4px 0 var(--primary-dim); }
.cta-card { background: var(--bg-card); border: 2px solid var(--border);
  border-radius: 16px; padding: 24px; margin: 32px 0; }
footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--border);
  text-align: center; font-size: 12px; color: var(--text-muted); }
footer a { margin: 0 8px; color: var(--text-muted); font-weight: 600; }
footer a:hover { color: var(--primary); }
@media (max-width: 480px) { .container { padding: 16px 12px 60px; } }
`;

function renderShell({ title, description, canonical, jsonLd, breadcrumbLd, body }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="theme-color" content="#0a0e1a" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${BASE}/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ""}
  ${breadcrumbLd ? `<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>` : ""}
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="container">${body}</div>
  <script>
    (function(){
      window.adsbygoogle = window.adsbygoogle || [];
    })();
  </script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7606459883233703" crossorigin="anonymous"></script>
</body>
</html>`;
}

function playerCardHtml(p) {
  const role = p.primaryRole || "";
  const sub = [p.country, role].filter(Boolean).join(" · ");
  return `<a class="player-card" href="/players/${escapeHtml(p.id)}">
    <div class="name">${escapeHtml(p.name)}</div>
    <div class="sub">${escapeHtml(sub)}</div>
  </a>`;
}

function renderTeamPage(code, info, players) {
  const teamPlayers = players.filter((p) => (p.iplTeams || []).includes(code));
  teamPlayers.sort((a, b) => (b.stats?.iplRuns || 0) - (a.stats?.iplRuns || 0));

  const topRuns = teamPlayers.reduce((acc, p) => Math.max(acc, p.stats?.iplRuns || 0), 0);
  const topRunsPlayer = teamPlayers.find((p) => p.stats?.iplRuns === topRuns);
  const description = `${info.name} — full squad list with ${teamPlayers.length} players, IPL history, ${info.titles} titles. Browse career stats and play Cricket Bingo daily.`;
  const url = `${BASE}/teams/${code.toLowerCase()}`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "IPL Teams", item: `${BASE}/teams` },
      { "@type": "ListItem", position: 3, name: info.name, item: url },
    ],
  };

  const body = `
    <nav class="crumb"><a href="/">Home</a> &middot; <a href="/teams">IPL Teams</a> &middot; <span>${escapeHtml(info.name)}</span></nav>
    <h1>${escapeHtml(info.name)}</h1>
    <div class="meta">
      <span>IPL Team</span><span>&middot;</span>
      <span>Founded ${info.founded}</span><span>&middot;</span>
      <span>${info.titles} title${info.titles === 1 ? "" : "s"}</span><span>&middot;</span>
      <span>${teamPlayers.length} players in database</span>
    </div>

    <div class="stat-strip">
      <div class="stat-card"><div class="stat-value">${info.titles}</div><div class="stat-label">IPL Titles</div></div>
      <div class="stat-card"><div class="stat-value">${teamPlayers.length}</div><div class="stat-label">Players</div></div>
      <div class="stat-card"><div class="stat-value">${info.founded}</div><div class="stat-label">Founded</div></div>
      ${topRunsPlayer ? `<div class="stat-card"><div class="stat-value">${topRuns.toLocaleString()}</div><div class="stat-label">Top Run Scorer</div></div>` : ""}
    </div>

    <section>
      <h2>About ${escapeHtml(info.name)}</h2>
      <p>${escapeHtml(info.name)} (${escapeHtml(code)}) is a franchise in the Indian Premier League (IPL), the world's most-watched T20 cricket tournament. Founded in ${info.founded}, the team has won the IPL title <strong>${info.titles}</strong> time${info.titles === 1 ? "" : "s"}, making it one of the most ${info.titles >= 4 ? "successful franchises in IPL history" : info.titles >= 2 ? "competitive sides in the tournament" : "established franchises in the league"}.</p>
      ${topRunsPlayer ? `<p>Across our database of ${teamPlayers.length} players who have represented ${escapeHtml(info.name)} in the IPL, the leading run scorer is <a href="/players/${escapeHtml(topRunsPlayer.id)}">${escapeHtml(topRunsPlayer.name)}</a> with ${topRuns.toLocaleString()} IPL runs.</p>` : ""}
    </section>

    <section>
      <h2>${escapeHtml(info.name)} Squad &amp; Players (${teamPlayers.length})</h2>
      <p>Every player in our Cricket Bingo database who has represented ${escapeHtml(info.name)} in the Indian Premier League. Click any name for full career stats, trophies, and biography.</p>
      <div class="player-grid">
        ${teamPlayers.map(playerCardHtml).join("\n")}
      </div>
    </section>

    <section class="cta-card">
      <h3 style="margin-top:0">Play Cricket Bingo</h3>
      <p>In a daily Cricket Bingo grid, any of these ${teamPlayers.length} ${escapeHtml(info.name)} players can be placed on the ${escapeHtml(code)} franchise cell. Build a bingo line and climb the leaderboard.</p>
      <a href="/play" class="btn-primary">Play Cricket Bingo — Free</a>
    </section>

    <footer>
      <div><a href="/">Home</a> &middot; <a href="/teams">All Teams</a> &middot; <a href="/players">All Players</a> &middot; <a href="/how-to-play">How to Play</a> &middot; <a href="/privacy">Privacy</a> &middot; <a href="/terms">Terms</a></div>
      <p>Cricket Bingo &copy; 2025 &middot; Data from <a href="https://cricsheet.org" target="_blank" rel="noopener">Cricsheet</a> (CC-BY-4.0)</p>
    </footer>
  `;

  return renderShell({
    title: `${info.name} — IPL Squad, ${info.titles} Title${info.titles === 1 ? "" : "s"}, ${teamPlayers.length} Players | Cricket Bingo`,
    description,
    canonical: url,
    breadcrumbLd,
    body,
  });
}

function renderCountryPage(country, info, players) {
  const countryPlayers = players.filter((p) => p.country === country);
  countryPlayers.sort((a, b) => (b.stats?.totalRuns || 0) - (a.stats?.totalRuns || 0));

  const description = `${country} cricket — full player roster with ${countryPlayers.length} cricketers. Career stats, World Cup wins, and Cricket Bingo trivia.`;
  const url = `${BASE}/countries/${country.toLowerCase().replace(/\s+/g, "-")}`;
  const slug = country.toLowerCase().replace(/\s+/g, "-");

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Countries", item: `${BASE}/countries` },
      { "@type": "ListItem", position: 3, name: country, item: url },
    ],
  };

  const body = `
    <nav class="crumb"><a href="/">Home</a> &middot; <a href="/countries">Countries</a> &middot; <span>${escapeHtml(country)}</span></nav>
    <h1>${escapeHtml(info.flag)} ${escapeHtml(country)} Cricket Team</h1>
    <div class="meta">
      <span>${countryPlayers.length} players</span><span>&middot;</span>
      <span>International cricket</span>
    </div>

    <section>
      <h2>About ${escapeHtml(country)} Cricket</h2>
      <p>${escapeHtml(country)} is ${escapeHtml(info.description)}. Our Cricket Bingo database includes <strong>${countryPlayers.length}</strong> ${escapeHtml(country)} cricketers spanning Tests, ODIs, T20 Internationals, and the Indian Premier League. Each player card carries full career statistics and trophy history.</p>
    </section>

    <section>
      <h2>${escapeHtml(country)} Players (${countryPlayers.length})</h2>
      <p>All ${escapeHtml(country)} cricketers in the Cricket Bingo player database. Sorted by total career runs.</p>
      <div class="player-grid">
        ${countryPlayers.map(playerCardHtml).join("\n")}
      </div>
    </section>

    <section class="cta-card">
      <h3 style="margin-top:0">Test Your ${escapeHtml(country)} Cricket Knowledge</h3>
      <p>In a daily Cricket Bingo grid, every ${escapeHtml(country)} card matches the ${escapeHtml(country)} cell. The more ${escapeHtml(country)} players you recognize, the faster you complete a bingo line.</p>
      <a href="/play" class="btn-primary">Play Cricket Bingo — Free</a>
    </section>

    <footer>
      <div><a href="/">Home</a> &middot; <a href="/countries">All Countries</a> &middot; <a href="/players">All Players</a> &middot; <a href="/how-to-play">How to Play</a> &middot; <a href="/privacy">Privacy</a> &middot; <a href="/terms">Terms</a></div>
      <p>Cricket Bingo &copy; 2025 &middot; Data from <a href="https://cricsheet.org" target="_blank" rel="noopener">Cricsheet</a> (CC-BY-4.0)</p>
    </footer>
  `;

  return renderShell({
    title: `${country} Cricket Team — ${countryPlayers.length} Players, Stats & Profile | Cricket Bingo`,
    description,
    canonical: url,
    breadcrumbLd,
    body,
  });
}

function renderTrophyPage(code, info, players) {
  const winners = players.filter((p) => (p.trophies || []).includes(code));
  winners.sort((a, b) => (b.stats?.totalRuns || 0) - (a.stats?.totalRuns || 0));
  const description = `${info.name} winners — ${winners.length} cricketers who have lifted the trophy. Career stats and Cricket Bingo profiles.`;
  const slug = code.toLowerCase();
  const url = `${BASE}/trophies/${slug}`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Trophies", item: `${BASE}/trophies` },
      { "@type": "ListItem", position: 3, name: info.name, item: url },
    ],
  };

  const body = `
    <nav class="crumb"><a href="/">Home</a> &middot; <a href="/trophies">Trophies</a> &middot; <span>${escapeHtml(info.name)}</span></nav>
    <h1>${escapeHtml(info.name)} Winners</h1>
    <div class="meta"><span>${winners.length} players in the Cricket Bingo database</span></div>

    <section>
      <h2>About the ${escapeHtml(info.name)}</h2>
      <p>The ${escapeHtml(info.name)} is ${escapeHtml(info.desc)}. Below are all <strong>${winners.length}</strong> cricketers in our database who have won this trophy.</p>
    </section>

    <section>
      <h2>${escapeHtml(info.name)} Champions (${winners.length})</h2>
      <div class="player-grid">
        ${winners.map(playerCardHtml).join("\n")}
      </div>
    </section>

    <section class="cta-card">
      <h3 style="margin-top:0">Spot a Trophy Winner in Cricket Bingo</h3>
      <p>In Cricket Bingo, the "${escapeHtml(info.name)} Winner" cell accepts any of these ${winners.length} cards. Recognising trophy winners is a key skill for high scores.</p>
      <a href="/play" class="btn-primary">Play Cricket Bingo — Free</a>
    </section>

    <footer>
      <div><a href="/">Home</a> &middot; <a href="/trophies">All Trophies</a> &middot; <a href="/players">All Players</a> &middot; <a href="/how-to-play">How to Play</a> &middot; <a href="/privacy">Privacy</a> &middot; <a href="/terms">Terms</a></div>
      <p>Cricket Bingo &copy; 2025 &middot; Data from <a href="https://cricsheet.org" target="_blank" rel="noopener">Cricsheet</a> (CC-BY-4.0)</p>
    </footer>
  `;

  return renderShell({
    title: `${info.name} Winners — ${winners.length} Champions | Cricket Bingo`,
    description,
    canonical: url,
    breadcrumbLd,
    body,
  });
}

function renderIndexPage({ title, description, slug, items, intro }) {
  const url = `${BASE}/${slug}`;
  const body = `
    <nav class="crumb"><a href="/">Home</a> &middot; <span>${escapeHtml(title)}</span></nav>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(intro)}</p>
    <div class="player-grid">${items}</div>
    <footer>
      <div><a href="/">Home</a> &middot; <a href="/players">All Players</a> &middot; <a href="/how-to-play">How to Play</a> &middot; <a href="/privacy">Privacy</a> &middot; <a href="/terms">Terms</a></div>
      <p>Cricket Bingo &copy; 2025</p>
    </footer>
  `;
  return renderShell({ title: `${title} | Cricket Bingo`, description, canonical: url, body });
}

function writeFile(rel, content) {
  const full = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf-8");
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error(`[prerender-hubs] dist/ does not exist. Run vite build first.`);
    process.exit(1);
  }
  const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, "utf-8"));

  let count = 0;

  // Per-team pages
  for (const [code, info] of Object.entries(IPL_TEAMS)) {
    writeFile(`teams/${code.toLowerCase()}/index.html`, renderTeamPage(code, info, players));
    count += 1;
  }
  // Per-country pages
  for (const [country, info] of Object.entries(COUNTRIES)) {
    const slug = country.toLowerCase().replace(/\s+/g, "-");
    writeFile(`countries/${slug}/index.html`, renderCountryPage(country, info, players));
    count += 1;
  }
  // Per-trophy pages
  for (const [code, info] of Object.entries(TROPHIES)) {
    writeFile(`trophies/${code.toLowerCase()}/index.html`, renderTrophyPage(code, info, players));
    count += 1;
  }

  // Index pages
  const teamItems = Object.entries(IPL_TEAMS).map(([code, info]) =>
    `<a class="player-card" href="/teams/${code.toLowerCase()}"><div class="name">${escapeHtml(info.name)}</div><div class="sub">${escapeHtml(code)} &middot; ${info.titles} title${info.titles === 1 ? "" : "s"}</div></a>`,
  ).join("\n");
  writeFile("teams/index.html", renderIndexPage({
    title: "IPL Teams",
    description: "All 10 Indian Premier League franchises — squads, stats and history. Browse Mumbai Indians, Chennai Super Kings, RCB, KKR and more.",
    slug: "teams",
    intro: "Every Indian Premier League franchise represented in the Cricket Bingo database. Click a team to see its full squad list and IPL history.",
    items: teamItems,
  }));
  count += 1;

  const countryItems = Object.entries(COUNTRIES).map(([country, info]) => {
    const slug = country.toLowerCase().replace(/\s+/g, "-");
    const ct = players.filter((p) => p.country === country).length;
    return `<a class="player-card" href="/countries/${slug}"><div class="name">${escapeHtml(info.flag)} ${escapeHtml(country)}</div><div class="sub">${ct} players</div></a>`;
  }).join("\n");
  writeFile("countries/index.html", renderIndexPage({
    title: "Countries",
    description: "Cricket players grouped by country — India, Australia, England, South Africa, Pakistan and more.",
    slug: "countries",
    intro: "Browse cricket players in the Cricket Bingo database grouped by national team.",
    items: countryItems,
  }));
  count += 1;

  const trophyItems = Object.entries(TROPHIES).map(([code, info]) => {
    const ct = players.filter((p) => (p.trophies || []).includes(code)).length;
    return `<a class="player-card" href="/trophies/${code.toLowerCase()}"><div class="name">${escapeHtml(info.name)}</div><div class="sub">${ct} winners</div></a>`;
  }).join("\n");
  writeFile("trophies/index.html", renderIndexPage({
    title: "Trophies",
    description: "Major cricket trophy winners — World Cup, T20 World Cup, IPL, Champions Trophy, World Test Championship.",
    slug: "trophies",
    intro: "All major cricket trophies tracked in the Cricket Bingo database. Click a trophy to see its winners.",
    items: trophyItems,
  }));
  count += 1;

  console.log(`[prerender-hubs] Wrote ${count} hub pages (teams + countries + trophies + indexes)`);
}

main();
