import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import useAuthStore from "../../stores/useAuthStore";
import useCartStore from "../../stores/useCartStore";
import useFavoritesStore from "../../stores/useFavoritesStore";
import {
  fetchCartProducts,
  fetchFavoriteProducts,
} from "../../lib/cart-favorites-api";
import Swal from "sweetalert2";
import visual from "../../assets/img/visual.png";
import {
  Home,
  Grid,
  Location,
  Contact,
  User,
  Logout,
  Settings,
  ShoppingCart,
  Heart,
  Search,
  Menu,
  CreditCard,
  Close,
  ChevronDown,
  Package,
  Users,
  Dollar,
  Tag,
} from "../common/Icons";

const NAV_ITEM_CLASS =
  "flex items-center px-4 py-2.5 text-white no-underline hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 cursor-pointer";

function NavItemContent({ icon, children }) {
  return (
    <>
      <span className="flex-shrink-0">{icon}</span>
      <span className="ml-2 font-medium">{children}</span>
    </>
  );
}

// Navigation entry: a real link, so it can be opened in a new tab.
function NavItem({ to, icon, children, onClick }) {
  return (
    <Link to={to} className={NAV_ITEM_CLASS} onClick={onClick}>
      <NavItemContent icon={icon}>{children}</NavItemContent>
    </Link>
  );
}

// Action entry styled like a navigation item (e.g. logging out).
function NavButton({ icon, children, onClick, className = "" }) {
  return (
    <button
      type="button"
      className={`${NAV_ITEM_CLASS} ${className}`.trim()}
      onClick={onClick}
    >
      <NavItemContent icon={icon}>{children}</NavItemContent>
    </button>
  );
}

function Header() {
  const userId = useAuthStore((state) => state.userId);
  const isLoggedIn = useAuthStore((state) => Boolean(state.token));
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const logoutWithApi = useAuthStore((state) => state.logoutWithApi);
  const cartItems = useCartStore((state) => state.items);
  const clearCartStore = useCartStore((state) => state.clearCart);
  const favoriteItems = useFavoritesStore((state) => state.items);
  const clearFavoritesStore = useFavoritesStore(
    (state) => state.clearFavorites,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    logoutWithApi();
    // Clear cart and favorites stores on logout to prevent stale data
    clearCartStore();
    clearFavoritesStore();
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
      navigate(`/productos?search=${encodeURIComponent(searchTerm.trim())}`);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAdminDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync cart and favorites from backend on login, logout and user switch.
  // Depends on whether there is a session, not on the token value, so a
  // token rotation does not refetch.
  useEffect(() => {
    if (isLoggedIn && userId) {
      // Each helper syncs its own store
      Promise.all([
        fetchCartProducts(userId),
        fetchFavoriteProducts(userId),
      ]).catch(() => {});
    }
  }, [userId, isLoggedIn]);

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
              <NavItem to="/" icon={<Home className="w-6 h-6" />}>
                Inicio
              </NavItem>
              <NavItem to="/productos" icon={<Grid className="w-6 h-6" />}>
                Productos
              </NavItem>
              <NavItem to="/ubicacion" icon={<Location className="w-6 h-6" />}>
                Ubicación
              </NavItem>
              <NavItem to="/contactanos" icon={<Contact className="w-6 h-6" />}>
                Contacto
              </NavItem>

              {isLoggedIn ? (
                <>
                  <NavButton
                    onClick={() => {
                      handleLogout();
                      navigate("/");
                    }}
                    icon={<Logout className="w-6 h-6" />}
                  >
                    Cerrar Sesión
                  </NavButton>
                  {isAdmin && (
                    <div className="relative" ref={dropdownRef}>
                      <button
                        className="flex items-center px-4 py-2.5 text-white no-underline hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 cursor-pointer"
                        onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                      >
                        <Settings className="w-6 h-6" />
                        <span className="ml-2 font-medium">Admin</span>
                        <ChevronDown
                          className={`w-4 h-4 ml-1 transition-transform ${adminDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {/* Admin Dropdown */}
                      <div
                        className={`absolute right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 transition-all ${adminDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
                      >
                        <Link
                          to="/adm/dashboard"
                          className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          <Package className="w-5 h-5 mr-2" />
                          Dashboard
                        </Link>
                        <Link
                          to="/adm/pedidos"
                          className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          <Dollar className="w-5 h-5 mr-2" />
                          Pedidos
                        </Link>
                        <Link
                          to="/adm/productos"
                          className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          <Grid className="w-5 h-5 mr-2" />
                          Productos
                        </Link>
                        <Link
                          to="/adm/usuarios"
                          className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          <Users className="w-5 h-5 mr-2" />
                          Usuarios
                        </Link>
                        <Link
                          to="/adm/taxonomia"
                          className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          <Tag className="w-5 h-5 mr-2" />
                          Marcas y Categorías
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <NavItem to="/login" icon={<User className="w-6 h-6" />}>
                  Iniciar Sesión
                </NavItem>
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
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full">
                      {cartItems.reduce(
                        (acc, item) => acc + (item.quantity || 1),
                        0,
                      ) > 9
                        ? "9+"
                        : cartItems.reduce(
                            (acc, item) => acc + (item.quantity || 1),
                            0,
                          )}
                    </span>
                  )}
                </Link>

                {/* Favorites */}
                <Link
                  to="/favoritos"
                  className="relative p-2.5 text-white/80 hover:text-red-500 hover:bg-white/10 rounded-full transition-all"
                >
                  <Heart className="w-6 h-6" />
                  {favoriteItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full">
                      {favoriteItems.length > 9 ? "9+" : favoriteItems.length}
                    </span>
                  )}
                </Link>

                {/* Profile - Only when logged in */}
                {isLoggedIn && (
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
          // Keep the collapsed menu out of the tab order (React 18 needs a string for inert)
          inert={mobileMenuOpen ? undefined : ""}
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

            <NavItem
              to="/"
              icon={<Home className="w-6 h-6" />}
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </NavItem>
            <NavItem
              to="/productos"
              icon={<Grid className="w-6 h-6" />}
              onClick={() => setMobileMenuOpen(false)}
            >
              Productos
            </NavItem>
            <NavItem
              to="/ubicacion"
              icon={<Location className="w-6 h-6" />}
              onClick={() => setMobileMenuOpen(false)}
            >
              Ubicación
            </NavItem>
            <NavItem
              to="/contactanos"
              icon={<Contact className="w-6 h-6" />}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contacto
            </NavItem>

            <div className="border-t border-white/10 my-2" />

            {isLoggedIn ? (
              <>
                <NavButton
                  className="w-full"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                    navigate("/");
                  }}
                  icon={<Logout className="w-6 h-6" />}
                >
                  Cerrar Sesión
                </NavButton>
                {isAdmin && (
                  <>
                    <div className="border-t border-white/10 my-2" />
                    <div className="px-4 py-2 text-xs font-semibold text-white/30 uppercase tracking-wider">
                      Panel Admin
                    </div>
                    <NavItem
                      to="/adm/dashboard"
                      icon={<Package className="w-5 h-5" />}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </NavItem>
                    <NavItem
                      to="/adm/pedidos"
                      icon={<Dollar className="w-5 h-5" />}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Pedidos
                    </NavItem>
                    <NavItem
                      to="/adm/productos"
                      icon={<Grid className="w-5 h-5" />}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Productos
                    </NavItem>
                    <NavItem
                      to="/adm/usuarios"
                      icon={<Users className="w-5 h-5" />}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Usuarios
                    </NavItem>
                    <NavItem
                      to="/adm/taxonomia"
                      icon={<Tag className="w-5 h-5" />}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Marcas y Categorías
                    </NavItem>
                  </>
                )}
              </>
            ) : (
              <NavItem
                to="/login"
                icon={<User className="w-6 h-6" />}
                onClick={() => setMobileMenuOpen(false)}
              >
                Iniciar Sesión
              </NavItem>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
