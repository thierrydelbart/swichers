# Backend Railway Deployment Prep

## What was done

Prepared the NestJS backend for production deployment on Railway.

### 1. Health endpoint (`backend/src/app.controller.ts`)
Added `GET /health` returning `{ status: 'ok' }` — no DB call, used by Railway to verify the app is up.

### 2. Centralized DB config (`backend/src/config/db.config.ts`)
Single `buildDbConnection(env)` function computes `{ isProd, connection }` from environment variables. Handles two cases:
- `DATABASE_URL` set (Railway injects this from its Postgres service) → uses url + SSL in prod
- Individual vars (`DATABASE_HOST`, `DATABASE_PORT`, etc.) → used in local dev

### 3. TypeORM prod config (`backend/src/app.module.ts`)
- Uses `buildDbConnection(process.env)` — no more `ConfigService` injection needed in the factory
- `synchronize: !isProd` — auto-schema sync disabled in production
- `migrations: ['dist/migrations/*.js']` registered

### 4. TypeORM CLI data source (`backend/src/data-source.ts`)
Standalone data source for the TypeORM CLI (`migration:generate`, `migration:run`). Uses `dotenv` to load `.env` in dev, same `buildDbConnection` logic, correct migrations glob per environment.

### 5. Migration scripts (`backend/package.json`)
Added `migration:generate`, `migration:run`, `migration:revert` scripts using `typeorm-ts-node-commonjs` for dev and compiled JS for prod.

### 6. Initial migration (`backend/src/migrations/1780049361636-InitialSchema.ts`)
Generated from current entity state against an empty database. Creates all tables on first deploy.

### 7. Dockerfile (`backend/Dockerfile`)
Multi-stage build:
- Stage 1 (builder): installs all deps, compiles TypeScript via `nest build`
- Stage 2 (production): `node:20-slim` + `poppler-utils` (for PDF→image via `pdftoppm`), production deps only
- Start command: `npm run migration:run && node dist/main.js`

### 8. `.dockerignore` (`backend/.dockerignore`)
Excludes `node_modules`, `dist`, `.env`, `uploads`, `coverage`.

## Key decisions

- `DATABASE_URL` takes precedence over individual vars — Railway injects it automatically
- SSL enabled only in production (`rejectUnauthorized: false` for Railway's self-signed cert)
- `synchronize: false` in prod prevents accidental column drops
- Migrations run automatically before app start in Docker CMD
- `poppler-utils` installed via apt in the production image (required by `pdftoppm` used in score-sheet extraction)
