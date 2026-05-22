# Team player admin

Admin features on the team page: edit a player's name, merge multiple players into one.
Gated by `!!token` from `useAuth()`, same pattern as `Layout.tsx`.

## Decisions

- **Auth gate**: `!!token` — same pattern as Layout component
- **Panel placement**: inline between Averages and Totals tables on desktop; `fixed bottom-0` on mobile
- **StatsTable**: extended with `selectable`, `selectedKeys`, `onSelectionChange` props; checkbox column prepended when `selectable`
- **Selection**: no cap — 1 selected → edit mode, 2+ selected → merge mode
- **Merge survivor**: first selected player; all others absorbed
- **Merge call**: single atomic endpoint — rename + relink + set `merged_into` in one call
- **`search_key` column**: JS-normalized (lowercase + accent-stripped) stored on `Player`, indexed; backfilled on `onModuleInit`; `findOrCreate` queries on it
- **`merged_into` FK**: nullable self-reference on `Player`; `findOrCreate` follows it one level to return the survivor
- **`PlayerModule` reaches `AppModule`** transitively via `GamePersistenceModule → ScoreSheetModule → AppModule` — no change to `AppModule` needed

---

## Step 1 — Player entity: `search_key` + `merged_into`

**Modified files:** `backend/src/player/player.entity.ts`, `backend/src/player/player.service.ts`, `backend/src/player/player.service.spec.ts`, `documentation/database.uml`

### player.entity.ts

Add two columns:
- `search_key`: `varchar`, indexed — normalized form of `last_name + ' ' + first_name` (lowercase, accents stripped)
- `merged_into`: nullable `ManyToOne(() => Player)` self-reference — set on absorbed players after a merge

### player.service.ts

Add `normalizeKey(lastName: string, firstName: string): string`:
- Concatenate `lastName + ' ' + firstName`
- `.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()`

Update `findOrCreate(lastName, firstName, club)`:
1. Compute `key = normalizeKey(lastName, firstName)`
2. Query `WHERE search_key = :key AND club.id = :clubId` with `relations: ['merged_into']`
3. If found and `player.merged_into` is set → return `player.merged_into`
4. If found and no `merged_into` → return player
5. If not found → create with `search_key` populated, return new player

Add `onModuleInit()`:
- Load all players where `search_key IS NULL OR search_key = ''`
- For each: set `search_key = normalizeKey(p.last_name, p.first_name)`, save

### player.service.spec.ts

Update existing tests to pass `search_key` on mock player objects.
Add new cases:
- `findOrCreate` with different case → returns existing player
- `findOrCreate` with accented name → returns existing player
- `findOrCreate` where found player has `merged_into` set → returns the target player
- `findOrCreate` where no match → creates player with `search_key` populated

---

## Step 2 — Rename feature (full stack)

**New files:** `backend/src/player/player.controller.ts`

**Modified files:** `backend/src/player/player.service.ts`, `backend/src/player/player.module.ts`, `frontend/src/components/common/StatsTable.tsx`, `frontend/src/pages/Team.tsx`

### player.service.ts — add `rename()`

```
rename(id: number, lastName: string, firstName: string): Promise<Player>
```
- Load player by id, 404 if not found
- Update `last_name`, `first_name`, `search_key = normalizeKey(lastName, firstName)`
- Save and return

### player.controller.ts

```
PATCH /players/:id
Body: { last_name: string; first_name: string }
Guard: JwtAuthGuard
```
- Calls `playerService.rename(id, body.last_name, body.first_name)`
- Returns updated player

### player.module.ts

- Add `PlayerController` to `controllers: []`

### StatsTable.tsx

Add optional props:
```ts
selectable?: boolean
selectedKeys?: Set<string | number>
onSelectionChange?: (keys: Set<string | number>) => void
```

When `selectable` is true:
- Prepend a non-sortable checkbox column (no header label)
- Each row renders a checkbox: checked if `selectedKeys` contains `rowKey(row)`
- On checkbox change: call `onSelectionChange` with updated set (toggle the key)
- Click on checkbox cell stops propagation to prevent triggering `onRowClick`

### Team.tsx

Add:
- `selectedPlayerIds: Set<number>` state (empty by default)
- Only render selection UI when `!!token`
- Pass `selectable`, `selectedKeys`, `onSelectionChange` to the Averages `StatsTable` only
- Below the Averages table (before Totals heading): render `PlayerAdminPanel` when `selectedPlayerIds.size >= 1`

**PlayerAdminPanel** (inline component in Team.tsx):

Props: `selected: TeamPlayer[]` (in selection order), `token: string`, `onDone: () => void`

Edit mode (exactly 1 selected):
- Heading: "Modifier le joueur"
- Two inputs pre-filled with `selected[0].last_name` and `selected[0].first_name`
- Save button → `PATCH /players/:id` → on success: `onDone()` (re-fetches team + clears selection)
- Cancel link clears selection

Layout:
- Desktop: rendered inline between the Averages table and the "Totals" heading
- Mobile (`sm:` breakpoint): `fixed bottom-0 left-0 right-0` with white background, border-top, padding, shadow

---

## Step 3 — Merge feature (full stack)

**Modified files:** `backend/src/player/player.service.ts`, `backend/src/player/player.controller.ts`, `backend/src/player/player.module.ts`, `frontend/src/pages/Team.tsx`

### player.service.ts — add `merge()`

```
merge(survivorId: number, absorbedIds: number[], lastName: string, firstName: string): Promise<Player>
```
1. Load survivor with `club` relation, 404 if not found
2. Load all absorbed players with `club` relation; 404 if any not found
3. Validate all absorbed players belong to the same club as the survivor — throw `BadRequestException` if not
4. Update survivor: `last_name`, `first_name`, `search_key`; save
5. For each absorbed player:
   - Update all `PlayerStatRow` where `player.id = absorbedId` → set `player = survivor`
   - Update absorbed `Player`: set `merged_into = survivor`; save
6. Return updated survivor

### player.controller.ts

Add:
```
POST /players/merge
Body: { survivor_id: number; absorbed_ids: number[]; last_name: string; first_name: string }
Guard: JwtAuthGuard
```
- Calls `playerService.merge(...)`
- Returns updated survivor

### player.module.ts

- Add `PlayerStatRow` to `TypeOrmModule.forFeature([Player, PlayerStatRow])`
- Import `PlayerStatRow` entity

### Team.tsx — extend PlayerAdminPanel to merge mode

Merge mode (2+ selected):
- Heading: "Fusionner les joueurs"
- Two inputs pre-filled with `selected[0].last_name` and `selected[0].first_name` (survivor name, editable)
- Below inputs: small list of absorbed players — "sera fusionné dans" + survivor name (read-only display of `selected[1..n]` names)
- Merge button → `POST /players/merge` with `survivor_id = selected[0].id`, `absorbed_ids = selected[1..n].map(p => p.id)`, edited name → on success: `onDone()`
- Cancel link clears selection
