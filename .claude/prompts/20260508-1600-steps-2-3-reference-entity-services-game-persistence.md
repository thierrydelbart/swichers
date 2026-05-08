# Steps 2 & 3 — Reference entity services + game references persistence

## Context

Working on the "Score Sheet DB Persistence" feature for the Swichers platform. After Claude extracts structured data from an FFBB score sheet JPEG, the app needs to persist that data to PostgreSQL. Steps 1 (entity schema updates) was already done. This prompt covers steps 2 and 3.

## Step 2 — findOrCreate services for all reference entities

Create `findOrCreate` methods for all 8 reference entities. Each lives in its own NestJS module exporting its service. Upsert key per entity:

- `Championship`: (name, season) — also takes shortCode, category (TeamCategory enum), gender (Gender enum)
- `Group`: (name, championship)
- `Club`: name
- `Venue`: name
- `Team`: (name, suffix, category, gender, club)
- `Officer`: name
- `Player`: (lastName, firstName, club)
- `Coach`: (lastName, firstName, club)

Pattern: `findOne` by upsert key → `save(create(...))` if not found. Each module uses `TypeOrmModule.forFeature([Entity])` and exports its service. Add unit tests with mocked repositories for each service (27 tests total).

Also update `Championship` entity: make `season`, `category`, `gender` non-nullable (they are always computed from extraction data).

## Step 3 — GamePersistenceService.resolveReferences()

Create `GamePersistenceService` in `backend/src/game-persistence/` with:

- `extraction-result.interface.ts` — TypeScript interface matching the Claude extraction JSON shape (`ExtractionResult`, `PlayerRow`, `TeamTotals`, `StatRow`, `CoachRow`)
- `game-persistence.service.ts` — injectable service with `resolveReferences(data: ExtractionResult): Promise<GameReferences>` that:
  1. Casts `competition.category` → `TeamCategory` enum, `competition.gender` → `Gender` enum
  2. Resolves Championship (name, season, shortCode, category, gender)
  3. Resolves Group, Venue, homeClub, awayClub in parallel via `Promise.all`
  4. Resolves homeTeam, awayTeam in parallel (after clubs are resolved)
  5. Returns `GameReferences` = `{ championship, group, venue, homeClub, awayClub, homeTeam, awayTeam }`
- `game-persistence.module.ts` — imports ChampionshipModule, GroupModule, VenueModule, ClubModule, TeamModule
- `game-persistence.service.spec.ts` — unit test with all 5 services mocked, asserting correct args to each findOrCreate

Wire into `ScoreSheetService`:
- Inject `GamePersistenceService`
- After extraction (cache hit or miss), call `await gamePersistenceService.resolveReferences(extractedData)`
- Do NOT call on Claude error (thrown before reaching that line)
- Import `GamePersistenceModule` in `ScoreSheetModule`
- Fix imports to use relative paths (not `src/...` absolute) for Jest compatibility
- Update `ScoreSheetService` tests: mock `GamePersistenceService`, assert `resolveReferences` called on cache hit and miss, not called on error

## Key decisions

- Club for home/away derived from team name (same string)
- Team category and gender come from competition (same championship = same category/gender for both teams)
- `resolveReferences` is temporary wiring for manual testing; Step 4 will replace it with full game persistence
- All imports must be relative (`../game-persistence/...`) not absolute (`src/...`) for Jest to resolve them
