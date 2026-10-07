export const PAGE_SIZE = 20;
export const SEARCH_DEBOUNCE_MS = 400;
// Same cap as the backend `search` validator.
export const SEARCH_MAX_LENGTH = 100;

export const ACCENT_COLOR = "#eab308";
export const DANGER_COLOR = "#ef4444";

export const STATUS_FILTERS = [
  { value: "todos", label: "Todos" },
  { value: "Pendiente", label: "Pendiente" },
  { value: "Completado", label: "Completado" },
  { value: "Cancelado", label: "Cancelado" },
];

// Status changes that close an order ask for confirmation first.
export const STATUS_CONFIRMATIONS = {
  Completado: {
    icon: "question",
    title: "¿Marcar como completado?",
    confirmButtonText: "Completar",
    confirmButtonColor: ACCENT_COLOR,
  },
  Cancelado: {
    icon: "warning",
    title: "¿Cancelar pedido?",
    confirmButtonText: "Cancelar pedido",
    confirmButtonColor: DANGER_COLOR,
  },
};
