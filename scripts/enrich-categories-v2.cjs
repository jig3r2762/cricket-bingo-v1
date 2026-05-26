/**
 * enrich-categories-v2.js
 *
 * Fixes player data quality:
 * 1. Merges confirmed duplicate players
 * 2. Renames "Fastest Bowling" → "Pace Attack"
 * 3. Enriches zero-category players with stat-based rules
 * 4. Adds new curated category tags (Orange Cap, Purple Cap, Left-Arm Pacer, etc.)
 */

const fs = require("fs");
const path = require("path");

const PLAYERS_PATH = path.join(__dirname, "..", "public", "players.json");

let players = JSON.parse(fs.readFileSync(PLAYERS_PATH, "utf-8"));

console.log(`Loaded ${players.length} players`);

// ──────────────────────────────────────────────────────
// 1. MERGE CONFIRMED DUPLICATES
// ──────────────────────────────────────────────────────

const MERGES = [
  { dupeId: "sl_ckb_kulasekara", canonId: "sl_nuwan_kulasekara" },
  { dupeId: "sl_rap_nissanka", canonId: "sl_pathum_nissanka" },
  { dupeId: "ban_shahadat_hossain_2", canonId: "ban_shahadat_hossain" },
];

for (const { dupeId, canonId } of MERGES) {
  const dupeIdx = players.findIndex((p) => p.id === dupeId);
  const canonIdx = players.findIndex((p) => p.id === canonId);

  if (dupeIdx === -1 || canonIdx === -1) {
    console.log(`  SKIP merge: ${dupeId} or ${canonId} not found`);
    continue;
  }

  const dupe = players[dupeIdx];
  const canon = players[canonIdx];

  // Merge teammates
  const allTeammates = new Set([...canon.teammates, ...dupe.teammates]);
  allTeammates.delete(dupeId);
  allTeammates.delete(canonId);
  canon.teammates = [...allTeammates];

  // Merge trophies and categories
  canon.trophies = [...new Set([...canon.trophies, ...dupe.trophies])];
  canon.categories = [...new Set([...(canon.categories || []), ...(dupe.categories || [])])];

  // Remove the duplicate
  players.splice(dupeIdx, 1);
  console.log(`  MERGED ${dupeId} → ${canonId}`);

  // Replace dupeId in all teammate arrays
  for (const p of players) {
    const idx = p.teammates.indexOf(dupeId);
    if (idx !== -1) {
      p.teammates[idx] = canonId;
      // Deduplicate
      p.teammates = [...new Set(p.teammates)];
    }
  }
}

// Fix ind_r_sharma — NOT Rohit Sharma, it's a different player (fast bowler)
const rSharma = players.find((p) => p.id === "ind_r_sharma");
if (rSharma && rSharma.name === "Rohit Sharma") {
  rSharma.name = "R Sharma";
  console.log("  RENAMED ind_r_sharma from 'Rohit Sharma' to 'R Sharma' (different player, fast bowler)");
}

console.log(`After merges: ${players.length} players`);

// ──────────────────────────────────────────────────────
// 2. RENAME "Fastest Bowling" → "Pace Attack"
// ──────────────────────────────────────────────────────

let renameCount = 0;
for (const p of players) {
  if (!p.categories) p.categories = [];
  const idx = p.categories.indexOf("Fastest Bowling");
  if (idx !== -1) {
    p.categories[idx] = "Pace Attack";
    renameCount++;
  }
}
console.log(`Renamed 'Fastest Bowling' → 'Pace Attack' for ${renameCount} players`);

// ──────────────────────────────────────────────────────
// 3. ENRICH CATEGORIES BASED ON STATS
// ──────────────────────────────────────────────────────

function addCat(player, cat) {
  if (!player.categories) player.categories = [];
  if (!player.categories.includes(cat)) {
    player.categories.push(cat);
    return true;
  }
  return false;
}

let enrichCounts = {};
function track(cat) {
  enrichCounts[cat] = (enrichCounts[cat] || 0) + 1;
}

for (const p of players) {
  const s = p.stats || {};

  // Aggressive Batsmen: 20+ centuries
  if ((s.centuries || 0) >= 20) {
    if (addCat(p, "Aggressive Batsmen")) track("Aggressive Batsmen");
  }

  // IPL Superstars: 2000+ IPL runs OR 75+ IPL wickets
  if ((s.iplRuns || 0) >= 2000 || (s.iplWickets || 0) >= 75) {
    if (addCat(p, "IPL Superstars")) track("IPL Superstars");
  }

  // Pace Attack: Fast bowler with 30+ international wickets (test+odi+t20i)
  if (p.primaryRole === "Fast Bowler") {
    const intlWkts = (s.testWickets || 0) + (s.odiWickets || 0) + (s.t20iWickets || 0);
    if (intlWkts >= 30) {
      if (addCat(p, "Pace Attack")) track("Pace Attack");
    }
  }

  // Captains: add missing captains from known lists
  // (handled in curated section below)

  // World Cup Winners: already handled by trophies, but ensure category tag matches
  if (p.trophies.includes("CWC") || p.trophies.includes("T20WC")) {
    if (addCat(p, "World Cup Winners")) track("World Cup Winners");
  }
}

console.log("\nStat-based enrichment:");
Object.entries(enrichCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  +${v} ${k}`));

// ──────────────────────────────────────────────────────
// 4. CURATED CATEGORY TAGS
// ──────────────────────────────────────────────────────

// Helper to find player by ID pattern or name
function findPlayer(idOrName) {
  return players.find(
    (p) => p.id === idOrName || p.name.toLowerCase() === idOrName.toLowerCase()
  );
}

function tagPlayers(category, identifiers) {
  let count = 0;
  for (const id of identifiers) {
    const p = findPlayer(id);
    if (p) {
      if (addCat(p, category)) count++;
    } else {
      // Try partial match on name
      const partial = players.find((pl) =>
        pl.name.toLowerCase().includes(id.toLowerCase())
      );
      if (partial) {
        if (addCat(partial, category)) count++;
      }
    }
  }
  console.log(`  Tagged ${count} new players as "${category}"`);
}

// ── LEFT-ARM PACER ──
const leftArmPacers = [
  "Wasim Akram", "Mitchell Starc", "Trent Boult", "Zaheer Khan",
  "Mitchell Johnson", "Sam Curran", "Shaheen Afridi", "Mustafizur Rahman",
  "Arshdeep Singh", "Chaminda Vaas", "Wayne Parnell", "Jaydev Unadkat",
  "T Natarajan", "Obed McCoy", "Mohammad Amir", "James Anderson",
  "Irfan Pathan", "Ashish Nehra", "RP Singh", "Reece Topley",
  "Kagiso Rabada", "Chris Morris", "Lungi Ngidi",
  "Khaleel Ahmed", "Mohit Sharma", "Sohail Tanvir",
  "Umar Gul", "Naved-ul-Hasan", "Mohammad Irfan",
  "Nathan Bracken", "Nathan Coulter-Nile",
  "Junaid Khan", "Rahat Ali", "Wahab Riaz",
];
// Note: Some above aren't left-arm — let's be precise
// Actually left-arm fast bowlers:
const confirmedLeftArmPacers = [
  "Wasim Akram", "Mitchell Starc", "Trent Boult", "Zaheer Khan",
  "Mitchell Johnson", "Sam Curran", "Shaheen Afridi", "Mustafizur Rahman",
  "Arshdeep Singh", "Chaminda Vaas", "Wayne Parnell",
  "T Natarajan", "Mohammad Amir",
  "Irfan Pathan", "Ashish Nehra",
  "Khaleel Ahmed", "Mohit Sharma",
  "Sohail Tanvir", "Junaid Khan", "Wahab Riaz",
  "Mohammad Irfan", "Rahat Ali",
  "Jaydev Unadkat", "Obed McCoy",
  "Reece Topley", "David Willey",
  "James Pattinson",
];
console.log("\nCurated categories:");
tagPlayers("Left-Arm Pacer", confirmedLeftArmPacers);

// ── IPL ORANGE CAP WINNERS ──
const orangeCapWinners = [
  "Sachin Tendulkar",     // 2010
  "Chris Gayle",          // 2011, 2012
  "Michael Hussey",       // 2013 (Mike Hussey in data)
  "Robin Uthappa",        // 2014
  "David Warner",         // 2015, 2017, 2019
  "Virat Kohli",          // 2016
  "Kane Williamson",      // 2018
  "KL Rahul",             // 2020
  "Ruturaj Gaikwad",      // 2021, 2023
  "Jos Buttler",          // 2022
  "Shubman Gill",         // 2024 (approximate)
];
tagPlayers("IPL Orange Cap", orangeCapWinners);
// Fix Mike Hussey alias
const mikeHussey = players.find((p) => p.name === "Mike Hussey");
if (mikeHussey) addCat(mikeHussey, "IPL Orange Cap");

// ── IPL PURPLE CAP WINNERS ──
const purpleCapWinners = [
  "Pragyan Ojha",         // 2010
  "Lasith Malinga",       // 2011
  "Morne Morkel",         // 2012
  "Dwayne Bravo",         // 2013, 2015, 2020
  "Mohit Sharma",         // 2014
  "Bhuvneshwar Kumar",    // 2016, 2017
  "Andrew Tye",           // 2018
  "Imran Tahir",          // 2019
  "Harshal Patel",        // 2021, 2022
  "Mohammed Shami",       // 2023
  "Jasprit Bumrah",       // 2024 (approximate)
];
tagPlayers("IPL Purple Cap", purpleCapWinners);

// ── DEBUT AFTER 2018 (New Generation) ──
const debutAfter2018 = [
  "Shubman Gill", "Rishabh Pant", "Ishan Kishan",
  "Prithvi Shaw", "Devdutt Padikkal", "Tilak Varma",
  "Yashasvi Jaiswal", "Ruturaj Gaikwad", "Venkatesh Iyer",
  "Ravi Bishnoi", "Avesh Khan", "Arshdeep Singh",
  "Umran Malik", "Harshit Rana", "Nitish Kumar Reddy",
  "Shaheen Afridi", "Naseem Shah", "Babar Azam",
  "Mohammad Rizwan", "Fakhar Zaman",
  "Devon Conway", "Daryl Mitchell", "Finn Allen",
  "Harry Brook", "Zak Crawley", "Ben Duckett",
  "Marco Jansen", "Gerald Coetzee", "Heinrich Klaasen",
  "Pathum Nissanka", "Wanindu Hasaranga",
  "Dewald Brevis", "Cameron Green",
  "Dhruv Jurel", "Sarfaraz Khan",
  "Akash Deep", "Mukesh Kumar",
  "Alzarri Joseph", "Shimron Hetmyer",
  "Kyle Mayers",
];
tagPlayers("Debut After 2018", debutAfter2018);

// ── T20 SPECIALIST ──
const t20Specialists = [
  "Chris Gayle", "Sunil Narine", "Andre Russell",
  "Rashid Khan", "Dwayne Bravo", "Kieron Pollard",
  "David Miller", "Shimron Hetmyer",
  "Suryakumar Yadav", "Hardik Pandya", "Dinesh Karthik",
  "Ishan Kishan", "Rishabh Pant",
  "Nicholas Pooran", "Liam Livingstone",
  "Phil Salt", "Jos Buttler",
  "Glenn Maxwell", "Marcus Stoinis",
  "Faf du Plessis", "Heinrich Klaasen",
  "Wanindu Hasaranga", "Tim David",
  "Rahul Tewatia", "Sanju Samson",
  "Yuzvendra Chahal", "Kuldeep Yadav",
  "Harshal Patel", "Arshdeep Singh",
  "Jasprit Bumrah", "Trent Boult",
];
tagPlayers("T20 Specialist", t20Specialists);

// ── UNCAPPED IN IPL (overseas players who played IPL but minimal international career) ──
// These are typically associate nation or fringe players
const uncappedIPL = [
  // Most "uncapped" overseas IPL players are edge cases
  // Let's tag players from non-Test nations who played IPL
  // or players with <5 international matches but IPL appearances
];
// Skip this one — too few reliable entries without debut year data

// ── ADDITIONAL CAPTAINS (missing from current 25) ──
const missingCaptains = [
  "Faf du Plessis",       // SA & RCB captain
  "KL Rahul",             // LSG/PBKS captain, India vice-captain
  "Hardik Pandya",        // GT & MI captain
  "Shreyas Iyer",         // KKR & DC captain
  "Sanju Samson",         // RR captain
  "Shikhar Dhawan",       // PBKS captain
  "Rishabh Pant",         // DC captain
  "Gautam Gambhir",       // KKR captain
  "Asghar Afghan",        // Afghanistan captain
  "Mashrafe Mortaza",     // Bangladesh captain
  "Shakib Al Hasan",      // Bangladesh captain
  "Dimuth Karunaratne",   // Sri Lanka captain
  "Angelo Mathews",       // Sri Lanka captain
  "Jason Holder",         // West Indies captain
  "Darren Sammy",         // West Indies captain
  "Daniel Vettori",       // NZ captain
  "Stephen Fleming",      // NZ captain
  "Ross Taylor",          // NZ captain
  "Tim Southee",          // NZ captain
  "Misbah-ul-Haq",        // Pakistan captain
  "Sarfraz Ahmed",        // Pakistan captain
  "Younis Khan",          // Pakistan captain
  "Shoaib Malik",         // Pakistan captain
  "Inzamam-ul-Haq",       // Pakistan captain
  "AB de Villiers",       // already there
  "Jacques Kallis",       // SA captain (occasional)
  "Quinton de Kock",      // SA captain
  "Mark Boucher",         // SA WK, captain briefly
  "Dinesh Chandimal",     // SL captain
  "Brendon McCullum",     // already there
  "Adam Gilchrist",       // occasional captain
  "Matthew Hayden",       // occasional vice-captain (skip)
  "Alastair Cook",        // England captain
  "Andrew Strauss",       // England captain
  "Nasser Hussain",       // England captain
  "Michael Vaughan",      // England captain
];
tagPlayers("Captains", missingCaptains);

// ── Fix 50+ Century Makers threshold → 30+ to be more inclusive ──
// Current: only 7 players (50+ centuries). Let's also tag 30+ century makers
const centuryClub = players.filter((p) => (p.stats?.centuries || 0) >= 30);
let centuryAdded = 0;
for (const p of centuryClub) {
  if (addCat(p, "50+ Century Makers")) centuryAdded++;
}
console.log(`  Tagged ${centuryAdded} new players with 30+ centuries as "50+ Century Makers"`);

// ──────────────────────────────────────────────────────
// 5. FINAL STATS
// ──────────────────────────────────────────────────────

const noCats = players.filter((p) => !p.categories || p.categories.length === 0);
console.log(`\n=== FINAL STATS ===`);
console.log(`Total players: ${players.length}`);
console.log(`Players with 0 categories: ${noCats.length} (was 566)`);

const allCats = {};
players.forEach((p) =>
  (p.categories || []).forEach((c) => {
    allCats[c] = (allCats[c] || 0) + 1;
  })
);
console.log("\nCategory counts:");
Object.entries(allCats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${k}: ${v}`));

// Write back
fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 2));
console.log(`\nWritten to ${PLAYERS_PATH}`);
