import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { useProductActions } from "../../../hooks/useProductActions";
import useAuthStore from "../../../stores/useAuthStore";
import { API_BASE } from "../../../lib/api";
import { toast } from "../../common/SimpleDialog";
import { Heart, ShoppingCart, Eye, Package } from "../../common/Icons";

function CardProductos({
  image,
  name,
  description,
  capacity,
  category,
  _id,
  price,
  stock,
  brand,
  precioMayorista,
}) {
  const { role } = useAuthStore();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  // Usar el hook personalizado
  const {
    isAddingToCart,
    isTogglingFavorite,
    addToCart,
    toggleFavorite,
    isFavoriteById,
  } = useProductActions(true);

  const isFavorite = isFavoriteById(_id);

  const handleAddToCart = async () => {
    // Check auth primero
    if (!useAuthStore.getState().token) {
      navigate("/login");
      return;
    }

    const result = await addToCart({
      _id,
      name,
      price,
      brand,
      image,
      category,
      stock,
    });

    if (result.success) {
      toast("Producto agregado al carrito", "success");
    } else if (result.needsAuth) {
      navigate("/login");
    } else if (result.error) {
      toast("Error al agregar al carrito", "danger");
    }
  };

  const handleToggleFavorite = async () => {
    if (!useAuthStore.getState().token) {
      navigate("/login");
      return;
    }

    const product = {
      _id,
      name,
      price,
      brand,
      image,
      category,
      stock,
      precioMayorista,
    };
    const result = await toggleFavorite(product);

    if (result.success) {
      toast(
        result.wasAdded ? "Agregado a favoritos" : "Quitado de favoritos",
        "success",
      );
    } else if (result.needsAuth) {
      navigate("/login");
    }
  };

  const handleViewProduct = () => {
    navigate(`/productos/${_id}`);
  };

  // Obtener URL de imagen
  const imageUrl =
    imageError || !image
      ? null
      : image.startsWith("http")
        ? image
        : `${API_BASE}/img/productos/${image}`;

  return (
    <div className="product-card group">
      {/* Image Container */}
      <div
        className="product-card-image"
        onClick={handleViewProduct}
        style={{ cursor: "pointer" }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-white/20" />
          </div>
        )}

        {/* Stock Badge */}
        <div
          className={`product-card-badge ${stock > 0 ? "in-stock" : "out-of-stock"}`}
        >
          {stock > 0 ? "En Stock" : "Sin Stock"}
        </div>

        {/* Favorite Button */}
        <button
          className={`product-card-favorite ${isFavorite ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFavorite();
          }}
          disabled={isTogglingFavorite}
          title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart className="w-5 h-5" filled={isFavorite} />
        </button>
      </div>

      {/* Body */}
      <div className="product-card-body">
        {/* Brand */}
        <div className="product-card-brand">{brand}</div>

        {/* Title */}
        <h3
          className="product-card-title"
          onClick={handleViewProduct}
          style={{ cursor: "pointer" }}
        >
          {name}
        </h3>

        {/* Category & Capacity */}
        <div className="product-card-category">{category}</div>
        {capacity && <div className="product-card-capacity">{capacity}</div>}

        {/* Price - Mostrar según role del usuario */}
        <div className="product-card-price">
          {precioMayorista ? (
            <div className="flex items-baseline gap-4">
              <div>
                <p className="text-white/50 text-xs mb-1">Por Menor</p>
                <div className="text-3xl font-bold text-white">
                  ${price?.toLocaleString("es-AR")}
                </div>
              </div>
              <div>
                <p className="text-green-400/70 text-xs mb-1">Mayorista</p>
                <div className="text-2xl font-bold text-green-400">
                  ${precioMayorista?.toLocaleString("es-AR")}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-3xl font-bold text-white">
              ${price?.toLocaleString("es-AR")}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="product-card-actions">
          {stock > 0 ? (
            <button
              className="product-card-btn product-card-btn-primary"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Agregando...
                </span>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Comprar
                </>
              )}
            </button>
          ) : (
            <button
              className="product-card-btn product-card-btn-primary"
              disabled
            >
              Sin Stock
            </button>
          )}

          <button
            className="product-card-btn product-card-btn-secondary"
            onClick={handleViewProduct}
            title="Ver detalles"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardProductos;

// Skeleton Loader Component
export function ProductCardSkeleton() {
  return (
    <div className="product-card">
      <div className="skeleton skeleton-image" />
      <div className="product-card-body">
        <div className="skeleton skeleton-text short" />
        <div className="skeleton skeleton-text medium" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-price" />
      </div>
    </div>
  );
}

// Empty State Component
export function ProductCardEmpty({
  title = "No se encontraron productos",
  message = "Intenta con otros filtros o ingresa otro término de búsqueda.",
}) {
  return (
    <div className="col-12">
      <div className="empty-state">
        <div className="empty-state-icon">📦</div>
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-text">{message}</p>
      </div>
    </div>
  );
}
