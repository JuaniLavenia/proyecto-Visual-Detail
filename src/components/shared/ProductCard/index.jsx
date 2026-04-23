import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./index.css";
import Swal from "sweetalert2";
import useAuthStore from "../../../stores/useAuthStore";
import useFavoritesStore from "../../../stores/useFavoritesStore";
import useCartStore from "../../../stores/useCartStore";
import axios from "axios";
import { Heart, ShoppingCart, Eye, Package } from "../../common/Icons";

const API_BASE = "https://visual-detail-backend.onrender.com";
// const API_BASE = "http://localhost:5000";

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
  const { userId, token, role, isMayorista } = useAuthStore();
  const favoriteItems = useFavoritesStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

  // Local state para favorito instantáneo (antes de la API)
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async () => {
    if (!token) {
      Swal.fire({
        position: "center",
        icon: "info",
        title: "Debe iniciar sesión para comprar",
        showConfirmButton: false,
        timer: 2500,
      });
      navigate("/login");
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/cart`, {
        userId,
        productId: _id,
        quantity: 1,
      });

      // Sync Zustand for badge
      const res = await axios.get(`${API_BASE}/api/cart/${userId}`);
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
      navigate("/login");
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/favorites`, {
        userId,
        productId: _id,
      });

      // Sync Zustand with backend
      const res = await axios.get(`${API_BASE}/api/favorites/${userId}`);
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
          className={`product-card-favorite ${favoriteItems.some((f) => f._id === _id) ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFavorite();
          }}
          title={
            favoriteItems.some((f) => f._id === _id)
              ? "Quitar de favoritos"
              : "Agregar a favoritos"
          }
        >
          <Heart
            className="w-5 h-5"
            filled={favoriteItems.some((f) => f._id === _id)}
          />
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
          {role === "mayorista" && precioMayorista ? (
            <span className="text-green-400">
              ${precioMayorista.toLocaleString("es-AR")}
            </span>
          ) : role === "mayorista" && !precioMayorista ? (
            <span className="text-green-400">
              ${(price * 0.85).toLocaleString("es-AR")}{" "}
              <span className="text-xs">(15% dto)</span>
            </span>
          ) : (
            <span>${price.toLocaleString("es-AR")}</span>
          )}
        </div>

        {/* Actions */}
        <div className="product-card-actions">
          {stock > 0 ? (
            <button
              className="product-card-btn product-card-btn-primary"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-5 h-5" />
              Comprar
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
