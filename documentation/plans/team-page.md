# Team Page

Display team stats at `/teams/:id`: header with team info, player averages table, player totals table, and a list of games at the bottom. Team names in the game page link to this page.

---

## After each step

- Mark step complete (✅) in this file
- List files created/modified under the step

---

## Step 1 — Team page scaffold: title only ✅

Backend `GET /teams/:id` returns only team identity. Frontend renders the page with just the team name.

### Backend response (step 1)

```json
{ "id": 1, "name": "CLAPIERS BASKET BALL 1", "category": "Senior", "gender": "Male" }
```

### Implementation

- `TeamModule` with `TeamController` + `TeamService.findOne(id)` — load `Team` with `club`, throw `NotFoundException` if not found
- Frontend: `Team.tsx` page at `/teams/:id`, fetches and renders team name
- Route wired in `App.tsx`
- Unit tests for `TeamService`
- Game page: expose `team_id` in backend response, link home/away team names in `TeamSection` to `/teams/:id`

### Files created
- `backend/src/team/team.controller.ts`
- `backend/src/team/team.service.ts`
- `backend/src/team/team.service.spec.ts`
- `backend/src/team/team.module.ts`
- `frontend/src/pages/Team.tsx`
- `frontend/src/components/team/types.ts`

### Files modified
- `backend/src/app.module.ts` — import `TeamModule`
- `frontend/src/App.tsx` — add `/teams/:id` route
- `backend/src/game/game.service.ts` — add `team_id` to home/away in response
- `backend/src/game/game.service.spec.ts` — update assertions
- `frontend/src/components/game/types.ts` — add `team_id` to `TeamData`
- `frontend/src/components/game/TeamSection.tsx` — wrap team name in `<Link to="/teams/:id">`

---

## Step 2 — Team info header + player averages table ✅

Extend backend to return team info and per-player averages. Add shared `StatsTable` component. Render header and averages on the page.

### Backend additions

```json
{
  "games_played": 12,
  "championships": ["Pré Régionale Masculine 2025/26"],
  "players": [
    {
      "id": 1,
      "last_name": "BERNARD",
      "first_name": "Antoine",
      "gp": 10,
      "starts": 8,
      "fouled_out": 1,
      "averages": {
        "time_played": "28:00",
        "points": 18.0,
        "shots_made": 7.0,
        "three_pts_made": 2.0,
        "two_pts_in_made": 2.0,
        "two_pts_out_made": 1.0,
        "ft_made": 2.0,
        "fouls": 2.5
      }
    }
  ]
}
```

- `gp`: count of player's `PlayerStatRow` for this team
- `starts`: count of rows where `starter = true`
- `fouled_out`: count of rows where `fouls >= 5`
- Averages: per-stat sum / gp, rounded to 1 decimal
- `games_played`: distinct game ids across all player rows
- `championships`: distinct `"name season"` strings from games' group → championship

### Shared component

- `src/components/common/StatsTable.tsx` — generic sortable, horizontally scrollable table reused across pages

### Columns (averages table)

`Player`, `GP`, `Starts`, `Fouled out`, `Time`, `PTS`, `Shots`, `3pts`, `2 in`, `2 out`, `FT`, `Fouls`

Default sort: PTS desc. Averages formatted to 1 decimal; GP/Starts/Fouled out as integers.

### Files created
- `frontend/src/components/common/StatsTable.tsx` — generic sortable scrollable table

### Files modified
- `backend/src/team/team.module.ts` — add `PlayerStatRow` to `forFeature`
- `backend/src/team/team.service.ts` — add player stat aggregation via QueryBuilder
- `backend/src/team/team.service.spec.ts` — add aggregation tests
- `frontend/src/pages/Team.tsx` — add header + averages table
- `frontend/src/components/team/types.ts` — extend with player/averages types

---

## Step 3 — Player totals table

Add `totals` to each player in the backend response. Render totals table on the page using `StatsTable`.

### Backend addition (per player)

```json
"totals": {
  "time_played": "280:00",
  "points": 180,
  "shots_made": 70,
  "three_pts_made": 20,
  "two_pts_in_made": 20,
  "two_pts_out_made": 10,
  "ft_made": 20,
  "fouls": 25
}
```

### Files modified
- `backend/src/team/team.service.ts` — add totals computation
- `backend/src/team/team.service.spec.ts` — add totals tests
- `frontend/src/pages/Team.tsx` — add totals table section

---

## Step 4 — Game list + link team names from game page

Add list of games to backend response. Render game list at bottom of team page. Link home/away team names in the game page to their respective team pages.

### Backend addition

```json
"games": [
  { "id": 1, "game_number": "42", "date": "15/11/2025", "opponent": "MONTPELLIER EST BASKET", "home": true, "score_for": 74, "score_against": 61 }
]
```

### Files modified
- `backend/src/team/team.service.ts` — add games list
- `backend/src/team/team.service.spec.ts` — add games list tests
- `frontend/src/pages/Team.tsx` — add games list section

---

## Decisions recap

| Topic | Decision |
|---|---|
| Route | `/teams/:id` |
| Average denominator | Games the player appeared in |
| Season filter | None — all-time |
| Fouled out threshold | `fouls >= 5` in a game |
| Default sort | PTS descending, both tables |
| Shared table | `src/components/common/StatsTable.tsx` |
| Header info | Name, category, gender, GP, championships |
| Game list | At bottom of team page, links to game page |
