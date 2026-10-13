import api from "./api";
import useCartStore from "../stores/useCartStore";
import useFavoritesStore from "../stores/useFavoritesStore";

/**
 * Cart and favorites API helpers.
 *
 * Every endpoint (reads and writes) answers { success, data: { products } }
 * with the user's current list, so each helper makes ONE request, syncs the
 * matching Zustand store from it and resolves to the backend items
 * ([{ product, quantity? }], never null). Pages with local state can use the
 * resolved value directly.
 *
 * The owner of writes comes from the token; the userId in GET/DELETE URLs is
 * checked against it by the backend. Errors are rejected by the api
 * interceptor as handleError() objects: { type, message, status, code, ... }.
 */

const productsOf = (res) => res.data?.data?.products || [];

function syncCart(res) {
  const products = productsOf(res);
  useCartStore.getState().syncFromBackend(products);
  return products;
}

function syncFavorites(res) {
  const products = productsOf(res);
  useFavoritesStore.getState().syncFromBackend(products);
  return products;
}

const userPath = (base, userId, productId) =>
  productId === undefined
    ? `${base}/${encodeURIComponent(userId)}`
    : `${base}/${encodeURIComponent(userId)}/${encodeURIComponent(productId)}`;

/** Loads the user's cart and syncs the cart store. */
export async function fetchCartProducts(userId) {
  return syncCart(await api.get(userPath("/api/cart", userId)));
}

/**
 * Adds a product to the cart or sets the quantity of one already there
 * (the backend stores `quantity` as given). Syncs the cart store.
 */
export async function setCartProductQuantity(productId, quantity) {
  return syncCart(await api.post("/api/cart", { productId, quantity }));
}

/** Shown when "Comprar" is used on a product already in the cart up to its stock. */
export const CART_STOCK_LIMIT_MESSAGE = "Ya tenés todo el stock disponible en el carrito";

/**
 * Quantity a product should have after adding one more unit: what the cart
 * store already holds plus one, or null when that would exceed the stock.
 * `stock` falls back to the value stored with the cart item.
 */
export function nextCartQuantity(productId, stock) {
  const item = useCartStore.getState().items.find((i) => i._id === productId);
  const current = item?.quantity || 0;
  const limit = Number.isFinite(stock) ? stock : item?.stock;
  if (Number.isFinite(limit) && current >= limit) return null;
  return current + 1;
}

/** Removes a product from the cart and syncs the cart store. */
export async function removeCartProduct(userId, productId) {
  return syncCart(await api.delete(userPath("/api/cart", userId, productId)));
}

/** Loads the user's favorites and syncs the favorites store. */
export async function fetchFavoriteProducts(userId) {
  return syncFavorites(await api.get(userPath("/api/favorites", userId)));
}

/** Adds a favorite (400 FAVORITE_ALREADY_EXISTS when it is already there). */
export async function addFavoriteProduct(productId) {
  return syncFavorites(await api.post("/api/favorites", { productId }));
}

/** Removes a favorite and syncs the favorites store. */
export async function removeFavoriteProduct(userId, productId) {
  return syncFavorites(
    await api.delete(userPath("/api/favorites", userId, productId)),
  );
}
