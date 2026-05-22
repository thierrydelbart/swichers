# Async score sheet extraction

## Decisions

- **Filename format**: `resume_<league_code>_<championship_code>_<group>_<game_number>_<team_a_name>-<team_a_suffix>_<team_b_name>-<team_b_suffix>.pdf`
  - Spaces replaced by `_` in team names
  - Suffix always present (required assumption to split team_a from team_b)
- **GameImport entity**: staging table created immediately on upload, holds parsed filename fields + status
- **No entity creation before AI**: only `File` and `GameImport` are created upfront; teams/championship/group resolved during AI persistence as before
- **Async worker**: fire-and-forget `Promise` in NestJS — no external queue
- **Duplicate detection**: hash check at upload time → immediate rejection if file already imported
- **Startup recovery**: `AppService.onModuleInit()` re-queues any `pending` GameImports on server restart
- **Retry**: `POST /game-imports/:id/retry` re-triggers extraction on failed imports
- **GameImport lifecycle**: kept after success, `game_id` FK set when Game is created
- **Admin UI**: import list shown between upload form and games list; polls every 5s while pending imports exist; ready rows fade out after a few seconds; "Réessayer" button on failed rows; upload form shows a note about FFBB filename convention

---

## Step 1 — GameImport entity + filename parser ✅

**New files:** `backend/src/game-import/game-import-status.enum.ts`, `backend/src/game-import/game-import.entity.ts`, `backend/src/game-import/game-import.module.ts`, `backend/src/game-import/game-import.service.ts`, `backend/src/game-import/filename-parser.ts`, `backend/src/game-import/filename-parser.spec.ts`

**Modified files:** `backend/src/app.module.ts`, `documentation/database.uml`

### GameImport entity fields
- `id`: PrimaryGeneratedColumn
- `status`: enum `pending | ready | failed`
- `error_message`: varchar nullable
- `filename`: varchar (original filename)
- `league_code`: varchar
- `championship_code`: varchar
- `group_name`: varchar
- `game_number`: varchar
- `team_a_name`: varchar (spaces restored from `_`)
- `team_a_suffix`: varchar nullable
- `team_b_name`: varchar
- `team_b_suffix`: varchar nullable
- `file`: ManyToOne → File (nullable: the file saved to disk)
- `game`: ManyToOne → Game (nullable: set on success)
- `created_at`: timestamp

### Filename parser
- Input: `originalname` string (with `.pdf` extension)
- Output: `{ leagueCode, championshipCode, groupName, gameNumber, teamAName, teamASuffix, teamBName, teamBSuffix }`
- Algorithm:
  1. Strip `.pdf`, split by `_`
  2. Tokens: `[resume, leagueCode, championshipCode, groupName, gameNumber, ...teamParts]`
  3. Find split between team_a and team_b: scan left-to-right accumulating tokens; team_a ends when current accumulated string ends with `-<digits>`
  4. Split each team string on last `-` to extract name and suffix
  5. Replace remaining `_` with spaces in team names
- Unit tests covering: standard case, multi-word team names, missing suffix fallback

### GameImportService
- `create(data)`: save a new GameImport
- `updateStatus(id, status, opts?: { errorMessage?, gameId? })`: update status
- `findAllPending()`: for startup recovery
- `findAll()`: for list endpoint (later)

---

## Step 2 — Async extraction flow + retry ✅

**Modified files:** `backend/src/score-sheet/score-sheet.service.ts`, `backend/src/score-sheet/score-sheet.service.spec.ts`, `backend/src/score-sheet/score-sheet.controller.ts`, `backend/src/score-sheet/score-sheet.module.ts`, `backend/src/game-import/game-import.service.ts`, `backend/src/app.service.ts`

**New files:** `backend/src/game-import/game-import.controller.ts`

Note: `GameImportController` lives in `ScoreSheetModule` (not `GameImportModule`) to avoid circular dependency.

### Upload flow (ScoreSheetService.extract)
1. Parse filename → get parsed fields (throw `BadRequestException` if format invalid)
2. Check hash → if duplicate, throw `BadRequestException('Ce fichier a déjà été importé')`
3. Save file to disk (`FileService.persist`)
4. Create `GameImport` with `status: pending` and parsed fields
5. Return `{ import_id: gameImport.id }` immediately (HTTP 202)
6. Fire-and-forget: call `this.runExtraction(gameImport.id, buffer, file)`

### runExtraction(importId, buffer, file) — private async method
1. Set `extracted_at` to `new Date()` on the `GameImport`
2. Convert PDF → JPEG
3. Call Claude API
4. Call `GamePersistenceService.persist(extractedData, file)`
5. Update `GameImport` status to `ready`, set `game_id`
6. On any error: update `GameImport` status to `failed`, set `error_message`

### Retry endpoint
- `POST /game-imports/:id/retry` — protected by `JwtAuthGuard`
- Load `GameImport`, 404 if not found, 400 if not `failed`
- Re-read file from disk using `File.location`
- Fire-and-forget `runExtraction`
- Return 202

### Startup recovery (AppService.onModuleInit)
- Query all `GameImport` with `status: pending`
- For each: re-read file from disk, fire-and-forget `runExtraction`

---

## Step 2b — Re-upload of failed import triggers re-extraction

**Modified files:** `backend/src/game-import/game-import.service.ts`, `backend/src/score-sheet/score-sheet.service.ts`, `backend/src/score-sheet/score-sheet.service.spec.ts`

### GameImportService — add `findLatestByFile(fileId)`
- Query `GameImport` where `file.id = fileId`, order by `created_at DESC`, return first or null

### ScoreSheetService.extract() — update duplicate check
Replace the current hard rejection with:
- If file exists and latest `GameImport` has `status: failed` → reset to `pending`, re-read buffer from disk, fire-and-forget `runExtraction`, return `{ import_id }`
- Otherwise (pending, ready, or no GameImport) → throw `BadRequestException('Ce fichier a déjà été importé')`

### New tests
- Re-upload of failed import → returns `{ import_id }`, triggers extraction
- Re-upload of pending import → throws 400
- Re-upload of ready import → throws 400

---

## Step 3 — Admin import list (backend + frontend) ✅

**New files:** `documentation/patterns.md`

**Modified files:** `backend/src/game-import/game-import.controller.ts`, `backend/src/game-import/game-import.entity.ts`, `backend/src/game-import/game-import.service.ts`, `backend/src/score-sheet/score-sheet.service.ts`, `frontend/src/pages/Admin.tsx`

### Rename `extracted_at` → `extraction_started_at`
- Rename the column on `GameImport` entity
- Update `ScoreSheetService.runExtraction` to set `extraction_started_at` at step 1 (start of extraction, before PDF conversion)

Note : this sub-step has been added directly to step 3 because step 1 and 2 were already implemented

### GET /game-imports
- Public (or protected — TBD)
- Returns all imports ordered by `created_at DESC`
- Each row: `{ id, status, error_message, filename, team_a_name, team_a_suffix, team_b_name, team_b_suffix, game_id, created_at, extraction_started_at }`

### Frontend — ImportsSection component
- Sits between upload form and games list
- Only renders if at least one import exists
- Polls `GET /game-imports` every 5s **only while at least one import has `status: pending`**
- Table columns: Teams (team_a vs team_b), Status badge (pending=spinner, ready=green, failed=red), Extraction started at (date + time, blank if never started), Error message (if failed), Actions
- Actions per row:
  - `ready`: link → `/games/:game_id`
  - `failed`: "Réessayer" button → `POST /game-imports/:id/retry`
- Ready rows fade out after 3s (CSS transition + `setTimeout` removal from list)

### Upload form addition
- Small note below the file input: "Le fichier doit être le résumé de match officiel FFBB (format : `resume_<code>_…pdf`)"

---

## Resolved

- `GET /game-imports` protected by `JwtAuthGuard`
- Upload endpoint returns HTTP 202
