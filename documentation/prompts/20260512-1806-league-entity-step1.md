# League Entity — Step 1/2: backend wiring

## Goal
Add a `League` entity linked to `Championship`. Parse the league code from the uploaded filename, validate only "0034" is accepted, and backfill existing championships on startup.

## New files

### `league/league.entity.ts`
Fields: `id`, `code` (varchar 10, unique), `name` (varchar 100), `championships` (OneToMany).

### `league/league.service.ts`
`findOrCreate(code)`: lookup by code, create if not found. Resolves name from hardcoded map (`{ "0034": "Comité de l'Hérault" }`), falls back to `code` as name for unknown leagues.

### `league/league.module.ts`
Exports `LeagueService`. Uses `TypeOrmModule.forFeature([League])`.

### `league/league.service.spec.ts`
3 tests: returns existing, creates with known name, falls back to code for unknown league.

## Modified files

### `championship/championship.entity.ts`
Added `league` as `nullable: true` ManyToOne (nullable at DB level so `synchronize: true` doesn't break on existing rows; always set at app level).

### `championship/championship.service.ts`
`findOrCreate()` now requires `league: League` as 6th param. If existing championship has no league (backfill case), sets it and saves.

### `championship/championship.service.spec.ts`
Added test: backfills league on existing championship without one. Updated all calls to pass `league`.

### `game-persistence/game-persistence.service.ts`
- `resolveReferences(data, fileName)` — added `fileName` param
- Parses league code from filename via `/^resume_(\d+)_/i`
- Throws `BadRequestException('Unsupported league')` if code is missing or not `"0034"`
- Calls `leagueService.findOrCreate(code)` and passes result to `championshipService.findOrCreate()`
- `persist(data, file)` passes `file.name` to `resolveReferences()`

### `game-persistence/game-persistence.module.ts`
Added `LeagueModule` to imports.

### `game-persistence/game-persistence.service.spec.ts`
- Added `mockLeagueService` + `LeagueService` provider
- `file` object now has `name: 'resume_0034_PRM_A_77.pdf'`
- `seedRefs()` mocks `leagueService.findOrCreate`
- Added 2 new tests: throws BadRequestException for unsupported code, throws for no code in filename

### `app.service.ts`
`onModuleInit()` backfill: finds or creates league "0034", updates all championships where `league IS NULL`.

### `app.module.ts`
Added `League` to entities array and `LeagueModule` to imports. Added `League` entity import.
