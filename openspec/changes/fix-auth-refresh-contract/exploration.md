# Exploration: fix-auth-refresh-contract (frontend)

Fecha: 2026-09-01
Alcance: `proyecto-Visual-Detail` (frontend). Change cross-repo, contraparte en `proyecto-Visual-Detail-backend`.

## Estado actual confirmado

- `src/lib/api.js:224`, dentro de `refreshAccessToken()`: `const { accessToken, refreshToken: newRefreshToken } = response.data;` — lee el body crudo de `POST /api/refresh`. Si el backend envuelve con `{success, data, message}`, ambos valores quedan `undefined`. `updateTokensInStorage(undefined, undefined)` sobreescribe el par de tokens todavía válido, y las siguientes requests mandan `Authorization: Bearer undefined` → 401 → el usuario parece deslogueado sin que el refresh token haya expirado. Reproduce exactamente el bug diagnosticado.
- **Login** (`src/pages/Auth/index.jsx:74`): `const { token, userId, role, user, refreshToken } = res.data;` — plano, sin `.data.data`. Funciona hoy, confirma que `/api/login` no está envuelto.
- **Register** (`src/pages/Auth/index.jsx:112`): mismo patrón plano, también funciona hoy.
- **Logout** (`src/stores/useAuthStore.js:51-73`, `logoutWithApi`): limpia el estado de Zustand primero, dispara `fetch(POST /api/logout, {refreshToken})` y nunca lee el body de la respuesta (solo captura errores de red). Es agnóstico al shape del contrato; no necesita cambios en ninguna opción.

## Áreas afectadas

- `src/lib/api.js:224` — el bug real; necesita `.data.data` bajo Opción A, probablemente sin cambios bajo Opción B.
- `src/pages/Auth/index.jsx:74,112` — extracción de tokens en login/register; solo se ven afectados bajo Opción A.
- `src/stores/useAuthStore.js` — persistencia y `updateTokens`; agnóstico al shape, sin cambios.
- `src/App.jsx:41-58` — callback de sincronización de Zustand (`onAuthTokenRefreshed`); agnóstico al shape, sin cambios.

## Cola de requests concurrentes (debe mantenerse intacta)

`isRefreshing` + `refreshSubscribers` en `src/lib/api.js` (líneas 187-204, 263-275) implementan un refresh único en vuelo: un 401 mientras `isRefreshing` es true encola la request como una promesa que se resuelve una vez que `onTokenRefreshed` dispara. Esta lógica es independiente del shape de la respuesta de refresh — solo la línea de destructuring (224) necesita cambiar. Existen dos canales de notificación separados (`onTokenRefreshed`/`refreshSubscribers` para las llamadas axios encoladas, `notifyTokenRefreshed`/`onTokenRefreshCallbacks` para la sync de Zustand vía `App.jsx`) — duplicación preexistente, fuera de alcance de este change.

## Persistencia de tokens

Zustand `persist` (`src/stores/useAuthStore.js`, key `"auth-storage"`, `partialize` → `{token, refreshToken, userId, role, isAdmin}`). `src/lib/api.js` bypasea Zustand y lee/escribe `localStorage["auth-storage"]` directamente (`getAuthFromStorage`, `updateTokensInStorage`, `clearAuthInStorage`) para evitar un import circular. Estos helpers solo mueven los valores que reciben — agnósticos al contrato.

## Exposición XSS (documentado, no se resuelve en este change)

El refresh token se persiste en texto plano en `localStorage`, legible por cualquier script corriendo en la página. Diferido explícitamente a la unidad 6 de hardening del plan; sin acción en este change.

## Alternativas (dependen de la decisión del backend)

### Opción A — el backend envuelve TODOS los endpoints de auth (`{success, data, message}`)

- Cambios en frontend: `api.js:224` → `response.data.data`; `Auth/index.jsx:74` y `:112` → `res.data.data`.
- Pros: envoltorio consistente en toda la superficie de la API.
- Contras: toca 3 call sites, 2 de los cuales (login/register) hoy funcionan — riesgo de regresión sobre flujos que no están rotos.
- Esfuerzo: bajo, pero con riesgo de regresión no nulo.

### Opción B — el backend desenvuelve refresh/logout (plano, igual que login/register)

- Cambios en frontend: `api.js:224` sin cambios o trivial si los nombres de campo coinciden exactamente; login/register/logout intactos.
- Pros: diff de frontend de a lo sumo una línea, cero riesgo de regresión sobre flujos que ya funcionan, diff mínimo para revisar.
- Contras: deja cualquier convención `{success,data}` preexistente en otros dominios inconsistente con auth (una preocupación arquitectónica del backend, no del frontend).
- Esfuerzo: muy bajo, menor riesgo.

## Recomendación

**La Opción B es técnicamente menos riesgosa para el frontend.** Requiere como máximo un cambio de una línea (`src/lib/api.js:224`) y cero flujos que ya funcionan tocados, contra los 3 call sites de la Opción A, 2 de los cuales funcionan correctamente hoy. Esta evaluación está acotada al riesgo de implementación en frontend — no pesa las implicancias de consistencia del lado del backend, que es responsabilidad del explore del backend. Sea cual sea la opción, el fix está aislado al destructuring de `refreshAccessToken()` (más 2 líneas adicionales solo bajo Opción A); la cola, la sync de Zustand y los helpers de `localStorage` no necesitan cambios en ninguna opción.

## Casos de prueba manual

No hay test runner en este proyecto (confirmado en sdd-init: sin script `test`, sin vitest/jest/@testing-library).

1. Expiración de access token → refresh exitoso → tokens extraídos correctamente (no `undefined`) → storage y Zustand actualizados → request original reintentada con éxito.
2. Refresh token inválido/expirado → `clearAuthInStorage()` dispara → requests encoladas rechazadas → `useAuthStore.logout()` disparado vía `App.jsx` → el usuario queda correctamente deslogueado (no atascado en el estado silenciosamente roto actual).
3. Rotación de refresh token → el token viejo deja de ser usable, se persiste el nuevo.
4. Logout → el estado local se limpia inmediatamente sin importar la respuesta del backend.
5. Requests concurrentes durante el refresh → solo se dispara un `/api/refresh`; todas las requests encoladas reintentan exactamente una vez con el token nuevo.
6. Solo Opción A: chequeo de regresión de login y register end-to-end después de cambiar a `.data.data`.

## Riesgos

- Bloqueante cross-repo: el fix de frontend no se puede cerrar hasta que el backend confirme Opción A vs B.
- Sin cobertura de tests automatizada para la lógica de interceptor/refresh — toda la verificación es manual.
- La Opción A arriesga regresionar 2 flujos que hoy funcionan (login/register) para arreglar 1 que está roto (refresh).
- La exposición XSS del refresh token en `localStorage` queda sin resolver (diferida a la unidad 6).

## Listo para propuesta

Sí en cuanto al contenido de la exploración — ambas ramas están acotadas y son accionables. El change queda BLOQUEADO cross-repo hasta que el backend confirme la decisión de contrato (Opción A vs B) antes de `sdd-propose`/`sdd-apply`.
