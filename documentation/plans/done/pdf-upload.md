# PDF Upload

Replace JPEG upload with PDF upload. Convert first page to JPEG at 300dpi (via `pdftoppm`) in memory before sending to Claude. Store the original PDF on disk.

---

## Decisions

| Topic | Decision |
|---|---|
| Input format | PDF only (replace JPEG entirely) |
| Conversion tool | `pdftoppm` (Poppler, already installed) via `child_process.execFile` |
| Conversion output | JPEG at 300dpi, first page only, ephemeral (in-memory buffer) |
| Storage | PDF only on disk (`{hash}.pdf`); JPEG never persisted |
| File size limit | 5 MB unchanged |
| Existing JPEG files | Left as-is (forward-only) |
| UI change | Minimal — update `accept` filter + labels only |
| Deployment | Fly.io (Docker) — `poppler-utils` installed via `apt-get` in Dockerfile |

---

## After each step

- Mark step complete (✅) in this file
- List files created/modified under the step

---

## Step 1 — Backend: PDF ingestion + conversion ✅

### Conversion flow in `ScoreSheetService.extract()`
1. Receive PDF buffer
2. Write to temp file: `/tmp/{hash}.pdf`
3. Run: `pdftoppm -r 300 -jpeg -singlefile /tmp/{hash}.pdf /tmp/{hash}-out`
4. Read `/tmp/{hash}-out.jpg` into buffer
5. Delete both temp files (even on error)
6. Pass JPEG buffer to Claude (existing flow unchanged from here)

Use `child_process.execFile` (not `exec`) — safer, no shell injection risk.

### Controller changes
- Change MIME validation: `application/pdf` instead of `image/jpeg`
- Update `FileInterceptor` field name if needed (no change expected)

### FileService changes
- Store file as `{hash}.pdf` instead of `{hash}.jpg`
- No other changes — buffer passed in is the original PDF buffer

### File entity
- No schema change — `location` (varchar 256) already stores arbitrary path

### Error handling
- If `pdftoppm` exits non-zero: throw `BadRequestException('Invalid or unreadable PDF')`
- Temp file cleanup in `finally` block

### Tests
- Mock `execFile` — happy path: returns JPEG buffer for Claude
- Mock `execFile` — error path: throws BadRequestException
- Assert temp files cleaned up on error

### Files modified
- `backend/src/score-sheet/score-sheet.controller.ts` — MIME check → `application/pdf`
- `backend/src/score-sheet/score-sheet.service.ts` — add `convertPdfToJpeg()` private method, call before Claude
- `backend/src/score-sheet/score-sheet.service.spec.ts` — update/add tests
- `backend/src/file/file.service.ts` — store as `.pdf`
- `backend/src/file/file.service.spec.ts` — update `.jpg` → `.pdf`

### Tests
41/41 passing

---

## Step 2 — Frontend: update upload UI ✅

### Changes
- `accept` attribute on file input: `".pdf"` instead of `".jpeg,.jpg"`
- Update any label or hint text that references JPEG/image
- No other UI changes

### Files modified
- `frontend/src/pages/Upload.tsx` — accept + label update
