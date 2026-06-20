# Clap Clap Info — Step 1/2: Club info + team strip

## What was done

Implemented the first step of the Clap Clap Info feature (see `documentation/plans/clap-clap-info.md`).

## Backend

Created `ClubController` and extended `ClubService` with a `findById(id)` method.

**`GET /clubs/:id`** returns:
```json
{
  "id": 1,
  "name": "CLAPIERS BASKET BALL",
  "teams": [
    { "id": 6, "category": "Senior", "gender": "Male", "suffix": "1", "wins": 8, "losses": 3 }
  ]
}
```

W/L logic: fetches all games involving any of the club's teams where `score_a IS NOT NULL AND score_b IS NOT NULL`. Computes wins/losses per team in JS — win = scored more than the opponent (works whether team is team_a or team_b).

`ClubModule` updated to import `TypeOrmModule.forFeature([Club, Team, Game])` and register `ClubController`. `AppModule` now imports `ClubModule`.

`club.service.spec.ts` updated with mock providers for `TeamRepository` and `GameRepository`.

## Frontend

**`Club.tsx`** (new page at `/club/:id`):
- Fetches `GET /clubs/:id` on mount
- Renders page header with club name eyebrow + "Clap Clap Info" h1
- Renders team strip: "Toutes les équipes" tab (default active) + one tab per team showing formatted label (category + gender initial + suffix) and W/L counts in green/red
- `selectedTeamId` state tracks the active team filter (used in Step 2 for news filtering)
- Accepts optional `clubId` prop to override URL param — allows rendering at a fixed club id without a URL change

**`Home.tsx`**: now renders `<Club clubId={1} />` directly (no redirect). Home page shows club 1 content while staying at `/`.

**`App.tsx`**: added `/club/:id` route for generic club pages.

## Why

Decouples club identity from a hardcoded club name, making the news feed generic for any club. The home page stays at `/` (no URL change) while showing the same content as `/club/1`.
