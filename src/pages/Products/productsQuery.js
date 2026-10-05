/**
 * PLP query helpers. The URL search params are the single source of truth
 * for the product listing; these pure functions read them and build the
 * matching `GET /api/productos` request.
 */

export const PAGE_SIZES = [12, 24, 48];
export const DEFAULT_LIMIT = PAGE_SIZES[0];

export const SORT_OPTIONS = [
  { value: "", label: "Más recientes" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
];

const VALID_SORTS = new Set(
  SORT_OPTIONS.map((option) => option.value).filter(Boolean),
);

// Legacy param names still found in old links → current names.
export const LEGACY_PARAMS = { categoria: "category" };

const readText = (params, key) => (params.get(key) || "").trim();

const readPositiveInt = (params, key) => {
  const value = Number.parseInt(params.get(key), 10);
  return Number.isInteger(value) && value > 0 ? value : null;
};

/**
 * Reads the PLP state from URL search params, dropping invalid values so a
 * hand-edited URL never produces a request the backend rejects.
 */
export function parseProductsParams(params) {
  const sort = readText(params, "sort");
  const limit = readPositiveInt(params, "limit");

  return {
    brand: readText(params, "brand"),
    category: readText(params, "category") || readText(params, "categoria"),
    search: readText(params, "search"),
    sort: VALID_SORTS.has(sort) ? sort : "",
    page: readPositiveInt(params, "page") || 1,
    limit: PAGE_SIZES.includes(limit) ? limit : DEFAULT_LIMIT,
  };
}

/**
 * Builds the SWR key for the listing. Params are appended in a fixed order
 * and empty values are omitted, so equal filters always share a cache key.
 */
export function buildProductsKey(baseUrl, { brand, category, search, sort, page, limit }) {
  const query = new URLSearchParams();
  if (brand) query.set("brand", brand);
  if (category) query.set("category", category);
  if (search) query.set("search", search);
  if (sort) query.set("sort", sort);
  query.set("page", String(page));
  query.set("limit", String(limit));
  return `${baseUrl}/api/productos?${query.toString()}`;
}

/** Joins labels as Spanish prose: "a", "a y b", "a, b y c". */
export function joinLabels(labels) {
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} y ${labels[labels.length - 1]}`;
}
