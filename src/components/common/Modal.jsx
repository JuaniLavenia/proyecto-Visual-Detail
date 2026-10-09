import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Close } from "./Icons";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusable(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => el.getClientRects().length > 0,
  );
}

/**
 * Accessible modal dialog rendered in a portal on document.body.
 * Mounting it opens it: focus moves to the close button, Tab is trapped,
 * Esc and backdrop clicks call `onClose`, body scroll is locked, and focus
 * returns to the previously focused element on unmount.
 * Full-screen sheet below `sm`, centered card with internal scroll above.
 */
function Modal({ onClose, labelledBy, children }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const pressStartedOnBackdrop = useRef(false);

  // Move focus in on open, restore it on close
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeButtonRef.current?.focus();

    return () => {
      if (
        previouslyFocused instanceof HTMLElement &&
        previouslyFocused !== document.body &&
        document.contains(previouslyFocused)
      ) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, []);

  // Lock body scroll; pad for the hidden scrollbar so the page does not shift
  useLayoutEffect(() => {
    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      const currentPadding = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== "Tab") return;

    const dialog = dialogRef.current;
    const focusable = getFocusable(dialog);
    if (focusable.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === dialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || active === dialog)) {
      event.preventDefault();
      first.focus();
    }
  };

  // Only a press that both starts and ends on the backdrop closes the modal,
  // so selecting text inside and releasing outside does not close it.
  const handleBackdropMouseDown = (event) => {
    pressStartedOnBackdrop.current = event.target === event.currentTarget;
  };

  const handleBackdropClick = (event) => {
    if (pressStartedOnBackdrop.current && event.target === event.currentTarget) {
      onClose();
    }
    pressStartedOnBackdrop.current = false;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-stretch justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={handleBackdropMouseDown}
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="relative flex h-full w-full flex-col overflow-hidden bg-gray-900 shadow-2xl outline-none sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-2xl sm:border sm:border-white/10"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 rounded-full bg-gray-950/80 p-2 text-white/80 backdrop-blur transition-colors hover:bg-gray-950 hover:text-yellow-400 focus-visible:outline-2 focus-visible:outline-yellow-400"
        >
          <Close className="h-5 w-5" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
