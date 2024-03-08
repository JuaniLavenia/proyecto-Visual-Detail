import React, { useState } from "react";

function CategoryButton({
  category,
  handleCategoryClick,
  activeCategory,
  children,
  onClick,
}) {
  const isActive = category === activeCategory;

  return (
    <button
      type="button"
      className={
        isActive ? "active btn btn-outline-warning" : "btn btn-outline-warning"
      }
      data-category={category}
      onClick={() => {
        handleCategoryClick(category);
        if (onClick) onClick();
      }}
    >
      {children}
    </button>
  );
}

function Filters({ handleCategoryClick, handleBrandClick, getProductos }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeBrand, setActiveBrand] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    "Interiores",
    "Exteriores",
    "Línea Profesional",
    "Línea Industrial",
    "Perfumes y Aromatizantes",
    "Pads y Baking Plates",
    "Microfibras",
    "Aplicadores",
    "Cepillos y Brochas",
    "Dosificadores y Foams",
    "Otros",
  ];
  const brands = [
    "Toxic-Shine",
    "Fullcar",
    "Dreams",
    "Ternnova",
    "Drop",
    "Menzerna",
    "Meguiars",
    "Vonixx",
    "Laffitte",
    "Stretch",
    "Otros",
  ];

  const clearFilters = () => {
    if (activeBrand || activeCategory) {
      setActiveCategory(null);
      setActiveBrand(null);
      getProductos(1, 12);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center flex-column mt-3">
      <button
        type="button"
        className="btn btn-outline-warning"
        onClick={() => setShowFilters(!showFilters)}
      >
        Filtros
      </button>
      <button
        type="button"
        className="btn btn-outline-warning"
        onClick={() => clearFilters()}
      >
        Limpiar filtro
      </button>
      {showFilters && (
        <div>
          <div className="btn-group d-flex text-center mb-4 categorias">
            <h4 className="mt-4">Categorías:</h4>
            {categories.map((category) => (
              <CategoryButton
                key={category}
                category={category}
                handleCategoryClick={(category) => {
                  setActiveCategory(category);
                  handleCategoryClick(category);
                }}
                activeCategory={activeCategory}
              >
                {category}
              </CategoryButton>
            ))}
          </div>
          <div className="btn-group d-flex text-center mb-4 categorias">
            <h4>Marcas:</h4>
            {brands.map((brand) => (
              <CategoryButton
                key={brand}
                category={brand}
                handleCategoryClick={(brand) => {
                  setActiveBrand(brand);
                  handleBrandClick(brand);
                }}
                activeCategory={activeBrand}
              >
                {brand}
              </CategoryButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Filters;
