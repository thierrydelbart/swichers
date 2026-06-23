# Player Page — Step 1/4: Profile endpoint + page scaffold + shared hero

## Goal
Implement the first step of the player page feature: a public profile endpoint, a shared PageHero component, the Player page scaffold, and all entry-point links from Team and Game pages.

## Backend changes

### PlayerService — `findProfile(id)`
Add a public method that:
- Fetches the player + club via `repo.findOne({ where: { id }, relations: ['club'] })`
- Throws `NotFoundException` if not found
- Queries all `PlayerStatRow` for that player with deep relations: `game.group.championship`, `game.team_a.club`, `game.team_b.club`
- Detects the most recent season via `reduce` over `championship.season` strings
- Filters rows to that season only
- Iterates `[team_a, team_b]` for each game row, collecting teams whose `club.id === player.club.id` into a `Map` (deduplication by team id)
- Returns `{ id, last_name, first_name, initials, club: { id, name }, teams: [{ id, label }], season }`
- `initials` = `first_name[0].toUpperCase() + last_name[0].toUpperCase()`
- `label` = `[category, gender === 'Male' ? 'Masculin' : 'Féminin', suffix].filter(Boolean).join(' ')`

### PlayerController — `GET /players/:id`
Add a public (no auth guard) endpoint that delegates to `findProfile`. Import `Get` from `@nestjs/common`.

### GameService — `mapPlayer`
Add `id: row.player.id` to the returned object. The `player.club` relation is already loaded.

### GameService — home/away team objects
Add `club_id: homeClubId` and `club_id: awayClubId` to the `home` and `away` objects in `findOne` return.

### TeamService — `findOne`
Compute `season` from the player stat rows using `reduce` (same pattern as PlayerService). Return `null` when `rows.length === 0`. Add `season` to the returned object.

## Frontend changes

### `PageHero` component (new: `frontend/src/components/common/PageHero.tsx`)
Props: `title: string`, `subtitle: ReactNode`, `initials: string`, `breadcrumbs: { label, href? }[]`, `seasonLabel?: string`, `statStrip?: ReactNode`.

Structure:
- Outer `div` with `bg-[#31302e] dark:bg-[#111110]`
- Inner container `max-w-5xl mx-auto px-8` with `minWidth: 660`
- Top row (flex justify-between): breadcrumbs with `›` separators + optional season pill (`text-[11px] font-bold uppercase tracking-[0.6px] text-[#a39e98]`, rounded-full, `rgba(255,255,255,0.07)` bg)
- Hero row: avatar (`w-[72px] h-[72px] rounded-full bg-[#0075de]`, `border: 3px solid rgba(255,255,255,0.15)`) + h1 title + subtitle div
- Optional `statStrip` slot in a `bg-background border-t` bar below

### `Player` page (new: `frontend/src/pages/Player.tsx`)
- Route param: `player_id` (from `useParams<{ player_id: string }>()`)
- Fetch `GET /players/{player_id}` on mount; loading/notFound states
- `fetchProfile` extracted as a named function (not inline in `useEffect`) to satisfy react-hooks/set-state-in-effect lint rule
- Render `PageHero` with: title = `first_name last_name`, subtitle = club name + team labels with `·` separators, initials, breadcrumbs (Accueil → club.name linking to `/club/:club_id` → player name), seasonLabel = `Saison ${season}`
- Placeholder content div for steps 2–4

### `Club` page (`frontend/src/pages/Club.tsx`)
- Import `Player` page
- Add nested route `<Route path="player/:player_id" element={<Player />} />` inside the existing `<Routes>`
- This makes the Player page appear under `/club/:club_id/player/:player_id` with the ClubMenu visible above it
- No change needed to `teamIdFromUrl` logic — it returns `null` for player sub-routes (no team highlighted)

### `App.tsx`
- Remove the standalone `/players/:id` route (player is now exclusively nested under `/club/:id/*`)

### `Team.tsx`
- Import `PageHero`
- Remove `MetaItem` helper (no longer used)
- Replace `bg-muted` header block and `<nav>` breadcrumb with `<PageHero>` (full-width, outside the content wrapper)
- Restructure: outer `<div>`, then `<PageHero>`, then inner `<div className="max-w-5xl mx-auto px-8 py-8">`
- Compute `genderLabel`, `initials` (first char of each word up to 3), `breadcrumbs`, `subtitle` (category + genderLabel + games_played + championships list)
- `seasonLabel` = `Saison ${team.season}` if season present
- Replace `TOTALS_COLUMNS` / `AVERAGES_COLUMNS` module-level constants with:
  - `makePlayerCol(clubId: number): Column<TeamPlayer>` factory for the player name cell
  - `TOTALS_STAT_COLUMNS` / `AVERAGES_STAT_COLUMNS` (stat columns only, no player column)
  - Inside component: `const totalsColumns = [makePlayerCol(team.club_id), ...TOTALS_STAT_COLUMNS]`
- Player links use `/club/${team.club_id}/player/${r.id}`

### `PlayerTable.tsx`
- Import `Link` from react-router-dom
- Accept `clubId: number` prop
- Wrap player name cell in `<Link to={`/club/${clubId}/player/${p.id}`}>`

### `TeamSection.tsx`
- Pass `clubId={team.club_id}` to `<PlayerTable>`

### Type updates
- `game/types.ts` → `PlayerStat`: add `id: number`; `TeamData`: add `club_id: number`
- `team/types.ts` → `TeamPageData`: add `season: string | null`

### `About.tsx`
Add "Pages joueur" entry in the "Ce que vous trouverez" section describing the individual player profile page.

## Tests added
- `player.service.spec.ts`: 9 new tests for `findProfile` covering NotFoundException, empty state, initials, season detection, most-recent-season selection, club filtering, deduplication, male/female label formatting, both-teams-same-club case, old-season exclusion. Added file-top eslint-disable for unsafe-member-access/return/call.
- `game.service.spec.ts`: assert `home.club_id`, `away.club_id`, `players[0].id` in existing test; add `id` to mock player data
- `team.service.spec.ts`: assert `season` in existing test; add null-season test; add most-recent-season test
