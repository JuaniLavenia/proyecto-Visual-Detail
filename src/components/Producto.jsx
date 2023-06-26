import "./Productos.css";

function Productos({ name, image, description, muted }) {
  return (
    <div className="contenedor-cards">
      <div className="card card-productos mb-3 bg-dark">
        <div className="row g-0">
          <div className="col-md-4 img-container">
            <img
              src={image}
              className="img-fluid rounded-start img-productos"
              alt="..."
            />
          </div>
          <div className="col-md-8">
            <div className="card-body text-light">
              <h5 className="card-title text-uppercase fw-bold">{name}</h5>
              <p className="card-text">{description}</p>
              <p className="card-text">
                <small className="text-muted">{muted}</small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Productos;
