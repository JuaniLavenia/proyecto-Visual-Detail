import { useEffect, useState } from "react";
import api from "../../../lib/api";
import { useUserContext } from "../../../context/UserContext";
import useAuthStore from "../../../stores/useAuthStore";
import { LogOut, User } from "lucide-react";

const PersonalInfoTab = () => {
  const { userInfo, updateUser } = useUserContext();
  const { userId, logoutWithApi } = useAuthStore();
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
      const response = await api.get(`/api/user/${userId}`);
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
            <User className="w-8 h-8" />
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
          onClick={logoutWithApi}
          className="w-full py-3 px-4 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default PersonalInfoTab;
