const fs = require("fs");
const path = require("path");

const BASE = "https://cricket-bingo.in";
const TODAY = new Date().toISOString().slice(0, 10);

const STATIC = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/about", changefreq: "monthly", priority: "0.8" },
  { loc: "/how-to-play", changefreq: "monthly", priority: "0.8" },
  { loc: "/players", changefreq: "weekly", priority: "0.9" },
  { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
  { loc: "/terms", changefreq: "yearly", priority: "0.3" },
];

const playersPath = path.join(__dirname, "../public/players.json");
const players = JSON.parse(fs.readFileSync(playersPath, "utf-8"));

function urlEntry({ loc, changefreq, priority }) {
  return `  <url>
    <loc>${BASE}${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const staticEntries = STATIC.map(urlEntry).join("\n");

const playerEntries = players
  .map((p) =>
    urlEntry({ loc: `/players/${p.id}`, changefreq: "monthly", priority: "0.7" })
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${playerEntries}
</urlset>
`;

const outPath = path.join(__dirname, "../public/sitemap.xml");
fs.writeFileSync(outPath, xml, "utf-8");
console.log(`Sitemap written: ${STATIC.length} static + ${players.length} player pages = ${STATIC.length + players.length} URLs`);
