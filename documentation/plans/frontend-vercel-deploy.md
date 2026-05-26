# Frontend Deployment on Vercel

## Context

Deploy the React/Vite frontend to Vercel. Backend will be on Fly.io (separate plan).

## Decisions

- Vercel default subdomain (no custom domain for now)
- Preview deployments enabled on all branches
- All environments (preview + prod) point to the same prod backend on Fly.io
- Backend CORS must allow prod Vercel URL + `*.vercel.app` wildcard
- `VITE_API_URL` env var set in Vercel UI (not hardcoded)
- Vercel root dir set to `frontend/`

---

## Step 1 — Fix and centralize API base URL ✅

**Why:** `import.meta.env.API_URL` is a bug (Vite requires `VITE_` prefix). The URL is also duplicated in 6 files.

**Files modified:**
- `frontend/src/lib/api.ts` ← new, exports `API_BASE_URL`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/pages/Home.tsx`
- `frontend/src/pages/Game.tsx`
- `frontend/src/pages/Team.tsx`
- `frontend/src/pages/Upload.tsx`
- `frontend/src/pages/Admin.tsx`

---

## Step 2 — Add vercel.json for SPA routing ✅

**Why:** Vercel serves static files — direct access to `/games/123` returns 404 without a catch-all rewrite to `index.html`.

**Files created:**
- `frontend/vercel.json`

---

## Step 3 — Update backend CORS ✅

**Why:** Backend currently only allows `http://localhost:5173`. Prod and preview Vercel URLs will be blocked.

Allow:
- Production Vercel URL (e.g. `https://swichers.vercel.app`)
- `*.vercel.app` wildcard for preview deployments

**Files modified:**
- `backend/src/main.ts`
- `backend/.env.example` ← document new `ALLOWED_ORIGINS` env var

---

## Step 4 — Vercel project setup (manual)

Manual steps in Vercel UI — no code changes:

1. Create new project → import GitHub repo
2. Set **Root Directory** to `frontend/`
3. Framework preset: **Vite** (auto-detected)
4. Add env var: `VITE_API_URL` = `https://<fly-io-backend-url>` for Production and Preview environments
5. Deploy

---

## Unresolved questions

- What is the Fly.io backend URL? (needed for `VITE_API_URL` and CORS allowlist — can use placeholder until backend is deployed)
