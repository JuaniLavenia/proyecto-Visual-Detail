import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../lib/api";
import useAuthStore from "../../../stores/useAuthStore";
import {
  ArrowLeft,
  Tag,
  Category,
  Plus,
  Edit,
  Trash,
  Check,
  Close,
  Spinner,
} from "../../../components/common/Icons";

// El interceptor de api.js ya normaliza el error de axios en
// { type, message, ... } antes de que llegue acá (ver handleError en
// src/lib/api.js) - el .response original no sobrevive.
const getErrorMessage = (err, fallback) => err?.message || fallback;

function TaxonomyFormModal({ mode, initialValues, onCancel, onSubmit, saving }) {
  const [name, setName] = useState(initialValues?.name || "");
  const [sortOrder, setSortOrder] = useState(initialValues?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    setError("");
    onSubmit({ name: name.trim(), sortOrder: Number(sortOrder) || 0, isActive });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">
            {mode === "edit" ? "Editar" : "Nueva entrada"}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-white/50 hover:text-white rounded-lg transition-colors"
          >
            <Close className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              autoFocus
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Orden</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
            />
          </div>

          <label className="flex items-center gap-2 text-white/70 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-yellow-500"
            />
            Activa (visible en la tienda)
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <Spinner className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaxonomyManager({ title, basePath, icon: Icon }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: 'create' } | { mode: 'edit', item }
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/${basePath}/all`);
      setItems(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(err, `No se pudieron cargar: ${title.toLowerCase()}`),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath]);

  const handleToggleActive = async (item) => {
    try {
      await api.put(`/api/${basePath}/${item._id}`, { isActive: !item.isActive });
      fetchItems();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(err, "No se pudo actualizar el estado"),
      });
    }
  };

  const handleDelete = async (item) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: `¿Eliminar "${item.name}"?`,
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });
    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/api/${basePath}/${item._id}`);
      Swal.fire({
        icon: "success",
        title: "Eliminado",
        timer: 1200,
        showConfirmButton: false,
      });
      fetchItems();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: getErrorMessage(err, "Ocurrió un error al eliminar."),
      });
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (modal.mode === "edit") {
        await api.put(`/api/${basePath}/${modal.item._id}`, values);
      } else {
        await api.post(`/api/${basePath}`, values);
      }
      setModal(null);
      fetchItems();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: getErrorMessage(err, "Verificá los datos e intentá de nuevo."),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Icon className="w-5 h-5 text-yellow-400" />
          {title}
        </h2>
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-medium rounded-xl transition-colors flex items-center gap-1.5 text-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva
        </button>
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          <Spinner className="w-6 h-6 text-yellow-500" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-white/40 text-sm py-6 text-center">
          No hay entradas todavía.
        </p>
      ) : (
        <div className="divide-y divide-white/5">
          {items.map((item) => (
            <div
              key={item._id}
              className="py-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium truncate">
                    {item.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      item.isActive
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        : "bg-gray-600/30 text-white/50 hover:bg-gray-600/50"
                    }`}
                    title="Click para cambiar el estado"
                  >
                    {item.isActive ? "Activa" : "Inactiva"}
                  </button>
                </div>
                <p className="text-white/40 text-xs truncate">{item.slug}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setModal({ mode: "edit", item })}
                  className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <TaxonomyFormModal
          mode={modal.mode}
          initialValues={modal.mode === "edit" ? modal.item : null}
          saving={saving}
          onCancel={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

function TaxonomyAdmin() {
  const { token, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !isAdmin) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAdmin]);

  if (!token || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 pb-12">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <Link
              to="/adm/dashboard"
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                Marcas y Categorías
              </h1>
              <p className="text-white/50 mt-1">
                Administrá la taxonomía usada por los productos y la tienda
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaxonomyManager title="Marcas" basePath="brands" icon={Tag} />
        <TaxonomyManager title="Categorías" basePath="categories" icon={Category} />
      </div>
    </div>
  );
}

export default TaxonomyAdmin;
