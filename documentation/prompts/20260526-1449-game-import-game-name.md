# Replace team_a/team_b fields with game_name in GameImport

## Context

The `GameImport` entity previously stored team data parsed from the filename using a complex
heuristic (finding the boundary between team A and team B by detecting a `-<digits>` suffix).
This logic was brittle: many real FFBB filenames don't follow the assumed pattern, and the
team name/suffix split added complexity without benefit since team resolution happens later
during AI extraction and game persistence.

## Changes

Replace the four team columns (`team_a_name`, `team_a_suffix`, `team_b_name`, `team_b_suffix`)
and their associated parsing logic with a single `game_name` field that stores the raw filename
suffix (everything after `resume_{league}_{championship}_{group}_{game_number}_`), or null if
no suffix is present.

### filename-parser.ts
- `ParsedFilename` interface: removed `teamAName`, `teamASuffix`, `teamBName`, `teamBSuffix`; added `gameName: string | null`
- `parseFilename`: simplified to split on `_`, take the first 5 tokens as fixed fields, join the rest back as `gameName` (null if empty)
- Removed `splitTeam` helper and the team boundary detection loop
- Minimum token count reduced from 7 to 5 (filenames without team part are now valid)

### game-import.entity.ts
- Removed columns: `team_a_name varchar(100)`, `team_a_suffix varchar(10) nullable`, `team_b_name varchar(100)`, `team_b_suffix varchar(10) nullable`
- Added column: `game_name varchar(256) nullable`

### game-import.service.ts
- `create()`: replaced 4 team field assignments with `game_name: parsed.gameName`

### filename-parser.spec.ts
- Rewrote all tests to assert on `gameName` instead of team fields
- Added test for filename without team part (expects `gameName: null`)
- Removed tests that asserted errors on missing team_b (no longer an error case)

### score-sheet.service.spec.ts
- Updated `expect.objectContaining(...)` assertion to match new `gameName` field

### Admin.tsx
- `GameImportItem` interface: removed 4 team fields, added `game_name: string | null`
- Import row display: replaced `teamA vs teamB` with `game_name.replace(/_/g, ' ')` (or `—` if null)

## Reasoning

- FFBB filenames in practice don't always have two teams with numeric suffixes; forcing a parse threw errors on valid files
- The team data from the filename is redundant — the AI extracts team info from the image
- Single `game_name` field is simpler, always parseable, and preserves the full context from the filename
