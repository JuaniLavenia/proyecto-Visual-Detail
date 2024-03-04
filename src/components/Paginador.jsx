import React from "react";
import "./Paginador.css";

const Paginador = ({
  currentPage,
  totalPages,
  handlePageChange,
  itemsPerPage,
  setItemsPerPage,
}) => {
  return (
    <div className="paginador">
      <label>Items por página</label>
      <select
        value={itemsPerPage}
        onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
        className="selectPaginador"
      >
        <option value={12} selected>
          12
        </option>
        <option value={18}>18</option>
        <option value={30}>30</option>
        <option value={60}>60</option>
        <option value={90}>90</option>
        <option value={153}>153</option>
      </select>
      <button
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
        className="btnPaginador"
      >
        <svg
          width="20px"
          height="20px"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          color="#000000"
        >
          <path
            d="M11 6L5 12L11 18"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M19 6L13 12L19 18"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </button>
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btnPaginador"
      >
        <svg
          width="20px"
          height="20px"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          color="#000000"
        >
          <path
            d="M21 12L3 12M3 12L11.5 3.5M3 12L11.5 20.5"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </button>

      <span className="spanPaginador">
        Página {currentPage} de {totalPages}
      </span>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btnPaginador"
      >
        <svg
          width="20px"
          height="20px"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          color="#000000"
        >
          <path
            d="M3 12L21 12M21 12L12.5 3.5M21 12L12.5 20.5"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </button>
      <button
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="btnPaginador"
      >
        <svg
          width="20px"
          height="20px"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          color="#000000"
        >
          <path
            d="M13 6L19 12L13 18"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M5 6L11 12L5 18"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </button>
    </div>
  );
};

export default Paginador;
