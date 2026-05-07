---
name: refactor
description: Analyze and refactor code to improve readability, performance, and maintainability
argument-hint: <file-or-directory> (required)
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Analyze and refactor the specified code ($ARGUMENTS).

## Refactoring principles

Apply these principles in order of priority:

1. **Readability first**: code must be understandable without comments
2. **DRY** (Don't Repeat Yourself): eliminate duplication
3. **Single responsibility**: each function does ONE thing
4. **Explicit naming**: names must say what the code does
5. **Error handling**: never silently ignore an error

## Process

### 1. Analysis
- Read the code and identify code smells
- Rank issues by impact (critical, important, minor)
- Check for existing tests (to avoid breaking anything)

### 2. Planning
- Propose a refactoring plan with the intended changes
- Explain WHY each change is beneficial
- Estimate regression risk for each change

### 3. Execution
- Apply changes one by one
- After each change, run tests if available
- If a test breaks, revert the change and explain why

### 4. Verification
- Run the full test suite
- Verify the build passes
- Summarize the changes made with before/after

## Important
- NEVER change visible behavior of the code (except obvious bug fixes)
- Favor small incremental changes over massive refactors
- If the code has no tests, propose adding them BEFORE refactoring