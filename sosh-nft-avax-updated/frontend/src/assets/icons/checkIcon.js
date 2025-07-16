import React from "react";
import PropTypes from "prop-types";

function CheckIcon({ className, fillColor = "#E1E1E1" }) {
  return (
    <svg
      width="8"
      height="6"
      viewBox="0 0 8 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`check-icon${className ? ` ${className}` : ""}`}
    >
      <path
        d="M1 3L3.25 5L7 1"
        stroke={fillColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default CheckIcon;
CheckIcon.propTypes = {
  className: PropTypes.string,
  fillColor: PropTypes.string,
};
