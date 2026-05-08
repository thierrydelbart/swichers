# Step 3: Add /upload page with JPEG form and toast feedback

## Goal
Create a new `/upload` route in the frontend with a form to upload a JPEG score sheet. On submit, send the file to `POST /score-sheet/extract` and show a success/error toast. No result display yet — that's step 4.

## Changes

### New files
- `frontend/src/pages/Upload.tsx` — form with shadcn Input (file, accept="image/jpeg") + Button, client-side JPEG validation, fetch to backend, sonner toasts, loading state
- `frontend/src/components/ui/input.tsx` — shadcn Input component (added via `npx shadcn@latest add input`)

### Modified files
- `frontend/src/App.tsx` — added `/upload` route pointing to Upload page
- `documentation/plans/ffbb-score-sheet-upload.md` — marked Step 3 complete

## Key decisions
- Client-side JPEG validation for instant UX feedback (backend also validates)
- No link from Home page yet — navigate directly to /upload
- Error message extracted from backend JSON response when available
