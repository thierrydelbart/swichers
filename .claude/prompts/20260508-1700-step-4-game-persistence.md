# Step 4 — Full game persistence with transaction

## Context

Continuing the "Score Sheet DB Persistence" feature for Swichers (FFBB basketball stats platform). Steps 1–3 were already shipped (entity schema, findOrCreate services, resolveReferences). This step completes `GamePersistenceService` with a full `persist()` method and wires it into `ScoreSheetService`.

## Changes

### `GamePersistenceService.persist(data, file)`

Located in `backend/src/game-persistence/game-persistence.service.ts`.

Flow:
1. Call `resolveReferences(data)` outside the transaction to upsert Championship, Group, Venue, Club, Team
2. Open a TypeORM `DataSource.transaction()`:
   - Find existing `Game` by `(game_number, group_id)`
   - If found: delete all child rows (GameOfficer, PlayerStatRow, CoachStatRow, TeamStatRow) in parallel
   - Create or merge Game with `(game_number, day, time, venue, group, team_a, team_b)`
   - Cast save result `as Game` — needed because TypeORM's `em.save()` return type inference breaks on the merge/create ternary (union of `Game` and `T & Game`)
   - Create GameOfficer rows for non-null referees (rank 1/2/3, role = REFEREE)
   - For home and away sides: create PlayerStatRow per player, CoachStatRow if coach name non-null, 6 TeamStatRow rows from totals
   - Update File.game foreign key via `em.update(File, file.id, { game })`
3. Return the saved Game

### Helper functions (module-level, not exported)
- `parseDate("DD/MM/YY")` → `Date` (2-digit year = 2000+)
- `parseTime("HH:MM")` → minutes from midnight (int)
- `parseTimePlayed("MM:SS" | null)` → seconds (0 if null) — for PlayerStatRow (non-nullable)
- `parseTimePlayedNullable("MM:SS" | null)` → seconds or null — for TeamStatRow (nullable)

### `GamePersistenceModule`
Added OfficerModule, PlayerModule, CoachModule imports (needed for officerService, playerService, coachService injected into GamePersistenceService).

### `ScoreSheetService`
Restructured `extract()` with early return on cache hit — always has a `File` entity to pass to `persist()`:
- Cache hit: `persist(existing.extractedData, existing)` → return
- Cache miss: persist file → call Claude → updateExtractedData → `persist(extractedData, file)`

### `file.entity.ts`
Fixed absolute import `src/game-persistence/...` → relative `../game-persistence/...` (breaks Jest otherwise).

## Tests

`game-persistence.service.spec.ts` — mock `DataSource.transaction` to run callback synchronously with mock EntityManager. Tests cover:
- `resolveReferences` happy path (all 8 service calls with correct args)
- `persist` new game (em.delete not called, game created and returned)
- `persist` existing game (em.delete called 4 times, em.merge called)
- File linked to game (em.update called with correct args)
- Null referees skipped (only 2 officers for first+second when third is null)
- Null coach skipped (only 1 coachService.findOrCreate call when away coach is null)
- Error propagation from em.save

`score-sheet.service.spec.ts` — updated mock from `resolveReferences` to `persist`, assertions updated for both cache hit/miss and error paths.

34/34 tests passing.
