# Team page — Step 3: player totals table

## What was done

Added `totals` per player to the backend response. Rendered a second sortable `StatsTable` on the team page under "Totals".

## Modified files

- `backend/src/team/team.service.ts` — extracted `formatSeconds(totalSec)` helper; refactored `formatAvgTime` to use it; added `totals` object per player (sum of each stat, `time_played` as `formatSeconds(sum)`)
- `backend/src/team/team.service.spec.ts` — added `totals.points` and `totals.time_played` assertions to the aggregation test
- `frontend/src/components/team/types.ts` — added `PlayerTotals` interface (same fields as `PlayerAverages` but integer stats); added `totals: PlayerTotals` to `TeamPlayer`
- `frontend/src/pages/Team.tsx` — added `TOTALS_COLUMNS` (same structure as `COLUMNS` but reading from `r.totals`); added "Totals" heading and second `StatsTable` with `defaultSortKey="points"`

## Recreate from scratch

> Extract `formatSeconds(totalSec: number): string` helper in `team.service.ts` (floor/mod for MM:SS). Refactor `formatAvgTime` to call it. Add `totals` to the player map: `time_played` via `formatSeconds(sum(...time_played))`, all other fields via `sum(...)`. Add `PlayerTotals` interface to types (same shape as `PlayerAverages` but numeric fields are integers). Extend `TeamPlayer` with `totals: PlayerTotals`. In `Team.tsx`, define `TOTALS_COLUMNS` mirroring `COLUMNS` but pointing to `r.totals.*` for getValue/render. Add a "Totals" `h2` and a second `StatsTable` below the averages table.
