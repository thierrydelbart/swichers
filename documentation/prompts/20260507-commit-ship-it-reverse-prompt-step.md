# Add reverse-engineered prompt step to ship-it skill

## Context

The `ship-it` skill (`.claude/skills/ship-it/SKILL.md`) orchestrates the final validation and commit process. A new step was added to automatically document what was done before committing, so that every commit has a corresponding human-readable prompt that could recreate it from scratch.

## Actions

1. Edit `.claude/skills/ship-it/SKILL.md` to add a new step between "Commit message" and "Commit and push":
   - Step title: **Create reverse engineered prompt**
   - Before committing, create a markdown file in `.claude/prompts/` that describes:
     - The key changes made
     - The reasoning behind them
     - Any important context needed to recreate the commit from scratch
   - Naming convention: `<datetime>-commit-<short-description>.md` (e.g. `20260507-commit-fix-button-lint.md`)

2. Create the `.claude/prompts/` directory if it doesn't exist.

## Reasoning

Every commit should be self-documenting not just via its message, but via a structured prompt that captures intent and context — useful for onboarding, audit trails, and future AI-assisted replication.
