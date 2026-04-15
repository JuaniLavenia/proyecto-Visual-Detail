import React from "react";

const UserCheck = ({ className = "w-5 h-5" }) => (
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
      d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.768 3.75L7.5 21h9l1.125-7.5a3.745 3.745 0 01-3.768-3.75 3.745 3.745 0 01-1.043-3.296A2.25 2.25 0 0112 12z"
    />
  </svg>
);

export default UserCheck;
