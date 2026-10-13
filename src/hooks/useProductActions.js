import { useState, useCallback } from 'react';
import {
  setCartProductQuantity,
  addFavoriteProduct,
  removeFavoriteProduct,
} from '../lib/cart-favorites-api';
import useCartStore from '../stores/useCartStore';
import useFavoritesStore from '../stores/useFavoritesStore';
import useAuthStore from '../stores/useAuthStore';

/**
 * Hook personalizado para acciones de producto
 * Maneja add to cart, toggle favorite con loading states y optimistic updates
 * 
 * @param {boolean} useOptimistic - Habilita optimistic updates (default: true)
 * @returns {object} Funciones y estados para manipular el carrito y favoritos
 */
export function useProductActions(useOptimistic = true) {
  const { userId, token } = useAuthStore();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  
  // Store getters
  const cartItems = useCartStore((state) => state.items);
  const favoriteItems = useFavoritesStore((state) => state.items);

  // Check si el usuario está autenticado
  const requireAuth = useCallback(() => {
    return !!(token && userId);
  }, [token, userId]);

  // Agregar al carrito con optimistic update ( opcional)
  const addToCart = useCallback(async (product) => {
    if (!requireAuth()) return { success: false, needsAuth: true };
    
    if (isAddingToCart) return { success: false, loading: true };
    setIsAddingToCart(true);

    const productId = product._id || product.id;
    
    try {
      // Optimistic update: agregar localmente antes de API call
      if (useOptimistic) {
        const cartStore = useCartStore.getState();
        cartStore.addItem(product);
      }

      // API call: the response carries the updated cart and syncs the store
      await setCartProductQuantity(productId, 1);

      return { success: true };
    } catch (error) {
      // Revertir optimistic update si falla
      if (useOptimistic) {
        const cartStore = useCartStore.getState();
        cartStore.removeItem(productId);
      }
      
      console.error('Error adding to cart:', error);
      return { success: false, error };
    } finally {
      setIsAddingToCart(false);
    }
  }, [requireAuth, useOptimistic, isAddingToCart]);

  // Toggle favorito
  const toggleFavorite = useCallback(async (product) => {
    if (!requireAuth()) return { success: false, needsAuth: true };
    
    if (isTogglingFavorite) return { success: false, loading: true };
    setIsTogglingFavorite(true);

    const productId = product._id || product.id;
    const isFavorite = favoriteItems.some(f => f._id === productId);

    try {
      // Optimistic toggle
      if (useOptimistic) {
        const favStore = useFavoritesStore.getState();
        if (isFavorite) {
          favStore.removeFavorite(productId);
        } else {
          favStore.addFavorite(product);
        }
      }

      // POST only adds (400 if already there); removing needs the DELETE route.
      // Either response carries the updated favorites and syncs the store.
      if (isFavorite) {
        await removeFavoriteProduct(userId, productId);
      } else {
        await addFavoriteProduct(productId);
      }

      return { success: true, wasAdded: !isFavorite };
    } catch (error) {
      // Revertir optimistic toggle
      if (useOptimistic) {
        const favStore = useFavoritesStore.getState();
        if (isFavorite) {
          favStore.addFavorite(product);
        } else {
          favStore.removeFavorite(productId);
        }
      }
      
      console.error('Error toggling favorite:', error);
      return { success: false, error };
    } finally {
      setIsTogglingFavorite(false);
    }
  }, [userId, requireAuth, favoriteItems, useOptimistic, isTogglingFavorite]);

  // Helpers para UI
  const isInCart = useCallback((productId) => {
    return cartItems.some(item => (item._id || item.id) === productId);
  }, [cartItems]);

  const isFavoriteById = useCallback((productId) => {
    return favoriteItems.some(item => item._id === productId);
  }, [favoriteItems]);

  const getCartQuantity = useCallback((productId) => {
    const item = cartItems.find(i => (i._id || i.id) === productId);
    return item?.quantity || 0;
  }, [cartItems]);

  return {
    // Estados de carga
    isAddingToCart,
    isTogglingFavorite,
    isLoading: isAddingToCart || isTogglingFavorite,
    
    // Acciones
    addToCart,
    toggleFavorite,
    
    // Helpers
    isInCart,
    isFavoriteById,
    getCartQuantity,
    
    // Para acceso directo si necesario
    cartItems,
    favoriteItems,
    requireAuth,
  };
}

export default useProductActions;