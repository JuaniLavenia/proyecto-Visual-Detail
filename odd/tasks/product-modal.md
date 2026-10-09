# Unit 9b: product detail as a modal

**Locator**: odd/tasks/product-modal.md (front repo only). Branch `feature/product-modal` from `main` after 9a (#15).

## Objective
Clicking a product in the PLP opens its detail in a modal over the grid instead of a separate page, keeping a real URL per product.

## Why
The detail page shows little more than the card and takes the user away from their filters and scroll position (user request, 2026-10-09).

## Decisions
- User, 2026-10-09: option A, modal with its own URL (React Router "background location" pattern, react-router-dom 6.10):
  - From the PLP: `navigate(/productos/:id, { state: { backgroundLocation: location } })`; the PLP stays rendered underneath with its filters, page and scroll; the URL is `/productos/:id`.
  - Closing (X, Esc, backdrop, browser Back) returns to the PLP exactly as it was (`navigate(-1)` when opened from the PLP).
  - Direct visit / shared link / Favorites link to `/productos/:id` (no background state): render the PLP (`/productos`, no filters) with the modal open; closing goes to `/productos` (replace).
- The standalone detail page component is not kept as a separate page; its content becomes the modal body.

## Tasks
- [x] T1 Extract the detail content (image, brand, name, chips, prices by role via `src/lib/pricing.js`, stock, description, favorite toggle, add to cart, error and loading states) from `src/pages/ProductDetail` into a reusable component.
- [x] T2 Accessible modal: `role="dialog"`, `aria-modal`, labelled by the product name, focus moved in on open and restored on close, focus trapped, Esc closes, backdrop click closes, body scroll locked, full-screen sheet on mobile, centered card on desktop.
- [x] T3 Routing in `App.jsx`: background-location pattern; PLP card click passes `backgroundLocation`; direct `/productos/:id` renders PLP + modal; close behaviour as decided. Favorites links keep `/productos/:id`.
- [x] Q1 Build + browser: open/close from the PLP with a filter applied (filters/scroll kept), Back button, Esc, direct URL, Favorites "Ver producto", add to cart and favorite from the modal, 375px.

## Checks
- `pnpm build` + browser QA (no test runner). Review mode (RDD): off.

## Delivery
- Single branch, the user merges. Front only.

## Route per task
- T1-T3: delegated writer (front, several files). Q1: parent.

## Progress
- 2026-10-09: decision A; feature document created; branch created.

- 2026-10-09: writer T1 `864f2e2` (ProductDetailContent via useProductActions; old unused shared/ProductDetail removed), T2 `22b5e28` (Modal: portal, dialog semantics, focus trap/restore, Esc on the dialog, backdrop press-start check, scroll lock, z-[60]), T3 `c431dc5` (background location; a direct visit uses a stand-in `/productos` background so the catalog is not remounted on close). Build OK.
- 2026-10-09: Q1 (dev DB). From `/productos?brand=laffitte` scrolled: card click opens the dialog in ~0.7s on a cold chunk without the page loader, labelled by the product name, focus on "Cerrar", body scroll locked, grid still mounted. Esc (dispatched; the tab was hidden so CDP keys did not reach it) and browser Back both return to `/productos?brand=laffitte` with the same scroll (861.6) and the same page instance, no list refetch. Direct `/productos/:id`: catalog + modal; close → `/productos` (replace). 375px: full-screen sheet 375×740, close button visible, no overflow. The first attempt showed the full-page loader because the dev SW had just re-registered and autoUpdate reloaded the page (not the modal code).
- Bug found and fixed (pre-existing, also on the PLP heart in production): `useProductActions.toggleFavorite` always POSTed `/api/favorites`, which only adds (400 when already there), so removing a favorite never worked outside the Favorites page. Now it uses `DELETE /api/favorites/:userId/:productId` when the product is a favorite. Verified remove → add → remove from the modal. Commit below.
- Backlog for 9d: card titles are clickable `h3` elements without keyboard access, so focus returns to `body` after closing when the title was clicked.

## Next step
Push + PR (front only).
