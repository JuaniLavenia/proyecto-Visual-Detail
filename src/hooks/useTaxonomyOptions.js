import { useEffect, useState } from "react";
import api from "../lib/api";

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

        setBrands(
          Array.isArray(brandsRes?.data?.data)
            ? brandsRes.data.data.map((item) => item?.name).filter(Boolean)
            : [],
        );
        setCategories(
          Array.isArray(categoriesRes?.data?.data)
            ? categoriesRes.data.data.map((item) => item?.name).filter(Boolean)
            : [],
        );
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
