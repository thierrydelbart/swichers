# Team page — Step 1: scaffold with title + game page links

## What was done

Created the team page scaffold at `/teams/:id` showing just the team name. Added `team_id` to the game service response so team names in the game page link to the team page. Also fixed a null-suffix bug on the away team name.

## New files

- `backend/src/team/team.controller.ts` — `GET /teams/:id` with ParseIntPipe
- `frontend/src/pages/Team.tsx` — team page with breadcrumb and team name
- `frontend/src/components/team/types.ts` — `TeamPageData` interface

## Modified files

- `backend/src/team/team.service.ts` — added `findOne(id)`, throws NotFoundException
- `backend/src/team/team.module.ts` — added TeamController
- `backend/src/team/team.service.spec.ts` — added findOne tests
- `backend/src/app.module.ts` — imported TeamModule
- `backend/src/game/game.service.ts` — added `team_id` to home/away; fixed null suffix on away team
- `backend/src/game/game.service.spec.ts` — added team_id assertions
- `frontend/src/components/game/types.ts` — added `team_id` to TeamData
- `frontend/src/components/game/TeamSection.tsx` — team name wrapped in Link to `/teams/:id`
- `frontend/src/App.tsx` — added `/teams/:id` route

## Recreate from scratch

> Add `findOne(id)` to TeamService (load Team with club relation, throw NotFoundException if not found, return id/name/category/gender). Add TeamController with GET /teams/:id. Wire TeamModule into AppModule. Add `team_id` to home/away in GameService response. Fix away team null-suffix concatenation. Update TeamData interface to include team_id. In TeamSection, wrap team name in a Link to /teams/:id. Create Team.tsx page that fetches /teams/:id and renders team name. Add /teams/:id route in App.tsx.
