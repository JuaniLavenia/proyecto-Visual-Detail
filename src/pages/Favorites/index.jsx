import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import useAuthStore from "../../stores/useAuthStore";
import useFavoritesStore from "../../stores/useFavoritesStore";
import useCartStore from "../../stores/useCartStore";
import {
  Heart,
  Trash,
  ShoppingCart,
  ArrowLeft,
  Package,
  Image,
  Eye,
  Spinner,
  Search,
  ChevronRight,
} from "../../components/common/Icons";
import "./index.css";

const API_BASE = "https://visual-detail-backend.onrender.com";
// const API_BASE = "http://localhost:5000";

function Favoritos() {
  const { userId, token } = useAuthStore();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [search, setSearch] = useState("");

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/favorites/${userId}`);
      const favItems = response.data.data.products || [];
      setFavorites(favItems);

      // Sync Zustand
      useFavoritesStore.getState().syncFromBackend(favItems);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
      return;
    }
    fetchFavorites();
  }, []);

  const getImageUrl = (product) => {
    if (imageErrors[product._id]) return null;
    if (product.image?.startsWith("http")) return product.image;
    return `${API_BASE}/img/productos/${product.image}`;
  };

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const removeFavorite = (product) => {
    Swal.fire({
      title: "¿Eliminar de favoritos?",
      text: `¿Querés sacar ${product.name} de tus favoritos?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#eab308",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `${API_BASE}/api/favorites/${userId}/${product._id}`,
          );

          // Sync Zustand
          const res = await axios.get(`${API_BASE}/api/favorites/${userId}`);
          useFavoritesStore
            .getState()
            .syncFromBackend(res.data.data.products || []);

          Swal.fire({
            icon: "success",
            title: "Eliminado de favoritos",
            showConfirmButton: false,
            timer: 1500,
          });

          fetchFavorites();
        } catch (error) {
          console.error("Error removing favorite:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar",
          });
        }
      }
    });
  };

  const handleAddToCart = async (product) => {
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

    try {
      await axios.post(`${API_BASE}/api/cart`, {
        userId,
        productId: product._id,
        quantity: 1,
      });

      // Sync Zustand
      const res = await axios.get(`${API_BASE}/api/cart/${userId}`);
      useCartStore.getState().syncFromBackend(res.data.data.products || []);

      Swal.fire({
        position: "center",
        icon: "success",
        title: "Producto agregado al carrito",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo agregar al carrito",
      });
    }
  };

  const filteredFavorites = favorites.filter(
    (item) =>
      item.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.product?.brand?.toLowerCase().includes(search.toLowerCase()) ||
      item.product?.category?.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
          <p className="text-white/50">Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-2">
            <Link
              to="/productos"
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                <Heart className="w-7 h-7 text-red-400" />
                Mis Favoritos
              </h1>
              <p className="text-white/50 mt-1">
                {favorites.length} producto{favorites.length !== 1 ? "s" : ""}{" "}
                en favoritos
              </p>
            </div>
          </div>

          {/* Search */}
          <form className="mt-6" onSubmit={(e) => e.preventDefault()}>
            <div className="flex gap-3 max-w-md">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar en favoritos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredFavorites.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-white/20" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {search
                ? "No se encontraron favoritos"
                : "No tenés favoritos guardados"}
            </h2>
            <p className="text-white/50 mb-8">
              {search
                ? "Probá con otros términos de búsqueda"
                : "Explorá el catálogo y guardá los productos que te gusten"}
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
          <div className="space-y-4">
            {filteredFavorites.map((item) => {
              const product = item.product;
              return (
                <div
                  key={product._id}
                  className="bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors"
                >
                  <div className="p-5 flex gap-4">
                    {/* Image */}
                    <Link
                      to={`/productos/${product._id}`}
                      className="flex-shrink-0"
                    >
                      {getImageUrl(product) ? (
                        <img
                          src={getImageUrl(product)}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-xl hover:opacity-80 transition-opacity"
                          onError={() => handleImageError(product._id)}
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-800 rounded-xl flex items-center justify-center">
                          <Image className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            to={`/productos/${product._id}`}
                            className="text-white font-semibold hover:text-yellow-400 transition-colors truncate block"
                          >
                            {product.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-yellow-400/80 text-sm font-medium">
                              {product.brand}
                            </span>
                            {product.category && (
                              <span className="text-white/30 text-xs">
                                · {product.category}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-green-400 font-bold text-lg">
                              ${product.price?.toLocaleString("es-AR")}
                            </span>
                            {product.precioMayorista && (
                              <span className="text-white/40 text-xs">
                                Mayorista: $
                                {product.precioMayorista?.toLocaleString(
                                  "es-AR",
                                )}
                              </span>
                            )}
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

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.stock}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Agregar al carrito
                        </button>
                        <Link
                          to={`/productos/${product._id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-xl transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Ver producto
                        </Link>
                        <button
                          onClick={() => removeFavorite(product)}
                          className="ml-auto p-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar de favoritos"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Favoritos;
