import PropTypes from "prop-types";

export default function Home({ className = "w-6 h-6" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth={1.5}
    >
      <path
        d="M6 20H3V6L12 4L21 6V20H18M6 20H18M6 20V16M18 20V16M6 12V8L18 8V12M6 12L18 12M6 12V16M18 12V16M6 16H18"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
}

Home.propTypes = {
  className: PropTypes.string,
};
