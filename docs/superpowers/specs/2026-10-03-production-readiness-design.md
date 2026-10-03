# Design: SIPJOK Production Readiness Hardening

**Date:** 2026-10-03
**Status:** Approved (autonomous mode — user did not respond to scope question; recommended option A chosen)
**Scope decision:** Option A — "Siapkan produksi apa adanya". The 8 placeholder features (Kokurikuler ×3, Ekstrakurikuler ×3, Buku Kunjungan, Refleksi Siswa) were never implemented, are outside the approved migration spec, and are documented as roadmap instead of being built now. Building them would change the live Railway DB schema unilaterally.

## Problem

Audit findings (2026-10-03):

1. **Broken deploy from git.** `server/routes/auth.ts`, `server/middleware/rateLimit.ts`, `client/src/context/NotificationContext.jsx` are untracked but imported by tracked code. A Railway build from the repo fails at runtime.
2. **Local dev crashes.** `server/index.ts` never loads `.env`; `DATABASE_URL` in `.env` is a `localhost` placeholder. Reproduced: boot fails with "DATABASE_URL environment variable is not set".
3. **No README**, no `/health` endpoint for Railway, no `engines` field.
4. **1 TypeScript error** in `server/test-db-connection.ts` (`.rows` on postgres.js result).
5. **Repo hygiene:** staged `.kiro/specs` deleted from disk while `.gitignore` now ignores `.kiro/`; tracked `attached_assets/` (legacy reference) and `.local/` deleted from disk but not staged; `.commandcode/` untracked tooling.
6. **2 MB initial JS bundle** — no code splitting.

## Design

### 1. Runtime fixes
- `server/index.ts`: add `import 'dotenv/config'` as the first import. dotenv never overrides already-set env vars, so Railway-injected vars win; local `.env` now works.
- `server/test-db-connection.ts`: use postgres.js result directly (`result` is the rows array).
- Add `/api/health` (public, no auth) returning `{ status, uptime, timestamp }` — registered in `server/routes.ts` before the 404 handler. Used for Railway checks and monitoring.

### 2. Build & config
- `package.json`: `engines.node >=20`; script `migrate:supabase` for the data migration tool.
- `.gitignore`: add `.commandcode/`.
- Code splitting: `React.lazy()` per route in `client/src/App.jsx` with a shared `Suspense` fallback; keep `Login` eager (first paint). Verify bundle drop in `vite build`.

### 3. Repository hygiene (git)
- Track the three essential untracked source files.
- Preserve `.kiro` spec docs by copying them to `docs/specs/migrate-to-railway-postgresql/` (with task checkboxes updated to reality), then `git rm --cached` the `.kiro` paths so the index matches the `.gitignore` intent.
- Stage the deletions of `attached_assets/` and `.local/` (already removed from disk by the previous session; content remains in git history).
- Commit everything on `main` with a clear message. Do NOT push (no authorization to publish).

### 4. Documentation
- `README.md` (root): overview, feature matrix (implemented vs roadmap), architecture summary, local setup (env vars, `db:push`, dev), Supabase→Railway data migration usage, Railway deployment steps (provision Postgres, set `DATABASE_URL`, build/start commands, health check), API endpoint reference.
- `.env.example`: add `CORS_ORIGIN`, `NODE_ENV` documentation.

### 5. Explicitly out of scope (external dependencies)
- Setting the real Railway `DATABASE_URL` (Railway dashboard).
- Executing the data migration against live Supabase/Railway (task 20) — requires live credentials and target DB.
- Pushing to GitHub (task 22 push step).
- Building the 8 roadmap features (follow-up project).

## Verification
- `npx tsc --noEmit` → 0 errors.
- `npm run build` → success; main bundle substantially smaller than 2 MB.
- Boot the production bundle (`npm start`) → `/` 200, `/api/health` 200, unauthenticated `/api/auth/me` 401, unknown API route 404.
- `git status` clean after commit; all imports resolvable from tracked files.
