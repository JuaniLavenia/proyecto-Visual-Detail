import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./producto.css";
import Swal from "sweetalert2";

function Producto() {
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const getProductos = () => {
    setIsLoading(true);
    axios
      .get(`http://localhost:3000/api/v1/productos`)
      .then((res) => setProductos(res.data))
      .catch((error) => {
        setError("No se pudo establecer conexión con el servidor.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getProductos();
  }, []);

  const destroy = (id) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:3000/api/v1/productos/${id}`)
          .then((res) => {
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Se borró el producto con éxito",
              showConfirmButton: false,
              timer: 1500,
            });
          })
          .catch((err) =>
            setError("No se pudo establecer conexión con el servidor.")
          )
          .finally(() => {
            getProductos();
          });
      }
    });
  };

  const handleChangeSearch = (event) => {
    setSearch(event.target.value);
  };

  const buscar = () => {
    setIsLoading(true);
    if (search == "") {
      getProductos();
    } else {
      axios
        .get(`http://localhost:3000/api/v1/productos/search/${search}`)
        .then((res) => {
          setProductos(res.data);
        })
        .catch((error) => {
          setError("No se pudo establecer conexión con el servidor.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <div className="contentPrinc p-5 bg-dark text-light">
      <div className="list d-flex justify-content-between align-items-center">
        <h1 className="text-center">Lista de productos</h1>
        <Link to="/adm/productos/create" className="btn btn-primary float-end">
          Crear
        </Link>
      </div>

      <div className="input-group mb-5">
        <input
          type="search"
          className="form-control"
          placeholder="Nombre de producto"
          name="search"
          value={search}
          onChange={handleChangeSearch}
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={buscar}
          disabled={isLoading}
        >
          {isLoading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      <div className="table-responsive">
        <table className="table text-light tableBody">
          <thead className="thead">
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Categoria</th>
              <th scope="col">Precio</th>
              <th scope="col">Stock</th>
              <th scope="col">Capacidad</th>
              <th scope="col">Imagen</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="tbody">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="text-center">
                  Cargando productos...
                </td>
              </tr>
            ) : (
              <>
                {error && (
                  <tr>
                    <td colSpan="7" className="text-center text-danger">
                      {error}
                    </td>
                  </tr>
                )}
                {productos.map((producto) => (
                  <tr key={producto._id} className="file">
                    <td scope="row">{producto.name}</td>
                    <td scope="row">{producto.category}</td>
                    <td scope="row">$ {producto.price}</td>
                    <td scope="row">{producto.stock}</td>
                    <td scope="row">{producto.capacity}</td>
                    <td scope="row">
                      <img
                        src={`http://localhost:3000/api/v1/img/productos/${producto.image}`}
                        width={100}
                        alt={producto.nombre}
                        className="img"
                      />
                    </td>
                    <td scope="row">
                      <Link
                        to={`/adm/productos/edit/${producto._id}`}
                        type="button"
                        className="btn btn-warning m-1"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => destroy(producto._id)}
                        type="button"
                        className="btn btn-danger m-1"
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Producto;
