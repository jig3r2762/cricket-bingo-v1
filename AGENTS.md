# AGENTS.md — Cricket Bingo Project Context

> This file is the single source of truth for AI agents working on this codebase.
> Read this before touching any file. Updated: May 2026.
> Code reviewer: Claude Sonnet (reviews all agent PRs before merge).

---

## What This Project Is

Cricket Bingo is a **daily cricket knowledge game** live at [cricket-bingo.in](https://cricket-bingo.in).

Players match real cricket player cards to a bingo grid where each cell is a category
(IPL team, country, role, career stat, trophy, teammate, or combo). Complete a row/column/diagonal = BINGO.

- **Free to play**, no download, works in browser
- **1,145 real cricket players** from Cricsheet open data (CC-BY-4.0)
- **Seeded daily grids** — same puzzle for all players worldwide, fair leaderboard
- **4 game modes**: Daily Bingo, Guess the Cricketer, Battle (bot/friend), Paid Battle (coins)

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + TypeScript (strict) |
| Build | Vite 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Backend | Firebase (Auth + Firestore) |
| Hosting | Vercel (auto-deploy from GitHub main branch) |
| Payments | Razorpay (built, NOT yet deployed) |
| Mobile | Capacitor Android (WIP, NOT yet published) |
| Analytics | Vercel Analytics + Speed Insights |

---

## Repository Structure

```
src/
├── pages/               # Route-level page components
│   ├── Landing.tsx      # / — public hero page
│   ├── About.tsx        # /about
│   ├── HowToPlay.tsx    # /how-to-play
│   ├── Players.tsx      # /players — searchable player database
│   ├── PlayerProfile.tsx# /players/:id — individual player profile
│   ├── Privacy.tsx      # /privacy
│   ├── Terms.tsx        # /terms
│   ├── Login.tsx        # /login — Google sign-in
│   ├── Index.tsx        # /play — main game page
│   ├── Battle.tsx       # /battle — vs bot or friend
│   ├── PaidBattle.tsx   # /paid-battle — coin-wagered 1v1
│   ├── GuessPlayer.tsx  # /guess — guess the cricketer mode
│   ├── Leaderboard.tsx  # /leaderboard — all-time top scores
│   ├── Stats.tsx        # /stats — personal stats
│   ├── Admin.tsx        # /admin — grid management (admin only)
│   └── NotFound.tsx     # 404
│
├── components/
│   ├── game/            # BingoCell, BingoGrid, PlayerCard, GameOverScreen,
│   │                    # GameHeader, BingoMeter, GridSelection, TurnTimer,
│   │                    # HowToPlayModal, OnboardingOverlay, InteractiveTutorial
│   ├── battle/          # RoomSetup, WaitingRoom, OnlineBattleArena,
│   │                    # BattleResult, OpponentPanel, EntryFeePicker, DifficultyPicker
│   ├── wallet/          # CoinBalance, AddCoinsModal
│   ├── auth/            # ProtectedRoute, AdminRoute
│   ├── ui/              # shadcn/ui components (do not edit these)
│   ├── ThemeToggle.tsx
│   ├── AdSense.tsx
│   └── ErrorBoundary.tsx
│
├── contexts/
│   ├── AuthContext.tsx   # Firebase auth + user profile (isAdmin, uid, displayName)
│   ├── PlayersContext.tsx# Loads players.json once, provides to all authenticated pages
│   └── WalletContext.tsx # Real-time coin balance via Firestore onSnapshot
│
├── hooks/
│   ├── useGameState.ts   # Main daily bingo game — all state + actions
│   ├── useGuessGame.ts   # Guess the cricketer mode logic
│   ├── useBattleGame.ts  # Bot battle game logic
│   ├── useOnlineBattle.ts# Real-time Firestore online battle
│   ├── useBotOpponent.ts # AI bot move simulation
│   └── useTheme.ts       # Dark/light mode toggle (persisted to localStorage)
│
├── lib/
│   ├── gameEngine.ts     # validate(), calculateScore(), checkBingo(), getEligibleCells()
│   ├── dailyGame.ts      # Seeded RNG, solvability checker, daily grid generator
│   ├── guessGameEngine.ts# Guess mode clue generation + scoring
│   ├── firebase.ts       # Firebase config + initialized app/auth/db exports
│   ├── useSeoHead.ts     # Per-page SEO hook (title, description, canonical, og, JSON-LD)
│   ├── sounds.ts         # Audio system (correct/wrong/bingo/skip sounds)
│   ├── razorpay.ts       # Razorpay client-side SDK wrapper
│   ├── crazyGamesSDK.ts  # CrazyGames ad SDK (midgame + rewarded ads)
│   ├── confetti.ts       # Confetti animation on bingo
│   ├── iframeUtils.ts    # Detects CrazyGames iframe, forces HashRouter
│   └── utils.ts          # shadcn utility (cn())
│
├── data/
│   ├── categories.ts     # Category pool (49 categories), TEAM_COLORS, COUNTRY_FLAGS
│   ├── mockData.ts       # Re-exports from categories.ts (legacy, do not expand)
│   └── tutorialData.ts   # Tutorial step definitions
│
├── types/
│   └── game.ts           # All TypeScript interfaces (CricketPlayer, GameState, etc.)
│
public/
├── players.json          # 1,145 player records (source of truth for game data)
├── sitemap.xml           # 1,151 URLs (6 static + 1,145 player profiles)
└── headshots/            # Player headshot images (partial coverage)

api/                      # Razorpay serverless functions (NOT YET COMMITTED)
├── create-order.ts
├── verify-payment.ts
├── paid-room-create.ts
├── paid-room-join.ts
├── paid-room-finish.ts
├── paid-room-refund.ts
└── _adminDb.ts

scripts/
├── generate-sitemap.cjs  # Run with `node scripts/generate-sitemap.cjs` to rebuild sitemap
└── (other data scripts)
```

---

## Routing

### App.tsx (public routes — no Firebase)
| Route | Component | Notes |
|-------|-----------|-------|
| `/` | Landing.tsx | SEO landing page, no auth |
| `/about` | About.tsx | |
| `/how-to-play` | HowToPlay.tsx | |
| `/players` | Players.tsx | Searchable database |
| `/players/:id` | PlayerProfile.tsx | Individual player page |
| `/privacy` | Privacy.tsx | |
| `/terms` | Terms.tsx | |
| `/*` | AuthenticatedApp | Firebase loads here |

### AuthenticatedApp.tsx (protected routes — Firebase required)
| Route | Guard | Notes |
|-------|-------|-------|
| `/login` | None | Google sign-in |
| `/play` | ProtectedRoute | Main game |
| `/battle` | ProtectedRoute | Bot or friend battle |
| `/paid-battle` | ProtectedRoute | Coin-wagered 1v1 |
| `/guess` | ProtectedRoute | Guess the cricketer |
| `/leaderboard` | ProtectedRoute | All-time scores |
| `/stats` | ProtectedRoute | Personal stats |
| `/admin` | AdminRoute | Grid management |

**Important:** Public pages (Landing through Terms) are code-split and load **without Firebase**. This keeps the landing page LCP fast. Never import Firebase or AuthContext into public pages.

---

## Firebase Collections

| Collection | Document ID | Purpose |
|------------|-------------|---------|
| `users/{uid}` | Firebase UID | Player profile, streak, isAdmin flag |
| `scores/{date-size-uid}` | e.g. `2026-05-10-3-uid123` | Per-game score records |
| `dailyGrid/{date-size}` | e.g. `2026-05-10-3` | Admin-overridden daily grids |
| `meta/init` | fixed | First-user sentinel → auto grants isAdmin |
| `transactions/{id}` | auto | Razorpay payment audit trail |
| `battles/{roomId}` | auto | Online battle room state |
| `paidBattles/{roomId}` | auto | Paid battle room + coin escrow |

**Leaderboard query:** `scores` collection, two separate queries:
- `where("gridSize","==",3).orderBy("score","desc").limit(100)`
- `where("gridSize","==",4).orderBy("score","desc").limit(100)`

Requires composite index: `gridSize ASC + score DESC` in Firebase Console.

---

## Data Schema

### players.json entry
```json
{
  "id": "ind_virat_kohli",
  "name": "Virat Kohli",
  "country": "India",
  "countryCode": "IND",
  "countryFlag": "🇮🇳",
  "iplTeams": ["RCB"],
  "primaryRole": "Batsman",
  "stats": {
    "testRuns": 9230, "testWickets": 0, "testMatches": 123,
    "odiRuns": 14675, "odiWickets": 5, "odiMatches": 308,
    "t20iRuns": 3969, "t20iWickets": 4, "t20iMatches": 118,
    "iplRuns": 8671, "iplWickets": 4, "iplMatches": 266,
    "totalRuns": 27874, "totalWickets": 9,
    "centuries": 84, "iplCenturies": 8
  },
  "trophies": ["CT", "CWC", "IPL", "T20WC"],
  "teammates": ["aus_aaron_finch", ...],
  "headshot_url": "/headshots/ind_virat_kohli.jpg",
  "categories": ["Captains", "50+ Century Makers", ...]
}
```

### primaryRole values
`"Batsman"` | `"WK-Bat"` | `"Fast Bowler"` | `"Spin Bowler"` | `"All-Rounder"`

### trophy codes
`IPL` | `CWC` (World Cup) | `T20WC` | `CT` (Champions Trophy) | `WTC`

### teammates
Flat `string[]` of player IDs. NOT an object array.

---

## Validation System (gameEngine.ts)

Each grid category has a `validatorKey` string. `validate(player, category)` parses it:

| Pattern | Meaning | Example |
|---------|---------|---------|
| `team:MI` | player played for IPL team | `team:CSK` |
| `country:India` | player's country | `country:Australia` |
| `stat:totalRuns>=10000` | career stat threshold | `stat:totalWickets>=300` |
| `role:Batsman` | role match (Batsman also matches WK-Bat) | `role:Fast Bowler` |
| `trophy:IPL` | trophy in player.trophies | `trophy:T20WC` |
| `teammate:ind_ms_dhoni` | played in same XI | `teammate:ind_virat_kohli` |
| `category:Captains` | player.categories includes value | `category:World Cup Winners` |
| `combo:team:MI+country:India` | both sub-validators must pass | |
| `overseas` | non-Indian IPL player | |
| `iplTeams>=3` | played for 3+ IPL teams | |

---

## Scoring System

| Category type | Base pts | Streak 2x | Streak 3x (4+ streak) |
|---------------|----------|-----------|----------------------|
| Country / Team | 100 | 200 | 300 |
| Role / Stat | 100 | 200 | 300 |
| Trophy | 120 | 240 | 360 |
| Teammate | 130 | 260 | 390 |
| Combo | 150 | 300 | 450 |
| Wildcard | 50 | 50 | 50 |
| Bingo Bonus | 500 | — | — |

Streak multiplier: 1x at 0, +0.5x per consecutive correct, capped at 3x. Wrong/skip resets streak to 0.

---

## Game Logic — Key Rules

- Grid sizes: 3x3 (20 turns) or 4x4 (25 turns)
- Deck: 40 player cards, drawn sequentially (same order for all players via seed)
- Win: complete any row, column, or diagonal
- Loss: run out of turns with no complete line
- Wildcard: 1 per game, places any player on any cell (no validation)
- Skip: discards current card, costs 1 turn, resets streak
- Wrong placement: costs 1 turn, resets streak, cell stays empty
- Daily seed: `"cricket-bingo-YYYY-MM-DD-{gridSize}"` → mulberry32 RNG

---

## Daily Grid Generation (dailyGame.ts)

1. Seed RNG from date + grid size
2. Pick categories from pool (balanced easy/medium/hard)
3. Build deck of 40 players (coverage-guaranteed: min 5 players per cell)
4. Solvability check: backtracking with most-constrained-first ordering, max 50 attempts
5. If unsolvable → retry with next seed increment
6. Admin can override via Firestore `dailyGrid/{date-size}` — takes priority

---

## Monetization Status

### Google AdSense
- Publisher ID: `ca-pub-7606459883233703`
- Auto ads enabled on public pages only
- Game/app pages excluded via `index.html` script
- First review rejected (thin content). Fix: added 1,145 player profile pages.
- **Status: Re-review pending**

### Razorpay Coin Shop
- 4 coin packs: Starter ₹50/500c, Popular ₹100/1100c, Value ₹250/3000c, Mega ₹500/7000c
- Frontend: `src/components/wallet/AddCoinsModal.tsx` + `src/lib/razorpay.ts`
- Backend: `api/create-order.ts`, `api/verify-payment.ts`
- **Status: Built but api/ directory NOT committed yet**

### Paid 1v1 Battles
- Entry fees: 50/100/250/500 coins. Winner takes 2×, draw = refund.
- Frontend: `src/pages/PaidBattle.tsx`, `src/components/battle/`
- Backend: `api/paid-room-*.ts`
- **Status: Built but api/ directory NOT committed yet**

### CrazyGames Ads
- SDK: `src/lib/crazyGamesSDK.ts`
- Midgame ads trigger on game over
- Rewarded ads infrastructure ready but NOT connected to coin grants yet

### Wallet System
- Live in production
- `src/contexts/WalletContext.tsx` — real-time Firestore sync
- Admin can grant coins: Admin.tsx → CoinsManager tab

---

## Key Architecture Patterns

### State management
- All game state mutations use `setGameState(prev => ...)` — prevents stale closures
- `postTurn()` is a module-level pure function exported from `useGameState.ts`, shared by battle hooks
- Feedback timer uses `useRef` not `useEffect`

### Firebase loading
- Firebase is lazy-loaded only when user navigates away from public pages
- `PlayersContext` loads `players.json` once per session, provides to all authenticated pages
- `WalletContext` uses `onSnapshot` for real-time coin balance

### SEO
- Public pages use `useSeoHead()` hook to set title/description/og/canonical/JSON-LD
- `useSeoHead` restores defaults on unmount — always call it at the top of the component
- Player profile pages include JSON-LD `Person` schema

### Routing split
- `App.tsx` handles public routes (no Firebase)
- `AuthenticatedApp.tsx` wraps all auth-required routes with `AuthProvider` + `WalletProvider` + `PlayersContext`
- `shouldUseHashRouter()` detects CrazyGames iframe and switches to HashRouter

---

## Coding Rules (must follow)

- **TypeScript strict** — no `any` types
- **No `console.log`** in committed code
- **No comments** unless the WHY is non-obvious
- **Files under 300 lines** — split if larger
- **No emojis** in code or commit messages
- **Conventional commits**: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- **Functional components only**, custom hooks for logic
- **Path aliases**: use `@/` for all imports from `src/`
- **Import order**: React/libs → local components → utils → types
- **Run before every commit**: `npm run build` → `npm test` → `npm run lint`

---

## Pending Work (as of May 2026)

| Item | Status | Files |
|------|--------|-------|
| Razorpay coin shop deployment | Built, not committed | `api/create-order.ts`, `api/verify-payment.ts` |
| Paid battle deployment | Built, not committed | `api/paid-room-*.ts` |
| AdSense re-review | Waiting for indexing | — |
| CrazyGames rewarded ads → coin grants | Not wired | `src/lib/crazyGamesSDK.ts`, `src/contexts/WalletContext.tsx` |
| Android Capacitor app | WIP | `android/`, `capacitor.config.ts` |
| Firebase composite index | Needs creation in console | scores: gridSize ASC + score DESC |

---

## Environment Variables

```
# .env.local (never commit)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_RAZORPAY_KEY_ID=          # frontend (test: rzp_test_xxx)

# Vercel environment variables (server-side, for api/ routes)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
FIREBASE_SERVICE_ACCOUNT=      # full JSON string
```

---

## Common Commands

```bash
npm run dev          # Start dev server (localhost:8080)
npm run build        # TypeScript check + production build (run before commit)
npm run lint         # ESLint
npm test             # Vitest (run once)
npm run test:watch   # Vitest watch mode
npm run preview      # Preview production build

node scripts/generate-sitemap.cjs   # Regenerate public/sitemap.xml

npx cap sync android  # Sync Capacitor Android build
```

---

## What NOT to Touch

- `src/components/ui/` — shadcn/ui generated components, never edit manually
- `src/data/mockData.ts` — legacy, only re-exports, do not expand
- `public/players.json` — source of truth, only update via enrichment scripts
- Firebase security rules — do not weaken without explicit instruction
- `main` branch — never force-push, always PR
