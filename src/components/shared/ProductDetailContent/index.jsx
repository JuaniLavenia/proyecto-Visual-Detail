import { useState } from "react";
import useSWR from "swr";
import Swal from "sweetalert2";
import api, { API_BASE } from "../../../lib/api";
import { formatPrice } from "../../../lib/pricing";
import { useProductActions } from "../../../hooks/useProductActions";
import useAuthStore from "../../../stores/useAuthStore";
import { Heart, ShoppingCart, Image } from "../../common/Icons";

// A single product comes wrapped in { data }
const productFetcher = (url) => api.get(url).then((res) => res.data.data);

function notify(icon, title, timer = 1500) {
  Swal.fire({ position: "center", icon, title, showConfirmButton: false, timer });
}

function getImageUrl(image) {
  if (!image) return null;
  return image.startsWith("http") ? image : `${API_BASE}/img/productos/${image}`;
}

/**
 * Product detail body: fetches the product by id and renders image, brand,
 * name, chips, prices, stock, description and the cart/favorite actions.
 * `titleId` is set on the visible heading so a dialog can be labelled by it.
 */
function ProductDetailContent({ productId, titleId, onBackToCatalog }) {
  const token = useAuthStore((state) => state.token);
  const [imageError, setImageError] = useState(false);
  const {
    isAddingToCart,
    isTogglingFavorite,
    addToCart,
    toggleFavorite,
    isFavoriteById,
  } = useProductActions(true);

  const {
    data: product,
    error,
    isLoading,
  } = useSWR(productId ? `/api/productos/${productId}` : null, productFetcher);

  if (isLoading) return <ProductDetailSkeleton titleId={titleId} />;

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-6 py-16 sm:py-20">
        <h2 id={titleId} className="text-2xl font-bold text-white mb-2">
          {error ? "Error al cargar el producto" : "Producto no encontrado"}
        </h2>
        <p className="text-white/50 mb-6">
          Puede que el producto ya no esté disponible.
        </p>
        <button
          type="button"
          onClick={onBackToCatalog}
          className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold py-2.5 px-6 rounded-xl transition-colors"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  const isFavorite = isFavoriteById(product._id);
  const inStock = product.stock > 0;
  const imageUrl = imageError ? null : getImageUrl(product.image);

  const handleAddToCart = async () => {
    if (!token) {
      notify("info", "Debe iniciar sesión para comprar", 2500);
      return;
    }

    const result = await addToCart(product);
    if (result.success) {
      notify("success", "Producto agregado al carrito");
    } else if (result.needsAuth) {
      notify("info", "Debe iniciar sesión para comprar", 2500);
    } else if (result.error) {
      notify("error", "Error al agregar al carrito", 2000);
    }
  };

  const handleToggleFavorite = async () => {
    if (!token) {
      notify("info", "Debe iniciar sesión para guardar favoritos", 2500);
      return;
    }

    const result = await toggleFavorite(product);
    if (result.success) {
      notify(
        "success",
        result.wasAdded ? "Agregado a favoritos" : "Quitado de favoritos",
        1200,
      );
    } else if (result.error) {
      notify("error", "Error al gestionar favoritos", 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      {/* Image */}
      <div className="relative bg-gray-800 aspect-square md:aspect-auto md:min-h-[24rem]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain p-6 sm:p-8"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Image className="w-24 h-24 text-white/10" />
          </div>
        )}

        {token && (
          <button
            type="button"
            className={`absolute top-4 left-4 p-3 rounded-full transition-all ${
              isFavorite
                ? "bg-red-500 text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <Heart filled={isFavorite} />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-6 sm:p-8 flex flex-col">
        {product.brand && (
          <div className="text-yellow-400 font-medium mb-2">{product.brand}</div>
        )}

        <h2 id={titleId} className="text-2xl sm:text-3xl font-bold text-white mb-4">
          {product.name}
        </h2>

        {/* Category, capacity and stock */}
        <div className="flex flex-wrap gap-2 mb-4">
          {product.category && (
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/70">
              {product.category}
            </span>
          )}
          {product.capacity && (
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/70">
              {product.capacity}
            </span>
          )}
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              inStock
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {inStock ? "En Stock" : "Sin Stock"}
          </span>
        </div>

        {/* Prices: retail and wholesale, as on the catalog card */}
        <div className="mb-6">
          {product.precioMayorista ? (
            <div className="flex items-baseline gap-4">
              <div>
                <p className="text-white/50 text-xs mb-1">Por Menor</p>
                <div className="text-3xl font-bold text-white">
                  {formatPrice(product.price)}
                </div>
              </div>
              <div>
                <p className="text-green-400/70 text-xs mb-1">Mayorista</p>
                <div className="text-2xl font-bold text-green-400">
                  {formatPrice(product.precioMayorista)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-3xl font-bold text-white">
              {formatPrice(product.price)}
            </div>
          )}
        </div>

        {product.description && (
          <div className="text-white/60 mb-8 flex-grow">
            <h3 className="text-lg font-semibold text-white mb-2">Descripción</h3>
            <p className="whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex gap-4">
          {inStock ? (
            <button
              type="button"
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
              type="button"
              disabled
              className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-gray-400 font-semibold py-3 px-6 rounded-xl cursor-not-allowed"
            >
              Sin Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductDetailSkeleton({ titleId }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 animate-pulse" aria-busy="true">
      <h2 id={titleId} className="sr-only">
        Cargando producto...
      </h2>
      <div className="bg-gray-800 aspect-square md:aspect-auto md:min-h-[24rem]" />
      <div className="p-6 sm:p-8 space-y-4">
        <div className="h-4 w-24 bg-white/10 rounded" />
        <div className="h-8 w-3/4 bg-white/10 rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-white/10 rounded-full" />
          <div className="h-6 w-16 bg-white/10 rounded-full" />
        </div>
        <div className="h-10 w-40 bg-white/10 rounded" />
        <div className="space-y-2 pt-4">
          <div className="h-3 w-full bg-white/10 rounded" />
          <div className="h-3 w-5/6 bg-white/10 rounded" />
          <div className="h-3 w-2/3 bg-white/10 rounded" />
        </div>
        <div className="h-12 w-full bg-white/10 rounded-xl" />
      </div>
    </div>
  );
}

export default ProductDetailContent;
