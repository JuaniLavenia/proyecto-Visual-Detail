import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAuthStore from "../../../stores/useAuthStore";
import {
  Package,
  ArrowLeft,
  Search,
  Spinner,
} from "../../../components/common/Icons";
import Pagination from "../../../components/common/Pagination";
import { listAdminOrders, updateOrderStatus } from "../../../lib/orders-api";
import OrdersList from "./OrdersList";
import { describeOrder } from "./order-format";
import {
  ACCENT_COLOR,
  PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
  SEARCH_MAX_LENGTH,
  STATUS_CONFIRMATIONS,
  STATUS_FILTERS,
} from "./constants";
import "../Products/index.css";

function AdminOrders() {
  const navigate = useNavigate();
  const { token, isAdmin } = useAuthStore();

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState("todos");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  // Admin access guard
  useEffect(() => {
    if (!token || !isAdmin) navigate("/login");
  }, [token, isAdmin, navigate]);

  // Debounce the search box; a new term always starts at page 1.
  useEffect(() => {
    const term = searchInput.trim();
    if (term === search) return undefined;
    const timer = setTimeout(() => {
      setSearch(term);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => {
    if (!token || !isAdmin) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);

    listAdminOrders(
      { page, limit: PAGE_SIZE, estado, search },
      { signal: controller.signal },
    )
      .then((result) => {
        if (controller.signal.aborted) return;
        // A status change or a narrower filter can leave us past the last
        // page: move back without rendering the empty page in between.
        const lastPage = Math.max(1, result.totalPages || 1);
        if (page > lastPage) {
          setPage(lastPage);
          return;
        }
        setOrders(result.pedidos);
        setTotal(result.total);
        setTotalPages(lastPage);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Error fetching orders:", error);
        setLoadError(error?.message || "No se pudieron cargar los pedidos");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [token, isAdmin, page, estado, search, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  // Filter and page change together, so the list is fetched once.
  const handleEstadoChange = (value) => {
    if (value === estado) return;
    setEstado(value);
    setPage(1);
  };

  const hasFilters = Boolean(search || estado !== "todos");

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setEstado("todos");
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // The <select> is controlled by order.estado, so a cancelled confirmation
  // (or a failed request) leaves it showing the current status.
  const handleStatusChange = async (order, nuevoEstado) => {
    if (nuevoEstado === order.estado) return;

    const confirmation = STATUS_CONFIRMATIONS[nuevoEstado];
    if (confirmation) {
      const { isConfirmed } = await Swal.fire({
        ...confirmation,
        text: `${describeOrder(order)} pasará a ${nuevoEstado}.`,
        showCancelButton: true,
        cancelButtonText: "Volver",
      });
      if (!isConfirmed) return;
    }

    setBusyId(order._id);
    try {
      const updated = await updateOrderStatus(order._id, nuevoEstado);
      // The response does not populate `usuario`: merge only the status.
      const newEstado = updated?.estado || nuevoEstado;
      setOrders((prev) =>
        prev.map((item) =>
          item._id === order._id ? { ...item, estado: newEstado } : item,
        ),
      );
      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: `El pedido ahora está ${newEstado}`,
        timer: 1500,
        showConfirmButton: false,
      });
      // With a status filter the row no longer belongs to this list.
      if (estado !== "todos" && newEstado !== estado) reload();
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire({
        icon: "error",
        title: "No se pudo actualizar el estado",
        text: error?.message || "Intentá de nuevo.",
        confirmButtonColor: ACCENT_COLOR,
      });
    } finally {
      setBusyId(null);
    }
  };

  const isFirstLoad = loading && total === null && !loadError;

  const renderResults = () => {
    if (isFirstLoad) {
      return (
        <div className="flex items-center justify-center gap-3 py-20 text-white/50">
          <Spinner className="w-5 h-5 animate-spin" />
          Cargando pedidos...
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="text-center py-20" role="alert">
          <h3 className="text-xl font-semibold text-white mb-2">
            No se pudieron cargar los pedidos
          </h3>
          <p className="text-white/50 mb-6">{loadError}</p>
          <button
            type="button"
            onClick={reload}
            className="px-4 py-2 rounded-lg bg-yellow-500 text-gray-900 font-medium hover:bg-yellow-400 transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div
          className={`bg-gray-900/30 border border-white/5 rounded-2xl p-12 text-center transition-opacity ${
            loading ? "opacity-50" : ""
          }`}
        >
          <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {hasFilters
              ? "No hay pedidos que coincidan con los filtros"
              : "Todavía no hay pedidos"}
          </h3>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 px-4 py-2 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 text-sm transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      );
    }

    return (
      <div
        className={`transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""}`}
        aria-busy={loading}
      >
        <OrdersList
          orders={orders}
          busyId={busyId}
          onStatusChange={handleStatusChange}
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={handlePageChange}
          disabled={loading}
          ariaLabel="Paginación de pedidos"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <Link
              to="/adm/dashboard"
              aria-label="Volver al panel"
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                Gestión de Pedidos
              </h1>
              <p className="text-white/50 mt-1 flex items-center gap-2">
                {total === null
                  ? "Cargando..."
                  : `${total} pedido${total !== 1 ? "s" : ""}${
                      hasFilters
                        ? ` encontrado${total !== 1 ? "s" : ""}`
                        : ""
                    }`}
                {loading && total !== null && (
                  <Spinner
                    className="w-4 h-4 animate-spin"
                    aria-label="Actualizando"
                  />
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              maxLength={SEARCH_MAX_LENGTH}
              placeholder="Buscar por N° de pedido, teléfono, email o nombre..."
              aria-label="Buscar pedidos por número, teléfono, email o nombre"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50"
            />
          </div>

          <div
            className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0"
            role="group"
            aria-label="Filtrar por estado"
          >
            {STATUS_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleEstadoChange(option.value)}
                aria-pressed={estado === option.value}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  estado === option.value
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-800 text-white/70 hover:bg-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {renderResults()}
      </div>
    </div>
  );
}

export default AdminOrders;
