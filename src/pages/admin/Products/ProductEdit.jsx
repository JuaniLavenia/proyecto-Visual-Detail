import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../../lib/api";
import Swal from "sweetalert2";
import useAuthStore from "../../../stores/useAuthStore";
import useTaxonomyOptions from "../../../hooks/useTaxonomyOptions";
import {
  ArrowLeft,
  Settings,
  Check,
  Image,
  Spinner,
} from "../../../components/common/Icons";
import "./index.css";

function ProductoEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAdmin } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const {
    brands: activeBrands,
    categories: activeCategories,
    loading: loadingTaxonomy,
    error: taxonomyError,
  } = useTaxonomyOptions();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    precioMayorista: "",
    stock: "",
    category: "",
    brand: "",
    capacity: "",
    imageUrl: "",
  });

  const [existingImage, setExistingImage] = useState(null);
  const [errors, setErrors] = useState({});

  // El producto puede tener guardada una marca/categoria que ya no esta
  // activa (desactivada o renombrada despues de creado el producto). Si no
  // la agregamos a las opciones, el select la muestra en blanco y guardar
  // sin tocarla mandaria un valor distinto al que el producto tiene hoy.
  const brandOptions = useMemo(() => {
    if (formData.brand && !activeBrands.includes(formData.brand)) {
      return [...activeBrands, formData.brand];
    }
    return activeBrands;
  }, [activeBrands, formData.brand]);

  const categoryOptions = useMemo(() => {
    if (formData.category && !activeCategories.includes(formData.category)) {
      return [...activeCategories, formData.category];
    }
    return activeCategories;
  }, [activeCategories, formData.category]);

  // Validar acceso admin
  if (!token || !isAdmin) {
    navigate("/login");
    return null;
  }

  // Fetch producto
  useEffect(() => {
    api
      .get(`/api/productos/${id}`)
      .then((res) => {
        // Nueva estructura: response.data.data = producto
        const p = res.data.data;
        setFormData({
          name: p?.name || "",
          description: p?.description || "",
          price: p?.price || "",
          precioMayorista: p?.precioMayorista || "",
          stock: p?.stock || "",
          category: p?.category || "",
          brand: p?.brand || "",
          capacity: p?.capacity || "",
          // El modelo guarda la imagen en "image", no en "imageUrl". Solo
          // precargamos el input cuando ya es una URL editable - un path
          // local viejo (ver mas abajo) no tiene sentido pegado ahi.
          imageUrl: p?.image && p.image.startsWith("http") ? p.image : "",
        });
        if (p?.image && !p.image.startsWith("http")) {
          setExistingImage(`/img/productos/${p.image}`);
        } else {
          setExistingImage(p?.image || null);
        }
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar el producto",
        });
        navigate("/adm/productos");
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [id, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!formData.description.trim())
      newErrors.description = "La descripción es requerida";
    if (!formData.price || formData.price < 0)
      newErrors.price = "El precio es requerido";
    if (!formData.stock || formData.stock < 0)
      newErrors.stock = "El stock es requerido";
    if (!formData.category) newErrors.category = "Selecciona una categoría";
    if (!formData.brand) newErrors.brand = "Selecciona una marca";
    if (!formData.capacity.trim())
      newErrors.capacity = "La capacidad es requerida";
    if (
      formData.price &&
      formData.precioMayorista &&
      parseFloat(formData.precioMayorista) >= parseFloat(formData.price)
    )
      newErrors.precioMayorista =
        "El precio mayorista debe ser menor al precio regular";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    const payload = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      stock: formData.stock,
      category: formData.category,
      brand: formData.brand,
      capacity: formData.capacity,
    };
    if (formData.precioMayorista) {
      payload.precioMayorista = formData.precioMayorista;
    }
    if (formData.imageUrl) {
      payload.imageUrl = formData.imageUrl;
    }

    try {
      await api.put(`/api/productos/${id}`, payload);

      Swal.fire({
        icon: "success",
        title: "¡Producto actualizado!",
        text: "Los cambios se han guardado correctamente",
        confirmButtonColor: "#eab308",
        showConfirmButton: false,
        timer: 1500,
      });

      navigate("/adm/productos");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el producto",
        confirmButtonColor: "#eab308",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
          <p className="text-white/50">Cargando producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-2">
            <Link
              to="/adm/productos"
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Editar producto
            </h1>
          </div>
          <p className="text-white/50 ml-11">Modificá los datos del producto</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <Settings className="w-5 h-5 text-yellow-400" />
              Información básica
            </h2>

            {/* Nombre */}
            <div className="mb-5">
              <label className="block text-white/70 text-sm mb-2">
                Nombre del producto *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Polish Metal Premium"
                maxLength={40}
                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 transition-colors ${
                  errors.name ? "border-red-500" : "border-white/10"
                }`}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-white/70 text-sm mb-2">
                Descripción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe las características del producto..."
                maxLength={300}
                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 transition-colors resize-none ${
                  errors.description ? "border-red-500" : "border-white/10"
                }`}
              />
              <p className="text-white/30 text-xs mt-1">
                {formData.description.length}/300 caracteres
              </p>
              {errors.description && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Category & Brand Card */}
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <Settings className="w-5 h-5 text-yellow-400" />
              Categorización
            </h2>

            {taxonomyError && (
              <p className="text-red-400 text-xs mb-4">
                No se pudieron cargar las marcas y categorías. Recargá la página para intentar de nuevo.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Marca */}
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Marca *
                </label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  disabled={loadingTaxonomy || !!taxonomyError}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:outline-none focus:border-yellow-500/50 transition-colors disabled:opacity-50 ${
                    errors.brand ? "border-red-500" : "border-white/10"
                  }`}
                >
                  <option value="" className="bg-gray-900">
                    {loadingTaxonomy ? "Cargando marcas..." : "Seleccionar marca"}
                  </option>
                  {brandOptions.map((brand) => (
                    <option key={brand} value={brand} className="bg-gray-900">
                      {brand}
                    </option>
                  ))}
                </select>
                {errors.brand && (
                  <p className="text-red-400 text-xs mt-1">{errors.brand}</p>
                )}
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Categoría *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={loadingTaxonomy || !!taxonomyError}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:outline-none focus:border-yellow-500/50 transition-colors disabled:opacity-50 ${
                    errors.category ? "border-red-500" : "border-white/10"
                  }`}
                >
                  <option value="" className="bg-gray-900">
                    {loadingTaxonomy ? "Cargando categorías..." : "Seleccionar categoría"}
                  </option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat} className="bg-gray-900">
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-400 text-xs mt-1">{errors.category}</p>
                )}
              </div>
            </div>
          </div>

          {/* Price & Stock Card */}
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <Settings className="w-5 h-5 text-yellow-400" />
              Precio y Stock
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Precio por Menor */}
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Precio por Menor (ARS) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    $
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    max="99999"
                    step="0.01"
                    placeholder="0"
                    className={`w-full pl-8 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 transition-colors ${
                      errors.price ? "border-red-500" : "border-white/10"
                    }`}
                  />
                </div>
                {errors.price && (
                  <p className="text-red-400 text-xs mt-1">{errors.price}</p>
                )}
              </div>

              {/* Precio Mayorista */}
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Precio Mayorista (ARS)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    $
                  </span>
                  <input
                    type="number"
                    name="precioMayorista"
                    value={formData.precioMayorista}
                    onChange={handleChange}
                    min="0"
                    max="99999"
                    step="0.01"
                    placeholder="0"
                    className={`w-full pl-8 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 transition-colors ${
                      errors.precioMayorista
                        ? "border-red-500"
                        : "border-white/10"
                    }`}
                  />
                </div>
                {errors.precioMayorista && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.precioMayorista}
                  </p>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="mt-5">
              <label className="block text-white/70 text-sm mb-2">
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                max="999"
                placeholder="0"
                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 transition-colors ${
                  errors.stock ? "border-red-500" : "border-white/10"
                }`}
              />
              {errors.stock && (
                <p className="text-red-400 text-xs mt-1">{errors.stock}</p>
              )}
            </div>

            {/* Capacidad */}
            <div className="mt-5">
              <label className="block text-white/70 text-sm mb-2">
                Capacidad/Tamaño *
              </label>
              <input
                type="text"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Ej: 500ml, 1L, 100g"
                maxLength={20}
                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 transition-colors ${
                  errors.capacity ? "border-red-500" : "border-white/10"
                }`}
              />
              {errors.capacity && (
                <p className="text-red-400 text-xs mt-1">{errors.capacity}</p>
              )}
            </div>
          </div>

          {/* Image Card */}
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <Image className="w-5 h-5 text-yellow-400" />
              Imagen del producto
            </h2>

            {/* Image Preview */}
            {(formData.imageUrl || existingImage) && (
              <div className="mb-5">
                <p className="text-white/50 text-sm mb-2">
                  {formData.imageUrl ? "Vista previa:" : "Imagen actual:"}
                </p>
                <div className="w-40 h-40 rounded-xl overflow-hidden bg-gray-800 border border-white/10">
                  <img
                    src={formData.imageUrl || existingImage}
                    alt="Producto"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-white/70 text-sm mb-2">
                URL de la imagen
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link
              to="/adm/productos"
              className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-colors text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Spinner className="w-5 h-5" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductoEdit;
