import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";
import api, { API_BASE, fetcher } from "../../lib/api";
import Swal from "sweetalert2";
import ProductDetail from "../../components/shared/ProductDetail";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useAuthStore from "../../stores/useAuthStore";
import useFavoritesStore from "../../stores/useFavoritesStore";
import useCartStore from "../../stores/useCartStore";
import {
  Heart,
  ShoppingCart,
  ArrowLeft,
  Image,
} from "../../components/common/Icons";

// Custom fetcher que devuelve solo data.data (para productos individuales)
const productFetcher = (url) => api.get(url).then((res) => res.data.data);

function ProductDetailPage() {
  const { id } = useParams();
  const { token, userId } = useAuthStore();
  const favoriteItems = useFavoritesStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);

  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const {
    data: product,
    error,
    isLoading,
  } = useSWR(id ? `/api/productos/${id}` : null, productFetcher);

  const handleAddToCart = async () => {
    if (!token) {
      Swal.fire({
        position: "center",
        icon: "info",
        title: "Debe iniciar sesión para comprar",
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    if (isAddingToCart) return;
    setIsAddingToCart(true);

    try {
      await api.post("/api/cart", {
        userId,
        productId: id,
        quantity: 1,
      });

      // Sync Zustand for badge
      const res = await api.get(`/api/cart/${userId}`);
      const backendItems = res.data.data.products || [];
      useCartStore.getState().syncFromBackend(backendItems);

      Swal.fire({
        position: "center",
        icon: "success",
        title: "Producto agregado al carrito",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Error al agregar al carrito",
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!token) {
      Swal.fire({
        position: "center",
        icon: "info",
        title: "Debe iniciar sesión para guardar favoritos",
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    if (isTogglingFavorite) return;
    setIsTogglingFavorite(true);

    try {
      await api.post("/api/favorites", {
        userId,
        productId: id,
      });

      // Sync Zustand with backend
      const res = await api.get(`/api/favorites/${userId}`);
      const favBackendItems = res.data.data.products || [];
      useFavoritesStore.getState().syncFromBackend(favBackendItems);

      Swal.fire({
        position: "center",
        icon: "success",
        title: "Agregado a favoritos",
        showConfirmButton: false,
        timer: 1200,
      });
    } catch (error) {
      console.error("Error al gestionar favorito:", error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // Obtener URL de imagen
  const imageUrl =
    imageError || !product?.image
      ? null
      : product.image.startsWith("http")
        ? product.image
        : `${API_BASE}/img/productos/${product.image}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando producto..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Error al cargar el producto
          </h2>
          <a href="/productos" className="text-yellow-400 hover:underline">
            Volver a productos
          </a>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Producto no encontrado
          </h2>
          <a href="/productos" className="text-yellow-400 hover:underline">
            Volver a productos
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <a
          href="/productos"
          className="inline-flex items-center gap-2 text-white/60 hover:text-yellow-400 mb-6 transition-colors"
        >
          <ArrowLeft />
          Volver a productos
        </a>

        {/* Product Card */}
        <div className="bg-gray-900 rounded-2xl border border-white/5 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative bg-gray-800">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8">
                  <Image className="w-24 h-24 text-white/10" />
                </div>
              )}

              {/* Stock Badge */}
              <div
                className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 0
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {product.stock > 0 ? "En Stock" : "Sin Stock"}
              </div>

              {/* Favorite Button */}
              {token && (
                <button
                  className={`absolute top-4 left-4 p-3 rounded-full transition-all ${
                    favoriteItems.some((f) => f._id === product._id)
                      ? "bg-red-500 text-white"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                  onClick={handleToggleFavorite}
                  disabled={isTogglingFavorite}
                >
                  <Heart
                    filled={favoriteItems.some((f) => f._id === product._id)}
                  />
                </button>
              )}
            </div>

            {/* Info */}
            <div className="p-8 flex flex-col">
              {/* Brand */}
              <div className="text-yellow-400 font-medium mb-2">
                {product.brand}
              </div>

              {/* Name */}
              <h1 className="text-3xl font-bold text-white mb-4">
                {product.name}
              </h1>

              {/* Category & Capacity */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/70">
                  {product.category}
                </span>
                {product.capacity && (
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/70">
                    {product.capacity}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mb-4">
                {product.precioMayorista ? (
                  <div className="flex items-baseline gap-4">
                    <div>
                      <p className="text-white/50 text-xs mb-1">Por Menor</p>
                      <div className="text-3xl font-bold text-white">
                        ${product.price?.toLocaleString("es-AR")}
                      </div>
                    </div>
                    <div>
                      <p className="text-green-400/70 text-xs mb-1">
                        Mayorista
                      </p>
                      <div className="text-2xl font-bold text-green-400">
                        ${product.precioMayorista?.toLocaleString("es-AR")}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-white">
                    ${product.price?.toLocaleString("es-AR")}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="text-white/60 mb-8 flex-grow">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Descripción
                </h3>
                <p>{product.description}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                {product.stock > 0 ? (
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isAddingToCart ? (
                      <>
                        <span className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                        Agregando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart />
                        Agregar al Carrito
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-gray-400 font-semibold py-3 px-6 rounded-xl cursor-not-allowed"
                  >
                    Sin Stock
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
