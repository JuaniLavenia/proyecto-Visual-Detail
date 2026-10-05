// Spanish copy for the backend error codes of the admin user endpoints.
// classifyError() in src/lib/api.js hides backend messages for 403 and >=500,
// so the code (not the message) decides what the admin reads.
const USER_ERROR_MESSAGES = {
  LAST_ADMIN: "No podés dejar el sistema sin administradores activos.",
  SELF_ACTION_FORBIDDEN:
    "No podés modificar tu propio rol, estado ni eliminar tu cuenta.",
  EMAIL_IN_USE: "Ya existe un usuario con ese email.",
  USER_HAS_ORDERS:
    "El usuario tiene pedidos. Desactivalo en lugar de eliminarlo.",
  USER_NOT_FOUND:
    "El usuario ya no existe. Actualizamos el listado.",
};

export function getUserErrorMessage(error, fallback) {
  if (error?.code && USER_ERROR_MESSAGES[error.code]) {
    return USER_ERROR_MESSAGES[error.code];
  }
  // 400 messages come from the validators (see users-api.js).
  if (error?.status === 400 && error?.message) return error.message;
  if (error?.status === 404) return USER_ERROR_MESSAGES.USER_NOT_FOUND;
  return error?.message || fallback;
}

export function isUserNotFoundError(error) {
  return error?.code === "USER_NOT_FOUND" || error?.status === 404;
}
