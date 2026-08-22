# Design: Refresh-session contract repair

## System context
The frontend uses a central API client in `src/lib/api.js` with Axios interceptors for request and response handling. The backend auth controller returns token payloads through the shared response formatter, which wraps data under `response.data.data`.

## Root cause
The frontend refresh flow currently reads tokens from `response.data`, while the backend returns data under `success(tokens, ...)`, causing the refresh path to effectively receive `undefined` tokens when the access token has expired. This invalidates the session even when the refresh token itself is still valid.

## Proposed fix
1. Normalize token extraction in the refresh call to `response.data.data.accessToken` and `response.data.data.refreshToken`.
2. Preserve the concurrent request queue by reusing the existing `isRefreshing` and `refreshSubscribers` logic.
3. Ensure `refreshAccessToken()` returns `null` only when the refresh token is missing or invalid/expired and the system should log out.
4. Keep `clearAuthInStorage()` and logout notifications limited to genuine invalid or expired refresh scenarios.
5. Add a reproducible regression check for a valid refresh cycle and a rejected refresh cycle.

## API contract
Frontend refresh call:
- Request body: `{ refreshToken }`
- Backend success payload: `{ data: { accessToken, refreshToken } }`
- Frontend reads: `response.data.data.accessToken`, `response.data.data.refreshToken`

## Verification strategy
Before moving to the next workstream, capture a concrete reproduction of the refresh issue and the corrected behavior:
- valid refresh succeeds and retry completes
- invalid refresh triggers logout
- concurrent requests share a single refresh attempt
