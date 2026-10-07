import api from "./api";

/**
 * Orders API helpers (checkout + admin orders screen).
 * Errors are rejected by the api interceptor as handleError() objects:
 * { type, message, status, code, ... }.
 */

export const ORDER_STATUSES = ["Pendiente", "Completado", "Cancelado"];

export const PHONE_MIN_DIGITS = 8;
export const PHONE_MAX_DIGITS = 15;

const PHONE_ALLOWED_CHARS = /^[\d\s+()-]+$/;
const NORMALIZED_PHONE = new RegExp(
  `^\\+?\\d{${PHONE_MIN_DIGITS},${PHONE_MAX_DIGITS}}$`,
);

/**
 * Mirrors the backend rule: digits, spaces, "+", "-" and parentheses are
 * accepted as typed; the result is an optional leading "+" plus 8-15 digits.
 * Returns null when the value is not a valid phone.
 */
export function normalizePhone(value) {
  if (typeof value !== "string" || !PHONE_ALLOWED_CHARS.test(value)) {
    return null;
  }
  const compact = value.trim().replace(/[\s()-]/g, "");
  return NORMALIZED_PHONE.test(compact) ? compact : null;
}

/**
 * Digits only, for wa.me links. Returns "" when there is nothing usable.
 */
export function phoneDigits(phone) {
  return typeof phone === "string" ? phone.replace(/\D/g, "") : "";
}

// express-validator answers 400 with { errors: [{ path, msg }] }, a shape that
// handleError() in api.js collapses into a generic message. Mutations accept
// the 400 here and reject with the first message plus the raw errors.
const ACCEPT_BAD_REQUEST = {
  validateStatus: (status) => (status >= 200 && status < 300) || status === 400,
};

function rejectBadRequest(res) {
  if (res.status !== 400) return res;
  const body = res.data || {};
  const errors = Array.isArray(body.errors) ? body.errors : [];
  const message = errors[0]?.msg || body.error?.message || "Datos inválidos";
  // Same fields as handleError() so screens can treat both alike.
  throw Object.assign(new Error(message), {
    type: "VALIDATION_ERROR",
    status: 400,
    code: body.error?.code || "VALIDATION_ERROR",
    errors,
  });
}

/**
 * Creates an order for the logged-in user (owner comes from the token).
 * `telefono` is sent only when given; otherwise the backend uses the
 * profile phone and rejects with PHONE_REQUIRED when there is none.
 * Resolves to the created order (with the normalized `telefono`).
 */
export async function createOrder({ productos, telefono }) {
  const body = { productos };
  if (telefono) body.telefono = telefono;
  const res = rejectBadRequest(
    await api.post("/api/pedidos", body, ACCEPT_BAD_REQUEST),
  );
  return res.data?.data || null;
}

/**
 * Admin: lists orders with server-side pagination, status filter and search.
 * Empty params are omitted so the backend applies its defaults.
 * Resolves to { pedidos, total, page, limit, totalPages }.
 */
export async function listAdminOrders(
  { page, limit, estado, search } = {},
  { signal } = {},
) {
  const params = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (estado && estado !== "todos") params.estado = estado;
  if (search?.trim()) params.search = search.trim();

  const res = await api.get("/api/admin/pedidos", { params, signal });
  const data = res.data?.data || {};
  return {
    pedidos: data.pedidos || [],
    total: data.total ?? 0,
    page: data.page ?? page ?? 1,
    limit: data.limit ?? limit,
    totalPages: data.totalPages ?? 1,
  };
}

/**
 * Admin: changes an order status. Resolves to the updated order (its
 * `usuario` is not populated, so merge only the fields you need).
 */
export async function updateOrderStatus(orderId, nuevoEstado) {
  const res = await api.put(
    `/api/admin/pedidos/${encodeURIComponent(orderId)}/status`,
    { nuevoEstado },
  );
  return res.data?.data?.pedido ?? null;
}
