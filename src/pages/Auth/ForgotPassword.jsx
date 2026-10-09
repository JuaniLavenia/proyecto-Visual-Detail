import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Spinner, ArrowLeft } from "../../components/common/Icons";
import {
  requestPasswordReset,
  isRateLimitError,
  RATE_LIMIT_MESSAGE,
} from "../../lib/auth-api";
import "./index.css";

const GENERIC_SUCCESS_MESSAGE =
  "Si el email está registrado, te enviamos un link para restablecer tu contraseña.";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("El email es requerido");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email inválido");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const data = await requestPasswordReset(email.trim());
      setSuccessMessage(data?.message || GENERIC_SUCCESS_MESSAGE);
    } catch (err) {
      if (isRateLimitError(err)) {
        setError(RATE_LIMIT_MESSAGE);
      } else if (err?.status === 400) {
        setError("Email inválido");
      } else {
        setError(
          "No pudimos procesar tu solicitud. Intentá de nuevo más tarde.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-36 pb-12 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-gradient-to-b from-gray-950/90 via-gray-950/95 to-gray-950/90" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Recuperar contraseña
          </h1>
          <p className="text-white/50 mt-2">
            Ingresá tu email y te enviamos un link para restablecerla
          </p>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {successMessage ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                <Mail className="w-7 h-7" />
              </div>
              <p className="text-white/80" role="status">
                {successMessage}
              </p>
              <p className="text-white/40 text-sm">
                Revisá también la carpeta de spam. El link vence en 15 minutos.
              </p>
              <Link
                to="/login"
                className="block w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-xl transition-all duration-200"
              >
                Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-white/70 text-sm mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    id="forgot-email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 focus:bg-gray-800 transition-colors ${
                      error ? "border-red-500" : "border-white/10"
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                    <Mail className="w-5 h-5" />
                  </div>
                </div>
                {error && (
                  <p className="text-red-400 text-xs mt-1" role="alert">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-5 h-5" />
                    Enviando...
                  </>
                ) : (
                  "Enviar link"
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

export default ForgotPassword;
