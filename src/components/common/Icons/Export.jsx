import PropTypes from "prop-types";

export default function Export({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth={1.5}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 20L18 20" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 16V4M12 4L15.5 7.5M12 4L8.5 7.5"
      />
    </svg>
  );
}
Export.propTypes = { className: PropTypes.string };
