/**
 * Product images are absolute http(s) links. Older products may still hold a
 * bare file name from the backend's removed /img folder; those resolve to null
 * so the caller shows its placeholder instead of a broken image.
 */
export function productImageUrl(image) {
  const value = String(image ?? "").trim();
  return /^https?:\/\//i.test(value) ? value : null;
}
