import { useContext, useState } from "react";
import "./CardProductosSearch.css";
import Swal from "sweetalert2";
import { CartContext } from "../context/ContextProvider";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

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
  const [mostrarComponente, setMostrarComponente] = useState(false);
  const { setCartCount, setFavoritesCount } = useContext(CartContext);
  const { userId } = useContext(AuthContext);

  const handleAddToCart = async (productId) => {
    try {
      if (userId) {
        await axios.post(
          "https://visual-detail-backend.onrender.com/api/cart",
          {
            userId,
            productId,
            quantity: 1,
          }
        );

        Swal.fire({
          position: "center",
          icon: "success",
          title: "Se agregó el producto al carrito",
          showConfirmButton: false,
          timer: 1500,
        });

        const response = await axios.get(
          `https://visual-detail-backend.onrender.com/api/cart/${userId}`
        );
        const itemsCart = response.data.data.products;
        const cartCount = itemsCart.reduce(
          (count, item) => count + item.quantity,
          0
        );
        setCartCount(cartCount);
      } else {
        Swal.fire({
          position: "center",
          icon: "info",
          title: "Debe iniciar sesión!",
          showConfirmButton: false,
          timer: 2500,
        });
        return;
      }
    } catch (error) {
      console.error("Error al agregar el producto al carrito:", error);
    }
  };

  const handleAddToFavorites = async (productId) => {
    try {
      if (userId) {
        await axios.post(
          "https://visual-detail-backend.onrender.com/api/favorites",
          {
            userId,
            productId,
          }
        );

        Swal.fire({
          position: "center",
          icon: "success",
          title: "Se agregó el producto a favoritos",
          showConfirmButton: false,
          timer: 1500,
        });

        const response = await axios.get(
          `https://visual-detail-backend.onrender.com/api/favorites/${userId}`
        );
        const favItems = response.data.data.products || [];
        setFavoritesCount(favItems.length);
      } else {
        Swal.fire({
          position: "center",
          icon: "info",
          title: "Debe iniciar sesión!",
          showConfirmButton: false,
          timer: 2500,
        });
        return;
      }
    } catch (error) {
      console.error("Error al agregar el producto a favoritos:", error);
    }
  };

  return (
    <div className="card cardP m-3 bg-dark text-light d-flex h-100">
      <img
        className="imgCard d-flex"
        src={
          image?.startsWith("http")
            ? image
            : `https://visual-detail-backend.onrender.com/img/productos/${image}`
        }
        alt={name}
      />
      <div className="card-body">
        <h5 className="card-title">{name}</h5>
        <div className="descripcion">
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-secondary m-1 btn-description"
              onClick={() => setMostrarComponente(!mostrarComponente)}
            >
              {mostrarComponente ? `Ocultar` : `Ver descripción`}
            </button>
          </div>
          <div className={`mt-3 ${mostrarComponente ? "show-element" : ""}`}>
            {mostrarComponente && (
              <p className="card-text text-start">{description}</p>
            )}
          </div>
        </div>

        <div className="card-text d-flex pt-3">
          <p className="text-muted text-center w-50">{capacity}</p>
          <strong className="text-muted align-self-center pb-3">|</strong>
          <p className="text-muted text-center w-50">{category}</p>
        </div>
        <div className="card-text d-flex justify-content-center">
          <p className="text-muted text-center">{brand}</p>
        </div>
        <div className="card-text d-flex justify-content-center">
          <p
            className={
              stock > 0
                ? "text-success text-center "
                : "text-danger text-center "
            }
          >
            {stock > 0 ? "Stock disponible" : "Sin Stock"}
          </p>
        </div>
      </div>
      <div className="card-footer">
        <div className="card-price p-1">$ {price}</div>
        <div className="car-buttons btnCardPr d-flex justify-content-center">
          {stock > 0 ? (
            <button
              className="btn btn-primary me-2 w-50 btncart"
              onClick={() => handleAddToCart(_id)}
            >
              Comprar
            </button>
          ) : (
            <></>
          )}

          <button
            className="btn btn-warning w-50 btnfav"
            onClick={() => {
              handleAddToFavorites(_id);
            }}
          >
            <span className="material-icons-outlined">favorite</span>
          </button>
        </div>
      </div>
    </div>
  );
}
export default CardProductos;
