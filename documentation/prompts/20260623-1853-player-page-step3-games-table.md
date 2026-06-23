# Player Page Step 3 — Games endpoint + games table

## Goal
Add `GET /players/:id/games` endpoint and a standalone `PlayerGamesTable` component displayed in the left column of a two-col layout below the stat strip. Also link team labels in the hero subtitle to the Team page.

## Backend changes

### `player.service.ts`
Add `findGames(id)`:
- Load player with club, load all PSRs with full relations (game → group → championship, team_a/b → club).
- Return `[]` early if no rows.
- Detect most recent season (`detectSeason` reused), filter season rows.
- Sort rows by `game.day` DESC (`new Date(game.day).getTime()`).
- For each row:
  - `playerIsTeamA` = `game.team_a.club.id === player.club.id`
  - `opponent` = the other team's `name`
  - `won` = `null` if scores are null, else `playerIsTeamA ? score_a > score_b : score_b > score_a`
  - `date` = `DD/MM/YYYY` formatted via `getUTCDate/Month/FullYear` (UTC to avoid timezone shift on date-only DB values)
  - `championship_badge` = `champ.short_code ?? champ.name`
  - Return: `{ game_id, date, opponent, championship_badge, won, starter, points, three_pts_made, shots_made, ft_made, fouls }`

### `player.controller.ts`
Add `@Get(':id/games') games(@Param('id', ParseIntPipe) id: number)` → `findGames(id)` (public, no auth guard).

### `player.service.spec.ts`
Add `describe('findGames', ...)` with `makeGameRow` helper (includes `day`, `score_a/b`, team `name`, championship `short_code`). 7 tests:
1. NotFoundException when player not found
2. Empty array when no stat rows
3. Rows sorted date DESC
4. `won=true` when player is team_a and score_a > score_b
5. `won=false` when player is team_b and score_b < score_a
6. `won=null` when scores are null
7. Falls back to championship `name` when `short_code` is null
8. Uses only most recent season rows

## Frontend changes

### `frontend/src/components/player/PlayerGamesTable.tsx` (new)
Standalone component — `{ games: PlayerGameRow[]; clubId: number }`.
- Section header "Matchs joués" with horizontal rule after (using `after:` pseudo-element).
- White card: `bg-background border border-black/10 rounded-[12px] overflow-x-auto shadow`.
- 9-col table (min-width 520px): Date, Adversaire, Comp., V/D, Pts, 3pts, Tirs, LF, F.
- Header row: `bg-[#f6f5f4] dark:bg-[#161514]`, muted uppercase 10px labels.
- Each row has `id="game-{game_id}"` for stat strip min/max anchor scroll.
- Row click → `navigate('/club/${clubId}/games/${game_id}')`.
- Starter dot: 5px blue circle before opponent name when `starter=true`.
- V/D: green `#16a34a` for win, red `#dc2626` for loss, muted `–` for null.
- Championship badge: pill `bg-[#f2f9ff] dark:bg-[rgba(0,117,222,0.2)] text-[#097fe8]`.
- Points cell: bold 14px, slightly larger than other stat cells.

### `frontend/src/pages/Player.tsx`
- Add `games` state (`PlayerGameRow[] | null`).
- Extend `Promise.all` to 3 fetches: profile, stats, `/players/:id/games`.
- Two-col layout: `grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start`.
- Left col: `<PlayerGamesTable>` when `games && games.length > 0`.
- Right col: empty placeholder for step 4.
- Import `Link` from react-router-dom; team labels in hero subtitle wrapped in `<Link to="/teams/:id">` with `hover:text-white transition-colors`.
