# Clap Clap Info

## Context

Replace the current home page with a sports-news-style front page showing recent game articles per club. The layout (see `documentation/mockups/mockup-home.html`) has a team strip at the top, a hero article + quick news sidebar, and a 2-column article grid below.

## Decisions

- Feed only shows games where `blog_title IS NOT NULL`
- Team strip filter: filters by team participation (team_a or team_b)
- `GET /clubs/:id` returns club name + all teams with W/L records (one round trip)
- `GET /clubs/:id/news?teamId=X` returns the news feed, optionally filtered by team
- Frontend route `/club/:id` → `Club.tsx`; home (`/`) redirects to `/club/1`
- W/L: win = club's team scored more (whether team_a or team_b); only games with non-null scores counted
- `blog_content` truncated client-side in the hero
- "Lire la suite →" links to existing `/games/:id` page (game page improvements deferred)

---

## Step 1 — Club info + team strip ✅

Backend `GET /clubs/:id` + frontend page scaffold with team strip.

**Backend**
- `ClubService.findById(id)`: fetch club + all its teams, compute wins/losses per team from games with non-null scores
- `ClubController` with `GET /clubs/:id`
- Register controller in `ClubModule`; import `TypeOrmModule.forFeature([Team, Game])` in `ClubModule`

Response shape:
```json
{
  "id": 1,
  "name": "CLAPIERS BASKET BALL",
  "teams": [
    { "id": 6, "name": "Senior Masc. 1", "category": "Senior", "gender": "Male", "wins": 8, "losses": 3 }
  ]
}
```

**Frontend**
- `Club.tsx`: fetches `GET /clubs/:id`, renders page header ("Clap Clap Info") + team strip with W/L chips; "Toutes les équipes" tab selected by default
- Add `/club/:id` route to the router
- `Home.tsx`: redirect to `/club/1`

**Files created/modified:**
- `backend/src/entities/club/club.service.ts` ✅
- `backend/src/entities/club/club.controller.ts` ← new ✅
- `backend/src/entities/club/club.module.ts` ✅
- `backend/src/entities/club/club.service.spec.ts` ✅
- `backend/src/app.module.ts` ✅
- `frontend/src/pages/Club.tsx` ← new ✅
- `frontend/src/App.tsx` ✅
- `frontend/src/pages/Home.tsx` ✅

---

## Step 2 — News feed ✅

Backend `GET /clubs/:id/news` + full article layout in `Club.tsx`.

**Backend**
- `ClubService.findNews(clubId, teamId?)`: query games where:
  - `blog_title IS NOT NULL`
  - team_a or team_b belongs to the club (if `teamId` provided, filter to that team)
  - ordered by `day DESC`, limit 20
- Add `GET /clubs/:id/news?teamId=X` to `ClubController`
- `GET /config` in `AppController` returns `{ defaultClubId }` from `DEFAULT_CLUB_ID` env var
- `DEFAULT_CLUB_ID` added to `backend/.env` and `.env.example`

**Frontend**
- `Club.tsx`: on mount + on team chip click, fetch `GET /clubs/:id/news?teamId=X`
- Render:
  - **Hero**: first article — championship badge, date, score, teams, `blog_title` (h2), `blog_content` excerpt, "Lire la suite →" link to `/games/:id`
  - **Quick news sidebar**: articles 2–4 — date, championship badge, truncated `blog_title`
  - **2-column grid**: articles 5–7 (max 3) — championship badge, teams, score, W/L badge, `blog_title`
- W/L badge: compare score_a/score_b against whether the club's team is team_a or team_b
- `ConfigContext.tsx` + `useConfig.ts`: fetch `/config` on app start, expose `defaultClubId`
- `Home.tsx`: reads `defaultClubId` from `useConfig()`

**Files created/modified:**
- `backend/src/entities/club/club.service.ts` ✅
- `backend/src/entities/club/club.controller.ts` ✅
- `backend/src/app.controller.ts` ✅
- `backend/src/app.controller.spec.ts` ✅
- `backend/.env` ✅
- `backend/.env.example` ✅
- `frontend/src/pages/Club.tsx` ✅
- `frontend/src/pages/Home.tsx` ✅
- `frontend/src/contexts/ConfigContext.tsx` ← new ✅
- `frontend/src/contexts/useConfig.ts` ← new ✅
