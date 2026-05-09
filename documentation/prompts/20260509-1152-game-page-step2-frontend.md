# Game page — Step 2: Frontend /games/:id page

## What was done

Created the `/games/:id` React page matching the mockup design.

## New files

- `frontend/src/pages/Game.tsx` — full game page with:
  - Breadcrumb: Home / championship name+season / Match #N
  - Game header card: home vs away teams + final score + meta (date, time, venue, group, referees)
  - Two team sections (home then away), each with a sortable scrollable player table and a totals grid
  - Loading and "Game not found" states

## Modified files

- `frontend/src/App.tsx` — added `/games/:id` route
- `backend/src/game/game.service.ts` — team name concatenated with suffix

## Key implementation details

- Sortable table: local `{ col, dir }` state per table, default PTS desc, click toggles direction or changes column
- `time_played` sorted by converting "MM:SS" to seconds (null → -1, sorts last)
- Starters: last name + first name both bold
- Totals: 3-column grid, each card shows Points/Fouls/3pts/FT in 2×2 layout; overtime card hidden if 0 pts
- No external sort library — plain `Array.sort`
- Tailwind + shadcn design tokens (bg-muted, border-border, text-muted-foreground)
- min-width 660px enforced via inline style

## Recreate from scratch

> Create `frontend/src/pages/Game.tsx`. Fetch `/games/:id` from backend on mount. Show loading/error states. Render: breadcrumb (Home / championship / Match #N), game header card (3-col grid: home name, score from totals.team.points, away name; meta row below border), then two TeamSection components. Each TeamSection has a PlayerTable (horizontally scrollable, sortable by clicking headers, default PTS desc, starters bold) and a TotalsGrid (3×2 cards, each showing Points/Fouls/3pts/FT, overtime hidden if 0). Add route `/games/:id` in App.tsx.
