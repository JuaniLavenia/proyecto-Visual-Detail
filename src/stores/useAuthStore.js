import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * AuthStore - Store de Zustand para autenticación
 * Maneja token, usuario, login y logout con persistencia en localStorage
 */
const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      userId: null,
      isAdmin: false,
      isLoading: false,

      login: (token, userId, isAdmin = false) => {
        set({ token, userId, isAdmin, isLoading: false });
      },

      logout: () => {
        set({ token: null, userId: null, isAdmin: false });
      },

      setLoading: (isLoading) => set({ isLoading }),
      
      // Verifica si hay sesión activa
      isAuthenticated: () => {
        return !!useAuthStore.getState().token;
      },
    }),
    {
      name: 'auth-storage', // nombre en localStorage
      partialize: (state) => ({ 
        token: state.token, 
        userId: state.userId, 
        isAdmin: state.isAdmin 
      }),
    }
  )
);

export default useAuthStore;