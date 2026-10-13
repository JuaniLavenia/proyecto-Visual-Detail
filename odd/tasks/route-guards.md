# Unit 9d-3: route guards, header links and auth store selectors (frontend)

**Locator**: odd/tasks/route-guards.md (front repo). Branch `feature/route-guards`, from `main` after 9d-1 (front #18). Delivery: single branch, the user merges. No test runner: `pnpm build` + browser.

## Specs
- S1 `<AdminRoute>` in `App.jsx` wraps every `/adm/*` route: no session → `<Navigate to="/login" replace>`; session but not admin → `<Navigate to="/" replace>`. The inline checks in the 7 admin pages (Dashboard, Orders, Users, Products, ProductEdit, ProductCreate, Taxonomy) are removed, including the `navigate()` calls during render in ProductEdit/ProductCreate.
- S2 `<AuthRoute>` wraps `/carrito`, `/favoritos` and `/perfil`: no session → `<Navigate to="/login" replace>`. The mount-only checks in Cart and Favorites are removed. `/perfil` gains this guard (it had none).
- S3 Header navigation items are real links (react-router `Link`), desktop and mobile, keeping their classes and side effects (closing the mobile menu). "Cerrar Sesión" is an action, so it becomes a `button` that logs out and goes to `/` exactly as today. The local `NavLink` component that renders a clickable `div` goes away or is renamed so it no longer shadows react-router's name.
- S4 Header's cart/favorites fetch no longer reruns on token rotation: it depends on the user id and whether there is a session, not on the token value. It still runs on login, logout and user switch (including cross-tab).
- S5 `useAuthStore()` without a selector (15 call sites) is replaced by selectors, so components re-render only for the fields they read.
- S6 No other visible change: same pages, texts, styles, toasts and redirects except the ones the user approved in L2.

## Tasks
| ID | Specs | Route | Status | Evidence |
|---|---|---|---|---|
| F1 | S1-S2 | delegated writer (front) | done | `abfd176` |
| F2 | S3-S4 | delegated writer (front) | done | `342bc84` + parent fix `b80f3ae` (inert on the collapsed mobile menu) |
| F3 | S5 | delegated writer (front) | done | `336046f` |
| Q1 | S1-S6 | parent (build + browser) + independent verifier | done | verifier S1-S6 pass, 0 blockers; browser QA (L5) |

Route evidence: one front writer for F1-F3 (shared files: Header, admin pages), in parallel with 9d-2 (backend, disjoint), Writer trigger a. Risk item 2 (guards) → independent verifier together with 9d-2's.

## Log
- L1 (2026-10-13, user): "ya mergee y deploye, sigamos" — 9d-3 from the approved split: "Un único guard de admin (`<AdminRoute>` en `App.jsx`) en lugar del chequeo copiado en 7 páginas con redirecciones distintas." + "Header: ítems de navegación son `div` con `onClick` (pasar a links reales), refetch de carrito/favoritos en cada rotación de token, `useAuthStore()` sin selector en ~16 archivos."
- L2 (2026-10-13, user): "perfecto, me cierra, hagamos asi" — to the proposal: `<AdminRoute>` for `/adm/*` (no session → `/login`, logged-in non-admin → `/`), `<AuthRoute>` for `/carrito`, `/favoritos` and also `/perfil` (no session → `/login`), both with `<Navigate replace>`.
- L3 (2026-10-13): exploration. All 7 admin pages check `!token || !isAdmin`; Users and Taxonomy redirect to `/`, the rest to `/login`; ProductEdit/ProductCreate navigate during render. `/perfil` unguarded. Persisted auth store hydrates synchronously (no loading state). Header effect deps `[token, userId]` rerun on every refresh rotation and cross-tab rehydrate.
- L4 (2026-10-13): writer done. Guards in `src/components/routing/RouteGuards.jsx` as layout routes (redirect before the lazy page loads; the product modal `<Routes>` untouched). Admin pages keep their `token && isAdmin` fetch gates on purpose (removing `token` from their deps would change when they reload). Header `NavItem` = `Link` with the same classes; logout is a `NavButton`; fetch deps `[userId, isLoggedIn]`. Parent added `inert` to the collapsed mobile menu (links became focusable while hidden). Verifier: S1-S6 pass; visible changes are only the approved L2 redirects, real anchors (new tab, focus ring), the collapsed menu out of the tab order, no admin-page flash, and Cart/Favorites redirecting on a logout from another tab.
- L5 (2026-10-13): browser QA (local stack, disposable non-admin user). Logged out: /perfil, /carrito, /favoritos, /adm/usuarios, /adm/productos/create → /login. Logged-in non-admin: /adm/dashboard, /adm/taxonomia → /; /perfil opens. Header DOM: nav items are `<a>`, no clickable divs, logout is `button[type=button]`, collapsed mobile menu has `inert`. Token rotation (cross-tab storage event, and a 401 → /api/refresh → retry): no cart/favorites request. Header link navigates without a reload; logout clears session and cart and lands on /. Not tested: the admin positive path (no admin test user), covered by code review.
