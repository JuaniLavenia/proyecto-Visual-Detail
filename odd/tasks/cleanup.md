# Unit 8c: cleanup

**Locator**: odd/tasks/cleanup.md (front repo). Branch `chore/cleanup` in both repos, from `main` after #11/#12.

## Objective
Remove what the audit found unused or broken (CDN Bootstrap, dead files, unused dependencies, duplicate lockfiles, dead code, broken deploy files) without changing behavior or how the site looks.

## Why
Bootstrap CSS/JS loads from a CDN and blocks rendering while no Bootstrap class is used; dead files and ~12 unused packages make the code harder to read and the install heavier; the backend Dockerfile and vercel.json are broken; the backend README is inaccurate.

## Scope
In: tasks below. Out: refactors and renames (8d), behavior changes, `sdd/`, `openspec/` and the untracked `PLAN-CAMBIOS-ADMIN-PLP-AUTH.md` (user's planning documents, untouched).

## Constraints
- No visual change. Baseline (on `main`, `/adm/pedidos`, computed `fontSize|lineHeight|textDecoration|boxSizing|marginTop|marginBottom`): body/a/button/input/td `16px|24px|none|border-box|0px|0px`; h1 `40px|48px|none|border-box|0px|8px`; main p `16px|24px|none|border-box|4px|16px`; th `12px|16px|none|border-box|0px|0px`. Screenshots of `/`, `/productos`, `/carrito`, `/adm/pedidos` taken before the change.
- Bootstrap's reboot currently sets some base styles the design relies on (e.g. `p` margin-bottom, heading margins). Keep only those rules in the app CSS (`@layer base`) so the look is unchanged.
- Lockfiles: pnpm only. Any dependency change must keep `pnpm install --frozen-lockfile` working on pnpm 10 (Render) and pnpm 9.

## Tasks
- [~] F1 (front) Remove the Bootstrap CDN CSS/JS from `index.html` and the empty `vendor-ui` chunk; keep the reboot rules the design uses; `lang="es"`; load the Rubik font once.
- [x] F2 (front) Delete unused files (VirtualTable, OptimizedImage, Card, Button, shared/Brands, Banner + css, shared/Pagination + css, empty App.css / Profile index.css, assets/react.svg), after confirming each has no import.
- [x] F3 (front) Remove unused dependencies (@fortawesome/*, aos, bootstrap, glider-js, material-icons, react-bootstrap, react-data-table-component, react-window, workbox-window, and any other confirmed unused) and `package-lock.json`; keep lucide-react unless trivially replaceable.
- [x] F4 (front) Dead code: unused exports in `src/lib/api.js` (`endpoints`, `createAbortController`, redundant login/register branch and its stray comment), unused `useAuthStore` members, unused cart store members; consistent `react-router-dom` imports.
- [x] B1 (back) Remove unused `axios` and `package-lock.json`, unused `src/config/default.json`, `productos.json`; drop the ignored `rateLimit.*` config/env vars (or wire them, whichever is smaller and clearer).
- [x] B2 (back) Dead code: `optionalAuth`, unused service methods (`pedidoService.findAll`, `getOrdersByStatus`, `userService.findByEmail`), unused `error()` formatter, unreachable `if (!pedido)` checks and status re-checks already done by validators, unused taxonomy `name` filter; duplicate index declarations (User.email, Brand/Category). Tests stay green.
- [x] B3 (back) Deploy files: Dockerfile on Node 20 with a correct WORKDIR and pnpm; delete the broken `vercel.json` (Render is the host).
- [x] B4 (back) README accurate: real routes (`/api/login`, refresh/logout/forgot/reset, admin users, taxonomy, admin orders, order body `{ productId, cantidad }`), roles, order statuses, bcrypt rounds, scripts.
- [ ] Q1 Backend tests, frozen-lockfile installs (pnpm 10 + 9) in both repos, frontend build, visual comparison against the baseline.

## Acceptance criteria
- Same computed baseline values and no visible difference on the four baseline pages.
- `pnpm test` (back) and `pnpm build` (front) pass; frozen installs pass on pnpm 10 and 9.
- No Bootstrap request on page load; no removed file or package is still referenced.

## Checks
- Backend: `pnpm test`. Frontend: `pnpm build` + browser comparison. Both: `npx -y pnpm@10 install --frozen-lockfile --ignore-scripts` on a clean copy.
- Review mode (RDD): off (global), so ordinary checks only.

## Delivery
- Single branch per repo, the user merges. Independent PRs (no contract change). Forecast: mostly deletions.

## Route per task
- F1-F4: delegated writer (front). B1-B4: delegated writer (back). In parallel. Q1: parent.

## Progress
- 2026-10-09: baseline captured; feature document created; branches created.

- 2026-10-09: back B1 `5d61851`, B2 `3646534` (3 optionalAuth-only tests removed), B3 `0f28d70`, B4 `b3580b5`; `pnpm test` 291/291; frozen installs OK on pnpm 10.34.6 and 9.15.9; xlsx integrity kept.
- 2026-10-09: front F1 `3e677f6` (Bootstrap JS + vendor-ui chunk removed, lang="es", Rubik once), F2 `0f78b6d`, F3 `3c8951d` (12 deps + package-lock.json), F4 `c7c0fba`; build OK; frozen installs OK on pnpm 10 and 9.
- F1 finding (verified by the parent in the browser): the Bootstrap CSS is NOT just a reboot. Tailwind v4 emits everything in cascade layers and the CDN Bootstrap is unlayered, so Bootstrap element rules and its `!important` utilities (75 class names shared with Tailwind: px-4, border, mt-1, gap-*...) override Tailwind today. Live: `h1.text-3xl.font-bold` renders 40px/500, `border-white/10` renders #dee2e6, `px-4` 24px, body font system-ui instead of Rubik. Disabling the stylesheet in the browser shows the intended Tailwind design (Rubik, subtle borders, tighter spacing; the admin orders table then fits, "Cambiar estado" visible). Bootstrap CSS link kept pending the user's decision.

## Next step
User decides: keep the Bootstrap CSS for now and remove it in its own unit with page-by-page QA, or remove it in 8c.
