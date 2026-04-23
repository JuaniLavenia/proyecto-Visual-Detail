import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import useAuthStore from "../../../stores/useAuthStore";
import {
  Package,
  Dollar,
  Clock,
  Check,
  Close,
  ArrowLeft,
  Users,
  Exclamation,
} from "../../../components/common/Icons";
import "../Products/index.css";

const API_BASE = "https://visual-detail-backend.onrender.com";
// const API_BASE = "http://localhost:5000";

function AdminDashboard() {
  const navigate = useNavigate();
  const { token, isAdmin } = useAuthStore();

  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Validar acceso admin
  useEffect(() => {
    if (!token || !isAdmin) {
      navigate("/login");
    }
  }, [token, isAdmin, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    if (!token || !isAdmin) return;

    const fetchDashboardData = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        // Fetch full stats (includes stock and users) and recent orders in parallel
        const [statsRes, recentRes] = await Promise.all([
          axios.get(`${API_BASE}/api/admin/estadisticas`, config),
          axios.get(`${API_BASE}/api/admin/pedidos/recent?limit=5`, config),
        ]);

        setStats(statsRes.data.data);
        setRecentOrders(recentRes.data.data.pedidos || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los datos del dashboard",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, isAdmin]);

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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value || 0);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 flex items-center justify-center">
        <div className="text-white/50">Cargando dashboard...</div>
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
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  Panel de Administración
                </h1>
                <p className="text-white/50 mt-1">
                  Resumen de pedidos y estadísticas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Pedidos */}
          <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Total Pedidos</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.pedidos?.total || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Pendientes */}
          <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {stats?.pedidos?.pendientes || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Completados */}
          <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Completados</p>
                <p className="text-2xl font-bold text-green-400">
                  {stats?.pedidos?.completados || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Productos Sin Stock */}
          <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                <Exclamation className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Sin Stock</p>
                <p className="text-2xl font-bold text-red-400">
                  {stats?.stock?.productosSinStock || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Total Usuarios */}
          <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Usuarios</p>
                <p className="text-2xl font-bold text-purple-400">
                  {stats?.usuarios?.total || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Card (separate row) */}
        <div className="mt-4">
          <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4 max-w-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                <Dollar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(stats?.ventas?.total)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/adm/pedidos"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl transition-colors"
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">Ver Pedidos</span>
          </Link>
          <Link
            to="/adm/productos"
            className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl transition-colors"
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">Productos</span>
          </Link>
          <Link
            to="/adm/usuarios"
            className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl transition-colors"
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Usuarios</span>
          </Link>
          <Link
            to="/adm/productos/create"
            className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-xl transition-colors"
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">Nuevo Producto</span>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Pedidos Recientes</h2>
            <Link
              to="/adm/pedidos"
              className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
            >
              Ver todos →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="bg-gray-900/30 border border-white/5 rounded-2xl p-12 text-center">
              <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/50">No hay pedidos recientes</p>
            </div>
          ) : (
            <div className="bg-gray-900/30 border border-white/5 rounded-2xl overflow-hidden">
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
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentOrders.map((pedido, index) => (
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
                          <span className="text-white font-medium">
                            {pedido.usuario?.email || "Usuario"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-white/70">
                            {pedido.productos?.length || 0} producto
                            {pedido.productos?.length !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {getStatusBadge(pedido.estado)}
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
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
