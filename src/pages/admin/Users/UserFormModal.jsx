import { useState } from "react";
import { Check, Close, Spinner } from "../../../components/common/Icons";
import { isUserActive } from "../../../lib/users-api";
import { ROLES, SELF_ACTION_HINT } from "./constants";

const MAX_NAME_LENGTH = 80;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INPUT_CLASS =
  "w-full px-4 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500/50 transition-colors disabled:opacity-50";

// Edit mode only sends the fields the admin actually changed.
function getChangedFields(user, values) {
  const changes = {};
  if (values.name !== (user.name || "")) changes.name = values.name;
  if (values.email !== (user.email || "").toLowerCase())
    changes.email = values.email;
  if (values.role !== (user.role || "minorista")) changes.role = values.role;
  if (values.isActive !== isUserActive(user))
    changes.isActive = values.isActive;
  return changes;
}

/**
 * Create/edit form for admin users. There are no password fields: created
 * users receive an invite mail to define their own password.
 * onSubmit receives the full values on create and only the changed fields
 * on edit; an edit without changes just closes the modal.
 */
function UserFormModal({ mode, user, isSelf, saving, onCancel, onSubmit }) {
  const isEdit = mode === "edit";
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.name || "");
  const [role, setRole] = useState(user?.role || "minorista");
  const [isActive, setIsActive] = useState(isEdit ? isUserActive(user) : true);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const values = {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      role,
      isActive,
    };
    if (!EMAIL_PATTERN.test(values.email)) {
      setError("Ingresá un email válido");
      return;
    }
    setError("");

    if (!isEdit) {
      onSubmit({
        email: values.email,
        name: values.name || undefined,
        role: values.role,
      });
      return;
    }

    const changes = getChangedFields(user, values);
    if (Object.keys(changes).length === 0) {
      onCancel();
      return;
    }
    onSubmit(changes);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && !saving) onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onKeyDown={handleKeyDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-title"
        className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 id="user-form-title" className="text-lg font-semibold text-white">
            {isEdit ? "Editar usuario" : "Nuevo usuario"}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            aria-label="Cerrar"
            className="p-1 text-white/50 hover:text-white rounded-lg transition-colors"
          >
            <Close className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="user-form-email"
              className="block text-white/70 text-sm mb-2"
            >
              Email *
            </label>
            <input
              id="user-form-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              autoFocus
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "user-form-email-error" : undefined}
              className={INPUT_CLASS}
            />
            {error && (
              <p
                id="user-form-email-error"
                className="text-red-400 text-xs mt-1"
              >
                {error}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="user-form-name"
              className="block text-white/70 text-sm mb-2"
            >
              Nombre
            </label>
            <input
              id="user-form-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={MAX_NAME_LENGTH}
              autoComplete="off"
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label
              htmlFor="user-form-role"
              className="block text-white/70 text-sm mb-2"
            >
              Rol
            </label>
            <select
              id="user-form-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isSelf}
              title={isSelf ? SELF_ACTION_HINT : undefined}
              className={INPUT_CLASS}
            >
              {ROLES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {isEdit && (
            <label
              className={`flex items-center gap-2 text-white/70 text-sm ${
                isSelf ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              title={isSelf ? SELF_ACTION_HINT : undefined}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={isSelf}
                className="w-4 h-4 accent-yellow-500"
              />
              Activo (puede iniciar sesión)
            </label>
          )}

          <p className="text-white/40 text-xs">
            {isEdit
              ? "Cambiar el rol o desactivar al usuario cierra su sesión."
              : "Se enviará un mail al usuario para que defina su contraseña."}
          </p>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <Spinner className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {isEdit ? "Guardar" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserFormModal;
