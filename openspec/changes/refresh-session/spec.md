# Spec: Refresh-session contract repair

## Goal
The frontend must reliably renew the access token when the current access token expires, without logging the user out incorrectly, while preserving the existing refresh queue and retry semantics.

## Functional requirements
1. The frontend must read refreshed tokens from the backend response shape returned by the auth controller.
2. The refresh request must keep queueing concurrent requests while a token refresh is in progress.
3. The system must retry the original request using the new access token once refresh succeeds.
4. The system must clear session state only when the refresh token is invalid, expired, or missing.
5. The refresh error path must not trigger a false logout during normal token renewal failures caused by a stale but valid refresh workflow.
6. Refresh behavior must be verifiable through a repeatable test or reproduction path before continuing with the next workstreams.

## Acceptance criteria
- Given a valid refresh token, the user remains signed in after the access token expires and the request is retried successfully.
- Given an invalid or expired refresh token, the app clears the session and stops retrying the request.
- Given multiple concurrent authenticated requests, exactly one refresh operation is attempted and queued requests complete with the new token.
- The frontend handles `response.data.data` and `response.data` consistently with the backend contract.
