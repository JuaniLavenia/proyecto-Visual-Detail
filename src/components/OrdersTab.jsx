import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./OrdersTab.css";

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const { userId } = useContext(AuthContext);

  const cancelarPedido = async (pedidoId) => {
    try {
      await axios.put(
        `https://visual-detail-backend.onrender.com/api/pedido/cancelar/${pedidoId}`
      );

      const response = await axios.get(
        `https://visual-detail-backend.onrender.com/api/pedidos/${userId}`
      );

      setOrders(response.data.pedidos);
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  const getCardColorClass = (estado) => {
    switch (estado) {
      case "Completado":
        return "color-completado";
      case "Cancelado":
        return "color-cancelado";
      case "Pendiente":
        return "color-pendiente";
      default:
        return "";
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `https://visual-detail-backend.onrender.com/api/pedidos/${userId}`
        );
        setOrders(response.data.pedidos);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [userId]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Lista de Pedidos</h2>
      {orders.map((order) => (
        <div
          key={order._id}
          className={`card mb-4 ${getCardColorClass(order.estado)}`}
        >
          <div className="card-body">
            <h5 className="card-title">
              Pedido N°{order.numeroPedido} - Estado: {order.estado}
            </h5>
            <ul className="list-group">
              {order.productos.map((producto, index) => (
                <li key={index} className="list-group-item">
                  {producto.nombre} - Cantidad: {producto.cantidad}
                </li>
              ))}
            </ul>
            {order.estado === "Pendiente" && (
              <button
                className="btn btn-danger mt-3"
                onClick={() => cancelarPedido(order._id)}
              >
                Cancelar Pedido
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersTab;
