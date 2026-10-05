import useTaxonomyOptions from "../../hooks/useTaxonomyOptions";
import { slugify } from "../../lib/slugify";
import { Category, Circle, Star } from "../common/Icons";

// Active values come from the URL: usually a slug, but legacy links may
// still carry the display name.
const matchesOption = (option, value) =>
  !!value &&
  (option.slug === value ||
    option.name === value ||
    option.slug === slugify(value));

const findOption = (options, value) =>
  options.find((option) => matchesOption(option, value));

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
            key={item.slug}
            active={matchesOption(item, activeItem)}
            onClick={() => onItemClick(item)}
          >
            {item.name}
          </FilterButton>
        ))}
      </div>
    </div>
  );
}

/**
 * Brand/category filter picker. `activeCategory` / `activeBrand` are the URL
 * values (slug, or a legacy name); the click handlers receive the option slug,
 * or null to clear. Brand and category combine independently.
 */
function Filters({
  handleCategoryClick,
  handleBrandClick,
  activeCategory,
  activeBrand,
}) {
  const { brands, categories } = useTaxonomyOptions();

  const handleCategorySelect = (category) => {
    // Si ya está activo, quitamos el filtro
    handleCategoryClick(
      matchesOption(category, activeCategory) ? null : category.slug,
    );
  };

  const handleBrandSelect = (brand) => {
    // Si ya está activo, quitamos el filtro
    handleBrandClick(matchesOption(brand, activeBrand) ? null : brand.slug);
  };

  const activeCategoryLabel =
    findOption(categories, activeCategory)?.name || activeCategory;
  const activeBrandLabel = findOption(brands, activeBrand)?.name || activeBrand;

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
                    {activeCategoryLabel}
                    <button
                      onClick={() => handleCategoryClick(null)}
                      className="ml-1 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                )}
                {activeBrand && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
                    <Category className="w-4 h-4" />
                    {activeBrandLabel}
                    <button
                      onClick={() => handleBrandClick(null)}
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
