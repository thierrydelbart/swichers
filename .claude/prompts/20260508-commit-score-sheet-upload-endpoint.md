# Step 1: Score sheet upload endpoint (no AI)

## Goal
Add a `POST /score-sheet/extract` endpoint to the NestJS backend that accepts a JPEG file upload, validates it, and returns `{ received: true, size: <bytes> }`. No Claude call yet — this is the scaffold step.

## Changes

### New files
- `backend/src/score-sheet/score-sheet.module.ts` — NestJS module wiring controller + service
- `backend/src/score-sheet/score-sheet.controller.ts` — POST endpoint with multer FileInterceptor (memory storage, JPEG-only filter, 5 MB limit), `@Throttle` decorator (10 req/min)
- `backend/src/score-sheet/score-sheet.service.ts` — stub service returning `{ received: true, size: buffer.length }`
- `backend/src/score-sheet/score-sheet.service.spec.ts` — unit test with a fake buffer
- `backend/src/score-sheet/score-sheet.controller.spec.ts` — integration test covering valid upload and missing file cases

### Modified files
- `backend/src/app.module.ts` — added `ThrottlerModule.forRoot`, `APP_GUARD` with `ThrottlerGuard`, `ScoreSheetModule`
- `backend/src/app.controller.spec.ts` — fixed pre-existing broken test (mocked `AppService` instead of providing real one with missing `UserRepository`)
- `backend/package.json` — added `@nestjs/throttler`, `@types/multer` (dev)
- `documentation/plans/ffbb-score-sheet-upload.md` — marked Step 1 complete, listed files created/modified, test results

## Key decisions
- Memory storage (no disk writes) — files are transient
- JPEG validation in both fileFilter (multer) and controller guard
- ThrottlerGuard applied globally via APP_GUARD
- Stub service returns buffer size to allow manual curl testing without Claude
