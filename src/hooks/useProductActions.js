import { useState, useCallback } from 'react';
import api from '../lib/api';
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
  const [isRemovingFromCart, setIsRemovingFromCart] = useState(false);
  
  // Store getters
  const cartItems = useCartStore((state) => state.items);
  const favoriteItems = useFavoritesStore((state) => state.items);
  const syncCartFromBackend = useCartStore((state) => state.syncFromBackend);
  const syncFavoritesFromBackend = useFavoritesStore((state) => state.syncFromBackend);

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

      // API call
      await api.post('/api/cart', {
        userId,
        productId,
        quantity: 1,
      });

      // Sync completo desde backend para mantener consistencia
      const res = await api.get(`/api/cart/${userId}`);
      const backendItems = res.data.data.products || [];
      syncCartFromBackend(backendItems);

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
  }, [userId, requireAuth, syncCartFromBackend, useOptimistic, isAddingToCart]);

  // Remover del carrito
  const removeFromCart = useCallback(async (productId) => {
    if (!requireAuth()) return { success: false, needsAuth: true };
    
    if (isRemovingFromCart) return { success: false, loading: true };
    setIsRemovingFromCart(true);

    try {
      // Optimistic remove
      if (useOptimistic) {
        const cartStore = useCartStore.getState();
        cartStore.removeItem(productId);
      }

      await api.delete(`/api/cart/${userId}/${productId}`);

      // Sync desde backend
      const res = await api.get(`/api/cart/${userId}`);
      syncCartFromBackend(res.data.data.products || []);

      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error };
    } finally {
      setIsRemovingFromCart(false);
    }
  }, [userId, requireAuth, syncCartFromBackend, useOptimistic, isRemovingFromCart]);

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

      await api.post('/api/favorites', {
        userId,
        productId,
      });

      // Sync desde backend
      const res = await api.get(`/api/favorites/${userId}`);
      const backendItems = res.data.data.products || [];
      syncFavoritesFromBackend(backendItems);

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
  }, [userId, requireAuth, favoriteItems, syncFavoritesFromBackend, useOptimistic, isTogglingFavorite]);

  // Actualizar cantidad en carrito
  const updateCartQuantity = useCallback(async (productId, quantity) => {
    if (!requireAuth()) return { success: false, needsAuth: true };

    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    const cartStore = useCartStore.getState();
    const existingItem = cartStore.items.find(i => (i._id || i.id) === productId);
    
    if (!existingItem) return { success: false, notFound: true };

    try {
      // Optimistic update
      if (useOptimistic) {
        cartStore.updateQuantity(productId, quantity);
      }

      await api.post('/api/cart', {
        userId,
        productId,
        quantity,
      });

      // Sync
      const res = await api.get(`/api/cart/${userId}`);
      syncCartFromBackend(res.data.data.products || []);

      return { success: true };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false, error };
    }
  }, [userId, requireAuth, removeFromCart, syncCartFromBackend, useOptimistic]);

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
    isRemovingFromCart,
    isLoading: isAddingToCart || isTogglingFavorite || isRemovingFromCart,
    
    // Acciones
    addToCart,
    removeFromCart,
    toggleFavorite,
    updateCartQuantity,
    
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