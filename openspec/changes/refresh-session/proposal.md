# Proposal: Refresh-session contract repair

## Summary
This change fixes the broken access-token refresh flow between the frontend and backend. The immediate root cause is contract drift: the backend wraps the token payload in `response.data.data`, while the frontend reads `response.data` directly. The change also establishes a reproducible verification flow before broader admin and PLP work continues.

## Scope
- Align token response contract between backend and frontend
- Preserve concurrent request queuing during refresh
- Ensure logout only occurs on invalid or expired refresh token
- Add a repeatable verification path for refresh timing and failure cases
- Keep the work narrow so admin and PLP work can proceed afterward without rework

## Non-goals
- Full admin CRUD redesign in this slice
- Brand/category models and PLP configuration migration
- User management permission hardening beyond refresh-related impact

## Risks
- A hidden response contract mismatch can silently log users out during a valid refresh cycle.
- Async refresh races can duplicate or cancel legitimate requests if the queue logic is not preserved.
- A fix without verification can appear healthy while still breaking edge cases such as expired refresh tokens or simultaneous requests.

## Delivery mode
- Interactive SDD
- Engram + OpenSpec in parallel
- Single branch used across frontend and backend repositories
