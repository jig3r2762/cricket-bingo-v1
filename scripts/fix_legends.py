#!/usr/bin/env python3
"""
Quick fix for the most important historical players whose stats are
clearly wrong in our data (Cricsheet missing pre-2001 matches).

This is a targeted script — only ~25 players, uses minimal API calls.
Run this when the main enrich_stats.py is blocked by rate limits.

Usage:
    python fix_legends.py --api-key gsk_...  --provider groq
    python fix_legends.py --api-key AIzaSy... --provider gemini
"""

import argparse, json, re, sys, time
from pathlib import Path

try:
    import requests
except ImportError:
    print("pip install requests"); sys.exit(1)

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PLAYERS_FILE = Path(__file__).resolve().parent.parent / "public" / "players.json"
OUTPUT_FILE  = Path(__file__).resolve().parent / "players_enriched.json"

# ── Hardcoded real career stats for the biggest legends ─────────────────────
# Source: Wikipedia / ESPNcricinfo career statistics pages
# Format: player_id → { testRuns, testWickets, testMatches, odiRuns, odiWickets,
#                        odiMatches, t20iRuns, t20iWickets, t20iMatches, centuries }
LEGEND_OVERRIDES = {
    "ind_sachin_tendulkar": {
        "testRuns": 15921, "testWickets": 46,  "testMatches": 200,
        "odiRuns":  18426, "odiWickets":  154, "odiMatches":  463,
        "t20iRuns":    10, "t20iWickets":    0, "t20iMatches":    1,
        "centuries": 100,
    },
    "ind_rahul_dravid": {
        "testRuns": 13265, "testWickets":   1, "testMatches": 164,
        "odiRuns":  10889, "odiWickets":    4, "odiMatches":  344,
        "t20iRuns":     0, "t20iWickets":   0, "t20iMatches":    1,
        "centuries":  48,
    },
    "sl_sanath_jayasuriya": {
        "testRuns":  6973, "testWickets":  98, "testMatches": 110,
        "odiRuns":  13430, "odiWickets":  323, "odiMatches":  445,
        "t20iRuns":   502, "t20iWickets":   9, "t20iMatches":   31,
        "centuries":  28,
    },
    "aus_ricky_ponting": {
        "testRuns": 13378, "testWickets":   5, "testMatches": 168,
        "odiRuns":  13704, "odiWickets":    3, "odiMatches":  375,
        "t20iRuns":   401, "t20iWickets":   0, "t20iMatches":   17,
        "centuries":  71,
    },
    "sa_jacques_kallis": {
        "testRuns": 13289, "testWickets": 292, "testMatches": 166,
        "odiRuns":  11579, "odiWickets":  273, "odiMatches":  328,
        "t20iRuns":   666, "t20iWickets":   0, "t20iMatches":   25,
        "centuries":  62,
    },
    "ind_sourav_ganguly": {
        "testRuns":  7212, "testWickets":  32, "testMatches": 113,
        "odiRuns":  11363, "odiWickets":  100, "odiMatches":  311,
        "t20iRuns":     0, "t20iWickets":   0, "t20iMatches":    0,
        "centuries":  38,
    },
    "pak_inzamam_ul_haq": {
        "testRuns":  8830, "testWickets":   0, "testMatches": 120,
        "odiRuns":  11739, "odiWickets":    1, "odiMatches":  378,
        "t20iRuns":     0, "t20iWickets":   0, "t20iMatches":    0,
        "centuries":  35,
    },
    "wi_brian_lara": {
        "testRuns": 11953, "testWickets":   0, "testMatches": 131,
        "odiRuns":  10405, "odiWickets":    4, "odiMatches":  299,
        "t20iRuns":     0, "t20iWickets":   0, "t20iMatches":    0,
        "centuries":  34,
    },
    "aus_matthew_hayden": {
        "testRuns":  8625, "testWickets":   0, "testMatches": 103,
        "odiRuns":   6133, "odiWickets":    0, "odiMatches":  161,
        "t20iRuns":    73, "t20iWickets":   0, "t20iMatches":    9,
        "centuries":  30,
    },
    "aus_adam_gilchrist": {
        "testRuns":  5570, "testWickets":   1, "testMatches":  96,
        "odiRuns":   9619, "odiWickets":    3, "odiMatches":  287,
        "t20iRuns":   340, "t20iWickets":   0, "t20iMatches":   13,
        "centuries":  21,
    },
    "ind_virender_sehwag": {
        "testRuns":  8586, "testWickets":  40, "testMatches": 104,
        "odiRuns":   8273, "odiWickets":    96, "odiMatches": 251,
        "t20iRuns":   394, "t20iWickets":   1, "t20iMatches":   19,
        "centuries":  23,
    },
    "pak_younis_khan": {
        "testRuns": 10099, "testWickets":   0, "testMatches": 118,
        "odiRuns":   7249, "odiWickets":    0, "odiMatches":  265,
        "t20iRuns":   313, "t20iWickets":   0, "t20iMatches":   25,
        "centuries":  34,
    },
    "pak_mohammad_yousuf": {
        "testRuns":  7530, "testWickets":   0, "testMatches":  90,
        "odiRuns":   9720, "odiWickets":    1, "odiMatches":  288,
        "t20iRuns":     0, "t20iWickets":   0, "t20iMatches":    0,
        "centuries":  24,
    },
    "pak_waqar_younis": {
        "testRuns":  1010, "testWickets": 373, "testMatches":  87,
        "odiRuns":    964, "odiWickets":  416, "odiMatches":  262,
        "t20iRuns":     0, "t20iWickets":   0, "t20iMatches":    0,
        "centuries":   0,
    },
    "aus_glenn_mcgrath": {
        "testRuns":   641, "testWickets": 563, "testMatches": 124,
        "odiRuns":   115, "odiWickets":  381, "odiMatches":  250,
        "t20iRuns":     0, "t20iWickets":   0, "t20iMatches":    0,
        "centuries":   0,
    },
    "sl_muttiah_muralitharan": {
        "testRuns":  1261, "testWickets": 800, "testMatches": 133,
        "odiRuns":    674, "odiWickets":  534, "odiMatches":  350,
        "t20iRuns":    50, "t20iWickets":  13, "t20iMatches":   12,
        "centuries":   0,
    },
    "aus_shane_warne": {
        "testRuns":  3154, "testWickets": 708, "testMatches": 145,
        "odiRuns":    586, "odiWickets":  293, "odiMatches":  194,
        "t20iRuns":     0, "t20iWickets":   0, "t20iMatches":    0,
        "centuries":   0,
    },
    "ind_anil_kumble": {
        "testRuns":  2506, "testWickets": 619, "testMatches": 132,
        "odiRuns":    938, "odiWickets":  337, "odiMatches":  271,
        "t20iRuns":     0, "t20iWickets":   0, "t20iMatches":    0,
        "centuries":   0,
    },
    "ind_vvs_laxman": {
        "testRuns":  8781, "testWickets":   2, "testMatches": 134,
        "odiRuns":   2338, "odiWickets":    2, "odiMatches":   86,
        "t20iRuns":     0, "t20iWickets":   0, "t20iMatches":    0,
        "centuries":  17,
    },
    "sa_graeme_smith": {
        "testRuns":  9265, "testWickets":   0, "testMatches": 117,
        "odiRuns":   6989, "odiWickets":    0, "odiMatches":  197,
        "t20iRuns":   150, "t20iWickets":   0, "t20iMatches":   33,
        "centuries":  27,
    },
    "eng_alastair_cook": {
        "testRuns": 12472, "testWickets":   0, "testMatches": 161,
        "odiRuns":   3204, "odiWickets":    0, "odiMatches":   92,
        "t20iRuns":    61, "t20iWickets":   0, "t20iMatches":    4,
        "centuries":  33,
    },
    "sl_kumar_sangakkara": {
        "testRuns": 12400, "testWickets":   0, "testMatches": 134,
        "odiRuns":  14234, "odiWickets":    0, "odiMatches":  404,
        "t20iRuns":  1382, "t20iWickets":   1, "t20iMatches":   56,
        "centuries":  63,
    },
    "sl_mahela_jayawardene": {
        "testRuns": 11814, "testWickets":   0, "testMatches": 149,
        "odiRuns":  12650, "odiWickets":    0, "odiMatches":  448,
        "t20iRuns":  1493, "t20iWickets":   0, "t20iMatches":   55,
        "centuries":  41,
    },
}


def apply_overrides(players: list[dict]) -> tuple[int, int]:
    updated = skipped = 0
    pid_map = {p["id"]: i for i, p in enumerate(players)}

    for pid, stats in LEGEND_OVERRIDES.items():
        if pid not in pid_map:
            print(f"  [SKIP] {pid} — not found in players.json")
            skipped += 1
            continue

        idx = pid_map[pid]
        p   = players[idx]
        old = p["stats"]["totalRuns"]

        for k, v in stats.items():
            players[idx]["stats"][k] = v

        players[idx]["stats"]["totalRuns"] = (
            stats["testRuns"] + stats["odiRuns"] + stats["t20iRuns"]
        )
        players[idx]["stats"]["totalWickets"] = (
            stats["testWickets"] + stats["odiWickets"] + stats["t20iWickets"]
        )

        new = players[idx]["stats"]["totalRuns"]
        diff = new - old
        sign = "+" if diff >= 0 else ""
        print(f"  {p['name']:<30} {old:>8,} → {new:>8,}  ({sign}{diff:,})")
        updated += 1

    return updated, skipped


def main():
    print("\nApplying hardcoded legend overrides to players.json ...")
    with open(PLAYERS_FILE, encoding="utf-8") as f:
        players = json.load(f)

    updated, skipped = apply_overrides(players)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(players, f, ensure_ascii=False, separators=(",", ":"))

    print(f"\nUpdated: {updated}  |  Not found: {skipped}")
    print(f"Saved → {OUTPUT_FILE}")
    print("\nApply with:  cp scripts/players_enriched.json public/players.json")


if __name__ == "__main__":
    main()
