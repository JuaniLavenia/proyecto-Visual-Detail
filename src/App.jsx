import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes } from "react-router";
import HomePage from "./pages/Home";
import Footer from "./components/Footer";
import { CartContextProvider } from "./context/ContextProvider";
import { AuthContextProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Login from "./pages/Login";
import Favoritos from "./pages/Favoritos";
import Carrito from "./pages/Carrito";
import Producto from "./pages/admin/Producto";
import ProductoEdit from "./pages/admin/ProductoEdit";
import ProductoCreate from "./pages/admin/ProductoCreate";
import Productos from "./pages/Productos";

function App() {
  return (
    <>
      <AuthContextProvider>
        <CartContextProvider>
          <Header />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/adm/productos" element={<Producto />} />
            <Route path="/adm/productos/edit/:id" element={<ProductoEdit />} />
            <Route path="/adm/productos/create" element={<ProductoCreate />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/login" element={<Login />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/favoritos" element={<Favoritos />} />
          </Routes>

          <Footer />
        </CartContextProvider>
      </AuthContextProvider>
    </>
  );
}

export default App;
