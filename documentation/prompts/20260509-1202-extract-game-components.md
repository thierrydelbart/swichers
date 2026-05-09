# Extract game page components + fix null suffix

## What was done

Extracted inline components from `Game.tsx` into dedicated files under `src/components/game/`. Fixed a bug where a null team suffix would render as "TEAM null".

## New files

- `frontend/src/components/game/types.ts` — shared interfaces (PlayerStat, Totals, TeamData, GameData, etc.)
- `frontend/src/components/game/PlayerTable.tsx` — sortable player stats table
- `frontend/src/components/game/TotalsGrid.tsx` — totals cards grid + StatCell
- `frontend/src/components/game/TeamSection.tsx` — team section wrapper

## Modified files

- `frontend/src/pages/Game.tsx` — now only handles data fetching and page layout; imports components
- `backend/src/game/game.service.ts` — fixed null suffix: use `name suffix` only when suffix is non-null
- `backend/src/game/game.service.spec.ts` — updated assertions to match new name format

## Recreate from scratch

> Move PlayerTable, TotalsGrid (with StatCell), and TeamSection out of Game.tsx into `src/components/game/`. Also create a `types.ts` file with all shared interfaces. Update Game.tsx to import from the new location. Fix the backend service to conditionally append suffix to team name only when non-null.
