#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLAYERS_FILE = path.join(__dirname, '../src/data/players.json');

/**
 * Categorize players based on their stats
 */
function categorizePlayers() {
  const players = JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf8'));

  console.log('📊 ADDING NEW CATEGORIES TO PLAYERS\n');

  const categoryStats = {
    'Captains': 0,
    '100+ Century Makers': 0,
    'Fastest Bowling': 0,
    'Aggressive Batsmen': 0,
    'World Cup Winners': 0,
    'IPL Superstars': 0
  };

  // Process each player
  players.forEach(player => {
    player.categories = [];
    const stats = player.stats || {};

    // 1. CAPTAINS - Players who captained their country
    // Criteria: Non-retired players with high career value (proxy for captaincy)
    const totalMatches = (stats.testMatches || 0) + (stats.odiMatches || 0) + (stats.t20iMatches || 0);
    const isSeniorPlayer = totalMatches >= 20 && stats.totalRuns >= 500;
    const captainCandidates = ['Virat Kohli', 'Rohit Sharma', 'Kane Williamson', 'Steve Smith', 'Joe Root', 'Babar Azam', 'Ben Stokes', 'Pat Cummins', 'David Warner', 'AB de Villiers', 'MS Dhoni', 'Shahid Afridi', 'Kumar Sangakkara', 'Graeme Smith', 'Michael Clarke', 'Eoin Morgan', 'Brendon McCullum', 'Mahela Jayawardene', 'Ricky Ponting', 'Brian Lara', 'Steve Waugh', 'Aravinda de Silva', 'Wasim Akram', 'Imran Khan', 'Sanath Jayasuriya', 'Virender Sehwag', 'Sourav Ganguly', 'Rahul Dravid', 'Ajinkya Rahane', 'Sachin Tendulkar'];
    if (isSeniorPlayer && captainCandidates.includes(player.name)) {
      player.categories.push('Captains');
      categoryStats['Captains']++;
    }

    // 2. 100+ CENTURY MAKERS - Players with 50+ centuries (top performers)
    if (stats.centuries >= 50) {
      player.categories.push('100+ Century Makers');
      categoryStats['100+ Century Makers']++;
    }

    // 3. FASTEST BOWLING - Fast bowlers (role-based, 140+ kmph indicator)
    // Proxy: Fast bowlers with high wicket count relative to matches
    const isFastBowler = player.primaryRole && (player.primaryRole.includes('Bowler') || player.primaryRole.includes('Pacer')) && !player.primaryRole.includes('Spin');
    const hasGoodBowlingRecord = ((stats.testWickets || 0) + (stats.odiWickets || 0) + (stats.t20iWickets || 0)) >= 30;
    if (isFastBowler && hasGoodBowlingRecord) {
      player.categories.push('Fastest Bowling');
      categoryStats['Fastest Bowling']++;
    }

    // 4. AGGRESSIVE BATSMEN - High strike rate players
    // Proxy: High runs with decent match count (aggressive scoring)
    const totalBattingMatches = (stats.testMatches || 0) + (stats.odiMatches || 0) + (stats.t20iMatches || 0);
    const strikeRateProxy = totalBattingMatches > 0 ? stats.totalRuns / totalBattingMatches : 0;
    const isBatsman = player.primaryRole && (player.primaryRole.includes('Batsman') || player.primaryRole.includes('WK'));
    if (isBatsman && strikeRateProxy >= 45 && stats.totalRuns >= 2000) {
      player.categories.push('Aggressive Batsmen');
      categoryStats['Aggressive Batsmen']++;
    }

    // 5. WORLD CUP WINNERS - Players who won ICC tournaments (CWC = Cricket World Cup)
    const trophies = player.trophies || [];
    if (trophies.includes('CWC') || trophies.includes('T20WC') || trophies.includes('CT')) {
      player.categories.push('World Cup Winners');
      categoryStats['World Cup Winners']++;
    }

    // 6. IPL SUPERSTARS - Top IPL performers
    // Criteria: 2000+ IPL runs OR 30+ IPL matches with 500+ runs
    const iplRuns = stats.iplRuns || 0;
    const iplMatches = stats.iplMatches || 0;
    if (iplRuns >= 2000 || (iplMatches >= 30 && iplRuns >= 500)) {
      player.categories.push('IPL Superstars');
      categoryStats['IPL Superstars']++;
    }
  });

  // Write updated players
  fs.writeFileSync(PLAYERS_FILE, JSON.stringify(players, null, 2), 'utf8');

  console.log('✅ Category Distribution:\n');
  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`  ${category.padEnd(25)} → ${count} players`);
  });

  console.log(`\n📝 Updated ${PLAYERS_FILE}`);
  console.log(`Total unique category assignments: ${Object.values(categoryStats).reduce((a, b) => a + b, 0)}`);
  console.log(`Average categories per player: ${(Object.values(categoryStats).reduce((a, b) => a + b, 0) / players.length).toFixed(2)}\n`);
}

categorizePlayers();
