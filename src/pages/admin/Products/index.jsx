import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useSWR, { mutate } from "swr";
import api, { fetcher, API_BASE } from "../../../lib/api";
import Swal from "sweetalert2";
import useAuthStore from "../../../stores/useAuthStore";
import AdminActionsMenu from "../../../components/common/AdminActionsMenu";
import {
  Edit,
  Delete,
  Package,
  Dollar,
  Cube,
  Exclamation,
  Search,
  ArrowLeft,
} from "../../../components/common/Icons";
import "./index.css";

function AdminProducto() {
  const navigate = useNavigate();
  const { token, userId, isAdmin } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSize, setCurrentSize] = useState(12);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef();

  // Validar acceso admin
  useEffect(() => {
    if (!token || !isAdmin) {
      navigate("/login");
    }
  }, [token, isAdmin, navigate]);

  // Build key de request según búsqueda
  const getKey = () => {
    if (search) {
      return `${API_BASE}/api/productos/search/${search}`;
    }
    return `${API_BASE}/api/productos?page=${currentPage}&limit=${currentSize}`;
  };

  // useSWR para productos
  const { data, error, isLoading, isValidating } = useSWR(getKey(), fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
    errorRetryCount: 3,
    errorRetryInterval: 2000,
  });

  const products = data?.data || [];
  const totalRows = data?.pagination?.totalProducts || 0;
  const totalPages = Math.ceil(totalRows / currentSize);

  // Stats separate fetch
  const [stats, setStats] = useState(null);
  useEffect(() => {
    if (token && isAdmin) {
      api
        .get(`/api/productos/stats`)
        .then((res) => setStats(res.data.data))
        .catch(() => {});
    }
  }, [token, isAdmin]);

  // Recargar datos después de eliminar
  const refreshData = () => {
    mutate(getKey());
  };

  const destroy = (id) => {
    Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#eab308",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        api
          .delete(`/api/productos/${id}`)
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "Producto eliminado",
              showConfirmButton: false,
              timer: 1500,
            });
            refreshData();
          })
          .catch(() => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "No se pudo eliminar el producto",
            });
          });
      }
    });
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    setCurrentPage(1); // Reset a página 1 al buscar
  };

  const handlePageChange = (newPage) => {
    if (newPage !== currentPage && !search) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Modal handlers
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setExcelFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!excelFile) {
      Swal.fire({
        icon: "warning",
        title: "Seleccionar archivo",
        text: "Debe seleccionar un archivo Excel",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", excelFile);

    try {
      await api.post(`/api/productos/bulk-upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire({
        icon: "success",
        title: "¡Importación exitosa!",
        text: "Los productos se han agregado",
        showConfirmButton: false,
        timer: 1500,
      });
      handleCloseModal();
      refreshData();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo subir la planilla",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Exportar productos a XLSX
  const handleExportXLSX = async () => {
    setIsExporting(true);
    try {
      const response = await api.get(`/api/productos/export`);
      if (!response.ok) throw new Error("Error en la descarga");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "productos.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      Swal.fire({
        icon: "success",
        title: "¡Exportación exitosa!",
        text: "El archivo se ha descargado",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo exportar los productos",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!token || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Link
              to="/adm/dashboard"
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                Administración de Productos
              </h1>
              <p className="text-white/50 mt-1">
                {totalRows} producto{totalRows !== 1 ? "s" : ""} en total
              </p>
            </div>
            <AdminActionsMenu
              onExport={() => handleExportXLSX()}
              onImport={handleOpenModal}
            />
          </div>

          {/* KPI Cards */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">Total Productos</p>
                  <p className="text-xl font-bold text-white">
                    {stats?.totalProducts ?? totalRows}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                  <Cube className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">En Stock</p>
                  <p className="text-xl font-bold text-white">
                    {stats?.inStock ?? 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                  <Exclamation className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">Sin Stock</p>
                  <p className="text-xl font-bold text-white">
                    {stats?.outOfStock ?? 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <Dollar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">Valor Stock</p>
                  <p className="text-xl font-bold text-white">
                    $
                    {(stats?.totalStockValue ?? 0).toLocaleString("es-AR", {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-6">
            <div className="flex gap-3 max-w-xl">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Table Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && !data ? (
          // Loading skeleton
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-gray-900/50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Error de conexión
            </h3>
            <button
              onClick={() => refreshData()}
              className="mt-4 px-6 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400"
            >
              Reintentar
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No se encontraron productos
            </h3>
            <Link
              to="/adm/productos/create"
              className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400"
            >
              Crear primer producto
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-gray-900/30 border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/40 border-b border-white/5">
                    <tr>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Imagen
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Marca
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Precio Minorista
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Precio Mayorista
                      </th>
                      <th className="px-4 py-3.5 text-center text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.map((product, index) => (
                      <tr
                        key={product._id}
                        className="hover:bg-white/5 transition-all duration-200 group"
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        <td className="px-4 py-3.5">
                          <div className="relative">
                            <img
                              src={
                                product.image?.startsWith("http")
                                  ? product.image
                                  : `${API_BASE}/img/productos/${product.image}`
                              }
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg ring-1 ring-white/10 group-hover:ring-yellow-500/30 transition-all"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                            <div className="w-12 h-12 bg-gray-800 rounded-lg hidden items-center justify-center">
                              <svg
                                className="w-6 h-6 text-white/20"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="white"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                              </svg>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="max-w-xs">
                            <span className="text-white font-medium block truncate">
                              {product.name}
                            </span>
                            {product.capacity && (
                              <span className="text-white/40 text-xs">
                                {product.capacity}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-400 text-xs font-medium">
                            {product.brand}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-white/60 text-sm">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-white font-semibold">
                            ${product.price?.toLocaleString("es-AR")}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {product.precioMayorista ? (
                            <span className="text-green-400 font-semibold">
                              $
                              {product.precioMayorista?.toLocaleString("es-AR")}
                            </span>
                          ) : (
                            <span className="text-white/30 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
                            >
                              {product.stock > 0 ? (
                                <>
                                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                                  {product.stock}
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5"></span>
                                  Sin stock
                                </>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/adm/productos/edit/${product._id}`}
                              className="p-2 text-yellow-400/70 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all"
                              title="Editar"
                            >
                              <Edit className="w-4.5 h-4.5" />
                            </Link>
                            <button
                              onClick={() => destroy(product._id)}
                              className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                              title="Eliminar"
                            >
                              <Delete className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden grid gap-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-gray-900/50 border border-white/5 rounded-xl p-4"
                >
                  <div className="flex gap-4">
                    <img
                      src={
                        product.image?.startsWith("http")
                          ? product.image
                          : `${API_BASE}/img/productos/${product.image}`
                      }
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">
                        {product.name}
                      </h3>
                      <p className="text-yellow-400 text-sm">{product.brand}</p>
                      <p className="text-white/50 text-sm">
                        {product.category}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-white font-semibold">
                          ${product.price?.toLocaleString("es-AR")}
                        </span>
                        {product.precioMayorista ? (
                          <span className="text-green-400 font-semibold text-sm">
                            Mayorista: $
                            {product.precioMayorista?.toLocaleString("es-AR")}
                          </span>
                        ) : null}
                        <span
                          className={`text-xs ${product.stock > 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {product.stock > 0
                            ? `${product.stock} en stock`
                            : "Sin stock"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link
                      to={`/adm/productos/edit/${product._id}`}
                      className="flex-1 text-center py-2 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-colors text-sm font-medium"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => destroy(product._id)}
                      className="flex-1 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !search && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2)
                      pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium ${currentPage === pageNum ? "bg-yellow-500 text-gray-900" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Import Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">
                Importar productos desde Excel
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mb-5">
              <label className="block text-white/70 text-sm mb-2">
                Seleccionar archivo Excel
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-yellow-500 file:text-gray-900 hover:file:bg-yellow-400"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="white"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Subiendo...
                  </>
                ) : (
                  "Subir archivo"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducto;
