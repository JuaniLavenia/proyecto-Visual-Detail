import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import visual from "../assets/img/visual.png";
import "material-icons/iconfont/material-icons.css";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/ContextProvider";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";

function Header() {
  const { setCartCount, setFavoritesCount, cartCount, favoritesCount } =
    useContext(CartContext);
  const { token, logout, userId } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    const favItems = JSON.parse(localStorage.getItem("favItems")) || [];

    const cartCount = cartItems.reduce(
      (count, item) => count + item.quantity,
      0
    );
    const favCount = favItems.length;

    setCartCount(cartCount);
    setFavoritesCount(favCount);
  }, [setCartCount, setFavoritesCount]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    logout("");
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Se cerró la sesion",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const handleChangeSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const buscar = () => {
    if (searchTerm === "") {
      navigate("/busqueda");
    }
  };

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <header className="fixed-top position-sticky allHeader">
        <div
          className={`overlay ${menuOpen ? "overlay-active" : ""}`}
          id="overlay"
        ></div>

        <section className="px-3 py-1 navSect1">
          <nav className="navbar navbar-expand-lg navbar-dark">
            <div className="container-fluid">
              <Link className="navbar-brand" to="/">
                <img className="img-nav" src={visual} alt="" />
              </Link>
              <button
                className="navbar-toggler"
                type="button"
                onClick={handleMenuToggle}
              >
                <span
                  className={`navbar-toggler-icon ${
                    menuOpen ? "collapsed" : ""
                  }`}
                ></span>
              </button>
              <div
                className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}
                id="navbarNav"
              >
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li>
                    <Link to="/" className="nav-link text-light">
                      <svg
                        className="bi d-block mx-auto mb-1"
                        width="30px"
                        height="30px"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        color="#ffffff"
                      >
                        <path
                          d="M6 20H3V6l9-2 9 2v14h-3M6 20h12M6 20v-4m12 4v-4M6 12V8h12v4M6 12h12M6 12v4m12-4v4M6 16h12"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                      Inicio
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-light" to="/productos">
                      <svg
                        className="bi d-block mx-auto mb-1"
                        width="30px"
                        height="30px"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        color="#ffffff"
                      >
                        <path
                          d="M19.26 9.696l1.385 9A2 2 0 0118.67 21H5.33a2 2 0 01-1.977-2.304l1.385-9A2 2 0 016.716 8h10.568a2 2 0 011.977 1.696zM14 5a2 2 0 10-4 0"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                      Productos
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link text-light"
                      target="_blank"
                      to="https://goo.gl/maps/pyTLGSD6mtBn7HvN9"
                    >
                      <svg
                        className="bi d-block mx-auto mb-1"
                        width="30px"
                        height="30px"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        color="#ffffff"
                      >
                        <path
                          d="M20 10c0 4.418-8 12-8 12s-8-7.582-8-12a8 8 0 1116 0z"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        ></path>
                        <path
                          d="M12 11a1 1 0 100-2 1 1 0 000 2z"
                          fill="#ffffff"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                      Ubicanos
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link text-light"
                      to="/contactanos"
                      data-toggle="modal"
                      data-target="#modalContact"
                    >
                      <svg
                        className="bi d-block mx-auto mb-1"
                        width="30px"
                        height="30px"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        color="#ffffff"
                      >
                        <path
                          d="M7.5 22a5.5 5.5 0 10-4.764-2.75l-.461 2.475 2.475-.46A5.474 5.474 0 007.5 22z"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M15.282 17.898A7.946 7.946 0 0018 16.93l3.6.67-.67-3.6A8 8 0 106.083 8.849"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                      Contactanos
                    </Link>
                  </li>
                  <li className="nav-item" id="login-register">
                    {token ? (
                      <Link
                        className="nav-link text-light"
                        to="/"
                        onClick={handleLogout}
                      >
                        <svg
                          className="bi d-block mx-auto mb-1"
                          width="30px"
                          height="30px"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          color="#ffffff"
                        >
                          <g
                            clipPath="url(#remove-user_svg__clip0)"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18.621 12.121L20.743 10m2.121-2.121L20.743 10m0 0L18.62 7.879M20.743 10l2.121 2.121M1 20v-1a7 7 0 017-7v0a7 7 0 017 7v1M8 12a4 4 0 100-8 4 4 0 000 8z"></path>
                          </g>
                          <defs>
                            <clipPath id="remove-user_svg__clip0">
                              <path fill="#fff" d="M0 0h24v24H0z"></path>
                            </clipPath>
                          </defs>
                        </svg>
                        Cerrar Sesión
                      </Link>
                    ) : (
                      <Link className="nav-link text-light" to="/login">
                        <svg
                          className="bi d-block mx-auto mb-1"
                          width="30px"
                          height="30px"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          color="#ffffff"
                        >
                          <path
                            d="M5 20v-1a7 7 0 017-7v0a7 7 0 017 7v1M12 12a4 4 0 100-8 4 4 0 000 8z"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>
                        </svg>
                        Iniciar Sesion
                      </Link>
                    )}
                  </li>
                  <li className="nav-item" id="pag-admin">
                    {token && userId === "65dbfbfdbbaccc7f307ebc2e" && (
                      <Link className="nav-link text-light" to="/adm/productos">
                        <svg
                          className="bi d-block mx-auto mb-1"
                          width="30px"
                          height="30px"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          color="#ffffff"
                        >
                          <path
                            d="M12 12a4 4 0 100-8 4 4 0 000 8z"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>
                          <path
                            d="M5 20v-1a7 7 0 0110-6.326M21 22l1-6-3.5 1.8L17 16l-1.5 1.8L12 16l1 6h8z"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>
                        </svg>
                        Administrador
                      </Link>
                    )}
                  </li>
                </ul>
                <svg
                  width="40px"
                  strokeWidth="1.5"
                  height="40px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  color="#ffffff"
                >
                  <path
                    d="M19 20H5a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2z"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  ></path>
                  <path
                    d="M16.5 14a.5.5 0 110-1 .5.5 0 010 1z"
                    fill="#ffffff"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M18 7V5.603a2 2 0 00-2.515-1.932l-11 2.933A2 2 0 003 8.537V9"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  ></path>
                </svg>
                <span className="navbar-text text-light navTxt">
                  Aceptamos todos los medios de pago. Efectivo, crédito, débito
                  y Mercado Pago.
                </span>
              </div>
            </div>
          </nav>
        </section>
        <section className="px-3 py-2 navSect2">
          <div className="container d-flex flex-wrap searchIcons">
            <form className="d-flex search" role="search">
              <input
                className="searchbar"
                type="search"
                maxLength={15}
                placeholder="Buscar"
                value={searchTerm}
                onChange={handleChangeSearch}
              />

              <Link
                className="lupa"
                onClick={buscar}
                to={`/busqueda/${searchTerm}`}
              >
                <span className="material-icons-outlined">search</span>
              </Link>
            </form>
            <div className="d-flex favCart">
              <div className="carrito">
                <Link to="/carrito" className="text-decoration-none">
                  <button className="car">
                    <span className="material-icons-outlined md-48">
                      shopping_cart
                    </span>
                    {cartCount > 0 && (
                      <span className="badgeCart">{cartCount}</span>
                    )}
                  </button>
                </Link>
              </div>
              <div>
                <Link to="/favoritos" className="text-decoration-none">
                  <button className="fav">
                    <span className="material-icons-outlined">favorite</span>
                    {favoritesCount > 0 && (
                      <span className="badgeFav">{favoritesCount}</span>
                    )}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </header>
    </>
  );
}

export default Header;
