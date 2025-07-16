import React from "react";
import PropTypes from "prop-types";

function User2Icon({ className, fillColor = "currentColor" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill={fillColor}
      viewBox="0 0 16 16"
      className={`user2-icon${className ? ` ${className}` : ""}`}
    >
      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    </svg>
  );
}

export default User2Icon;
User2Icon.propTypes = {
  className: PropTypes.string,
  fillColor: PropTypes.string,
};
