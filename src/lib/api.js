import axios from "axios";

/**
 * API Configuration
 * Punto centralizado para todas las configuraciones de API
 */

// Callbacks para sincronizar el token con el store de zustand
// Se registran desde el componente raíz (App) para evitar importación circular
let onTokenRefreshCallbacks = [];

/**
 * Registra un callback que se ejecutará cuando el token se renueve
 * @param {Function} callback - (newToken, newRefreshToken) => void
 */
export function onAuthTokenRefreshed(callback) {
  onTokenRefreshCallbacks.push(callback);
}

/**
 * Remueve un callback registrado
 * @param {Function} callback - El callback a remover
 */
export function offAuthTokenRefreshed(callback) {
  onTokenRefreshCallbacks = onTokenRefreshCallbacks.filter(
    (cb) => cb !== callback,
  );
}

/**
 * Notifica a todos los callbacks registrados
 */
function notifyTokenRefreshed(token, refreshToken) {
  onTokenRefreshCallbacks.forEach((cb) => cb(token, refreshToken));
}

// URL base del backend - un solo lugar para cambiar
export const API_BASE = "https://visual-detail-backend.onrender.com";
// export const API_BASE = "http://localhost:5000";

// Tipos de errores para manejo centralizado
export const ErrorTypes = {
  NETWORK_ERROR: "network_error",
  TIMEOUT: "timeout",
  AUTH_ERROR: "auth_error",
  VALIDATION_ERROR: "validation_error",
  NOT_FOUND: "not_found",
  SERVER_ERROR: "server_error",
  UNKNOWN: "unknown",
};

/**
 * Clasifica errores según su tipo
 */
export function classifyError(error) {
  if (!axios.isAxiosError(error)) {
    return { type: ErrorTypes.UNKNOWN, message: "Error desconocido" };
  }

  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return {
        type: ErrorTypes.TIMEOUT,
        message: "La solicitud tardó demasiado",
      };
    }
    return {
      type: ErrorTypes.NETWORK_ERROR,
      message: "Sin conexión al servidor",
    };
  }

  const status = error.response.status;

  if (status === 401) {
    return {
      type: ErrorTypes.AUTH_ERROR,
      message: "Sesión expirada o no autorizado",
    };
  }
  if (status === 403) {
    return {
      type: ErrorTypes.AUTH_ERROR,
      message: "No tienes permiso para esta acción",
    };
  }
  if (status === 404) {
    return { type: ErrorTypes.NOT_FOUND, message: "Recurso no encontrado" };
  }
  if (status === 422) {
    return {
      type: ErrorTypes.VALIDATION_ERROR,
      message: error.response.data?.message || "Datos inválidos",
    };
  }
  if (status >= 500) {
    return { type: ErrorTypes.SERVER_ERROR, message: "Error del servidor" };
  }

  return {
    type: ErrorTypes.UNKNOWN,
    message: error.response.data?.message || "Error desconocido",
  };
}

/**
 * Manejador de errores centralizado
 */
export function handleError(error, customMessages = {}) {
  const { type, message } = classifyError(error);
  const displayMessage = customMessages[type] || message;
  console.error(`[API Error] ${type}:`, error);
  return {
    type,
    message: displayMessage,
    isNetworkError: type === ErrorTypes.NETWORK_ERROR,
    isAuthError: type === ErrorTypes.AUTH_ERROR,
    isTimeout: type === ErrorTypes.TIMEOUT,
    isServerError: type === ErrorTypes.SERVER_ERROR,
  };
}

/**
 * Obtiene los datos de auth desde localStorage (evita imports circulares)
 */
function getAuthFromStorage() {
  try {
    const stored = localStorage.getItem("auth-storage");
    if (!stored) return { token: null, refreshToken: null };
    const data = JSON.parse(stored);
    return {
      token: data.state?.token || null,
      refreshToken: data.state?.refreshToken || null,
    };
  } catch {
    return { token: null, refreshToken: null };
  }
}

/**
 * Actualiza los tokens en localStorage (persistido por zustand)
 */
function updateTokensInStorage(newToken, newRefreshToken) {
  try {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      const data = JSON.parse(stored);
      data.state.token = newToken;
      data.state.refreshToken = newRefreshToken;
      localStorage.setItem("auth-storage", JSON.stringify(data));
    }
  } catch {
    // Si falla, no hacemos nada — el store se encargará
  }
}

/**
 * Limpia los tokens de auth en localStorage (logout)
 */
function clearAuthInStorage() {
  try {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      const data = JSON.parse(stored);
      data.state.token = null;
      data.state.refreshToken = null;
      data.state.userId = null;
      data.state.role = "minorista";
      data.state.isAdmin = false;
      localStorage.setItem("auth-storage", JSON.stringify(data));
    }
  } catch {
    localStorage.removeItem("auth-storage");
  }
}

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag para evitar loops de refresh
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * Suscribe una promesa al proceso de refresh
 * Cuando el token se refresca, se resuelve con el nuevo token
 */
function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

/**
 * Notifica a todos los suscriptores con el nuevo token
 */
function onTokenRefreshed(newToken, newRefreshToken) {
  refreshSubscribers.forEach((callback) => callback(newToken, newRefreshToken));
  refreshSubscribers = [];
}

/**
 * Intenta refrescar el access token usando el refresh token
 */
async function refreshAccessToken() {
  const { refreshToken } = getAuthFromStorage();

  if (!refreshToken) {
    return null;
  }

  try {
    // Llamar al endpoint de refresh sin interceptor de 401 (evita loop)
    const response = await axios.post(
      `${API_BASE}/api/refresh`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    // Refresh falló — limpiar y notificar logout
    clearAuthInStorage();
    onTokenRefreshed(null, null);
    return null;
  }
}

// Request interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const { token } = getAuthFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor con manejo de 401 y refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Si es 401 Y no es una request de auth Y no es el endpoint de refresh
    // Y no se intentó refresh aún
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/refresh") &&
      !originalRequest.url?.includes("/api/login") &&
      !originalRequest.url?.includes("/api/register")
    ) {
      if (isRefreshing) {
        // Ya se está refrescando — suscribirse y esperar
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newTokens = await refreshAccessToken();

        if (newTokens) {
          // Actualizar en storage y notificar suscriptores
          updateTokensInStorage(newTokens.accessToken, newTokens.refreshToken);
          onTokenRefreshed(newTokens.accessToken, newTokens.refreshToken);
          // Notificar a los callbacks registrados (el store de zustand se subscribe desde App.jsx)
          notifyTokenRefreshed(newTokens.accessToken, newTokens.refreshToken);
          isRefreshing = false;

          // Reintentar request original con nuevo token
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return api(originalRequest);
        } else {
          // Refresh falló — notificar y rechazar
          isRefreshing = false;
          onTokenRefreshed(null, null);
          notifyTokenRefreshed(null, null);
          return Promise.reject(handleError(error));
        }
      } catch (refreshError) {
        isRefreshing = false;
        onTokenRefreshed(null, null);
        notifyTokenRefreshed(null, null);
        return Promise.reject(handleError(refreshError));
      }
    }

    // Para errores de auth en login/register, no进行处理
    if (
      originalRequest?.url?.includes("/api/login") ||
      originalRequest?.url?.includes("/api/register")
    ) {
      return Promise.reject(handleError(error));
    }

    return Promise.reject(handleError(error));
  },
);

/**
 * Crea un AbortController para cancelar requests
 */
export function createAbortController() {
  const controller = new AbortController();
  return { controller, signal: controller.signal };
}

/**
 * Fetcher para SWR con manejo de errores
 */
export const fetcher = async (url) => {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};

// Getters para endpoints comunes
export const endpoints = {
  productos: "/api/productos",
  productosById: (id) => `/api/productos/${id}`,
  productosByCategory: (category) => `/api/productos/category/${category}`,
  productosByBrand: (brand) => `/api/productos/brand/${brand}`,
  productoSearch: (term) => `/api/productos/search/${term}`,
  cart: (userId) => `/api/cart/${userId}`,
  addToCart: "/api/cart",
  favorites: (userId) => `/api/favorites/${userId}`,
  addToFavorites: "/api/favorites",
  createOrder: "/api/pedidos",
};

export default api;
