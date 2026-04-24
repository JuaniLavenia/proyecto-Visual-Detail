import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API_BASE } from "../lib/api";

/**
 * AuthStore - Store de Zustand para autenticación
 * Maneja token, refresh token, usuario, login y logout con persistencia en localStorage
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      userId: null,
      role: "minorista",
      isAdmin: false,
      isLoading: false,

      login: (token, refreshToken, userId, role) => {
        const isAdmin = role === "admin";
        set({ token, refreshToken, userId, role, isAdmin, isLoading: false });
      },

      logout: () => {
        set({
          token: null,
          refreshToken: null,
          userId: null,
          role: "minorista",
          isAdmin: false,
        });
      },

      setRole: (role) => {
        set({ role, isAdmin: role === "admin" });
      },

      setLoading: (isLoading) => set({ isLoading }),

      // Actualiza solo el access token (después de refresh)
      setToken: (token) => set({ token }),

      // Actualiza solo el refresh token (después de refresh)
      setRefreshToken: (refreshToken) => set({ refreshToken }),

      // Actualiza ambos tokens (para usar desde el api interceptor)
      updateTokens: (token, refreshToken) => set({ token, refreshToken }),

      // Logout que invalida el refresh token en el backend
      // Limpia el store primero (optimistic update) y luego llama al backend
      logoutWithApi: async () => {
        const { refreshToken } = get();
        set({
          token: null,
          refreshToken: null,
          userId: null,
          role: "minorista",
          isAdmin: false,
        });

        if (refreshToken) {
          try {
            await fetch(`${API_BASE}/api/logout`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });
          } catch (error) {
            // Logout del frontend ya se realizó — el error del backend no bloquea al usuario
            console.warn("Logout API call failed:", error);
          }
        }
      },

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
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        userId: state.userId,
        role: state.role,
        isAdmin: state.isAdmin,
      }),
    },
  ),
);

export default useAuthStore;
