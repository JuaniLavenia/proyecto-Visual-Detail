import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Export, Import, Plus, Users } from "./Icons";

const defaultActions = [
  {
    key: "export",
    label: "Exportar",
    icon: Export,
    color: "bg-blue-600 hover:bg-blue-500",
  },
  {
    key: "import",
    label: "Importar",
    icon: Import,
    color: "bg-green-600 hover:bg-green-500",
  },
  {
    key: "new",
    label: "Nuevo",
    icon: Plus,
    color: "bg-yellow-500 hover:bg-yellow-400",
    href: "/adm/productos/create",
  },
  {
    key: "users",
    label: "Usuarios",
    icon: Users,
    color: "bg-purple-600 hover:bg-purple-500",
    href: "/adm/usuarios",
  },
];

function AdminActionsMenu({ actions = defaultActions, onExport, onImport }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action) => {
    if (action.onClick) {
      action.onClick();
    }
    setIsOpen(false);
  };

  // Build action handlers
  const getActionHandler = (key) => {
    switch (key) {
      case "export":
        return onExport;
      case "import":
        return onImport;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-end gap-3" ref={dropdownRef}>
      {/* Desktop: ≥1024px - all buttons expanded */}
      <div className="hidden lg:flex items-center gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const handler = getActionHandler(action.key);
          if (action.href) {
            return (
              <Link
                key={action.key}
                to={action.href}
                className={`px-4 py-2.5 ${action.color} text-white font-medium rounded-xl transition-colors flex items-center gap-2`}
              >
                <Icon className="w-5 h-5" />
                {action.label}
              </Link>
            );
          }
          return (
            <button
              key={action.key}
              onClick={() => handler && handler()}
              className={`px-4 py-2.5 ${action.color} text-white font-medium rounded-xl transition-colors flex items-center gap-2`}
            >
              <Icon className="w-5 h-5" />
              {action.label}
            </button>
          );
        })}
      </div>

      {/* Tablet: 768px-1023px - 2 visible + "Más" dropdown */}
      <div className="hidden md:flex lg:hidden items-center gap-3">
        {actions.slice(0, 2).map((action) => {
          const Icon = action.icon;
          const handler = getActionHandler(action.key);
          if (action.href) {
            return (
              <Link
                key={action.key}
                to={action.href}
                className={`px-4 py-2.5 ${action.color} text-white font-medium rounded-xl transition-colors flex items-center gap-2`}
              >
                <Icon className="w-5 h-5" />
                {action.label}
              </Link>
            );
          }
          return (
            <button
              key={action.key}
              onClick={() => handler && handler()}
              className={`px-4 py-2.5 ${action.color} text-white font-medium rounded-xl transition-colors flex items-center gap-2`}
            >
              <Icon className="w-5 h-5" />
              {action.label}
            </button>
          );
        })}
        {/* More dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2.5 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            <span>Más</span>
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-xl shadow-lg z-50 overflow-hidden">
              {actions.slice(2).map((action) => {
                const Icon = action.icon;
                const handler = getActionHandler(action.key);
                if (action.href) {
                  return (
                    <Link
                      key={action.key}
                      to={action.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {action.label}
                    </Link>
                  );
                }
                return (
                  <button
                    key={action.key}
                    onClick={() => handler && handler()}
                    className="flex items-center gap-2 px-4 py-2.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors w-full"
                  >
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: <768px - only "Más" button */}
      <div className="md:hidden relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2.5 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          <span>Más</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-xl shadow-lg z-50 overflow-hidden">
            {actions.map((action) => {
              const Icon = action.icon;
              const handler = getActionHandler(action.key);
              if (action.href) {
                return (
                  <Link
                    key={action.key}
                    to={action.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </Link>
                );
              }
              return (
                <button
                  key={action.key}
                  onClick={() => handler && handler()}
                  className="flex items-center gap-2 px-4 py-2.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors w-full"
                >
                  <Icon className="w-4 h-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

AdminActionsMenu.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
      color: PropTypes.string,
      href: PropTypes.string,
    }),
  ),
  onExport: PropTypes.func,
  onImport: PropTypes.func,
};

export default AdminActionsMenu;
