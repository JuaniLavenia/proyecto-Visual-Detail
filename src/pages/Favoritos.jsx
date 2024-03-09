import { useContext, useEffect, useState } from "react";
import "./Favoritos.css";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { CartContext } from "../context/ContextProvider";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function Favoritos() {
  const { setCartCount, setFavoritesCount } = useContext(CartContext);
  const { userId } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(
        `https://visual-detail-backend.onrender.com/api/favorites/${userId}`
      );
      const favItems = response.data.data.products || [];
      setFavorites(favItems);
      setFavoritesCount(favItems.length);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFavorites();
    }
  }, []);

  const removeFavorite = (producto) => {
    Swal.fire({
      title: "Eliminar producto",
      text: `¿Estás seguro que deseas eliminar ${producto.name} de favoritos?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `https://visual-detail-backend.onrender.com/api/favorites/${userId}/${producto._id}`
          );

          setFavorites((prevFavorites) =>
            prevFavorites.filter((item) => item._id !== producto._id)
          );
          setFavoritesCount((prevCount) => prevCount - 1);

          Swal.fire({
            position: "center",
            icon: "success",
            title: "Se borró el producto con éxito",
            showConfirmButton: false,
            timer: 1500,
          });
          fetchFavorites();
        } catch (error) {
          console.error("Error removing favorite:", error);
        }
      }
    });
  };

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

  return (
    <div className="favorites bg-dark text-light">
      <div className="favContainer">
        {favorites.length > 0 ? (
          <>
            {favorites.map((item, index) => (
              <div className="cardFav" key={index}>
                <div className="cardFavorites bg-dark text-light">
                  <img
                    src={`https://visual-detail-backend.onrender.com/img/productos/${item.product.image}`}
                    alt={item.product.name}
                    className="imgFav"
                  />
                  <div className="card-body">
                    <h3 className="card-title titl">
                      {item.product.name} -
                      <span className="text-muted"> {item.product.brand}</span>
                    </h3>
                    <p className="card-text descrpt mt-4">
                      {item.product.description}
                    </p>
                    <div className="cardBtnFav">
                      <button
                        className="btn btn-danger"
                        onClick={() => removeFavorite(item.product)}
                      >
                        Eliminar
                      </button>
                      <button className="btn btn-primary">
                        <Link
                          to="/productos"
                          className="text-light text-decoration-none"
                        >
                          Ver más productos
                        </Link>
                      </button>

                      <button
                        className="btn btn-warning"
                        onClick={() => handleAddToCart(item.product)}
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="cardPriceFav">$ {item.product.price}</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <p className="text-center">No tienes favoritos guardados.</p>
        )}
      </div>
    </div>
  );
}

export default Favoritos;
