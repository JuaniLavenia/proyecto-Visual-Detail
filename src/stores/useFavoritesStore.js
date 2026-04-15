import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * FavoritesStore - Store de Zustand para favoritos
 * Maneja lista de productos favoritos con persistencia
 */
const useFavoritesStore = create(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      // Agregar a favoritos
      addFavorite: (product) => {
        const items = get().items;
        const exists = items.find(item => item.id === product.id);
        
        if (!exists) {
          set({ items: [...items, product] });
        }
      },

      // Remover de favoritos
      removeFavorite: (productId) => {
        set({
          items: get().items.filter(item => item.id !== productId),
        });
      },

      // Toggle favorito
      toggleFavorite: (product) => {
        const items = get().items;
        const exists = items.find(item => item.id === product.id);

        if (exists) {
          get().removeFavorite(product.id);
        } else {
          get().addFavorite(product);
        }
      },

      // Verificar si un producto está en favoritos
      isFavorite: (productId) => {
        return get().items.some(item => item.id === productId);
      },

      // Vaciar favoritos
      clearFavorites: () => {
        set({ items: [] });
      },

      // Obtener cantidad de favoritos
      getCount: () => {
        return get().items.length;
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'favorites-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useFavoritesStore;