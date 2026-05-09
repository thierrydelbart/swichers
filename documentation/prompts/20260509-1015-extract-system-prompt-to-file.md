# Extract SYSTEM_PROMPT to separate file

## What was done

The large `SYSTEM_PROMPT` constant was extracted from `score-sheet.service.ts` into its own dedicated file `score-sheet.prompt.ts`, then imported back into the service.

## Changes

- Created `backend/src/score-sheet/score-sheet.prompt.ts` — exports `SYSTEM_PROMPT`
- Updated `backend/src/score-sheet/score-sheet.service.ts` — removed inline constant, added import

## Why

Separating the prompt from service logic improves readability and makes the prompt easier to iterate on independently without touching service code.

## Recreate from scratch

> Move the `SYSTEM_PROMPT` constant defined at the top of `score-sheet.service.ts` into a new file `score-sheet.prompt.ts` in the same folder. Export it as a named export. Import it back in `score-sheet.service.ts`.
