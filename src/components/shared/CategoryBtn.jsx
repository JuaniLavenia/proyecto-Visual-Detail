import { useState } from "react";
import { Filter, Category, Circle, Star } from "../common/Icons";

function FilterButton({ children, active, onClick, icon }) {
  return (
    <button
      type="button"
      className={`
        px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
        ${
          active
            ? "bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/20"
            : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:border-white/20"
        }
      `}
      onClick={onClick}
    >
      <span className="flex items-center gap-2">
        {icon && <span className="text-base">{icon}</span>}
        {children}
      </span>
    </button>
  );
}

function FilterSection({ title, items, activeItem, onItemClick, icon }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <FilterButton
            key={item}
            active={activeItem === item}
            onClick={() => onItemClick(item)}
          >
            {item}
          </FilterButton>
        ))}
      </div>
    </div>
  );
}

function Filters({
  handleCategoryClick,
  handleBrandClick,
  getProductos,
  onClearFilters,
  activeCategory,
  activeBrand,
}) {
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

  const handleCategorySelect = (category) => {
    // Si ya está activo, quitamos el filtro
    if (activeCategory === category) {
      handleCategoryClick(null);
    } else {
      // Seleccionar nueva categoría y resetear marca
      handleCategoryClick(category);
    }
  };

  const handleBrandSelect = (brand) => {
    // Si ya está activo, quitamos el filtro
    if (activeBrand === brand) {
      handleBrandClick(null);
    } else {
      // Seleccionar nueva marca y resetear categoría
      handleBrandClick(brand);
    }
  };

  const hasActiveFilters = activeCategory || activeBrand;

  return (
    <div className="w-full">
      {/* Filter Sections */}
      <div
        className={`
          overflow-hidden transition-all duration-300
          max-h-[1000px] opacity-100
        `}
      >
        <div className="bg-gray-900/50 backdrop-blur-sm p-5">
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mb-5 pb-5 border-b border-white/10">
              <div className="flex flex-wrap gap-2">
                {activeCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">
                    <Circle className="w-4 h-4" />
                    {activeCategory}
                    <button
                      onClick={() => handleCategorySelect(activeCategory)}
                      className="ml-1 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                )}
                {activeBrand && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
                    <Category className="w-4 h-4" />
                    {activeBrand}
                    <button
                      onClick={() => handleBrandSelect(activeBrand)}
                      className="ml-1 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Categories */}
          <FilterSection
            title="Categorías"
            icon={
              <svg
                className="w-4 h-4"
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
            }
            items={categories}
            activeItem={activeCategory}
            onItemClick={handleCategorySelect}
          />

          {/* Brands */}
          <FilterSection
            title="Marcas"
            icon={<Star className="w-4 h-4" />}
            items={brands}
            activeItem={activeBrand}
            onItemClick={handleBrandSelect}
          />
        </div>
      </div>
    </div>
  );
}

export default Filters;
