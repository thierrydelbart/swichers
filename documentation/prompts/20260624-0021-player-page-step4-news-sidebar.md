# Player Page — Step 4/4: News endpoint + articles sidebar

## Context

Final step of the player page feature (`documentation/plans/player-page.md`). Steps 1–3 built the profile, stat strip, and games table. This step adds a news/articles sidebar in the right column of the two-col layout.

## What was built

### Backend

**`PlayerService.findNews(id)`** (`backend/src/entities/player/player.service.ts`):
- Loads all `PlayerStatRow` for the player with `game → group → championship` relation (no `team_a`/`team_b` needed here)
- Reuses `detectSeason()` to target the most recent season
- Filters rows where `game.blog_title !== null`
- Sorts by game date DESC
- Returns `{ game_id, date (dd/mm/yyyy), championship_badge (short_code ?? name), title }`

**`GET /players/:id/news`** (`backend/src/entities/player/player.controller.ts`):
- Public endpoint, no auth guard, delegates to `findNews`

**Tests** (`backend/src/entities/player/player.service.spec.ts`):
- 6 new tests (49 total): NotFoundException, empty array when no rows, excludes null blog_title rows, sorts DESC, badge fallback to name, most-recent-season filter

### Frontend

**`PlayerNewsSidebar`** (`frontend/src/components/player/PlayerNewsSidebar.tsx`):
- New standalone component (returns null when news array is empty)
- Section header "Articles mentionnant ce joueur" with hr line (matches PlayerGamesTable header style)
- White rounded card (`bg-background`, `rounded-[12px]`, `border-black/10`)
- Each article item: date + championship badge pill on top row, 2-line-clamp title below
- Each item is a `<Link>` to `/club/:clubId/games/:game_id`
- Dark mode styles matching the rest of the page

**`Player.tsx`** (`frontend/src/pages/Player.tsx`):
- Added `news` state (`PlayerNewsItem[] | null`)
- `setNews(null)` on reset alongside other state resets
- `GET /players/:id/news` added to the parallel `Promise.all` (4th fetch)
- Right column now renders `<PlayerNewsSidebar news={news} clubId={profile.club.id} />` (was a placeholder comment)

## Design reference

Sidebar card matches `documentation/mockups/player-page-b.html` — `.sidebar-card`, `.sidebar-head`, `.article-item`, `.article-meta`, `.article-title` translated to Tailwind inline classes.

## Key decisions

- `PlayerNewsSidebar` returns `null` when `news.length === 0` so the right column is empty (not blank space) when there are no articles — the layout collapses to single-col on those players.
- `findNews` reloads PSRs separately (doesn't share with `findGames`) to keep relations minimal — no `team_a`/`team_b` needed for news.
- Link destination is `/club/:clubId/games/:game_id` (using the player's club id), consistent with how `PlayerGamesTable` and `PlayerStatStrip` link to games.
