# Step 2/2 — News feed (clap-clap-info)

## Goal
Implement the news feed on the club page: backend endpoint + full frontend layout (hero, sidebar, grid). Also introduce a `GET /config` endpoint so the frontend can resolve the default club ID from backend env instead of a hardcoded value.

## Backend changes

### `ClubService.findNews(clubId, teamId?)`
- Query games where `blog_title IS NOT NULL`
- Join `team_a`, `team_b`, their clubs, `group`, and `group.championship`
- If `teamId` provided, filter to games where team_a or team_b matches; otherwise filter by club
- Order by `game.day DESC`, limit 20
- Format date as `DD/MM/YYYY` (TypeORM returns dates as `YYYY-MM-DD` strings)
- Return array of `{ id, date, championship, team_a, team_b, score_a, score_b, blog_title, blog_content }`

### `ClubController` — `GET /clubs/:id/news?teamId=X`
- `teamId` is an optional query string; parse with `parseInt` if present

### `AppController` — `GET /config`
- Inject `ConfigService`, return `{ defaultClubId: Number(config.get('DEFAULT_CLUB_ID') ?? 1) }`
- `app.controller.spec.ts` updated to mock `ConfigService`

### `.env` / `.env.example`
- Added `DEFAULT_CLUB_ID=1`

## Frontend changes

### `ConfigContext.tsx` + `useConfig.ts`
- `ConfigProvider` fetches `GET /config` on mount, stores result in context; falls back to `{ defaultClubId: 1 }` on error
- `useConfig()` hook in separate file (ESLint `react-refresh/only-export-components` requires context + hook split, or a disable comment at file top — we used the disable comment pattern matching `AuthContext.tsx`)
- `App.tsx` wraps the tree with `<ConfigProvider>` (outermost)

### `Home.tsx`
- Reads `defaultClubId` from `useConfig()` and passes it to `<Club>`

### `Club.tsx` — news feed layout
- Second `useEffect` fetches `/clubs/:id/news` (with optional `teamId`) on mount and on team chip change
- **Hero** (article[0]): blue top stripe, championship badge, date, score (colored by W/L), teams, h2 title, 4-line clamped excerpt, "Lire la suite →" link
- **Sidebar** (articles[1..3]): "Dernières infos" header, each item shows date + championship badge + 2-line clamped title
- **Grid** (articles[4..6], max 3): 2-column, championship badge + teams row, score + W/L badge (Victoire/Défaite), 2-line clamped title
- `getResult()` helper: determines win/loss by checking if club's team is team_a or team_b
- Empty state: "Aucun article disponible."
- All cards link to `/games/:id`
