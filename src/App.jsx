import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Lazy loading de todas las páginas
const HomePage = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Productos = lazy(() => import('./pages/Productos'));
const Carrito = lazy(() => import('./pages/Carrito'));
const Favoritos = lazy(() => import('./pages/Favoritos'));
const Contactanos = lazy(() => import('./pages/Contactanos'));
const Profile = lazy(() => import('./pages/Profile'));
const Producto = lazy(() => import('./pages/admin/Producto'));
const ProductoEdit = lazy(() => import('./pages/admin/ProductoEdit'));
const ProductoCreate = lazy(() => import('./pages/admin/ProductoCreate'));

// Layout components
const Header = lazy(() => import('./components/header/Header'));
const Footer = lazy(() => import('./components/footer/Footer'));

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
            <Route path="/productos" element={<Productos />} />
            <Route path="/login" element={<Login />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/contactanos" element={<Contactanos />} />
            <Route path="/perfil" element={<Profile />} />
            
            {/* Rutas de Admin */}
            <Route path="/adm/productos" element={<Producto />} />
            <Route path="/adm/productos/edit/:id" element={<ProductoEdit />} />
            <Route path="/adm/productos/create" element={<ProductoCreate />} />
          </Routes>
        </main>
        
        <Footer />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;