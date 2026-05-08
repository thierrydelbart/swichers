# Step 5: Persist JPEG to disk and cache Claude extraction in File entity

## Goal
Store uploaded JPEGs on disk and cache Claude extraction results in the DB so the same file is never extracted twice. Cache key is SHA-256 hash of file content.

## Flow
1. Compute SHA-256 hash of uploaded buffer
2. Look up File by hash — if found and extractedData set → return immediately (cache hit)
3. Write JPEG to `UPLOAD_DIR/<hash>.jpg`
4. Insert File record (extractedData: null)
5. Call Claude → update extractedData on success; leave null on failure (file still persisted for retry)

## Changes

### New files
- `backend/src/file/file.module.ts` — NestJS module exporting FileService
- `backend/src/file/file.service.ts` — findByHash, persist (mkdir+writeFile+DB insert), updateExtractedData
- `backend/src/file/file.service.spec.ts` — 3 unit tests (mocked repo + fs/promises)

### Modified files
- `backend/src/file/file.entity.ts` — added `hash` (varchar 64, unique index), `extractedData` (jsonb nullable), `game` made nullable
- `backend/src/score-sheet/score-sheet.service.ts` — injected FileService + ConfigService, SHA-256 hash, cache check, persist, callClaude extracted to private method, updateExtractedData
- `backend/src/score-sheet/score-sheet.service.spec.ts` — 5 tests: cache hit (no Claude), cache miss, code fences, Claude failure (file persisted), invalid JSON
- `backend/src/score-sheet/score-sheet.module.ts` — imports FileModule
- `backend/src/score-sheet/score-sheet.controller.ts` — passes file.originalname to service
- `backend/.env.example` + `backend/.env` — added UPLOAD_DIR=./uploads
- `documentation/plans/ffbb-score-sheet-upload.md` — marked Step 5 complete

## Key decisions
- SHA-256 over filename for dedup — content-exact, not name-exact
- Disk storage over DB blob — simpler, lighter on DB
- File persisted before Claude call — retry-safe on extraction failure
- UPLOAD_DIR configurable via env, defaults to ./uploads
