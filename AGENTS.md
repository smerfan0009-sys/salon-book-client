# salon-book-client

"SalonBook" — salon appointment booking platform. Next.js 16 App Router + TypeScript + Tailwind CSS v4. Early scaffold: navbar/theme done, home page is an empty shell, no auth, backend, tests, or CI yet.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Commands

- `npm run dev` / `npm run build` / `npm start`
- `npm run lint` — ESLint v9 flat config (`eslint.config.mjs`); no path args
- No test runner and no `typecheck` script; use `npx tsc --noEmit` for type checking (`.next/types` is gitignored but referenced by tsconfig — run `next dev`/`next build` first on a fresh clone)
- npm + `package-lock.json` only; no workspace/monorepo

## Toolchain quirks (all non-default)

- `next.config.ts`: `cacheComponents`, `partialPrefetching`, `reactCompiler` — caching/PPR semantics differ from classic Next.js; see `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` before adding data fetching
- Tailwind **v4** CSS-first: no `tailwind.config.*` / PostCSS config; `@tailwindcss/turbopack` loader in `next.config.ts`; theme lives in `src/app/globals.css` (`@import "tailwindcss"`, `@theme inline`, `@custom-variant dark (&:is(.dark *))`)
- Shadcn **v4** (`base-nova` style): primitives are **Base UI (`@base-ui/react`), not Radix**; `cn` comes from the `cn` package and is re-exported via `src/lib/utils.ts`; components import `cn` from `"cn"` directly, not `@/lib/utils`
- `components.json`: style `base-nova`, `baseColor: zinc`, aliases `@/components/ui`, `@/lib/utils`, `@/hooks`
- Shadcn **dark mode is class-based** (`.dark`), driven by `next-themes` (`src/components/providers/theme-provider.tsx`, `attribute="class"`); root layout sets `<html suppressHydrationWarning>`
- CSS vars use OKLCH; zinc values were applied by hand (CLI preset param 400s against the registry) — don't regenerate `globals.css` via `shadcn init -f` or you'll lose them
- Path alias `@/*` → `./src/*`; source in `src/app/`, not root `app/`

## App state / gotchas

- `src/app/page.tsx` is an empty `<div>` shell — safe to build out
- `src/app/layout.tsx` no longer imports `next/font/google`; `globals.css` still maps `--font-sans` → `var(--font-geist-sans)` which is now undefined, and it ends with duplicate trailing `:root`/`.dark` blocks (hex `#ffffff`/`#09090b`) that override the zinc OKLCH values — inconsistent; verify fonts/theme before styling work
- Auth is **not wired**: `better-auth` (^1.7.25) and `sonner` installed but unused; `src/components/sections/Navbar.tsx` uses a hardcoded mock `Session` (`null`) with `role` → dashboard path mapping (`/dashboard/admin` vs `/dashboard/customer`) — replace with Better Auth session when setting up auth
- Navbar is `"use client"` and imported into the server root layout; keep providers client-side
- Icons: `lucide-react`; 16 shadcn components in `src/components/ui/`
- `.env*` is gitignored; no env setup exists yet
