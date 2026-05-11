# Layout v3, About page, dark mode

## Goal
Add a persistent header/footer layout (variant 3 — gradient stripe), an About page, and a functional dark mode toggle.

## Changes

### frontend/src/hooks/useDarkMode.ts (new)
Custom hook. Reads `localStorage` for saved preference, falls back to `prefers-color-scheme`. Toggles `.dark` class on `<html>` via `document.documentElement.classList`. Persists choice.

### frontend/src/components/Layout.tsx (new)
Wraps every page. Structure:
- 3px blue→red gradient stripe at top of header
- Brand: "Swi" in blue (`text-[#0055A4]`), light blue in dark mode (`dark:text-[#63a9f6]`), "chers" in red
- Upload CTA button (filled blue) top right
- `<main>` fills remaining space
- Footer: dark mode toggle pill (left), links to /about and competitions.ffbb.com (right)

### frontend/src/pages/About.tsx (new)
Route `/about`. 4 sections: C'est quoi Swichers, Comment ça marche (3 steps), Ce que vous trouverez, Pour qui. Footer note linking to FFBB.

### frontend/src/App.tsx
Wrapped all routes in `<Layout>`. Added `/about` route.

### frontend/src/pages/Game.tsx + Team.tsx
Removed `min-h-screen` from loading/error states — conflicted with flex Layout (double scroll).

### documentation/mockups/header-footer.html (new)
3 HTML mockup variants explored before picking variant 3. Gradient on variant 3 changed from tricolor to blue→red.

## Key decisions
- Tailwind v4 dark mode uses `@custom-variant dark (&:is(.dark *))` — class-based, toggled via JS on `<html>`
- "Swi" uses `dark:text-[#63a9f6]` (light blue) for legibility on dark backgrounds
- DarkToggle is a self-contained component in Layout (not shared) — only used once
