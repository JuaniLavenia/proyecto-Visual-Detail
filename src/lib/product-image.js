// Phone photos weigh several MB and iPhones save them as HEIC, which only
// Safari can display. For Cloudinary URLs, ask Cloudinary for a modern format
// the browser supports (f_auto), automatic quality (q_auto) and at most 800px
// wide (w_800, c_limit never upscales): enough for cards on 2x screens.
const TRANSFORMATION = "f_auto,q_auto,w_800,c_limit";
const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)/;

/**
 * Adds the delivery transformation to a Cloudinary upload URL. Any other URL
 * is returned unchanged, and an already optimized URL is not transformed twice.
 */
export function optimizeImage(url) {
  if (!CLOUDINARY_UPLOAD.test(url) || url.includes(`/upload/${TRANSFORMATION}/`)) return url;
  return url.replace(CLOUDINARY_UPLOAD, `$1${TRANSFORMATION}/`);
}

/**
 * The stored image link as typed by the admin. Product images are absolute
 * http(s) links; older products may still hold a bare file name from the
 * backend's removed /img folder, and those resolve to null.
 */
export function productImageLink(image) {
  const value = String(image ?? "").trim();
  return /^https?:\/\//i.test(value) ? value : null;
}

/**
 * The URL to render for a product image, or null so the caller shows its
 * placeholder instead of a broken image.
 */
export function productImageUrl(image) {
  const link = productImageLink(image);
  return link ? optimizeImage(link) : null;
}
