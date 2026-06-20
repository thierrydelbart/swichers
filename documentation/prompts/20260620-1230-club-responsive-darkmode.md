# Club page — responsiveness + dark mode

## Goal
Fix the Club page (home/news feed) to properly support dark mode using shadcn CSS variables, and make the layout responsive on mobile/tablet.

## Dark mode
Replace all hardcoded Notion-style hex colors with shadcn CSS variable Tailwind classes:
- `bg-white` → `bg-card`
- `border-black/10`, `/[0.07]`, `/[0.08]` → `border-border`
- `text-black/95`, `/[0.88]`, `/[0.92]` → `text-foreground`
- `text-[#615d59]` → `text-muted-foreground`
- `text-[#a39e98]` → `text-muted-foreground/60`
- `hover:text-black/95` → `hover:text-foreground`
- `hover:bg-[#f6f5f4]` → `hover:bg-muted`
- `bg-[#f6f5f4]` divider → `bg-border`

Blue accent (`#0075de`, `#097fe8`) kept hardcoded — no blue token in this shadcn theme.

### Inverted badge colors in dark mode
Championship badges and score/result tags use light backgrounds in light mode that become illegible in dark mode. Add `dark:` variants to invert them:
- Championship badge: `dark:bg-blue-950 dark:text-blue-400`
- Win badge: `dark:bg-green-950 dark:text-green-400`
- Loss badge: `dark:bg-red-950 dark:text-red-400`

## Responsiveness
- Hero + sidebar grid: `grid-cols-1 lg:grid-cols-[1fr_320px]` (was hardcoded inline style, never collapsed)
- Article grid: `grid-cols-1 sm:grid-cols-2`
- Hero padding: `px-5 pt-5 pb-6 md:px-8 md:pt-7 md:pb-8`
- Hero title: `text-[20px] md:text-[26px]`
- Page heading: `text-[28px] md:text-[36px]`

## Files modified
- `frontend/src/pages/Club.tsx`
