---
name: ship-it
description: When everything is ready and you just need to ship the code, run the final tests, prepare a commit message and commit/push after human validation. Use when user says "ship it", "ready to merge", or "finalize the PR".
---

When everything is ready and you just need to ship the code, run the final tests, and prepare a commit message.

Use this skill when the user says "ship it", "ready to merge", or "finalize the PR". The focus here is on final validation and crafting a clear, concise commit message that summarizes the changes and their impact.

## Process

1. **Final validation**: Run final tests (unit, e2e, lint) to ensure everything is in order. If a test fails, abort the shipping process and inform the user of the issue.

2. **Commit message**: Write a clear, informative commit message summarizing the changes, their rationale, and potential impact. Use conventional commit format if applicable. Ask for validation before committing.

3. **Commit and push**: Once the commit message is validated, git add modified and new files, commit, and push to the remote branch. Inform the user that the code was shipped successfully.
