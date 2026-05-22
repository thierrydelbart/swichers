# Player merge feature (Step 3/3 — team-player-admin)

## Context

Completes the team player admin feature. Admins can now select 2+ players on the Team page and merge them into one: all stat rows are relinked to the survivor, and absorbed players get a `merged_into` FK so future imports resolve to the survivor instead of creating duplicates.

## Changes

### Backend

**PlayerService — `merge(survivorId, absorbedIds[], lastName, firstName)`** (`player.service.ts`)
- Loads survivor with club relation, 404 if not found
- Loads all absorbed players with club relation, 404 if any not found
- Validates all absorbed players share the survivor's club — throws `BadRequestException` if not
- Renames survivor (updates `last_name`, `first_name`, `search_key`)
- For each absorbed player: relinks all `PlayerStatRow` rows via `createQueryBuilder().update().set({ player: survivor }).where('player_id = :id')`, then sets `merged_into = survivor` on the absorbed player
- 4 new tests: success path, survivor 404, absorbed 404, different-club rejection

**PlayerController** (`player.controller.ts`)
- `POST /players/merge` — accepts `{ survivor_id, absorbed_ids[], last_name, first_name }`, JWT-protected

**PlayerModule** (`player.module.ts`)
- Adds `PlayerStatRow` to `TypeOrmModule.forFeature([Player, PlayerStatRow])` so the service can inject its repository

**tsconfig.json**
- Added `"types": ["jest", "node"]` — fixes TypeScript language server not recognizing Jest globals when `module: nodenext` is set. `typeRoots` alone is insufficient with nodenext module resolution; explicit `types` array is required.

### Frontend

**Team page** (`Team.tsx`)
- `PlayerAdminPanel` extended for merge mode (`selected.length > 1`):
  - Heading switches to "Fusionner les joueurs"
  - Name inputs still pre-fill from first selected player (the survivor)
  - Absorbed players listed below with label "Fusionné avec ↑"
  - Action button switches to "Fusionner" → `POST /players/merge`
- Panel render condition changed from `=== 1` to `>= 1` to show for both modes

## Reasoning

- `createQueryBuilder` for PSR relink: safer than `repo.update()` with relation objects under `nodenext` module resolution
- Club validation on the server: frontend only shows players from one team's club, but API should never trust that assumption
- `merged_into` kept on absorbed player (not deleted): allows `findOrCreate` to follow the link on future imports
