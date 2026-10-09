# Unit 8b: order prices

**Locator**: odd/tasks/order-prices.md (front repo). Branch `feature/order-prices` in both repos, from `main` after #10/#11.

## Objective
Orders store the real product and unit price taken from the database, so the admin revenue is correct and orders cannot contain made-up products.

## Why
`Pedido.productos` only stores `{ nombre, cantidad }` from the client: revenue (`ventas.total`) is always 0 and any product name is accepted. The profile orders list is also always empty (reads `res.data.pedidos` instead of `res.data.data.pedidos`), and its cancel button calls `updateOrders`, removed in 8a.

## Scope
In: tasks below. Out: stock decrement on purchase (separate unit if wanted), orderNumber atomicity and indexes (8d), role-aware price display on product cards (they already show both prices).

## Decisions
- Legacy orders (no `precio`/`total`) stay as they are: UI shows "—", revenue counts priced orders only (user, 2026-10-09, option A). No backfill.
- `precioMayorista` stays public (user, 2026-10-09).
- Unit price by buyer role: `mayorista` → `precioMayorista` when set, else `price`; `minorista` and `admin` → `price`.

## Contract
- `POST /api/pedidos` body: `{ productos: [{ productId, cantidad }], telefono? }`. `productId` a valid ObjectId, `cantidad` int 1-10000, 1-50 lines.
- Server merges duplicate `productId` lines (sums `cantidad`), rejects unknown/deleted products with 400 `PRODUCT_NOT_FOUND` (VALIDATION-style envelope with the message), snapshots `nombre` = `product.name`.
- Stored line: `{ producto: ObjectId ref "Producto", nombre, cantidad, precio }`; order-level `total` (sum of `precio * cantidad`). Legacy docs lack `producto`, `precio`, `total`.
- Revenue (`getStats`, `getFullStats` → `ventas.total`): aggregate `$sum` of `total` over `Completado` orders (`$ifNull` → 0). Response shapes unchanged.

## Tasks
- [x] B1 (back) Order model: line `producto`/`precio`, order `total` (not required, so legacy docs stay valid).
- [x] B2 (back) Validator for the new body contract. Tests.
- [x] B3 (back) `createForUser`: product lookup, merge duplicates, role price, snapshot name, total, PRODUCT_NOT_FOUND. Tests (rewrite the "only nombre and cantidad" test).
- [x] B4 (back) Revenue aggregate in `getStats`/`getFullStats`. Tests (none exist today).
- [x] F1 (front) Cart sends `{ productId, cantidad }`; cart totals, subtotals and the WhatsApp/clipboard text use the role unit price (shared helper); `getTotalPrice` in the cart store too.
- [x] F2 (front) Profile orders: read `res.data.data.pedidos`; cancel refreshes through SWR `mutate` (no `updateOrders`); per-line price and order total, "—" when missing.
- [x] F3 (front) Admin orders (list + cells): per-line price and order total, "—" when missing; propTypes updated.
- [~] Q1 Backend tests, frontend build, browser QA on the dev DB (minorista and mayorista orders, revenue after completing one, legacy order display).

## Acceptance criteria
- A minorista order stores `price`, a mayorista order stores `precioMayorista` (or `price` when null); the client cannot set the price.
- An unknown productId gets 400; duplicate lines are merged.
- After an admin marks an order Completado, the dashboard revenue increases by its total.
- The profile lists the user's orders; cancelling a pending order refreshes the list.
- Legacy orders render with "—" and do not break stats.

## Checks
- Backend: `pnpm test`, test-first for B2-B4. Frontend: `pnpm build` + browser QA (no test runner).
- Review mode (RDD): off (global), so ordinary checks only.

## Delivery
- Single branch per repo, the user merges. Both PRs merge together (body contract changes). Forecast: ~400-600 authored lines.

## Route per task
- B1-B4: delegated writer (backend). F1-F3: delegated writer (frontend). Run in parallel (separate repos). Q1: parent.

## Progress
- 2026-10-09: exploration done (read-only explorer); feature document created; branches created.

- 2026-10-09: back B1 `b4cf0b4`, B2 `b98c7c7`, B3 `ab1910a`, B4 `4918d57`; RED observed per task; `pnpm test` 294/294. Front F1 `0049cad` (src/lib/pricing.js getUnitPrice + formatPrice), F2 `3e6912b`, F3 `7b7f098`; `pnpm build` OK.
- 2026-10-09: Q1 partial. Live API as the QA minorista: duplicate lines merged (1+2=3), price = `price` (17100), client-sent `precio` ignored, total 51300, line keeps `producto`; unknown productId → 400 PRODUCT_NOT_FOUND; old `{nombre}` body → VALIDATION_ERROR. Browser: profile lists the order with "x3 · $17.100 c/u" and total; "Cancelar Pedido" cancelled it and refreshed without reload (test order #13 left Cancelado).
- Pending (needs the admin account): mayorista price in cart + order, revenue increase after marking an order Completado, admin orders list Total column and "—" on legacy orders at desktop and 375px.
- Noted for 8d: some product names have a leading space (snapshot keeps it); consider trimming `name` on product save.

## Next step
User runs the admin-only checks (or logs in admin for the agent), then push + PRs (merge together).
