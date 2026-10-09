import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API_BASE, AUTH_STORAGE_KEY } from "../lib/api";

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
      // Contact phone from the profile (null when unknown or not set yet)
      phone: null,

      login: (token, refreshToken, userId, role, phone = null) => {
        const isAdmin = role === "admin";
        set({
          token,
          refreshToken,
          userId,
          role,
          isAdmin,
          phone: phone || null,
        });
      },

      logout: () => {
        set({
          token: null,
          refreshToken: null,
          userId: null,
          role: "minorista",
          isAdmin: false,
          phone: null,
        });
      },

      // Keeps the profile phone in sync (e.g. after checkout saved a new one)
      setUserPhone: (phone) => set({ phone: phone || null }),

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
          phone: null,
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
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        userId: state.userId,
        role: state.role,
        isAdmin: state.isAdmin,
        phone: state.phone,
      }),
    },
  ),
);

/**
 * Keeps this tab's auth state in sync with other tabs. The `storage` event
 * only fires in the tabs that did NOT write, so a token rotated, a login or a
 * logout in one tab is re-read here from the shared persisted copy.
 * @returns {Function} cleanup that removes the listener
 */
export function syncAuthAcrossTabs() {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event) => {
    // key === null means localStorage.clear() in another tab
    if (event.key !== AUTH_STORAGE_KEY && event.key !== null) return;
    if (event.storageArea && event.storageArea !== window.localStorage) return;

    if (event.key === null || event.newValue === null) {
      // The persisted session is gone: rehydrate() would keep the in-memory
      // state, so end it explicitly.
      useAuthStore.getState().logout();
      return;
    }
    useAuthStore.persist.rehydrate();
  };

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

export default useAuthStore;
