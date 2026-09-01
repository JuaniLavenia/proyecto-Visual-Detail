# Delta for Auth Session

## ADDED Requirements

### Requirement: Wrapped-Contract Token Extraction

The frontend MUST extract authentication tokens from the wrapped `{success, data, message}` envelope for `POST /api/login`, `POST /api/register`, and `POST /api/refresh`. The frontend MUST NOT read `accessToken`, `refreshToken`, `userId`, `role`, or `user` directly from the top-level response body for these three endpoints.

#### Scenario: Refresh returns wrapped tokens

- GIVEN an access token has expired and a request receives a 401
- WHEN `refreshAccessToken()` calls `POST /api/refresh` and receives `{success: true, data: {accessToken, refreshToken}, message}`
- THEN the frontend reads `accessToken` and `refreshToken` from `response.data.data`
- AND `updateTokensInStorage()` receives two defined, non-empty string values

#### Scenario: Login returns wrapped payload

- GIVEN a user submits valid credentials to `POST /api/login`
- WHEN the backend responds with `{success: true, data: {accessToken, userId, role, user, refreshToken}, message}`
- THEN the frontend reads all five fields from `res.data.data`
- AND the session is established with the same fields as before the contract change

#### Scenario: Register returns wrapped payload

- GIVEN a user submits valid registration data to `POST /api/register`
- WHEN the backend responds with `{success: true, data: {accessToken, userId, role, user, refreshToken}, message}`
- THEN the frontend reads all five fields from `res.data.data`

#### Scenario: Extraction failure does not overwrite valid tokens with undefined

- GIVEN `response.data.data` is missing or malformed for any of the three endpoints
- WHEN token extraction is attempted
- THEN the system MUST NOT call `updateTokensInStorage()` with `undefined` values that would destroy an existing valid token pair

### Requirement: Single-Flight Refresh Queue (Unchanged Behavior)

While a refresh request is in flight, the system MUST queue concurrent 401 responses and MUST trigger at most one `POST /api/refresh` call. Each queued request MUST retry exactly once, using the newly issued access token, once the in-flight refresh resolves. This requirement's behavior is not modified by this change; it is documented here because the wrapped-contract extraction (above) executes inside the same refresh flow and must not alter queue semantics.

#### Scenario: Multiple concurrent 401s trigger a single refresh

- GIVEN three requests each receive a 401 while no refresh is in flight
- WHEN the first 401 sets the in-flight refresh state and calls `POST /api/refresh`
- THEN the other two 401s are queued as pending promises
- AND exactly one `/api/refresh` call is made

#### Scenario: Queued requests retry once with the new token

- GIVEN a refresh completes successfully with a new access token
- WHEN queued requests are released
- THEN each queued request retries exactly once using the new access token
- AND no queued request retries more than once

### Requirement: Silent Session Teardown on Refresh Failure

WHEN `POST /api/refresh` fails (invalid or expired refresh token), the system MUST clear all persisted auth state (`localStorage` and Zustand store) and MUST log the user out without displaying any new user-facing message. The system MUST NOT introduce a "session expired" notification or any other new UX element as part of this teardown.

#### Scenario: Invalid refresh token clears session silently

- GIVEN the refresh token is invalid or expired
- WHEN `POST /api/refresh` responds with a failure
- THEN `clearAuthInStorage()` runs and the Zustand auth store is logged out
- AND no new alert, toast, or message is shown to the user

#### Scenario: Queued requests are rejected on refresh failure

- GIVEN requests are queued behind an in-flight refresh
- WHEN that refresh fails
- THEN all queued requests are rejected
- AND the user ends up in a logged-out state, not a silently broken authenticated state

## Out of Scope

- Introducing a "session expired" message or any new user-facing copy.
- `forgotPassword` / `resetPassword` flows.
- Changes to `classifyError` (`src/lib/api.js:100-103`).
- Changes to the concurrent-request queue mechanism itself (`isRefreshing`, `refreshSubscribers`) beyond what is documented as unchanged above.
