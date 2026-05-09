# Game page — Step 1: GET /games/:id backend endpoint

## What was done

Created a `GameModule` with a `GET /games/:id` endpoint returning all data needed to render the game page.

## New files

- `backend/src/game/game.service.ts` — `GameService.findOne(id)`: loads game + all related rows via 5 parallel repo queries, maps to response DTO
- `backend/src/game/game.controller.ts` — `GET /games/:id` with `ParseIntPipe`
- `backend/src/game/game.module.ts` — wires service, controller, and TypeORM feature repos
- `backend/src/game/game.service.spec.ts` — 3 unit tests (happy path, 404, null time_played)

## Modified files

- `backend/src/app.module.ts` — added `GameModule` import

## Response shape

```
{ id, game_number, date, time, venue, group, championship, referees,
  home: { name, suffix, players[], totals{team,starters,bench,first_half,second_half,overtime}, coach },
  away: { ... } }
```

## Key implementation details

- Home/away player split: matched by `player.club.id` vs `team_a.club.id` / `team_b.club.id`
- `day` (Date) → "DD/MM/YYYY" via ISO string slice
- `time` (minutes from midnight) → "HH:MM"
- `time_played` (seconds) → "MM:SS", null if 0
- Totals: only points/fouls/three_pts_made/ft_made exposed (4 stats per card)
- `NotFoundException` on unknown id

## Recreate from scratch

> In NestJS backend, create a `GameModule` at `backend/src/game/` with a `GET /games/:id` endpoint. The service loads the Game entity with relations (venue, group→championship, team_a→club, team_b→club), then runs 4 parallel queries for PlayerStatRow, TeamStatRow, CoachStatRow, GameOfficer (referee role). Split players/coaches by club id matching team_a/team_b club. Format date from ISO string to DD/MM/YYYY, time from minutes to HH:MM, time_played from seconds to MM:SS (null if 0). Totals expose only points/fouls/three_pts_made/ft_made. Throw NotFoundException if game not found. Wire module into AppModule.
