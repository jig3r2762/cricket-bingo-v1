#!/usr/bin/env python3
"""
Cricket Bingo — Player Stats Enrichment (FREE)
===============================================
Uses a FREE AI API to look up and fix incomplete player statistics.
Cricsheet only covers ~2001 onwards, so historical legends like Sachin,
Dravid, Jayasuriya have severely undercounted stats.

Requirements:
    python3 -m pip install requests

════════════════════════════════════════════════
FREE OPTIONS (pick one, all have free tiers):
════════════════════════════════════════════════

  1. Google Gemini  ← RECOMMENDED (best cricket knowledge, 100% free)
     Get free key : https://aistudio.google.com  →  Get API key
     Usage:
       python enrich_stats.py --provider gemini --api-key AIzaSy...

  2. Groq  (Llama 70B, very fast, free)
     Get free key : https://console.groq.com  →  API Keys
     Usage:
       python enrich_stats.py --provider groq --api-key gsk_...

  3. OpenRouter free models  (many free models available)
     Get free key : https://openrouter.ai  →  Settings  →  API Keys
     Usage:
       python enrich_stats.py --provider openrouter --api-key sk-or-...

════════════════════════════════════════════════
TYPICAL WORKFLOW:
════════════════════════════════════════════════

  # 1. Test with 5 players first
  python enrich_stats.py --provider gemini --api-key YOUR_KEY --dry-run

  # 2. Fix only the obviously wrong players (~400, takes ~30 min)
  python enrich_stats.py --provider gemini --api-key YOUR_KEY --only-suspicious

  # 3. If it gets interrupted, resume where you left off
  python enrich_stats.py --provider gemini --api-key YOUR_KEY --only-suspicious --resume

  # 4. Check what changed
  python check_enriched.py

  # 5. Apply to game
  copy scripts\\players_enriched.json public\\players.json
  npm run build
"""

import argparse
import json
import re
import sys
import time
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: 'requests' not installed. Run: python3 -m pip install requests")
    sys.exit(1)

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).resolve().parent
PLAYERS_FILE = SCRIPT_DIR.parent / "public" / "players.json"
CHECKPOINT   = SCRIPT_DIR / "enrich_checkpoint.json"
OUTPUT_FILE  = SCRIPT_DIR / "players_enriched.json"

# ── Provider configs ─────────────────────────────────────────────────────────
PROVIDERS = {
    "gemini": {
        # Free: 15 req/min, 1M tokens/day  — aistudio.google.com
        "url":       "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        "model":     "gemini-1.5-flash",
        "delay":     4.1,   # 15 RPM → 4s between calls (slightly over to be safe)
        "auth":      "query",   # key goes in ?key= param
    },
    "groq": {
        # Free: 30 req/min, 14400 req/day  — console.groq.com
        "url":       "https://api.groq.com/openai/v1/chat/completions",
        "model":     "llama-3.3-70b-versatile",
        "delay":     2.1,   # 30 RPM
        "auth":      "bearer",
    },
    "openrouter": {
        # Free models: add :free suffix  — openrouter.ai
        "url":       "https://openrouter.ai/api/v1/chat/completions",
        "model":     "meta-llama/llama-3.3-70b-instruct:free",
        "delay":     3.0,   # free tier is rate-limited
        "auth":      "bearer",
    },
}


# ── Detection: which players need fixing ─────────────────────────────────────

def is_suspicious(player: dict) -> bool:
    """Return True if this player's stats look incomplete/undercounted."""
    s    = player["stats"]
    role = player.get("primaryRole", "Batsman")
    intl = s["testMatches"] + s["odiMatches"] + s["t20iMatches"]

    # Non-bowler with many matches but few runs → Cricsheet missing old games
    if intl >= 30 and s["totalRuns"] < 2000 and role not in ("Fast Bowler", "Spin Bowler"):
        return True
    if s["testMatches"] >= 20 and s["testRuns"] < 600:
        return True
    if s["odiMatches"] >= 50 and s["odiRuns"] < 1000:
        return True
    if intl >= 100 and s["totalRuns"] < 3000 and role not in ("Fast Bowler", "Spin Bowler"):
        return True
    # Bowler with many matches but suspiciously few wickets
    if intl >= 50 and s["totalWickets"] < 30 and role in ("Fast Bowler", "Spin Bowler"):
        return True

    return False


# ── Prompt ───────────────────────────────────────────────────────────────────

def build_prompt(player: dict) -> str:
    return f"""You are a cricket statistics expert. Give the complete official international career statistics for:

Player : {player['name']}
Country: {player['country']}
Role   : {player.get('primaryRole', 'Cricketer')}

Return ONLY a JSON object with exactly these fields (use 0 for formats they never played):
{{
  "testRuns": <int>,
  "testWickets": <int>,
  "testMatches": <int>,
  "odiRuns": <int>,
  "odiWickets": <int>,
  "odiMatches": <int>,
  "t20iRuns": <int>,
  "t20iWickets": <int>,
  "t20iMatches": <int>,
  "centuries": <int>,
  "confident": <true or false>
}}

Rules:
- International stats ONLY (Tests / ODIs / T20Is) — not IPL, not domestic
- "centuries" = total international 100s across all formats
- "confident" = true if you are sure, false if you don't recognise this player
- If unknown, return all zeros and confident=false
- Return ONLY the raw JSON — no explanation, no markdown"""


# ── API callers ───────────────────────────────────────────────────────────────

def call_gemini(prompt: str, api_key: str, model: str) -> dict | None:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    try:
        resp = requests.post(
            url,
            params={"key": api_key},
            json={"contents": [{"parts": [{"text": prompt}]}],
                  "generationConfig": {"temperature": 0.1, "maxOutputTokens": 400}},
            timeout=30,
        )
        resp.raise_for_status()
        content = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
        content = re.sub(r"^```(?:json)?\s*", "", content)
        content = re.sub(r"\s*```$", "", content)
        m = re.search(r"\{[\s\S]*?\}", content)
        return json.loads(m.group() if m else content)
    except Exception as e:
        print(f"ERR({type(e).__name__}:{e})", end=" ")
        return None


def call_openai_compat(prompt: str, api_key: str, url: str, model: str,
                        extra_headers: dict | None = None) -> dict | None:
    """Works for Groq and OpenRouter (both use OpenAI-compatible endpoints)."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    if extra_headers:
        headers.update(extra_headers)
    try:
        resp = requests.post(
            url,
            headers=headers,
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1,
                "max_tokens": 400,
            },
            timeout=30,
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"].strip()
        content = re.sub(r"^```(?:json)?\s*", "", content)
        content = re.sub(r"\s*```$", "", content)
        m = re.search(r"\{[\s\S]*?\}", content)
        return json.loads(m.group() if m else content)
    except Exception as e:
        print(f"ERR({type(e).__name__})", end=" ")
        return None


def call_api(prompt: str, provider: str, api_key: str, model: str) -> dict | None:
    if provider == "gemini":
        return call_gemini(prompt, api_key, model)
    elif provider == "groq":
        return call_openai_compat(prompt, api_key, PROVIDERS["groq"]["url"], model)
    elif provider == "openrouter":
        return call_openai_compat(
            prompt, api_key, PROVIDERS["openrouter"]["url"], model,
            extra_headers={"HTTP-Referer": "https://cricket-bingo.in", "X-Title": "Cricket Bingo"}
        )
    return None


# ── Validation ────────────────────────────────────────────────────────────────

def validate_stats(new: dict, old: dict) -> bool:
    required = [
        "testRuns", "testWickets", "testMatches",
        "odiRuns",  "odiWickets",  "odiMatches",
        "t20iRuns", "t20iWickets", "t20iMatches",
        "centuries",
    ]
    for k in required:
        if k not in new:
            return False
        if not isinstance(new[k], (int, float)) or new[k] < 0:
            return False

    total = new["testMatches"] + new["odiMatches"] + new["t20iMatches"]
    if total > 700:            return False
    if new["centuries"] > 200: return False
    if new["testRuns"] > 20000: return False
    if new["odiRuns"] > 20000: return False
    if new["testWickets"] > 900: return False
    if new["odiWickets"] > 600: return False
    if new["centuries"] > total: return False

    # Cricsheet only UNDERCOUNTS (misses old matches), it never overcounts.
    # So AI stats should always be >= what Cricsheet already has.
    # Reject if AI gives LESS runs or wickets than Cricsheet already has.
    old_total_runs = old.get("totalRuns", 0)
    new_total_runs = int(new["testRuns"]) + int(new["odiRuns"]) + int(new["t20iRuns"])
    if new_total_runs < old_total_runs * 0.95:   # allow tiny rounding diff
        return False

    old_total_wkts = old.get("totalWickets", 0)
    new_total_wkts = int(new["testWickets"]) + int(new["odiWickets"]) + int(new["t20iWickets"])
    if new_total_wkts < old_total_wkts * 0.95:
        return False

    # Match counts shouldn't drop dramatically either
    for fmt in ("testMatches", "odiMatches", "t20iMatches"):
        if new[fmt] < old.get(fmt, 0) * 0.5:
            return False

    return True


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Enrich players.json stats using a free AI API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
FREE API KEYS:
  Gemini    → https://aistudio.google.com     (Get API key button)
  Groq      → https://console.groq.com        (API Keys section)
  OpenRouter→ https://openrouter.ai            (Settings → API Keys)
        """,
    )
    parser.add_argument("--api-key",  required=True,
                        help="Your free API key")
    parser.add_argument("--provider", default="gemini",
                        choices=["gemini", "groq", "openrouter"],
                        help="Which free API to use (default: gemini)")
    parser.add_argument("--model",    default=None,
                        help="Override the default model for this provider")
    parser.add_argument("--only-suspicious", action="store_true",
                        help="Only process players with obviously wrong stats (~400 players)")
    parser.add_argument("--resume",   action="store_true",
                        help="Resume from previous checkpoint")
    parser.add_argument("--delay",    type=float, default=None,
                        help="Override delay between API calls (seconds)")
    parser.add_argument("--dry-run",  action="store_true",
                        help="Test with first 5 players, don't write output")
    args = parser.parse_args()

    cfg   = PROVIDERS[args.provider]
    model = args.model or cfg["model"]
    delay = args.delay or cfg["delay"]

    # ── Load players ──────────────────────────────────────────────────────
    print(f"\nLoading {PLAYERS_FILE} ...")
    with open(PLAYERS_FILE, encoding="utf-8") as f:
        players: list[dict] = json.load(f)
    print(f"  {len(players)} players loaded")

    # ── Load checkpoint ───────────────────────────────────────────────────
    done: dict = {}
    if args.resume and CHECKPOINT.exists():
        with open(CHECKPOINT, encoding="utf-8") as f:
            done = json.load(f)
        print(f"  Resuming: {len(done)} players already done")

    # ── Select players ────────────────────────────────────────────────────
    to_process = [
        p for p in players
        if p["id"] not in done
        and (not args.only_suspicious or is_suspicious(p))
    ]
    if args.dry_run:
        to_process = to_process[:5]
        print(f"\n[DRY RUN] Only 5 players")

    total = len(to_process)
    est_min = total * delay / 60

    print(f"\nPlayers to process : {total}")
    print(f"Provider           : {args.provider}  ({model})")
    print(f"Delay between calls: {delay}s")
    print(f"Estimated time     : ~{est_min:.0f} minutes")
    print(f"Cost               : FREE ✓\n")

    # ── Process ───────────────────────────────────────────────────────────
    player_index = {p["id"]: i for i, p in enumerate(players)}
    updated = skipped = errors = not_confident = 0

    for idx, player in enumerate(to_process, 1):
        pid  = player["id"]
        name = player["name"]
        print(f"[{idx:4d}/{total}] {name:<35} ...", end=" ", flush=True)

        result = call_api(build_prompt(player), args.provider, args.api_key, model)

        if result is None:
            print("ERROR — skipping")
            errors += 1
            done[pid] = {"status": "error"}

        elif not result.get("confident", True):
            print("UNKNOWN — skipping")
            not_confident += 1
            done[pid] = {"status": "not_confident"}

        elif not validate_stats(result, player["stats"]):
            print(f"INVALID — skipping")
            skipped += 1
            done[pid] = {"status": "invalid", "raw": result}

        else:
            orig = player_index[pid]
            old_runs = players[orig]["stats"]["totalRuns"]

            players[orig]["stats"]["testRuns"]     = int(result["testRuns"])
            players[orig]["stats"]["testWickets"]  = int(result["testWickets"])
            players[orig]["stats"]["testMatches"]  = int(result["testMatches"])
            players[orig]["stats"]["odiRuns"]      = int(result["odiRuns"])
            players[orig]["stats"]["odiWickets"]   = int(result["odiWickets"])
            players[orig]["stats"]["odiMatches"]   = int(result["odiMatches"])
            players[orig]["stats"]["t20iRuns"]     = int(result["t20iRuns"])
            players[orig]["stats"]["t20iWickets"]  = int(result["t20iWickets"])
            players[orig]["stats"]["t20iMatches"]  = int(result["t20iMatches"])
            players[orig]["stats"]["centuries"]    = int(result["centuries"])
            players[orig]["stats"]["totalRuns"]    = (
                int(result["testRuns"]) + int(result["odiRuns"]) + int(result["t20iRuns"])
            )
            players[orig]["stats"]["totalWickets"] = (
                int(result["testWickets"]) + int(result["odiWickets"]) + int(result["t20iWickets"])
            )

            new_runs = players[orig]["stats"]["totalRuns"]
            diff = new_runs - old_runs
            sign = "+" if diff >= 0 else ""
            print(f"OK   {old_runs:>6,} → {new_runs:>6,}  ({sign}{diff:,} runs)")
            updated += 1
            done[pid] = {"status": "updated", "old": old_runs, "new": new_runs}

        # Save checkpoint every player (safe to interrupt)
        with open(CHECKPOINT, "w", encoding="utf-8") as f:
            json.dump(done, f, indent=2)

        time.sleep(delay)

    # ── Save output ───────────────────────────────────────────────────────
    if not args.dry_run:
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(players, f, ensure_ascii=False, separators=(",", ":"))
        print(f"\nSaved → {OUTPUT_FILE}")

    print(f"\n{'='*55}")
    print(f"  Updated        : {updated}")
    print(f"  Not recognised : {not_confident}")
    print(f"  Invalid resp   : {skipped}")
    print(f"  API errors     : {errors}")
    print(f"{'='*55}")

    if not args.dry_run and updated > 0:
        print("""
Next steps:
  1. Review:    python scripts/check_enriched.py
  2. Apply:     copy scripts\\players_enriched.json public\\players.json
  3. Rebuild:   npm run build
""")


if __name__ == "__main__":
    main()
