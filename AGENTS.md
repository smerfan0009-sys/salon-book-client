# salon-book-client

Next.js 16 client app (App Router) — currently a fresh create-next-app scaffold; no tests, CI, or backend integration yet.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Commands

- `npm run dev` / `npm run build` / `npm start` — dev, production build, serve build
- `npm run lint` — ESLint v9 flat config (`eslint.config.mjs`), no path args needed
- No test runner and no `typecheck` script; use `npx tsc --noEmit` for type checking
- npm with `package-lock.json` — do not use yarn/pnpm/bun

## Toolchain quirks (all non-default)

- `next.config.ts` enables `cacheComponents`, `partialPrefetching`, and `reactCompiler` — caching/PPR semantics differ from classic Next.js; check `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` before adding data fetching or route handlers
- CSS pipeline: Tailwind CSS **v4** via `@tailwindcss/turbopack` loader in `next.config.ts`; styles use `@import "tailwindcss"` and `@theme inline` in `src/app/globals.css` — there is no `tailwind.config.js` and no PostCSS config
- `babel-plugin-react-compiler` is a devDependency backing `reactCompiler: true`
- Path alias `@/*` → `./src/*` (tsconfig); app source lives in `src/app/`, not root `app/`
- Layouts/pages use generated global types (e.g. `LayoutProps<"/">` in `src/app/layout.tsx`) — these come from `.next/types`, so run `next dev` or `next build` once before `tsc --noEmit` on a fresh clone or tsc will fail on unknown globals

## Conventions / state

- Geist font via `next/font/google` in `layout.tsx`; Tailwind v4 theme tokens (`--color-background`, `--font-sans`, …) map CSS vars declared in `:root`/`@media (prefers-color-scheme: dark)` in `globals.css`
- `next-env.d.ts` and `.next/` are gitignored (Next regenerates them); `next-env.d.ts` is managed by Next — don't hand-edit
- No environment variables, secrets, or `.env` files are set up yet
