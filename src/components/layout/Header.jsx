import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuthStore from "../../stores/useAuthStore";
import useCartStore from "../../stores/useCartStore";
import useFavoritesStore from "../../stores/useFavoritesStore";
import Swal from "sweetalert2";
import visual from "../../assets/img/visual.png";
import { Home, Grid, Location, Contact, User, Logout, Settings, ShoppingCart, Heart, Search, Menu, CreditCard, Close } from "../common/Icons";

function NavLink({ to, icon, children, onClick, external, badge }) {
  const navigate = useNavigate();

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
    "flex items-center px-4 py-2.5 text-white no-underline hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 cursor-pointer";

  const handleClick = (e) => {
    // If external link, let browser handle it
    if (external) return;

    // Close menu first, then navigate
    if (onClick) {
      onClick();
    }
    // Navigate to the new page
    navigate(to);
  };

  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClass}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={baseClass} onClick={handleClick}>
      {content}
    </div>
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
          relative
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
              <NavLink to="/" icon={<Home className="w-6 h-6" />}>
                Inicio
              </NavLink>
              <NavLink to="/productos" icon={<Grid className="w-6 h-6" />}>
                Productos
              </NavLink>
              <NavLink
                to="https://goo.gl/maps/pyTLGSD6mtBn7HvN9"
                external
                icon={<Location className="w-6 h-6" />}
              >
                Ubicación
              </NavLink>
              <NavLink to="/contactanos" icon={<Contact className="w-6 h-6" />}>
                Contacto
              </NavLink>

              {token ? (
                <>
                  <NavLink
                    to="/"
                    onClick={handleLogout}
                    icon={<Logout className="w-6 h-6" />}
                  >
                    Cerrar Sesión
                  </NavLink>
                  {isAdmin && (
                    <NavLink to="/adm/productos" icon={<Settings className="w-6 h-6" />}>
                      Admin
                    </NavLink>
                  )}
                </>
              ) : (
                <NavLink to="/login" icon={<User className="w-6 h-6" />}>
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
                    className="w-40 lg:w-56 pl-4 pr-10 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-yellow-400 transition-colors"
                  >
                    <Search className="w-5 h-5" />
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
                  <ShoppingCart className="w-6 h-6" />
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
                  <Heart className="w-6 h-6" />
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
                    <User className="w-6 h-6" />
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                {mobileMenuOpen ? (
                  <Close className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Payment Info Bar */}
          <div className="hidden lg:flex items-center justify-center py-2 border-t border-white/10">
            <CreditCard className="w-6 h-6" />
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
                  <Search className="w-5 h-5" />
                </span>
              </div>
            </form>

            <NavLink
              to="/"
              icon={<Home className="w-6 h-6" />}
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </NavLink>
            <NavLink
              to="/productos"
              icon={<Grid className="w-6 h-6" />}
              onClick={() => setMobileMenuOpen(false)}
            >
              Productos
            </NavLink>
            <NavLink
              to="https://goo.gl/maps/pyTLGSD6mtBn7HvN9"
              external
              icon={<Location className="w-6 h-6" />}
            >
              Ubicación
            </NavLink>
            <NavLink
              to="/contactanos"
              icon={<Contact className="w-6 h-6" />}
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
                  icon={<Logout className="w-6 h-6" />}
                >
                  Cerrar Sesión
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/adm/productos"
                    icon={<Settings className="w-6 h-6" />}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Panel Admin
                  </NavLink>
                )}
              </>
            ) : (
              <NavLink
                to="/login"
                icon={<User className="w-6 h-6" />}
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
