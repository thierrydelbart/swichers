# Database UML redesign after deep-dive review

## Context

`documentation/database.uml` is the PlantUML schema for the Swichers platform (FFBB basketball stats). A deep-dive review identified 11 design issues. All changes were validated with the user one by one.

## Changes to apply to `documentation/database.uml`

1. **Remove `shots_attempted`, `three_pts_attempted`, `ft_attempted`** from `PlayerStatRow` — FFBB sheets never include attempt counts.

2. **Keep `shots_made`** in `PlayerStatRow` even though it's derivable — it is explicitly printed on FFBB sheets. Validate consistency on ingestion.

3. **Replace `referee_1`, `referee_2`, `referee_3` on `Game`** with a new `GameOfficer` join entity containing:
   - `role : GameOfficerRole` enum (`referee`, `club_delegate`, `time_tracker`, `scorer`)
   - `rank : Integer` (for referee ordering)
   - links to `Game` and `Officer`

4. **Remove `Game → Championship`** direct link — championship is already derivable via `Game → Group → Championship`.

5. **Make `Venue.club` optional** (0..1 cardinality) — neutral courts may not belong to any club.

6. **Flip file ownership**: remove `Game → File`, add `File → Game` — a game can have multiple files (corrections, revisions).

7. **Make `Team.suffix` nullable** — semantic rules are unclear.

8. **Keep `Player → Club` direct link** — player identity is scoped per club; duplicates across clubs are acceptable.

9. **Make all stat fields in `TeamStatRow` nullable** — not all stat types have all fields populated.

10. **Add `season : String(9)?`** to `Championship` (e.g. "2024-2025") — derivable from game dates, stored for convenience.

11. **Make `Club.code` nullable but unique** — FFBB club code not always available on sheets, but must be unique when present.
