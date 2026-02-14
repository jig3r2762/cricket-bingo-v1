#!/usr/bin/env node

/**
 * Enrich player headshot images from Wikidata
 * Usage: node scripts/enrich-player-headshots.js
 *
 * Algorithm:
 * 1. For each player, search Wikidata entities by name
 * 2. Score candidates: +5 for human, +8 for cricketer, +3 for cricketer in description, +2 for country match
 * 3. Extract P18 (image) from best candidate
 * 4. Build Wikimedia Commons URL with image filename
 * 5. Track unresolved players for manual curation
 * 6. Expected coverage: 60-80%
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLAYERS_FILE = path.join(__dirname, '../src/data/players.json');
const UNRESOLVED_FILE = path.join(__dirname, './unresolved-headshots.json');

const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';
const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';
const DELAY_MS = 100;
const USER_AGENT = 'CricketBingoBot/1.0 (+https://github.com/jig3r2762/cricket-bingo-v1)';

/**
 * Fetch from URL with error handling
 */
async function fetchWithTimeout(url, timeout = 10000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}

/**
 * Search Wikidata for player entity
 */
async function wdSearch(playerName, limit = 8) {
  const params = new URLSearchParams({
    action: 'wbsearchentities',
    format: 'json',
    language: 'en',
    type: 'item',
    limit: String(limit),
    search: playerName
  });

  const url = `${WIKIDATA_API}?${params.toString()}`;
  const data = await fetchWithTimeout(url);
  return data?.search || [];
}

/**
 * Fetch entity details (claims, labels, descriptions)
 */
async function wdGetEntities(ids) {
  if (!ids.length) return {};

  const params = new URLSearchParams({
    action: 'wbgetentities',
    format: 'json',
    ids: ids.join('|'),
    props: 'claims|labels|descriptions'
  });

  const url = `${WIKIDATA_API}?${params.toString()}`;
  const data = await fetchWithTimeout(url);
  return data?.entities || {};
}

/**
 * Check if entity has specific claim value
 */
function hasClaimValue(entity, prop, qid) {
  if (!entity?.claims?.[prop]) return false;
  return entity.claims[prop].some(c => c?.mainsnak?.datavalue?.value?.id === qid);
}

/**
 * Extract P18 (image filename) from entity
 */
function firstP18(entity) {
  const p18 = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  return p18 || null;
}

/**
 * Score candidate based on criteria
 */
function scoreCandidate(entity, player) {
  let score = 0;

  // +5 for human (Q5)
  if (hasClaimValue(entity, 'P31', 'Q5')) score += 5;

  // +8 for cricketer occupation (Q12299841)
  if (hasClaimValue(entity, 'P106', 'Q12299841')) score += 8;

  // +3 if description mentions cricket
  const desc = (entity?.descriptions?.en?.value || '').toLowerCase();
  if (desc.includes('cricketer')) score += 3;

  // +2 if country matches
  if (player.country) {
    const playerCountryLower = player.country.toLowerCase();
    if (desc.includes(playerCountryLower)) score += 2;
  }

  return score;
}

/**
 * Resolve player headshot using Wikidata
 */
async function resolvePlayerHeadshot(player) {
  // Step 1: Search Wikidata
  const candidates = await wdSearch(player.name);
  if (!candidates.length) return null;

  // Step 2: Fetch entity details
  const ids = candidates.map(c => c.id);
  const entities = await wdGetEntities(ids);

  // Step 3: Score and pick best
  let best = null;
  let bestScore = -1;

  for (const id of ids) {
    const entity = entities[id];
    if (!entity) continue;

    const score = scoreCandidate(entity, player);
    if (score > bestScore) {
      bestScore = score;
      best = entity;
    }
  }

  // Step 4: Extract P18 image
  if (best) {
    const filename = firstP18(best);
    if (filename) {
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=96`;
    }
  }

  return null;
}

/**
 * Sleep for N milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function
 */
async function main() {
  console.log('🏏 Enriching player headshots from Wikidata...\n');

  // Read players.json
  if (!fs.existsSync(PLAYERS_FILE)) {
    console.error('❌ players.json not found!');
    process.exit(1);
  }

  const rawData = fs.readFileSync(PLAYERS_FILE, 'utf8');
  const players = JSON.parse(rawData);

  console.log(`Found ${players.length} players`);
  console.log('Starting headshot resolution (this may take 10-15 minutes for all players)...\n');

  let successCount = 0;
  let failCount = 0;
  const unresolvedPlayers = [];

  // Process players
  for (let i = 0; i < players.length; i++) {
    const player = players[i];

    // Show progress every 50 players
    if (i % 50 === 0) {
      console.log(`Progress: ${i}/${players.length} (${successCount} images found)`);
    }

    // Resolve headshot
    const imageUrl = await resolvePlayerHeadshot(player);

    if (imageUrl) {
      player.headshot_url = imageUrl;
      successCount++;
    } else {
      player.headshot_url = ''; // Empty fallback (UI will show initials)
      failCount++;
      unresolvedPlayers.push({
        id: player.id,
        name: player.name,
        country: player.country
      });
    }

    // Respectful delay for APIs
    await sleep(DELAY_MS);
  }

  console.log(`\n✅ Enrichment complete!`);
  console.log(`Found headshots: ${successCount} players (${((successCount / players.length) * 100).toFixed(1)}%)`);
  console.log(`Not found: ${failCount} players (${((failCount / players.length) * 100).toFixed(1)}%)`);

  // Write updated players.json
  fs.writeFileSync(
    PLAYERS_FILE,
    JSON.stringify(players, null, 2),
    'utf8'
  );

  // Write unresolved players list
  fs.writeFileSync(
    UNRESOLVED_FILE,
    JSON.stringify(unresolvedPlayers, null, 2),
    'utf8'
  );

  console.log(`\n📝 Updated ${PLAYERS_FILE}`);
  console.log(`📝 Saved unresolved list to ${UNRESOLVED_FILE}`);
  console.log(`\n🎉 Done! Players now have headshot_url fields.\n`);
}

// Run
main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
