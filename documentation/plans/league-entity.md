# League Entity

Add a `League` entity linked to `Championship`. The league code is extracted from the uploaded filename. League name is resolved from a hardcoded code→name mapping.

---

## Decisions

| Topic | Decision |
|---|---|
| League fields | `code` (varchar 10, unique), `name` (varchar 100) |
| Name resolution | Hardcoded mapping in backend (stable FFBB list) |
| Code source | Parsed from `file.name` via regex `resume_(\d+)_` |
| Championship link | `league` **NOT NULL** ManyToOne on Championship |
| Allowed leagues | Only `"0034"` accepted at upload time (others rejected with 400) |
| Backfill | All existing championships → league "0034" (Comité de l'Hérault) |
| UI placement | Breadcrumb only (plain text, no link) |
| Game breadcrumb | `Accueil / 0034 / Pré-Régionale Masculine / Team A vs Team B` |
| Team breadcrumb | `Accueil / 0034 / Team name` |

---

## After each step

- Mark step complete (✅) in this file
- List files created/modified under the step
- Update `documentation/database.uml` if entities changed

---

## Step 1 — League entity + backend wiring ✅

### New entity: `League`
- `id` (primary key)
- `code` (varchar 10, unique) — e.g. `"0034"`
- `name` (varchar 100) — e.g. `"Comité de l'Hérault"`
- `championships` (OneToMany → Championship)

### New module: `LeagueModule`
- `LeagueService.findOrCreate(code: string): Promise<League>`
  - Looks up by `code`; if not found, resolves name from hardcoded map and creates
  - Hardcoded map (at minimum): `{ "0034": "Comité de l'Hérault" }`
  - If code not in map, use `name = code` as fallback

### Championship changes
- Add `league` (NOT NULL ManyToOne → League) to `Championship` entity
- Update `ChampionshipService.findOrCreate()` to require `league: League` param

### GamePersistenceService changes
- In `resolveReferences()`, parse league code from `file.name`:
  - Regex: `/^resume_(\d+)_/i` on `file.name` — capture group 1 is the code
  - If no match or code not `"0034"`: throw `BadRequestException('Unsupported league')`
- Call `LeagueService.findOrCreate(code)` before Championship
- Pass `league` to `ChampionshipService.findOrCreate()`

### Backfill
- In `AppService.onModuleInit()`, after existing seed:
  - Find or create league `"0034"`
  - Update all Championships where `league IS NULL` → set to that league
- Note: `synchronize: true` won't enforce NOT NULL until after backfill — backfill runs before any constraint issue arises at the application level; existing rows get league assigned on next startup

### Tests
- `LeagueService`: findOrCreate creates new, findOrCreate returns existing
- `GamePersistenceService`: assert league resolved and passed to championship; assert BadRequestException when filename has no code or unsupported code

### Files created
- `backend/src/league/league.entity.ts`
- `backend/src/league/league.service.ts`
- `backend/src/league/league.module.ts`
- `backend/src/league/league.service.spec.ts`

### Tests
47/47 passing

### Files created
- `backend/src/league/league.entity.ts`
- `backend/src/league/league.service.ts`
- `backend/src/league/league.module.ts`
- `backend/src/league/league.service.spec.ts`

### Files modified
- `backend/src/championship/championship.entity.ts` — add `league` nullable ManyToOne (nullable at DB level; always set at app level)
- `backend/src/championship/championship.service.ts` — require league param in findOrCreate
- `backend/src/championship/championship.service.spec.ts` — update tests
- `backend/src/game-persistence/game-persistence.service.ts` — parse + validate league code, resolve league
- `backend/src/game-persistence/game-persistence.module.ts` — import LeagueModule
- `backend/src/game-persistence/game-persistence.service.spec.ts` — add league tests
- `backend/src/app.service.ts` — backfill in onModuleInit
- `backend/src/app.module.ts` — import LeagueModule if needed for injection
- `documentation/database.uml` — add League entity, League→Championship relation

---

## Step 2 — Frontend breadcrumbs

Expose `league` in API responses and update breadcrumbs on game and team pages.

### Backend API changes

**`GET /games/:id`** — add `league: { code, name }` to response (via `GameService`)
- Join Championship → League when loading game

**`GET /teams/:id`** — add `league: { code, name }` to response (via `TeamService`)
- Join Team → Games → Group → Championship → League (use first game's league)

### Frontend changes

**Types** — add `league: { code: string; name: string }` to `GamePageData` and `TeamPageData`

**Game page breadcrumb** — update from:
`Accueil / Team A vs Team B`
to:
`Accueil / 0034 / Pré-Régionale Masculine / Team A vs Team B`

**Team page breadcrumb** — update from:
`Accueil / Team name`
to:
`Accueil / 0034 / Team name`

All breadcrumb segments are plain text (no links) except `Accueil`.

### Files modified
- `backend/src/game/game.service.ts` — join championship + league
- `backend/src/team/team.service.ts` — resolve league from first game
- `frontend/src/pages/Game.tsx` — update breadcrumb
- `frontend/src/pages/Team.tsx` — update breadcrumb
- `frontend/src/components/team/types.ts` — add league field
