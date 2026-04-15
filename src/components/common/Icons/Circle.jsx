import PropTypes from "prop-types";

export default function Circle({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a12.84 12.84 0 003.748.599l4.852-.672a11.88 11.88 0 00-1.693-1.694l-.672-.672a11.88 11.88 0 01-.33-2.607c.372-1.018.308-1.938-.33-2.607L12.16 6.34c-.699-.699-.872-1.78-.33-2.607a12.84 12.84 0 00-.748-3.748l-.672-4.852A2.25 2.25 0 009.568 3z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6h.008v.008H6V6z"
      />
    </svg>
  );
}

Circle.propTypes = {
  className: PropTypes.string,
};
