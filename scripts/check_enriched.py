#!/usr/bin/env python3
"""
Quick sanity-check: compare players_enriched.json vs public/players.json
Shows which players changed and by how much.
"""
import json
from pathlib import Path

if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SCRIPT_DIR = Path(__file__).resolve().parent
OLD_FILE   = SCRIPT_DIR.parent / "public" / "players.json"
NEW_FILE   = SCRIPT_DIR / "players_enriched.json"

with open(OLD_FILE, encoding="utf-8") as f:
    old_players = {p["id"]: p for p in json.load(f)}
with open(NEW_FILE, encoding="utf-8") as f:
    new_players = {p["id"]: p for p in json.load(f)}

changes = []
for pid, new in new_players.items():
    old = old_players.get(pid)
    if not old:
        continue
    os_ = old["stats"]
    ns  = new["stats"]
    if ns["totalRuns"] != os_["totalRuns"] or ns["totalWickets"] != os_["totalWickets"]:
        changes.append({
            "name":    new["name"],
            "country": new["country"],
            "old_runs": os_["totalRuns"],
            "new_runs": ns["totalRuns"],
            "old_wkts": os_["totalWickets"],
            "new_wkts": ns["totalWickets"],
            "old_tests": os_["testMatches"],
            "new_tests": ns["testMatches"],
        })

changes.sort(key=lambda x: x["new_runs"] - x["old_runs"], reverse=True)

print(f"\nPlayers changed: {len(changes)}\n")
print(f"{'Name':<30} {'Country':<14} {'Runs Before':>12} {'Runs After':>12} {'Change':>10}  Tests")
print("-" * 95)
for c in changes:
    diff = c["new_runs"] - c["old_runs"]
    sign = "+" if diff >= 0 else ""
    print(
        f"{c['name']:<30} {c['country']:<14} "
        f"{c['old_runs']:>12,} {c['new_runs']:>12,} "
        f"{sign+str(diff):>10}  "
        f"{c['old_tests']} → {c['new_tests']} tests"
    )

# Stats summary
if changes:
    total_new_10k = sum(1 for p in new_players.values() if p["stats"]["totalRuns"] >= 10000)
    total_old_10k = sum(1 for p in old_players.values() if p["stats"]["totalRuns"] >= 10000)
    print(f"\n10K+ run players: {total_old_10k} → {total_new_10k}")

    new_300wkt = sum(1 for p in new_players.values() if p["stats"]["totalWickets"] >= 300)
    old_300wkt = sum(1 for p in old_players.values() if p["stats"]["totalWickets"] >= 300)
    print(f"300+ wicket takers: {old_300wkt} → {new_300wkt}")
