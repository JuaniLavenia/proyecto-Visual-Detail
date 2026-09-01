# Proposal: Align frontend auth clients with the wrapped `{success,data,message}` contract

## Intent

`refreshAccessToken()` (`src/lib/api.js:224`) destructures tokens from the raw body, but the backend wraps auth responses in `{success, data, message}`. Both tokens resolve to `undefined`, `updateTokensInStorage(undefined, undefined)` destroys a still-valid token pair, and the user appears logged out while the refresh token is alive. The backend change (Option A, confirmed) standardizes all four auth endpoints, so login/register must move to the same envelope in the same release or they break on deploy.

## Scope

### In Scope

- `src/lib/api.js:224` — read `response.data.data.accessToken` / `.refreshToken`.
- `src/pages/Auth/index.jsx:74` — read `res.data.data` (`accessToken`, `userId`, `role`, `user`, `refreshToken`).
- `src/pages/Auth/index.jsx:112` — same for register.
- Documented verification that no frontend catch/handler depends on the current generic 500 for invalid credentials.

### Out of Scope

- Any new UX: no "session expired" message, no visible behavior change. Pure data extraction.
- `forgotPassword` / `resetPassword`.
- Concurrent-request queue (`isRefreshing`/`refreshSubscribers`), Zustand sync (`App.jsx`), `localStorage` helpers — shape-agnostic, must stay untouched.
- `classifyError` (`src/lib/api.js:100-103`) reading `data?.message`, now unreachable under `{error:{message,code}}`; no consumer displays it today.
- Refresh-token XSS exposure in `localStorage` (deferred to hardening unit 6).

## Capabilities

### New Capabilities

- `auth-session`: token extraction from the wrapped auth contract, single-flight refresh, and session teardown when refresh fails.

### Modified Capabilities

- None.

## Approach

Change only the destructuring boundary at each of the three call sites; every downstream consumer already receives plain values. No new abstraction, no response-unwrapping helper — three lines, reviewable in one pass. UI markup is untouched (no legacy Bootstrap views, no change to the mobile-first Tailwind convention).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/api.js:224` | Modified | Read tokens from `response.data.data` |
| `src/pages/Auth/index.jsx:74,112` | Modified | Read login/register payload from `res.data.data`; `token` → `accessToken` |

## Error-status finding (no change required)

Both auth catch blocks use hardcoded SweetAlert copy and never inspect `err.response.status`, so the backend switch from 500 to real 401/409 needs no frontend adjustment. The response interceptor already excludes `/api/login` and `/api/register` from refresh (`src/lib/api.js:260-261`), so a login 401 cannot trigger a refresh loop.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Frontend and backend deploy out of sync breaks login/register | Med | Ship both PRs together; verify against the updated backend before merge |
| No test runner — regression escapes | Med | Execute the 6 manual cases from `exploration.md`, including login/register regression |
| Field renamed (`token` → `accessToken`) missed at one site | Low | `rg "res\.data\.token"` after apply must return nothing |

## Rollback Plan

Revert the frontend commit (three lines) and the paired backend commit together. Partial revert is unsafe: reverting only one side reintroduces the mismatch. Users keep working sessions; only the token pair persisted during a mismatch window would need a re-login.

## Dependencies

- Backend change `fix-auth-refresh-contract` (wraps all four auth endpoints, removes `errorMidleware` from `auth.router.js`) must be deployed first or simultaneously.

## Success Criteria

- [ ] Refresh returns defined tokens; storage and Zustand hold real values, never `undefined`.
- [ ] Original request retries successfully after refresh; only one `/api/refresh` fires under concurrent 401s.
- [ ] Login and register still succeed end-to-end with the wrapped envelope.
- [ ] Invalid refresh token clears auth and logs the user out; invalid credentials show the existing error copy unchanged.
- [ ] `npm run build` passes.
