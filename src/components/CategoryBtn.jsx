import React from "react";

function CategoryButton({
  categoria,
  handleCategoryClick,
  activeCategory,
  children,
  onClick,
}) {
  const isActive = categoria === activeCategory;

  return (
    <button
      type="button"
      className={
        isActive ? "active btn btn-outline-warning" : "btn btn-outline-warning"
      }
      data-category={categoria}
      onClick={() => {
        handleCategoryClick(categoria);
        if (onClick) onClick();
      }}
    >
      {children}
    </button>
  );
}

export default CategoryButton;
