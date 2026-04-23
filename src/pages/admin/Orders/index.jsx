import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import useAuthStore from "../../../stores/useAuthStore";
import {
  Package,
  Clock,
  Check,
  Close,
  ArrowLeft,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "../../../components/common/Icons";
import "../Products/index.css";

const API_BASE = "https://visual-detail-backend.onrender.com";
// const API_BASE = "http://localhost:5000";

const ESTADOS = [
  { value: "todos", label: "Todos" },
  { value: "Pendiente", label: "Pendiente", color: "bg-yellow-500" },
  { value: "Completado", label: "Completado", color: "bg-green-500" },
  { value: "Cancelado", label: "Cancelado", color: "bg-red-500" },
];

function AdminOrders() {
  const navigate = useNavigate();
  const { token, isAdmin } = useAuthStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Validar acceso admin
  useEffect(() => {
    if (!token || !isAdmin) {
      navigate("/login");
    }
  }, [token, isAdmin, navigate]);

  // Fetch orders with pagination
  useEffect(() => {
    if (!token || !isAdmin) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const params = new URLSearchParams();
        params.append("page", pagination.page);
        params.append("limit", pagination.limit);
        if (filtroEstado !== "todos") {
          params.append("estado", filtroEstado);
        }

        const res = await axios.get(
          `${API_BASE}/api/admin/pedidos?${params.toString()}`,
          config,
        );

        const data = res.data.data;
        setOrders(data.pedidos || data || []);
        if (data.total !== undefined) {
          setPagination((prev) => ({
            ...prev,
            total: data.total,
            totalPages: data.totalPages,
          }));
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los pedidos",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, isAdmin, pagination.page, filtroEstado]);

  // Reset page when filter changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [filtroEstado]);

  const handleStatusChange = async (orderId, nuevoEstado) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.put(
        `${API_BASE}/api/admin/pedidos/${orderId}/status`,
        { nuevoEstado },
        config,
      );

      // Update local state
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, estado: nuevoEstado } : order,
        ),
      );

      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: `El pedido ahora está ${nuevoEstado}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el estado",
      });
    }
  };

  const getStatusBadge = (estado) => {
    const statusConfig = {
      Pendiente: {
        class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        icon: <Clock className="w-4 h-4" />,
      },
      Completado: {
        class: "bg-green-500/20 text-green-400 border-green-500/30",
        icon: <Check className="w-4 h-4" />,
      },
      Cancelado: {
        class: "bg-red-500/20 text-red-400 border-red-500/30",
        icon: <Close className="w-4 h-4" />,
      },
    };

    const config = statusConfig[estado] || statusConfig.Pendiente;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.class}`}
      >
        {config.icon}
        {estado}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Filter by status
    if (filtroEstado !== "todos" && order.estado !== filtroEstado) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const usuarioEmail = order.usuario?.email?.toLowerCase() || "";
      const numeroPedido = String(order.numeroPedido || "").toLowerCase();
      const productos =
        order.productos?.map((p) => p.nombre?.toLowerCase()).join(" ") || "";

      return (
        usuarioEmail.includes(search) ||
        numeroPedido.includes(search) ||
        productos.includes(search)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 flex items-center justify-center">
        <div className="text-white/50">Cargando pedidos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to="/adm/dashboard"
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  Gestión de Pedidos
                </h1>
                <p className="text-white/50 mt-1">
                  {filteredOrders.length} pedido
                  {filteredOrders.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por usuario, número de pedido o producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {ESTADOS.map((estado) => (
              <button
                key={estado.value}
                onClick={() => setFiltroEstado(estado.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filtroEstado === estado.value
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-800 text-white/70 hover:bg-gray-700"
                }`}
              >
                {estado.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredOrders.length === 0 ? (
          <div className="bg-gray-900/30 border border-white/5 rounded-2xl p-12 text-center">
            <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay pedidos
            </h3>
            <p className="text-white/50">
              {searchTerm || filtroEstado !== "todos"
                ? "No se encontraron pedidos con los filtros aplicados"
                : "No hay pedidos registrados"}
            </p>
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
                        #
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Productos
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Cambiar Estado
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.map((pedido, index) => (
                      <tr
                        key={pedido._id}
                        className="hover:bg-white/5 transition-all duration-200"
                      >
                        <td className="px-4 py-3.5">
                          <span className="text-white/50 text-sm">
                            {pedido.numeroPedido || index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className="text-white font-medium">
                              {pedido.usuario?.email || "Usuario"}
                            </span>
                            <span className="text-white/40 text-xs">
                              {pedido.usuario?.role || "minorista"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="max-w-xs">
                            {pedido.productos?.map((prod, i) => (
                              <div
                                key={i}
                                className="text-white/70 text-sm truncate"
                              >
                                {prod.cantidad}x {prod.nombre || "Producto"}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {getStatusBadge(pedido.estado)}
                        </td>
                        <td className="px-4 py-3.5">
                          <select
                            value={pedido.estado || "Pendiente"}
                            onChange={(e) =>
                              handleStatusChange(pedido._id, e.target.value)
                            }
                            className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500 text-sm"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Completado">Completado</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-white/50 text-sm">
                            {formatDate(pedido.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden grid gap-4">
              {filteredOrders.map((pedido) => (
                <div
                  key={pedido._id}
                  className="bg-gray-900/50 border border-white/5 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">
                        Pedido #{pedido.numeroPedido || "-"}
                      </p>
                      <p className="text-white/40 text-xs">
                        {formatDate(pedido.createdAt)}
                      </p>
                    </div>
                    {getStatusBadge(pedido.estado)}
                  </div>

                  <div className="mb-3">
                    <p className="text-white/50 text-xs mb-1">Usuario</p>
                    <p className="text-white font-medium">
                      {pedido.usuario?.email || "Usuario"}
                    </p>
                  </div>

                  <div className="mb-3">
                    <p className="text-white/50 text-xs mb-1">Productos</p>
                    {pedido.productos?.map((prod, i) => (
                      <p key={i} className="text-white/70 text-sm">
                        {prod.cantidad}x {prod.nombre || "Producto"}
                      </p>
                    ))}
                  </div>

                  <div>
                    <p className="text-white/50 text-xs mb-1">Cambiar Estado</p>
                    <select
                      value={pedido.estado || "Pendiente"}
                      onChange={(e) =>
                        handleStatusChange(pedido._id, e.target.value)
                      }
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500 text-sm"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Completado">Completado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            disabled={pagination.page === 1}
            className="p-2 bg-gray-800 text-white/70 rounded-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white/50 text-sm">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            disabled={pagination.page >= pagination.totalPages}
            className="p-2 bg-gray-800 text-white/70 rounded-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
