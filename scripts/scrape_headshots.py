"""
Scrape player headshot images from ESPN CDN using ESPNcricinfo player IDs.
Maps player names -> cricinfo IDs via Cricsheet register, then builds ESPN CDN URLs.

URL pattern: https://a.espncdn.com/i/headshots/cricket/players/full/{cricinfo_id}.png

Usage: python scripts/scrape_headshots.py
"""

import csv
import io
import json
import sys
import time
import requests
from pathlib import Path

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)

PLAYERS_PATH = Path(__file__).parent.parent / "public" / "players.json"
REPORT_PATH = Path(__file__).parent.parent / "headshot_report.csv"
CRICSHEET_REGISTER_URL = "https://cricsheet.org/register/people.csv"
ESPN_CDN_URL = "https://a.espncdn.com/i/headshots/cricket/players/full/{pid}.png"

# Manual overrides: our player_id -> cricinfo ID
# For the 14 unmatched players (mostly Sri Lankan name spelling differences)
MANUAL_CRICINFO_IDS = {
    "sl_mahela_jayawardene": 49234,
    "ind_dinesh_karthik": 30045,
    "sl_dinesh_chandimal": 300628,
    "sl_kusal_mendis": 642509,
    "sl_upul_tharanga": 49538,
    "sl_nuwan_kulasekara": 49539,
    "sl_lahiru_thirimanne": 446508,
    "sa_albie_morkel": 46538,
    "sl_wanindu_hasaranga": 903619,
    "sl_dasun_shanaka": 559434,
    "sl_rangana_herath": 49178,
    "sl_suranga_lakmal": 298686,
    "sl_dushmantha_chameera": 559435,
    "sl_ajantha_mendis": 244502,
}


def download_cricsheet_register():
    """Download and parse the Cricsheet people register."""
    print("Downloading Cricsheet register...")
    r = requests.get(CRICSHEET_REGISTER_URL, timeout=30)
    r.raise_for_status()
    reader = csv.DictReader(io.StringIO(r.text))
    rows = list(reader)
    print(f"  {len(rows)} entries loaded")
    return rows


def build_name_lookup(register):
    """Build a name -> cricinfo_id lookup from the register."""
    lookup = {}
    for row in register:
        cricinfo_id = row.get("key_cricinfo", "").strip()
        if cricinfo_id:
            name = row["name"].strip().lower()
            unique_name = row.get("unique_name", "").strip().lower()
            lookup[name] = cricinfo_id
            if unique_name and unique_name != name:
                lookup[unique_name] = cricinfo_id
    return lookup


def find_cricinfo_id(player, name_lookup):
    """Find the ESPNcricinfo ID for a player."""
    pid = player["id"]
    name = player["name"].strip()

    # 1. Check manual overrides first
    if pid in MANUAL_CRICINFO_IDS:
        return str(MANUAL_CRICINFO_IDS[pid])

    # 2. Exact name match
    cricinfo_id = name_lookup.get(name.lower())
    if cricinfo_id:
        return cricinfo_id

    # 3. Try first + last name only
    parts = name.split()
    if len(parts) >= 2:
        short = f"{parts[0]} {parts[-1]}".lower()
        cricinfo_id = name_lookup.get(short)
        if cricinfo_id:
            return cricinfo_id

    # 4. Try matching by last name + first initial
    if len(parts) >= 2:
        last = parts[-1].lower()
        first_initial = parts[0][0].lower()
        for key, cid in name_lookup.items():
            key_parts = key.split()
            if len(key_parts) >= 2:
                if key_parts[-1] == last and key_parts[0].startswith(first_initial):
                    return cid

    return None


def verify_image_exists(cricinfo_id):
    """Check if the ESPN CDN has a headshot for this player ID."""
    url = ESPN_CDN_URL.format(pid=cricinfo_id)
    try:
        r = requests.head(url, timeout=5)
        content_length = int(r.headers.get("content-length", 0))
        # Valid images are > 1KB (tiny responses are placeholder/error images)
        return r.status_code == 200 and content_length > 1000
    except Exception:
        return False


def main():
    # Load players
    print(f"Loading players from {PLAYERS_PATH}")
    with open(PLAYERS_PATH, "r", encoding="utf-8") as f:
        players = json.load(f)
    print(f"  {len(players)} players loaded")

    # Download cricsheet register and build lookup
    register = download_cricsheet_register()
    name_lookup = build_name_lookup(register)
    print(f"  {len(name_lookup)} name->cricinfo mappings")

    # Process each player
    updated = 0
    verified = 0
    no_id = 0
    no_image = 0
    report_lines = ["id,name,country,cricinfo_id,status,headshot_url"]

    for i, player in enumerate(players):
        pid = player["id"]
        name = player["name"]
        country = player.get("country", "")

        # Find cricinfo ID
        cricinfo_id = find_cricinfo_id(player, name_lookup)

        if not cricinfo_id:
            no_id += 1
            print(f"[{i+1}/{len(players)}] {name} ({country}) — NO CRICINFO ID")
            report_lines.append(f'{pid},"{name}",{country},,no_id,')
            continue

        # Build ESPN CDN URL
        espn_url = ESPN_CDN_URL.format(pid=cricinfo_id)

        # Verify image exists
        exists = verify_image_exists(cricinfo_id)

        if exists:
            player["headshot_url"] = espn_url
            verified += 1
            status = "updated"
            if (i + 1) % 50 == 0 or i < 10:
                print(f"[{i+1}/{len(players)}] {name} — OK ({cricinfo_id})")
        else:
            no_image += 1
            status = "no_image"
            print(f"[{i+1}/{len(players)}] {name} — NO IMAGE on ESPN CDN ({cricinfo_id})")

        report_lines.append(f'{pid},"{name}",{country},{cricinfo_id},{status},"{espn_url if exists else ""}"')

        # Rate limit: ~10 requests/sec (just HEAD requests)
        time.sleep(0.1)

    # Save updated players
    print(f"\nSaving to {PLAYERS_PATH}...")
    with open(PLAYERS_PATH, "w", encoding="utf-8") as f:
        json.dump(players, f, ensure_ascii=False)

    # Save report
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))

    print(f"\n{'='*40}")
    print(f"RESULTS")
    print(f"{'='*40}")
    print(f"Total players:       {len(players)}")
    print(f"Updated with image:  {verified}")
    print(f"No image on ESPN:    {no_image}")
    print(f"No cricinfo ID:      {no_id}")
    print(f"Report saved to:     {REPORT_PATH}")


if __name__ == "__main__":
    main()
