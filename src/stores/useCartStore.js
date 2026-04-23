import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * CartStore - Store de Zustand para el carrito de compras
 * Maneja items, cantidades, cálculos de precios y persistencia
 */
const useCartStore = create(
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
            stock: item.product.stock,
            image: item.product.image,
            brand: item.product.brand,
            category: item.product.category,
            capacity: item.product.capacity,
            quantity: item.quantity,
          })),
        });
      },

      // Agregar item al carrito
      addItem: (product) => {
        const items = get().items;
        const productId = product._id || product.id;
        const existingItem = items.find(item => (item._id || item.id) === productId);

        if (existingItem) {
          // Si ya existe, incrementar cantidad
          set({
            items: items.map(item =>
              (item._id || item.id) === productId
                ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                : item
            ),
          });
        } else {
          // Si no existe, agregar nuevo
          set({
            items: [...items, { ...product, quantity: product.quantity || 1 }],
          });
        }
      },

      // Remover item del carrito
      removeItem: (productId) => {
        set({
          items: get().items.filter(item => (item._id || item.id) !== productId),
        });
      },

      // Actualizar cantidad de un item
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map(item =>
            (item._id || item.id) === productId ? { ...item, quantity } : item
          ),
        });
      },

      // Vaciar carrito
      clearCart: () => {
        set({ items: [] });
      },

      // Obtener precio total
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + ((item.price || item.precio) * item.quantity),
          0
        );
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore;