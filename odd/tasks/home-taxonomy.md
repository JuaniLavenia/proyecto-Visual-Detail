# Unit 9a: home and taxonomy

**Locator**: odd/tasks/home-taxonomy.md (front repo). Branch `feature/home-taxonomy` in both repos, from `main` after 8e (#14/#14).

## Objective
Brands and categories get an image URL and a "show on home" switch managed from the admin; the home shows only what is marked, with those images; home brands link to the PLP filtered by brand; renaming a brand/category from the admin also updates its products.

## Why
Home images are hardcoded in `src/pages/Home/index.jsx` (Wix URLs for categories, bundled PNGs for brands matched by name); brand cards are not links; renaming a brand/category in the admin leaves its products pointing at the old name (catalog filters match names exactly).

## Decisions
- User, 2026-10-09: option A. A backfill script marks every currently active brand/category `showOnHome: true` and stores the 5 category Wix URLs in the DB; brands keep the bundled PNGs as a fallback (by name) until an image URL is set in the admin. The home looks the same on deploy day.
- User, 2026-10-09: renames must cascade to products.
- The home shows entries that are `isActive && showOnHome`, ordered by `sortOrder`, then name. The plain public lists (`GET /api/brands`, `/api/categories`) are unchanged (PLP filters, admin product selects, Excel import, delete check keep working as today).

## Contract
- Brand/Category fields: `image` (String, default `""`; empty or an `http(s)://` URL, max 2048), `showOnHome` (Boolean, default `false`).
- `GET /api/brands?home=true` and `GET /api/categories?home=true`: public, return `isActive: true, showOnHome: true`, sorted `{ sortOrder: 1, name: 1 }`, each item including `_id, name, slug, image`.
- Admin `POST`/`PUT /api/brands|categories[/:id]` accept `image` and `showOnHome` (validated).
- Rename via `PUT`: when `name` changes, products whose `brand`/`category` equals the old name (case-insensitive, anchored, same as the delete in-use check) are updated to the new name. A name already taken → 409 (`DUPLICATE_ENTRY` or a specific code) before anything is written.
- Home brand link: `/productos?brand=<slug>`.

## Category images to backfill (from the current home map)
- Exteriores: https://static.wixstatic.com/media/5a2c8f_301295c3d8f74fb287c3699812ba9fa9~mv2.jpg/v1/fill/w_1196,h_474,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/5a2c8f_301295c3d8f74fb287c3699812ba9fa9~mv2.jpg
- Interiores: https://static.wixstatic.com/media/5a2c8f_f16fb69ffc1c4805bf10a304f850af93~mv2.jpg/v1/fill/w_1152,h_457,al_c,q_85,enc_auto/5a2c8f_f16fb69ffc1c4805bf10a304f850af93~mv2.jpg
- Línea Profesional: https://static.wixstatic.com/media/5a2c8f_b6f242cd8d0042688594f5474f8a3d12~mv2.jpg/v1/fill/w_1196,h_474,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/5a2c8f_b6f242cd8d0042688594f5474f8a3d12~mv2.jpg
- Línea Industrial: https://static.wixstatic.com/media/5a2c8f_2491e8debfc54edfb758ef28a9ee2bb0~mv2.jpg/v1/fill/w_1196,h_474,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/5a2c8f_2491e8debfc54edfb758ef28a9ee2bb0~mv2.jpg
- Perfumes: https://static.wixstatic.com/media/5a2c8f_060fe2e628f74b1fa4eeb7af95569662~mv2.jpg/v1/fill/w_1152,h_457,al_c,q_85,enc_auto/5a2c8f_060fe2e628f74b1fa4eeb7af95569662~mv2.jpg

## Tasks
- [x] B1 (back) Model fields + validators + service whitelist (create/update) + `?home=true` public listing. Tests.
- [x] B2 (back) Rename cascade to products + duplicate name → 409 before writing. Tests (new `taxonomy.service.test.js`).
- [x] B3 (back) `scripts/backfill-home-taxonomy.js` (`pnpm backfill:home`): dry-run by default, `--apply` writes; sets `showOnHome: true` on active entries that do not have it yet and the 5 category images above when `image` is empty (match names case/accent-insensitively). Idempotent. Pure planning logic under `src/` with tests. README line.
- [x] F1 (front) Admin taxonomy: image URL input with preview, "Mostrar en la home" switch separate from "Activa", home badge/toggle per row, note on rename that products are updated.
- [x] F2 (front) Home: fetch `?home=true` lists, keep `_id/slug/image`, DB image first and the bundled brand PNG map only as a fallback; remove the category Wix map; brand cards link to `/productos?brand=<slug>`; stable keys (`_id`).
- [x] Q1 Tests, build, dry-run + apply of the backfill on the dev DB, browser: admin toggles/images reflected on the home, brand link filters the PLP, rename updates products.

## Checks
- Backend `pnpm test` (test-first B1-B3). Frontend `pnpm build` + browser. Frozen installs if deps change (none expected).
- Review mode (RDD): off (global).

## Delivery
- Single branch per repo, the user merges. Deploy the backend first (the front reads `?home=true`), then run `pnpm backfill:home -- --apply` on production, then deploy the front.

## Route per task
- B1-B3: delegated writer (back). F1-F2: delegated writer (front). In parallel. Q1: parent.

## Progress
- 2026-10-09: exploration done; decision A; feature document created; branches created.

- 2026-10-09: back B1 `865f304` (also `toBoolean()` on the existing isActive validator), B2 `a6d7b03` (409 `TAXONOMY_NAME_TAKEN`; update returns `{ item, productsUpdated }`, PUT message adds "Productos actualizados: N"; no rollback if updateMany fails after save — known gap), B3 `8f1826b`. RED observed per task; `pnpm test` 357/357; lockfile unchanged.
- 2026-10-09: front F1 `0245e06`, F2 `ea9b025`; build OK.
- 2026-10-09: Q1 (dev DB). Backfill dry-run: brands 6, categories 12 (5 with image); `--apply` wrote them; second run plans 0. API: `?home=true` 6 brands / 12 categories (5 images); plain list unchanged. Home renders 6 `/productos?brand=<slug>` links and the category links. Functional checks with the admin session: brand filter returns only that brand (15 Laffitte); hiding "Otros" removes it from the home list only, showing it again restores it; rename "Laffitte" → "Laffitte QA" moved 15 products and back again; rename to an existing name → 409 TAXONOMY_NAME_TAKEN. Pending: visual check of the admin taxonomy screen and the home (screenshots need the window visible).

- 2026-10-09: Q1 visual. Home: brands carousel and categories grid render with Rubik and the 5 DB category images; clicking the Laffitte card opens `/productos?brand=laffitte` (15 products, active filter chip). Admin taxonomy: "Activa" + "Home" pills per row, thumbnails, edit modal with image URL + preview, order, Activa checkbox and "Mostrar en la home" switch.
- Finding (local only): the home first rendered with Bootstrap again. Cause: vite-plugin-pwa `devOptions.enabled: true` registered a dev service worker that served a precached pre-8d `index.html` for `/`. Code and the served HTML were clean (curl: 0 matches). Unregistering the SW and clearing caches fixed it. Production uses `registerType: 'autoUpdate'`, so deployed clients update on their own. The 8d home screenshot was affected by the same stale cache.
- Backlog for 9d: consider `devOptions.enabled: false` (or document clearing the SW) to avoid stale dev renders; icon-only edit/delete buttons in the admin taxonomy rows have no accessible name.

## Next step
Push + PRs. Deploy order: backend → `pnpm backfill:home -- --apply` on production → front.
