import { normalizePhone, phoneDigits } from "../../../lib/orders-api";

/**
 * Phone to contact the customer: the snapshot taken with the order, or the
 * current profile phone for legacy orders. Null when there is none.
 */
export function getOrderPhone(order) {
  return order?.telefono || order?.usuario?.phone || null;
}

/**
 * wa.me link for a phone, or null when it cannot be normalized. Legacy
 * stored values (e.g. "3814159688") are normalized to "+549..." first;
 * wa.me takes digits only.
 */
export function getWhatsAppUrl(phone) {
  const digits = phoneDigits(normalizePhone(phone));
  return digits ? `https://wa.me/${digits}` : null;
}

export function formatOrderDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Plain-text label for SweetAlert `text` (never interpolated into `html`).
export function describeOrder(order) {
  const customer = order?.usuario?.name || order?.usuario?.email;
  const number = order?.numeroPedido ? `#${order.numeroPedido}` : "";
  return [`Pedido ${number}`.trim(), customer && `de ${customer}`]
    .filter(Boolean)
    .join(" ");
}
