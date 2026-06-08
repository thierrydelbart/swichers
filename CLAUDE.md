# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rule n°1

Ask before modifying the code

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
- TypeORM `synchronize: true` in dev, `false` in prod — prod uses migrations (`src/migrations/`)
- Initial seed happens in `AppService.onModuleInit()`
- CORS driven by `ALLOWED_ORIGINS` env var (comma-separated, supports `*.domain` wildcards)
- NestJS module pattern: every entity whose repository is injected via `@InjectRepository(X)` in a service must be listed in `TypeOrmModule.forFeature([X])` in that module — missing entries cause a runtime injection error

`src/` folder structure:
- `entities/` — one subfolder per entity, each with its module/service/entity/controller files; aliased as `@entities/*`
- `services/` — cross-entity services (`auth/`, `game-persistence/`, `score-sheet/`); aliased as `@services/*`
- `shared/` — enums and types shared across modules; aliased as `@shared/*`
- `config/` — configuration factories (db, etc.)
- `migrations/` — TypeORM migration files

**`frontend/`** — React 19, Vite 8, port 5173
- Path alias `@` resolves to `./src`
- Tailwind v4 loaded via `@tailwindcss/vite` plugin (no `tailwind.config.js`)
- shadcn uses the `base-nova` style built on `@base-ui/react`; components live in `src/components/ui/`
- `cn()` helper in `src/lib/utils.ts` combines `clsx` and `tailwind-merge`


## Testing conventions

- In spec files, suppress `@typescript-eslint/no-unsafe-member-access` at the file top (`/* eslint-disable @typescript-eslint/no-unsafe-member-access */`) when accessing properties on `result: any` — not per-line, not the whole file with `/* eslint-disable */`

## Skills

Custom skills are in `.claude/skills/`. Invoke them by name when the trigger matches:

| Skill | Trigger |
|---|---|
| `ship-it` | "ship it", "ready to merge", "finalize the PR" — runs tests/lint, creates prompt file, commits and pushes |
| `plannify` | "plan this", "break this down", "create a roadmap" — plans a feature end-to-end with steps and file lists |
| `deep-dive` | "dive into", "deep dive", "stress-test this plan" — interviews relentlessly until shared understanding is reached |
| `refactor` | "refactor X" — analyzes and refactors a file or directory |
| `commit` | explicit commit request — crafts and validates a commit message |

## Development cycle

Always follow this cycle for new features:
1. `deep-dive` — interview until full understanding
2. `plannify` — break into steps with file lists
3. Code — one step at a time, ask before each
4. `ship-it` — final tests, prompt file, commit following `commit` skill guidelines

## Documentation

- Database : `documentation/database.uml` is an up to date uml file of the database
- Plans : all major features are documented in step by step plans located in `documentation/plans/`. Adicional info are added when each steps are done. Developed features should be moved in `documentation/plans/done`.
- Prompts : for all major commits, there's a prompt file that describe in details what have been done. All those messages are in `documentation/prompts`