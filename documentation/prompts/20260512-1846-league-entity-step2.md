# League Entity — Step 2/2: frontend breadcrumbs

## Goal
Expose league in API responses for game and team pages, and update breadcrumbs to show the league code.

## Backend changes

### `game/game.service.ts`
- Added `'group.championship.league'` to the `findOne` relations array
- Added `league: { code, name } | null` to the response object (null-safe)

### `team/team.service.ts`
- Added `.leftJoinAndSelect('champ.league', 'league')` to the PSR query builder
- Added `league: { code, name } | null` to the return object, resolved from `rows[0]?.game.group.championship.league`
- Uses `leftJoin` (not `innerJoin`) to handle championships without league gracefully

### `team/team.service.spec.ts`
- Added `leftJoinAndSelect: jest.fn().mockReturnThis()` to `mockQb`
- Added `league` field to `champ` fixture object in aggregation test

## Frontend changes

### `components/game/types.ts`
Added `league: { code: string; name: string } | null` to `GameData` interface.

### `components/team/types.ts`
Added `league: { code: string; name: string } | null` to `TeamPageData` interface.

### `pages/Game.tsx`
Breadcrumb updated from:
`Accueil / Championship name / Match #N`
to:
`Accueil / 0034 / Championship name / Match #N`
League code segment only rendered when `game.league` is non-null.

### `pages/Team.tsx`
Breadcrumb updated from:
`Accueil / Team name`
to:
`Accueil / 0034 / Team name`
League code segment only rendered when `team.league` is non-null.
