/**
 * Unit price a buyer pays, mirroring the backend rule used when an order is
 * created: mayoristas pay `precioMayorista` when the product has one, any
 * other role (minorista, admin) pays `price`.
 */
export function getUnitPrice(product, role) {
  if (!product) return 0;
  if (role === "mayorista" && typeof product.precioMayorista === "number") {
    return product.precioMayorista;
  }
  return product.price || 0;
}

/**
 * Money in the es-AR format used across the app ("$1.234"), or "—" when the
 * amount is missing (legacy orders have no prices).
 */
export function formatPrice(amount) {
  return typeof amount === "number" ? `$${amount.toLocaleString("es-AR")}` : "—";
}
