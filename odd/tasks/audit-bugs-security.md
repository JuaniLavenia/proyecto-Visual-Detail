# Unit 8a: audit bugs and security

**Locator**: odd/tasks/audit-bugs-security.md (front repo). Branch `feature/audit-bugs-security` in both repos, from `main` after the Unit 6 merge.

## Objective
Fix the user-facing bugs and the security findings from the Unit 8 audit (2026-10-09), before the cleanup (8c), the order prices work (8b) and the polish (8d).

## Why
The audit found a cross-user data leak in the profile, passwords echoed in validation errors, a logout that accepts any signed token, generic auth errors that hide the real reason, and a corrupted WhatsApp order message. They affect real users in production.

## Scope
In: the tasks below. Out: order prices/revenue (8b), dead code and deps (8c), refactors, response envelope unification beyond validation errors, indexes (8d).

## Constraints
- `precioMayorista` stays public (user decision 2026-10-09).
- Existing users must keep logging in: the login route has no length rule and keeps none.
- Validation error contract (new, both repos): HTTP 400 `{ success: false, error: { message, code: "VALIDATION_ERROR", details: [{ field, message }] } }`; `message` is the first detail's message. The submitted value is never echoed.
- Both PRs merge together.

## Tasks
- [x] B1 (back) Validation errors follow the contract above, no `value` echo. Tests.
- [x] B2 (back) Logout only revokes when the token is a `type: 'refresh'` token that matches the stored hash; otherwise a no-op 200 (logout stays idempotent). Tests.
- [x] B3 (back) New passwords (register, reset, any admin/user password rule): 8-72 chars, `.isString()`, shared rule; fix "no coinciden". Email `.isString()` on auth routes. Tests.
- [x] B4 (back) Rate limits: login gets its own stricter limiter (skip successful requests); refresh/logout a separate, generous one; admin password-reset and admin invite (POST /users) get a limiter. Tests that the limiters are wired.
- [x] B5 (back) Production safety: refuse the default JWT secret unless `NODE_ENV` is explicitly `development` or `test`; always log unexpected 500s (no stack in the response); malformed JSON → 400 `INVALID_JSON`. Tests.
- [x] B6 (back) Replace `xlsx@0.18.5` (CVE-2023-30533, CVE-2024-22363) with the patched SheetJS build; bulk import keeps working. Tests.
- [x] F1 (front) Remove `UserContext`; profile and orders tabs fetch per mount keyed by `userId`, retry clears the error. No data from a previous user after logout/login in the same tab.
- [x] F2 (front) Login and register show the backend message (and field details when present); generic text only as a fallback (network/500). Client password rule matches 8-72.
- [x] F3 (front) WhatsApp order message built with `encodeURIComponent`; popup not blocked after the `await`.
- [x] Q1 Full backend tests, frontend build, browser QA on the dev DB with a disposable user.

## Acceptance criteria
- After logging out user A and logging in user B in the same tab, the profile shows only B's data and orders.
- A failed register shows the backend's reason; no response ever contains the submitted password.
- Logging out with an old or access token does not end the current session.
- A product name with `&`, `#` or `+` arrives intact in the WhatsApp message.

## Checks
- Backend: `pnpm test` (node --test), test-first for B1-B6. Frontend: `pnpm build` + browser QA (no test runner).
- Review mode (RDD): off (global), so ordinary checks only.

## Delivery
- Single branch per repo, the user merges (stated preference). Forecast: ~500-700 authored lines, mostly backend tests.

## Route per task
- B1-B6: delegated writer (backend, several non-trivial files + tests).
- F1-F3: delegated writer (frontend, several files).
- Q1: parent (tests/build bounded output) + browser QA.

## Progress
- 2026-10-09: feature document created; branches created from `main` in both repos.

- 2026-10-09: back B1 `d0ef80b`, B2 `2824dcb`, B3 `373b6be`, B4 `d8d8524` (login 10/15min skip successful; refresh/logout 300; register/forgot/reset 30; admin invite + password-reset 30), B5 `f202cb0` (test-env preload sets NODE_ENV=test), B6 `61831ca` (xlsx 0.20.3 from cdn.sheetjs.com; import count = upserted + matched). RED observed per task. `pnpm test` 275/275.
- 2026-10-09: front F1 `434410c` (UserContext removed, SWR keyed by userId), contract `e9ae622` (handleError exposes `details` + `serverMessage`), F2 `c03320a`, F3 `d40fb62` (encodeURIComponent, blank tab opened on click, closed on failure), parent follow-ups `d044a76` (orders/users mutations read `details`; password 8-72 constants) and `b20bb93` (stale "Mínimo 6" hint). `pnpm build` OK.
- 2026-10-09: Q1. Live local API: malformed JSON → 400 INVALID_JSON; 7-char register → VALIDATION_ERROR with details, no value echo. Browser: register shows the client 8-72 rule and the backend "El correo ya está registrado"; F1 verified (SPA logout of admin + login as QA user without reload: profile shows only the QA email). F3 verified by code review (every exit path closes the blank tab); no real order was sent.
- Open: xlsx CDN lockfile entry has no integrity hash; reset-password has no confirmation check; register limit 30/15min is a judgment call. Deploy: the server refuses to start without NODE_ENV=production + real JWT_SECRET (already set after Unit 6).

## Next step
User decides push + PRs (both repos, merge together). Then 8b (order prices).
