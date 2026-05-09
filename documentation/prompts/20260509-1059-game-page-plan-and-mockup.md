# Game page plan and mockup

## What was done

- Created an HTML mockup for the game page at `documentation/mockups/game-page.html`
- Created a 2-step development plan at `documentation/plans/game-page.md`
- Created `documentation/mockups/` folder and moved the mockup there

## Design decisions (from deep-dive)

- Route: `/games/:id`
- Layout: game info header (teams + score + meta), then home team section, then away team section
- Player table: all stat columns, horizontally scrollable, sortable (default: PTS desc)
- Starters: bold last name + first name
- Totals: cards below each table, 3×2 grid, each card shows Points / Fouls / 3pts / FT
- Overtime card hidden if 0 pts
- Breadcrumb uses championship name + season (not "Games")
- Game list page: out of scope

## Plan steps

1. Backend — `GET /games/:id` endpoint with full game data DTO
2. Frontend — `Game.tsx` page with sortable tables and totals cards
