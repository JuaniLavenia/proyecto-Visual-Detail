import { useState } from "react";

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
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a12.84 12.84 0 003.748.599l4.852-.672a11.88 11.88 0 00-1.693-1.694l-.672-.672a11.88 11.88 0 01-.33-2.607c.372-1.018.308-1.938-.33-2.607L12.16 6.34c-.699-.699-.872-1.78-.33-2.607a12.84 12.84 0 00-.748-3.748l-.672-4.852A2.25 2.25 0 009.568 3z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 6h.008v.008H6V6z"
                      />
                    </svg>
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
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                      />
                    </svg>
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
                stroke="currentColor"
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
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
            }
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
