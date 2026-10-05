import {
  Edit,
  Trash,
  EyeOff,
  UserCheck,
  Mail,
  Spinner,
} from "../../../components/common/Icons";
import { isUserActive } from "../../../lib/users-api";
import { SELF_ACTION_HINT } from "./constants";

const BASE_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-lg border text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

const TONES = {
  neutral: "border-white/10 text-white/70 hover:bg-white/10 hover:text-white",
  warning: "border-orange-500/30 text-orange-400 hover:bg-orange-500/10",
  success: "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10",
  danger: "border-red-500/30 text-red-400 hover:bg-red-500/10",
  accent: "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10",
};

// compact: icon-only buttons (desktop table); otherwise labelled (mobile cards).
function ActionButton({
  icon: Icon,
  label,
  tone,
  compact,
  disabled,
  title,
  onClick,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={title || label}
      className={`${BASE_BUTTON} ${TONES[tone]} ${
        compact ? "p-2" : "px-3 py-2"
      } ${className}`}
    >
      <Icon className="w-4 h-4" />
      {!compact && label}
    </button>
  );
}

/**
 * Row actions for one user. Self-actions (deactivate, delete) are disabled
 * for the logged-in admin; the backend enforces the same rule.
 */
function UserRowActions({
  user,
  isSelf,
  busy,
  sendingLink,
  compact = false,
  onEdit,
  onToggleActive,
  onDelete,
  onSendResetLink,
}) {
  const active = isUserActive(user);

  return (
    <div
      className={
        compact ? "flex items-center gap-2" : "grid grid-cols-3 gap-2 mt-4"
      }
    >
      <ActionButton
        icon={Edit}
        label="Editar"
        tone="neutral"
        compact={compact}
        disabled={busy}
        onClick={() => onEdit(user)}
      />
      <ActionButton
        icon={active ? EyeOff : UserCheck}
        label={active ? "Desactivar" : "Activar"}
        tone={active ? "warning" : "success"}
        compact={compact}
        disabled={busy || isSelf}
        title={isSelf ? SELF_ACTION_HINT : undefined}
        onClick={() => onToggleActive(user)}
      />
      <ActionButton
        icon={Trash}
        label="Eliminar"
        tone="danger"
        compact={compact}
        disabled={busy || isSelf}
        title={isSelf ? SELF_ACTION_HINT : undefined}
        onClick={() => onDelete(user)}
      />
      <button
        type="button"
        onClick={() => onSendResetLink(user)}
        disabled={sendingLink}
        className={`${BASE_BUTTON} ${TONES.accent} px-3 py-2 whitespace-nowrap ${
          compact ? "" : "col-span-3"
        }`}
      >
        {sendingLink ? (
          <>
            <Spinner className="w-4 h-4" />
            Enviando...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4" />
            Enviar link de recuperación
          </>
        )}
      </button>
    </div>
  );
}

export default UserRowActions;
