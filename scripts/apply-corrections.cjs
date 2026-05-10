const fs = require("fs");
const path = require("path");

const playersPath = path.join(__dirname, "../public/players.json");
const correctionsPath = path.join(__dirname, "./corrections.json");

const players = JSON.parse(fs.readFileSync(playersPath, "utf-8"));
const corrections = JSON.parse(fs.readFileSync(correctionsPath, "utf-8"));

const stats = {
  iplTeamsAdded: 0,
  rolesFixed: 0,
  trophiesAdded: 0,
  trophiesRemoved: 0,
};

const log = [];

// 1. IPL defunct team successors
const successors = corrections.iplTeamSuccessors || {};
delete successors._comment;

players.forEach((p) => {
  if (!p.iplTeams?.length) return;
  const toAdd = [];
  p.iplTeams.forEach((team) => {
    const successor = successors[team];
    if (successor && !p.iplTeams.includes(successor)) {
      toAdd.push(successor);
    }
  });
  if (toAdd.length) {
    log.push(`  IPL: ${p.name} (${p.id}) → added ${toAdd.join(", ")}`);
    p.iplTeams.push(...toAdd);
    stats.iplTeamsAdded += toAdd.length;
  }
});

// 2. Role corrections
const roleCorrections = corrections.roleCorrections || {};
delete roleCorrections._comment;

Object.entries(roleCorrections).forEach(([id, newRole]) => {
  const p = players.find((x) => x.id === id);
  if (!p) {
    log.push(`  WARN: Player not found for role correction: ${id}`);
    return;
  }
  if (p.primaryRole === newRole) return;
  log.push(`  Role: ${p.name} → ${p.primaryRole} → ${newRole}`);
  p.primaryRole = newRole;
  stats.rolesFixed++;
});

// 3. Trophy additions
const trophyAdditions = corrections.trophyAdditions || {};
delete trophyAdditions._comment;

Object.entries(trophyAdditions).forEach(([id, trophies]) => {
  const p = players.find((x) => x.id === id);
  if (!p) {
    log.push(`  WARN: Player not found for trophy addition: ${id}`);
    return;
  }
  trophies.forEach((trophy) => {
    if (!p.trophies.includes(trophy)) {
      p.trophies.push(trophy);
      log.push(`  Trophy+: ${p.name} → added ${trophy}`);
      stats.trophiesAdded++;
    }
  });
});

// 4. Trophy removals
const trophyRemovals = corrections.trophyRemovals || {};
delete trophyRemovals._comment;

Object.entries(trophyRemovals).forEach(([id, trophies]) => {
  const p = players.find((x) => x.id === id);
  if (!p) {
    log.push(`  WARN: Player not found for trophy removal: ${id}`);
    return;
  }
  trophies.forEach((trophy) => {
    const idx = p.trophies.indexOf(trophy);
    if (idx !== -1) {
      p.trophies.splice(idx, 1);
      log.push(`  Trophy-: ${p.name} → removed ${trophy}`);
      stats.trophiesRemoved++;
    }
  });
});

// Write back
fs.writeFileSync(playersPath, JSON.stringify(players, null, 2), "utf-8");

console.log("\nCorrections applied to public/players.json");
console.log("─".repeat(50));
console.log(`  IPL team successors added : ${stats.iplTeamsAdded}`);
console.log(`  Roles fixed               : ${stats.rolesFixed}`);
console.log(`  Trophies added            : ${stats.trophiesAdded}`);
console.log(`  Trophies removed          : ${stats.trophiesRemoved}`);
console.log("─".repeat(50));
console.log("\nChange log:");
log.forEach((l) => console.log(l));

// Print new role distribution
const roleDist = {};
players.forEach((p) => { roleDist[p.primaryRole] = (roleDist[p.primaryRole] || 0) + 1; });
console.log("\nRole distribution after corrections:");
Object.entries(roleDist).sort((a,b) => b[1]-a[1]).forEach(([r,c]) => console.log(`  ${r}: ${c}`));
