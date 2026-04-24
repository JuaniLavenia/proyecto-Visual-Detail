import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router';
import './App.css';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy loading de todas las páginas
const HomePage = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Auth'));
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
          </Routes>
        </main>
        
        <Footer />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;