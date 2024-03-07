import { useContext, useEffect, useState } from "react";
import CardProductos from "../components/CardProductosSearch";
import axios from "axios";
import "./Productos.css";
import CategoryButton from "../components/CategoryBtn";
import { CartContext } from "../context/ContextProvider";
import Paginador from "../components/Paginador";
import Swal from "sweetalert2";
import { useLocation } from "react-router";

function SearchClean() {
  const { setCartCount, setFavoritesCount } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [categoria, setCategoria] = useState("");
  const [selectedBrand, setBrand] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSize, setCurrentSize] = useState(12);

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const categoriaParam = queryParams.get("category");
  const searchParam = queryParams.get("search");
  const handlePageChange = (newPage) => {
    if (newPage !== currentPage) {
      getProductos(newPage, currentSize);
    }
  };

  const totalPages = Math.ceil(totalRows / currentSize);

  const handleSizeChange = (size) => {
    if (size !== currentSize) {
      getProductos(currentPage, size);
    }
  };

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
  }, []);

  const getProductos = async (page, pageSize) => {
    setIsLoading(true);

    try {
      const response = await axios.get(
        `https://visual-detail-backend.onrender.com/api/productos?page=${page}&limit=${pageSize}`
      );
      setProducts(response.data.products);
      setTotalRows(response.data.totalProducts);
      setCurrentPage(page);
      setCurrentSize(pageSize);
    } catch (error) {
      setError("No se pudo establecer conexión con el servidor.");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (categoriaParam) {
      handleCategoryClick(categoriaParam);
    } else if (searchParam) {
      buscar(searchParam);
    } else {
      getProductos(currentPage, currentSize);
    }
  }, [searchParam]);

  const handleCategoryClick = async (category) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://visual-detail-backend.onrender.com/api/productos/category/${category}`
      );
      const data = await response.json();
      setProducts(data);
      setCategoria(category);
    } catch (error) {
      setError("No se pudo establecer conexión con el servidor.");
    }

    setIsLoading(false);
  };

  const handleBrandClick = async (brand) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://visual-detail-backend.onrender.com/api/productos/brand/${brand}`
      );
      const data = await response.json();
      setProducts(data);
      setBrand(brand);
    } catch (error) {
      setError("No se pudo establecer conexión con el servidor.");
    }

    setIsLoading(false);
  };

  const buscar = (search) => {
    setIsLoading(true);
    if (search == "") {
      getProductos(currentPage, currentSize);
    } else {
      axios
        .get(
          `https://visual-detail-backend.onrender.com/api/productos/search/${search}`
        )
        .then((res) => {
          setProducts(res.data);
        })
        .catch((error) => {
          setError("No se pudo establecer conexión con el servidor.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <>
      <div className="p-5 bg-dark text-light cleanSearch">
        <div className="row">
          <div className="col-md-3">
            <h4 className="text-center">Filtrar por categoría</h4>
            <div
              className="btn-group d-flex text-center mb-4 categorias"
              role="group"
              aria-label="Basic example"
            >
              <CategoryButton
                categoria="Interiores"
                handleCategoryClick={handleCategoryClick}
                activeCategory={categoria}
              >
                Interiores
              </CategoryButton>
              <CategoryButton
                categoria="Exteriores"
                handleCategoryClick={handleCategoryClick}
                activeCategory={categoria}
              >
                Exteriores
              </CategoryButton>
              <CategoryButton
                categoria="Línea Profesional"
                handleCategoryClick={handleCategoryClick}
                activeCategory={categoria}
              >
                Línea Profesional
              </CategoryButton>
              <CategoryButton
                categoria="Línea Industrial"
                handleCategoryClick={handleCategoryClick}
                activeCategory={categoria}
              >
                Línea Industrial
              </CategoryButton>
              <CategoryButton
                categoria="Perfumes"
                handleCategoryClick={handleCategoryClick}
                activeCategory={categoria}
              >
                Perfumes
              </CategoryButton>
              <CategoryButton
                categoria="Otros"
                handleCategoryClick={handleCategoryClick}
                activeCategory={categoria}
              >
                Otros
              </CategoryButton>
              <CategoryButton
                categoria="Productos"
                handleCategoryClick={handleCategoryClick}
                activeCategory={categoria}
                onClick={getProductos}
              >
                Todos los productos
              </CategoryButton>
            </div>
            <h4 className="text-center">Filtrar por marca</h4>
            <div
              className="btn-group d-flex text-center mb-4 categorias"
              role="group"
              aria-label="Basic example"
            >
              <CategoryButton
                categoria="Toxic-Shine"
                handleCategoryClick={handleBrandClick}
                activeCategory={selectedBrand}
              >
                Toxic-Shine
              </CategoryButton>

              <CategoryButton
                categoria="Fullcar"
                handleCategoryClick={handleBrandClick}
                activeCategory={selectedBrand}
              >
                Fullcar
              </CategoryButton>
              <CategoryButton
                categoria="Dreams"
                handleCategoryClick={handleBrandClick}
                activeCategory={selectedBrand}
              >
                Dreams
              </CategoryButton>
              <CategoryButton
                categoria="Ternnova"
                handleCategoryClick={handleBrandClick}
                activeCategory={selectedBrand}
              >
                Ternnova
              </CategoryButton>
              <CategoryButton
                categoria="Drop"
                handleCategoryClick={handleBrandClick}
                activeCategory={selectedBrand}
              >
                Drop
              </CategoryButton>
              <CategoryButton
                categoria="Menzerna"
                handleCategoryClick={handleBrandClick}
                activeCategory={selectedBrand}
              >
                Menzerna
              </CategoryButton>
              <CategoryButton
                categoria="Meguiars"
                handleCategoryClick={handleBrandClick}
                activeCategory={selectedBrand}
              >
                Meguiars
              </CategoryButton>
              <CategoryButton
                categoria="Vonixx"
                handleCategoryClick={handleBrandClick}
                activeCategory={selectedBrand}
              >
                Vonixx
              </CategoryButton>
              <CategoryButton
                categoria="Otros"
                handleCategoryClick={handleBrandClick}
                activeCategory={selectedBrand}
              >
                Otros
              </CategoryButton>
            </div>
          </div>

          <div className="col-md-9">
            <h1 className="text-center">Productos</h1>
            {isLoading ? (
              <p className="text-center">Cargando productos...</p>
            ) : (
              <div className="row">
                {error.length > 0 && (
                  <p className="text-center text-danger">{error}</p>
                )}
                <Paginador
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                  itemsPerPage={currentSize}
                  setItemsPerPage={handleSizeChange}
                />
                {products.map((product, index) => (
                  <div className="col-sm-6 col-md-4" key={index}>
                    <CardProductos
                      {...product}
                      setCartCount={setCartCount}
                      setFavoritesCount={setFavoritesCount}
                    />
                  </div>
                ))}
                <Paginador
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                  itemsPerPage={currentSize}
                  setItemsPerPage={handleSizeChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SearchClean;
