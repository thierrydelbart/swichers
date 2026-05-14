# Delete all files linked to a game on game deletion

In `GameService.delete()`, change `findOne` to `find` so all `File` records linked to the game are fetched. Replace the `if (file)` block with a `for...of` loop that deletes each file from the DB and unlinks it from disk.

File: `backend/src/game/game.service.ts`
