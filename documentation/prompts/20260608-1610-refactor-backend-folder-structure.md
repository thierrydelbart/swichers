# Refactor: backend folder structure reorganization

## What was done

Reorganized `backend/src/` from a flat layout (one folder per entity/service at the root) into three grouped top-level directories:

- `src/entities/` — one subfolder per TypeORM entity (championship, club, coach, coach-stat-row, file, game, game-import, game-officer, group, league, officer, player, player-stat-row, team, team-stat-row, user, venue), each containing its entity, module, service, controller, and spec files
- `src/services/` — cross-entity services: `auth/`, `game-persistence/`, `score-sheet/` (with its `fixtures/` subfolder)
- `src/shared/` — enums and types shared across modules
- `src/config/` — configuration factories (db config)
- `src/migrations/` — TypeORM migration files

## Path aliases added

`backend/tsconfig.json` now declares three path aliases so imports don't need deep relative paths:
- `@entities/*` → `./src/entities/*`
- `@services/*` → `./src/services/*`
- `@shared/*` → `./src/shared/*`

`backend/package.json` jest config updated with matching `moduleNameMapper` entries so Jest resolves these aliases during test runs.

## Other changes

- `app.module.ts` / `app.service.ts` / `data-source.ts` updated to reflect new import paths
- `src/entities/player/player.service.spec.ts`: fixed broken import (`../entities/club/club.entity` → `../club/club.entity`)
- `CLAUDE.md` Architecture section updated to document the new folder structure, path aliases, corrected `synchronize` behavior (true in dev, false in prod), and dynamic CORS via `ALLOWED_ORIGINS` env var

## Why

Flat structure became unwieldy as entity count grew. Grouping into `entities/` and `services/` makes the codebase easier to navigate and mirrors the conceptual separation between data models and cross-cutting business logic.
