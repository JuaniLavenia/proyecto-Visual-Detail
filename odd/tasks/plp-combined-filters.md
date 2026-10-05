# PLP combined filters (Unit 4)

## Objective

Let shoppers combine brand + category filters, sort by price, and paginate filtered results, with the filter state living in the URL.

## Problem / Why

- The PLP applies one filter at a time; filter endpoints (`/productos/brand|category|search/:filter`) have no pagination and inconsistent response shapes.
- Filter state is React state, not URL: links are not shareable, back button loses state.
- `findAll` sorts by `createdAt`, but `Product` has no timestamps, so the default order is undefined.
- `search` passes raw user input into `$regex` (regex injection / ReDoS).
- Brand/category matching uses unanchored fuzzy regex (`brand=car` matches "Full Car").

## Scope (decided 2026-10-05)

- In: combinable `brand` + `category` + `search` on `GET /api/productos`, homogeneous pagination, price sort asc/desc (fixed in code), slugs in URL, loading/error/empty states, admin search migrated to `?search=`.
- Out: admin filter-config panel (covered by `/adm/taxonomia`), price range, stock/availability filters.
- Old branches `origin/feature/plp-filters` / `feature/admin-filter-config` are reference only (pre-#2/#3 base); re-implement by hand.

## Constraints

- `Product.brand` / `category` stay strings (names). Slug → canonical name resolved via `Brand` / `Category` (slug first, name fallback for legacy links).
- Keep legacy `/productos/search|brand|category/:filter` routes until all consumers migrate.
- Keep `paginated()` response shape; `exportProducts` calls `findAll({page:1, limit:10000})` and must keep working.
- Prefer equality queries: `query-sanitizer.js` strips `$`, breaking anchored regexes.

## Tasks

Backend (`proyecto-Visual-Detail-backend`):

- [ ] B1 — Validate `brand`, `category`, `search`, `sort` (`price_asc|price_desc`) on `GET /productos`; cap string lengths.
- [ ] B2 — Taxonomy resolver: slug or name → canonical name; unknown value → empty page.
- [ ] B3 — `findAll` ANDs brand/category/search (escaped), fixed sort map with `_id` tie-breaker (default `_id: -1`). Unit tests via `node --test src`, plus a `test` script.
- [ ] B4 — Point legacy filter routes at `findAll` or keep as-is; confirm no consumer breaks.

Frontend (`proyecto-Visual-Detail`):

- [ ] F1 — `useTaxonomyOptions` returns `{ name, slug }`; update `CategoryBtn`, `ProductCreate`, `ProductEdit`.
- [ ] F2 — PLP: `useSearchParams` as single source of truth (`brand`, `category`, `search`, `sort`, `page`, `limit`), one SWR key on `/api/productos?...`, server `totalPages`, pagination enabled with filters, price sort select, combined empty-state message. Normalize legacy `categoria` param and name values.
- [ ] F3 — Admin products search → `GET /api/productos?search=`.
- [ ] F4 — Home / Banner / Footer links use slugs.

## Acceptance criteria

- `?brand=x&category=y` returns only products matching both, paginated, with correct `totalPages`.
- `?sort=price_asc|price_desc` orders by price, stable across pages.
- Reloading or sharing a PLP URL restores the same filters, sort, and page.
- Admin product search still works.
- Legacy links (`?categoria=`, `?category=<Name>`) still filter correctly.

## Checks

- Backend: `node --test src` (new `test` script). No frontend test runner: `pnpm build` + manual QA in the browser.

## Known risks / follow-ups

- Renaming a Brand/Category does not cascade to product strings (rename drift). Not in scope; candidate for a follow-up.
- No indexes on `Product.brand`, `category`, `price` (performance only).

## Progress

- 2026-10-05: exploration done, feature document created.
- 2026-10-05: branch `feature/plp-combined-filters` created in both repos (from local `main`, each 1 commit ahead of origin). Frontend `package.json` / `pnpm-lock.yaml` changes are pre-existing and out of scope; do not commit them.

## Route

- Exploration: delegated (mapping trigger, two repos).
- Implementation: delegated writer per repo (2+ non-trivial files each).

## Delivery

- Forecast: ~500 authored changed lines across both repos (>400).
- Strategy: `exception-ok` (user accepted the size risk, 2026-10-05). One feature branch per repo, one commit per task, no PRs; the user merges manually.
- After closing: tell the user which old branches can be deleted (`feature/plp-filters`, `feature/admin-filter-config`, others to verify).
