#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read players
const players = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/players.json'), 'utf8'));

// Group by country
const byCountry = {};
players.forEach(p => {
  if (!byCountry[p.country]) {
    byCountry[p.country] = [];
  }
  byCountry[p.country].push(p);
});

// Create CSV files for each country
const csvDir = path.join(__dirname, 'player-csvs-by-country');
if (!fs.existsSync(csvDir)) {
  fs.mkdirSync(csvDir, { recursive: true });
}

console.log('📊 GENERATING CSV FILES BY COUNTRY');
console.log('=====================================\n');

const createdFiles = [];

Object.entries(byCountry)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([country, countryPlayers]) => {
    // Create CSV header
    const csvLines = ['id,name,country,primaryRole,image_url'];

    // Add player rows
    countryPlayers.forEach(p => {
      const name = p.name.replace(/,/g, '');
      const role = p.primaryRole || 'Unknown';
      csvLines.push(`${p.id},${name},${country},${role},`);
    });

    // Write CSV file
    const filename = `${country.toLowerCase().replace(/\s+/g, '-')}-players.csv`;
    const filepath = path.join(csvDir, filename);
    fs.writeFileSync(filepath, csvLines.join('\n'), 'utf8');

    createdFiles.push({ filename, count: countryPlayers.length });
    console.log(`✅ ${country.padEnd(20)} → ${countryPlayers.length.toString().padStart(4)} players → ${filename}`);
  });

console.log('\n=====================================');
console.log(`📁 Total files created: ${createdFiles.length}`);
console.log(`📊 Total players: ${players.length}`);
console.log(`\n📂 Location: scripts/player-csvs-by-country/\n`);
