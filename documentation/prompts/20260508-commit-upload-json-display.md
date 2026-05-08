# Step 4: Display extracted JSON in pre block on upload page

## Goal
After a successful extraction, show the returned JSON formatted in a `<pre>` block below the upload form. Reset the result on each new submission.

## Changes

### Modified files
- `frontend/src/pages/Upload.tsx`:
  - Added `result` state (`string | null`)
  - `setResult(null)` at start of each submission
  - Parse response with `res.json()` and store as `JSON.stringify(data, null, 2)`
  - Render `<pre className="bg-muted rounded-md p-4 text-sm overflow-auto">` conditionally when result is set
- `documentation/plans/ffbb-score-sheet-upload.md` — marked Step 4 complete

## Key decisions
- Raw formatted JSON in `<pre>` — no structured UI yet, sufficient to validate extraction output
- Result resets on new submission so stale data is never shown
