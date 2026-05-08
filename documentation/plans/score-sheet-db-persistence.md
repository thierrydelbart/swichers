# Score Sheet DB Persistence

After Claude extracts a score sheet, persist all structured data into the database using upsert-based entity resolution.

---

## Entity resolution rules

| Entity | Upsert key |
|---|---|
| `Championship` | `(name, season)` — season nullable |
| `Group` | `(name, championship)` |
| `Club` | `name` |
| `Team` | `(name, suffix, category)` — category nullable |
| `Venue` | `name` |
| `Officer` | `name` |
| `Player` | `(last_name, first_name, club)` |
| `Coach` | `(last_name, first_name, club)` |

Club is derived from team name. Player/Coach club is assigned from the team they play for. If `File.game` is already set, skip entirely (game already persisted from a previous upload of the same file).

---

## After each step

- Mark step complete (✅) in this file
- List files created/modified under the step
- Update `documentation/database.uml` if entities changed

---

## Step 1 — Entity schema updates + ffbb-extractor skill updates ✅

Update existing entities to match extraction data, add missing fields. Update the ffbb-extractor skill to extract season and category.

### Entity changes
- `Championship`: add `short_code` (varchar 10, nullable), `category` (nullable enum: U5–U21, Senior), `gender` (nullable enum: Male, Female)
- `Team`: add `category` (nullable enum: U5–U21, Senior), `gender` (nullable enum: Male, Female)
- `Venue`: add `name` (varchar 100), make `address` nullable
- Update `documentation/database.uml`

### ffbb-extractor skill updates

**1. Season** — add `competition.season` (string `"YYYY/YY"`) computed from `game_info.date`:
- Season starts Aug 1, ends Jul 31 the following year
- If game date month ≥ 8 (August–December): season = `"YYYY/(YY+1)"` (e.g. date in Nov 2025 → `"2025/26"`)
- If game date month < 8 (January–July): season = `"(YYYY-1)/YY"` (e.g. date in Mar 2026 → `"2025/26"`)

**2. Category** — add `competition.category` (string, one of U5–U21, Senior) derived from `competition.name`:
- Parse the age category from the competition name (e.g. `"DMU15"` → `"U15"`, `"Pré régionale masculine"` → `"Senior"`)
- If no age marker found, default to `"Senior"`
- Same category applies to both teams (they play in the same championship)

**3. Gender** — add `competition.gender` (`"Male"` or `"Female"`) derived from `competition.name`:
- If the name contains `F` with gender meaning (e.g. `"U17F"`, `"DMF"`, `"féminine"`) → `"Female"`
- Otherwise → `"Male"`
- Same gender applies to both teams (they play in the same championship)

Updated `competition` output shape:
```json
"competition": {
  "name": "Pré régionale masculine",
  "short_code": "PRM",
  "season": "2025/26",
  "category": "Senior",
  "gender": "Male"
}
```

### Covers
- TypeORM entity changes only — `synchronize: true` handles schema migration
- SKILL.md update with new fields and computation rules
- Test existing ffbb-extractor test cases to verify season + category added correctly

**Test:** run backend, verify no startup errors; re-run ffbb-extractor on test images, verify `season` and `category` present in output.

### Files created
- `backend/src/shared/team-category.enum.ts`
- `backend/src/shared/gender.enum.ts`

### Files modified
- `backend/src/championship/championship.entity.ts` — added `short_code`, `category`, `gender`
- `backend/src/team/team.entity.ts` — added `category`, `gender`
- `backend/src/venue/venue.entity.ts` — added `name`, made `address` nullable
- `~/.claude/skills/ffbb-extractor/SKILL.md` — added `season`, `category`, `gender` to competition output
- `documentation/database.uml` — updated Championship, Team, Venue; added TeamCategory and Gender enums
- `documentation/plans/score-sheet-db-persistence.md` — updated with gender field

---

## Step 2 — Reference entity upsert services ✅

Create `findOrCreate` methods for all reference entities (no stat rows yet).

### New services / modules
- `ChampionshipService.findOrCreate(name, season, shortCode)`
- `GroupService.findOrCreate(name, championship)`
- `ClubService.findOrCreate(name)`
- `VenueService.findOrCreate(name)`
- `TeamService.findOrCreate(name, suffix, category, club)`
- `OfficerService.findOrCreate(name)`
- `PlayerService.findOrCreate(lastName, firstName, club)`
- `CoachService.findOrCreate(lastName, firstName, club)`

Each service lives in its own module and exports its service.

### Covers
- `findOne` by upsert key → create if not found
- Unit tests for each service (mocked repository)

**Test manually:** POST a score sheet, verify Championship/Club/Team etc. rows appear in DB.

### Files created
- `backend/src/shared/` — already in Step 1
- `backend/src/club/club.service.ts` + `club.module.ts` + `club.service.spec.ts`
- `backend/src/venue/venue.service.ts` + `venue.module.ts` + `venue.service.spec.ts`
- `backend/src/officer/officer.service.ts` + `officer.module.ts` + `officer.service.spec.ts`
- `backend/src/championship/championship.service.ts` + `championship.module.ts` + `championship.service.spec.ts`
- `backend/src/group/group.service.ts` + `group.module.ts` + `group.service.spec.ts`
- `backend/src/team/team.service.ts` + `team.module.ts` + `team.service.spec.ts`
- `backend/src/player/player.service.ts` + `player.module.ts` + `player.service.spec.ts`
- `backend/src/coach/coach.service.ts` + `coach.module.ts` + `coach.service.spec.ts`

### Tests
27/27 passing

---

## Step 3 — Game references persistence ✅

Resolve all reference entities (no DB writes for Game yet).

### New service: `GamePersistenceService` (partial)

```
resolveReferences(data: ExtractionResult): Promise<GameReferences>
```

Returns: `{ championship, group, venue, homeClub, awayClub, homeTeam, awayTeam }`

Flow:
1. Resolve `Championship` (name, season, shortCode, category, gender)
2. Resolve `Group` (game_info.group, championship)
3. Resolve `Venue` (game_info.venue)
4. Resolve `Club` for home and away (from team name)
5. Resolve `Team` home and away (name, suffix, category, gender, club)

### Covers
- `GamePersistenceModule` importing all 5 reference modules
- Unit tests: happy path with all reference entities resolved
- `ScoreSheetService` calls `resolveReferences` after extraction (cache hit and miss); not called on Claude error

**Test manually:** verify Championship, Group, Venue, Club, Team rows appear in DB after POST.

### Files created
- `backend/src/game-persistence/extraction-result.interface.ts`
- `backend/src/game-persistence/game-persistence.service.ts`
- `backend/src/game-persistence/game-persistence.module.ts`
- `backend/src/game-persistence/game-persistence.service.spec.ts`

### Files modified
- `backend/src/score-sheet/score-sheet.service.ts` — inject `GamePersistenceService`, call `resolveReferences` after extraction
- `backend/src/score-sheet/score-sheet.module.ts` — import `GamePersistenceModule`
- `backend/src/score-sheet/score-sheet.service.spec.ts` — mock `GamePersistenceService`, assert call behavior

### Tests
8/8 passing

---

## Step 4 — Game creation + data persistence ✅

Create the Game record and persist all stat rows, officials, and link File — inside a single transaction.

### `GamePersistenceService` (complete)

```
persist(data: ExtractionResult, file: File): Promise<Game>
```

Flow (all DB writes in a single transaction):
1. If the game already exists (same game_number and group_id), delete the existing Game references GameOfficer, PlayerStatRow, CoachStatRow, TeamStatRow so the system re-creates them after. This will help consolidating the logic in time.
2. Create or Update `Game` (game_number, date, time, venue, group, team_a, team_b)
3. Create `GameOfficer` rows (first, second, third referees) — skip null referees
4. Create `PlayerStatRow` rows for home and away
5. Create `CoachStatRow` rows for home and away — skip if coach name is null
6. Create `TeamStatRow` rows (6 per team: team/bench/starters/first_half/second_half/overtime)
7. Link `File.game` to the new game
8. Wrap steps 1–7 in a TypeORM transaction — full rollback on any failure

Helper functions: `parseDate("DD/MM/YY")` → Date, `parseTime("HH:MM")` → minutes from midnight, `parseTimePlayed("MM:SS")` → seconds (0 if null), `parseTimePlayedNullable` → seconds or null.

`ScoreSheetService.extract()` restructured: early return on cache hit, always passes `file` to `persist`.

### Covers
- `DataSource` injection for transaction management
- Date/time parsing from `"DD/MM/YY"` and `"HH:MM"` strings
- Unit tests: new game, existing game (delete+merge), file linking, null officer/coach skipping, error propagation

**Test manually:** POST a score sheet, verify all tables populated; POST same file again, verify rows replaced not duplicated.

### Files modified
- `backend/src/game-persistence/game-persistence.service.ts` — add `persist()`, inject DataSource + OfficerService + PlayerService + CoachService, add parse helpers
- `backend/src/game-persistence/game-persistence.module.ts` — add OfficerModule, PlayerModule, CoachModule imports
- `backend/src/game-persistence/game-persistence.service.spec.ts` — add `persist()` tests
- `backend/src/score-sheet/score-sheet.service.ts` — replace `resolveReferences` with `persist`, early-return restructure
- `backend/src/score-sheet/score-sheet.service.spec.ts` — update mock and assertions for `persist`
- `backend/src/file/file.entity.ts` — fix absolute import path

### Tests
34/34 passing

---

## Decisions recap

| Topic | Decision |
|---|---|
| Entity resolution | Upsert (find-or-create) per entity-specific key |
| Club source | Derived from team name |
| Player/Coach club | Assigned from team's club at upsert time |
| Team category | Nullable for now, fill manually later |
| Season | Nullable for now, not extracted |
| Venue name vs address | Add `name` field, upsert by name; `address` stays nullable |
| Duplicate upload | Skip if `File.game` already set |
| Persistence timing | Synchronous (blocking) |
| Error handling | Full transaction rollback |
