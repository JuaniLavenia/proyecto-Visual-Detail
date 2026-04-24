import { useState, useEffect, useCallback } from 'react';

/**
 * Componente SimpleDialog - Reemplazo nativo de SweetAlert2
 * Usa el elemento HTML <dialog> del navegador
 * 
 * @usage
 * <SimpleDialog
 *   isOpen={showDialog}
 *   onClose={() => setShowDialog(false)}
 *   title="Título"
 *   message="Descripción"
 *   type="info|success|warning|danger"
 *   confirmText="Aceptar"
 *   cancelText="Cancelar"
 *   onConfirm={handleConfirm}
 * />
 */

export function SimpleDialog({
  isOpen = false,
  onClose,
  title = '',
  message = '',
  type = 'info', // info, success, warning, danger
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  showCancel = false,
  isLoading = false,
}) {
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    setShow(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const dialog = document.getElementById('simple-dialog');
    if (!dialog) return;

    if (show) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [show]);

  const handleClose = useCallback(() => {
    setShow(false);
    onClose?.();
  }, [onClose]);

  const handleConfirm = useCallback(async () => {
    if (onConfirm) {
      await onConfirm();
    }
    handleClose();
  }, [onConfirm, handleClose]);

  const typeStyles = {
    info: 'border-blue-500 bg-blue-500/10',
    success: 'border-green-500 bg-green-500/10',
    warning: 'border-yellow-500 bg-yellow-500/10',
    danger: 'border-red-500 bg-red-500/10',
  };

  const typeIcons = {
    info: 'ℹ️',
    success: '✓',
    warning: '⚠',
    danger: '✕',
  };

  return (
    <dialog
      id="simple-dialog"
      className={`
        m-auto p-0 rounded-2xl border-2 backdrop:bg-black/70
        bg-gray-900 border-white/10 text-white
        max-w-md w-full shadow-2xl
        ${typeStyles[type]}
      `}
      onCancel={(e) => {
        e.preventDefault();
        handleClose();
      }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center text-xl
            ${type === 'info' ? 'bg-blue-500/20 text-blue-400' : ''}
            ${type === 'success' ? 'bg-green-500/20 text-green-400' : ''}
            ${type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : ''}
            ${type === 'danger' ? 'bg-red-500/20 text-red-400' : ''}
          `}>
            {typeIcons[type]}
          </div>
          {title && <h2 className="text-xl font-bold">{title}</h2>}
        </div>

        {/* Message */}
        {message && (
          <p className="text-white/70 mb-6">{message}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {showCancel && (
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`
              flex-1 px-4 py-3 font-semibold rounded-xl transition-colors disabled:opacity-50
              ${type === 'info' ? 'bg-blue-500 hover:bg-blue-400 text-white' : ''}
              ${type === 'success' ? 'bg-green-500 hover:bg-green-400 text-white' : ''}
              ${type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-400 text-white' : ''}
              ${type === 'danger' ? 'bg-red-500 hover:bg-red-400 text-white' : ''}
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Cargando...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}

/**
 * Hook para usar dialogs de forma simple
 * @returns {object} Metodos para mostrar diferentes tipos de dialogs
 */
export function useDialog() {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    showCancel: false,
    onConfirm: null,
    isLoading: false,
  });

  const show = useCallback((options) => {
    setDialogState({
      isOpen: true,
      type: 'info',
      title: '',
      message: '',
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
      showCancel: false,
      onConfirm: null,
      isLoading: false,
      ...options,
    });
  }, []);

  const close = useCallback(() => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Métodos convenientes
  const info = useCallback((title, message, options = {}) => {
    show({ type: 'info', title, message, ...options });
  }, [show]);

  const success = useCallback((title, message, options = {}) => {
    show({ type: 'success', title, message, ...options });
  }, [show]);

  const warning = useCallback((title, message, options = {}) => {
    show({ type: 'warning', title, message, ...options });
  }, [show]);

  const danger = useCallback((title, message, options = {}) => {
    show({ type: 'danger', title, message, ...options });
  }, [show]);

  const confirm = useCallback((title, message, onConfirm, options = {}) => {
    show({ type: 'warning', title, message, onConfirm, showCancel: true });
  }, [show]);

  return {
    dialogState,
    show,
    close,
    info,
    success,
    warning,
    danger,
    confirm,
  };
}

/**
 * Componente Toast - Notificaciones pequeñas temporales
 */
export function Toast({ message, type = 'info', isVisible, onClose }) {
  useEffect(() => {
    if (isVisible && onClose) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  return (
    <div className={`fixed bottom-4 right-4 ${typeStyles[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in`}>
      {message}
    </div>
  );
}

/**
 * Toast manager global
 */
let toastTimeout = null;

export function toast(message, type = 'info') {
  // Remove existing toast
  const existing = document.getElementById('global-toast');
  if (existing) existing.remove();

  const toastEl = document.createElement('div');
  toastEl.id = 'global-toast';
  
  const typeStyles = {
    info: 'bg-blue-500',
    success: 'bg-green-500', 
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };
  
  toastEl.className = `${typeStyles[type]} fixed bottom-4 right-4 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300`;
  toastEl.textContent = message;

  document.body.appendChild(toastEl);

  // Clear previous timeout
  if (toastTimeout) clearTimeout(toastTimeout);

  // Auto remove after 2 seconds
  toastTimeout = setTimeout(() => {
    toastEl.style.opacity = '0';
    setTimeout(() => toastEl.remove(), 300);
  }, 2000);
}

export default SimpleDialog;