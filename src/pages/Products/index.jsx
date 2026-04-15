import { useState, useMemo } from "react";
import useSWR from "swr";
import CardProductos, {
  ProductCardSkeleton,
  ProductCardEmpty,
} from "../../components/shared/ProductCard";
import Filters from "../../components/shared/CategoryBtn";
import axios from "axios";
import {
  Filter,
  Close,
  ChevronLeft,
  ChevronRight,
} from "../../components/common/Icons";
import "./index.css";

const API_BASE = "https://visual-detail-backend.onrender.com/api";
// const API_BASE = "http://localhost:5000/api";

// Fetcher para SWR - usa axios internamente
const fetcher = (url) => axios.get(url).then((res) => res.data);

function SearchClean() {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSize, setCurrentSize] = useState(12);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterType, setFilterType] = useState(null);

  // Obtener parámetros de URL
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory =
    urlParams.get("category") || urlParams.get("categoria");
  const initialSearch = urlParams.get("search");

  // Build key de request según filtros
  const getKey = () => {
    if (filterType === "category" && activeFilter) {
      return `${API_BASE}/productos/category/${activeFilter}`;
    }
    if (filterType === "brand" && activeFilter) {
      return `${API_BASE}/productos/brand/${activeFilter}`;
    }
    if (initialSearch) {
      return `${API_BASE}/productos/search/${initialSearch}`;
    }
    if (initialCategory) {
      return `${API_BASE}/productos/category/${initialCategory}`;
    }
    return `${API_BASE}/productos?page=${currentPage}&limit=${currentSize}`;
  };

  // useSWR con configuración optimizada
  const { data, error, isLoading, mutate } = useSWR(getKey(), fetcher, {
    revalidateOnFocus: false, // No revalidar al volver a la pestaña
    revalidateOnReconnect: true, // Sí revalidar al reconectar
    dedupingInterval: 5000, // Deduplicar requests en 5 segundos
    errorRetryCount: 3, // Reintentar hasta 3 veces
    errorRetryInterval: 2000, // Reintentar cada 2 segundos
    fallbackData: null, // Sin datos por defecto
  });

  // Extraer productos y paginación de la respuesta
  const products = data?.data || [];
  const totalRows = data?.pagination?.totalProducts || products.length;
  const totalPages = Math.ceil(totalRows / currentSize);

  // Función para cambiar página
  const handlePageChange = (newPage) => {
    if (newPage !== currentPage && !activeFilter && !initialSearch) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Función para cambiar tamaño de página
  const handleSizeChange = (size) => {
    if (size !== currentSize && !activeFilter && !initialSearch) {
      setCurrentPage(1);
      setCurrentSize(size);
    }
  };

  // Manejar click en filtro
  const handleFilterClick = (value, type) => {
    if (activeFilter === value && filterType === type) {
      setActiveFilter(null);
      setFilterType(null);
      setCurrentPage(1);
    } else {
      setActiveFilter(value);
      setFilterType(type);
      setCurrentPage(1);
    }
    setIsSidebarOpen(false);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setActiveFilter(null);
    setFilterType(null);
    setCurrentPage(1);
  };

  // Obtener título de la sección
  const sectionTitle = useMemo(() => {
    if (initialSearch) return `Resultados para "${initialSearch}"`;
    if (activeFilter) return activeFilter;
    return "Todos los Productos";
  }, [initialSearch, activeFilter]);

  // Título para filtro activo
  const activeFilterTitle = useMemo(() => {
    if (!activeFilter) return null;
    return filterType === "category" ? "Categoría" : "Marca";
  }, [activeFilter, filterType]);

  // Función para recargar datos (para el modal de filtros)
  const refreshData = () => {
    mutate();
  };

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
                {!isLoading && (
                  <span>
                    {totalRows} producto{totalRows !== 1 ? "s" : ""} encontrado
                    {totalRows !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Filter Toggle Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
              >
                <Filter width="20px" height="20px" strokeWidth="1.5" />
                Filtros
                {activeFilter && (
                  <span className="px-1.5 py-0.5 bg-yellow-500 text-gray-900 text-xs rounded-full">
                    1
                  </span>
                )}
              </button>

              {/* Sort/Page Size (only when no filters active) */}
              {!activeFilter && !initialSearch && (
                <div className="hidden md:flex items-center gap-2">
                  <label className="text-white/50 text-sm">Mostrar:</label>
                  <select
                    value={currentSize}
                    onChange={(e) => handleSizeChange(Number(e.target.value))}
                    className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
                  >
                    <option value={12} className="bg-gray-900">
                      12
                    </option>
                    <option value={24} className="bg-gray-900">
                      24
                    </option>
                    <option value={48} className="bg-gray-900">
                      48
                    </option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Active Filter Pills */}
          {activeFilter && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-white/50 text-sm">Filtro activo:</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">
                {filterType === "category" ? "📂" : "🏷️"} {activeFilter}
                <button
                  onClick={clearFilters}
                  className="ml-1 hover:text-white"
                >
                  ×
                </button>
              </span>
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
                    {activeFilter && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                        1 activo
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
                    handleCategoryClick={(cat) =>
                      handleFilterClick(cat, "category")
                    }
                    handleBrandClick={(brand) =>
                      handleFilterClick(brand, "brand")
                    }
                    getProductos={refreshData}
                    activeCategory={
                      filterType === "category" ? activeFilter : null
                    }
                    activeBrand={filterType === "brand" ? activeFilter : null}
                  />
                </div>

                {/* Modal Footer - Actions */}
                <div className="flex items-center gap-3 px-5 py-4 border-t border-white/10 bg-gray-900/50">
                  {activeFilter && (
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
                    className={`${activeFilter ? "flex-1" : "flex-2"} px-4 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-xl hover:bg-yellow-400 transition-colors`}
                  >
                    {activeFilter ? "Aplicar filtros" : "Ver todos"}
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
              <ProductCardEmpty
                title="No se encontraron productos"
                message={
                  activeFilter
                    ? `No hay productos en la categoría "${activeFilter}"`
                    : "Intenta con otros términos de búsqueda"
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <CardProductos key={product._id} {...product} />
                  ))}
                </div>

                {/* Pagination */}
                {!activeFilter && !initialSearch && totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="flex items-center gap-2">
                      {/* Previous */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Page Numbers */}
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                              currentPage === pageNum
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
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Results Info */}
                {!activeFilter && !initialSearch && (
                  <div className="mt-8 text-center text-white/50 text-sm">
                    Mostrando {(currentPage - 1) * currentSize + 1} -{" "}
                    {Math.min(currentPage * currentSize, totalRows)} de{" "}
                    {totalRows} productos
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default SearchClean;
