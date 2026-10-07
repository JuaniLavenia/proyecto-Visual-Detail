# Orders: customer phone + admin orders screen (Unit 7)

Objective: capture the customer's phone (stored on the user profile, asked at checkout only when missing), show it in the admin orders screen, and fix/improve that screen.

## Problem / Why
- No phone is stored anywhere (neither `Pedido` nor `User`), so admins can't contact customers.
- `Pedido` has no timestamps: the admin date column is always "-" and the newest-first sort is a no-op.
- Admin search only filters the current page client-side; header count shows page rows; status filter change double-fetches; full-screen loader on every fetch; status changes without confirmation.
- `POST /api/pedidos` is unauthenticated and trusts `usuario` from the body.

## Scope (decided 2026-10-07)
- `User.phone` (optional on the profile). Checkout modal asks for the phone only when the profile has none; the order request carries it and the backend saves it to the profile.
- `Pedido.telefono` snapshot of the phone at order time (what the admin column shows); `timestamps` on `Pedido`, date falls back to the ObjectId timestamp for legacy orders.
- `POST /pedidos` requires auth and takes the user from the token.
- Admin list: server-side search (order number, email, phone), populate user `name`, real total count.
- Admin UI: phone column with WhatsApp link, server-side debounced search, windowed pagination (Users pattern), inline loading/error, confirm before Cancelado/Completado, total count, no double fetch.

Out of scope: prices/totals on orders, order detail view, rest of hardening (Unit 6), mobile polish (Unit 8).

## Constraints
- Never commit the local `API_BASE` → localhost change in `src/lib/api.js`.
- Local backend points to the production DB: QA mutations only with disposable users.
- One branch per repo: `feature/orders-phone-admin`; one commit per task, Conventional Commits.

## Tasks
- [x] T1 (back) User.phone + Pedido.telefono/timestamps + authenticated POST /pedidos (user from token, phone from body or profile, saved to profile) + validators + tests. — back `b39a9f2`
- [x] T2 (back) Admin list: search param, populate name, date fallback, total count + tests. — back `c4234b2`
- [ ] T3 (front) Checkout modal: phone input when profile has none, send it, expose phone in auth/profile state.
- [ ] T4 (front) Admin orders screen: phone column, server-side search, windowed pagination, inline loading/error, status confirm, total count, no double fetch.

## Acceptance criteria
- A user without phone is asked once at checkout; later orders don't ask again and still carry the phone.
- An unauthenticated `POST /api/pedidos` returns 401; the order belongs to the token user.
- Admin sees phone (WhatsApp link), date, and can search across all pages.

## Checks
- Backend: `pnpm test` (node --test). Frontend: `pnpm build` (no test runner) + browser QA.

## Route
- T1–T4: delegated direct (writer touches 2+ non-trivial files per task).

## Delivery
- exception-ok: one PR per repo, user squash-merges. RDD: off (global).

## Progress
- 2026-10-07: branches created from main (#7). Exploration done.
- 2026-10-07: T1+T2 done (delegated). `pnpm test`: 151/151 pass (parent re-ran). Contract: POST /api/pedidos needs Bearer token, body `{productos, telefono?}`, 400 `PHONE_REQUIRED` when no phone anywhere; logged-in user `phone` comes in login `data.user.phone` (not in refresh); GET /api/admin/pedidos `?page&limit&estado&search` → `{pedidos, total, page, limit, totalPages}`, each order has `telefono`, `fecha`, `usuario{email,role,name,phone}`.
- Follow-ups: no profile edit for phone yet (`PUT /user/:id` untouched); user search has no cap.
