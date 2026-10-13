# Unit 9d-1: cart, favorites and orders response contract

**Locator**: odd/tasks/cart-favorites-contract.md (front repo). Branch `feature/cart-favorites-contract` in both repos, from `main` after 9c (front #17, back #16). Delivery: single branch per repo, the user merges. Test runner: backend `pnpm test` (node:test + supertest); the front has no test runner (`pnpm build` + browser).

## Specs
- S1 (back) Cart and favorites use the unified envelope. Every success body is `success(data, message)` → `{ success: true, data: { products: [...] }, message? }`; every error goes through `AppError` and the error middleware → `{ success: false, error: { message, code } }`.
- S2 (back) Writes return the updated list (user decision, 2026-10-13: "dale, vamos con la recomendada"). `POST /api/cart`, `DELETE /api/cart/:userId/:productId`, `POST /api/favorites` and `DELETE /api/favorites/:userId/:productId` respond with the same `data: { products }` the matching GET returns, populated the same way.
- S3 (back) No `null` lists. `GET /api/cart/:userId` and `GET /api/favorites/:userId` return `data: { products: [] }` when the user has no document. Items whose `product` no longer exists (populate returned null) are left out of every response.
- S4 (back) Favorites errors keep their status and message but use the error shape: duplicate add → 400 "El producto ya está en favoritos" (code `FAVORITE_ALREADY_EXISTS`); delete with no favorites document → 400 "No se encontraron favoritos para el usuario" (code `FAVORITES_NOT_FOUND`). Ownership checks stay 403 `FORBIDDEN`.
- S5 (back) Orders: the two raw `INVALID_STATE` 400 responses in `cancelPedido` and `modificarEstadoPedido` become `throw AppError(message, 400, 'INVALID_STATE')`. The response body seen by clients is unchanged.
- S6 (front) One shared module for cart and favorites API calls replaces the repeated "write → GET → syncFromBackend" sequence (8 places in `useProductActions.js`, `pages/Cart/index.jsx`, `pages/Favorites/index.jsx`) and the plain GET + sync in those pages and `Header.jsx`. Each write is one request; the store is synced from the returned `data.products`.
- S7 (front) No behavior change for the user beyond the fixes below: same optimistic updates and rollbacks, same toasts, same pages. Fixed: a user with no cart/favorites no longer hits a TypeError; deleting a favorite no longer does a second GET; favorites errors now carry the backend message and code in the error object (the toasts in ProductCard/ProductDetailContent keep their fixed texts — showing the backend message there would be a UI change nobody asked for).
- Assumption: unused `removeFromCart` / `updateCartQuantity` in `useProductActions` are removed (dead code, nothing imports them).

## Tasks
| ID | Specs | Route | Status | Evidence |
|---|---|---|---|---|
| B1 | S1-S4 | delegated writer (back) | done | back `e211527`; RED 12 → GREEN |
| B2 | S5 | delegated writer (back) | done | back `5a4b915`; RED 2 → GREEN; `pnpm test` 391/391 |
| F1 | S6-S7 | delegated writer (front) | done | front `f7d5b4a`; `pnpm build` OK; only `src/lib/cart-favorites-api.js` calls the endpoints |
| Q1 | S1-S7 | parent + independent verifier | done | verifier: S1-S7 pass, 0 blockers; local API QA pass; browser QA pass (L9) |

Route evidence: B and F are disjoint repos with the contract fixed here, launched together (Writer trigger a). Risk item 3 (contract the front consumes) → independent verifier after the writers' checks. RDD: off (global).

Deploy order: backend first. The old front keeps working with the new backend (GET still has `data.products`; it ignores write bodies). The new front needs the new backend.

Out of scope (backlog): checkout does not empty the backend cart after an order; header refetch on token rotation (9d-3).

## Log
- L1 (2026-10-13, user): "dale, arranquemos!" — start 9d-1 from the approved 9d split: "Formato de respuesta único (`AppError` + `success`/`paginated`) en carrito, favoritos y pedidos." + "Un módulo único de API para carrito y favoritos (hoy la secuencia "post → get → sync" está repetida en ~7 lugares)."
- L2 (2026-10-13): exploration. Orders already use `success()`/`AppError` except the two INVALID_STATE raw 400s. Cart/favorites return raw `{ message, data }`, GET returns `data: null` with no document, favorites 400s send `{ error: "string" }`. Front axios does not unwrap (`res.data.data`). No cart/favorites backend tests; no front test runner.
- L3 (2026-10-13, user): "dale, vamos con la recomendada" — writes return the updated list; `{ products: [] }` instead of null; deleted products filtered.
- L4 (2026-10-13): branches created in both repos.
- L5 (2026-10-13): back B1+B2 done (`e211527`, `5a4b915`; new helper `src/utils/user-product-list.js`; 391/391). Deleting from a non-existent cart still answers 200, now with `products: []`.
- L6 (2026-10-13): front F1 done (`f7d5b4a`). Module `src/lib/cart-favorites-api.js`: `fetchCartProducts`, `setCartProductQuantity`, `removeCartProduct`, `fetchFavoriteProducts`, `addFavoriteProduct`, `removeFavoriteProduct` (one request each, sync the store, return products). POST bodies no longer send `userId` (backend uses the token). Header: each store now syncs independently if one GET fails. S7 reworded: the favorites toasts keep their fixed texts; the backend message only reaches the error object (the original S7 wording was an assumption of the parent, not a user request).
- L7 (2026-10-13): independent verifier, on scratch clones: S1-S7 pass, no blockers. Back `pnpm test` 391/391 plus 5 HTTP probes (INVALID_STATE body identical to main under test/production; a real Mongoose doc with a null product is filtered; POST without `userId` works). Front `pnpm build` OK; behavior parity with `e7e858f` by code review; the old front keeps working with the new back. Advisories: in development, the INVALID_STATE body now includes `error.stack` (as every AppError does); deleted products are filtered from responses but stay stored (pre-existing).
- L8 (2026-10-13): local API QA (back on :5000, dev DB, new disposable user `qa.9d1.*@example.test`): empty GETs return `products: []`; POST cart sets the quantity and returns the list; DELETE returns the updated list; favorite duplicate → 400 FAVORITE_ALREADY_EXISTS; another user's cart → 403 FORBIDDEN; cart and favorites left empty. Browser QA not done: the Chrome extension was not connected.
- L9 (2026-10-13): browser QA (Chrome, localhost:5173, new disposable user `qa.9d1.ui*@example.test`). Login with no cart/favorites: header GETs 200, no errors, no badges. PLP: "Comprar" ×2 and heart ×2 → one POST each (no follow-up GET), badges 2/2, filled hearts, toast; un-heart → one DELETE, badge 1. `/carrito`: "+" → one POST, line total and badge updated; delete → Swal confirm → one DELETE, "Producto eliminado", summary updated. `/favoritos`: "Agregar al carrito" → one POST + toast; delete → Swal → one DELETE, no second GET, empty state shown, badge cleared. Pre-existing (not changed here, backlog): adding a product that is already in the cart from the PLP or favorites sends `quantity: 1`, which resets its quantity to 1 (seen: 2 → 1).
