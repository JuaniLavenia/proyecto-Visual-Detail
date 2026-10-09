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
  Image as ImageIcon,
} from "../../../components/common/Icons";

// El interceptor de api.js ya normaliza el error de axios en
// { type, message, ... } antes de que llegue acá (ver handleError en
// src/lib/api.js) - el .response original no sobrevive.
const getErrorMessage = (err, fallback) => err?.message || fallback;

const isHttpUrl = (value) => /^https?:\/\/\S+$/i.test(value);

// Small square thumbnail that falls back to a placeholder icon when the URL
// is empty or fails to load. Callers key it by src so a new URL retries.
function TaxonomyThumb({ src, alt, className = "w-10 h-10" }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={`${className} flex-shrink-0 rounded-lg bg-gray-800/60 border border-white/10 overflow-hidden flex items-center justify-center`}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="w-full h-full object-contain"
        />
      ) : (
        <ImageIcon className="w-1/2 h-1/2 text-white/30" />
      )}
    </div>
  );
}

function TaxonomyFormModal({ mode, initialValues, onCancel, onSubmit, saving }) {
  const [name, setName] = useState(initialValues?.name || "");
  const [sortOrder, setSortOrder] = useState(initialValues?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const [image, setImage] = useState(initialValues?.image || "");
  const [showOnHome, setShowOnHome] = useState(
    initialValues?.showOnHome ?? false
  );
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");

  const trimmedImage = image.trim();
  const isRenaming =
    mode === "edit" &&
    Boolean(name.trim()) &&
    name.trim() !== (initialValues?.name || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    setError("");
    if (trimmedImage && !isHttpUrl(trimmedImage)) {
      setImageError("La URL debe empezar con http:// o https://");
      return;
    }
    setImageError("");
    onSubmit({
      name: name.trim(),
      sortOrder: Number(sortOrder) || 0,
      isActive,
      image: trimmedImage,
      showOnHome,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-gray-900 border border-white/10 rounded-2xl p-6">
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
            {isRenaming && (
              <p className="text-yellow-400/80 text-xs mt-1">
                Los productos que usan este nombre también se van a actualizar.
              </p>
            )}
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">
              Imagen (URL)
            </label>
            <div className="flex items-center gap-3">
              <TaxonomyThumb
                key={trimmedImage}
                src={isHttpUrl(trimmedImage) ? trimmedImage : ""}
                alt="Vista previa"
                className="w-12 h-12"
              />
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                maxLength={2048}
                className="min-w-0 flex-1 px-4 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
              />
            </div>
            {imageError ? (
              <p className="text-red-400 text-xs mt-1">{imageError}</p>
            ) : (
              <p className="text-white/40 text-xs mt-1">
                Opcional. Se muestra en la home.
              </p>
            )}
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

          <label className="flex items-center justify-between gap-3 text-white/70 text-sm cursor-pointer">
            <span>Mostrar en la home</span>
            <input
              type="checkbox"
              role="switch"
              checked={showOnHome}
              onChange={(e) => setShowOnHome(e.target.checked)}
              className="sr-only peer"
            />
            <span
              aria-hidden="true"
              className="relative w-10 h-6 flex-shrink-0 rounded-full bg-gray-600/60 transition-colors peer-checked:bg-yellow-500 peer-focus-visible:ring-2 peer-focus-visible:ring-yellow-500/50 after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4"
            />
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

  const handleToggle = async (item, field) => {
    try {
      await api.put(`/api/${basePath}/${item._id}`, { [field]: !item[field] });
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
              <div className="min-w-0 flex-1 flex items-center gap-3">
                {item.image && (
                  <TaxonomyThumb
                    key={item.image}
                    src={item.image}
                    alt={item.name}
                  />
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="text-white font-medium truncate min-w-0 max-w-full">
                      {item.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggle(item, "isActive")}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        item.isActive
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : "bg-gray-600/30 text-white/50 hover:bg-gray-600/50"
                      }`}
                      title="Click para cambiar el estado"
                    >
                      {item.isActive ? "Activa" : "Inactiva"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggle(item, "showOnHome")}
                      aria-pressed={Boolean(item.showOnHome)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        item.showOnHome
                          ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                          : "bg-gray-600/30 text-white/50 hover:bg-gray-600/50"
                      }`}
                      title="Click para mostrar u ocultar en la home"
                    >
                      Home
                    </button>
                  </div>
                  <p className="text-white/40 text-xs truncate">{item.slug}</p>
                </div>
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
