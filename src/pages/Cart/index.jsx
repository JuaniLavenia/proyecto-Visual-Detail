import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import useCartStore from "../../stores/useCartStore";
import api, { API_BASE } from "../../lib/api";
import Swal from "sweetalert2";
import {
  ShoppingCart,
  Trash,
  Plus,
  Minus,
  Copy,
  Send,
  ArrowLeft,
  Close,
  Package,
  Image,
  Spinner,
  Check,
  Tag,
} from "../../components/common/Icons";
import "./index.css";

function Carrito() {
  const { userId, token } = useAuthStore();
  const navigate = useNavigate();
  const { syncFromBackend: syncCartFromBackend } = useCartStore();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const fetchCartItems = async () => {
    try {
      const response = await api.get(`/api/cart/${userId}`);
      const items = response.data.data.products || [];
      setCartItems(items);

      // Sync Zustand store for badge consistency
      syncCartFromBackend(items);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
      return;
    }
    fetchCartItems();
  }, []);

  const getImageUrl = (product) => {
    if (imageErrors[product._id]) return null;
    if (product.image?.startsWith("http")) return product.image;
    return `${API_BASE}/img/productos/${product.image}`;
  };

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const handleRemoveFromCart = async (product) => {
    Swal.fire({
      title: "¿Eliminar producto?",
      text: `¿Querés eliminar ${product.name} del carrito?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#eab308",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/api/cart/${userId}/${product._id}`);

          // Sync Zustand store for badge update
          const res = await api.get(`/api/cart/${userId}`);
          syncCartFromBackend(res.data.data.products || []);

          // Update local state
          setCartItems((prev) =>
            prev.filter((item) => item.product._id !== product._id),
          );
          Swal.fire({
            icon: "success",
            title: "Producto eliminado",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          console.error("Error removing from cart:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar",
          });
        }
      }
    });
  };

  const handleQuantityChange = async (e, item, newQuantity) => {
    const value = parseInt(newQuantity);
    if (isNaN(value) || value < 0) return;

    const updatedItems = cartItems.map((i) =>
      i.product._id === item.product._id ? { ...i, quantity: value } : i,
    );
    setCartItems(updatedItems);

    if (value === 0) {
      handleRemoveFromCart(item.product);
      return;
    }

    try {
      await api.post("/api/cart", {
        userId,
        productId: item.product._id,
        quantity: value,
      });

      // Sync Zustand store for badge update
      const res = await api.get(`/api/cart/${userId}`);
      syncCartFromBackend(res.data.data.products || []);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (acc, item) => acc + (item.product.price || 0) * (item.quantity || 0),
      0,
    );
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      await api.post("/api/pedidos", {
        usuario: userId,
        productos: cartItems.map((item) => ({
          nombre: item.product.name,
          cantidad: item.quantity,
        })),
      });

      const whatsappText = `¡Hola! Quisiera realizar el siguiente pedido:%0A%0A${cartItems
        .map(
          (item) =>
            `• ${item.product.name} (x${item.quantity}) - $${(item.product.price * item.quantity).toLocaleString("es-AR")}`,
        )
        .join("%0A")}%0A%0ATotal: $${calculateTotal().toLocaleString("es-AR")}`;
      window.open(`https://wa.me/+543812026631?text=${whatsappText}`, "_blank");

      setShowModal(false);
      Swal.fire({
        icon: "success",
        title: "¡Pedido generado!",
        text: "Se abrió WhatsApp para completar la compra",
        showConfirmButton: false,
        timer: 2500,
      });
    } catch (error) {
      setIsLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo generar el pedido",
      });
    }
  };

  const handleCopyToClipboard = () => {
    const orderDetail = cartItems
      .map(
        (item) =>
          `${item.product.name} (x${item.quantity}) - $${(item.product.price * item.quantity).toLocaleString("es-AR")}`,
      )
      .join("\n");
    const text = `¡Hola! Quisiera realizar el siguiente pedido:\n\n${orderDetail}\n\nTotal: $${calculateTotal().toLocaleString("es-AR")}`;
    navigator.clipboard.writeText(text);
    Swal.fire({
      icon: "success",
      title: "Pedido copiado",
      text: "El detalle se copió al portapapeles",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
          <p className="text-white/50">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-2">
            <Link
              to="/productos"
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                <ShoppingCart className="w-7 h-7 text-yellow-400" />
                Carrito de Compras
              </h1>
              <p className="text-white/50 mt-1">
                {cartItems.length} producto{cartItems.length !== 1 ? "s" : ""}{" "}
                en tu carrito
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-white/20" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Tu carrito está vacío
            </h2>
            <p className="text-white/50 mb-8">
              Agregá productos desde el catálogo para comenzar tu pedido
            </p>
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-xl transition-colors"
            >
              <Package className="w-5 h-5" />
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.product._id}
                  className="bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors"
                >
                  <div className="p-5 flex gap-4">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      {getImageUrl(item.product) ? (
                        <img
                          src={getImageUrl(item.product)}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-xl"
                          onError={() => handleImageError(item.product._id)}
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-800 rounded-xl flex items-center justify-center">
                          <Image className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-white font-semibold truncate">
                            {item.product.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-yellow-400/80 text-sm font-medium">
                              {item.product.brand}
                            </span>
                            {item.product.capacity && (
                              <span className="text-white/30 text-xs">
                                · {item.product.capacity}
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-green-400 font-bold text-lg">
                              ${item.product.price?.toLocaleString("es-AR")}
                            </span>
                            {item.product.precioMayorista && (
                              <span className="text-white/30 text-xs">
                                Mayorista: $
                                {item.product.precioMayorista?.toLocaleString(
                                  "es-AR",
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-white font-bold text-lg">
                            $
                            {(
                              item.product.price * item.quantity
                            ).toLocaleString("es-AR")}
                          </p>
                          <p className="text-white/30 text-xs">
                            x{item.quantity}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                null,
                                item,
                                item.quantity - 1,
                              )
                            }
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center text-white font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                null,
                                item,
                                item.quantity + 1,
                              )
                            }
                            disabled={item.quantity >= item.product.stock}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          {item.product.stock && (
                            <span className="text-white/30 text-xs ml-2">
                              {item.product.stock} disponibles
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemoveFromCart(item.product)}
                          className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 bg-gray-900/50 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/50">Cantidad de productos</span>
                <span className="text-white font-medium">
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)} unidades
                </span>
              </div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-white/50">Subtotal</span>
                <span className="text-white font-semibold">
                  ${calculateTotal().toLocaleString("es-AR")}
                </span>
              </div>
              <div className="border-t border-white/5 mb-6" />
              <div className="flex items-center justify-between mb-6">
                <span className="text-white font-semibold text-lg">Total</span>
                <span className="text-yellow-400 font-bold text-2xl">
                  ${calculateTotal().toLocaleString("es-AR")}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCopyToClipboard}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <Copy className="w-5 h-5" />
                  Copiar pedido
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/25"
                >
                  <Send className="w-5 h-5" />
                  Finalizar pedido
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Tag className="w-5 h-5 text-yellow-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Resumen del pedido
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="bg-gray-800/30 rounded-xl p-4 mb-5 max-h-64 overflow-y-auto">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 bg-gray-700/50 px-2 py-0.5 rounded">
                        x{item.quantity}
                      </span>
                      <span className="text-white">{item.product.name}</span>
                    </div>
                    <span className="text-white/70">
                      $
                      {(item.product.price * item.quantity).toLocaleString(
                        "es-AR",
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <span className="text-white font-medium">Total a pagar</span>
              <span className="text-yellow-400 font-bold text-xl">
                ${calculateTotal().toLocaleString("es-AR")}
              </span>
            </div>

            {/* Notice */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-6">
              <p className="text-blue-300/80 text-xs text-center">
                Al generar el pedido serás redireccionado a WhatsApp para
                completar la compra con el vendedor
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-5 h-5" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar pedido
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Carrito;
