import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * AuthStore - Store de Zustand para autenticación
 * Maneja token, usuario, login y logout con persistencia en localStorage
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      role: "minorista", // minorista, mayorista, admin
      isAdmin: false,
      isLoading: false,

      login: (token, userId, role) => {
        const isAdmin = role === "admin";
        set({ token, userId, role, isAdmin, isLoading: false });
      },

      logout: () => {
        set({ token: null, userId: null, role: "minorista", isAdmin: false });
      },

      setRole: (role) => {
        set({ role, isAdmin: role === "admin" });
      },

      setLoading: (isLoading) => set({ isLoading }),

      // Verifica si hay sesión activa
      isAuthenticated: () => {
        return !!get().token;
      },

      // Verifica si el usuario es mayorista
      isMayorista: () => {
        return get().role === "mayorista";
      },

      // Verifica si el usuario tiene el rol especificado
      checkRole: (requiredRole) => {
        const currentRole = get().role;
        if (Array.isArray(requiredRole)) {
          return requiredRole.includes(currentRole);
        }
        return currentRole === requiredRole;
      },
    }),
    {
      name: "auth-storage", // nombre en localStorage
      partialize: (state) => ({
        token: state.token,
        userId: state.userId,
        role: state.role,
        isAdmin: state.isAdmin,
      }),
    },
  ),
);

export default useAuthStore;
