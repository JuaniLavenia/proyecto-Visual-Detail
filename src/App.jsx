import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import { toast } from './components/common/SimpleDialog';
import useAuthStore, { syncAuthAcrossTabs } from './stores/useAuthStore';
import useCartStore from './stores/useCartStore';
import useFavoritesStore from './stores/useFavoritesStore';
import {
  onAuthTokenRefreshed,
  offAuthTokenRefreshed,
  SessionEndReasons,
} from './lib/api';

// Shown when the session ends without the user logging out.
const FORCED_LOGOUT_MESSAGES = {
  [SessionEndReasons.EXPIRED]: 'Tu sesión expiró. Iniciá sesión nuevamente.',
  [SessionEndReasons.INACTIVE]:
    'Tu cuenta está desactivada. Contactá a un administrador.',
};

// Lazy loading de todas las páginas
const HomePage = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Auth'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Contact = lazy(() => import('./pages/Contact'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const ProductEdit = lazy(() => import('./pages/admin/Products/ProductEdit'));
const ProductCreate = lazy(() => import('./pages/admin/Products/ProductCreate'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminTaxonomy = lazy(() => import('./pages/admin/Taxonomy'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));

// Layout components
const Header = lazy(() => import('./components/layout/Header'));
const Footer = lazy(() => import('./components/layout/Footer'));

// Componente de fallback para Suspense
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" text="Cargando página..." />
    </div>
  );
}

function App() {
  const navigate = useNavigate();

  // Pick up logins, logouts and token rotations made in other tabs
  useEffect(() => syncAuthAcrossTabs(), []);

  // Sincronizar el store cuando el token se renueva desde el api interceptor
  useEffect(() => {
    const handleTokenRefresh = (token, refreshToken, endReason) => {
      if (token && refreshToken) {
        // Token actualizado exitosamente - sincronizar con el store
        useAuthStore.getState().updateTokens(token, refreshToken);
        return;
      }

      // The API layer ended the session (refresh rejected or account
      // deactivated). Only explain it when this tab still had a session, so
      // repeated failures or anonymous requests do not show the toast.
      const hadSession = !!useAuthStore.getState().token;
      useAuthStore.getState().logout();
      if (!hadSession) return;

      useCartStore.getState().clearCart();
      useFavoritesStore.getState().clearFavorites();
      toast(
        FORCED_LOGOUT_MESSAGES[endReason] ||
          FORCED_LOGOUT_MESSAGES[SessionEndReasons.EXPIRED],
        'warning',
        5000,
      );
      navigate('/login', { replace: true });
    };

    // Registrar el callback
    onAuthTokenRefreshed(handleTokenRefresh);

    // Cleanup al desmontar
    return () => {
      offAuthTokenRefreshed(handleTokenRefresh);
    };
  }, [navigate]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Header />
        
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/productos" element={<Products />} />
            <Route path="/productos/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar" element={<ForgotPassword />} />
            <Route path="/reset/:id" element={<ResetPassword />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/contactanos" element={<Contact />} />
            <Route path="/perfil" element={<Profile />} />
            
            {/* Rutas de Admin */}
            <Route path="/adm/dashboard" element={<AdminDashboard />} />
            <Route path="/adm/pedidos" element={<AdminOrders />} />
            <Route path="/adm/productos" element={<AdminProducts />} />
            <Route path="/adm/productos/edit/:id" element={<ProductEdit />} />
            <Route path="/adm/productos/create" element={<ProductCreate />} />
            <Route path="/adm/usuarios" element={<AdminUsers />} />
            <Route path="/adm/taxonomia" element={<AdminTaxonomy />} />
          </Routes>
        </main>
        
        <Footer />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;