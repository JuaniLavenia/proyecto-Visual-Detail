# Unit 9d-2: data integrity (backend)

**Locator**: odd/tasks/data-integrity.md (front repo, committed on `feature/route-guards`). Branch `feature/data-integrity` in the backend repo, from `main` after 9d-1 (back #17). Delivery: single branch, the user merges. Test runner: backend `pnpm test` (node:test; models are stubbed, tests never connect to MongoDB).

## Specs
- S1 Indexes: `Pedido.usuario`, `Pedido.estado`, `Producto.brand`, `Producto.category` get a regular index; `CartItem.userId` and `Favorite.userId` get a unique index. Declared in the schemas (Mongoose autoIndex builds them).
- S2 Atomic `numeroPedido`: a counter document incremented with `$inc` replaces the "find max + 1" pre-save hook in `src/models/Order.js:46-60`. Two concurrent orders never get the same number. The counter starts from the current highest `numeroPedido` (seeded with `$max`, idempotent), so numbering continues where it is today.
- S3 No duplicate-race on first add: `addToCart` and `addFavorite` (today `findOne` then `save`) must not create two documents for the same user, and must not answer 500 when two first adds race once the unique index exists. Behavior and responses from 9d-1 stay the same (POST cart sets the quantity; duplicate favorite → 400 FAVORITE_ALREADY_EXISTS).
- S4 Rename cascade rollback: `taxonomyService.update` saves the brand/category and runs `Producto.updateMany` inside one transaction (pattern: `withLastAdminGuard` in `src/services/user.service.js`). If the product update fails, the brand/category keeps its old name. Existing behavior (409 on taken name, slug hook, case-only rename) is unchanged.
- S5 Production check script `pnpm check:integrity` following `scripts/normalize-names.js` (dry-run by default, `--apply` to write, Spanish output, pure planner in `src/utils/` with tests). Dry-run reports: users with more than one cart, users with more than one favorites document, duplicated `numeroPedido`, and the counter value it would seed. `--apply` seeds the counter and builds the indexes (`syncIndexes` on the six models), and refuses to build a unique index when duplicates exist, listing them. It never merges or deletes data.
- Assumption: if the dry-run finds duplicates in production, merging them is a separate decision for the user.

## Tasks
| ID | Specs | Route | Status | Evidence |
|---|---|---|---|---|
| B1 | S1-S3 | delegated writer (back) | pending | |
| B2 | S4 | delegated writer (back) | pending | |
| B3 | S5 | delegated writer (back) | pending | |
| Q1 | S1-S5 | parent + independent verifier | pending | |

Route evidence: runs in parallel with 9d-3 (front repo, disjoint), Writer trigger a. Risk items 1 (stored data: indexes, counter) and 4 (concurrency) → independent verifier.

Deploy order: before deploying, the user runs `MONGODB_URI="<prod>" pnpm check:integrity` (dry-run). With no duplicates: deploy, then `--apply` (or let autoIndex build them). With duplicates: stop and decide.

## Log
- L1 (2026-10-13, user): "ya mergee y deploye, sigamos" — continue with 9d-2 ∥ 9d-3 from the approved split: "Índices: `Order.usuario`/`estado`, `Cart.userId` y `Favorite.userId` únicos, `Product.brand`/`category`." + "`numeroPedido` atómico (contador con `$inc`)." + "Renombrar marca/categoría: si falla la actualización de productos después de guardar, no hay rollback."
- L2 (2026-10-13): exploration. No indexes on those fields; no autoIndex config. `numeroPedido` is findOne-max+1 in a pre-save hook (race → E11000 500), untested. Cart/favorites first add is findOne+save (race). Rename cascade = save + updateMany with a case-insensitive regex, no transaction. Transactions already used in `withLastAdminGuard`; README: production is an Atlas replica set.
