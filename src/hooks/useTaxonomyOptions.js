import { useEffect, useState } from "react";
import api from "../lib/api";
import { slugify } from "../lib/slugify";

/**
 * Maps taxonomy API items to `{ name, slug }` options. `name` is the
 * canonical value stored on products; `slug` is what storefront URLs use.
 * Falls back to slugifying the name when an item has no slug.
 */
const toOptions = (items) =>
  Array.isArray(items)
    ? items
        .filter((item) => item?.name)
        .map((item) => ({
          name: item.name,
          slug: item.slug || slugify(item.name),
        }))
    : [];

/**
 * True when a URL filter value refers to the option. URL values are usually
 * slugs, but legacy links may still carry the display name.
 */
export const matchesTaxonomyOption = (option, value) =>
  !!value &&
  (option.slug === value ||
    option.name === value ||
    option.slug === slugify(value));

export const findTaxonomyOption = (options, value) =>
  options.find((option) => matchesTaxonomyOption(option, value));

/**
 * Marcas y categorias activas para selects/filtros publicos. Consume los
 * mismos endpoints publicos que ya filtran isActive:true en el backend, asi
 * que nunca ofrece una opcion desactivada.
 */
function useTaxonomyOptions() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchTaxonomy = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          api.get("/api/brands"),
          api.get("/api/categories"),
        ]);

        if (!active) return;

        setBrands(toOptions(brandsRes?.data?.data));
        setCategories(toOptions(categoriesRes?.data?.data));
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchTaxonomy();

    return () => {
      active = false;
    };
  }, []);

  return { brands, categories, loading, error };
}

export default useTaxonomyOptions;
