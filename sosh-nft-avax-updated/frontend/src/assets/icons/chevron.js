import React from "react";
import PropTypes from "prop-types";

function Chevron({ fillColor = "currentColor", className = "" }) {
  return (
    <svg
      className={`chevron-icon ${className}`}
      height={20}
      width={20}
      fill={fillColor}
      viewBox="0 0 24 14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0.46875 12.0421L12 0.65057L23.5299 12.0421L22.3575 13.1309L12 3.00195L1.64122 13.1309L0.46875 12.0421Z" />
    </svg>
  );
}

Chevron.propTypes = {
  className: PropTypes.string,

  fillColor: PropTypes.string,
};

export default Chevron;
