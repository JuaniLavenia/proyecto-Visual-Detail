# Tasks: Refresh-session contract repair

## Status
- In progress: refresh contract alignment and verification
- Not started: broader admin/PLP follow-up work

## Task list
1. Confirm backend auth success payload and frontend read path mismatch.
2. Update the frontend refresh contract to consume `response.data.data`.
3. Preserve and validate the concurrent request queue during refresh.
4. Verify invalid or expired refresh token behavior does not suppress legitimate logout conditions.
5. Add a reproducible check or test covering valid refresh, invalid refresh, and multiple simultaneous requests.
6. Record evidence and proceed to the next workstream only after the refresh contract is verified.

## Exit condition
The refresh work is considered complete only when the verification path demonstrates the success and failure cases described in the spec.
