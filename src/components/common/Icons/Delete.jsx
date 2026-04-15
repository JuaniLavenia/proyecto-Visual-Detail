import PropTypes from "prop-types";

export default function Delete({ className = "w-4.5 h-4.5" }) {
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
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a2.25 2.25 0 00-2.244-2.077L4.772 5.79m-2.244 2.077L4.772 5.79m0 0a2.25 2.25 0 012.244-2.077L4.772 5.79"
      />
    </svg>
  );
}
Delete.propTypes = { className: PropTypes.string };
