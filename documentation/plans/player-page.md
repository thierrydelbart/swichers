# Player Page

## Goal
Public page at `/players/:id` showing a player's season stats, game-by-game breakdown, and related articles. Reuses a shared `PageHero` component also applied to the Team page.

## Design reference
`documentation/mockups/player-page-b.html`

## Decisions
- Route: `/players/:id`
- Entry points: Team page (player name in table) + Game page (player name in PlayerTable)
- Season: auto-detect most recent season from player's game history — no switching yet (select is static display)
- "14/22" games count: numerator = games player appeared in; denominator = total games for all teams the player appeared for in the season (aggregate, no double-count)
- W/L: backend computes `won: boolean` from player's club vs team_a/team_b
- `championship.short_code` fallback: use `championship.name` when null
- Articles: games where player appeared + `blog_title IS NOT NULL`, ordered by date DESC, no limit
- Hero meta: club name + all teams (category · gender · suffix) the player appeared for in the season
- Styling: Tailwind + shadcn CSS variables; dark hero hardcoded `bg-[#31302e] dark:bg-[#111110]`
- `PageHero` shared component applied to Player page now, Team page now, Game page deferred

## API endpoints (all in PlayerController)
| Method | Path | Returns |
|---|---|---|
| GET | `/players/:id` | profile: name, club, teams, season |
| GET | `/players/:id/stats` | stat strip: games played/total, starters, 5 stat avgs with min/max + game_id |
| GET | `/players/:id/games` | per-game rows: date, opponent, badge, won, starter, pts, 3pts, shots, ft, fouls |
| GET | `/players/:id/news` | articles: game_id, date, badge, blog_title |

---

## ✅ Step 1/4 — Profile endpoint + page scaffold + shared hero

### Backend
- Add `findProfile(id)` to `PlayerService`
  - Detects most recent season from player's `PlayerStatRow → game → group → championship`
  - Returns: `{ id, last_name, first_name, initials, club: { id, name }, teams: [{ id, label }], season }`
  - Team label = `category + gender + suffix` (e.g. "Senior Masculin 1")
  - Throws `NotFoundException` if player not found
- Add `GET /players/:id` to `PlayerController` (public, no auth guard)
- Update `PlayerModule`: inject `DataSource` (for query builder joins)

### Frontend
- Create `frontend/src/components/common/PageHero.tsx`
  - Props: `title`, `subtitle` (ReactNode), `initials`, `breadcrumbs: { label, href? }[]`, `seasonLabel`, `statStrip?` (ReactNode slot)
  - Dark banner: `bg-[#31302e] dark:bg-[#111110]`
  - Avatar, player name, meta row, breadcrumb, season pill
- Create `frontend/src/pages/Player.tsx`
  - Fetches `GET /players/:id`
  - Renders `PageHero` with profile data
  - Remaining sections are placeholders (filled in steps 2–4)
- Apply `PageHero` to `frontend/src/pages/Team.tsx` (replace existing header block)
- Add route `<Route path="/players/:id" element={<Player />} />` to `frontend/src/App.tsx`
- Add `<Link to={`/players/${r.id}`}>` on player name in `frontend/src/pages/Team.tsx` (TOTALS + AVERAGES tables)
- Add player name link in `frontend/src/components/game/PlayerTable.tsx`

### Files
- `backend/src/entities/player/player.service.ts` ✅
- `backend/src/entities/player/player.service.spec.ts` ✅ (9 new tests)
- `backend/src/entities/player/player.controller.ts` ✅
- `backend/src/entities/game/game.service.ts` ✅ (added `id` + `club_id` to player/team response)
- `backend/src/entities/game/game.service.spec.ts` ✅
- `backend/src/entities/team/team.service.ts` ✅ (added `season`)
- `backend/src/entities/team/team.service.spec.ts` ✅
- `frontend/src/components/common/PageHero.tsx` *(new)* ✅
- `frontend/src/pages/Player.tsx` *(new)* ✅ — URL: `/club/:club_id/player/:player_id`
- `frontend/src/pages/Team.tsx` ✅ (PageHero + championships in subtitle + player links)
- `frontend/src/pages/Club.tsx` ✅ (nested `player/:player_id` route)
- `frontend/src/pages/About.tsx` ✅ (Pages joueur section)
- `frontend/src/components/game/PlayerTable.tsx` ✅ (player links with clubId prop)
- `frontend/src/components/game/TeamSection.tsx` ✅ (passes club_id)
- `frontend/src/components/game/types.ts` ✅ (id + club_id on TeamData)
- `frontend/src/components/team/types.ts` ✅ (season field)
- `frontend/src/App.tsx` ✅ (removed standalone /players/:id route)

---

## Step 2/4 — Stats endpoint + stat strip

### Backend
- Add `findStats(id)` to `PlayerService`
  - Filters `PlayerStatRow` for player in detected season
  - Computes: `games_played`, `team_games_total`, `starters`
  - For each of 5 stats (points, three_pts_made, shots_made, ft_made, fouls): `avg`, `min: { value, game_id }`, `max: { value, game_id }`
- Add `GET /players/:id/stats` to `PlayerController`

### Frontend
- Fill the `statStrip` slot in `Player.tsx`
  - 6 strip cells: Matchs joués (with `/total`), Pts moy., 3pts moy., Tirs moy., LF moy., Fautes moy.
  - Min/max as anchor links `href={`/games/${game_id}`}` styled red/green

### Files
- `backend/src/entities/player/player.service.ts`
- `backend/src/entities/player/player.controller.ts`
- `frontend/src/pages/Player.tsx`

---

## Step 3/4 — Games endpoint + games table

### Backend
- Add `findGames(id)` to `PlayerService`
  - Returns all `PlayerStatRow` for player in detected season, joined to game + teams + championship
  - Per row: `{ game_id, date, opponent, championship_badge, won, starter, points, three_pts_made, shots_made, ft_made, fouls }`
  - `opponent` = the other team's name (not the player's club side)
  - `won` = player's club side scored more
  - `championship_badge` = `short_code ?? name`
  - Ordered by date DESC
- Add `GET /players/:id/games` to `PlayerController`

### Frontend
- Add games table section to `Player.tsx` (left column of two-col layout)
  - Columns: Date, Adversaire, Comp., V/D, Pts, 3pts, Tirs, LF, F.
  - Starter dot on opponent name if `starter = true`
  - Row click → navigate to `/games/:game_id`
  - Table rows get `id="game-{game_id}"` for min/max anchor links from stat strip

### Files
- `backend/src/entities/player/player.service.ts`
- `backend/src/entities/player/player.controller.ts`
- `frontend/src/pages/Player.tsx`

---

## Step 4/4 — News endpoint + articles sidebar

### Backend
- Add `findNews(id)` to `PlayerService`
  - `PlayerStatRow` for player → filter games with `blog_title IS NOT NULL`
  - Returns: `{ game_id, date, championship_badge, title }`
  - Ordered by date DESC, no limit
- Add `GET /players/:id/news` to `PlayerController`

### Frontend
- Add articles sidebar to `Player.tsx` (right column — completes two-col layout)
  - Sidebar card with list of article items: date, badge, title (2-line clamp)
  - Each item links to `/games/:game_id`
- Two-col layout: `grid-cols-1 lg:grid-cols-[1fr_320px]`

### Files
- `backend/src/entities/player/player.service.ts`
- `backend/src/entities/player/player.controller.ts`
- `frontend/src/pages/Player.tsx`
