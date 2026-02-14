#!/usr/bin/env python3
"""
Cricket Bingo — Player Data Collector
======================================
Downloads and processes Cricsheet open-source cricket data to build
a comprehensive 500+ player database for the Cricket Bingo game.

Data Source : https://cricsheet.org  (Open Data, CC-BY-4.0)
Output      : ../src/data/players.json

Usage:
    python collect_data.py                   # Full run (download + process)
    python collect_data.py --skip-download   # Re-process without re-downloading
    python collect_data.py --quick           # Dev mode: process only 200 matches per format
"""

import argparse
import csv
import json
import os
import re
import sys
import time
import zipfile
from collections import defaultdict
from io import TextIOWrapper
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlretrieve

# Fix Windows console encoding for Unicode output
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ════════════════════════════════════════════════════════════════
#  CONFIGURATION
# ════════════════════════════════════════════════════════════════

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR / "cricsheet_data"
OUTPUT_DIR = SCRIPT_DIR.parent / "src" / "data"
OUTPUT_FILE = OUTPUT_DIR / "players.json"

CRICSHEET_ZIPS = {
    "tests":  "https://cricsheet.org/downloads/tests_json.zip",
    "odis":   "https://cricsheet.org/downloads/odis_json.zip",
    "t20s":   "https://cricsheet.org/downloads/t20s_json.zip",
    "ipl":    "https://cricsheet.org/downloads/ipl_json.zip",
}

PEOPLE_CSV_URL = "https://cricsheet.org/register/people.csv"

# Format key → canonical format name used in our schema
FORMAT_NAMES = {
    "tests": "Test",
    "odis":  "ODI",
    "t20s":  "T20I",
    "ipl":   "IPL",
}

# ── IPL franchise full name → abbreviation ──────────────────────

IPL_TEAM_MAP = {
    "Mumbai Indians":                 "MI",
    "Chennai Super Kings":            "CSK",
    "Royal Challengers Bangalore":    "RCB",
    "Royal Challengers Bengaluru":    "RCB",
    "Kolkata Knight Riders":          "KKR",
    "Delhi Capitals":                 "DC",
    "Delhi Daredevils":               "DC",
    "Sunrisers Hyderabad":            "SRH",
    "Rajasthan Royals":               "RR",
    "Punjab Kings":                   "PBKS",
    "Kings XI Punjab":                "PBKS",
    "Gujarat Titans":                 "GT",
    "Lucknow Super Giants":           "LSG",
    "Rising Pune Supergiant":         "RPS",
    "Rising Pune Supergiants":        "RPS",
    "Gujarat Lions":                  "GL",
    "Deccan Chargers":                "DCH",
    "Pune Warriors":                  "PW",
    "Pune Warriors India":            "PW",
    "Kochi Tuskers Kerala":           "KTK",
}

# ── Country name → ISO-3 code ──────────────────────────────────

COUNTRY_CODES = {
    "India": "IND", "Australia": "AUS", "England": "ENG",
    "South Africa": "SA", "New Zealand": "NZ", "Pakistan": "PAK",
    "Sri Lanka": "SL", "West Indies": "WI", "Bangladesh": "BAN",
    "Afghanistan": "AFG", "Zimbabwe": "ZIM", "Ireland": "IRE",
    "Scotland": "SCO", "Netherlands": "NED", "Nepal": "NEP",
    "United Arab Emirates": "UAE", "Oman": "OMA", "Namibia": "NAM",
    "Papua New Guinea": "PNG", "United States of America": "USA",
    "Canada": "CAN", "Kenya": "KEN", "Hong Kong": "HK",
    "Bermuda": "BER", "Jersey": "JEY", "U.S.A.": "USA",
    "U.A.E.": "UAE", "USA": "USA", "UAE": "UAE",
}

# ── Country name → emoji flag ──────────────────────────────────

COUNTRY_FLAGS = {
    "India": "\U0001f1ee\U0001f1f3",
    "Australia": "\U0001f1e6\U0001f1fa",
    "England": "\U0001f3f4\U000e0067\U000e0062\U000e0065\U000e006e\U000e0067\U000e007f",
    "South Africa": "\U0001f1ff\U0001f1e6",
    "New Zealand": "\U0001f1f3\U0001f1ff",
    "Pakistan": "\U0001f1f5\U0001f1f0",
    "Sri Lanka": "\U0001f1f1\U0001f1f0",
    "West Indies": "\U0001f3dd\ufe0f",
    "Bangladesh": "\U0001f1e7\U0001f1e9",
    "Afghanistan": "\U0001f1e6\U0001f1eb",
    "Zimbabwe": "\U0001f1ff\U0001f1fc",
    "Ireland": "\U0001f1ee\U0001f1ea",
    "Scotland": "\U0001f3f4\U000e0067\U000e0062\U000e0073\U000e0063\U000e0074\U000e007f",
    "Netherlands": "\U0001f1f3\U0001f1f1",
    "Nepal": "\U0001f1f3\U0001f1f5",
    "United Arab Emirates": "\U0001f1e6\U0001f1ea",
    "Oman": "\U0001f1f4\U0001f1f2",
    "Namibia": "\U0001f1f3\U0001f1e6",
    "Papua New Guinea": "\U0001f1f5\U0001f1ec",
    "United States of America": "\U0001f1fa\U0001f1f8",
    "Canada": "\U0001f1e8\U0001f1e6",
    "Kenya": "\U0001f1f0\U0001f1ea",
    "Hong Kong": "\U0001f1ed\U0001f1f0",
}

# ── Curated role overrides ──────────────────────────────────────
# Substring matching: if any entry below is contained in a player's
# full name (case-insensitive), the override applies.
# This handles Cricsheet name variants like "R Ashwin" vs "Ravichandran Ashwin".

KNOWN_SPINNERS = [
    # Full names
    "Shane Warne", "Muttiah Muralitharan", "Anil Kumble", "Rashid Khan",
    "Ravichandran Ashwin", "Ravindra Jadeja", "Yuzvendra Chahal", "Nathan Lyon",
    "Graeme Swann", "Harbhajan Singh", "Daniel Vettori", "Imran Tahir",
    "Adil Rashid", "Kuldeep Yadav", "Sunil Narine", "Saqlain Mushtaq",
    "Danish Kaneria", "Moeen Ali", "Axar Patel", "Washington Sundar",
    "Varun Chakravarthy", "Tabraiz Shamsi", "Ish Sodhi",
    "Mitchell Santner", "Adam Zampa", "Shadab Khan", "Shakib Al Hasan",
    "Amit Mishra", "Piyush Chawla", "Rahul Chahar", "Ravi Bishnoi",
    "Wanindu Hasaranga", "Maheesh Theekshana", "Yasir Shah",
    "Ajantha Mendis", "Rangana Herath", "Monty Panesar",
    "Shahid Afridi", "Saeed Ajmal", "Keshav Maharaj",
    "Sandeep Lamichhane", "Qais Ahmad", "Mujeeb Ur Rahman",
    "Mitchell Swepson", "Noor Ahmad", "Abrar Ahmed",
    "Brad Hogg", "Simon Harmer", "Krunal Pandya",
    # Cricsheet abbreviated name forms (initials + surname)
    "SK Warne", "M Muralitharan", "A Kumble", "R Ashwin", "RA Jadeja",
    "NM Lyon", "GP Swann", "DL Vettori", "AR Patel", "YS Chahal",
    "SP Narine", "Saqlain Mushtaq", "Danish Kaneria", "MM Ali",
    "IS Sodhi", "MJ Santner", "A Zampa", "Imran Tahir",
    "Amit Mishra", "PP Chawla", "HMRKB Herath",
    "BAW Mendis", "MS Panesar", "Shadab Khan", "Yasir Shah",
    "KA Maharaj", "Mujeeb Ur Rahman", "Shakib Al Hasan",
    "PWH de Silva", "NLTC Perera",
    "RJW Topley",  # no, Topley is medium pace - remove
    # Surname-only patterns (word-boundary safe)
    "Ashwin", "Jadeja", "Chahal", "Narine", "Shamsi", "Sodhi",
    "Santner", "Swann", "Kumble", "Vettori", "Herath",
    "Zampa", "Tahir", "Bishnoi", "Hasaranga", "Theekshana",
    "Lamichhane", "Maharaj", "Panesar", "Kaneria", "Ajmal",
    "Harbhajan",
]
# Remove false positives (matched by accident)
_SPINNER_BLACKLIST = {"Trent Boult", "Michael Clarke", "Liam Livingstone",
                      "Shabnim Ismail", "RJW Topley"}

KNOWN_WICKETKEEPERS = [
    "MS Dhoni", "Mahendra Singh Dhoni", "Adam Gilchrist",
    "Kumar Sangakkara", "Quinton de Kock", "Jos Buttler",
    "Rishabh Pant", "BJ Watling", "Mushfiqur Rahim",
    "Sarfaraz Ahmed", "KL Rahul", "Wriddhiman Saha",
    "Matthew Wade", "Tim Paine", "Dinesh Karthik",
    "Ishan Kishan", "Sanju Samson", "Alex Carey",
    "Mohammad Rizwan", "Niroshan Dickwella", "Heinrich Klaasen",
    "Jonny Bairstow", "Tom Latham", "Mark Boucher",
    "Brad Haddin", "Brendon McCullum", "AB de Villiers",
    "Kamran Akmal", "Parthiv Patel", "Robin Uthappa",
    "Peter Nevill", "Sarah Taylor", "Alyssa Healy",
    "Devon Conway",  # sometimes keeps
    "Phil Salt", "Nicholas Pooran", "Rahmanullah Gurbaz",
    "Litton Das", "Liton Das",
    "Josh Inglis", "Sam Billings", "Ben Foakes",
    "Kyle Verreynne",
    "Dhoni", "Gilchrist", "Sangakkara", "de Kock",
    "Buttler", "Pant", "Watling", "Rizwan", "Carey",
    "Klaasen", "Bairstow", "Boucher", "Haddin",
    "McCullum", "Kamran Akmal", "Saha",
    "Karthik", "Kishan", "Samson", "Pooran", "Gurbaz",
]

# ── Trophy detection patterns ───────────────────────────────────
# Maps (event_name_pattern, match_type_or_None) → trophy key
TROPHY_PATTERNS = [
    (r"Indian Premier League",   None,   "IPL"),
    (r"ICC Cricket World Cup",   None,   "CWC"),
    (r"ICC World Cup",           None,   "CWC"),
    (r"Cricket World Cup",       None,   "CWC"),
    (r"ICC World Twenty20",      None,   "T20WC"),
    (r"ICC Men.*T20 World Cup",  None,   "T20WC"),
    (r"T20 World Cup",           None,   "T20WC"),
    (r"ICC World Test Championship", None, "WTC"),
    (r"World Test Championship", None,   "WTC"),
    (r"ICC Champions Trophy",    None,   "CT"),
    (r"Champions Trophy",        None,   "CT"),
]

# Wicket types credited to the bowler
BOWLER_WICKET_KINDS = frozenset({
    "bowled", "caught", "lbw", "stumped",
    "hit wicket", "caught and bowled",
})


# ════════════════════════════════════════════════════════════════
#  PLAYER DATA ACCUMULATOR
# ════════════════════════════════════════════════════════════════

class PlayerData:
    """Mutable accumulator for one player's career data across all formats."""

    __slots__ = (
        "cricsheet_id", "name", "country",
        "ipl_teams", "formats_played", "_role",
        "test_runs", "test_wickets", "test_matches", "test_balls_bowled", "test_innings_scores",
        "odi_runs",  "odi_wickets",  "odi_matches",  "odi_balls_bowled",  "odi_innings_scores",
        "t20i_runs", "t20i_wickets", "t20i_matches", "t20i_balls_bowled", "t20i_innings_scores",
        "ipl_runs",  "ipl_wickets",  "ipl_matches",  "ipl_balls_bowled",  "ipl_innings_scores",
        "teammates_set", "stumpings_effected", "trophies",
    )

    def __init__(self, cricsheet_id: str, name: str, country: str):
        self.cricsheet_id = cricsheet_id
        self.name = name
        self.country = country
        self.ipl_teams: set[str] = set()
        self.formats_played: set[str] = set()

        # Per-format flat fields (avoid nested dicts for speed)
        for fmt in ("test", "odi", "t20i", "ipl"):
            setattr(self, f"{fmt}_runs", 0)
            setattr(self, f"{fmt}_wickets", 0)
            setattr(self, f"{fmt}_matches", set())       # set of match_ids
            setattr(self, f"{fmt}_balls_bowled", 0)
            setattr(self, f"{fmt}_innings_scores", [])    # list of ints (per-innings runs)

        self.teammates_set: set[str] = set()              # cricsheet_ids
        self.stumpings_effected: int = 0
        self.trophies: set[str] = set()
        self._role: str = "Batsman"                       # default, overwritten in Phase 4

    # Convenience helpers for adding stats
    def add_batting_runs(self, fmt_key: str, runs: int):
        setattr(self, f"{fmt_key}_runs", getattr(self, f"{fmt_key}_runs") + runs)

    def add_wicket(self, fmt_key: str):
        setattr(self, f"{fmt_key}_wickets", getattr(self, f"{fmt_key}_wickets") + 1)

    def add_ball_bowled(self, fmt_key: str):
        setattr(self, f"{fmt_key}_balls_bowled", getattr(self, f"{fmt_key}_balls_bowled") + 1)

    def record_innings_score(self, fmt_key: str, score: int):
        getattr(self, f"{fmt_key}_innings_scores").append(score)

    def add_match(self, fmt_key: str, match_id: str):
        getattr(self, f"{fmt_key}_matches").add(match_id)

    # Aggregated properties
    @property
    def total_runs(self) -> int:
        return self.test_runs + self.odi_runs + self.t20i_runs

    @property
    def total_wickets(self) -> int:
        return self.test_wickets + self.odi_wickets + self.t20i_wickets

    @property
    def total_intl_matches(self) -> int:
        return len(self.test_matches) + len(self.odi_matches) + len(self.t20i_matches)

    @property
    def total_balls_bowled(self) -> int:
        return self.test_balls_bowled + self.odi_balls_bowled + self.t20i_balls_bowled

    @property
    def centuries(self) -> int:
        """International centuries (Test + ODI + T20I)."""
        return sum(
            1 for s in (self.test_innings_scores + self.odi_innings_scores + self.t20i_innings_scores)
            if s >= 100
        )

    @property
    def ipl_centuries(self) -> int:
        return sum(1 for s in self.ipl_innings_scores if s >= 100)


# ════════════════════════════════════════════════════════════════
#  PHASE 1 — DOWNLOAD
# ════════════════════════════════════════════════════════════════

def download_file(url: str, dest: Path, label: str) -> bool:
    """Download a URL to a local file with progress reporting."""
    if dest.exists():
        size_mb = dest.stat().st_size / (1024 * 1024)
        print(f"  [SKIP] {label} already exists ({size_mb:.1f} MB)")
        return True

    print(f"  [DOWN] {label} ...")
    try:
        def _report(block_num, block_size, total_size):
            downloaded = block_num * block_size
            if total_size > 0:
                pct = min(downloaded / total_size * 100, 100)
                mb = downloaded / (1024 * 1024)
                sys.stdout.write(f"\r         {mb:.1f} MB ({pct:.0f}%)")
                sys.stdout.flush()

        urlretrieve(url, str(dest), reporthook=_report)
        print()  # newline after progress
        return True
    except (URLError, OSError) as e:
        print(f"\n  [ERR]  Failed to download {label}: {e}")
        return False


def download_all(data_dir: Path, skip: bool = False):
    """Download all Cricsheet data files."""
    if skip:
        print("\n>> Skipping downloads (--skip-download)")
        return

    print("\n>> Phase 1: Downloading Cricsheet data")
    data_dir.mkdir(parents=True, exist_ok=True)

    # People register
    download_file(PEOPLE_CSV_URL, data_dir / "people.csv", "People register")
    time.sleep(1)  # throttle

    # Match data ZIPs
    for key, url in CRICSHEET_ZIPS.items():
        download_file(url, data_dir / f"{key}_json.zip", f"{key.upper()} matches")
        time.sleep(2)  # throttle between large downloads


# ════════════════════════════════════════════════════════════════
#  PHASE 2 — LOAD PEOPLE REGISTER
# ════════════════════════════════════════════════════════════════

def load_people_register(data_dir: Path) -> dict[str, dict]:
    """
    Parse people.csv → { cricsheet_id: {name, country, key_cricinfo, ...} }
    """
    print("\n>> Phase 2: Loading people register")
    csv_path = data_dir / "people.csv"
    if not csv_path.exists():
        print("  [WARN] people.csv not found, will use in-match registry only")
        return {}

    people: dict[str, dict] = {}
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            pid = row.get("identifier", "").strip()
            if not pid:
                continue
            people[pid] = {
                "name":          row.get("name", "").strip(),
                "unique_name":   row.get("unique_name", "").strip(),
                "key_cricinfo":  row.get("key_cricinfo", "").strip(),
            }

    print(f"  Loaded {len(people):,} player records")
    return people


# ════════════════════════════════════════════════════════════════
#  PHASE 3 — PROCESS MATCHES
# ════════════════════════════════════════════════════════════════

def get_or_create_player(
    players: dict[str, PlayerData],
    pid: str,
    display_name: str,
    people: dict[str, dict],
) -> PlayerData:
    """Get existing PlayerData or create a new one."""
    if pid in players:
        return players[pid]

    # Use name from people register (slightly more canonical), fallback to display_name
    info = people.get(pid, {})
    name = info.get("name") or display_name
    # Country is set later from international match team names
    p = PlayerData(pid, name, "")
    players[pid] = p
    return p


def process_match(
    match_data: dict,
    match_id: str,
    format_key: str,        # "tests", "odis", "t20is", "ipl"
    players: dict[str, PlayerData],
    people: dict[str, dict],
    finals: list,
):
    """
    Process one match JSON file.

    Updates `players` in-place with stats, teammates, IPL teams.
    Appends to `finals` if this match is a tournament final.
    """
    # Map ZIP key → stats attribute prefix
    _FMT_KEY_MAP = {"tests": "test", "odis": "odi", "t20s": "t20i", "ipl": "ipl"}
    fmt_key = _FMT_KEY_MAP.get(format_key, format_key)

    info = match_data.get("info", {})
    innings_list = match_data.get("innings", [])

    # ── Registry: display_name → cricsheet_id ────────────────
    registry = info.get("registry", {}).get("people", {})

    # ── Playing XIs ──────────────────────────────────────────
    players_by_team: dict[str, list[str]] = info.get("players", {})

    # Is this an international match? (team names = country names)
    is_international = format_key in ("tests", "odis", "t20s")

    # 1) Register players and track matches / IPL teams / country
    team_pid_map: dict[str, list[str]] = {}  # team_name → [pid, ...]
    for team_name, name_list in players_by_team.items():
        pids_in_team = []
        for display_name in name_list:
            pid = registry.get(display_name)
            if not pid:
                continue
            p = get_or_create_player(players, pid, display_name, people)
            p.add_match(fmt_key, match_id)
            p.formats_played.add(fmt_key)

            # Set country from international team name (first time wins)
            if is_international and not p.country:
                p.country = team_name

            # IPL franchise tracking
            if format_key == "ipl":
                abbr = IPL_TEAM_MAP.get(team_name)
                if abbr:
                    p.ipl_teams.add(abbr)

            pids_in_team.append(pid)
        team_pid_map[team_name] = pids_in_team

    # 2) Teammate relationships (within same team XI in same match)
    for team_name, pids in team_pid_map.items():
        for i, pid1 in enumerate(pids):
            for pid2 in pids[i + 1:]:
                if pid1 in players:
                    players[pid1].teammates_set.add(pid2)
                if pid2 in players:
                    players[pid2].teammates_set.add(pid1)

    # 3) Ball-by-ball stats
    for innings_data in innings_list:
        # Track per-batter runs in this innings for century detection
        innings_batter_runs: dict[str, int] = defaultdict(int)

        overs = innings_data.get("overs", [])
        for over_data in overs:
            for delivery in over_data.get("deliveries", []):
                batter_name = delivery.get("batter")
                bowler_name = delivery.get("bowler")
                batter_pid = registry.get(batter_name) if batter_name else None
                bowler_pid = registry.get(bowler_name) if bowler_name else None

                runs_obj = delivery.get("runs", {})
                batter_runs = runs_obj.get("batter", 0)

                # Batting runs
                if batter_pid and batter_pid in players:
                    players[batter_pid].add_batting_runs(fmt_key, batter_runs)
                    innings_batter_runs[batter_pid] += batter_runs

                # Ball bowled
                if bowler_pid and bowler_pid in players:
                    players[bowler_pid].add_ball_bowled(fmt_key)

                # Wickets
                for wkt in delivery.get("wickets", []):
                    kind = wkt.get("kind", "")

                    # Bowler-credited wickets
                    if kind in BOWLER_WICKET_KINDS:
                        if bowler_pid and bowler_pid in players:
                            players[bowler_pid].add_wicket(fmt_key)

                    # Stumping → fielder is the WK
                    if kind == "stumped":
                        fielders = wkt.get("fielders", [])
                        for f in fielders:
                            fname = f.get("name") if isinstance(f, dict) else f
                            if fname:
                                fpid = registry.get(fname)
                                if fpid and fpid in players:
                                    players[fpid].stumpings_effected += 1

        # Record innings scores for century detection
        for pid, total in innings_batter_runs.items():
            if pid in players:
                players[pid].record_innings_score(fmt_key, total)

    # 4) Trophy: check if this is a tournament final
    event = info.get("event", {})
    event_name = event.get("name", "")
    stage = event.get("stage", "").lower() if isinstance(event.get("stage"), str) else ""
    match_number = event.get("match_number", "")

    outcome = info.get("outcome", {})
    winner = outcome.get("winner", "")

    if winner and ("final" in stage):
        for pattern, _, trophy_key in TROPHY_PATTERNS:
            if re.search(pattern, event_name, re.IGNORECASE):
                # Collect winning team's playing XI
                winning_pids = team_pid_map.get(winner, [])
                finals.append({
                    "trophy": trophy_key,
                    "event":  event_name,
                    "winner": winner,
                    "pids":   winning_pids,
                    "year":   info.get("dates", [""])[0][:4],
                })
                break


def process_all_matches(
    data_dir: Path,
    people: dict[str, dict],
    quick: bool = False,
) -> tuple[dict[str, PlayerData], list]:
    """Process all match ZIPs and return (players_dict, finals_list)."""
    print("\n>> Phase 3: Processing match files")

    players: dict[str, PlayerData] = {}
    finals: list[dict] = []
    total_matches = 0
    max_per_format = 200 if quick else None

    for format_key in ["tests", "odis", "t20s", "ipl"]:
        zip_path = data_dir / f"{format_key}_json.zip"
        if not zip_path.exists():
            print(f"  [WARN] {zip_path.name} not found, skipping")
            continue

        fmt_label = FORMAT_NAMES[format_key]
        print(f"\n  Processing {fmt_label} matches from {zip_path.name} ...")

        count = 0
        errors = 0

        with zipfile.ZipFile(zip_path, "r") as zf:
            json_files = [n for n in zf.namelist() if n.endswith(".json")]
            total_in_zip = len(json_files)

            for entry_name in json_files:
                if max_per_format and count >= max_per_format:
                    break

                try:
                    with zf.open(entry_name) as f:
                        raw = f.read()
                        match_data = json.loads(raw)

                    # Use filename (without ext) as match ID
                    match_id = Path(entry_name).stem

                    # Filter to male cricket only
                    gender = match_data.get("info", {}).get("gender", "male")
                    if gender != "male":
                        continue

                    process_match(match_data, match_id, format_key, players, people, finals)
                    count += 1

                except (json.JSONDecodeError, KeyError, TypeError) as e:
                    errors += 1
                    if errors <= 3:
                        print(f"    [ERR] {entry_name}: {e}")

                # Progress
                if count % 500 == 0 and count > 0:
                    print(f"    ... {count:,} / {total_in_zip:,} processed")

        total_matches += count
        suffix = f" ({errors} errors)" if errors else ""
        print(f"  ✓ {fmt_label}: {count:,} matches processed{suffix}")

    print(f"\n  Total: {total_matches:,} matches | {len(players):,} unique players found")
    return players, finals


# ════════════════════════════════════════════════════════════════
#  PHASE 4 — POST-PROCESSING
# ════════════════════════════════════════════════════════════════

def _name_matches(player_name: str, patterns: list[str]) -> bool:
    """Check if any pattern matches the player name as a whole-word boundary."""
    name_lower = player_name.lower()
    for pat in patterns:
        if pat in _SPINNER_BLACKLIST:
            continue
        pat_lower = pat.lower()
        # Use word-boundary matching to avoid "Warne" matching "Warner"
        if re.search(r'\b' + re.escape(pat_lower) + r'\b', name_lower):
            return True
    return False


def classify_roles(players: dict[str, PlayerData]):
    """Assign primaryRole to each player based on stats + curated lists."""
    print("\n>> Phase 4a: Classifying player roles")

    role_counts: dict[str, int] = defaultdict(int)

    for p in players.values():
        is_spinner = _name_matches(p.name, KNOWN_SPINNERS)
        is_wk = p.stumpings_effected >= 3 or _name_matches(p.name, KNOWN_WICKETKEEPERS)
        total_wkts = p.total_wickets + p.ipl_wickets
        total_balls = p.total_balls_bowled + p.ipl_balls_bowled

        # Compute balance ratio for all-rounder detection
        balance = p.total_runs / max(p.total_wickets, 1)

        # 1) Known spinner + significant bowling → Spin Bowler (before All-Rounder!)
        if is_spinner and total_wkts >= 15 and total_balls >= 300:
            role = "Spin Bowler"

        # 2) Wicket-keeper (stumpings or curated list)
        elif is_wk:
            role = "WK-Bat"

        # 3) All-rounder: balanced batting AND bowling (ratio 15-100)
        #    Excludes bowling-dominant (Starc: ratio 6) and batting-dominant (Root: ratio 205)
        elif (p.total_runs >= 3000 and p.total_wickets >= 75 and not is_spinner
              and 15 <= balance <= 100):
            role = "All-Rounder"

        # 4) Fast Bowler: significant international bowling AND not batting-dominant
        #    The runs < 5000 guard prevents batsmen (Rohit, Smith, Williamson)
        #    who bowl part-time from being classified as bowlers
        elif (p.total_wickets >= 20 and p.total_balls_bowled >= 400
              and p.total_runs < 5000):
            role = "Fast Bowler"

        # 5) IPL-only bowler (for uncapped/limited-caps bowlers)
        elif (p.ipl_wickets >= 25 and p.ipl_balls_bowled >= 250
              and p.ipl_runs < 2000):
            role = "Fast Bowler"

        # 6) Default: Batsman
        else:
            role = "Batsman"

        p._role = role  # type: ignore[attr-defined]
        role_counts[role] += 1

    for role, cnt in sorted(role_counts.items(), key=lambda x: -x[1]):
        print(f"    {role}: {cnt}")


def assign_trophies(players: dict[str, PlayerData], finals: list[dict]):
    """Assign trophy keys to players who were in winning XIs of tournament finals."""
    print("\n>> Phase 4b: Assigning trophies")

    trophy_events = 0
    for final in finals:
        trophy_key = final["trophy"]
        for pid in final["pids"]:
            if pid in players:
                players[pid].trophies.add(trophy_key)
        trophy_events += 1

    print(f"  Found {trophy_events} tournament final results")

    # Count players with at least one trophy
    with_trophy = sum(1 for p in players.values() if p.trophies)
    print(f"  Players with trophies: {with_trophy}")


# ════════════════════════════════════════════════════════════════
#  PHASE 4c — ENRICH FROM ESPNCRICINFO (optional)
# ════════════════════════════════════════════════════════════════

_ESPN_ROLE_MAP = {
    "top order batter":       "Batsman",
    "middle order batter":    "Batsman",
    "opening batter":         "Batsman",
    "batter":                 "Batsman",
    "batsman":                "Batsman",
    "wicketkeeper batter":    "WK-Bat",
    "wicketkeeper":           "WK-Bat",
    "wicketkeeper batsman":   "WK-Bat",
    "bowling allrounder":     "All-Rounder",
    "batting allrounder":     "All-Rounder",
    "allrounder":             "All-Rounder",
    "all-rounder":            "All-Rounder",
}

def _classify_espn_role(role_str: str) -> str | None:
    """Map an ESPNcricinfo role string to our PrimaryRole enum."""
    if not role_str:
        return None
    lower = role_str.lower().strip()
    # Direct match
    if lower in _ESPN_ROLE_MAP:
        return _ESPN_ROLE_MAP[lower]
    # Check for bowling keywords
    if "spin" in lower or "slow" in lower:
        return "Spin Bowler"
    if "fast" in lower or "pace" in lower or "medium" in lower or "seam" in lower:
        return "Fast Bowler"
    if "bowler" in lower:
        return "Fast Bowler"  # default bowler type
    if "allrounder" in lower or "all-rounder" in lower:
        return "All-Rounder"
    if "batter" in lower or "batsman" in lower:
        return "Batsman"
    if "wicketkeeper" in lower or "keeper" in lower:
        return "WK-Bat"
    return None


def enrich_from_espncricinfo(
    players: dict[str, PlayerData],
    people: dict[str, dict],
    selected_pids: list[str],
    throttle: float = 0.5,
):
    """
    Fetch full names, countries, and playing roles from ESPNcricinfo
    for players that have a key_cricinfo ID in the people register.
    """
    from urllib.request import Request, urlopen
    from urllib.error import HTTPError, URLError

    print("\n>> Phase 4c: Enriching player data from ESPNcricinfo")

    # Build list of (pid, cricinfo_id) for players we want to enrich
    to_enrich: list[tuple[str, str]] = []
    for pid in selected_pids:
        info = people.get(pid, {})
        cricinfo_id = info.get("key_cricinfo", "")
        if cricinfo_id:
            to_enrich.append((pid, cricinfo_id))

    print(f"  Players with ESPNcricinfo IDs: {len(to_enrich)} / {len(selected_pids)}")

    enriched = 0
    errors = 0
    name_updates = 0
    country_updates = 0
    role_updates = 0

    for i, (pid, cricinfo_id) in enumerate(to_enrich):
        url = f"https://hs-consumer-api.espncricinfo.com/v1/pages/player/home?playerId={cricinfo_id}"
        try:
            req = Request(url, headers={"User-Agent": "CricketBingo/1.0"})
            with urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))

            player_info = data.get("player", {})
            p = players[pid]

            # Full name
            full_name = player_info.get("longName", "") or player_info.get("name", "")
            if full_name and len(full_name) > len(p.name):
                p.name = full_name
                name_updates += 1

            # Country
            country_name = player_info.get("country", "")
            if not isinstance(country_name, str):
                # Sometimes it's an object
                country_name = ""
            # Try from countryTeamName field
            if not country_name:
                country_name = player_info.get("countryTeamName", "")
            if country_name and not p.country:
                p.country = country_name
                country_updates += 1

            # Playing role
            playing_role = player_info.get("playingRole", "")
            mapped_role = _classify_espn_role(playing_role)
            if mapped_role:
                p._role = mapped_role
                role_updates += 1

            enriched += 1

        except (HTTPError, URLError, json.JSONDecodeError, KeyError, TimeoutError) as e:
            errors += 1
            if errors <= 5:
                print(f"    [ERR] {pid} (cricinfo={cricinfo_id}): {e}")
        except Exception as e:
            errors += 1
            if errors <= 5:
                print(f"    [ERR] {pid}: {type(e).__name__}: {e}")

        # Progress
        if (i + 1) % 50 == 0:
            print(f"    ... {i + 1} / {len(to_enrich)} enriched")

        # Throttle
        time.sleep(throttle)

    print(f"  Enriched: {enriched} | Errors: {errors}")
    print(f"  Name updates: {name_updates} | Country updates: {country_updates} | Role updates: {role_updates}")


# ════════════════════════════════════════════════════════════════
#  PHASE 5 — FILTER & OUTPUT
# ════════════════════════════════════════════════════════════════

def generate_readable_id(name: str, country: str) -> str:
    """Generate a readable ID like 'ind_rohit_sharma'."""
    code = COUNTRY_CODES.get(country, "unk").lower()
    # Normalize name: lowercase, replace spaces/special chars with underscore
    clean = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")
    return f"{code}_{clean}"


def _load_name_map() -> dict[str, str]:
    """Load the curated abbreviated → full name mapping."""
    map_path = SCRIPT_DIR / "name_map.json"
    if map_path.exists():
        with open(map_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def filter_and_output(
    players: dict[str, PlayerData],
    people: dict[str, dict],
    min_players: int,
    output_path: Path,
):
    """Select top players, build JSON, and write to file."""
    print(f"\n>> Phase 5: Filtering top {min_players}+ players and writing output")

    name_map = _load_name_map()
    if name_map:
        print(f"  Loaded {len(name_map)} name overrides from name_map.json")

    # Eligibility: at least 5 international matches OR 10 IPL matches
    eligible = [
        p for p in players.values()
        if (p.total_intl_matches >= 5 or len(p.ipl_matches) >= 10)
        and p.country != "Unknown"
        and hasattr(p, "_role")
    ]

    # Sort by significance: total international matches + IPL matches
    eligible.sort(key=lambda p: p.total_intl_matches + len(p.ipl_matches), reverse=True)

    # Take top N (at least min_players)
    selected = eligible[:max(min_players, len(eligible))]
    selected_ids = {p.cricsheet_id for p in selected}

    print(f"  Eligible players: {len(eligible)}")
    print(f"  Selected: {len(selected)}")

    # Build cricsheet_id → readable_id mapping (with dedup)
    id_map: dict[str, str] = {}
    used_ids: set[str] = set()
    for p in selected:
        # Use full name for readable ID if available
        id_name = name_map.get(p.name, p.name)
        base = generate_readable_id(id_name, p.country)
        final_id = base
        counter = 2
        while final_id in used_ids:
            final_id = f"{base}_{counter}"
            counter += 1
        used_ids.add(final_id)
        id_map[p.cricsheet_id] = final_id

    # Build output records
    output: list[dict] = []
    for p in selected:
        # Teammates: only include those in our selected set
        teammates = sorted([
            id_map[tid]
            for tid in p.teammates_set
            if tid in selected_ids and tid in id_map
        ])

        # Apply full-name override if available
        display_name = name_map.get(p.name, p.name)

        record = {
            "id":           id_map[p.cricsheet_id],
            "name":         display_name,
            "country":      p.country,
            "countryCode":  COUNTRY_CODES.get(p.country, "UNK"),
            "countryFlag":  COUNTRY_FLAGS.get(p.country, "🏳️"),
            "iplTeams":     sorted(p.ipl_teams),
            "primaryRole":  getattr(p, "_role", "Batsman"),
            "stats": {
                "testRuns":      p.test_runs,
                "testWickets":   p.test_wickets,
                "testMatches":   len(p.test_matches),
                "odiRuns":       p.odi_runs,
                "odiWickets":    p.odi_wickets,
                "odiMatches":    len(p.odi_matches),
                "t20iRuns":      p.t20i_runs,
                "t20iWickets":   p.t20i_wickets,
                "t20iMatches":   len(p.t20i_matches),
                "iplRuns":       p.ipl_runs,
                "iplWickets":    p.ipl_wickets,
                "iplMatches":    len(p.ipl_matches),
                "totalRuns":     p.total_runs,
                "totalWickets":  p.total_wickets,
                "centuries":     p.centuries,
                "iplCenturies":  p.ipl_centuries,
            },
            "trophies":     sorted(p.trophies),
            "teammates":    teammates,
        }
        output.append(record)

    # Write JSON
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    file_size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"\n  ✓ Wrote {len(output)} players to {output_path}")
    print(f"    File size: {file_size_mb:.1f} MB")

    # Quick stats
    roles = defaultdict(int)
    with_ipl = 0
    with_trophies = 0
    for rec in output:
        roles[rec["primaryRole"]] += 1
        if rec["iplTeams"]:
            with_ipl += 1
        if rec["trophies"]:
            with_trophies += 1

    print(f"\n  Summary:")
    print(f"    Total players: {len(output)}")
    for role, cnt in sorted(roles.items(), key=lambda x: -x[1]):
        print(f"      {role}: {cnt}")
    print(f"    With IPL history: {with_ipl}")
    print(f"    With trophies: {with_trophies}")
    avg_teammates = sum(len(r["teammates"]) for r in output) / max(len(output), 1)
    print(f"    Avg teammates per player: {avg_teammates:.0f}")


# ════════════════════════════════════════════════════════════════
#  MAIN
# ════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="Cricket Bingo — Player Data Collector",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python collect_data.py                  Full run
  python collect_data.py --skip-download  Re-process cached data
  python collect_data.py --quick          Dev mode (200 matches/format)
  python collect_data.py --min-players 600
        """,
    )
    parser.add_argument(
        "--skip-download", action="store_true",
        help="Skip downloading data (use cached ZIPs)",
    )
    parser.add_argument(
        "--quick", action="store_true",
        help="Dev mode: process only 200 matches per format",
    )
    parser.add_argument(
        "--min-players", type=int, default=500,
        help="Minimum number of players to include (default: 500)",
    )
    parser.add_argument(
        "--enrich", action="store_true",
        help="Enrich player names/roles from ESPNcricinfo API (adds ~5-10 min)",
    )
    parser.add_argument(
        "--data-dir", type=str, default=None,
        help=f"Data directory (default: {DATA_DIR})",
    )
    parser.add_argument(
        "--output", type=str, default=None,
        help=f"Output JSON path (default: {OUTPUT_FILE})",
    )
    args = parser.parse_args()

    data_dir = Path(args.data_dir) if args.data_dir else DATA_DIR
    output_path = Path(args.output) if args.output else OUTPUT_FILE

    print("=" * 60)
    print("  Cricket Bingo — Player Data Collector")
    print("  Source: Cricsheet.org (Open Data)")
    print("=" * 60)

    t_start = time.time()

    # Phase 1: Download
    download_all(data_dir, skip=args.skip_download)

    # Phase 2: Load people register
    people = load_people_register(data_dir)

    # Phase 3: Process matches
    players, finals = process_all_matches(data_dir, people, quick=args.quick)

    # Phase 4: Post-processing
    classify_roles(players)
    assign_trophies(players, finals)

    # Phase 4c (optional): Enrich from ESPNcricinfo
    if args.enrich:
        # Pre-filter to get the top players we'll include, then enrich only those
        eligible = [
            p for p in players.values()
            if (p.total_intl_matches >= 5 or len(p.ipl_matches) >= 10)
            and p.country
        ]
        eligible.sort(key=lambda p: p.total_intl_matches + len(p.ipl_matches), reverse=True)
        top_pids = [p.cricsheet_id for p in eligible[:args.min_players + 100]]
        enrich_from_espncricinfo(players, people, top_pids, throttle=0.5)

    # Phase 5: Filter & Output
    filter_and_output(players, people, args.min_players, output_path)

    elapsed = time.time() - t_start
    minutes = int(elapsed // 60)
    seconds = int(elapsed % 60)
    print(f"\n  Done in {minutes}m {seconds}s")
    print("=" * 60)


if __name__ == "__main__":
    main()
