# Team page — Step 2: team info header + player averages table

## What was done

Extended `GET /teams/:id` to return full player stat aggregations. Added a shared `StatsTable` component. Rendered a Notion-style info header and a sortable averages table on the team page.

## New files

- `frontend/src/components/common/StatsTable.tsx` — generic sortable, horizontally scrollable table; accepts typed `Column<T>[]` with `getValue` (for sort) and `render` (for display); default sort key/dir configurable

## Modified files

- `backend/src/team/team.module.ts` — added `PlayerStatRow` to `TypeOrmModule.forFeature`
- `backend/src/team/team.service.ts` — injected `PlayerStatRowRepository`; QueryBuilder fetches rows filtered by `player.club.id = team.club.id` AND `(game.team_a.id = teamId OR game.team_b.id = teamId)`; computes `games_played` (distinct game ids), `championships` (distinct "name season"), per-player `gp`/`starts`/`fouled_out`/`averages` (sum/gp rounded to 1 decimal, time as "MM:SS")
- `backend/src/team/team.service.spec.ts` — replaced old `findOne` test with full aggregation test; added `mockPsrRepo` with QueryBuilder mock chain; added `no-unsafe-assignment` to eslint-disable
- `frontend/src/components/team/types.ts` — extended with `PlayerAverages`, `TeamPlayer`, full `TeamPageData`
- `frontend/src/pages/Team.tsx` — added `MetaItem` helper, `COLUMNS` definition with `timeToSec` for sort, `StatsTable` render with `defaultSortKey="points"`; info header card with category/gender/GP/championships

## Recreate from scratch

> Add `PlayerStatRow` to `TeamModule.forFeature`. Inject `PlayerStatRowRepository` in `TeamService`. In `findOne`, use a QueryBuilder to fetch all `PlayerStatRow` entries where `player.club.id = team.club.id` AND `(game.team_a.id = teamId OR game.team_b.id = teamId)`, joining player→club, game→group→championship. Compute `games_played` from distinct game ids, `championships` from distinct "name season" strings. Group rows by `player.id`, compute per-player `gp`, `starts` (starter=true), `fouled_out` (fouls>=5), and `averages` (each stat / gp rounded to 1 decimal; time_played as avg seconds formatted MM:SS). Return full response. Create `StatsTable<T>` generic component in `src/components/common/` with `Column<T>` interface (key, label, align, sortable, getValue, render), sort state, and scrollable table markup matching the game page PlayerTable style. Extend team types with `PlayerAverages`, `TeamPlayer`, full `TeamPageData`. In `Team.tsx`, define `COLUMNS` for all stats (player name non-sortable, others sortable), add `MetaItem` helper, render a `bg-muted` header card with name/category/gender/GP/championships, then an Averages section with `StatsTable` defaultSortKey="points".
