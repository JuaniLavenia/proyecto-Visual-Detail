import { useEffect, useState } from "react";
import api from "../../../lib/api";
import useAuthStore from "../../../stores/useAuthStore";
import { useUserContext } from "../../../context/UserContext";
import { Check, Close, Clock } from "../../../components/common/Icons";
import "./OrdersTab.css";

const OrdersTab = () => {
  const { ordersInfo, updateOrders } = useUserContext();
  const { userId } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    if (!userId) {
      setError("Debes iniciar sesión nuevamente");
      return;
    }

    if (ordersInfo && ordersInfo.length > 0) {
      return; // Ya tenemos datos
    }

    setIsLoading(true);
    try {
      const response = await api.get(`/api/pedidos/${userId}`);
      updateOrders(response.data.pedidos || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("No se pudieron cargar los pedidos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const getStatusStyle = (estado) => {
    switch (estado) {
      case "Completado":
        return {
          bg: "bg-green-500/10",
          text: "text-green-400",
          border: "border-green-500/20",
        };
      case "Cancelado":
        return {
          bg: "bg-red-500/10",
          text: "text-red-400",
          border: "border-red-500/20",
        };
      case "Pendiente":
        return {
          bg: "bg-yellow-500/10",
          text: "text-yellow-400",
          border: "border-yellow-500/20",
        };
      default:
        return {
          bg: "bg-gray-500/10",
          text: "text-gray-400",
          border: "border-gray-500/20",
        };
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case "Completado":
        return <Check className="w-5 h-5" />;
      case "Cancelado":
        return <Close className="w-5 h-5" />;
      case "Pendiente":
        return <Clock className="w-5 h-5" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-gray-800/50 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-white mb-2">{error}</h3>
        <button
          onClick={fetchOrders}
          className="mt-4 px-6 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!ordersInfo || ordersInfo.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">📦</div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No tienes pedidos
        </h3>
        <p className="text-white/50">
          Cuando realices un pedido, aparecerá aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white mb-6">Mis Pedidos</h2>

      {ordersInfo.map((order) => {
        const statusStyle = getStatusStyle(order.estado);

        return (
          <div
            key={order._id}
            className={`bg-gray-800/30 border ${statusStyle.border} rounded-xl p-5 hover:bg-gray-800/50 transition-colors`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">
                  Pedido #{order.numeroPedido}
                </h3>
                <p className="text-white/50 text-sm">ID: {order._id}</p>
              </div>
              <div
                className={`flex items-center gap-2 px-3 py-1.5 ${statusStyle.bg} ${statusStyle.text} rounded-full text-sm font-medium`}
              >
                {getStatusIcon(order.estado)}
                {order.estado}
              </div>
            </div>

            {/* Products */}
            <div className="space-y-2 mb-4">
              <p className="text-white/50 text-sm font-medium">Productos:</p>
              {order.productos?.map((producto, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-gray-900/30 rounded-lg"
                >
                  <span className="text-white">{producto.nombre}</span>
                  <span className="text-white/50 text-sm">
                    x{producto.cantidad}
                  </span>
                </div>
              ))}
            </div>

            {/* Total & Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="text-white font-semibold">
                Total: ${order.total?.toLocaleString("es-AR") || "0"}
              </div>

              {order.estado === "Pendiente" && (
                <button
                  onClick={async () => {
                    try {
                      await api.put(`/api/pedido/cancelar/${order._id}`);
                      const response = await api.get(`/api/pedidos/${userId}`);
                      updateOrders(response.data.pedidos || []);
                    } catch (err) {
                      console.error("Error cancelling order:", err);
                    }
                  }}
                  className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar Pedido
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrdersTab;
