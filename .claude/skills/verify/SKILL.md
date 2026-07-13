---
name: verify
description: Build/launch recipe for manually verifying AiDi Studio (web + api monorepo) in this sandboxed environment.
---

# Verifying AiDi Studio

## Install gotcha

A plain `npm install` at the repo root can leave `tailwindcss` and
`lucide-react` with missing `dist/` files in this environment (partial
extraction) — `vite` then fails with `ERR_MODULE_NOT_FOUND` /
`UNRESOLVED_IMPORT`. Fix by force-reinstalling just those two:

```bash
rm -rf node_modules/tailwindcss node_modules/@tailwindcss node_modules/lucide-react
npm install tailwindcss@<version> @tailwindcss/vite@<version> lucide-react@<version> --no-save
```

(match versions from `apps/web/package.json`). Don't let this leak into
`package-lock.json` — after verifying, `git checkout -- package-lock.json
node_modules/.package-lock.json` if `git status` shows them touched.

## Frontend (`apps/web`) — no backend needed for UI-only changes

The app throws `Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY`
at module load (`src/lib/supabaseClient.ts`) even for routes that never call
Supabase, so the SPA renders a blank page without env vars. Create a
throwaway `apps/web/.env` (already gitignored) with placeholder values, e.g.:

```
VITE_SUPABASE_URL="https://placeholder.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_placeholder"
VITE_API_URL="http://localhost:4000"
```

Then:

```bash
cd apps/web && npm run dev -- --port 5183
```

**Best route for widget/component UI changes:** `/components` —
`ComponentsGalleryPage` is public (no auth, no API calls) and renders every
widget type via `WidgetSampleCard` with static sample data
(`components/widgets/sampleData.ts`). This is the fastest way to visually
verify `MetricWidget`, `ChartWidget`, `ListWidget`, `TableWidget`, etc.
without Supabase/API. Use Playwright with
`executablePath: '/opt/pw-browsers/chromium'` (browsers are pre-installed;
`playwright` itself is not — `npm install playwright --no-save` in a
scratch dir if missing) to screenshot it in both themes (a "Light/Dark"
toggle sits top-right).

`DashboardTileCard` (the builder canvas) and `PublicDashboardPage` (shared
dashboard view) both require real Supabase auth/data and can't be reached
this way — for header/wrapper changes shared with `WidgetCardHeader`, you
can temporarily swap it into `WidgetSampleCard`'s render (screenshot, then
revert) as a stand-in, since `WidgetCardHeader` itself has no data
dependency.

Remember to `rm apps/web/.env` and kill the dev server when done.

## Backend (`apps/api`)

Needs a real Supabase project (see root `README.md`) — not practical to
spin up in this sandbox. Prefer `tsc --noEmit` plus reading the route/lib
code for backend-only changes; note in your report that the live API
wasn't exercised.
