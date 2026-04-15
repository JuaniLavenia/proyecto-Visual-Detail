import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import useAuthStore from "../stores/useAuthStore";
import "./Login.css";

const API_BASE = "https://visual-detail-backend.onrender.com/api";
// const API_BASE = "http://localhost:5000/api";

function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({});

  const validateLogin = () => {
    const newErrors = {};
    if (!loginData.email) newErrors.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(loginData.email))
      newErrors.email = "Email inválido";
    if (!loginData.password) newErrors.password = "La contraseña es requerida";
    return newErrors;
  };

  const validateRegister = () => {
    const newErrors = {};
    if (!registerData.email) newErrors.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(registerData.email))
      newErrors.email = "Email inválido";
    if (!registerData.password)
      newErrors.password = "La contraseña es requerida";
    else if (registerData.password.length < 6)
      newErrors.password = "Mínimo 6 caracteres";
    if (!registerData.password_confirmation) {
      newErrors.password_confirmation = "Confirmá tu contraseña";
    } else if (registerData.password !== registerData.password_confirmation) {
      newErrors.password_confirmation = "Las contraseñas no coinciden";
    }
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = validateLogin();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/login`, loginData);
      const { token, userId } = res.data;
      const isAdminUser = userId === "65dbfbfdbbaccc7f307ebc2e";
      login(token, userId, isAdminUser);

      Swal.fire({
        position: "center",
        icon: "success",
        title: "¡Bienvenido! Sesión iniciada",
        showConfirmButton: false,
        timer: 1500,
      });

      setLoginData({ email: "", password: "" });
      navigate("/");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error de autenticación",
        text: "Email o contraseña incorrectos",
        confirmButtonColor: "#eab308",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegister();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/register`, registerData);
      const { token, userId } = res.data;
      login(token, userId, false);

      Swal.fire({
        position: "center",
        icon: "success",
        title: "¡Registro exitoso! Bienvenido",
        showConfirmButton: false,
        timer: 1500,
      });

      setRegisterData({ email: "", password: "", password_confirmation: "" });
      navigate("/");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error en el registro",
        text: "El email ya está registrado o los datos son inválidos",
        confirmButtonColor: "#eab308",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isLoginForm) {
      setLoginData({ ...loginData, [name]: value });
    } else {
      setRegisterData({ ...registerData, [name]: value });
    }
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 pb-12 flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('https://cdn.shopify.com/s/files/1/0272/1346/3623/files/DSC6756-Edit_1024x1024.jpg?v=1634901495')] bg-cover bg-center opacity-10" />
      <div className="fixed inset-0 bg-gradient-to-b from-gray-950/90 via-gray-950/95 to-gray-950/90" />

      {/* Main Card */}
      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            {isLoginForm ? "Bienvenido de nuevo" : "Crear cuenta"}
          </h1>
          <p className="text-white/50 mt-2">
            {isLoginForm
              ? "Iniciá sesión para continuar"
              : "Completá tus datos para registrarte"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Tab Switcher */}
          <div className="flex mb-8 bg-white/5 rounded-xl p-1">
            <button
              type="button"
              onClick={() => {
                setIsLoginForm(true);
                setErrors({});
              }}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isLoginForm
                  ? "bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoginForm(false);
                setErrors({});
              }}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isLoginForm
                  ? "bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Registrarse
            </button>
          </div>

          {isLoginForm ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 focus:bg-gray-800 transition-colors ${
                      errors.email ? "border-red-500" : "border-white/10"
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 focus:bg-gray-800 transition-colors pr-12 ${
                      errors.password ? "border-red-500" : "border-white/10"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Iniciando...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 focus:bg-gray-800 transition-colors ${
                    errors.email ? "border-red-500" : "border-white/10"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Contraseña
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={registerData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 focus:bg-gray-800 transition-colors ${
                    errors.password ? "border-red-500" : "border-white/10"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Confirmar contraseña
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password_confirmation"
                  value={registerData.password_confirmation}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 focus:bg-gray-800 transition-colors ${
                    errors.password_confirmation
                      ? "border-red-500"
                      : "border-white/10"
                  }`}
                />
                {errors.password_confirmation && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.password_confirmation}
                  </p>
                )}
                <p className="text-white/30 text-xs mt-2">
                  Mínimo 6 caracteres
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Registrando...
                  </>
                ) : (
                  "Crear cuenta"
                )}
              </button>
            </form>
          )}

          {/* Toggle Form Link */}
          <div className="mt-6 text-center">
            <p className="text-white/50 text-sm">
              {isLoginForm ? (
                <>
                  ¿No tenés cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginForm(false);
                      setErrors({});
                    }}
                    className="text-yellow-400 hover:text-yellow-300 font-medium"
                  >
                    Registrate
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tenés cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginForm(true);
                      setErrors({});
                    }}
                    className="text-yellow-400 hover:text-yellow-300 font-medium"
                  >
                    Iniciá sesión
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-white/40 hover:text-white/60 text-sm transition-colors inline-flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
