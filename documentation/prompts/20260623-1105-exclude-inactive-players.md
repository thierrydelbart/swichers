# Exclude inactive players from score-sheet persistence

## Context

After Claude extracts player stats from an FFBB score sheet, the raw data may include rows for players who never entered the game — these show up as no time played (`time_played: null`) and all numeric stats at zero. Persisting them creates noise in the database and pollutes player pages with ghost entries.

## Change

In `backend/src/services/game-persistence/game-persistence.service.ts`, inside the `persist()` method, added a filter on `sideStats.players` before the player persistence loop.

A player is excluded if **all** of the following are true:
- `time_played` is `null`
- `points === 0`
- `shots_made === 0`
- `3pts_made === 0`
- `2pts_in_made === 0`
- `2pts_out_made === 0`
- `FT_made === 0`
- `fouls === 0`

The filtered array (`activePlayers`) is used instead of the raw `sideStats.players` array.

## File modified

- `backend/src/services/game-persistence/game-persistence.service.ts` — added `activePlayers` filter before player loop (line ~207)
