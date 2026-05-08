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

## Step 1 — Entity schema updates + ffbb-extractor skill updates

Update existing entities to match extraction data, add missing fields. Update the ffbb-extractor skill to extract season and category.

### Entity changes
- `Championship`: add `short_code` (varchar 10, nullable), add `category` (nullable enum: U5–U21, Senior)
- `Team`: add `category` (nullable enum: U5–U21, Senior)
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

Updated `competition` output shape:
```json
"competition": {
  "name": "Pré régionale masculine",
  "short_code": "PRM",
  "season": "2025/26",
  "category": "Senior"
}
```

### Covers
- TypeORM entity changes only — `synchronize: true` handles schema migration
- SKILL.md update with new fields and computation rules
- Test existing ffbb-extractor test cases to verify season + category added correctly

**Test:** run backend, verify no startup errors; re-run ffbb-extractor on test images, verify `season` and `category` present in output.

---

## Step 2 — Reference entity upsert services

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

---

## Step 3 — Game persistence service

Orchestrate the full import from extracted JSON to DB records inside a single transaction.

### New service: `GamePersistenceService`

```
persist(data: ExtractionResult, file: File): Promise<Game>
```

Flow:
1. Resolve `Championship` (name, season=null, shortCode)
2. Resolve `Group` (game_info.group, championship)
3. Resolve `Venue` (game_info.venue)
4. Resolve `Club` for home and away (from team name)
5. Resolve `Team` home and away (name, suffix, category=null, club)
6. Create `Game` (game_number, date, time, venue, group, team_a, team_b)
7. Resolve `Officer`s and create `GameOfficer` rows (first, second, third referees)
8. Resolve `Player`s and create `PlayerStatRow` rows for home and away
9. Resolve `Coach`s and create `CoachStatRow` rows for home and away
10. Create `TeamStatRow` rows (6 per team: team/bench/starters/first_half/second_half/overtime)
11. Link `File.game` to the new game
12. Wrap steps 6–11 in a TypeORM transaction — full rollback on any failure

### Covers
- `DataSource` injection for transaction management
- Unit tests: happy path, transaction rollback on DB error
- All stat row types covered

**Test manually:** POST a score sheet, verify all tables populated; POST same file again, verify no duplicate game created.

---

## Step 4 — Wire into ScoreSheetService

Inject `GamePersistenceService` into `ScoreSheetService` and call it after a successful extraction.

### Skip logic
- After Claude extraction, check `file.game` — if already set, skip persistence (file was previously processed)
- This applies to both cache hits (extractedData already set) and fresh extractions where the game was somehow already linked

### Changes
- `ScoreSheetService.extract()` calls `gamePersistenceService.persist(result, file)` after `updateExtractedData`
- `ScoreSheetModule` imports `GamePersistenceModule`
- Integration test: mock `GamePersistenceService`, assert it's called on fresh upload and skipped on cache hit

**Test manually:** full end-to-end — upload FFBB JPEG, verify JSON displayed in UI and all DB tables populated.

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
