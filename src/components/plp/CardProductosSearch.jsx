import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CardProductosSearch.css";
import Swal from "sweetalert2";
import useAuthStore from "../../stores/useAuthStore";
import useFavoritesStore from "../../stores/useFavoritesStore";
import useCartStore from "../../stores/useCartStore";
import axios from "axios";

const API_BASE = "https://visual-detail-backend.onrender.com";
// const API_BASE = "http://localhost:5000";

// Icons
const Icons = {
  Heart: ({ filled }) => (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  ),
  Cart: () => (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  ),
  View: () => (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Package: () => (
    <svg
      className="w-12 h-12 text-white/20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
      />
    </svg>
  ),
};

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
}) {
  const { userId, token } = useAuthStore();
  const navigate = useNavigate();

  // Local state para favorito instantáneo (antes de la API)
  const [isFavorite, setIsFavorite] = useState(false);
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
      // Toggle local state primero para UX instantánea
      setIsFavorite(!isFavorite);

      if (!isFavorite) {
        // Agregar a favoritos (API)
        await axios.post(`${API_BASE}/api/favorites`, {
          userId,
          productId: _id,
        });

        Swal.fire({
          position: "center",
          icon: "success",
          title: "Agregado a favoritos",
          showConfirmButton: false,
          timer: 1200,
        });
      } else {
        // Eliminar de favoritos (necesitarías endpoint)
        // Por ahora solo quitamos el estado local
      }
    } catch (error) {
      // Revertir estado local si falla
      setIsFavorite(isFavorite);
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
            <Icons.Package />
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
          title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Icons.Heart filled={isFavorite} />
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

        {/* Price */}
        <div className="product-card-price">
          ${price.toLocaleString("es-AR")}
        </div>

        {/* Actions */}
        <div className="product-card-actions">
          {stock > 0 ? (
            <button
              className="product-card-btn product-card-btn-primary"
              onClick={handleAddToCart}
            >
              <Icons.Cart />
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
            <Icons.View />
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
