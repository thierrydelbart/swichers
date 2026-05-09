# Team page — Step 4: game list + win column

## What was done

Added a games list to the team page backend response and rendered it as a sortable, clickable `StatsTable` at the bottom of the team page. Rows link to the game page. Added a W/L column instead of Game #.

## Modified files

- `backend/src/team/team.module.ts` — added `TeamStatRow` to `TypeOrmModule.forFeature`
- `backend/src/team/team.service.ts` — injected `TeamStatRowRepository`; added `formatDate` helper (same as game.service); queried `TeamStatRow` type=TEAM with `innerJoinAndSelect` on game.team_a, game.team_b, tsr.team; grouped results by game id, separated into `mine` (team's row) and `theirs` (opponent's); built games list with id, game_number, date, opponent (name+suffix), home bool, points, points_against, win bool (mine.points > theirs.points), three_pts_made, ft_made, fouls
- `backend/src/team/team.service.spec.ts` — added `mockTsrQb` and `mockTsrRepo` mocks; added games list test asserting opponent, home, points, points_against, date
- `frontend/src/components/team/types.ts` — added `TeamGame` interface; added `games: TeamGame[]` to `TeamPageData`
- `frontend/src/components/common/StatsTable.tsx` — added optional `onRowClick?: (row: T) => void` prop; applies `cursor-pointer` class and onClick handler on rows when provided
- `frontend/src/pages/Team.tsx` — added `dateToNum` helper (DD/MM/YYYY → YYYYMMDD int for sorting); added `GAME_COLUMNS` (Date, W/L, Opponent, H/A, PTS, PTS vs, 3pts, FT, Fouls); added `useNavigate`; rendered games `StatsTable` with `defaultSortKey="date"`, `defaultSortDir="desc"`, `onRowClick` navigating to `/games/:id`

## Recreate from scratch

> Add `TeamStatRow` to `TeamModule.forFeature`. Inject `TeamStatRowRepository` in `TeamService`. Add `formatDate(day: Date | string)` helper (copy from game.service). Query `TeamStatRow` type=TEAM where game.team_a=teamId OR game.team_b=teamId, with `innerJoinAndSelect` on game, game.team_a, game.team_b, tsr.team, ordered by game.day DESC. Group by game.id into `{ game, mine, theirs }`. Map to games list: opponent from the non-team side (name+suffix), home=(game.team_a.id===id), points from mine, points_against from theirs, win=(mine.points > theirs.points). Add `TeamGame` type and `games` to `TeamPageData`. Add `onRowClick` prop to `StatsTable`. In `Team.tsx`, add `dateToNum` helper, `GAME_COLUMNS` with W/L replacing Game #, and a games `StatsTable` at bottom with date-desc default sort and row click navigating to the game page.
