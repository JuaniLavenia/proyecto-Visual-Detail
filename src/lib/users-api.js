import api from "./api";

/**
 * Admin user management API helpers.
 * Errors are rejected by the api interceptor as handleError() objects:
 * { type, message, status, code, ... }.
 */

export const USER_ROLES = ["minorista", "mayorista", "admin"];
export const USER_STATUSES = ["active", "inactive"];
export const USER_SORTS = ["newest", "email"];

/**
 * Lists users with server-side pagination, search and filters.
 * Empty params are omitted so the backend applies its defaults.
 * Resolves to { users, pagination, counts }.
 */
export async function listUsers(
  { page, limit, search, role, status, sort } = {},
  { signal } = {},
) {
  const params = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (search?.trim()) params.search = search.trim();
  if (role) params.role = role;
  if (status) params.status = status;
  if (sort) params.sort = sort;

  const res = await api.get("/api/users", { params, signal });
  return {
    users: res.data?.data || [],
    pagination: res.data?.pagination || null,
    counts: res.data?.counts || null,
  };
}

/**
 * Creates a user and sends an invite mail.
 * Resolves to { user, inviteSent }.
 */
export async function createUser({ email, name, role }) {
  const res = await api.post("/api/users", { email, name, role });
  return res.data?.data;
}

/**
 * Updates whitelisted fields: { name?, email?, role?, isActive? }.
 * Resolves to { user }.
 */
export async function updateUser(userId, changes) {
  const res = await api.patch(
    `/api/users/${encodeURIComponent(userId)}`,
    changes,
  );
  return res.data?.data;
}

/**
 * Hard deletes a user (rejected with USER_HAS_ORDERS when they have orders).
 */
export async function deleteUser(userId) {
  const res = await api.delete(`/api/users/${encodeURIComponent(userId)}`);
  return res.data;
}

/**
 * Legacy role endpoint. The backend answers with { data: { usuario } }
 * instead of the { data: { user } } shape used by the newer endpoints.
 */
export async function updateUserRole(userId, role) {
  const res = await api.put(`/api/users/${encodeURIComponent(userId)}/role`, {
    role,
  });
  return res.data?.data?.usuario || null;
}

/**
 * Missing isActive on legacy users means active.
 */
export function isUserActive(user) {
  return user?.isActive !== false;
}
