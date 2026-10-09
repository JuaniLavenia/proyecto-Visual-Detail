import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Eye, EyeOff, Spinner, ArrowLeft } from "../../components/common/Icons";
import {
  resetPassword,
  isRateLimitError,
  isInvalidResetLinkError,
  RATE_LIMIT_MESSAGE,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from "../../lib/auth-api";
import "./index.css";

const INVALID_LINK_MESSAGES = {
  RESET_TOKEN_EXPIRED:
    "El link para restablecer tu contraseña venció. Pedí uno nuevo.",
  INVALID_RESET_TOKEN:
    "El link para restablecer tu contraseña no es válido o ya fue usado. Pedí uno nuevo.",
};

const inputClass = (hasError) =>
  `w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 focus:bg-gray-800 transition-colors pr-12 ${
    hasError ? "border-red-500" : "border-white/10"
  }`;

function ResetPassword() {
  const { id } = useParams();
  // The token comes as a query param: JWTs contain dots, which breaks the
  // SPA fallback when used as the last path segment.
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", password_confirmation: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [invalidLinkMessage, setInvalidLinkMessage] = useState(
    token ? null : INVALID_LINK_MESSAGES.INVALID_RESET_TOKEN
  );

  const validate = () => {
    const newErrors = {};
    const { password, password_confirmation } = form;
    if (!password) newErrors.password = "La contraseña es requerida";
    else if (
      password.length < PASSWORD_MIN_LENGTH ||
      password.length > PASSWORD_MAX_LENGTH
    )
      newErrors.password = `La contraseña debe tener entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres`;
    if (!password_confirmation)
      newErrors.password_confirmation = "Confirmá tu contraseña";
    else if (password !== password_confirmation)
      newErrors.password_confirmation = "Las contraseñas no coinciden";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const data = await resetPassword(id, token, form.password);
      await Swal.fire({
        icon: "success",
        title: "¡Listo!",
        text: data?.message || "Contraseña restablecida. Ya podés iniciar sesión.",
        confirmButtonColor: "#eab308",
      });
      navigate("/login", { replace: true });
    } catch (err) {
      const passwordError = err?.details?.find((d) => d.field === "password");
      if (isInvalidResetLinkError(err)) {
        setInvalidLinkMessage(INVALID_LINK_MESSAGES[err.code]);
      } else if (passwordError) {
        // The backend rejected the password itself: show it under the field.
        setErrors({ password: passwordError.message });
      } else if (err?.status === 400) {
        // Password is validated client-side, so a bare 400 means a malformed link.
        setInvalidLinkMessage(INVALID_LINK_MESSAGES.INVALID_RESET_TOKEN);
      } else {
        Swal.fire({
          icon: "error",
          title: "No se pudo restablecer la contraseña",
          text: isRateLimitError(err)
            ? RATE_LIMIT_MESSAGE
            : err?.code === "USER_INACTIVE"
              ? "Tu cuenta está desactivada. Contactá a un administrador."
              : "Intentá de nuevo más tarde.",
          confirmButtonColor: "#eab308",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleButton = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 transition-colors"
    >
      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-36 pb-12 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-gradient-to-b from-gray-950/90 via-gray-950/95 to-gray-950/90" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Nueva contraseña</h1>
          <p className="text-white/50 mt-2">
            Elegí una contraseña nueva para tu cuenta
          </p>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {invalidLinkMessage ? (
            <div className="space-y-6 text-center">
              <p className="text-white/80" role="alert">
                {invalidLinkMessage}
              </p>
              <Link
                to="/recuperar"
                className="block w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-xl transition-all duration-200"
              >
                Pedir un link nuevo
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="reset-password"
                  className="block text-white/70 text-sm mb-2"
                >
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    id="reset-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    maxLength={PASSWORD_MAX_LENGTH}
                    className={inputClass(errors.password)}
                  />
                  {toggleButton}
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="reset-password-confirmation"
                  className="block text-white/70 text-sm mb-2"
                >
                  Confirmar contraseña
                </label>
                <input
                  id="reset-password-confirmation"
                  type={showPassword ? "text" : "password"}
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  maxLength={PASSWORD_MAX_LENGTH}
                  className={inputClass(errors.password_confirmation)}
                />
                {errors.password_confirmation && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.password_confirmation}
                  </p>
                )}
                <p className="text-white/30 text-xs mt-2">
                  Entre {PASSWORD_MIN_LENGTH} y {PASSWORD_MAX_LENGTH} caracteres
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-5 h-5" />
                    Guardando...
                  </>
                ) : (
                  "Restablecer contraseña"
                )}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-white/40 hover:text-white/60 text-sm transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
