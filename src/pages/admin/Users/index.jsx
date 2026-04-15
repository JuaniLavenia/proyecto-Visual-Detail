import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import useAuthStore from "../../../stores/useAuthStore";
import {
  Users,
  UserCheck,
  UserGroup,
  ShoppingCart,
  ArrowLeft,
} from "../../../components/common/Icons";
import "../Products/index.css";

const API_BASE = "https://visual-detail-backend.onrender.com";
// const API_BASE = "http://localhost:5000";

const ROLES = [
  { value: "minorista", label: "Minorista", color: "bg-blue-500" },
  { value: "mayorista", label: "Mayorista", color: "bg-green-500" },
  { value: "admin", label: "Administrador", color: "bg-yellow-500" },
];

function UsersAdmin() {
  const { token, isAdmin, userId } = useAuthStore();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  // Verificar acceso admin
  useEffect(() => {
    if (!token || !isAdmin) {
      navigate("/");
      return;
    }
    fetchUsers();
  }, [token, isAdmin]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.data.usuarios || res.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los usuarios",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userIdActual, newRole) => {
    if (!isAdmin) {
      Swal.fire({
        icon: "warning",
        title: "Acceso denegado",
        text: "Solo administradores pueden cambiar roles",
      });
      return;
    }

    setUpdating(userIdActual);
    try {
      const res = await axios.put(
        `${API_BASE}/api/users/${userIdActual}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Actualizar lista local
      setUsers(
        users.map((u) =>
          u._id === userIdActual ? { ...u, role: newRole } : u,
        ),
      );

      Swal.fire({
        icon: "success",
        title: "Role actualizado",
        text: `El usuario ahora es ${newRole}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el role",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadge = (role) => {
    const roleObj = ROLES.find((r) => r.value === role) || ROLES[0];
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium text-white ${roleObj.color}`}
      >
        {roleObj.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 flex items-center justify-center">
        <div className="text-white/50">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to="/adm/productos"
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  Administración de Usuarios
                </h1>
                <p className="text-white/50 mt-1">
                  {users.length} usuario{users.length !== 1 ? "s" : ""}{" "}
                  registrado{users.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">Total Usuarios</p>
                  <p className="text-xl font-bold text-white">{users.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <UserGroup className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">Minoristas</p>
                  <p className="text-xl font-bold text-blue-400">
                    {users.filter((u) => u.role === "minorista").length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">Mayoristas</p>
                  <p className="text-xl font-bold text-green-400">
                    {users.filter((u) => u.role === "mayorista").length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/50 text-xs">Admins</p>
                  <p className="text-xl font-bold text-purple-400">
                    {users.filter((u) => u.role === "admin").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {users.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay usuarios registrados
            </h3>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-gray-900/30 border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/40 border-b border-white/5">
                    <tr>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Cambiar Role
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                        ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((user, index) => (
                      <tr
                        key={user._id}
                        className="hover:bg-white/5 transition-all duration-200"
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-yellow-400 font-medium text-sm">
                                {user.email?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-white font-medium truncate max-w-xs">
                              {user.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-4 py-3.5">
                          <select
                            value={user.role || "minorista"}
                            onChange={(e) =>
                              handleRoleChange(user._id, e.target.value)
                            }
                            disabled={updating === user._id}
                            className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500 disabled:opacity-50 text-sm min-w-[140px]"
                          >
                            {ROLES.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3.5">
                          <code className="text-white/40 text-xs">
                            {user._id}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden grid gap-4">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="bg-gray-900/50 border border-white/5 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-yellow-400 font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {user.email}
                      </p>
                      <p className="text-white/40 text-xs truncate">
                        {user._id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/50 text-xs mb-1">Role actual</p>
                      {getRoleBadge(user.role)}
                    </div>
                    <select
                      value={user.role || "minorista"}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
                      disabled={updating === user._id}
                      className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500 disabled:opacity-50 text-sm"
                    >
                      {ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UsersAdmin;
