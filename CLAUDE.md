# CLAUDE.md — Cricket Bingo

## Project Overview
Cricket Bingo is a daily cricket knowledge challenge game where players match cricket players to grid cells based on stats, achievements, teams, and roles.

- **Live**: [cricket-bingo.in](https://cricket-bingo.in)
- **Stack**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Firebase (Auth + Firestore) + Vercel
- **Capacitor** for Android builds

## Architecture

```
src/
├── components/         # UI components (game/, auth/, battle/, wallet/, ui/)
├── contexts/           # AuthContext (Firebase auth + user data)
├── hooks/              # useGameState, useGuessGame, useBattleGame, useOnlineBattle, useBotOpponent
├── lib/                # Core engines
│   ├── gameEngine.ts   # Validators, bingo check, scoring
│   ├── dailyGame.ts    # Grid/deck generation, solvability
│   ├── guessGameEngine.ts  # Guess-the-player mode
│   ├── firebase.ts     # Firebase config
│   ├── sounds.ts       # Audio system
│   ├── razorpay.ts     # Payment integration
│   └── crazyGamesSDK.ts   # CrazyGames distribution
├── pages/              # Route pages (Index, Landing, Login, Admin, Battle, GuessPlayer, Stats, etc.)
├── data/               # categories.json, players.json (3600+ players)
└── types/              # TypeScript interfaces
```

## Key Patterns
- **Seeded daily grids** — deterministic RNG from date+size hash, same grid for all players
- **Solvability check** — backtracking algorithm verifies grid is completable before use
- **Coverage-guaranteed decks** — min 5 players per cell
- **Real-time sync** — Firestore `onSnapshot` for admin grid changes + leaderboard
- **State persistence** — localStorage for quick recovery, Firestore for leaderboard/streaks

## Development Rules
- Run `npm run build` to type-check + build before committing
- Run `npm test` before committing
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`
- No `console.log` or debug statements in committed code
- Keep files under 300 lines where possible
- No emojis in code or commit messages
- Modular code with single responsibility per file

## Key Commands
```bash
npm run dev          # Start dev server (Vite)
npm run build        # TypeScript check + production build
npm run build:dev    # Dev mode build
npm run lint         # ESLint
npm test             # Vitest (run once)
npm run test:watch   # Vitest (watch mode)
npm run preview      # Preview production build locally
npx cap sync android # Sync Capacitor Android
```

## Firebase Collections
- `users/{uid}` — Player profiles, streaks
- `scores/{date-size-uid}` — Game scores
- `dailyGrid/{date-size}` — Admin-created daily grids
- `meta/{init}` — First-user sentinel (auto-admin)

## Game Modes
1. **Daily Bingo** — Classic 3x3 / 4x4 grid, one per day
2. **Guess the Player** — Identify player from clues
3. **Battle Mode** — Head-to-head (online + bot opponent)
4. **Paid Battle** — Razorpay-integrated competitive mode

## Deployment
- **Vercel** — Auto-deploy from GitHub on push to main
- **CrazyGames** — Packaged as zip for distribution
- **Android** — Capacitor build via `npx cap sync android`
