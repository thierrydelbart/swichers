# Fix game delete FK violations (game_import)

## Problem
Deleting a game caused two FK violations:
1. `game_import.file_id → file.id`: trying to delete a File still referenced by a GameImport row
2. `game_import.game_id → game.id`: trying to delete a Game still referenced by a GameImport row

## Fix (`game.service.ts` — `delete()` method)
Added two nullification steps inside the transaction, before each problematic delete:

1. Before deleting files: `UPDATE game_import SET file = NULL WHERE file_id IN (...)`
2. Before deleting the game: `UPDATE game_import SET game = NULL WHERE game_id = id`

Both use `em.update(GameImport, ...)` inside the existing transaction. The `files.length > 0` guard avoids an empty `IN ()` clause on step 1.

## Files modified
- `backend/src/entities/game/game.service.ts`
