# Tasks: Align frontend auth clients with the wrapped `{success,data,message}` contract

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~12 (6 lines modified × add+del) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

Rationale: 3 call sites, 6 total lines touched (`api.js:224`; `Auth/index.jsx:73,74,76`; `Auth/index.jsx:112,113`). Confirmed against current file contents. `single-pr` under this delivery strategy still requires `size:exception` before apply per the review workload guard — flag as trivial exception (6-12 lines, no new abstraction) when requesting it.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Fix `refreshAccessToken()` token extraction (the actual bug) | PR 1 | N/A — no test runner | Manual cases 1, 2, 3, 5 from `exploration.md`, backend running locally | Revert `src/lib/api.js:224` alone; independent of login/register |
| 2 | Align login/register extraction to the same envelope | PR 1 | N/A — no test runner | Manual case 6 from `exploration.md`, backend running locally | Revert `src/pages/Auth/index.jsx` hunks; must ship with Unit 1, not independently revertible against the paired backend deploy |

Both units ship in the same PR (single-pr strategy); listed separately only to preserve dependency order and independent verification.

## Phase 1: Refresh Token Extraction (the actual bug)

- [x] 1.1 In `src/lib/api.js:224`, change `const { accessToken, refreshToken: newRefreshToken } = response.data;` to `const { accessToken, refreshToken: newRefreshToken } = response.data.data;`. Satisfies spec requirement "Wrapped-Contract Token Extraction", scenario "Refresh returns wrapped tokens". DONE.
- [ ] 1.2 Manual verify — Case 1 (`exploration.md`): log in, corrupt/expire the access token in `auth-storage`, trigger an authenticated request. Pass: exactly one `/api/refresh` 200 in Network; `auth-storage.token` becomes a new non-`undefined` JWT; original request returns 200; no logout. **BLOCKED — sandbox environment limitation**: MongoDB Atlas is unreachable from this sandbox (`querySrv ECONNREFUSED`), so the backend cannot serve real login/refresh responses; no live round-trip is possible here. Requires an environment with MongoDB access.
- [ ] 1.3 Manual verify — Case 2: replace `refreshToken` in `auth-storage` with garbage, trigger an authenticated request. Pass: `/api/refresh` 401; `clearAuthInStorage()` runs; queued requests rejected; UI shows logged-out state; no new alert/toast. Satisfies spec requirement "Silent Session Teardown on Refresh Failure". **BLOCKED — same DB-unreachable sandbox limitation as 1.2.**
- [ ] 1.4 Manual verify — Case 3 (rotation): immediately after 1.2, replay the previous (now-superseded) refresh token. Pass: old token rejected with 401; the new token remains present and usable in storage. **BLOCKED — depends on 1.2, same DB-unreachable sandbox limitation.**
- [ ] 1.5 Manual verify — Case 5 (concurrency): with an expired access token, load a view that fires several authenticated requests at once. Pass: exactly one `/api/refresh` call in Network; every queued request retries exactly once and succeeds. Satisfies spec requirement "Single-Flight Refresh Queue (Unchanged Behavior)". **BLOCKED — same DB-unreachable sandbox limitation as 1.2.**

## Phase 2: Login/Register Extraction Alignment

- [x] 2.1 In `src/pages/Auth/index.jsx:73-76`, update the stale comment and destructure from `res.data.data`: replace lines 73-76 per design (`// El backend devuelve: { success, data: { userId, accessToken, refreshToken, role, user }, message }`, `const { accessToken, userId, role, user, refreshToken } = res.data.data;`, keep `roleUsuario` line unchanged, `login(accessToken, refreshToken, userId, roleUsuario);`). Satisfies spec scenario "Login returns wrapped payload". DONE.
- [x] 2.2 In `src/pages/Auth/index.jsx:112-113`, destructure from `res.data.data` and rename `token` to `accessToken`: `const { accessToken, userId, role = "minorista", refreshToken } = res.data.data;` then `login(accessToken, refreshToken, userId, role);`. Satisfies spec scenario "Register returns wrapped payload". DONE.
- [ ] 2.3 Manual verify — Case 6 (regression, requires paired backend running): full login with valid credentials, then register a new email. Pass: session established, `auth-storage.token` holds the real `accessToken`, redirect to `/`; then retry login with invalid credentials and confirm the existing SweetAlert copy ("Email o contraseña incorrectos") still shows unchanged. **BLOCKED — same DB-unreachable sandbox limitation as 1.2.**
- [ ] 2.4 Manual verify — Case 4 (logout, unaffected by this change but must stay green): click logout with network throttled/offline. Pass: Zustand and storage cleared immediately regardless of `/api/logout` outcome. **BLOCKED — requires a running app instance to click through; not exercised in this apply session (unaffected code path, low risk).**

## Phase 3: Contract Verification and Build

- [x] 3.1 Run `rg "= res\.data;" src/pages/Auth/index.jsx` — MUST return nothing (confirms both sites now read `res.data.data`). DONE — zero matches.
- [x] 3.2 Run `rg "res\.data\.token"` across `src/` — MUST return nothing (confirms no stray flat-shape read of `.token` remains). DONE — zero matches (also checked `response\.data\.accessToken` — zero matches).
- [x] 3.3 Diff-review the three "Explicitly NOT touched" rows from `design.md` (concurrent-request queue `src/lib/api.js:187-204,263-275`; Zustand sync `src/App.jsx:40-58`; `localStorage` helpers) — confirm zero changes to these blocks in the final diff. DONE — `git status`/`git diff` confirm only `src/lib/api.js` (line 224) and `src/pages/Auth/index.jsx` (lines 73-76, 112-113) changed.
- [x] 3.4 Run `npm run build` — MUST pass (per `openspec/config.yaml` verify.build_command). DONE — build succeeded (`✓ built in 35.33s`) after repairing a pre-existing broken `node_modules` linkage in this sandbox (unrelated to this change; fixed via `pnpm install --frozen-lockfile`, no lockfile changes).

## Key Learnings

1. Reading the exact current source lines (not just design excerpts) confirmed the estimate at ~6 modified lines / ~12 changed lines, well under the 400-line review budget.
2. `single-pr` delivery strategy still requires an explicit `size:exception` decision before apply per the review workload guard, even when the estimate is trivially small.
3. This change has no applicable threat-matrix rows (client-side data extraction only), so no RED-test tasks were required — all verification is manual per `exploration.md`.
4. Manual verification tasks were ordered so Phase 1 (the actual bug) is independently verifiable before Phase 2 (login/register alignment), even though both ship in the same PR.
