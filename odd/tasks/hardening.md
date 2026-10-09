# Hardening and regression (Unit 6)

Objective: close the open security gaps in auth/session handling and backend configuration, and add route-level regression tests, before the final audit (Unit 8).

## Problem / Why
Audit on 2026-10-08 (both repos, `main` after #8):
- `authenticate`/`optionalAuth` never check the token `type`, and access and refresh tokens share one secret, so a 7-day refresh token works as a Bearer access token (even after logout).
- `JWT_SECRET` falls back to `change-me-in-production` and nothing refuses it in production; `NODE_ENV` defaults to `development`, so a deploy without it returns stack traces.
- `User.refreshToken` is stored in plain text, compared with `!==`, has no `jti` and no reuse detection.
- `cors()` allows any origin; `express.json()` and multer have no explicit size limits; the `User` pre-save hook swallows bcrypt errors.
- `assertAdminSafety` (last-admin guard) is count-then-save, so two concurrent requests can both pass.
- `PUT /pedido/modificar/:id` lets an order owner set their own order to "Completado".
- Frontend: forced logout (refresh failure, `USER_INACTIVE`) is silent; refresh is not coordinated across tabs; `API_BASE` is hardcoded (the local localhost edit must never be committed).
- No HTTP-level tests: limiter wiring, `isAdmin` on routes, ownership and logout are untested.
- The local backend uses the production MongoDB.

Already fixed (stale plan item): `authLimiter` is attached per route in `auth.router.js` since #5.

## Scope (decided 2026-10-08)
- Refresh token stays in localStorage (zustand persist); the backend stores only its hash, rotates it, and revokes the session on reuse. No httpOnly cookie.
- Single session per user stays (Unit 5 decision).

Out of scope: httpOnly cookie, multi-session, frontend test runner (Unit 8), mobile polish (Unit 8).

## Constraints
- Never commit the local `API_BASE` → localhost change in `src/lib/api.js`.
- Local backend points to the production DB: QA mutations only with disposable users.
- One branch per repo: `feature/hardening`; one commit per task, Conventional Commits, no AI attribution. The user merges.
- Deploy impact must be listed in the PR (new or required env vars, one forced re-login after hashing).

## Tasks
- [x] T1 (back) Access tokens carry `type: 'access'`; `authenticate`/`optionalAuth` reject anything else (refresh tokens included). Tests first.
- [x] T2 (back) Config hardening: refuse to start in production with the default `JWT_SECRET`; stack traces only when `NODE_ENV` is explicitly `development`; CORS restricted to `FRONTEND_URL` (+ optional comma-separated `CORS_ORIGINS`); explicit `express.json`/multer limits; bcrypt errors fail the save. Update `.env-example`.
- [x] T3 (back) Refresh tokens: add `jti`, store a SHA-256 hash, constant-time compare, rotate on refresh, revoke the session when a valid-signature but non-current token is presented (reuse). Tests.
- [x] T4 (back) Atomic last-admin guard (conditional update) + order owners cannot set status to "Completado". Tests.
- [x] T5 (back) Route-level tests with supertest against `app.js` (models stubbed like existing tests): limiters wired on auth routes, `isAdmin` on admin routes, order/user ownership, logout, refresh-as-access rejected.
- [x] T6 (front) `API_BASE` from `VITE_API_URL` (fallback to the production URL); toast + redirect to login on forced logout and `USER_INACTIVE`; sync auth state across tabs via the `storage` event.
- [x] T7 Separate dev database: `.env-example` and README notes; the user creates the dev DB in Atlas and points the local `.env` at it.
- [x] T8 Browser QA (disposable user) + full backend tests + frontend build.

## Acceptance criteria
- A refresh token sent as `Authorization: Bearer` gets 401 on any protected route.
- Production start with the default secret exits with a clear error; production errors never include stack traces.
- Reusing an old refresh token returns 401 and logs out the current session.
- Two concurrent demote/delete requests on the last two admins never leave zero admins.
- The frontend tells the user why they were logged out.

## Checks
- Backend: `pnpm test` (node --test). Frontend: `pnpm build` + browser QA.
- Review mode (RDD): off (global), so ordinary checks only.

## Delivery
- Strategy: single branch per repo, user merges (stated preference). Forecast: ~600-800 authored lines across both repos, mostly tests.

## Route per task
- T1-T5: delegated writer (backend, several non-trivial files + tests).
- T6: delegated writer (frontend, several files).
- T7: inline (docs).

## Progress
- 2026-10-08: branches `feature/hardening` created from `main` in both repos.
- 2026-10-08: T1-T4 done (delegated writer). Back commits: T1 `2bbba7e`, T2 `283f873`, T3 `2f987ea`, T4 `31b6d8e` (atomic last-admin guard: transaction that also writes every active admin, so concurrent removals conflict; loser gets 409 CONCURRENT_UPDATE) + `0768bb3` (owners can only cancel a pending order). `pnpm test` 196/196.
- 2026-10-08: T5 done. Back `aa45800` (supertest 7.3.1; src/test-helpers/http-app.js, auth.http.test.js, access-control.http.test.js). `pnpm test` 238/238. Follow-ups: admin POST /api/users/:id/password-reset has no rate limiter; logout does not compare the token to the stored hash.
- 2026-10-08: T6 code done (delegated writer). Front `990ff1b` (API_BASE from VITE_API_URL, prod fallback), `cab51cd` (forced-logout toast + redirect; a refresh that fails because the backend is unreachable no longer logs out), `63da386` (storage-event sync + navigator.locks refresh). `pnpm build` OK. PENDING (user): create `.env.example` (commit) and `.env.local` (gitignored) because .env* writes are blocked for the agent; stash `local API_BASE localhost` can be dropped after. Browser QA pending.
- Deploy notes: JWT_SECRET required in production; set NODE_ENV=production; FRONTEND_URL must be the real front (extra origins via CORS_ORIGINS); one forced re-login; admin demote/deactivate/delete needs a replica set (Atlas).

- 2026-10-09: front `.env` + `.env.example` created by the user; `.env` added to `.gitignore` (only `*.local` was ignored). Dev DB created by the user (catalog copied, only 2 users). README notes still pending.
- 2026-10-09: T8 partial. `pnpm test` 238/238, `pnpm build` OK. Browser QA (disposable user qa.hardening.*@example.test on dev DB): refresh-as-Bearer 401 INVALID_TOKEN; silent refresh + rotation OK; reused refresh → 401 and current session revoked; forced logout toast + redirect to /login OK without reload. With reload the toast was skipped 2 of 3 times: refresh waited ~180 ms on navigator.locks, which points to another app tab ending the session first (that tab shows the toast, this one syncs silently). The user confirmed another localhost tab was open (the toast there was not observed).
- QA findings (Unit 8): register password limited to 6-12 chars; express-validator errors echo the password in `value`; register error dialog is generic ("email ya registrado o datos inválidos") for every 400.

- 2026-10-09: T7 done. Backend README documents the dev DB rule (no real users or orders, @example.test QA users) and the production env (NODE_ENV, JWT_SECRET, FRONTEND_URL, CORS_ORIGINS, replica set).

## Next step
User commits front `.env.example` (unread by the agent), pushes `feature/hardening` in both repos and opens the PRs. Then Unit 8 (final audit).
