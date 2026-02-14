#!/usr/bin/env node

/**
 * Fetch player headshot images from Wikimedia Commons
 * Usage: node scripts/fetch-player-images.js
 *
 * This script:
 * 1. Reads all players from src/data/players.json
 * 2. Searches Wikimedia for each player's image
 * 3. Adds headshot_url field to each player
 * 4. Writes updated JSON back to file
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLAYERS_FILE = path.join(__dirname, '../src/data/players.json');
const API_BASE = 'https://en.wikipedia.org/w/api.php';
const DELAY_MS = 100; // Delay between API calls (be nice to Wikimedia)

/**
 * Fetch image URL from Wikimedia for a player
 */
async function fetchPlayerImage(playerName) {
  return new Promise((resolve) => {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      titles: playerName,
      prop: 'pageimages',
      pithumbsize: '250'
    });

    const url = `${API_BASE}?${params.toString()}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query?.pages || {};
          const firstPage = Object.values(pages)[0];
          const imageUrl = firstPage?.thumbnail?.source;
          resolve(imageUrl || '');
        } catch (e) {
          resolve('');
        }
      });
    }).on('error', () => {
      resolve('');
    });

    // Timeout after 5 seconds
    setTimeout(() => resolve(''), 5000);
  });
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
  console.log('📸 Fetching player headshot images from Wikimedia Commons...\n');

  // Read players.json
  if (!fs.existsSync(PLAYERS_FILE)) {
    console.error('❌ players.json not found!');
    process.exit(1);
  }

  const rawData = fs.readFileSync(PLAYERS_FILE, 'utf8');
  const players = JSON.parse(rawData);

  console.log(`Found ${players.length} players`);
  console.log('Starting image fetch (this may take 5-10 minutes for all players)...\n');

  let successCount = 0;
  let failCount = 0;

  // Process players
  for (let i = 0; i < players.length; i++) {
    const player = players[i];

    // Show progress every 50 players
    if (i % 50 === 0) {
      console.log(`Progress: ${i}/${players.length} (${successCount} images found)`);
    }

    // Fetch image
    const imageUrl = await fetchPlayerImage(player.name);

    if (imageUrl) {
      player.headshot_url = imageUrl;
      successCount++;
    } else {
      player.headshot_url = ''; // Empty fallback
      failCount++;
    }

    // Respectful delay
    await sleep(DELAY_MS);
  }

  console.log(`\n✅ Fetch complete!`);
  console.log(`Found images for: ${successCount} players`);
  console.log(`Not found: ${failCount} players`);

  // Write back to file
  fs.writeFileSync(
    PLAYERS_FILE,
    JSON.stringify(players, null, 2),
    'utf8'
  );

  console.log(`\n📝 Updated ${PLAYERS_FILE}`);
  console.log('🎉 Done! Players now have headshot_url fields.\n');
}

// Run
main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
