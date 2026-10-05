# Password recovery (Unit 5, slice 1)

## Objective

Make password recovery work end to end: a user can request a reset link from the login page, an admin can send that same link from the users page, and the link lets the user set a new password.

## Problem / Why

- `forgotPassword` hardcodes the Mailtrap sandbox host (`auth.controller.js:80-81`), so no real inbox ever receives the mail; `SMTP_HOST/PORT` from config are ignored.
- The mail link is `https://visual-detailing.vercel.app/reset/:id?token=` (`:88`), which does not match the route `/api/reset/:id/:token`, and the frontend has no forgot/reset pages at all.
- `POST /api/forgot` returns 422 "No existe el usuario" → email enumeration.
- `resetPassword` does not revoke sessions (`refreshToken` survives) and returns 500 for invalid/expired tokens; both handlers bypass `success()` / `AppError`.
- `authLimiter` is mounted on `/api/auth` (`app.js:27`) but auth routes live on `/api/*`, so login/forgot/reset have no rate limit.
- Admin cannot trigger a recovery for a user (decided: admin sends a recovery link, never sets passwords).

## Scope (decided 2026-10-05)

- In: SMTP mailer configurable by env (provider Brevo, no own domain yet), fixed forgot/reset contract, session revocation on reset, rate limiting for auth routes, frontend forgot + reset pages and login link, admin "send recovery link" action.
- Out: rest of the admin users CRUD (create/edit/delete, status field, pagination, last-admin protection) → next slice. Own domain / DKIM. Token-version revocation of access tokens.

## Constraints

- Provider-agnostic: only SMTP settings in env (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `FRONTEND_URL`). Convict runs `validate({allowed:'strict'})`, so every key goes into the schema first.
- Without an own domain Brevo rewrites the sender to a `@*.t-sender-sib.com` address; accepted for now.
- Keep the reset-token design: JWT signed with `JWT_SECRET + current password hash`, 15 min expiry (single-use in practice).
- Password changes must go through `save()` (pre-save hash); `findByIdAndUpdate` skips hashing.
- Revocation = `refreshToken = null`; an already-issued access token stays valid up to 15 min (accepted).
- Responses use `success()` / `AppError` (`{success:false,error:{message,code}}`). New codes: `INVALID_RESET_TOKEN`, `RESET_TOKEN_EXPIRED`.
- Frontend `classifyError` hides messages for status ≥500 and 401/403; reset errors must be 4xx (400) so the message reaches the UI.
- Credentials are set by the user in `.env`; never committed.

## Tasks

Backend (`proyecto-Visual-Detail-backend`):

- [ ] R1 — Config + mailer: add `smtp.secure`, `smtp.from`, `app.frontendUrl` to convict and `.env-example` (Brevo defaults, no secrets); new `src/utils/mailer.js` (nodemailer transport from config, `sendMail`). Unit test with a stubbed transport.
- [ ] R2 — Password reset service: `requestPasswordReset(email)` (always resolves; sends mail only if user exists; logs SMTP failures without leaking them) and `resetPassword(id, token, password)` (validate, `save()`, clear `refreshToken`, map JWT errors to 400 codes). Link `${frontendUrl}/reset/${id}/${token}`. Controllers return `success()`; forgot always answers the same generic message. Validate `id` as MongoId. Tests first.
- [ ] R3 — Rate limiting: mount `authLimiter` on the real auth routes and add a stricter limiter for `/forgot` and `/reset` (e.g. 5 per 15 min per IP).
- [ ] R4 — Admin endpoint `POST /api/users/:id/password-reset` (`authenticate` + `isAdmin`) reusing the service; 404 `USER_NOT_FOUND` for unknown id (admin-only, no enumeration concern). Tests.

Frontend (`proyecto-Visual-Detail`):

- [ ] W1 — `src/lib/api.js`: auth helpers for forgot/reset; exclude `/api/forgot` and `/api/reset` from the 401 refresh interceptor.
- [ ] W2 — Pages `/recuperar` (email form, generic success message) and `/reset/:id/:token` (new password + confirm, 6–12 chars to match backend, handles invalid/expired link with a CTA to request a new one); "¿Olvidaste tu contraseña?" link on the login form.
- [ ] W3 — Admin users page: "Enviar link de recuperación" action with SweetAlert confirm and result feedback.

## Acceptance criteria

- Requesting a reset for a registered email delivers a mail through Brevo with a link to `${FRONTEND_URL}/reset/:id/:token`.
- Requesting for an unknown email returns the same response as for a known one.
- Opening the link and setting a valid password logs the user out of other sessions (refresh fails) and the new password works on login; the same link fails afterwards.
- Expired or tampered links show a clear message in the UI (400, not 500).
- Admin can send the link from the users page.
- `/api/forgot` is rate limited.

## Checks

- Backend: `npm test` (`node --test "src/**/*.test.js"`).
- Frontend: `pnpm build` (no test runner, no lint script) + manual browser QA.
- End-to-end mail delivery requires the user's Brevo SMTP key in the backend `.env`.

## Known risks / follow-ups

- Backend password rule is 6–12 chars; a 12-char maximum is unusually low (bcrypt allows 72 bytes). Candidate follow-up.
- CORS is fully open (`app.use(cors())`); `FRONTEND_URL` could later drive an allow-list.
- `pre-save` hook logs hashing errors and continues; candidate hardening (Unit 6).
- Frontend `API_BASE` is hardcoded (uncommitted local change to localhost); no `VITE_*` env.

## Progress

- 2026-10-05: exploration done (delegated), feature document created. Waiting for user go-ahead; branch not created yet.

## Route

- Exploration: delegated (mapping trigger, two repos).
- Implementation: delegated writer per repo (2+ non-trivial files each).

## Delivery

- Forecast: ~450 authored changed lines across both repos.
- Strategy: same as Unit 4 unless the user says otherwise — `exception-ok`, one `feature/password-recovery` branch per repo, one commit per task, user merges.
