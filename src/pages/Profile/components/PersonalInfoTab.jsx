import { useEffect, useState } from "react";
import axios from "axios";
import { useUserContext } from "../../../context/UserContext";
import useAuthStore from "../../../stores/useAuthStore";

const API_BASE = "https://visual-detail-backend.onrender.com/api";
// const API_BASE = "http://localhost:5000/api";

const PersonalInfoTab = () => {
  const { userInfo, updateUser } = useUserContext();
  const { userId, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUserInfo = async () => {
    if (!userId) {
      setError("Debes iniciar sesión nuevamente");
      return;
    }

    if (userInfo) {
      return; // Ya tenemos datos
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/user/${userId}`);
      updateUser(response.data.data.usuario);
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError("No se pudo cargar la información");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-800/50 rounded-xl animate-pulse" />
        <div className="h-12 bg-gray-800/50 rounded-xl animate-pulse" />
        <div className="h-12 bg-gray-800/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-white mb-2">{error}</h3>
        <button
          onClick={fetchUserInfo}
          className="mt-4 px-6 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">👤</div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Cargando información...
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white mb-6">
        Información Personal
      </h2>

      {/* User Info Card */}
      <div className="bg-gray-800/30 border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              {userInfo.email}
            </h3>
            <p className="text-white/50 text-sm">Usuario registrado</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-white/5">
            <span className="text-white/50">Email</span>
            <span className="text-white font-medium">{userInfo.email}</span>
          </div>

          {userInfo.nombre && (
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <span className="text-white/50">Nombre</span>
              <span className="text-white font-medium">{userInfo.nombre}</span>
            </div>
          )}

          {userInfo.telefono && (
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <span className="text-white/50">Teléfono</span>
              <span className="text-white font-medium">
                {userInfo.telefono}
              </span>
            </div>
          )}

          {userInfo.isAdmin && (
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <span className="text-white/50">Rol</span>
              <span className="text-white/50 text-sm font-mono">
                Administrador
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-gray-800/30 border border-white/5 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Cuenta</h3>

        <button
          onClick={logout}
          className="w-full py-3 px-4 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
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
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V9M4.5 9l9-9m0 0h6m-6 0v6"
            />
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default PersonalInfoTab;
