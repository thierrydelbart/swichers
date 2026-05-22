# Step 3 — GET /game-imports + ImportsSection + extraction_started_at rename

## Context

Part of the `async-score-sheet-extraction` feature. Steps 1, 2, and 2b were already implemented (GameImport entity, async extraction flow, retry, re-upload recovery). This step adds the admin UI to monitor imports and exposes the list endpoint.

## Changes

### Rename `extracted_at` → `extraction_started_at`

The field was renamed to better reflect its semantics: it is set at the *start* of extraction (before PDF conversion), not at completion. It is therefore populated for pending, ready, and failed imports alike.

- `game-import.entity.ts`: column renamed
- `game-import.service.ts`: `updateStatus` opts key renamed from `extractedAt` to `extractionStartedAt`
- `score-sheet.service.ts`: call site updated accordingly

### GET /game-imports endpoint

Added to `GameImportController` (which lives in `ScoreSheetModule` to avoid circular dependency). Protected by `JwtAuthGuard`. Delegates to `GameImportService.findAll()` which returns all imports ordered by `created_at DESC` with the `game` relation loaded.

`GameImportService` was already injected into `ScoreSheetModule` via `GameImportModule` — only needed to add it to the controller constructor.

### Frontend — ImportsSection component (Admin.tsx)

New component between `UploadSection` and `GamesSection`.

**Data flow:** `Admin` holds a `refreshKey` counter. `UploadSection` receives `onImported` callback and increments `refreshKey` after a successful upload. `ImportsSection` receives `refreshKey` as a prop and triggers an immediate fetch whenever it changes (key bump pattern — see `documentation/patterns.md`).

**Polling:** `ImportsSection` sets a 5s interval only while at least one import has `status: pending`. The interval is cleared when no pending imports remain.

**Fade-out:** Ready rows are tracked in a `scheduledFadeRef` (to avoid scheduling the same row twice across re-renders). After 3s they are added to `hiddenIds` and filtered from the rendered list.

**Table columns:** Teams (A vs B), Status badge (spinner for pending, green for ready, red for failed), Extraction started at (date + time via `toLocaleString('fr-FR')`), Error message, Actions (link to game for ready rows, "Réessayer" button for failed rows).

**Retry:** Calls `POST /game-imports/:id/retry`, shows toast, re-fetches the list.

### UploadSection updates

- Accepts `onImported: () => void` prop
- Toast changed to "Résumé importé, extraction en cours…" to reflect the async nature (202 response)
- FFBB filename format note added below the file input

### documentation/patterns.md

New file documenting the "key bump" pattern used to synchronise sibling components without lifting full state.
