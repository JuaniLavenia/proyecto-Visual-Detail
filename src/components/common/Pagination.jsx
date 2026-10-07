import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight } from "./Icons";

// Windowed page numbers, same pattern as the PLP (src/pages/Products).
export function getPageNumbers(page, totalPages) {
  const size = Math.min(5, totalPages);
  let start = 1;
  if (totalPages > 5) {
    if (page >= totalPages - 2) start = totalPages - 4;
    else if (page > 3) start = page - 2;
  }
  return Array.from({ length: size }, (_, i) => start + i);
}

/**
 * Prev/next plus up to five numbered pages. Renders nothing for one page.
 */
function Pagination({
  page,
  totalPages,
  onChange,
  disabled = false,
  ariaLabel = "Paginación",
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-8 flex justify-center" aria-label={ariaLabel}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={disabled || page === 1}
          aria-label="Página anterior"
          className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {getPageNumbers(page, totalPages).map((pageNum) => (
          <button
            type="button"
            key={pageNum}
            onClick={() => onChange(pageNum)}
            disabled={disabled}
            aria-current={page === pageNum ? "page" : undefined}
            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
              page === pageNum
                ? "bg-yellow-500 text-gray-900"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {pageNum}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={disabled || page >= totalPages}
          aria-label="Página siguiente"
          className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  ariaLabel: PropTypes.string,
};

export default Pagination;
