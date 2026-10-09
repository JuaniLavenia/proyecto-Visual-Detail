# Unit 9c: editable profile and location page

**Locator**: odd/tasks/profile-location.md (front repo). Branch `feature/profile-location` in both repos, from `main` after 9b (#16).

## Objective
Users can see and edit their name and phone in Perfil → Información personal; the email is read-only. A new `/ubicacion` page embeds the store's Google Map.

## Why
The profile only shows the email; the phone (saved at checkout) is not visible or editable. The current self-service endpoint `PUT /api/user/:id` lets a user change the email with no password and no verification, so a stolen session could take over the account through the password reset. "Ubicación" in the header opens Google Maps in another tab (user requests, 2026-10-09).

## Decisions
- User, 2026-10-09: option A. The email is not editable by the user; it is shown read-only with the note "Si querés cambiar tu email, avisale al administrador del sitio." Admins can still change it from the admin users panel (`PATCH /api/users/:id`, unchanged).
- Editable by the user: `name` and `phone`. The phone uses the same validation/normalization as checkout (`normalizePhone`, `+549…`) and is the same field checkout reads.
- Map: no API key. Embed `https://www.google.com/maps?q=-26.8591434,-65.1607417&z=17&output=embed` (place "Visual Detailing E Automotriz", from the current header link `https://goo.gl/maps/pyTLGSD6mtBn7HvN9`), with a "Cómo llegar" link to that place.

## Contract
- `PUT /api/user/:id` (self or admin, as today): editable fields `name` (string, trimmed, 2-80 chars, may be cleared? no — required non-empty when sent) and `phone` (normalized; empty string clears it). `email`, `role`, `password` and any other field in the body → 400 VALIDATION_ERROR "El email solo lo puede cambiar un administrador" for email, generic for others; nothing is written. Response unchanged: `{ success, data: { usuario }, message }`, `usuario` includes `name` and `phone`.

## Tasks
- [x] B1 (back) Self-service profile: editable `name` + `phone`, email rejected with the message above, validators, tests (self, other user 403, admin, email rejected, phone normalized, invalid phone, empty body).
- [x] F1 (front) Perfil → Información personal: show email (read-only + note), name and phone; edit form for name and phone with client validation matching the backend; on save update the shown data and the auth store `phone` used by checkout; backend `details` errors under each field.
- [x] F2 (front) `/ubicacion` page (lazy route): heading, embedded map (responsive iframe, `title`, `loading="lazy"`, `referrerPolicy="no-referrer-when-downgrade"`), address text, "Cómo llegar" button (opens Google Maps in a new tab, `rel="noopener noreferrer"`). Header "Ubicación" links (desktop + mobile, and any footer link) navigate to `/ubicacion`.
- [x] Q1 Tests, build, browser: edit name/phone, phone used at checkout, email note, `/ubicacion` desktop + 375px.

## Checks
- Backend `pnpm test` (test-first B1). Frontend `pnpm build` + browser. No dependency changes expected.
- Review mode (RDD): off (global).

## Delivery
- Single branch per repo, the user merges. Deploy the backend first or together (the front sends `name`/`phone`; the old backend would answer 400 "No hay campos editables").

## Route per task
- B1: delegated writer (back). F1-F2: delegated writer (front). In parallel. Q1: parent.

## Progress
- 2026-10-09: exploration (inline); decision A + note; feature document created; branches created.

- 2026-10-09: back B1 `b16f71e` (src/validators/user.validators.js; cleared phone stored as null; PHONE_INVALID_MESSAGE shared with checkout). RED 16 failing → GREEN; `pnpm test` 373/373.
- 2026-10-09: front F1 `cfe6c52` (reuses `normalizePhone` from src/lib/orders-api.js; updates SWR + auth-store phone; admin row reads `role === "admin"`), F2 `9b135ab` (src/pages/Location, `LocationPage` lazy route; header desktop/mobile and the Contact "Ubicación" card link to `/ubicacion`). Build OK.
- 2026-10-09: Q1. API as the QA user: name trimmed + phone normalized to +549…, email → 400 with the agreed message, role → 400, invalid phone / short name → 400 with field details, empty phone clears it (null), editing another user → 403, password never returned. Browser: `/ubicacion` title clears the header (144 vs 121), map iframe loads with the pin, "Cómo llegar" opens goo.gl in a new tab with noopener; header "Ubicación" navigates to `/ubicacion`; profile shows the email note, only name/phone inputs, client errors match the backend texts, Cancelar restores without saving. 375px: no overflow on `/ubicacion` (map 326×408) and `/perfil`. Not browser-verified: checkout reading the new phone right after saving (covered by the store update in code and the API).

## Next step
Push + PRs (backend first or together). Then 9d.
