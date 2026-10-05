import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import useSWR from "swr";
import CardProductos, {
  ProductCardSkeleton,
  ProductCardEmpty,
} from "../../components/shared/ProductCard";
import Filters from "../../components/shared/CategoryBtn";
import useTaxonomyOptions, {
  findTaxonomyOption,
} from "../../hooks/useTaxonomyOptions";
import { fetcher, API_BASE } from "../../lib/api";
import {
  Filter,
  Close,
  ChevronLeft,
  ChevronRight,
} from "../../components/common/Icons";
import {
  PAGE_SIZES,
  DEFAULT_LIMIT,
  SORT_OPTIONS,
  LEGACY_PARAMS,
  parseProductsParams,
  buildProductsKey,
  joinLabels,
} from "./productsQuery";
import "./index.css";

function SearchClean() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { brands, categories } = useTaxonomyOptions();

  // La URL es la unica fuente de verdad de filtros, orden y paginacion
  const filters = useMemo(
    () => parseProductsParams(searchParams),
    [searchParams],
  );
  const { brand, category, search, sort, page, limit } = filters;

  // Normalizar links viejos (?categoria=X → ?category=X) sin sumar historial
  useEffect(() => {
    const legacyKeys = Object.keys(LEGACY_PARAMS).filter((key) =>
      searchParams.has(key),
    );
    if (legacyKeys.length === 0) return;

    const next = new URLSearchParams(searchParams);
    legacyKeys.forEach((key) => {
      const target = LEGACY_PARAMS[key];
      if (!next.get(target) && next.get(key)) next.set(target, next.get(key));
      next.delete(key);
    });
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // Cambios del usuario: push, para que el boton atras restaure el estado.
  // Cualquier cambio de filtro vuelve a la pagina 1.
  const updateParams = useCallback(
    (changes, { resetPage = true } = {}) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(changes).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      if (resetPage) next.delete("page");
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const { data, error, isLoading, mutate } = useSWR(
    buildProductsKey(API_BASE, filters),
    fetcher,
    {
      revalidateOnFocus: false, // No revalidar al volver a la pestaña
      revalidateOnReconnect: true, // Sí revalidar al reconectar
      dedupingInterval: 5000, // Deduplicar requests en 5 segundos
      errorRetryCount: 3, // Reintentar hasta 3 veces
      errorRetryInterval: 2000, // Reintentar cada 2 segundos
    },
  );

  // Extraer productos y paginación de la respuesta
  const products = data?.data || [];
  const totalRows = data?.pagination?.totalProducts ?? products.length;
  const totalPages = data?.pagination?.totalPages ?? 1;

  const handlePageChange = (newPage) => {
    if (newPage === page || newPage < 1 || newPage > totalPages) return;
    updateParams({ page: newPage > 1 ? newPage : null }, { resetPage: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSizeChange = (size) => {
    if (size === limit) return;
    updateParams({ limit: size === DEFAULT_LIMIT ? null : size });
  };

  const handleSortChange = (value) => {
    if (value === sort) return;
    updateParams({ sort: value || null });
  };

  // Limpiar filtros de marca/categoría (la búsqueda se conserva)
  const clearFilters = () => updateParams({ brand: null, category: null });

  const clearAll = () =>
    updateParams({ brand: null, category: null, search: null });

  // Etiquetas legibles para los valores de la URL (slug o nombre legacy)
  const categoryLabel = category
    ? findTaxonomyOption(categories, category)?.name || category
    : null;
  const brandLabel = brand
    ? findTaxonomyOption(brands, brand)?.name || brand
    : null;

  const activeFilterCount = (category ? 1 : 0) + (brand ? 1 : 0);
  const activePills = [
    category && {
      key: "category",
      label: `📂 ${categoryLabel}`,
      onRemove: () => updateParams({ category: null }),
    },
    brand && {
      key: "brand",
      label: `🏷️ ${brandLabel}`,
      onRemove: () => updateParams({ brand: null }),
    },
    search && {
      key: "search",
      label: `🔍 "${search}"`,
      onRemove: () => updateParams({ search: null }),
    },
  ].filter(Boolean);

  // Obtener título de la sección
  const sectionTitle = useMemo(() => {
    if (search) return `Resultados para "${search}"`;
    if (categoryLabel && brandLabel) return `${categoryLabel} · ${brandLabel}`;
    if (categoryLabel || brandLabel) return categoryLabel || brandLabel;
    return "Todos los Productos";
  }, [search, categoryLabel, brandLabel]);

  // Mensaje del estado vacío con todos los filtros activos combinados
  const emptyMessage = useMemo(() => {
    const parts = [
      categoryLabel && `la categoría "${categoryLabel}"`,
      brandLabel && `la marca "${brandLabel}"`,
      search && `la búsqueda "${search}"`,
    ].filter(Boolean);
    if (parts.length === 0) return "Todavía no hay productos disponibles";
    return `No hay productos para ${joinLabels(parts)}`;
  }, [categoryLabel, brandLabel, search]);

  const firstShown = (page - 1) * limit + 1;
  const lastShown = Math.min(page * limit, totalRows);

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Title */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                {sectionTitle}
              </h1>
              <p className="text-white/50 mt-1">
                {!isLoading && !error && (
                  <span>
                    {totalRows} producto{totalRows !== 1 ? "s" : ""} encontrado
                    {totalRows !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Toggle Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
              >
                <Filter width="20px" height="20px" strokeWidth="1.5" />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-yellow-500 text-gray-900 text-xs rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <label htmlFor="plp-sort" className="text-white/50 text-sm">
                  Ordenar:
                </label>
                <select
                  id="plp-sort"
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option
                      key={option.value || "default"}
                      value={option.value}
                      className="bg-gray-900"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Page Size */}
              <div className="hidden md:flex items-center gap-2">
                <label htmlFor="plp-size" className="text-white/50 text-sm">
                  Mostrar:
                </label>
                <select
                  id="plp-size"
                  value={limit}
                  onChange={(e) => handleSizeChange(Number(e.target.value))}
                  className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size} className="bg-gray-900">
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Pills */}
          {activePills.length > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-white/50 text-sm">
                {activePills.length === 1 ? "Filtro activo:" : "Filtros activos:"}
              </span>
              {activePills.map((pill) => (
                <span
                  key={pill.key}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full"
                >
                  {pill.label}
                  <button
                    onClick={pill.onRemove}
                    className="ml-1 hover:text-white"
                    aria-label="Quitar filtro"
                  >
                    ×
                  </button>
                </span>
              ))}
              {activePills.length > 1 && (
                <button
                  onClick={clearAll}
                  className="text-white/50 text-sm underline hover:text-white"
                >
                  Limpiar todo
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filter Modal - Works on all screen sizes */}
          {isSidebarOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setIsSidebarOpen(false)}
              />

              {/* Modal Content */}
              <div className="relative w-full max-w-lg max-h-[85vh] bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gray-900/50">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-white">
                      Filtros
                    </h2>
                    {activeFilterCount > 0 && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                        {activeFilterCount} activo
                        {activeFilterCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Close className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Body - Scrollable */}
                <div className="overflow-y-auto max-h-[55vh]">
                  <Filters
                    brands={brands}
                    categories={categories}
                    handleCategoryClick={(slug) =>
                      updateParams({ category: slug })
                    }
                    handleBrandClick={(slug) => updateParams({ brand: slug })}
                    activeCategory={category}
                    activeBrand={brand}
                  />
                </div>

                {/* Modal Footer - Actions */}
                <div className="flex items-center gap-3 px-5 py-4 border-t border-white/10 bg-gray-900/50">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => {
                        clearFilters();
                        setIsSidebarOpen(false);
                      }}
                      className="flex-1 px-4 py-3 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                    >
                      Limpiar
                    </button>
                  )}
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className={`${activeFilterCount > 0 ? "flex-1" : "flex-2"} px-4 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-xl hover:bg-yellow-400 transition-colors`}
                  >
                    {activeFilterCount > 0 ? "Ver resultados" : "Cerrar"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <main className="flex-1">
            {isLoading ? (
              // Loading Skeletons
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Error de conexión
                </h3>
                <p className="text-white/50 mb-4">
                  No se pudieron cargar los productos
                </p>
                <button
                  onClick={() => mutate()}
                  className="px-6 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center">
                <ProductCardEmpty
                  title="No se encontraron productos"
                  message={emptyMessage}
                />
                {page > 1 && totalPages > 0 && page > totalPages ? (
                  <button
                    onClick={() => handlePageChange(1)}
                    className="mt-4 px-6 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    Ir a la primera página
                  </button>
                ) : (
                  activePills.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="mt-4 px-6 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  )
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <CardProductos key={product._id} {...product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="flex items-center gap-2">
                      {/* Previous */}
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Page Numbers */}
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                              page === pageNum
                                ? "bg-yellow-500 text-gray-900"
                                : "bg-white/5 text-white/70 hover:bg-white/10"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {/* Next */}
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Results Info */}
                <div className="mt-8 text-center text-white/50 text-sm">
                  Mostrando {firstShown} - {lastShown} de {totalRows} productos
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default SearchClean;
