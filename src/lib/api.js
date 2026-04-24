import axios from 'axios';

/**
 * API Configuration
 * Punto centralizado para todas las configuraciones de API
 */

// URL base del backend - un solo lugar para cambiar
export const API_BASE = 'https://visual-detail-backend.onrender.com';
// export const API_BASE = 'http://localhost:5000';

// Tipos de errores para manejo centralizado
export const ErrorTypes = {
  NETWORK_ERROR: 'network_error',
  TIMEOUT: 'timeout',
  AUTH_ERROR: 'auth_error',
  VALIDATION_ERROR: 'validation_error',
  NOT_FOUND: 'not_found',
  SERVER_ERROR: 'server_error',
  UNKNOWN: 'unknown',
};

/**
 * Clasifica errores según su tipo
 */
export function classifyError(error) {
  if (!axios.isAxiosError(error)) {
    return { type: ErrorTypes.UNKNOWN, message: 'Error desconocido' };
  }

  if (!error.response) {
    // Sin respuesta del servidor - sin conexión o timeout
    if (error.code === 'ECONNABORTED') {
      return { type: ErrorTypes.TIMEOUT, message: 'La solicitud tardó demasiado' };
    }
    return { type: ErrorTypes.NETWORK_ERROR, message: 'Sin conexión al servidor' };
  }

  const status = error.response.status;

  if (status === 401) {
    return { type: ErrorTypes.AUTH_ERROR, message: 'Sesión expirada o no autorizado' };
  }
  if (status === 403) {
    return { type: ErrorTypes.AUTH_ERROR, message: 'No tienes permiso para esta acción' };
  }
  if (status === 404) {
    return { type: ErrorTypes.NOT_FOUND, message: 'Recurso no encontrado' };
  }
  if (status === 422) {
    return { 
      type: ErrorTypes.VALIDATION_ERROR, 
      message: error.response.data?.message || 'Datos inválidos' 
    };
  }
  if (status >= 500) {
    return { type: ErrorTypes.SERVER_ERROR, message: 'Error del servidor' };
  }

  return { 
    type: ErrorTypes.UNKNOWN, 
    message: error.response.data?.message || 'Error desconocido' 
  };
}

/**
 * Manejador de errores centralizado
 * Muestra mensajes apropiados según el tipo de error
 */
export function handleError(error, customMessages = {}) {
  const { type, message } = classifyError(error);
  
  // Mensajes personalizados tienen prioridad
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
 * Crea un componente de error para mostrar al usuario
 */
export function createErrorDisplay(error) {
  const { type, message } = classifyError(error);
  
  const errorConfig = {
    [ErrorTypes.NETWORK_ERROR]: {
      title: 'Sin conexión',
      message: 'Verificá tu conexión a internet e intentá de nuevo.',
      showRetry: true,
    },
    [ErrorTypes.TIMEOUT]: {
      title: 'Tiempo agotado',
      message: 'El servidor tardó en responder. Intentá de nuevo.',
      showRetry: true,
    },
    [ErrorTypes.AUTH_ERROR]: {
      title: 'Sesión requerida',
      message: 'Por favor, iniciá sesión para continuar.',
      showLogin: true,
    },
    [ErrorTypes.NOT_FOUND]: {
      title: 'No encontrado',
      message: 'El recurso que buscas no existe.',
      showRetry: false,
    },
    [ErrorTypes.SERVER_ERROR]: {
      title: 'Error del servidor',
      message: 'Ocurrió un problema. Intentá más tarde.',
      showRetry: true,
    },
  };

  return errorConfig[type] || {
    title: 'Algo salió mal',
    message,
    showRetry: true,
  };
}

// Crear instancia de axios con configuración por defecto
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    // Intentar obtener token desde Zustand store o localStorage
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const authData = JSON.parse(token);
        if (authData.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`;
        }
      } catch (e) {
        // localStorage puede no ser válido JSON
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor para manejo de errorescentralizado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const handled = handleError(error);
    // Aquí podrías dispatchear eventos globales si necesitás
    return Promise.reject(handled);
  }
);

/**
 * Crea un AbortController para cancelar requests
 * @returns {{ controller: AbortController, signal: AbortSignal }}
 * @example
 * const { controller, signal } = createAbortController();
 * await api.get('/endpoint', { signal });
 * // Para cancelar:
 * controller.abort();
 */
export function createAbortController() {
  const controller = new AbortController();
  return {
    controller,
    signal: controller.signal,
  };
}

/**
 * Effect hook para cleanup automático de requests al unmount
 * @returns {((controller: AbortController) => void)}
 */
export function useAbortControllerCleanup() {
  return (controller) => {
    // Auto-abort cuando el componente se unmount
    if (controller && !controller.signal.aborted) {
      controller.abort();
    }
  };
}

// Fetcher para SWR con manejo de errores
export const fetcher = async (url) => {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};

// Getters para endpoints communs
export const endpoints = {
  // Productos
  productos: '/api/productos',
  productosById: (id) => `/api/productos/${id}`,
  productosByCategory: (category) => `/api/productos/category/${category}`,
  productosByBrand: (brand) => `/api/productos/brand/${brand}`,
  productoSearch: (term) => `/api/productos/search/${term}`,

  // Carrito
  cart: (userId) => `/api/cart/${userId}`,
  addToCart: '/api/cart',

  // Favoritos
  favorites: (userId) => `/api/favorites/${userId}`,
  addToFavorites: '/api/favorites',

  // Pedidos
  createOrder: '/api/pedidos',
};

export default api;