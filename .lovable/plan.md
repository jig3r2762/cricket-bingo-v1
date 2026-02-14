

# 🏏 Cricket Bingo — "Midnight Stadium" Edition

## Overview
A visually stunning Cricket Bingo game where players place cricket legends into a grid based on career stats. Premium sports-card aesthetics with a dark "Midnight Stadium" theme.

---

## Phase 1: Visual Layout & Mock UI (This Build)

### 🎨 Theme — "Midnight Stadium"
- Deep navy/charcoal background (`#0f172a`)
- Vibrant Cricket Green (`#22c55e`) and Golden Trophy (`#f59e0b`) accents
- Subtle stadium-light radial gradients in the background
- Custom glow effects and glassmorphism throughout

### 🃏 Player Card (Top of Screen)
- Premium sports-card design with glowing border animation
- Player name in bold display typography, team/country subtitle
- Player stats preview (matches, runs, wickets)
- "Remaining Players" counter styled as a digital scoreboard
- **Skip** button (golden outline) and **Wildcard** button (green glow)
- Card entrance animation (scale-in + fade)

### 📋 Grid Selection
- Pre-game screen to choose **3×3 (Quick Match)** or **4×4 (Classic)**
- Each option presented as a card with difficulty label

### 🔲 Bingo Grid
- Each cell has a glassmorphism effect (semi-transparent blur, subtle border)
- Category icons per cell (bat for runs, trophy for IPL, ball for wickets, etc.)
- Category text label below icon
- Smooth hover animation — cell "lifts" with shadow increase and scale
- Empty/filled states clearly distinguished

### ✅ Interaction Feedback (Mock Triggers)
- **Correct placement**: Cell flashes green with sparkle/confetti particle burst
- **Incorrect placement**: Shake animation with brief red glow
- Smooth transition when a player card is placed

### 📱 Responsiveness
- **Mobile**: Bottom navigation bar with thumb-friendly Skip/Wildcard buttons, vertically stacked layout (player card on top, grid below)
- **Desktop**: Horizontal layout with player card panel on the side or top, larger grid cells

### 🎮 Extra UI Elements
- **Score display** with animated counter
- **Streak indicator** (consecutive correct placements)
- **Timer** (optional, styled as a cricket over counter)
- **Sound toggle** button
- **How to Play** modal with quick rules explanation

---

## Phase 2: Game Logic (Future)
- Real cricket player database with stats
- Correct/incorrect placement validation
- Win condition detection (row/column/diagonal bingo)
- Round progression and scoring system

## Phase 3: Backend & Accounts (Future — Supabase)
- User authentication (sign up / login)
- Leaderboard with top scores
- User profiles with game history
- Daily challenge mode

