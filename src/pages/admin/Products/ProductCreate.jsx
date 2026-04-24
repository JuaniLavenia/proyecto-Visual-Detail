import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../lib/api";
import Swal from "sweetalert2";
import useAuthStore from "../../../stores/useAuthStore";
import {
  ArrowLeft,
  Settings,
  Check,
  Image,
  Spinner,
} from "../../../components/common/Icons";
import "./index.css";

const BRANDS = [
  "Toxic-Shine",
  "Fullcar",
  "Dreams",
  "Ternnova",
  "Drop",
  "Menzerna",
  "Meguiars",
  "Vonixx",
  "Laffitte",
  "Stretch",
  "Otros",
];

const CATEGORIES = [
  "Interiores",
  "Exteriores",
  "Línea Profesional",
  "Línea Industrial",
  "Perfumes y Aromatizantes",
  "Pads y Baking Plates",
  "Microfibras",
  "Aplicadores",
  "Cepillos y Brochas",
  "Dosificadores y Foams",
  "Otros",
];

function ProductoCreate() {
  const navigate = useNavigate();
  const { token, userId, isAdmin } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Validar acceso admin
  if (!token || userId !== "65dbfbfdbbaccc7f307ebc2e") {
    navigate("/login");
    return null;
  }

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
    if (formData.imageUrl && image) {
      newErrors.image = "Selecciona solo una opción de imagen";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData({ ...formData, imageUrl: "" });
      if (errors.image) setErrors({ ...errors, image: null });
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

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    if (formData.precioMayorista) {
      data.append("precioMayorista", formData.precioMayorista);
    }
    data.append("stock", formData.stock);
    data.append("category", formData.category);
    data.append("brand", formData.brand);
    data.append("capacity", formData.capacity);

    if (image) {
      data.append("image", image);
    } else if (formData.imageUrl) {
      data.append("imageUrl", formData.imageUrl);
    }

    try {
      await api.post("/api/productos", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "¡Producto creado!",
        text: "El producto se ha agregado correctamente",
        confirmButtonColor: "#eab308",
        showConfirmButton: false,
        timer: 1500,
      });

      navigate("/adm/productos");
    } catch (err) {
      console.error("Error creating product:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear el producto. Verificá los datos e intentá de nuevo.",
        confirmButtonColor: "#eab308",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              Crear nuevo producto
            </h1>
          </div>
          <p className="text-white/50 ml-11">Completá los datos del producto</p>
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
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:outline-none focus:border-yellow-500/50 transition-colors ${
                    errors.brand ? "border-red-500" : "border-white/10"
                  }`}
                >
                  <option value="" className="bg-gray-900">
                    Seleccionar marca
                  </option>
                  {BRANDS.map((brand) => (
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
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:outline-none focus:border-yellow-500/50 transition-colors ${
                    errors.category ? "border-red-500" : "border-white/10"
                  }`}
                >
                  <option value="" className="bg-gray-900">
                    Seleccionar categoría
                  </option>
                  {CATEGORIES.map((cat) => (
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
            {(imagePreview || formData.imageUrl) && (
              <div className="mb-5">
                <p className="text-white/50 text-sm mb-2">Vista previa:</p>
                <div className="w-40 h-40 rounded-xl overflow-hidden bg-gray-800 border border-white/10">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : formData.imageUrl ? (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Upload File */}
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Subir imagen (archivo)
                </label>
                <input
                  type="file"
                  accept="image/png,image/svg,image/jpg,image/jpeg"
                  onChange={handleImageFileChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-yellow-500 file:text-gray-900 hover:file:bg-yellow-400 cursor-pointer"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  O desde URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    setImage(null);
                    setImagePreview(null);
                  }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 transition-colors"
                />
              </div>
            </div>
            {errors.image && (
              <p className="text-red-400 text-xs mt-2">{errors.image}</p>
            )}
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
                  Crear producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductoCreate;
