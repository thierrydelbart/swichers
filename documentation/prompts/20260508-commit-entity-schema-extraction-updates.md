# Step 1: Entity schema updates + ffbb-extractor extraction prompt updates

## Goal
Add missing fields to Championship, Team, and Venue entities to support full score sheet data persistence. Update the Claude extraction prompt to return season, category, and gender derived from competition name and game date.

## Changes

### New files
- `backend/src/shared/team-category.enum.ts` — enum U5–U21, Senior
- `backend/src/shared/gender.enum.ts` — enum Male, Female

### Modified files
- `backend/src/championship/championship.entity.ts` — added short_code, category, gender
- `backend/src/team/team.entity.ts` — added category, gender
- `backend/src/venue/venue.entity.ts` — added name (varchar 100), made address nullable
- `backend/src/score-sheet/score-sheet.service.ts` — updated SYSTEM_PROMPT competition section with season/category/gender rules
- `~/.claude/skills/ffbb-extractor/SKILL.md` — added season/category/gender to competition output spec
- `documentation/database.uml` — updated Championship, Team, Venue; added TeamCategory and Gender enums
- `documentation/plans/score-sheet-db-persistence.md` — marked Step 1 complete, listed files

## Key rules added to extraction prompt
- season: computed from game date (month ≥ 8 → current/next year, month < 8 → prev/current year), format "YYYY/YY"
- category: U+digits from competition name (e.g. DMU15 → U15), default Senior
- gender: feminine markers (UxxF, féminin/e, DMF, DF) → Female, otherwise Male
