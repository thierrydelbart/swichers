# Player Page Step 2 — Stats endpoint + stat strip

## Goal
Add `GET /players/:id/stats` endpoint and a standalone `PlayerStatStrip` component displayed below the player hero.

## Backend changes

### `player.module.ts`
Add `Game` to `TypeOrmModule.forFeature` so `GameRepository` can be injected into `PlayerService`.

### `player.service.ts`
- Extract season detection from `findProfile` into a private `detectSeason(rows)` helper.
- Inject `@InjectRepository(Game) gameRepo`.
- Add `findStats(id)`:
  - Load all PSRs for player with full relations (game → group → championship, team_a/b → club).
  - Return zeros + null cells early if no rows.
  - Detect most recent season, filter rows to that season.
  - `games_played` = count of season rows; `starters` = rows where `starter = true`.
  - `team_games_total`: collect team IDs from the player's club across season rows, then query `gameRepo` with query builder (join group/championship/team_a/team_b, filter by season + team IDs IN list), deduplicate by game ID.
  - For each of 5 stats (points, three_pts_made, shots_made, ft_made, fouls): compute `avg` (1 decimal, `Math.round(sum/n * 10) / 10`), `min: { value, game_id }`, `max: { value, game_id }`.

### `player.controller.ts`
Add `@Get(':id/stats')` → `findStats(id)` (public, no auth guard).

### `player.service.spec.ts`
Add `mockGameQb` (innerJoin/where/andWhere/select/getMany chain) and `mockGameRepo`. Register `Game` token in test module. Add 6 `findStats` tests: NotFoundException, zeros on empty rows, games_played/starters, avg/min/max for points, rounding, season filter, team_games_total deduplication.

## Frontend changes

### `frontend/src/components/player/PlayerStatStrip.tsx` (new)
Standalone component — not injected into `PageHero`. Takes `{ stats: PlayerStatsData; clubId: number }`.
- White bar with border-top, constrained to `max-w-5xl` matching the hero.
- 6-column grid: "Matchs joués" cell (blue value with `/total`, starter count) + 5 stat cells.
- Min/max hidden when `games_played <= 1`.
- Min/max links to `/club/${clubId}/games/${game_id}`, styled red (min) / green (max).

### `frontend/src/pages/Player.tsx`
- Fetch profile and stats in parallel (`Promise.all`).
- Render `<PlayerStatStrip>` between `<PageHero>` and the main content area when `games_played > 0`.

### Games URL migration (user-initiated, included in this commit)
- `Club.tsx`: updated 3 game links from `/games/:id` → `/club/:clubId/games/:id`; added `Game` sub-route to Club's `<Routes>`.
- `Team.tsx`: updated `onRowClick` navigate call to `/club/:clubId/games/:id`.
