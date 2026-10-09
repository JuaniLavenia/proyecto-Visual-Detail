# Unit 8d: remove the Bootstrap CSS

**Locator**: odd/tasks/remove-bootstrap-css.md (front repo only). Branch `feature/remove-bootstrap-css` from `main` after 8c (#12).

## Objective
Stop loading Bootstrap 5.2.3 CSS from the CDN so the site renders the design its Tailwind classes describe, and fix whatever relied on Bootstrap.

## Why
Tailwind v4 emits its rules in cascade layers; the unlayered CDN Bootstrap overrides them, including 75 class names shared with Tailwind through Bootstrap's `!important` utilities. Today `h1.text-3xl.font-bold` renders 40px/500, `border-white/10` renders #dee2e6, `px-4` is 24px and the body font is system-ui instead of Rubik. It is also a render-blocking request.

## Decisions
- User, 2026-10-09 (option A in 8c): remove Bootstrap in its own unit with page-by-page review.
- Target look: what the Tailwind classes say (Rubik, Tailwind spacing, subtle borders). Spacing/size changes caused only by shared class names are accepted as intended; anything that breaks (layout collapses, invisible or unstyled controls, light backgrounds, overlapping elements) is fixed.

## Tasks
- [x] T1 Inventory: every Bootstrap-only class used in `src` (no Tailwind equivalent: `row`, `col-*`, `container` behaviour, `modal*`, `alert*`, `badge`, `btn*`, `form-*`, `d-*`, `active`/`show` semantics, etc.) and every element style Bootstrap supplies that the UI depends on (body background/colour, form controls, tables, links).
- [x] T2 Remove the CSS link from `index.html`; replace Bootstrap-only classes with Tailwind equivalents that keep the intended layout; add only the base styles the design needs (e.g. body background/text colour) in the main CSS.
- [~] Q1 Build + page-by-page visual comparison against the "before" screenshots (13 pages) + user review.

## Pages for QA
`/`, `/productos`, `/productos/:id`, `/carrito` (+ checkout modal), `/favoritos`, `/contactanos`, `/login` (login/register/forgot/reset), `/perfil` (both tabs), `/adm/dashboard`, `/adm/pedidos`, `/adm/productos` (+ create/edit), `/adm/usuarios` (+ modals), `/adm/taxonomia`; desktop and ~375px where possible; SweetAlert dialogs and toasts.

## Before screenshots (main, with Bootstrap)
Session folder `claude-chrome-screenshots-ZxeMl5`: 0 home, 1 productos, 2 carrito, 3 adm/pedidos, 8 product detail, 9 favoritos, 10 contacto, 11 perfil, 13 adm/productos, 14 create product, 15 adm/usuarios, 16 taxonomia, 17 dashboard.

## Checks
- `pnpm build`; browser comparison; no console errors. No test runner.
- Review mode (RDD): off (global).

## Delivery
- Single branch, the user merges after reviewing the screenshots.

## Route per task
- T1-T2: delegated writer (front, many files). Q1: parent (browser).

## Progress
- 2026-10-09: before screenshots taken; feature document created; branch created.

- 2026-10-09: writer T1/T2: `82b8221` (only Bootstrap-only usage was one inert `col-12` + 2 dead header CSS rules), `d277b8d` (link removed; body bg-gray-950; pointer cursor on buttons; dropped `.space-y-3` padding hack), `7e7c297` (removed `!important` link overrides that only fought Bootstrap; footer links now use their own `text-white/50` + yellow hover). Build OK.
- 2026-10-09: parent `bf28496`: headings that had no size class fell to 16px without Bootstrap (cart item title was ~28px); added `text-lg` to cart item title, profile "Pedido #" and "Cuenta", footer section titles. Admin products table name left at 16px (correct in a table); ProductCard titles sized by their own CSS.
- 2026-10-09: Q1 desktop screenshots after (session folder, 18-30) vs before (0-17): `/`, `/productos`, detail, `/carrito`, `/perfil`, `/favoritos`, `/contactanos`, dashboard, pedidos, productos, usuarios, taxonomia, create product: Tailwind design renders (Rubik, subtle borders, tighter spacing), no broken layout, no light backgrounds. Mobile (375px iframe): `/`, `/productos`, `/carrito`, `/perfil`, `/adm/pedidos` no page overflow; `/adm/usuarios` 84px and `/adm/productos` 51px overflow, both pre-existing and smaller than with Bootstrap (119px / 205px) → 8e. `/login` not captured (redirects while logged in). Pending: user review.

## Next step
User reviews the before/after screenshots, then push + PR. Then 8e polish.
