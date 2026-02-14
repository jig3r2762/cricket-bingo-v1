# Cricket Bingo - Backend Game Logic Document

> Definitive reference for all state transitions, validation rules, and game mechanics.

---

## 1. Data Models

### 1.1 CricketPlayer (Master Database Record)

```
CricketPlayer {
  id:            string
  name:          string
  country:       string          // "India", "Australia", "England", ...
  countryCode:   string          // "IND", "AUS", "ENG", ...
  countryFlag:   string          // emoji flag
  iplTeams:      string[]        // ALL IPL franchises played for (e.g. ["MI", "RCB"])
  teamColor:     string          // hex color of *current/primary* team
  primaryRole:   PrimaryRole     // enum: see below
  formats:       Format[]        // ["Test", "ODI", "T20I"]
  stats: {
    odiRuns:       number
    testRuns:      number
    t20iRuns:      number
    totalRuns:     number        // cross-format aggregate
    odiWickets:    number
    testWickets:   number
    t20iWickets:   number
    totalWickets:  number
    odiMatches:    number
    testMatches:   number
    t20iMatches:   number
    iplMatches:    number
    centuries:     number        // international centuries
    iplCenturies:  number
  }
  trophies:      Trophy[]       // ["IPL", "CWC", "T20WC", "WTC", ...]
  teammates:     TeammateEntry[]
  jerseyNumber?: number
}
```

### 1.2 PrimaryRole Enum

```
PrimaryRole =
  | "Batsman"
  | "WK-Bat"         // Wicket-keeper batsman
  | "Fast Bowler"    // Pace / seam
  | "Spin Bowler"    // Off-spin, leg-spin, left-arm orthodox, etc.
  | "All-Rounder"    // Batting + bowling all-rounders
```

### 1.3 TeammateEntry

```
TeammateEntry {
  playerId:    string        // id of the other player
  playerName:  string        // denormalized for quick display
  contexts:    string[]      // ["MI 2019", "India ODI 2018", "RCB 2016", ...]
}
```

**"Teammate" definition:** Two players are teammates if they appeared in the same **playing XI** (or extended squad that played in the match) for a club (IPL franchise) or country in any official match, at least once. Pre-computed and stored in `teammates[]` on each player record.

### 1.4 GridCategory (Cell Definition)

```
GridCategory {
  id:          string
  label:       string          // human-readable, e.g. "Mumbai Indians"
  shortLabel:  string          // grid display, e.g. "MI"
  icon:        string
  type:        CategoryType
  comboIcons?: string[]        // only for type="combo"
  validator:   ValidatorKey    // maps to a validation function (see Section 4)
}
```

### 1.5 CategoryType Enum

```
CategoryType =
  | "team"       // IPL franchise
  | "country"    // National team
  | "stat"       // Statistical threshold (runs, wickets, centuries)
  | "combo"      // Intersection of two criteria (e.g. MI + IND)
  | "role"       // Primary playing role
  | "trophy"     // Tournament won
  | "teammate"   // "Played with [Player Name]"
```

### 1.6 DailyGame (Game Session)

```
DailyGame {
  date:           string          // "YYYY-MM-DD", one game per calendar day
  gridSize:       3 | 4           // chosen by user at game start
  grid:           GridCategory[]  // 9 or 16 cells, fixed for the day
  dailyDeck:      CricketPlayer[] // 40 players, shuffled, fixed for the day
  seed:           string          // deterministic seed for reproducibility
}
```

### 1.7 GameState (Per-User Session)

```
GameState {
  dailyGameId:      string
  gridSize:         3 | 4
  deckIndex:        number           // pointer into dailyDeck (0..39)
  currentPlayer:    CricketPlayer | null
  placements:       Map<categoryId, CricketPlayer>   // filled cells
  remainingPlayers: number           // starts at 25, decremented on skip
  wildcardsLeft:    number           // starts at 1
  score:            number
  streak:           number           // consecutive successful placements
  status:           "playing" | "won" | "lost"
  winLine:          WinLine | null   // which row/col/diagonal completed
  history:          HistoryEntry[]   // audit trail of each turn
}
```

### 1.8 HistoryEntry

```
HistoryEntry {
  turnNumber:    number
  player:        CricketPlayer
  action:        "placed" | "skipped" | "wildcard"
  targetCell?:   string           // categoryId if placed or wildcard
  wasValid?:     boolean          // result of validation (always true for wildcard)
  timestamp:     number
}
```

---

## 2. Daily Grid Generation (Runs Once Per 24h)

### 2.1 Steps

```
1.  SEED = SHA-256( "cricket-bingo-" + today's date "YYYY-MM-DD" )
2.  RNG  = SeededRandom(SEED)

3.  MASTER_POOL = all players in the database

4.  CATEGORY_POOL = all available GridCategory definitions (~30-50 total)

5.  CANDIDATE_GRID = []
    Repeat until CANDIDATE_GRID has `gridSize * gridSize` cells:
      a. Pick a random category from CATEGORY_POOL using RNG
      b. Remove it from CATEGORY_POOL (no duplicates)
      c. Append to CANDIDATE_GRID

6.  SOLVABILITY CHECK (Section 2.2):
      Run the solvability validator on CANDIDATE_GRID against MASTER_POOL.
      If NOT solvable:
        Discard CANDIDATE_GRID, go back to step 5 (with remaining pool).
      If solvable:
        Proceed.

7.  DAILY_DECK:
      a. Collect all players who satisfy at least one cell in the grid => RELEVANT_POOL
      b. Ensure RELEVANT_POOL has at least 40 players.
         If not, pad with random "distractor" players from MASTER_POOL.
      c. Shuffle RELEVANT_POOL using RNG, take first 40 => DAILY_DECK.

8.  Store { date, grid, dailyDeck, seed } as the DailyGame.
```

### 2.2 Solvability Validator

A grid is **solvable** if there exists **at least one** assignment of distinct players from the DAILY_DECK to every cell such that each player satisfies its cell's criteria and no player is used twice.

Algorithm (simplified):
```
function isSolvable(grid, deck):
  return backtrack(grid, deck, cellIndex=0, usedPlayers={})

function backtrack(grid, deck, cellIndex, usedPlayers):
  if cellIndex == grid.length:
    return true   // all cells filled
  cell = grid[cellIndex]
  for player in deck:
    if player.id not in usedPlayers AND validate(player, cell):
      usedPlayers.add(player.id)
      if backtrack(grid, deck, cellIndex + 1, usedPlayers):
        return true
      usedPlayers.remove(player.id)
  return false
```

This guarantees every daily puzzle **can** be completed, though the user may not find the solution depending on draw order and placement choices.

### 2.3 Determinism

Because generation uses a seeded RNG derived from the date:
- Every user who plays on the same day gets the **same grid** and the **same deck order**.
- This enables fair leaderboard comparison.

---

## 3. The Player Drawing System

### 3.1 Deck Mechanics

```
DAILY_DECK: 40 players, shuffled and fixed at grid generation time.
DECK_POINTER: starts at 0, increments by 1 after every turn (place, skip, or wildcard).
REMAINING_PLAYERS: starts at 25.
```

**On each turn:**
```
currentPlayer = DAILY_DECK[DECK_POINTER]
Present card: { name, country, countryFlag, jerseyNumber }
```

The user does NOT see upcoming players. The deck is opaque.

### 3.2 Turn Resolution

After presentation, the user performs exactly one action:

| Action     | Effect                                                    |
|------------|-----------------------------------------------------------|
| **Place**  | User clicks a grid cell. Validation runs (Section 4).     |
| **Skip**   | Player is discarded. `remainingPlayers -= 1`. Streak resets to 0. |
| **Wildcard**| User clicks a cell. Player fills it with NO validation. `wildcardsLeft -= 1`. |

After any action: `DECK_POINTER += 1`. If `DECK_POINTER >= 40`, the deck is exhausted and the game ends (same as loss if no bingo yet).

---

## 4. Placement Validation (The Core Engine)

### 4.1 Validation Function Signature

```
validate(player: CricketPlayer, cell: GridCategory): boolean
```

### 4.2 Validators by CategoryType

#### `team` - IPL Franchise
```
cell.shortLabel ∈ player.iplTeams
```
Example: cell="MI" => player.iplTeams includes "MI" (past OR present).

#### `country` - National Team
```
cell maps to a country name => player.country == that country
```
Mapping: "IND" => "India", "AUS" => "Australia", "ENG" => "England", "SA" => "South Africa", "NZ" => "New Zealand", "AFG" => "Afghanistan", "WI" => "West Indies", "PAK" => "Pakistan", "SL" => "Sri Lanka", "BAN" => "Bangladesh"

#### `stat` - Statistical Threshold
Each stat cell has a specific check:

| Cell Label       | Validation                              |
|------------------|-----------------------------------------|
| "5000+ ODI Runs" | player.stats.odiRuns >= 5000            |
| "10K+ Runs"      | player.stats.totalRuns >= 10000         |
| "300+ Wickets"   | player.stats.totalWickets >= 300        |
| "Century Maker"  | player.stats.centuries >= 1             |
| "50+ Test Matches"| player.stats.testMatches >= 50         |
| ...              | (extensible by adding new stat cells)   |

#### `role` - Playing Role
```
Role Cell          => Required PrimaryRole(s)
"Fast Bowler"/"Pacer" => player.primaryRole == "Fast Bowler"
"Spin Wizard"/"Spinner" => player.primaryRole == "Spin Bowler"
"All-Rounder"      => player.primaryRole == "All-Rounder"
"Wicket-Keeper"    => player.primaryRole == "WK-Bat"
"Batsman"          => player.primaryRole ∈ ["Batsman", "WK-Bat"]
```

#### `trophy` - Tournament Won
```
cell specifies a trophy key => trophy key ∈ player.trophies
```
Examples: "IPL Winner" => "IPL" in player.trophies, "World Cup Winner" => "CWC" in player.trophies.

#### `teammate` - Played With [Name]
```
cell specifies a target player name/id
=> player.teammates contains an entry where playerId == target id
```
This means the drawn player must have appeared in the **same playing XI** as the named player at least once, for any club or country.

#### `combo` - Intersection (HIGHEST PRIORITY)
A combo cell encodes two criteria. **Both** must be satisfied.

```
cell "MI + IND":
  validate_team(player, "MI") AND validate_country(player, "IND")

cell "AUS + Fast Bowler":
  validate_country(player, "AUS") AND validate_role(player, "Fast Bowler")

cell "CSK + IPL Winner":
  validate_team(player, "CSK") AND validate_trophy(player, "IPL")
```

General form:
```
validate_combo(player, cell):
  for each sub-criterion in cell.comboCriteria:
    if NOT validate(player, sub-criterion):
      return false
  return true
```

### 4.3 Validation Hierarchy (Priority Order)

When a player matches **multiple** unfilled cells, the UI highlights all matching cells and the user **chooses** one. However, for scoring and suggestion purposes, the engine ranks matches by priority:

```
Priority 1 (Highest): combo     — hardest to satisfy, fewest eligible players
Priority 2:           teammate  — specific relationship, narrow pool
Priority 3:           trophy    — specific achievement
Priority 4:           stat      — statistical threshold
Priority 5:           role      — broad category
Priority 6:           team      — multiple players per franchise
Priority 7 (Lowest):  country   — broadest category
```

**Why this matters:**
- The UI should visually emphasize higher-priority matches (e.g., brighter glow on combo cells).
- Optional: A "Smart Hint" system could suggest placing the player in the highest-priority cell they match, since those cells are harder to fill later.
- Scoring bonus: placing a player in a combo cell awards +50 bonus points on top of the base score (see Section 5).

### 4.4 Placement Flow (State Machine)

```
State: AWAITING_ACTION
  User has seen the current player card.
  UI highlights all unfilled cells the current player is valid for.
  (Cells the player does NOT match are dimmed / non-interactive.)

  ┌─────────────────────────────────────────────────────────┐
  │                                                         │
  │  ┌──────────┐    ┌──────────┐    ┌──────────────────┐   │
  │  │  PLACE   │    │   SKIP   │    │    WILDCARD      │   │
  │  │ (tap a   │    │ (tap     │    │ (tap wildcard    │   │
  │  │  cell)   │    │  skip)   │    │  then tap cell)  │   │
  │  └────┬─────┘    └────┬─────┘    └────┬─────────────┘   │
  │       │               │               │                  │
  │       v               v               v                  │
  │  ┌─────────┐   ┌──────────┐   ┌──────────────────┐      │
  │  │VALIDATE │   │ SKIP     │   │ WILDCARD PLACE   │      │
  │  │ player  │   │ RESOLVE  │   │ RESOLVE          │      │
  │  │ vs cell │   │          │   │ (no validation)  │      │
  │  └────┬────┘   └────┬─────┘   └────┬─────────────┘      │
  │       │              │              │                     │
  │   ┌───┴───┐          │              │                     │
  │   │       │          │              │                     │
  │   v       v          v              v                     │
  │ VALID   INVALID    ┌─────────────────────────────┐       │
  │   │       │        │        POST-TURN            │       │
  │   │       │        │  1. deckPointer += 1        │       │
  │   │       │        │  2. Check win condition     │       │
  │   │       │        │  3. Check loss condition    │       │
  │   │       │        │  4. Draw next player or END │       │
  │   │       │        └─────────────────────────────┘       │
  │   │       │                    ^                          │
  │   │       │                    │                          │
  │   v       v                    │                          │
  │ PLACE   REJECT                 │                          │
  │ player  (shake                 │                          │
  │ in cell  anim,                 │                          │
  │ +score)  -life?)               │                          │
  │   │       │                    │                          │
  │   └───────┴────────────────────┘                          │
  │                                                           │
  └───────────────────────────────────────────────────────────┘
```

### 4.5 Detailed PLACE Sub-flow

```
1. User taps a cell (categoryId).
2. Guard: if cell already filled => ignore tap, return.
3. Run validate(currentPlayer, grid[categoryId]).
4. IF VALID:
     a. placements[categoryId] = currentPlayer
     b. streak += 1
     c. score += calculateScore(cell, streak)    // see Section 5
     d. Play "correct" animation (green glow + sparkle)
     e. Lock cell permanently for this game
     f. Proceed to POST-TURN
5. IF INVALID:
     a. Play "wrong" animation (red shake, 400ms)
     b. streak = 0
     c. remainingPlayers -= 1                    // WRONG placement costs a life
     d. The player is consumed (NOT returned to deck)
     e. Proceed to POST-TURN
```

**Key decision: Wrong placement costs a life.** This raises the stakes and prevents random guessing. The player should think carefully before placing.

### 4.6 Detailed SKIP Sub-flow

```
1. User taps "Skip" button.
2. remainingPlayers -= 1
3. streak = 0
4. Record in history: { action: "skipped", player: currentPlayer }
5. Proceed to POST-TURN
```

### 4.7 Detailed WILDCARD Sub-flow

```
1. User taps "Wildcard" button.
2. Guard: if wildcardsLeft == 0 => button disabled, return.
3. UI enters "wildcard mode": ALL unfilled cells become tappable (highlighted gold).
4. User taps any unfilled cell.
5. placements[categoryId] = currentPlayer   // NO validation
6. wildcardsLeft -= 1
7. score += 50
8. streak += 1   // wildcards DO continue streaks
9. Play "correct" animation (gold variant)
10. Proceed to POST-TURN
```

---

## 5. Scoring System

### 5.1 Base Score Calculation

```
function calculateScore(cell: GridCategory, currentStreak: number): number {
  let base = 100

  // Cell type bonus
  if (cell.type === "combo")     base += 50   // hardest cell type
  if (cell.type === "teammate")  base += 30
  if (cell.type === "trophy")    base += 20

  // Streak multiplier: 1x, 1.5x, 2x, 2.5x, 3x (capped)
  let multiplier = Math.min(1 + (currentStreak * 0.5), 3.0)

  return Math.round(base * multiplier)
}
```

### 5.2 Score Table (Examples)

| Streak | Base Cell (team/country) | Combo Cell (+50) | Teammate Cell (+30) |
|--------|--------------------------|-------------------|---------------------|
| 0      | 100                      | 150               | 130                 |
| 1      | 150                      | 225               | 195                 |
| 2      | 200                      | 300               | 260                 |
| 3      | 250                      | 375               | 325                 |
| 4+     | 300 (capped)             | 450 (capped)      | 390 (capped)        |

### 5.3 Wildcard Score

Flat **50 points**, regardless of streak. Does not reset streak.

### 5.4 Bingo Bonus

When a bingo line is completed: **+500 bonus points**.

---

## 6. Win / Loss Conditions

### 6.1 Win: BINGO

A **bingo** is achieved when any complete **row**, **column**, or **diagonal** of the grid is filled.

For a 4x4 grid (cells indexed 0-15):

```
Rows:       [0,1,2,3]   [4,5,6,7]   [8,9,10,11]   [12,13,14,15]
Columns:    [0,4,8,12]  [1,5,9,13]  [2,6,10,14]   [3,7,11,15]
Diagonals:  [0,5,10,15] [3,6,9,12]
```

For a 3x3 grid (cells indexed 0-8):

```
Rows:       [0,1,2]   [3,4,5]   [6,7,8]
Columns:    [0,3,6]   [1,4,7]   [2,5,8]
Diagonals:  [0,4,8]   [2,4,6]
```

**Check runs after every successful placement (including wildcard).** The FIRST completed line triggers the win.

```
function checkBingo(placements, gridSize):
  lines = getWinLines(gridSize)
  for line in lines:
    if every cell in line has a placement:
      return { won: true, winLine: line }
  return { won: false }
```

### 6.2 Loss: Out of Players

```
Game Over IF:
  remainingPlayers <= 0      // all skips/wrong placements used up
  OR deckPointer >= 40       // entire deck exhausted
```

Both conditions checked at POST-TURN, after the action resolves.

### 6.3 State Transitions Summary

```
            ┌─────────┐
            │  START   │
            │gridSelect│
            └────┬─────┘
                 │
                 v
            ┌─────────┐
     ┌─────>│ PLAYING  │<──────────┐
     │      └────┬─────┘           │
     │           │                 │
     │    (turn resolves)          │
     │           │                 │
     │     ┌─────┴──────┐         │
     │     v             v        │
     │  ┌──────┐   ┌─────────┐   │
     │  │BINGO?│   │GAME OVER│   │
     │  │check │   │ check?  │   │
     │  └──┬───┘   └────┬────┘   │
     │  Y  │  N      Y  │  N     │
     │     │  └──────────┼──┘     │
     │     │             │        │
     │     v             v        │
     │  ┌──────┐   ┌─────────┐   │
     │  │ WON  │   │  LOST   │   │
     │  └──────┘   └─────────┘   │
     │                            │
     └─── (next turn) ───────────┘
```

---

## 7. Full Turn Lifecycle (Pseudocode)

```typescript
function executeTurn(gameState: GameState, action: Action): GameState {
  const player = gameState.dailyDeck[gameState.deckIndex];
  let next = { ...gameState };

  switch (action.type) {

    case "PLACE":
      const cell = gameState.grid.find(c => c.id === action.categoryId);
      if (next.placements.has(cell.id)) return next; // cell already filled

      const isValid = validate(player, cell);

      if (isValid) {
        next.placements.set(cell.id, player);
        next.streak += 1;
        next.score += calculateScore(cell, next.streak);
      } else {
        // Wrong placement: costs a life, breaks streak
        next.streak = 0;
        next.remainingPlayers -= 1;
      }

      next.history.push({
        turnNumber: next.deckIndex,
        player,
        action: "placed",
        targetCell: cell.id,
        wasValid: isValid,
        timestamp: Date.now()
      });
      break;

    case "SKIP":
      next.remainingPlayers -= 1;
      next.streak = 0;
      next.history.push({
        turnNumber: next.deckIndex,
        player,
        action: "skipped",
        timestamp: Date.now()
      });
      break;

    case "WILDCARD":
      if (next.wildcardsLeft <= 0) return next; // guard
      const targetCell = gameState.grid.find(c => c.id === action.categoryId);
      if (next.placements.has(targetCell.id)) return next;

      next.placements.set(targetCell.id, player);
      next.wildcardsLeft -= 1;
      next.score += 50;
      next.streak += 1;

      next.history.push({
        turnNumber: next.deckIndex,
        player,
        action: "wildcard",
        targetCell: targetCell.id,
        wasValid: true,
        timestamp: Date.now()
      });
      break;
  }

  // POST-TURN
  next.deckIndex += 1;

  // Check win
  const bingoResult = checkBingo(next.placements, next.gridSize);
  if (bingoResult.won) {
    next.status = "won";
    next.winLine = bingoResult.winLine;
    next.score += 500; // bingo bonus
    return next;
  }

  // Check loss
  if (next.remainingPlayers <= 0 || next.deckIndex >= 40) {
    next.status = "lost";
    return next;
  }

  // Continue: draw next player
  next.currentPlayer = next.dailyDeck[next.deckIndex];
  return next;
}
```

---

## 8. Teammate Logic (Deep Dive)

### 8.1 Definition (Strict)

Player A is a **teammate** of Player B if and only if:
- They both appeared in the **playing XI** (or match-day squad who played) of the same team in the same official match.
- This can be for a **country** (e.g., India vs Australia, 3rd ODI, 2019) or a **club/franchise** (e.g., MI vs CSK, IPL 2020, Match 1).

### 8.2 Data Structure

Pre-computed at database build time:

```
Player "Virat Kohli" -> teammates: [
  { playerId: "dhoni_01",  playerName: "MS Dhoni",      contexts: ["India ODI 2008-2019", "India Test 2011-2014", ...] },
  { playerId: "bumrah_01", playerName: "Jasprit Bumrah", contexts: ["India ODI 2016-2023", "India T20I 2016-2023"] },
  { playerId: "abd_01",    playerName: "AB de Villiers",  contexts: ["RCB IPL 2011-2019"] },
  ...
]
```

### 8.3 Validation

For a cell "Played with Dhoni":
```
validate_teammate(player, targetId="dhoni_01"):
  return player.teammates.some(t => t.playerId === targetId)
```

### 8.4 Symmetry Rule

If A is a teammate of B, then B is a teammate of A. The database must enforce this:
```
if "Kohli" in Dhoni.teammates:
  assert "Dhoni" in Kohli.teammates
```

### 8.5 Edge Cases

| Scenario | Ruling |
|----------|--------|
| Player X played for MI in 2019, Player Y played for MI in 2021 (never overlapped) | NOT teammates |
| Player X and Player Y were both in MI 2020 squad but never in same XI | NOT teammates (strict: same playing XI only) |
| Player X played for India, Player Y played for India, but in different eras | NOT teammates unless they were in the same XI for at least one match |
| A cell says "Played with Dhoni" and Dhoni himself is drawn | Dhoni is NOT his own teammate. The cell does NOT accept Dhoni. |

---

## 9. Combo Cell Validation (Deep Dive)

### 9.1 Structure

A combo cell has TWO sub-criteria. Both must be true simultaneously.

```
GridCategory (combo) {
  id: "c14"
  label: "MI + Indian"
  type: "combo"
  comboCriteria: [
    { type: "team", value: "MI" },
    { type: "country", value: "India" }
  ]
}
```

### 9.2 Examples

| Combo Cell       | Sub-Criteria                              | Valid Player Example      |
|------------------|-------------------------------------------|---------------------------|
| MI + IND         | team=MI AND country=India                 | Rohit Sharma, Jasprit Bumrah, Sachin Tendulkar |
| AUS + Pacer      | country=Australia AND role=Fast Bowler    | Pat Cummins               |
| CSK + IPL Winner | team=CSK AND trophy=IPL                   | MS Dhoni                  |
| RCB + 10K Runs   | team=RCB AND totalRuns >= 10000           | Virat Kohli               |

### 9.3 Why Combo Has Highest Priority

Combo cells have the **smallest eligible player pool** because they require two conditions simultaneously. If a player qualifies for both "MI" (single cell) and "MI + IND" (combo cell):
- The combo cell is **harder to fill later** (fewer players in the deck will match it).
- The single "MI" cell can be filled by any MI player, Indian or not.
- Therefore, the engine should suggest the combo cell as the optimal placement.

---

## 10. Cell Highlighting Logic (UI Guidance)

When a player is drawn, the UI should:

```
1. For each unfilled cell in the grid:
     valid = validate(currentPlayer, cell)
     if valid: highlight cell as "eligible" (cyan border glow)
     else: dim cell (reduce opacity to 40%)

2. Sort eligible cells by priority (Section 4.3):
     combo > teammate > trophy > stat > role > team > country

3. The HIGHEST priority eligible cell gets a "recommended" indicator
   (e.g., pulsing gold border, small star icon).

4. All eligible cells remain clickable; the user makes the final choice.

5. Non-eligible, unfilled cells: dimmed but visible (so user sees grid state).
   Already-filled cells: show placed player, non-interactive.
```

---

## 11. Initial Game Parameters

| Parameter           | 3x3 Mode       | 4x4 Mode       |
|---------------------|-----------------|-----------------|
| Grid cells          | 9               | 16              |
| Daily deck size     | 40              | 40              |
| Remaining players   | 20              | 25              |
| Wildcards           | 1               | 1               |
| Win lines possible  | 8 (3R+3C+2D)   | 10 (4R+4C+2D)  |
| Min cells for bingo | 3               | 4               |

---

## 12. Summary: State Transition Table

| Current State | Event                | Guards                           | Next State | Side Effects                                           |
|---------------|----------------------|----------------------------------|------------|--------------------------------------------------------|
| START         | selectGrid(size)     | -                                | PLAYING    | Load daily game, initialize GameState                  |
| PLAYING       | place(cellId)        | cell not filled                  | PLAYING    | Validate. If valid: fill cell, +score, +streak. If invalid: -life, reset streak. Advance deck. |
| PLAYING       | skip()               | -                                | PLAYING    | -1 remaining, reset streak, advance deck               |
| PLAYING       | wildcard(cellId)     | wildcardsLeft > 0, cell not filled| PLAYING   | Fill cell (no validation), -1 wildcard, +50, advance deck |
| PLAYING       | (post-turn)          | bingo line complete              | WON        | +500 bonus, show win animation                         |
| PLAYING       | (post-turn)          | remainingPlayers <= 0 OR deck exhausted | LOST | Show game over screen                                  |
| WON           | -                    | terminal                         | -          | Show score summary, leaderboard submit                 |
| LOST          | -                    | terminal                         | -          | Show score summary, "try again tomorrow"               |

---

## 13. Future Considerations (Not in MVP)

- **Multiplayer:** Same daily grid, compare scores on a leaderboard.
- **Undo:** Allow one undo per game (premium feature).
- **Power-ups:** "Peek" (see next 3 cards), "Swap" (return placed player to deck).
- **Difficulty scaling:** Adjust deck composition (more distractors on hard mode).
- **Streak freeze:** Consumable that prevents streak reset on one skip.
