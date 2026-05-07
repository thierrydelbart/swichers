# Implement all TypeORM entities from database.uml

## Context

The UML schema at `documentation/database.uml` defines the full Swichers data model. This commit implements all entities as TypeORM classes in the NestJS backend (`backend/src/`). No routes or services are created — entities only.

## Entities created

### Enums
- `src/game-officer/game-officer-role.enum.ts` — `GameOfficerRole`: `referee`, `club_delegate`, `time_tracker`, `scorer`
- `src/team-stat-row/team-stat-type.enum.ts` — `TeamStatType`: `team`, `bench`, `starters`, `first_half`, `second_half`, `overtime`

### Leaf entities (no FK dependencies)
- `src/club/club.entity.ts` — `name`, `code` (varchar, nullable, unique)
- `src/championship/championship.entity.ts` — `name`, `season` (varchar, nullable)
- `src/officer/officer.entity.ts` — `name`

### Entities depending on Club/Championship
- `src/venue/venue.entity.ts` — `address`, `club` (nullable ManyToOne → Club)
- `src/group/group.entity.ts` — `name`, `championship` (ManyToOne → Championship)
- `src/team/team.entity.ts` — `name`, `suffix` (nullable), `club` (ManyToOne → Club)
- `src/player/player.entity.ts` — `last_name`, `first_name`, `club` (ManyToOne → Club)
- `src/coach/coach.entity.ts` — `last_name`, `first_name`, `club` (ManyToOne → Club)

### Game (depends on Venue, Group, Team)
- `src/game/game.entity.ts` — `day` (date), `time` (int, seconds), `game_number`, FK to `venue`, `group`, `team_a`, `team_b`

### Join/stat entities (depend on Game)
- `src/game-officer/game-officer.entity.ts` — `role` (enum), `rank` (nullable int), FK to `game` + `officer`
- `src/file/file.entity.ts` — `name`, `location`, FK to `game`
- `src/player-stat-row/player-stat-row.entity.ts` — `number`, `starter`, `time_played` (int, seconds), all scoring/foul fields, FK to `game` + `player`
- `src/coach-stat-row/coach-stat-row.entity.ts` — `fouls`, FK to `game` + `coach`
- `src/team-stat-row/team-stat-row.entity.ts` — all stat fields nullable, `type` (enum), FK to `game` + `team`

## AppModule update
All 15 entities (including existing `User`) registered in both `TypeOrmModule.forRootAsync` and `TypeOrmModule.forFeature` via a shared `entities` array.

## Key decisions
- All `time` fields stored as `int` (seconds), not a Time type
- All string `@Column` decorators explicitly typed as `type: 'varchar'`
- `TeamStatRow` stat fields all nullable (not all stat types populate all fields)
- Tables are auto-created by TypeORM `synchronize: true` on next backend startup
