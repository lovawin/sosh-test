import React from "react";
import PropTypes from "prop-types";

function ArrowLeft({ className, fillColor = "currentColor" }) {
  const svgClassName = className ? "arrow-left " + className : "arrow-left";
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill={fillColor}
      className={svgClassName}
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
      />
    </svg>
  );
}

export default ArrowLeft;
ArrowLeft.propTypes = {
  className: PropTypes.string,
  fillColor: PropTypes.string,
};
