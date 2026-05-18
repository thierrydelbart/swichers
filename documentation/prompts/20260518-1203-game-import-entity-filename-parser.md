# GameImport entity + filename parser (async-score-sheet-extraction step 1)

## Context

First step toward async score sheet extraction. Instead of blocking the admin on the Claude API call, the upload creates a `GameImport` staging record immediately, then runs extraction in the background. This step sets up the foundation: the entity and the filename parser.

## Changes

### New module: `backend/src/game-import/`

**`game-import-status.enum.ts`**
- Enum: `pending | ready | failed`

**`game-import.entity.ts`**
- Staging table for score sheet imports
- Parsed filename fields: `league_code`, `championship_code`, `group_name`, `game_number`, `team_a_name`, `team_a_suffix`, `team_b_name`, `team_b_suffix`
- Status + `error_message` (nullable)
- `file` ManyToOne → File (nullable), `game` ManyToOne → Game (nullable, set on success)
- `created_at` (CreateDateColumn), `updated_at` (UpdateDateColumn), `extracted_at` (nullable timestamptz, set each time extraction runs)

**`filename-parser.ts`**
- Parses FFBB filename format: `resume_<league_code>_<championship_code>_<group>_<game_number>_<team_a>-<suffix>_<team_b>-<suffix>.pdf`
- Team boundary detection: accumulate `_`-split tokens until string ends with `-\d+`
- Suffix always assumed present (required to split team_a from team_b)
- Spaces restored by replacing `_` with ` ` in team names

**`filename-parser.spec.ts`**
- 7 tests: multi-word names, single-word names, dashes in championship code, suffix 0, case-insensitive extension, invalid prefix, missing team_b

**`game-import.service.ts`**
- `create(filename, parsed, file)`: save new GameImport
- `updateStatus(id, status, opts?)`: update status + error_message + game relation
- `findAllPending()`: for startup recovery (step 2)
- `findAll()`: for list endpoint (step 3)

**`game-import.module.ts`**
- Exports `GameImportService`

### Modified files
- `backend/src/app.module.ts`: add `GameImport` entity + import `GameImportModule`
- `documentation/database.uml`: add `GameImport` class + relations
- `documentation/plans/async-score-sheet-extraction.md`: step 1 marked ✅, extracted_at noted in step 2
