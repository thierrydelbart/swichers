# Player entity: search_key + merged_into (Step 1/3 — team-player-admin)

## Context

Swichers stores basketball players per club. The `findOrCreate` method previously did exact string matching, causing duplicate player records when names were imported with different casing or accents from FFBB score sheets.

## Changes

### Player entity (`player.entity.ts`)
- Add `search_key` column (`varchar(101)`, nullable, indexed): stores a normalized form of `last_name + ' ' + first_name`
- Add `merged_into` column: nullable `ManyToOne` self-reference to `Player` — set on absorbed players after a merge operation

### PlayerService (`player.service.ts`)
- Add `normalizeKey(lastName, firstName): string`:
  - Replaces `-`, `'` (U+0027), `'` (U+2018), `'` (U+2019) with space
  - Strips diacritics via NFD decomposition + Diacritic unicode property removal
  - Lowercases, trims, collapses multiple spaces
- Update `findOrCreate` to query on `search_key` instead of exact `last_name`/`first_name` match; follows `merged_into` one level to return the survivor player
- Add `onModuleInit` to backfill `search_key` for existing players with null/empty value

### Tests (`player.service.spec.ts`)
- Add mock for `find` (needed by `onModuleInit`)
- Add `normalizeKey` test suite: accents, case, hyphens, straight/curly apostrophes, multiple-space collapse
- Update `findOrCreate` tests to include `search_key` and `merged_into` on mock objects
- Add cases: case-insensitive lookup, accent-insensitive lookup, `merged_into` chain resolution, `search_key` populated on create

### Database UML (`documentation/database.uml`)
- Add `search_key` and `merged_into` fields to Player class
- Add `Player --> Player : merged_into` relationship

## Reasoning

- `search_key` approach (vs PostgreSQL `unaccent` extension): no DB extension to manage, works with `synchronize: true`, easier to test
- Indexed column avoids loading all club players into memory for normalization (clubs can have up to ~500 players)
- `onModuleInit` backfill: safe one-time migration on server start for existing records
- `merged_into` on the absorbed player (not the survivor): allows `findOrCreate` to follow the link and transparently return the survivor on future imports
