import PropTypes from "prop-types";

export default function Import({ className = "w-5 h-5" }) {
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
        d="M12 4V16M12 16L15.5 12.5M12 16L8.5 12.5"
      />
    </svg>
  );
}
Import.propTypes = { className: PropTypes.string };
