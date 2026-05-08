---
name: ship-it
description: When everything is ready and you just need to ship the code, run the final tests, prepare a commit message and commit/push after human validation. Use when user says "ship it", "ready to merge", or "finalize the PR".
---

When everything is ready and you just need to ship the code, run the final tests, and prepare a commit message.

Use this skill when the user says "ship it", "ready to merge", or "finalize the PR". The focus here is on final validation and crafting a clear, concise commit message that summarizes the changes and their impact.

## Process

1. **Final validation**: Run final tests (unit, e2e, lint) to ensure everything is in order. If a test fails, abort the shipping process and inform the user of the issue.

2. **Update documentation**: If there are any relevant documentation files (e.g., `README.md`, `DESIGN.md`, or inline code comments) that need updating based on the changes, update them accordingly. If needed, update files in documentation directory. This ensures that the documentation stays in sync with the code. If no documentation changes are needed, skip this step. Be extremely concise and sacrifice spelling for the sake of brevity if you need to.

2. **Commit message**: Write a clear, informative commit message summarizing the changes, their rationale, and potential impact. Use conventional commit format if applicable. Ask for validation before committing.

3. **Create reverse engineered prompt**: Before committing, create a reverse engineered prompt that describes the changes made in a way that could be used to recreate the commit from scratch. This is useful for documentation and future reference. Include the key changes, the reasoning behind them, and any important context. This prompt should be detailed enough to allow someone else to understand the changes without looking at the code. Store the prompts files in .claude/prompts/ with a clear naming convention (e.g., `<date>-<time>-<short-description>.md`). Step skipped only on explicit request.
- date : current date in YYYYMMDD format
- time : current time in HHMM format
- short-description : a concise description of the changes (e.g., "fix-upload-bug", "add-user-auth")

4. **Commit and push**: Once the commit message is validated and the prompt file created, git add modified and new files, commit, and push to the remote branch. Inform the user that the code was shipped successfully.

