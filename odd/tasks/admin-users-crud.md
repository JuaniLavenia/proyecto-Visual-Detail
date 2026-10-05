# Admin users CRUD (Unit 5, slice 2)

## Objective

Let an admin fully manage users: list with pagination/search/filters, create, edit, deactivate/reactivate, and delete, with sessions revoked on sensitive changes and safeguards for the last admin and for self-actions.

## Problem / Why

- `User` has only `email`, `password`, `refreshToken`, `role` (`backend src/models/User.js:5-25`): no `name`, no status, no timestamps.
- Nothing checks a deactivated user: login (`auth.service.js:35-61`), refresh (`:97-133`) and `authenticate` (`auth.middleware.js:32`) only check existence.
- `GET /api/users` has `authenticate` but no `isAdmin` (`routes/users.js:18`) and no pagination (`user.service.js:37-41`).
- No create, delete, or status endpoints; `updateUserRole` (`users.controller.js:71-76`) has no last-admin/self guard and does not revoke the session.
- Frontend users page counts KPIs client-side and changes role through a `<select>` without confirmation (`src/pages/admin/Users/index.jsx:65-105, 217-268`).

## Scope (decided 2026-10-05)

- In: `name`, `isActive`, timestamps on `User`; inactive users blocked at login, refresh and `authenticate`; admin list with pagination, search, role/status filters and server-side counts; create (invite mail), edit (name/email/role), deactivate/reactivate, hard delete only without orders; last-admin and self guards; refresh-token revocation on deactivate/delete/role change; frontend list + create/edit modal + confirmations.
- Out: admin setting or seeing passwords (decided: recovery/invite mail only); multiple sessions per user (decided: single session, candidate for Unit 6); access-token revocation before its 15 min expiry beyond the `authenticate` status check; route-level tests (Unit 6).

## Constraints

- Admin never sets passwords. Admin-created users get a random high-entropy password (hashed, never returned) and an invite mail to set their own.
- Password changes only through `save()` (pre-save hash).
- Single session: revocation = `refreshToken = null`.
- Hard delete only when the user has no orders → otherwise 409 `USER_HAS_ORDERS`; hard delete also removes the user's cart and favorites.
- An admin cannot deactivate, delete, or demote themselves, and the last active admin cannot be deactivated, deleted, or demoted (`LAST_ADMIN`, `SELF_ACTION_FORBIDDEN`).
- Existing documents lack `isActive`/`name`: missing `isActive` counts as active; `name` optional.
- Search escapes regex input before `$regex`.
- Responses use `success()` / `paginated()` / `AppError`.
- Code, comments, UI copy follow the existing project conventions (UI copy in Spanish as today).

## Assumptions (sensible defaults, change if needed)

- Invite mail: "set your password" variant of the reset mail, link valid 72 h, same JWT design (signed with `JWT_SECRET + password hash`, so single-use).
- Create + mail failure: the user stays created; response `201` with `inviteSent: false`; admin resends with the existing "Enviar link de recuperación" action.
- Inactive user at login gets 403 `USER_INACTIVE` (admin-managed accounts, enumeration not a concern behind valid credentials).

## Tasks

Backend (`proyecto-Visual-Detail-backend`):

- [x] B1 — Model + auth enforcement: `name`, `isActive` (default true), `timestamps` on `User`; login, refresh and `authenticate` reject inactive users (`USER_INACTIVE`). Tests first. (`15b5833`)
- [x] B2 — Admin list (`30254b8`): `GET /api/users` behind `isAdmin`, pagination, escaped search on email/name, `role`/`status` filters, `paginated()` + `counts` for KPIs; `validators/user.validators.js`. Sort must cope with legacy users without `createdAt` (fall back to `_id`). Also (B1 verifier follow-ups): `optionalAuth` ignores inactive users; password-reset mail skipped for inactive users. Tests first.
- [x] B3 — Admin mutations (`637e17c`): `POST /api/users` (create + invite mail), `PATCH /api/users/:id` (whitelist name/email/role/isActive, `EMAIL_IN_USE`), `DELETE /api/users/:id` (hard delete only without orders, cascades cart/favorites); shared last-admin/self guard; revoke `refreshToken` on deactivate/delete/role change, retrofit `PUT /users/:id/role`. Also (B2 follow-ups): `resetPassword` rejects inactive users (a link sent before deactivation must not work); `users.controller.test.js` restores its service stubs. Tests first. May split into B3a (create + invite) and B3b (edit/delete + guards).

Frontend (`proyecto-Visual-Detail`):

- [x] W1 — List (`0d9d93a`): user API helpers in a new `src/lib/users-api.js`; users page with server pagination, search, role/status filters, server KPIs, status badge. Also (from B1): the `api.js` interceptor clears the session on a 403 `USER_INACTIVE` (today only 401 triggers logout, so a deactivated user sits on generic "No tienes permiso" errors for up to 15 min), and the login form shows the `USER_INACTIVE` message instead of the generic 403 text.
- [x] W2 — Actions: `UserFormModal` (create/edit, no password fields) following `TaxonomyFormModal`; SweetAlert confirms for role change, deactivate/reactivate and delete; current admin's row disables self-actions; error codes mapped (`LAST_ADMIN`, `SELF_ACTION_FORBIDDEN`, `EMAIL_IN_USE`, `USER_HAS_ORDERS`, `inviteSent: false`).

## Acceptance criteria

- A deactivated user cannot log in, cannot refresh, and their next authenticated request fails.
- Admin list paginates and filters server-side; KPIs match server counts.
- Creating a user sends an invite mail; the user sets a password through the link and logs in.
- Editing role/status/deleting revokes the target user's session.
- Last active admin and the current admin cannot be deactivated, deleted, or demoted.
- Deleting a user with orders returns a clear message suggesting deactivation.
- Non-admins get 403 on all admin user endpoints.

## Checks

- Backend: `npm test` (`node --test "src/**/*.test.js"`), test-first per task.
- Frontend: `pnpm build` (no test runner) + manual browser QA.

## Known risks / follow-ups

- Access token stays valid up to 15 min after revocation unless `authenticate` rejects it (it does for `isActive`; role changes take effect on the next request since `authenticate` loads the user).
- Auth store `role/isAdmin` in the frontend is not refreshed if an admin changes your role mid-session.
- The users page component is large (react-doctor `no-giant-component`); candidate for extracting a `useUsersList` hook.
- 400 from `requestValidation` uses `{errors:[...]}`, not the standard error shape.
- Last-admin guard is check-then-act: two concurrent demotions can leave zero admins (mitigation: transaction on a replica set, conditional write + re-count, or a lock document). Same race for `Order.exists` before delete. Candidate for Unit 6.

## Progress

- 2026-10-05: exploration done (delegated), decisions recorded (recovery mail only, single session, deactivate + hard delete only without orders). Branch `feature/admin-users-crud` created from `main` in both repos. Feature document created.
- 2026-10-05: B1 (delegated writer, test-first: RED 4 failing → GREEN `npm test` 60/60, re-run by parent). Assess: high (`hot_path` auth middleware), RDD off → independent read-only verifier: PASS WITH FOLLOW-UPS (folded into B2). Committed `15b5833`.
- 2026-10-05: B2 (delegated writer, test-first: RED 17 failing → GREEN 82/82, re-run by parent). Assess: high (`hot_path` auth middleware) → independent verifier: PASS WITH FOLLOW-UPS; `page` upper bound fixed inline, the rest folded into B3/W1. Response shape: `{ success, data: [...], pagination: { currentPage, totalPages, totalUsers, limit }, counts: { total, admins, mayoristas, minoristas, active, inactive } }`. Committed `30254b8`.
- 2026-10-05: B3 (delegated writer, test-first: RED 42 failing → GREEN 126/126, re-run by parent). Assess: medium (`executable_change`) → writer self-verification + parent re-run. Contracts: `POST /api/users` → 201 `{ data: { user, inviteSent } }`; `PATCH /api/users/:id` → 200 `{ data: { user } }`; `DELETE /api/users/:id` → 200; codes `EMAIL_IN_USE`, `USER_NOT_FOUND`, `SELF_ACTION_FORBIDDEN`, `LAST_ADMIN`, `USER_HAS_ORDERS`; `PUT /users/:id/role` keeps `{ usuario }` (W2 must handle both keys). Committed `637e17c`.
- 2026-10-05: W1 (delegated writer; no frontend test runner → no RED, `pnpm build` OK, re-run by parent). Login message (`src/pages/Auth/index.jsx`, outside the writer's surface) done inline by parent. Assess: high (`hot_path` Auth page) → independent verifier: PASS WITH FOLLOW-UPS; fixed inline: `updateUserRole` reads `data.usuario`, USER_INACTIVE logout skips `/api/forgot` and `/api/reset`. User's local `API_BASE` kept out of the commit. Committed `0d9d93a`.
- 2026-10-05: W2 (delegated writer; no test runner → `pnpm build` OK, re-run by parent; react-doctor: `no-giant-component` on the users page and `prefer-html-dialog` on the modal accepted as follow-ups). Assess: medium → writer self-verification + parent re-run. Role changes now go through `PATCH`; `updateUserRole` kept exported but unused. ~720 authored lines (forecast was ~350). Committed together with this document.
- Pending: manual browser QA by the user (checklist in the W2 handoff), then the user merges `feature/admin-users-crud` in both repos.

## Route

- Exploration: delegated read-only explorer (evidence > inline budget).
- B1–B3, W1–W2: delegated writer (2+ non-trivial files each).

## Delivery

- Forecast: ~1,700 authored changed lines (B1 ~250, B2 ~300, B3 ~500, W1 ~300, W2 ~350) → exceeds the ~400 budget.
- Strategy (user decision 2026-10-05): `single-pr` — one branch per unit (`feature/admin-users-crud` in each repo); the user merges to `main`. Line-count risk explicitly accepted. No slicing.
- RDD: off (global) → verification follows the assess tier.
