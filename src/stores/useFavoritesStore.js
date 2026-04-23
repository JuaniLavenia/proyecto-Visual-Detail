import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * FavoritesStore - Store de Zustand para favoritos
 * Maneja lista de productos favoritos con persistencia y sync con backend
 */
const useFavoritesStore = create(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      // Sincronizar con datos del backend
      syncFromBackend: (backendItems) => {
        set({
          items: backendItems.map(item => ({
            _id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            precioMayorista: item.product.precioMayorista,
            image: item.product.image,
            brand: item.product.brand,
            category: item.product.category,
            capacity: item.product.capacity,
            stock: item.product.stock,
          })),
        });
      },

      // Agregar a favoritos
      addFavorite: (product) => {
        const items = get().items;
        const productId = product._id || product.id;
        const exists = items.find(item => (item._id || item.id) === productId);

        if (!exists) {
          set({ items: [...items, product] });
        }
      },

      // Remover de favoritos
      removeFavorite: (productId) => {
        set({
          items: get().items.filter(item => (item._id || item.id) !== productId),
        });
      },

      // Toggle favorito
      toggleFavorite: (product) => {
        const items = get().items;
        const productId = product._id || product.id;
        const exists = items.find(item => (item._id || item.id) === productId);

        if (exists) {
          get().removeFavorite(productId);
        } else {
          get().addFavorite(product);
        }
      },

      // Verificar si un producto está en favoritos
      isFavorite: (productId) => {
        return get().items.some(item => (item._id || item.id) === productId);
      },

      // Vaciar favoritos
      clearFavorites: () => {
        set({ items: [] });
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