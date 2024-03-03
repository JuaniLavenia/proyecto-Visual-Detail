import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "./producto.css";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/AuthContext";
import DataTable from "react-data-table-component";

function Producto() {
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const { token, userId } = useContext(AuthContext);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const columns = [
    {
      name: "Marca",
      selector: (row) => row.brand,
      sortable: true,
      width: "150px",
    },
    {
      name: "Nombre",
      selector: (row) => row.name,
      sortable: true,
      width: "150px",
    },
    {
      name: "Categoria",
      selector: (row) => row.category,
      sortable: true,
      width: "150px",
      center: true,
    },
    {
      name: "Precio",
      selector: (row) => row.price,
      sortable: true,
      width: "150px",
      center: true,
    },
    {
      name: "Stock",
      selector: (row) => row.stock,
      sortable: true,
      width: "100px",
      center: true,
    },
    {
      name: "Capacidad",
      selector: (row) => row.capacity,
      sortable: true,
      width: "225px",
      center: true,
    },
    {
      name: "Imagen",
      cell: (row) => (
        <img
          src={`https://visual-detail-backend.onrender.com/img/productos/${row.image}`}
          width={100}
          alt={row.name}
          className="img"
        />
      ),
      sortable: false,
      width: "300px",
      center: true,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className="flex">
          <Link
            to={`/adm/productos/edit/${row._id}`}
            type="button"
            className="btn btn-warning m-1"
          >
            Editar
          </Link>
          <button
            onClick={() => destroy(row._id)}
            type="button"
            className="btn btn-danger m-1"
          >
            Borrar
          </button>
        </div>
      ),
      sortable: false,
      width: "200px",
      center: true,
    },
  ];

  const getProductos = () => {
    setIsLoading(true);
    axios
      .get(`https://visual-detail-backend.onrender.com/api/productos`)
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
          .delete(
            `https://visual-detail-backend.onrender.com/api/productos/${id}`
          )
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
        .get(
          `https://visual-detail-backend.onrender.com/api/productos/search/${search}`
        )
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

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePerRowsChange = (newPerPage) => {
    setPageSize(newPerPage);
    setPage(1);
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
        {token && userId === "65dbfbfdbbaccc7f307ebc2e" && (
          <DataTable
            columns={columns}
            data={productos}
            progressPending={isLoading}
            progressComponent={
              <div>
                <span className="text-center">Cargando productos...</span>
              </div>
            }
            pagination
            paginationServer
            paginationPerPage={10}
            paginationTotalRows={totalRows}
            paginationResetDefaultPage={false}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            paginationComponentOptions={{
              rowsPerPageText: "Filas por página:",
              rangeSeparatorText: "de",
              noRowsPerPage: false,
            }}
            onChangeRowsPerPage={handlePerRowsChange}
            onChangePage={handlePageChange}
            responsive
            noDataComponent="Sin Resultados"
          />
        )}

        {/*
                {error && (
                  <tr>
                    <td colSpan="7" className="text-center text-danger">
                      {error}
                    </td>
                  </tr>
                )}
      */}
      </div>
    </div>
  );
}

export default Producto;
