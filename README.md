# Cricket Bingo 🏏

A daily cricket knowledge challenge game where players match cricket players to grid cells based on their stats, achievements, and details.

**Live Demo**: [cricket-bingo-v1.vercel.app](https://cricket-bingo-v1.vercel.app)

---

## Features

### Core Gameplay
- **Daily Grid Challenge** — New grid shuffled every day (seeded, consistent across all players)
- **3×3 and 4×4 Grid Sizes** — Choose your difficulty
- **Player Matching** — Place cricket players on cells based on:
  - Teams (IPL, International)
  - Countries
  - Roles (Batsman, Bowler, All-rounder, Wicket-keeper)
  - Stats (Runs, Wickets, etc.)
  - Trophies (World Cups, IPL championships)
  - Combos (Team + Country, etc.)

### Smart Game Engine
- **Validation** — Instant feedback: green glow (correct) or red error (wrong)
- **Streak Tracking** — Consecutive correct placements = higher scores
- **Coverage-Guaranteed Deck** — Minimum 4-5 players per cell ensures you never get stuck
- **Recommended Cell Highlighting** — Know which cell is the best match
- **Wildcard Power** — Place any player anywhere (1 per game)

### Player Experience
- **Real-time Leaderboard** — Daily rankings with scores, streaks, and achievements
- **Streak System** — Consecutive days of play earn fire emoji badges
- **Score Multipliers** — Streaks increase points: 1x → 3x
- **Game State Persistence** — Save progress via localStorage + Firestore
- **Share Results** — Copy emoji grid or download score card

### Admin Panel
- **Grid Customization** — Create custom grids for specific dates/sizes
- **Live Sync** — Changes broadcast to all active players instantly (Firestore `onSnapshot`)
- **Deck Assignment** — Select specific players for the grid
- **Grid Validation** — Checks solvability before saving

---

## Recent Improvements (Current Session)

### 1. **Filled Cell Visual Glow** (`index.css`)
- Completed cells now show persistent green border + soft glow
- Easy visual confirmation of placed players

### 2. **Deck Coverage Guarantee** (`dailyGame.ts`)
- Dynamic deck sizing: `3×3 = 45 players`, `4×4 = 80 players`
- Ensures minimum 5 players per cell
- **Fixed**: Games no longer end prematurely at 7 correct placements

### 3. **Admin Grid Live Sync** (`Index.tsx`)
- Replaced `getDoc` with `onSnapshot` listener
- Admin changes reflect instantly for all active players
- No page refresh needed

### 4. **SPA Routing Fix** (`vercel.json`)
- Added catch-all rewrite for client-side routes
- Refreshing `/leaderboard` or `/admin` now works correctly on Vercel

### 5. **Branding Updates** (`index.html`, `vite.config.ts`)
- Removed Lovable branding
- Cricket Bingo title + description
- Cricket bat emoji favicon 🏏
- Removed component tagger

### 6. **Random Game Shuffling** (`useGameState.ts`, `Index.tsx`)
- After game over, "Retry" generates new random grid + deck
- Continuous play without daily grid limit
- Keeps challenges fresh and varied

---

## Technology Stack

```
Frontend:
├── React 18 — UI framework
├── TypeScript — Type safety
├── Vite — Build tool (fast dev, SWC compiler)
├── Tailwind CSS — Styling
├── shadcn-ui — Component library
├── Framer Motion — Animations
├── React Router — Routing
├── TanStack Query — Data fetching

Backend:
├── Firebase Authentication — Google OAuth
├── Firestore — Real-time database
│   ├── users/{uid} — Player profiles, streaks
│   ├── scores/{date-size-uid} — Game scores
│   ├── dailyGrid/{date-size} — Daily grids
│   └── meta/{init} — First-user sentinel

Deployment:
└── Vercel — Hosting + serverless (with SPA rewrites)
```

---

## Game Mechanics

### Validation Logic
Each cell has a `validatorKey`, e.g.:
- `country:India` → Player must be from India
- `team:MI` → Player must have played for Mumbai Indians
- `role:Batsman` → Player primary role is Batsman
- `stat:totalRuns>=10000` → Player has 10K+ runs
- `combo:country:India+team:MI` → Both conditions required

### Scoring
```
Base Points:
- Single: 100 pts
- Combo: 150 pts
- Teammate: 130 pts
- Trophy: 120 pts
- Stat: 100 pts

Multiplier:
- Streak 0: 1.0x
- Streak 1: 1.5x
- Streak 2: 2.0x
- Streak 3+: up to 3.0x (capped)

Final = Base × Multiplier
```

### Streak System
- **Reset** on wrong placement or skip
- **Daily Tracking** — Consecutive days of play
- **Fire Badge** — 🔥 shows when streak ≥ 2

---

## Setup & Development

### Prerequisites
- Node.js 16+ (install via [nvm](https://github.com/nvm-sh/nvm))
- npm or yarn

### Installation
```sh
# Clone the repo
git clone https://github.com/jig3r2762/cricket-bingo-v1.git
cd cricket-bingo-v1

# Install dependencies
npm install

# Start dev server
npm run dev
# Opens at http://localhost:8080
```

### Environment Setup
Create `.env.local` (or set in Vercel dashboard):
```
VITE_FIREBASE_API_KEY=<your-key>
VITE_FIREBASE_AUTH_DOMAIN=<your-domain>
VITE_FIREBASE_PROJECT_ID=<your-project>
VITE_FIREBASE_STORAGE_BUCKET=<your-bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-id>
VITE_FIREBASE_APP_ID=<your-app-id>
```

### Build
```sh
npm run build        # Production bundle
npm run preview      # Local prod preview
npm run type-check   # TypeScript check
```

---

## Project Structure

```
src/
├── components/
│   ├── game/
│   │   ├── BingoCell.tsx — Single grid cell (filled/empty states)
│   │   ├── BingoGrid.tsx — Grid container
│   │   ├── BingoMeter.tsx — Progress bar
│   │   ├── GameOverScreen.tsx — End screen (share, retry, ranks)
│   │   ├── GameHeader.tsx — Score & streak display
│   │   ├── GridSelection.tsx — 3×3 vs 4×4 picker
│   │   ├── HowToPlayModal.tsx — Rules dialog
│   │   ├── PlayerCard.tsx — Current player display + controls
│   │   └── Leaderboard.tsx — Daily rankings
│   ├── auth/
│   │   ├── ProtectedRoute.tsx — Auth guard for routes
│   │   └── AdminRoute.tsx — Admin-only guard
│   └── ui/ — shadcn-ui components
├── contexts/
│   └── AuthContext.tsx — Firebase auth + user data
├── hooks/
│   └── useGameState.ts — Game logic, validation, scoring
├── lib/
│   ├── gameEngine.ts — Validators, bingo check, scoring
│   ├── dailyGame.ts — Grid/deck generation, solvability check
│   └── firebase.ts — Firebase client config
├── pages/
│   ├── Index.tsx — Main game board
│   ├── Login.tsx — Google sign-in
│   ├── Admin.tsx — Grid management
│   └── NotFound.tsx — 404 page
├── data/
│   ├── categories.json — All 42 grid categories
│   └── players.json — 3600+ cricket players
├── types/
│   └── game.ts — TypeScript interfaces
└── styles/
    └── index.css — Tailwind + custom glass-morphism styles
```

---

## Key Features Explained

### 1. Solvability Check
Before each grid is used, a backtracking algorithm verifies that a valid player assignment exists for all cells:
- Prevents unsolvable grids
- Uses most-constrained-first ordering
- 50 retry attempts max

### 2. Daily Grid Seeding
Daily grids use deterministic seeding:
```
Seed = hash(date + gridSize)
↓
Same seed = same grid for all players on the same day
↓
Consistent leaderboard
```

### 3. Coverage-Guaranteed Decks
Every cell guaranteed 4+ matching players:
```
Phase 1: Reserve 4 players per cell
Phase 2: Fill remaining deck with other relevant players
Phase 3: Pad with distractors if needed
```

### 4. Real-Time Admin Sync
Admin saves grid → Firestore write → `onSnapshot` fires → Game resets with new grid
- No polling
- Instant updates
- Players see changes live

### 5. Persistent Game State
- **localStorage** — Quick recovery if refresh
- **Firestore** — Leaderboard + streaks
- Auto-save on every action

---

## Deployment

### Vercel (Current)
```sh
# Automatic from GitHub
git push origin main
# → Vercel auto-deploys
```

**Configure in Vercel Dashboard:**
- Environment variables (Firebase keys)
- Build command: `npm run build`
- Output directory: `dist`

### Manual Deploy (Firebase Hosting)
```sh
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## API & Data Flow

### Authentication
```
User clicks "Sign in with Google"
    ↓
Firebase OAuth popup
    ↓
Firebase creates user doc at users/{uid}
    ↓
First user gets role "admin"
    ↓
Token persisted in IndexedDB
    ↓
Auto-login on return visits
```

### Game State
```
1. Player selects grid size (3×3 or 4×4)
2. Load daily grid from Firestore (or generate random if unavailable)
3. Game starts at deckIndex 0
4. Player clicks cell:
   - Validate against current player
   - If correct: place + increment score + move to next player
   - If wrong: decrement remaining players + show error
5. If remaining ≤ 0 or all cells filled: game over
6. Save score to Firestore + update streak
```

---

## Known Limitations & Future Improvements

### Current Limitations
- Google sign-in only (no email/password)
- No mobile-specific UI (responsive but not optimized)
- No offline mode
- Limited player data (3600 players, could expand)

### Potential Features
- [ ] Multiplayer mode
- [ ] Social sharing integration
- [ ] Advanced filters/search in admin
- [ ] Analytics dashboard
- [ ] Custom leagues/tournaments
- [ ] Dark mode toggle
- [ ] Internationalization (i18n)
- [ ] Mobile app (React Native)

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a PR

---

## License

MIT License — See LICENSE file for details

---

## Support

For issues or feedback:
- GitHub Issues: [cricket-bingo-v1/issues](https://github.com/jig3r2762/cricket-bingo-v1/issues)
- Email: (add contact if available)

---

**Built with ❤️ for cricket fans**
