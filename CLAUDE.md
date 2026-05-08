# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project purpose

Swichers est une plateforme communautaire dédiée aux championnats amateurs de basketball de la FFBB (Fédération Française de Basketball). Les membres peuvent uploader les PDFs de statistiques officiels émis par la FFBB ; la plateforme en extrait les données et les expose aux visiteurs.

## Development setup

Start PostgreSQL first (required before running the backend):
```bash
docker-compose up -d
```

Then from the repo root:
```bash
npm run install:all   # install dependencies in both projects
npm run dev:backend   # NestJS watch mode → http://localhost:3001
npm run dev:frontend  # Vite dev server   → http://localhost:5173
```

Builds:
```bash
npm run build:backend
npm run build:frontend
```

## Backend commands (run from `backend/`)

```bash
npm test              # Jest unit tests
npm run test:e2e      # e2e tests (config: test/jest-e2e.json)
npm run test:cov      # coverage report
npm run lint          # ESLint --fix
```

## Frontend commands (run from `frontend/`)

```bash
npm run lint                             # ESLint
npx shadcn@latest add <component>        # add a shadcn component
```

## UX Design

When building or modifying any frontend UI, follow the guidelines defined in `DESIGN.md` at the repo root.

## Architecture

Monorepo with two independent packages sharing no build tooling:

**`backend/`** — NestJS 11, TypeScript, port 3001
- Single `AppModule` wires `ConfigModule` (global), `TypeOrmModule`, and the root controller/service
- Database config read from `backend/.env` (`DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`)
- TypeORM runs with `synchronize: true` in dev — no manual migrations needed
- Initial seed happens in `AppService.onModuleInit()`
- CORS is restricted to `http://localhost:5173`

**`frontend/`** — React 19, Vite 8, port 5173
- Path alias `@` resolves to `./src`
- Tailwind v4 loaded via `@tailwindcss/vite` plugin (no `tailwind.config.js`)
- shadcn uses the `base-nova` style built on `@base-ui/react`; components live in `src/components/ui/`
- `cn()` helper in `src/lib/utils.ts` combines `clsx` and `tailwind-merge`


## Documentation

- Database : `documentation/database.uml` is an up to date uml file of the database
- Plans : all major features are documented in step by step plans located in `documentation/plans/`. Adicional info are added when each steps are done.
- Prompts : for all major commits, there's a prompt file that describe in details what have been done. All those messages are in `documentation/prompts`