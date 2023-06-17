import React, { createContext, useState } from "react";

const CartContext = createContext();

const CartContextProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  const cartContextValues = {
    cartCount,
    setCartCount,
    favoritesCount,
    setFavoritesCount,
  };

  return (
    <CartContext.Provider value={cartContextValues}>
      {children}
    </CartContext.Provider>
  );
};

export { CartContext, CartContextProvider };
