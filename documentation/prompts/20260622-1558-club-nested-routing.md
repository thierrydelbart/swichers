# Club nested routing + ClubMenu + news by category

## What was done
Refactored Club page to support nested routing (`/club/:id/teams/:teamId`), extracted a shared `ClubMenu` component, and enriched the news API response with full championship info.

## Key changes

### Backend
- `GET /clubs/:id/news` now accepts optional `?category=Senior` query param to filter by team category
- Championship field in news response changed from string to object: `{ name, code, group, category, gender }`
- `GET /teams/:id` response now includes `club_id`

### Frontend
- `App.tsx`: route changed from `/club/:id` to `/club/:id/*` to enable nested routing
- `Club.tsx` split into two components:
  - `Club` — shell: fetches club data, renders `ClubMenu`, routes between `ClubPage` and `Team`
  - `ClubPage` — news feed, now filters by category (not teamId)
- New `ClubMenu.tsx` — tab navigation bar: "Clap Clap Info" link + one tab per team (with W/L), navigates to `/club/:id/teams/:teamId`
- `Team.tsx` — added optional `onTeamResolved` prop (for future use by Club shell to sync active tab); team response now includes `club_id`
- Championship badge in news feed now shows `category + short_code`
- News category filter uses pill buttons (not border-bottom tabs)

## Why
The Club page needed to embed Team pages directly under the club URL so the team menu stays persistent while navigating between news and team stats.

## Files modified
- `backend/src/entities/club/club.controller.ts`
- `backend/src/entities/club/club.service.ts`
- `backend/src/entities/team/team.service.ts`
- `frontend/src/App.tsx`
- `frontend/src/components/common/ClubMenu.tsx` (new)
- `frontend/src/components/team/types.ts`
- `frontend/src/pages/Club.tsx`
- `frontend/src/pages/Team.tsx`
- `documentation/plans/done/clap-clap-info.md` (moved from plans/)
- `documentation/mockups/player-page-b.html` (minor manual correction)
