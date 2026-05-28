# Backend Deployment on Railway

## Context

Deploy the NestJS backend to Railway. Frontend already live at https://swichers.vercel.app/.
See `documentation/hosting-research.md` for why Railway was chosen over Fly.io, Scaleway, and Render.

## Decisions

- **Platform**: Railway (eu-west region)
- **Database**: Railway Managed Postgres (same project, injects `DATABASE_URL`)
- **File storage**: Railway Volume mounted at `/app/uploads`
- **Deploy branch**: `prod` (both frontend and backend)
- **TypeORM**: `synchronize: false` in prod, initial migration run on startup
- **Dockerfile**: `backend/Dockerfile` with Node 20 + poppler-utils
- **Health check**: `GET /health` returns `{ status: 'ok' }`

---

## Step 1 — Prep backend for production

- Add `GET /health` endpoint (lightweight, no DB call)
- Disable `synchronize` when `NODE_ENV=production`, add TypeORM CLI migration scripts, generate initial migration from current entities
- Write Dockerfile (multi-stage, Node 20 + poppler-utils) with start command `npm run migration:run && node dist/main`

**Files modified:**
- `backend/src/app.controller.ts`
- `backend/src/app.module.ts`
- `backend/package.json` ← add `migration:generate` and `migration:run` scripts

**Files created:**
- `backend/src/migrations/` ← generated initial migration file
- `backend/Dockerfile`
- `backend/.dockerignore`

---

## Step 2 — Railway project setup (manual)

Manual steps in Railway UI + CLI:

1. Create Railway account and install CLI: `npm install -g @railway/cli && railway login`
2. Create new project in Railway dashboard
3. Add **PostgreSQL** service to the project
4. Add **Volume** (1GB) mounted at `/app/uploads` on the backend service
5. Set environment variables on the backend service:
   - `NODE_ENV=production`
   - `ANTHROPIC_API_KEY=...`
   - `ADMIN_PASSWORD_HASH=...`
   - `JWT_SECRET=...`
   - `UPLOAD_DIR=/app/uploads`
   - `ALLOWED_ORIGINS=https://swichers.vercel.app,*.vercel.app`
   - `DATABASE_URL` is injected automatically by Railway from the Postgres service
6. Set deploy branch to `prod`, root directory to `backend/`
7. Deploy

---

## Step 3 — Wire frontend to prod backend

Once Railway gives a public URL (e.g. `https://swichers-backend.up.railway.app`):

1. Set `VITE_API_URL` in Vercel to the Railway URL
2. Update `ALLOWED_ORIGINS` on Railway to include the exact Vercel prod URL
3. Update `documentation/plans/frontend-vercel-deploy.md` with final URLs

**Files modified:**
- `documentation/plans/frontend-vercel-deploy.md`

---

## Unresolved questions

- None — all decisions resolved.
