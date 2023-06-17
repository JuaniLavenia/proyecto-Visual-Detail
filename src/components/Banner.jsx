import React, { useEffect, useState } from "react";
import "./Banner.css";
import { Link } from "react-router-dom";

const Banner = ({ imagen, categoria }) => {
  const [estado, setEstado] = useState({ categoria: "" });

  useEffect(() => {
    setEstado({ categoria: categoria });
  }, [categoria]);

  return (
    <div className="conteinerBanner">
      <div className="card-banner imgBan">
        <Link to={`/productos/category/${encodeURIComponent(categoria)}`}>
          <img
            src={imagen}
            className="card-img row bannerImg"
            alt={estado.categoria}
          />
          <div className="imgBanTexto">{estado.categoria}</div>
        </Link>
      </div>
    </div>
  );
};

export default Banner;
