#!/usr/bin/env node

/**
 * Fetch cricket player images from free sources:
 * - Wikimedia Commons API
 * - Wikipedia images
 *
 * All images are CC-licensed or public domain
 * Legal and free to use
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLAYERS_FILE = path.join(__dirname, '../src/data/players.json');

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';
const DELAY_MS = 200;
const USER_AGENT = 'CricketBingoBot/1.0 (+https://github.com/cricket-bingo)';

/**
 * Fetch with timeout and error handling
 */
async function fetchJSON(url, timeout = 10000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    return null;
  }
}

/**
 * Search Wikimedia Commons for player images
 */
async function searchCommonsImage(playerName) {
  // Search for cricket player images
  const searchUrl = `${COMMONS_API}?action=query&format=json&list=search&srsearch=${encodeURIComponent(playerName + ' cricket')}&srwhat=text&srlimit=5`;

  const data = await fetchJSON(searchUrl);
  if (!data?.query?.search?.length) return null;

  // Get first result's image page
  const title = data.query.search[0].title;

  // Get images from that page
  const imagesUrl = `${COMMONS_API}?action=query&format=json&titles=${encodeURIComponent(title)}&prop=imageinfo|images&iiprop=url&iiurlwidth=96`;
  const imagesData = await fetchJSON(imagesUrl);

  if (!imagesData?.query?.pages) return null;

  for (const pageId in imagesData.query.pages) {
    const page = imagesData.query.pages[pageId];

    // Try to get direct image URL
    if (page.imageinfo?.length > 0) {
      const url = page.imageinfo[0].thumburl || page.imageinfo[0].url;
      if (url && url.includes('thumb')) return url;
      if (url) return url + '?width=96';
    }
  }

  return null;
}

/**
 * Search Wikipedia for player article and extract image
 */
async function searchWikipediaImage(playerName) {
  // Search for player page
  const searchUrl = `${WIKIPEDIA_API}?action=query&format=json&list=search&srsearch=${encodeURIComponent(playerName + ' cricketer')}&srlimit=1`;

  const data = await fetchJSON(searchUrl);
  if (!data?.query?.search?.length) return null;

  const pageName = data.query.search[0].title;

  // Get page images
  const pageUrl = `${WIKIPEDIA_API}?action=query&format=json&titles=${encodeURIComponent(pageName)}&prop=pageimages&piprop=thumbnail&pithumbsize=96`;
  const pageData = await fetchJSON(pageUrl);

  if (!pageData?.query?.pages) return null;

  for (const pageId in pageData.query.pages) {
    const page = pageData.query.pages[pageId];
    if (page.thumbnail?.source) {
      return page.thumbnail.source;
    }
  }

  return null;
}

/**
 * Resolve player image from free sources
 */
async function resolvePlayerImage(player) {
  // Try Wikimedia Commons first
  let imageUrl = await searchCommonsImage(player.name);
  if (imageUrl) return imageUrl;

  // Fall back to Wikipedia
  imageUrl = await searchWikipediaImage(player.name);
  if (imageUrl) return imageUrl;

  return null;
}

/**
 * Sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main
 */
async function main() {
  console.log('🏏 Fetching cricket player images from free sources...\n');
  console.log('Sources: Wikimedia Commons + Wikipedia (CC-licensed & free)\n');

  if (!fs.existsSync(PLAYERS_FILE)) {
    console.error('❌ players.json not found!');
    process.exit(1);
  }

  const players = JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf8'));

  console.log(`Found ${players.length} players`);
  console.log('Starting image search (this will take 30-45 minutes)...\n');

  let successCount = 0;
  let failCount = 0;
  const unresolved = [];

  // Process players
  for (let i = 0; i < players.length; i++) {
    const player = players[i];

    // Show progress
    if (i % 100 === 0) {
      console.log(`Progress: ${i}/${players.length} (${successCount} images found)`);
    }

    // Resolve image
    const imageUrl = await resolvePlayerImage(player);

    if (imageUrl) {
      player.headshot_url = imageUrl;
      successCount++;
    } else {
      player.headshot_url = '';
      failCount++;
      unresolved.push({
        id: player.id,
        name: player.name,
        country: player.country
      });
    }

    // Respectful delay
    await sleep(DELAY_MS);
  }

  console.log(`\n✅ Image search complete!`);
  console.log(`Found: ${successCount} players (${((successCount / players.length) * 100).toFixed(1)}%)`);
  console.log(`Not found: ${failCount} players (${((failCount / players.length) * 100).toFixed(1)}%)`);

  // Save updated players
  fs.writeFileSync(PLAYERS_FILE, JSON.stringify(players, null, 2), 'utf8');
  console.log(`\n📝 Updated ${PLAYERS_FILE}`);

  // Save unresolved list
  const unresolvedFile = path.join(__dirname, './unresolved-players.json');
  fs.writeFileSync(unresolvedFile, JSON.stringify(unresolved, null, 2), 'utf8');
  console.log(`📝 Saved unresolved list to ${unresolvedFile}`);

  console.log(`\n🎉 Done! All players now have headshot_url (or empty if not found).\n`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
