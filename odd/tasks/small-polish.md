# Unit 8e: small fixes

**Locator**: odd/tasks/small-polish.md (front repo). Branch `fix/small-polish` in both repos, from `main` after 8d (#13).

## Objective
Close the small data and UI issues found during units 8a-8d.

## Why
Admin users/products overflow horizontally on mobile; product, brand and category names are saved with stray spaces and lowercase starts; the reset form checks the confirmation only on the client; very old orders have lines without `cantidad`.

## Scope
In: tasks below. Out: features 9a-9c, refactors 9d.

## Decisions
- Name normalization (user, 2026-10-09): trim (also collapse inner runs of spaces) and uppercase the first character when it is lowercase; the rest of the name is kept as typed (`"KIT PARA…"` stays). Applies to product, brand and category `name`. Slugs are not changed.
- Existing names: a one-off script with a dry-run mode; it reports unique-name collisions instead of writing them. The user decides when to run it against production.

## Contract
- `POST /api/reset/:id/:token` body `{ password, password_confirmation }`; mismatch → 400 VALIDATION_ERROR "Las contraseñas no coinciden". The front starts sending `password_confirmation`; deploy the front first or together.

## Tasks
- [x] B1 (back) Shared `normalizeName` (trim, collapse spaces, first char uppercase if lowercase) applied on create/update of products (including bulk import), brands and categories. Tests.
- [x] B2 (back) `scripts/normalize-names.js` (+ package.json script): dry-run by default (prints changes), `--apply` writes; reports and skips unique collisions. Tests for the pure part.
- [x] B3 (back) Reset requires `password_confirmation` matching `password`. Tests.
- [x] F1 (front) `/adm/usuarios` and `/adm/productos`: no horizontal page overflow at 375px.
- [x] F2 (front) Order lines without `cantidad` show "—" (admin list and profile) instead of "x Nombre".
- [x] F3 (front) Reset sends `password_confirmation`.
- [x] Q1 Tests, build, 375px check, dry-run of the script on the dev DB.

## Checks
- Backend `pnpm test` (test-first B1-B3). Frontend `pnpm build` + browser at 375px. Frozen installs if deps change.
- Review mode (RDD): off (global).

## Delivery
- Single branch per repo, the user merges. Front first or together (reset contract).

## Route per task
- B1-B3: delegated writer (back). F1-F3: delegated writer (front). In parallel. Q1: parent.

## Progress
- 2026-10-09: feature document created; branches created.

- 2026-10-09: back B1 `b4ad053` (normalizeName in the service layer: product create/update, Excel bulkUpsert incl. auto-created brands/categories, taxonomy create/update; slugs unchanged), B2 `2a982eb` (`pnpm normalize:names` dry-run, `-- --apply` writes via bulkWrite; also renames product `brand`/`category` strings that pointed at a renamed brand/category, because catalog filters match names exactly), B3 `eeee156`. RED observed per task; `pnpm test` 319/319.
- 2026-10-09: front F1 `e36c598` (`min-w-0` on grid-item cards was the root cause; icon-only user actions below `sm`), F2 `d702cad`, F3 `0b9d0c2`; build OK.
- 2026-10-09: Q1. Dry-run on the dev DB: brands 1 change ("vonixx vintex" → "Vonixx vintex"), categories 0, products 23, 0 collisions; nothing written. 375/800/1536px: no page overflow on `/adm/usuarios`, `/adm/productos`, `/adm/pedidos`, `/perfil`; mobile cards checked visually; desktop `/adm/usuarios` unchanged.
- Deploy notes: run `normalize:names -- --apply` on production before or right after the deploy (an Excel re-import before it could duplicate products whose stored names are not normalized); creating a brand/category that only differs by the first letter's case now returns 409; deploy the front first or together (reset contract).
- Backlog for 9d: admin product cards show the image alt text when a product has no image (use the placeholder icon); renaming a brand/category in the admin does not update products that reference it (pre-existing).

## Next step
User reviews, push + PRs, run the script on production. Then 9a.
