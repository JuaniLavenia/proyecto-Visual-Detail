import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/AuthContext";

function ProductoEdit() {
  const [values, setValues] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    capacity: "",
    imageUrl: "",
  });
  const [image, setImage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const { token, userId } = useContext(AuthContext);

  useEffect(() => {
    axios
      .get(`https://visual-detail-backend.onrender.com/api/productos/${id}`)
      .then((res) => {
        setValues(res.data);
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Conexión perdida",
          text: "No se pudo establecer conexión con el servidor.",
        });
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("price", values.price);
    formData.append("stock", values.stock);
    formData.append("category", values.category);
    formData.append("brand", values.brand);
    formData.append("capacity", values.capacity);

    if (image) {
      formData.append("image", image);
    } else if (values.imageUrl && values.imageUrl != "") {
      formData.append("imageUrl", values.imageUrl);
    }

    if (image && values.imageUrl) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor, sube una imagen o proporciona un enlace, no ambos.",
      });
      return;
    }

    setIsLoading(true);

    axios
      .put(
        `https://visual-detail-backend.onrender.com/api/productos/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((res) => {
        Swal.fire({
          position: "top-center",
          icon: "success",
          title: "Se edito el producto con exito",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate("/adm/productos");
      })

      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Conexión perdida",
          text: "No se pudo establecer conexión con el servidor.",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues({
      ...values,
      [name]: value,
    });
  };

  const handleChangeFile = (event) => {
    if (event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  return (
    <div className="p-5 bg-dark text-light">
      <h1 className="text-center">Editar producto</h1>

      {token && userId === "65dbfbfdbbaccc7f307ebc2e" && (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Nombre
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              required
              name="name"
              minLength={1}
              maxLength={40}
              value={values.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Descripción
            </label>
            <textarea
              className="form-control"
              name="description"
              id="description"
              cols="30"
              rows="5"
              required
              minLength={10}
              maxLength={300}
              value={values.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="mb-3">
            <label htmlFor="image" className="form-label">
              Imagen (Archivo)
            </label>
            <input
              accept="image/png, image/svg, image/jpg, image/jpeg"
              type="file"
              className="form-control"
              id="image"
              name="image"
              onChange={handleChangeFile}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="imageUrl" className="form-label">
              Imagen (URL)
            </label>
            <input
              type="url"
              className="form-control"
              id="imageUrl"
              name="imageUrl"
              value={values.imageUrl || ""}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <div className="mb-3">
              <label htmlFor="brand" className="form-label">
                Marca
              </label>
              <select
                type="text"
                className="form-control"
                id="brand"
                required
                name="brand"
                value={values.brand}
                onChange={handleChange}
              >
                <option disabled value="">
                  Seleccionar marca
                </option>
                <option>Toxic-Shine</option>
                <option>Fullcar</option>
                <option>Dreams</option>
                <option>Ternnova</option>
                <option>Drop</option>
                <option>Menzerna</option>
                <option>Meguiars</option>
                <option>Vonixx</option>
                <option>Laffitte</option>
                <option>Stretch</option>
                <option>Otros</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <div className="mb-3">
              <label htmlFor="category" className="form-label">
                Categoria
              </label>
              <select
                type="text"
                className="form-control"
                id="category"
                required
                name="category"
                value={values.category}
                onChange={handleChange}
              >
                <option disabled value="">
                  Seleccionar categoria
                </option>
                <option>Interiores</option>
                <option>Exteriores</option>
                <option>Línea Profesional</option>
                <option>Línea Industrial</option>
                <option>Perfumes y Aromatizantes</option>
                <option>Pads y Baking Plates</option>
                <option>Microfibras</option>
                <option>Aplicadores</option>
                <option>Cepillos y Brochas</option>
                <option>Dosificadores y Foams</option>
                <option>Otros</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="price" className="form-label">
              Precio
            </label>
            <input
              type="number"
              className="form-control"
              id="price"
              name="price"
              min={0}
              max={99999}
              pattern="^[0-9]+"
              step={0.01}
              placeholder="0"
              value={values.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="stock" className="form-label">
              Stock
            </label>
            <input
              type="number"
              className="form-control"
              id="stock"
              name="stock"
              min={0}
              max={999}
              pattern="^[0-9]+"
              step={1}
              placeholder="0"
              value={values.stock}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="capacity" className="form-label">
              Capacidad
            </label>
            <input
              type="text"
              className="form-control"
              id="capacity"
              name="capacity"
              maxLength={20}
              value={values.capacity}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary m-1"
            disabled={isLoading}
          >
            {isLoading ? "Guardando..." : "Guardar"}
          </button>
          <Link
            to={`/adm/productos`}
            type="button"
            className="btn btn-warning m-1"
          >
            Volver
          </Link>
        </form>
      )}
    </div>
  );
}

export default ProductoEdit;
