import { useState } from "react";
import PropTypes from "prop-types";
import useSWR from "swr";
import Swal from "sweetalert2";
import api from "../../../lib/api";
import { normalizePhone } from "../../../lib/orders-api";
import useAuthStore from "../../../stores/useAuthStore";
import { LogOut, Pencil, User } from "lucide-react";

const userFetcher = (url) => api.get(url).then((res) => res.data.data.usuario);

// Same limits as the backend (PUT /api/user/:id)
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 80;

const EMAIL_NOTE =
  "Si querés cambiar tu email, avisale al administrador del sitio.";

/**
 * Client-side checks that mirror the backend. Returns { errors, payload }:
 * `payload` is the body to send when there are no errors (phone "" clears it).
 */
function validateProfile({ name, phone }) {
  const errors = {};
  const trimmedName = name.trim();
  if (
    trimmedName.length < NAME_MIN_LENGTH ||
    trimmedName.length > NAME_MAX_LENGTH
  ) {
    errors.name = `El nombre debe tener entre ${NAME_MIN_LENGTH} y ${NAME_MAX_LENGTH} caracteres`;
  }

  let normalizedPhone = "";
  if (phone.trim()) {
    normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      errors.phone =
        "Teléfono inválido: ingresá tu celular con código de área (ej: 381 4159688) o en formato internacional con +";
    }
  }

  return { errors, payload: { name: trimmedName, phone: normalizedPhone } };
}

const InfoRow = ({ label, children }) => (
  <div className="flex flex-col gap-1 py-3 border-b border-white/5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
    <span className="text-white/50 shrink-0">{label}</span>
    <div className="min-w-0 sm:text-right">{children}</div>
  </div>
);

InfoRow.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
};

const PersonalInfoTab = () => {
  const { userId, logoutWithApi, setUserPhone } = useAuthStore();
  // Keyed by userId so another user's cached data can never be shown; SWR
  // revalidates on every mount, so profile changes show up.
  const {
    data: userInfo,
    error: fetchError,
    isLoading: isFetching,
    isValidating,
    mutate,
  } = useSWR(userId ? `/api/user/${userId}` : null, userFetcher);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // A retry hides the previous error while the new request is in flight.
  const isLoading = isFetching || (Boolean(fetchError) && isValidating);
  const error = !userId
    ? "Debes iniciar sesión nuevamente"
    : fetchError
      ? "No se pudo cargar la información"
      : "";
  const fetchUserInfo = () => mutate();

  const startEditing = () => {
    setForm({ name: userInfo?.name || "", phone: userInfo?.phone || "" });
    setFieldErrors({});
    setEditing(true);
  };

  const cancelEditing = () => {
    setFieldErrors({});
    setEditing(false);
  };

  const handleChange = (field) => (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;

    const { errors, payload } = validateProfile(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const res = await api.put(`/api/user/${userId}`, payload);
      const usuario = res.data?.data?.usuario;
      if (usuario) {
        await mutate(usuario, { revalidate: false });
        // Checkout reads the phone from the auth store
        setUserPhone(usuario.phone);
      } else {
        const fresh = await mutate();
        setUserPhone(fresh?.phone);
      }
      setEditing(false);
    } catch (err) {
      const details = Array.isArray(err?.details) ? err.details : [];
      const byField = {};
      details.forEach(({ field, message }) => {
        if ((field === "name" || field === "phone") && !byField[field]) {
          byField[field] = message || "Valor inválido";
        }
      });
      if (Object.keys(byField).length > 0) {
        setFieldErrors(byField);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            err?.serverMessage ||
            err?.message ||
            "No se pudo guardar tu información",
        });
      }
    } finally {
      setSaving(false);
    }
  };

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

  const inputClass = (hasError) =>
    `w-full min-w-0 px-4 py-2.5 bg-gray-800/50 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 disabled:opacity-50 ${
      hasError ? "border-red-500/50" : "border-white/10"
    }`;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white mb-6">
        Información Personal
      </h2>

      {/* User Info Card */}
      <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 shrink-0 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400">
            <User className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-lg truncate">
              {userInfo.name || userInfo.email}
            </h3>
            <p className="text-white/50 text-sm">Usuario registrado</p>
          </div>
        </div>

        <div className="space-y-4">
          <InfoRow label="Email">
            <p className="text-white font-medium break-all">{userInfo.email}</p>
            <p className="text-white/40 text-xs mt-1">{EMAIL_NOTE}</p>
          </InfoRow>

          {editing ? (
            <form onSubmit={handleSave} noValidate className="space-y-4 pt-2">
              <div className="min-w-0">
                <label
                  htmlFor="profile-name"
                  className="block text-white/70 text-sm mb-1"
                >
                  Nombre
                </label>
                <input
                  id="profile-name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange("name")}
                  disabled={saving}
                  maxLength={NAME_MAX_LENGTH}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={
                    fieldErrors.name ? "profile-name-error" : undefined
                  }
                  className={inputClass(fieldErrors.name)}
                />
                {fieldErrors.name && (
                  <p
                    id="profile-name-error"
                    className="text-red-400 text-xs mt-1"
                  >
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="profile-phone"
                  className="block text-white/70 text-sm mb-1"
                >
                  Teléfono
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Ej: 381 4159688"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  disabled={saving}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  aria-describedby={
                    fieldErrors.phone
                      ? "profile-phone-error"
                      : "profile-phone-help"
                  }
                  className={inputClass(fieldErrors.phone)}
                />
                {fieldErrors.phone ? (
                  <p
                    id="profile-phone-error"
                    className="text-red-400 text-xs mt-1"
                  >
                    {fieldErrors.phone}
                  </p>
                ) : (
                  <p
                    id="profile-phone-help"
                    className="text-white/40 text-xs mt-1"
                  >
                    Dejalo vacío para quitarlo.
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-white/5 text-white/80 hover:bg-white/10 font-medium transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-yellow-500 text-gray-900 font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          ) : (
            <>
              <InfoRow label="Nombre">
                <p
                  className={`break-words ${userInfo.name ? "text-white font-medium" : "text-white/40"}`}
                >
                  {userInfo.name || "No cargado"}
                </p>
              </InfoRow>

              <InfoRow label="Teléfono">
                <p
                  className={`break-all ${userInfo.phone ? "text-white font-medium" : "text-white/40"}`}
                >
                  {userInfo.phone || "No cargado"}
                </p>
              </InfoRow>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={startEditing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 font-medium transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
              </div>
            </>
          )}

          {userInfo.role === "admin" && (
            <InfoRow label="Rol">
              <span className="text-white/50 text-sm font-mono">
                Administrador
              </span>
            </InfoRow>
          )}
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-gray-800/30 border border-white/5 rounded-xl p-4 sm:p-6">
        <h3 className="text-lg text-white font-semibold mb-4">Cuenta</h3>

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
