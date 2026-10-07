import PropTypes from "prop-types";

/**
 * Contact phone block of the checkout modal.
 * - With a stored phone and not editing: shows it with a "cambiar" link.
 * - Otherwise: a required phone input with helper/error text.
 */
function CheckoutPhoneField({
  storedPhone,
  editing,
  value,
  error,
  disabled,
  checking,
  onChange,
  onEdit,
  onCancelEdit,
  onSubmit,
}) {
  if (checking) {
    return (
      <div className="mb-5 p-3 bg-gray-800/30 rounded-xl">
        <p className="text-white/50 text-sm">Verificando tus datos de contacto...</p>
      </div>
    );
  }

  if (storedPhone && !editing) {
    return (
      <div className="mb-5 p-3 bg-gray-800/30 rounded-xl flex items-center justify-between gap-3">
        <p className="text-white/70 text-sm">
          Te contactamos al{" "}
          <span className="text-white font-medium">{storedPhone}</span>
        </p>
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          className="text-yellow-400 hover:text-yellow-300 text-sm font-medium disabled:opacity-50"
        >
          Cambiar
        </button>
      </div>
    );
  }

  const describedBy = error ? "checkout-phone-error" : "checkout-phone-help";

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="checkout-phone" className="block text-white/70 text-sm">
          Teléfono de contacto *
        </label>
        {storedPhone && (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={disabled}
            className="text-white/50 hover:text-white text-xs disabled:opacity-50"
          >
            Usar {storedPhone}
          </button>
        )}
      </div>
      <input
        id="checkout-phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        disabled={disabled}
        placeholder="+54 9 381 123 4567"
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
        className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-gray-800 transition-colors ${
          error
            ? "border-red-500/60 focus:border-red-500"
            : "border-white/10 focus:border-yellow-500/50"
        }`}
      />
      {error ? (
        <p id="checkout-phone-error" className="text-red-400 text-xs mt-2">
          {error}
        </p>
      ) : (
        <p id="checkout-phone-help" className="text-white/40 text-xs mt-2">
          Lo usamos solo para coordinar tu pedido y queda guardado en tu
          perfil.
        </p>
      )}
    </div>
  );
}

CheckoutPhoneField.propTypes = {
  storedPhone: PropTypes.string,
  editing: PropTypes.bool,
  value: PropTypes.string.isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  checking: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default CheckoutPhoneField;
