# Fix button lint error + translate claude skills to english

## Actions

1. Fix the Fast Refresh lint error in `frontend/src/components/ui/button.tsx`:
   - The file exports both a component (`Button`) and a non-component (`buttonVariants`), which violates the `react-refresh/only-export-components` ESLint rule
   - Extract `buttonVariants` and its `cva` definition into a new file `frontend/src/components/ui/button-variants.ts`
   - Update `button.tsx` to import from `button-variants.ts` and export only `Button`
   - Run `npm run lint` from `frontend/` to verify the fix

2. Translate all project Claude skills in `.claude/skills/` from French to English:
   - `.claude/skills/refactor/SKILL.md` — translate description, argument-hint, and all body content
   - `.claude/skills/ship-it/SKILL.md` — translate the ## Processus section and its steps
   - Leave already-English skills (`deep-dive`, `commit`) untouched
