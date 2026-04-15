import PropTypes from "prop-types";

export default function Plus({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth={1.5}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 12H12M18 12H12M12 12V6M12 12V18"
      />
    </svg>
  );
}
Plus.propTypes = { className: PropTypes.string };
