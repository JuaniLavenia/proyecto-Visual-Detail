import api from "./api";

/**
 * Password recovery API helpers.
 * Errors are rejected by the api interceptor as handleError() objects:
 * { type, message, status, code, ... }.
 */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export const RATE_LIMIT_MESSAGE =
  "Demasiados intentos. Esperá unos minutos y volvé a intentar.";

/**
 * Requests a password reset link. The backend always answers with the same
 * generic message, whether the email is registered or not.
 */
export async function requestPasswordReset(email) {
  const res = await api.post("/api/forgot", { email });
  return res.data;
}

/**
 * Sets a new password using the id and token from the emailed link.
 */
export async function resetPassword(id, token, password) {
  const res = await api.post(
    `/api/reset/${encodeURIComponent(id)}/${encodeURIComponent(token)}`,
    { password },
  );
  return res.data;
}

/**
 * Admin only: sends a password reset link to the given user.
 */
export async function sendPasswordResetLink(userId) {
  const res = await api.post(
    `/api/users/${encodeURIComponent(userId)}/password-reset`,
  );
  return res.data;
}

export function isRateLimitError(err) {
  return err?.status === 429 || err?.code === "RATE_LIMIT_EXCEEDED";
}

export function isInvalidResetLinkError(err) {
  return (
    err?.code === "INVALID_RESET_TOKEN" || err?.code === "RESET_TOKEN_EXPIRED"
  );
}
