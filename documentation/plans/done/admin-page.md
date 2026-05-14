# Admin page

## Decisions

- Auth: `POST /auth/login` verifies bcrypt password from `.env`, returns JWT stored in `sessionStorage`
- Score: add `score_a`/`score_b` columns to `Game`, populated at import time
- Route: `/upload` → `/admin`
- Nav: no link when unauthenticated; "Admin" button when authenticated
- File view: `GET /files/:id` public endpoint streaming PDF from disk
- Per-game actions: view file (new tab) + delete game+file (transaction)
- Games list: server-side search by team name, 20/page, sorted by date desc
- Game list + delete moved to `GameModule`/`GameService`/`GameController` (no separate AdminModule)
- `GET /games` decorated with `@SkipThrottle()` to support debounced search without hitting throttle limit

---

## Step 1 — Game entity: add score columns ✅

**Files modified:** `backend/src/game/game.entity.ts`, `backend/src/game-persistence/game-persistence.service.ts`, `backend/src/team/team.service.ts`, `backend/src/team/team.service.spec.ts`

- Added `score_a: number` and `score_b: number` (`@Column({ type: 'int', nullable: true })`) to `Game`
- `GamePersistenceService.persist()` now sets `score_a`/`score_b` from team totals
- `TeamService.findOne()` derives points/points_against/win directly from `score_a`/`score_b`

---

## Step 2 — Public file endpoint + game page link ✅

**Files created:** `backend/src/file/file.controller.ts`

**Files modified:** `backend/src/file/file.service.ts`, `backend/src/file/file.module.ts`, `backend/src/game/game.service.ts`, `frontend/src/pages/Game.tsx`, `frontend/src/components/game/types.ts`

- `FileService.findById(id)` added
- `GET /files/:id` streams PDF via `fs.createReadStream().pipe(res)`
- `GameService.findOne()` includes `file_id` from secondary File repo query
- `Game.tsx` renders "Voir le PDF →" link when `file_id` non-null

---

## Step 3 — Auth: backend + frontend ✅

**Files created:** `backend/src/auth/auth.module.ts`, `backend/src/auth/auth.controller.ts`, `backend/src/auth/auth.service.ts`, `backend/src/auth/jwt-auth.guard.ts`, `frontend/src/contexts/AuthContext.tsx`, `frontend/src/contexts/useAuth.ts`

**Files modified:** `backend/src/app.module.ts`, `backend/src/score-sheet/score-sheet.controller.ts`, `backend/.env`, `frontend/src/App.tsx`

- JWT-based auth with bcrypt password comparison
- `JwtAuthGuard` for protected routes
- `AuthProvider` + `useAuth` hook in frontend
- `POST /score-sheet/extract` protected

---

## Step 4 — Frontend: Admin page (login + upload) + nav ✅

**Files created:** `frontend/src/pages/Admin.tsx`

**Files modified:** `frontend/src/App.tsx`, `frontend/src/components/Layout.tsx`

- `/upload` → `/admin`
- Login form when unauthenticated; upload section when authenticated
- Nav shows "Admin" link only when `token !== null`

---

## Step 5 — Admin games list ✅

**Files modified:** `backend/src/game/game.service.ts`, `backend/src/game/game.controller.ts`, `backend/src/game/game.module.ts`, `frontend/src/pages/Admin.tsx`

- `GameService.list(search, page)`: paginated + searchable, secondary file query for file_ids
- `GET /games` with `@SkipThrottle()` for debounced search
- Frontend: debounced search input, games table with links, PDF button, pagination

---

## Step 6 — Admin delete game ✅

**Files modified:** `backend/src/game/game.service.ts`, `backend/src/game/game.controller.ts`, `frontend/src/pages/Admin.tsx`

- `GameService.delete(id)` transactional cascade: GameOfficer → PlayerStatRow → CoachStatRow → TeamStatRow → File (DB + disk) → Game
- `DELETE /games/:id` protected by `JwtAuthGuard`
- Frontend: "Supprimer" button + confirmation modal

---

## Mock-up

Layout validated in `documentation/mockups/admin-page.html`.

- Login screen: password card, error state
- Authenticated: upload section on top, games list below (search + table + pagination + delete modal)
- Nav: "Admin" button visible only when authenticated
