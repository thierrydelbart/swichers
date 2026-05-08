# Step 2: Wire Claude Sonnet 4.6 extraction into score-sheet endpoint

## Goal
Replace the stub `ScoreSheetService.extract()` with a real Claude API call. Send the JPEG as base64 to Claude Sonnet 4.6 using the ffbb-extractor system prompt, parse the JSON response, and return it. Handle Claude failures with 502.

## Changes

### New files
- `backend/src/score-sheet/fixtures/resume_0034_PRM_A_77.jpg` — fixture JPEG copied from ffbb-extractor skill tests

### Modified files
- `backend/src/score-sheet/score-sheet.service.ts` — full Claude extraction: SYSTEM_PROMPT constant (ffbb-extractor rules), base64 encoding, Anthropic messages.create call, markdown code fence stripping, JSON.parse, BadGatewayException on failure
- `backend/src/score-sheet/score-sheet.service.spec.ts` — 4 unit tests: valid JSON, code fence stripping, Claude API failure, invalid JSON; uses jest.mock('@anthropic-ai/sdk') and real fixture JPEG via fs.readFileSync
- `backend/src/score-sheet/score-sheet.controller.spec.ts` — mocked ScoreSheetService (was using real service, now uses useValue mock)
- `backend/.env` — added ANTHROPIC_API_KEY= placeholder
- `backend/package.json` — added @anthropic-ai/sdk

## Key decisions
- Model: claude-sonnet-4-6 (fast, sufficient for structured extraction)
- No prompt caching yet — single image call
- Strip markdown fences defensively even though system prompt says return raw JSON
- BadGatewayException (502) for both API failure and JSON parse failure
