import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useSWR, { mutate } from "swr";
import axios from "axios";
import Swal from "sweetalert2";
import useAuthStore from "../../stores/useAuthStore";
import "./producto.css";

const API_BASE = "https://visual-detail-backend.onrender.com";
// const API_BASE = "http://localhost:5000";

// Fetcher para SWR
const fetcher = (url) => axios.get(url).then((res) => res.data);

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
        axios
          .delete(`${API_BASE}/api/productos/${id}`)
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
      await axios.post(`${API_BASE}/api/productos/bulk-upload`, formData, {
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
      const response = await fetch(`${API_BASE}/api/productos/export`);
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
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                Administración de Productos
              </h1>
              <p className="text-white/50 mt-1">
                {totalRows} producto{totalRows !== 1 ? "s" : ""} en total
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportXLSX}
                disabled={isExporting}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isExporting ? (
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
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l-3-3m0 0l3-3m-3 3h12.75"
                    />
                  </svg>
                )}
                Exportar Excel
              </button>
              <button
                onClick={handleOpenModal}
                className="px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                Importar Excel
              </button>
              <Link
                to="/adm/productos/create"
                className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m6-6h-15"
                  />
                </svg>
                Nuevo Producto
              </Link>
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
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.196 10.196z"
                  />
                </svg>
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
            <div className="hidden lg:block bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">
                      Imagen
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">
                      Marca
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">
                      Categoría
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">
                      Precio
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/70">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-white/70">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <img
                          src={
                            product.image?.startsWith("http")
                              ? product.image
                              : `${API_BASE}/img/productos/${product.image}`
                          }
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">
                          {product.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full">
                          {product.brand}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white/70 text-sm">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-semibold">
                          ${product.price?.toLocaleString("es-AR")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                        >
                          {product.stock > 0 ? product.stock : "Sin stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/adm/productos/edit/${product._id}`}
                            className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                              />
                            </svg>
                          </Link>
                          <button
                            onClick={() => destroy(product._id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a2.25 2.25 0 00-2.244-2.077L4.772 5.79m-2.244 2.077L4.772 5.79m0 0a2.25 2.25 0 012.244-2.077L4.772 5.79"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                      stroke="currentColor"
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
                      stroke="currentColor"
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
                  stroke="currentColor"
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
                        stroke="currentColor"
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
