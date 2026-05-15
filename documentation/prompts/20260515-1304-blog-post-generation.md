# Blog post generation from game scoresheet

Generate a short French blog post when extracting a game scoresheet, and display it on the game page.

## Backend

- Add `blog_post?: { title: string; content: string }` to `ExtractionResult` interface
- Add section 6 to `score-sheet.prompt.ts`: instruct Claude to generate a catchy French blog post (L'Equipe style), factual, max 1000 chars content / 100 chars title, no invented data
- Add `blog_title` (varchar 100, nullable) and `blog_content` (text, nullable) columns to `Game` entity
- Persist `blog_title`/`blog_content` from extraction result in `GamePersistenceService`
- Expose `blog_post: { title, content }` in `GameService.findOne()` response

## Frontend

- Add `blog_post?: { title: string; content: string }` to `GameData` type
- In `Game.tsx`, render a card with the blog post title and content between the score header and the stats tables, only if `blog_post.title` is present
