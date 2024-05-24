import "./Carrito.css";
import { useState, useEffect, useContext } from "react";
import { Button, Modal } from "react-bootstrap";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/ContextProvider";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

function Carrito() {
  const { setCartCount } = useContext(CartContext);
  const { userId } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(
        `https://visual-detail-backend.onrender.com/api/cart/${userId}`
      );
      const items = response.data.data.products || [];
      setCartItems(items);
      const cartCount = items.reduce((count, item) => count + item.quantity, 0);
      setCartCount(cartCount);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCartItems();
    }
  }, []);

  const handleRemoveFromCart = (producto) => {
    Swal.fire({
      title: "Eliminar producto",
      text: `¿Estás seguro que deseas eliminar ${producto.name} del carrito?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `https://visual-detail-backend.onrender.com/api/cart/${userId}/${producto._id}`
          );

          setCartItems((prevItems) =>
            prevItems.filter((item) => item._id !== producto._id)
          );

          const cartCount = cartItems.reduce(
            (count, item) => count + item.quantity,
            0
          );

          setCartCount(cartCount);

          Swal.fire({
            position: "center",
            icon: "success",
            title: "Se borró el producto con éxito",
            showConfirmButton: false,
            timer: 1500,
          });

          fetchCartItems();
        } catch (error) {
          console.error("Error removing from cart:", error);
        }
      }
    });
  };

  const calculateTotal = () => {
    let total = 0;
    cartItems.forEach((item) => {
      total += item.product.price * item.quantity;
    });
    return total;
  };

  const handleShowModal = (e) => {
    const token = localStorage.getItem("token");
    if (token) {
      e.preventDefault();
      setShowModal(true);
    } else {
      Swal.fire({
        position: "center",
        icon: "info",
        title: "Debe iniciar sesión para realizar la compra",
        showConfirmButton: false,
        timer: 2500,
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://visual-detail-backend.onrender.com/api/pedidos",
        {
          usuario: userId,
          productos: cartItems.map((item) => ({
            nombre: item.product.name,
            cantidad: item.product.quantity,
          })),
        }
      );

      if (response.status === 201) {
        setIsLoading(false);
        const whatsappLink = `https://wa.me/+543812026631?text=Hola!%20Quisiera%20realizar%20el%20siguiente%20pedido:%0A${cartItems
          .map((item) => `. ${item.product.name} (${item.product.quantity})`)
          .join("%0A")}`;
        window.location.href = whatsappLink;
      } else {
        setIsLoading(false);
        console.log("Error al crear el pedido en el servidor");
      }
    } catch (error) {
      setIsLoading(false);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "No se pudo realizar el pedido",
      });
      console.log("Error al crear el pedido:", error);
    }
  };

  const handleQuantityChange = async (e, index, productId) => {
    const newCartItems = [...cartItems];
    const value = parseInt(e.target.value);

    if (!isNaN(value) && value >= 0) {
      newCartItems[index].quantity = value;
      setCartItems(newCartItems);

      try {
        await axios.post(
          "https://visual-detail-backend.onrender.com/api/cart",
          {
            userId,
            productId,
            quantity: value,
          }
        );

        const cartCount = newCartItems.reduce(
          (count, item) => count + item.quantity,
          0
        );
        setCartCount(cartCount);
      } catch (error) {
        console.error("Error updating quantity in cart:", error);
      }
    }
  };

  const handleCopyToClipboard = () => {
    const orderDetail = cartItems
      .map((item) => `${item.product.name} (${item.product.quantity})`)
      .join("\n");
    navigator.clipboard.writeText(
      `Hola! Quisiera realizar el siguiente pedido:\n${orderDetail}`
    );
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Detalle del pedido copiado al portapapeles",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  return (
    <div className="main bg-dark text-light">
      <div className="table-responsive">
        {cartItems.length > 0 ? (
          <>
            {cartItems.map((item, index) => (
              <div className="card-container" key={index}>
                <div
                  className=" cardCart bg-dark text-light carritoItems w-100"
                  key={index}
                >
                  <div className="card-image">
                    <img
                      src={
                        item.product.image?.startsWith("http")
                          ? item.product.image
                          : `https://visual-detail-backend.onrender.com/img/productos/${item.product.image}`
                      }
                      alt={item.product.name}
                    />
                  </div>
                  <div className="card-details">
                    <div className="card-name">
                      {item.product.name} x({item.quantity})
                    </div>
                    <div className="card-buttons buttonsCart d-flex">
                      <button
                        className="btn btn-danger"
                        onClick={() => handleRemoveFromCart(item.product)}
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

                      <Button variant="warning" onClick={handleShowModal}>
                        Comprar Ahora ({item.quantity})
                      </Button>
                    </div>
                  </div>
                  <div className="card-quantity">
                    <label htmlFor={`quantity_${index}`}>Cantidad:</label>
                    <input
                      type="number"
                      id={`quantity_${index}`}
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(e, index, item.product._id)
                      }
                      min={1}
                      max={item.product.stock}
                      className="customInput"
                    />
                  </div>
                  <div className="card-price">$ {item.product.price}</div>
                </div>
              </div>
            ))}

            <div className="col total-comprar">
              <h3 className="itemCardTotal" id="itemTotal">
                Total ${calculateTotal()}
              </h3>

              <Button variant="success" onClick={handleShowModal}>
                Comprar Todo
              </Button>
            </div>
          </>
        ) : (
          <p className="text-center">No hay productos en el carrito.</p>
        )}
      </div>

      {showModal && (
        <>
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton className="bg-dark text-light">
              <Modal.Title>Información del pedido</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-dark text-light">
              <p>Detalle del Pedido:</p>
              <ul>
                {cartItems.map((item, index) => (
                  <li
                    key={index}
                  >{`${item.product.name} (${item.quantity})`}</li>
                ))}
              </ul>
              <Button variant="secondary" onClick={handleCopyToClipboard}>
                Copiar al portapapeles
              </Button>
              <p className="mt-4 fst-italic text-center">
                Al generar el pedido se lo redireccionara al chat de Whatsapp
                donde podra terminar con la compra.
              </p>
            </Modal.Body>
            <Modal.Footer className="bg-dark text-light">
              <Button variant="danger" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handlePayment}
                disabled={isLoading}
              >
                {isLoading ? "Generando..." : "Generar pedido y enviar"}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}

export default Carrito;
