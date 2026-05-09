# Game Page

Display full game data at `/games/:id`: game info header, home team stats, away team stats. Player tables are sortable. Totals shown as summary cards below each table.

Mockup: `documentation/mockups/game-page.html`

---

## After each step

- Mark step complete (✅) in this file
- List files created/modified under the step
- Update `documentation/database.uml` if entities changed

---

## Step 1 — Backend: `GET /games/:id` endpoint

Create a `GameModule` with a `GET /games/:id` endpoint returning all data needed to render the game page.

### Response shape

```json
{
  "id": 1,
  "game_number": 42,
  "date": "15/11/2025",
  "time": "20:30",
  "venue": "Salle des Sports de Clapiers",
  "group": "Poule A",
  "championship": { "name": "Pré Régionale Masculine", "season": "2025/26" },
  "home": {
    "name": "CLAPIERS BASKET BALL", "suffix": "1",
    "players": [
      { "number": 5, "last_name": "BERNARD", "first_name": "Antoine", "starter": true, "time_played": "28:14", "points": 18, "shots_made": 7, "3pts_made": 2, "2pts_in_made": 2, "2pts_out_made": 1, "FT_made": 2, "fouls": 3 }
    ],
    "totals": {
      "team":        { "points": 74, "fouls": 13, "3pts_made": 6, "FT_made": 10 },
      "starters":    { "points": 64, "fouls": 12, "3pts_made": 5, "FT_made": 8 },
      "bench":       { "points": 10, "fouls": 1,  "3pts_made": 1, "FT_made": 2 },
      "first_half":  { "points": 38, "fouls": 6,  "3pts_made": 3, "FT_made": 4 },
      "second_half": { "points": 36, "fouls": 7,  "3pts_made": 3, "FT_made": 6 },
      "overtime":    { "points": 0,  "fouls": 0,  "3pts_made": 0, "FT_made": 0 }
    },
    "coach": { "name": "DUPONT Jean", "fouls": 0 }
  },
  "away": { ... }
}
```

### Implementation

- New `GameModule` with `GameController` and `GameService`
- `GameService.findOne(id)`: single TypeORM query joining `Game` → `Group` → `Championship`, `Venue`, `Team` (home/away), `PlayerStatRow`, `TeamStatRow`, `CoachStatRow`
- Throw `NotFoundException` if game not found
- Map DB rows to response DTO

### Covers

- Unit tests for `GameService.findOne` (mocked repository)
- `404` on unknown id

---

## Step 2 — Frontend: Game page

Create the `/games/:id` React page matching the mockup.

### Layout

1. Breadcrumb: `Home / {championship.name} {championship.season} / Match #{game_number}`
2. Game header card: team names + score, meta info (date/time, venue, group, game#, referees)
3. For each team (home then away):
   - Section title + Home/Away badge
   - Sortable player stats table (default sort: PTS desc; horizontally scrollable)
   - Totals cards grid (3 columns × 2 rows, each card: Points / Fouls / 3pts / FT)

### Implementation

- New page `frontend/src/pages/Game.tsx`
- Route `GET /games/:id` wired in `App.tsx`
- Fetch game data from backend on mount
- Sortable table: local state `{ column, direction }`, toggle on header click
- Starters: bold last name + first name

### Covers

- Loading and error states (spinner / "Game not found")
- No external sort library — plain `Array.sort` in component

---

## Decisions recap

| Topic | Decision |
|---|---|
| Route | `/games/:id` |
| Default sort | PTS descending |
| Starter indicator | Bold name + first name |
| Totals display | Cards below table, 3×2 grid, 4 stats each |
| Overtime | Hide card if 0 pts |
| Game list | Out of scope |
