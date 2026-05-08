# FFBB Score Sheet Upload & Extraction

Upload a JPEG score sheet → backend extracts structured JSON via Claude API → frontend displays it.

---

## Step 1 — Backend: file upload endpoint (no AI) ✅

Create `POST /score-sheet/extract` that accepts a JPEG file via `multipart/form-data`.
No Claude call yet — just validate and return `{ received: true, size: <bytes> }`.

Covers:
- `ScoreSheetModule`, `ScoreSheetController`, `ScoreSheetService` scaffold
- Multer config: memory storage, JPEG-only filter, 5 MB limit
- Rate limiting: `ThrottlerModule` globally, 10 req/min per IP
- Input validation: reject missing file, wrong MIME type, oversized file
- Unit + integration tests for controller validation

**Test manually:** `curl -X POST http://localhost:3001/score-sheet/extract -F "file=@sheet.jpg"`

### Files created
- `backend/src/score-sheet/score-sheet.module.ts`
- `backend/src/score-sheet/score-sheet.controller.ts`
- `backend/src/score-sheet/score-sheet.service.ts`
- `backend/src/score-sheet/score-sheet.controller.spec.ts`
- `backend/src/score-sheet/score-sheet.service.spec.ts`

### Files modified
- `backend/src/app.module.ts` — added `ThrottlerModule`, `ThrottlerGuard` (global), `ScoreSheetModule`
- `backend/package.json` — added `@nestjs/throttler`, `@types/multer` (dev)

### Tests
3/3 passing (`score-sheet.service.spec.ts`, `score-sheet.controller.spec.ts`)

---

## Step 2 — Backend: Claude extraction ✅

Wire `@anthropic-ai/sdk` into `ScoreSheetService.extract()`.
Send the JPEG (base64) to Claude Sonnet 4.6 with the ffbb-extractor system prompt.
Parse and return the JSON response.

Covers:
- `ANTHROPIC_API_KEY` in `backend/.env`
- Base64 encoding of the buffer
- Markdown code fence stripping from Claude response
- Unit tests: mock Anthropic client, assert JSON parsed correctly
- Error handling: Claude failure → 502

**Test manually:** send a real FFBB JPEG, verify JSON shape matches ffbb-extractor spec.

```bash
curl -X POST http://localhost:3001/score-sheet/extract \
  -F "file=@$HOME/.claude/skills/ffbb-extractor/tests/resume_0034_PRM_A_77.jpg"
```

### Files created
- `backend/src/score-sheet/fixtures/resume_0034_PRM_A_77.jpg` — fixture JPEG for tests

### Files modified
- `backend/src/score-sheet/score-sheet.service.ts` — full Claude extraction logic with SYSTEM_PROMPT
- `backend/src/score-sheet/score-sheet.service.spec.ts` — 4 unit tests (mocked Anthropic, fixture JPEG)
- `backend/src/score-sheet/score-sheet.controller.spec.ts` — mocked ScoreSheetService
- `backend/.env` — added `ANTHROPIC_API_KEY=` placeholder
- `backend/package.json` — added `@anthropic-ai/sdk`

### Tests
7/7 passing

---

## Step 3 — Frontend: upload form

New `/upload` route with a `<form>` containing a JPEG file input and submit button.
No result display yet — just send the file and show a toast on success/error.

Covers:
- `UploadPage` component, route registered in `App.tsx`
- shadcn `Input` + `Button` components
- Client-side JPEG validation before submit
- Loading state on button
- Sonner toast on error

**Test manually:** open `http://localhost:5173/upload`, upload a JPEG, check network tab for 200.

---

## Step 4 — Frontend: display extracted JSON

After a successful extraction, render the returned JSON in a `<pre>` block below the form.

Covers:
- `useState` for result
- `JSON.stringify(data, null, 2)` in `<pre className="bg-muted ...">`
- Reset result on new submission

**Test manually:** upload a real FFBB sheet, verify JSON is displayed formatted on page.

---

## Decisions recap

| Topic | Decision |
|---|---|
| File persistence | None for now — in-memory only |
| UI location | New `/upload` route, no Home link yet |
| Result display | Raw formatted JSON in `<pre>` |
| Env config | `ANTHROPIC_API_KEY` in `backend/.env` |
| Claude model | `claude-sonnet-4-6` |
| File validation | Frontend (UX) + backend (security) |
| Rate limit | 10 req/min per IP |
| Auth | Public endpoint |
| Max file size | 5 MB |
