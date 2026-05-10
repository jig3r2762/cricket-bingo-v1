/**
 * Step B role enrichment: queries Wikipedia infoboxes to get the correct
 * cricket role for every player in players.json.
 *
 * Outputs scripts/role_suggestions.json — review it, then merge into corrections.json.
 *
 * Usage:
 *   node scripts/enrich-roles.cjs
 *
 * Resumes from scripts/role_checkpoint.json if interrupted.
 */

const fs = require("fs");
const path = require("path");

const PLAYERS_PATH = path.join(__dirname, "../public/players.json");
const CHECKPOINT_PATH = path.join(__dirname, "./role_checkpoint.json");
const OUTPUT_PATH = path.join(__dirname, "./role_suggestions.json");

const DELAY_MS = 300; // polite rate limit for Wikipedia API
const BATCH_SIZE = 50; // players per run before saving checkpoint

// ── Role mapping from Wikipedia infobox text → our roles ──────────────────
const ROLE_MAP = {
  "batsman": "Batsman",
  "batter": "Batsman",
  "opening batsman": "Batsman",
  "top-order batsman": "Batsman",
  "middle-order batsman": "Batsman",
  "wicket-keeper": "WK-Bat",
  "wicket keeper": "WK-Bat",
  "wicketkeeper": "WK-Bat",
  "wicketkeeper-batsman": "WK-Bat",
  "wicket-keeper batsman": "WK-Bat",
  "wicketkeeper-batter": "WK-Bat",
  "all-rounder": "All-Rounder",
  "all rounder": "All-Rounder",
  "allrounder": "All-Rounder",
  "bowling all-rounder": "All-Rounder",
  "batting all-rounder": "All-Rounder",
  "fast bowler": "Fast Bowler",
  "pace bowler": "Fast Bowler",
  "medium-fast bowler": "Fast Bowler",
  "medium fast bowler": "Fast Bowler",
  "fast-medium bowler": "Fast Bowler",
  "right-arm fast": "Fast Bowler",
  "left-arm fast": "Fast Bowler",
  "spin bowler": "Spin Bowler",
  "off-spin bowler": "Spin Bowler",
  "off spin bowler": "Spin Bowler",
  "leg-spin bowler": "Spin Bowler",
  "leg spin bowler": "Spin Bowler",
  "left-arm spin": "Spin Bowler",
  "slow left-arm": "Spin Bowler",
  "spinner": "Spin Bowler",
};

// Infer role from bowling style string (fallback if no explicit role field)
function inferRoleFromBowling(bowlingStyle) {
  if (!bowlingStyle) return null;
  const s = bowlingStyle.toLowerCase();
  if (s.includes("fast") || s.includes("medium") || s.includes("pace")) return "Fast Bowler";
  if (s.includes("off") || s.includes("leg") || s.includes("spin") || s.includes("slow")) return "Spin Bowler";
  return null;
}

function mapRole(raw) {
  if (!raw) return null;
  const s = raw.toLowerCase().trim();
  for (const [key, val] of Object.entries(ROLE_MAP)) {
    if (s.includes(key)) return val;
  }
  return null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function searchWikipedia(name) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name + " cricketer")}&format=json&srlimit=3&origin=*`;
  const res = await fetch(url);
  const data = await res.json();
  return data?.query?.search?.[0]?.title ?? null;
}

async function getInfobox(title) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&titles=${encodeURIComponent(title)}&origin=*`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  return page?.revisions?.[0]?.slots?.main?.["*"] ?? null;
}

function parseRoleFromInfobox(wikitext) {
  if (!wikitext) return null;

  // Extract explicit role field: | role = All-rounder
  const roleMatch = wikitext.match(/\|\s*role\s*=\s*([^\n\|]+)/i);
  if (roleMatch) {
    const mapped = mapRole(roleMatch[1].trim());
    if (mapped) return { role: mapped, source: "role field" };
  }

  // Extract bowling style: | bowling = Right-arm fast-medium
  const bowlMatch = wikitext.match(/\|\s*bowling\s*=\s*([^\n\|]+)/i);
  if (bowlMatch) {
    const rawBowl = bowlMatch[1].trim();
    const bowlRole = inferRoleFromBowling(rawBowl);

    // Check if they also have notable batting (check for batting field)
    const batMatch = wikitext.match(/\|\s*batting\s*=\s*([^\n\|]+)/i);
    if (batMatch && bowlRole) {
      // Has both batting and bowling style — likely all-rounder or bowler
      // We'll return the bowling role; Step A already handles obvious all-rounders
      return { role: bowlRole, source: `bowling style: ${rawBowl}` };
    }
    if (bowlRole) return { role: bowlRole, source: `bowling style: ${rawBowl}` };
  }

  return null;
}

async function main() {
  const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, "utf-8"));

  // Load checkpoint
  let checkpoint = {};
  if (fs.existsSync(CHECKPOINT_PATH)) {
    checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, "utf-8"));
    console.log(`Resuming from checkpoint (${Object.keys(checkpoint).length} done)`);
  }

  const results = { ...checkpoint };
  let processed = 0;
  let found = 0;
  let notFound = 0;

  for (const player of players) {
    if (results[player.id] !== undefined) continue; // already done

    try {
      const title = await searchWikipedia(player.name);
      await sleep(DELAY_MS);

      if (!title) {
        results[player.id] = { name: player.name, currentRole: player.primaryRole, wikiTitle: null, suggestedRole: null, source: "not found" };
        notFound++;
      } else {
        const wikitext = await getInfobox(title);
        await sleep(DELAY_MS);
        const parsed = parseRoleFromInfobox(wikitext);
        results[player.id] = {
          name: player.name,
          currentRole: player.primaryRole,
          wikiTitle: title,
          suggestedRole: parsed?.role ?? null,
          source: parsed?.source ?? "no role in infobox",
        };
        if (parsed?.role) found++;
        else notFound++;
      }
    } catch (err) {
      results[player.id] = { name: player.name, currentRole: player.primaryRole, wikiTitle: null, suggestedRole: null, source: `error: ${err.message}` };
      notFound++;
    }

    processed++;

    // Save checkpoint every BATCH_SIZE players
    if (processed % BATCH_SIZE === 0) {
      fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(results, null, 2));
      console.log(`Progress: ${processed} processed, ${found} roles found, ${notFound} not found`);
    }
  }

  // Final save
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(results, null, 2));

  // Build output: only players where suggested role differs from current
  const suggestions = {};
  const unchanged = [];
  const noData = [];

  for (const [id, data] of Object.entries(results)) {
    if (!data.suggestedRole) {
      noData.push({ id, name: data.name, currentRole: data.currentRole, source: data.source });
    } else if (data.suggestedRole !== data.currentRole) {
      suggestions[id] = {
        name: data.name,
        from: data.currentRole,
        to: data.suggestedRole,
        wikiTitle: data.wikiTitle,
        source: data.source,
      };
    } else {
      unchanged.push(data.name);
    }
  }

  const output = {
    _summary: {
      total: players.length,
      suggestedChanges: Object.keys(suggestions).length,
      unchanged: unchanged.length,
      noData: noData.length,
    },
    suggestedRoleChanges: suggestions,
    noDataFound: noData,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  console.log("\n── Step B Role Enrichment Complete ──");
  console.log(`Total players   : ${players.length}`);
  console.log(`Role changes    : ${Object.keys(suggestions).length}`);
  console.log(`Already correct : ${unchanged.length}`);
  console.log(`No data found   : ${noData.length}`);
  console.log(`\nOutput saved to: scripts/role_suggestions.json`);
  console.log("Review it, then merge changes into scripts/corrections.json and re-run apply-corrections.cjs");
}

main().catch(console.error);
