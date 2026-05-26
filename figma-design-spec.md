# Cricket Bingo — Figma Design Specification
> Hand this document to your Figma agent. It covers every page, all states, design tokens, and dummy data.

---

## Design System

### Fonts
| Role | Family | Weights |
|------|--------|---------|
| Display (headings, scores, labels) | **Lilita One** | 400 |
| Body (descriptions, buttons, meta) | **Nunito** | 400, 600, 700, 800 |

### Color Tokens
| Token | Light Mode HEX | Dark Mode HEX | Use |
|-------|---------------|---------------|-----|
| candy-green | `#3da84c` | `#4ade80` | Primary CTA, correct states, India flag accent |
| candy-orange | `#f97316` | `#fb923c` | Secondary CTA, score, skip button |
| candy-blue | `#29a8f5` | `#22d3ee` | 4x4 mode, batsman badge |
| candy-purple | `#8b5cf6` | `#a78bfa` | Battle, WK-Bat badge, vs player |
| candy-red | `#ef4444` | `#ef4444` | Game over, fast bowler badge, wrong state |
| candy-yellow | `#f5c518` | `#facc15` | Trophies, streaks, leaderboard gold |
| candy-pink | `#ec4899` | `#f472b6` | Combo categories |
| Background (light) | `#fff8f0` | `#060d20` | Warm cream gradient |
| Card surface (light) | `#ffffff` | `#0f1b36` | Cards, modals |
| Foreground (light) | `#3d2a1a` | `#f1f5f9` | Body text |
| Muted text | `#a08060` | `#64748b` | Labels, captions |
| Border | `#e8d5c0` | `#1e2d4a` | Card borders |

### Background
- **Light**: `linear-gradient(160deg, #fff8f0 0%, #fef0e6 50%, #fff3ec 100%)`
- **Dark**: `#060d20` solid

### Card Component (`.candy-card`)
```
background: white
border: 2px solid #e8d5c0
border-radius: 16px
box-shadow: 0 4px 0 #e8d5c0   ← chunky 3D bottom shadow
padding: 16–24px
```

### Button Component (`.candy-btn-green`)
```
background: #3da84c
color: white
border: none
border-radius: 16px
box-shadow: 0 4px 0 #2a7535   ← 3D press shadow
padding: 12px 32px
font: Nunito 700, uppercase, tracking-wider
hover: scale(1.05)
active: scale(0.95), translateY(4px)
```

### Button Component (`.candy-btn-orange`)
```
Same as green but background: #f97316, shadow: #c2410c
```

---

## Page Inventory

| # | Route | Access | Description |
|---|-------|--------|-------------|
| 1 | `/` | Public | Landing — marketing page |
| 2 | `/login` | Public | Sign in with Google or play as guest |
| 3 | `/play` (step 1) | Protected | Grid/mode selection screen |
| 4 | `/play` (step 2) | Protected | Main game board |
| 5 | `/play` (game over) | Protected | Game over / results screen |
| 6 | `/guess` (start) | Public | Guess-the-Cricketer intro |
| 7 | `/guess` (game) | Public | Active guessing round |
| 8 | `/guess` (end) | Public | Guess game results |
| 9 | `/leaderboard` | Protected | All-time top scorers, tabbed by grid size |
| 10 | `/stats` | Protected | Personal stats dashboard |
| 11 | `/battle` (setup) | Protected | VS Player — create or join room |
| 12 | `/battle` (waiting) | Protected | Waiting room for opponent |
| 13 | `/players` | Public | Player database with search/filter |
| 14 | `/players/:id` | Public | Individual player profile |
| 15 | `/how-to-play` | Public | Game rules page |
| 16 | `/about` | Public | About page |
| 17 | `/privacy` | Public | Privacy policy |
| 18 | `/terms` | Public | Terms of service |

---

## Page 1: Landing (`/`)

**Layout**: Full-screen, single column, scrollable. `warm-bg` gradient. Fixed ThemeToggle top-right.

### Section 1 — Hero (viewport height)
```
┌─────────────────────────────────────────────┐
│  [ThemeToggle]                          ← top-right fixed
│                                             │
│  [Floating emojis: 🏏 🏆 ⭐ 🎯 🔥 🎮 🏅]   ← drifting upward, faded
│                                             │
│                                             │
│                  🏏                         │  ← bouncing bat, 72px
│                                             │
│              Cricket                        │  ← Lilita One, 64px, foreground color
│               Bingo                         │  ← Lilita One, 64px, candy-green
│                                             │
│  The free online cricket game with         │
│  3,600+ real player cards.                  │  ← Nunito 600, 18px, muted
│  Match cricketers to categories,            │
│  beat the clock, and compete globally.      │
│                                             │
│  ┌─────────────────┐  ┌──────────────────┐ │
│  │ 🎮 Play Now—Free│  │ Quick Guest Play │ │
│  │  (candy-green)  │  │  (outline btn)   │ │
│  └─────────────────┘  └──────────────────┘ │
│                                             │
│             Scroll to learn more ↓          │  ← muted, tiny, bouncing
└─────────────────────────────────────────────┘
```

### Section 2 — Game Modes (2-col grid)
```
Choose Your Game
┌────────────────────┐  ┌────────────────────┐
│ 🎯 Cricket Bingo   │  │ 🕵️ Guess the       │  ← "New" orange badge top-right
│ (green icon box)   │  │    Cricketer        │
│ CLASSIC MODE ↗     │  │ (orange icon box)   │
│                    │  │ NEW MODE ↗          │
│ Match cricket      │  │ 5 clues, 1 mystery  │
│ players to         │  │ player. Fewer clues │
│ categories on a    │  │ = more points.      │
│ bingo grid...      │  │                     │
└────────────────────┘  └────────────────────┘
```

### Section 3 — How It Works (3-col grid)
```
How to Play

┌──────────┐  ┌──────────┐  ┌──────────┐
│  🧑‍💻     │  │  📍     │  │  🏆     │
│ blue bg  │  │orange bg │  │ green bg │
│          │  │          │  │          │
│ STEP 1   │  │ STEP 2   │  │ STEP 3  │
│ A Player │  │ Answer   │  │ Compete │
│ Card     │  │ the      │  │ on the  │
│ Appears  │  │ Cricket  │  │ Leader- │
│          │  │ Question │  │ board   │
│ desc...  │  │ desc...  │  │ desc... │
└──────────┘  └──────────┘  └──────────┘
```

### Section 4 — Features (2×3 grid)
```
Why Play This Free Online Cricket Game

┌──────────┐  ┌──────────┐  ┌──────────┐
│📅 Daily  │  │🏏 3,600+ │  │⏱️ 10-Sec │
│ Cricket  │  │ Player   │  │ Turns    │
│ Quiz     │  │ Cards    │  │          │
│ blue bg  │  │ green bg │  │orange bg │
└──────────┘  └──────────┘  └──────────┘
┌──────────┐  ┌──────────┐  ┌──────────┐
│🏆 Live   │  │🔥 Streaks│  │🎮 Play   │
│ Leader-  │  │ & Stats  │  │ Free     │
│ board    │  │          │  │ Instantly│
│yellow bg │  │  red bg  │  │purple bg │
└──────────┘  └──────────┘  └──────────┘
```

### Section 5 — Stats Bar (3-col)
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  3,600+     │  │    42       │  │     ∞       │
│ candy-green │  │candy-orange │  │ candy-blue  │
│ CRICKET     │  │ QUIZ        │  │ FREE GAMES  │
│ PLAYER CARDS│  │ CATEGORIES  │  │ DAILY       │
└─────────────┘  └─────────────┘  └─────────────┘
```

### Section 6 — Quiz Categories (4-col, 2 rows)
```
8 category mini-cards with icon + label + examples text
Colors: orange, blue, green, purple, yellow, pink, red, blue
```

### Section 7 — FAQ (stacked accordion-style cards)
```
5 Q&A articles:
- "What is Cricket Bingo?"
- "How do you play this online cricket game?"
- "Is this cricket card game free?"
- "How many cricket player cards are there?"
- "Can I play this cricket game on my phone?"
Each: candy-card, Lilita One question, Nunito answer text
```

### Section 8 — Final CTA
```
┌──────────────────────────┐
│           🎯             │
│      Ready to Play?      │  ← Lilita One 36px
│  A new cricket quiz      │
│  awaits every day.       │
│                          │
│  [🎮 Play Now — It's Free]│  ← full width candy-btn-green
└──────────────────────────┘
```

### Footer
```
How to Play | About | Player Database | Leaderboard | Privacy Policy | Terms of Service
Cricket Bingo © 2025 · Free online cricket quiz game · Data from Cricsheet (CC-BY-4.0)
```

---

## Page 2: Login (`/login`)

**Layout**: Full-screen centered, dark/blurred card. Background: `stadium-bg` (dark with animated blobs).

```
┌──────────────────────────┐
│         🏏               │  ← bouncing bat, 48px
│                          │
│      Cricket Bingo       │  ← Lilita One 24px, light
│  Test your cricket       │
│  knowledge daily         │  ← Nunito, muted, 14px
│                          │
│  ┌──────────────┐  ┌────┐│
│  │👥 3,600+     │  │⚡  ││
│  │  Players     │  │Daily│
│  └──────────────┘  └────┘│
│                          │
│ ┌────────────────────────┐│
│ │  G  Sign in with Google││  ← green gradient bg, Google SVG logo
│ └────────────────────────┘│
│                          │
│   ────── or ──────       │
│                          │
│ ┌────────────────────────┐│
│ │  🎮  Play as Guest     ││  ← outline border btn
│ └────────────────────────┘│
│                          │
│ Sign in to save scores,  │
│ streaks & leaderboard    │  ← muted, 12px
└──────────────────────────┘
```

---

## Page 3: Play — Grid Selection (`/play`, step 1)

**Layout**: Centered column, max-w-lg, warm-bg. ThemeToggle top-right.

```
         🏏  (swaying)
    Play Cricket Games    ← Lilita One 30px

 ┌───────────────────────────────────────────┐
 │ ⏱ Timer OFF — play relaxed  [toggle OFF] │  ← pill toggle btn
 └───────────────────────────────────────────┘

 ┌──────────────┐  ┌──────────────┐
 │  📅          │  │  📅          │
 │ (green box)  │  │ (blue box)   │
 │ DAILY 3x3    │  │ DAILY 4x4    │
 │ Today's      │  │ Today's      │
 │ puzzle·9cells│  │ puzzle·16 cel│
 └──────────────┘  └──────────────┘

 ┌──────────────┐  ┌──────────────┐
 │  🏆          │  │  🕵️     NEW  │  ← "New" orange badge
 │ (yellow box) │  │ (orange box) │
 │ IPL MODE     │  │ GUESS WHO    │
 │ All 10 teams │  │ 5 clues ·    │
 │  · IPL only  │  │ Name player  │
 └──────────────┘  └──────────────┘

 ┌─────────────────────────────────────────┐
 │  ⚔️                                     │
 │ (purple icon box — full width)          │
 │ VS PLAYER                               │
 │ Real-time · Same grid · First to fill   │
 └─────────────────────────────────────────┘
```

---

## Page 4: Play — Game Board (`/play`, step 2)

**Layout**: Full page, warm-bg. Top bar + two-column layout on desktop. Single column on mobile.

### Top Bar (sticky white pill)
```
┌──────────────────────────────────────────────────────────┐
│  [←]   [Avatar 32px] Virat Kohli   🔥3        [☰ menu] │
│        virat@gmail.com                                    │
│                                           (Desktop only:) │
│                           💰125  [⚔️vsBot] [Stats] [Ranks]│
└──────────────────────────────────────────────────────────┘
```

### Left Panel (desktop w-72, mobile full-width)

**GameHeader**:
```
┌──────────────┬────────────┬─────────┐
│  Score       │  Streak    │    ?    │
│  1,240       │   🔥 3     │  (help) │
│  candy-orange│  orange    │         │
└──────────────┴────────────┴─────────┘
```

**Player Card** (current card to place):
```
┌──────────────────────────────────────────┐
│  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ (MI blue accent line)  │
│  [Photo]  MS Dhoni               SKIP → │
│   48px    Lilita One 20px           ↑   │
│           (large name → smaller font)   │
│                                          │
│  [⭐ Wild (2)] [ℹ]        8 remaining   │
└──────────────────────────────────────────┘
```

**BingoMeter**:
```
Progress: 5 / 9 cells filled
[■■■■■□□□□]  candy-green fill
```

### Right Panel — Bingo Grid

**3×3 Grid Example** (each cell is square):
```
┌─────────────────┬─────────────────┬─────────────────┐
│   🇮🇳            │   🏆             │  [MI logo]       │
│   INDIA          │    IPL           │    MI            │
│                 │                 │                  │
├─────────────────┼─────────────────┼─────────────────┤
│  [Bat SVG]      │  [Kohli photo]  │  [Trophy SVG]   │
│  BAT             │  w/ KOHLI        │   CWC            │
│                 │ (Dhoni placed✓) │                  │
├─────────────────┼─────────────────┼─────────────────┤
│ [Wicket SVG]    │  [Flag NZ]      │  [Runs SVG]     │
│   WK             │   NEW ZLD        │  10K RUNS        │
│  (eligible glow)│                 │                  │
└─────────────────┴─────────────────┴─────────────────┘
```

**Cell States:**
- Empty: white bg, category icon, short label
- Eligible (current player can go here): green border glow `ring-2 ring-candy-green`
- Recommended: brighter green + subtle pulse
- Filled: candy-green bg, player headshot/flag, player surname + category label in white
- Win line: `ring-2 ring-candy-green ring-offset-1` on all cells in the winning row/col/diag
- Wrong feedback: red overlay flash
- Correct feedback: sparkle particles burst

### Mobile Bottom Bar (fixed, shown during game)
```
┌────────────────────────────────────────┐
│  [Skip]    1,240     [Wild (2)]        │
│  outline   SCORE     candy-green       │
└────────────────────────────────────────┘
```

---

## Page 5: Game Over Screen (within `/play`)

**Layout**: Replaces player card in left panel (or full screen overlay on mobile).

```
┌──────────────────────────────────────────┐
│           🏆  (bounce animation)         │  ← WIN state: yellow trophy 80px
│         BINGO!                           │  ← Lilita One 48px, candy-yellow
│   You completed a line! +500 bonus       │  ← candy-green, small
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ 🔥 87% of players today          │    │  ← percentile social proof card
│  │ Top performer!                    │    │    green bg, green border
│  └──────────────────────────────────┘    │
│                                          │
│  1,740      7/9      3                  │
│  FINAL      CELLS    BEST               │
│  SCORE      FILLED   STREAK             │
│                                          │
│  🔥 3-day streak!                       │  ← orange, Lilita One
│                                          │
│  Next puzzle in: 06:42:18               │  ← countdown
│  ✨ Challenge a friend to beat this      │
│                                          │
│  [Share] [Challenge] [Card] [Ranks]     │  ← row of small icon-text btns
│  [Play Again] [vs Bot]                  │  ← outline btns
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ Sign in to save scores & streaks  │    │  ← guest prompt (if guest)
│  │ [Sign in with Google]             │    │    green gradient btn
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

**GAME OVER state** (lost):
```
XCircle icon (candy-red, 64px) instead of trophy
"Game Over" in candy-red
"Better luck next time!" muted text
Same stats + buttons below
```

---

## Page 6: Guess the Cricketer — Start Screen (`/guess`)

```
┌────────────────────────────────────────┐
│             🕵️  (swaying)              │  ← 60px
│      Guess the Cricketer               │  ← Lilita One 30px
│  We'll show you clues about a mystery  │
│  cricket player — one at a time.       │
│                                        │
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │  10  │  │  3   │  │  5   │         │
│  │green │  │ red  │  │orange│         │
│  │ROUNDS│  │LIVES │  │CLUES │         │
│  └──────┘  └──────┘  └──────┘         │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ SCORING                         │  │
│  │ Guess with 3 clues   300 pts 🟢 │  │
│  │ Reveal 4th clue     200 pts 🟠  │  │
│  │ Reveal all 5 clues  100 pts 🔴  │  │
│  │ ──────────────────────────────  │  │
│  │ Streak bonus: +50% per correct  │  │
│  └──────────────────────────────┘  │  │
│                                        │
│     [🎯 Start Guessing!]               │  ← full width candy-btn-green
│     ← Back to Home                    │  ← muted text link
└────────────────────────────────────────┘
```

---

## Page 7: Guess the Cricketer — Active Round

### Top Bar (sticky, white/blur)
```
← Exit       125 pts  3🔥  ❤️❤️🖤      [ThemeToggle]
```

### Game Area
```
Round 3 of 10          ●●○●○○○○○○  ← progress dots (green=correct, red=wrong, orange=current)

        🕵️ Who is this cricketer?

Clues (revealed one by one):
┌─────────────────────────────────────────┐
│ 🌍 (blue box)  COUNTRY      India       │  ← revealed
├─────────────────────────────────────────┤
│ ⚾ (orange)    ROLE         Batsman     │  ← revealed
├─────────────────────────────────────────┤
│ 🏆 (green)     TROPHY       IPL, CWC   │  ← revealed (3 clues shown)
├─────────────────────────────────────────┤
│ ? (gray)       Clue 4       Reveal...  │  ← unrevealed (dim)
├─────────────────────────────────────────┤
│ ? (gray)       Clue 5       Reveal...  │  ← unrevealed
└─────────────────────────────────────────┘

[💡 Reveal Next Clue (−100 pts)]  ← dashed orange border btn

┌─────────────────────────────────────────┐
│  Type a player name...                  │  ← search input, green focus ring
│  ┌───────────────────────────────────┐  │
│  │ 🇮🇳 Virat Kohli   Batsman · RCB  │  │  ← dropdown results
│  │ 🇮🇳 Virender Sehwag  Batsman     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

              Skip this round →
```

### After Guess (round result)
```
[Player photo 96px, candy-green border]
      Virat Kohli
  🇮🇳 India · Batsman · RCB

     [+200 pts]   ← candy-green pill (correct)
  OR [Wrong!]     ← candy-red pill
  OR [Skipped]    ← gray pill

   [Next Player →]  ← candy-btn-green
```

---

## Page 8: Guess the Cricketer — Game Over

```
┌──────────────────────────────────┐
│           🔥  (large emoji)      │  ← result emoji 60px
│       Cricket Expert!            │  ← Lilita One 30px
│                                  │
│  ┌────────┐ ┌────────┐ ┌──────┐ │
│  │  8/10  │ │  1,450 │ │ 5🔥  │ │
│  │ green  │ │ orange │ │ red  │ │
│  │CORRECT │ │ SCORE  │ │STREAK│ │
│  └────────┘ └────────┘ └──────┘ │
│                                  │
│  Round-by-round grid:            │
│  [✓][✓][✗][✓][✓][–][✓][✓][✓][✓] │  ← 10 squares, green/red/gray
│                                  │
│  [🎮 Play Again]      ← full w green btn
│  [📤 Share Result]    ← full w orange btn
│  ← Back to Home       ← muted link
└──────────────────────────────────┘
```

---

## Page 9: Leaderboard (`/leaderboard`)

**Layout**: Centered, max-w-lg, warm-bg, padded.

```
[←]  3×3 Top Scorers      ← Lilita One 24px

[3×3 Grid] [4×4 Grid]     ← tab buttons (active: secondary tint bg + border)

┌────────────────────────────────────────┐
│ 🥇 Rank indicator chip (if user in top)│
│ Your Rank: #4                           │
└────────────────────────────────────────┘

┌─────────────────────────────────────────┐  ← candy-card
│ 🥇  [Avatar]  Rohit Sharma       🏆 1,890│  ← gold, avatar 36px, trophy icon
│ 🥈  [Avatar]  Sachin T.          🏆 1,640│  ← silver
│ 🥉  [Avatar]  Virat Kohli        🏆 1,520│  ← bronze
│ #4  [Avatar]  Jigar S.  (you)    🏆 1,350│  ← purple tint row, left border
│ #5  [Avatar]  MS Dhoni           🏆 1,240│
│ #6  [Avatar]  Jasprit B.         ✗  980  │  ← XCircle (lost game)
│ #7  [Avatar]  Shreyas I.         ✗  820  │
│ #8  [Avatar]  KL Rahul           🏆  740  │
│  ...                                    │
└─────────────────────────────────────────┘
```

**Row anatomy:**
```
[medal/rank badge]  [36px avatar]  [Name (you)]  [trophy/x icon]  [score right-aligned]
```

---

## Page 10: Stats (`/stats`)

**Layout**: Centered, max-w-lg, warm-bg.

```
[←]  Your Stats    ← Lilita One 24px

┌─────────┐ ┌─────────┐ ┌─────────┐
│  🎯     │ │  🏆     │ │  %      │
│   24    │ │   18    │ │  75%    │
│ primary │ │ yellow  │ │ emerald │
│ GAMES   │ │  WINS   │ │WIN RATE │
└─────────┘ └─────────┘ └─────────┘
┌─────────┐ ┌─────────┐ ┌─────────┐
│  📈     │ │  🔥     │ │  🔥     │
│  840    │ │   3     │ │   7     │
│  blue   │ │ orange  │ │  red    │
│AVG SCORE│ │CUR STRK │ │BST STRK │
└─────────┘ └─────────┘ └─────────┘

┌────────────────────────────────────┐
│ Personal Best                      │
│         1,890                      │  ← Lilita One 40px, yellow
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Score Distribution                 │  ← Lilita One 12px
│  0-200   [■■□□□□□□□□] 2           │
│ 201-500  [■■■■□□□□□□] 4           │
│ 501-1K   [■■■■■■■□□□] 8           │
│ 1K-2K    [■■■■■■□□□□] 6           │
│  2K+     [■■□□□□□□□□] 4           │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Recent Games                       │
│  🏆 2026-05-10  3x3  1,890        │
│  🏆 2026-05-09  4x4  1,240        │
│  ✗  2026-05-08  3x3   480         │
│  🏆 2026-05-07  3x3  1,100        │
│  ...20 entries, scrollable         │
└────────────────────────────────────┘
```

---

## Page 11: Battle — Setup (`/battle`)

**Layout**: Centered, dark `stadium-bg`, max-w-sm card.

```
┌──────────────────────────────────────┐
│          ⚔️  VS Player               │  ← icon + Lilita One
│                                      │
│  ┌──────────────────────────────┐    │
│  │  Create Room                 │    │
│  │  Start a new game            │    │
│  │                              │    │
│  │  Choose grid size:           │    │
│  │  [3×3]  [4×4]               │    │  ← tab buttons
│  │                              │    │
│  │  [Create Room →]             │    │  ← green gradient btn
│  └──────────────────────────────┘    │
│                                      │
│  ──────── or join ────────           │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  Room Code  [ABC123    ]     │    │  ← input field
│  │  [Join Room →]               │    │
│  │  Error: Room not found       │    │  ← red error text (conditional)
│  └──────────────────────────────┘    │
│                                      │
│  [← Back to Play]                    │
└──────────────────────────────────────┘
```

---

## Page 12: Battle — Waiting Room

```
┌──────────────────────────────────────┐
│      ⏳ Waiting for opponent...      │
│                                      │
│  Share this code with your friend:   │
│                                      │
│       ┌─────────────────┐            │
│       │    ABC123        │            │  ← large code, Lilita One, copy btn
│       └─────────────────┘            │
│                                      │
│  [📋 Copy Code]   [Cancel]           │
└──────────────────────────────────────┘
```

---

## Page 13: Player Database (`/players`)

**Layout**: max-w-5xl, warm-bg, public.

```
Home / Player Database     ← breadcrumb

Cricket Player Database    ← Lilita One 48px
Browse all 1,145 cricket player cards...  ← body text
Data from Cricsheet (CC-BY-4.0)

┌────────────────────────────────────────────────────────┐
│ Search         Country    Role      IPL Team  [Reset]  │  ← filter bar, candy-card
│ [Player name..][India ▾ ] [All   ▾ ][MI    ▾ ]        │
└────────────────────────────────────────────────────────┘

Showing 50 of 1,145 players       Page 1 of 23

┌────────────────────────────────────────────────────────────┐
│ Player ↑  │ Country   │ Role      │ IPL Teams │ Runs │ Wkts│
├───────────┼───────────┼───────────┼───────────┼──────┼─────┤
│ MS Dhoni  │ 🇮🇳 India │ [WK-Bat]  │ CSK, MI.. │ 10,773│ 0  │
│ Virat K.  │ 🇮🇳 India │ [Batsman] │ RCB       │ 25,891│ 0  │
│ Rohit S.  │ 🇮🇳 India │ [Batsman] │ MI, DC..  │ 17,663│ 0  │
│ Jasprit B.│ 🇮🇳 India │ [Fast B.] │ MI        │    213│ 388│
│ R.Ashwin  │ 🇮🇳 India │ [Spinner] │ CSK,DC..  │  3,012│ 537│
│ ...       │           │           │           │      │     │
└────────────────────────────────────────────────────────────┘

[← Previous]   1 / 23   [Next →]

Players by Country section:
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ 312  │ │ 183  │ │ 160  │ │  94  │ │  88  │
│ IND  │ │ AUS  │ │ ENG  │ │ SA   │ │ PAK  │
└──────┘ └──────┘ └──────┘ └──────┘ └──────┘
```

**Role badge colors:**
- Batsman: `bg-candy-blue` white text
- WK-Bat: `bg-candy-purple` white text
- Fast Bowler: `bg-candy-red` white text
- Spin Bowler: `bg-candy-orange` white text
- All-Rounder: `bg-candy-green` white text

---

## Page 14: Player Profile (`/players/:id`)

**Layout**: max-w-3xl, warm-bg, public.

**Dummy player: MS Dhoni**

```
Home / Players / MS Dhoni    ← breadcrumb

MS Dhoni                     ← Lilita One 48px
🇮🇳 India  · [WK-Bat purple badge]

┌────────────────────────────────────────────┐
│  10,773      0        16        4          │
│  Career Runs Wickets Centuries  Trophies   │
│  green       orange  blue       yellow     │
└────────────────────────────────────────────┘

About MS Dhoni
MS Dhoni is an India wicket-keeper batsman who has
played 90 Test matches, 350 ODIs, 98 T20 Internationals
for the India national cricket team. MS Dhoni has scored
10,773 career runs, including 16 centuries...
[auto-generated paragraph]

Career Statistics
┌───────────────┬─────────┬────────┬─────────┐
│ Format        │ Matches │  Runs  │ Wickets │
├───────────────┼─────────┼────────┼─────────┤
│ Tests         │   90    │ 4,876  │   0     │
│ ODIs          │  350    │10,773  │   0     │
│ T20 Intl.     │   98    │ 1,617  │   0     │
│ IPL           │  250    │ 5,082  │   0     │
│ Career Total  │   —     │10,773  │   0     │  ← green highlight row
└───────────────┴─────────┴────────┴─────────┘

IPL Teams
[CSK]  [MI]    ← outlined tag badges

International Trophies
[IPL Champion blue/20]  [ICC Cricket World Cup green/20]
[ICC T20 World Cup purple/20]  [ICC Champions Trophy orange/20]

Achievement Categories
[captains purple/10]  [T20 WC winners]  [Orange Cap]

┌─────────────────────────────────────────────┐
│  Play MS Dhoni in Cricket Bingo             │
│  MS Dhoni appears as a player card in the   │
│  daily Cricket Bingo puzzle. Place this     │
│  card on CSK, WK-Bat, IPL Champion...       │
│  [Play Cricket Bingo — Free]  ← green btn  │
└─────────────────────────────────────────────┘

Footer (same as all public pages)
```

---

## Key Component Library (for Figma component set)

### 1. BingoCell (9 variants)
| State | Description |
|-------|-------------|
| Empty — Country | Flag image + short label |
| Empty — IPL Team | Team logo + short label |
| Empty — Role | Custom SVG icon + short label |
| Empty — Achievement | Badge SVG + short label |
| Empty — Combo | 2 icons side by side + label |
| Empty — Teammate | Player photo circle + label |
| Eligible | Green glow ring + subtle scale |
| Filled | candy-green bg, player headshot, name + category label |
| Win line | Extra bright green ring |

### 2. PlayerCard
```
White card, 2px border, 4px bottom shadow
IPL team color accent top bar (1.5px)
Avatar (48px circle, team color border) | Name (Lilita One adaptive size) | SKIP→
[⭐ Wild (2)]  [ℹ]                              8 remaining
```

### 3. Buttons
| Button | Style |
|--------|-------|
| Primary (green) | candy-green bg, white text, 4px bottom shadow |
| Secondary (orange) | candy-orange bg, white text, 4px bottom shadow |
| Outline | white bg, 2px border-gray, 3px gray shadow |
| Ghost | transparent, muted text |
| Tab (active) | secondary/20 bg, secondary/50 border, secondary text |
| Tab (inactive) | card/40 bg, border/30, muted text |
| Icon pill | colored bg/15, matching border/50, matching text — xs, uppercase |

### 4. ClueCard (Guess game)
```
Revealed:   solid white card + icon box (colored) + label + text
Unrevealed: dashed border, gray icon "?" + "Clue N" + "Reveal..."
```

### 5. LeaderboardRow
```
[medal or #rank 36px]  [36px avatar]  [Name (you)]  [trophy/x]  [score]
Mine: primary/15 bg + left border + ring
Others: alternating bg-white/[0.02]
Medal slots: animated drop
```

### 6. StatCard
```
56px icon (role-colored)
Large number value (Lilita One 24px, role-colored)
Tiny uppercase label (9px, muted)
candy-card wrapper
```

### 7. ThemeToggle
```
Circular button, 40px, border, muted icon (Sun/Moon)
```

---

## Design Notes for Figma Agent

1. **3D Chunky Style**: Every card/button has a solid colored bottom shadow (not drop-shadow), giving a "pressed" depth effect. Use a bottom offset fill rectangle behind cards — NOT CSS box-shadow.

2. **Animations to document but not implement**: Floating emojis (upward drift), bounce (🏏), spring enter (cards), sparkle burst (correct cell).

3. **Font pairing**: Lilita One for ALL numbers, scores, game UI labels, hero headings. Nunito for all descriptive text, button labels, captions.

4. **Spacing rhythm**: 4/8/12/16/24/32/48px. Cards use 16px padding minimum, 24px for feature cards.

5. **Responsive breakpoints**:
   - Mobile: <640px — single column, bottom nav bar
   - Desktop: ≥640px — two column game layout, horizontal nav

6. **Dark mode**: All candy-* tokens shift to brighter/more saturated versions. Background: near-black navy. Cards: dark navy. Text: near-white.

7. **Cell grid sizing**: Cells are always square (`aspect-square`). 3×3: ~120px cells on mobile, ~150px on desktop. 4×4: ~90px on mobile, ~120px on desktop.

8. **Candidate pages to skip** (legal/info content, low design value): `/privacy`, `/terms`, `/about`, `/how-to-play` — these are simple text pages with the same warm-bg + candy-card wrapper + footer pattern.
