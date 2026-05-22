# Player rename feature (Step 2/3 — team-player-admin)

## Context

Admin users need to correct player names that were misread by the OCR/AI extraction. This step adds a full-stack rename feature gated behind JWT auth, visible only when logged in on the Team page.

## Changes

### Backend

**PlayerService — `rename(id, lastName, firstName)`** (`player.service.ts`)
- Loads player by id, throws `NotFoundException` if not found
- Updates `last_name`, `first_name`, and recomputes `search_key` via `normalizeKey()`
- 2 new tests: successful rename updates all three fields; 404 on unknown id

**PlayerController** (new `player.controller.ts`)
- `PATCH /players/:id` — accepts `{ last_name, first_name }` body, protected by `JwtAuthGuard`
- Delegates to `playerService.rename()`

**PlayerModule** (`player.module.ts`)
- Declares `PlayerController`
- Imports `AuthModule` to provide `JwtAuthGuard`

### Frontend

**StatsTable** (`StatsTable.tsx`)
- New optional props: `selectable`, `selectedKeys: Set<string|number>`, `onSelectionChange`
- When `selectable`: prepends a non-sortable checkbox column; clicking checkbox cell toggles selection and stops propagation (prevents `onRowClick` from firing)

**Team page** (`Team.tsx`)
- Imports `useAuth` — admin UI gated by `!!token`, same pattern as `Layout.tsx`
- `selectedPlayerIds: number[]` state maintains selection order (important for future merge where first = survivor)
- `handleSelectionChange` compares old/new Set to detect added/removed key and maintains array order
- Averages `StatsTable` receives `selectable`, `selectedKeys`, `onSelectionChange` when token present
- `PlayerAdminPanel` component rendered inline between Averages and Totals when exactly 1 player selected:
  - Pre-fills `last_name` / `first_name` inputs from selected player; resets on player change
  - Save → `PATCH /players/:id` → re-fetches team data + clears selection on success
  - Cancel clears selection
  - Desktop (`md:`): inline panel with muted background, border, rounded corners
  - Mobile: `fixed bottom-0` with border-top and shadow; spacer div prevents content overlap
- Renamed `COLUMNS` → `AVERAGES_COLUMNS` to clarify intent (was used for both averages table)

## Reasoning

- `selectedPlayerIds` as ordered array (not Set): preserves first-selected = survivor for the upcoming merge feature (Step 3)
- `onSelectionChange` receives full new Set: consistent with controlled-component pattern; Team.tsx derives the diff to maintain order
- Mobile fixed panel: avoids inline panel pushing content on small screens where scrolling to the panel would be awkward
