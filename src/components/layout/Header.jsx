import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuthStore from "../../stores/useAuthStore";
import useCartStore from "../../stores/useCartStore";
import useFavoritesStore from "../../stores/useFavoritesStore";
import Swal from "sweetalert2";
import visual from "../../assets/img/visual.png";

// Icon Components - más limpios y reutilizables
const Icons = {
  Home: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  ),
  Products: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
      />
    </svg>
  ),
  Location: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  ),
  Contact: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  ),
  User: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  ),
  Logout: () => (
    <svg
      width="25px"
      height="25px"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="#fff"
    >
      <path
        d="M12 12H19M19 12L16 15M19 12L16 9"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M19 6V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V18"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  ),
  Admin: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Cart: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  ),
  Heart: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  ),
  Search: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.196 10.196z"
      />
    </svg>
  ),
  Menu: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  ),
  CreditCard: () => (
    <svg
      className="w-8 h-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
      />
    </svg>
  ),
};

function NavLink({ to, icon, children, onClick, external, badge }) {
  const content = (
    <>
      <span className="flex-shrink-0">{icon}</span>
      <span className="ml-2 font-medium">{children}</span>
      {badge && (
        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </>
  );

  const baseClass =
    "flex items-center px-4 py-2.5 text-white no-underline hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200";

  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClass}
      >
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={`${baseClass} w-full text-left`}>
        {content}
      </button>
    );
  }

  return (
    <Link to={to} className={baseClass}>
      {content}
    </Link>
  );
}

function Header() {
  const { token, logout, isAdmin } = useAuthStore();
  const cartCount = useCartStore((state) => state.getTotalItems());
  const favoritesCount = useFavoritesStore((state) => state.getCount());

  const [searchTerm, setSearchTerm] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Sesión cerrada",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/productos?search=${searchTerm}`);
      setSearchTerm("");
    }
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Glassmorphism Nav */}
      <nav
        className={`
          transition-all duration-300
          ${
            isScrolled
              ? "bg-gray-900/95 backdrop-blur-xl shadow-2xl border-b border-white/10"
              : "bg-gradient-to-b from-gray-900/90 to-gray-900/70 backdrop-blur-sm"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group">
              <img
                src={visual}
                alt="Visual Detailing"
                className={`h-12 lg:h-16 transition-transform duration-300 group-hover:scale-105 ${isScrolled ? "h-10 lg:h-12" : ""}`}
              />
            </Link>

            {/* Desktop Navigation - Center */}
            <div className="hidden lg:flex items-center space-x-1">
              <NavLink to="/" icon={<Icons.Home />}>
                Inicio
              </NavLink>
              <NavLink to="/productos" icon={<Icons.Products />}>
                Productos
              </NavLink>
              <NavLink
                to="https://goo.gl/maps/pyTLGSD6mtBn7HvN9"
                external
                icon={<Icons.Location />}
              >
                Ubicación
              </NavLink>
              <NavLink to="/contactanos" icon={<Icons.Contact />}>
                Contacto
              </NavLink>

              {token ? (
                <>
                  <NavLink
                    to="/"
                    onClick={handleLogout}
                    icon={<Icons.Logout />}
                  >
                    Cerrar Sesión
                  </NavLink>
                  {isAdmin && (
                    <NavLink to="/adm/productos" icon={<Icons.Admin />}>
                      Admin
                    </NavLink>
                  )}
                </>
              ) : (
                <NavLink to="/login" icon={<Icons.User />}>
                  Iniciar Sesión
                </NavLink>
              )}
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Search Bar - Desktop */}
              <form
                onSubmit={handleSearchSubmit}
                className="hidden md:flex items-center"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-40 lg:w-56 pl-4 pr-10 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-yellow-400 transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-yellow-400 transition-colors"
                  >
                    <Icons.Search />
                  </button>
                </div>
              </form>

              {/* Icons */}
              <div className="flex items-center space-x-1">
                {/* Cart */}
                <Link
                  to="/carrito"
                  className="relative p-2.5 text-white/80 hover:text-yellow-400 hover:bg-white/10 rounded-full transition-all"
                >
                  <Icons.Cart />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>

                {/* Favorites */}
                <Link
                  to="/favoritos"
                  className="relative p-2.5 text-white/80 hover:text-red-500 hover:bg-white/10 rounded-full transition-all"
                >
                  <Icons.Heart />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full">
                      {favoritesCount > 9 ? "9+" : favoritesCount}
                    </span>
                  )}
                </Link>

                {/* Profile - Only when logged in */}
                {token && (
                  <Link
                    to="/perfil"
                    className="p-2.5 text-white/80 hover:text-blue-400 hover:bg-white/10 rounded-full transition-all"
                  >
                    <Icons.User />
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                {mobileMenuOpen ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <Icons.Menu />
                )}
              </button>
            </div>
          </div>

          {/* Payment Info Bar */}
          <div className="hidden lg:flex items-center justify-center py-2 border-t border-white/10">
            <Icons.CreditCard />
            <span className="ml-2 text-sm text-white/70">
              Aceptamos todos los medios de pago: Efectivo, Crédito, Débito y
              Mercado Pago
            </span>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`
            lg:hidden absolute top-full left-0 right-0 bg-gray-900/98 backdrop-blur-xl border-t border-white/10 transition-all duration-300 overflow-hidden
            ${mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="px-4 py-4 space-y-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-yellow-400"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                  <Icons.Search />
                </span>
              </div>
            </form>

            <NavLink
              to="/"
              icon={<Icons.Home />}
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </NavLink>
            <NavLink
              to="/productos"
              icon={<Icons.Products />}
              onClick={() => setMobileMenuOpen(false)}
            >
              Productos
            </NavLink>
            <NavLink
              to="https://goo.gl/maps/pyTLGSD6mtBn7HvN9"
              external
              icon={<Icons.Location />}
            >
              Ubicación
            </NavLink>
            <NavLink
              to="/contactanos"
              icon={<Icons.Contact />}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contacto
            </NavLink>

            <div className="border-t border-white/10 my-2" />

            {token ? (
              <>
                <NavLink
                  to="/"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  icon={<Icons.Logout />}
                >
                  Cerrar Sesión
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/adm/productos"
                    icon={<Icons.Admin />}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Panel Admin
                  </NavLink>
                )}
              </>
            ) : (
              <NavLink
                to="/login"
                icon={<Icons.User />}
                onClick={() => setMobileMenuOpen(false)}
              >
                Iniciar Sesión
              </NavLink>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
