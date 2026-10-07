import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAuthStore from "../../../stores/useAuthStore";
import {
  Users,
  UserCheck,
  ShoppingCart,
  ArrowLeft,
  Plus,
  Spinner,
  Search,
} from "../../../components/common/Icons";
import Pagination from "../../../components/common/Pagination";
import { sendPasswordResetLink } from "../../../lib/auth-api";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  isUserActive,
} from "../../../lib/users-api";
import UserFormModal from "./UserFormModal";
import UserRowActions from "./UserRowActions";
import { ROLES, getRoleLabel, SELF_ACTION_HINT } from "./constants";
import { getUserErrorMessage, isUserNotFoundError } from "./user-errors";
import "../Products/index.css";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

const escapeHtml = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );

const DANGER_COLOR = "#ef4444";
const ACCENT_COLOR = "#eab308";

// Plain-text label for SweetAlert `text` (never interpolated into `html`).
const describeUser = (user) =>
  user.name ? `${user.name} (${user.email})` : user.email;

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Más recientes" },
  { value: "email", label: "Email (A-Z)" },
];

const SELECT_CLASS =
  "bg-gray-800 text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500 disabled:opacity-50 text-sm";

function KpiCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${accent.bg} ${accent.text}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-white/50 text-xs">{label}</p>
          <p className={`text-xl font-bold ${accent.value}`}>{value ?? "-"}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ user }) {
  const active = isUserActive(user);
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium border ${
        active
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          : "bg-red-500/10 text-red-400 border-red-500/30"
      }`}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function UserIdentity({ user, avatarSize = "w-10 h-10" }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div
        className={`${avatarSize} rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0`}
      >
        <span className="text-yellow-400 font-medium text-sm">
          {(user.name || user.email)?.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="min-w-0">
        {user.name && (
          <p className="text-white font-medium truncate max-w-xs">
            {user.name}
          </p>
        )}
        <p
          className={`truncate max-w-xs ${
            user.name ? "text-white/50 text-sm" : "text-white font-medium"
          }`}
        >
          {user.email}
        </p>
      </div>
    </div>
  );
}

function UsersAdmin() {
  const { token, isAdmin, userId } = useAuthStore();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("newest");

  const [busyId, setBusyId] = useState(null);
  const [sendingLink, setSendingLink] = useState(null);
  const [modal, setModal] = useState(null); // null | { mode: 'create' } | { mode: 'edit', user }
  const [saving, setSaving] = useState(false);

  const isSelf = (user) => Boolean(userId) && String(user._id) === String(userId);

  // Admin access guard
  useEffect(() => {
    if (!token || !isAdmin) navigate("/");
  }, [token, isAdmin, navigate]);

  // Debounce the search box; a new term always starts at page 1.
  useEffect(() => {
    const term = searchInput.trim();
    if (term === search) return undefined;
    const timer = setTimeout(() => {
      setSearch(term);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => {
    if (!token || !isAdmin) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);

    listUsers(
      {
        page,
        limit: PAGE_SIZE,
        search,
        role: roleFilter,
        status: statusFilter,
        sort,
      },
      { signal: controller.signal },
    )
      .then((result) => {
        if (controller.signal.aborted) return;
        // A deletion or filter change can leave us past the last page: move
        // back without rendering the empty page in between.
        const totalPages = result.pagination?.totalPages || 1;
        if (page > totalPages) {
          setPage(totalPages);
          return;
        }
        setUsers(result.users);
        setPagination(result.pagination);
        setCounts(result.counts);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Error fetching users:", error);
        setLoadError(error?.message || "No se pudieron cargar los usuarios");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [
    token,
    isAdmin,
    page,
    search,
    roleFilter,
    statusFilter,
    sort,
    reloadKey,
  ]);

  const reload = () => setReloadKey((key) => key + 1);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const hasFilters = Boolean(search || roleFilter || statusFilter);

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    const totalPages = pagination?.totalPages || 1;
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showSuccess = (title, text) =>
    Swal.fire({
      icon: "success",
      title,
      text,
      timer: 1800,
      showConfirmButton: false,
    });

  const showUserError = (error, title, fallback) => {
    console.error(`${title}:`, error);
    // The user was deleted elsewhere: the current page is stale.
    if (isUserNotFoundError(error)) reload();
    return Swal.fire({
      icon: "error",
      title,
      text: getUserErrorMessage(error, fallback),
      confirmButtonColor: ACCENT_COLOR,
    });
  };

  // Runs one row mutation; on success refetches the page (and the KPIs).
  const runRowMutation = async (user, request, success, failure) => {
    setBusyId(user._id);
    try {
      await request();
      showSuccess(success.title, success.text);
      reload();
      return true;
    } catch (error) {
      showUserError(error, failure.title, failure.fallback);
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const setUserActive = (user, isActive) =>
    runRowMutation(
      user,
      () => updateUser(user._id, { isActive }),
      {
        title: isActive ? "Usuario activado" : "Usuario desactivado",
        text: isActive
          ? "El usuario puede volver a iniciar sesión."
          : "Se cerró su sesión y ya no puede iniciar sesión.",
      },
      {
        title: isActive ? "No se pudo activar" : "No se pudo desactivar",
        fallback: "No se pudo actualizar el estado del usuario",
      },
    );

  // The <select> is controlled by user.role, so a cancelled confirmation
  // (or a failed request) leaves it showing the current role.
  const handleRoleChange = async (user, newRole) => {
    if (newRole === user.role) return;
    const roleLabel = getRoleLabel(newRole);
    const { isConfirmed } = await Swal.fire({
      icon: "warning",
      title: "¿Cambiar rol?",
      text: `${describeUser(user)} pasará a ser ${roleLabel}. Se cerrará su sesión y deberá volver a iniciarla.`,
      showCancelButton: true,
      confirmButtonText: "Cambiar rol",
      cancelButtonText: "Cancelar",
      confirmButtonColor: ACCENT_COLOR,
    });
    if (!isConfirmed) return;

    await runRowMutation(
      user,
      () => updateUser(user._id, { role: newRole }),
      { title: "Rol actualizado", text: `El usuario ahora es ${roleLabel}` },
      { title: "No se pudo cambiar el rol", fallback: "No se pudo actualizar el rol" },
    );
  };

  const handleToggleActive = async (user) => {
    const active = isUserActive(user);
    const { isConfirmed } = await Swal.fire({
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      ...(active
        ? {
            icon: "warning",
            title: "¿Desactivar usuario?",
            text: `${describeUser(user)} no podrá iniciar sesión y se cerrará su sesión actual. Podés reactivarlo cuando quieras.`,
            confirmButtonText: "Desactivar",
            confirmButtonColor: DANGER_COLOR,
          }
        : {
            icon: "question",
            title: "¿Activar usuario?",
            text: `${describeUser(user)} podrá volver a iniciar sesión.`,
            confirmButtonText: "Activar",
            confirmButtonColor: ACCENT_COLOR,
          }),
    });
    if (!isConfirmed) return;
    await setUserActive(user, !active);
  };

  const offerDeactivation = async (user) => {
    const { isConfirmed } = await Swal.fire({
      icon: "warning",
      title: "No se puede eliminar",
      text: `${getUserErrorMessage({ code: "USER_HAS_ORDERS" })} Al desactivarlo se cierra su sesión y no podrá iniciar sesión.`,
      showCancelButton: true,
      confirmButtonText: "Desactivar",
      cancelButtonText: "Cerrar",
      confirmButtonColor: DANGER_COLOR,
    });
    if (isConfirmed) await setUserActive(user, false);
  };

  const handleDelete = async (user) => {
    const { isConfirmed } = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar usuario?",
      text: `Se eliminará ${describeUser(user)} junto con su carrito y favoritos. Solo se pueden eliminar usuarios sin pedidos; si tiene pedidos, desactivalo. Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: DANGER_COLOR,
    });
    if (!isConfirmed) return;

    setBusyId(user._id);
    try {
      await deleteUser(user._id);
      showSuccess("Usuario eliminado");
      reload();
    } catch (error) {
      if (error?.code === "USER_HAS_ORDERS" && isUserActive(user)) {
        setBusyId(null);
        await offerDeactivation(user);
      } else {
        showUserError(
          error,
          "No se pudo eliminar",
          "Ocurrió un error al eliminar el usuario",
        );
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleFormSubmit = async (values) => {
    setSaving(true);
    try {
      if (modal.mode === "edit") {
        await updateUser(modal.user._id, values);
        setModal(null);
        showSuccess("Usuario actualizado");
      } else {
        const result = await createUser(values);
        setModal(null);
        if (result?.inviteSent) {
          showSuccess(
            "Usuario creado",
            "Usuario creado. Se envió un mail para que defina su contraseña.",
          );
        } else {
          Swal.fire({
            icon: "warning",
            title: "Usuario creado",
            text: "Usuario creado, pero no se pudo enviar el mail. Reenvialo con 'Enviar link de recuperación'.",
            confirmButtonColor: ACCENT_COLOR,
          });
        }
      }
      reload();
    } catch (error) {
      // Keep the modal open so the admin can fix the data, unless the
      // edited user no longer exists.
      if (isUserNotFoundError(error)) setModal(null);
      showUserError(
        error,
        "No se pudo guardar",
        "Verificá los datos e intentá de nuevo.",
      );
    } finally {
      setSaving(false);
    }
  };

  const getResetLinkErrorMessage = (error) => {
    if (error?.status === 404) return "El usuario ya no existe.";
    if (error?.status === 502 || error?.code === "MAIL_SEND_FAILED")
      return "No pudimos enviar el email. Revisá la configuración de correo e intentá de nuevo más tarde.";
    if (error?.status === 429)
      return "Demasiados intentos. Esperá unos minutos y volvé a intentar.";
    return error?.message || "No se pudo enviar el link de recuperación";
  };

  const handleSendResetLink = async (user) => {
    const { isConfirmed } = await Swal.fire({
      icon: "question",
      title: "Enviar link de recuperación",
      html: `Se enviará un link para restablecer la contraseña a:<br/><strong>${escapeHtml(user.email)}</strong>`,
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#eab308",
    });
    if (!isConfirmed) return;

    setSendingLink(user._id);
    try {
      const data = await sendPasswordResetLink(user._id);
      Swal.fire({
        icon: "success",
        title: "Link enviado",
        text: data?.message || "Link de recuperación enviado",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error sending reset link:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: getResetLinkErrorMessage(error),
        confirmButtonColor: "#eab308",
      });
    } finally {
      setSendingLink(null);
    }
  };

  const renderRowActions = (user, compact) => (
    <UserRowActions
      user={user}
      isSelf={isSelf(user)}
      busy={busyId === user._id}
      sendingLink={sendingLink === user._id}
      compact={compact}
      onEdit={(target) => setModal({ mode: "edit", user: target })}
      onToggleActive={handleToggleActive}
      onDelete={handleDelete}
      onSendResetLink={handleSendResetLink}
    />
  );

  const renderRoleSelect = (user, extraClass = "") => (
    <select
      value={user.role || "minorista"}
      onChange={(e) => handleRoleChange(user, e.target.value)}
      disabled={busyId === user._id || isSelf(user)}
      title={isSelf(user) ? SELF_ACTION_HINT : undefined}
      aria-label={`Cambiar rol de ${user.email}`}
      className={`${SELECT_CLASS} ${extraClass}`}
    >
      {ROLES.map((role) => (
        <option key={role.value} value={role.value}>
          {role.label}
        </option>
      ))}
    </select>
  );

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

  const totalUsers = counts?.total ?? pagination?.totalUsers ?? 0;
  const totalPages = pagination?.totalPages || 1;
  const isFirstLoad = loading && !pagination && !loadError;

  const renderResults = () => {
    if (isFirstLoad) {
      return (
        <div className="flex items-center justify-center gap-3 py-20 text-white/50">
          <Spinner className="w-5 h-5" />
          Cargando usuarios...
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="text-center py-20" role="alert">
          <h3 className="text-xl font-semibold text-white mb-2">
            No se pudieron cargar los usuarios
          </h3>
          <p className="text-white/50 mb-6">{loadError}</p>
          <button
            type="button"
            onClick={reload}
            className="px-4 py-2 rounded-lg bg-yellow-500 text-gray-900 font-medium hover:bg-yellow-400 transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {hasFilters
              ? "No hay usuarios que coincidan con los filtros"
              : "No hay usuarios registrados"}
          </h3>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 px-4 py-2 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 text-sm transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      );
    }

    return (
      <div
        className={`transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""}`}
        aria-busy={loading}
      >
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
                    Rol
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Cambiar rol
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-white/5 transition-colors duration-200"
                  >
                    <td className="px-4 py-3.5">
                      <UserIdentity user={user} />
                    </td>
                    <td className="px-4 py-3.5">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge user={user} />
                    </td>
                    <td className="px-4 py-3.5">
                      {renderRoleSelect(user, "min-w-[140px]")}
                    </td>
                    <td className="px-4 py-3.5">
                      {renderRowActions(user, true)}
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
              <div className="flex items-start justify-between gap-3 mb-4">
                <UserIdentity user={user} avatarSize="w-12 h-12" />
                <StatusBadge user={user} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/50 text-xs mb-1">Rol actual</p>
                  {getRoleBadge(user.role)}
                </div>
                {renderRoleSelect(user)}
              </div>
              {renderRowActions(user, false)}
            </div>
          ))}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={handlePageChange}
          disabled={loading}
          ariaLabel="Paginación de usuarios"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to="/adm/dashboard"
                aria-label="Volver al panel"
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  Administración de Usuarios
                </h1>
                <p className="text-white/50 mt-1">
                  {totalUsers} usuario{totalUsers !== 1 ? "s" : ""} registrado
                  {totalUsers !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setModal({ mode: "create" })}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500 text-gray-900 font-semibold hover:bg-yellow-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo usuario
            </button>
          </div>

          {/* KPI Cards (server-side counts, independent of filters) */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <KpiCard
              icon={Users}
              label="Total Usuarios"
              value={counts?.total}
              accent={{
                bg: "bg-yellow-500/10",
                text: "text-yellow-400",
                value: "text-white",
              }}
            />
            <KpiCard
              icon={UserCheck}
              label="Activos"
              value={counts?.active}
              accent={{
                bg: "bg-emerald-500/10",
                text: "text-emerald-400",
                value: "text-emerald-400",
              }}
            />
            <KpiCard
              icon={Users}
              label="Inactivos"
              value={counts?.inactive}
              accent={{
                bg: "bg-red-500/10",
                text: "text-red-400",
                value: "text-red-400",
              }}
            />
            <KpiCard
              icon={Users}
              label="Minoristas"
              value={counts?.minoristas}
              accent={{
                bg: "bg-blue-500/10",
                text: "text-blue-400",
                value: "text-blue-400",
              }}
            />
            <KpiCard
              icon={Users}
              label="Mayoristas"
              value={counts?.mayoristas}
              accent={{
                bg: "bg-green-500/10",
                text: "text-green-400",
                value: "text-green-400",
              }}
            />
            <KpiCard
              icon={ShoppingCart}
              label="Admins"
              value={counts?.admins}
              accent={{
                bg: "bg-purple-500/10",
                text: "text-purple-400",
                value: "text-purple-400",
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por email o nombre..."
              aria-label="Buscar usuarios por email o nombre"
              className="w-full bg-gray-800 text-white pl-9 pr-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500 text-sm placeholder:text-white/40"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={roleFilter}
              onChange={handleFilterChange(setRoleFilter)}
              aria-label="Filtrar por rol"
              className={SELECT_CLASS}
            >
              <option value="">Todos los roles</option>
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={handleFilterChange(setStatusFilter)}
              aria-label="Filtrar por estado"
              className={SELECT_CLASS}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={handleFilterChange(setSort)}
              aria-label="Ordenar usuarios"
              className={SELECT_CLASS}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {renderResults()}
      </div>

      {modal && (
        <UserFormModal
          key={modal.mode === "edit" ? modal.user._id : "create"}
          mode={modal.mode}
          user={modal.mode === "edit" ? modal.user : null}
          isSelf={modal.mode === "edit" && isSelf(modal.user)}
          saving={saving}
          onCancel={() => setModal(null)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}

export default UsersAdmin;
